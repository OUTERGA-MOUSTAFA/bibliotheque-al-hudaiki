'use client';

import { useTranslations } from 'next-intl';
import { Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';

export default function ContactPage() {
    const t = useTranslations('contact');

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

                    {/* Formulaire avec vérification de l'adresse e-mail (code à 6 chiffres) */}
                    <div className="lg:col-span-3">
                        <ContactForm />
                    </div>

                </div>
            </div>
        </div>
    );
}