import { redirect } from "next/navigation"
import { supabaseServer } from "@/lib/supabase-server"

export default async function SettingsPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Redirect to profile page since settings and profile are similar
  redirect('/profile')
} 