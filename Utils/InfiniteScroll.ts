// src/Utils/InfiniteScroll.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import postService, { PaginatedPosts } from "../services/PostService";

export function usePostsInfinite(userId: string | undefined) {
  const infiniteQuery = useInfiniteQuery<PaginatedPosts, Error>({
    queryKey: ["posts", userId],
    queryFn: ({ pageParam = null }) =>
      postService.fetchFeedPosts(userId, pageParam, 5),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
  });

  return infiniteQuery;
}
