/**
 * Social Accounts Management
 * 
 * This file handles the management of social media accounts and their authentication tokens.
 * Provides functionality for storing, retrieving, and encrypting OAuth tokens for platforms
 * like Instagram, TikTok, YouTube, and Twitter. Also manages analytics data storage and
 * retrieval from the database with proper token encryption/decryption.
 */

import { supabaseServer } from "./supabase-server"
import crypto from 'crypto'

export interface SocialAccount {
  id: string
  user_id: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
  platform_user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  account_type: string | null
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AccessToken {
  id: string
  social_account_id: string
  access_token: string
  refresh_token: string | null
  token_type: string
  expires_at: string | null
  scopes: string[]
  created_at: string
  updated_at: string
}

export interface InstagramAnalytics {
  id: string
  social_account_id: string
  metric_type: 'profile' | 'media'
  metric_name: string
  metric_value: Record<string, any>
  period: string | null
  media_id: string | null
  date_collected: string
  created_at: string
}

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

if (!ENCRYPTION_KEY) {
  console.error('ENCRYPTION_KEY environment variable is required for token storage')
}

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':')
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted token format')
  }
  
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Get all social accounts for a user
 */
export async function getSocialAccounts(userId: string): Promise<SocialAccount[]> {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching social accounts:', error)
    throw new Error('Failed to fetch social accounts')
  }

  return data || []
}

/**
 * Get a specific social account by ID
 */
export async function getSocialAccount(accountId: string): Promise<SocialAccount | null> {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching social account:', error)
    return null
  }

  return data
}

/**
 * Create a new social account
 */
export async function createSocialAccount(accountData: {
  user_id: string
  platform: SocialAccount['platform']
  platform_user_id: string
  username: string
  display_name?: string
  avatar_url?: string
  account_type?: string
  metadata?: Record<string, any>
}): Promise<SocialAccount | null> {
  const supabase = await supabaseServer()

  // First, set all other accounts of this platform to inactive
  await supabase
    .from('social_accounts')
    .update({ is_active: false })
    .eq('user_id', accountData.user_id)
    .eq('platform', accountData.platform)

  const { data, error } = await supabase
    .from('social_accounts')
    .insert([{
      ...accountData,
      is_active: true, // New account becomes active by default
      metadata: accountData.metadata || {}
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating social account:', error)
    throw new Error('Failed to create social account')
  }

  return data
}

/**
 * Update a social account
 */
export async function updateSocialAccount(
  accountId: string,
  updates: Partial<Pick<SocialAccount, 'display_name' | 'avatar_url' | 'account_type' | 'is_active' | 'metadata'>>
): Promise<SocialAccount | null> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('social_accounts')
    .update(updates)
    .eq('id', accountId)
    .select()
    .single()

  if (error) {
    console.error('Error updating social account:', error)
    throw new Error('Failed to update social account')
  }

  return data
}

/**
 * Delete a social account and its associated tokens
 */
export async function deleteSocialAccount(accountId: string): Promise<boolean> {
  const supabase = await supabaseServer()

  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('id', accountId)

  if (error) {
    console.error('Error deleting social account:', error)
    throw new Error('Failed to delete social account')
  }

  return true
}

/**
 * Store access token for a social account
 */
export async function storeAccessToken(tokenData: {
  social_account_id: string
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_at?: Date
  scopes?: string[]
}): Promise<AccessToken | null> {
  const supabase = await supabaseServer()

  const encryptedToken = encryptToken(tokenData.access_token)
  const encryptedRefreshToken = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null

  const { data, error } = await supabase
    .from('access_tokens')
    .upsert([{
      social_account_id: tokenData.social_account_id,
      access_token: encryptedToken,
      refresh_token: encryptedRefreshToken,
      token_type: tokenData.token_type || 'bearer',
      expires_at: tokenData.expires_at?.toISOString(),
      scopes: tokenData.scopes || []
    }])
    .select()
    .single()

  if (error) {
    console.error('Error storing access token:', error)
    throw new Error('Failed to store access token')
  }

  return data
}

/**
 * Get access token for a social account
 */
export async function getAccessToken(socialAccountId: string): Promise<string | null> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('access_tokens')
    .select('access_token, expires_at')
    .eq('social_account_id', socialAccountId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching access token:', error)
    return null
  }

  if (!data) {
    return null
  }

  // Check if token is expired
  if (data.expires_at && new Date(data.expires_at) <= new Date()) {
    console.warn('Access token is expired')
    return null
  }

  try {
    if (!ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY not configured - cannot decrypt token')
      return null
    }
    return decryptToken(data.access_token)
  } catch (error) {
    console.error('Error decrypting access token:', error)
    console.error('This might be due to missing ENCRYPTION_KEY environment variable')
    return null
  }
}

/**
 * Update access token for a social account
 */
export async function updateAccessToken(
  socialAccountId: string,
  tokenData: {
    access_token: string
    expires_at?: Date
    scopes?: string[]
  }
): Promise<boolean> {
  const supabase = await supabaseServer()

  const encryptedToken = encryptToken(tokenData.access_token)

  const { error } = await supabase
    .from('access_tokens')
    .update({
      access_token: encryptedToken,
      expires_at: tokenData.expires_at?.toISOString(),
      scopes: tokenData.scopes
    })
    .eq('social_account_id', socialAccountId)

  if (error) {
    console.error('Error updating access token:', error)
    return false
  }

  return true
}

/**
 * Store Instagram analytics data
 */
export async function storeInstagramAnalytics(analyticsData: {
  social_account_id: string
  metric_type: 'profile' | 'media'
  metric_name: string
  metric_value: Record<string, any>
  period?: string
  media_id?: string
  date_collected?: Date
}): Promise<InstagramAnalytics | null> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('instagram_analytics')
    .upsert([{
      ...analyticsData,
      date_collected: analyticsData.date_collected?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    }])
    .select()
    .single()

  if (error) {
    console.error('Error storing Instagram analytics:', error)
    throw new Error('Failed to store analytics data')
  }

  return data
}

/**
 * Get Instagram analytics for a social account
 */
export async function getInstagramAnalytics(
  socialAccountId: string,
  metricType?: 'profile' | 'media',
  dateRange?: { start: Date; end: Date }
): Promise<InstagramAnalytics[]> {
  const supabase = await supabaseServer()

  let query = supabase
    .from('instagram_analytics')
    .select('*')
    .eq('social_account_id', socialAccountId)

  if (metricType) {
    query = query.eq('metric_type', metricType)
  }

  if (dateRange) {
    query = query
      .gte('date_collected', dateRange.start.toISOString().split('T')[0])
      .lte('date_collected', dateRange.end.toISOString().split('T')[0])
  }

  const { data, error } = await query.order('date_collected', { ascending: false })

  if (error) {
    console.error('Error fetching Instagram analytics:', error)
    throw new Error('Failed to fetch analytics data')
  }

  return data || []
} 