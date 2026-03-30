"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3 className="footer-logo">KITCHENLUXE</h3>
          <p className="footer-desc">
            L'excellence culinaire à votre portée. Appareils de précision et ustensiles de chef pour une cuisine d'exception.
          </p>
          <div className="footer-contact-info" style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-grey)' }}>
            <p><strong>Nous Contacter :</strong></p>
            <p>📧 contact@kitchenluxe.com</p>
            <p>📱 Service Gourmet : 01 23 45 67 89</p>
            <p>📍 Showroom Paris & Boutique en ligne</p>
          </div>
        </div>


        <div className="footer-links">
          <h4>Boutique</h4>
          <Link href="/products">Tous les Produits</Link>
          <Link href="/category/appliances">Électroménager</Link>
          <Link href="/category/cookware">Ustensiles</Link>
          <Link href="/category/knives">Coutellerie</Link>
        </div>

        <div className="footer-links">
          <h4>Entreprise</h4>
          <Link href="/blog">Recettes & Conseils</Link>
          <Link href="/contact">Nous Contacter</Link>
          <Link href="/about">À propos de KitchenLuxe</Link>
        </div>

        <div className="footer-links">
          <h4>Légal</h4>
          <Link href="/legal/terms">Conditions d'Utilisation</Link>
          <Link href="/legal/privacy">Confidentialité</Link>
          <Link href="/legal/shipping">Livraison & Retours</Link>
        </div>

        <div className="footer-newsletter">
          <h4>Restons Connectés</h4>
          <p>Rejoignez la brigade pour des recettes exclusives et offres privées.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Votre adresse e-mail" />
            <button type="submit" aria-label="Subscribe">
              <Send size={18} />
            </button>
          </form>
          <div className="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><Twitter size={20} /></a>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} KitchenLuxe. Tous droits réservés.</p>
        </div>
      </div>

    </footer>
  );
}
