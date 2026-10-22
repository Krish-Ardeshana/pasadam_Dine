'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FBF9F5] relative flex flex-col justify-center items-center p-4 overflow-hidden">
      {/* Decorative Atmosphere Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />

      {/* Top Back to Site Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#57534E] hover:text-[#1B4332] px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-[#E8E2D9] transition-all hover:scale-102 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Modern Card with rounded-3xl and elegant soft shadow */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E8E2D9] shadow-2xl p-8 sm:p-10 transition-all relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 border-b border-[#F0EAE1] pb-6">
          <div className="inline-flex w-14 h-14 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white rounded-2xl items-center justify-center font-luxury font-bold text-2xl mb-3 shadow-md shadow-emerald-950/10">
            P
          </div>
          <h1 className="font-luxury text-2xl font-bold tracking-tight text-[#1C1917]">
            PRASADAM DINE
          </h1>
          <p className="text-xs font-semibold tracking-wider text-[#2D6A4F] uppercase mt-1">
            Restaurant Operations & Management
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 text-xs font-medium rounded-2xl flex items-center gap-3 border border-red-200/80 shadow-xs">
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
            className="w-full bg-[#1B4332] hover:bg-[#143326] text-white uppercase font-bold tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all py-3.5"
            isLoading={isLoading}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Quick Testing Credentials Helper */}
        <div className="mt-8 pt-6 border-t border-[#F0EAE1] space-y-3">
          <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider text-center">
            Quick One-Click Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillQuickCreds('admin@prasadamdine.com', 'Admin@SecurePrasadam2026!')}
              className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] hover:border-[#1B4332] hover:bg-white text-[11px] font-semibold text-[#1C1917] text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-101"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="font-bold text-[#1B4332]">Super Admin</span>
              </div>
              <span className="text-[10px] text-[#78716C] truncate block">admin@prasadamdine.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCreds('owner@restaurant.com', 'Password123!')}
              className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] hover:border-[#1B4332] hover:bg-white text-[11px] font-semibold text-[#1C1917] text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-101"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="font-bold text-[#1B4332]">Venue Owner</span>
              </div>
              <span className="text-[10px] text-[#78716C] truncate block">owner@restaurant.com</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-[#78716C] font-medium tracking-wide relative z-10">
        PRASADAM DINE — AR DIGITAL DINING & OPERATIONS PLATFORM
      </div>
    </div>
  );
}
