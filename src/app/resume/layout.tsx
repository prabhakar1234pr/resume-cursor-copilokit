"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        instructions="You are an expert resume writer and career advisor. Help users create tailored resumes. When asked to improve a section, use the improveSection action. Analyze job descriptions, suggest improvements, identify skill gaps, and rewrite sections with impact."
        labels={{
          title: "Resume AI Assistant",
          initial:
            "Hi! I can help you:\n- Improve resume sections\n- Suggest better wording\n- Add impact metrics\n- Optimize for ATS",
        }}
        defaultOpen={false}
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}
