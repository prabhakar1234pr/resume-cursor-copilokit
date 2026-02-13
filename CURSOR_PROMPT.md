# CURSOR AI PROMPT: Build AI Resume Maker with CopilotKit, Clerk & Neon DB

## PROJECT OVERVIEW
Build a full-stack AI-powered resume maker using CopilotKit for AI interactions, Clerk for authentication, and Neon (PostgreSQL) for database storage. Users can create, save, and tailor resumes to job descriptions with AI assistance.

---

## TECH STACK REQUIREMENTS
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, lucide-react icons
- **Authentication**: Clerk (@clerk/nextjs)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **AI Framework**: CopilotKit (@copilotkit/react-core, @copilotkit/react-ui, @copilotkit/runtime)
- **AI Provider**: Google Gemini API
- **Deployment**: Vercel-ready

---

## STEP 1: PROJECT SETUP

### Initialize Next.js Project
```bash
npx create-next-app@latest ai-resume-maker --typescript --tailwind --app --eslint
cd ai-resume-maker
```

### Install Dependencies
```bash
npm install @clerk/nextjs @neondatabase/serverless drizzle-orm drizzle-kit
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @google/generative-ai
npm install dotenv-cli
```

### Environment Variables (.env.local)
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/db_name?sslmode=require

# Google Gemini
GOOGLE_API_KEY=your_gemini_api_key_here
```

---

## STEP 2: DATABASE SETUP (Neon + Drizzle)

### Create Drizzle Schema (`/lib/db/schema.ts`)
```typescript
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const resumes = pgTable('resumes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // Clerk user ID
  title: text('title').notNull(),
  personalInfo: jsonb('personal_info').$type<{
    name: string;
    email: string;
    phone: string;
    location: string;
  }>().notNull(),
  summary: text('summary').notNull(),
  experience: text('experience').notNull(),
  education: text('education').notNull(),
  skills: text('skills').notNull(),
  projects: text('projects'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tailoredResumes = pgTable('tailored_resumes', {
  id: uuid('id').defaultRandom().primaryKey(),
  resumeId: uuid('resume_id').references(() => resumes.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  jobDescription: text('job_description').notNull(),
  tailoredContent: text('tailored_content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type TailoredResume = typeof tailoredResumes.$inferSelect;
export type NewTailoredResume = typeof tailoredResumes.$inferInsert;
```

### Create Database Connection (`/lib/db/index.ts`)
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Drizzle Config (`drizzle.config.ts`)
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Migration Commands (add to package.json)
```json
"scripts": {
  "db:generate": "drizzle-kit generate:pg",
  "db:migrate": "drizzle-kit push:pg"
}
```

### Run Migrations
```bash
npm run db:generate
npm run db:migrate
```

---

## STEP 3: CLERK AUTHENTICATION SETUP

### Wrap App with Clerk Provider (`/app/layout.tsx`)
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Create Auth Middleware (`middleware.ts`)
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Create Sign In/Sign Up Pages
- `/app/sign-in/[[...sign-in]]/page.tsx`
- `/app/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

---

## STEP 4: COPILOTKIT SETUP

### Create CopilotKit API Route (`/app/api/copilotkit/route.ts`)
```typescript
import { CopilotRuntime, GoogleGenerativeAIAdapter } from "@copilotkit/runtime";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const copilotKit = new CopilotRuntime();
  
  const apiKey = process.env.GOOGLE_API_KEY;
  
  return copilotKit.response(
    req,
    new GoogleGenerativeAIAdapter({ apiKey })
  );
}
```

### Wrap App with CopilotKit Provider (`/app/dashboard/layout.tsx`)
```typescript
'use client';

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        instructions="You are an expert resume writer and career advisor. Help users create tailored resumes. Analyze job descriptions, suggest improvements, identify skill gaps, and rewrite sections with impact."
        labels={{
          title: "Resume AI Assistant",
          initial: "Hi! I can help you:\n• Improve resume sections\n• Analyze job requirements\n• Tailor your resume\n• Identify skill gaps",
        }}
        defaultOpen={false}
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}
```

---

## STEP 5: BUILD THE APP PAGES

### 1. Landing Page (`/app/page.tsx`)
- Hero section with CTA
- Feature highlights
- "Get Started" button → redirects to sign-up or dashboard

```typescript
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Sparkles, FileText, Briefcase } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold">AI Resume Maker</h1>
        </div>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-indigo-600 hover:underline">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Dashboard</button>
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Create AI-Powered Resumes<br />in Minutes
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Tailor your resume to any job description with intelligent AI assistance.
          Get hired faster with optimized, ATS-friendly resumes.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700">
              Go to Dashboard
            </button>
          </Link>
        </SignedIn>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
            <p className="text-gray-600">Let AI analyze and optimize your resume for any job</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Briefcase className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Job Tailoring</h3>
            <p className="text-gray-600">Automatically match keywords and requirements</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Suggestions</h3>
            <p className="text-gray-600">Get real-time AI recommendations as you write</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 2. Dashboard (`/app/dashboard/page.tsx`)
- Display all user's resumes from Neon DB
- Create new resume button
- Edit/Delete actions for each resume
- View tailored versions

```typescript
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FileText, Plus, Edit, Trash, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    return <div>Please sign in</div>;
  }

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(resumes.updatedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-600 mt-2">Manage and tailor your resumes</p>
          </div>
          <Link href="/resume/new">
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="w-5 h-5" />
              Create New Resume
            </button>
          </Link>
        </div>

        {/* Resume List */}
        {userResumes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No resumes yet</h2>
            <p className="text-gray-500 mb-6">Create your first AI-powered resume</p>
            <Link href="/resume/new">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Resume
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userResumes.map((resume) => (
              <div key={resume.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <div className="flex gap-2">
                    <Link href={`/resume/${resume.id}/edit`}>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    </Link>
                    <form action={`/api/resumes/${resume.id}/delete`} method="POST">
                      <button type="submit" className="p-2 hover:bg-gray-100 rounded">
                        <Trash className="w-4 h-4 text-red-600" />
                      </button>
                    </form>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{resume.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {resume.personalInfo.name} • {resume.personalInfo.email}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Updated {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
                <Link href={`/resume/${resume.id}/tailor`}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Sparkles className="w-4 h-4" />
                    Tailor to Job
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Create/Edit Resume Form (`/app/resume/[id]/edit/page.tsx` and `/app/resume/new/page.tsx`)
- Multi-step form (3 steps)
- Save to Neon DB
- Auto-save functionality
- Form validation

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Briefcase, Sparkles, Save } from 'lucide-react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';

export default function ResumeForm({ resumeId }: { resumeId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
  });

  // Make resume data readable by Copilot AI
  useCopilotReadable({
    description: "Current resume data being edited",
    value: formData,
  });

  // Copilot Action: Improve section
  useCopilotAction({
    name: "improveSection",
    description: "Improve a specific resume section with better wording and impact",
    parameters: [
      {
        name: "section",
        type: "string",
        description: "Section name: summary, experience, education, skills, projects",
        required: true,
      },
      {
        name: "improvedContent",
        type: "string",
        description: "The improved content",
        required: true,
      },
    ],
    handler: async ({ section, improvedContent }) => {
      if (section === 'summary' || section === 'experience' || section === 'education' || section === 'skills' || section === 'projects') {
        setFormData(prev => ({ ...prev, [section]: improvedContent }));
        return `Updated ${section} section`;
      }
      return "Invalid section";
    },
  });

  const handleSave = async () => {
    setSaving(true);
    
    const response = await fetch(resumeId ? `/api/resumes/${resumeId}` : '/api/resumes', {
      method: resumeId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      router.push('/dashboard');
    }
    
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}>
              <FileText className="w-5 h-5" />
              <span>Personal Info</span>
            </div>
            <div className="w-12 h-1 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}>
              <Briefcase className="w-5 h-5" />
              <span>Experience</span>
            </div>
            <div className="w-12 h-1 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}>
              <Sparkles className="w-5 h-5" />
              <span>Review</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Resume Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Software Engineer Resume"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.personalInfo.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: {...formData.personalInfo, name: e.target.value}
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: {...formData.personalInfo, email: e.target.value}
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: {...formData.personalInfo, phone: e.target.value}
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.personalInfo.location}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: {...formData.personalInfo, location: e.target.value}
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Professional Summary *</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  rows={4}
                  placeholder="Brief overview of your professional background..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
              >
                Next: Experience & Education
              </button>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Experience & Education</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Work Experience *</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  rows={8}
                  placeholder="List your work experience with company names, positions, dates, and achievements..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Education *</label>
                <textarea
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                  rows={4}
                  placeholder="Your degrees, institutions, and graduation dates..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Skills *</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  rows={3}
                  placeholder="List your technical and soft skills..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Projects (Optional)</label>
                <textarea
                  value={formData.projects}
                  onChange={(e) => setFormData({...formData, projects: e.target.value})}
                  rows={4}
                  placeholder="Notable projects you've worked on..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Save */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Review & Save</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-2">{formData.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {formData.personalInfo.name} • {formData.personalInfo.email}
                </p>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Summary:</span>
                    <p className="text-gray-700 mt-1">{formData.summary.substring(0, 200)}...</p>
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span>
                    <p className="text-gray-700 mt-1">{formData.experience.substring(0, 200)}...</p>
                  </div>
                  <div>
                    <span className="font-medium">Skills:</span>
                    <p className="text-gray-700 mt-1">{formData.skills}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
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
```

### 4. Tailor Resume Page (`/app/resume/[id]/tailor/page.tsx`)
- Load resume from DB
- Paste job description
- Generate tailored resume with AI
- Save tailored version
- Download/Copy functionality

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { Sparkles, Download, Copy } from 'lucide-react';

export default function TailorResumePage({ params }: { params: { id: string } }) {
  const [resume, setResume] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch resume from API
    fetch(`/api/resumes/${params.id}`)
      .then(res => res.json())
      .then(data => setResume(data));
  }, [params.id]);

  // Make data readable by AI
  useCopilotReadable({
    description: "Resume being tailored",
    value: resume,
  });

  useCopilotReadable({
    description: "Job description to tailor for",
    value: jobDescription,
  });

  // AI Action: Generate tailored resume
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
      
      // Save to database
      await fetch('/api/tailored-resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: params.id,
          jobDescription,
          tailoredContent,
        }),
      });
      
      return "Resume tailored successfully!";
    },
  });

  const handleGenerate = async () => {
    if (!jobDescription) return;
    
    setLoading(true);
    
    // Call Gemini API directly
    const response = await fetch('/api/generate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume,
        jobDescription,
      }),
    });
    
    const data = await response.json();
    setTailoredResume(data.tailoredResume);
    setLoading(false);
  };

  const downloadResume = () => {
    const blob = new Blob([tailoredResume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume?.title}_tailored.md`;
    a.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tailoredResume);
    alert('Copied to clipboard!');
  };

  if (!resume) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tailor Resume</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Job Description Input */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              rows={20}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Tailored Resume
                </>
              )}
            </button>
          </div>

          {/* Tailored Resume Output */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tailored Resume</h2>
              {tailoredResume && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={downloadResume}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
              {tailoredResume ? (
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {tailoredResume}
                </pre>
              ) : (
                <p className="text-gray-500 text-center mt-20">
                  Your tailored resume will appear here after generation
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## STEP 6: CREATE API ROUTES

### 1. Create Resume API (`/app/api/resumes/route.ts`)
```typescript
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

// POST - Create new resume
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const newResume = await db.insert(resumes).values({
    userId,
    title: data.title,
    personalInfo: data.personalInfo,
    summary: data.summary,
    experience: data.experience,
    education: data.education,
    skills: data.skills,
    projects: data.projects || '',
  }).returning();

  return NextResponse.json(newResume[0]);
}

// GET - Get all user resumes
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId));

  return NextResponse.json(userResumes);
}
```

### 2. Get/Update/Delete Single Resume (`/app/api/resumes/[id]/route.ts`)
```typescript
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET single resume
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resume = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
    .limit(1);

  if (resume.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(resume[0]);
}

// PUT - Update resume
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const updated = await db
    .update(resumes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
    .returning();

  return NextResponse.json(updated[0]);
}

// DELETE resume
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .delete(resumes)
    .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)));

  return NextResponse.json({ success: true });
}
```

### 3. Generate Resume API (`/app/api/generate-resume/route.ts`)
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  const { resume, jobDescription } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are an expert resume writer. Create a tailored, professional resume based on the following information and job description.

USER'S RESUME:
Name: ${resume.personalInfo.name}
Email: ${resume.personalInfo.email}
Phone: ${resume.personalInfo.phone}
Location: ${resume.personalInfo.location}

Summary: ${resume.summary}
Experience: ${resume.experience}
Education: ${resume.education}
Skills: ${resume.skills}
Projects: ${resume.projects || 'None'}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Analyze the job description and identify key requirements
2. Tailor the summary to match the role
3. Emphasize relevant experience and projects
4. Highlight matching skills
5. Use action verbs and metrics
6. Format as clean markdown
7. Keep it concise (1-2 pages)

Generate the tailored resume now:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const tailoredResume = response.text();

  return NextResponse.json({ tailoredResume });
}
```

### 4. Save Tailored Resume API (`/app/api/tailored-resumes/route.ts`)
```typescript
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { tailoredResumes } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId, jobDescription, tailoredContent } = await req.json();

  const newTailoredResume = await db.insert(tailoredResumes).values({
    resumeId,
    userId,
    jobDescription,
    tailoredContent,
  }).returning();

  return NextResponse.json(newTailoredResume[0]);
}
```

---

## STEP 7: STYLING & FINAL TOUCHES

### Update Tailwind Config (`tailwind.config.ts`)
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### Add Global Styles (`/app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
```

---

## STEP 8: TESTING & DEPLOYMENT

### Local Testing
```bash
npm run dev
```

Test these flows:
1. Sign up / Sign in with Clerk
2. Create a new resume (all 3 steps)
3. View resume in dashboard
4. Edit existing resume
5. Tailor resume to job description
6. Download tailored resume
7. Use AI chat to improve sections
8. Delete resume

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - CLERK_SECRET_KEY
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - DATABASE_URL (Neon)
# - GOOGLE_API_KEY
```

---

## KEY COPILOTKIT FEATURES TO HIGHLIGHT

1. **`useCopilotReadable`** - Makes resume and job data visible to AI
2. **`useCopilotAction`** - Custom actions:
   - `improveSection` - AI improves resume sections
   - `generateTailoredResume` - AI creates tailored resume
   - `extractJobKeywords` - AI analyzes job requirements
   - `suggestMissingSkills` - AI identifies skill gaps
3. **`CopilotSidebar`** - Interactive AI chat assistant
4. **`GoogleGenerativeAIAdapter`** - Gemini integration

---

## IMPORTANT NOTES

- All user data is scoped by Clerk `userId`
- Resumes are stored in Neon PostgreSQL via Drizzle ORM
- AI generation uses both CopilotKit and direct Gemini API calls
- Forms have validation and error handling
- UI matches the beautiful gradient design from the original
- Code is TypeScript with proper typing
- Database migrations are handled by Drizzle Kit

---

## ESTIMATED BUILD TIME: 60 MINUTES

- Setup (10 min): Install dependencies, configure env vars
- Database (10 min): Create schema, run migrations
- Auth (5 min): Setup Clerk
- Pages (20 min): Build all pages with forms
- API Routes (10 min): Create all endpoints
- CopilotKit (5 min): Integrate AI features
- Testing (10 min): Test all flows

---

## FINAL CHECKLIST

✅ Next.js 14 with App Router
✅ TypeScript
✅ Clerk authentication
✅ Neon PostgreSQL database
✅ Drizzle ORM
✅ CopilotKit integration
✅ Gemini AI
✅ Beautiful gradient UI
✅ Full CRUD operations
✅ AI chat sidebar
✅ Resume tailoring
✅ Download functionality
✅ Responsive design
✅ Protected routes
✅ Error handling

---

NOW BUILD IT! 🚀
