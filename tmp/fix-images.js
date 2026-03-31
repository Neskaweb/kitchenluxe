const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../src/data');
const productsPath = path.join(DATA_DIR, 'products.json');
const postsPath = path.join(DATA_DIR, 'posts.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

const VALID_IMAGES = [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594910413521-17f167666993?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551218808-d8a2f8228f7a?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627308595229-7830f5a53696?q=80&w=1974&auto=format&fit=crop'
];

function checkUrl(url) {
    return new Promise((resolve) => {
        const fullUrl = url + '?q=10&w=100'; 
        https.get(fullUrl, { timeout: 10000 }, (res) => {
            resolve({ url, status: res.statusCode });
        }).on('error', (err) => resolve({ url, status: 500 }))
          .on('timeout', function() { this.destroy(); resolve({ url, status: 408 }); });
    });
}

function getRandomValidImage() {
    return VALID_IMAGES[Math.floor(Math.random() * VALID_IMAGES.length)];
}

async function fixBrokenImages() {
    const urlsToCheck = new Set();
    
    // Add all URLs to checking set
    [...products, ...posts].forEach(item => {
        if (item.image && item.image.includes('unsplash.com')) {
            urlsToCheck.add(item.image.split('?')[0]);
        }
    });

    const brokenBaseUrls = new Set();
    
    console.log(`Checking ${urlsToCheck.size} unique Unsplash URLs...`);
    for (const baseUrl of Array.from(urlsToCheck)) {
        const res = await checkUrl(baseUrl);
        if (res.status !== 200 && res.status !== 302) {
            console.log(`❌ Broken URL found: ${baseUrl} (Status: ${res.status})`);
            brokenBaseUrls.add(baseUrl);
        } else {
            console.log(`✅ Valid URL: ${baseUrl}`);
        }
    }

    if (brokenBaseUrls.size === 0) {
        console.log("No broken images found in the JSON data.");
        return;
    }

    let pFixed = 0;
    let postFixed = 0;

    // Fix products
    products.forEach(p => {
        if (p.image && brokenBaseUrls.has(p.image.split('?')[0])) {
            p.image = getRandomValidImage();
            pFixed++;
        }
    });

    // Fix posts
    posts.forEach(p => {
        if (p.image && brokenBaseUrls.has(p.image.split('?')[0])) {
            p.image = getRandomValidImage();
            postFixed++;
        }
    });

    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

    console.log(`Fixed ${pFixed} products and ${postFixed} posts.`);
}

fixBrokenImages().catch(console.error);
