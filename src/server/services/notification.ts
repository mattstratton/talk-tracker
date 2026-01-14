import { eq } from "drizzle-orm";
import type { db } from "~/server/db";
import { notificationPreferences, notifications } from "~/server/db/schema";

type Database = typeof db;

export interface CreateNotificationParams {
  db: Database;
  userId: string;
  notificationType: "mention" | "status_change" | "comment" | "cfp_deadline";
  title: string;
  message: string;
  linkUrl: string;
  actorId?: string | null;
  activityId?: number | null;
  eventId?: number | null;
}

export interface NotificationPreferences {
  mentionsEnabled: boolean;
  statusChangesEnabled: boolean;
  commentsEnabled: boolean;
  cfpDeadlinesEnabled: boolean;
  cfpDeadlineDaysBefore: number;
}

/**
 * Get user's notification preferences or return defaults
 */
export async function getOrCreatePreferences(
  db: Database,
  userId: string,
): Promise<NotificationPreferences> {
  const prefs = await db.query.notificationPreferences.findFirst({
    where: eq(notificationPreferences.userId, userId),
  });

  if (prefs) {
    return {
      mentionsEnabled: prefs.mentionsEnabled,
      statusChangesEnabled: prefs.statusChangesEnabled,
      commentsEnabled: prefs.commentsEnabled,
      cfpDeadlinesEnabled: prefs.cfpDeadlinesEnabled,
      cfpDeadlineDaysBefore: prefs.cfpDeadlineDaysBefore,
    };
  }

  // Return defaults if no preferences exist
  return {
    mentionsEnabled: true,
    statusChangesEnabled: true,
    commentsEnabled: true,
    cfpDeadlinesEnabled: true,
    cfpDeadlineDaysBefore: 7,
  };
}

/**
 * Check if notification should be created based on user preferences
 */
export function checkPreferences(
  preferences: NotificationPreferences,
  notificationType: "mention" | "status_change" | "comment" | "cfp_deadline",
): boolean {
  switch (notificationType) {
    case "mention":
      return preferences.mentionsEnabled;
    case "status_change":
      return preferences.statusChangesEnabled;
    case "comment":
      return preferences.commentsEnabled;
    case "cfp_deadline":
      return preferences.cfpDeadlinesEnabled;
    default:
      return false;
  }
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  params: CreateNotificationParams,
): Promise<void> {
  const {
    db,
    userId,
    notificationType,
    title,
    message,
    linkUrl,
    actorId = null,
    activityId = null,
    eventId = null,
  } = params;

  // Check user preferences first
  const preferences = await getOrCreatePreferences(db, userId);
  const shouldCreate = checkPreferences(preferences, notificationType);

  if (!shouldCreate) {
    return;
  }

  // Create the notification
  await db.insert(notifications).values({
    userId,
    notificationType,
    title,
    message,
    linkUrl,
    actorId,
    activityId,
    eventId,
    deliveryMethod: "in_app",
  });
}
