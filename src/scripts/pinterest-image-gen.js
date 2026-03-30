const { Jimp, loadFont, HorizontalAlign, VerticalAlign } = require('jimp');
const fs = require('fs');
const path = require('path');

// Chemin où sauvegarder (pour que ce soit servit par Next.js)
const OUTPUT_DIR = path.join(__dirname, '../../public/pins');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Génère une "Affiche" Pinterest Ultime pour KitchenLuxe (1000x1500)
 */
async function generatePinterestImage(postSlug, productImageUrl, title) {
    console.log(`🎨 Génération du visuel Pinterest KitchenLuxe pour: ${postSlug}`);
    
    try {
        const width = 1000;
        const height = 1500;
        
        // 1. Un fond élégant aux tons Cuisine/Luxe (Acier, Cuivre, Ardoise, Noyer)
        const kitchenLuxuryColors = [
            0x1A1A1AFF, // Noir Charbon
            0x2D2D2DFF, // Ardoise foncée
            0x3E2723FF, // Noyer sombre
            0x2C3E50FF, // Bleu Acier
            0x1C1C1CFF, // Anthracite
            0x3D1F16FF, // Cuivre oxydé
            0x1F1F1FFF  // Gunmetal
        ];
        const bgColor = kitchenLuxuryColors[Math.floor(Math.random() * kitchenLuxuryColors.length)];
        const image = new Jimp({ width, height, color: bgColor });
        
        const layouts = [
            { imgY: 0, imgH: 1000, textY: 1050, textH: 300, ctaY: 1380 },
            { imgY: 0, imgH: 850, textY: 900, textH: 400, ctaY: 1350 },
            { imgY: 500, imgH: 1000, textY: 50, textH: 350, ctaY: 420 }
        ];
        const layout = layouts[Math.floor(Math.random() * layouts.length)];

        // 2. Chercher une image culinaire inspirante
        const randomSeed = Math.floor(Math.random() * 999999);
        const categories = ["kitchen,design,luxury", "chef,cooking,food", "coffee,espresso,barista", "steak,grill,chef", "minimalist,kitchen,gadget"];
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const uniqueImageSource = `https://loremflickr.com/1000/${layout.imgH}/${randomCat}?random=${randomSeed}`;

        let productImg;
        try {
            productImg = await Jimp.read(uniqueImageSource);
        } catch (e) {
            console.warn(`L'URL de loremflickr n'est pas accessible, on tente l'image produit.`);
            try {
                productImg = await Jimp.read(productImageUrl);
            } catch (e2) {
                productImg = await Jimp.read('https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1974&auto=format&fit=crop');
            }
        }
        
        productImg.cover({ w: 1000, h: layout.imgH });
        image.composite(productImg, 0, layout.imgY);

        // 3. Typographie d'Excellence
        const { SANS_64_WHITE, SANS_32_WHITE } = require('jimp/fonts');
        const font = await loadFont(SANS_64_WHITE);
        const fontSmall = await loadFont(SANS_32_WHITE);
        
        image.print({
            font, 
            x: 0, 
            y: layout.textY, 
            text: {
                text: title.toUpperCase(),
                alignmentX: HorizontalAlign.CENTER,
                alignmentY: VerticalAlign.MIDDLE
            },
            maxWidth: width,
            maxHeight: layout.textH
        });

        const catchphrases = [
            "🏆 CUISINEZ COMME UN CHEF 🏆",
            "👉 DÉCOUVREZ L'USTENSILE ULTIME",
            "🔪 LE SECRET DE LA PRÉCISION 🔪",
            "☕ LE MEILLEUR CAFÉ CHEZ VOUS",
            "🔥 TEST COMPLET : TOP OU FLOP ? 🔥",
            "✨ REDÉFINISSEZ VOTRE CUISINE ✨"
        ];
        const ctaText = catchphrases[Math.floor(Math.random() * catchphrases.length)];

        image.print({
            font: fontSmall,
            x: 0,
            y: layout.ctaY,
            text: {
                text: ctaText,
                alignmentX: HorizontalAlign.CENTER,
                alignmentY: VerticalAlign.MIDDLE
            },
            maxWidth: width
        });

        const finalPath = path.join(OUTPUT_DIR, `${postSlug}.jpg`);
        await image.write(finalPath);
        
        console.log(`✅ Épingle KitchenLuxe générée : /pins/${postSlug}.jpg`);
        return `/pins/${postSlug}.jpg`;

    } catch (error) {
        console.error("❌ Erreur image Pinterest KitchenLuxe:", error);
        return null;
    }
}

if (require.main === module) {
    generatePinterestImage(
        'test-viral-kitchenluxe', 
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop', 
        "Les 3 Accessoires Indispensables Pour Une Cuisine Professionnelle"
    );
}

module.exports = { generatePinterestImage };
