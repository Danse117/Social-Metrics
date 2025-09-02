import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import GoogleAuthButton from "@/components/auth/GoogleAuthButton"
import Link from "next/link"

export default function SignUpPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Join SocialMetrics</h1>
          <p className="text-gray-600 mt-2">Create your account to start tracking your social media analytics</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create account</CardTitle>
            <CardDescription className="text-center">
              Get started with your Google account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleAuthButton mode="sign_up" />
            
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/auth/sign-in" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features preview */}
        <div className="mt-8 text-center">
                     <h3 className="text-sm font-medium text-gray-900 mb-3">What you&apos;ll get:</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Multi-platform analytics dashboard</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Real-time engagement tracking</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Comprehensive performance insights</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
} 