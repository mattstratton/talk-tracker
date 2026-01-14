"use client";

import { useState } from "react";
import { Plus, X, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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

const participationTypeLabels = {
  speak: "Speaking",
  sponsor: "Sponsoring",
  attend: "Attending",
  exhibit: "Exhibiting",
  volunteer: "Volunteering",
};

const statusLabels = {
  interested: "Interested",
  applied: "Applied",
  confirmed: "Confirmed",
  not_going: "Not Going",
};

const statusColors = {
  interested: "bg-gray-100 text-gray-700",
  applied: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  not_going: "bg-red-100 text-red-700",
};

export function EventParticipation({ eventId, eventName }: EventParticipationProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipationType, setNewParticipationType] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("interested");
  const [newNotes, setNewNotes] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editNotes, setEditNotes] = useState("");

  const utils = api.useUtils();

  const { data: myParticipations, isLoading } =
    api.eventParticipation.getMyParticipations.useQuery({ eventId });

  const { data: teamParticipations } =
    api.eventParticipation.getEventParticipations.useQuery({ eventId });

  const createMutation = api.eventParticipation.create.useMutation({
    onSuccess: () => {
      void utils.eventParticipation.getMyParticipations.invalidate({ eventId });
      void utils.eventParticipation.getEventParticipations.invalidate({ eventId });
      setShowAddForm(false);
      setNewParticipationType("");
      setNewStatus("interested");
      setNewNotes("");
    },
  });

  const updateMutation = api.eventParticipation.update.useMutation({
    onSuccess: () => {
      void utils.eventParticipation.getMyParticipations.invalidate({ eventId });
      void utils.eventParticipation.getEventParticipations.invalidate({ eventId });
      setEditingId(null);
    },
  });

  const deleteMutation = api.eventParticipation.delete.useMutation({
    onSuccess: () => {
      void utils.eventParticipation.getMyParticipations.invalidate({ eventId });
      void utils.eventParticipation.getEventParticipations.invalidate({ eventId });
    },
  });

  const handleAdd = () => {
    if (!newParticipationType) return;

    createMutation.mutate({
      eventId,
      participationType: newParticipationType as any,
      status: newStatus as any,
      notes: newNotes || undefined,
    });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({
      id,
      status: editStatus as any,
      notes: editNotes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this participation?")) {
      deleteMutation.mutate({ id });
    }
  };

  const startEdit = (participation: any) => {
    setEditingId(participation.id);
    setEditStatus(participation.status);
    setEditNotes(participation.notes || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus("");
    setEditNotes("");
  };

  // Get team summary by participation type
  const teamSummary = teamParticipations?.reduce((acc, p) => {
    if (!acc[p.participationType]) {
      acc[p.participationType] = [];
    }
    acc[p.participationType]!.push(p);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* My Participation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">My Participation</CardTitle>
            {!showAddForm && (
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Participation Type</label>
                <Select value={newParticipationType} onValueChange={setNewParticipationType}>
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
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="not_going">Not Going</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!newParticipationType || createMutation.isPending}
                >
                  {createMutation.isPending ? "Adding..." : "Add"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {myParticipations && myParticipations.length > 0 ? (
            <div className="space-y-3">
              {myParticipations.map((participation) => (
                <div
                  key={participation.id}
                  className="rounded-lg border p-4"
                >
                  {editingId === participation.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select value={editStatus} onValueChange={setEditStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="interested">Interested</SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="not_going">Not Going</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(participation.id)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {participationTypeLabels[participation.participationType as keyof typeof participationTypeLabels]}
                            </span>
                            <span
                              className={`rounded px-2 py-0.5 text-xs ${
                                statusColors[participation.status as keyof typeof statusColors]
                              }`}
                            >
                              {statusLabels[participation.status as keyof typeof statusLabels]}
                            </span>
                          </div>
                          {participation.notes && (
                            <p className="mt-1 text-sm text-gray-600">
                              {participation.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(participation)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(participation.id)}
                            disabled={deleteMutation.isPending}
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
              <p className="text-center text-sm text-gray-500 py-4">
                No participation added yet. Click "Add" to get started.
              </p>
            )
          )}
        </CardContent>
      </Card>

      {/* Team Participation */}
      {teamSummary && Object.keys(teamSummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5" />
              Team Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(teamSummary).map(([type, participants]) => (
                <div key={type}>
                  <h4 className="mb-2 font-medium text-sm text-gray-900">
                    {participationTypeLabels[type as keyof typeof participationTypeLabels]} ({participants.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {participants.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-1.5"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                          {p.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{p.user.name}</span>
                        <span className={`rounded px-1.5 py-0.5 text-xs ${statusColors[p.status as keyof typeof statusColors]}`}>
                          {statusLabels[p.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
