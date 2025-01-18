import React, { Suspense } from "react";
import { PanelLeft } from "lucide-react";
import Link from "next/link";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import EncryptButton from "../../../components/EncryptButton";
import SearchBar from "../../../components/SearchBar";
import { LoginNavigation, MobileLoginButton } from "./SessionButtons";
import { Skeleton } from "@/components/ui/skeleton";

const links = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Cursos",
    href: "/cursos",
  },
  {
    title: "Acerca",
    href: "/acerca",
  },
];

export default function Header() {
  return (
    <header className="fixed inset-y-0 left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-y bg-card px-4 py-2">
      <div className="relative flex w-full items-center justify-between gap-2">
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
                <nav className="flex flex-col gap-4 pt-4">
                  {links.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="flex items-center gap-4 px-1 text-muted-foreground hover:text-foreground"
                      >
                        {link.title}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <MobileLoginButton />
              </div>
            </SheetContent>
          </Sheet>
          <EncryptButton />
        </div>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-4 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 px-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {link.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SearchBar />
          <Suspense
            fallback={<Skeleton className="size-10 rounded-md md:size-9" />}
          >
            <LoginNavigation />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
