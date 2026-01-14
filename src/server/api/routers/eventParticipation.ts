import { and, eq } from "drizzle-orm";
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

const statusEnum = z.enum(["interested", "applied", "confirmed", "not_going"]);

export const eventParticipationRouter = createTRPCRouter({
  // Create a new participation
  create: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        participationType: participationTypeEnum,
        status: statusEnum.optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(eventParticipations)
        .values({
          eventId: input.eventId,
          userId: ctx.session.user.id,
          participationType: input.participationType,
          status: input.status ?? "interested",
          notes: input.notes ?? null,
        })
        .returning();
      return result[0];
    }),

  // Update participation
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        participationType: participationTypeEnum.optional(),
        status: statusEnum.optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const result = await ctx.db
        .update(eventParticipations)
        .set(data)
        .where(
          and(
            eq(eventParticipations.id, id),
            eq(eventParticipations.userId, ctx.session.user.id),
          ),
        )
        .returning();
      return result[0];
    }),

  // Delete participation
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(eventParticipations)
        .where(
          and(
            eq(eventParticipations.id, input.id),
            eq(eventParticipations.userId, ctx.session.user.id),
          ),
        );
    }),

  // Get my participations for an event
  getMyParticipations: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.eventParticipations.findMany({
        where: and(
          eq(eventParticipations.eventId, input.eventId),
          eq(eventParticipations.userId, ctx.session.user.id),
        ),
        orderBy: (eventParticipations, { asc }) => [
          asc(eventParticipations.createdAt),
        ],
      });
    }),

  // Get all participations for an event (team view)
  getEventParticipations: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.eventParticipations.findMany({
        where: eq(eventParticipations.eventId, input.eventId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: (eventParticipations, { asc }) => [
          asc(eventParticipations.participationType),
          asc(eventParticipations.createdAt),
        ],
      });
    }),

  // Get all my participations across all events
  getMyAllParticipations: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.eventParticipations.findMany({
      where: eq(eventParticipations.userId, ctx.session.user.id),
      with: {
        event: true,
      },
      orderBy: (eventParticipations, { desc }) => [
        desc(eventParticipations.createdAt),
      ],
    });
  }),
});
