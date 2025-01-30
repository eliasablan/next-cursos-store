"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SheetClose } from "./ui/sheet";

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

export function HomeNavigation() {
  const path = usePathname();

  if (path !== "/" && path !== "/acerca") return null;

  return (
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
  );
}

export function MobileHomeNavigation() {
  const path = usePathname();

  if (path !== "/" && path !== "/acerca") return null;

  return (
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
  );
}
