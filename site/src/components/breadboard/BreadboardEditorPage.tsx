import { compile, type CompileResult, type Diagnostic } from "@dub-siren/breadboard";
import {
  Braces,
  Check,
  Code2,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  LoaderCircle,
  RotateCcw,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dub-siren:breadboard-source:v1";
const COMPILE_DELAY_MS = 260;

const EXAMPLE_SOURCE = `breadboard Stage rows 14 columns 5
chip NE555 {
  height 4
  width 3
  color black
  pin 1 GND
  pin 3 OUT
  pin 8 VCC
}
place timer NE555 at R5
wire timer.VCC --> LP4 color red
wire timer.GND --> LG10 color black
wire timer.OUT --> RT-R8C3 color yellow
`;

type ValidResult = Extract<CompileResult, { status: "valid" }>;

export function BreadboardEditorPage() {
  const [source, setSource] = useState(readInitialSource);
  const [result, setResult] = useState<CompileResult>(() => compile(readInitialSource()));
  const [lastValid, setLastValid] = useState<ValidResult | null>(() => {
    const initial = compile(readInitialSource());
    return initial.status === "valid" ? initial : null;
  });
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sourceOpen, setSourceOpen] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setIsCompiling(true);
    setIsSaved(false);
    const timer = window.setTimeout(() => {
      try {
        const next = compile(source);
        setResult(next);
        if (next.status === "valid") setLastValid(next);
      } finally {
        window.localStorage.setItem(STORAGE_KEY, source);
        setIsCompiling(false);
        setIsSaved(true);
      }
    }, COMPILE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [source]);

  const currentValid = !isCompiling && result.status === "valid" ? result : null;
  const displayed = currentValid ?? lastValid;
  const previewIsStale = displayed !== null && currentValid === null;
  const diagnostics = result.diagnostics;

  function jumpToDiagnostic(diagnostic: Diagnostic) {
    setSourceOpen(true);
    setSelectedLine(diagnostic.range.start.line);
    window.setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const start = offsetAt(source, diagnostic.range.start.line, diagnostic.range.start.column);
      const end = offsetAt(source, diagnostic.range.end.line, diagnostic.range.end.column);
      editor.focus();
      editor.setSelectionRange(start, Math.max(start, end));
      const lineHeight = 26;
      editor.scrollTop = Math.max(0, (diagnostic.range.start.line - 3) * lineHeight);
    }, 80);
  }

  function resetSource() {
    setSource(EXAMPLE_SOURCE);
    setSelectedLine(null);
  }

  function downloadSvg() {
    if (!currentValid) return;
    const blob = new Blob([currentValid.svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${currentValid.model.board.name ?? "breadboard"}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const editor = (
    <SourceEditor
      diagnostics={diagnostics}
      editorRef={editorRef}
      isSaved={isSaved}
      onChange={setSource}
      onDiagnosticClick={jumpToDiagnostic}
      selectedLine={selectedLine}
      showHeader={isDesktop}
      source={source}
    />
  );

  return (
    <main className="breadboard-lab flex h-dvh min-h-[34rem] flex-col overflow-hidden bg-[#080b0f] text-slate-100">
      <header className="relative z-30 flex min-h-16 flex-wrap items-center gap-3 border-b border-white/10 bg-[#090c10]/95 px-3 py-3 backdrop-blur md:px-5">
        <a href="#/" className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-white shadow-[0_0_28px_rgba(242,62,30,.24)]">BB</span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold leading-tight md:text-xl">Breadboard canvas</span>
            <span className="block truncate text-xs text-slate-400">Dub Siren course tool</span>
          </span>
        </a>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 px-3 text-slate-200 hover:bg-white/10 hover:text-white"
            onClick={() => setSourceOpen((value) => !value)}
            aria-pressed={sourceOpen}
            aria-label={sourceOpen ? "Hide source" : "Open source"}
          >
            {sourceOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">{sourceOpen ? "Hide source" : "Source"}</span>
          </Button>

          <ModelDialog result={result} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button aria-label="Reset source" variant="ghost" size="sm" className="h-10 px-3 text-slate-200 hover:bg-white/10 hover:text-white">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden lg:inline">Reset</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset the breadboard source?</AlertDialogTitle>
                <AlertDialogDescription>Your locally saved source will be replaced with the working NE555 example.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep mine</AlertDialogCancel>
                <AlertDialogAction onClick={resetSource}>Reset example</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            aria-label="Download SVG"
            variant="ghost"
            size="sm"
            className="h-10 px-3 text-slate-200 hover:bg-white/10 hover:text-white"
            disabled={!currentValid}
            onClick={downloadSvg}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-0 flex-1 overflow-hidden">
        {isDesktop && sourceOpen ? (
          <aside className="relative z-20 w-[min(31rem,42vw)] shrink-0 border-r border-white/10 bg-[#0b0f14]/98 shadow-[22px_0_70px_rgba(0,0,0,.35)]">
            {editor}
          </aside>
        ) : null}

        <div className="breadboard-stage relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

          <div className="absolute inset-x-0 top-0 z-10 flex items-start gap-2 overflow-x-auto p-3 md:justify-end md:p-5">
            <StatusChip isCompiling={isCompiling} result={result} stale={previewIsStale} />
            {diagnostics.map((diagnostic, index) => (
              <button
                key={`${diagnostic.code}-${diagnostic.range.start.line}-${index}`}
                type="button"
                onClick={() => jumpToDiagnostic(diagnostic)}
                className={cn(
                  "pointer-events-auto flex shrink-0 items-center gap-2 rounded-full border bg-[#0b0f14]/95 px-3 py-2 font-mono text-[11px] font-bold shadow-lg backdrop-blur transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500",
                  diagnostic.severity === "error" ? "border-red-500/55 text-red-100" : "border-amber-400/55 text-amber-100",
                )}
              >
                {diagnostic.severity === "error" ? <XCircle className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
                L{diagnostic.range.start.line} · {diagnostic.code}
              </button>
            ))}
            {result.status === "unsupported" ? (
              <span className="flex shrink-0 items-center gap-2 rounded-full border border-red-400/45 bg-[#0b0f14]/95 px-3 py-2 text-xs font-bold text-red-100 shadow-lg backdrop-blur">
                <XCircle className="h-4 w-4" /> {result.reason.message}
              </span>
            ) : null}
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-4 pb-20 pt-24 md:px-10 md:pb-10">
            {displayed ? (
              <div
                className={cn(
                  "breadboard-svg flex h-full w-full items-center justify-center transition duration-300 [&>svg]:h-full [&>svg]:max-h-full [&>svg]:w-full [&>svg]:max-w-full",
                  previewIsStale && "scale-[0.985] opacity-35 grayscale-[35%]",
                )}
                dangerouslySetInnerHTML={{ __html: displayed.svg }}
                aria-label={previewIsStale ? "Stale breadboard preview" : "Breadboard preview"}
              />
            ) : (
              <div className="max-w-md rounded-3xl border border-dashed border-white/20 bg-black/25 p-8 text-center backdrop-blur">
                <TriangleAlert className="mx-auto mb-4 h-8 w-8 text-amber-300" />
                <h2 className="font-display text-2xl font-bold">No valid diagram yet</h2>
                <p className="mt-2 text-sm text-slate-400">Open the source and resolve the highlighted diagnostics. The canvas will recover after the next valid compile.</p>
              </div>
            )}
          </div>

          {!isDesktop && !sourceOpen ? (
            <Button
              className="absolute bottom-5 right-4 z-20 h-12 bg-[#f4eee0] text-[#111318] shadow-[0_10px_30px_rgba(0,0,0,.45)] hover:bg-white"
              onClick={() => setSourceOpen(true)}
            >
              <Code2 className="h-4 w-4" /> Source
            </Button>
          ) : null}
        </div>
      </section>

      {!isDesktop ? (
        <Sheet open={sourceOpen} onOpenChange={setSourceOpen}>
          <SheetContent className="h-[88dvh] bg-[#0b0f14]">
            <SheetHeader>
              <SheetTitle>main.bb</SheetTitle>
              <SheetDescription>{isSaved ? "Saved locally" : "Saving…"} · compilation runs after a short pause.</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1">{editor}</div>
          </SheetContent>
        </Sheet>
      ) : null}
    </main>
  );
}

function SourceEditor({
  source,
  diagnostics,
  selectedLine,
  showHeader,
  isSaved,
  onChange,
  onDiagnosticClick,
  editorRef,
}: {
  source: string;
  diagnostics: readonly Diagnostic[];
  selectedLine: number | null;
  showHeader: boolean;
  isSaved: boolean;
  onChange: (source: string) => void;
  onDiagnosticClick: (diagnostic: Diagnostic) => void;
  editorRef: MutableRefObject<HTMLTextAreaElement | null>;
}) {
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const lines = useMemo(() => source.split("\n"), [source]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showHeader ? (
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <FileCode2 className="h-5 w-5 text-cyan-300" />
          <div>
            <h2 className="font-display text-lg font-bold">main.bb</h2>
            <p className="text-xs text-slate-500">{isSaved ? "Saved locally" : "Saving…"}</p>
          </div>
        </div>
      ) : null}

      <div className="relative min-h-[18rem] flex-1 overflow-hidden bg-[#090d12] font-mono text-[13px] leading-[26px] md:text-sm">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="flex min-w-max"
            style={{ transform: `translate(${-scroll.left}px, ${-scroll.top}px)` }}
          >
            <div className="sticky left-0 z-10 w-12 shrink-0 border-r border-white/5 bg-[#090d12] py-4 text-right text-slate-600">
              {lines.map((_, index) => (
                <div key={index} className="h-[26px] pr-3">{index + 1}</div>
              ))}
            </div>
            <pre className="m-0 min-w-[42rem] whitespace-pre py-4 pl-4 pr-8">
              {lines.map((line, index) => (
                <span
                  key={index}
                  className={cn(
                    "block h-[26px]",
                    selectedLine === index + 1 && "bg-amber-300/10",
                    diagnostics.some((diagnostic) => diagnostic.range.start.line === index + 1 && diagnostic.severity === "error") && "bg-red-500/8",
                  )}
                >
                  {highlightLine(line)}{"\n"}
                </span>
              ))}
            </pre>
          </div>
        </div>
        <textarea
          ref={editorRef}
          data-breadboard-editor
          value={source}
          onChange={(event) => onChange(event.target.value)}
          onScroll={(event) => setScroll({ top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft })}
          aria-label="Breadboard description source"
          spellCheck={false}
          className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-16 pr-8 font-mono text-[13px] leading-[26px] text-transparent caret-slate-100 outline-none selection:bg-cyan-400/25 md:text-sm"
        />
      </div>

      {diagnostics.length > 0 ? (
        <div className="max-h-48 shrink-0 space-y-2 overflow-y-auto border-t border-white/10 bg-[#0b0f14] p-3">
          {diagnostics.map((diagnostic, index) => (
            <button
              type="button"
              key={`${diagnostic.code}-${index}`}
              onClick={() => onDiagnosticClick(diagnostic)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-orange-500",
                diagnostic.severity === "error" ? "border-red-500/35" : "border-amber-400/35",
              )}
            >
              {diagnostic.severity === "error" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}
              <span className="min-w-0">
                <span className="block font-mono text-[11px] font-bold text-slate-300">{diagnostic.code} · line {diagnostic.range.start.line}</span>
                <span className="mt-0.5 block text-sm text-slate-400">{diagnostic.message}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ModelDialog({ result }: { result: CompileResult }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-label="Inspect model" variant="ghost" size="sm" className="h-10 px-3 text-slate-200 hover:bg-white/10 hover:text-white">
          <Braces className="h-4 w-4" />
          <span className="hidden lg:inline">Inspect model</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)] bg-[#0b0f14]">
        <DialogHeader>
          <DialogTitle>Compiler state</DialogTitle>
          <DialogDescription>Recoverable source structure and resolved physical breadboard state from the latest compile.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ast" className="min-h-0 overflow-hidden">
          <TabsList>
            <TabsTrigger value="ast">Surface AST</TabsTrigger>
            <TabsTrigger value="model">Canonical model</TabsTrigger>
          </TabsList>
          <TabsContent value="ast" className="h-[min(62vh,38rem)] overflow-auto rounded-2xl border bg-black/30 p-4">
            <JsonPanel value={result.ast} />
          </TabsContent>
          <TabsContent value="model" className="h-[min(62vh,38rem)] overflow-auto rounded-2xl border bg-black/30 p-4">
            {result.status === "valid" ? <JsonPanel value={result.model} /> : <p className="p-4 text-sm text-slate-400">Canonical model unavailable until the source compiles without errors.</p>}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function JsonPanel({ value }: { value: unknown }) {
  return <pre className="min-w-max whitespace-pre font-mono text-xs leading-5 text-cyan-100">{JSON.stringify(value, null, 2)}</pre>;
}

function StatusChip({ isCompiling, result, stale }: { isCompiling: boolean; result: CompileResult; stale: boolean }) {
  const content = isCompiling
    ? { icon: <LoaderCircle className="h-4 w-4 animate-spin" />, label: "Compiling", className: "border-cyan-400/40 text-cyan-100" }
    : result.status === "valid"
      ? { icon: <Check className="h-4 w-4" />, label: "Live", className: "border-emerald-400/40 text-emerald-100" }
      : stale
        ? { icon: <TriangleAlert className="h-4 w-4" />, label: "Preview stale", className: "border-amber-400/45 text-amber-100" }
        : { icon: <XCircle className="h-4 w-4" />, label: result.status === "unsupported" ? "Too large" : "Invalid", className: "border-red-400/45 text-red-100" };
  return (
    <span className={cn("flex shrink-0 items-center gap-2 rounded-full border bg-[#0b0f14]/95 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur", content.className)}>
      {content.icon}{content.label}
    </span>
  );
}

function highlightLine(line: string) {
  const matcher = /(\/\/.*$|#[0-9a-f]{6}\b|\b(?:breadboard|rows|columns|chip|height|width|color|pin|place|at|flip|wire|via|saturation)\b|-->|\b(?:R\d+|\d+%?|LP\d+|LG\d+|RP\d+|RG\d+|LT-R\d+C\d+|RT-R\d+C\d+)\b|[{}|,.])/giu;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(matcher)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(line.slice(cursor, index));
    const token = match[0];
    const className = token.startsWith("//")
      ? "text-slate-600"
      : token === "-->" || /^[{}|,.]$/u.test(token)
        ? "text-slate-400"
        : token.startsWith("#")
          ? "text-amber-300"
          : /^(?:\d+%?|R\d+|LP\d+|LG\d+|RP\d+|RG\d+|LT-|RT-)/iu.test(token)
            ? "text-cyan-300"
            : "font-semibold text-fuchsia-300";
    parts.push(<span className={className} key={`${index}-${token}`}>{token}</span>);
    cursor = index + token.length;
  }
  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts.length > 0 ? parts : " ";
}

function offsetAt(source: string, line: number, column: number) {
  const lines = source.split("\n");
  let offset = 0;
  for (let index = 0; index < Math.max(0, line - 1); index += 1) offset += (lines[index]?.length ?? 0) + 1;
  return Math.min(source.length, offset + Math.max(0, column - 1));
}

function readInitialSource() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EXAMPLE_SOURCE;
  } catch {
    return EXAMPLE_SOURCE;
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
