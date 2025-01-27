"use client";

import React from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  UpdatePasswordSchema,
  type UpdatePasswordSchemaType,
} from "./_components/schemas/update-password";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { PasswordInput } from "@/components/ui/password-input";

export default function UpdatePasswordForm() {
  const { data: session, update: updateSession } = useSession();
  const form = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: updatePassword, isPending } =
    api.user.updatePassword.useMutation({
      onSuccess: async () => {
        toast.success("Se ha actualizado tu contraseña");
        await updateSession();
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message);
        console.error(error);
      },
    });

  async function onSubmit(values: UpdatePasswordSchemaType) {
    updatePassword({ ...values });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {session?.user.hasPassword
            ? "Cambiar contraseña"
            : "Añade una contraseña"}
        </CardTitle>
        <CardDescription>
          {session?.user.hasPassword
            ? "Cambia la contraseña de tu cuenta a una más fuerte y segura."
            : "Añade una contraseña a tu cuenta para reforzar tu seguridad."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              {session?.user.hasPassword && (
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="oldPassword">
                          Contraseña actual
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            id="oldPassword"
                            placeholder="******"
                            autoComplete="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">
                        {session?.user.hasPassword
                          ? "Nueva contraseña"
                          : "Contraseña"}
                      </FormLabel>
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
                        Confirmar contraseña
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
              <Button disabled={isPending} type="submit" className="w-max">
                {isPending ? "Guardar..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
