// ============================================================
// Meridian — Components
// ============================================================
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ------------------------------------------------------------
// Top bar / masthead
// ------------------------------------------------------------
function Masthead({ query, setQuery, topic, setTopic, liveCount, theme, setTheme }) {
  const topics = window.__TOPICS;
  const date = new Date();
  const fmt = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <header style={mastheadStyles.bar}>
      <div style={mastheadStyles.left}>
        <div style={mastheadStyles.wordmarkWrap}>
          <div style={mastheadStyles.wordmarkMark}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 12h20M12 2c3 3.3 3 16.7 0 20M12 2c-3 3.3-3 16.7 0 20" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </div>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
            <div style={mastheadStyles.wordmark}>MERIDIAN</div>
            <div style={mastheadStyles.subword}>GEOPOLITICAL DESK</div>
          </div>
        </div>
        <div style={mastheadStyles.divider} />
        <div style={mastheadStyles.date}>{fmt}</div>
        <div style={mastheadStyles.time}>
          <span style={mastheadStyles.blink} /> {time} UTC
        </div>
      </div>

      <div style={mastheadStyles.center}>
        {topics.map(t => (
          <button
            key={t.id}
            onClick={() => setTopic(t.id)}
            style={{
              ...mastheadStyles.topicChip,
              ...(topic === t.id ? mastheadStyles.topicChipActive : {})
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={mastheadStyles.right}>
        <div style={mastheadStyles.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{opacity:0.55}}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            placeholder="Search dispatches, regions, actors…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={mastheadStyles.searchInput}
          />
          <kbd style={mastheadStyles.kbd}>⌘K</kbd>
        </div>
        <div style={mastheadStyles.liveBadge}>
          <span style={mastheadStyles.livePulse} />
          <span>LIVE · {liveCount}</span>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={mastheadStyles.themeBtn}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☾' : '☀'}
        </button>
      </div>
    </header>
  );
}

const mastheadStyles = {
  bar: {
    height: 64,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    padding: '0 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    gap: 24,
  },
  left: { display: 'flex', alignItems: 'center', gap: 16 },
  wordmarkWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  wordmarkMark: { color: 'var(--accent)', display:'flex' },
  wordmark: {
    fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 22,
    letterSpacing: '0.02em',
  },
  subword: {
    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em',
    color: 'var(--fg-mute)', marginTop: 3,
  },
  divider: { width: 1, height: 28, background: 'var(--border)' },
  date: { fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--fg-dim)', fontStyle: 'italic' },
  time: {
    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-dim)',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  blink: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--accent)', display: 'inline-block',
    boxShadow: '0 0 6px var(--accent)',
  },
  center: { display: 'flex', gap: 2, background: 'var(--bg-elev)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' },
  topicChip: {
    border: 'none', background: 'transparent', color: 'var(--fg-dim)',
    padding: '6px 12px', fontSize: 12, fontWeight: 500,
    borderRadius: 6, letterSpacing: '0.02em',
    transition: 'all 120ms ease',
  },
  topicChipActive: {
    background: 'var(--bg-elev-2)', color: 'var(--fg)',
    boxShadow: 'inset 0 0 0 1px var(--border-strong)',
  },
  right: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--bg-elev)', border: '1px solid var(--border)',
    padding: '6px 10px', borderRadius: 7, width: 260,
  },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--fg)', fontSize: 12, fontFamily: 'inherit',
  },
  kbd: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)',
    background: 'var(--bg-elev-2)', padding: '1px 5px', borderRadius: 3,
    border: '1px solid var(--border)',
  },
  liveBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--red)', letterSpacing: '0.12em',
    padding: '5px 9px', borderRadius: 5,
    background: 'rgba(232,90,79,0.08)',
    border: '1px solid rgba(232,90,79,0.24)',
  },
  livePulse: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--red)',
    animation: 'meridianPulse 1.4s ease-in-out infinite',
  },
  themeBtn: {
    width: 30, height: 30, border: '1px solid var(--border)',
    background: 'var(--bg-elev)', color: 'var(--fg-dim)',
    borderRadius: 6, fontSize: 14,
  },
};

// ------------------------------------------------------------
// Article list row
// ------------------------------------------------------------
function ArticleRow({ article, active, onClick, index }) {
  const t = article.outlet.tone;
  return (
    <div
      onClick={onClick}
      style={{
        ...rowStyles.row,
        ...(active ? rowStyles.rowActive : {}),
      }}
    >
      <div style={rowStyles.rail} aria-hidden>
        <div style={{
          ...rowStyles.railDot,
          background: article.breaking ? 'var(--red)' : t,
          boxShadow: article.breaking ? '0 0 8px var(--red)' : 'none',
        }} />
        <div style={rowStyles.railLine} />
      </div>
      <div style={rowStyles.content}>
        <div style={rowStyles.metaRow}>
          <span style={{ ...rowStyles.outletTag, color: t, borderColor: t }}>
            {article.outlet.code}
          </span>
          <span style={rowStyles.outletName}>{article.outlet.name}</span>
          <span style={rowStyles.dot}>·</span>
          <span style={rowStyles.topicTag}>{article.topic}</span>
          <span style={rowStyles.dot}>·</span>
          <span style={rowStyles.region}>{article.region}</span>
          <span style={rowStyles.spacer} />
          {article.breaking && (
            <span style={rowStyles.breaking}>
              <span style={rowStyles.breakingDot} />BREAKING
            </span>
          )}
          <span style={rowStyles.ts}>{window.__relTime(article.ts)}</span>
        </div>
        <div style={rowStyles.headline}>{article.headline}</div>
        <div style={rowStyles.dek}>{article.dek}</div>
        <div style={rowStyles.footer}>
          <span style={rowStyles.readMin}>⌖ {article.readMin} min read</span>
          {article.entities.slice(0,3).map(e => (
            <span key={e} style={rowStyles.entity}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const rowStyles = {
  row: {
    display: 'grid', gridTemplateColumns: '16px 1fr',
    padding: '16px 20px 16px 6px',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 120ms ease',
    position: 'relative',
  },
  rowActive: {
    background: 'var(--bg-elev)',
    boxShadow: 'inset 3px 0 0 var(--accent)',
  },
  rail: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 },
  railDot: { width: 7, height: 7, borderRadius: '50%' },
  railLine: { width: 1, flex: 1, background: 'var(--border)', marginTop: 6 },
  content: { minWidth: 0 },
  metaRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--fg-mute)', letterSpacing: '0.06em',
    marginBottom: 8, flexWrap: 'wrap',
  },
  outletTag: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    border: '1px solid currentColor', padding: '1px 5px', borderRadius: 3,
    letterSpacing: '0.08em',
  },
  outletName: { color: 'var(--fg-dim)', fontWeight: 500 },
  dot: { color: 'var(--fg-mute)' },
  topicTag: { color: 'var(--fg-dim)', fontWeight: 600 },
  region: { color: 'var(--fg-mute)' },
  spacer: { flex: 1 },
  breaking: {
    color: 'var(--red)', fontWeight: 700, letterSpacing: '0.12em',
    display: 'flex', alignItems: 'center', gap: 4,
  },
  breakingDot: {
    width: 5, height: 5, borderRadius: '50%', background: 'var(--red)',
    animation: 'meridianPulse 1.4s ease-in-out infinite',
  },
  ts: { color: 'var(--fg-mute)' },
  headline: {
    fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500,
    lineHeight: 1.3, color: 'var(--fg)', marginBottom: 6,
    textWrap: 'pretty',
  },
  dek: {
    fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.5,
    marginBottom: 10,
    overflow: 'hidden', display: '-webkit-box',
    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
  },
  footer: {
    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--fg-mute)',
  },
  readMin: { color: 'var(--fg-mute)' },
  entity: {
    padding: '2px 6px', background: 'var(--bg-elev)',
    border: '1px solid var(--border)', borderRadius: 3,
    color: 'var(--fg-dim)', fontWeight: 500,
  },
};

// ------------------------------------------------------------
// Summary pane
// ------------------------------------------------------------
function SummaryPane({ article, summary, loading, onRegenerate }) {
  if (!article) {
    return <div style={summaryStyles.empty}>Select a dispatch to read the briefing.</div>;
  }
  const t = article.outlet.tone;

  return (
    <div style={summaryStyles.wrap}>
      <div style={summaryStyles.scroll}>
        <div style={summaryStyles.stickyHeader}>
          <div style={summaryStyles.headerMeta}>
            <span style={{ ...summaryStyles.outletTag, color: t, borderColor: t }}>
              {article.outlet.code} · {article.outlet.name}
            </span>
            <span style={summaryStyles.topic}>{article.topic}</span>
            <span style={summaryStyles.region}>{article.region}</span>
            <span style={summaryStyles.ts}>{window.__relTime(article.ts)}</span>
            <span style={{ flex: 1 }} />
            <button style={summaryStyles.toolBtn} onClick={onRegenerate} disabled={loading}>
              {loading ? '◴ generating' : '↻ regenerate'}
            </button>
            <button style={summaryStyles.toolBtn}>☆ save</button>
            <button style={summaryStyles.toolBtn}>↗ source</button>
          </div>
          <h1 style={summaryStyles.headline}>{article.headline}</h1>
          <div style={summaryStyles.entities}>
            {article.entities.map(e => (
              <span key={e} style={summaryStyles.entityChip}>⌖ {e}</span>
            ))}
          </div>
        </div>

        <div style={summaryStyles.body}>
          <div style={summaryStyles.aiBadge}>
            <span style={summaryStyles.aiDot} />
            AI BRIEFING · generated by Gemini · {article.readMin}‑min synthesis
          </div>

          {loading ? (
            <SkeletonSummary />
          ) : (
            <>
              <section style={summaryStyles.section}>
                <div style={summaryStyles.sectionLabel}>TL;DR</div>
                <p style={summaryStyles.tldr}>{summary.tldr}</p>
              </section>

              <section style={summaryStyles.section}>
                <div style={summaryStyles.sectionLabel}>Key points</div>
                <ul style={summaryStyles.bullets}>
                  {summary.bullets.map((b, i) => (
                    <li key={i} style={summaryStyles.bullet}>
                      <span style={summaryStyles.bulletIdx}>{String(i+1).padStart(2,'0')}</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={summaryStyles.section}>
                <div style={summaryStyles.sectionLabel}>Key players</div>
                <div style={summaryStyles.players}>
                  {summary.players.map(p => (
                    <div key={p.name} style={summaryStyles.player}>
                      <div style={summaryStyles.playerName}>{p.name}</div>
                      <div style={summaryStyles.playerRole}>{p.role}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section style={summaryStyles.section}>
                <div style={summaryStyles.sectionLabel}>What to watch</div>
                <ol style={summaryStyles.watch}>
                  {summary.watch.map((w, i) => (
                    <li key={i} style={summaryStyles.watchItem}>
                      <span style={summaryStyles.watchTime}>{w.when}</span>
                      <span>{w.what}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section style={summaryStyles.section}>
                <div style={summaryStyles.sectionLabel}>Context</div>
                <p style={summaryStyles.context}>{summary.context}</p>
              </section>

              <div style={summaryStyles.disclaimer}>
                Synthesized from {summary.sourceCount || 4} wire reports. Verify before citing.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonSummary() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {[100, 92, 96, 78, 88, 70].map((w,i)=>(
        <div key={i} style={{
          height: 12, width: w + '%',
          background: 'linear-gradient(90deg, var(--bg-elev) 0%, var(--bg-elev-2) 50%, var(--bg-elev) 100%)',
          backgroundSize: '200% 100%',
          animation: 'meridianShimmer 1.6s linear infinite',
          borderRadius: 3,
        }} />
      ))}
    </div>
  );
}

const summaryStyles = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  empty: {
    display:'flex', alignItems:'center', justifyContent:'center',
    height:'100%', color:'var(--fg-mute)',
    fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize: 15,
  },
  scroll: { flex: 1, overflowY: 'auto' },
  stickyHeader: {
    padding: '24px 32px 20px 32px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    position: 'sticky', top: 0, zIndex: 2,
  },
  headerMeta: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--fg-mute)', letterSpacing: '0.08em',
    marginBottom: 14, flexWrap: 'wrap',
  },
  outletTag: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    border: '1px solid currentColor', padding: '2px 6px', borderRadius: 3,
    letterSpacing: '0.08em',
  },
  topic: { color: 'var(--fg-dim)', fontWeight: 600 },
  region: { color: 'var(--fg-mute)' },
  ts: { color: 'var(--fg-mute)' },
  toolBtn: {
    background: 'var(--bg-elev)', border: '1px solid var(--border)',
    color: 'var(--fg-dim)', fontSize: 10, fontFamily: 'var(--font-mono)',
    padding: '4px 9px', borderRadius: 4, letterSpacing: '0.04em',
  },
  headline: {
    fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 28,
    lineHeight: 1.2, color: 'var(--fg)', margin: 0, marginBottom: 14,
    textWrap: 'balance',
  },
  entities: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  entityChip: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)',
    background: 'var(--bg-elev)', padding: '3px 8px', borderRadius: 3,
    border: '1px solid var(--border)',
  },
  body: { padding: '20px 32px 40px 32px' },
  aiBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--accent)', letterSpacing: '0.1em',
    padding: '6px 10px', borderRadius: 4,
    background: 'var(--accent-soft)',
    marginBottom: 24,
  },
  aiDot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)',
  },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--fg-mute)', letterSpacing: '0.16em',
    marginBottom: 12, paddingBottom: 8,
    borderBottom: '1px solid var(--border)',
  },
  tldr: {
    fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.55,
    color: 'var(--fg)', margin: 0, textWrap: 'pretty',
  },
  bullets: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection:'column', gap: 10 },
  bullet: {
    display: 'grid', gridTemplateColumns: '32px 1fr', gap: 8,
    fontSize: 14, lineHeight: 1.55, color: 'var(--fg-dim)',
  },
  bulletIdx: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)',
    paddingTop: 3, letterSpacing: '0.04em',
  },
  players: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 },
  player: {
    padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 6, background: 'var(--bg-elev)',
  },
  playerName: {
    fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 14,
    color: 'var(--fg)', marginBottom: 2,
  },
  playerRole: { fontSize: 11, color: 'var(--fg-mute)', lineHeight: 1.4 },
  watch: { margin: 0, padding: 0, listStyle: 'none', display:'flex', flexDirection:'column', gap: 8 },
  watchItem: {
    display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12,
    fontSize: 13, lineHeight: 1.5, color: 'var(--fg-dim)',
    paddingBottom: 8, borderBottom: '1px dashed var(--border)',
  },
  watchTime: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)',
    letterSpacing: '0.06em', paddingTop: 2,
  },
  context: {
    fontSize: 13, lineHeight: 1.65, color: 'var(--fg-dim)',
    margin: 0, textWrap: 'pretty',
  },
  disclaimer: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'var(--fg-mute)', fontStyle: 'italic',
    paddingTop: 16, borderTop: '1px solid var(--border)',
    marginTop: 12,
  },
};

// ------------------------------------------------------------
// Gemini chat
// ------------------------------------------------------------
function GeminiChat({ article, messages, setMessages }) {
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  const suggestions = useMemo(() => {
    if (!article) return [
      "What are today's top three stories?",
      "Which regions are heating up?",
      "Summarize election risks this quarter",
    ];
    return [
      `Why does this matter globally?`,
      `Who stands to lose from this?`,
      `What historical precedents apply?`,
      `Forecast: what happens next?`,
    ];
  }, [article]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || streaming) return;
    const userMsg = { role: 'user', content: q };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setStreaming(true);

    const context = article
      ? `You are Gemini, a geopolitical analysis assistant. The user is reading this dispatch:\n\nHEADLINE: ${article.headline}\nDEK: ${article.dek}\nREGION: ${article.region}\nTOPIC: ${article.topic}\nBODY: ${article.body}\n\nAnswer the user's question below with expert, concise analysis (2–4 short paragraphs max, or a tight bulleted list). Use plain text — no markdown headings.`
      : `You are Gemini, a geopolitical analysis assistant for a global news desk. Answer concisely (2–4 short paragraphs max).`;

    try {
      const reply = await window.claude.complete({
        messages: [
          { role: 'user', content: context + '\n\nQuestion: ' + q }
        ]
      });
      setMessages([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages([...newMsgs, { role: 'assistant', content: 'Connection to Gemini failed. Retry?', error: true }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div style={chatStyles.wrap}>
      <div style={chatStyles.header}>
        <div style={chatStyles.brandMark}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
          </svg>
        </div>
        <div style={chatStyles.brandText}>
          <div style={chatStyles.brandName}>Gemini</div>
          <div style={chatStyles.brandSub}>
            {article ? `contextualized to: ${article.headline.slice(0, 44)}${article.headline.length > 44 ? '…' : ''}` : 'awaiting context'}
          </div>
        </div>
        <span style={{flex:1}} />
        <button style={chatStyles.clearBtn} onClick={() => setMessages([])}>clear</button>
      </div>

      <div style={chatStyles.messages} ref={scrollRef}>
        {messages.length === 0 && (
          <div style={chatStyles.empty}>
            <div style={chatStyles.emptyTitle}>Ask Gemini</div>
            <div style={chatStyles.emptySub}>
              Interrogate the briefing. Gemini sees the open dispatch as context.
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {streaming && <ChatBubble message={{ role: 'assistant', content: '', streaming: true }} />}
      </div>

      <div style={chatStyles.suggestions}>
        {suggestions.map(s => (
          <button
            key={s}
            style={chatStyles.chip}
            onClick={() => send(s)}
            disabled={streaming}
          >{s}</button>
        ))}
      </div>

      <form
        style={chatStyles.inputBar}
        onSubmit={e => { e.preventDefault(); send(); }}
      >
        <div style={chatStyles.inputSparkle}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="currentColor"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          style={chatStyles.input}
          placeholder={article ? "Ask Gemini about this dispatch…" : "Ask Gemini about world events…"}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={streaming}
        />
        <button
          type="submit"
          style={{
            ...chatStyles.sendBtn,
            opacity: (streaming || !input.trim()) ? 0.4 : 1,
          }}
          disabled={streaming || !input.trim()}
        >
          {streaming ? '◴' : '↵'}
        </button>
      </form>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{
      ...chatStyles.bubbleRow,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }}>
      {!isUser && (
        <div style={chatStyles.avatar}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
          </svg>
        </div>
      )}
      <div style={{
        ...chatStyles.bubble,
        ...(isUser ? chatStyles.bubbleUser : chatStyles.bubbleBot),
        ...(message.error ? { color: 'var(--red)' } : {}),
      }}>
        {message.streaming ? (
          <span style={chatStyles.typing}>
            <span style={{...chatStyles.typingDot, animationDelay:'0s'}} />
            <span style={{...chatStyles.typingDot, animationDelay:'0.15s'}} />
            <span style={{...chatStyles.typingDot, animationDelay:'0.3s'}} />
          </span>
        ) : message.content}
      </div>
    </div>
  );
}

const chatStyles = {
  wrap: {
    height: '100%',
    display: 'flex', flexDirection: 'column',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-elev)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-elev)',
  },
  brandMark: {
    width: 26, height: 26, borderRadius: 6,
    background: 'linear-gradient(135deg, #4c8bf5 0%, #8ab4f8 50%, #c58af9 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff',
  },
  brandText: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  brandName: { fontSize: 13, fontWeight: 600, color: 'var(--fg)' },
  brandSub: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)',
    letterSpacing: '0.02em', marginTop: 2,
  },
  clearBtn: {
    background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--fg-mute)', fontSize: 10, fontFamily: 'var(--font-mono)',
    padding: '4px 8px', borderRadius: 4, letterSpacing: '0.04em',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '12px 16px',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  empty: {
    margin: 'auto', textAlign: 'center', padding: '16px 8px',
    maxWidth: 320,
  },
  emptyTitle: {
    fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--fg)',
    marginBottom: 4,
  },
  emptySub: { fontSize: 12, color: 'var(--fg-mute)', lineHeight: 1.5 },
  bubbleRow: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  avatar: {
    width: 22, height: 22, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4c8bf5 0%, #c58af9 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', flexShrink: 0, marginBottom: 2,
  },
  bubble: {
    maxWidth: '80%', padding: '8px 12px', borderRadius: 10,
    fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  bubbleUser: {
    background: 'var(--accent)', color: '#fff',
    borderBottomRightRadius: 3,
  },
  bubbleBot: {
    background: 'var(--bg-elev-2)', color: 'var(--fg)',
    border: '1px solid var(--border)',
    borderBottomLeftRadius: 3,
  },
  typing: { display: 'inline-flex', gap: 4, padding: '2px 0' },
  typingDot: {
    width: 5, height: 5, borderRadius: '50%', background: 'var(--fg-mute)',
    animation: 'meridianBounce 1.2s ease-in-out infinite',
  },
  suggestions: {
    display: 'flex', gap: 6, padding: '0 16px 10px 16px',
    overflowX: 'auto', flexShrink: 0,
  },
  chip: {
    flexShrink: 0, padding: '5px 10px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--fg-dim)', fontSize: 11,
    borderRadius: 14, whiteSpace: 'nowrap',
  },
  inputBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px', borderTop: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  inputSparkle: {
    color: 'transparent',
    background: 'linear-gradient(135deg, #4c8bf5 0%, #c58af9 100%)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text',
    display: 'flex',
  },
  input: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit',
  },
  sendBtn: {
    width: 28, height: 28, borderRadius: 6,
    border: 'none', background: 'var(--accent)',
    color: '#fff', fontSize: 14,
  },
};

// ------------------------------------------------------------
// Tweaks panel
// ------------------------------------------------------------
function TweaksPanel({ visible, tweaks, setTweaks }) {
  if (!visible) return null;

  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  return (
    <div style={tweakStyles.panel}>
      <div style={tweakStyles.header}>
        <span style={tweakStyles.title}>Tweaks</span>
        <span style={tweakStyles.hint}>live preview</span>
      </div>

      <div style={tweakStyles.group}>
        <div style={tweakStyles.label}>THEME</div>
        <div style={tweakStyles.segment}>
          {['dark', 'light'].map(t => (
            <button key={t}
              onClick={() => update({ theme: t })}
              style={{
                ...tweakStyles.segBtn,
                ...(tweaks.theme === t ? tweakStyles.segBtnActive : {})
              }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={tweakStyles.group}>
        <div style={tweakStyles.label}>DENSITY</div>
        <div style={tweakStyles.segment}>
          {['comfortable', 'compact'].map(t => (
            <button key={t}
              onClick={() => update({ density: t })}
              style={{
                ...tweakStyles.segBtn,
                ...(tweaks.density === t ? tweakStyles.segBtnActive : {})
              }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={tweakStyles.group}>
        <div style={tweakStyles.label}>ACCENT</div>
        <div style={tweakStyles.swatches}>
          {['#d97757', '#6aa1e0', '#6fbf73', '#d9b65a', '#a78bd9', '#e85a4f'].map(c => (
            <button key={c}
              onClick={() => update({ accent: c })}
              style={{
                ...tweakStyles.swatch,
                background: c,
                outline: tweaks.accent === c ? '2px solid var(--fg)' : '2px solid transparent',
                outlineOffset: 2,
              }} />
          ))}
        </div>
      </div>

      <div style={tweakStyles.group}>
        <div style={tweakStyles.label}>TYPE</div>
        <div style={tweakStyles.segment}>
          {[
            { id: 'inter-fraunces', label: 'Editorial' },
            { id: 'inter-inter', label: 'System' },
          ].map(f => (
            <button key={f.id}
              onClick={() => update({ fontPairing: f.id })}
              style={{
                ...tweakStyles.segBtn,
                ...(tweaks.fontPairing === f.id ? tweakStyles.segBtnActive : {})
              }}>{f.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const tweakStyles = {
  panel: {
    position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
    width: 260, padding: 14,
    background: 'var(--bg-elev)', border: '1px solid var(--border-strong)',
    borderRadius: 10,
    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  header: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600 },
  hint: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-mute)', letterSpacing: '0.08em' },
  group: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-mute)', letterSpacing: '0.12em' },
  segment: { display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 },
  segBtn: {
    flex: 1, padding: '5px 8px', border: 'none',
    background: 'transparent', color: 'var(--fg-dim)',
    fontSize: 11, borderRadius: 4, textTransform: 'capitalize',
  },
  segBtnActive: { background: 'var(--bg-elev-2)', color: 'var(--fg)' },
  swatches: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  swatch: { width: 22, height: 22, borderRadius: 4, border: 'none', cursor: 'pointer' },
};

// Expose to other scripts
Object.assign(window, {
  Masthead, ArticleRow, SummaryPane, GeminiChat, TweaksPanel,
});
