"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        instructions="You are an expert resume writer and career advisor. Help users create tailored resumes. Analyze job descriptions, suggest improvements, identify skill gaps, and rewrite sections with impact."
        labels={{
          title: "Resume AI Assistant",
          initial:
            "Hi! I can help you:\n- Improve resume sections\n- Analyze job requirements\n- Tailor your resume\n- Identify skill gaps",
        }}
        defaultOpen={false}
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}
