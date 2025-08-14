"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/appConfig";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subscribeToNewsletter: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeToNewsletter: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Password strength validation
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    const color = colors[score - 1] || "bg-gray-300";

    return { score, feedback, color };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  // Form validation
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Password is too weak";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms of Service";
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log("🚀 Creating account with:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        subscribeToNewsletter: formData.subscribeToNewsletter
      });

      // Here you would typically call your API to create the user
      // For now, we'll simulate the signup process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to verification page or dashboard
      router.push("/auth/verify-request?email=" + encodeURIComponent(formData.email));
      
    } catch (error) {
      console.error("❌ Signup error:", error);
      setErrors({ general: "Failed to create account. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    // Check if we're in demo mode (using demo credentials)
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.includes("demo") || 
        !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setErrors({ 
        general: "Google OAuth is in demo mode. Please use email signup or configure real Google OAuth credentials." 
      });
      return;
    }

    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/dashboard"
      });
    } catch (error) {
      console.error("❌ Google signup error:", error);
      setErrors({ general: "Failed to sign up with Google. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-foreground-muted hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {APP_NAME}
          </Link>
        </div>
        
        <Card className="card-modern">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-heading text-foreground">Create Your Account</CardTitle>
            <p className="text-body text-foreground-muted">
              Join {APP_NAME} and start automating your crypto transactions
            </p>
          </CardHeader>
          
          <CardContent>
            {/* Google Sign Up */}
            <div className="space-y-4 mb-8">
              <Button 
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full relative bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center gap-3 text-body font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? "Signing up..." : "Continue with Google"}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-small font-medium text-foreground mb-2">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`input-modern ${errors.firstName ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-body-small font-medium text-foreground mb-2">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`input-modern ${errors.lastName ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-body-small font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`input-modern pl-10 ${errors.email ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <XCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-body-small font-medium text-foreground mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`input-modern pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-foreground-muted">
                        <p className="font-medium mb-1">Password should include:</p>
                        <ul className="space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <XCircle className="w-3 h-3 mr-1 text-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <XCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-body-small font-medium text-foreground mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`input-modern pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-muted hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <XCircle className="w-3 h-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Newsletter */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-body-small text-foreground cursor-pointer">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline font-medium">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline font-medium">
                        Privacy Policy
                      </Link>
                      {" "}*
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <XCircle className="w-3 h-3 mr-1" />
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={formData.subscribeToNewsletter}
                    onCheckedChange={(checked) => handleInputChange("subscribeToNewsletter", !!checked)}
                    disabled={isLoading}
                  />
                  <label htmlFor="newsletter" className="text-body-small text-foreground-muted cursor-pointer">
                    Send me product updates and crypto automation tips (optional)
                  </label>
                </div>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full btn-primary text-body font-semibold"
                disabled={isLoading || passwordStrength.score < 3}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-body-small text-foreground-muted">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                  Sign in instead
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-background-muted rounded-xl">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-body-small font-medium text-foreground mb-1">
                    Your data is secure
                  </h4>
                  <p className="text-caption text-foreground-muted">
                    We use industry-standard encryption to protect your personal information and never store your passwords in plain text.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}