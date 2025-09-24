// app/api/clear-tokens/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { clearTokens } from '@/lib/tokenStorage';

export async function DELETE(request: NextRequest) {
  try {
    // Optional API key validation for extra security
    const apiKeyError = validateApiKey(request);
    if (apiKeyError) return apiKeyError;

    // Extraire l'athleteId depuis les paramètres de query
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');
    
    if (!athleteId) {
      return NextResponse.json({
        success: false,
        error: 'Athlete ID required'
      }, { status: 400 });
    }

    await clearTokens(athleteId); // ✅ Avec paramètre obligatoire

    return NextResponse.json({
      success: true,
      message: 'Tokens cleared successfully'
    });

  } catch (error) {
    console.error('Clear tokens error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear tokens' },
      { status: 500 }
    );
  }
}
