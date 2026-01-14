import { and, desc, eq, gt, like, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  activities,
  events,
  mentions,
  proposals,
  talks,
  user,
} from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { createNotification } from "~/server/services/notification";
import { db } from "~/server/db";

type Database = typeof db;

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

// Helper function to get entity owner ID
async function getEntityOwnerId(
  db: Database,
  input: { proposalId?: number; eventId?: number; talkId?: number },
): Promise<string | null> {
  if (input.proposalId) {
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, input.proposalId),
      columns: { userId: true },
    });
    return proposal?.userId ?? null;
  }

  if (input.talkId) {
    const talk = await db.query.talks.findFirst({
      where: eq(talks.id, input.talkId),
      columns: { createdById: true },
    });
    return talk?.createdById ?? null;
  }

  // Events don't have a specific owner
  return null;
}

// Helper function to get entity type for notifications
function getEntityType(input: {
  proposalId?: number;
  eventId?: number;
  talkId?: number;
}): string {
  if (input.proposalId) return "proposal";
  if (input.eventId) return "event";
  if (input.talkId) return "talk";
  return "item";
}

// Helper function to get entity name for notifications
async function getEntityName(
  db: Database,
  input: { proposalId?: number; eventId?: number; talkId?: number },
): Promise<string> {
  if (input.proposalId) {
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, input.proposalId),
      with: {
        talk: { columns: { title: true } },
        event: { columns: { name: true } },
      },
    });
    return proposal
      ? `${proposal.talk.title} at ${proposal.event.name}`
      : "proposal";
  }

  if (input.eventId) {
    const event = await db.query.events.findFirst({
      where: eq(events.id, input.eventId),
      columns: { name: true },
    });
    return event?.name ?? "event";
  }

  if (input.talkId) {
    const talk = await db.query.talks.findFirst({
      where: eq(talks.id, input.talkId),
      columns: { title: true },
    });
    return talk?.title ?? "talk";
  }

  return "item";
}

// Helper function to get activity link URL
function getActivityLink(input: {
  proposalId?: number;
  eventId?: number;
  talkId?: number;
}): string {
  if (input.proposalId) return `/proposals/${input.proposalId}`;
  if (input.eventId) return `/events/${input.eventId}`;
  if (input.talkId) return `/talks/${input.talkId}`;
  return "/activity";
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
          event: {
            columns: {
              id: true,
              name: true,
            },
          },
          talk: {
            columns: {
              id: true,
              title: true,
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
          event: {
            columns: {
              id: true,
              name: true,
            },
          },
          talk: {
            columns: {
              id: true,
              title: true,
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
      const mentionedUserIds: string[] = [];

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

          // Create notifications for mentioned users
          const entityIds = {
            ...(input.proposalId && { proposalId: input.proposalId }),
            ...(input.eventId && { eventId: input.eventId }),
            ...(input.talkId && { talkId: input.talkId }),
          };
          const entityName = await getEntityName(ctx.db, entityIds);
          const linkUrl = getActivityLink(entityIds);

          for (const mentionedUser of mentionedUsers) {
            mentionedUserIds.push(mentionedUser.id);
            await createNotification({
              db: ctx.db,
              userId: mentionedUser.id,
              notificationType: "mention",
              title: `${ctx.session.user.name} mentioned you`,
              message: `in a comment on ${entityName}`,
              linkUrl,
              actorId: ctx.session.user.id,
              activityId: activity.id,
            });
          }
        }
      }

      // Create comment notification for entity owner (if different from commenter and not mentioned)
      const entityIds = {
        ...(input.proposalId && { proposalId: input.proposalId }),
        ...(input.eventId && { eventId: input.eventId }),
        ...(input.talkId && { talkId: input.talkId }),
      };
      const ownerId = await getEntityOwnerId(ctx.db, entityIds);
      if (
        ownerId &&
        ownerId !== ctx.session.user.id &&
        !mentionedUserIds.includes(ownerId)
      ) {
        const entityType = getEntityType(entityIds);
        const entityName = await getEntityName(ctx.db, entityIds);
        const linkUrl = getActivityLink(entityIds);

        await createNotification({
          db: ctx.db,
          userId: ownerId,
          notificationType: "comment",
          title: `${ctx.session.user.name} commented`,
          message: `on your ${entityType}: ${entityName}`,
          linkUrl,
          actorId: ctx.session.user.id,
          activityId: activity.id,
        });
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
