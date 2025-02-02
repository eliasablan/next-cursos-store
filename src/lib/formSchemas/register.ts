import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z
      .string()
      .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
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
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
