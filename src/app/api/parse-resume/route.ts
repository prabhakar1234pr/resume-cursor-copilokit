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
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const mimeType = file.type || "application/pdf";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert resume parser. Analyze the uploaded resume document and extract ALL information into the following JSON structure. Be thorough — extract every detail you can find.

Return ONLY valid JSON with this exact structure (no markdown, no code fences, just raw JSON):

{
  "title": "A short title for this resume, e.g. 'Software Engineer Resume' based on the person's role",
  "personalInfo": {
    "name": "Full name",
    "email": "Email address or empty string",
    "phone": "Phone number or empty string",
    "location": "City, State/Country or empty string"
  },
  "summary": "Professional summary or objective. If none exists, generate a brief one from the resume content.",
  "experience": "All work experience formatted as:\\nCompany Name — Job Title (Start Date – End Date)\\n- Achievement/responsibility\\n- Achievement/responsibility\\n\\nRepeat for each position.",
  "education": "All education formatted as:\\nDegree — Institution (Year)\\nRelevant details\\n\\nRepeat for each entry.",
  "skills": "All skills as a comma-separated list",
  "projects": "All projects formatted as:\\nProject Name\\n- Description and details\\n\\nRepeat for each project. Empty string if none found."
}`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);

    const response = result.response;
    let text = response.text().trim();

    // Strip markdown code fences if Gemini wraps it
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}
