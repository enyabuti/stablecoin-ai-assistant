"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{session.user?.email}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => signIn()}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline ml-2">Sign in</span>
      </Button>
      <Button 
        asChild
        size="sm" 
        className="btn-primary"
      >
        <a href="/auth/signup">
          <span className="hidden sm:inline">Sign up</span>
          <span className="sm:hidden">+</span>
        </a>
      </Button>
    </div>
  );
}