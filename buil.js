const fs = require('fs-extra');
const { execSync } = require('child_process');

// Exécuter le build Angular
console.log('Starting Angular build...');
execSync('ng build', { stdio: 'inherit' });
console.log('Angular build completed.');

// Copier tous les fichiers du dossier browser vers le dossier dist/output
console.log('Copying files from browser directory to output directory...');
fs.copySync('dist/sakai-ng/browser', 'dist/output');

// Copier le fichier test.html dans le dossier de sortie
console.log('Copying test.html to output directory...');
fs.copySync('test.html', 'dist/output/test.html');

console.log('Build process completed successfully.');