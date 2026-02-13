import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import {
  Sparkles,
  FileText,
  Briefcase,
  ArrowRight,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              ResumeAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 text-center lg:pt-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Zap className="h-3.5 w-3.5" />
            Powered by AI
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl">
            Build Resumes That
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {" "}
              Land Interviews
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            Create professional, ATS-optimized resumes in minutes. Our AI
            analyzes job descriptions and tailors your resume to match exactly
            what employers are looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200">
                  <Sparkles className="h-5 w-5" />
                  Start Building Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-100 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
              Everything You Need to Stand Out
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Our AI-powered tools help you create compelling resumes that get
              past ATS systems and impress hiring managers.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="AI-Powered Writing"
              description="Let AI analyze and optimize every section of your resume with professional language and impact-driven metrics."
            />
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Job Tailoring"
              description="Paste any job description and get a resume perfectly matched to the role's requirements and keywords."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Smart Suggestions"
              description="Get real-time AI recommendations as you write. Improve wording, add metrics, and highlight achievements."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="ATS-Optimized"
              description="Every resume is formatted to pass Applicant Tracking Systems used by top companies worldwide."
            />
            <FeatureCard
              icon={<Briefcase className="h-6 w-6" />}
              title="Skill Gap Analysis"
              description="Identify missing skills and qualifications for your target role and get suggestions to fill them."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant Generation"
              description="Generate a complete, tailored resume in seconds. Download and apply immediately."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of professionals who&apos;ve accelerated their job
            search with AI-powered resumes.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ResumeAI
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Built with AI to help you succeed.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-8 transition hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
