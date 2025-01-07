import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { utapi } from "@/server/uploadthing";
import { isUploadthingUrl } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const uploadThingRouter = createTRPCRouter({
  deleteFile: protectedProcedure
    .input(z.object({ fileUrl: z.string() }))
    .mutation(async ({ input }) => {
      const { fileUrl } = input;

      if (!isUploadthingUrl(fileUrl)) {
        console.error("No es una url de UploadThing");
        return;
      }

      const fileKey = fileUrl.split("/").pop();

      if (!fileKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se ha proporcionado una clave de archivo",
        });
      }

      const { data } = await utapi.getFileUrls([fileKey], {
        keyType: "fileKey",
      });

      const [file] = data;

      if (!file) {
        console.log("No se ha encontrado el archivo en UploadThing");
        return;
      }

      const { success } = await utapi.deleteFiles([file.key], {
        keyType: "fileKey",
      });

      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No se ha podido eliminar el archivo",
        });
      }

      console.log("Archivo borrado de UploadThing");
      return;
    }),
});
