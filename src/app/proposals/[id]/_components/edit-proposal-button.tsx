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
  status: string;
  talkType: string;
  submissionDate: string | null;
  notes: string | null;
}

interface EditProposalButtonProps {
  proposal: Proposal;
}

export function EditProposalButton({ proposal }: EditProposalButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(proposal.status);
  const [selectedTalkType, setSelectedTalkType] = useState<string>(
    proposal.talkType,
  );
  const [submissionDate, setSubmissionDate] = useState<string>(
    proposal.submissionDate ?? "",
  );
  const [notes, setNotes] = useState<string>(proposal.notes ?? "");

  const utils = api.useUtils();

  const updateProposal = api.proposal.update.useMutation({
    onSuccess: () => {
      void utils.proposal.getById.invalidate({ id: proposal.id });
      void utils.proposal.getAll.invalidate();
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateProposal.mutate({
      id: proposal.id,
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
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit Proposal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Proposal</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              name="status"
              onValueChange={setSelectedStatus}
              required
              value={selectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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
            <Label htmlFor="talkType">Talk Type *</Label>
            <Select
              name="talkType"
              onValueChange={setSelectedTalkType}
              required
              value={selectedTalkType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select talk type" />
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
              rows={4}
              value={notes}
            />
          </div>
          <Button className="w-full" type="submit">
            Update Proposal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
