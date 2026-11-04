import axios from 'axios';
import { unstable_rethrow } from 'next/navigation';
import type { Category } from '@/types';
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const locale = window.location.pathname.split('/')[1];
    config.headers['Accept-Language'] = locale === 'ar' ? 'ar' : 'fr';
  }
  return config;
});

// Token expiré ou révoqué (ex. compte archivé) : on nettoie la session locale
// et on renvoie vers la page de connexion, au lieu de rester « connecté » en apparence.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    const isAuthCall = url.includes('/login') || url.includes('/register');

    if (status === 401 && !isAuthCall && typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      const locale = window.location.pathname.split('/')[1] || 'fr';
      // Rechargement complet volontaire : tous les composants oublient l'ancienne session
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/${locale}/login`;
    }
    return Promise.reject(error);
  }
);

// Message d'erreur lisible renvoyé par Laravel (abort / validation), sinon message par défaut
export function apiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
    ?.response?.data;
  const firstValidationError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
  return firstValidationError || data?.message || fallback;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// 👇 Zidna had l'Type bach n7aydo l'warning dial "any"
type BookQueryParams = Record<string, string | number | boolean | null | undefined>;

export async function fetchBooks(params: BookQueryParams = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => [k, String(v)]) // 👈 N7awlo kolchi l'string 9bel l'URLSearchParams
  ).toString();

  const res = await fetch(`${API_URL}/books?${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function fetchBook(slug: string) {
  const res = await fetch(`${API_URL}/books/${slug}`, { next: { revalidate: 120 } });
  if (!res.ok) throw new Error('Book not found');
  return res.json();
}

// unstable_rethrow : laisse passer le signal interne de Next.js (« rendu dynamique »).
// L'avaler figeait la page au build avec une liste vide.
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    unstable_rethrow(error);
    console.error('Erreur fetchCategories:', error);
    return [];
  }
}

export async function fetchSponsors() {
  try {
    const res = await fetch(`${API_URL}/sponsors`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    unstable_rethrow(error);
    return [];
  }
}