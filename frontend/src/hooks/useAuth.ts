'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { auth, type AuthUser } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = auth.getUser();
    if (stored) {
      setUser(stored);
      auth.fetchMe().then(setUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await auth.login(email, password);
    setUser({ ...data.user, roles: data.roles });
    return data;
  };

  const register = async (payload: Record<string, unknown>) => {
    const data = await auth.register(payload);
    setUser({ ...data.user, roles: ['lecteur'] });
    return data;
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.roles?.includes('admin') ?? false,
  };
}