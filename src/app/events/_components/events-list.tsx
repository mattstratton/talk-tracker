"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface Event {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  description: string | null;
  cfpDeadline: string | null;
  cfpUrl: string | null;
  conferenceWebsite: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  scoreInfo?: {
    totalScore: number;
    maxScore: number;
    completionCount: number;
    totalCategories: number;
    isComplete: boolean;
    meetsThreshold: boolean;
    threshold: number;
  };
  participations?: Array<{
    id: number;
    participationType: string;
    status: string;
  }>;
}

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

export function EventsList({ initialEvents }: { initialEvents: Event[] }) {
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [cfpDeadline, setCfpDeadline] = useState("");
  const [cfpUrl, setCfpUrl] = useState("");
  const [conferenceWebsite, setConferenceWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const utils = api.useUtils();

  const { data: events = initialEvents } =
    api.event.getAllWithScores.useQuery();

  const resetForm = () => {
    setEditingEvent(null);
    setName("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setDescription("");
    setCfpDeadline("");
    setCfpUrl("");
    setConferenceWebsite("");
    setNotes("");
  };

  const createEvent = api.event.create.useMutation({
    onSuccess: () => {
      void utils.event.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const updateEvent = api.event.update.useMutation({
    onSuccess: () => {
      void utils.event.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => {
      void utils.event.getAll.invalidate();
    },
  });

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setName(event.name);
    setStartDate(event.startDate ?? "");
    setEndDate(event.endDate ?? "");
    setLocation(event.location ?? "");
    setDescription(event.description ?? "");
    setCfpDeadline(event.cfpDeadline ?? "");
    setCfpUrl(event.cfpUrl ?? "");
    setConferenceWebsite(event.conferenceWebsite ?? "");
    setNotes(event.notes ?? "");
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingEvent) {
      updateEvent.mutate({
        id: editingEvent.id,
        name: name || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        location: location || undefined,
        description: description || undefined,
        cfpDeadline: cfpDeadline || undefined,
        cfpUrl: cfpUrl || undefined,
        conferenceWebsite: conferenceWebsite || undefined,
        notes: notes || undefined,
      });
    } else {
      createEvent.mutate({
        name,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        location: location || undefined,
        description: description || undefined,
        cfpDeadline: cfpDeadline || undefined,
        cfpUrl: cfpUrl || undefined,
        conferenceWebsite: conferenceWebsite || undefined,
        notes: notes || undefined,
      });
    }
  };

  const getCFPUrgency = (cfpDeadline: string | null) => {
    if (!cfpDeadline) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(cfpDeadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil < 0) return null; // Past deadline

    let color = "";
    let label = "";

    if (daysUntil === 0) {
      color = "bg-red-100 text-red-800";
      label = "Due today!";
    } else if (daysUntil === 1) {
      color = "bg-red-100 text-red-800";
      label = "Due tomorrow";
    } else if (daysUntil <= 7) {
      color = "bg-red-100 text-red-800";
      label = `${daysUntil} days left`;
    } else if (daysUntil <= 30) {
      color = "bg-yellow-100 text-yellow-800";
      label = `${daysUntil} days left`;
    } else {
      color = "bg-green-100 text-green-800";
      label = `${daysUntil} days left`;
    }

    return { color, label };
  };

  return (
    <div>
      <div className="mb-4">
        <Dialog
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
            }
          }}
          open={open}
        >
          <DialogTrigger asChild>
            <Button type="button">Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  name="name"
                  onChange={(e) => setName(e.target.value)}
                  required
                  value={name}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    onChange={(e) => setStartDate(e.target.value)}
                    type="date"
                    value={startDate}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    onChange={(e) => setEndDate(e.target.value)}
                    type="date"
                    value={endDate}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  onChange={(e) => setLocation(e.target.value)}
                  value={location}
                />
              </div>
              <div>
                <Label htmlFor="cfpDeadline">CFP Deadline</Label>
                <Input
                  id="cfpDeadline"
                  name="cfpDeadline"
                  onChange={(e) => setCfpDeadline(e.target.value)}
                  type="date"
                  value={cfpDeadline}
                />
              </div>
              <div>
                <Label htmlFor="cfpUrl">CFP URL</Label>
                <Input
                  id="cfpUrl"
                  name="cfpUrl"
                  onChange={(e) => setCfpUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                  value={cfpUrl}
                />
              </div>
              <div>
                <Label htmlFor="conferenceWebsite">Conference Website</Label>
                <Input
                  id="conferenceWebsite"
                  name="conferenceWebsite"
                  onChange={(e) => setConferenceWebsite(e.target.value)}
                  placeholder="https://..."
                  type="url"
                  value={conferenceWebsite}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  onChange={(e) => setNotes(e.target.value)}
                  value={notes}
                />
              </div>
              <Button className="w-full" type="submit">
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No events yet. Click &quot;Add Event&quot; to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const urgency = getCFPUrgency(event.cfpDeadline);
            return (
              <div className="rounded-lg border p-4" key={event.id}>
                <div className="flex items-start justify-between gap-4">
                  <Link
                    className="flex-1 transition-colors hover:text-gray-600"
                    href={`/events/${event.id}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">{event.name}</h3>
                      {urgency && (
                        <span
                          className={`rounded-full px-2 py-1 font-semibold text-xs ${urgency.color}`}
                        >
                          {urgency.label}
                        </span>
                      )}
                      {event.participations &&
                        event.participations.length > 0 && (
                          <>
                            {event.participations.map((p) => (
                              <span
                                className={`rounded-full px-2 py-1 font-semibold text-xs ${
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
                      {event.scoreInfo &&
                        event.scoreInfo.completionCount > 0 && (
                          <>
                            <span
                              className={`rounded-full px-2 py-1 font-semibold text-xs ${
                                event.scoreInfo.meetsThreshold
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {event.scoreInfo.meetsThreshold
                                ? "Recommended"
                                : "Below Threshold"}
                            </span>
                            <span className="text-gray-600 text-xs">
                              Score: {event.scoreInfo.totalScore}/
                              {event.scoreInfo.maxScore}
                            </span>
                          </>
                        )}
                    </div>
                    <div className="mt-2 space-y-1 text-muted-foreground text-sm">
                      {event.startDate && (
                        <p>
                          Date:{" "}
                          {event.endDate && event.endDate !== event.startDate
                            ? `${event.startDate} - ${event.endDate}`
                            : event.startDate}
                        </p>
                      )}
                      {event.location && <p>Location: {event.location}</p>}
                      {event.cfpDeadline && (
                        <p>CFP Deadline: {event.cfpDeadline}</p>
                      )}
                      {event.description && (
                        <p className="mt-2">{event.description}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button
                      onClick={() => handleEdit(event)}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(event.id)}
                      size="sm"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
