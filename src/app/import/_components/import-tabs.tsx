"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { EventImport } from "./event-import";
import { TalkImport } from "./talk-import";

export function ImportTabs() {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <Tabs onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="talks">Talks</TabsTrigger>
      </TabsList>
      <TabsContent className="mt-6" value="events">
        <EventImport />
      </TabsContent>
      <TabsContent className="mt-6" value="talks">
        <TalkImport />
      </TabsContent>
    </Tabs>
  );
}
