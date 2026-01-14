import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { scoringCategories } from "~/server/db/schema";

export const scoringCategoryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        weight: z.number().int().min(1).max(10),
        displayOrder: z.number().int().min(1).max(10),
        score9Description: z.string().min(1),
        score3Description: z.string().min(1),
        score1Description: z.string().min(1),
        score0Description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(scoringCategories)
        .values({
          name: input.name,
          weight: input.weight,
          displayOrder: input.displayOrder,
          score9Description: input.score9Description,
          score3Description: input.score3Description,
          score1Description: input.score1Description,
          score0Description: input.score0Description,
        })
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create scoring category",
        });
      }

      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        weight: z.number().int().min(1).max(10).optional(),
        displayOrder: z.number().int().min(1).max(10).optional(),
        score9Description: z.string().min(1).optional(),
        score3Description: z.string().min(1).optional(),
        score1Description: z.string().min(1).optional(),
        score0Description: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await ctx.db
        .update(scoringCategories)
        .set(data)
        .where(eq(scoringCategories.id, id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scoring category not found",
        });
      }

      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(scoringCategories)
        .where(eq(scoringCategories.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.scoringCategories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.scoringCategories.findFirst({
        where: eq(scoringCategories.id, input.id),
      });
    }),
});
