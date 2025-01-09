"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Book,
  Home,
  LibraryBig,
  Rocket,
  Search,
  User,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
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

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

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
          variant="outline"
          size="sm"
          className="relative hidden w-44 rounded-full text-left text-sm md:block"
        >
          <Search className="absolute left-2 size-5" />
          <p className="inline pl-6 font-normal">Buscar</p>
          {/* <kbd className="pointer-events-none absolute right-2 h-5 select-none rounded border px-1.5 font-mono text-sm opacity-100">
            /
          </kbd> */}
        </Button>
        <CommandDialog
          dialogTitle="Buscador"
          onOpenChange={setOpen}
          open={open}
        >
          <CommandInput
            placeholder="Busca..."
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
                <LibraryBig className="mr-2 h-4 w-4" />
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
            <CommandSeparator />
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
                {/* <CommandShortcut className="rounded border bg-muted p-1 text-muted-foreground">
                  ⌘I
                </CommandShortcut> */}
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
                {/* <CommandShortcut className="rounded border bg-muted p-1 text-muted-foreground">
                  ⌘J
                </CommandShortcut> */}
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
                {/* <CommandShortcut className="rounded border bg-muted p-1 text-muted-foreground">
                  ⌘K
                </CommandShortcut> */}
              </CommandItem>
            </CommandGroup>
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
          <Search className="text-accent-foreground size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle hidden>Buscar</DrawerTitle>
        </DrawerHeader>
        <Command>
          <CommandInput
            placeholder="Busca..."
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
                <Book className="mr-2 h-4 w-4" />
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
                <Rocket className="mr-2 h-4 w-4" />
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
            <CommandSeparator />
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
                <CommandShortcut className="bg-muted text-muted-foreground rounded border p-1">
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
                <CommandShortcut className="bg-muted text-muted-foreground rounded border p-1">
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
                <CommandShortcut className="bg-muted text-muted-foreground rounded border p-1">
                  ⌘K
                </CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DrawerContent>
    </Drawer>
  );
}
