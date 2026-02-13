import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { UserButton } from "@clerk/nextjs";
import { FileText, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { ResumeCard } from "./resume-card";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in</div>;
  }

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Resumes
            </h1>
            <p className="mt-1 text-gray-500">
              Manage and tailor your resumes with AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/resume/new">
              <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                New Resume
              </button>
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </div>

        {userResumes.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No resumes yet
            </h2>
            <p className="mt-2 max-w-sm text-gray-500">
              Create your first AI-powered resume and start tailoring it to job
              descriptions.
            </p>
            <Link href="/resume/new">
              <button className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                <Sparkles className="h-4 w-4" />
                Create Your First Resume
              </button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {userResumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
