import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  accounts,
  resetPasswordTokens,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { Resend } from "resend";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/formSchemas/register";
import { z } from "zod";
import { UpdateUserSchema } from "@/app/(app)/perfil/_components/schemas/update-user";
import { env } from "@/env";
import { EmailTemplate } from "@/app/(auth)/verify-email/_components/EmailTemplate";
import { UpdatePasswordSchema } from "@/app/(app)/perfil/seguridad/_components/schemas/update-password";
import { ForgotPasswordEmailTemplate } from "@/app/(auth)/forgot-password/_components/ForgotPasswordEmailTemplate";
import { ForgotPasswordSchema } from "@/app/(auth)/forgot-password/_components/schemas/forgot-password";
const resend = new Resend(env.RESEND_API_KEY);

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const registeredUser = await ctx.db.query.users.findFirst({
        where: or(eq(users.email, input.email), eq(users.phone, input.phone)),
      });

      if (registeredUser) {
        if (registeredUser.email === input.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este correo electrónico ya está en uso",
          });
        }

        if (registeredUser.phone && registeredUser.phone === input.phone) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este número de teléfono ya está en uso",
          });
        }
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const [user] = await ctx.db
        .insert(users)
        .values({
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
        })
        .returning();

      const { email, name, role, image, id } = user!;

      return {
        email,
        name,
        role,
        image,
        id,
      };
    }),

  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
    }),

  updateUser: protectedProcedure
    .input(UpdateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario no encontrado",
        });
      }

      if (user && user.email !== input.email) {
        await ctx.db.delete(accounts).where(eq(accounts.userId, user.id));
      }

      const existingVerificationToken =
        await ctx.db.query.verificationTokens.findFirst({
          where: eq(verificationTokens.email, user.email),
        });

      if (existingVerificationToken) {
        await ctx.db
          .delete(verificationTokens)
          .where(eq(verificationTokens.email, user.email));
      }

      const changingFields: Partial<z.infer<typeof UpdateUserSchema>> = {};

      if (input.name !== user.name) changingFields.name = input.name;
      if (input.email !== user.email) changingFields.email = input.email;
      if (input.phone !== user.phone) changingFields.phone = input.phone;
      if (input.image !== user.image) changingFields.image = input.image;

      const isEmpty = Object.values(changingFields).every(
        (value) => value === undefined,
      );
      if (isEmpty) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se ha cambiado nada",
        });
      }

      await ctx.db
        .update(users)
        .set(changingFields)
        .where(eq(users.id, user.id));
    }),

  sendVerificationEmail: publicProcedure
    .input(
      z.object({
        emailOrUsername: z.string().email().or(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: or(
          eq(users.email, input.emailOrUsername),
          // eq(users.username, input.emailOrUsername),
        ),
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario no encontrado",
        });
      }

      const existingToken = await ctx.db.query.verificationTokens.findFirst({
        where: eq(verificationTokens.email, user.email),
      });

      if (existingToken) {
        await ctx.db
          .delete(verificationTokens)
          .where(eq(verificationTokens.email, user.email));
      }

      const newToken = {
        email: user.email,
        token: crypto.randomUUID(),
        expires: new Date(Date.now() + 3600 * 1000),
      };

      const results = await ctx.db
        .insert(verificationTokens)
        .values(newToken)
        .returning();

      const [verificationToken] = results;

      const { data, error } = await resend.emails.send({
        from: env.RESEND_EMAIL_SENDER,
        to: user.email,
        subject: "Verificación de correo en IA Coders",
        react: EmailTemplate({
          username: user.email,
          token: verificationToken!.token,
        }),
      });

      if (error) {
        throw new TRPCError({
          message: "Error al enviar el correo",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return data;
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingToken = await ctx.db.query.verificationTokens.findFirst({
        where: eq(verificationTokens.token, input.token),
      });

      if (!existingToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este token no existe",
        });
      }

      const expired = new Date(existingToken.expires) < new Date();
      if (expired) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token caducado",
        });
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, existingToken.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario no encontrado",
        });
      }

      await ctx.db
        .update(users)
        .set({
          emailVerified: new Date(),
        })
        .where(eq(users.email, existingToken.email));

      await ctx.db
        .delete(verificationTokens)
        .where(eq(verificationTokens.email, existingToken.email));

      return {
        message: "Email verified successfully",
      };
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingToken = await ctx.db.query.resetPasswordTokens.findFirst({
        where: eq(resetPasswordTokens.token, input.token),
      });

      if (!existingToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este token no existe",
        });
      }

      const expired = new Date(existingToken.expires) < new Date();

      if (expired) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token caducado",
        });
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, existingToken.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario no encontrado",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      await ctx.db
        .update(users)
        .set({
          password: hashedPassword,
        })
        .where(eq(users.email, existingToken.email));

      await ctx.db
        .delete(resetPasswordTokens)
        .where(eq(resetPasswordTokens.email, existingToken.email));

      return {
        message: "Contraseña cambiada correctamente.",
      };
    }),

  updatePassword: protectedProcedure
    .input(UpdatePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario no encontrado",
        });
      }

      if (input.oldPassword && user.password) {
        const passwordMatch = await bcrypt.compare(
          input.oldPassword,
          user.password,
        );

        if (!passwordMatch) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La vieja contraseña es incorrecta",
          });
        }
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      await ctx.db
        .update(users)
        .set({
          password: hashedPassword,
        })
        .where(eq(users.id, user.id));

      return {
        message: "Contraseña cambiada correctamente.",
      };
    }),

  sendPasswordResetEmail: publicProcedure
    .input(ForgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario no encontrado",
        });
      }

      const existingToken = await ctx.db.query.resetPasswordTokens.findFirst({
        where: eq(resetPasswordTokens.email, user.email),
      });

      if (existingToken) {
        await ctx.db
          .delete(resetPasswordTokens)
          .where(eq(resetPasswordTokens.email, user.email));
      }

      const newToken = {
        email: user.email,
        token: crypto.randomUUID(),
        expires: new Date(Date.now() + 3600 * 1000),
      };

      const results = await ctx.db
        .insert(resetPasswordTokens)
        .values(newToken)
        .returning();

      const [verificationToken] = results;
      const { data, error } = await resend.emails.send({
        from: env.RESEND_EMAIL_SENDER,
        to: user.email,
        subject: "Cambio de contraseña en IA Coders",
        react: ForgotPasswordEmailTemplate({
          username: user.email,
          token: verificationToken!.token,
        }),
      });

      if (error) {
        throw new TRPCError({
          message: "Error al enviar el correo",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return data;
    }),
});
