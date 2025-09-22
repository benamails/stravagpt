import { NextRequest, NextResponse } from 'next/server';
import { loadTokens } from '@/lib/tokenStorage';

// Public endpoint for the auth success page to check token status
// No API key required since it's used by the auth flow itself
export async function GET(request: NextRequest) {
  try {
    const tokens = await loadTokens();
    
    if (!tokens) {
      return NextResponse.json({
        success: true,
        data: {
          hasTokens: false,
          message: "No tokens found"
        }
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = tokens.expires_at <= now;
    const timeUntilExpiry = Math.max(0, tokens.expires_at - now);

    return NextResponse.json({
      success: true,
      data: {
        hasTokens: true,
        isExpired,
        expires_at: tokens.expires_at,
        timeUntilExpiry,
        athlete: tokens.athlete ? {
          firstname: tokens.athlete.firstname,
          id: tokens.athlete.id
        } : null
      }
    });
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check authentication status'
    }, { status: 500 });
  }
}
