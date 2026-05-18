import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/posts', label: 'Explore' },
    { to: '/posts?category=lost-and-found', label: 'Lost & Found' },
    { to: '/posts?category=books', label: 'Books' },
    { to: '/posts?category=events', label: 'Events' },
    { to: '/posts?category=study-groups', label: 'Study Groups' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <span className="text-2xl">🎓</span>
            <span>Campus Connect</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname + location.search === link.to
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/posts/new" className="hidden sm:flex btn-primary text-sm">
                  <span>+</span> New Post
                </Link>
                {isAuthenticated && (
                  <Link to="/chat" className="hidden sm:flex items-center text-gray-600 hover:text-blue-600 text-sm font-medium">
                    💬 Chat
                  </Link>
                )}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2">
                    <Avatar url={user?.avatar_url} name={user?.name} size="sm" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">👤 Profile</Link>
                      <Link to="/bookmarks" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🔖 Bookmarks</Link>
                      {isAdmin && <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">⚙️ Admin Dashboard</Link>}
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">🚪 Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link to="/posts/new" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-blue-600 font-medium">+ New Post</Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700">💬 Chat</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700">👤 Profile</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
