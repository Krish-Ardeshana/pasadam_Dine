'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Layers,
  FileImage,
  QrCode,
  Users,
  Settings,
  Building2,
  ChevronDown,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { user, isSuperAdmin, currentRestaurant, setCurrentRestaurant, logout } = useAuth();

  const assignedRestaurants = (user?.restaurantAssignments || []).filter(
    (r): r is any => typeof r === 'object' && r !== null,
  );

  const adminNav = [
    { label: 'Platform Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Restaurants', href: '/admin/restaurants', icon: Building2 },
    { label: 'Platform Users', href: '/admin/users', icon: Users },
    { label: 'Activity Audit', href: '/admin/activity', icon: Activity },
    { label: 'Platform Settings', href: '/admin/settings', icon: SlidersHorizontal },
  ];

  const restaurantNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Menu Categories', href: '/dashboard/categories', icon: Layers },
    { label: 'Dishes & 3D AR', href: '/dashboard/dishes', icon: UtensilsCrossed },
    { label: 'Media Assets', href: '/dashboard/media', icon: FileImage },
    { label: 'QR Dining Codes', href: '/dashboard/qr', icon: QrCode },
    { label: 'Staff Team', href: '/dashboard/staff', icon: Users },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const navItems = isSuperAdmin && pathname.startsWith('/admin') ? adminNav : restaurantNav;

  return (
    <aside className="w-64 bg-gradient-to-b from-[#5E0513] via-[#7A0C1E] to-[#4A030D] text-white flex flex-col h-full border-r border-[#680514] shrink-0 select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#8B1226]/50 bg-[#4A030D]/70 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FBBF24] to-[#E69500] text-[#5E0513] rounded-xl flex items-center justify-center font-black text-xl shadow-md">
            P
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-[#FFFDF9] uppercase">
              PRASADAM DINE
            </h1>
            <p className="text-[10px] font-bold tracking-wider text-[#FDE68A] uppercase">
              Restaurant Ops & AR
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Restaurant Switcher */}
      {!isSuperAdmin && assignedRestaurants.length > 0 && (
        <div className="px-4 py-3 bg-[#4A030D]/50 border-b border-[#8B1226]/40">
          <label className="text-[10px] font-black tracking-wider text-[#FDE68A] uppercase block mb-1.5">
            Active Restaurant
          </label>
          <div className="relative">
            <select
              value={currentRestaurant?._id || ''}
              onChange={(e) => {
                const found = assignedRestaurants.find((r) => r._id === e.target.value);
                if (found) setCurrentRestaurant(found);
              }}
              className="w-full bg-[#FFFDF9] text-[#1C120C] text-xs font-bold px-3 py-2 rounded-xl border border-[#E8DEC9] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F59E0B] shadow-xs"
            >
              {assignedRestaurants.map((r) => (
                <option key={r._id} value={r._id} className="bg-white text-[#1C120C]">
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#1C120C]/70 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-[#FBBF24] to-[#E69500] text-[#5E0513] shadow-md font-black translate-x-0.5'
                  : 'text-[#FAF7F2]/90 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-[#5E0513]' : 'text-[#FDE68A]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Super Admin Switch Mode Link */}
        {isSuperAdmin && (
          <div className="pt-4 mt-4 border-t border-[#8B1226]/50">
            {pathname.startsWith('/admin') ? (
              <Link
                href="/dashboard"
                onClick={onCloseMobile}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-[#FDE68A] hover:bg-white/10 hover:text-white transition-all"
              >
                <Building2 className="w-4 h-4 shrink-0 text-[#FDE68A]" />
                <span>Restaurant Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={onCloseMobile}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-[#FDE68A] hover:bg-white/10 hover:text-white transition-all"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#FDE68A]" />
                <span>Super Admin Portal</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#8B1226]/50 bg-[#4A030D]/80 backdrop-blur-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#E69500] text-[#5E0513] border border-amber-300 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-[#FFFDF9] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[#FDE68A]/80 uppercase truncate tracking-wider font-semibold">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-2 rounded-xl text-[#FAF7F2]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
