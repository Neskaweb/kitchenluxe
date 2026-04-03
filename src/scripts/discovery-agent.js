const fs = require('fs');
const path = require('path');

const DISCOVERED_FILE = path.join(__dirname, '../data/discovered-products.json');

// Un "Fallback Catalog" simulant la réponse d'une API Amazon ou d'un Scraper
// Dans le futur, ceci peut être remplacé par un fetch() réel vers l'API Amazon Partenaires
const TRENDING_KITCHEN_PRODUCTS_MOCK = [
    {
        name: "De'Longhi Magnifica S Smart",
        brand: "De'Longhi",
        category: "Électroménager",
        asin: "B0B8XMJLVK",
        description: "Machine à café à grains automatique avec broyeur. Préparation de boissons caféinées parfaites avec mousse de lait ajustable.",
        keywords: ["machine à café grains", "delonghi", "espresso broyeur", "café frais"],
        price: 389.00
    },
    {
        name: "Marcato Atlas 150 Machine à Pâtes",
        brand: "Marcato",
        category: "Ustensiles de Chef",
        asin: "B0009U5OSO",
        description: "L'authentique machine à pâtes italienne. Fabriquez vos propres fettuccine, tagliolini et lasagnes avec une facilité déconcertante.",
        keywords: ["machine à pâtes", "pasta maker", "cuisine italienne", "fait maison"],
        price: 74.90
    },
    {
        name: "Vitamix Explorian E310",
        brand: "Vitamix",
        category: "Appareils de Précision",
        asin: "B07CX95VRT",
        description: "Le blender haute performance des professionnels. Broie tous les ingrédients pour des smoothies, soupes chaudes et purées d'oléagineux parfaites.",
        keywords: ["blender pro", "vitamix", "smoothie maker", "mixeur puissant"],
        price: 449.00
    },
    {
        name: "Ooni Koda 12 Four à Pizza à Gaz",
        brand: "Ooni",
        category: "Électroménager",
        asin: "B07NDXFDXX",
        description: "Le four à pizza portatif ultime. Atteint 500°C en 15 minutes pour cuire d'authentiques pizzas napolitaines en 60 secondes.",
        keywords: ["four à pizza", "ooni koda", "pizza napolitaine", "cuisine extérieure"],
        price: 399.00
    },
    {
        name: "Global G-2 Couteau de Chef 20cm",
        brand: "Global",
        category: "Coutellerie",
        asin: "B00005OL44",
        description: "Le couteau japonais légendaire, léger et parfaitement équilibré. Apprécié par les chefs pour son design monobloc et sa lame tranchante comme un rasoir.",
        keywords: ["couteau global", "couteau japonais", "chef knife", "acier trempé"],
        price: 115.00
    },
    {
        name: "SMEG Bouilloire Années 50",
        brand: "SMEG",
        category: "Électroménager",
        asin: "B00U3I01C8",
        description: "Une bouilloire iconique au design vintage italien. Alliance parfaite entre esthétique rétro et chauffe rapide.",
        keywords: ["bouilloire smeg", "design vintage", "électroménager rétro", "thé"],
        price: 169.00
    }
];

// Fonction simulant le "Scraping" d'Amazon Best Sellers
async function runDiscoveryAgent() {
    console.log("🕵️ [Discovery Agent] Démarrage... Recherche des tendances Amazon Actuelles...");
    
    // Simulate API Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Read Existing Database
    let discoveredProducts = [];
    if (fs.existsSync(DISCOVERED_FILE)) {
        try {
            discoveredProducts = JSON.parse(fs.readFileSync(DISCOVERED_FILE, 'utf8'));
        } catch (e) {
            console.error("Erreur de parsing:", e);
        }
    }

    // "Scrape" 2 random trending products from out massive mock catalog
    const shuffled = TRENDING_KITCHEN_PRODUCTS_MOCK.sort(() => 0.5 - Math.random());
    const newFinds = shuffled.slice(0, 2);

    let newlyAdded = 0;

    for (const product of newFinds) {
        // Obfuscate / Simulate adding product details
        const isAlreadyTracked = discoveredProducts.find(p => p.asin === product.asin);
        
        if (!isAlreadyTracked) {
            console.log(`✨ Nouveau Best-Seller trouvé : ${product.name} (${product.category})`);
            discoveredProducts.push({
                ...product,
                discoveredAt: new Date().toISOString(),
                status: 'pending' // pending = found but not written about yet
            });
            newlyAdded++;
        }
    }

    if (newlyAdded > 0) {
        fs.writeFileSync(DISCOVERED_FILE, JSON.stringify(discoveredProducts, null, 2));
        console.log(`💾 Scrape terminé. ${newlyAdded} nouveaux produits ajoutés à la file d'attente (total: ${discoveredProducts.length}).`);
    } else {
        console.log("🤷‍♂️ Scrape terminé. Aucun nouveau produit détecté aujourd'hui.");
    }
}

runDiscoveryAgent().catch(console.error);
