// app/api/auth-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { loadTokens } from '@/lib/tokenStorage';

export async function GET(request: NextRequest) {
  try {
    // Extraire l'athleteId depuis les paramètres de query (comme dans callback)
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');
    
    if (!athleteId) {
      return NextResponse.json({
        success: false,
        error: 'Athlete ID required'
      }, { status: 400 });
    }

    const tokens = await loadTokens(athleteId); // ✅ Avec paramètre obligatoire
    
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
