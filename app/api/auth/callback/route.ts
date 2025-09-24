// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stravaClient } from '@/lib/strava';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('message', `OAuth error: ${error}`);
      return NextResponse.redirect(errorUrl);
    }

    if (!code) {
      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('message', 'No authorization code provided');
      return NextResponse.redirect(errorUrl);
    }

    const tokenResponse = await stravaClient.exchangeCodeForToken(code);

    // Forward tokens to store endpoint using proper URL construction
    try {
      const url = new URL(request.url);
      const baseUrl = process.env.BASE_URL || `${url.protocol}//${url.host}`;
      const storeUrl = `${baseUrl}/api/store-token`;
      
      console.log('🔄 Forwarding tokens to /store-token at:', storeUrl);

      const storeResponse = await fetch(storeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.API_KEY || '',
          'X-Internal-Call': 'true'
        },
        body: JSON.stringify(tokenResponse)
      });

      console.log('📡 Store-token response status:', storeResponse.status);
      
      const storeResult = await storeResponse.json();
      console.log('📦 Store-token response:', storeResult);

      if (!storeResult.success) {
        console.error('❌ Failed to store tokens:', storeResult.error);
      } else {
        console.log('✅ Tokens stored successfully');
        console.log('🏃 Athlete stored:', tokenResponse.athlete?.firstname || 'Unknown');
      }

    } catch (error) {
      console.error('💥 Error storing tokens:', error);
    }

    // Redirect to success page
    const successUrl = new URL('/auth/success', request.url);
    successUrl.searchParams.set('athlete', tokenResponse.athlete?.firstname || 'Athlete');
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Callback error:', error);
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('message', 'Failed to complete authentication');
    return NextResponse.redirect(errorUrl);
  }
}
