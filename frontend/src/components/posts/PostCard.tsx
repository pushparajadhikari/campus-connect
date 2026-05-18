import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import { formatDate, formatPrice, getImageUrl, truncate } from '../../utils';
import CategoryBadge from '../common/Badge';
import Avatar from '../common/Avatar';
import { postsApi } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Props { post: Post; onUpdate?: (post: Post) => void; }

const PostCard: React.FC<Props> = ({ post, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [bookmarked, setBookmarked] = useState(post.bookmarked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to like posts'); return; }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await postsApi.toggleLike(post.id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch { toast.error('Failed to update like'); }
    finally { setIsLiking(false); }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to bookmark posts'); return; }
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      const res = await postsApi.toggleBookmark(post.id);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks');
    } catch { toast.error('Failed to update bookmark'); }
    finally { setIsBookmarking(false); }
  };

  const primaryImage = post.images?.[0];

  return (
    <Link to={`/posts/${post.id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={getImageUrl(primaryImage)}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-50 to-indigo-100">
            {post.category_slug === 'books' ? '📚' : post.category_slug === 'events' ? '📅' :
             post.category_slug === 'notes' ? '📝' : post.category_slug === 'study-groups' ? '👥' :
             post.category_slug === 'lost-and-found' ? '🔍' : '📌'}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <CategoryBadge slug={post.category_slug} name={post.category_name} />
        </div>
        {post.price !== undefined && post.price !== null && (
          <div className="absolute top-2 right-2 bg-white text-green-700 font-bold text-sm px-2 py-0.5 rounded-full shadow">
            {formatPrice(post.price)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 flex-1 line-clamp-2">
          {truncate(post.description, 100)}
        </p>

        {post.location && (
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <span>📍</span> {post.location}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <Avatar url={post.author_avatar} name={post.author_name} size="xs" />
            <span className="text-xs text-gray-500">{post.author_name}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
            <button onClick={handleLike} className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>
            <button onClick={handleBookmark} className={`text-xs transition-colors ${bookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}>
              {bookmarked ? '🔖' : '📌'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
