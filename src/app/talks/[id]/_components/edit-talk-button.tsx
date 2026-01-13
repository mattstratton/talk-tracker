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
import { TagSelector } from "~/app/talks/_components/tag-selector";
import { api } from "~/trpc/react";

interface Talk {
  id: number;
  title: string;
  abstract: string;
  description: string | null;
  talkTagAssignments: {
    id: number;
    tagId: number;
    tag: {
      id: number;
      name: string;
      color: string | null;
    };
  }[];
}

interface EditTalkButtonProps {
  talk: Talk;
}

export function EditTalkButton({ talk }: EditTalkButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(talk.title);
  const [abstract, setAbstract] = useState(talk.abstract);
  const [description, setDescription] = useState(talk.description ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    talk.talkTagAssignments.map((a) => a.tagId),
  );

  const utils = api.useUtils();

  const setTags = api.talkTagAssignment.setTags.useMutation();

  const updateTalk = api.talk.update.useMutation({
    onSuccess: async (updatedTalk) => {
      // Update tags for the talk
      if (updatedTalk) {
        await setTags.mutateAsync({
          talkId: updatedTalk.id,
          tagIds: selectedTagIds,
        });
      }
      void utils.talk.getById.invalidate({ id: talk.id });
      void utils.talk.getAll.invalidate();
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateTalk.mutate({
      id: talk.id,
      title: title || undefined,
      abstract: abstract || undefined,
      description: description || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit Talk
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Talk</DialogTitle>
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
              rows={4}
              value={abstract}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              value={description}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <TagSelector
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
            />
          </div>
          <Button className="w-full" type="submit">
            Update Talk
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
