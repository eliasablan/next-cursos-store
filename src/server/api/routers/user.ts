import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  users,
  roles,
  verificationTokens,
  resetPasswordTokens,
  accounts,
} from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { SignUpSchema } from "@/app/registro/_components/schemas/signup";
import { EmailTemplate } from "@/app/verify-email/_components/EmailTemplate";
import { Resend } from "resend";
import { env } from "@/env";
import { ForgotPasswordEmailTemplate } from "@/app/forgot-password/_components/ForgotPasswordEmailTemplate";
import { UpdateUserSchema } from "@/app/perfil/_components/schemas/update-user";
import { UpdatePasswordSchema } from "@/app/perfil/seguridad/_components/schemas/update-password";
import { ForgotPasswordSchema } from "@/app/forgot-password/_components/schemas/forgot-password";

const resend = new Resend(env.RESEND_API_KEY);

export const userRouter = createTRPCRouter({
  setRole: publicProcedure
    .input(z.object({ role: z.enum(roles.enumValues), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.db
        .update(users)
        .set({
          role: input.role,
        })
        .where(eq(users.id, input.id))
        .returning();

      const [user] = response;

      const newRole = user!.role;

      return { newRole };
    }),

  getUsers: publicProcedure.query(async ({ ctx }) => {
    const response = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        image: users.image,
      })
      .from(users);

    return response;
  }),

  getStudents: publicProcedure.query(async ({ ctx }) => {
    const response = await ctx.db.query.users.findMany({
      where: eq(users.role, "student"),
      columns: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        phone: true,
        emailVerified: true,
      },
      with: {
        subscriptions: {
          with: {
            course: true,
          },
        },
      },
    });

    return response;
  }),

  register: publicProcedure
    .input(SignUpSchema)
    .mutation(async ({ ctx, input }) => {
      const registeredUser = await ctx.db.query.users.findFirst({
        where: or(
          eq(users.username, input.username),
          eq(users.email, input.email),
          input.phone ? eq(users.phone, input.phone) : undefined,
        ),
      });

      if (registeredUser) {
        if (registeredUser.username === input.username) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este nombre de usuario ya está en uso",
          });
        }

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
          username: input.username,
          email: input.email,
          password: hashedPassword,
          // Using the nullish coalescing operator (??) will set the field value to an empty string
          // thus in the next registration a unique constraint error will be thrown.
          // Thi is the reason why the ternary operator is used.
          phone: input.phone ? input.phone : null,
        })
        .returning();

      const { email, name, username, role, image, id } = user!;

      return {
        email,
        name,
        username,
        role,
        image,
        id,
      };
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
      if (input.username !== user.username)
        changingFields.username = input.username;
      if (input.name !== user.name) changingFields.name = input.name;
      if (input.email !== user.email) changingFields.email = input.email;
      if (input.image !== user.image) changingFields.image = input.image;
      if (input.phone !== user.phone) changingFields.phone = input.phone;

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

  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        columns: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const response = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
        columns: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return response;
    }),

  // fileKey is the UT key of the file to be deleted
  // The procedure must be public otherwise UploadThing will throw an unauthorized error

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
          eq(users.username, input.emailOrUsername),
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
          username: user.username,
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
        message: "Correo verificado correctamente",
      };
    }),
  sendPasswordResetEmail: publicProcedure
    .input(ForgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: or(
          eq(users.email, input.emailOrUsername),
          eq(users.username, input.emailOrUsername),
        ),
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
          username: user.username,
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
});
