import { Product } from "./data";

export interface PinData {
    imageUrl: string;
    title: string;
    description: string;
    link: string;
    hashtags: string[];
    productId: string;
    productName: string;
    generatedAt: string;
}

const HASHTAGS_BY_CATEGORY: Record<string, string[]> = {
    "Électroménager": ["#CuisineDesign", "#PetitElectroménager", "#KitchenLife", "#ChefAtHome", "#KitchenLuxe"],
    "Ustensiles": ["#CuisineFacile", "#UstensilesDeCuisine", "#Gastronomie", "#KitchenGoals", "#KitchenLuxe"],
    "Appareils de Précision": ["#RobotPâtissier", "#SageAppliances", "#PrecisionCooking", "#ChefSkills", "#KitchenLuxe"],
};

const DEFAULT_HASHTAGS = ["#CuisineDeLuxe", "#PassionCuisine", "#MaisonDesign", "#GastronomieFrançaise", "#KitchenLuxe"];

export function buildPinData(product: Product, baseUrl: string = "https://kitchenluxe.vercel.app"): PinData {
    const productUrl = `${baseUrl}/products/${product.slug}`;
    const cleanName = product.name.trim();

    // Title: max 100 chars, optimized for Pinterest search
    const title = `🔥 ${cleanName} — ${product.brand} | Haute Qualité Culinaire`.slice(0, 100);

    // Description: max 500 chars, SEO-rich, CTA fort
    const rating = "⭐".repeat(Math.round(product.rating));
    const description = [
        `🍳 ${product.name}`,
        `${rating} ${product.rating} — ${product.reviews.toLocaleString("fr-FR")} avis passionnés`,
        ``,
        getBenefit(product),
        ``,
        `👉 Meilleur prix sur Amazon | Expédition Premium`,
        `📦 Garantie Officielle | Retours Faciles`,
        ``,
        `Équipez votre passion sur kitchenluxe.vercel.app`,
    ].join("\n").slice(0, 500);

    const hashtags = HASHTAGS_BY_CATEGORY[product.category] || DEFAULT_HASHTAGS;

    // Using the real product image directly for Pinterest (avoiding font/svg build issues)
    const productImg = product.image.startsWith("http") ? product.image : `${baseUrl}${product.image}`;

    return {
        imageUrl: productImg,
        title,
        description,
        link: productUrl,
        hashtags,
        productId: product.id,
        productName: product.name,
        generatedAt: new Date().toISOString(),
    };
}

function getBenefit(product: Product): string {
    // Extract first bullet from benefits markdown
    const match = product.benefits?.match(/\*\*(.+?)\*\*[:\s]+(.+)/);
    if (match) return `💎 ${match[2].trim()}`;
    return `💎 L'élite de la catégorie ${product.category}`;
}

export function buildMakeWebhookPayload(pin: PinData) {
    return {
        title: pin.title,
        description: `${pin.description}\n\n${pin.hashtags.join(" ")}`,
        link: pin.link,
        imageUrl: pin.imageUrl,
        board: "KitchenLuxe — Excellence Culinaire",
        productId: pin.productId,
        generatedAt: pin.generatedAt,
    };
}
