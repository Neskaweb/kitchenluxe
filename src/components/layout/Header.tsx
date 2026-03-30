"use client";

import Link from "next/link";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Premium Announcement Bar */}
      <div className="top-bar">
        <p>🔪 Équipez votre Passion | Livraison Express Gratuite sur les Best-Sellers 🔪</p>
      </div>
      
      <header className={`header ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="container header-container">
        <div className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <Link href="/" className="logo">
          KITCHENLUXE
        </Link>

        <nav className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link href="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Catalogue</Link>
          <Link href="/category/appliances" className="nav-link" onClick={() => setIsMenuOpen(false)}>Électro</Link>
          <Link href="/category/cookware" className="nav-link" onClick={() => setIsMenuOpen(false)}>Ustensiles</Link>
          <Link href="/blog" className="nav-link" onClick={() => setIsMenuOpen(false)}>Recettes & Conseils</Link>
        </nav>

        <div className="header-actions">
          <button className="icon-btn" aria-label="Search">
            <Search size={22} color="var(--color-black)" />
          </button>
          <button className="icon-btn" aria-label="Cart">
            <ShoppingBag size={22} color="var(--color-black)" />
          </button>
        </div>
      </div>
      </header>
    </>
  );
}
