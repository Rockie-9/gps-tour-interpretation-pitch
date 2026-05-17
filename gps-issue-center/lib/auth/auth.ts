import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

// SPEC §6.5 — NextAuth (Auth.js v5).
// Phase 1: simple email/password (Credentials provider — DEV ONLY).
// Phase 3: TSMC SSO via SAML/OIDC. Provider list is the only thing that
// changes; adapter + Prisma User model stay.

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: { signIn: "/signin" },
  callbacks: {
    async session({ session, user }) {
      // Surface the role on the session object so server actions can
      // call requireRole() without an extra DB hit.
      if (session.user) {
        (session.user as { role?: string }).role = (user as { role?: string }).role;
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    },
  },
  providers: [
    // Phase 1 — email magic link (Resend). No password storage.
    // Provider is intentionally minimal so Phase 3 SSO swap is one PR.
  ],
});
