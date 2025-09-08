/**
 * Social Accounts Hook
 * 
 * This custom React hook manages the state and operations for social media accounts.
 * Provides functionality to fetch, update, delete, and set active social accounts.
 * Handles OAuth redirect success detection and automatic account refresh.
 * Returns account data, loading states, and methods for account management.
 */

"use client"

import { useState, useEffect } from 'react'
import { SocialAccount } from '@/lib/social-accounts'

interface UseSocialAccountsReturn {
  socialAccounts: SocialAccount[]
  loading: boolean
  error: string | null
  activeAccount: SocialAccount | null
  setActiveAccount: (accountId: string) => void
  refreshAccounts: () => Promise<void>
  deleteAccount: (accountId: string) => Promise<void>
}

export function useSocialAccounts(): UseSocialAccountsReturn {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)

  const fetchSocialAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/social-accounts')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch social accounts')
      }

      setSocialAccounts(result.data || [])
      
      // Set active account to the first active one, or first one if none active
      const activeAccount = result.data?.find((account: SocialAccount) => account.is_active)
      const firstAccount = result.data?.[0]
      setActiveAccountId(activeAccount?.id || firstAccount?.id || null)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching social accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const setActiveAccount = async (accountId: string) => {
    try {
      // Update active status in database
      const response = await fetch('/api/social-accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          account_id: accountId, 
          updates: { is_active: true } 
        })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update active account')
      }

      // Update local state
      setSocialAccounts(prev => 
        prev.map(account => ({
          ...account,
          is_active: account.id === accountId
        }))
      )
      setActiveAccountId(accountId)
      
    } catch (err) {
      console.error('Error setting active account:', err)
      setError(err instanceof Error ? err.message : 'Failed to set active account')
    }
  }

  const deleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/social-accounts?account_id=${accountId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete account')
      }

      // Remove from local state
      setSocialAccounts(prev => prev.filter(account => account.id !== accountId))
      
      // If deleted account was active, set new active account
      if (activeAccountId === accountId) {
        const remainingAccounts = socialAccounts.filter(account => account.id !== accountId)
        setActiveAccountId(remainingAccounts[0]?.id || null)
      }
      
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    }
  }

  const refreshAccounts = async () => {
    await fetchSocialAccounts()
  }

  // Initial fetch
  useEffect(() => {
    fetchSocialAccounts()
  }, [])

  // Handle OAuth success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('instagram_connected') === 'true') {
      // Refresh accounts after successful Instagram connection
      refreshAccounts()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const activeAccount = socialAccounts.find(account => account.id === activeAccountId) || null

  return {
    socialAccounts,
    loading,
    error,
    activeAccount,
    setActiveAccount,
    refreshAccounts,
    deleteAccount
  }
} 