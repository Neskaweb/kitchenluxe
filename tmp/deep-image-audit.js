const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../src/data');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
const posts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'posts.json'), 'utf8'));

// Extract ALL unique Unsplash photo IDs from both files
const allUrls = new Set();

for (const p of products) {
    if (p.image && p.image.includes('unsplash.com')) allUrls.add(p.image.split('?')[0]);
}
for (const p of posts) {
    if (p.image && p.image.includes('unsplash.com')) allUrls.add(p.image.split('?')[0]);
}

// Also check images hardcoded in source files
const srcFiles = [
    '../src/app/page.tsx',
    '../src/scripts/autopilot-content.js',
    '../src/scripts/pinterest-image-gen.js',
];

for (const sf of srcFiles) {
    const fp = path.join(__dirname, sf);
    if (fs.existsSync(fp)) {
        const content = fs.readFileSync(fp, 'utf8');
        const matches = content.match(/https:\/\/images\.unsplash\.com\/photo-[a-z0-9-]+/g);
        if (matches) matches.forEach(m => allUrls.add(m));
    }
}

console.log(`Found ${allUrls.size} unique Unsplash URLs to check.\n`);

function checkUrl(url) {
    return new Promise((resolve) => {
        const fullUrl = url + '?q=10&w=100&auto=format&fit=crop'; // tiny version to save bandwidth
        https.get(fullUrl, { timeout: 10000 }, (res) => {
            resolve({ url, status: res.statusCode });
        }).on('error', (err) => {
            resolve({ url, status: 'ERROR', error: err.message });
        }).on('timeout', function() {
            this.destroy();
            resolve({ url, status: 'TIMEOUT' });
        });
    });
}

async function main() {
    const results = [];
    const urls = Array.from(allUrls);
    
    // Check 3 at a time
    for (let i = 0; i < urls.length; i += 3) {
        const batch = urls.slice(i, i + 3);
        const batchResults = await Promise.all(batch.map(checkUrl));
        results.push(...batchResults);
        
        for (const r of batchResults) {
            const photoId = r.url.split('/').pop();
            if (r.status === 200) {
                console.log(`✅ ${photoId}`);
            } else {
                console.log(`❌ ${photoId} → STATUS ${r.status}`);
            }
        }
    }
    
    const broken = results.filter(r => r.status !== 200);
    
    console.log(`\n========== RÉSULTAT ==========`);
    console.log(`Total URLs vérifiées: ${results.length}`);
    console.log(`OK: ${results.length - broken.length}`);
    console.log(`CASSÉES: ${broken.length}`);
    
    if (broken.length > 0) {
        console.log(`\nImages à corriger:`);
        for (const b of broken) {
            const photoId = b.url.split('/').pop();
            // Count occurrences
            const prodCount = products.filter(p => p.image && p.image.includes(photoId)).length;
            const postCount = posts.filter(p => p.image && p.image.includes(photoId)).length;
            console.log(`  ❌ ${photoId} (status: ${b.status}) — ${prodCount} produit(s), ${postCount} article(s)`);
        }
    }
    
    console.log(`\n==============================\n`);
}

main().catch(console.error);
