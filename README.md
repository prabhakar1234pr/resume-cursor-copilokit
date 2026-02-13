# ResumeAI - AI-Powered Resume Maker

A full-stack AI-powered resume maker that helps you create, manage, and tailor resumes to job descriptions using CopilotKit, Clerk, Neon PostgreSQL, and Google Gemini AI.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL + Drizzle ORM
- **AI**: CopilotKit + Google Gemini 2.0 Flash
- **Deployment**: Vercel

## Features

- **AI-Powered Resume Writing** - CopilotKit sidebar for real-time AI assistance while editing resumes
- **Job Tailoring** - Paste a job description and generate a tailored resume with Google Gemini AI
- **Multi-Step Form** - 3-step wizard for creating resumes (Personal Info, Experience, Review)
- **Full CRUD** - Create, read, update, and delete resumes stored in Neon PostgreSQL
- **Authentication** - Clerk sign-in/sign-up with protected routes
- **Download & Copy** - Export tailored resumes as markdown

## Getting Started

### Prerequisites

- Node.js 18+
- Clerk account (for auth keys)
- Neon database (for PostgreSQL connection string)
- Google AI API key (for Gemini)

### Setup

1. Clone the repo:

```bash
git clone https://github.com/prabhakar1234pr/resume-cursor-copilokit.git
cd resume-cursor-copilokit
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
DATABASE_URL=your_neon_database_url
GOOGLE_API_KEY=your_google_gemini_api_key
```

4. Push the database schema:

```bash
npm run db:migrate
```

5. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── copilotkit/       # CopilotKit runtime endpoint
│   │   ├── generate-resume/  # Gemini AI resume generation
│   │   ├── resumes/          # Resume CRUD API
│   │   └── tailored-resumes/ # Save tailored resumes
│   ├── dashboard/            # Resume list & management
│   ├── resume/
│   │   ├── new/              # Create new resume
│   │   └── [id]/
│   │       ├── edit/         # Edit existing resume
│   │       └── tailor/       # Tailor resume to job
│   ├── sign-in/              # Clerk sign-in
│   ├── sign-up/              # Clerk sign-up
│   ├── layout.tsx            # Root layout with ClerkProvider
│   └── page.tsx              # Landing page
├── components/
│   ├── resume-form.tsx       # Multi-step resume form
│   ├── resume-form-loader.tsx
│   └── tailor-resume.tsx     # Tailor resume client
├── lib/
│   ├── db/
│   │   ├── index.ts          # Neon DB connection
│   │   └── schema.ts         # Drizzle ORM schema
│   └── utils.ts              # Utility functions
└── middleware.ts              # Clerk auth middleware
```

## Deployment

Deploy to Vercel and set the environment variables listed above in your Vercel project settings.
