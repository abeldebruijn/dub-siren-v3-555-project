import { Check, Clipboard, MessageSquareOff } from "lucide-react";
import { useState } from "react";

const code = `from picozero import LED

led = LED(15)
led.blink(on_time=0.5, off_time=0.5)`;

export default function LessonCode() {
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);

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
      <pre><code><span><b>from</b> picozero <b>import</b> LED</span>{"\n\n"}<span>led = LED(<em>15</em>)</span>{"\n"}<span>led.blink(on_time=<em>0.5</em>, off_time=<em>0.5</em>)</span></code></pre>
      {showNotes ? (
        <div className="course-code__notes">
          <p><strong>Line 1</strong> Make sure <code>picozero</code> is installed on your Pico.</p>
          <p><strong>Line 4</strong> Change both timing values to adjust the blink speed.</p>
        </div>
      ) : null}
    </section>
  );
}
