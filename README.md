# 🏃‍♂️ Strava GPT Connector

A secure, production-ready API proxy that connects OpenAI GPTs to the Strava API. This service handles OAuth authentication, token management, and provides a clean interface for accessing Strava athlete data, activities, and statistics.

## ✨ Features

- **🔐 Secure OAuth 2.0 Flow**: Complete Strava authentication with automatic token refresh
- **🛡️ API Key Protection**: Private access with custom API key authentication
- **💾 Persistent Token Storage**: Redis-based token storage that survives serverless deployments
- **🔄 Automatic Token Refresh**: Seamless token renewal without user intervention
- **🌐 Vercel Ready**: Optimized for serverless deployment on Vercel
- **🤖 GPT Integration**: OpenAPI 3.1 schema for seamless Custom GPT integration
- **📊 Comprehensive Strava API Access**: Athletes, activities, and statistics endpoints

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Vercel account
- Redis database (Redis Cloud, Upstash, or Railway)
- Strava API application

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd strava-connector
npm install
```

### 2. Create Strava API Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set **Authorization Callback Domain** to: `your-app.vercel.app`
4. Note your `Client ID` and `Client Secret`

### 3. Setup Redis Database

Choose one option:

**Option A: Redis Cloud (Recommended)**
1. Create account at [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Copy the connection string (format: `redis://default:password@host:port`)

**Option B: Upstash**
1. Create account at [Upstash](https://upstash.com/)
2. Create Redis database
3. Copy the connection string

**Option C: Railway**
1. Create account at [Railway](https://railway.app/)
2. Deploy Redis template
3. Copy the connection string

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy. Note your deployment URL (e.g., `https://your-app.vercel.app`).

### 5. Configure Environment Variables

In **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**, add:

```env
# Strava API Credentials
STRAVA_CLIENT_ID=your_client_id_from_strava
STRAVA_CLIENT_SECRET=your_client_secret_from_strava
STRAVA_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback

# API Security - Generate a secure random string
API_KEY=generate_a_secure_random_string_here

# Application URL
BASE_URL=https://your-app.vercel.app

# Redis Connection
REDIS_URL=redis://default:password@your-redis-host:port
```

**⚠️ Important**: 
- Replace `your-app.vercel.app` with your actual Vercel URL
- Generate a secure API key (32+ characters, mix of letters, numbers, symbols)
- Keep your `STRAVA_CLIENT_SECRET` and `API_KEY` secure

### 6. Update Strava App Settings

1. Return to [Strava API Settings](https://www.strava.com/settings/api)
2. Update **Authorization Callback Domain** to your Vercel URL: `your-app.vercel.app`
3. Save changes

### 7. Test Deployment

```bash
# Test API health
curl https://your-app.vercel.app/api/test

# Test authentication (replace YOUR_API_KEY)
curl -H "X-API-Key: YOUR_API_KEY" https://your-app.vercel.app/api/auth
```

## 🤖 GPT Integration

### 1. Create Custom GPT

1. Go to [ChatGPT](https://chat.openai.com/) → **Explore GPTs** → **Create a GPT**
2. Configure your GPT with name, description, and instructions

### 2. GPT Instructions Template

```
You are a Strava fitness assistant that helps users analyze their workout data and training progress.

AUTHENTICATION FLOW:
1. If a user needs to authenticate with Strava, call GET /api/auth to get the OAuth URL
2. Provide the URL to the user and ask them to visit it in their browser
3. After they complete authentication, they'll see a success page confirming tokens are stored
4. You can then access all Strava endpoints without additional authentication

AVAILABLE CAPABILITIES:
- Get athlete profile and statistics (GET /api/strava/athlete)
- Fetch recent activities with pagination (GET /api/strava/activities)
- Get detailed activity information (GET /api/strava/activities/{id})
- Retrieve comprehensive athlete stats (GET /api/strava/stats)
- Check authentication status (GET /api/token-status)

IMPORTANT NOTES:
- All Strava endpoints automatically handle token refresh when needed
- Never ask users for access tokens - they're managed automatically
- If you get "Not authenticated" errors, guide the user through the OAuth flow
- Always provide helpful insights and analysis of fitness data
- Token persistence works across conversations

EXAMPLE WORKFLOW:
User: "Show me my recent running activities"
1. First check if authenticated by calling /api/token-status
2. If not authenticated, call /api/auth and provide OAuth URL
3. If authenticated, call /api/strava/activities with appropriate filters
4. Analyze and present the data with insights

Be encouraging, data-driven, and focus on helping users understand their fitness progress!
```

### 3. Configure Authentication

- **Authentication Type**: `API Key`
- **Auth Type**: `Custom`
- **Custom Header Name**: `X-API-Key`
- **API Key Value**: `your_api_key_from_step_5`

### 4. Import API Schema

1. Go to **Configure** → **Actions** → **Create new action**
2. Import the OpenAPI schema from `openapi-schema-private.json`
3. Update the server URL to your Vercel deployment: `https://your-app.vercel.app`
4. Test the connection

### 5. Test Your GPT

Ask your GPT: *"Can you help me connect to my Strava account and show my recent activities?"*

The GPT should:
1. Check authentication status
2. Provide OAuth URL if needed
3. Guide you through authentication
4. Access your Strava data once authenticated

## 📚 API Reference

### Authentication Endpoints

#### `GET /api/auth`
Get Strava OAuth authorization URL.

**Headers**: `X-API-Key: your_api_key`

**Response**:
```json
{
  "success": true,
  "authUrl": "https://www.strava.com/oauth/authorize?...",
  "message": "Use this URL to authenticate with Strava"
}
```

#### `GET /api/auth/callback`
OAuth callback endpoint (handled automatically).

#### `GET /api/token-status`
Check current authentication status.

**Headers**: `X-API-Key: your_api_key`

**Response**:
```json
{
  "success": true,
  "data": {
    "hasTokens": true,
    "isExpired": false,
    "expires_at": 1640995200,
    "timeUntilExpiry": 3600,
    "athlete": {
      "id": 12345,
      "firstname": "John"
    }
  }
}
```

### Strava Data Endpoints

All endpoints require `X-API-Key` header and handle token refresh automatically.

#### `GET /api/strava/athlete`
Get authenticated athlete's profile.

#### `GET /api/strava/activities`
Get athlete's activities.

**Query Parameters**:
- `per_page` (optional): Number of activities (default: 30, max: 200)
- `page` (optional): Page number for pagination (default: 1)

#### `GET /api/strava/activities/{id}`
Get detailed activity information.

#### `GET /api/strava/stats`
Get athlete's statistics (totals and recent).

### Utility Endpoints

#### `GET /api/test`
Health check and endpoint list.

#### `POST /api/store-token`
Store authentication tokens (used internally).

## 🔧 Development

### Local Development

1. Copy environment variables:
```bash
cp env.example .env.local
```

2. Fill in your local values in `.env.local`

3. Start development server:
```bash
npm run dev
```

4. Test endpoints locally:
```bash
# Health check
curl http://localhost:3000/api/test

# Auth URL (replace with your API key)
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/auth
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # OAuth endpoints
│   │   ├── strava/        # Strava data endpoints
│   │   └── ...            # Utility endpoints
│   ├── auth/              # Authentication pages
│   └── ...                # App pages
├── lib/                   # Shared utilities
│   ├── strava.ts          # Strava API client
│   ├── tokenStorage.ts    # Redis token storage
│   ├── stravaTokens.ts    # Token refresh logic
│   └── auth.ts            # API key validation
├── openapi-schema-private.json  # OpenAPI schema for GPT
└── README.md              # This file
```

### Key Libraries

- **Next.js 14**: React framework with App Router
- **ioredis**: Redis client for token storage
- **TypeScript**: Type safety throughout

## 🔒 Security Considerations

### API Key Management
- Generate a strong, unique API key (32+ characters)
- Store the API key securely in Vercel environment variables
- Never commit API keys to version control
- Rotate API keys periodically

### Token Storage
- Tokens are stored encrypted in Redis with expiration
- Redis connections use secure authentication
- Automatic token refresh minimizes exposure time

### Environment Variables
- All sensitive data stored in environment variables
- Separate environment variables for different deployments
- No sensitive data in application code

### Network Security
- All endpoints require HTTPS in production
- API key validation on all endpoints
- CORS headers configured appropriately

## 🐛 Troubleshooting

### Common Issues

**"Not authenticated" errors**:
- Check that OAuth flow completed successfully
- Verify Redis connection and credentials
- Ensure tokens aren't expired beyond refresh capability

**OAuth callback errors**:
- Verify `STRAVA_REDIRECT_URI` matches Vercel deployment URL
- Check Strava app configuration has correct callback domain
- Ensure callback URL uses HTTPS (not HTTP)

**API key issues**:
- Confirm `X-API-Key` header is included in requests
- Verify API key matches environment variable
- Check for typos in API key

**Redis connection issues**:
- Verify `REDIS_URL` format and credentials
- Test Redis connection independently
- Check Redis database is accessible from Vercel

### Getting Help

1. Check Vercel function logs for detailed error messages
2. Test individual endpoints with curl
3. Verify all environment variables are set correctly
4. Ensure Strava API app configuration is correct

## 📄 License

MIT License - feel free to use this project for your own applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Test with curl commands
4. Verify environment configuration

---

**🎉 Ready to connect your GPT to Strava!** Follow the setup steps above and you'll have a fully functional Strava integration for your Custom GPT.