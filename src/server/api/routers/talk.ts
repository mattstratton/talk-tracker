import { TRPCError } from "@trpc/server";
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

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create talk",
        });
      }

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

      // Check ownership before updating
      const existing = await ctx.db.query.talks.findFirst({
        where: eq(talks.id, id),
        columns: { createdById: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Talk not found",
        });
      }

      if (existing.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this talk",
        });
      }

      const result = await ctx.db
        .update(talks)
        .set(data)
        .where(eq(talks.id, id))
        .returning();

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update talk",
        });
      }

      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership before deleting
      const existing = await ctx.db.query.talks.findFirst({
        where: eq(talks.id, input.id),
        columns: { createdById: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Talk not found",
        });
      }

      if (existing.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this talk",
        });
      }

      await ctx.db.delete(talks).where(eq(talks.id, input.id));
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.talks.findMany({
      orderBy: (talks, { desc }) => [desc(talks.createdAt)],
      with: {
        createdBy: true,
        talkTagAssignments: {
          with: {
            tag: true,
          },
        },
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
          talkTagAssignments: {
            with: {
              tag: true,
            },
          },
        },
      });
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.talks.findMany({
      where: eq(talks.createdById, ctx.session.user.id),
      orderBy: (talks, { desc }) => [desc(talks.createdAt)],
    });
  }),

  bulkImport: protectedProcedure
    .input(
      z.object({
        talks: z.array(
          z.object({
            title: z.string().min(1),
            abstract: z.string().min(1),
            description: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let successCount = 0;
      let failedCount = 0;

      for (const talk of input.talks) {
        try {
          await ctx.db.insert(talks).values({
            title: talk.title,
            abstract: talk.abstract,
            description: talk.description ?? null,
            createdById: ctx.session.user.id,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import talk: ${talk.title}`, error);
          failedCount++;
        }
      }

      return {
        success: successCount,
        failed: failedCount,
      };
    }),
});
