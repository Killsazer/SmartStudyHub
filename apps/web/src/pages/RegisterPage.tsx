import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpen, UserPlus } from 'lucide-react';
import { apiClient } from '../shared/api/client';
import { useAuth } from '../features/auth/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', formData);
      toast.success('Account created successfully!');
      login(res.data.accessToken);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message;
      
      if (err.response?.status === 409) {
        setErrors({ email: 'This email is already registered.' });
        toast.error('User already exists');
      } else if (Array.isArray(errorMsg)) {
        const newErrors: Record<string, string> = {};
        errorMsg.forEach(msg => {
          const lowerMsg = msg.toLowerCase();
          if (lowerMsg.includes('email')) newErrors.email = 'Must be a valid email (e.g. student@kpi.ua)';
          else if (lowerMsg.includes('password')) newErrors.password = msg;
          else if (lowerMsg.includes('firstname')) newErrors.firstName = msg;
          else if (lowerMsg.includes('lastname')) newErrors.lastName = msg;
        });
        setErrors(newErrors);
      } else {
        toast.error(errorMsg || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-500/10 p-3 rounded-xl mb-4">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-zinc-400 text-sm mt-1">Join Smart Study Hub today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Petro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Student"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-zinc-950 border rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-all ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500'}`}
              placeholder="you@kpi.ua"
              required
            />
            {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full bg-zinc-950 border rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-all ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500'}`}
              placeholder="••••••••"
              required
            />
            {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
