'use client';

import { api } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  photo?: string;
  telephone?: string;
  adresse?: string;
  etablissement?: string;
  roles?: string[];
}

export const auth = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setSession(user: AuthUser, token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.roles?.includes('admin') ?? false;
  },

  async fetchMe(): Promise<AuthUser | null> {
    try {
      const { data } = await api.get('/me');
      const user = { ...data.user, roles: data.roles };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      this.clear();
      return null;
    }
  },

  async login(email: string, password: string) {
    const { data } = await api.post('/login', { email, password });
    this.setSession({ ...data.user, roles: data.roles }, data.token);
    return data;
  },

  async register(payload: Record<string, unknown>) {
    const { data } = await api.post('/register', payload);
    this.setSession({ ...data.user, roles: ['lecteur'] }, data.token);
    return data;
  },

  async logout() {
    try {
      await api.post('/logout');
    } finally {
      this.clear();
    }
  },
};