import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (dateStr: string): string =>
  formatDistanceToNow(new Date(dateStr), { addSuffix: true });

export const formatFullDate = (dateStr: string): string =>
  format(new Date(dateStr), 'MMM d, yyyy');

export const formatPrice = (price?: number): string =>
  price !== null && price !== undefined ? `$${price.toFixed(2)}` : 'Free';

export const getImageUrl = (url?: string): string => {
  if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
};

export const getAvatarUrl = (url?: string, name?: string): string => {
  if (url) return getImageUrl(url);
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=fff&size=128`;
};

export const truncate = (str: string, len: number): string =>
  str.length > len ? str.slice(0, len) + '...' : str;

export const categoryColors: Record<string, string> = {
  'lost-and-found': 'bg-orange-100 text-orange-700',
  'books': 'bg-blue-100 text-blue-700',
  'notes': 'bg-green-100 text-green-700',
  'events': 'bg-purple-100 text-purple-700',
  'study-groups': 'bg-yellow-100 text-yellow-700',
  'general': 'bg-gray-100 text-gray-700',
};

export const categoryIcons: Record<string, string> = {
  'lost-and-found': '🔍',
  'books': '📚',
  'notes': '📝',
  'events': '📅',
  'study-groups': '👥',
  'general': '💬',
};
