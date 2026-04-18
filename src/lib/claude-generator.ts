import Anthropic from '@anthropic-ai/sdk';

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1974&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1594910413521-17f167666993?q=80&w=1974&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2013&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612392062631-94b4c89bfcd6?q=80&w=2070&auto=format&fit=crop',
];

const STYLE_PROMPTS = {
  GUIDE: (name: string, brand: string) =>
    `un guide expert sur comment utiliser le ${name} de ${brand} pour cuisiner comme un professionnel. Inclus des techniques, conseils d'entretien et 2 exemples de recettes adaptées.`,
  DUEL: (name: string, brand: string) =>
    `une comparaison honnête et détaillée entre le ${name} de ${brand} et ses 2 principaux concurrents. Inclus un tableau comparatif et un verdict tranché.`,
  RECETTE: (name: string, brand: string) =>
    `3 recettes exclusives et astuces pratiques pour maximiser le potentiel du ${name} de ${brand}. Focus sur les résultats concrets et la praticité au quotidien.`,
};

export interface ProductInput {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  slug: string;
  image: string;
  asin: string;
  keywords: string[];
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  excerpt: string;
  content: string;
}

export async function generateArticleWithClaude(
  product: ProductInput,
  style: 'GUIDE' | 'DUEL' | 'RECETTE'
): Promise<GeneratedArticle> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system:
      'Tu es un expert culinaire français et blogueur spécialisé en cuisine de luxe. Tu écris des articles SEO engageants, naturels et informatifs en français. Ne mentionne jamais que le contenu est généré par IA.',
    messages: [
      {
        role: 'user',
        content: `Écris un article SEO de 900 mots en français sur ${STYLE_PROMPTS[style](product.name, product.brand)}.

Produit: ${product.name} par ${product.brand} — ${product.price}€
Description: ${product.description}
Catégorie: ${product.category}

FORMAT OBLIGATOIRE (respecte exactement):
# [Titre accrocheur avec ${product.name} — max 65 caractères]

[Introduction 120 mots — commence par une question ou une anecdote engageante]

## [Titre section 1]
[150 mots avec conseils concrets]

## [Titre section 2]
[150 mots avec exemples pratiques]

## Notre Verdict Expert
[150 mots — notation /5, pour qui c'est fait, verdict final]

## Questions Fréquentes

**Q: [question fréquente naturelle]**
R: [réponse courte et utile]

**Q: [autre question]**
R: [réponse courte]

## Conclusion
[80 mots — appel à l'action naturel]

👉 **[Voir le prix du ${product.name} sur Amazon →](/products/${product.slug})**

Mots-clés à intégrer naturellement: ${product.keywords.join(', ')}, avis, test 2026, meilleur prix`,
      },
    ],
  });

  const content = message.content[0].type === 'text' ? message.content[0].text : '';

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const rawTitle = titleMatch ? titleMatch[1].trim() : `${product.name} — Avis Expert 2026`;

  const firstPara = content
    .split('\n')
    .find(l => l.trim().length > 60 && !l.startsWith('#') && !l.startsWith('*'))
    ?.replace(/[*#[\]]/g, '')
    .trim() || '';

  const slug = rawTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);

  return {
    title: rawTitle,
    slug,
    metaTitle: `${rawTitle} | KitchenLuxe`,
    metaDescription: (firstPara.slice(0, 152) + (firstPara.length > 152 ? '...' : '')),
    keywords: `${product.name}, ${product.brand}, ${product.category}, ${product.keywords.slice(0, 3).join(', ')}, avis 2026`,
    excerpt: firstPara.slice(0, 200),
    content,
  };
}

export function pickRandomImage(): string {
  return UNSPLASH_IMAGES[Math.floor(Math.random() * UNSPLASH_IMAGES.length)];
}
