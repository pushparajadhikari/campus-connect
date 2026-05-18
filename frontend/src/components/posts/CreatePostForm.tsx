import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

const CreatePostForm: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', price: '',
    location: '', contactInfo: '',
  });

  useEffect(() => {
    postsApi.getCategories().then(res => setCategories(res.data.data)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) { toast.error('Maximum 5 images allowed'); return; }
    setImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('categoryId', form.categoryId);
      if (form.price) fd.append('price', form.price);
      if (form.location) fd.append('location', form.location);
      if (form.contactInfo) fd.append('contactInfo', form.contactInfo);
      images.forEach(img => fd.append('images', img));

      const res = await postsApi.createPost(fd);
      toast.success('Post created successfully!');
      navigate(`/posts/${res.data.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create post';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            placeholder="What are you posting about?" className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="input">
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (leave blank if free)</label>
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange}
            placeholder="0.00" className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input name="location" value={form.location} onChange={handleChange}
            placeholder="e.g. Library, Room 204" className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
          <input name="contactInfo" value={form.contactInfo} onChange={handleChange}
            placeholder="Phone, email, or other contact" className="input" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required
            rows={6} placeholder="Describe your post in detail..." className="input resize-none" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Images (up to 5)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(img)} alt="" className="h-20 w-20 object-cover rounded-lg" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Creating...' : '✨ Create Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;
