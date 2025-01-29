import { createRouteHandler } from "uploadthing/next";

import { uploadThingFileRouter } from "./core";
import { env } from "@/env";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: uploadThingFileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
});
