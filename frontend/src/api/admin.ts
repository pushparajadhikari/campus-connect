import apiClient from './client';

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (params?: Record<string, string | number>) => apiClient.get('/admin/users', { params }),
  updateUserStatus: (userId: string, isActive: boolean) =>
    apiClient.put(`/admin/users/${userId}/status`, { isActive }),
  moderatePost: (postId: string, status: string) =>
    apiClient.put(`/admin/posts/${postId}/status`, { status }),
  getReports: (params?: Record<string, string>) => apiClient.get('/admin/reports', { params }),
  resolveReport: (reportId: string, status: string) =>
    apiClient.put(`/admin/reports/${reportId}`, { status }),
};
