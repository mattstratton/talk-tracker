import { and, eq, gte, isNotNull, lte } from "drizzle-orm";
import { db } from "~/server/db";
import { events, notifications, user } from "~/server/db/schema";
import { createNotification } from "~/server/services/notification";

type Database = typeof db;

/**
 * Check for upcoming CFP deadlines and create notifications for users
 * Run this daily via cron job
 */
export async function checkCfpDeadlines(database: Database): Promise<void> {
  console.log("[CFP Deadline Notifier] Starting CFP deadline check...");

  // Get all users with their notification preferences
  const users = await database.query.user.findMany({
    with: {
      notificationPreferences: true,
    },
  });

  console.log(`[CFP Deadline Notifier] Found ${users.length} users to check`);

  let notificationCount = 0;

  for (const currentUser of users) {
    // Get preferences or use defaults
    const prefs = currentUser.notificationPreferences;

    // Skip if CFP deadline notifications are disabled
    if (prefs && !prefs.cfpDeadlinesEnabled) {
      continue;
    }

    const daysBefore = prefs?.cfpDeadlineDaysBefore ?? 7;

    // Calculate target date (X days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBefore);
    targetDate.setHours(0, 0, 0, 0);

    // Calculate date range (target date +/- 12 hours to account for timezone differences)
    const startDate = new Date(targetDate);
    startDate.setHours(-12, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(36, 0, 0, 0);

    const startDateStr = startDate.toISOString().split("T")[0]!;
    const endDateStr = endDate.toISOString().split("T")[0]!;

    // Find events with CFP deadlines matching the target date
    const upcomingEvents = await database.query.events.findMany({
      where: and(
        isNotNull(events.cfpDeadline),
        gte(events.cfpDeadline, startDateStr),
        lte(events.cfpDeadline, endDateStr),
      ),
    });

    console.log(
      `[CFP Deadline Notifier] User ${currentUser.name}: Found ${upcomingEvents.length} events with CFP deadline around ${targetDate.toISOString().split("T")[0]}`,
    );

    for (const event of upcomingEvents) {
      // Check if we already sent a notification for this event to this user
      const existingNotification = await database.query.notifications.findFirst(
        {
          where: and(
            eq(notifications.userId, currentUser.id),
            eq(notifications.eventId, event.id),
            eq(notifications.notificationType, "cfp_deadline"),
          ),
        },
      );

      if (existingNotification) {
        console.log(
          `[CFP Deadline Notifier] Skipping duplicate notification for user ${currentUser.name} and event ${event.name}`,
        );
        continue;
      }

      // Create notification
      await createNotification({
        db: database,
        userId: currentUser.id,
        notificationType: "cfp_deadline",
        title: "CFP deadline approaching",
        message: `${event.name} CFP closes in ${daysBefore} day${daysBefore === 1 ? "" : "s"}`,
        linkUrl: `/events/${event.id}`,
        actorId: null,
        activityId: null,
        eventId: event.id,
      });

      notificationCount++;
      console.log(
        `[CFP Deadline Notifier] Created notification for user ${currentUser.name} about ${event.name}`,
      );
    }
  }

  console.log(
    `[CFP Deadline Notifier] Completed. Created ${notificationCount} notifications`,
  );
}
