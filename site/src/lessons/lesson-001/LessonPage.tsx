import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { CodeLesson } from "@/components/course/CodeLesson";
import { DoneChecklist } from "@/components/course/DoneChecklist";
import { lessons } from "@/lessons";
import { cn } from "@/lib/utils";
import { lessonOneCode, lessonOneLineNotes } from "./code";
import { lessonOneContent } from "./content";

const pathSteps = ["GP15", "resistor", "LED", "GND"];

export function LessonOnePage() {
  const lesson = lessons[0];

  return (
    <div className="lesson-flow">
      <section className="lesson-intro-grid">
        <div className="lesson-intro-copy lesson-prose">
          <p className="lesson-kicker">Today’s win</p>
          <h2>Make the invisible visible</h2>
          <p>
            The Pico switches a physical LED on and off. Later, the same idea becomes the visible pulse for the dub siren’s modulation rate.
          </p>
          <p>
            Build slowly: unplug USB before wiring changes, use a resistor, and trace one complete electrical path before running code.
          </p>
        </div>
      </section>

      <section className="lesson-section lesson-prose">
        <h2>1. Gather only these parts</h2>
        <ul>
          {lessonOneContent.parts.map((part) => (
            <li key={part}>{part}</li>
          ))}
        </ul>
        <p>
          Every item here is compatible with your Raspberry Pi Pico setup. For the LED, use the <strong>1 kΩ</strong> resistor first. It is cautious and safe for a beginner test.
        </p>
      </section>

      <section className="lesson-section lesson-prose">
        <h2>2. Build one complete path</h2>
        <p>
          Unplug USB. The LED only works when current can travel from a Pico output, through the resistor and LED, then back to ground.
        </p>
        <CircuitPathDiagram />
      </section>

      <section className="lesson-section lesson-prose">
        <h2>3. Put the rhythm on the Pico</h2>
        <p>
          Run this as <code>main.py</code>. The notes under the code point out the two lines worth checking before you run it.
        </p>
        <CodeLesson code={lessonOneCode} fileName="main.py" lineNotes={lessonOneLineNotes} />
      </section>

      <section className="lesson-section lesson-prose">
        <h2>4. Test the idea</h2>
        <ol>
          <li>The LED should stay on for half a second, then off for half a second.</li>
          <li>Change both <code>0.5</code> values to <code>0.1</code>.</li>
          <li>Predict what should happen before saving the file.</li>
          <li>Save, watch the real LED, then compare it with the simulator above.</li>
        </ol>
        <p>
          If both values are <code>0.1</code>, one full cycle is <code>0.1 + 0.1 = 0.2</code> seconds. That makes five complete blinks per second.
        </p>
        <BlinkSimulator />
      </section>

      <DoneChecklist lesson={lesson} items={lesson.doneItems} />
    </div>
  );
}

function BlinkSimulator() {
  const [onTime, setOnTime] = useState(0.5);
  const [offTime, setOffTime] = useState(0.5);
  const [isOn, setIsOn] = useState(true);
  const cycle = onTime + offTime;
  const blinksPerSecond = useMemo(() => (1 / cycle).toFixed(1), [cycle]);

  useEffect(() => {
    const delay = (isOn ? onTime : offTime) * 1000;
    const timeout = window.setTimeout(() => setIsOn((value) => !value), delay);
    return () => window.clearTimeout(timeout);
  }, [isOn, offTime, onTime]);

  return (
    <div className="blink-simulator">
      <h2 className="mb-6 flex items-center gap-2 font-display text-3xl font-bold text-white">
        <Activity className="h-5 w-5 text-accent" />
        Blink simulator
      </h2>
      <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <div className="led-stage flex items-center justify-center">
          <div
            className={cn(
              "h-28 w-28 rounded-full border-8 border-red-950 transition-all duration-150",
              isOn ? "bg-red-500 shadow-[0_0_55px_rgba(239,68,68,0.95)]" : "bg-red-950 shadow-none",
            )}
            aria-label={isOn ? "LED on" : "LED off"}
          />
        </div>

        <div className="space-y-5">
          <TimeSlider label="on_time" value={onTime} onChange={setOnTime} />
          <TimeSlider label="off_time" value={offTime} onChange={setOffTime} />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-sm text-stone-300">cycle = on_time + off_time</p>
            <p className="mt-2 text-2xl font-bold">
              {cycle.toFixed(1)}s cycle · {blinksPerSecond} blinks/s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between font-mono text-sm">
        <span>{label}</span>
        <span>{value.toFixed(1)}s</span>
      </span>
      <input
        className="w-full accent-[hsl(var(--accent))]"
        type="range"
        min="0.1"
        max="1.5"
        step="0.1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function CircuitPathDiagram() {
  return (
    <div className="static-path-diagram mt-8">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">One complete current path</p>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
          {pathSteps.map((label, index) => (
            <div
              key={label}
              className="contents"
            >
              <div className="path-node">
                <span className="mb-2 block font-mono text-xs text-slate-400">Step {index + 1}</span>
                <span className="font-display text-2xl font-bold text-white">{label}</span>
              </div>
              {index < pathSteps.length - 1 ? <div className="path-arrow" aria-hidden="true">→</div> : null}
            </div>
          ))}
      </div>
      <p className="mt-5 text-slate-300">
        Start at the Pico output pin. Current then goes through the resistor, through the LED, and finally returns to ground.
      </p>
    </div>
  );
}
