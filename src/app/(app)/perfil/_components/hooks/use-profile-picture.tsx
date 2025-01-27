// Note: `useUploadThing` is IMPORTED FROM YOUR CODEBASE using the `generateReactHelpers` function
"use client";

import { useState, useCallback, useEffect } from "react";
// import { useDropzone } from "@uploadthing/react";
// import { generateClientDropzoneAccept } from "uploadthing/client";

// import { useUploadThing } from "~/hooks/use-uploadthing";
import { toast } from "sonner";
// import { UploadThingError } from "uploadthing/server";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

export function useProfilePictureInput() {
  const { data: session, update: updateSession } = useSession();

  const [providedFiles, setProvidedFiles] = useState<File[]>(() => []);
  const [previewImage, setPreviewImage] = useState<string>(
    session?.user?.image ?? "",
  );

  const [progress, setProgress] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    loadFiles(acceptedFiles);
  }, []);

  const { mutateAsync: updateUser, isPending: isUpdatingProfilePic } =
    api.user.updateUser.useMutation({
      onSuccess: async () => {
        toast.success("Foto subida correctamente");
        await updateSession();
      },
      onError: (error) => {
        console.error("Error al subir la foto de perfil", error);
        toast.error("Error al subir la foto de perfil");
      },
    });

  // const { mutateAsync: deleteFile, isPending: isDeletingOldProfilePic } =
  //   api.uploadThing.deleteFile.useMutation({
  //     onSuccess: () => {
  //       console.log("La anterior foto de perfil se ha eliminado.");
  //     },
  //     onError: (error) => {
  //       console.error("Error al eliminar la anterior foto de perfil", error);
  //     },
  //   });

  // const {
  //   startUpload,
  //   routeConfig,
  //   isUploading: isUploadingFiles,
  // } = useUploadThing("profileImageUploader", {
  //   onClientUploadComplete: (data) => {
  //     const [uploadedImage] = data;

  //     if (uploadedImage) {
  //       const {
  //         serverData: { fileUrl },
  //       } = uploadedImage;
  //       setPreviewImage(fileUrl);
  //     }

  //     loadFiles([]);
  //   },
  //   onUploadError: (error: Error) => {
  //     if ("error" in error && error.error instanceof UploadThingError) {
  //       console.error("UploadThingError", error.error);
  //     }

  //     console.error(`ERROR! ${error.message}`);

  //     toast.error(
  //       "Ha ocurrido un error al intentar actualizar tu foto de perfil.",
  //     );
  //   },
  //   onUploadProgress: (progress) => {
  //     setProgress(progress);
  //   },
  // });

  // const fileTypes = routeConfig ? Object.keys(routeConfig) : [];

  // const { getRootProps, getInputProps } = useDropzone({
  //   onDrop,
  //   accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  // });

  useEffect(() => {
    const [image] = providedFiles;
    if (image) {
      setPreviewImage(URL.createObjectURL(image));
    }
  }, [providedFiles]);

  const loadFiles = (files: File[]) => {
    setProvidedFiles(files);
  };

  const removeFile = () => {
    const placeholderPreviewImage = session?.user?.image ?? "";
    setPreviewImage(placeholderPreviewImage);
    setProvidedFiles([]);
  };

  // const uploadFiles = async (files: File[]) => {
  //   if (files.length === 0) return { success: true, files: [] };

  //   if (session?.user?.image) {
  //     await deleteFile({ fileUrl: session.user.image });
  //   }

  //   const res = await startUpload(files);

  //   if (!res) return { success: false, files: undefined };

  //   const [uploadedFile] = res.map((file) => {
  //     const { serverData } = file;

  //     return serverData;
  //   });

  //   if (uploadedFile) {
  //     await updateUser({ image: uploadedFile.fileUrl });
  //   } else {
  //     return { success: false, files: undefined };
  //   }
  // };

  return {
    providedFiles,
    previewImage,
    progress,
    // getRootProps,
    // getInputProps,
    // uploadFiles,
    loadFiles,
    removeFile,
    // isUploadingFiles,
    isUpdatingProfilePic,
    // isDeletingOldProfilePic,
  };
}
