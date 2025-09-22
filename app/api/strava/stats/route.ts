import { NextRequest, NextResponse } from 'next/server';
import { stravaClient } from '@/lib/strava';
import { validateApiKey } from '@/lib/auth';
import { refreshTokensIfNeeded } from '@/lib/stravaTokens';

export async function GET(request: NextRequest) {
  try {
    // Optional API key validation for extra security
    const apiKeyError = validateApiKey(request);
    if (apiKeyError) return apiKeyError;

    // Always refresh tokens if needed before making API calls
    const tokens = await refreshTokensIfNeeded();

    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated. Please authenticate first.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athlete_id');

    if (!athleteId) {
      return NextResponse.json(
        { success: false, error: 'Athlete ID required' },
        { status: 400 }
      );
    }

    const athleteIdNum = parseInt(athleteId);
    if (isNaN(athleteIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid athlete ID' },
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
