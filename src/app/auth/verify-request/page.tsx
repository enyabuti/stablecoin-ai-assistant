import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/appConfig";

export default function VerifyRequest() {
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
            <CardTitle className="text-2xl">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              A sign in link has been sent to your email address.
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in your email to sign in to {APP_NAME}
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">
                  Try different email
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}