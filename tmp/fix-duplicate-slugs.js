const fs = require('fs');
const path = require('path');

const POSTS_FILE = path.join(__dirname, '../src/data/posts.json');
let posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));

// Find duplicates
const slugSeen = {};
let fixedCount = 0;

for (let i = 0; i < posts.length; i++) {
    const slug = posts[i].slug;
    if (!slugSeen[slug]) {
        slugSeen[slug] = 1;
    } else {
        // Duplicate found — append a unique suffix based on the post id
        const suffix = posts[i].id.split('-').pop(); // last segment of id
        const newSlug = `${slug}-${suffix}`;
        console.log(`🔧 Fixing duplicate: "${slug}" → "${newSlug}" (post: ${posts[i].title.substring(0, 60)})`);
        posts[i].slug = newSlug;
        // Also update pinterestImages slugs references (they are stored as /pins/SLUG-kl-var-N.jpg)
        if (posts[i].pinterestImages) {
            posts[i].pinterestImages = posts[i].pinterestImages.map(p =>
                p.replace(`/pins/${slug}-kl-var`, `/pins/${newSlug}-kl-var`)
            );
        }
        if (posts[i].pinterestImage) {
            posts[i].pinterestImage = posts[i].pinterestImage.replace(
                `/pins/${slug}-kl-var`,
                `/pins/${newSlug}-kl-var`
            );
        }
        slugSeen[newSlug] = 1;
        fixedCount++;
    }
}

fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
console.log(`\n✅ ${fixedCount} slug(s) dupliqués corrigés dans posts.json.`);

// Also rename the actual pin files on disk to match
const PINS_DIR = path.join(__dirname, '../public/pins');
let renamedFiles = 0;
const files = fs.readdirSync(PINS_DIR);

// Re-read posts to get the new slugs mapping
const updatedPosts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
for (const post of updatedPosts) {
    if (post.pinterestImages) {
        for (let j = 0; j < post.pinterestImages.length; j++) {
            const expectedPath = path.join(__dirname, '..', 'public', post.pinterestImages[j]);
            if (!fs.existsSync(expectedPath)) {
                // Derive what the old path would have been (slug before suffix)
                const oldSlug = post.slug.replace(/-\d+$/, '');
                const varNum = j + 1;
                const oldFilename = `${oldSlug}-kl-var-${varNum}.jpg`;
                const oldPath = path.join(PINS_DIR, oldFilename);
                if (fs.existsSync(oldPath)) {
                    fs.copyFileSync(oldPath, expectedPath);
                    console.log(`📁 Copié: ${oldFilename} → ${path.basename(post.pinterestImages[j])}`);
                    renamedFiles++;
                } else {
                    console.log(`⚠️  Fichier source introuvable: ${oldFilename}`);
                }
            }
        }
    }
}

console.log(`\n📁 ${renamedFiles} fichier(s) pin copiés/renommés.`);
console.log('✅ Correction des doublons terminée.');
