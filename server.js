const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + filePath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Reload .env on every request so edits take effect without restarting the server.
  const env = loadEnv(path.join(__dirname, '.env'));
  const url = req.url.split('?')[0];

  if (url === '/' || url === '/index.html') {
    serveFile(res, path.join(__dirname, 'index.html'));
  } else if (url === '/style.css') {
    serveFile(res, path.join(__dirname, 'style.css'));
  } else if (url === '/script.js') {
    serveFile(res, path.join(__dirname, 'script.js'));
  } else if (url === '/images/boy') {
    if (!env.BOY_IMAGE) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Set BOY_IMAGE in .env');
      return;
    }
    serveFile(res, path.resolve(__dirname, env.BOY_IMAGE));
  } else if (url === '/images/girl') {
    if (!env.GIRL_IMAGE) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Set GIRL_IMAGE in .env');
      return;
    }
    serveFile(res, path.resolve(__dirname, env.GIRL_IMAGE));
  } else if (url === '/images/winner') {
    if (!env.WINNER_IMAGE_OF_BABY) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Set WINNER_IMAGE_OF_BABY in .env');
      return;
    }
    serveFile(res, path.resolve(__dirname, env.WINNER_IMAGE_OF_BABY));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Gender reveal site running at http://localhost:${PORT}`);
});
