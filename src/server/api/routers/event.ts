import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { eventScores, events, scoringCategories } from "~/server/db/schema";

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        cfpDeadline: z.string().optional(),
        cfpUrl: z.string().optional(),
        conferenceWebsite: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(events)
        .values({
          name: input.name,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
          location: input.location ?? null,
          description: input.description ?? null,
          cfpDeadline: input.cfpDeadline ?? null,
          cfpUrl: input.cfpUrl ?? null,
          conferenceWebsite: input.conferenceWebsite ?? null,
          notes: input.notes ?? null,
        })
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create event",
        });
      }

      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        cfpDeadline: z.string().optional(),
        cfpUrl: z.string().optional(),
        conferenceWebsite: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await ctx.db
        .update(events)
        .set(data)
        .where(eq(events.id, id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(events).where(eq(events.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.startDate)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.events.findFirst({
        where: eq(events.id, input.id),
      });
    }),

  getAllWithScores: protectedProcedure.query(async ({ ctx }) => {
    // Get all events
    const allEvents = await ctx.db.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.startDate)],
    });

    // Get all categories to calculate max score
    const categories = await ctx.db.query.scoringCategories.findMany();
    const maxScore = categories.reduce((sum, cat) => sum + 9 * cat.weight, 0);

    // Get threshold setting
    const thresholdSetting = await ctx.db.query.appSettings.findFirst({
      where: (settings, { eq }) => eq(settings.key, "scoring_threshold"),
    });
    const threshold = thresholdSetting ? parseInt(thresholdSetting.value) : 70;

    // Get all event scores
    const allScores = await ctx.db.query.eventScores.findMany({
      with: {
        category: true,
      },
    });

    // Get all participations
    const allParticipations = await ctx.db.query.eventParticipations.findMany();

    // Map events to include score information and participations
    return allEvents.map((event) => {
      const scores = allScores.filter((s) => s.eventId === event.id);
      const totalScore = scores.reduce((sum, score) => {
        return sum + score.score * score.category.weight;
      }, 0);

      const participations = allParticipations.filter(
        (p) => p.eventId === event.id,
      );

      return {
        ...event,
        scoreInfo: {
          totalScore,
          maxScore,
          completionCount: scores.length,
          totalCategories: categories.length,
          isComplete: scores.length === categories.length,
          meetsThreshold: totalScore >= threshold,
          threshold,
        },
        participations,
      };
    });
  }),

  bulkImport: protectedProcedure
    .input(
      z.object({
        events: z.array(
          z.object({
            name: z.string().min(1),
            location: z.string().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            cfpDeadline: z.string().optional(),
            cfpUrl: z.string().optional(),
            conferenceWebsite: z.string().optional(),
            description: z.string().optional(),
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let successCount = 0;
      let failedCount = 0;

      for (const event of input.events) {
        try {
          await ctx.db.insert(events).values({
            name: event.name,
            location: event.location ?? null,
            startDate: event.startDate ?? null,
            endDate: event.endDate ?? null,
            cfpDeadline: event.cfpDeadline ?? null,
            cfpUrl: event.cfpUrl ?? null,
            conferenceWebsite: event.conferenceWebsite ?? null,
            description: event.description ?? null,
            notes: event.notes ?? null,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import event: ${event.name}`, error);
          failedCount++;
        }
      }

      return {
        success: successCount,
        failed: failedCount,
      };
    }),
});
