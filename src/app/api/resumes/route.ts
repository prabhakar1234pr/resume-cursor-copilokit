import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const newResume = await db
    .insert(resumes)
    .values({
      userId,
      title: data.title,
      personalInfo: data.personalInfo,
      summary: data.summary,
      experience: data.experience,
      education: data.education,
      skills: data.skills,
      projects: data.projects || "",
    })
    .returning();

  return NextResponse.json(newResume[0]);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));

  return NextResponse.json(userResumes);
}
