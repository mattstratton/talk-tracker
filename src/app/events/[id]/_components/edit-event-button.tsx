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
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  description: string | null;
  cfpDeadline: string | null;
  cfpUrl: string | null;
  conferenceWebsite: string | null;
  notes: string | null;
}

interface EditEventButtonProps {
  event: Event;
}

export function EditEventButton({ event }: EditEventButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(event.name);
  const [startDate, setStartDate] = useState(event.startDate ?? "");
  const [endDate, setEndDate] = useState(event.endDate ?? "");
  const [location, setLocation] = useState(event.location ?? "");
  const [description, setDescription] = useState(event.description ?? "");
  const [cfpDeadline, setCfpDeadline] = useState(event.cfpDeadline ?? "");
  const [cfpUrl, setCfpUrl] = useState(event.cfpUrl ?? "");
  const [conferenceWebsite, setConferenceWebsite] = useState(
    event.conferenceWebsite ?? "",
  );
  const [notes, setNotes] = useState(event.notes ?? "");

  const utils = api.useUtils();

  const updateEvent = api.event.update.useMutation({
    onSuccess: () => {
      void utils.event.getById.invalidate({ id: event.id });
      void utils.event.getAll.invalidate();
      void utils.event.getAllWithScores.invalidate();
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateEvent.mutate({
      id: event.id,
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
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
              type="url"
              value={cfpUrl}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="conferenceWebsite">Conference Website</Label>
            <Input
              id="conferenceWebsite"
              name="conferenceWebsite"
              onChange={(e) => setConferenceWebsite(e.target.value)}
              type="url"
              value={conferenceWebsite}
              placeholder="https://..."
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
            Update Event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
