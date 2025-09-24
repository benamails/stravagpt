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
      return NextResponse.json({ success: false, error: 'Athlete ID required' }, { status: 400 });
    }

    // Always refresh tokens if needed before making API calls
    const tokens = await refreshTokensIfNeeded(athleteId);
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Enforce server-side pagination only
    if (searchParams.get('all') === 'true') {
      return NextResponse.json({ success: false, error: 'Parameter all=true is not allowed. Use page and per_page.' }, { status: 400 });
    }

    const pageParam = searchParams.get('page');
    const perPageParam = searchParams.get('per_page');
    const page = Math.max(1, parseInt(pageParam || '1'));
    const requestedPerPage = parseInt(perPageParam || '100');
    const perPage = Math.max(1, Math.min(requestedPerPage, 100)); // cap page size

    // Date bounds: default to last 28 days if not provided
    const beforeParam = searchParams.get('before');
    const afterParam = searchParams.get('after');
    const nowSeconds = Math.floor(Date.now() / 1000);
    const defaultAfter = nowSeconds - 28 * 24 * 60 * 60;
    const before = beforeParam ? parseInt(beforeParam) : undefined;
    const after = afterParam ? parseInt(afterParam) : defaultAfter;

    let activities = await stravaClient.getActivities(
      tokens.access_token,
      page,
      perPage,
      { before, after }
    );

    // Optionally omit heavy map field unless explicitly requested
    const includeMap = searchParams.get('include_map') === 'true';
    if (!includeMap) {
      activities = activities.map(a => {
        const { map, ...rest } = a as any;
        return rest;
      });
    }

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        per_page: perPage,
        total: activities.length,
        before,
        after
      }
    });
  } catch (error) {
    console.error('Activities fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}