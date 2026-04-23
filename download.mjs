import fs from 'fs';
import https from 'https';
import path from 'path';

const images = [
  { url: 'https://i.postimg.cc/8cVk6jH8/foto-depan-1.png', path: './public/foto-depan-1.png' },
  { url: 'https://i.postimg.cc/hPZYhNMD/foto-belakang-1.png', path: './public/foto-belakang-1.png' },
  { url: 'https://i.postimg.cc/K8J8KGwq/foto-depan-2.png', path: './public/foto-depan-2.png' },
  { url: 'https://i.postimg.cc/hPZYhNMK/foto-belakang-2.png', path: './public/foto-belakang-2.png' },
  { url: 'https://i.postimg.cc/0NwFTZYK/99688bc3-7dab-47a8-954b-14b076bfc8a0.jpg', path: './public/foto-depan-3.jpg' },
  { url: 'https://i.postimg.cc/ZKsQ0XjS/foto-belakang-3.jpg', path: './public/foto-belakang-3.jpg' },
  { url: 'https://i.postimg.cc/W13DjY1z/Instagram-logo.png', path: './public/Instagram-logo.png' },
  { url: 'https://i.postimg.cc/YC94kDCj/Facebook-logo.png', path: './public/Facebook-logo.png' },
  { url: 'https://i.postimg.cc/P5xLhV5C/tiktok-logo.png', path: './public/tiktok-logo.png' }
];

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

await Promise.all(images.map(img => {
  return new Promise((resolve, reject) => {
    https.get(img.url, res => {
      const stream = fs.createWriteStream(img.path);
      res.pipe(stream);
      stream.on('finish', () => {
        console.log('Downloaded:', img.path);
        resolve(true);
      });
    }).on('error', reject);
  });
}));

console.log('All images downloaded successfully.');
