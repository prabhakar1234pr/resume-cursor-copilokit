import { TailorResumeClient } from "@/components/tailor-resume";

export default async function TailorResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TailorResumeClient resumeId={id} />;
}
