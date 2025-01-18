"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, User, SettingsIcon } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ProfileNavigation() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-10">
          <Avatar className="size-10 rounded-md md:size-9">
            {session?.user.image ? (
              <AvatarImage
                asChild
                src={session.user.image}
                alt={"Foto de perfil"}
              >
                <Image
                  src={session.user.image}
                  fill
                  alt={"Foto de perfil"}
                  sizes="6rem"
                  className="object-cover"
                />
              </AvatarImage>
            ) : (
              <User className="size-10 p-1 md:size-9" />
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {session ? "Hola, " + session.user.name : "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-4" asChild>
            <Link href="/perfil">
              <span className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-4">
              <div className="flex">
                <SunIcon className="mr-2 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute mr-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Cambiar tema</span>
              </div>
              <span className="sr-only">Toggle theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <SunIcon className="mr-2 h-4 w-4" />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <MoonIcon className="mr-2 h-4 w-4" />
                  Oscuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {session ? (
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/ingresar" })}
          >
            Cerrar sesión
            <svg
              className="absolute right-2"
              height="15"
              width="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0" />
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g id="SVGRepo_iconCarrier">
                <path d="M7.707,8.707,5.414,11H17a1,1,0,0,1,0,2H5.414l2.293,2.293a1,1,0,1,1-1.414,1.414l-4-4a1,1,0,0,1,0-1.414l4-4A1,1,0,1,1,7.707,8.707ZM21,1H13a1,1,0,0,0,0,2h7V21H13a1,1,0,0,0,0,2h8a1,1,0,0,0,1-1V2A1,1,0,0,0,21,1Z" />
              </g>
            </svg>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/ingresar">
              Ingresar
              <svg
                className="absolute right-2"
                height="15"
                width="15"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M20,21V3H13a1,1,0,0,1,0-2h8a1,1,0,0,1,1,1V22a1,1,0,0,1-1,1H13a1,1,0,0,1,0-2ZM2,12a1,1,0,0,0,1,1H14.586l-2.293,2.293a1,1,0,1,0,1.414,1.414l4-4a1,1,0,0,0,0-1.414l-4-4a1,1,0,1,0-1.414,1.414L14.586,11H3A1,1,0,0,0,2,12Z"></path>
                </g>
              </svg>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
