"use client"

import * as React from "react"
import { ProfileSidebar } from "./ProfileSidebar"

// Sample profile data for demonstration
const sampleProfiles = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    platform: "Twitter",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    platform: "Instagram",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    platform: "LinkedIn",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    platform: "Facebook",
  },
]

export function ProfileSidebarDemo() {
  const [activeProfileId, setActiveProfileId] = React.useState("1")

  const handleProfileSwitch = (profileId: string) => {
    setActiveProfileId(profileId)
    console.log(`Switched to profile: ${profileId}`)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ProfileSidebar
        profiles={sampleProfiles}
        activeProfileId={activeProfileId}
        onProfileSwitch={handleProfileSwitch}
      />
      
      {/* Main content area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Social Metrics Dashboard
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Active Profile: {sampleProfiles.find(p => p.id === activeProfileId)?.name}
            </h2>
            <p className="text-gray-600">
              Platform: {sampleProfiles.find(p => p.id === activeProfileId)?.platform}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Click on different profile avatars in the sidebar to switch between accounts.
              The functionality for displaying different metrics will be added later.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 