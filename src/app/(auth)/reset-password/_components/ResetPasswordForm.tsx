"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ResetPasswordSchema,
  type ResetPasswordSchemaType,
} from "./schemas/reset";
import { PasswordInput } from "@/components/ui/password-input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: resetPassword, isPending } =
    api.user.resetPassword.useMutation({
      onSuccess: () => {
        toast.success("Se ha actualizado tu contraseña");
        form.reset();

        if (session) {
          router.push("/");
        } else {
          router.push("/ingresar");
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
    });

  // 2. Define a submit handler.
  async function onSubmit(values: ResetPasswordSchemaType) {
    resetPassword({ token: token!, password: values.password });
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Cambio de contraseña</CardTitle>
        <CardDescription>Escribe tu nueva contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        {token && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            id="password"
                            placeholder="******"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="confirmPassword">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            id="confirmPassword"
                            placeholder="******"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button disabled={isPending} type="submit" className="w-full">
                  {isPending ? "Cambiando..." : "Cambiar contraseña"}
                </Button>
              </div>
            </form>
          </Form>
        )}
        <div className="mt-4 text-center text-sm">
          <Link
            href={"/ingresar"}
            className="p-px font-normal underline underline-offset-1"
          >
            Volver al inicio
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
