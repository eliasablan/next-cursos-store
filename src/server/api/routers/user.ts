import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/formSchemas/register";

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
});
