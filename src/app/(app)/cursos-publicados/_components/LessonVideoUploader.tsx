"use client";

import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { type LessonSchemaType } from "@/schemas/lesson";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { formatBytes } from "@/lib/utils";
import { useLessonVideoUpload } from "@/hooks/use-lesson-video-upload";

export function LessonVideoUploader({
  lesson,
  fieldOnChange,
}: {
  lesson: LessonSchemaType;
  fieldOnChange: (value: string | null) => void;
}) {
  const {
    files,
    progress,
    setFiles: setProvidedVideo,
    getRootProps,
    getInputProps,
    isUploading,
    isDeletingOldLessonVideo,
    uploadFiles,
    removeFile,
  } = useLessonVideoUpload({ lesson });

  const providedVideo = useMemo(() => {
    if (files.length === 0) return null;
    return files[0];
  }, [files]);

  const handleSubmit = async () => {
    if (providedVideo) {
      const { success, fileUrl } = await uploadFiles([providedVideo]);
      if (success) {
        fieldOnChange(fileUrl);
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        {...getRootProps()}
        className="flex h-48 w-full flex-col justify-center rounded-lg border-2 border-dashed border-foreground bg-muted px-8 hover:border-primary dark:border-muted-foreground"
      >
        <input
          disabled={isUploading || isDeletingOldLessonVideo}
          {...getInputProps()}
        />
        <div>
          {providedVideo ? (
            <div className="flex w-full flex-col items-center gap-2 p-2">
              <span>Video seleccionado</span>
              <span className="text-lg font-bold">{providedVideo.name}</span>
              <span className="font-medium">{providedVideo.type}</span>
              <span className="font-bold">
                {formatBytes(providedVideo.size)}
              </span>
            </div>
          ) : (
            <div className="w-full text-center">
              <p className="text-xl font-bold">Subir video</p>
              <p className="text-muted-foreground">
                Arrastra y suelta el archivo aquí o haz click para
                seleccionarlo.
              </p>
              <p className="font-medium text-muted-foreground">
                ( Solo archivos .mp4 o .webm )
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex w-full flex-1 items-center gap-2">
        <>
          {providedVideo ? (
            <Button
              type="button"
              variant={"destructive"}
              className="w-full"
              onClick={() => {
                setProvidedVideo([]);
                return;
              }}
              disabled={isUploading || isDeletingOldLessonVideo}
            >
              Quitar video
            </Button>
          ) : lesson.video ? (
            <DeleteLessonVideoDialog
              onDeleteHandler={async () => {
                if (lesson.video) {
                  await removeFile();
                  fieldOnChange(null);
                }
              }}
            >
              <Button
                type="button"
                variant={"destructive"}
                className="w-full"
                disabled={isUploading || isDeletingOldLessonVideo}
              >
                {isDeletingOldLessonVideo ? "Eliminando..." : "Eliminar video"}
              </Button>
            </DeleteLessonVideoDialog>
          ) : null}
        </>
        {providedVideo && (
          <Button
            type="button"
            className="w-full"
            onClick={handleSubmit}
            disabled={isUploading || isDeletingOldLessonVideo}
          >
            {isUploading ? `Subiendo... ${Math.round(progress)}%` : "Subir"}
          </Button>
        )}
      </div>
    </div>
  );
}

function DeleteLessonVideoDialog({
  children,
  onDeleteHandler,
}: {
  children: React.ReactNode;
  onDeleteHandler: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar video permanentemente</DialogTitle>
        </DialogHeader>
        <p>
          ¿Estás seguro de que quieres eliminar el video{" "}
          <span className="font-bold">permanentemente</span>?
        </p>
        <DialogFooter>
          <Button
            type="submit"
            onClick={async () => {
              setOpen(false);
              await onDeleteHandler();
            }}
            variant={"destructive"}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
