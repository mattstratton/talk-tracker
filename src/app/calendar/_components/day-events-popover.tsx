"use client";

import { format } from "date-fns";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type Event = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  cfpDeadline: string | null;
  description: string | null;
  participations?: Array<{
    id: number;
    participationType: string;
    status: string;
  }>;
};

const participationTypeLabels: Record<string, string> = {
  speak: "Speaking",
  sponsor: "Sponsoring",
  attend: "Attending",
  exhibit: "Exhibiting",
  volunteer: "Volunteering",
};

const statusColors: Record<string, string> = {
  interested: "bg-gray-100 text-gray-700",
  confirmed: "bg-green-100 text-green-700",
  not_going: "bg-red-100 text-red-700",
};

interface DayEventsPopoverProps {
  date: Date | null;
  events: Event[];
  isOpen: boolean;
  onClose: () => void;
}

export function DayEventsPopover({
  date,
  events,
  isOpen,
  onClose,
}: DayEventsPopoverProps) {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getCFPStatus = (cfpDeadline: string | null) => {
    if (!cfpDeadline) return null;

    const deadline = new Date(cfpDeadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil < 0) {
      return { label: "CFP Closed", color: "bg-gray-100 text-gray-600" };
    }
    if (daysUntil === 0) {
      return { label: "CFP Due Today!", color: "bg-red-500 text-white" };
    }
    if (daysUntil <= 7) {
      return {
        label: `CFP: ${daysUntil}d left`,
        color: "bg-red-100 text-red-800",
      };
    }
    if (daysUntil <= 30) {
      return {
        label: `CFP: ${daysUntil}d left`,
        color: "bg-yellow-100 text-yellow-800",
      };
    }
    return {
      label: `CFP: ${daysUntil}d left`,
      color: "bg-green-100 text-green-800",
    };
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Events on {format(date, "MMMM d, yyyy")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {events.map((event) => {
            const cfpStatus = getCFPStatus(event.cfpDeadline);

            return (
              <Link
                className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
                href={`/events/${event.id}`}
                key={event.id}
                onClick={onClose}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{event.name}</h4>
                  {event.participations && event.participations.length > 0 && (
                    <>
                      {event.participations.map((p) => (
                        <span
                          className={`rounded px-2 py-0.5 font-medium text-xs ${
                            statusColors[p.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                          key={p.id}
                        >
                          {participationTypeLabels[p.participationType] ||
                            p.participationType}
                        </span>
                      ))}
                    </>
                  )}
                  {cfpStatus && (
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${cfpStatus.color}`}
                    >
                      {cfpStatus.label}
                    </span>
                  )}
                </div>

                {event.location && (
                  <p className="mb-1 text-gray-600 text-sm">{event.location}</p>
                )}

                {event.cfpDeadline && (
                  <p className="text-gray-600 text-sm">
                    CFP Deadline:{" "}
                    {new Date(event.cfpDeadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
