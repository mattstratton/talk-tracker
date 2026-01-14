"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { api } from "~/trpc/react";

const formSchema = z.object({
  mentionsEnabled: z.boolean(),
  statusChangesEnabled: z.boolean(),
  commentsEnabled: z.boolean(),
  cfpDeadlinesEnabled: z.boolean(),
  cfpDeadlineDaysBefore: z.number().min(1).max(90),
});

type FormValues = z.infer<typeof formSchema>;

export function NotificationSettings() {
  const { data: preferences, isLoading } =
    api.notification.getPreferences.useQuery();
  const utils = api.useUtils();

  const updateMutation = api.notification.updatePreferences.useMutation({
    onSuccess: () => {
      void utils.notification.getPreferences.invalidate();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    ...(preferences && {
      values: {
        mentionsEnabled: preferences.mentionsEnabled,
        statusChangesEnabled: preferences.statusChangesEnabled,
        commentsEnabled: preferences.commentsEnabled,
        cfpDeadlinesEnabled: preferences.cfpDeadlinesEnabled,
        cfpDeadlineDaysBefore: preferences.cfpDeadlineDaysBefore,
      },
    }),
  });

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="mentionsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">@Mentions</FormLabel>
                    <FormDescription>
                      Notify me when someone mentions me in a comment
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statusChangesEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Changes</FormLabel>
                    <FormDescription>
                      Notify me when someone changes the status of my proposals
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commentsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Comments</FormLabel>
                    <FormDescription>
                      Notify me when someone comments on my proposals, events,
                      or talks
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cfpDeadlinesEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">CFP Deadlines</FormLabel>
                    <FormDescription>
                      Notify me about upcoming CFP deadlines
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cfpDeadlineDaysBefore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CFP Deadline Warning</FormLabel>
                  <FormDescription>
                    Notify me this many days before a CFP deadline
                  </FormDescription>
                  <FormControl>
                    <Input
                      max={90}
                      min={1}
                      type="number"
                      {...field}
                      className="w-32"
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button disabled={updateMutation.isPending} type="submit">
              {updateMutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
