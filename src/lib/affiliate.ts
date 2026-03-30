import { Product } from "./data";

const FR_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG_FR || "kitchenluxe-21";
const US_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG_US || "kitchenluxe-20";

/**
 * Generates an optimized Amazon Affiliate Link.
 * Priority:
 * 1. Direct ASIN Link (dp/{ASIN}) -> Highest Conversion
 * 2. Search Link (s?k={Name}) -> Fallback (Never broken)
 */
export const getAffiliateLink = (product: Product, region: 'fr' | 'us' = 'fr'): string => {
    const tag = region === 'fr' ? FR_TAG : US_TAG;
    const domain = region === 'fr' ? 'amazon.fr' : 'amazon.com';

    // SMART ASIN SEARCH (Anti-404 Strategy)
    // If product has an ASIN, we search for that ASIN on Amazon instead of just name.
    // This triggers the product match 100% of the time without risk of a direct link 404.
    const query = product.asin ? product.asin : encodeURIComponent(product.name.replace(/\b\d+(ml|g|oz)\b/ig, '').trim());
    
    return `https://www.${domain}/s?k=${query}&tag=${tag}`;
};

/**
 * Validates if a string is a valid Amazon ASIN format (10 alphanumeric chars).
 */
export const isValidASIN = (asin: string): boolean => {
    return /^[A-Z0-9]{10}$/.test(asin);
};
