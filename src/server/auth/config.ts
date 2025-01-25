import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import {
  CredentialsSignin,
  type User,
  type DefaultSession,
  type NextAuthConfig,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { signOut } from "next-auth/react";
import { env } from "@/env";

import { db } from "@/server/db";
import { accounts, sessions, users, type RoleEnum } from "@/server/db/schema";
import { type Adapter } from "next-auth/adapters";
import { loginSchema } from "@/lib/formSchemas/login";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: RoleEnum;
      email: string;
      phone?: string;
      emailVerified?: Date;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   role: RoleEnum;
  // }
}

class NotFoundLoginError extends CredentialsSignin {
  code = "Usuario no encontrado";
}

class InvalidLoginError extends CredentialsSignin {
  code = "Credenciales inválidas";
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  debug: env.NODE_ENV === "development",
  pages: {
    signIn: "/ingresar",
    signOut: "/",
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials): Promise<User | null> {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            throw new NotFoundLoginError();
          }

          const passwordsMatch = await bcrypt.compare(password, user.password!);

          if (passwordsMatch) {
            return user;
          }
        }

        throw new InvalidLoginError();
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }) as Adapter,
  callbacks: {
    jwt: async ({ token }) => {
      if (!token.sub) return token;

      // sub field in the user will have id of that user.
      const user = await db.query.users.findFirst({
        where: eq(users.id, token.sub),
      });

      if (!user) return token;

      token.role = user.role;
      token.name = user.name;
      token.picture = user.image;
      token.email = user.email;
      token.emailVerified = user.emailVerified;
      token.phone = user.phone;
      return token;
    },
    session: async ({ session, token }) => {
      // Validar si el token ha expirado
      if (session.expires && Date.now() >= Number(session.expires) * 1000) {
        // Token expirado, puedes manejarlo aquí
        // Por ejemplo, limpiar la sesión o redirigir al usuario
        await signOut();
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          name: token.name,
          image: token.picture,
          email: token.email,
          emailVerified: token.emailVerified,
          phone: token.phone,
        },
      };
    },
    signIn: async () => {
      return true;
    },
  },
} satisfies NextAuthConfig;
