import { useEffect, useMemo, useState } from "react";
import { Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="grid gap-8">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-700/70 bg-white/[0.04] text-slate-100">
          <CardHeader>
            <CardTitle>Today’s win</CardTitle>
          </CardHeader>
          <CardContent className="lesson-prose">
            <p>
              The Pico switches a physical LED on and off. Later, the same idea becomes the visible pulse for the dub siren’s modulation rate.
            </p>
            <p>
              Build slowly: unplug USB before wiring changes, use a resistor, and trace one complete electrical path before running code.
            </p>
          </CardContent>
        </Card>

        <BlinkSimulator />
      </section>

      <section className="lesson-prose workbench-card p-6 md:p-8">
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

      <section className="lesson-prose workbench-card p-6 md:p-8">
        <h2>2. Build one complete path</h2>
        <p>
          Unplug USB. The LED only works when current can travel from a Pico output, through the resistor and LED, then back to ground.
        </p>
        <CircuitPathCheck />
      </section>

      <section className="lesson-prose workbench-card p-6 md:p-8">
        <h2>3. Put the rhythm on the Pico</h2>
        <p>
          Run this as <code>main.py</code>. Click a line number to see what that line does.
        </p>
        <CodeLesson code={lessonOneCode} fileName="main.py" lineNotes={lessonOneLineNotes} />
      </section>

      <section className="lesson-prose workbench-card p-6 md:p-8">
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
    <Card className="overflow-hidden bg-stone-950 text-stone-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Blink simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <div className="flex items-center justify-center rounded-[2rem] bg-stone-900 p-8">
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
      </CardContent>
    </Card>
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

function CircuitPathCheck() {
  const [stepIndex, setStepIndex] = useState(0);
  const [mistake, setMistake] = useState(false);
  const complete = stepIndex === pathSteps.length;

  function clickStep(label: string) {
    if (complete) return;
    if (label === pathSteps[stepIndex]) {
      setStepIndex((value) => value + 1);
      setMistake(false);
    } else {
      setMistake(true);
    }
  }

  function reset() {
    setStepIndex(0);
    setMistake(false);
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="relative rounded-[2rem] border bg-amber-50 p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Click the current path in order</p>
          <Button variant="outline" size="sm" onClick={reset}>Reset</Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {pathSteps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => clickStep(label)}
              className={cn(
                "min-h-28 rounded-[1.5rem] border-2 p-4 text-center transition",
                index < stepIndex ? "border-secondary bg-green-100" : "border-stone-300 bg-white hover:-translate-y-1",
                index === stepIndex && "border-primary",
              )}
            >
              <span className="mb-2 block font-mono text-xs text-muted-foreground">Step {index + 1}</span>
              <span className="font-display text-2xl font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className={cn("bg-white/80", complete && "bg-green-50")}>
        <CardContent className="p-5">
          <Zap className={cn("mb-3 h-7 w-7", complete ? "text-secondary" : "text-primary")} />
          {complete ? (
            <p className="font-bold">Complete path: GP15 → resistor → LED → GND.</p>
          ) : mistake ? (
            <p>Not that part yet. Start at the Pico output, then follow current through each component.</p>
          ) : (
            <p>
              Next click: <strong>{pathSteps[stepIndex]}</strong>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
