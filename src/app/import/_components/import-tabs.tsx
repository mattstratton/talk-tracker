"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { EventImport } from "./event-import";
import { TalkImport } from "./talk-import";

export function ImportTabs() {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="talks">Talks</TabsTrigger>
      </TabsList>
      <TabsContent value="events" className="mt-6">
        <EventImport />
      </TabsContent>
      <TabsContent value="talks" className="mt-6">
        <TalkImport />
      </TabsContent>
    </Tabs>
  );
}
