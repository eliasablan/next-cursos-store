"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import { FormError } from "./FormError";
import { FormSuccess } from "./FormSuccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const VerificationForm = () => {
  const { update: updateSession } = useSession();

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const verification = api.user.verifyEmail.useMutation({
    onSuccess: async () => {
      setSuccess("Correo verificado!");
      toast.success("Correo verificado!");

      await updateSession();
    },
    onError: (error) => {
      setError(error.message);
      toast.error(error.message);
    },
  });

  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");

  useEffect(() => {
    if (!token) return;
    verification.mutate({
      token,
    });

    return () => {
      verification.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Verificando tu correo.</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center justify-center">
          {!success && !error && (
            <Loader2 className="animate-spin duration-200" />
          )}
          <FormSuccess message={success!} />
          {!success && <FormError message={error!} />}
        </div>
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
};

export default VerificationForm;
