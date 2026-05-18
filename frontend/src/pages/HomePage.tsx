import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../api/posts';
import type { Post, Category } from '../types';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { categoryIcons } from '../utils';

const HomePage: React.FC = () => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      postsApi.getPosts({ limit: 6, sort: 'newest' }),
      postsApi.getCategories(),
    ]).then(([postsRes, catsRes]) => {
      setRecentPosts(postsRes.data.data);
      setCategories(catsRes.data.data);
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            🎓 Your Campus,<br />Your Community
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Connect with fellow students — share notes, find lost items, buy/sell books, join study groups, and discover campus events.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/posts" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Explore Posts
            </Link>
            <Link to="/register" className="bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-400 border border-blue-400 transition-colors">
              Join Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Active Students', value: '500+', icon: '👥' },
              { label: 'Posts Shared', value: '1,200+', icon: '📋' },
              { label: 'Books Listed', value: '300+', icon: '📚' },
              { label: 'Events Created', value: '50+', icon: '📅' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/posts?category=${cat.slug}`}
              className="card p-4 text-center hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {categoryIcons[cat.slug] || '📌'}
              </div>
              <div className="text-sm font-semibold text-gray-800">{cat.name}</div>
              {cat.post_count !== undefined && (
                <div className="text-xs text-gray-400 mt-0.5">{cat.post_count} posts</div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Posts</h2>
          <Link to="/posts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all →</Link>
        </div>
        {isLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to connect?</h2>
          <p className="text-gray-600 mb-8">Join thousands of students sharing, learning, and growing together.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Get Started Free →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
