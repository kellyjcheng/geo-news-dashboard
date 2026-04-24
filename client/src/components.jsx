import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import {
  AlertTriangle,
  Bot,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  MessageSquareText,
  Radar,
  RefreshCw,
  SendHorizontal,
  ShieldAlert,
  Sparkles,
  Swords,
} from "lucide-react";

export function ArticleList({ articles, error, loading, onSelect, selectedArticleId }) {
  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70 p-5"
          >
            <div className="h-3 w-24 rounded bg-slate-800" />
            <div className="mt-4 h-5 w-4/5 rounded bg-slate-800" />
            <div className="mt-3 h-3 w-full rounded bg-slate-900" />
            <div className="mt-2 h-3 w-2/3 rounded bg-slate-900" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorPanel message={error} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="space-y-3">
        {articles.map((article) => {
          const isSelected = article.id === selectedArticleId;

          return (
            <button
              key={article.id}
              className={[
                "group w-full rounded-3xl border p-5 text-left transition",
                isSelected
                  ? "border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.1)]"
                  : "border-slate-800 bg-slate-900/75 hover:border-slate-700 hover:bg-slate-900",
              ].join(" ")}
              onClick={() => onSelect(article.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  <span className="rounded-full border border-slate-800 px-2 py-1 text-cyan-300/90">
                    {article.source}
                  </span>
                  <span>{article.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-500">{article.published_at_relative}</div>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1 text-slate-600 transition hover:text-cyan-300"
                      onClick={(e) => e.stopPropagation()}
                      title="Open article"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <h2 className="mt-4 text-lg font-semibold leading-7 text-slate-100 transition group-hover:text-cyan-100">
                {article.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{article.description}</p>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <Radar className="h-4 w-4 text-cyan-400/70" />
                  <span>{article.topic}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:text-cyan-300" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SummaryPane({ article, loading, summary }) {
  if (!article) {
    return (
      <div className="min-h-0 overflow-hidden border-b border-cyan-950/60 p-6">
        <EmptySummaryState />
      </div>
    );
  }

  return (
    <div className="min-h-0 overflow-hidden border-b border-cyan-950/60 bg-[radial-gradient(circle_at_top,#0f2b3a_0%,#0f172a_28%,#020617_100%)] p-6">
      <div className="flex h-full min-h-0 flex-col rounded-[28px] border border-slate-800/90 bg-slate-950/85 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur">
        <header className="border-b border-slate-800/80 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.34em] text-cyan-400/80">
              Summary Console
            </div>
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">
              Gemini Analysis
            </div>
          </div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-100">{article.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{article.description}</p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loading ? <SummaryLoadingState /> : <SummaryContent summary={summary} />}
        </div>
      </div>
    </div>
  );
}

function SummaryContent({ summary }) {
  const riskTone = useMemo(() => {
    switch ((summary.risk_level || "").toLowerCase()) {
      case "high":
        return "text-rose-300 border-rose-500/30 bg-rose-500/10";
      case "elevated":
        return "text-amber-300 border-amber-500/30 bg-amber-500/10";
      default:
        return "text-cyan-200 border-cyan-500/20 bg-cyan-500/10";
    }
  }, [summary.risk_level]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-slate-500">
            Executive Summary
          </div>
          <div className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] ${riskTone}`}>
            {summary.risk_level || "Monitoring"}
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-200">{summary.synopsis}</p>
      </section>

      <GridSection
        icon={ShieldAlert}
        title="Key Findings"
        items={summary.bullet_points}
      />
      <GridSection icon={Sparkles} title="Implications" items={summary.implications} />
      <GridSection icon={Radar} title="Watch Items" items={summary.next_steps} />
    </div>
  );
}

function GridSection({ icon: Icon, items, title }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-slate-500">
        <Icon className="h-4 w-4 text-cyan-400/80" />
        <span>{title}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-1 xl:grid-cols-2">
        {(items || []).map((item) => (
          <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryLoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-5 text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-cyan-300" />
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">
          Building briefing
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Gemini is extracting the operational picture from the selected dispatch.
        </p>
      </div>
    </div>
  );
}

export function ChatPanel({ article, loading, messages, onSend, summary, summaryLoading }) {
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const contextLabel = article ? summary.headline || article.title : "No active context";
  const contextReady = Boolean(article && summary?.synopsis && !summaryLoading);

  return (
    <div className="min-h-0 bg-slate-950 p-6">
      <div className="flex h-full min-h-0 flex-col rounded-[28px] border border-slate-800 bg-slate-950/90 shadow-[0_20px_55px_rgba(2,6,23,0.45)]">
        <header className="border-b border-slate-800 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-400/80">
                  Context Chat
                </div>
                <div className="mt-1 text-sm text-slate-400 line-clamp-1">{contextLabel}</div>
              </div>
            </div>
            <div className="rounded-full border border-slate-800 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
              Summary as system context
            </div>
          </div>
        </header>

        <div ref={scrollerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-6 text-center">
              <div>
                <MessageSquareText className="mx-auto h-10 w-10 text-cyan-400/60" />
                <p className="mt-4 text-base font-semibold text-slate-100">Analyst follow-up channel</p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                  {contextReady
                    ? "Ask for second-order effects, likely actors, timeline shifts, or strategic consequences. Replies stay anchored to the active article summary."
                    : "Gemini context will unlock here as soon as the active article summary finishes generating."}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} message={message} />
            ))
          )}

          {loading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
              <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />
              Gemini is preparing a response.
            </div>
          ) : null}
        </div>

        <form
          className="border-t border-slate-800 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) {
              return;
            }

            onSend(draft);
            setDraft("");
          }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 focus-within:border-cyan-500/40">
            <textarea
              className="h-16 flex-1 resize-none bg-transparent text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
              disabled={!contextReady || loading}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                contextReady
                  ? "Ask about strategic implications, actors, or what happens next..."
                  : "Wait for the summary to finish before asking follow-ups..."
              }
              value={draft}
            />
            <button
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!contextReady || loading || !draft.trim()}
              type="submit"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptySummaryState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center">
      <Sparkles className="h-10 w-10 text-cyan-400/70" />
      <h2 className="mt-4 text-xl font-semibold text-slate-100">Awaiting article selection</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        Choose a news item from the left pane to generate a Gemini briefing and initialize a
        contextual analyst chat session.
      </p>
    </div>
  );
}

function ErrorPanel({ message }) {
  return (
    <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{message}</p>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6",
          isUser
            ? "bg-cyan-500/15 text-cyan-50 border border-cyan-400/20"
            : "border border-slate-800 bg-slate-900/80 text-slate-200",
          message.error ? "border-rose-500/30 text-rose-200" : "",
        ].join(" ")}
      >
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
          {isUser ? "Operator" : "Gemini"}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}

// ─── Conflict helpers ────────────────────────────────────────────────────────

function casualtyColor(n) {
  const minLog = Math.log10(500);
  const maxLog = Math.log10(600000);
  const t = Math.min(1, Math.max(0, (Math.log10(Math.max(1, n)) - minLog) / (maxLog - minLog)));
  let r, g, b;
  if (t <= 0.5) {
    const u = t * 2;
    r = Math.round(34 + u * (234 - 34));
    g = Math.round(197 + u * (179 - 197));
    b = Math.round(94 + u * (8 - 94));
  } else {
    const u = (t - 0.5) * 2;
    r = Math.round(234 + u * (239 - 234));
    g = Math.round(179 + u * (68 - 179));
    b = Math.round(8 + u * (68 - 8));
  }
  return `rgb(${r},${g},${b})`;
}

function formatCasualties(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

function severityBorder(n) {
  if (n >= 100000) return "border-l-rose-500";
  if (n >= 20000) return "border-l-orange-400";
  if (n >= 5000) return "border-l-yellow-400";
  return "border-l-cyan-500";
}

// ─── ConflictList ─────────────────────────────────────────────────────────────

export function ConflictList({ conflicts, error, loading, onRefresh }) {
  return (
    <div className="flex min-h-0 flex-col border-b border-cyan-950/60 bg-slate-950 p-4">
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-cyan-400/80" />
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-400/80">
            Active Conflicts
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-slate-700 bg-slate-800/60 p-1.5 text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300 disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      ) : loading && conflicts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-cyan-400/60" />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-2 pr-1">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className={`rounded-2xl border border-slate-800 border-l-2 bg-slate-900/70 px-4 py-3 ${severityBorder(c.casualties_estimate)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-100">
                        {c.name}
                      </span>
                      <span className="shrink-0 rounded-full border border-slate-700 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                        {c.start_year}–
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      {c.parties.join(" · ")}
                    </p>
                  </div>
                  <div
                    className="shrink-0 rounded-full px-2 py-1 font-mono text-[10px] font-semibold"
                    style={{
                      color: casualtyColor(c.casualties_estimate),
                      backgroundColor: casualtyColor(c.casualties_estimate) + "22",
                    }}
                  >
                    ~{formatCasualties(c.casualties_estimate)}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ConflictMap ──────────────────────────────────────────────────────────────

export function ConflictMap({ conflicts, loading, onRefresh }) {
  return (
    <div className="flex min-h-0 flex-col bg-slate-950 p-4">
      <header className="mb-2 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-cyan-400/80" />
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-cyan-400/80">
            Conflict Map
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-slate-700 bg-slate-800/60 p-1.5 text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300 disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-800">
        <MapContainer
          center={[20, 15]}
          zoom={2}
          style={{ height: "100%", width: "100%", background: "#020617" }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {conflicts.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lng]}
              radius={7}
              pathOptions={{
                color: "transparent",
                fillColor: casualtyColor(c.casualties_estimate),
                fillOpacity: 0.85,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <span className="text-xs">
                  <strong>{c.name}</strong>
                  <br />
                  ~{formatCasualties(c.casualties_estimate)} casualties
                </span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
