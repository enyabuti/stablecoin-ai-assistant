import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || "smtp://user:pass@localhost:587",
      from: process.env.EMAIL_FROM || "dev@ferrow.app",
      // For development: log emails to console instead of sending
      ...(process.env.NODE_ENV === "development" && !process.env.EMAIL_SERVER && {
        sendVerificationRequest: async ({ identifier, url, provider }) => {
          console.log("\n🔗 MAGIC LINK (Development Mode):");
          console.log(`📧 To: ${identifier}`);
          console.log(`🔗 Link: ${url}`);
          console.log("\nCopy this link to your browser to sign in\n");
        },
      }),
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