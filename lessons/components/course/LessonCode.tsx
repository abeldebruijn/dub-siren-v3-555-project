import { File, type LineAnnotation } from "@pierre/diffs/react";
import { Check, Clipboard, MessageSquareOff } from "lucide-react";
import { useMemo, useState } from "react";

const code = `from picozero import LED

led = LED(15)
led.blink(on_time=0.5, off_time=0.5)`;

type LineNote = {
  body: string;
};

const notes: Record<number, LineNote> = {
  1: { body: "Make sure picozero is installed on your Pico." },
  4: { body: "Change both timing values to adjust the blink speed." },
};

export default function LessonCode() {
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const lineAnnotations = useMemo(
    () =>
      Object.entries(notes).map(([lineNumber, note]) => ({
        lineNumber: Number(lineNumber),
        metadata: note,
      })) satisfies LineAnnotation<LineNote>[],
    [],
  );

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="course-code" aria-label="MicroPython lesson code">
      <header>
        <code>main.py</code>
        <div>
          <button type="button" onClick={() => setShowNotes((value) => !value)}>
            <MessageSquareOff aria-hidden="true" /> {showNotes ? "Hide notes" : "Show notes"}
          </button>
          <button type="button" onClick={() => void copyCode()}>
            {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />} {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      </header>
      <div className="course-code__viewer">
        <File
          file={{ name: "main.py", contents: code }}
          lineAnnotations={showNotes ? lineAnnotations : []}
          renderAnnotation={showNotes ? renderLineAnnotation : undefined}
          options={{ theme: "github-dark", overflow: "scroll", disableLineNumbers: false }}
        />
      </div>
    </section>
  );
}

function renderLineAnnotation(annotation: LineAnnotation<LineNote>) {
  return annotation.metadata ? <p className="course-code__annotation">{annotation.metadata.body}</p> : null;
}
