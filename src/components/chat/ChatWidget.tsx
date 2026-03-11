import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";

interface Source {
  page: number | string;
  score: number;
  text: string;
}

interface Metrics {
  total_ms: number;
  cost_usd: number;
  top_score: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  metrics?: Metrics;
  streaming?: boolean;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", content: question };
    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "Request failed");
      }

      const data = await res.json();

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        last.content = data.answer;
        last.sources = data.sources;
        last.metrics = data.metrics;
        last.streaming = false;
        return [...updated];
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        last.content = `Error: ${err instanceof Error ? err.message : "Something went wrong"}`;
        last.streaming = false;
        return [...updated];
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col w-full" style={{ height: "calc(100vh - 12rem)" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <p className="text-lg font-medium text-foreground">What would you like to know?</p>
            <p className="text-sm text-muted-foreground">
              Ask about my research, projects, experience, or any ingested documents
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                "What is Vikhyat's research about?",
                "Tell me about the Hydra project",
                "What skills does Vikhyat have?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 border border-border ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-[20px_20px_4px_20px]"
                  : "bg-card text-card-foreground rounded-[20px_20px_20px_4px]"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              ) : msg.streaming && !msg.content ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="text-xs text-muted-foreground mr-1">Thinking</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-[bounce_1.4s_ease-in-out_infinite]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
                </div>
              ) : (
                <div className="text-sm leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border">
                  <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Sources
                  </p>
                  {msg.sources.map((src, j) => (
                    <div key={j} className="flex justify-between items-center py-0.5 text-xs">
                      <span className="font-mono text-blue-500 dark:text-blue-400">
                        {typeof src.page === "string" && src.page.includes("/")
                          ? src.page
                          : `Page ${src.page}`}
                      </span>
                      <span className="text-muted-foreground">
                        {(src.score * 100).toFixed(0)}% match
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {msg.metrics && (
                <div className="mt-2 flex gap-3 text-[0.65rem] text-muted-foreground font-mono">
                  <span>{msg.metrics.total_ms.toFixed(0)}ms</span>
                  <span>${msg.metrics.cost_usd.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground resize-none font-[inherit] placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-primary text-primary-foreground w-9 h-9 flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="text-[0.6rem] text-muted-foreground text-center mt-2">
          Powered by <a href="https://github.com/Vikhyat-Chauhan/ProfessionalRAG" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">ProfessionalRAG</a> — Built by me using Claude + Pinecone + Cross-Encoder Reranking
        </p>
      </form>
    </div>
  );
}
