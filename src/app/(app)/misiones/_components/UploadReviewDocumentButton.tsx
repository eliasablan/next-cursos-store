"use client";

import { toast } from "sonner";
import { api } from "@/trpc/react";
import { UploadButton } from "@/lib/uploadthing";
import { type ClientUploadedFileData } from "uploadthing/types";

export default function UploadReviewDocumentButton({
  reviewId,
  missionId,
  closed = false,
}: {
  reviewId: string;
  missionId: string;
  closed?: boolean;
}) {
  const utils = api.useUtils();

  const { mutateAsync: uploadFiles, isPending } =
    api.documentReview.create.useMutation({
      onSuccess: () => {
        toast.success("Archivo subido correctamente");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error al subir el archivo");
      },
    });

  const handleCompleteUpload = async (
    res: ClientUploadedFileData<{
      uploadedBy: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    }>[],
  ) => {
    // Do something with the response

    await Promise.allSettled(
      res.map((file) => {
        const createdDocument = uploadFiles({
          fileName: file.name,
          fileUrl: file.url,
          reviewId,
        });
        return createdDocument;
      }),
    );

    await utils.mission.getMissionById.invalidate({ id: missionId });
  };

  return (
    <UploadButton
      className="rounded-md bg-primary px-4 duration-200 hover:bg-primary/75"
      endpoint="missionFilesUploader"
      appearance={{
        allowedContent: "hidden",
        button: closed || isPending ? "!cursor-not-allowed" : "",
      }}
      content={{
        button: ({ isUploading, uploadProgress }) => {
          if (isUploading) return `${uploadProgress}%`;
          return "Subir archivo(s)";
        },
      }}
      disabled={isPending || closed}
      onClientUploadComplete={handleCompleteUpload}
      onUploadError={(error: Error) => {
        // Do something with the error.
        console.error(error);
        toast.error("Error al subir el archivo");
      }}
    />
  );
}
