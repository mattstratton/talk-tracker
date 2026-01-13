import { and, desc, eq, gt, like, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { activities, mentions, user } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

const activityTypeEnum = z.enum(["comment", "status_change"]);
const statusEnum = z.enum([
  "draft",
  "submitted",
  "accepted",
  "rejected",
  "confirmed",
]);

// Helper function to parse @mentions from content
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.matchAll(mentionRegex);
  return Array.from(matches, (match) => match[1] ?? "").filter(Boolean);
}

// Helper function to find users by email prefix (username)
async function findUsersByEmailPrefix(
  db: any,
  usernames: string[],
): Promise<Array<{ id: string; email: string }>> {
  if (usernames.length === 0) return [];

  // Build OR conditions for each username
  const conditions = usernames.map((username) =>
    like(user.email, `${username}@%`),
  );

  return await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(sql`${sql.join(conditions, sql` OR `)}`);
}

export const activityRouter = createTRPCRouter({
  // Get all users for @mention autocomplete
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: (user, { asc }) => [asc(user.name)],
    });

    // Extract username from email (part before @)
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      username: u.email.split("@")[0] ?? "",
    }));
  }),

  // Get activities for a specific proposal with cursor pagination
  getByProposal: protectedProcedure
    .input(
      z.object({
        proposalId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().optional(), // activity ID
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.activities.findMany({
        where: input.cursor
          ? and(
              eq(activities.proposalId, input.proposalId),
              gt(activities.id, input.cursor),
            )
          : eq(activities.proposalId, input.proposalId),
        orderBy: desc(activities.createdAt),
        limit: input.limit + 1, // Fetch one extra to determine if there's more
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          mentions: {
            with: {
              mentionedUser: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

  // Get activities for a specific event with cursor pagination
  getByEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.activities.findMany({
        where: input.cursor
          ? and(
              eq(activities.eventId, input.eventId),
              gt(activities.id, input.cursor),
            )
          : eq(activities.eventId, input.eventId),
        orderBy: desc(activities.createdAt),
        limit: input.limit + 1,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          mentions: {
            with: {
              mentionedUser: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

  // Get activities for a specific talk with cursor pagination
  getByTalk: protectedProcedure
    .input(
      z.object({
        talkId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.activities.findMany({
        where: input.cursor
          ? and(
              eq(activities.talkId, input.talkId),
              gt(activities.id, input.cursor),
            )
          : eq(activities.talkId, input.talkId),
        orderBy: desc(activities.createdAt),
        limit: input.limit + 1,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          mentions: {
            with: {
              mentionedUser: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

  // Get recent activities across all entities (for dashboard)
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.activities.findMany({
        orderBy: desc(activities.createdAt),
        limit: input.limit,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          proposal: {
            with: {
              talk: {
                columns: {
                  id: true,
                  title: true,
                },
              },
              event: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          mentions: {
            with: {
              mentionedUser: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    }),

  // Get all activities with cursor pagination (for /activity page)
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().optional(), // activity ID
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.activities.findMany({
        where: input.cursor ? gt(activities.id, input.cursor) : undefined,
        orderBy: desc(activities.createdAt),
        limit: input.limit + 1,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          proposal: {
            with: {
              talk: {
                columns: {
                  id: true,
                  title: true,
                },
              },
              event: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          mentions: {
            with: {
              mentionedUser: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

  // Get activities where current user was mentioned
  getMyMentions: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      // First get mention records for this user
      const userMentions = await ctx.db.query.mentions.findMany({
        where: eq(mentions.mentionedUserId, ctx.session.user.id),
        orderBy: desc(mentions.createdAt),
        limit: input.limit,
        with: {
          activity: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              proposal: {
                with: {
                  talk: {
                    columns: {
                      id: true,
                      title: true,
                    },
                  },
                  event: {
                    columns: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              mentions: {
                with: {
                  mentionedUser: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Extract activities from mentions
      return userMentions.map((mention) => mention.activity);
    }),

  // Create a comment with @mention parsing
  createComment: protectedProcedure
    .input(
      z
        .object({
          proposalId: z.number().optional(),
          eventId: z.number().optional(),
          talkId: z.number().optional(),
          content: z.string().min(1).max(5000),
        })
        .refine(
          (data) => {
            const count = [
              data.proposalId,
              data.eventId,
              data.talkId,
            ].filter(Boolean).length;
            return count === 1;
          },
          {
            message: "Exactly one of proposalId, eventId, or talkId must be provided",
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      // Create the comment activity
      const result = await ctx.db
        .insert(activities)
        .values({
          proposalId: input.proposalId ?? null,
          eventId: input.eventId ?? null,
          talkId: input.talkId ?? null,
          userId: ctx.session.user.id,
          activityType: "comment",
          content: input.content,
          isEdited: false,
        })
        .returning();

      const activity = result[0];
      if (!activity) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create comment",
        });
      }

      // Parse @mentions and create mention records
      const usernames = extractMentions(input.content);
      if (usernames.length > 0) {
        const mentionedUsers = await findUsersByEmailPrefix(
          ctx.db,
          usernames,
        );

        if (mentionedUsers.length > 0) {
          await ctx.db.insert(mentions).values(
            mentionedUsers.map((mentionedUser) => ({
              activityId: activity.id,
              mentionedUserId: mentionedUser.id,
            })),
          );
        }
      }

      return activity;
    }),

  // Update a comment (owner only)
  updateComment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.activities.findFirst({
        where: and(
          eq(activities.id, input.id),
          eq(activities.activityType, "comment"),
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own comments",
        });
      }

      // Delete existing mentions
      await ctx.db
        .delete(mentions)
        .where(eq(mentions.activityId, input.id));

      // Update the comment
      const result = await ctx.db
        .update(activities)
        .set({
          content: input.content,
          isEdited: true,
          editedAt: new Date(),
        })
        .where(eq(activities.id, input.id))
        .returning();

      const activity = result[0];
      if (!activity) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update comment",
        });
      }

      // Re-parse @mentions and create new mention records
      const usernames = extractMentions(input.content);
      if (usernames.length > 0) {
        const mentionedUsers = await findUsersByEmailPrefix(
          ctx.db,
          usernames,
        );

        if (mentionedUsers.length > 0) {
          await ctx.db.insert(mentions).values(
            mentionedUsers.map((mentionedUser) => ({
              activityId: activity.id,
              mentionedUserId: mentionedUser.id,
            })),
          );
        }
      }

      return activity;
    }),

  // Delete a comment (owner only)
  deleteComment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.activities.findFirst({
        where: and(
          eq(activities.id, input.id),
          eq(activities.activityType, "comment"),
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      // Delete the comment (mentions will be cascade deleted)
      await ctx.db.delete(activities).where(eq(activities.id, input.id));
    }),
});
