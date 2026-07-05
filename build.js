// Turns .env into image-config.js, a plain static file the browser can load.
// Run this (`node build.js`) after editing .env, then commit + push so Vercel
// picks up the change — Vercel only serves static files, it can't read .env
// or run server.js at request time like your local dev server does.
const fs = require('fs');
const path = require('path');

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

function toPublicPath(value, label) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (path.isAbsolute(value)) {
    console.warn(
      `Warning: ${label} is an absolute local path (${value}). ` +
      `Vercel can't see files outside this project, so this image will 404 when deployed. ` +
      `Move it into the project (e.g. images/) and point ${label} at that relative path instead.`
    );
  }
  return value.startsWith('/') ? value : '/' + value;
}

const env = loadEnv(path.join(__dirname, '.env'));
const config = {
  boy: toPublicPath(env.BOY_IMAGE, 'BOY_IMAGE'),
  girl: toPublicPath(env.GIRL_IMAGE, 'GIRL_IMAGE'),
  winner: toPublicPath(env.WINNER_IMAGE_OF_BABY, 'WINNER_IMAGE_OF_BABY'),
};

const output = `window.IMAGE_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, 'image-config.js'), output);
console.log('Wrote image-config.js:', config);
