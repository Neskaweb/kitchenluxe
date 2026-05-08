import { Product } from "./data";

export interface PinQuality {
  score: number;
  passed: boolean;
  minScore: number;
  warnings: string[];
  strengths: string[];
}

export interface PinData {
  imageUrl: string;
  title: string;
  description: string;
  altText: string;
  link: string;
  hashtags: string[];
  productId: string;
  productName: string;
  productSlug: string;
  productBrand: string;
  categoryLabel: string;
  visualType: "generated_vertical_product";
  quality: PinQuality;
  generatedAt: string;
}

export interface PinterestCategoryProfile {
  label: string;
  useCase: string;
  accent: string;
  deep: string;
  hashtags: string[];
}

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://kitchenluxe.vercel.app").replace(/\/+$/, "");
const DEFAULT_MIN_QUALITY_SCORE = 85;
const DESCRIPTION_MAX_LENGTH = 500;
const TITLE_MAX_LENGTH = 100;
const MOJIBAKE_RE = /[\u00c2\u00c3\ufffd]|\u00e2[^\u0000-\u007f]/;
const PROMO_RE = /\b(promo|soldes?|reduction|meilleur prix|expedition premium|garantie officielle)\b|https?:\/\/|www\.|amazon/i;

const CATEGORY_PROFILES: Record<string, PinterestCategoryProfile> = {
  cookware: {
    label: "Ustensiles de chef",
    useCase: "cuissons lentes, plats familiaux et gestes de chef",
    accent: "#b4532a",
    deep: "#2b2118",
    hashtags: ["#CuisinePremium", "#UstensilesDeCuisine", "#CuisineMaison", "#KitchenLuxe"],
  },
  appliances: {
    label: "Electromenager premium",
    useCase: "preparations rapides, recettes regulieres et cuisine du quotidien",
    accent: "#0f766e",
    deep: "#132d2c",
    hashtags: ["#CuisineDesign", "#Electromenager", "#KitchenGoals", "#KitchenLuxe"],
  },
  precision: {
    label: "Precision culinaire",
    useCase: "patisserie, cafe, pesees et resultats reguliers",
    accent: "#7c3aed",
    deep: "#231a35",
    hashtags: ["#PrecisionCooking", "#PatisserieMaison", "#ChefAtHome", "#KitchenLuxe"],
  },
  knives: {
    label: "Coutellerie",
    useCase: "decoupes nettes, preparation precise et gestes quotidiens",
    accent: "#475569",
    deep: "#1f2933",
    hashtags: ["#Coutellerie", "#CuisineFacile", "#ChefAtHome", "#KitchenLuxe"],
  },
  default: {
    label: "Cuisine premium",
    useCase: "cuisine maison, beaux objets et choix durables",
    accent: "#9a6a2f",
    deep: "#2c2418",
    hashtags: ["#CuisinePremium", "#MaisonDesign", "#CuisineMaison", "#KitchenLuxe"],
  },
};

const TEXT_FIXES: Array<[RegExp, string]> = [
  [/\u00c3\u2030/g, "\u00c9"],
  [/\u00c3\u00a9/g, "\u00e9"],
  [/\u00c3\u00a8/g, "\u00e8"],
  [/\u00c3\u00aa/g, "\u00ea"],
  [/\u00c3\u00a0/g, "\u00e0"],
  [/\u00c3\u00a2/g, "\u00e2"],
  [/\u00c3\u00bb/g, "\u00fb"],
  [/\u00c3\u00bc/g, "\u00fc"],
  [/\u00c3\u00a7/g, "\u00e7"],
  [/\u00e2\u20ac\u2122/g, "'"],
  [/\u00e2\u20ac\u0153/g, '"'],
  [/\u00e2\u20ac\u009d/g, '"'],
  [/\u00e2\u20ac\u201c/g, "-"],
  [/\u00e2\u20ac\u0094/g, "-"],
  [/\u00e2\u20ac\u00a6/g, "..."],
  [/\u00e2\u201e\u00a2/g, "TM"],
  [/\u00c2/g, ""],
];

export function getPinterestMinQualityScore(): number {
  const configured = Number.parseInt(process.env.PINTEREST_MIN_QUALITY_SCORE || "", 10);
  if (Number.isFinite(configured) && configured >= 70 && configured <= 100) return configured;
  return DEFAULT_MIN_QUALITY_SCORE;
}

export function cleanPinterestText(value: string | undefined | null): string {
  let text = String(value || "").trim();
  for (const [pattern, replacement] of TEXT_FIXES) {
    text = text.replace(pattern, replacement);
  }
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

export function getPinterestCategoryProfile(product: Product): PinterestCategoryProfile {
  const normalized = normalizeForMatch(`${product.category} ${product.name} ${product.seoTags?.join(" ") || ""}`);
  if (normalized.includes("coutellerie") || normalized.includes("knife") || normalized.includes("couteau")) return CATEGORY_PROFILES.knives;
  if (normalized.includes("precision") || normalized.includes("patisserie") || normalized.includes("barista")) return CATEGORY_PROFILES.precision;
  if (normalized.includes("electromenager") || normalized.includes("robot") || normalized.includes("air fryer")) return CATEGORY_PROFILES.appliances;
  if (normalized.includes("ustensile") || normalized.includes("cocotte") || normalized.includes("casserole")) return CATEGORY_PROFILES.cookware;
  return CATEGORY_PROFILES.default;
}

export function getPinterestHighlights(product: Product): string[] {
  const featureCandidates = [
    ...(product.features || []),
    ...(product.seoTags || []),
    extractBenefitLabel(product.benefits),
  ]
    .map((item) => cleanPinterestText(item))
    .filter(Boolean)
    .filter((item) => item.length <= 34);

  const unique = Array.from(new Set(featureCandidates));
  return unique.slice(0, 3).length >= 3
    ? unique.slice(0, 3)
    : [...unique, "Guide KitchenLuxe", "Cuisine premium", "Choix durable"].slice(0, 3);
}

export function buildPinterestImageUrl(product: Product, baseUrl: string = BASE_URL): string {
  return `${baseUrl.replace(/\/+$/, "")}/api/pinterest/pin-image/${encodeURIComponent(product.slug)}`;
}

export function buildPinData(product: Product, baseUrl: string = BASE_URL): PinData {
  const safeBaseUrl = baseUrl.replace(/\/+$/, "");
  const profile = getPinterestCategoryProfile(product);
  const productName = cleanPinterestText(product.name);
  const brand = cleanPinterestText(product.brand);
  const productLabel = brand && !normalizeForMatch(productName).includes(normalizeForMatch(brand))
    ? `${brand} ${productName}`
    : productName;
  const productUrl = `${safeBaseUrl}/products/${product.slug}?utm_source=pinterest&utm_medium=social-organic&utm_campaign=product_pin&utm_content=${encodeURIComponent(product.slug)}`;
  const title = limitText(`${productLabel}: guide cuisine premium`, TITLE_MAX_LENGTH);
  const benefit = extractBenefit(product);
  const description = limitText([
    `${productLabel} pour ${profile.useCase}.`,
    benefit,
    "Le guide KitchenLuxe resume les usages, les points forts et les criteres a verifier avant achat.",
  ].filter(Boolean).join(" "), DESCRIPTION_MAX_LENGTH);
  const altText = limitText(
    `Pin vertical KitchenLuxe pour ${productLabel}, avec photo produit, titre lisible et points forts pour la cuisine premium.`,
    DESCRIPTION_MAX_LENGTH
  );

  const pinWithoutQuality = {
    imageUrl: buildPinterestImageUrl(product, safeBaseUrl),
    title,
    description,
    altText,
    link: productUrl,
    hashtags: profile.hashtags,
    productId: product.id,
    productName,
    productSlug: product.slug,
    productBrand: brand || "KitchenLuxe",
    categoryLabel: profile.label,
    visualType: "generated_vertical_product" as const,
    generatedAt: new Date().toISOString(),
  };

  return {
    ...pinWithoutQuality,
    quality: evaluatePinQuality(product, pinWithoutQuality),
  };
}

export function buildMakeWebhookPayload(pin: PinData) {
  return {
    title: pin.title,
    description: `${pin.description}\n\n${pin.hashtags.join(" ")}`,
    altText: pin.altText,
    link: pin.link,
    imageUrl: pin.imageUrl,
    board: "KitchenLuxe - Excellence Culinaire",
    productId: pin.productId,
    productSlug: pin.productSlug,
    productName: pin.productName,
    qualityScore: pin.quality.score,
    approvedForPublishing: pin.quality.passed,
    generatedAt: pin.generatedAt,
  };
}

type PinForQuality = Omit<PinData, "quality">;

function evaluatePinQuality(product: Product, pin: PinForQuality): PinQuality {
  const warnings: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  const deduct = (points: number, warning: string) => {
    score -= points;
    warnings.push(warning);
  };

  if (pin.title.length < 35) deduct(10, "Titre trop court pour porter une intention de recherche.");
  else strengths.push("Titre clair et compatible avec la limite Pinterest.");

  if (pin.description.length < 180) deduct(12, "Description trop courte pour donner du contexte utile.");
  else strengths.push("Description assez detaillee pour la recherche Pinterest.");

  if (PROMO_RE.test(pin.description)) deduct(18, "Description trop promotionnelle ou perissable.");
  else strengths.push("Description non promotionnelle et durable.");

  if (!pin.imageUrl.includes("/api/pinterest/pin-image/")) deduct(22, "Visuel non genere au format vertical KitchenLuxe.");
  else strengths.push("Visuel vertical dedie a Pinterest.");

  if (!product.image) deduct(18, "Image produit manquante.");
  if (!product.description && !product.benefits) deduct(10, "Contexte produit insuffisant.");

  if (pin.hashtags.length < 3 || pin.hashtags.length > 5) deduct(8, "Nombre de hashtags a ajuster.");
  else strengths.push("Hashtags limites et thematiques.");

  if (MOJIBAKE_RE.test([pin.title, pin.description, pin.altText, pin.productName].join(" "))) {
    deduct(20, "Texte avec caracteres mal encodes a corriger.");
  }

  if (!pin.link.startsWith("https://") && !pin.link.startsWith("http://localhost")) {
    deduct(12, "Lien source non HTTPS.");
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const minScore = getPinterestMinQualityScore();
  return {
    score: finalScore,
    passed: finalScore >= minScore,
    minScore,
    warnings,
    strengths,
  };
}

function extractBenefit(product: Product): string {
  const fromMarkdown = product.benefits?.match(/\*\*([^*]+)\*\*:\s*([^\n]+)/);
  if (fromMarkdown?.[2]) return cleanPinterestText(fromMarkdown[2]);
  if (product.description) return cleanPinterestText(product.description);
  return `Selection KitchenLuxe dans la categorie ${getPinterestCategoryProfile(product).label}.`;
}

function extractBenefitLabel(value: string | undefined): string {
  const match = value?.match(/\*\*([^*]+)\*\*:/);
  return match?.[1] || "";
}

function limitText(value: string, maxLength: number): string {
  const clean = cleanPinterestText(value);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function normalizeForMatch(value: string | undefined | null): string {
  return cleanPinterestText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
