import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { resume, jobDescription } = await req.json();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
Projects: ${resume.projects || "None"}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Analyze the job description and identify key requirements
2. Tailor the summary to match the role
3. Emphasize relevant experience and projects
4. Highlight matching skills and add relevant keywords
5. Use action verbs and quantifiable metrics
6. Format as clean markdown with clear sections
7. Keep it concise (1-2 pages worth of content)
8. Ensure ATS compatibility

Generate the tailored resume now:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const tailoredResume = response.text();

    return NextResponse.json({ tailoredResume });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
