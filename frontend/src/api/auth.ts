import apiClient from './client';
import type { User, ApiResponse } from '../types';

interface AuthData { token: string; user: User; }

export const authApi = {
  register: (data: { name: string; email: string; password: string; department?: string; yearOfStudy?: number }) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/login', data),

  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/auth/profile'),

  updateProfile: (data: FormData) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put('/auth/change-password', data),
};
