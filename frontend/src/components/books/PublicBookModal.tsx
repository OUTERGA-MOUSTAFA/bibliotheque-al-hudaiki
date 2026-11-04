'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { X, Calendar, Hash, Clock, ShieldAlert, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api, apiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { useRouter } from '@/navigation';
import FavoriteButton from '@/components/books/FavoriteButton';
import BookReviews from '@/components/books/BookReviews';
import type { Book, BookDetails } from '@/types';

const ageFrom = (dateNaissance?: string) => {
    if (!dateNaissance) return 0;
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

export default function PublicBookModal({ book, isOpen, onClose, onRefresh }: { book: Book | null, isOpen: boolean, onClose: () => void, onRefresh: () => void }) {
    const t = useTranslations('book');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Durée choisie par le lecteur : par défaut le maximum fixé par l'admin.
    // Réinitialisée pendant le rendu quand le livre change (pas d'effet → pas de rendu en cascade).
    const [borrowDuration, setBorrowDuration] = useState<number>(book?.max_borrow_days ?? 14);
    const [durationBookId, setDurationBookId] = useState(book?.id);
    if (book?.id !== durationBookId) {
        setDurationBookId(book?.id);
        setBorrowDuration(book?.max_borrow_days ?? 14);
    }

    // Détails complets (avis, favori, droit de noter) : la liste ne les contient pas
    const [details, setDetails] = useState<BookDetails | null>(null);

    const slug = book?.slug;
    const loadDetails = useCallback(() => {
        if (!slug) return;
        api.get<BookDetails>(`/books/${slug}`)
            .then(({ data }) => setDetails(data))
            .catch(() => setDetails(null));
    }, [slug]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDetails(null);
        if (isOpen) loadDetails();
    }, [isOpen, loadDetails]);

    if (!isOpen || !book) return null;

    const userAge = ageFrom(user?.date_naissance);
    const isRestricted = !!book.age_restriction && userAge < book.age_restriction;

    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + borrowDuration);

    const handleBorrow = async () => {
        if (!isAuthenticated) {
            toast.error(t('login_to_borrow'));
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            await api.post('/loans', { book_id: book.id, borrow_duration: borrowDuration });
            toast.success(t('borrowed'));
            onRefresh();
            onClose();
        } catch (error: unknown) {
            toast.error(apiErrorMessage(error, t('borrow_error')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-950/80 backdrop-blur-md" onClick={onClose}>
            <div
                className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={book.titre}
            >
                <button onClick={onClose} aria-label={tCommon('close')} className="absolute top-4 end-4 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md">
                    <X size={20} />
                </button>

                <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-stone-100 shrink-0">
                    {book.image ? (
                        <Image src={book.image} alt={book.titre} fill className={`object-cover ${isRestricted ? 'blur-xl' : ''}`} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300"><BookOpen size={64} /></div>
                    )}
                    {isRestricted && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40">
                            <ShieldAlert size={48} className="text-coral-500 mb-2" />
                            <span className="font-bold text-lg">{t('restricted', { age: book.age_restriction ?? 0 })}</span>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
                    {/* pe-12 : laisse la place au bouton de fermeture */}
                    <div className="mb-6 flex items-start justify-between gap-4 pe-12">
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-brand-600 uppercase">{book.categorie?.nom || t('no_category')}</span>
                            <h2 className="text-3xl font-extrabold text-stone-900 mt-1">{book.titre}</h2>
                        </div>
                        <FavoriteButton bookId={book.id} initialFavorited={details?.is_favorited ?? false} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-stone-600">
                        <div className="flex items-center gap-2"><Hash size={16} /> {t('reference')} <span className="font-semibold text-stone-900">{book.id}</span></div>
                        <div className="flex items-center gap-2"><BookOpen size={16} /> {t('pages_count', { count: book.nombre_pages ?? 0 })}</div>
                        <div className="flex items-center gap-2"><Clock size={16} /> {t('added_on')} <span className="font-semibold text-stone-900">{formatDate(book.created_at, locale)}</span></div>
                        <div className="flex items-center gap-2"><Calendar size={16} /> {t('updated_on')} <span className="font-semibold text-stone-900">{formatDate(book.updated_at, locale)}</span></div>
                    </div>

                    <div className={`mb-8 ${isRestricted ? 'blur-sm select-none' : ''}`}>
                        <h3 className="font-bold text-stone-900 text-sm mb-1">{t('summary')}</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">{book.resume || t('no_summary')}</p>
                    </div>

                    {details ? (
                        // onRefresh recharge toute la page : pour un avis, on recharge seulement le modal
                        <BookReviews details={details} onChanged={loadDetails} />
                    ) : (
                        <div className="mb-6 h-16 rounded-2xl bg-stone-100 animate-pulse" />
                    )}

                    <div className="mt-auto bg-stone-50 border border-stone-200 rounded-2xl p-5">
                        {isRestricted ? (
                            <div className="flex items-center gap-3 text-coral-700 bg-coral-50 p-3 rounded-lg text-sm font-medium">
                                <AlertCircle size={20} /> {t('age_required')}
                            </div>
                        ) : book.stock > 0 ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3">
                                    <label htmlFor="borrow-duration" className="text-sm font-medium text-stone-700">{t('borrow_duration')}</label>
                                    <select
                                        id="borrow-duration"
                                        value={borrowDuration}
                                        onChange={(e) => setBorrowDuration(Number(e.target.value))}
                                        className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    >
                                        {/* De 1 jour jusqu'au maximum fixé par l'admin */}
                                        {Array.from({ length: book.max_borrow_days || 14 }, (_, i) => i + 1).map((day) => (
                                            <option key={day} value={day}>{t('days', { count: day })}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full h-px bg-stone-200" />

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <div className="text-sm text-stone-500">{t('borrow_date')} : <strong className="text-stone-900">{formatDate(today, locale)}</strong></div>
                                        <div className="text-sm text-stone-500">{t('return_date')} : <strong className="text-brand-700">{formatDate(returnDate, locale)}</strong></div>
                                    </div>
                                    <Button onClick={handleBorrow} disabled={loading} className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 h-12 shadow-lg">
                                        {loading ? <Loader2 className="animate-spin" /> : t('borrow_cta')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-coral-600 font-bold">{t('out_of_stock')}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
