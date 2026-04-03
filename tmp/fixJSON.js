const fs = require('fs');
function fix(str) { 
  return str.replace(/[\xC2\xC3][\x80-\xBF]/g, match => { 
    return Buffer.from(match, 'latin1').toString('utf8'); 
  }); 
}
['src/data/posts.json', 'src/data/products.json'].forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  let fixed = fix(text);
  fs.writeFileSync(f, fixed, 'utf8');
  console.log('Fixed', f);
});
