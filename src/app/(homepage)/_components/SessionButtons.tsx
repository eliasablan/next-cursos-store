import React from "react";
import Link from "next/link";
import { auth } from "@/server/auth";

import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ProfileNavigation from "../../../components/ProfileNavigation";

export async function MobileLoginButton() {
  const session = await auth();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (session) return;

  return (
    <SheetFooter>
      <SheetClose asChild>
        <Button asChild>
          <Link href="/ingresar">Ingresa</Link>
        </Button>
      </SheetClose>
    </SheetFooter>
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
    </div>
  );
}
