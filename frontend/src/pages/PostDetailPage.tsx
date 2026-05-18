import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePost } from '../hooks/usePosts';
import { postsApi } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Avatar from '../components/common/Avatar';
import CategoryBadge from '../components/common/Badge';
import { formatDate, formatFullDate, formatPrice, getImageUrl } from '../utils';
import toast from 'react-hot-toast';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { post, isLoading, error, setPost } = usePost(id!);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (post) { setLiked(post.liked || false); setBookmarked(post.bookmarked || false); }
  }, [post]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like posts'); return; }
    try {
      const res = await postsApi.toggleLike(post!.id);
      setLiked(res.data.liked);
      setPost(prev => prev ? { ...prev, like_count: res.data.likeCount } : prev);
    } catch { toast.error('Failed'); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Sign in to bookmark posts'); return; }
    try {
      const res = await postsApi.toggleBookmark(post!.id);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Removed');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post!.id);
      toast.success('Post deleted');
      navigate('/posts');
    } catch { toast.error('Failed to delete'); setIsDeleting(false); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error || !post) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Post Not Found</h2>
      <Link to="/posts" className="btn-primary">← Back to Posts</Link>
    </div>
  );

  const isOwner = user?.id === post.author_id;
  const canModerate = isOwner || user?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/posts" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
          ← Back to Posts
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="card overflow-hidden">
              <img src={getImageUrl(post.images[activeImg])} alt={post.title}
                className="w-full h-72 md:h-96 object-cover" />
              {post.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {post.images.map((img, i) => (
                    <img key={i} src={getImageUrl(img)} alt="" onClick={() => setActiveImg(i)}
                      className={`h-14 w-14 object-cover rounded-lg cursor-pointer border-2 transition-colors ${i === activeImg ? 'border-blue-500' : 'border-transparent'}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post info */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <CategoryBadge slug={post.category_slug} name={post.category_name} />
                <h1 className="text-2xl font-bold text-gray-900 mt-2">{post.title}</h1>
              </div>
              {post.price !== null && post.price !== undefined && (
                <div className="text-2xl font-bold text-green-600 whitespace-nowrap">{formatPrice(post.price)}</div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <span>👁 {post.view_count} views</span>
              <span>❤️ {post.like_count} likes</span>
              {post.location && <span>📍 {post.location}</span>}
              <span>🕒 {formatDate(post.created_at)}</span>
            </div>

            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
              {post.description}
            </div>

            {post.contact_info && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-800 mb-1">Contact Info</p>
                <p className="text-blue-700">{post.contact_info}</p>
              </div>
            )}

            {/* Files */}
            {post.files && post.files.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                <div className="space-y-2">
                  {post.files.map((f, i) => (
                    <a key={i} href={getImageUrl(f.url)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                      📎 {f.filename || 'File'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${liked ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'} ({post.like_count})
              </button>
              <button onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${bookmarked ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {bookmarked ? '🔖 Saved' : '📌 Save'}
              </button>
              {canModerate && (
                <>
                  <Link to={`/posts/${post.id}/edit`}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
                    ✏️ Edit
                  </Link>
                  <button onClick={handleDelete} disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                    {isDeleting ? 'Deleting...' : '🗑 Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Posted by</h3>
            <div className="flex items-center gap-3">
              <Avatar url={post.author_avatar} name={post.author_name} size="md" />
              <div>
                <p className="font-medium text-gray-900">{post.author_name}</p>
                {post.author_dept && <p className="text-sm text-gray-500">{post.author_dept}</p>}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Posted on {formatFullDate(post.created_at)}</p>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Post Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{post.category_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {post.status}
                  </span>
                </dd>
              </div>
              {post.location && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium">{post.location}</dd>
                </div>
              )}
              {post.price !== null && post.price !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Price</dt>
                  <dd className="font-medium text-green-700">{formatPrice(post.price)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
