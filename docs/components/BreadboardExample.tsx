import { compile, type Diagnostic } from "@dub-siren/breadboard";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  FileCode2,
  Image as ImageIcon,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type UIEvent,
} from "react";

const PLAYGROUND_PATH = "/pico-dub-siren/breadboard/playground/";

export default function BreadboardExample({
  source: initialSource,
  tip,
  label = "Breadboard example",
}: {
  source: string;
  tip?: string;
  label?: string;
}) {
  const [source, setSource] = useState(initialSource.trimStart());
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const [copiedAs, setCopiedAs] = useState<"svg" | "source" | "png" | null>(null);
  const result = useMemo(() => compile(source), [source]);
  const lineCount = source.split("\n").length;
  const editorStyle = { "--bb-lines": lineCount } as CSSProperties;
  const playgroundHref = useMemo(
    () => `${PLAYGROUND_PATH}?${new URLSearchParams({ source }).toString()}`,
    [source],
  );

  async function copySvgImage() {
    if (result.status !== "valid") return;
    await copySvgToClipboard(result.svg);
    showCopied("svg");
  }

  async function copySvgSource() {
    if (result.status !== "valid") return;
    await copyText(result.svg);
    showCopied("source");
  }

  async function copyPng() {
    if (result.status !== "valid") return;
    await copyBlob(await svgToPng(result.svg));
    showCopied("png");
  }

  function showCopied(format: "svg" | "source" | "png") {
    setCopiedAs(format);
    window.setTimeout(() => setCopiedAs(null), 1600);
  }

  function handleScroll(event: UIEvent<HTMLTextAreaElement>) {
    setScroll({
      left: event.currentTarget.scrollLeft,
      top: event.currentTarget.scrollTop,
    });
  }

  return (
    <section className="bb-example" aria-label={label}>
      <div className="bb-example__grid">
        <div className="bb-example__source">
          <header className="bb-example__toolbar bb-example__toolbar--dark">
            <span className="bb-example__panel-title">code</span>
            <div className="bb-example__actions">
              <button className="bb-example__control" type="button" onClick={() => setSource(initialSource.trimStart())}>
                <RotateCcw aria-hidden="true" /> Reset
              </button>
              <a className="bb-example__control" href={playgroundHref}>
                Open in playground <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </header>

          <div className="bb-editor" style={editorStyle}>
            <pre
              className="bb-editor__highlight"
              aria-hidden="true"
              style={{ transform: `translate(${-scroll.left}px, ${-scroll.top}px)` }}
            >
              {source.split("\n").map((line, index) => (
                <span className="bb-editor__line" key={index}>
                  {highlightLine(line)}{"\n"}
                </span>
              ))}
            </pre>
            <textarea
              aria-label={`${label} source`}
              value={source}
              onChange={(event) => setSource(event.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
            />
          </div>

          {tip ? <p className="bb-example__tip"><strong>Try it:</strong> {tip}</p> : null}
        </div>

        <div className="bb-example__output">
          <header className="bb-example__toolbar">
            <span className="bb-example__panel-title">output</span>
            <div className="bb-example__actions bb-example__actions--output">
              <CompileStatus diagnostics={result.diagnostics} valid={result.status === "valid"} />
              <div className="bb-example__copy-split">
                <button
                  className="bb-example__copy-primary"
                  type="button"
                  onClick={() => void copySvgImage()}
                  disabled={result.status !== "valid"}
                  aria-label="Copy as SVG image"
                >
                  {copiedAs ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
                  {copiedAs ? "Copied" : "Copy"}
                </button>
                <details className="bb-example__copy-menu">
                  <summary
                    aria-label="More copy options"
                    aria-disabled={result.status !== "valid"}
                    onClick={(event) => {
                      if (result.status !== "valid") event.preventDefault();
                    }}
                  >
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <div className="bb-example__copy-menu-popover">
                    <button
                      type="button"
                      onClick={(event) => {
                        void copySvgSource();
                        event.currentTarget.closest("details")?.removeAttribute("open");
                      }}
                    >
                      <FileCode2 aria-hidden="true" /> Copy as source
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        void copyPng();
                        event.currentTarget.closest("details")?.removeAttribute("open");
                      }}
                    >
                      <ImageIcon aria-hidden="true" /> Copy as PNG
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </header>

          {result.status === "valid" ? (
            <div
              className="bb-example__preview"
              dangerouslySetInnerHTML={{ __html: result.svg }}
              aria-label={`${label} compiled breadboard`}
            />
          ) : (
            <DiagnosticPanel diagnostics={result.diagnostics} />
          )}
        </div>
      </div>
    </section>
  );
}

function CompileStatus({
  diagnostics,
  valid,
}: {
  diagnostics: readonly Diagnostic[];
  valid: boolean;
}) {
  if (valid && diagnostics.length === 0) {
    return <span className="bb-example__status bb-example__status--valid"><Check aria-hidden="true" /> Compiled</span>;
  }
  const errors = diagnostics.filter(({ severity }) => severity === "error").length;
  return (
    <span className={`bb-example__status ${valid ? "bb-example__status--warning" : "bb-example__status--error"}`}>
      <TriangleAlert aria-hidden="true" />
      {errors > 0 ? `${errors} issue${errors === 1 ? "" : "s"}` : `${diagnostics.length} warning${diagnostics.length === 1 ? "" : "s"}`}
    </span>
  );
}

function DiagnosticPanel({ diagnostics }: { diagnostics: readonly Diagnostic[] }) {
  return (
    <div className="bb-example__diagnostics">
      <TriangleAlert aria-hidden="true" />
      <div>
        <h3>The compiler needs a small fix</h3>
        <ul>
          {diagnostics.map((diagnostic, index) => (
            <li key={`${diagnostic.code}-${index}`}>
              <strong>L{diagnostic.range.start.line} · {diagnostic.code}</strong>
              <span>{diagnostic.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function highlightLine(line: string) {
  const matcher = /(\/\/.*$|#[0-9a-f]{6}\b|\b(?:breadboard|rows|columns|chip|height|width|color|pin|place|at|flip|led|capacitor|resistor|button|potentiometer|switch|annotation|from|to|type|capacitance|max-voltage|displayed|bands|pins-per-side|on|display-legs|resistance|value|options|outside|left|right|wire|via|saturation)\b|\b(?:true|false|ceramic|electrolytic|film|tantalum|supercapacitor|black|red|brown|orange|yellow|green|forest|blue|cyan|purple|grey|white)\b|-->|\b(?:\d+(?:\.\d+)?(?:[kKmM]|%)?|R\d+|LP\d*|LG\d*|RP\d*|RG\d*|LT-R\d+C\d*|RT-R\d+C\d*|R\d+C\d*)\b|[{}|,.])/giu;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(matcher)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(line.slice(cursor, index));
    const token = match[0];
    const className = token.startsWith("//")
      ? "bb-token-comment"
      : token === "-->" || /^[{}|,.]$/u.test(token)
        ? "bb-token-punctuation"
        : token.startsWith("#")
          ? "bb-token-color"
          : /^(?:\d|R\d+|LP|LG|RP|RG|LT-|RT-)/iu.test(token)
            ? "bb-token-coordinate"
            : "bb-token-keyword";
    parts.push(<span className={className} key={`${index}-${token}`}>{token}</span>);
    cursor = index + token.length;
  }
  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts.length > 0 ? parts : " ";
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function copySvgToClipboard(svg: string) {
  const svgBlob = new Blob([svg], { type: "image/svg+xml" });
  if (typeof ClipboardItem !== "undefined" && ClipboardItem.supports?.("image/svg+xml")) {
    await navigator.clipboard.write([new ClipboardItem({ "image/svg+xml": svgBlob })]);
    return;
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([svg], { type: "text/html" }),
      "text/plain": new Blob([svg], { type: "text/plain" }),
    }),
  ]);
}

async function copyBlob(blob: Blob) {
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}

async function svgToPng(svg: string): Promise<Blob> {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  const viewBox = root.getAttribute("viewBox")?.split(/\s+/u).map(Number);
  const width = Number.parseFloat(root.getAttribute("width") ?? "") || viewBox?.[2] || 800;
  const height = Number.parseFloat(root.getAttribute("height") ?? "") || viewBox?.[3] || 450;
  const scale = 2;
  const canvas = window.document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new window.Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not render SVG"));
      image.src = url;
    });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create PNG")), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
