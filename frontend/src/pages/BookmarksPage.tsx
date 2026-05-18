import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsApi } from '../api/posts';
import type { Post } from '../types';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const BookmarksPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      postsApi.getBookmarks().then(res => setPosts(res.data.data)).finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🔖 My Bookmarks</h1>
      {loading ? <LoadingSpinner /> : posts.length === 0 ? (
        <EmptyState title="No bookmarks yet" description="Save posts to find them here later."
          icon="🔖" action={<Link to="/posts" className="btn-primary">Explore Posts</Link>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
