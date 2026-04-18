import { NextResponse } from 'next/server';
import { readJSONFile, writeJSONFile } from '@/lib/github-storage';
import { generateArticleWithClaude, pickRandomImage } from '@/lib/claude-generator';
import { updateMemory, pickStyle, DEFAULT_MEMORY, AgentMemory } from '@/lib/agent-memory';

const PRODUCT_CATALOG = [
  { name: 'KitchenAid Artisan Stand Mixer 4.8L', brand: 'KitchenAid', category: 'Appareils de Précision', asin: 'B00004SGFW', price: 749, description: "L'icône de la cuisine. Robuste, stable et durable, compagnon indispensable de toutes vos créations.", keywords: ['robot pâtissier', 'kitchenaid artisan', 'pâtisserie', 'robot cuisine'] },
  { name: 'Sage Barista Express Espresso Machine', brand: 'Sage', category: 'Électroménager', asin: 'B00CI32S9K', price: 629, description: "L'expérience barista ultime à la maison avec broyeur intégré et mousse de lait soyeuse.", keywords: ['machine espresso', 'barista', 'café de luxe', 'sage appliances'] },
  { name: 'Ninja Foodi MAX Dual Zone Air Fryer', brand: 'Ninja', category: 'Électroménager', asin: 'B089SYG6CC', price: 229, description: 'La friteuse sans huile révolutionnaire avec deux zones de cuisson indépendantes.', keywords: ['air fryer', 'ninja foodi', 'cuisine saine', 'friteuse sans huile'] },
  { name: 'Le Creuset Signature Cocotte Ronde 24cm', brand: 'Le Creuset', category: 'Ustensiles de Chef', asin: 'B00V86W64M', price: 319, description: 'La cocotte en fonte émaillée française légendaire pour les ragoûts et cuissons lentes.', keywords: ['cocotte en fonte', 'le creuset', 'cuisine traditionnelle', 'mijoté'] },
  { name: 'Zwilling Pro Couteau de Chef 20cm', brand: 'Zwilling', category: 'Coutellerie', asin: 'B00004RFMT', price: 109, description: "L'excellence de la coutellerie allemande, forgée d'une seule pièce d'acier spécial.", keywords: ['couteau de chef', 'zwilling pro', 'coutellerie pro', 'couteau forgé'] },
  { name: 'Magimix Cook Expert Robot Cuiseur', brand: 'Magimix', category: 'Électroménager', asin: 'B01B7M9R9S', price: 1199, description: 'Le robot cuiseur multifonction ultra-complet. Cuit, mélange, hache et pétrit.', keywords: ['robot cuiseur', 'magimix cook expert', 'cuisine gourmande', 'robot multifonction'] },
  { name: 'Staub Cocotte Ronde 24cm Noir', brand: 'Staub', category: 'Ustensiles de Chef', asin: 'B00063539C', price: 249, description: 'La cocotte préférée des chefs avec couvercle à picots pour un arrosage continu.', keywords: ['cocotte staub', 'fonte émaillée', 'mijoté chef', 'cuisine française'] },
  { name: 'Breville Barista Pro Machine à Espresso', brand: 'Breville', category: 'Électroménager', asin: 'B07K1CHMFN', price: 799, description: 'Café de spécialité à la maison avec extraction thermale précise et broyeur intégré.', keywords: ['machine café', 'breville', 'expresso pro', 'café barista'] },
  { name: 'Vitamix E310 Blender Professionnel', brand: 'Vitamix', category: 'Appareils de Précision', asin: 'B07DQJ5D1Y', price: 449, description: 'Le blender professionnel qui transforme chaque ingrédient en texture parfaite.', keywords: ['blender professionnel', 'vitamix', 'smoothie', 'mixeur haute puissance'] },
  { name: 'De Buyer Poêle Minéral B 28cm', brand: 'De Buyer', category: 'Ustensiles de Chef', asin: 'B000IYIPYA', price: 69, description: "La poêle en fer des chefs professionnels. Antiadhérence naturelle qui s'améliore avec le temps.", keywords: ['poêle en fer', 'de buyer', 'minéral b', 'poêle professionnelle'] },
];

export async function GET(req: Request) {
  // Vercel injects Authorization: Bearer {CRON_SECRET} automatically
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // 1. Fetch current data from GitHub (source of truth in production)
    const [postsResult, productsResult, clicksResult, memoryResult] = await Promise.allSettled([
      readJSONFile<any[]>('src/data/posts.json'),
      readJSONFile<any[]>('src/data/products.json'),
      readJSONFile<{ byProduct?: Record<string, number> }>('src/data/clicks.json'),
      readJSONFile<AgentMemory>('src/data/agent-memory.json'),
    ]);

    const posts = postsResult.status === 'fulfilled' ? postsResult.value.data : [];
    const postsSha = postsResult.status === 'fulfilled' ? postsResult.value.sha : undefined;
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data : [];
    const productsSha = productsResult.status === 'fulfilled' ? productsResult.value.sha : undefined;
    const clicksByProduct = clicksResult.status === 'fulfilled' ? (clicksResult.value.data.byProduct || {}) : {};
    const memory = memoryResult.status === 'fulfilled' ? memoryResult.value.data : { ...DEFAULT_MEMORY };
    const memorySha = memoryResult.status === 'fulfilled' ? memoryResult.value.sha : undefined;

    // 2. Update agent memory from real click data (learning loop)
    const updatedMemory = updateMemory(memory, posts, clicksByProduct);

    // 3. Pick style (epsilon-greedy) and product
    const style = pickStyle(updatedMemory);
    const rawProduct = PRODUCT_CATALOG[Math.floor(Math.random() * PRODUCT_CATALOG.length)];
    const uniqueSuffix = Date.now();
    const image = pickRandomImage();

    const productSlug = `${rawProduct.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')}-${uniqueSuffix % 100000}`;

    const newProduct = {
      id: `kl_p_${uniqueSuffix}`,
      asin: rawProduct.asin,
      name: rawProduct.name,
      slug: productSlug,
      description: rawProduct.description,
      price: rawProduct.price,
      category: rawProduct.category,
      brand: rawProduct.brand,
      image,
      rating: Number((Math.random() * 0.3 + 4.7).toFixed(1)),
      reviews: Math.floor(Math.random() * 1500) + 300,
      features: [...rawProduct.keywords.slice(0, 2), 'Élite Culinaire', 'Best-Seller'],
      seoTags: [...rawProduct.keywords, 'cuisine', 'gourmet', 'luxe'],
      benefits: `### Excellence & Performance\n- **Qualité Professionnelle**: Pour des résultats dignes d'un chef.\n- **Design Intemporel**: Un ajout esthétique et prestigieux.\n- **Durabilité Garantie**: Pour une cuisine qui vous ressemble.`,
    };

    // 4. Generate article with Claude AI (real LLM, not templates)
    const generated = await generateArticleWithClaude(
      { ...newProduct, keywords: rawProduct.keywords },
      style
    );

    const newPost = {
      id: `kl-ai-${uniqueSuffix}`,
      ...generated,
      category: rawProduct.category,
      author: 'Chef Thomas - Expert KitchenLuxe',
      publishedDate: new Date().toISOString().split('T')[0],
      image,
      relatedProductId: newProduct.id,
      isAutopilot: true,
      style,
      pinterestImages: [],
    };

    // 5. Update memory history
    updatedMemory.totalRuns = (updatedMemory.totalRuns || 0) + 1;
    updatedMemory.history = [
      { date: new Date().toISOString(), style, title: newPost.title, clicks: 0 },
      ...(updatedMemory.history || []).slice(0, 49),
    ];

    // 6. Commit all changes to GitHub (triggers Vercel auto-deploy)
    const commitMsg = `🤖 Autopilot AI: ${newPost.title.slice(0, 60)}`;
    await writeJSONFile('src/data/products.json', [newProduct, ...products], productsSha, commitMsg);
    await new Promise(r => setTimeout(r, 600));
    await writeJSONFile('src/data/posts.json', [newPost, ...posts], postsSha, commitMsg);
    await new Promise(r => setTimeout(r, 600));
    await writeJSONFile('src/data/agent-memory.json', updatedMemory, memorySha, '🧠 Agent memory updated');

    // 7. Notify Pinterest via Make.com webhook
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          description: newPost.metaDescription,
          link: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'kitchenluxe.vercel.app'}/blog/${newPost.slug}`,
          imageUrl: image,
          hashtags: '#CuisineLuxe #KitchenLuxe #CuisinePro #RecetteFrancaise',
        }),
      }).catch(e => console.warn('Pinterest webhook failed:', e.message));
    }

    return NextResponse.json({
      success: true,
      article: newPost.title,
      style,
      winningStyle: updatedMemory.winningStyle,
      topCategory: updatedMemory.topCategory,
      totalRuns: updatedMemory.totalRuns,
    });

  } catch (error: any) {
    console.error('Autopilot cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
