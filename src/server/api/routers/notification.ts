import { and, desc, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { notifications, notificationPreferences } from "~/server/db/schema";

export const notificationRouter = createTRPCRouter({
  // Get unread notification count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.session.user.id),
          eq(notifications.isRead, false),
        ),
      );

    return result[0]?.count ?? 0;
  }),

  // Get recent notifications (for dropdown/sheet)
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.notifications.findMany({
        where: eq(notifications.userId, ctx.session.user.id),
        orderBy: desc(notifications.createdAt),
        limit: input.limit,
        with: {
          actor: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  // Get all notifications with cursor pagination
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().optional(), // notification ID
        unreadOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereConditions = [eq(notifications.userId, ctx.session.user.id)];

      if (input.unreadOnly) {
        whereConditions.push(eq(notifications.isRead, false));
      }

      if (input.cursor) {
        whereConditions.push(gt(notifications.id, input.cursor));
      }

      const items = await ctx.db.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: desc(notifications.createdAt),
        limit: input.limit + 1,
        with: {
          actor: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: number | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Mark single notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, ctx.session.user.id),
          ),
        );
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, ctx.session.user.id),
          eq(notifications.isRead, false),
        ),
      );
  }),

  // Get user's notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, ctx.session.user.id),
    });

    // Return defaults if not found
    return (
      prefs ?? {
        mentionsEnabled: true,
        statusChangesEnabled: true,
        commentsEnabled: true,
        cfpDeadlinesEnabled: true,
        cfpDeadlineDaysBefore: 7,
        emailMentionsEnabled: false,
        emailStatusChangesEnabled: false,
        emailCommentsEnabled: false,
        emailCfpDeadlinesEnabled: false,
        slackMentionsEnabled: false,
        slackStatusChangesEnabled: false,
        slackCommentsEnabled: false,
        slackCfpDeadlinesEnabled: false,
        slackWebhookUrl: null,
      }
    );
  }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        mentionsEnabled: z.boolean().optional(),
        statusChangesEnabled: z.boolean().optional(),
        commentsEnabled: z.boolean().optional(),
        cfpDeadlinesEnabled: z.boolean().optional(),
        cfpDeadlineDaysBefore: z.number().min(1).max(90).optional(),
        // Future: email and Slack preferences
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if preferences exist
      const existing = await ctx.db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, ctx.session.user.id),
      });

      if (existing) {
        // Update existing preferences
        const result = await ctx.db
          .update(notificationPreferences)
          .set(input)
          .where(eq(notificationPreferences.userId, ctx.session.user.id))
          .returning();
        return result[0];
      } else {
        // Create new preferences with defaults + input
        const result = await ctx.db
          .insert(notificationPreferences)
          .values({
            userId: ctx.session.user.id,
            ...input,
          })
          .returning();
        return result[0];
      }
    }),
});
