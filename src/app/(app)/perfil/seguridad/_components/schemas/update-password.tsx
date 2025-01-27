import { z } from "zod";
import { ResetPasswordSchema } from "@/app/(auth)/reset-password/_components/schemas/reset";

export const UpdatePasswordSchema = ResetPasswordSchema.and(
  z.object({
    oldPassword: z.string().optional(),
  }),
);

export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema>;
