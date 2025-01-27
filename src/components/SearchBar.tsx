"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookCopy, LibraryBig, Rocket, Search, Sword } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
// import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  // Manejar el montaje del componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar un placeholder mientras se determina el estado del cliente
  if (!mounted) {
    return <Skeleton className="size-10 rounded-md" />;
  }

  // Fetch search results from the server
  // const results = api.search.search.useQuery();

  // Open the drawer when "/" is pressed
  // useEffect(() => {
  //   const down = (e: KeyboardEvent) => {
  //     if (e.key === "/") {
  //       e.preventDefault();
  //       setOpen((open) => !open);
  //     }
  //   };
  //   document.addEventListener("keydown", down);
  //   return () => document.removeEventListener("keydown", down);
  // }, []);

  if (isDesktop) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          variant="outline"
          className="size-10"
        >
          <Search className="size-5 text-accent-foreground" />
        </Button>
        <CommandDialog
          dialogTitle="Buscador"
          onOpenChange={setOpen}
          open={open}
        >
          <CommandInput
            placeholder="Buscar..."
            onValueChange={setSearchValue}
            value={searchValue}
          />
          <CommandList>
            <CommandEmpty>No hay resultados.</CommandEmpty>
            <CommandGroup heading="Cursos">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/cursos");
                }}
                value="Cursos"
              >
                <LibraryBig className="mr-2 h-4 w-4" />
                <span>Cursos</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/mis-cursos");
                }}
                value="Mis cursos"
              >
                <BookCopy className="mr-2 h-4 w-4" />
                <span>Mis cursos</span>
              </CommandItem>
              {/* {searchValue &&
                results.data?.courses?.map((result) => {
                  return (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setSearchValue("");
                        router.push(`/cursos/${result.slug}`);
                      }}
                      key={result.id}
                      value={result.name!}
                    >
                      <Book className="mr-2 h-4 w-4" />
                      <span>{result.name}</span>
                    </CommandItem>
                  );
                })} */}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Misiones">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/misiones");
                }}
                value="Misiones"
              >
                <Rocket className="mr-2 h-4 w-4" />
                <span>Misiones</span>
              </CommandItem>
              {/* {searchValue &&
                results.data?.missions?.map((result) => {
                  if (!result) return null;
                  return (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setSearchValue("");
                        router.push(`/misiones/${result.id}`);
                      }}
                      key={result.id}
                      value={result.title!}
                    >
                      <Rocket className="mr-2 h-4 w-4" />
                      <span>{result.title}</span>
                    </CommandItem>
                  );
                })} */}
            </CommandGroup>
            {/* <CommandSeparator />
            <CommandGroup heading="Otros">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/");
                }}
                value="Inicio"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Inicio</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/perfil");
                }}
                value="Perfil"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
             
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/notificaciones");
                }}
                value="Notificaciones"
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificaciones</span>
         
              </CommandItem>
            </CommandGroup> */}
          </CommandList>
        </CommandDialog>
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          variant="outline"
          className="size-10 md:hidden"
        >
          <Search className="size-5 text-accent-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Buscar</DrawerTitle>
        </DrawerHeader>
        <Command>
          <CommandInput
            placeholder="Buscar..."
            onValueChange={setSearchValue}
            value={searchValue}
          />
          <CommandList>
            <CommandEmpty>No hay resultados.</CommandEmpty>
            <CommandGroup heading="Cursos">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/mis-cursos");
                }}
                value="Mis cursos"
              >
                <BookCopy className="mr-2 h-4 w-4" />
                <span>Mis cursos</span>
              </CommandItem>
              {/* {searchValue &&
                results.data?.courses?.map((result) => {
                  return (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setSearchValue("");
                        router.push(`/cursos/${result.slug}`);
                      }}
                      key={result.id}
                      value={result.name!}
                    >
                      <Book className="mr-2 h-4 w-4" />
                      <span>{result.name}</span>
                    </CommandItem>
                  );
                })} */}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Lecciones">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/misiones");
                }}
                value="Misiones"
              >
                <Sword className="mr-2 h-4 w-4" />
                <span>Misiones</span>
              </CommandItem>
              {/* {searchValue &&
                results.data?.lessons?.map((result) => {
                  return (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setSearchValue("");
                        router.push(`/cursos/${result.course?.slug}`);
                      }}
                      key={result.id}
                      value={result.title}
                    >
                      <Rocket className="mr-2 h-4 w-4" />
                      <span>{result.title}</span>
                    </CommandItem>
                  );
                })} */}
            </CommandGroup>
            {/* <CommandSeparator />
            <CommandGroup heading="Otros">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/");
                }}
                value="Inicio"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Inicio</span>
                <CommandShortcut className="rounded border bg-muted p-1 text-muted-foreground">
                  ⌘I
                </CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/perfil");
                }}
                value="Perfil"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
                <CommandShortcut className="rounded border bg-muted p-1 text-muted-foreground">
                  ⌘J
                </CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                  router.push("/notificaciones");
                }}
                value="Notificaciones"
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificaciones</span>
                <CommandShortcut className="rounded border bg-muted p-1 text-muted-foreground">
                  ⌘K
                </CommandShortcut>
              </CommandItem>
            </CommandGroup> */}
          </CommandList>
        </Command>
      </DrawerContent>
    </Drawer>
  );
}
