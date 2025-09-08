/**
 * Supabase Browser Client
 * 
 * This file creates and configures a Supabase client for client-side operations.
 * Used in React components and browser-side code for database interactions
 * and authentication state management.
 */

import { createBrowserClient } from "@supabase/ssr"

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
} 