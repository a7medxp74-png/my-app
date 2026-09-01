import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const ownerEmails = new Set((process.env.OWNER_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (user.email && ownerEmails.has(user.email.toLowerCase())) {
        await db.user.updateMany({ where: { email: user.email }, data: { role: "OWNER", status: "ACTIVE" } });
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.status = user.status;
      }
      return session;
    }
  }
});
