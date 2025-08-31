"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  name: string
  avatar: string
  platform: string
  isActive?: boolean
}

interface ProfileSidebarProps {
  profiles: Profile[]
  activeProfileId?: string
  onProfileSwitch?: (profileId: string) => void
  className?: string
}

export function ProfileSidebar({
  profiles,
  activeProfileId,
  onProfileSwitch,
  className,
}: ProfileSidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full w-20 flex-col items-center gap-2 bg-gray-500 p-2 backdrop-blur-sm rounded-3xl",
        className
      )}
    >
      {/* Main app icon/logo */}
      <div className="mb-4 mt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-600 text-white hover:rounded-2xl hover:bg-indigo-500 transition-all duration-200 cursor-pointer">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px w-8 bg-gray-700" />

      {/* Profile avatars */}
      <div className="flex flex-col items-center gap-2">
        {profiles.map((profile) => (
          <Button
            key={profile.id}
            variant="ghost"
            size="icon"
            className={cn(
              "group relative h-12 w-12 rounded-3xl bg-gray-700 hover:rounded-2xl hover:bg-gray-600 transition-all duration-200",
              activeProfileId === profile.id && "rounded-2xl bg-indigo-600 hover:bg-indigo-500"
            )}
            onClick={() => onProfileSwitch?.(profile.id)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-gray-600 text-white text-sm font-medium">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Active indicator */}
            {activeProfileId === profile.id && (
              <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white" />
            )}
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 z-50 hidden group-hover:block">
              <div className="rounded-md bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap">
                {profile.name}
                <div className="text-xs text-gray-400">{profile.platform}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Add new profile button */}
      <div className="mt-auto mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-3xl bg-gray-700 hover:rounded-2xl hover:bg-green-600 hover:bg-opacity-80 transition-all duration-200"
        >
          <svg
            className="h-6 w-6 text-gray-400 hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </Button>
      </div>
    </div>
  )
} 