// lib/tokenStorage.ts
import { getRedisClient } from '@/lib/redis';

export async function saveTokens(tokenData: any) {
  try {
    const redis = getRedisClient();
    // Correction: supporter les deux formats d'athlete
    const athleteId = tokenData.athlete?.id || tokenData.athlete_id;
    const key = `strava_tokens:${athleteId}`;
    
    // Stocker les données avec expiration
    await redis.setex(key, 86400 * 30, JSON.stringify(tokenData)); // 30 jours
    
    console.log('✅ Tokens saved to Redis via REST API');
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving tokens:', error);
    throw error;
  }
}

export async function loadTokens(athleteId: string) {
  try {
    const redis = getRedisClient();
    const key = `strava_tokens:${athleteId}`;
    const data = await redis.get(key);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data as string);
  } catch (error) {
    console.error('❌ Error loading tokens:', error);
    throw error;
  }
}

export async function clearTokens(athleteId: string) {
  try {
    const redis = getRedisClient();
    const key = `strava_tokens:${athleteId}`;
    await redis.del(key);
    
    console.log('✅ Tokens cleared from Redis');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
    throw error;
  }
}
