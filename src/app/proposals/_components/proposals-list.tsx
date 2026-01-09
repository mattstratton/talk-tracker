"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface Proposal {
  id: number;
  talkId: number;
  eventId: number;
  userId: string;
  status: "draft" | "submitted" | "accepted" | "rejected" | "confirmed";
  talkType: "keynote" | "regular" | "lightning" | "workshop";
  submissionDate: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  talk: {
    id: number;
    title: string;
    abstract: string;
    description: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date | null;
  };
  event: {
    id: number;
    name: string;
    date: string | null;
    location: string | null;
    description: string | null;
    cfpDeadline: string | null;
    createdAt: Date;
    updatedAt: Date | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface Event {
  id: number;
  name: string;
}

interface Talk {
  id: number;
  title: string;
}

export function ProposalsList({
  initialProposals,
  events,
  talks,
}: {
  initialProposals: Proposal[];
  events: Event[];
  talks: Talk[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedTalkId, setSelectedTalkId] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("draft");
  const [selectedTalkType, setSelectedTalkType] = useState<string>("regular");
  const utils = api.useUtils();

  const { data: proposals = initialProposals } = api.proposal.getAll.useQuery(
    undefined,
    {
      initialData: initialProposals,
    },
  );

  const createProposal = api.proposal.create.useMutation({
    onSuccess: () => {
      void utils.proposal.getAll.invalidate();
      setOpen(false);
      setSelectedTalkId("");
      setSelectedEventId("");
      setSelectedStatus("draft");
      setSelectedTalkType("regular");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createProposal.mutate({
      talkId: parseInt(selectedTalkId),
      eventId: parseInt(selectedEventId),
      status: selectedStatus as
        | "draft"
        | "submitted"
        | "accepted"
        | "rejected"
        | "confirmed",
      talkType: selectedTalkType as
        | "keynote"
        | "regular"
        | "lightning"
        | "workshop",
      submissionDate: (formData.get("submissionDate") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button type="button">Add Proposal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Proposal</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="talkId">Talk *</Label>
                <Select
                  onValueChange={setSelectedTalkId}
                  value={selectedTalkId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a talk" />
                  </SelectTrigger>
                  <SelectContent>
                    {talks.map((talk) => (
                      <SelectItem key={talk.id} value={talk.id.toString()}>
                        {talk.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eventId">Event *</Label>
                <Select
                  onValueChange={setSelectedEventId}
                  value={selectedEventId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="talkType">Talk Type *</Label>
                <Select
                  onValueChange={setSelectedTalkType}
                  value={selectedTalkType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keynote">Keynote</SelectItem>
                    <SelectItem value="regular">Regular Session</SelectItem>
                    <SelectItem value="lightning">Lightning Talk</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={setSelectedStatus}
                  value={selectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="submissionDate">Submission Date</Label>
                <Input id="submissionDate" name="submissionDate" type="date" />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" />
              </div>
              <Button
                className="w-full"
                disabled={!selectedTalkId || !selectedEventId}
                type="submit"
              >
                Create Proposal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {proposals.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No proposals yet. Click &quot;Add Proposal&quot; to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div className="rounded-lg border p-4" key={proposal.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {proposal.talk.title}
                    </h3>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {proposal.event.name} • {proposal.user.name} •{" "}
                    {proposal.talkType}
                  </p>
                  {proposal.submissionDate && (
                    <p className="mt-1 text-muted-foreground text-sm">
                      Submitted: {proposal.submissionDate}
                    </p>
                  )}
                  {proposal.notes && (
                    <p className="mt-2 text-sm">{proposal.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
