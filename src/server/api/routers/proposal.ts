import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { activities, proposals } from "~/server/db/schema";

const statusEnum = z.enum([
  "draft",
  "submitted",
  "accepted",
  "rejected",
  "confirmed",
]);
const talkTypeEnum = z.enum(["keynote", "regular", "lightning", "workshop"]);

export const proposalRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        talkId: z.number(),
        eventId: z.number(),
        status: statusEnum.optional(),
        talkType: talkTypeEnum,
        submissionDate: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(proposals)
        .values({
          talkId: input.talkId,
          eventId: input.eventId,
          userId: ctx.session.user.id,
          status: input.status ?? "draft",
          talkType: input.talkType,
          submissionDate: input.submissionDate ?? null,
          notes: input.notes ?? null,
        })
        .returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        talkId: z.number().optional(),
        eventId: z.number().optional(),
        status: statusEnum.optional(),
        talkType: talkTypeEnum.optional(),
        submissionDate: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // If status is being updated, fetch the existing proposal first
      let oldStatus: "draft" | "submitted" | "accepted" | "rejected" | "confirmed" | undefined;
      if (input.status) {
        const existing = await ctx.db.query.proposals.findFirst({
          where: eq(proposals.id, id),
          columns: { status: true },
        });
        oldStatus = existing?.status as typeof oldStatus;
      }

      // Update the proposal
      const result = await ctx.db
        .update(proposals)
        .set(data)
        .where(eq(proposals.id, id))
        .returning();

      const updatedProposal = result[0];

      // Create status change activity if status changed
      if (
        input.status &&
        oldStatus &&
        oldStatus !== input.status &&
        updatedProposal
      ) {
        await ctx.db.insert(activities).values({
          proposalId: updatedProposal.id,
          userId: ctx.session.user.id,
          activityType: "status_change",
          oldStatus,
          newStatus: input.status,
        });
      }

      return updatedProposal;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(proposals).where(eq(proposals.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.proposals.findMany({
      orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
      with: {
        talk: true,
        event: true,
        user: true,
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.proposals.findFirst({
        where: eq(proposals.id, input.id),
        with: {
          talk: true,
          event: true,
          user: true,
        },
      });
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.proposals.findMany({
      where: eq(proposals.userId, ctx.session.user.id),
      orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
      with: {
        talk: true,
        event: true,
      },
    });
  }),

  getByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.proposals.findMany({
        where: eq(proposals.eventId, input.eventId),
        orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
        with: {
          talk: true,
          user: true,
        },
      });
    }),

  getByTalk: protectedProcedure
    .input(z.object({ talkId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.proposals.findMany({
        where: eq(proposals.talkId, input.talkId),
        orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
        with: {
          event: true,
          user: true,
        },
      });
    }),
});
