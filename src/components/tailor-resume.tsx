"use client";

import { useState, useEffect } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  ArrowLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";
import type { Resume } from "@/lib/db/schema";

export function TailorResumeClient({ resumeId }: { resumeId: string }) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resumes/${resumeId}`)
      .then((res) => res.json())
      .then((data) => {
        setResume(data);
        setPageLoading(false);
      })
      .catch(() => setPageLoading(false));
  }, [resumeId]);

  useCopilotReadable({
    description: "The resume being tailored",
    value: resume,
  });

  useCopilotReadable({
    description: "The job description to tailor for",
    value: jobDescription,
  });

  useCopilotAction({
    name: "generateTailoredResume",
    description: "Generate a resume tailored to the job description",
    parameters: [
      {
        name: "tailoredContent",
        type: "string",
        description: "The tailored resume content in markdown format",
        required: true,
      },
    ],
    handler: async ({ tailoredContent }) => {
      setTailoredResume(tailoredContent);

      await fetch("/api/tailored-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobDescription,
          tailoredContent,
        }),
      });

      return "Resume tailored successfully!";
    },
  });

  const handleGenerate = async () => {
    if (!jobDescription || !resume) return;

    setLoading(true);

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });

      const data = await response.json();
      setTailoredResume(data.tailoredResume);

      await fetch("/api/tailored-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobDescription,
          tailoredContent: data.tailoredResume,
        }),
      });
    } catch (error) {
      console.error("Failed to generate:", error);
    }

    setLoading(false);
  };

  const downloadResume = () => {
    const blob = new Blob([tailoredResume], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume?.title || "resume"}_tailored.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(tailoredResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <p className="text-gray-500">Resume not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tailor Resume
              </h1>
              <p className="text-sm text-gray-500">
                <FileText className="mr-1 inline h-3.5 w-3.5" />
                {resume.title}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Job Description */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              rows={18}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Tailored Resume
                </>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Tailored Resume
              </h2>
              {tailoredResume && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={downloadResume}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>
            <div className="min-h-[460px] max-h-[540px] overflow-y-auto rounded-xl bg-gray-50 p-6">
              {tailoredResume ? (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                  {tailoredResume}
                </pre>
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                    <Sparkles className="h-7 w-7 text-indigo-400" />
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Your tailored resume will appear here
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    Paste a job description and click Generate
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
