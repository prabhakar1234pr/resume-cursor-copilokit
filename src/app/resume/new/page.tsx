"use client";

import { useState, useCallback } from "react";
import { ResumeForm } from "@/components/resume-form";
import { Upload, FileText, Sparkles, PenLine, Loader2 } from "lucide-react";

interface ParsedResume {
  title: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
}

export default function NewResumePage() {
  const [mode, setMode] = useState<"choose" | "upload" | "form">("choose");
  const [parsedData, setParsedData] = useState<ParsedResume | undefined>();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(async (file: File) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowed.includes(file.type)) {
      setError("Please upload a PDF, DOCX, DOC, or TXT file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setError("");
    setFileName(file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setError("Failed to parse resume. Please try again or enter manually.");
        setUploading(false);
        return;
      }

      const data = await res.json();
      setParsedData(data);
      setMode("form");
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setUploading(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Show form directly (manual or after upload parsing)
  if (mode === "form") {
    return <ResumeForm initialData={parsedData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create New Resume
          </h1>
          <p className="mt-2 text-gray-500">
            Upload an existing resume or start fresh
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {/* Upload Option */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed bg-white p-10 text-center transition ${
              dragOver
                ? "border-indigo-400 bg-indigo-50/50"
                : "border-gray-200 hover:border-indigo-300"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-gray-700">
                  Analyzing <span className="text-indigo-600">{fileName}</span>
                  ...
                </p>
                <p className="text-xs text-gray-400">
                  AI is extracting your resume details
                </p>
              </div>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                  <Upload className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Upload Your Resume
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Drop your PDF, DOCX, or TXT file here, or click to browse
                </p>
                <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  <Sparkles className="h-4 w-4" />
                  Choose File
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-3 text-xs text-gray-400">
                  AI will extract all your details automatically
                </p>
              </>
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm font-medium text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Manual Option */}
          <button
            onClick={() => setMode("form")}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-left transition hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50">
              <PenLine className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Start from Scratch</h3>
              <p className="mt-0.5 text-sm text-gray-500">
                Fill in your details manually using the step-by-step form
              </p>
            </div>
            <FileText className="ml-auto h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
