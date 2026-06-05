"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile, LoginPayload } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children,
  initialUser = null
}: { 
  children: ReactNode;
  initialUser?: UserProfile | null;
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const router = useRouter();

  // Handle global auth:logout event dispatched by interceptor
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      document.cookie = 'session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      router.push('/login');
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [router]);

  useEffect(() => {
    // If we already have the user from SSR (initialUser), skip initial fetch
    if (initialUser) {
      setIsLoading(false);
      return;
    }

    // Otherwise, check if session_active cookie exists (meaning they might have tokens in-memory)
    // For mock purposes, we'll just check if authStore has an access token in the `authApi.getMe` call
    const fetchUser = async () => {
      try {
        const profile = await authApi.getMe();
        setUser(profile);
        document.cookie = 'session_active=true; path=/; max-age=86400; SameSite=Lax';
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [initialUser]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      await authApi.login(payload);
      const profile = await authApi.getMe();
      setUser(profile);
      // Set non-sensitive session signal for middleware
      document.cookie = 'session_active=true; path=/; max-age=86400; SameSite=Lax';
      router.push('/contributor');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      window.dispatchEvent(new Event('auth:logout'));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
