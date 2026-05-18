import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import ProfilePage from './pages/ProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', borderRadius: '10px' },
              success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public pages without layout wrapping Login/Register */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* All other pages with layout */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/posts" element={<Layout><PostsPage /></Layout>} />
            <Route path="/posts/new" element={<Layout><CreatePostPage /></Layout>} />
            <Route path="/posts/:id" element={<Layout><PostDetailPage /></Layout>} />
            <Route path="/posts/:id/edit" element={<Layout><EditPostPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/bookmarks" element={<Layout><BookmarksPage /></Layout>} />
            <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
            <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
