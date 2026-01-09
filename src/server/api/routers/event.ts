import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { events } from "~/server/db/schema";

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
});
