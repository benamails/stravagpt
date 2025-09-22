export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Strava Connector API</h1>
      <p>This is a proxy API for connecting to Strava. Use the API endpoints to access Strava data.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li><code>/api/test</code> - Health check</li>
        <li><code>/api/auth</code> - Get OAuth URL</li>
        <li><code>/api/auth/callback</code> - OAuth callback</li>
        <li><code>/api/store-token</code> - Store tokens</li>
        <li><code>/api/token-status</code> - Check token status</li>
        <li><code>/api/strava/athlete</code> - Get athlete data</li>
        <li><code>/api/strava/activities</code> - Get activities</li>
        <li><code>/api/strava/activities/[id]</code> - Get specific activity</li>
        <li><code>/api/strava/stats</code> - Get athlete stats</li>
      </ul>
      
      <h2>Authentication Pages:</h2>
      <ul>
        <li><code>/auth/success</code> - Authentication success page</li>
        <li><code>/auth/error</code> - Authentication error page</li>
      </ul>
    </div>
  )
}
