"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddProfileModal } from "@/components/modals/AddProfileModal"
import { SocialAccount } from "@/lib/social-accounts"

interface ProfileSidebarProps {
  socialAccounts: SocialAccount[]
  activeAccountId?: string
  onAccountSwitch?: (accountId: string) => void
  onAddAccount?: () => void
  className?: string
}

export function ProfileSidebar({
  socialAccounts,
  activeAccountId,
  onAccountSwitch,
  onAddAccount,
  className,
}: ProfileSidebarProps) {
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)

  const handleAddClick = () => {
    setShowAddModal(true)
    onAddAccount?.()
  }

  const handlePlatformSelect = async (platform: string) => {
    if (platform === 'instagram') {
      setIsConnecting(true)
      try {
        // Call API to initiate Instagram OAuth
        const response = await fetch('/api/social-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: 'instagram', action: 'initiate_auth' })
        })

        const data = await response.json()
        
        if (data.auth_url) {
          // Redirect to Instagram OAuth
          window.location.href = data.auth_url
        } else {
          console.error('Failed to get Instagram auth URL')
        }
      } catch (error) {
        console.error('Error initiating Instagram auth:', error)
        setIsConnecting(false)
      }
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return (
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
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

        {/* Social account avatars */}
        <div className="flex flex-col items-center gap-2">
          {socialAccounts.map((account) => (
            <Button
              key={account.id}
              variant="ghost"
              size="icon"
              className={cn(
                "group relative h-12 w-12 rounded-3xl bg-gray-700 hover:rounded-2xl hover:bg-gray-600 transition-all duration-200",
                activeAccountId === account.id && "rounded-2xl bg-indigo-600 hover:bg-indigo-500"
              )}
              onClick={() => onAccountSwitch?.(account.id)}
            >
              <Avatar className="h-10 w-10 m-1">
                <AvatarImage src={account.avatar_url || ''} alt={account.display_name || account.username} />
                <AvatarFallback className="bg-gray-600 text-white text-sm font-medium">
                  {(account.display_name || account.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Platform indicator */}
              {getPlatformIcon(account.platform)}
              
              {/* Active indicator */}
              {activeAccountId === account.id && (
                <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white" />
              )}
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 z-50 hidden group-hover:block">
                <div className="rounded-md bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap">
                  {account.display_name || account.username}
                  <div className="text-xs text-gray-400">@{account.username}</div>
                  <div className="text-xs text-gray-400 capitalize">{account.platform}</div>
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
            onClick={handleAddClick}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <svg className="h-6 w-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
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
            )}
          </Button>
        </div>
      </div>

      {/* Add Profile Modal */}
      <AddProfileModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPlatformSelect={handlePlatformSelect}
      />
    </>
  )
} 