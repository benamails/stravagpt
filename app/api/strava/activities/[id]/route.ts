import { NextRequest, NextResponse } from 'next/server';
import { stravaClient } from '@/lib/strava';
import { validateApiKey } from '@/lib/auth';
import { refreshTokensIfNeeded } from '@/lib/stravaTokens';
import { getCurrentUser } from '@/lib/tokenStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Optional API key validation for extra security
    const apiKeyError = validateApiKey(request);
    if (apiKeyError) return apiKeyError;

    const activityId = params.id;

    if (!activityId) {
      return NextResponse.json({ error: 'Missing activity ID' }, { status: 400 });
    }

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

    // Get the activity
    // Note: The Strava API will only return an activity if it belongs to the authenticated athlete
    // If the activity doesn't belong to the current athlete, the API will return a 404
    const activity = await stravaClient.getActivity(tokens.access_token, parseInt(activityId));

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: activity
    });

  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Activity not found (Strava API 404)' },
        { status: 404 }
      );
    }

    console.error('❌ Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
