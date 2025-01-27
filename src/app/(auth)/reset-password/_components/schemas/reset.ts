import { z } from "zod";

// (?=.*[a-z])        almenos una letra en minúscula
// (?=.*[A-Z])        almenos una letra en mayúscula
// (?=.*\d)           almenos un número
// (?=.*[@$!%*?&])    almenos un carácter especial

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "La contraseña debe tener al menos 8 caracteres.",
      })
      .refine(
        (value) => {
          const astleastOneLowercase = new RegExp("(?=.*[a-z])");
          return astleastOneLowercase.test(value);
        },
        {
          message:
            "La contraseña debe contener al menos una letra en minúscula.",
        },
      )
      .refine(
        (value) => {
          const atleastOneUppercase = new RegExp("(?=.*[A-Z])");
          return atleastOneUppercase.test(value);
        },
        {
          message:
            "La contraseña debe contener al menos una letra en mayúscula.",
        },
      )
      .refine(
        (value) => {
          const atleastOneNumber = new RegExp("(?=.*\\d)");
          return atleastOneNumber.test(value);
        },
        {
          message: "La contraseña debe contener al menos un número.",
        },
      )
      .refine(
        (value) => {
          const atlestOneSpecialChar = new RegExp("(?=.*[@$!%*?&#._+-])");

          return atlestOneSpecialChar.test(value);
        },
        {
          message: "La contraseña debe contener al menos un carácter especial.",
        },
      )
      .refine(
        (value) => {
          const noSpaces = value.split(" ");
          return noSpaces.length === 1;
        },
        {
          message: "La contraseña no debe contener espacios en blanco.",
        },
      ),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: "Las contraseñas no coinciden.",
      path: ["confirmPassword"],
    },
  );

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
