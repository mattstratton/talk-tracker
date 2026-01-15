"use client";

import { DollarSign, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface EventParticipationProps {
  eventId: number;
  eventName: string;
}

type ParticipationType = "speak" | "sponsor" | "attend" | "exhibit" | "volunteer";
type ParticipationStatus = "interested" | "confirmed" | "not_going";

const participationTypeLabels: Record<ParticipationType, string> = {
  speak: "Speaking",
  sponsor: "Sponsoring",
  attend: "Attending",
  exhibit: "Exhibiting",
  volunteer: "Volunteering",
};

const statusLabels: Record<ParticipationStatus, string> = {
  interested: "Interested",
  confirmed: "Confirmed",
  not_going: "Not Going",
};

const statusColors: Record<ParticipationStatus, string> = {
  interested: "bg-gray-100 text-gray-700",
  confirmed: "bg-green-100 text-green-700",
  not_going: "bg-red-100 text-red-700",
};

export function EventParticipation({
  eventId,
  eventName,
}: EventParticipationProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipationType, setNewParticipationType] = useState<ParticipationType | "">("");
  const [newStatus, setNewStatus] = useState<ParticipationStatus>("interested");
  const [newBudget, setNewBudget] = useState("");
  const [newSponsorshipTier, setNewSponsorshipTier] = useState("");
  const [newBoothSize, setNewBoothSize] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<ParticipationStatus | "">("");
  const [editBudget, setEditBudget] = useState("");
  const [editSponsorshipTier, setEditSponsorshipTier] = useState("");
  const [editBoothSize, setEditBoothSize] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const utils = api.useUtils();

  const { data: participations, isLoading } =
    api.eventParticipation.getByEvent.useQuery({ eventId });

  const createMutation = api.eventParticipation.create.useMutation({
    onSuccess: () => {
      void utils.eventParticipation.getByEvent.invalidate({ eventId });
      setShowAddForm(false);
      resetAddForm();
    },
  });

  const updateMutation = api.eventParticipation.update.useMutation({
    onSuccess: () => {
      void utils.eventParticipation.getByEvent.invalidate({ eventId });
      setEditingId(null);
    },
  });

  const deleteMutation = api.eventParticipation.delete.useMutation({
    onSuccess: () => {
      void utils.eventParticipation.getByEvent.invalidate({ eventId });
    },
  });

  const resetAddForm = () => {
    setNewParticipationType("");
    setNewStatus("interested");
    setNewBudget("");
    setNewSponsorshipTier("");
    setNewBoothSize("");
    setNewDetails("");
    setNewNotes("");
  };

  const handleAdd = () => {
    if (!newParticipationType) return;

    let parsedBudget: number | undefined;
    if (newBudget) {
      const budget = parseFloat(newBudget);
      if (isNaN(budget) || budget < 0) {
        alert("Budget must be a valid positive number");
        return;
      }
      // Convert dollars to cents for storage
      parsedBudget = Math.round(budget * 100);
    }

    createMutation.mutate({
      eventId,
      participationType: newParticipationType,
      status: newStatus,
      budget: parsedBudget,
      sponsorshipTier: newSponsorshipTier || undefined,
      boothSize: newBoothSize || undefined,
      details: newDetails || undefined,
      notes: newNotes || undefined,
    });
  };

  const handleUpdate = (id: number) => {
    let parsedBudget: number | undefined;
    if (editBudget) {
      const budget = parseFloat(editBudget);
      if (isNaN(budget) || budget < 0) {
        alert("Budget must be a valid positive number");
        return;
      }
      // Convert dollars to cents for storage
      parsedBudget = Math.round(budget * 100);
    }

    updateMutation.mutate({
      id,
      status: editStatus || undefined,
      budget: parsedBudget,
      sponsorshipTier: editSponsorshipTier || undefined,
      boothSize: editBoothSize || undefined,
      details: editDetails || undefined,
      notes: editNotes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this participation?")) {
      deleteMutation.mutate({ id });
    }
  };

  const startEdit = (participation: {
    id: number;
    participationType: string;
    status: string;
    budget: number | null;
    sponsorshipTier: string | null;
    boothSize: string | null;
    details: string | null;
    notes: string | null;
  }) => {
    setEditingId(participation.id);
    setEditStatus(participation.status as ParticipationStatus);
    // Convert cents to dollars for editing
    setEditBudget(participation.budget ? (participation.budget / 100).toString() : "");
    setEditSponsorshipTier(participation.sponsorshipTier || "");
    setEditBoothSize(participation.boothSize || "");
    setEditDetails(participation.details || "");
    setEditNotes(participation.notes || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus("");
    setEditBudget("");
    setEditSponsorshipTier("");
    setEditBoothSize("");
    setEditDetails("");
    setEditNotes("");
  };

  const formatBudget = (cents: number | null) => {
    if (!cents) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-gray-500 text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">
            Company Participation
          </CardTitle>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="space-y-3 rounded-lg border p-4">
            <div>
              <label className="font-medium text-sm">Participation Type</label>
              <Select
                onValueChange={(value) => setNewParticipationType(value as ParticipationType)}
                value={newParticipationType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speak">Speaking</SelectItem>
                  <SelectItem value="sponsor">Sponsoring</SelectItem>
                  <SelectItem value="attend">Attending</SelectItem>
                  <SelectItem value="exhibit">Exhibiting</SelectItem>
                  <SelectItem value="volunteer">Volunteering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium text-sm">Status</label>
              <Select onValueChange={(value) => setNewStatus(value as ParticipationStatus)} value={newStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="not_going">Not Going</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium text-sm">Budget</label>
              <Input
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="e.g., 5000"
                type="number"
                value={newBudget}
              />
            </div>
            <div>
              <label className="font-medium text-sm">
                Sponsorship Tier (optional)
              </label>
              <Input
                onChange={(e) => setNewSponsorshipTier(e.target.value)}
                placeholder="e.g., Gold, Silver, Bronze"
                value={newSponsorshipTier}
              />
            </div>
            <div>
              <label className="font-medium text-sm">
                Booth Size (optional)
              </label>
              <Input
                onChange={(e) => setNewBoothSize(e.target.value)}
                placeholder="e.g., 10x10, 20x20"
                value={newBoothSize}
              />
            </div>
            <div>
              <label className="font-medium text-sm">Details (optional)</label>
              <Textarea
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Additional details..."
                rows={2}
                value={newDetails}
              />
            </div>
            <div>
              <label className="font-medium text-sm">Notes (optional)</label>
              <Textarea
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={2}
                value={newNotes}
              />
            </div>
            <div className="flex gap-2">
              <Button
                disabled={!newParticipationType || createMutation.isPending}
                onClick={handleAdd}
                size="sm"
              >
                {createMutation.isPending ? "Adding..." : "Add"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  resetAddForm();
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {participations && participations.length > 0 ? (
          <div className="space-y-3">
            {participations.map((participation) => (
              <div className="rounded-lg border p-4" key={participation.id}>
                {editingId === participation.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-sm">Status</label>
                      <Select onValueChange={(value) => setEditStatus(value as ParticipationStatus)} value={editStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="not_going">Not Going</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="font-medium text-sm">
                        Budget
                      </label>
                      <Input
                        onChange={(e) => setEditBudget(e.target.value)}
                        placeholder="e.g., 5000"
                        type="number"
                        value={editBudget}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">
                        Sponsorship Tier
                      </label>
                      <Input
                        onChange={(e) => setEditSponsorshipTier(e.target.value)}
                        placeholder="e.g., Gold, Silver, Bronze"
                        value={editSponsorshipTier}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">Booth Size</label>
                      <Input
                        onChange={(e) => setEditBoothSize(e.target.value)}
                        placeholder="e.g., 10x10, 20x20"
                        value={editBoothSize}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">Details</label>
                      <Textarea
                        onChange={(e) => setEditDetails(e.target.value)}
                        rows={2}
                        value={editDetails}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">Notes</label>
                      <Textarea
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        value={editNotes}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdate(participation.id)}
                        size="sm"
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={cancelEdit} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {
                              participationTypeLabels[
                                participation.participationType as keyof typeof participationTypeLabels
                              ]
                            }
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${
                              statusColors[
                                participation.status as keyof typeof statusColors
                              ]
                            }`}
                          >
                            {
                              statusLabels[
                                participation.status as keyof typeof statusLabels
                              ]
                            }
                          </span>
                        </div>
                        <div className="space-y-1 text-gray-600 text-sm">
                          {participation.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>
                                Budget: {formatBudget(participation.budget)}
                              </span>
                            </div>
                          )}
                          {participation.sponsorshipTier && (
                            <div>Tier: {participation.sponsorshipTier}</div>
                          )}
                          {participation.boothSize && (
                            <div>Booth: {participation.boothSize}</div>
                          )}
                          {participation.details && (
                            <div className="mt-2 text-gray-700">
                              {participation.details}
                            </div>
                          )}
                          {participation.notes && (
                            <div className="mt-2 text-gray-500 italic">
                              {participation.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => startEdit(participation)}
                          size="sm"
                          variant="ghost"
                        >
                          Edit
                        </Button>
                        <Button
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(participation.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showAddForm && (
            <p className="py-4 text-center text-gray-500 text-sm">
              No participation plans yet. Click "Add" to get started.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
