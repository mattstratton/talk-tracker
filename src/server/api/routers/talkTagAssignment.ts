import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { talkTagAssignments, talks } from "~/server/db/schema";

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
      // Check talk ownership
      const talk = await ctx.db.query.talks.findFirst({
        where: eq(talks.id, input.talkId),
        columns: { createdById: true },
      });

      if (!talk) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Talk not found",
        });
      }

      if (talk.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to modify tags for this talk",
        });
      }

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

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign tag to talk",
        });
      }

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
      // Check talk ownership
      const talk = await ctx.db.query.talks.findFirst({
        where: eq(talks.id, input.talkId),
        columns: { createdById: true },
      });

      if (!talk) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Talk not found",
        });
      }

      if (talk.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to modify tags for this talk",
        });
      }

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
      // Check talk ownership
      const talk = await ctx.db.query.talks.findFirst({
        where: eq(talks.id, input.talkId),
        columns: { createdById: true },
      });

      if (!talk) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Talk not found",
        });
      }

      if (talk.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to modify tags for this talk",
        });
      }

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
