// lib/tokenStorage.ts

import { getRedisClient } from '@/lib/redis';

export async function saveTokens(tokenData: any) {
  try {
    const redis = getRedisClient();
    const athleteId = tokenData.athlete?.id || tokenData.athlete_id;
    const key = `strava_tokens:${athleteId}`;
    
    // Stocker les tokens de l'utilisateur
    await redis.setex(key, 86400 * 30, JSON.stringify(tokenData)); // 30 jours
    
    // Stocker aussi une référence au dernier utilisateur connecté (utilisateur unique)
    await redis.set('current_athlete', athleteId.toString());
    
    console.log('✅ Tokens saved to Redis via REST API');
    console.log('✅ Current user set to athlete ID:', athleteId);
    
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
    
    // Upstash client may auto-parse JSON and return an object already
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data as any;
  } catch (error) {
    console.error('❌ Error loading tokens:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const redis = getRedisClient();
    const athleteId = await redis.get('current_athlete');
    
    if (!athleteId) {
      console.log('🔍 No current athlete found');
      return null;
    }
    
    console.log('🔍 Found current athlete ID:', athleteId);
    return await loadTokens(athleteId as string);
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
}

export async function clearTokens(athleteId: string) {
  try {
    const redis = getRedisClient();
    const key = `strava_tokens:${athleteId}`;
    await redis.del(key);
    
    // Supprimer aussi la référence utilisateur actuel si c'est le même
    const currentAthlete = await redis.get('current_athlete');
    if (currentAthlete === athleteId) {
      await redis.del('current_athlete');
    }
    
    console.log('✅ Tokens cleared from Redis');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
    throw error;
  }
}
