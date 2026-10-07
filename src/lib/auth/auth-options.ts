import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/auth/validation";
import { findUserByEmail } from "@/lib/auth/user-store";

const sessionMaxAge = Number(process.env.SESSION_EXPIRY_SECONDS) || 86400;

const TIMING_SAFE_HASH = bcrypt.hashSync("beautyiq-invalid-password-placeholder", 12);

function isAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase());
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          await bcrypt.compare("invalid-password", TIMING_SAFE_HASH);
          return null;
        }

        const cleanEmail = parsed.data.email.trim().toLowerCase();
        const user = await findUserByEmail(cleanEmail);

        if (!user) {
          await bcrypt.compare(parsed.data.password, TIMING_SAFE_HASH);
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: isAdminEmail(user.email) ? "admin" : "customer",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
  },
  jwt: {
    maxAge: sessionMaxAge,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = token.role === "admin" ? "admin" : "customer";
      }
      return session;
    },
  },
};
