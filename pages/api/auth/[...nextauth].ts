import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/server/prisma";
import { compare, hash } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        const password = credentials?.password;

        if (!username || !password) {
          return null;
        }

        const defaultUsername = (process.env.DEFAULT_ADMIN_USERNAME ?? "admin").trim().toLowerCase();
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? "confraRacha";
        const defaultName = process.env.DEFAULT_ADMIN_NAME ?? "Admin";

        let adminUser = await prisma.adminUser.findUnique({
          where: { username },
        });

        let isPasswordValid = false;

        if (!adminUser && username === defaultUsername && password === defaultPassword) {
          const passwordHash = await hash(defaultPassword, 12);
          adminUser = await prisma.adminUser.create({
            data: {
              username: defaultUsername,
              passwordHash,
              name: defaultName,
            },
          });
          isPasswordValid = true;
        }

        if (!adminUser) {
          return null;
        }

        if (!isPasswordValid) {
          isPasswordValid = await compare(password, adminUser.passwordHash);
        }

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: adminUser.id,
          name: adminUser.name ?? "Administrador",
          email: null,
          username: adminUser.username,
        };
      }
    })
  ],
  pages: {
    // Redireciona o usuário para nossa página de login customizada.
    signIn: "/admin/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.username = typeof token.username === "string" ? token.username : "";
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
