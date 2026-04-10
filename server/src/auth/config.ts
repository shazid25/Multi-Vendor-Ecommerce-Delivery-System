import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { emailAndPassword, twoFactor } from "better-auth/plugins";
import { github, google } from "better-auth/social-providers";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
  plugins: [
    emailAndPassword({
      enabled: true,
      requireEmailVerification: false,
    }),
    github({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    twoFactor({
      issuer: "Nexus",
    }),
  ],
  emailVerification: {
    sendVerificationEmail: async (data: any) => {
      console.log(`Verification email would be sent to ${data.user.email}: ${data.url}`);
    },
  },
  passwordReset: {
    sendResetEmail: async (data: any) => {
      console.log(`Password reset email would be sent to ${data.user.email}: ${data.url}`);
    },
  },
}) as any;

export type Session = typeof auth.$Infer.Session;
