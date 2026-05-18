import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postsApi } from '../api/posts';
import type { Category, FilterState } from '../types';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import SearchFilter from '../components/posts/SearchFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

const PostsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    search: '',
    location: '',
    sort: 'newest',
    page: 1,
  });

  useEffect(() => {
    postsApi.getCategories().then(res => setCategories(res.data.data)).catch(() => {});
  }, []);

  const { posts, pagination, isLoading, error } = usePosts(filters);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Posts</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-1">{pagination.total} posts found</p>
          )}
        </div>
        {isAuthenticated && (
          <Link to="/posts/new" className="btn-primary">+ New Post</Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <SearchFilter filters={filters} categories={categories} onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Posts grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts found"
              description="Try adjusting your filters or be the first to post!"
              icon="📭"
              action={isAuthenticated ? <Link to="/posts/new" className="btn-primary">Create Post</Link> : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => handleFilterChange({ page: filters.page - 1 })}
                    disabled={filters.page <= 1}
                    className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
                  >← Prev</button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => handleFilterChange({ page: p })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.page === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFilterChange({ page: filters.page + 1 })}
                    disabled={filters.page >= pagination.pages}
                    className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostsPage;
