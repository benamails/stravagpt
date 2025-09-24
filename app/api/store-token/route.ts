// app/api/store-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { saveTokens } from '@/lib/tokenStorage';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Store-token endpoint called');
    
    // Vérifier si c'est un appel interne
    const isInternalCall = request.headers.get('X-Internal-Call') === 'true';
    
    // Optional API key validation for extra security (skip pour appels internes)
    if (!isInternalCall) {
      const apiKeyError = validateApiKey(request);
      if (apiKeyError) {
        console.log('🔑 API key validation failed');
        return apiKeyError;
      }
    } else {
      console.log('🔗 Internal call detected, skipping API key validation');
    }
    
    // ... reste du code inchangé


    const body = await request.json();
    console.log('📦 Received token data:', {
      has_access_token: !!body.access_token,
      has_refresh_token: !!body.refresh_token,
      expires_at: body.expires_at,
      athlete_name: body.athlete?.firstname || 'Unknown'
    });

    const { access_token, refresh_token, expires_at, athlete } = body;

    if (!access_token || !refresh_token || !expires_at) {
      console.log('❌ Missing required token data');
      return NextResponse.json(
        { success: false, error: 'Missing token data' },
        { status: 400 }
      );
    }

    // Store tokens using persistent storage
    const tokenData = {
      access_token,
      refresh_token,
      expires_at,
      expires_in: expires_at - Math.floor(Date.now() / 1000),
      athlete
    };
    
    console.log('💾 Storing tokens with data:', {
      expires_at: tokenData.expires_at,
      expires_in: tokenData.expires_in,
      athlete_id: athlete?.id
    });
    
    await saveTokens(tokenData);
    
    console.log('✅ Tokens stored successfully in persistent storage');

    return NextResponse.json({
      success: true,
      message: 'Tokens stored successfully',
      athlete: athlete || null
    });
  } catch (error) {
    console.error('💥 Store token error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store tokens' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
