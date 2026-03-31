import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { getFeaturedProducts } from "@/lib/data";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  const featuredProducts = getFeaturedProducts();

  return (
    <>
      <Header />
      <main>
        {/* Hero Section - CINEMATIC WAOUH EFFECT */}
        <section className="hero-video-container reveal">
          <div className="hero-animated-bg">
            <div className="glow-orb orb-1"></div>
            <div className="glow-orb orb-2"></div>
            <div className="glow-orb orb-3"></div>
          </div>
          <div className="hero-overlay"></div>
          
          <div className="container hero-content">
            <span className="hero-subtitle reveal-delay-1">L&apos;Excellence Culinaire</span>
            <h1 className="reveal-delay-2">KitchenLuxe<span>™</span><br />L&apos;Art de la Cuisine</h1>
            <p className="reveal-delay-3">Équipez votre passion avec les outils des plus grands chefs. La précision et le design au service de vos créations.</p>
            <div className="hero-cta reveal-delay-3">
              <Link href="/products" className="btn btn-accent">Collection Chef</Link>
              <Link href="/blog" className="btn btn-outline-white">Inspiration</Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">Maîtrisez Votre Art</h2>
            <div className="category-grid">
              <Link href="/category/appliances" className="category-card">
                <div className="category-image appliances" style={{backgroundImage: "url('https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=2070&auto=format&fit=crop')"}}></div>
                <h3>Électroménager</h3>
                <span className="explore-link">Découvrir <ArrowRight size={14} /></span>
              </Link>
              <Link href="/category/cookware" className="category-card">
                <div className="category-image cookware" style={{backgroundImage: "url('https://images.unsplash.com/photo-1584990344319-72ed128bca68?q=80&w=1974&auto=format&fit=crop')"}}></div>
                <h3>Ustensiles</h3>
                <span className="explore-link">Découvrir <ArrowRight size={14} /></span>
              </Link>
              <Link href="/category/knives" className="category-card">
                <div className="category-image knives" style={{backgroundImage: "url('https://images.unsplash.com/photo-1593611664164-5d44730c5982?q=80&w=2070&auto=format&fit=crop')"}}></div>
                <h3>Coutellerie</h3>
                <span className="explore-link">Découvrir <ArrowRight size={14} /></span>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section bg-cream">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Nos Best-Sellers</h2>
              <Link href="/products" className="view-all">Tout voir <ArrowRight size={16} /></Link>
            </div>
            <div className="product-grid">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="section values-section reveal">
          <div className="container values-grid">
            <div className="value-item">
              <div className="value-icon"><Star size={24} /></div>
              <h3>Performance Pro</h3>
              <p>Des appareils testés et approuvés par les chefs étoilés.</p>
            </div>
            <div className="value-item">
              <div className="value-icon"><Heart size={24} /></div>
              <h3>Design Intemporel</h3>
              <p>L&apos;élégance de l&apos;acier et du cuivre dans votre cuisine.</p>
            </div>
            <div className="value-item">
              <div className="value-icon"><ShieldCheck size={24} /></div>
              <h3>Qualité Durable</h3>
              <p>Des matériaux nobles conçus pour durer toute une vie.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials reveal">
          <div className="container">
            <h2>L&apos;Excellence Prouvée</h2>
            <div className="testimonials-grid">
              <div className="testim-card">
                <div className="stars">★★★★★</div>
                <p>&quot;Ma machine à expresso KitchenLuxe a transformé mes matins. Le design est sublime et la qualité du café est digne d&apos;un barista italien.&quot;</p>
                <div className="testim-author">— Marc A.</div>
              </div>
              <div className="testim-card">
                <div className="stars">★★★★★</div>
                <p>&quot;Les couteaux en acier Damas sont une révélation. Précision, équilibre et beauté... Je ne peux plus cuisiner sans eux.&quot;</p>
                <div className="testim-author">— Elena K.</div>
              </div>
              <div className="testim-card">
                <div className="stars">★★★★★</div>
                <p>&quot;Un service impeccable et des produits d&apos;exception. Ma cuisine est passée dans une autre dimension grâce à KitchenLuxe.&quot;</p>
                <div className="testim-author">— Jean-Pierre D.</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
