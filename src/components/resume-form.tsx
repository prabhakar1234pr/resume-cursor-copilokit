"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  Sparkles,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";

interface FormData {
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

const defaultFormData: FormData = {
  title: "",
  personalInfo: { name: "", email: "", phone: "", location: "" },
  summary: "",
  experience: "",
  education: "",
  skills: "",
  projects: "",
};

export function ResumeForm({
  resumeId,
  initialData,
}: {
  resumeId?: string;
  initialData?: FormData;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    initialData || defaultFormData
  );

  useCopilotReadable({
    description: "Current resume data being edited by the user",
    value: formData,
  });

  useCopilotAction({
    name: "improveSection",
    description:
      "Improve a specific resume section with better wording and impact",
    parameters: [
      {
        name: "section",
        type: "string",
        description:
          "Section name: summary, experience, education, skills, projects",
        required: true,
      },
      {
        name: "improvedContent",
        type: "string",
        description: "The improved content for the section",
        required: true,
      },
    ],
    handler: async ({ section, improvedContent }) => {
      const validSections = [
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
      ];
      if (validSections.includes(section)) {
        setFormData((prev) => ({ ...prev, [section]: improvedContent }));
        return `Updated ${section} section successfully`;
      }
      return "Invalid section name";
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        resumeId ? `/api/resumes/${resumeId}` : "/api/resumes",
        {
          method: resumeId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        router.push("/dashboard");
      }
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: "Personal Info", icon: FileText },
    { num: 2, label: "Experience", icon: Briefcase },
    { num: 3, label: "Review", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="mx-auto max-w-3xl px-6">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  step >= s.num
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-400 border border-gray-200"
                }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 rounded ${step > s.num ? "bg-indigo-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Information
              </h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Resume Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Software Engineer Resume"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: {
                          ...formData.personalInfo,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: {
                          ...formData.personalInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: {
                          ...formData.personalInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: {
                          ...formData.personalInfo,
                          location: e.target.value,
                        },
                      })
                    }
                    placeholder="San Francisco, CA"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Professional Summary *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  rows={4}
                  placeholder="Brief overview of your professional background and key achievements..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Next: Experience & Education
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Experience & Education
              </h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Work Experience *
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  rows={8}
                  placeholder="List your work experience with company names, positions, dates, and achievements..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Education *
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) =>
                    setFormData({ ...formData, education: e.target.value })
                  }
                  rows={4}
                  placeholder="Your degrees, institutions, and graduation dates..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Skills *
                </label>
                <textarea
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  rows={3}
                  placeholder="List your technical and soft skills..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Projects (Optional)
                </label>
                <textarea
                  value={formData.projects}
                  onChange={(e) =>
                    setFormData({ ...formData, projects: e.target.value })
                  }
                  rows={4}
                  placeholder="Notable projects you've worked on..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Next: Review
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Review & Save
              </h2>

              <div className="space-y-4 rounded-xl bg-gray-50 p-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {formData.title || "Untitled Resume"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formData.personalInfo.name} &middot;{" "}
                      {formData.personalInfo.email}
                    </p>
                  </div>
                </div>

                <ReviewSection title="Summary" content={formData.summary} />
                <ReviewSection
                  title="Experience"
                  content={formData.experience}
                />
                <ReviewSection
                  title="Education"
                  content={formData.education}
                />
                <ReviewSection title="Skills" content={formData.skills} />
                {formData.projects && (
                  <ReviewSection
                    title="Projects"
                    content={formData.projects}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">
        {content.length > 200 ? content.substring(0, 200) + "..." : content}
      </p>
    </div>
  );
}
