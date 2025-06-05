// NotificationTabScreen.tsx
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/Context/AuthContext";
import { useNotifications } from "@/Utils/notificationInfiniteQuery";
import Notification from "@/components/Notification";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import NotificationService from "@/services/NotificationService";
import { clearNotificationCount } from "@/redux/state/notification";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";

type NotificationListRef = FlatList<any> | null;

export default function NotificationTabScreen() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const unreadNotificationCount = useSelector(
    (state: any) => state.notifications.notificationCount
  );
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useNotifications(user?._id);
  const insets = useSafeAreaInsets();
  const [hasClickedLoadOnce, setHasClickedLoadOnce] = useState(false);

  const listRef = useRef<NotificationListRef>(null);

  // Flatten all pages into one array
  const flatNotifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.notifications) ?? [];
  }, [data]);

  // “See Previous Notifications” handler
  const loadMore = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (!hasClickedLoadOnce) {
      setHasClickedLoadOnce(true);
    }
    await fetchNextPage();
  };

  // Mark all as read on screen focus
  useFocusEffect(
    useCallback(() => {
      const markAllRead = async () => {
        try {
          const resp = await NotificationService.markNotificationUnread(
            user?._id
          );
          if (resp.status === 200) {
            dispatch(clearNotificationCount());
          }
        } catch (err) {
          console.error("Error marking notifications read:", err);
        }
      };
      if (user?._id) markAllRead();
    }, [user?._id, dispatch])
  );

  // ─── UPDATED markSingle ───────────────────────────────────────────────────────
  const markSingle = useMutation({
    mutationFn: (id: string) =>
      NotificationService.markSingleNotificationUnread(id),

    onMutate: async (notificationId: string) => {
      // 1) Cancel any in-flight fetch
      await qc.cancelQueries({ queryKey: ["notifications", user?._id] });

      // 2) Snapshot previous state
      const previous = qc.getQueryData<any>(["notifications", user?._id]);

      // 3) Optimistically toggle singleUnread in-place
      qc.setQueryData(["notifications", user?._id], (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((n: any) =>
              n._id === notificationId ? { ...n, singleUnread: true } : n
            ),
          })),
        };
      });

      return { previous };
    },

    onError: (
      _err,
      _notificationId,
      context: { previous: any } | undefined
    ) => {
      // Roll back if the mutation fails
      if (context?.previous) {
        qc.setQueryData(["notifications", user?._id], context.previous);
      }
    },

    onSettled: () => {
      // **Do NOT** invalidate or refetch here.
      // We only wanted to flip the flag locally. Removing this line prevents the list from shrinking.
      // If you ever need to re-sync with the server, you can call:
      // qc.invalidateQueries({ queryKey: ["notifications", user?._id] });
    },
  });
  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="font-worksans-600 text-4xl">Notifications</Text>
        <Ionicons name="search" size={24} color="black" />
      </View>

      <FlatList
        ref={listRef}
        showsVerticalScrollIndicator={false}
        data={flatNotifications}
        keyExtractor={(item) => item._id}
        onEndReached={
          hasClickedLoadOnce
            ? () => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }
            : undefined
        }
        onEndReachedThreshold={0.5}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 15 + insets.bottom : 0,
        }}
        ListEmptyComponent={
          !isFetching ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-500">No notifications yet.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const rawDate = item.createdAt;
          const timeAgo = rawDate
            ? formatDistanceToNow(parseISO(rawDate), { addSuffix: true })
            : "just now";
          return (
            <Notification
              id={item._id}
              title={item.title}
              body={item.body}
              iconUrl={item.icon}
              singleUnread={item.singleUnread}
              unread={item.unread}
              timestamp={timeAgo}
              onPress={() => markSingle.mutate(item._id)}
            />
          );
        }}
        ListFooterComponent={() =>
          !hasClickedLoadOnce && hasNextPage ? (
            <TouchableOpacity
              onPress={loadMore}
              className="mx-8 my-4 py-2 rounded-lg bg-[#2563eb] items-center"
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base">
                  See Previous Notifications
                </Text>
              )}
            </TouchableOpacity>
          ) : hasNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
