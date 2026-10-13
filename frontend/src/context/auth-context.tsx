'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Restaurant, Role, User } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentRestaurant: Restaurant | null;
  setCurrentRestaurant: (restaurant: Restaurant) => void;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSuperAdmin: boolean;
  isOwner: boolean;
  isManager: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentRestaurant, setCurrentRestaurantState] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const setCurrentRestaurant = (restaurant: Restaurant) => {
    setCurrentRestaurantState(restaurant);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prasadam_current_restaurant', JSON.stringify(restaurant));
    }
  };

  const refreshProfile = React.useCallback(async () => {
    try {
      const profile = await api.auth.getMe();
      setUser(profile);

      // Handle restaurant assignment selection
      const assignments = profile.restaurantAssignments || [];
      if (assignments.length > 0) {
        const saved = localStorage.getItem('prasadam_current_restaurant');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const exists = assignments.some((r: any) =>
              typeof r === 'object' ? r._id === parsed._id : r === parsed._id,
            );
            if (exists) {
              setCurrentRestaurantState(parsed);
              return;
            }
          } catch {
            // Ignored, fallback below
          }
        }

        // Set default to first restaurant
        const first = assignments[0];
        if (typeof first === 'object') {
          setCurrentRestaurant(first as Restaurant);
        } else {
          // If populated as ID, fetch restaurant details
          const rest = await api.restaurants.getById(first);
          setCurrentRestaurant(rest);
        }
      }
    } catch {
      setUser(null);
      setCurrentRestaurantState(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshProfile();
      setIsLoading(false);
    };

    initAuth();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setUser(res.user);
      await refreshProfile();
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignored
    } finally {
      setUser(null);
      setCurrentRestaurantState(null);
      router.push('/login');
    }
  };

  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;
  const isOwner = user?.role === Role.RESTAURANT_OWNER || isSuperAdmin;
  const isManager = user?.role === Role.RESTAURANT_MANAGER || isOwner;
  const isStaff = user?.role === Role.RESTAURANT_STAFF || isManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        currentRestaurant,
        setCurrentRestaurant,
        login,
        logout,
        refreshProfile,
        isSuperAdmin,
        isOwner,
        isManager,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
