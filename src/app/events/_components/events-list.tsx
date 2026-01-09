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
  const utils = api.useUtils();

  const { data: events = initialEvents } = api.event.getAll.useQuery(
    undefined,
    {
      initialData: initialEvents,
    },
  );

  const createEvent = api.event.create.useMutation({
    onSuccess: () => {
      void utils.event.getAll.invalidate();
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createEvent.mutate({
      name: formData.get("name") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      cfpDeadline: formData.get("cfpDeadline") as string,
    });
  };

  return (
    <div>
      <div className="mb-4">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button type="button">Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" />
              </div>
              <div>
                <Label htmlFor="cfpDeadline">CFP Deadline</Label>
                <Input id="cfpDeadline" name="cfpDeadline" type="date" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <Button className="w-full" type="submit">
                Create Event
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
          {events.map((event) => (
            <div className="rounded-lg border p-4" key={event.id}>
              <h3 className="font-semibold text-lg">{event.name}</h3>
              <div className="mt-2 space-y-1 text-muted-foreground text-sm">
                {event.date && <p>Date: {event.date}</p>}
                {event.location && <p>Location: {event.location}</p>}
                {event.cfpDeadline && <p>CFP Deadline: {event.cfpDeadline}</p>}
                {event.description && (
                  <p className="mt-2">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
