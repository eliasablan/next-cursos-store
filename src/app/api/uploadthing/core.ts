import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/server/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const uploadThingFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  missionFilesUploader: f({
    image: { maxFileSize: "64MB", maxFileCount: 4 },
    "application/epub+zip": { maxFileSize: "64MB", maxFileCount: 1 },
    pdf: { maxFileSize: "64MB", maxFileCount: 1 },
    text: { maxFileSize: "64MB", maxFileCount: 4 },
    "application/vnd.ms-powerpoint": { maxFileSize: "64MB", maxFileCount: 1 },
    "application/vnd.ms-excel": { maxFileSize: "64MB", maxFileCount: 1 },
    "application/vnd.ms-word.document.macroenabled.12": {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
    "application/msword": { maxFileSize: "64MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("No autorizado.") as Error;

      const { user } = session;
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log(
        "Subida de archivo completa para usuario con id:",
        metadata.userId,
      );

      console.log("url del archivo", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    }),

  profileImageUploader: f({
    image: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("No autorizado.") as Error;

      const { user } = session;
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const {
        user: { id: userId },
      } = metadata;

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: userId,
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    }),

  lessonVideoUploader: f(
    {
      "video/mp4": { maxFileSize: "8GB", maxFileCount: 1 },
      "video/webm": { maxFileSize: "8GB", maxFileCount: 1 },
    },
    { awaitServerData: false },
  )
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("No autorizado.") as Error;

      const { user } = session;
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadError((error) => {
      console.error("Error al subir el video de la lección.", error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    }),
} satisfies FileRouter;

export type UploadThingFileRouter = typeof uploadThingFileRouter;
