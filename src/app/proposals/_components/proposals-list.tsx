"use client";

import Link from "next/link";
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
  currentUserId,
}: {
  initialProposals: Proposal[];
  events: Event[];
  talks: Talk[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [selectedTalkId, setSelectedTalkId] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("draft");
  const [selectedTalkType, setSelectedTalkType] = useState<string>("regular");
  const [submissionDate, setSubmissionDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [filterTalkType, setFilterTalkType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  const utils = api.useUtils();

  const { data: proposals = initialProposals } = api.proposal.getAll.useQuery(
    undefined,
    {
      initialData: initialProposals,
    },
  );

  // Get unique users from proposals
  const users = Array.from(
    new Set(proposals.map((p) => JSON.stringify({ id: p.user.id, name: p.user.name })))
  ).map((u) => JSON.parse(u) as { id: string; name: string });

  // Apply filters and sorting
  const filteredProposals = proposals
    .filter((proposal) => {
      if (filterStatus !== "all" && proposal.status !== filterStatus) return false;
      if (filterEvent !== "all" && proposal.eventId.toString() !== filterEvent) return false;
      if (filterTalkType !== "all" && proposal.talkType !== filterTalkType) return false;
      if (filterUser !== "all" && proposal.userId !== filterUser) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "event":
          return a.event.name.localeCompare(b.event.name);
        case "talk":
          return a.talk.title.localeCompare(b.talk.title);
        default:
          return 0;
      }
    });

  const resetForm = () => {
    setEditingProposal(null);
    setSelectedTalkId("");
    setSelectedEventId("");
    setSelectedStatus("draft");
    setSelectedTalkType("regular");
    setSubmissionDate("");
    setNotes("");
  };

  const createProposal = api.proposal.create.useMutation({
    onSuccess: () => {
      void utils.proposal.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const updateProposal = api.proposal.update.useMutation({
    onSuccess: () => {
      void utils.proposal.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setSelectedTalkId(proposal.talkId.toString());
    setSelectedEventId(proposal.eventId.toString());
    setSelectedStatus(proposal.status);
    setSelectedTalkType(proposal.talkType);
    setSubmissionDate(proposal.submissionDate ?? "");
    setNotes(proposal.notes ?? "");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingProposal) {
      updateProposal.mutate({
        id: editingProposal.id,
        talkId: parseInt(selectedTalkId, 10),
        eventId: parseInt(selectedEventId, 10),
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
        submissionDate: submissionDate || undefined,
        notes: notes || undefined,
      });
    } else {
      createProposal.mutate({
        talkId: parseInt(selectedTalkId, 10),
        eventId: parseInt(selectedEventId, 10),
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
        submissionDate: submissionDate || undefined,
        notes: notes || undefined,
      });
    }
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
      {/* Filters Section */}
      <div className="mb-6 rounded-lg border bg-muted/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Filters & Sorting</h3>
          <Button
            onClick={() => {
              if (filterUser === currentUserId) {
                setFilterUser("all");
              } else {
                setFilterUser(currentUserId);
              }
            }}
            size="sm"
            variant={filterUser === currentUserId ? "default" : "outline"}
          >
            {filterUser === currentUserId ? "Showing My Proposals" : "Show My Proposals"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <Label className="text-xs" htmlFor="filterStatus">
              Status
            </Label>
            <Select onValueChange={setFilterStatus} value={filterStatus}>
              <SelectTrigger className="h-9" id="filterStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs" htmlFor="filterEvent">
              Event
            </Label>
            <Select onValueChange={setFilterEvent} value={filterEvent}>
              <SelectTrigger className="h-9" id="filterEvent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs" htmlFor="filterTalkType">
              Talk Type
            </Label>
            <Select onValueChange={setFilterTalkType} value={filterTalkType}>
              <SelectTrigger className="h-9" id="filterTalkType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="keynote">Keynote</SelectItem>
                <SelectItem value="regular">Regular Session</SelectItem>
                <SelectItem value="lightning">Lightning Talk</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs" htmlFor="filterUser">
              Team Member
            </Label>
            <Select onValueChange={setFilterUser} value={filterUser}>
              <SelectTrigger className="h-9" id="filterUser">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs" htmlFor="sortBy">
              Sort By
            </Label>
            <Select onValueChange={setSortBy} value={sortBy}>
              <SelectTrigger className="h-9" id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="event">Event Name</SelectItem>
                <SelectItem value="talk">Talk Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {(filterStatus !== "all" ||
          filterEvent !== "all" ||
          filterTalkType !== "all" ||
          filterUser !== "all") && (
          <Button
            className="mt-3"
            onClick={() => {
              setFilterStatus("all");
              setFilterEvent("all");
              setFilterTalkType("all");
              setFilterUser("all");
            }}
            size="sm"
            variant="outline"
          >
            Clear Filters
          </Button>
        )}
      </div>

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
            <Button type="button">Add Proposal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProposal ? "Edit Proposal" : "Add New Proposal"}
              </DialogTitle>
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
                <Input
                  id="submissionDate"
                  name="submissionDate"
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  type="date"
                  value={submissionDate}
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
              <Button
                className="w-full"
                disabled={!selectedTalkId || !selectedEventId}
                type="submit"
              >
                {editingProposal ? "Update Proposal" : "Create Proposal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {proposals.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No proposals yet. Click &quot;Add Proposal&quot; to create one.
        </p>
      ) : filteredProposals.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No proposals match the current filters.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div className="rounded-lg border p-4 transition-shadow hover:shadow-md" key={proposal.id}>
              <div className="flex items-start justify-between">
                <Link className="flex-1" href={`/proposals/${proposal.id}`}>
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
                </Link>
                <Button
                  onClick={() => handleEdit(proposal)}
                  size="sm"
                  variant="outline"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
