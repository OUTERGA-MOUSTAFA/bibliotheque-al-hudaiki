import axios from 'axios';
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
  }
  return config;
});

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

// 👇 HNA FIN KAN L'MOCHKIL (Laravel kayrje3 data f chi 7aja khra, 7na kanakhdo li kayn)
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Erreur fetchCategories:", error);
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
    return [];
  }
}