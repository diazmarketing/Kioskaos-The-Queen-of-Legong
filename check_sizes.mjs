import fs from 'fs';
import path from 'path';

const publicDir = './public';
const files = fs.readdirSync(publicDir);

files.forEach(file => {
  const stats = fs.statSync(path.join(publicDir, file));
  console.log(`${file}: ${(stats.size / 1024).toFixed(2)} KB`);
});
