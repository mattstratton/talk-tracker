import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { eventParticipations } from "~/server/db/schema";

const participationTypeEnum = z.enum([
  "speak",
  "sponsor",
  "attend",
  "exhibit",
  "volunteer",
]);

const statusEnum = z.enum(["interested", "confirmed", "not_going"]);

export const eventParticipationRouter = createTRPCRouter({
  // Create a new participation
  create: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        participationType: participationTypeEnum,
        status: statusEnum.optional(),
        budget: z.number().optional(),
        sponsorshipTier: z.string().optional(),
        boothSize: z.string().optional(),
        details: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(eventParticipations)
        .values({
          eventId: input.eventId,
          participationType: input.participationType,
          status: input.status ?? "interested",
          budget: input.budget ?? null,
          sponsorshipTier: input.sponsorshipTier ?? null,
          boothSize: input.boothSize ?? null,
          details: input.details ?? null,
          notes: input.notes ?? null,
        })
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create event participation",
        });
      }

      return result[0];
    }),

  // Update participation
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        participationType: participationTypeEnum.optional(),
        status: statusEnum.optional(),
        budget: z.number().optional(),
        sponsorshipTier: z.string().optional(),
        boothSize: z.string().optional(),
        details: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const result = await ctx.db
        .update(eventParticipations)
        .set(data)
        .where(eq(eventParticipations.id, id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event participation not found",
        });
      }

      return result[0];
    }),

  // Delete participation
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(eventParticipations)
        .where(eq(eventParticipations.id, input.id));
    }),

  // Get all participations for an event
  getByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.eventParticipations.findMany({
        where: eq(eventParticipations.eventId, input.eventId),
        orderBy: (eventParticipations, { asc }) => [
          asc(eventParticipations.participationType),
        ],
      });
    }),

  // Get all participations across all events
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.eventParticipations.findMany({
      with: {
        event: true,
      },
      orderBy: (eventParticipations, { desc }) => [
        desc(eventParticipations.createdAt),
      ],
    });
  }),
});
