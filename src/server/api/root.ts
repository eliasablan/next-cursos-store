import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { notificationsRouter } from "@/server/api/routers/notification";
import { courseRouter } from "@/server/api/routers/course";
import { lessonRouter } from "@/server/api/routers/lesson";
import { searchRouter } from "@/server/api/routers/search";
import { subscriptionRouter } from "@/server/api/routers/subscription";
import { uploadThingRouter } from "@/server/api/routers/uploadthing";
import { missionRouter } from "@/server/api/routers/mission";
import { reviewDocumentRouter } from "@/server/api/routers/review-document";
import { messageRouter } from "@/server/api/routers/message";
import { whatsappRouter } from "@/server/api/routers/whatsapp";
import { reviewRouter } from "@/server/api/routers/review";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  notification: notificationsRouter,
  course: courseRouter,
  lesson: lessonRouter,
  mission: missionRouter,
  reviewDocument: reviewDocumentRouter,
  message: messageRouter,
  search: searchRouter,
  subscription: subscriptionRouter,
  uploadThing: uploadThingRouter,
  whatsapp: whatsappRouter,
  review: reviewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
