import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { talks } from "~/server/db/schema";

export const talkRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        abstract: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(talks)
        .values({
          title: input.title,
          abstract: input.abstract,
          description: input.description ?? null,
          createdById: ctx.session.user.id,
        })
        .returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        abstract: z.string().min(1).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await ctx.db
        .update(talks)
        .set(data)
        .where(eq(talks.id, id))
        .returning();
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(talks).where(eq(talks.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.talks.findMany({
      orderBy: (talks, { desc }) => [desc(talks.createdAt)],
      with: {
        createdBy: true,
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.talks.findFirst({
        where: eq(talks.id, input.id),
        with: {
          createdBy: true,
        },
      });
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.talks.findMany({
      where: eq(talks.createdById, ctx.session.user.id),
      orderBy: (talks, { desc }) => [desc(talks.createdAt)],
    });
  }),
});
