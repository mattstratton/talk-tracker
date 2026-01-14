import { createEvents, type EventAttributes } from "ics";

type Event = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  cfpDeadline: string | null;
  description: string | null;
  conferenceWebsite?: string | null;
  participations?: Array<{
    id: number;
    participationType: string;
    status: string;
  }>;
};

export function exportToICalendar(events: Event[]) {
  const icsEvents: EventAttributes[] = [];

  events.forEach((event) => {
    // Add main event if it has a start date
    if (event.startDate) {
      const start = new Date(event.startDate);
      const end = event.endDate
        ? new Date(event.endDate)
        : new Date(event.startDate);

      // Format participation types for event description
      const participationInfo =
        event.participations && event.participations.length > 0
          ? `\n\nParticipation:\n${event.participations
              .map((p) => `- ${p.participationType} (${p.status})`)
              .join("\n")}`
          : "";

      const description = `${event.description || ""}${participationInfo}${
        event.conferenceWebsite ? `\n\nWebsite: ${event.conferenceWebsite}` : ""
      }`.trim();

      const eventAttrs: EventAttributes = {
        start: [start.getFullYear(), start.getMonth() + 1, start.getDate()],
        end: [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate() + 1, // iCal exclusive end date
        ],
        title: event.name,
        description,
        status: "CONFIRMED",
        busyStatus: "BUSY",
      };

      if (event.location) {
        eventAttrs.location = event.location;
      }

      if (event.conferenceWebsite) {
        eventAttrs.url = event.conferenceWebsite;
      }

      icsEvents.push(eventAttrs);
    }

    // Add CFP deadline as a separate calendar event
    if (event.cfpDeadline) {
      const deadline = new Date(event.cfpDeadline);

      const cfpAttrs: EventAttributes = {
        start: [
          deadline.getFullYear(),
          deadline.getMonth() + 1,
          deadline.getDate(),
        ],
        duration: { hours: 1 },
        title: `CFP Deadline: ${event.name}`,
        description: `Call for Proposals deadline for ${event.name}${
          event.conferenceWebsite
            ? `\n\nWebsite: ${event.conferenceWebsite}`
            : ""
        }`,
        status: "CONFIRMED",
        busyStatus: "FREE",
        alarms: [
          {
            action: "display",
            description: `CFP Deadline for ${event.name} is today!`,
            trigger: { hours: 24, minutes: 0, before: true },
          },
        ],
      };

      if (event.location) {
        cfpAttrs.location = event.location;
      }

      if (event.conferenceWebsite) {
        cfpAttrs.url = event.conferenceWebsite;
      }

      icsEvents.push(cfpAttrs);
    }
  });

  createEvents(icsEvents, (error, value) => {
    if (error) {
      console.error("Error creating iCal file:", error);
      alert("Failed to export calendar. Please try again.");
      return;
    }

    // Create a blob and download
    const blob = new Blob([value], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "talk-tracker-events.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
