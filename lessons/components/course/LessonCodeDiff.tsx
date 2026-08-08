import { parseDiffFromFile } from "@pierre/diffs";
import { FileDiff } from "@pierre/diffs/react";
import { Check, Clipboard } from "lucide-react";
import { useMemo, useState } from "react";

const before = `from picozero import LED

led = LED(15)
led.blink(on_time=0.5, off_time=0.5)
`;

const after = `from picozero import Button, LED

led = LED(15)
button = Button(14)

button.when_pressed = led.on
button.when_released = led.off
`;

export default function LessonCodeDiff() {
  return <CodeDiffPanel before={before} after={after} label="Changes to main.py for the momentary button" />;
}

export function CodeDiffPanel({ before, after, label }: { before: string; after: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const fileDiff = useMemo(
    () => parseDiffFromFile({ name: "main.py", contents: before }, { name: "main.py", contents: after }),
    [before, after],
  );

  async function copyCode() {
    await navigator.clipboard.writeText(after);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="course-code course-code--diff" aria-label={label}>
      <header>
        <div className="course-diff-title">
          <code>main.py</code>
          <span><i aria-hidden="true" /> Added <i aria-hidden="true" /> Removed</span>
        </div>
        <button type="button" onClick={() => void copyCode()}>
          {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
          {copied ? "Copied" : "Copy new code"}
        </button>
      </header>
      <div className="course-code__viewer">
        <FileDiff
          fileDiff={fileDiff}
          options={{
            theme: "github-dark",
            diffStyle: "unified",
            diffIndicators: "bars",
            disableFileHeader: true,
            disableLineNumbers: false,
            overflow: "scroll",
          }}
        />
      </div>
    </section>
  );
}
