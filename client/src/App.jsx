import { useEffect, useMemo, useState } from "react";
import { Activity, Globe2, Shield } from "lucide-react";
import TitleBar from "./components/TitleBar";
import { ArticleList, ChatPanel, SummaryPane } from "./components.jsx";
import { fetchNews, requestChatReply, requestSummary } from "./data.jsx";

const EMPTY_SUMMARY = {
  headline: "",
  synopsis: "",
  bullet_points: [],
  risk_level: "Monitoring",
  implications: [],
  next_steps: [],
};

export default function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [chatMessages, setChatMessages] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setNewsLoading(true);
      setError("");
      try {
        const response = await fetchNews();
        if (cancelled) {
          return;
        }

        setArticles(response.articles);
        setSelectedArticleId((currentId) => currentId ?? response.articles[0]?.id ?? null);
      } catch (loadError) {
        console.error("Fetch Error:", loadError);
        if (!cancelled) {
          setError(loadError.message || "Failed to load operational news feed.");
        }
      } finally {
        if (!cancelled) {
          setNewsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  );

  useEffect(() => {
    if (!selectedArticle) {
      setSummary(EMPTY_SUMMARY);
      setChatMessages([]);
      return;
    }

    let cancelled = false;

    async function summarizeSelectedArticle() {
      setSummaryLoading(true);
      setSummary(EMPTY_SUMMARY);
      setChatMessages([]);
      try {
        const nextSummary = await requestSummary(selectedArticle);
        if (!cancelled) {
          setSummary(nextSummary);
        }
      } catch (summaryError) {
        if (!cancelled) {
          setSummary({
            headline: selectedArticle.title,
            synopsis: "Summary generation failed. Backend or Gemini connectivity needs attention.",
            bullet_points: [summaryError.message || "Unable to generate summary."],
            risk_level: "Degraded",
            implications: ["The article payload is loaded, but AI summarization is unavailable."],
            next_steps: ["Verify `VITE_GEMINI_API_KEY` and backend connectivity."],
          });
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    }

    summarizeSelectedArticle();

    return () => {
      cancelled = true;
    };
  }, [selectedArticle]);

  async function handleSendMessage(prompt) {
    if (!selectedArticle || !prompt.trim() || chatLoading) {
      return;
    }

    const nextUserMessage = { role: "user", content: prompt.trim() };
    const pendingMessages = [...chatMessages, nextUserMessage];

    setChatMessages(pendingMessages);
    setChatLoading(true);

    try {
      const response = await requestChatReply({
        article: selectedArticle,
        summary,
        messages: pendingMessages,
      });

      setChatMessages([...pendingMessages, { role: "assistant", content: response.reply }]);
    } catch (chatError) {
      setChatMessages([
        ...pendingMessages,
        {
          role: "assistant",
          content: chatError.message || "Chat request failed.",
          error: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <TitleBar />

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <section className="min-h-0 border-b border-cyan-950/60 bg-slate-950 lg:border-b-0 lg:border-r">
          <div className="flex h-full min-h-0 flex-col">
            <header className="border-b border-cyan-950/60 bg-slate-950/95 px-6 py-5 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-400/80">
                    Global Intake
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
                    Live News Feed
                  </h1>
                </div>
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">
                  {articles.length || 0} active
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm text-slate-400">
                <StatusBadge icon={Globe2} label="Coverage" value="Worldwide" />
                <StatusBadge icon={Shield} label="Desk" value="Geo-Sec" />
                <StatusBadge icon={Activity} label="Mode" value="Live Sync" />
              </div>
            </header>

            <div className="min-h-0 flex-1">
              <ArticleList
                articles={articles}
                error={error}
                loading={newsLoading}
                selectedArticleId={selectedArticleId}
                onSelect={setSelectedArticleId}
              />
            </div>
          </div>
        </section>

        <section className="grid min-h-0 grid-rows-[65%_35%] bg-slate-900/70 [zoom:0.9]">
          <SummaryPane article={selectedArticle} loading={summaryLoading} summary={summary} />
          <ChatPanel
            article={selectedArticle}
            loading={chatLoading}
            messages={chatMessages}
            onSend={handleSendMessage}
            summaryLoading={summaryLoading}
            summary={summary}
          />
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
        <Icon className="h-4 w-4 text-cyan-400/80" />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-slate-200">{value}</div>
    </div>
  );
}
