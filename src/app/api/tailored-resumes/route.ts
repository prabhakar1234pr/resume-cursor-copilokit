import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tailoredResumes } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId, jobDescription, tailoredContent } = await req.json();

  const newTailoredResume = await db
    .insert(tailoredResumes)
    .values({
      resumeId,
      userId,
      jobDescription,
      tailoredContent,
    })
    .returning();

  return NextResponse.json(newTailoredResume[0]);
}
