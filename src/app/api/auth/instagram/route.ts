import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { instagramAPI } from '@/lib/instagram-api'
import { createSocialAccount, storeAccessToken } from '@/lib/social-accounts'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorReason = searchParams.get('error_reason')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth error:', { error, errorReason, errorDescription })
    return NextResponse.redirect(`${origin}/?error=instagram_auth_failed&reason=${errorReason}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=instagram_auth_failed&reason=no_code`)
  }

  try {
    // Get the authenticated user from Supabase
    const supabase = await supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${origin}/auth/sign-in?error=not_authenticated`)
    }

    // Exchange authorization code for short-lived token
    const tokenResponse = await instagramAPI.exchangeCodeForToken(code)
    
    // Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await instagramAPI.getLongLivedToken(tokenResponse.access_token)
    
    // Get Instagram user profile
    const instagramProfile = await instagramAPI.getUserProfile(longLivedTokenResponse.access_token)

    // Calculate token expiration date
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + longLivedTokenResponse.expires_in)

    // Create social account record
    const socialAccount = await createSocialAccount({
      user_id: user.id,
      platform: 'instagram',
      platform_user_id: instagramProfile.id,
      username: instagramProfile.username,
      display_name: instagramProfile.name || instagramProfile.username,
      avatar_url: instagramProfile.profile_picture_url,
      account_type: instagramProfile.account_type,
      metadata: {
        followers_count: instagramProfile.followers_count,
        follows_count: instagramProfile.follows_count,
        media_count: instagramProfile.media_count,
        biography: instagramProfile.biography,
        website: instagramProfile.website,
      }
    })

    if (!socialAccount) {
      throw new Error('Failed to create social account')
    }

    // Store access token
    await storeAccessToken({
      social_account_id: socialAccount.id,
      access_token: longLivedTokenResponse.access_token,
      token_type: longLivedTokenResponse.token_type,
      expires_at: expiresAt,
      scopes: tokenResponse.permissions?.split(',') || ['instagram_business_basic']
    })

    // Redirect back to dashboard with success
    return NextResponse.redirect(`${origin}/?instagram_connected=true`)

  } catch (error) {
    console.error('Instagram OAuth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(`${origin}/?error=instagram_auth_failed&message=${encodeURIComponent(errorMessage)}`)
  }
} 