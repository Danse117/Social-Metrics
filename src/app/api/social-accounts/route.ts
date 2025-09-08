import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { getSocialAccounts, deleteSocialAccount, updateSocialAccount } from '@/lib/social-accounts'
import { instagramAPI } from '@/lib/instagram-api'

/**
 * GET /api/social-accounts - Get all social accounts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const socialAccounts = await getSocialAccounts(user.id)
    
    return NextResponse.json({ data: socialAccounts })
  } catch (error) {
    console.error('Error fetching social accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social accounts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social-accounts - Initiate OAuth flow for a platform
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, action } = body

    if (action === 'initiate_auth') {
      if (platform === 'instagram') {
        // Generate state parameter for CSRF protection
        const state = `${user.id}-${Date.now()}`
        const authUrl = instagramAPI.getAuthorizationUrl(state)
        
        return NextResponse.json({ 
          auth_url: authUrl,
          platform: 'instagram'
        })
      } else {
        return NextResponse.json(
          { error: 'Platform not supported yet' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in social accounts POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/social-accounts - Update a social account
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { account_id, updates } = body

    if (!account_id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const updatedAccount = await updateSocialAccount(account_id, updates)
    
    return NextResponse.json({ data: updatedAccount })
  } catch (error) {
    console.error('Error updating social account:', error)
    return NextResponse.json(
      { error: 'Failed to update social account' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social-accounts - Delete a social account
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    console.log(`Deleting social account: ${accountId} for user: ${user.id}`)
    
    const result = await deleteSocialAccount(accountId)
    console.log('Delete result:', result)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account disconnected successfully',
      account_id: accountId 
    })
  } catch (error) {
    console.error('Error deleting social account:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete social account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 