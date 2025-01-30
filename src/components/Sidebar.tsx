"use client";

import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { links } from "@/lib/sidebar-links";

export default function Sidebar() {
  const pathname = usePathname();

  const { data: session } = useSession();
  const role = session?.user.role;

  return (
    <div className="group flex h-full flex-col justify-between">
      <nav className="flex h-full flex-col justify-between">
        <div className="flex flex-col justify-between gap-1 p-1">
          {links
            .filter((link) => {
              return link.roles.length === 0 || link.roles.includes(role!);
            })
            .map((link, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      buttonVariants({
                        variant: link.href === pathname ? "secondary" : "ghost",
                        size: "icon",
                      }),
                      "mx-auto",
                    )}
                  >
                    <link.icon className="h-6 w-6" />
                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                </TooltipContent>
                {link.separator && <Separator />}
              </Tooltip>
            ))}
          <Separator />
        </div>
      </nav>
    </div>
  );
}
