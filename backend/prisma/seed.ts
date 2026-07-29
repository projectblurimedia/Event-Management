import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin account + business profile (SiteSettings) are created once via the
  // POST /api/setup first-run flow (see backend/src/modules/setup).
  //
  // The catalogue (Categories -> Types -> Items, and Packages built from
  // them) is intentionally not seeded here — it's built entirely through
  // the admin dashboard (Admin -> Categories, Admin -> Items, Admin ->
  // Packages), since every business's bulletins/types/items are different.
  console.log('Nothing to seed — admin account/business profile come from /api/setup, catalogue from the admin dashboard.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
