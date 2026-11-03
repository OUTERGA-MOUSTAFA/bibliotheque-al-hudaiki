'use client';

import { useState, useMemo, useEffect } from 'react'; // 👈 Zid useEffect
import Image from 'next/image';
import { X, Calendar, Hash, Clock, ShieldAlert, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from '@/navigation';
import type { Book } from '@/types';

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
};

export default function PublicBookModal({ book, isOpen, onClose, onRefresh }: { book: Book | null, isOpen: boolean, onClose: () => void, onRefresh: () => void }) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 👇 State dial l'ikhtiyar dial l'ayyam
    const [borrowDuration, setBorrowDuration] = useState<number>(14);

    // Mlli kayt7ell l'Modal wla kaytbdel l'ktab, kan7etto l'Max dial l'Admin k'ikhtiyar par défaut
    useEffect(() => {
        if (book?.max_borrow_days) {
            setBorrowDuration(book.max_borrow_days);
        }
    }, [book]);

    const userAge = useMemo(() => {
        if (!user?.date_naissance) return 0;
        const birthDate = new Date(user.date_naissance);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }, [user?.date_naissance]);

    const bookCreatedAt = useMemo(() => formatDate(book?.created_at), [book?.created_at]);
    const bookUpdatedAt = useMemo(() => formatDate(book?.updated_at), [book?.updated_at]);

    // 👇 N7esbo l'date dial l'retour dynamiquement 3la 7sab l'ikhtiyar dial l'user
    const { todayDate, expectedReturnDate } = useMemo(() => {
        const today = new Date();
        const returnDate = new Date();
        returnDate.setDate(today.getDate() + borrowDuration);
        return {
            todayDate: today.toLocaleDateString('fr-FR'),
            expectedReturnDate: returnDate.toLocaleDateString('fr-FR')
        };
    }, [borrowDuration]); // 👈 Kaytbdel mlli l'user ybdel l'ayyam

    if (!isOpen || !book) return null;

    const isRestricted = book.age_restriction && userAge < book.age_restriction;

    const handleBorrow = async () => {
        if (!isAuthenticated) {
            toast.error("Veuillez vous connecter pour emprunter ce livre.");
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            // 👇 Kansifto l'ayyam li khtar l'user l'Backend
            await api.post('/loans', {
                book_id: book.id,
                borrow_duration: borrowDuration
            });
            toast.success("Livre emprunté avec succès !");
            onRefresh();
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de l'emprunt");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-950/80 backdrop-blur-md" onClick={onClose}>
            <div
                className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md">
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
                            <span className="font-bold text-lg">Contenu Restreint (+{book.age_restriction})</span>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
                    <div className="mb-6">
                        <span className="text-xs font-bold text-brand-600 uppercase">{book.categorie?.nom || 'Sans catégorie'}</span>
                        <h2 className="text-3xl font-extrabold text-stone-900 mt-1">{book.titre}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-stone-600">
                        <div className="flex items-center gap-2"><Hash size={16} /> ID: <span className="font-semibold text-stone-900">{book.id}</span></div>
                        <div className="flex items-center gap-2"><BookOpen size={16} /> {book.nombre_pages || '?'} Pages</div>
                        <div className="flex items-center gap-2"><Clock size={16} /> Ajouté le: <span className="font-semibold text-stone-900">{bookCreatedAt}</span></div>
                        <div className="flex items-center gap-2"><Calendar size={16} /> Modifié le: <span className="font-semibold text-stone-900">{bookUpdatedAt}</span></div>
                    </div>

                    <div className={`mb-8 ${isRestricted ? 'blur-sm select-none' : ''}`}>
                        <h3 className="font-bold text-stone-900 text-sm mb-1">Résumé</h3>
                        <p className="text-sm text-stone-600 leading-relaxed">{book.resume || 'Aucun résumé disponible.'}</p>
                    </div>

                    {/* L'Zone dial l'I3ara */}
                    <div className="mt-auto bg-stone-50 border border-stone-200 rounded-2xl p-5">
                        {isRestricted ? (
                            <div className="flex items-center gap-3 text-coral-700 bg-coral-50 p-3 rounded-lg text-sm font-medium">
                                <AlertCircle size={20} /> Désolé, vous n&apos;avez pas l&apos;âge requis.
                            </div>
                        ) : book.stock > 0 ? (
                            <div className="flex flex-col gap-4">

                                {/* 👇 L'Input jdid dial l'ikhtiyar dial l'ayyam */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-stone-700">Durée d&apos;emprunt :</span>
                                    <select
                                        value={borrowDuration}
                                        onChange={(e) => setBorrowDuration(Number(e.target.value))}
                                        className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    >
                                        {/* Kan-creyiw liste mn 1 7ta l'Max li 7et l'Admin */}
                                        {Array.from({ length: book.max_borrow_days || 14 }, (_, i) => i + 1).map((day) => (
                                            <option key={day} value={day}>
                                                {day} {day === 1 ? 'jour' : 'jours'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full h-px bg-stone-200" />

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <div className="text-sm text-stone-500">Emprunt: <strong className="text-stone-900">{todayDate}</strong></div>
                                        <div className="text-sm text-stone-500">Retour: <strong className="text-brand-700">{expectedReturnDate}</strong></div>
                                    </div>
                                    <Button onClick={handleBorrow} disabled={loading} className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 h-12 shadow-lg">
                                        {loading ? <Loader2 className="animate-spin" /> : "Emprunter"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-coral-600 font-bold">Ce livre est épuisé.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}