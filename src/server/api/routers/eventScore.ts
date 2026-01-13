import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { eventScores } from "~/server/db/schema";

const validScoreEnum = z
  .enum(["0", "1", "3", "9"])
  .transform((val) => parseInt(val) as 0 | 1 | 3 | 9);

export const eventScoreRouter = createTRPCRouter({
  getByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.eventScores.findMany({
        where: eq(eventScores.eventId, input.eventId),
        with: {
          category: true,
        },
      });
    }),

  getSummary: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Get all categories and scores
      const [categories, scores] = await Promise.all([
        ctx.db.query.scoringCategories.findMany({
          orderBy: (cats, { asc }) => [asc(cats.displayOrder)],
        }),
        ctx.db.query.eventScores.findMany({
          where: eq(eventScores.eventId, input.eventId),
          with: { category: true },
        }),
      ]);

      // Calculate total score
      const totalScore = scores.reduce((sum, score) => {
        return sum + score.score * score.category.weight;
      }, 0);

      // Calculate maximum possible score
      const maxScore = categories.reduce((sum, cat) => sum + 9 * cat.weight, 0);

      return {
        categories,
        scores,
        totalScore,
        maxScore,
        completionCount: scores.length,
        totalCategories: categories.length,
        isComplete: scores.length === categories.length,
      };
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        categoryId: z.number(),
        score: validScoreEnum,
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if score exists
      const existing = await ctx.db.query.eventScores.findFirst({
        where: and(
          eq(eventScores.eventId, input.eventId),
          eq(eventScores.categoryId, input.categoryId),
        ),
      });

      if (existing) {
        // Update existing
        const result = await ctx.db
          .update(eventScores)
          .set({
            score: input.score,
            notes: input.notes ?? null,
          })
          .where(eq(eventScores.id, existing.id))
          .returning();
        return result[0];
      } else {
        // Insert new
        const result = await ctx.db
          .insert(eventScores)
          .values({
            eventId: input.eventId,
            categoryId: input.categoryId,
            score: input.score,
            notes: input.notes ?? null,
          })
          .returning();
        return result[0];
      }
    }),

  upsertBatch: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        scores: z.array(
          z.object({
            categoryId: z.number(),
            score: validScoreEnum,
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const results = [];

      for (const scoreData of input.scores) {
        const existing = await ctx.db.query.eventScores.findFirst({
          where: and(
            eq(eventScores.eventId, input.eventId),
            eq(eventScores.categoryId, scoreData.categoryId),
          ),
        });

        if (existing) {
          const result = await ctx.db
            .update(eventScores)
            .set({
              score: scoreData.score,
              notes: scoreData.notes ?? null,
            })
            .where(eq(eventScores.id, existing.id))
            .returning();
          results.push(result[0]);
        } else {
          const result = await ctx.db
            .insert(eventScores)
            .values({
              eventId: input.eventId,
              categoryId: scoreData.categoryId,
              score: scoreData.score,
              notes: scoreData.notes ?? null,
            })
            .returning();
          results.push(result[0]);
        }
      }

      return results;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(eventScores).where(eq(eventScores.id, input.id));
    }),

  deleteByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(eventScores)
        .where(eq(eventScores.eventId, input.eventId));
    }),
});
