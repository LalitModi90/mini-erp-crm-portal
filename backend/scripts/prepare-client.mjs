import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(dir, '../.env') });

const url = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = /^postgres(ql)?:\/\//.test(url);
const schema = isPostgres
  ? 'src/prisma/schema.postgresql.prisma'
  : 'src/prisma/schema.prisma';

console.log(`[prepare-client] DATABASE_URL provider: ${isPostgres ? 'postgresql' : 'sqlite'}`);
console.log(`[prepare-client] Generating Prisma client from: ${schema}`);

execSync(`npx prisma generate --schema=${schema}`, {
  cwd: path.resolve(dir, '..'),
  stdio: 'inherit',
});