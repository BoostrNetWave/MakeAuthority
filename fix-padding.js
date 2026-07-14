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
    
    // Replace p-8 with p-4 md:p-8
    let newContent = content.replace(/(className=[\"\'\`][^\"]*?)\bp-8\b/g, '$1p-4 md:p-8');
    // Replace p-10 with p-5 md:p-10
    newContent = newContent.replace(/(className=[\"\'\`][^\"]*?)\bp-10\b/g, '$1p-5 md:p-10');
    // Replace p-6 with p-4 md:p-6
    newContent = newContent.replace(/(className=[\"\'\`][^\"]*?)\bp-6\b/g, '$1p-4 md:p-6');
    // Replace space-y-8 with space-y-6 md:space-y-8
    newContent = newContent.replace(/(className=[\"\'\`][^\"]*?)\bspace-y-8\b/g, '$1space-y-6 md:space-y-8');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      modifiedFiles++;
    }
  }
});
console.log('Modified ' + modifiedFiles + ' files.');
