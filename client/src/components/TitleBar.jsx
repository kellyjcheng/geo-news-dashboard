import { Maximize2, Minus, X } from "lucide-react";

const controls = [
  { id: "minimize", icon: Minus, label: "Minimize" },
  { id: "maximize", icon: Maximize2, label: "Maximize" },
  { id: "close", icon: X, label: "Close", danger: true },
];

export default function TitleBar() {
  function handleWindowAction(action) {
    const bridge =
      window.electronAPI?.windowControls ||
      window.desktop?.windowControls ||
      window.api?.windowControls;

    if (bridge && typeof bridge[action] === "function") {
      bridge[action]();
      return;
    }

    window.dispatchEvent(new CustomEvent(`window-control:${action}`));
  }

  return (
    <header
      className="relative flex h-14 items-center justify-between border-b border-cyan-950/70 bg-slate-950/95 px-4 backdrop-blur"
      style={{ WebkitAppRegion: "drag" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.08),transparent_40%,rgba(34,211,238,0.04))]" />

      <div className="relative flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
          <span className="font-mono text-xs uppercase tracking-[0.3em]">GN</span>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.34em] text-cyan-400/80">
            Secure Window
          </div>
          <div className="text-sm font-medium text-slate-200">Geo-News Command Center</div>
        </div>
      </div>

      <div className="relative flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" }}>
        {controls.map(({ danger, icon: Icon, id, label }) => (
          <button
            key={id}
            aria-label={label}
            className={[
              "grid h-9 w-9 place-items-center rounded-xl border transition",
              danger
                ? "border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200",
            ].join(" ")}
            onClick={() => handleWindowAction(id)}
            type="button"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </header>
  );
}
