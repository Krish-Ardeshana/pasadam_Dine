'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Role } from '@/lib/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.name}`);

      // Role-aware navigation redirect
      if (user.role === Role.SUPER_ADMIN) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCreds = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative flex flex-col justify-center items-center p-4 overflow-hidden selection:bg-[#F59E0B]/30 selection:text-[#7A0C1E]">
      {/* Decorative Atmosphere Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-rose-900/10 blur-3xl pointer-events-none" />

      {/* Top Back to Site Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6E5D53] hover:text-[#7A0C1E] px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-[#E8DEC9] transition-all hover:scale-102 shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Modern Card with rounded-3xl and elegant soft shadow */}
      <div className="w-full max-w-md bg-[#FFFDF9]/95 backdrop-blur-xl rounded-3xl border border-[#E8DEC9] shadow-2xl p-8 sm:p-10 transition-all relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 border-b border-[#E8DEC9] pb-6">
          <div className="inline-flex w-14 h-14 bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] rounded-2xl items-center justify-center font-luxury font-black text-xl mb-3 shadow-md shadow-rose-950/20 tracking-tighter">
            AR
          </div>
          <h1 className="font-luxury text-2xl font-bold tracking-tight text-[#7A0C1E]">
            AR_DINE
          </h1>
          <p className="text-xs font-bold tracking-wider text-[#B45309] uppercase mt-1">
            Restaurant Operations & Management
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 text-xs font-semibold rounded-2xl flex items-center gap-3 border border-red-200/80 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@prasadamdine.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white uppercase font-bold tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all py-3.5"
            isLoading={isLoading}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Quick Testing Credentials Helper */}
        <div className="mt-8 pt-6 border-t border-[#E8DEC9] space-y-3">
          <p className="text-[11px] font-bold text-[#8C7A6F] uppercase tracking-wider text-center">
            Quick One-Click Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillQuickCreds('admin@prasadamdine.com', 'Admin@SecurePrasadam2026!')}
              className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] hover:bg-white text-[11px] font-semibold text-[#1C120C] text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-101"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
                <span className="font-bold text-[#7A0C1E]">Super Admin</span>
              </div>
              <span className="text-[10px] text-[#8C7A6F] truncate block">admin@prasadamdine.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCreds('owner@restaurant.com', 'Password123!')}
              className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] hover:bg-white text-[11px] font-semibold text-[#1C120C] text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-101"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                <span className="font-bold text-[#7A0C1E]">Venue Owner</span>
              </div>
              <span className="text-[10px] text-[#8C7A6F] truncate block">owner@restaurant.com</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-[#8C7A6F] font-semibold tracking-wide relative z-10">
        AR_DINE — AR DIGITAL DINING & OPERATIONS PLATFORM
      </div>
    </div>
  );
}
