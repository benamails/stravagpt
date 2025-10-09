// app/api/strava/stats/route.ts

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

    // Get current user from token storage
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json(
        { error: 'Not authenticated. Please authenticate first.' },
        { status: 401 }
      );
    }

    const athleteId = (current?.athlete?.id || current?.athlete_id)?.toString();
    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID not found in token data' },
        { status: 400 }
      );
    }

    // Always refresh tokens if needed before making API calls
    const tokens = await refreshTokensIfNeeded(athleteId);
    if (!tokens) {
      return NextResponse.json(
        { error: 'Not authenticated. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Only allow fetching stats for the current authenticated athlete
    // The Strava API only allows you to get stats for the athlete whose tokens you're using
    const athleteIdNum = parseInt(athleteId);
    if (isNaN(athleteIdNum)) {
      return NextResponse.json(
        { error: 'Invalid athlete ID' },
        { status: 400 }
      );
    }

    const stats = await stravaClient.getAthleteStats(tokens.access_token, athleteIdNum);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch athlete stats' },
      { status: 500 }
    );
  }
}
