const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walkDir('./client/src/pages', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Use negative lookbehind to avoid replacing already responsive grids
    // grid-cols-2 -> grid-cols-1 md:grid-cols-2
    let newContent = content.replace(/(?<![a-z0-9-]:)\bgrid-cols-2\b/g, 'grid-cols-1 md:grid-cols-2');
    
    // grid-cols-3 -> grid-cols-1 md:grid-cols-3
    newContent = newContent.replace(/(?<![a-z0-9-]:)\bgrid-cols-3\b/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3');

    // grid-cols-4 -> grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
    newContent = newContent.replace(/(?<![a-z0-9-]:)\bgrid-cols-4\b/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
    
    // flex-row -> flex-col md:flex-row (but only when inside a flex container that we want to make responsive... actually this is risky, let's skip flex-row bulk replace)

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      modifiedFiles++;
    }
  }
});
console.log('Modified grids in ' + modifiedFiles + ' files.');
