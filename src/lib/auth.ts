import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { sendVerificationRequest } from "@/lib/email/resend-provider";
import { env } from "@/lib/env";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "noreply@ferrow.app",
      // Use different email providers based on environment
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // Development mode: log to console
        if (process.env.NODE_ENV === "development" && !process.env.EMAIL_SERVER && !process.env.RESEND_API_KEY) {
          console.log("\n🔗 MAGIC LINK (Development Mode):");
          console.log(`📧 To: ${identifier}`);
          console.log(`🔗 Link: ${url}`);
          console.log("\nCopy this link to your browser to sign in\n");
          return;
        }
        
        // Production mode: use Resend if available
        if (process.env.RESEND_API_KEY) {
          return await sendVerificationRequest({ identifier, url, provider });
        }
        
        // Fallback: throw error if no email provider configured
        throw new Error("No email provider configured. Please set up RESEND_API_KEY or EMAIL_SERVER.");
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  debug: env.NODE_ENV === "development",
};