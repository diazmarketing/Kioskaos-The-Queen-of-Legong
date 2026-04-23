import fs from 'fs';
import path from 'path';

if (!fs.existsSync('./src/assets')) {
  fs.mkdirSync('./src/assets', { recursive: true });
}

const files = fs.readdirSync('./public');
files.forEach(f => {
  if (f === '.keep') return;
  fs.copyFileSync('./public/' + f, './src/assets/' + f);
});
