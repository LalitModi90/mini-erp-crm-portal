import { PrismaClient } from '@prisma/client';

const hosts = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-ap-southeast-2.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-ca-central-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-eu-west-3.pooler.supabase.com'
];

async function main() {
  for (const host of hosts) {
    for (const port of [6543, 5432]) {
      const url = `postgresql://postgres.ldiiiklxjokzhtnmfjcx:Ruchika%407878@${host}:${port}/postgres?pgbouncer=true&sslmode=require`;
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      try {
        await prisma.$connect();
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log('🎉 SUCCESSFUL SUPABASE DATABASE CONNECTION FOUND!');
        console.log('Host:', host);
        console.log('Port:', port);
        console.log('Result:', result);
        await prisma.$disconnect();
        process.exit(0);
      } catch (err) {
        if (!err.message.includes('tenant/user') && !err.message.includes('reach database')) {
          console.log(`Host ${host}:${port} -> ${err.message}`);
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  }
  console.log('Finished testing poolers.');
}

main();
