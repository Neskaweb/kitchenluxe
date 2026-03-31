const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_DIR = path.join(__dirname, '../src/data');
const PINS_DIR = path.join(__dirname, '../public/pins');

const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
const posts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'posts.json'), 'utf8'));

const brokenExternalImages = [];
const brokenLocalPins = [];
const missingPinterestField = [];

// ---- CHECK LOCAL PINS ----
console.log('\n=== CHECKING LOCAL PINTEREST PINS ===\n');
for (const post of posts) {
    if (post.pinterestImages && post.pinterestImages.length > 0) {
        for (const pinPath of post.pinterestImages) {
            const localPath = path.join(__dirname, '../public', pinPath);
            if (!fs.existsSync(localPath)) {
                brokenLocalPins.push({ post: post.title, pin: pinPath });
            }
        }
    }
    if (post.pinterestImage) {
        const localPath = path.join(__dirname, '../public', post.pinterestImage);
        if (!fs.existsSync(localPath)) {
            brokenLocalPins.push({ post: post.title, pin: post.pinterestImage + ' (pinterestImage main)' });
        }
    }
    if (!post.pinterestImage && post.isAutopilot) {
        missingPinterestField.push(post.title);
    }
}

// ---- CHECK KNOWN BAD UNSPLASH IDs ----
const KNOWN_BAD_IDS = [
    'photo-1542452255-1f5462c4b868',
    'photo-1608248597279-f99d160bfbc8',
    'photo-1556228720-1957be9b936d',
];

console.log('\n=== CHECKING PRODUCT IMAGES FOR KNOWN BAD IDS ===\n');
const badProductImages = [];
for (const p of products) {
    if (p.image && KNOWN_BAD_IDS.some(bad => p.image.includes(bad))) {
        badProductImages.push({ name: p.name, image: p.image });
    }
}

console.log('\n=== CHECKING POST IMAGES FOR KNOWN BAD IDS ===\n');
const badPostImages = [];
for (const p of posts) {
    if (p.image && KNOWN_BAD_IDS.some(bad => p.image.includes(bad))) {
        badPostImages.push({ title: p.title, image: p.image });
    }
}

// ---- CHECK FOR DUPLICATE SLUGS (causes 404 on blog) ----
console.log('\n=== CHECKING FOR DUPLICATE SLUGS ===\n');
const slugCount = {};
for (const p of posts) {
    slugCount[p.slug] = (slugCount[p.slug] || 0) + 1;
}
const duplicateSlugs = Object.entries(slugCount).filter(([, count]) => count > 1).map(([slug]) => slug);

// ---- CHECK FOR MISSING HERO FALLBACK IMAGE ----
const heroFallback = path.join(__dirname, '../public/images/hero-fallback.jpg');
const heroMissing = !fs.existsSync(heroFallback);

// ---- REPORT ----
console.log('\n\n========== IMAGE AUDIT REPORT ==========\n');

if (heroMissing) {
    console.log('❌ [CRITIQUE] Image hero fallback manquante: /public/images/hero-fallback.jpg');
    console.log('   → La page d\'accueil utilise poster="/images/hero-fallback.jpg" pour la vidéo héro.');
}

if (badProductImages.length > 0) {
    console.log(`\n❌ [PRODUITS] ${badProductImages.length} produit(s) avec images Unsplash connues comme cassées:`);
    badProductImages.forEach(p => console.log(`   - ${p.name}: ${p.image.split('?')[0].split('/').pop()}`));
} else {
    console.log('\n✅ [PRODUITS] Aucune image Unsplash cassée connue.');
}

if (badPostImages.length > 0) {
    console.log(`\n❌ [ARTICLES] ${badPostImages.length} article(s) avec images Unsplash connues comme cassées:`);
    badPostImages.forEach(p => console.log(`   - ${p.title}`));
} else {
    console.log('\n✅ [ARTICLES] Aucune image Unsplash cassée connue.');
}

if (brokenLocalPins.length > 0) {
    console.log(`\n❌ [PINS] ${brokenLocalPins.length} épingle(s) Pinterest locale(s) manquante(s):`);
    brokenLocalPins.slice(0, 20).forEach(p => console.log(`   - (${p.post.substring(0, 50)}...) → ${p.pin}`));
    if (brokenLocalPins.length > 20) console.log(`   ... et ${brokenLocalPins.length - 20} autres.`);
} else {
    console.log('\n✅ [PINS] Toutes les épingles Pinterest locales sont présentes.');
}

if (missingPinterestField.length > 0) {
    console.log(`\n⚠️  [PINS] ${missingPinterestField.length} article(s) autopilot sans champ pinterestImage:`);
    missingPinterestField.slice(0, 10).forEach(t => console.log(`   - ${t}`));
} else {
    console.log('\n✅ [PINS] Tous les articles autopilot ont un champ pinterestImage.');
}

if (duplicateSlugs.length > 0) {
    console.log(`\n⚠️  [SLUGS] ${duplicateSlugs.length} slug(s) dupliqué(s) dans posts.json (risque de 404 / mauvais article affiché):`);
    duplicateSlugs.forEach(s => console.log(`   - "${s}" (${slugCount[s]}x)`));
} else {
    console.log('\n✅ [SLUGS] Aucun slug dupliqué détecté.');
}

// ---- STATS ----
const totalPins = posts.reduce((acc, p) => acc + (p.pinterestImages ? p.pinterestImages.length : 0), 0);
const pinsInDir = fs.readdirSync(PINS_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png')).length;
console.log(`\n📊 STATS:`);
console.log(`   - Produits total: ${products.length}`);
console.log(`   - Articles total: ${posts.length}`);
console.log(`   - Pins référencés dans posts.json: ${totalPins}`);
console.log(`   - Fichiers .jpg/.png dans /public/pins: ${pinsInDir}`);

console.log('\n========================================\n');
