"use client";

import { useRouter } from "next/navigation";
import { FileText, Edit, Trash2, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Resume } from "@/lib/db/schema";

export function ResumeCard({ resume }: { resume: Resume }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    await fetch(`/api/resumes/${resume.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-indigo-100 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex gap-1">
          <Link href={`/resume/${resume.id}/edit`}>
            <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600">
              <Edit className="h-4 w-4" />
            </button>
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {resume.title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {resume.personalInfo.name} &middot; {resume.personalInfo.email}
      </p>
      <p className="mt-3 text-xs text-gray-400">
        Updated {new Date(resume.updatedAt).toLocaleDateString()}
      </p>
      <Link href={`/resume/${resume.id}/tailor`} className="mt-4 block">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700">
          <Sparkles className="h-4 w-4" />
          Tailor to Job
        </button>
      </Link>
    </div>
  );
}
