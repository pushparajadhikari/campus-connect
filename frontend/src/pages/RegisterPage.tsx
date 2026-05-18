import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', yearOfStudy: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department || undefined,
        yearOfStudy: form.yearOfStudy ? parseInt(form.yearOfStudy) : undefined,
      });
      login(res.data.data.token, res.data.data.user);
      toast.success('Welcome to Campus Connect!');
      navigate('/posts');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Array<{ message: string }> } } };
      const msg = e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-blue-600">🎓 Campus Connect</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create an account</h1>
          <p className="text-gray-500 mt-1">Join your campus community</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name" className="input" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@campus.edu" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                  placeholder="e.g. Computer Science" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                <select value={form.yearOfStudy} onChange={e => setForm(p => ({ ...p, yearOfStudy: e.target.value }))} className="input">
                  <option value="">Select year</option>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 chars, upper+lower+number" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat your password" className="input" />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
