import fs from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
const backendRoot = resolve(currentDir, '..');
const frontendRoot = resolve(backendRoot, '..', 'Frontend');
const frontendDist = resolve(frontendRoot, 'dist');
const backendDist = resolve(backendRoot, 'dist');

execSync('npm install', { cwd: frontendRoot, stdio: 'inherit' });
execSync('npm run build', { cwd: frontendRoot, stdio: 'inherit' });

await fs.rm(backendDist, { recursive: true, force: true });
await fs.mkdir(backendDist, { recursive: true });
await fs.cp(frontendDist, backendDist, { recursive: true });

console.log(`Copied frontend build from ${frontendDist} to ${backendDist}`);
