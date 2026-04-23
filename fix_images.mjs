import fs from 'fs';
import path from 'path';

const srcDir = './public';
const destDir = './src/assets';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.endsWith('.png') || file.endsWith('.jpg')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied ${file} to ${destDir}`);
  }
});
