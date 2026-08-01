// PROTOTYPE — three breadboard editor layouts, switchable via #/breadboard?variant=.
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Braces,
  Check,
  CircleAlert,
  CircleDot,
  Code2,
  Maximize2,
  PanelLeft,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const INITIAL_SOURCE = `breadboard main rows 30

chip NE555 "NE555P" {
  1: GND
  3: OUT
  8: VCC
}

place timer NE555 at 12
wire timer.VCC to LP4 colour "#ff4b32"
wire timer.GND to LG4
wire timer.OUT to A18 route (14, 9)`;

const VARIANTS = [
  { key: "A", name: "Split workbench" },
  { key: "B", name: "Diagnostic rail" },
  { key: "C", name: "Canvas first" },
] as const;

type VariantKey = (typeof VARIANTS)[number]["key"];
type Diagnostic = {
  code: string;
  line: number;
  severity: "error" | "warning";
  title: string;
  detail: string;
};

const DIAGNOSTICS: Diagnostic[] = [
  {
    code: "E_UNKNOWN_HOLE",
    line: 12,
    severity: "error",
    title: "A18 is already covered",
    detail: "Choose a free terminal hole for timer.OUT.",
  },
  {
    code: "W_WIRE_OVERLAP",
    line: 10,
    severity: "warning",
    title: "Route overlaps another wire",
    detail: "The connection is valid, but the diagram may be harder to read.",
  },
];

function readVariant(): VariantKey {
  const query = window.location.hash.split("?")[1] ?? "";
  const value = new URLSearchParams(query).get("variant")?.toUpperCase();
  return VARIANTS.some((variant) => variant.key === value) ? (value as VariantKey) : "A";
}

export function BreadboardPrototypePage() {
  const [variant, setVariant] = useState<VariantKey>(readVariant);
  const [source, setSource] = useState(INITIAL_SOURCE);
  const [compiledSource, setCompiledSource] = useState(INITIAL_SOURCE);
  const [activeLine, setActiveLine] = useState(12);
  const [mobilePanel, setMobilePanel] = useState<"source" | "preview">("source");

  const stale = source !== compiledSource;

  useEffect(() => {
    const syncVariant = () => setVariant(readVariant());
    window.addEventListener("hashchange", syncVariant);
    return () => window.removeEventListener("hashchange", syncVariant);
  }, []);

  const selectVariant = (next: VariantKey) => {
    window.location.hash = `/breadboard?variant=${next}`;
  };

  const cycleVariant = (direction: -1 | 1) => {
    const current = VARIANTS.findIndex((item) => item.key === variant);
    selectVariant(VARIANTS[(current + direction + VARIANTS.length) % VARIANTS.length].key);
  };

  const reset = () => {
    setSource(INITIAL_SOURCE);
    setCompiledSource(INITIAL_SOURCE);
    setActiveLine(12);
  };

  const compile = () => setCompiledSource(source);

  const download = () => {
    const blob = new Blob([BREADBOARD_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "dub-siren-breadboard.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const shared = {
    source,
    setSource,
    stale,
    activeLine,
    setActiveLine,
    compile,
    reset,
    download,
    mobilePanel,
    setMobilePanel,
  };

  return (
    <main className="min-h-screen bg-[#080b0f] pb-28 text-foreground">
      {variant === "A" && <SplitWorkbench {...shared} />}
      {variant === "B" && <DiagnosticRail {...shared} />}
      {variant === "C" && <CanvasFirst {...shared} />}
      {process.env.NODE_ENV !== "production" && (
        <PrototypeSwitcher
          current={variant}
          onPrevious={() => cycleVariant(-1)}
          onNext={() => cycleVariant(1)}
        />
      )}
    </main>
  );
}

type LayoutProps = {
  source: string;
  setSource: (source: string) => void;
  stale: boolean;
  activeLine: number;
  setActiveLine: (line: number) => void;
  compile: () => void;
  reset: () => void;
  download: () => void;
  mobilePanel: "source" | "preview";
  setMobilePanel: (panel: "source" | "preview") => void;
};

function SplitWorkbench(props: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-3 py-4 sm:px-6 lg:px-8">
      <EditorHeader eyebrow="Breadboard lab / Split workbench" {...props} />
      <MobileViewToggle value={props.mobilePanel} onChange={props.setMobilePanel} />
      <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(25rem,0.85fr)]">
        <section className={cn("min-h-[34rem] overflow-hidden rounded-[1.6rem] border bg-card/80", props.mobilePanel === "preview" && "hidden lg:block")}>
          <PaneHeading icon={Code2} title="Breadboard description" meta="main.bb · autosave off" />
          <SourceEditor source={props.source} onChange={props.setSource} activeLine={props.activeLine} />
          <DiagnosticsStrip activeLine={props.activeLine} onSelect={props.setActiveLine} />
        </section>
        <section className={cn("relative min-h-[34rem] overflow-hidden rounded-[1.6rem] border bg-card/70", props.mobilePanel === "source" && "hidden lg:block")}>
          <PaneHeading icon={Sparkles} title="Canonical SVG" meta={props.stale ? "Showing last valid compile" : "Up to date"} />
          <Preview stale={props.stale} spacious />
        </section>
      </div>
    </div>
  );
}

function DiagnosticRail(props: LayoutProps) {
  return (
    <div className="mx-auto min-h-screen max-w-[1700px] px-3 py-4 sm:px-6 lg:px-8">
      <EditorHeader eyebrow="Breadboard lab / Diagnostic rail" {...props} />
      <div className="mt-4 grid min-h-[calc(100vh-8.5rem)] gap-4 lg:grid-cols-[18rem_minmax(26rem,0.92fr)_minmax(25rem,1.08fr)]">
        <aside className="order-2 rounded-[1.6rem] border bg-card/80 p-3 lg:order-1">
          <div className="mb-3 flex items-center justify-between px-2 pt-2">
            <div>
              <p className="font-display text-xl font-bold">Problems</p>
              <p className="text-xs text-muted-foreground">2 findings · ordered by source</p>
            </div>
            <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">1 error</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {DIAGNOSTICS.map((diagnostic) => (
              <DiagnosticCard key={diagnostic.code} diagnostic={diagnostic} active={props.activeLine === diagnostic.line} onSelect={props.setActiveLine} />
            ))}
          </div>
          <div className="mt-3 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            Click a finding to jump to its source line. Preview remains on the last valid compile.
          </div>
        </aside>
        <section className="order-1 min-h-[36rem] overflow-hidden rounded-[1.6rem] border bg-card/80 lg:order-2">
          <PaneHeading icon={Code2} title="Source" meta={`Line ${props.activeLine}`} />
          <SourceEditor source={props.source} onChange={props.setSource} activeLine={props.activeLine} />
        </section>
        <section className="order-3 relative min-h-[32rem] overflow-hidden rounded-[1.6rem] border bg-card/70">
          <PaneHeading icon={Sparkles} title="Diagram" meta={props.stale ? "Stale preview" : "Compiled just now"} />
          <Preview stale={props.stale} spacious />
        </section>
      </div>
    </div>
  );
}

function CanvasFirst(props: LayoutProps) {
  const [sourceOpen, setSourceOpen] = useState(true);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070a]">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:24px_24px]" />
      <header className="relative flex flex-wrap items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-7">
        <a href="#/" className="mr-auto flex items-center gap-3 no-underline">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">BB</span>
          <span>
            <span className="block font-display text-lg font-bold leading-none">Breadboard canvas</span>
            <span className="text-xs text-muted-foreground">Dub Siren course tool</span>
          </span>
        </a>
        <Button variant="ghost" size="sm" onClick={() => setSourceOpen((open) => !open)}>
          <PanelLeft data-icon="inline-start" />
          {sourceOpen ? "Hide source" : "Show source"}
        </Button>
        <ModelDialog />
        <Button variant="outline" size="sm" onClick={props.download} aria-label="Download SVG">
          <ArrowDownToLine data-icon="inline-start" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </header>
      <div className="relative flex min-h-[calc(100vh-4.2rem)]">
        <aside className={cn("absolute inset-x-3 bottom-3 z-20 max-h-[62vh] overflow-hidden rounded-[1.4rem] border bg-card/95 shadow-2xl backdrop-blur-xl transition sm:inset-y-4 sm:left-4 sm:right-auto sm:w-[31rem] sm:max-h-none", !sourceOpen && "pointer-events-none translate-y-[115%] opacity-0 sm:-translate-x-[115%] sm:translate-y-0")}>
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <Code2 />
              <span className="font-bold">main.bb</span>
            </div>
            <button className="rounded-lg p-2 hover:bg-muted" onClick={() => setSourceOpen(false)} aria-label="Close source panel"><X /></button>
          </div>
          <SourceEditor source={props.source} onChange={props.setSource} activeLine={props.activeLine} compact />
          <DiagnosticsStrip activeLine={props.activeLine} onSelect={props.setActiveLine} compact />
        </aside>
        <div className={cn("relative flex flex-1 items-center justify-center p-5 transition-all sm:p-12", sourceOpen && "sm:pl-[34rem]")}>
          <Preview stale={props.stale} canvas />
          <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] gap-2 overflow-x-auto sm:left-auto sm:right-5 sm:top-5">
            {DIAGNOSTICS.map((diagnostic) => (
              <button key={diagnostic.code} onClick={() => { props.setActiveLine(diagnostic.line); setSourceOpen(true); }} className="flex shrink-0 items-center gap-2 rounded-full border bg-background/90 px-3 py-2 text-xs font-bold shadow-xl backdrop-blur">
                {diagnostic.severity === "error" ? <CircleAlert /> : <TriangleAlert />}
                L{diagnostic.line} · {diagnostic.code}
              </button>
            ))}
          </div>
          <div className="absolute bottom-5 right-5 flex gap-2">
            {props.stale && <Button size="sm" onClick={props.compile}><RefreshCcw data-icon="inline-start" />Refresh preview</Button>}
            <Button variant="outline" size="sm" onClick={() => setSourceOpen(true)}><Code2 data-icon="inline-start" />Source</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorHeader({ eyebrow, stale, compile, reset, download }: LayoutProps & { eyebrow: string }) {
  return (
    <header className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border bg-card/75 px-4 py-3 backdrop-blur sm:px-5">
      <a href="#/" className="mr-auto flex min-w-0 items-center gap-3 no-underline">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">BB</span>
        <span className="min-w-0">
          <span className="block truncate font-display text-xl font-bold">Breadboard editor</span>
          <span className="block truncate text-xs text-muted-foreground">{eyebrow}</span>
        </span>
      </a>
      <span className={cn("hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:flex", stale ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")}>
        {stale ? <CircleDot /> : <Check />}
        {stale ? "Preview is stale" : "Up to date"}
      </span>
      <Button variant="ghost" size="sm" onClick={reset} aria-label="Reset source"><RotateCcw data-icon="inline-start" /><span className="hidden sm:inline">Reset</span></Button>
      <ModelDialog />
      <Button variant="outline" size="sm" onClick={download} aria-label="Download SVG"><ArrowDownToLine data-icon="inline-start" /><span className="hidden sm:inline">SVG</span></Button>
      {stale && <Button size="sm" onClick={compile}><RefreshCcw data-icon="inline-start" />Compile</Button>}
    </header>
  );
}

function PaneHeading({ icon: Icon, title, meta }: { icon: typeof Code2; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <Icon />
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <span className="ml-auto text-xs text-muted-foreground">{meta}</span>
    </div>
  );
}

function SourceEditor({ source, onChange, activeLine, compact = false }: { source: string; onChange: (source: string) => void; activeLine: number; compact?: boolean }) {
  const lines = source.split("\n");
  return (
    <div className={cn("relative min-h-[28rem] overflow-auto bg-[#090d13] font-mono text-[13px] leading-7", compact ? "h-[20rem] min-h-0" : "h-[calc(100%-9.5rem)]")}>
      <div aria-hidden className="pointer-events-none absolute inset-0 flex">
        <div className="w-11 shrink-0 border-r border-white/5 py-4 text-right text-slate-600">
          {lines.map((_, index) => <span key={index} className={cn("block pr-3", activeLine === index + 1 && "bg-accent/10 text-accent")}>{index + 1}</span>)}
        </div>
        <pre className="min-w-0 flex-1 whitespace-pre py-4 text-slate-200">
          {lines.map((line, index) => <span key={index} className={cn("block px-4", activeLine === index + 1 && "bg-accent/10")}><SyntaxLine line={line} />{"\n"}</span>)}
        </pre>
      </div>
      <textarea
        aria-label="Breadboard description source"
        value={source}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="absolute inset-y-0 left-11 min-h-full w-[calc(100%-2.75rem)] resize-none overflow-hidden whitespace-pre bg-transparent px-4 py-4 font-mono text-[13px] leading-7 text-transparent caret-accent outline-none selection:bg-accent/30"
      />
    </div>
  );
}

function SyntaxLine({ line }: { line: string }) {
  const parts = line.split(/("(?:[^"\\]|\\.)*"|#[0-9a-fA-F]{6}|\/\/.*$|\b(?:breadboard|chip|place|wire|route|from|to|rows|at|colour)\b|\b\d+\b)/g);
  return <>{parts.map((part, index) => {
    const className = part.startsWith('"') ? "text-amber-300" : /^\d+$/.test(part) ? "text-cyan-300" : /^(breadboard|chip|place|wire|route|from|to|rows|at|colour)$/.test(part) ? "font-semibold text-fuchsia-300" : "text-slate-300";
    return <span key={`${part}-${index}`} className={className}>{part}</span>;
  })}</>;
}

function DiagnosticsStrip({ activeLine, onSelect, compact = false }: { activeLine: number; onSelect: (line: number) => void; compact?: boolean }) {
  return (
    <div className={cn("grid gap-2 border-t bg-background/70 p-3", !compact && "sm:grid-cols-2")}>
      {DIAGNOSTICS.map((diagnostic) => (
        <DiagnosticCard key={diagnostic.code} diagnostic={diagnostic} active={activeLine === diagnostic.line} onSelect={onSelect} compact />
      ))}
    </div>
  );
}

function DiagnosticCard({ diagnostic, active, onSelect, compact = false }: { diagnostic: Diagnostic; active: boolean; onSelect: (line: number) => void; compact?: boolean }) {
  const Icon = diagnostic.severity === "error" ? CircleAlert : TriangleAlert;
  return (
    <button onClick={() => onSelect(diagnostic.line)} className={cn("group min-w-[16rem] rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:bg-muted/80", active ? "border-accent bg-accent/10" : "bg-card", compact && "min-w-0")}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 shrink-0", diagnostic.severity === "error" ? "text-destructive" : "text-accent")} />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><span>{diagnostic.code}</span><span>Line {diagnostic.line}</span></span>
          <span className="mt-1 block font-bold">{diagnostic.title}</span>
          {!compact && <span className="mt-1 block text-sm text-muted-foreground">{diagnostic.detail}</span>}
        </span>
      </div>
    </button>
  );
}

function Preview({ stale, spacious = false, canvas = false }: { stale: boolean; spacious?: boolean; canvas?: boolean }) {
  return (
    <div className={cn("relative flex h-[calc(100%-3.5rem)] min-h-[28rem] items-center justify-center overflow-hidden p-5", canvas && "h-auto min-h-0 w-full", spacious && "p-8")}>
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className={cn("relative w-full max-w-3xl overflow-hidden rounded-[1.6rem] bg-[#e7dcc4] p-3 shadow-2xl transition", stale && "opacity-55 grayscale-[.35]", canvas && "max-w-5xl")}>
        <BreadboardSvg />
        {stale && (
          <div className="absolute inset-0 grid place-items-center bg-background/20 backdrop-blur-[1px]">
            <span className="rounded-full border bg-background/90 px-4 py-2 text-sm font-bold shadow-xl">Last valid preview</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BreadboardSvg() {
  const holes = useMemo(() => Array.from({ length: 13 }, (_, row) => Array.from({ length: 10 }, (_, col) => ({ x: 66 + col * 39 + (col > 4 ? 26 : 0), y: 72 + row * 25 }))), []);
  return (
    <svg viewBox="0 0 520 390" className="h-auto w-full" role="img" aria-label="Rendered breadboard with timer chip and three routed wires">
      <defs><filter id="bb-shadow"><feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity=".18" /></filter></defs>
      <rect x="12" y="12" width="496" height="366" rx="24" fill="#f4ead7" stroke="#b9a989" strokeWidth="3" filter="url(#bb-shadow)" />
      <path d="M34 47H486M34 348H486" stroke="#f04f43" strokeWidth="5" opacity=".75" />
      <path d="M34 59H486M34 336H486" stroke="#3476d4" strokeWidth="5" opacity=".75" />
      {holes.flat().map((hole, index) => <circle key={index} cx={hole.x} cy={hole.y} r="4.8" fill="#6d6456" opacity=".64" />)}
      <rect x="207" y="120" width="108" height="142" rx="10" fill="#22262d" stroke="#090b0e" strokeWidth="3" />
      <circle cx="261" cy="134" r="8" fill="#0c0e12" />
      <text x="261" y="193" textAnchor="middle" fill="#f4ead7" fontFamily="JetBrains Mono" fontSize="16" fontWeight="700">NE555P</text>
      <text x="261" y="216" textAnchor="middle" fill="#a8b0bc" fontFamily="JetBrains Mono" fontSize="11">timer</text>
      <path d="M207 145H168V47H105" fill="none" stroke="#ff4b32" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M207 237H153V336H74" fill="none" stroke="#17191c" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M315 191H385V284H457" fill="none" stroke="#ffc529" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      {[207, 315].flatMap((x) => [145, 175, 207, 237].map((y, index) => <line key={`${x}-${y}`} x1={x === 207 ? x - 12 : x} y1={y} x2={x === 207 ? x : x + 12} y2={y} stroke="#c0b29b" strokeWidth="5" />))}
      <text x="44" y="42" fill="#cf3129" fontSize="18" fontWeight="700">+</text><text x="44" y="66" fill="#2865ba" fontSize="18" fontWeight="700">−</text>
    </svg>
  );
}

function ModelDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="ghost" size="sm" aria-label="Inspect model"><Braces data-icon="inline-start" /><span className="hidden sm:inline">Inspect model</span></Button></DialogTrigger>
      <DialogContent className="max-h-[86vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="font-display text-2xl">Compiler representations</DialogTitle>
          <DialogDescription>Read-only output from the latest compile.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ast" className="min-h-0 px-6 pb-6">
          <TabsList className="mt-4 grid w-full grid-cols-2">
            <TabsTrigger value="ast">Surface AST</TabsTrigger>
            <TabsTrigger value="model">Canonical Breadboard Model</TabsTrigger>
          </TabsList>
          <TabsContent value="ast" className="max-h-[55vh] overflow-auto rounded-xl bg-[#090d13] p-4 font-mono text-xs leading-6 text-cyan-100"><pre>{SURFACE_AST}</pre></TabsContent>
          <TabsContent value="model" className="max-h-[55vh] overflow-auto rounded-xl bg-[#090d13] p-4 font-mono text-xs leading-6 text-amber-100"><pre>{CANONICAL_MODEL}</pre></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function MobileViewToggle({ value, onChange }: { value: "source" | "preview"; onChange: (value: "source" | "preview") => void }) {
  return (
    <div className="mt-3 grid grid-cols-2 rounded-xl bg-muted p-1 lg:hidden">
      {(["source", "preview"] as const).map((panel) => <button key={panel} onClick={() => onChange(panel)} className={cn("rounded-lg px-3 py-2 text-sm font-bold capitalize", value === panel && "bg-background shadow")}>{panel}</button>)}
    </div>
  );
}

function PrototypeSwitcher({ current, onPrevious, onNext }: { current: VariantKey; onPrevious: () => void; onNext: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable]")) return;
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext, onPrevious]);

  const label = VARIANTS.find((variant) => variant.key === current)!;
  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-[#f7f0df] p-1.5 text-[#151515] shadow-2xl">
      <button onClick={onPrevious} className="grid size-10 place-items-center rounded-full hover:bg-black/10" aria-label="Previous prototype"><ArrowLeft /></button>
      <div className="min-w-[11rem] px-3 text-center text-sm font-black"><span className="text-primary">{label.key}</span> — {label.name}</div>
      <button onClick={onNext} className="grid size-10 place-items-center rounded-full hover:bg-black/10" aria-label="Next prototype"><ArrowRight /></button>
    </div>
  );
}

const SURFACE_AST = `{
  "kind": "BreadboardDocument",
  "declarations": [
    { "kind": "Breadboard", "name": "main", "rows": 30 },
    { "kind": "ChipDefinition", "name": "NE555", "span": [25, 76] },
    { "kind": "Placement", "name": "timer", "row": 12 }
  ]
}`;

const CANONICAL_MODEL = `{
  "board": { "rows": 30, "terminalColumns": 5 },
  "chips": [{ "id": "timer", "definition": "NE555", "topRow": 12 }],
  "wires": [
    { "from": "timer.8", "to": "LP4", "colour": "#ff4b32" },
    { "from": "timer.1", "to": "LG4", "colour": "#17191c" }
  ]
}`;

const BREADBOARD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 390"><rect width="520" height="390" rx="24" fill="#f4ead7"/><text x="260" y="195" text-anchor="middle" font-family="monospace">Breadboard prototype export</text></svg>`;
