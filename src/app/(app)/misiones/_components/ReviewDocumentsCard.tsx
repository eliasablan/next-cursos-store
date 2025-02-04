"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { type api as serverApi } from "@/trpc/server";
import { z } from "zod";

type ReviewDocument = Awaited<
  ReturnType<typeof serverApi.mission.getMissionById>
>["reviews"][number]["attachments"][number];

export default function ReviewDocumentsCard({
  missionId,
}: {
  missionId: string;
}) {
  const { data: session } = useSession();

  const [mission] = api.mission.getMissionById.useSuspenseQuery({
    id: missionId,
  });

  const review = mission.reviews.find(
    (review) => review.subscription.studentId === session?.user.id,
  );

  return (
    <>
      {!review?.attachments.length ? (
        <>
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No hay archivos adjuntos a la misión por el momento.
          </div>
        </>
      ) : (
        review?.attachments?.map((document) => {
          return (
            <ReviewDocumentItem
              key={document.id}
              missionId={mission.id}
              reviewDocument={document}
            />
          );
        })
      )}
    </>
  );
}

const NameSchema = z
  .object({
    currentName: z.string(),
    newName: z.string().min(1, "Introduce un nuevo nombre para el documento"),
  })
  .refine(({ currentName, newName }) => newName !== currentName, {
    message: "El archivo ya tiene este nombre",
  });

function ReviewDocumentItem({
  reviewDocument,
  missionId,
}: {
  reviewDocument: ReviewDocument;
  missionId: string;
}) {
  const utils = api.useUtils();

  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const [name, setName] = useState<string>(reviewDocument.name);
  const [error, setError] = useState<string>("");

  const { mutateAsync: changeSolution, isPending: isChangingSolution } =
    api.documentReview.changeSolution.useMutation();

  const { mutateAsync: rename, isPending: isRenaming } =
    api.documentReview.rename.useMutation();

  const { mutateAsync: deleteDocument } =
    api.documentReview.delete.useMutation();

  const { mutateAsync: deleteUTFile } =
    api.uploadThing.deleteFile.useMutation();

  const handleSolutionClick = async () => {
    const changingSolution = changeSolution({
      id: reviewDocument.id,
      solution: !reviewDocument.solution,
    });

    toast.promise(changingSolution, {
      loading: "Modificando documento...",
      success: async (data) => {
        await utils.mission.getMissionById.invalidate({ id: missionId });

        if (!!data?.solution) {
          return `Se ha marcado "${data?.name}" como solución`;
        } else {
          return `Se ha desmarcado "${data?.name}" como solución`;
        }
      },
      error: (error) => {
        return `Error al modificar documento: ${error}`;
      },
    });
  };

  const handleDelete = async () => {
    // Ensure the file is first deleted from uploadthing and then
    // delete the review document from the database
    const deletingDocument = Promise.all([
      deleteUTFile({ fileUrl: reviewDocument.fileUrl }),
      deleteDocument({ id: reviewDocument.id }),
    ]);

    toast.promise(deletingDocument, {
      loading: "Eliminando documento...",
      success: async () => {
        await utils.mission.getMissionById.invalidate({ id: missionId });
        return `"${reviewDocument.name}" eliminado exitosamente`;
      },
      error: (error) => {
        return `Error al eliminar documento: ${error}`;
      },
    });

    setOpenUpdateDialog(false);
  };

  const handleRename = async () => {
    const result = NameSchema.safeParse({
      newName: name,
      currentName: reviewDocument.name,
    });

    // Validates user input
    if (result.error) {
      const [error] = JSON.parse(result.error.message) as Array<{
        code: string;
        message: string;
        path: string[];
      }>;

      setError(error!.message);
      return;
    }

    if (result.success) {
      setError("");
    }

    const renaimingDocument = rename({
      id: reviewDocument.id,
      name,
    });

    toast.promise(renaimingDocument, {
      loading: "Renombrando documento...",
      success: async () => {
        await utils.mission.getMissionById.invalidate({ id: missionId });
        return "Documento renombrado exitosamente";
      },
      error: (error) => {
        return `Error al renombrar documento: ${error}`;
      },
    });

    setOpenUpdateDialog(false);
  };

  useEffect(() => {
    if (!openUpdateDialog) {
      setName(reviewDocument.name);
      setError("");
    }
  }, [openUpdateDialog, reviewDocument]);

  return (
    <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "group relative",
            reviewDocument.solution && "border-2 border-primary",
          )}
        >
          <Image
            src={reviewDocument.fileUrl}
            alt={reviewDocument.name}
            width={300}
            height={300}
            className="h-full w-full cursor-pointer"
          />
          {reviewDocument.solution && (
            <Star className="absolute right-2 top-2 fill-primary text-primary group-hover:animate-spin" />
          )}
          <div className="absolute bottom-0 left-0 right-0 flex w-full cursor-pointer items-center justify-center bg-secondary/50 py-4 text-center transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <p>{reviewDocument.name}</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{reviewDocument.name}</DialogTitle>
        <Link
          href={reviewDocument.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative"
        >
          <Image
            src={reviewDocument.fileUrl}
            alt={reviewDocument.name}
            width={300}
            height={300}
            className="h-full w-full cursor-pointer"
          />
        </Link>
        <Separator />
        <CardFooter className="flex flex-col gap-4 p-0">
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full items-center gap-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Button onClick={handleRename} disabled={isRenaming}>
                Renombrar
              </Button>
            </div>
            {error && (
              <p className={"text-sm font-medium text-destructive"}>{error}</p>
            )}
          </div>
          <Separator />
          <DialogFooter className="flex w-full items-center gap-4">
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant={"destructive"} className="w-full">
                  <Trash className="mr-4 size-4" />
                  Eliminar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar documento permanentemente</DialogTitle>
                </DialogHeader>
                <p>
                  ¿Estás seguro de que quieres eliminar el documento:{" "}
                  {reviewDocument.name}{" "}
                  <span className="font-bold">permanentemente</span>?
                </p>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      onClick={() => handleDelete()}
                      variant={"destructive"}
                    >
                      Eliminar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DialogClose asChild>
              <Button
                onClick={handleSolutionClick}
                disabled={isChangingSolution}
                variant="outline"
                className="w-full"
              >
                <Star
                  className={cn(
                    "mr-4 text-primary",
                    reviewDocument.solution && "fill-primary",
                  )}
                />
                {reviewDocument.solution
                  ? "Desmarcar como solución"
                  : "Marcar como solución"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
}
