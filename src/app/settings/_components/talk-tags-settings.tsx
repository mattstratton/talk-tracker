"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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

interface Tag {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

interface TalkTagsSettingsProps {
  initialTags: Tag[];
}

export function TalkTagsSettings({ initialTags }: TalkTagsSettingsProps) {
  const [open, setOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const utils = api.useUtils();

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [description, setDescription] = useState("");

  const { data: tags = initialTags } = api.talkTag.getAll.useQuery(undefined, {
    initialData: initialTags,
  });

  const createTag = api.talkTag.create.useMutation({
    onSuccess: () => {
      void utils.talkTag.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const updateTag = api.talkTag.update.useMutation({
    onSuccess: () => {
      void utils.talkTag.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const deleteTag = api.talkTag.delete.useMutation({
    onSuccess: () => {
      void utils.talkTag.getAll.invalidate();
    },
  });

  const resetForm = () => {
    setEditingTag(null);
    setName("");
    setColor("#2563eb");
    setDescription("");
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setColor(tag.color || "#2563eb");
    setDescription(tag.description || "");
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (
      confirm("Delete this tag? It will be removed from all talks that use it.")
    ) {
      deleteTag.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      name,
      color: color || undefined,
      description: description || undefined,
    };

    if (editingTag) {
      updateTag.mutate({ id: editingTag.id, ...data });
    } else {
      createTag.mutate(data);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base text-gray-900 sm:text-lg">
          Talk Tags
        </CardTitle>
        <CardDescription>
          Create tags to categorize your talks by topic, audience level,
          technology, or any custom categories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Dialog
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }}
            open={open}
          >
            <DialogTrigger asChild>
              <Button>Add Tag</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? "Edit Tag" : "Add Tag"}</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="name">Tag Name *</Label>
                  <Input
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Kubernetes, Beginner-Friendly, DevOps"
                    required
                    value={name}
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      className="h-10 w-20"
                      id="color"
                      onChange={(e) => setColor(e.target.value)}
                      type="color"
                      value={color}
                    />
                    <Input
                      className="flex-1"
                      onChange={(e) => setColor(e.target.value)}
                      pattern="^#[0-9A-Fa-f]{6}$"
                      placeholder="#2563eb"
                      type="text"
                      value={color}
                    />
                  </div>
                  <p className="mt-1 text-gray-600 text-xs">
                    Choose a color for this tag (hex format)
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description of what this tag represents"
                    rows={3}
                    value={description}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    disabled={createTag.isPending || updateTag.isPending}
                    type="submit"
                  >
                    {editingTag ? "Update Tag" : "Create Tag"}
                  </Button>
                  <Button
                    onClick={() => setOpen(false)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {tags.length === 0 ? (
          <p className="text-center text-gray-600 text-sm">
            No tags yet. Create your first tag to start categorizing talks.
          </p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                className="flex items-center gap-3 rounded-lg border p-3"
                key={tag.id}
              >
                <div
                  className="h-6 w-6 flex-shrink-0 rounded"
                  style={{ backgroundColor: tag.color || "#2563eb" }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {tag.name}
                  </h4>
                  {tag.description && (
                    <p className="text-gray-600 text-xs">{tag.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(tag)}
                    size="sm"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    disabled={deleteTag.isPending}
                    onClick={() => handleDelete(tag.id)}
                    size="sm"
                    variant="outline"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
