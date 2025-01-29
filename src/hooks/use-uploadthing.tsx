import { generateReactHelpers } from "@uploadthing/react";
import { type UploadThingFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<UploadThingFileRouter>();
