"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Navbar from "@/components/Navbar"
import { useUser } from "@/components/UserProvider"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/lib/database"

interface ProfileClientProps {
  user: User
  profile: UserProfile | null
}

export default function ProfileClient({ user, profile: initialProfile }: ProfileClientProps) {
  const { refreshProfile } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || '',
    email: initialProfile?.email || user.email || ''
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name
        }),
      })

      if (response.ok) {
        await refreshProfile()
        setIsEditing(false)
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: initialProfile?.full_name || '',
      email: initialProfile?.email || user.email || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                             <div className="flex items-center space-x-4">
                 <Avatar className="h-20 w-20">
                   <AvatarFallback className="text-lg">
                     {formData.full_name 
                       ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                       : user.email?.[0]?.toUpperCase() || 'U'
                     }
                   </AvatarFallback>
                 </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{formData.full_name || 'No name set'}</h3>
                  <p className="text-gray-500">{formData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled={true}
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>User ID</Label>
                  <Input value={user.id} disabled className="bg-gray-50 font-mono text-sm" />
                </div>
                <div>
                  <Label>Account Created</Label>
                  <Input 
                    value={new Date(user.created_at).toLocaleDateString()} 
                    disabled 
                    className="bg-gray-50" 
                  />
                </div>
              </div>
              <div>
                <Label>Last Sign In</Label>
                <Input 
                  value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'} 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 