import React, { Suspense } from "react";
import { PanelLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/server/auth";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import EncryptButton from "@/components/EncryptButton";
import SearchBar from "@/components/SearchBar";
import ProfileNavigation from "@/components/ProfileNavigation";
import { links } from "@/lib/sidebar-links";
import { Separator } from "@/components/ui/separator";
import { HomeNavigation, MobileHomeNavigation } from "./HomeNavigation";

export default async function Header() {
  const session = await auth();
  const role = session?.user.role;

  return (
    <header className="fixed inset-y-0 left-0 right-0 top-0 z-10 flex h-14 items-center justify-between border-y bg-card px-4 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-scroll sm:max-w-xs">
              <div className="flex flex-col justify-between space-y-4 text-lg font-medium">
                <SheetHeader>
                  <SheetTitle>
                    <EncryptButton />
                  </SheetTitle>
                </SheetHeader>

                <MobileHomeNavigation />

                {session ? (
                  <nav className="flex flex-col gap-4 py-4">
                    {links
                      .filter((link) => {
                        return (
                          link.roles.length === 0 || link.roles.includes(role!)
                        );
                      })
                      .map((link) => (
                        <div key={link.href} className="space-y-4">
                          <SheetClose asChild>
                            <Link
                              href={link.href}
                              className="flex items-center gap-4 px-1 text-muted-foreground hover:text-foreground"
                            >
                              <link.icon className="h-5 w-5" />
                              {link.title}
                            </Link>
                          </SheetClose>
                          {link.separator && <Separator />}
                        </div>
                      ))}
                  </nav>
                ) : (
                  <nav className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button size="sm" asChild>
                        <Link href="/ingresar">Ingresa</Link>
                      </Button>
                    </SheetClose>
                  </nav>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <EncryptButton />
        </div>

        <HomeNavigation />

        <div className="flex items-center gap-2">
          <Suspense fallback={<div>Cargando...</div>}>
            <SearchBar />
          </Suspense>
          <Suspense fallback={<div>Cargando...</div>}>
            {session ? (
              <ProfileNavigation />
            ) : (
              <div className="hidden gap-2 md:flex">
                <Button size="sm" asChild>
                  <Link href="/ingresar">Ingresa</Link>
                </Button>
                {/* <Button variant="secondary" size="sm" asChild>
                <Link href="/registro">Regístrate</Link>
                </Button> */}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </header>
  );
}
