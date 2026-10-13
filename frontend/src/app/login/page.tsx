'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-center items-center p-4">
      {/* Modern Card with rounded-2xl and elegant soft shadow */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E2D9] shadow-xl p-8 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-8 border-b border-[#E8E2D9] pb-6">
          <div className="inline-flex w-12 h-12 bg-[#5E0B15] text-[#EDE1CF] rounded-2xl items-center justify-center font-black text-2xl mb-3 shadow-sm">
            P
          </div>
          <h1 className="text-xl font-black tracking-widest text-[#5E0B15] uppercase">
            PRASADAM_DINE
          </h1>
          <p className="text-xs font-semibold tracking-wider text-[#594B42] uppercase mt-1">
            AR Smart Restaurant Portal
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-[#FDF0F1] text-[#90323D] text-xs font-medium rounded-xl flex items-center gap-2.5 border border-[#F6C6CC]">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#90323D]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@prasadamdine.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full uppercase font-bold tracking-wider rounded-xl shadow-md hover:shadow-lg"
            isLoading={isLoading}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Quick Testing Credentials Helper */}
        <div className="mt-8 pt-6 border-t border-[#E8E2D9] space-y-3">
          <p className="text-[11px] font-bold text-[#594B42] uppercase tracking-wider text-center">
            Quick Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillQuickCreds('admin@prasadamdine.com', 'Admin@SecurePrasadam2026!')}
              className="px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] hover:border-[#90323D] text-[11px] font-semibold text-[#5E0B15] text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">Super Admin</span>
              <span className="text-[9px] text-[#594B42] truncate block">admin@prasadamdine.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCreds('owner@restaurant.com', 'Password123!')}
              className="px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] hover:border-[#90323D] text-[11px] font-semibold text-[#5E0B15] text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">Restaurant Owner</span>
              <span className="text-[9px] text-[#594B42] truncate block">owner@restaurant.com</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-[#594B42] font-medium tracking-wide">
        PRASADAM DINE — AR DIGITAL DINING PLATFORM
      </div>
    </div>
  );
}
