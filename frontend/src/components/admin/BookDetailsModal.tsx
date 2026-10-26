'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Edit, Archive, Trash2, Save, Loader2, RotateCcw  } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Book } from '@/types';

export default function BookDetailsModal({
    book,
    isOpen,
    onClose,
    onRefresh
}: {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Book>>({});

    if (!isOpen || !book) return null;

    const handleEditClick = () => {
        setFormData(book);
        setIsEditing(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put(`/admin/books/${book.id}`, formData);
            toast.success("Livre modifié avec succès");
            setIsEditing(false);
            onRefresh();
            onClose();
        } catch (err) {
            toast.error("Erreur lors de la modification");
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!confirm("Archiver ce livre ?")) return;
        setLoading(true);
        try {
            await api.post(`/admin/books/${book.id}/archive`);
            toast.success("Livre archivé");
            onRefresh();
            onClose();
        } catch (err) {
            toast.error("Erreur d'archivage");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("⚠️ Supprimer définitivement ?")) return;
        setLoading(true);
        try {
            await api.delete(`/admin/books/${book.id}`);
            toast.success("Livre supprimé définitivement");
            onRefresh();
            onClose();
        } catch (err) {
            toast.error("Erreur de suppression");
        } finally {
            setLoading(false);
        }
    };
    const handleRestore = async () => {
        if (!confirm("Réactiver ce livre ? Il sera de nouveau visible par les utilisateurs.")) return;
        setLoading(true);
        try {
            await api.post(`/admin/books/${book.id}/restore`);
            toast.success("Livre réactivé avec succès");
            onRefresh();
            onClose();
        } catch (err) {
            toast.error("Erreur lors de la réactivation");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">{isEditing ? 'Modifier le livre' : 'Détails du livre'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition"><X size={20} /></button>
                </div>

                <div className="p-6">
                    {isEditing ? (
                        /* 👇 MODE EDITION */
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Titre</label>
                                <Input value={formData.titre || ''} onChange={e => setFormData({ ...formData, titre: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Stock</label>
                                    <Input type="number" value={formData.stock || 0} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Pages</label>
                                    <Input type="number" value={formData.nombre_pages || 0} onChange={e => setFormData({ ...formData, nombre_pages: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Description</label>
                                <textarea className="w-full border rounded-lg p-3 text-sm" rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Résumé</label>
                                <textarea className="w-full border rounded-lg p-3 text-sm" rows={4} value={formData.resume || ''} onChange={e => setFormData({ ...formData, resume: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                                <Button onClick={handleSave} disabled={loading} className="bg-brand-600 text-white">
                                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> Enregistrer</>}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* 👇 MODE LECTURE (READ) */
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 aspect-[3/4] relative rounded-xl overflow-hidden bg-stone-100 shrink-0">
                                    {book.image && <Image src={book.image} alt={book.titre} fill className="object-cover" />}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-stone-900">{book.titre}</h3>
                                        <p className="text-sm text-brand-600 font-semibold">{book.categorie?.nom || 'Sans catégorie'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm bg-stone-50 p-4 rounded-xl">
                                        <div><span className="text-stone-500 block">Statut</span> <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${book.statut === 'disponible' ? 'bg-brand-100 text-brand-700' : 'bg-coral-100 text-coral-700'}`}>{book.statut}</span></div>
                                        <div><span className="text-stone-500 block">Stock</span> <span className="font-bold">{book.stock}</span></div>
                                        <div><span className="text-stone-500 block">Pages</span> <span className="font-bold">{book.nombre_pages || '-'}</span></div>
                                        <div><span className="text-stone-500 block">Langue</span> <span className="font-bold">{book.langue}</span></div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-stone-900 text-sm mb-1">Description</h4>
                                        <p className="text-sm text-stone-600 line-clamp-3">{book.description || 'Non renseignée'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-stone-900 text-sm mb-1">Résumé complet</h4>
                                <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl">{book.resume || 'Non renseigné'}</p>
                            </div>

                            {/* 👇 ACTIONS (Edit, Archive, Delete) */}
                            {/* 👇 ACTIONS (Edit, Archive, Restore, Delete) */}
                            <div className="flex flex-wrap gap-3 pt-6 border-t border-stone-100">
                                <Button onClick={handleEditClick} className="bg-sky-600 hover:bg-sky-700 text-white">
                                    <Edit size={16} className="mr-2" /> Modifier
                                </Button>

                                {/* Ila kan l'ktab m'archivi, n3tiw option dial Restore w Delete */}
                                {book.statut === 'archive' ? (
                                    <>
                                        <Button onClick={handleRestore} disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white">
                                            <RotateCcw size={16} className="mr-2" /> Réactiver
                                        </Button>
                                        <Button onClick={handleDelete} disabled={loading} className="bg-coral-600 hover:bg-coral-700 text-white">
                                            <Trash2 size={16} className="mr-2" /> Supprimer
                                        </Button>
                                    </>
                                ) : (
                                    /* Ila kan 3adi, n3tiw ghir option dial Archive */
                                    <Button onClick={handleArchive} disabled={loading} className="bg-gold-500 hover:bg-gold-600 text-white">
                                        <Archive size={16} className="mr-2" /> Archiver
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}