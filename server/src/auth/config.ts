// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "../lib/prisma.js";

// export const auth = betterAuth({
//   debug: true,
//   database: prismaAdapter(prisma, {
//     provider: "postgresql",
//   }),
//   secret: process.env.BETTER_AUTH_SECRET || "a-very-secret-key-12345",
//   baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000/api/auth",
//   trustedOrigins: [
//     process.env.CLIENT_URL || "http://localhost:3000",
//     "http://localhost:3000",
//     "http://localhost:3001"
//   ],
//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: true,
//     requireEmailVerification: false,
//   },
//   session: {
//     expiresIn: 60 * 60 * 24 * 30, // 30 days
//     updateAge: 60 * 60 * 24 * 1, // 1 day
//     cookieCache: {
//       enabled: true,
//       maxAge: 5 * 60, // 5 minutes
//     },
//   },
// });

// export type Session = typeof auth.$Infer.Session;



import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { xprisma } from "../lib/prisma.js"; // Import the extended client

export const auth = betterAuth({
  debug: true,
  database: prismaAdapter(xprisma, { // Use xprisma here
    provider: "postgresql",
    map: {
      user: {
        emailVerified: "emailVerified",
      },
    },
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
      },
      emailVerified: {
        type: "date",
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET || "a-very-secret-key-12345",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000/api/auth",

  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 1,
    cookieCache: {
      enabled: false,
    },
  },
});

export type Session = typeof auth.$Infer.Session;