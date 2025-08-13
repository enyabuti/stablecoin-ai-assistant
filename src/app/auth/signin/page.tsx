"use client";

import { useState, useEffect, Suspense } from "react";
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
      if (mode === "signup") {
        console.log("🔐 Attempting to register:", email);
        
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        console.log("📝 Registration result:", data);
        
        if (data.success) {
          setIsSubmitted(true);
          console.log("✅ Registration successful - email should be sent");
        } else if (data.userExists) {
          setError("User already exists. Please sign in instead.");
          setMode("signin");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        
      } else {
        console.log("🚀 Attempting to sign in with:", email);
        
        const result = await signIn("email", { 
          email, 
          redirect: false,
          callbackUrl: "/dashboard"
        });
        
        console.log("📬 Sign in result:", result);
        
        if (result?.ok) {
          setIsSubmitted(true);
          console.log("✅ Sign in successful - email should be sent");
        } else if (result?.error) {
          if (result.error.includes("User not found") || result.error.includes("No user found")) {
            setError("No account found with this email. Please sign up first.");
            setMode("signup");
          } else {
            setError(`Authentication failed: ${result.error}`);
          }
          console.error("❌ Sign in failed:", result.error);
        } else {
          setError("Something went wrong. Please try again.");
          console.error("❌ Unknown sign in error:", result);
        }
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
      <div className="min-h-screen flex items-center justify-center bg-chatgpt-gradient p-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "signup" 
                ? "Click the link in your email to activate your new account and sign in."
                : "Click the link in your email to sign in to your account."
              }
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
    <div className="min-h-screen flex items-center justify-center bg-chatgpt-gradient p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {APP_NAME}
          </Link>
        </div>
        
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {mode === "signup" ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <p className="text-muted-foreground">
              {mode === "signup" 
                ? "Enter your email to create a new account" 
                : "Enter your email to sign in to your account"
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-glass"
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
              <p className="text-sm text-muted-foreground">
                {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
                {" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signup" ? "signin" : "signup");
                    setError("");
                  }}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  {mode === "signup" ? "Sign in instead" : "Create account"}
                </button>
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
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