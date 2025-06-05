// src/hooks/usePostsInfinite.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import postService, { PaginatedPosts } from "../services/PostService";

export function useProfilePostsInfinite(userId: string) {
  const infiniteQuery = useInfiniteQuery<PaginatedPosts, Error>({
    queryKey: ["profilePosts", userId],
    queryFn: ({ pageParam = null }) =>
      postService.fetchUserPosts(userId, pageParam, 5),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
  });

  return infiniteQuery;
}
