"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(email, password);
      toast.success('Account created successfully');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-zinc-100 selection:text-zinc-950">
      <Link href="/" className="mb-10 flex items-center gap-3 font-bold text-2xl tracking-tight text-zinc-100 group">
        <Logo className="w-8 h-8" />
        <span className="group-hover:text-white transition-colors">NoteFlow</span>
      </Link>
      
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 subtle-shadow">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Create account</h1>
        <p className="text-zinc-500 text-sm mb-8">Start organizing your thoughts today.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-400">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus-ring"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-400">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus-ring"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-zinc-100 text-zinc-950 rounded-lg py-2.5 text-sm font-semibold hover:bg-zinc-200 transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-sm text-zinc-500 mt-8">
          Already have an account? <Link href="/login" className="text-zinc-100 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
