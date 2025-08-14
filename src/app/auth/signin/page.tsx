"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/appConfig";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set mode based on URL parameter
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");
    
    try {
      console.log(`🚀 Attempting to ${mode} with:`, email);
      
      // Use NextAuth for both sign-up and sign-in
      // NextAuth with email provider automatically creates users if they don't exist
      const result = await signIn("email", { 
        email, 
        redirect: false,
        callbackUrl: "/dashboard"
      });
      
      console.log("📬 Authentication result:", result);
      
      if (result?.ok) {
        setIsSubmitted(true);
        console.log("✅ Authentication successful - email should be sent");
      } else if (result?.error) {
        setError(`Authentication failed: ${result.error}`);
        console.error("❌ Authentication failed:", result.error);
      } else {
        setError("Something went wrong. Please try again.");
        console.error("❌ Unknown authentication error:", result);
      }
    } catch (error) {
      console.error(`❌ ${mode} error:`, error);
      setError("Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-modern">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-heading text-foreground">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-body text-foreground">
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-body-small text-foreground-muted">
              Click the link in your email to access your account. If this is your first time, we&apos;ll create your account automatically.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
              Use different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-foreground-muted hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {APP_NAME}
          </Link>
        </div>
        
        <Card className="card-modern">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-heading text-foreground">
              {mode === "signup" ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <p className="text-body text-foreground-muted">
              {mode === "signup" 
                ? "Enter your email to create a new account" 
                : "Enter your email to sign in to your account"
              }
            </p>
          </CardHeader>
          <CardContent>
            {/* Google Sign In */}
            <div className="space-y-4 mb-6">
              <Button 
                type="button"
                onClick={() => {
                  // Check if Google OAuth is configured
                  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
                      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes("demo")) {
                    setError("Google OAuth is in demo mode. Please use email signin or configure real Google OAuth credentials.");
                    return;
                  }
                  signIn("google", { callbackUrl: "/dashboard" });
                }}
                disabled={isLoading}
                className="w-full relative bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center gap-3 text-body font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-body-small">
                  <span className="bg-card px-4 text-foreground-muted">or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-modern"
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {isLoading 
                  ? "Sending..." 
                  : mode === "signup" 
                    ? "Create Account" 
                    : "Sign In"
                }
              </Button>
            </form>
            
            {/* Toggle between sign in and sign up */}
            <div className="mt-4 text-center">
              <p className="text-body-small text-foreground-muted">
                {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
                {" "}
                <Link
                  href={mode === "signup" ? "/auth/signin" : "/auth/signup"}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === "signup" ? "Sign in instead" : "Create account"}
                </Link>
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-caption text-foreground-muted">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline hover:no-underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:no-underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-chatgpt-gradient p-4">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}