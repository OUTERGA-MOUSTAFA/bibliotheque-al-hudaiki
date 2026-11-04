'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from '@/navigation';
import { auth, type AuthUser } from '@/lib/auth';

const noopSubscribe = () => () => {};

// Session partagée : quand un composant se connecte ou se déconnecte,
// tous les autres (Header compris) sont mis à jour immédiatement.
export function useAuth() {
  const user = useSyncExternalStore(auth.subscribe, auth.getUser, () => null);
  // false pendant le rendu serveur et l'hydratation, true ensuite (évite les écarts d'hydratation)
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const router = useRouter();

  const login = (email: string, password: string) => auth.login(email, password);

  const completeTwoFactor = (challenge: string, code: { code?: string; recovery_code?: string }) =>
    auth.completeTwoFactor(challenge, code);

  const updateUser = (patch: Partial<AuthUser>) => {
    if (!user) return;
    auth.updateStoredUser({ ...user, ...patch, roles: user.roles });
  };

  const register = (payload: Record<string, unknown>) => auth.register(payload);

  const logout = async () => {
    await auth.logout();
    router.push('/');
    router.refresh();
  };

  return {
    user,
    loading: !hydrated,
    login,
    completeTwoFactor,
    updateUser,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.roles?.includes('admin') ?? false,
  };
}
