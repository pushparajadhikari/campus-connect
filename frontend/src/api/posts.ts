import apiClient from './client';
import type { Post, Category, ApiResponse, Pagination } from '../types';

interface PostsResponse { data: Post[]; pagination: Pagination; success: boolean; }

export const postsApi = {
  getPosts: (params: Record<string, string | number>) =>
    apiClient.get<PostsResponse>('/posts', { params }),

  getPost: (id: string) =>
    apiClient.get<ApiResponse<Post>>(`/posts/${id}`),

  createPost: (data: FormData) =>
    apiClient.post<ApiResponse<Post>>('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  updatePost: (id: string, data: Partial<Post>) =>
    apiClient.put<ApiResponse<Post>>(`/posts/${id}`, data),

  deletePost: (id: string) =>
    apiClient.delete(`/posts/${id}`),

  getCategories: () =>
    apiClient.get<ApiResponse<Category[]>>('/posts/categories'),

  getUserPosts: (userId: string, params?: Record<string, string | number>) =>
    apiClient.get<PostsResponse>(`/posts/user/${userId}`, { params }),

  toggleLike: (postId: string) =>
    apiClient.post(`/posts/${postId}/like`),

  toggleBookmark: (postId: string) =>
    apiClient.post(`/posts/${postId}/bookmark`),

  getBookmarks: (params?: Record<string, string | number>) =>
    apiClient.get<PostsResponse>('/posts/bookmarks', { params }),
};
