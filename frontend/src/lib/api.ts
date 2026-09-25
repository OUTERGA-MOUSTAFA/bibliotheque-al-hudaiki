import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchBooks(params: Record<string, any> = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '') as [string, string][]
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

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
  return res.json();
}

export async function fetchSponsors() {
  const res = await fetch(`${API_URL}/sponsors`, { next: { revalidate: 600 } });
  return res.json();
}