import React from "react";
import Link from "next/link";
import { auth } from "@/server/auth";

import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ProfileNavigation from "../../../components/ProfileNavigation";

export async function MobileLoginButton() {
  const session = await auth();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!session) return;

  return (
    <nav className="flex flex-col gap-2">
      <SheetClose asChild>
        <Button size="sm" asChild>
          <Link href="/ingresar">Ingresa</Link>
        </Button>
      </SheetClose>
      <SheetClose asChild>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/registro">Regístrate</Link>
        </Button>
      </SheetClose>
    </nav>
  );
}

export async function LoginNavigation() {
  const session = await auth();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (session) return <ProfileNavigation />;

  return (
    <div className="hidden gap-2 md:flex">
      <Button size="sm" asChild>
        <Link href="/ingresar">Ingresa</Link>
      </Button>
      <Button variant="secondary" size="sm" asChild>
        <Link href="/registro">Regístrate</Link>
      </Button>
    </div>
  );
}
