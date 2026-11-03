'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, MapPin, Send, Phone } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nom: '', email: '', sujet: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      toast.success("Message envoyé avec succès ! Nous vous répondrons bientôt.");
      setFormData({ nom: '', email: '', sujet: '', message: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">اتصل بنا</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Vous avez une question, une suggestion ou besoin d&apos;aide ? Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les plus brefs délais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Infos de Contact (Sidebar) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-night p-8 rounded-3xl text-white shadow-xl h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-6">Informations de contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-gold-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Adresse</h4>
                    <p className="text-sm text-stone-300">Bibliothèque Al Hudaigy, Tafraout, Maroc</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="text-gold-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Email</h4>
                    <a href="mailto:outergamoustafa@gmail.com" className="text-sm text-stone-300 hover:text-gold-400 transition">outergamoustafa@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="text-gold-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Téléphone</h4>
                    <p className="text-sm text-stone-300">+212 6XX XXX XXX</p>
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
                  <Label>Nom complet *</Label>
                  <Input required placeholder="Votre nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input type="email" required placeholder="vous@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sujet *</Label>
                <Input required placeholder="De quoi s'agit-il ?" value={formData.sujet} onChange={e => setFormData({...formData, sujet: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Message *</Label>
                <textarea 
                  required rows={6} 
                  placeholder="Écrivez votre message ici..."
                  className="w-full border border-stone-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none bg-stone-50"
                  value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} 
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white h-12 rounded-xl text-base">
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Send size={20} className="mr-2" />}
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}