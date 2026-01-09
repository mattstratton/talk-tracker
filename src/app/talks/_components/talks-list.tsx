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
  const utils = api.useUtils();

  const { data: talks = initialTalks } = api.talk.getAll.useQuery(undefined, {
    initialData: initialTalks,
  });

  const createTalk = api.talk.create.useMutation({
    onSuccess: () => {
      void utils.talk.getAll.invalidate();
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTalk.mutate({
      title: formData.get("title") as string,
      abstract: formData.get("abstract") as string,
      description: formData.get("description") as string,
    });
  };

  return (
    <div>
      <div className="mb-4">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button type="button">Add Talk</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Talk</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea id="abstract" name="abstract" required />
              </div>
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <Button className="w-full" type="submit">
                Create Talk
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
