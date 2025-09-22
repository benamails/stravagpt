'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An unknown error occurred during authentication';

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>
          ❌ Authentication Failed
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#6c757d' }}>
          There was an issue connecting your Strava account.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f8d7da', 
        color: '#721c24',
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '1px solid #f5c6cb'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Error Details</h2>
        <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {errorMessage}
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#d1ecf1', 
        color: '#0c5460',
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '1px solid #bee5eb'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🔧 How to Fix This</h2>
        <ul style={{ 
          textAlign: 'left', 
          lineHeight: '1.6',
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          <li style={{ marginBottom: '0.5rem' }}>
            🔄 <strong>Try again:</strong> Go back to your GPT and request a new authentication URL
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            ✅ <strong>Check permissions:</strong> Make sure you click "Authorize" on the Strava page
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            🔗 <strong>Verify app setup:</strong> Ensure your Strava API app is configured correctly
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            📞 <strong>Contact support:</strong> If the issue persists, check the API logs
          </li>
        </ul>
      </div>

      <div style={{ 
        fontSize: '0.9rem', 
        color: '#6c757d',
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e9ecef'
      }}>
        <p>
          <strong>Next Steps:</strong> Return to your GPT and ask it to generate a new authentication URL. 
          The authentication process should work on the next attempt.
        </p>
        <p style={{ marginTop: '1rem' }}>
          If you continue to experience issues, the problem may be with the Strava API configuration 
          or network connectivity.
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        Loading...
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
