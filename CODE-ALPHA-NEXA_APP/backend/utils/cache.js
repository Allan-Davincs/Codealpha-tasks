import Redis from 'redis';
import { logger } from '../server.js';

let redisClient;

// Create Redis client
const createRedisClient = async () => {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
    
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    return null;
  }
};

// Get Redis client
const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Cache middleware
const cacheMiddleware = (key, expire = 3600) => {
  return async (req, res, next) => {
    if (!redisClient) {
      return next();
    }

    try {
      const cacheKey = `cache:${key}:${req.originalUrl || req.url}`;
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data) {
        if (redisClient && res.statusCode === 200) {
          redisClient.setEx(cacheKey, expire, JSON.stringify(data))
            .catch(err => logger.error('Cache set error:', err));
        }
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = async (pattern) => {
  if (!redisClient) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared cache for pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
};

export { createRedisClient, getRedisClient, cacheMiddleware, clearCache };