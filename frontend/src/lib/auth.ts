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
  date_naissance?: string; // 👈 KHASS TKON HNA
  photo?: string;
  telephone?: string;
  adresse?: string;
  etablissement?: string;
  roles?: string[];
}
export interface LoginResponse {
  two_factor?: boolean;
  challenge?: string;
  user: AuthUser;
  roles: string[];
  token: string;
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

  // Si la 2FA est active, le serveur renvoie { two_factor: true, challenge } et pas encore de token
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post('/login', { email, password });
    if (!data.two_factor) {
      this.setSession({ ...data.user, roles: data.roles }, data.token);
    }
    return data;
  },

  // 2e étape : code de l'application d'authentification, ou code de secours
  async completeTwoFactor(challenge: string, code: { code?: string; recovery_code?: string }): Promise<LoginResponse> {
    const { data } = await api.post('/two-factor-challenge', { challenge, ...code });
    this.setSession({ ...data.user, roles: data.roles }, data.token);
    return data;
  },

  // Met à jour l'utilisateur stocké localement (après modification du profil)
  updateStoredUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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