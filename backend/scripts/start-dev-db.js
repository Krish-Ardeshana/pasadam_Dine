import { MongoMemoryServer } from 'mongodb-memory-server';

console.log('[DevDB] Initializing local MongoDB engine on port 27017...');

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    dbName: 'prasadam_dine',
  },
});

console.log('[DevDB] MongoDB is successfully running at:', mongod.getUri());
console.log('[DevDB] Ready for NestJS connections on port 27017.');

// Keep process alive indefinitely
const keepAlive = () => {
  setTimeout(keepAlive, 1000 * 60 * 60);
};
keepAlive();

process.on('SIGINT', async () => {
  console.log('[DevDB] Shutting down MongoDB...');
  await mongod.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongod.stop();
  process.exit(0);
});
