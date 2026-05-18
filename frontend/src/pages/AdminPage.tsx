import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/admin';
import type { AdminStats } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDate } from '../utils';

interface RecentPost { id: string; title: string; status: string; author: string; category: string; created_at: string; }
interface AdminUser { id: string; name: string; email: string; role: string; department?: string; is_active: boolean; post_count: string; created_at: string; }
interface Report { id: string; reason: string; description?: string; status: string; reporter_name: string; post_title?: string; post_id?: string; created_at: string; }

type TabType = 'overview' | 'users' | 'posts' | 'reports';

const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    const loadData = async () => {
      setDataLoading(true);
      try {
        const statsRes = await adminApi.getStats();
        setStats(statsRes.data.data.stats);
        setRecentPosts(statsRes.data.data.recentPosts);
        const [usersRes, reportsRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getReports(),
        ]);
        setUsers(usersRes.data.data || []);
        setReports(reportsRes.data.data || []);
      } catch { toast.error('Failed to load admin data'); }
      finally { setDataLoading(false); }
    };
    loadData();
  }, [isAuthenticated, isAdmin]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, !isActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  const handleModeratePost = async (postId: string, status: string) => {
    try {
      await adminApi.moderatePost(postId, status);
      setRecentPosts(prev => prev.map(p => p.id === postId ? { ...p, status } : p));
      toast.success('Post updated');
    } catch { toast.error('Failed'); }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await adminApi.resolveReport(reportId, status);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      toast.success('Report resolved');
    } catch { toast.error('Failed'); }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'users', label: '👥 Users' },
    { key: 'posts', label: '📋 Posts' },
    { key: 'reports', label: '🚩 Reports' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage users, posts, and reported content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.key ? 'bg-white border border-gray-200 border-b-white text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {dataLoading ? <LoadingSpinner /> : (
        <>
          {/* Overview */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Users', value: stats.users.total, sub: `+${stats.users.new_this_week} this week`, color: 'bg-blue-50 text-blue-700', icon: '👥' },
                  { label: 'Total Posts', value: stats.posts.total, sub: `${stats.posts.active} active, ${stats.posts.pending} pending`, color: 'bg-green-50 text-green-700', icon: '📋' },
                  { label: 'Reports', value: stats.reports.total, sub: `${stats.reports.pending} pending review`, color: 'bg-orange-50 text-orange-700', icon: '🚩' },
                ].map(s => (
                  <div key={s.label} className={`card p-5 ${s.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{s.icon}</span>
                    </div>
                    <p className="text-3xl font-bold">{s.value}</p>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs opacity-75 mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Posts</h3>
                <div className="space-y-2">
                  {recentPosts.slice(0, 8).map(post => (
                    <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400">{post.author} · {post.category} · {formatDate(post.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.status === 'active' ? 'bg-green-100 text-green-700' : post.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {post.status}
                        </span>
                        {post.status !== 'rejected' && (
                          <button onClick={() => handleModeratePost(post.id, 'rejected')}
                            className="text-xs text-red-500 hover:text-red-700">Reject</button>
                        )}
                        {post.status !== 'active' && (
                          <button onClick={() => handleModeratePost(post.id, 'active')}
                            className="text-xs text-green-500 hover:text-green-700">Approve</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['User', 'Role', 'Department', 'Posts', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.department || '—'}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{u.post_count}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                        <td className="px-4 py-3">
                          {u.role !== 'admin' && (
                            <button onClick={() => handleToggleUser(u.id, u.is_active)}
                              className={`text-xs font-medium ${u.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}>
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="card p-8 text-center text-gray-400">No reports found.</div>
              ) : reports.map(r => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {r.status}
                        </span>
                        <span className="text-xs text-gray-500">by {r.reporter_name} · {formatDate(r.created_at)}</span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">Reason: {r.reason}</p>
                      {r.post_title && <p className="text-xs text-gray-500 mt-1">Post: {r.post_title}</p>}
                      {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                    </div>
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleResolveReport(r.id, 'resolved')}
                          className="text-xs text-green-600 hover:text-green-800 font-medium">Resolve</button>
                        <button onClick={() => handleResolveReport(r.id, 'dismissed')}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium">Dismiss</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Posts tab (redirect to overview) */}
          {activeTab === 'posts' && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">All Posts</h3>
              <div className="space-y-2">
                {recentPosts.map(post => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                      <p className="text-xs text-gray-400">{post.author} · {post.category} · {formatDate(post.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {post.status}
                      </span>
                      <select onChange={e => handleModeratePost(post.id, e.target.value)} value={post.status}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5">
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
