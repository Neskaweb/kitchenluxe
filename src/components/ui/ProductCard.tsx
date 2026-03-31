import Link from "next/link";
import { Product } from "@/lib/data";
import { getAffiliateLink } from "@/lib/affiliate";
import { Star } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card glass-card">
      <div className="image-container">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={400}
            className="product-image"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </Link>
        <span className="category-tag">{product.category}</span>
      </div>

      <div className="card-details">
        <div className="rating">
          <Star size={14} fill="var(--color-accent)" color="var(--color-accent)" />
          <span>{product.rating} ({product.reviews})</span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>

        <p className="price" style={{ color: 'var(--color-accent)' }}>{product.price.toFixed(2)}€</p>

        <Link href={`/products/${product.slug}`} className="btn-view">
          Excellence Profiler
        </Link>
      </div>
    </div>
  );
}
