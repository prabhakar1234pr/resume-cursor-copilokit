import { ResumeFormLoader } from "@/components/resume-form-loader";

export default async function EditResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResumeFormLoader resumeId={id} />;
}
