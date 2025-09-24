// app/api/strava/athlete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { stravaClient } from '@/lib/strava';
import { validateApiKey } from '@/lib/auth';
import { refreshTokensIfNeeded } from '@/lib/stravaTokens';
import { getCurrentUser } from '@/lib/tokenStorage';

export async function GET(request: NextRequest) {
  try {
    // Optional API key validation for extra security
    const apiKeyError = validateApiKey(request);
    if (apiKeyError) return apiKeyError;

    // Extract athleteId from query parameters or fallback to current stored user
    const { searchParams } = new URL(request.url);
    let athleteId = searchParams.get('athleteId');
    if (!athleteId) {
      const current = await getCurrentUser();
      athleteId = (current?.athlete?.id || current?.athlete_id)?.toString() || null;
    }
    
    if (!athleteId) {
      return NextResponse.json({
        success: false,
        error: 'Athlete ID required'
      }, { status: 400 });
    }

    // Always refresh tokens if needed before making API calls
    const tokens = await refreshTokensIfNeeded(athleteId);
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated. Please authenticate first.' },
        { status: 401 }
      );
    }

    const athlete = await stravaClient.getAthlete(tokens.access_token);

    return NextResponse.json({
      success: true,
      data: athlete
    });

  } catch (error) {
    console.error('Athlete fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch athlete data' },
      { status: 500 }
    );
  }
}
