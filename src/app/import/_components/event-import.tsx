"use client";

import {
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  XCircle,
} from "lucide-react";
import Papa from "papaparse";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface EventRow {
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  cfpDeadline?: string;
  cfpUrl?: string;
  conferenceWebsite?: string;
  description?: string;
  notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function EventImport() {
  const [parsedData, setParsedData] = useState<EventRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const bulkImportMutation = api.event.bulkImport.useMutation();

  const validateRow = (row: EventRow, index: number): ValidationError[] => {
    const rowErrors: ValidationError[] = [];

    if (!row.name || row.name.trim() === "") {
      rowErrors.push({
        row: index + 1,
        field: "name",
        message: "Event name is required",
      });
    }

    // Validate date formats if provided
    const dateFields = ["startDate", "endDate", "cfpDeadline"] as const;
    for (const field of dateFields) {
      if (row[field] && row[field]!.trim() !== "") {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(row[field]!.trim())) {
          rowErrors.push({
            row: index + 1,
            field,
            message: `${field} must be in YYYY-MM-DD format`,
          });
        }
      }
    }

    // Validate URLs if provided
    const urlFields = ["cfpUrl", "conferenceWebsite"] as const;
    for (const field of urlFields) {
      if (row[field] && row[field]!.trim() !== "") {
        try {
          new URL(row[field]!.trim());
        } catch {
          rowErrors.push({
            row: index + 1,
            field,
            message: `${field} must be a valid URL`,
          });
        }
      }
    }

    return rowErrors;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse<EventRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        setParsedData(data);

        // Validate all rows
        const allErrors: ValidationError[] = [];
        data.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          allErrors.push(...rowErrors);
        });
        setErrors(allErrors);
        setImportResult(null);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        alert("Error parsing CSV file. Please check the format.");
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleImport = async () => {
    if (errors.length > 0) {
      alert("Please fix validation errors before importing");
      return;
    }

    setImporting(true);
    try {
      const result = await bulkImportMutation.mutateAsync({
        events: parsedData,
      });
      setImportResult(result);
      if (result.failed === 0) {
        setParsedData([]);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing events. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,location,startDate,endDate,cfpDeadline,cfpUrl,conferenceWebsite,description,notes
DevOpsDays Chicago,Chicago IL USA,2026-08-25,2026-08-26,2026-06-01,https://devopsdays.org/chicago/cfp,https://devopsdays.org/chicago,"A conference about DevOps practices","Great community event"`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Upload Events CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Upload a CSV file with event information to bulk import
            </p>
            <Button onClick={downloadTemplate} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
              isDragActive
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
            <p className="mt-2 text-foreground text-sm">
              {isDragActive
                ? "Drop the CSV file here"
                : "Drag and drop a CSV file here, or click to select"}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">CSV files only</p>
          </div>

          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">
                  Parsed {parsedData.length} event
                  {parsedData.length !== 1 ? "s" : ""}
                </p>
                {errors.length === 0 ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Ready to import
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <XCircle className="h-4 w-4" />
                    {errors.length} error{errors.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 text-sm">
                        Validation Errors
                      </h4>
                      <ul className="mt-2 space-y-1 text-red-700 text-sm">
                        {errors.slice(0, 5).map((error, i) => (
                          <li key={i}>
                            Row {error.row}, {error.field}: {error.message}
                          </li>
                        ))}
                        {errors.length > 5 && (
                          <li className="text-red-600">
                            ...and {errors.length - 5} more error
                            {errors.length - 5 !== 1 ? "s" : ""}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto -mx-4 rounded-lg border sm:mx-0">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground text-xs sm:px-4">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground text-xs sm:px-4">
                        Location
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground text-xs sm:px-4">
                        Start Date
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground text-xs sm:px-4">
                        CFP Deadline
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {parsedData.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-foreground text-sm sm:px-4">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-sm sm:px-4">
                          {row.location || "-"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-sm sm:px-4">
                          {row.startDate || "-"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-sm sm:px-4">
                          {row.cfpDeadline || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="bg-muted px-4 py-2 text-center text-muted-foreground text-xs">
                    ...and {parsedData.length - 10} more row
                    {parsedData.length - 10 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => {
                    setParsedData([]);
                    setErrors([]);
                    setImportResult(null);
                  }}
                  variant="outline"
                >
                  Clear
                </Button>
                <Button
                  disabled={errors.length > 0 || importing}
                  onClick={handleImport}
                >
                  {importing
                    ? "Importing..."
                    : `Import ${parsedData.length} Event${parsedData.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          )}

          {importResult && (
            <div
              className={`rounded-lg border p-4 ${
                importResult.failed === 0
                  ? "border-green-200 bg-green-50"
                  : "border-yellow-200 bg-yellow-50"
              }`}
            >
              <div className="flex items-start gap-2">
                <CheckCircle
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    importResult.failed === 0
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                />
                <div>
                  <h4
                    className={`font-medium text-sm ${
                      importResult.failed === 0
                        ? "text-green-900"
                        : "text-yellow-900"
                    }`}
                  >
                    Import Complete
                  </h4>
                  <p
                    className={`mt-1 text-sm ${
                      importResult.failed === 0
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  >
                    Successfully imported {importResult.success} event
                    {importResult.success !== 1 ? "s" : ""}
                    {importResult.failed > 0 &&
                      `, ${importResult.failed} failed`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
