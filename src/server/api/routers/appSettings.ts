import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { appSettings } from "~/server/db/schema";

const SCORING_THRESHOLD_KEY = "scoring_threshold";
const DEFAULT_THRESHOLD = "70";

export const appSettingsRouter = createTRPCRouter({
  getThreshold: protectedProcedure.query(async ({ ctx }) => {
    const setting = await ctx.db.query.appSettings.findFirst({
      where: eq(appSettings.key, SCORING_THRESHOLD_KEY),
    });

    return {
      threshold: setting
        ? parseInt(setting.value)
        : parseInt(DEFAULT_THRESHOLD),
      description:
        setting?.description ?? "Minimum score to recommend submission",
    };
  }),

  updateThreshold: protectedProcedure
    .input(
      z.object({
        threshold: z.number().int().min(0).max(900),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if setting exists
      const existing = await ctx.db.query.appSettings.findFirst({
        where: eq(appSettings.key, SCORING_THRESHOLD_KEY),
      });

      if (existing) {
        // Update
        const result = await ctx.db
          .update(appSettings)
          .set({ value: input.threshold.toString() })
          .where(eq(appSettings.id, existing.id))
          .returning();
        return result[0];
      } else {
        // Insert
        const result = await ctx.db
          .insert(appSettings)
          .values({
            key: SCORING_THRESHOLD_KEY,
            value: input.threshold.toString(),
            description: "Minimum score to recommend submission",
          })
          .returning();
        return result[0];
      }
    }),

  get: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.appSettings.findFirst({
        where: eq(appSettings.key, input.key),
      });
    }),

  set: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.appSettings.findFirst({
        where: eq(appSettings.key, input.key),
      });

      if (existing) {
        const result = await ctx.db
          .update(appSettings)
          .set({
            value: input.value,
            description: input.description ?? existing.description,
          })
          .where(eq(appSettings.id, existing.id))
          .returning();
        return result[0];
      } else {
        const result = await ctx.db
          .insert(appSettings)
          .values(input)
          .returning();
        return result[0];
      }
    }),
});
