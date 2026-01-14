"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function CalendarLegend() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-sm">Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shape Indicators */}
        <div>
          <h4 className="mb-2 font-medium text-gray-700 text-xs">
            Calendar Indicators
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-600" />
              <span>● Circle = Event dates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-600" />
              <span>■ Square = CFP deadlines</span>
            </div>
          </div>
        </div>

        {/* Participation Type Colors */}
        <div>
          <h4 className="mb-2 font-medium text-gray-700 text-xs">
            Participation Type (Events)
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span>Speaking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span>Sponsoring</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-cyan-500" />
              <span>Exhibiting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Attending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-teal-500" />
              <span>Volunteering</span>
            </div>
          </div>
        </div>

        {/* CFP Urgency Colors */}
        <div>
          <h4 className="mb-2 font-medium text-gray-700 text-xs">
            CFP Deadline Urgency (Squares)
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500" />
              <span>≤7 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-yellow-500" />
              <span>≤30 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500" />
              <span>&gt;30 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-400" />
              <span>Closed</span>
            </div>
          </div>
        </div>

        {/* Status Badge Colors */}
        <div>
          <h4 className="mb-2 font-medium text-gray-700 text-xs">
            Participation Status
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-gray-100 px-2 py-1 text-gray-700">
              Interested
            </span>
            <span className="rounded bg-green-100 px-2 py-1 text-green-700">
              Confirmed
            </span>
            <span className="rounded bg-red-100 px-2 py-1 text-red-700">
              Not Going
            </span>
          </div>
        </div>

        <div className="border-t pt-3 text-gray-600 text-xs">
          <p className="mb-2">
            <strong>Circles</strong> show event dates and are color-coded by
            participation type (if set), otherwise by proposal status.
          </p>
          <p>
            <strong>Squares</strong> show CFP deadlines and are color-coded by
            urgency.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
