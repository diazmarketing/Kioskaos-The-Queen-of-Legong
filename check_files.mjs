import fs from 'fs';

const files = fs.readdirSync('./public');
files.forEach(f => {
  if (f === '.keep') return;
  const stats = fs.statSync('./public/' + f);
  console.log(`${f}: ${stats.size} bytes`);
  
  // Read first few bytes to check if it's a valid image (magic numbers)
  const fd = fs.openSync('./public/' + f, 'r');
  const buffer = Buffer.alloc(4);
  fs.readSync(fd, buffer, 0, 4, 0);
  console.log(`Magic: ${buffer.toString('hex')}`);
  fs.closeSync(fd);
});
