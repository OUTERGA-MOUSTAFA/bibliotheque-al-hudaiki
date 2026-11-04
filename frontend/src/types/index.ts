export interface Category {
  id: number;
  nom: string;
  slug: string;
  visuel?: string;
  description?: string;
  books_count?: number;
  statut?: 'actif' | 'archive';
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
  max_borrow_days: number;
  age_restriction?: number;
  created_at?: string;
  updated_at?: string;
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
// Réponse de GET /books/{slug} : le livre + infos propres au lecteur connecté
export interface BookDetails extends Book {
  is_favorited: boolean;
  can_review: boolean;
  my_review: (Review & { user_id: number }) | null;
  reviews: (Review & { user_id: number })[];
}

export interface ContactMessage {
  id: number;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  lu: boolean;
  created_at: string;
}

// ── Admin ──
export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  statut: 'actif' | 'archive';
  created_at: string;
  roles?: { name: string }[];
}

export interface AdminLoan {
  id: number;
  lecteur: { id: number; nom: string; prenom: string; photo?: string; telephone?: string } | null;
  livre: { id: number; titre: string; image?: string } | null;
  date_pret: string;
  date_retour_prevue: string;
  jours_retard: number;
}

export interface DashboardData {
  stats: {
    total_books: number;
    available_books: number;
    active_loans: number;
    late_loans: number;
    total_users: number;
    archived_users: number;
  };
  recent_loans: {
    id: number;
    created_at: string;
    date_retour_reelle?: string | null;
    user?: { nom: string; prenom: string } | null;
    book?: { titre: string } | null;
  }[];
}
