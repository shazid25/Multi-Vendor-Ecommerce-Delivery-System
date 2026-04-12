// import { PrismaClient } from "@prisma/client";
// import "dotenv/config";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Base Prisma Client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Extended Prisma Client (The Fix)
export const xprisma = prisma.$extends({
  query: {
    user: {
      async create({ args, query }) {
        // If emailVerified is passed as a boolean, convert it to null for Postgres
        if (typeof args.data.emailVerified === "boolean") {
          args.data.emailVerified = null;
        }
        return query(args);
      },
      async update({ args, query }) {
        if (typeof args.data.emailVerified === "boolean") {
          args.data.emailVerified = null;
        }
        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;