import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createUserProfile, getUserProfile } from '@/lib/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await supabaseServer()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user profile exists, if not create it
        let userProfile = await getUserProfile(user.id)
        
        if (!userProfile) {
          // Create user profile from Google auth data
          userProfile = await createUserProfile({
            user_id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name
          })
        }
      }
      
      // Successful authentication, redirect to the intended page
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Authentication failed, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_failed`)
} 