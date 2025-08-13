import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "noreply@ferrow.app",
      // Development mode: log magic links to console
      ...(process.env.NODE_ENV === "development" && {
        sendVerificationRequest: async ({ identifier, url }) => {
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};