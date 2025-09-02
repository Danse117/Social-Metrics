import { supabaseServer } from "./supabase-server"

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function getOrCreateUserProfile(userId: string, email: string, fullName?: string): Promise<UserProfile | null> {
  // First try to get existing profile
  let profile = await getUserProfile(userId)
  
  if (!profile) {
    // Create profile if it doesn't exist
    profile = await createUserProfile({
      user_id: userId,
      email: email,
      full_name: fullName
    })
  }
  
  return profile
}

export async function createUserProfile(userData: {
  user_id: string
  email: string
  full_name?: string
}): Promise<UserProfile | null> {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([userData])
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Pick<UserProfile, 'full_name'>>
): Promise<UserProfile | null> {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
} 