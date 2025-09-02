import { redirect } from "next/navigation"
import { supabaseServer } from "@/lib/supabase-server"
import { getOrCreateUserProfile } from "@/lib/database"
import ProfileClient from "@/components/ProfileClient"

export default async function ProfilePage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Get or create user profile if it doesn't exist
  const profile = await getOrCreateUserProfile(
    user.id, 
    user.email!, 
    user.user_metadata?.full_name || user.user_metadata?.name
  )

  return <ProfileClient user={user} profile={profile} />
} 