/**
 * NextAuth Configuration for BusyBeds
 * 
 * Required environment variables:
 * - NEXTAUTH_SECRET: Secret for JWT signing/encryption
 * - NEXTAUTH_URL: Base URL of the application
 * - GOOGLE_CLIENT_ID: Google OAuth client ID (for social login)
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret (for social login)
 * - DATABASE_URL: PostgreSQL connection string
 * 
 * Optional for email verification:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 * 
 * Optional for SMS:
 * - AFRICAS_TALKING_API_KEY, AFRICAS_TALKING_USERNAME
 * 
 * Optional for payments:
 * - PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, PESAPAL_BASE_URL
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { hotelStaff: true },
        });

        if (!user || !user.isActive) {
          throw new Error("Invalid email or account deactivated");
        }

        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
          const remainingMinutes = Math.ceil(
            (new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000)
          );
          throw new Error(
            `Account temporarily locked. Try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`
          );
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          // Increment failed login attempts
          const newFailedAttempts = user.failedLoginAttempts + 1;

          if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            // Lock the account
            await db.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newFailedAttempts,
                lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
              },
            });
            throw new Error(
              `Account locked due to too many failed attempts. Try again in 15 minutes.`
            );
          }

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newFailedAttempts,
            },
          });

          const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;
          throw new Error(
            `Invalid password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining before account lockout.`
          );
        }

        // Successful login - reset failed attempts and clear lockout
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hotelId: user.hotelStaff?.hotelId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in (Google)
      if (account?.provider === "google" && profile?.email) {
        try {
          // Check if user with this email already exists
          const existingUser = await db.user.findUnique({
            where: { email: profile.email },
            include: { accounts: true },
          });

          if (existingUser) {
            // Link Google account to existing user if not already linked
            const existingAccount = existingUser.accounts.find(
              (a) => a.provider === "google"
            );

            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                  type: "oauth",
                  accessToken: account.access_token || null,
                  refreshToken: account.refresh_token || null,
                  expiresAt: account.expires_at || null,
                  tokenType: account.token_type || null,
                  scope: account.scope || null,
                  idToken: account.id_token || null,
                },
              });
            }

            // Update the user object for the session
            user.id = existingUser.id;
            (user as { role: string }).role = existingUser.role;
            (user as { hotelId: string | null }).hotelId = null;

            // Check if user is active
            if (!existingUser.isActive) {
              return false;
            }

            return true;
          } else {
            // Create a new user with GUEST role and auto-verify email
            const newUser = await db.user.create({
              data: {
                name: profile.name || profile.email.split("@")[0],
                email: profile.email,
                passwordHash: "", // No password for OAuth users
                role: "GUEST",
                emailVerified: new Date(), // Auto-verify for OAuth
                phone: null,
                accounts: {
                  create: {
                    provider: "google",
                    providerAccountId: account.providerAccountId,
                    type: "oauth",
                    accessToken: account.access_token || null,
                    refreshToken: account.refresh_token || null,
                    expiresAt: account.expires_at || null,
                    tokenType: account.token_type || null,
                    scope: account.scope || null,
                    idToken: account.id_token || null,
                  },
                },
              },
            });

            user.id = newUser.id;
            (user as { role: string }).role = newUser.role;
            (user as { hotelId: string | null }).hotelId = null;

            return true;
          }
        } catch (error) {
          console.error("OAuth sign-in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.hotelId = (user as { hotelId: string | null }).hotelId;
      }

      // For OAuth providers, ensure role is in the token
      if (account?.provider === "google" && user) {
        token.role = (user as { role: string }).role;
        token.hotelId = (user as { hotelId: string | null }).hotelId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { hotelId: string | null }).hotelId =
          token.hotelId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

/**
 * Dynamically add Google provider if credentials are available.
 * This allows the app to work without Google OAuth configured.
 */
function getAuthOptions(): NextAuthOptions {
  const options = { ...authOptions };

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const GoogleProvider = require("next-auth/providers/google").default;
    options.providers = [
      ...options.providers,
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    ];
  }

  return options;
}

export { getAuthOptions };
