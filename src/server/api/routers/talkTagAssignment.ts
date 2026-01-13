import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { talkTagAssignments } from "~/server/db/schema";

export const talkTagAssignmentRouter = createTRPCRouter({
  getByTalk: protectedProcedure
    .input(z.object({ talkId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.talkTagAssignments.findMany({
        where: eq(talkTagAssignments.talkId, input.talkId),
        with: {
          tag: true,
        },
      });
    }),

  assign: protectedProcedure
    .input(
      z.object({
        talkId: z.number(),
        tagId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if assignment already exists
      const existing = await ctx.db.query.talkTagAssignments.findFirst({
        where: and(
          eq(talkTagAssignments.talkId, input.talkId),
          eq(talkTagAssignments.tagId, input.tagId),
        ),
      });

      if (existing) {
        return existing;
      }

      const result = await ctx.db
        .insert(talkTagAssignments)
        .values({
          talkId: input.talkId,
          tagId: input.tagId,
        })
        .returning();
      return result[0];
    }),

  unassign: protectedProcedure
    .input(
      z.object({
        talkId: z.number(),
        tagId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(talkTagAssignments)
        .where(
          and(
            eq(talkTagAssignments.talkId, input.talkId),
            eq(talkTagAssignments.tagId, input.tagId),
          ),
        );
    }),

  setTags: protectedProcedure
    .input(
      z.object({
        talkId: z.number(),
        tagIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Delete all existing assignments for this talk
      await ctx.db
        .delete(talkTagAssignments)
        .where(eq(talkTagAssignments.talkId, input.talkId));

      // Insert new assignments
      if (input.tagIds.length > 0) {
        const results = await ctx.db
          .insert(talkTagAssignments)
          .values(
            input.tagIds.map((tagId) => ({
              talkId: input.talkId,
              tagId,
            })),
          )
          .returning();
        return results;
      }

      return [];
    }),
});
