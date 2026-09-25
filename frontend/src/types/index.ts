export interface Category {
  id: number;
  nom: string;
  slug: string;
  visuel?: string;
  description?: string;
  books_count?: number;
}

export interface Book {
  id: number;
  titre: string;
  slug: string;
  description?: string;
  resume?: string;
  image?: string;
  nombre_pages?: number;
  langue: string;
  stock: number;
  statut: 'disponible' | 'emprunte' | 'archive';
  themes?: string[];
  personnes?: string[];
  lieux?: string[];
  periodes?: string[];
  note_moyenne: number;
  nb_favoris: number;
  nb_emprunts: number;
  categorie?: Category;
  reviews?: Review[];
}

export interface Review {
  id: number;
  note: number;
  commentaire?: string;
  created_at: string;
  user: { nom: string; prenom: string; photo?: string };
}

export interface Sponsor {
  id: number;
  nom: string;
  logo: string;
  lien_externe: string;
  ordre: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}