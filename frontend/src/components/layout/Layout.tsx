import React from 'react';
import Navbar from './Navbar';

interface Props { children: React.ReactNode; }

const Layout: React.FC<Props> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <footer className="bg-white border-t border-gray-100 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">🎓 Campus Connect</p>
        <p>Your student community platform</p>
        <p className="mt-2">© {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default Layout;
