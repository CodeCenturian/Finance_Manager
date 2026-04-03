import { config } from './config';
import app from './app';
import prisma from './prismaClient';

async function main() {
  // Verify DB connection
  await prisma.$connect();
  console.log('Database connected');

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`API docs available at http://localhost:${config.port}/api-docs`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
