'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl'; // 👈 Zidna hada
import { api, apiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, MapPin, Send, Phone } from 'lucide-react';

export default function ContactPage() {
    const t = useTranslations('contact'); // 👈 Zidna hada
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nom: '', email: '', sujet: '', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/contact', formData);
            toast.success(t('success'));
            setFormData({ nom: '', email: '', sujet: '', message: '' });
        } catch (err: unknown) {
            toast.error(apiErrorMessage(err, t('error')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-stone-900 mb-4">{t('title')}</h1>
                    <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Infos de Contact (Sidebar) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-night p-8 rounded-3xl text-white shadow-xl h-full flex flex-col justify-center">
                            <h3 className="text-2xl font-bold mb-6">{t('info_title')}</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <MapPin className="text-gold-400" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white mb-1">{t('address')}</h4>
                                        <p className="text-sm text-stone-300">{t('address_val')}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Mail className="text-gold-400" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white mb-1">{t('email')}</h4>
                                        <a href="mailto:outergamoustafa@gmail.com" className="text-sm text-stone-300 hover:text-gold-400 transition" dir="ltr">
                                            outergamoustafa@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Phone className="text-gold-400" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white mb-1">{t('phone')}</h4>
                                        <p className="text-sm text-stone-300" dir="ltr">+212 6XX XXX XXX</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-soft border border-stone-200 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>{t('form_name')}</Label>
                                    <Input required placeholder={t('form_name_placeholder')} value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('form_email')}</Label>
                                    <Input type="email" required placeholder={t('form_email_placeholder')} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} dir="ltr" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('form_subject')}</Label>
                                <Input required placeholder={t('form_subject_placeholder')} value={formData.sujet} onChange={e => setFormData({ ...formData, sujet: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('form_message')}</Label>
                                <textarea
                                    required rows={6}
                                    placeholder={t('form_message_placeholder')}
                                    className="w-full border border-stone-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none bg-stone-50"
                                    value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white h-12 rounded-xl text-base">
                                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Send size={20} className="mr-2" />}
                                {loading ? t('form_submitting') : t('form_submit')}
                            </Button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}