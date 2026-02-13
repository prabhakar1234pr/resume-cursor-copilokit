"use client";

import { useEffect, useState } from "react";
import { ResumeForm } from "./resume-form";

interface ResumeData {
  id: string;
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

export function ResumeFormLoader({ resumeId }: { resumeId: string }) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resumes/${resumeId}`)
      .then((res) => res.json())
      .then((data) => {
        setResume(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resumeId]);

  if (loading) {
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

  return <ResumeForm resumeId={resumeId} initialData={resume} />;
}
