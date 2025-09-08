/**
 * Instagram API Integration
 * 
 * This file provides a wrapper class for interacting with Instagram's Basic Display API
 * and Graph API. Handles OAuth authentication flow, token exchange, user profile fetching,
 * and analytics data retrieval. Manages both short-lived and long-lived access tokens
 * for Instagram business and creator accounts.
 */

interface InstagramAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

interface InstagramTokenResponse {
  access_token: string
  user_id: string
  permissions?: string
}

interface InstagramLongLivedTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface InstagramUserProfile {
  id: string
  username: string
  account_type: 'BUSINESS' | 'CREATOR' | 'PERSONAL'
  media_count: number
  followers_count: number
  follows_count: number
  name?: string
  biography?: string
  website?: string
  profile_picture_url?: string
}

export class InstagramAPI {
  private config: InstagramAuthConfig

  constructor() {
    this.config = {
      clientId: process.env.INSTAGRAM_APP_ID!,
      clientSecret: process.env.INSTAGRAM_APP_SECRET!,
      redirectUri: 'https://localhost:3000/api/auth/instagram',
    }

    if (!this.config.clientId || !this.config.clientSecret || !this.config.redirectUri) {
      throw new Error('Instagram API configuration missing. Please check environment variables.')
    }
  }

  /**
   * Generate Instagram OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'instagram_business_basic,instagram_business_manage_insights',
      response_type: 'code',
      ...(state && { state }),
    })

    return `https://www.instagram.com/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for short-lived access token
   */
  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    const formData = new FormData()
    formData.append('client_id', this.config.clientId)
    formData.append('client_secret', this.config.clientSecret)
    formData.append('grant_type', 'authorization_code')
    formData.append('redirect_uri', this.config.redirectUri)
    formData.append('code', code)

    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram token exchange failed: ${error.error_message || response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  /**
   * Exchange short-lived token for long-lived token (60 days)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<InstagramLongLivedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.config.clientSecret,
      access_token: shortLivedToken,
    })

    const response = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Long-lived token exchange failed: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Refresh a long-lived access token
   */
  async refreshToken(accessToken: string): Promise<InstagramLongLivedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: accessToken,
    })

    const response = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Token refresh failed: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get Instagram user profile information
   */
  async getUserProfile(accessToken: string): Promise<InstagramUserProfile> {
    const fields = [
      'id',
      'username', 
      'account_type',
      'media_count',
      'followers_count',
      'follows_count',
      'name',
      'biography',
      'website',
      'profile_picture_url'
    ].join(',')

    const params = new URLSearchParams({
      fields,
      access_token: accessToken,
    })

    const response = await fetch(`https://graph.instagram.com/me?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to fetch Instagram profile: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get Instagram user insights (analytics)
   */
  async getUserInsights(accessToken: string, metrics: string[] = ['followers_count', 'media_count'], period: string = 'day'): Promise<any> {
    const params = new URLSearchParams({
      metric: metrics.join(','),
      period,
      access_token: accessToken,
    })

    const response = await fetch(`https://graph.instagram.com/me/insights?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to fetch Instagram insights: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get Instagram media insights for a specific post
   */
  async getMediaInsights(accessToken: string, mediaId: string, metrics: string[] = ['views', 'likes', 'comments', 'shares']): Promise<any> {
    const params = new URLSearchParams({
      metric: metrics.join(','),
      access_token: accessToken,
    })

    const response = await fetch(`https://graph.instagram.com/${mediaId}/insights?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to fetch media insights: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get user's recent media
   */
  async getUserMedia(accessToken: string, limit: number = 25): Promise<any> {
    const params = new URLSearchParams({
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
      limit: limit.toString(),
      access_token: accessToken,
    })

    const response = await fetch(`https://graph.instagram.com/me/media?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to fetch Instagram media: ${error.error?.message || response.statusText}`)
    }

    return await response.json()
  }
}

export const instagramAPI = new InstagramAPI() 