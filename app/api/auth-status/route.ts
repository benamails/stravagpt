// app/api/auth-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/tokenStorage';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking auth status for current user...');
    
    // Récupérer l'utilisateur actuel (utilisateur unique)
    const tokens = await getCurrentUser();
    
    if (!tokens) {
      console.log('❌ No current user found');
      return NextResponse.json({
        success: true,
        data: {
          hasTokens: false,
          message: "Not authenticated"
        }
      });
    }

    console.log('✅ Found tokens for athlete:', tokens.athlete?.firstname || 'Unknown');

    const now = Math.floor(Date.now() / 1000);
    const isExpired = tokens.expires_at <= now;
    const timeUntilExpiry = Math.max(0, tokens.expires_at - now);
    
    console.log('🕒 Token status:', {
      expires_at: tokens.expires_at,
      now: now,
      isExpired: isExpired,
      timeUntilExpiry: timeUntilExpiry
    });
    
    return NextResponse.json({
      success: true,
      data: {
        hasTokens: true,
        isExpired,
        expires_at: tokens.expires_at,
        timeUntilExpiry,
        athlete: tokens.athlete ? {
          firstname: tokens.athlete.firstname,
          lastname: tokens.athlete.lastname,
          id: tokens.athlete.id
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Auth status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check authentication status'
    }, { status: 500 });
  }
}
