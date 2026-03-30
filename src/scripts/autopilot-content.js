const fs = require('fs');
const path = require('path');
const { generatePinterestImage } = require('./pinterest-image-gen.js');

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');
const POSTS_FILE = path.join(__dirname, '../data/posts.json');

// --- Curated Catalog of Guaranteed High-Converting Amazon Real Kitchen Products ---
const REAL_PRODUCTS = [
    {
        name: "Sage Barista Express Espresso Machine",
        brand: "Sage",
        category: "Électroménager",
        asin: "B00CI32S9K",
        description: "L'expérience barista ultime à la maison. Un broyeur intégré pour un café fraîchement moulu et une mousse de lait soyeuse.",
        keywords: ["machine espresso", "barista", "café de luxe", "sage appliances"],
        price: 629.00
    },
    {
        name: "Ninja Foodi MAX Dual Zone Air Fryer",
        brand: "Ninja",
        category: "Électroménager",
        asin: "B089SYG6CC",
        description: "La friteuse sans huile révolutionnaire avec deux zones de cuisson indépendantes. Cuisinez deux plats différemment en même temps.",
        keywords: ["air fryer", "ninja foodi", "cuisine saine", "friteuse sans huile"],
        price: 229.00
    },
    {
        name: "KitchenAid Artisan Stand Mixer 4.8L",
        brand: "KitchenAid",
        category: "Appareils de Précision",
        asin: "B00004SGFW",
        description: "L'icône de la cuisine. Robuste, stable et durable, ce robot pâtissier est le compagnon indispensable de toutes vos créations.",
        keywords: ["robot pâtissier", "kitchenaid artisan", "pâtisserie", "robot de cuisine"],
        price: 749.00
    },
    {
        name: "Le Creuset Signature Cast Iron Casserole",
        brand: "Le Creuset",
        category: "Ustensiles de Chef",
        asin: "B00V86W64M",
        description: "La cocotte en fonte émaillée française légendaire. Parfaite pour les ragoûts, les rôtis et les cuissons lentes.",
        keywords: ["cocotte en fonte", "le creuset", "cuisine traditionnelle", "mijoté"],
        price: 319.00
    },
    {
        name: "Zwilling Pro Chef's Knife 20cm",
        brand: "Zwilling",
        category: "Coutellerie",
        asin: "B00004RFMT",
        description: "L'excellence de la coutellerie allemande. Forgé à partir d'une seule pièce d'acier spécial pour un tranchant durable.",
        keywords: ["couteau de chef", "zwilling pro", "coutellerie pro", "couteau forgé"],
        price: 109.00
    },
    {
        name: "Magimix Cook Expert Robot Cuiseur",
        brand: "Magimix",
        category: "Électroménager",
        asin: "B01B7M9R9S",
        description: "Le robot cuiseur multifonction ultra-complet. Cuit, mélange, hache et pétrit pour des repas gastronomiques rapides.",
        keywords: ["robot cuiseur", "magimix cook expert", "cuisine gourmande", "robot multifonction"],
        price: 1199.00
    },
    {
        name: "Wüsthof Classic Ikon Paring Knife",
        brand: "Wüsthof",
        category: "Coutellerie",
        asin: "B000X97G3A",
        description: "Le couteau d'office de précision. Parfait pour peler, parer et décorer vos fruits et légumes avec une agilité maximale.",
        keywords: ["couteau d'office", "wüsthof", "ikon", "coutellerie de précision"],
        price: 79.00
    },
    {
        name: "Staub Round Cocotte 24cm",
        brand: "Staub",
        category: "Ustensiles de Chef",
        asin: "B00063539C",
        description: "La cocotte préférée des chefs avec son couvercle à picots pour un arrosage continu. Saveurs préservées garanties.",
        keywords: ["cocotte staub", "fonte émaillée", "mijoté chef", "cuisine française"],
        price: 249.00
    }
];

const IMAGES = [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594910413521-17f167666993?q=80&w=1974&auto=format&fit=crop'
];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateNewProduct() {
    const rawProd = getRandom(REAL_PRODUCTS);
    
    const uniqueSuffix = Math.floor(Math.random() * 10000);
    const id = `kl_p_${Date.now()}_${uniqueSuffix}`;
    const slug = `${rawProd.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-')}-${uniqueSuffix}`.replace(/(^-|-$)/g, '');

    return {
        id: id,
        asin: rawProd.asin,
        name: rawProd.name,
        slug: slug,
        description: rawProd.description,
        benefits: `### Excellence & Performance\n- **Qualité Professionnelle**: Une conception rigoureuse pour des résultats dignes d'un chef.\n- **Design Intemporel**: Un ajout esthétique et prestigieux pour votre cuisine.\n- **Durabilité Garantie**: Investissez dans un outil qui vous accompagnera des années.`,
        price: rawProd.price,
        category: rawProd.category,
        brand: rawProd.brand,
        image: getRandom(IMAGES),
        rating: Number((Math.random() * (5.0 - 4.7) + 4.7).toFixed(1)),
        reviews: Math.floor(Math.random() * 1500) + 300,
        features: [...rawProd.keywords.slice(0, 2), "Élite Culinaire", "Best-Seller"],
        seoTags: [...rawProd.keywords, "cuisine", "gourmet", "luxe"]
    };
}

function generateSEOArticleForProduct(product) {
    const styles = [
        {
            type: 'GUIDE',
            title: `Guide Expert : Comment maîtriser le ${product.name} comme un Chef`,
            intro: `Le **${product.name}** est bien plus qu'un simple appareil, c'est le secret d'une cuisine réussie. Découvrez comment en exploiter tout le potentiel.`,
            outro: `En suivant ces techniques, vous transformerez chaque repas en une expérience gastronomique.`
        },
        {
            type: 'DUEL',
            title: `Duel Culinaire : ${product.name} vs Les équipements standards`,
            intro: `${product.brand} promet l'excellence avec le **${product.name}**. Mais justifie-t-il son statut de leader face à la concurrence ?`,
            outro: `Verdict : Pour les passionnés exigeants, le ${product.name} est l'investissement ultime sans aucun compromis.`
        },
        {
            type: 'RECETTE',
            title: `Top Astuces : Optimisez vos créations avec le ${product.name}`,
            intro: `Vous venez d'acquérir le **${product.name}** ? Voici nos secrets d'initiés pour une utilisation parfaite au quotidien.`,
            outro: `Une performance inégalée pour une cuisine qui vous ressemble.`
        }
    ];

    const style = getRandom(styles);
    const title = style.title;
    const slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const metaTitle = `${title} | KitchenLuxe Excellence`;
    const metaDescription = `${style.intro.slice(0, 150)}... Découvrez notre analyse d'expert.`;
    const keywords = [product.name, product.brand, product.category, "avis chef", "cuisine pro"].join(', ');

    const content = `
# ${title}

${style.intro}

## Pourquoi KitchenLuxe recommande ${product.brand} ?

Dans l'univers de la haute cuisine, la précision est reine. Le **${product.name}** incarne cet idéal. En tant que fleuron de la gamme **${product.category}**, il redéfinit les standards de performance.

### Les 3 piliers de son succès :

- **Précision Absolue** : Une technologie de pointe pour un contrôle total.
- **Matériaux Nobles** : Une robustesse à toute épreuve et une finition premium.
- **Ergonomie Intuitive** : Pensé pour faciliter la créativité Culinaire.

> "L'excellence en cuisine commence avec l'excellence de vos outils. On ne triche pas avec la qualité."

## Conseils d'experts KitchenLuxe

Utilisez le **${product.name}** avec audace et laissez l'inspiration guider vos prochaines créations. 

${style.outro}

👉 **[Découvrir les avis et le meilleur prix pour le ${product.name} sur Amazon](/products/${product.slug})**

---
*Optimisé (Style: ${style.type}). Mots-clés : ${keywords}*
`;

    return {
        id: `kl-auto-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        title,
        slug,
        metaTitle,
        metaDescription,
        keywords,
        excerpt: style.intro,
        content,
        category: product.category,
        author: "Chef Thomas - Expert KitchenLuxe",
        publishedDate: new Date().toISOString().split('T')[0],
        image: product.image,
        relatedProductId: product.id,
        isAutopilot: true,
        style: style.type,
        pinterestImages: []
    };
}

async function runAutopilot() {
    console.log("🚀 [KitchenLuxe Mega-Scale Autopilot] Démarrage...");
    
    const productsPath = PRODUCTS_FILE;
    const postsPath = POSTS_FILE;
    
    let products = [];
    if (fs.existsSync(productsPath)) {
        products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    }
    
    let posts = [];
    if (fs.existsSync(postsPath)) {
        posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    }

    const NUM_PRODUCTS = 15;
    const PINS_PER_POST = 5;

    for (let i = 0; i < NUM_PRODUCTS; i++) {
        const newProduct = generateNewProduct();
        products.unshift(newProduct);
        console.log(`📌 Produit Ajouté : ${newProduct.name} (${newProduct.asin})`);

        const newPost = generateSEOArticleForProduct(newProduct);

        console.log(`🎨 Génération de ${PINS_PER_POST} épingles Pinterest pour l'article...`);
        for (let j = 1; j <= PINS_PER_POST; j++) {
            const uniquePinSlug = `${newPost.slug}-kl-var-${j}`;
            const pinPath = await generatePinterestImage(uniquePinSlug, newPost.image, newPost.title);
            
            if (pinPath) {
                newPost.pinterestImages.push(pinPath);
                if (j === 1) {
                    newPost.pinterestImage = pinPath;
                }
            }
        }

        posts.unshift(newPost);
        console.log(`✅ Article "${newPost.title}" sauvegardé avec ses ${newPost.pinterestImages.length} épingles.`);
    }

    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
    console.log(`🌟 Fin du processus Autopilot KitchenLuxe. 2 produits et 2 articles d'exception générés !`);
}

runAutopilot().catch(console.error);
