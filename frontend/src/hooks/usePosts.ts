import { useState, useEffect, useCallback } from 'react';
import { postsApi } from '../api/posts';
import type { Post, Pagination, FilterState } from '../types';

export const usePosts = (filters: FilterState) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: filters.page, limit: 12 };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.sort) params.sort = filters.sort;

      const res = await postsApi.getPosts(params);
      setPosts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load posts';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, pagination, isLoading, error, refetch: fetchPosts };
};

export const usePost = (id: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    postsApi.getPost(id)
      .then(res => setPost(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Post not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { post, isLoading, error, setPost };
};
