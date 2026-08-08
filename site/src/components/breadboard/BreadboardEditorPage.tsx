import { compile, type CompileResult, type Diagnostic } from "@dub-siren/breadboard";
import {
  Braces,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  GalleryHorizontalEnd,
  LoaderCircle,
  RotateCcw,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type MutableRefObject, type ReactNode } from "react";
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
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dub-siren:breadboard-source:v2";
const LEGACY_STORAGE_KEY = "dub-siren:breadboard-source:v1";
const SHARED_SOURCE_PARAM = "source";
const COMPILE_DELAY_MS = 260;
const EDITOR_TEXT_CLASS =
  "font-mono text-[13px] font-normal leading-[26px] tracking-normal [font-variant-ligatures:none] md:text-sm md:leading-[26px]";

const STARTER_SOURCE = `breadboard Stage rows 14 columns 5
chip NE555 {
  height 4
  width 3
  color black
  pin 1 GND
  pin 3 OUT
  pin 8 VCC
} at R4

led D1 from NE555.OUT to LG10 {
  color red
  on true
}

resistor R1 from NE555.VCC to LP4 {
  value 1k
}

wire NE555.GND --> LG8 color black
annotation 1 at NE555.OUT
`;

const GALLERY_SOURCE = `breadboard Gallery rows 20 columns 5

led D1 from LP1 to LT-R2C1 {
  color red
  on true
}
led D2 from LT-R2C2 to RG2 {
  color blue
  on false
  display-legs false
}

capacitor C1 from LT-R3C2 to LT-R5C2 {
  type ceramic
  capacitance 0.1
  displayed capacitance
}
capacitor C2 from LT-R6C2 to LT-R8C2 {
  type electrolytic
  capacitance 100
  max-voltage 16
  displayed capacitance max-voltage
}
capacitor C3 from LT-R9C2 to LT-R11C2 {
  type film
}
capacitor C4 from RT-R3C2 to RT-R5C2 {
  type tantalum
}
capacitor C5 from RT-R6C2 to RT-R8C2 {
  type supercapacitor
}

resistor R1 from LT-R12C1 to RT-R12C1 {
  value 4.7k
  bands 4
}
resistor R2 from LT-R13C1 to RT-R13C1 {
  value 100k
  bands 6
}

button S1 {
  pins-per-side 2
  on true
} at R14
potentiometer P1 {
  resistance 10k
  value 0.25
} at R16 outside
switch SW1 {
  options 3
  value 2
} at R16 right outside

annotation 1 at D1.1
annotation 2 at D1.1
annotation 3 at P1.wiper
`;

const DIAGNOSTIC_SOURCE = `breadboard Errors rows 8 columns 5

resistor R1 from LP1 to LP2 {
  value 100
}
annotation 1 at Missing.1
`;

const EXAMPLES = [
  { name: "Pico starter", description: "Singleton NE555, LED, resistor, wire, annotation", source: STARTER_SOURCE },
  { name: "V0.2 gallery", description: "Every V0.2 component and outside controls", source: GALLERY_SOURCE },
  { name: "Diagnostics", description: "Intentional electrical and annotation errors", source: DIAGNOSTIC_SOURCE },
] as const;

type ValidResult = Extract<CompileResult, { status: "valid" }>;
type SelectedComponent = Readonly<{
  name: string;
  kind: string;
  markup: string;
  clientX: number;
  clientY: number;
}>;

export function BreadboardEditorPage() {
  const [source, setSource] = useState(readInitialSource);
  const [result, setResult] = useState<CompileResult>(() => compile(source));
  const [lastValid, setLastValid] = useState<ValidResult | null>(() => result.status === "valid" ? result : null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sourceOpen, setSourceOpen] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [pendingExample, setPendingExample] = useState<(typeof EXAMPLES)[number] | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    if (!parameters.has(SHARED_SOURCE_PARAM)) return;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  }, []);

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
  const inspectedComponent = selectedComponent === null
    ? null
    : displayed?.model.components.find(
      (component) => component.name === selectedComponent.name && component.kind === selectedComponent.kind,
    ) ?? null;

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    for (const component of preview.querySelectorAll<SVGGElement>("g[data-component]")) {
      const name = component.dataset.component ?? "component";
      const kind = component.dataset.kind ?? "part";
      component.tabIndex = 0;
      component.setAttribute("role", "button");
      component.setAttribute("aria-label", `Magnify ${name} ${kind}`);
    }
    setSelectedComponent(null);
  }, [displayed?.svg]);

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
    setSource(STARTER_SOURCE);
    setSelectedLine(null);
  }

  function loadPendingExample() {
    if (pendingExample === null) return;
    setSource(pendingExample.source);
    setSelectedLine(null);
    setPendingExample(null);
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

  function magnifyComponent(element: SVGGElement, clientX: number, clientY: number) {
    const name = element.dataset.component;
    const kind = element.dataset.kind;
    if (!name || !kind) return;
    const bounds = element.getBBox();
    const padding = 10;
    const clone = element.cloneNode(true) as SVGGElement;
    for (const attribute of ["aria-label", "data-component", "role", "tabindex"]) {
      clone.removeAttribute(attribute);
    }
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}" preserveAspectRatio="xMidYMid meet" overflow="visible">${clone.outerHTML}</svg>`;
    setSelectedComponent({ name, kind, markup, clientX, clientY });
  }

  function handlePreviewClick(event: MouseEvent<HTMLDivElement>) {
    const component = (event.target as Element | null)?.closest<SVGGElement>("g[data-component]");
    if (component) magnifyComponent(component, event.clientX, event.clientY);
  }

  function handlePreviewKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const component = (event.target as Element | null)?.closest<SVGGElement>("g[data-component]");
    if (!component) return;
    event.preventDefault();
    const bounds = component.getBoundingClientRect();
    magnifyComponent(component, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
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
        <a href="/pico-dub-siren/" className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-black text-white shadow-[0_0_28px_rgba(242,62,30,.24)]">BB</span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold leading-tight md:text-xl">Breadboard canvas</span>
            <span className="block truncate text-xs text-slate-400">Dub Siren course tool · Breadboard V0.2</span>
          </span>
        </a>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <Button asChild variant="ghost" size="sm" className="h-10 px-3 text-slate-200 hover:bg-white/10 hover:text-white">
            <a href="/pico-dub-siren/breadboard/docs/" aria-label="Open language documentation">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Docs</span>
            </a>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Choose source example" variant="ghost" size="sm" className="h-10 px-3 text-slate-200 hover:bg-white/10 hover:text-white">
                <GalleryHorizontalEnd className="h-4 w-4" />
                <span className="hidden md:inline">Examples</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 border-white/10 bg-[#11161d] text-slate-200">
              {EXAMPLES.map((example) => (
                <DropdownMenuItem
                  key={example.name}
                  onSelect={() => setPendingExample(example)}
                  className="items-start gap-3 py-3 focus:bg-white/10 focus:text-white"
                >
                  <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>
                    <span className="block font-bold">{example.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{example.description}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
                <AlertDialogDescription>Your locally saved source will be replaced with the working V0.2 Pico starter.</AlertDialogDescription>
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
                ref={previewRef}
                className={cn(
                  "breadboard-svg flex h-full w-full items-center justify-center transition duration-300 [&>svg]:h-full [&>svg]:max-h-full [&>svg]:w-full [&>svg]:max-w-full [&_[data-component]]:cursor-zoom-in [&_[data-component]:focus]:outline-none [&_[data-component]:focus]:drop-shadow-[0_0_5px_#67e8f9]",
                  previewIsStale && "scale-[0.985] opacity-35 grayscale-[35%]",
                )}
                dangerouslySetInnerHTML={{ __html: displayed.svg }}
                aria-label={previewIsStale ? "Stale breadboard preview" : "Breadboard preview"}
                onClick={handlePreviewClick}
                onKeyDown={handlePreviewKeyDown}
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

      <AlertDialog open={pendingExample !== null} onOpenChange={(open) => { if (!open) setPendingExample(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load {pendingExample?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current source will be replaced and the selected V0.2 example will become the locally saved version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep mine</AlertDialogCancel>
            <AlertDialogAction onClick={loadPendingExample}>Load example</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Popover open={selectedComponent !== null} onOpenChange={(open) => { if (!open) setSelectedComponent(null); }}>
        {selectedComponent ? (
          <PopoverAnchor asChild>
            <span
              aria-hidden="true"
              className="pointer-events-none fixed h-px w-px"
              style={{ left: selectedComponent.clientX, top: selectedComponent.clientY }}
            />
          </PopoverAnchor>
        ) : null}
        <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] border-white/15 bg-[#101820] p-4" side="top">
          {selectedComponent ? (
            <>
              <div className="rounded-xl bg-[#f5f2eb] p-3 [&>svg]:h-36 [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: selectedComponent.markup }} />
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{selectedComponent.name}</h2>
                <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-200">{selectedComponent.kind}</span>
              </div>
              {inspectedComponent ? (
                <pre className="mt-3 max-h-36 overflow-auto rounded-xl bg-black/30 p-3 font-mono text-[10px] leading-4 text-slate-300">{JSON.stringify(inspectedComponent, null, 2)}</pre>
              ) : null}
            </>
          ) : null}
        </PopoverContent>
      </Popover>
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

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "/" || (!event.metaKey && !event.ctrlKey) || event.altKey) return;

    event.preventDefault();
    const next = toggleLineComments(source, event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
    onChange(next.source);
    window.requestAnimationFrame(() => {
      editorRef.current?.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  }

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

      <div className="relative min-h-[18rem] flex-1 overflow-hidden bg-[#090d12]">
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
            <pre className={cn("m-0 min-w-[42rem] whitespace-pre py-4 pl-4 pr-8", EDITOR_TEXT_CLASS)}>
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
          onKeyDown={handleEditorKeyDown}
          onScroll={(event) => setScroll({ top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft })}
          aria-label="Breadboard description source"
          aria-keyshortcuts="Meta+/ Control+/"
          spellCheck={false}
          className={cn(
            "absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-16 pr-8 text-transparent caret-slate-100 outline-none selection:bg-cyan-400/25",
            EDITOR_TEXT_CLASS,
          )}
        />
      </div>

      {diagnostics.length > 0 ? (
        <div className="max-h-48 shrink-0 space-y-2 overflow-y-auto border-t border-white/10 bg-[#0b0f14] p-3">
          {diagnostics.map((diagnostic, index) => (
            <div
              key={`${diagnostic.code}-${index}`}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border p-1.5 text-left transition",
                diagnostic.severity === "error" ? "border-red-500/35" : "border-amber-400/35",
              )}
            >
              <button
                type="button"
                onClick={() => onDiagnosticClick(diagnostic)}
                className="flex min-w-0 flex-1 items-start gap-3 rounded-lg px-1.5 py-1 text-left transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {diagnostic.severity === "error" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] font-bold text-slate-300">{diagnostic.code} · line {diagnostic.range.start.line}</span>
                  <span className="mt-0.5 block text-sm text-slate-400">{diagnostic.message}</span>
                </span>
              </button>
              <DiagnosticCopyButton diagnostic={diagnostic} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type TextEdit = Readonly<{ position: number; removed: number; inserted: string }>;

function toggleLineComments(source: string, selectionStart: number, selectionEnd: number) {
  const blockStart = source.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const effectiveEnd = selectionEnd > selectionStart && source[selectionEnd - 1] === "\n" ? selectionEnd - 1 : selectionEnd;
  const nextNewline = source.indexOf("\n", effectiveEnd);
  const blockEnd = nextNewline === -1 ? source.length : nextNewline;
  const lines = source.slice(blockStart, blockEnd).split("\n");
  const nonBlankLines = lines.filter((line) => line.trim().length > 0);
  const shouldUncomment = nonBlankLines.length > 0 && nonBlankLines.every((line) => /^\s*\/\//u.test(line));
  const edits: TextEdit[] = [];
  let linePosition = blockStart;

  const nextLines = lines.map((line) => {
    if (line.trim().length === 0) {
      linePosition += line.length + 1;
      return line;
    }

    const indentation = line.match(/^\s*/u)?.[0] ?? "";
    const editPosition = linePosition + indentation.length;
    if (shouldUncomment) {
      const marker = line.slice(indentation.length).match(/^\/\/ ?/u)?.[0] ?? "//";
      edits.push({ position: editPosition, removed: marker.length, inserted: "" });
      linePosition += line.length + 1;
      return indentation + line.slice(indentation.length + marker.length);
    }

    edits.push({ position: editPosition, removed: 0, inserted: "// " });
    linePosition += line.length + 1;
    return `${indentation}// ${line.slice(indentation.length)}`;
  });

  const hasSelection = selectionStart !== selectionEnd;
  return {
    source: source.slice(0, blockStart) + nextLines.join("\n") + source.slice(blockEnd),
    selectionStart: mapOffsetThroughEdits(selectionStart, edits, hasSelection ? "left" : "right"),
    selectionEnd: mapOffsetThroughEdits(selectionEnd, edits, "right"),
  };
}

function mapOffsetThroughEdits(offset: number, edits: readonly TextEdit[], affinity: "left" | "right") {
  let delta = 0;
  for (const edit of edits) {
    if (offset < edit.position || (offset === edit.position && affinity === "left")) break;
    if (offset < edit.position + edit.removed) return edit.position + delta + edit.inserted.length;
    delta += edit.inserted.length - edit.removed;
  }
  return offset + delta;
}

type DiagnosticCopyPart = "all" | "description" | "line" | "code";

function DiagnosticCopyButton({ diagnostic }: { diagnostic: Diagnostic }) {
  const [copied, setCopied] = useState(false);

  async function copy(part: DiagnosticCopyPart) {
    const line = diagnostic.range.start.line;
    const text = part === "description"
      ? diagnostic.message
      : part === "line"
        ? `line ${line}`
        : part === "code"
          ? diagnostic.code
          : `${diagnostic.code} · line ${line}\n${diagnostic.message}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const buttonClass = "h-8 border border-white/15 bg-white/[0.04] px-2.5 text-xs font-bold text-slate-300 shadow-none hover:translate-y-0 hover:bg-white/10 hover:text-white active:translate-y-0 active:shadow-none";

  return (
    <ButtonGroup className="shrink-0 self-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={buttonClass}
        aria-label={copied ? "Diagnostic copied" : "Copy diagnostic"}
        onClick={() => void copy("all")}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className={cn(buttonClass, "w-8 px-0")} aria-label="Choose diagnostic part to copy">
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-white/10 bg-[#11161d] text-slate-200">
          <DropdownMenuItem onSelect={() => void copy("description")} className="focus:bg-white/10 focus:text-white">
            Error description
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void copy("line")} className="focus:bg-white/10 focus:text-white">
            Line
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void copy("code")} className="focus:bg-white/10 focus:text-white">
            Error code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
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
  const matcher = /(\/\/.*$|#[0-9a-f]{6}\b|\b(?:breadboard|rows|columns|chip|height|width|color|pin|place|at|flip|led|capacitor|resistor|button|potentiometer|switch|annotation|from|to|type|capacitance|max-voltage|displayed|bands|pins-per-side|on|display-legs|resistance|value|options|outside|left|right|wire|via|saturation)\b|\b(?:true|false|ceramic|electrolytic|film|tantalum|supercapacitor|black|red|brown|orange|yellow|green|forest|blue|cyan|purple|grey|white)\b|-->|\b(?:\d+(?:\.\d+)?(?:[kKmM]|%)?|R\d+|LP\d*|LG\d*|RP\d*|RG\d*|LT-R\d+C\d*|RT-R\d+C\d*)\b|[{}|,.])/giu;
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
          : /^(?:\d|R\d+|LP|LG|RP|RG|LT-|RT-)/iu.test(token)
            ? "text-cyan-300"
            : /^(?:true|false|ceramic|electrolytic|film|tantalum|supercapacitor|black|red|brown|orange|yellow|green|forest|blue|cyan|purple|grey|white)$/iu.test(token)
              ? "text-amber-300"
              : "text-fuchsia-300";
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
    const sharedSource = new URLSearchParams(window.location.search).get(SHARED_SOURCE_PARAM);
    if (sharedSource !== null) {
      window.localStorage.setItem(STORAGE_KEY, sharedSource);
      return sharedSource;
    }
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current !== null) return current;
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy !== null) {
      window.localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
    return STARTER_SOURCE;
  } catch {
    return STARTER_SOURCE;
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
