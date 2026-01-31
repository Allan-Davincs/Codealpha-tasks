import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createRedisClient } from '../utils/cache.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Mock Redis for testing
  jest.mock('../utils/cache.js', () => ({
    createRedisClient: jest.fn(() => Promise.resolve(null)),
    getRedisClient: jest.fn(() => null),
    cacheMiddleware: jest.fn(() => (req, res, next) => next()),
    clearCache: jest.fn(() => Promise.resolve())
  }));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
  
  jest.clearAllMocks();
});