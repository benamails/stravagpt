import { StravaTokenResponse } from './strava';
import { loadTokens, saveTokens } from './tokenStorage';

export async function refreshTokensIfNeeded(athleteId: string): Promise<StravaTokenResponse | null> {
  console.log('🔍 Checking tokens for refresh...');

  // Load tokens from persistent storage
  const tokens = await loadTokens(athleteId);
  
  if (!tokens) {
    console.log('❌ No tokens available for refresh - user needs to authenticate');
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = tokens.expires_at - now;
  
  console.log('⏰ Token status:', {
    expires_at: tokens.expires_at,
    current_time: now,
    time_until_expiry: timeUntilExpiry,
    is_expired: timeUntilExpiry <= 0
  });

  if (tokens.expires_at > now) {
    console.log('✅ Tokens still valid, no refresh needed');
    return tokens; // still valid
  }

  console.log('🔄 Tokens expired, refreshing...');
  
  try {
    const refreshRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      }),
    });

    if (!refreshRes.ok) {
      console.error('Failed to refresh tokens:', refreshRes.status, refreshRes.statusText);
      return null;
    }

    const newTokens: StravaTokenResponse = await refreshRes.json();
    
    // ✅ SOLUTION : Créer un objet avec la structure attendue
    const tokenDataForStorage = {
      ...newTokens,
      athlete_id: tokens.athlete?.id || athleteId
    };
    
    await saveTokens(tokenDataForStorage);
    console.log('Tokens refreshed successfully');
    return newTokens;
    
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return null;
  }
}

export async function getValidAccessToken(athleteId: string): Promise<string | null> {
  const tokens = await refreshTokensIfNeeded(athleteId);
  return tokens?.access_token || null;
}
