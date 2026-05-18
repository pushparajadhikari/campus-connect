import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsApi } from '../api/posts';
import type { Post } from '../types';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import { formatFullDate } from '../utils';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', department: '', yearOfStudy: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, bio: user.bio || '', department: user.department || '', yearOfStudy: user.year_of_study?.toString() || '' });
      postsApi.getUserPosts(user.id)
        .then(res => setPosts(res.data.data))
        .finally(() => setPostsLoading(false));
    }
  }, [user]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('bio', form.bio);
      fd.append('department', form.department);
      if (form.yearOfStudy) fd.append('yearOfStudy', form.yearOfStudy);
      await authApi.updateProfile(fd);
      await refreshProfile();
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <Avatar url={user?.avatar_url} name={user?.name} size="xl" className="mx-auto mb-4" />
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3 text-left">
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input" placeholder="Full name" required />
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  className="input resize-none" rows={3} placeholder="Bio" />
                <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                  className="input" placeholder="Department" />
                <select value={form.yearOfStudy} onChange={e => setForm(p => ({ ...p, yearOfStudy: e.target.value }))} className="input">
                  <option value="">Year of study</option>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
                <div className="flex gap-2">
                  <button type="submit" disabled={isSaving} className="btn-primary flex-1 text-sm">
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                {user?.department && <p className="text-sm text-blue-600 font-medium mt-1">{user.department}</p>}
                {user?.year_of_study && <p className="text-xs text-gray-400">Year {user.year_of_study}</p>}
                {user?.bio && <p className="text-sm text-gray-600 mt-3">{user.bio}</p>}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{user?.post_count || 0}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{user?.bookmark_count || 0}</p>
                    <p className="text-xs text-gray-500">Bookmarks</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">Joined {user?.created_at ? formatFullDate(user.created_at) : ''}</p>
                <button onClick={() => setIsEditing(true)} className="btn-secondary w-full mt-4 text-sm">Edit Profile</button>
              </>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Posts</h2>
          {postsLoading ? <LoadingSpinner /> : posts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">No posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
