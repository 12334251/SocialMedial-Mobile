// src/hooks/useNotifications.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import NotificationService, {
  PaginatedNotifications,
} from "../services/NotificationService";

export function useNotifications(userId: string | undefined) {
  const infiniteQuery = useInfiniteQuery<PaginatedNotifications, Error>({
    queryKey: ["notifications", userId],
    queryFn: ({ pageParam }) =>
      NotificationService.fetchNotificationsPage(userId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null, // Specify the initial page parameter
    staleTime: 1000 * 60 * 5,
  });

  return infiniteQuery;
}
