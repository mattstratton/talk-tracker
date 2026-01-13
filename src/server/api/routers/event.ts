import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { events, eventScores, scoringCategories } from "~/server/db/schema";

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        date: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        cfpDeadline: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(events)
        .values({
          name: input.name,
          date: input.date ?? null,
          location: input.location ?? null,
          description: input.description ?? null,
          cfpDeadline: input.cfpDeadline ?? null,
        })
        .returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        date: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        cfpDeadline: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await ctx.db
        .update(events)
        .set(data)
        .where(eq(events.id, id))
        .returning();
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(events).where(eq(events.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.date)],
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
      orderBy: (events, { desc }) => [desc(events.date)],
    });

    // Get all categories to calculate max score
    const categories = await ctx.db.query.scoringCategories.findMany();
    const maxScore = categories.reduce((sum, cat) => sum + 9 * cat.weight, 0);

    // Get threshold setting
    const thresholdSetting = await ctx.db.query.appSettings.findFirst({
      where: (settings, { eq }) => eq(settings.key, "score_threshold"),
    });
    const threshold = thresholdSetting
      ? parseInt(thresholdSetting.value)
      : 70;

    // Get all event scores
    const allScores = await ctx.db.query.eventScores.findMany({
      with: {
        category: true,
      },
    });

    // Map events to include score information
    return allEvents.map((event) => {
      const scores = allScores.filter((s) => s.eventId === event.id);
      const totalScore = scores.reduce((sum, score) => {
        return sum + score.score * score.category.weight;
      }, 0);

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
      };
    });
  }),
});
