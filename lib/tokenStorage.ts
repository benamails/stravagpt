import { StravaTokenResponse } from './strava';
import { Redis } from 'ioredis';

// Redis storage for persistent token management
// Works locally and in production

const STORAGE_KEY = 'redis-strava:tokens';

function getRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log('🔗 Creating Redis connection to:', redisUrl.replace(/:[^:]*@/, ':***@'));
  
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: false, // Connect immediately
    keepAlive: 30000,
    family: 4, // Use IPv4
    connectTimeout: 30000, // Increased timeout
    commandTimeout: 30000, // Increased timeout
  });
  
  redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
  });
  
  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
  });
  
  redis.on('ready', () => {
    console.log('🚀 Redis client ready');
  });
  
  redis.on('close', () => {
    console.log('🔌 Redis connection closed');
  });
  
  return redis;
}

export async function saveTokens(tokens: StravaTokenResponse): Promise<void> {
  const client = getRedisClient();
  try {
    console.log('💾 Saving tokens to Redis...');
    console.log('📊 Token data to save:', {
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      expires_at: tokens.expires_at,
      athlete_id: tokens.athlete?.id
    });
    
    // Store tokens in Redis with 7-day expiration (longer than access token but ensures cleanup)
    const result = await client.setex(STORAGE_KEY, 60 * 60 * 24 * 7, JSON.stringify(tokens)); // 7 days
    console.log('📡 Redis setex result:', result);
    
    // Immediately verify the save worked
    const verifyData = await client.get(STORAGE_KEY);
    console.log('🔍 Immediate verification:', verifyData ? 'FOUND' : 'NOT FOUND');
    
    console.log('✅ Tokens saved to Redis:', {
      athlete_id: tokens.athlete?.id,
      athlete_name: tokens.athlete?.firstname,
      expires_at: tokens.expires_at,
      expires_in_hours: Math.round((tokens.expires_at - Date.now() / 1000) / 3600),
      redis_expiry: '7 days',
      verification: verifyData ? 'SUCCESS' : 'FAILED'
    });
    
  } catch (error) {
    console.error('❌ Error saving tokens to Redis:', error);
    throw error;
  } finally {
    console.log('🔌 Disconnecting Redis client...');
    client.disconnect();
  }
}

export async function loadTokens(): Promise<StravaTokenResponse | null> {
  const client = getRedisClient();
  try {
    console.log('🔍 Loading tokens from Redis...');
    
    const tokenData = await client.get(STORAGE_KEY);
    
    if (!tokenData) {
      console.log('❌ No tokens found in Redis');
      return null;
    }
    
    const tokens: StravaTokenResponse = JSON.parse(tokenData);
    
    console.log('✅ Loaded tokens from Redis:', {
      athlete_name: tokens.athlete?.firstname,
      expires_at: tokens.expires_at,
      is_expired: tokens.expires_at <= Math.floor(Date.now() / 1000),
      time_until_expiry_hours: Math.round((tokens.expires_at - Date.now() / 1000) / 3600)
    });
    
    return tokens;
    
  } catch (error) {
    console.error('❌ Error loading tokens from Redis:', error);
    return null;
  } finally {
    client.disconnect();
  }
}

export async function clearTokens(): Promise<void> {
  const client = getRedisClient();
  try {
    console.log('🗑️ Clearing tokens from Redis...');
    await client.del(STORAGE_KEY);
    console.log('✅ Tokens cleared from Redis');
  } catch (error) {
    console.error('❌ Error clearing tokens from Redis:', error);
  } finally {
    client.disconnect();
  }
}
