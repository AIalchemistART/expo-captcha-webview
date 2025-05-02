// scripts/setup-env.js
// Script to automate copying .env.example to environment files if missing, and warn if any required keys are missing.

const fs = require('fs');
const path = require('path');

// Find project root by searching upwards for docs/.env.example
function findEnvExample() {
  let dir = __dirname;
  for (let i = 0; i < 5; ++i) {
    const candidate = path.join(dir, 'docs', '.env.example');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}
const DOCS_ENV_EXAMPLE = findEnvExample();
const ENV_FILES = [
  '../.env.development',
  '../.env.staging',
  '../.env.production',
];

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  return lines.filter(line => line && !line.startsWith('#')).map(line => line.split('=')[0]);
}

function loadSecrets() {
  const secretsPath = path.join(__dirname, 'secrets.env');
  if (!fs.existsSync(secretsPath)) {
    console.warn('Warning: scripts/secrets.env not found. You may want to create it or provide secrets via CI.');
    return {};
  }
  const content = fs.readFileSync(secretsPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const secrets = {};
  lines.forEach(line => {
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...rest] = line.split('=');
      secrets[key] = rest.join('=');
    }
  });
  return secrets;
}

function ensureEnvFiles() {
  if (!fs.existsSync(DOCS_ENV_EXAMPLE)) {
    console.error('Missing docs/.env.example. Aborting.');
    process.exit(1);
  }
  const exampleContent = fs.readFileSync(DOCS_ENV_EXAMPLE, 'utf8');
  const requiredKeys = parseEnv(exampleContent);

  const secrets = loadSecrets();

  ENV_FILES.forEach(file => {
    const envPath = path.join(__dirname, file);
    let updated = false;
    let content = '';
    if (!fs.existsSync(envPath)) {
      content = exampleContent;
      updated = true;
      console.log(`Created missing ${file} from .env.example.`);
    } else {
      content = fs.readFileSync(envPath, 'utf8');
    }
    let lines = content.split(/\r?\n/);
    const presentKeys = parseEnv(content);
    const missing = requiredKeys.filter(key => !presentKeys.includes(key));
    // Auto-populate missing secrets
    missing.forEach(key => {
      if (secrets[key]) {
        lines.push(`${key}=${secrets[key]}`);
        updated = true;
        console.log(`Auto-populated ${key} in ${file} from secrets.env.`);
      }
    });
    if (updated) {
      fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
    }
    const stillMissing = requiredKeys.filter(key => !parseEnv(fs.readFileSync(envPath, 'utf8')).includes(key));
    if (stillMissing.length > 0) {
      console.warn(`Warning: ${file} is still missing keys: ${stillMissing.join(', ')}`);
    }
  });
  console.log('Environment setup complete.');
}

ensureEnvFiles();
