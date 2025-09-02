'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import SignOutButton from './auth/SignOutButton'
import { useUser } from './UserProvider'

interface NavbarProps {
  className?: string
}

export default function Navbar({ className = '' }: NavbarProps) {
  const { user, profile, loading } = useUser()

  return (
    <header className={`bg-white shadow ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/social-metrics-logo.png"
              alt="SocialMetrics Logo"
              width={40}
              height={40}
              className="mr-3"
            />
            <h1 className="text-3xl font-bold text-gray-900">SocialMetrics</h1>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Analytics</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Dashboard
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            View your social media analytics and performance metrics.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/reports"
                        >
                          <div className="text-sm font-medium leading-none">Reports</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Generate detailed performance reports
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/insights"
                        >
                          <div className="text-sm font-medium leading-none">Insights</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Discover trends and audience insights
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/scheduler"
                        >
                          <div className="text-sm font-medium leading-none">Content Scheduler</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Schedule and manage your social media posts
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/competitor"
                        >
                          <div className="text-sm font-medium leading-none">Competitor Analysis</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Monitor your competitors&apos; performance
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  )}
                  href="/settings"
                >
                  Settings
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-3">
                   <Avatar className="h-8 w-8">
                     <AvatarFallback>
                       {profile?.full_name 
                         ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                         : user.email?.[0]?.toUpperCase() || 'U'
                       }
                     </AvatarFallback>
                   </Avatar>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {profile?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <SignOutButton 
                  variant="destructive" 
                  size="sm"
                  className="text-white"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 