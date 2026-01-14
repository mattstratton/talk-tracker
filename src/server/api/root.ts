import { activityRouter } from "~/server/api/routers/activity";
import { appSettingsRouter } from "~/server/api/routers/appSettings";
import { eventRouter } from "~/server/api/routers/event";
import { eventParticipationRouter } from "~/server/api/routers/eventParticipation";
import { eventScoreRouter } from "~/server/api/routers/eventScore";
import { notificationRouter } from "~/server/api/routers/notification";
import { proposalRouter } from "~/server/api/routers/proposal";
import { scoringCategoryRouter } from "~/server/api/routers/scoringCategory";
import { talkRouter } from "~/server/api/routers/talk";
import { talkTagRouter } from "~/server/api/routers/talkTag";
import { talkTagAssignmentRouter } from "~/server/api/routers/talkTagAssignment";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  activity: activityRouter,
  event: eventRouter,
  eventParticipation: eventParticipationRouter,
  talk: talkRouter,
  proposal: proposalRouter,
  scoringCategory: scoringCategoryRouter,
  eventScore: eventScoreRouter,
  appSettings: appSettingsRouter,
  talkTag: talkTagRouter,
  talkTagAssignment: talkTagAssignmentRouter,
  notification: notificationRouter,
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
