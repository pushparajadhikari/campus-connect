import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatePostForm from '../components/posts/CreatePostForm';
import Layout from '../components/layout/Layout';

const CreatePostPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/posts/new' }} replace />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-500 mt-1">Share something with your campus community</p>
      </div>
      <div className="card p-6">
        <CreatePostForm />
      </div>
    </div>
  );
};

export default CreatePostPage;
