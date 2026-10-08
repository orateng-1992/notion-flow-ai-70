import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TOOLS, type ToolId } from "@/lib/assistant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Desk — AI Workplace Assistant for Small Business" },
      { name: "description", content: "Draft emails, summarise meetings, plan your day and turn meetings into tasks in seconds." },
      { property: "og:title", content: "Desk — AI Workplace Assistant" },
      { property: "og:description", content: "Draft emails, summarise meetings, plan your day and turn meetings into tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [tool, setTool] = useState<ToolId>("email");
  const [inputs, setInputs] = useState<Record<ToolId, string>>({ email: "", meeting: "", tasks: "", convert: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const t = TOOLS[tool];

  async function run() {
    setOutput("");
    setLoading(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, input: inputs[tool] }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        setOutput(`**Error:** ${(await res.text()) || "Request failed."}`);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setOutput(acc);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setOutput("**Error:** Could not reach the assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-end justify-between px-6 py-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Workplace assistant</p>
            <h1 className="font-display text-5xl leading-none md:text-6xl">Desk.</h1>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-muted-foreground md:block">
            Less admin, more business. Emails, meetings and plans — written for you.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {(Object.keys(TOOLS) as ToolId[]).map((id) => (
            <button
              key={id}
              onClick={() => { setTool(id); setOutput(""); }}
              className={`tool-tab ${id === tool ? "tool-tab-active" : ""}`}
            >
              <span className="font-mono text-xs opacity-60">{TOOLS[id].kicker}</span>
              <span>{TOOLS[id].label}</span>
            </button>
          ))}
        </nav>

        <section className="space-y-6">
          <div>
            <h2 className="font-display text-3xl">{t.label}</h2>
            <p className="mt-2 max-w-2xl text-sm italic text-muted-foreground">“{t.prompt.split(" Present")[0].split(" Use these")[0]}”</p>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <textarea
              value={inputs[tool]}
              onChange={(e) => setInputs({ ...inputs, [tool]: e.target.value })}
              placeholder={t.placeholder}
              rows={8}
              className="w-full resize-y bg-transparent p-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <button onClick={() => setInputs({ ...inputs, [tool]: t.sample })} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                Try an example
              </button>
              {loading ? (
                <button onClick={() => abortRef.current?.abort()} className="btn-secondary">Stop</button>
              ) : (
                <button onClick={run} disabled={!inputs[tool].trim()} className="btn-primary">Generate →</button>
              )}
            </div>
          </div>

          {(output || loading) && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {loading ? "Writing…" : "Result"}
                </span>
                {!loading && output && (
                  <button
                    className="btn-secondary"
                    onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  >
                    {copied ? "Copied" : "Copy for Notion"}
                  </button>
                )}
              </div>
              <div className="prose-desk">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{output || "…"}</ReactMarkdown>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
