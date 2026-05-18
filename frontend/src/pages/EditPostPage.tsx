import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import type { Post, Category } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', location: '', contactInfo: '', status: 'active' });

  useEffect(() => {
    if (!id) return;
    Promise.all([postsApi.getPost(id), postsApi.getCategories()]).then(([postRes, catsRes]) => {
      const p = postRes.data.data;
      setPost(p);
      setCategories(catsRes.data.data);
      setForm({
        title: p.title, description: p.description,
        price: p.price?.toString() || '', location: p.location || '',
        contactInfo: p.contact_info || '', status: p.status,
      });
    }).catch(() => navigate('/posts')).finally(() => setIsLoading(false));
  }, [id]);

  if (authLoading || isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (post && user?.id !== post.author_id && user?.role !== 'admin') return <Navigate to="/posts" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await postsApi.updatePost(id!, {
        title: form.title, description: form.description,
        price: form.price ? parseFloat(form.price) : undefined,
        location: form.location, contact_info: form.contactInfo,
        status: form.status as Post['status'],
      });
      toast.success('Post updated!');
      navigate(`/posts/${id}`);
    } catch { toast.error('Failed to update post'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input">
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
            <input value={form.contactInfo} onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              required rows={6} className="input resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate(`/posts/${id}`)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;
