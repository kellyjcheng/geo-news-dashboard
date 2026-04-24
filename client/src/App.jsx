import { useCallback, useEffect, useState } from "react";
import { Activity, Globe2, Shield } from "lucide-react";
import TitleBar from "./components/TitleBar";
import { ArticleList, ConflictList, ConflictMap } from "./components.jsx";
import { fetchConflicts, fetchNews } from "./data.jsx";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  const [conflicts, setConflicts] = useState([]);
  const [conflictsLoading, setConflictsLoading] = useState(true);
  const [conflictsError, setConflictsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadNews() {
      setNewsLoading(true);
      setNewsError("");
      try {
        const data = await fetchNews();
        if (!cancelled) {
          setArticles(data.articles);
          setSelectedArticleId((id) => id ?? data.articles[0]?.id ?? null);
        }
      } catch (err) {
        if (!cancelled) setNewsError(err.message || "Failed to load news feed.");
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    }
    loadNews();
    return () => { cancelled = true; };
  }, []);

  const loadConflicts = useCallback(async () => {
    setConflictsLoading(true);
    setConflictsError("");
    try {
      const data = await fetchConflicts();
      setConflicts(data.conflicts);
    } catch (err) {
      setConflictsError(err.message || "Failed to load conflict data.");
    } finally {
      setConflictsLoading(false);
    }
  }, []);

  useEffect(() => { loadConflicts(); }, [loadConflicts]);

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
                error={newsError}
                loading={newsLoading}
                selectedArticleId={selectedArticleId}
                onSelect={setSelectedArticleId}
              />
            </div>
          </div>
        </section>

        <section className="grid min-h-0 grid-rows-[65%_35%] bg-slate-900/70">
          <ConflictList
            conflicts={conflicts}
            error={conflictsError}
            loading={conflictsLoading}
            onRefresh={loadConflicts}
          />
          <ConflictMap
            conflicts={conflicts}
            loading={conflictsLoading}
            onRefresh={loadConflicts}
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
