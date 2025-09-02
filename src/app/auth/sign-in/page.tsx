import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import GoogleAuthButton from "@/components/auth/GoogleAuthButton"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <img 
            src="/social-metrics-logo.png" 
            alt="SocialMetrics Logo" 
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Welcome to SocialMetrics</h1>
          <p className="text-gray-600 mt-2">Sign in to access your analytics dashboard</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Use your Google account to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleAuthButton mode="sign_in" />
            
            <div className="text-center text-sm text-gray-600">
                             Don&apos;t have an account?{" "}
              <Link 
                href="/auth/sign-up" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
} 