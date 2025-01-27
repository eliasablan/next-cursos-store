"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "General", href: "/perfil" },
  { label: "Seguridad", href: "/perfil/seguridad" },
];

export default function ProfilePageNav({ className }: { className: string }) {
  const pathname = usePathname();
  return (
    <nav className={cn("grid gap-4 text-sm text-muted-foreground", className)}>
      {navItems.map(({ label, href }, itemIndex) => {
        return (
          <Link
            key={itemIndex}
            href={href}
            className={cn({
              "font-semibold text-primary": pathname === href,
            })}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
