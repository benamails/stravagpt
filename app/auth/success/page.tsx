'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const athleteName = searchParams.get('athlete') || 'Athlete';
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check token status after successful authentication
    const checkTokens = async () => {
      try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        setTokenStatus(data);
      } catch (error) {
        console.error('Failed to check token status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkTokens();
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#fc4c02', marginBottom: '1rem' }}>
          🎉 Authentication Successful!
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Welcome, <strong>{athleteName}</strong>! Your Strava account has been successfully connected.
        </p>
      </div>

      {/* Token Status Display */}
      <div style={{ 
        backgroundColor: loading ? '#f8f9fa' : (tokenStatus?.data?.hasTokens ? '#d4edda' : '#f8d7da'), 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: `1px solid ${loading ? '#e9ecef' : (tokenStatus?.data?.hasTokens ? '#c3e6cb' : '#f5c6cb')}`
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#495057' }}>
          {loading ? '⏳ Checking Authentication...' : 
           tokenStatus?.data?.hasTokens ? '✅ Authentication Status' : '❌ Authentication Issue'}
        </h2>
        
        {loading ? (
          <p>Verifying your tokens are stored securely...</p>
        ) : tokenStatus?.data?.hasTokens ? (
          <div style={{ textAlign: 'left' }}>
            <p><strong>✅ Tokens:</strong> Successfully stored and ready to use</p>
            <p><strong>🏃 Athlete:</strong> {tokenStatus.data.athlete?.firstname || 'Connected'}</p>
            <p><strong>⏰ Status:</strong> {tokenStatus.data.isExpired ? '🔄 Will auto-refresh when needed' : '✅ Active and valid'}</p>
            <p><strong>🛡️ Security:</strong> Tokens encrypted and stored securely</p>
          </div>
        ) : (
          <div style={{ textAlign: 'left' }}>
            <p><strong>⚠️ Issue:</strong> Tokens may not have been stored properly</p>
            <p><strong>🔧 Solution:</strong> Try the authentication process again</p>
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#495057' }}>🚀 What's Next?</h2>
        <ul style={{ 
          textAlign: 'left', 
          lineHeight: '1.6',
          listStyle: 'none',
          padding: 0
        }}>
          <li style={{ marginBottom: '0.5rem' }}>
            🤖 <strong>Return to your GPT</strong> and start exploring your fitness data
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            📊 <strong>Ask about your activities</strong>, stats, and training progress
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            🔄 <strong>Your tokens will auto-refresh</strong> - no need to re-authenticate
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
          <strong>Note:</strong> You can close this window and return to your GPT. 
          Your authentication is complete and your tokens will remain valid.
        </p>
        <p style={{ marginTop: '1rem' }}>
          If you need to re-authenticate later, just ask your GPT to help you connect to Strava again.
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
