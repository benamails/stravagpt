import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Optional API key validation for extra security
  const apiKeyError = validateApiKey(request);
  if (apiKeyError) return apiKeyError;
  return NextResponse.json({
    success: true,
    message: 'Strava Connector API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      'auth-callback': '/api/auth/callback',
      'store-token': '/api/store-token',
      'token-status': '/api/token-status',
      athlete: '/api/strava/athlete',
      activities: '/api/strava/activities',
      'activity-detail': '/api/strava/activities/[id]',
      stats: '/api/strava/stats'
    }
  });
}
