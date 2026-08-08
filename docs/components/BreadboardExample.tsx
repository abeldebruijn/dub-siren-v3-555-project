import { compile, type Diagnostic } from "@dub-siren/breadboard";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Code2,
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

const PLAYGROUND_PATH = "/dub-siren-v3-555-project/";

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
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => compile(source), [source]);
  const lineCount = source.split("\n").length;
  const editorStyle = { "--bb-lines": lineCount } as CSSProperties;
  const playgroundHref = useMemo(
    () => `${PLAYGROUND_PATH}?${new URLSearchParams({ source }).toString()}#/breadboard`,
    [source],
  );

  async function copySvg() {
    if (result.status !== "valid") return;
    await copyText(result.svg);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
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
            <span className="bb-example__panel-title">
              <Code2 aria-hidden="true" /> Editable source
            </span>
            <div className="bb-example__actions">
              <button type="button" onClick={() => setSource(initialSource.trimStart())}>
                <RotateCcw aria-hidden="true" /> Reset
              </button>
              <a href={playgroundHref}>
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
            <span className="bb-example__panel-title">
              <span className="bb-example__circuit-mark" aria-hidden="true">⌁</span>
              Compiler output
            </span>
            <div className="bb-example__actions bb-example__actions--output">
              <CompileStatus diagnostics={result.diagnostics} valid={result.status === "valid"} />
              <button
                type="button"
                onClick={() => void copySvg()}
                disabled={result.status !== "valid"}
                aria-label={copied ? "SVG copied" : "Copy SVG to clipboard"}
              >
                {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
                {copied ? "Copied" : "Copy SVG"}
              </button>
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
  const matcher = /(\/\/.*$|#[0-9a-f]{6}\b|\b(?:breadboard|rows|columns|chip|height|width|color|pin|place|at|flip|wire|via|saturation)\b|-->|\b(?:R\d+|\d+%?|LP\d*|LG\d*|RP\d*|RG\d*|LT-R\d+C\d*|RT-R\d+C\d*|R\d+C\d*)\b|[{}|,.])/giu;
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
          : /^(?:\d+%?|R\d+|LP|LG|RP|RG|LT-|RT-)/iu.test(token)
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
