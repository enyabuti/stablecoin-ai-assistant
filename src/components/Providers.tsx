"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { PWAInstaller } from "./PWAInstaller";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <PWAInstaller />
    </SessionProvider>
  );
}