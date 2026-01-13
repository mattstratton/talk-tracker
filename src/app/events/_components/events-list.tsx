"use client";

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
  date: string | null;
  location: string | null;
  description: string | null;
  cfpDeadline: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export function EventsList({ initialEvents }: { initialEvents: Event[] }) {
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [cfpDeadline, setCfpDeadline] = useState("");
  const utils = api.useUtils();

  const { data: events = initialEvents } = api.event.getAll.useQuery(
    undefined,
    {
      initialData: initialEvents,
    },
  );

  const resetForm = () => {
    setEditingEvent(null);
    setName("");
    setDate("");
    setLocation("");
    setDescription("");
    setCfpDeadline("");
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
    setDate(event.date ?? "");
    setLocation(event.location ?? "");
    setDescription(event.description ?? "");
    setCfpDeadline(event.cfpDeadline ?? "");
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
        date: date || undefined,
        location: location || undefined,
        description: description || undefined,
        cfpDeadline: cfpDeadline || undefined,
      });
    } else {
      createEvent.mutate({
        name,
        date: date || undefined,
        location: location || undefined,
        description: description || undefined,
        cfpDeadline: cfpDeadline || undefined,
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
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  value={date}
                />
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{event.name}</h3>
                      {urgency && (
                        <span
                          className={`rounded-full px-2 py-1 font-semibold text-xs ${urgency.color}`}
                        >
                          {urgency.label}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-muted-foreground text-sm">
                      {event.date && <p>Date: {event.date}</p>}
                      {event.location && <p>Location: {event.location}</p>}
                      {event.cfpDeadline && (
                        <p>CFP Deadline: {event.cfpDeadline}</p>
                      )}
                      {event.description && (
                        <p className="mt-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
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
