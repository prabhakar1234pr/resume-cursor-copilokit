import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

export const POST = async (req: Request) => {
  const runtime = new CopilotRuntime();

  const serviceAdapter = new GoogleGenerativeAIAdapter({
    model: "gemini-2.0-flash",
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
