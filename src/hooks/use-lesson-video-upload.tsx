"use client";

import { useDropzone } from "@uploadthing/react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import { useUploadThing } from "@/hooks/use-uploadthing";
import { type LessonSchemaType } from "@/schemas/lesson";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";

export function useLessonVideoUpload({ lesson }: { lesson: LessonSchemaType }) {
  const { slug: courseSlug } = useParams<{ slug: string }>();

  const utils = api.useUtils();

  const { mutateAsync: submitLesson } = api.lesson.updateOrCreate.useMutation({
    onSuccess: async ({ title, video, event }) => {
      console.log("video", video);
      if (event === "UPDATED") {
        if (video) {
          toast.success(`Video de la lección: "${title}" actualizado`);
          return;
        }
        toast.success(`Anterior video de la lección eliminado`);
      }
    },
    onError: (e) => {
      console.error(e.message);
      toast.error("Error al actualizar la lección");
    },
    onSettled: async (data, error) => {
      if (error ?? !data) return;
      const { id } = data;
      await utils.lesson.getLessonById.invalidate({ id });
      await utils.course.getCourseLessons.invalidate({ slug: courseSlug });
    },
  });

  const {
    mutateAsync: deleteLessonVideo,
    isPending: isDeletingOldLessonVideo,
  } = api.uploadThing.deleteFile.useMutation({
    onError: (e) => {
      console.error(e.message);
      toast.error("Error al eliminar el video de la lección");
    },
  });

  const [progress, setProgress] = useState<number>(0);

  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, routeConfig, isUploading } = useUploadThing(
    "lessonVideoUploader",
    {
      onClientUploadComplete: () => {
        toast.success("Video de la lección subido correctamente.");
      },
      onUploadError: (e) => {
        console.error(e.message);
        toast.error("Error al subir el video de la lección.");
      },
      onUploadProgress(p) {
        setProgress(p);
      },
    },
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
  });

  const removeFile = async () => {
    const { video: videoUrl } = lesson;

    if (videoUrl) {
      await deleteLessonVideo({
        fileUrl: videoUrl,
      });

      await submitLesson({
        ...lesson,
        video: null,
      });
    }

    setFiles([]);
  };

  const uploadFiles = async (
    files: File[],
  ): Promise<{ success: boolean; fileUrl: string | null }> => {
    if (files.length === 0) return { fileUrl: null, success: false };

    const res = await startUpload(files);

    if (!res) return { fileUrl: null, success: false };

    const uploadedFilesResults = res.map((file) => {
      const { url } = file;

      return url;
    });

    const [fileUrl] = uploadedFilesResults;

    await removeFile();

    await submitLesson({
      ...lesson,
      video: fileUrl!,
    });

    return { success: true, fileUrl: fileUrl! };
  };

  return {
    files,
    progress,
    setFiles,
    getRootProps,
    getInputProps,
    isUploading,
    isDeletingOldLessonVideo,
    uploadFiles,
    removeFile,
  };
}
