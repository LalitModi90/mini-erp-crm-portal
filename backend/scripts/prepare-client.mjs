import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

console.log('[prepare-client] Generating Prisma client from: src/prisma/schema.prisma');

execSync('npx prisma generate --schema=src/prisma/schema.prisma', {
  cwd: path.resolve(dir, '..'),
  stdio: 'inherit',
});