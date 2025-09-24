import axios from 'axios';

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  weight: number;
  profile: string;
  follower_count: number;
  friend_count: number;
  athlete_type: number;
  date_preference: string;
  measurement_preference: string;
  clubs: any[];
  bikes: any[];
  shoes: any[];
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  description?: string;
  calories?: number;
  map?: {
    id: string;
    summary_polyline: string;
  };
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  athlete: StravaAthlete;
}

export class StravaClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl = 'https://www.strava.com/api/v3';

  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID!;
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET!;
    this.redirectUri = process.env.STRAVA_REDIRECT_URI!;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Missing required Strava environment variables');
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all,profile:read_all',
      approval_prompt: 'force'
    });

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
    try {
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  async refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    try {
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    try {
      const response = await axios.get(`${this.baseUrl}/athlete`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching athlete:', error);
      throw new Error('Failed to fetch athlete data');
    }
  }

  async getActivities(
    accessToken: string,
    page = 1,
    perPage = 30,
    options?: { before?: number; after?: number }
  ): Promise<StravaActivity[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/athlete/activities`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          page,
          per_page: perPage,
          ...(options?.before ? { before: options.before } : {}),
          ...(options?.after ? { after: options.after } : {})
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }
  }

  async getActivity(accessToken: string, activityId: number): Promise<StravaActivity> {
    try {
      const response = await axios.get(`${this.baseUrl}/activities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity');
    }
  }

  async getAthleteStats(accessToken: string, athleteId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/athletes/${athleteId}/stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching athlete stats:', error);
      throw new Error('Failed to fetch athlete stats');
    }
  }
}

export const stravaClient = new StravaClient();
