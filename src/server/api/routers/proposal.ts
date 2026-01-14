import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { activities, proposals } from "~/server/db/schema";
import { createNotification } from "~/server/services/notification";

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

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create proposal",
        });
      }

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

      // Fetch existing proposal to check ownership and get old status
      const existing = await ctx.db.query.proposals.findFirst({
        where: eq(proposals.id, id),
        columns: { status: true, userId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found",
        });
      }

      // Check ownership
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this proposal",
        });
      }

      const oldStatus = existing.status as
        | "draft"
        | "submitted"
        | "accepted"
        | "rejected"
        | "confirmed"
        | undefined;

      // Update the proposal
      const result = await ctx.db
        .update(proposals)
        .set(data)
        .where(eq(proposals.id, id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found",
        });
      }

      const updatedProposal = result[0];

      // Create status change activity if status changed
      if (
        input.status &&
        oldStatus &&
        oldStatus !== input.status &&
        updatedProposal
      ) {
        const statusActivity = await ctx.db
          .insert(activities)
          .values({
            proposalId: updatedProposal.id,
            userId: ctx.session.user.id,
            activityType: "status_change",
            oldStatus,
            newStatus: input.status,
          })
          .returning();

        // Create notification for proposal owner (if different from updater)
        if (updatedProposal.userId !== ctx.session.user.id) {
          // Get full proposal details for notification message
          const proposalDetails = await ctx.db.query.proposals.findFirst({
            where: eq(proposals.id, updatedProposal.id),
            with: {
              talk: { columns: { title: true } },
              event: { columns: { name: true } },
            },
          });

          if (proposalDetails && statusActivity[0]) {
            await createNotification({
              db: ctx.db,
              userId: updatedProposal.userId,
              notificationType: "status_change",
              title: `${ctx.session.user.name} updated your proposal`,
              message: `Changed status from ${oldStatus} to ${input.status} for "${proposalDetails.talk.title}" at ${proposalDetails.event.name}`,
              linkUrl: `/proposals/${updatedProposal.id}`,
              actorId: ctx.session.user.id,
              activityId: statusActivity[0].id,
            });
          }
        }
      }

      return updatedProposal;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership before deleting
      const existing = await ctx.db.query.proposals.findFirst({
        where: eq(proposals.id, input.id),
        columns: { userId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Proposal not found",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this proposal",
        });
      }

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
