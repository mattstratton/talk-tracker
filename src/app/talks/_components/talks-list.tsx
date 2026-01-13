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

interface Talk {
  id: number;
  title: string;
  abstract: string;
  description: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function TalksList({ initialTalks }: { initialTalks: Talk[] }) {
  const [open, setOpen] = useState(false);
  const [editingTalk, setEditingTalk] = useState<Talk | null>(null);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [description, setDescription] = useState("");
  const utils = api.useUtils();

  const { data: talks = initialTalks } = api.talk.getAll.useQuery(undefined, {
    initialData: initialTalks,
  });

  const resetForm = () => {
    setEditingTalk(null);
    setTitle("");
    setAbstract("");
    setDescription("");
  };

  const createTalk = api.talk.create.useMutation({
    onSuccess: () => {
      void utils.talk.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const updateTalk = api.talk.update.useMutation({
    onSuccess: () => {
      void utils.talk.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const deleteTalk = api.talk.delete.useMutation({
    onSuccess: () => {
      void utils.talk.getAll.invalidate();
    },
  });

  const handleEdit = (talk: Talk) => {
    setEditingTalk(talk);
    setTitle(talk.title);
    setAbstract(talk.abstract);
    setDescription(talk.description ?? "");
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this talk?")) {
      deleteTalk.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingTalk) {
      updateTalk.mutate({
        id: editingTalk.id,
        title: title || undefined,
        abstract: abstract || undefined,
        description: description || undefined,
      });
    } else {
      createTalk.mutate({
        title,
        abstract,
        description: description || undefined,
      });
    }
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
            <Button type="button">Add Talk</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTalk ? "Edit Talk" : "Add New Talk"}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  value={title}
                />
              </div>
              <div>
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea
                  id="abstract"
                  name="abstract"
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                  value={abstract}
                />
              </div>
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                />
              </div>
              <Button className="w-full" type="submit">
                {editingTalk ? "Update Talk" : "Create Talk"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {talks.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No talks yet. Click &quot;Add Talk&quot; to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {talks.map((talk) => (
            <div className="rounded-lg border p-4" key={talk.id}>
              <div className="flex items-start justify-between gap-4">
                <Link
                  className="flex-1 transition-colors hover:text-gray-600"
                  href={`/talks/${talk.id}`}
                >
                  <h3 className="font-semibold text-lg">{talk.title}</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    by {talk.createdBy.name}
                  </p>
                  <p className="mt-2 text-sm">{talk.abstract}</p>
                  {talk.description && (
                    <p className="mt-2 text-muted-foreground text-sm">
                      {talk.description}
                    </p>
                  )}
                </Link>
                <div className="flex flex-shrink-0 gap-2">
                  <Button
                    onClick={() => handleEdit(talk)}
                    size="sm"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(talk.id)}
                    size="sm"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
