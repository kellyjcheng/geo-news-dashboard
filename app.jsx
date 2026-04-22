// ============================================================
// Meridian — App root
// ============================================================
const { useState, useEffect, useMemo, useCallback } = React;

// Pre-generated summaries keyed by article id (for instant first-paint;
// regeneration still hits the live LLM).
const SEED_SUMMARIES = {
  a1: {
    tldr: "Ukraine's overnight drone raid on Crimean air defenses marks the widest-range strike yet in a campaign methodically stripping Russia's radar coverage over the Black Sea ahead of a shifting spring tempo.",
    bullets: [
      "At least two S-400 radar components reported destroyed near Sevastopol; Moscow confirms intercepts but not damage.",
      "Ukraine's domestic drone program now routinely reaches 1,500 km — a capability that did not exist at the war's start.",
      "Western officials read the targeting pattern as forcing Russia to redistribute scarce air-defense assets inland.",
      "Naval implications significant: degraded radar coverage compounds Russia's Black Sea Fleet withdrawal from Sevastopol.",
    ],
    players: [
      { name: "Ukrainian General Staff", role: "Publicly attributed operation" },
      { name: "Russian MoD", role: "Acknowledged intercepts" },
      { name: "Black Sea Fleet", role: "Operating at reduced posture" },
      { name: "NATO observers", role: "Monitoring radar displacement" },
    ],
    watch: [
      { when: "48h",  what: "Russian counter-strikes on Ukrainian drone manufacturing clusters in central oblasts" },
      { when: "1 wk", what: "Satellite confirmation of S-400 battery relocation inland" },
      { when: "1 mo", what: "Shift in Russian naval patrol patterns away from occupied Crimea" },
    ],
    context: "Ukraine's strike doctrine has evolved from desperate defensive counter-battery in 2022 to a systematic reach-and-degrade campaign. Each radar lost is roughly $100M of capability and months of industrial backlog to replace — making degradation a better trade than destruction.",
    sourceCount: 6,
  },
  a2: {
    tldr: "Indonesia's governing coalition lost its third partner two weeks before the parliamentary vote, converting a tight race into a genuinely unpredictable one amid cost-of-living protests.",
    bullets: [
      "Nusantara Progress Party cites 'irreconcilable differences' over fuel subsidy rollback as its exit trigger.",
      "Incumbent bloc and the opposition alliance now poll within the margin of error.",
      "Rupiah slipped 0.6% against the dollar; Jakarta composite off 1.2% intraday.",
      "Street protests concentrated in Java where contested districts will likely decide the outcome.",
    ],
    players: [
      { name: "Nusantara Progress Party", role: "Coalition defector" },
      { name: "Incumbent alliance",      role: "Lost parliamentary majority cushion" },
      { name: "Opposition bloc",          role: "Closing polling gap" },
      { name: "Bank Indonesia",           role: "Watching rupiah intervention triggers" },
    ],
    watch: [
      { when: "72h",  what: "Whether fuel subsidy reduction is paused or defended" },
      { when: "2 wk", what: "Parliamentary vote — Java turnout is the key variable" },
      { when: "1 mo", what: "Post-vote coalition math; no bloc likely wins outright majority" },
    ],
    context: "Indonesian coalition politics historically reward post-election dealmaking over pre-election discipline. This defection matters less for vote share than for signaling that the governing platform can no longer discipline partners around unpopular reforms.",
    sourceCount: 5,
  },
  a3: {
    tldr: "A fourth Red Sea vessel attack this week has pushed Gulf states toward coordinated action — reflecting that the economic cost of shipping disruption now exceeds the political cost of visible alignment with the West.",
    bullets: [
      "Shipping insurance premiums via Bab al-Mandeb up 34% month-over-month (Lloyd's).",
      "Western navies under Prosperity Guardian intercepted 28 aerial threats this week alone.",
      "GCC foreign ministers convene in Riyadh tomorrow — format suggests binding coordination, not just communiqué.",
      "Greek-flagged tanker strike Tuesday briefly ignited cargo fire; no crew casualties reported.",
    ],
    players: [
      { name: "Saudi Arabia", role: "Host; pushing coordination" },
      { name: "UAE",          role: "Advocating harder deterrence posture" },
      { name: "Houthi forces", role: "Targeting party" },
      { name: "Lloyd's of London", role: "Setting risk premia that drive behavior" },
    ],
    watch: [
      { when: "24h",  what: "Whether the Riyadh communiqué includes operational naval language" },
      { when: "1 wk", what: "Suez Canal traffic recovery — or deeper re-routing via the Cape" },
      { when: "1 mo", what: "Insurance market response — premiums are the real scoreboard" },
    ],
    context: "The Red Sea carries roughly 12% of global trade by value. Every week of disruption adds ~$1B in rerouting costs and 10–14 days to Asia–Europe transit. Gulf states have tolerated disruption longer than expected; the fourth strike appears to be a threshold event.",
    sourceCount: 4,
  },
};

// Generic fallback summary for items without a seed.
function fallbackSummary(article) {
  return {
    tldr: article.dek,
    bullets: [
      article.body.split('. ')[0] + '.',
      article.body.split('. ')[1] ? article.body.split('. ')[1] + '.' : 'Details still emerging from the region.',
      "Regional responses in early phase; expect formal statements within 48 hours.",
      "Market and diplomatic spillovers likely contained for now.",
    ],
    players: article.entities.slice(0, 4).map(e => ({ name: e, role: "Named in dispatch" })),
    watch: [
      { when: "24h",  what: "Official statements from named parties" },
      { when: "1 wk", what: "Secondary-effect reporting from regional press" },
      { when: "1 mo", what: "Whether this dispatch becomes a trendline or an anomaly" },
    ],
    context: "This item draws on a single wire report and supporting background. Cross-reference before citing in long-form analysis.",
    sourceCount: 3,
  };
}

function App() {
  const articles = window.__ARTICLES;

  const [tweaks, setTweaks] = useState(window.__TWEAKS);
  const [editMode, setEditMode] = useState(false);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('ALL');
  const [selectedId, setSelectedId] = useState(articles[0].id);
  const [chatMessages, setChatMessages] = useState([]);
  const [summary, setSummary] = useState(SEED_SUMMARIES[articles[0].id] || fallbackSummary(articles[0]));
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Apply tweaks → CSS vars / data attrs
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = tweaks.theme;
    root.style.setProperty('--accent', tweaks.accent);
    // soft variant
    const hex = tweaks.accent.replace('#','');
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    root.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.14)`);
    if (tweaks.fontPairing === 'inter-inter') {
      root.style.setProperty('--font-serif', "'Inter', system-ui, sans-serif");
    } else {
      root.style.setProperty('--font-serif', "'Fraunces', Georgia, serif");
    }
    root.style.setProperty('--row-pad-y', tweaks.density === 'compact' ? '8px' : '14px');
  }, [tweaks]);

  // Tweaks edit-mode protocol
  useEffect(() => {
    const handler = (ev) => {
      const d = ev.data || {};
      if (d.type === '__activate_edit_mode')   setEditMode(true);
      if (d.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Persist selection
  useEffect(() => {
    const stored = localStorage.getItem('meridian-selected');
    if (stored && articles.find(a => a.id === stored)) setSelectedId(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem('meridian-selected', selectedId);
  }, [selectedId]);

  const filtered = useMemo(() => {
    return articles.filter(a => {
      if (topic !== 'ALL' && a.topic !== topic) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return a.headline.toLowerCase().includes(q)
          || a.dek.toLowerCase().includes(q)
          || a.region.toLowerCase().includes(q)
          || a.entities.some(e => e.toLowerCase().includes(q));
      }
      return true;
    });
  }, [articles, topic, query]);

  const selected = articles.find(a => a.id === selectedId) || filtered[0];

  // When selection changes, swap summary instantly (seed or fallback)
  useEffect(() => {
    if (!selected) return;
    setSummary(SEED_SUMMARIES[selected.id] || fallbackSummary(selected));
    setSummaryLoading(false);
    // Reset chat when switching story (optional — keep for context continuity? we reset.)
    setChatMessages([]);
  }, [selectedId]);

  const regenerateSummary = useCallback(async () => {
    if (!selected) return;
    setSummaryLoading(true);
    try {
      const prompt = `You are Gemini, a geopolitical analyst producing a structured briefing. Given this dispatch, return ONLY a JSON object with keys: tldr (string, 1-2 sentences), bullets (array of 4 short strings), players (array of {name, role} — 3-4 items), watch (array of {when, what} — 3 items; when is like "24h", "1 wk", "1 mo"), context (string, 2-3 sentences). No markdown, no backticks, just JSON.\n\nHEADLINE: ${selected.headline}\nREGION: ${selected.region}\nTOPIC: ${selected.topic}\nBODY: ${selected.body}`;
      const reply = await window.claude.complete({ messages: [{ role: 'user', content: prompt }] });
      const clean = reply.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setSummary({ ...parsed, sourceCount: 4 });
    } catch (e) {
      // Fall back gracefully
      setSummary(SEED_SUMMARIES[selected.id] || fallbackSummary(selected));
    } finally {
      setSummaryLoading(false);
    }
  }, [selected]);

  const breakingCount = articles.filter(a => a.breaking).length;

  return (
    <div style={appStyles.shell}>
      <Masthead
        query={query} setQuery={setQuery}
        topic={topic} setTopic={setTopic}
        liveCount={breakingCount}
        theme={tweaks.theme}
        setTheme={(t) => { setTweaks({...tweaks, theme: t}); window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: t }}, '*'); }}
      />

      <div style={appStyles.body}>
        <aside style={appStyles.left}>
          <div style={appStyles.leftHeader}>
            <div style={appStyles.leftTitle}>
              <span style={appStyles.leftCount}>{String(filtered.length).padStart(2,'0')}</span>
              <span>Dispatches</span>
            </div>
            <div style={appStyles.leftMeta}>
              {topic === 'ALL' ? 'all desks' : topic.toLowerCase()} · sorted by recency
            </div>
          </div>
          <div style={appStyles.leftList}>
            {filtered.length === 0 ? (
              <div style={appStyles.noResults}>No dispatches match this filter.</div>
            ) : filtered.map((a, i) => (
              <ArticleRow
                key={a.id}
                article={a}
                index={i}
                active={a.id === selectedId}
                onClick={() => setSelectedId(a.id)}
              />
            ))}
          </div>
        </aside>

        <section style={appStyles.right}>
          <div style={appStyles.rightTop}>
            <SummaryPane
              article={selected}
              summary={summary}
              loading={summaryLoading}
              onRegenerate={regenerateSummary}
            />
          </div>
          <div style={appStyles.rightBottom}>
            <GeminiChat
              article={selected}
              messages={chatMessages}
              setMessages={setChatMessages}
            />
          </div>
        </section>
      </div>

      <TweaksPanel visible={editMode} tweaks={tweaks} setTweaks={setTweaks} />
    </div>
  );
}

const appStyles = {
  shell: {
    height: '100vh', width: '100vw',
    display: 'flex', flexDirection: 'column',
    background: 'var(--bg)',
  },
  body: {
    flex: 1, display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: 0,
  },
  left: {
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    minHeight: 0,
  },
  leftHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  leftTitle: {
    display: 'flex', alignItems: 'baseline', gap: 10,
    fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
  },
  leftCount: {
    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)',
    letterSpacing: '0.04em',
  },
  leftMeta: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)',
    letterSpacing: '0.08em', marginTop: 4,
  },
  leftList: { flex: 1, overflowY: 'auto' },
  noResults: {
    padding: 40, textAlign: 'center',
    color: 'var(--fg-mute)', fontStyle: 'italic',
    fontFamily: 'var(--font-serif)', fontSize: 14,
  },
  right: {
    display: 'grid', gridTemplateRows: '65fr 35fr',
    minHeight: 0, minWidth: 0,
  },
  rightTop: {
    minHeight: 0, overflow: 'hidden',
    borderBottom: '1px solid var(--border)',
  },
  rightBottom: { minHeight: 0, overflow: 'hidden' },
};

// ------- keyframes ------
const kf = document.createElement('style');
kf.textContent = `
  @keyframes meridianPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(1.3); }
  }
  @keyframes meridianShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes meridianBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-4px); opacity: 1; }
  }
`;
document.head.appendChild(kf);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
