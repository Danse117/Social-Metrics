"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function SignOutButton({ 
  variant = "outline", 
  size = "default",
  className = "" 
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const supabase = supabaseBrowser()
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error.message)
      } else {
        router.push('/auth/sign-in')
        router.refresh()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  )
} 