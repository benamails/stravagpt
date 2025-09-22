import { NextRequest, NextResponse } from 'next/server';

export function validateApiKey(request: NextRequest): NextResponse | null {
  // Skip API key validation if not set (for development)
  const requiredApiKey = process.env.API_KEY;

  if (!requiredApiKey) {
    return null;
  } // <- Accolade fermante ajoutée

  const apiKey = request.headers.get('x-api-key');

  if (!apiKey || apiKey !== requiredApiKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or missing API key. Include X-API-Key header.'
      },
      { status: 401 }
    );
  }

  return null;
}
