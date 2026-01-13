"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { TagBadge } from "~/components/tag-badge";
import { api } from "~/trpc/react";

interface Tag {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
}

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#2563eb");
  const utils = api.useUtils();

  const { data: allTags = [] } = api.talkTag.getAll.useQuery();

  const createTag = api.talkTag.create.useMutation({
    onSuccess: async (newTag) => {
      if (newTag) {
        onChange([...selectedTagIds, newTag.id]);
      }
      setIsCreating(false);
      setNewTagName("");
      setNewTagColor("#2563eb");
      await utils.talkTag.getAll.invalidate();
    },
  });

  const handleToggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      await createTag.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor,
      });
    }
  };

  return (
    <div className="space-y-3">
      <Label>Tags</Label>

      {allTags.length === 0 && !isCreating ? (
        <p className="text-gray-600 text-sm">
          No tags yet. Create your first tag below.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <label
              key={tag.id}
              className="flex cursor-pointer items-center gap-2 rounded border p-2 transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => handleToggleTag(tag.id)}
                className="h-4 w-4"
              />
              <TagBadge tag={tag} />
            </label>
          ))}
        </div>
      )}

      {isCreating ? (
        <form onSubmit={handleCreateTag} className="space-y-3 rounded border p-3">
          <div>
            <Label htmlFor="newTagName">New Tag Name *</Label>
            <Input
              id="newTagName"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g., Kubernetes, DevOps"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="newTagColor">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="newTagColor"
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                placeholder="#2563eb"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={createTag.isPending || !newTagName.trim()}
            >
              {createTag.isPending ? "Creating..." : "Create Tag"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewTagName("");
                setNewTagColor("#2563eb");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsCreating(true)}
        >
          + Create New Tag
        </Button>
      )}
    </div>
  );
}
