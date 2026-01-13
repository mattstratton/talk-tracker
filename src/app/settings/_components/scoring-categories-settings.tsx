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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface Category {
  id: number;
  name: string;
  weight: number;
  displayOrder: number;
  score9Description: string;
  score3Description: string;
  score1Description: string;
  score0Description: string;
  createdAt: Date;
  updatedAt: Date | null;
}

interface ScoringCategoriesSettingsProps {
  initialCategories: Category[];
}

export function ScoringCategoriesSettings({
  initialCategories,
}: ScoringCategoriesSettingsProps) {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null,
  );
  const utils = api.useUtils();

  // Form state
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("5");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [score9Desc, setScore9Desc] = useState("");
  const [score3Desc, setScore3Desc] = useState("");
  const [score1Desc, setScore1Desc] = useState("");
  const [score0Desc, setScore0Desc] = useState("");

  const { data: categories = initialCategories } =
    api.scoringCategory.getAll.useQuery(undefined, {
      initialData: initialCategories,
    });

  const createCategory = api.scoringCategory.create.useMutation({
    onSuccess: () => {
      void utils.scoringCategory.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const updateCategory = api.scoringCategory.update.useMutation({
    onSuccess: () => {
      void utils.scoringCategory.getAll.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  const deleteCategory = api.scoringCategory.delete.useMutation({
    onSuccess: () => {
      void utils.scoringCategory.getAll.invalidate();
    },
  });

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setWeight("5");
    setDisplayOrder("1");
    setScore9Desc("");
    setScore3Desc("");
    setScore1Desc("");
    setScore0Desc("");
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setWeight(category.weight.toString());
    setDisplayOrder(category.displayOrder.toString());
    setScore9Desc(category.score9Description);
    setScore3Desc(category.score3Description);
    setScore1Desc(category.score1Description);
    setScore0Desc(category.score0Description);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (
      confirm(
        "Delete this category? All associated event scores will be removed.",
      )
    ) {
      deleteCategory.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      name,
      weight: parseInt(weight),
      displayOrder: parseInt(displayOrder),
      score9Description: score9Desc,
      score3Description: score3Desc,
      score1Description: score1Desc,
      score0Description: score0Desc,
    };

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...data });
    } else {
      createCategory.mutate(data);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-gray-900">
          Scoring Categories
        </CardTitle>
        <CardDescription>
          Configure the scoring categories used to evaluate events. Each
          category has a weight (1-10) and descriptions for each score level (9,
          3, 1, 0).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={categories.length >= 10}>
                {categories.length >= 10
                  ? "Maximum 10 Categories"
                  : "Add Category"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Travel Required"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (1-10) *</Label>
                    <Select value={weight} onValueChange={setWeight}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => {
                          const isUsed = categories.some(
                            (c) =>
                              c.weight === w &&
                              c.id !== editingCategory?.id,
                          );
                          return (
                            <SelectItem
                              key={w}
                              value={w.toString()}
                              disabled={isUsed}
                            >
                              {w} {isUsed ? "(in use)" : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-gray-600 text-xs">
                      Each weight can only be used once
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="displayOrder">Display Order (1-10) *</Label>
                    <Select
                      value={displayOrder}
                      onValueChange={setDisplayOrder}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((o) => (
                          <SelectItem key={o} value={o.toString()}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-medium text-sm">Score Descriptions</h4>

                  <div>
                    <Label htmlFor="score9">Score 9 (Excellent) *</Label>
                    <Textarea
                      id="score9"
                      value={score9Desc}
                      onChange={(e) => setScore9Desc(e.target.value)}
                      placeholder="e.g., Local/No travel required"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="score3">Score 3 (Good) *</Label>
                    <Textarea
                      id="score3"
                      value={score3Desc}
                      onChange={(e) => setScore3Desc(e.target.value)}
                      placeholder="e.g., Domestic travel"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="score1">Score 1 (Fair) *</Label>
                    <Textarea
                      id="score1"
                      value={score1Desc}
                      onChange={(e) => setScore1Desc(e.target.value)}
                      placeholder="e.g., International travel"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="score0">Score 0 (Not Feasible) *</Label>
                    <Textarea
                      id="score0"
                      value={score0Desc}
                      onChange={(e) => setScore0Desc(e.target.value)}
                      placeholder="e.g., Not feasible to attend"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <p className="py-8 text-center text-gray-600">
            No categories configured. Add categories to enable event scoring.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600 text-sm">
                        #{category.displayOrder}
                      </span>
                      <h4 className="font-semibold">{category.name}</h4>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 text-xs">
                        Weight: {category.weight}
                      </span>
                    </div>
                    <dl className="mt-2 grid gap-1 text-sm">
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <dt className="font-medium text-gray-600">Score 9:</dt>
                        <dd className="text-gray-900">
                          {category.score9Description}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <dt className="font-medium text-gray-600">Score 3:</dt>
                        <dd className="text-gray-900">
                          {category.score3Description}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <dt className="font-medium text-gray-600">Score 1:</dt>
                        <dd className="text-gray-900">
                          {category.score1Description}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <dt className="font-medium text-gray-600">Score 0:</dt>
                        <dd className="text-gray-900">
                          {category.score0Description}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(category)}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(category.id)}
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
      </CardContent>
    </Card>
  );
}
