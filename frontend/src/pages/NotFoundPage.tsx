import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <div className="text-8xl mb-6">🎓</div>
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
      <p className="text-gray-500 max-w-sm mx-auto mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/posts" className="btn-secondary">Explore Posts</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
