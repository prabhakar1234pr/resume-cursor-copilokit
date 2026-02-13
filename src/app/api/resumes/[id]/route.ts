import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const resume = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .limit(1);

  if (resume.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(resume[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  const updated = await db
    .update(resumes)
    .set({
      title: data.title,
      personalInfo: data.personalInfo,
      summary: data.summary,
      experience: data.experience,
      education: data.education,
      skills: data.skills,
      projects: data.projects,
      updatedAt: new Date(),
    })
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

  return NextResponse.json({ success: true });
}
