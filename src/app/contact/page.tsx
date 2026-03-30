"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="section bg-light-grey">
          <div className="container">
            <h1 className="section-title">Support Gourmet</h1>
            <p className="text-center" style={{ maxWidth: '600px', margin: '-2rem auto 4rem', textAlign: 'center', color: 'var(--color-grey)' }}>
              Une question technique sur une machine Sage ou sur l&apos;entretien de votre cocotte Le Creuset ? Notre équipe d&apos;experts vous répond quotidiennement.
            </p>

            <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', marginTop: '4rem' }}>
              <div className="contact-info">
                <h3>Nos Canaux Dédiés</h3>
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Mail color="var(--color-accent)" size={24} />
                    <div>
                      <strong>Email Prioritaire</strong>
                      <p>contact@kitchenluxe.com</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Phone color="var(--color-accent)" size={24} />
                    <div>
                      <strong>Ligne Conciergerie</strong>
                      <p>01 23 45 67 89<br /><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Lun-Sam : 9h00 - 18h00</span></p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <MapPin color="var(--color-accent)" size={24} />
                    <div>
                      <strong>Showroom & Bureau</strong>
                      <p>Champ-Élysées, Paris<br />(Sur rendez-vous uniquement)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contact-form-container glass-card" style={{ padding: '3rem', borderRadius: '4px' }}>
                <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nom Complet</label>
                      <input type="text" placeholder="Jean Dupont" style={{ padding: '1rem', border: '1px solid #ddd', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Adresse Email</label>
                      <input type="email" placeholder="jean@exemple.com" style={{ padding: '1rem', border: '1px solid #ddd', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sujet de votre demande</label>
                    <select style={{ padding: '1rem', border: '1px solid #ddd', outline: 'none' }}>
                      <option>Conseil sur un produit</option>
                      <option>Suivi de commande</option>
                      <option>Demande de partenariat</option>
                      <option>Autre question</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Votre Message</label>
                    <textarea rows={5} placeholder="Comment pouvons-nous sublimer votre expérience culinaire ?" style={{ padding: '1rem', border: '1px solid #ddd', outline: 'none', resize: 'none' }}></textarea>
                  </div>

                  <button type="submit" className="btn btn-accent" style={{ display: 'flex', gap: '1rem', width: 'fit-content', marginTop: '1rem' }}>
                    Envoyer <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
