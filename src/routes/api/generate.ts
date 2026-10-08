import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { TOOLS, isToolId } from "@/lib/assistant";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("AI is not configured.", { status: 500 });
        const body = (await request.json().catch(() => null)) as { tool?: unknown; input?: unknown } | null;
        const input = typeof body?.input === "string" ? body.input.trim() : "";
        if (!body || !isToolId(body.tool) || !input || input.length > 20000) {
          return new Response("Please enter some notes first.", { status: 400 });
        }
        const runIdIn = request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: {
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
            ...(runIdIn ? { "X-Lovable-AIG-Run-ID": runIdIn } : {}),
          },
        });
        let upstreamError: string | null = null;
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions:
            TOOLS[body.tool].prompt +
            " Respond in well-formatted markdown only, with no preamble. Use British/South African English spelling.",
          messages: [{ role: "user", content: input }],
          abortSignal: request.signal,
          onError: ({ error }) => {
            upstreamError = error instanceof Error ? error.message : String(error);
          },
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.textStream) controller.enqueue(encoder.encode(chunk));
              if (upstreamError) controller.enqueue(encoder.encode(`\n\n**Error:** ${upstreamError}`));
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Something went wrong.";
              controller.enqueue(encoder.encode(`\n\n**Error:** ${msg}`));
            }
            controller.close();
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
