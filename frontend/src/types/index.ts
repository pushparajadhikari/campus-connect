export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar_url?: string;
  bio?: string;
  department?: string;
  year_of_study?: number;
  student_id?: string;
  created_at: string;
  post_count?: number;
  bookmark_count?: number;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  post_count?: number;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  price?: number;
  location?: string;
  status: 'active' | 'closed' | 'pending' | 'rejected';
  is_featured: boolean;
  view_count: number;
  contact_info?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category_id: number;
  category_slug: string;
  category_name: string;
  category_icon?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_dept?: string;
  like_count: number;
  images?: string[];
  files?: Array<{ url: string; filename: string; file_type: string }>;
  liked?: boolean;
  bookmarked?: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  errors?: Array<{ field: string; message: string }>;
}

export interface Message {
  id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  room_id: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  last_message?: string;
  last_message_at?: string;
  member_count: number;
  members: Array<{ id: string; name: string; avatar_url?: string }>;
}

export interface FilterState {
  category: string;
  search: string;
  location: string;
  sort: string;
  page: number;
}

export interface AdminStats {
  users: { total: string; new_this_week: string };
  posts: { total: string; active: string; pending: string };
  reports: { total: string; pending: string };
}
