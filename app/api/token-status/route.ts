// app/api/token-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { loadTokens, getCurrentUser } from '@/lib/tokenStorage';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Token status check requested');

    // Optional API key validation for extra security
    const apiKeyError = validateApiKey(request);
    if (apiKeyError) return apiKeyError;

    // Extraire l'athleteId depuis les paramètres de query ou fallback utilisateur courant
    const { searchParams } = new URL(request.url);
    let athleteId = searchParams.get('athleteId');
    if (!athleteId) {
      const current = await getCurrentUser();
      athleteId = (current?.athlete?.id || current?.athlete_id)?.toString() || null;
    }

    const tokens = athleteId ? await loadTokens(athleteId) : null;

    console.log('🔍 Current token state:', {
      has_tokens: !!tokens,
      expires_at: tokens?.expires_at || 'N/A',
      athlete_name: tokens?.athlete?.firstname || 'N/A'
    });

    if (!tokens) {
      console.log('❌ No tokens found in storage');
      return NextResponse.json({
        success: true,
        data: {
          hasTokens: false,
          message: 'No tokens stored. Please authenticate first.',
          debug: {
            storage_checked: true,
            tokens_found: false
          }
        }
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = tokens.expires_at <= now;
    const timeUntilExpiry = tokens.expires_at - now;

    console.log('⏰ Token analysis:', {
      current_time: now,
      expires_at: tokens.expires_at,
      time_until_expiry: timeUntilExpiry,
      is_expired: isExpired
    });

    return NextResponse.json({
      success: true,
      data: {
        hasTokens: true,
        isExpired,
        expires_at: tokens.expires_at,
        timeUntilExpiry: isExpired ? 0 : timeUntilExpiry,
        athlete: tokens.athlete ? {
          id: tokens.athlete.id,
          firstname: tokens.athlete.firstname,
          lastname: tokens.athlete.lastname
        } : null,
        debug: {
          storage_checked: true,
          tokens_found: true,
          current_timestamp: now
        }
      }
    });

  } catch (error) {
    console.error('💥 Token status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get token status' },
      { status: 500 }
    );
  }
}
