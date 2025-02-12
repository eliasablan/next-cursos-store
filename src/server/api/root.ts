import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { courseRouter } from "./routers/course";
import { subscriptionRouter } from "./routers/subscription";
import { missionRouter } from "./routers/mission";
import { lessonRouter } from "./routers/lesson";
import { uploadThingRouter } from "./routers/uploadthing";
import { paymentRouter } from "./routers/payment";
import { messageRouter } from "./routers/message";
import { documentReviewRouter } from "./routers/document-review";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  course: courseRouter,
  subs: subscriptionRouter,
  mission: missionRouter,
  lesson: lessonRouter,
  uploadThing: uploadThingRouter,
  payment: paymentRouter,
  message: messageRouter,
  documentReview: documentReviewRouter,
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
