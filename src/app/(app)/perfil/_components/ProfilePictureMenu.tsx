"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Star, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { type Session } from "next-auth";
import Image from "next/image";

const astronauts = [
  { id: 1, img: "/avatars/astronaut-1.jpg" },
  { id: 2, img: "/avatars/astronaut-2.jpg" },
  { id: 3, img: "/avatars/astronaut-3.jpg" },
  { id: 4, img: "/avatars/astronaut-4.jpg" },
  { id: 5, img: "/avatars/astronaut-5.jpg" },
  { id: 6, img: "/avatars/astronaut-6.jpg" },
  { id: 7, img: "/avatars/astronaut-7.jpg" },
];

export const ProfilePictureMenu = () => {
  const { data: session, update: updateSession } = useSession();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  const { mutateAsync: updateProfilePicture } = api.user.updateUser.useMutation(
    {
      onSuccess: async () => {
        toast.success("Foto de perfil actualizada");
        setOpen(false);
        await updateSession();
      },
      onError: () => {
        toast.error("Error al actualizar la foto de perfil");
      },
    },
  );

  const handleSelectProfilePicture = async ({ image }: { image: string }) => {
    await updateProfilePicture({
      image,
    });
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <UserCircle className="mr-2 h-4 w-4" />
            Cambiar foto de perfil
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elige tu avatar</DialogTitle>
          </DialogHeader>
          <AvatarsGrid
            currentProfilePicture={session?.user?.image}
            handleSelectProfilePicture={handleSelectProfilePicture}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <UserCircle className="mr-2 h-4 w-4" />
          Cambiar foto de perfil
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Elige tu avatar</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <AvatarsGrid
            currentProfilePicture={session?.user?.image}
            handleSelectProfilePicture={handleSelectProfilePicture}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const AvatarsGrid = ({
  currentProfilePicture,
  handleSelectProfilePicture,
}: {
  currentProfilePicture: Session["user"]["image"];
  handleSelectProfilePicture: ({ image }: { image: string }) => Promise<void>;
}) => {
  const utils = api.useUtils();

  const isUpdatingUser = utils.user.updateUser.isMutating();

  return (
    <div className="rounded-lg bg-secondary">
      <div className="grid max-h-80 items-center gap-8 overflow-y-auto overflow-x-hidden p-8 sm:grid-cols-2 lg:grid-cols-3">
        {astronauts.map((astronaut) => (
          <div
            key={astronaut.id}
            className="relative flex flex-col items-center"
          >
            <Button
              variant={"ghost"}
              disabled={
                !!isUpdatingUser || currentProfilePicture === astronaut.img
              }
              onClick={async () => {
                await handleSelectProfilePicture({ image: astronaut.img });
              }}
              className="group flex h-full flex-col items-center justify-center"
            >
              <Avatar className="relative h-24 w-24 transition-transform group-hover:scale-110">
                <AvatarImage
                  asChild
                  src={astronaut.img}
                  alt={`Astronauta #${astronaut.id}`}
                >
                  <Image
                    src={astronaut.img}
                    fill
                    alt={`Astronauta #${astronaut.id}`}
                    sizes="6rem"
                    className="object-cover"
                  />
                </AvatarImage>
              </Avatar>
            </Button>
            {currentProfilePicture === astronaut.img && (
              <div className="absolute left-[76px] top-2 h-full w-full text-xs text-yellow-500">
                <Star fill="currentColor" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
