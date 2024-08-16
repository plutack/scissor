import { Redis } from "@upstash/redis";
import logger from "@/lib/logger";

const log = logger.child({ service: "redis-client" });

export const redis = Redis.fromEnv();

export const getRedisValue = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redis.get(key);
    log.info(`Redis value fetched for key: ${key}`);
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (parseError) {
        log.error(`Error parsing Redis value for key ${key}: ${parseError}`);
        return null;
      }
    }
    return value as T;
  } catch (error) {
    log.error(`Error getting Redis value for key ${key}: ${error}`);
    return null;
  }
};

export const setRedisValue = async <T>(
  key: string,
  value: T,
  expirationInSeconds?: number
): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);
    if (expirationInSeconds) {
      await redis.set(key, stringValue, { ex: expirationInSeconds });
    } else {
      await redis.set(key, stringValue);
    }
    log.info(`Redis value set for key: ${key}`);
  } catch (error) {
    log.error(`Error setting Redis value for key ${key}: ${error}`);
  }
};