import { Cable, CheckCircle2, CircleDot, Play, RotateCcw, Zap } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { clearProgress, hasAnyProgress, lessonStatus } from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";
import { lessons } from "@/lessons";
import { cn } from "@/lib/utils";

const statusLabels = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
};

export function HomePage() {
  const progress = useProgress();
  const hasProgress = hasAnyProgress(progress);
  const firstIncomplete = lessons.find(
    (lesson) => lesson.isMigrated && lessonStatus(progress, lesson.slug, lesson.doneItems.map((item) => item.id)) !== "done",
  );
  const continueTarget = firstIncomplete ?? lessons.find((lesson) => lesson.isMigrated);

  return (
    <main className="dark-course min-h-screen overflow-hidden">
      <section className="hero-cosmos relative flex min-h-[760px] w-full items-center justify-center overflow-hidden px-5 py-16 text-center md:min-h-[900px]">
        <div className="synthwave-sun" aria-hidden="true" />
        <div className="synthwave-mountains" aria-hidden="true" />
        <div className="synthwave-palms" aria-hidden="true">
          <span className="palm palm-left" />
          <span className="palm palm-right" />
        </div>
        <div className="synthwave-grid" aria-hidden="true" />
        <FloatingObjects />
        <div className="absolute right-3 top-4 z-20 hidden w-[min(30vw,19rem)] min-w-[13rem] md:right-8 md:top-7 md:block">
          <SynthConsole />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl pt-36 md:pt-8">
          <h1 className="hero-title font-display text-[4.2rem] font-black leading-[0.82] tracking-[-0.07em] text-white sm:text-[6.4rem] md:text-[7.6rem] lg:text-[9.4rem]">
            Pico Dub
            <span className="block">Siren</span>
          </h1>
          <p className="hero-subtitle mx-auto mt-8 max-w-xl text-xl leading-9 text-white md:text-2xl">
            Learn electronics by building a playable siren: LEDs first, then buttons, knobs, multiplexers, and finally a small synth control panel.
          </p>
          <p className="hero-subtitle mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-200">
            No prior Pico or breadboard experience assumed. Each lesson adds one useful control to the instrument.
          </p>

          <div className="mx-auto mt-12 max-w-md rounded-[1.4rem] border border-slate-600/70 bg-[#10141c]/80 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur">
            <p className="mb-4 text-slate-200">
              <strong className="text-white">{hasProgress ? "Continue where you left off." : "Start with one blinking LED."}</strong>{" "}
              Build confidence before the circuit becomes a synth.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {continueTarget ? (
                <Button asChild size="lg" className="flex-1">
                  <a href={`#/lessons/${continueTarget.slug}`}>
                    <Play className="h-4 w-4 fill-current" />
                    {hasProgress ? "Continue" : "Start lesson 1"}
                  </a>
                </Button>
              ) : null}
              {hasProgress ? <ResetJourneyDialog /> : null}
            </div>
          </div>
        </div>
        <div className="patch-cable" aria-hidden="true" />
      </section>

      <div className="post-hero-grid" aria-hidden="true" />

      <section className="course-copy mx-auto max-w-3xl px-6 py-24 text-slate-100">
        <p>
          Building a synthesizer can feel like <em>magic</em> when you have never touched electronics before. The trick is not to start with the whole instrument.
        </p>
        <p>
          You start with one visible signal: a blinking LED. Then you add a button. Then a knob. Then another knob. Each part has a clear job, and every wire earns its place.
        </p>
        <p>
          This course is <span className="hand-highlight pink">interactive</span>. You will use small visual tools to understand what the Pico is reading, what the code is doing, and why the circuit behaves the way it does.
        </p>
        <p>
          The end goal is practical: a low-cost Raspberry Pi Pico dub siren control surface you can keep expanding.
        </p>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        <div className="rainbow-marks mx-auto mb-24" aria-hidden="true" />
        <div className="mb-14">
          <h2 className="mt-1 text-5xl font-black tracking-[-0.04em] text-slate-100 md:text-7xl">Fourteen small circuits</h2>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">
            Think of each lesson as one patch cable in the final instrument.
          </p>
        </div>
        <div className="lesson-stream">
          {lessons.map((lesson) => {
            const status = lessonStatus(progress, lesson.slug, lesson.doneItems.map((item) => item.id));
            const statusIcon =
              status === "done" ? <CheckCircle2 className="h-4 w-4" /> : status === "in-progress" ? <Cable className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />;
            const body = (
              <Card
                className={cn(
                  "lesson-row border-slate-700/70 bg-transparent text-slate-100 transition duration-300",
                  lesson.isMigrated ? "hover:border-yellow-300/70 hover:bg-white/[0.035]" : "opacity-45",
                  status === "done" && "row-done",
                  status === "in-progress" && "row-active",
                )}
              >
                <CardContent className="grid gap-5 p-6 md:grid-cols-[6rem_1fr_auto] md:items-center">
                  <div className="lesson-number">{String(lesson.number).padStart(2, "0")}</div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-black tracking-[-0.03em] md:text-3xl">{lesson.title}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-400">
                        {lesson.isMigrated ? statusIcon : null}
                        {lesson.isMigrated ? statusLabels[status] : "Coming soon"}
                      </span>
                    </div>
                    <p className="max-w-xl leading-7 text-slate-400">{lesson.subtitle}</p>
                  </div>
                  {lesson.isMigrated ? <Zap className="hidden h-6 w-6 text-yellow-300 md:block" /> : null}
                </CardContent>
              </Card>
            );

            return lesson.isMigrated ? (
              <a key={lesson.slug} href={`#/lessons/${lesson.slug}`} className="block no-underline">
                {body}
              </a>
            ) : (
              <div key={lesson.slug}>{body}</div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function FloatingObjects() {
  return (
    <div aria-hidden="true" className="floating-objects">
      <span className="float-shape shape-wave shape-sine" />
      <span className="float-shape shape-wave shape-square" />
      <span className="float-shape shape-wave shape-saw" />
      <span className="float-shape shape-wave shape-triangle" />
      <span className="float-shape shape-wave shape-pulse" />
      <span className="float-shape shape-chip" />
      <span className="float-shape shape-led" />
    </div>
  );
}

function SynthConsole() {
  return (
    <aside className="synth-console relative min-h-[22rem] overflow-hidden rounded-[1.45rem] border border-stone-950/20 bg-stone-950 p-3 text-stone-50 md:min-h-[25rem] md:p-4">
      <div className="absolute left-8 top-8 h-28 w-28 rounded-full border-[18px] border-accent/25" />
      <div className="relative flex h-full flex-col gap-4">
        <div className="rounded-[1.1rem] border border-white/10 bg-black p-3 shadow-inner">
          <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-green-300">
            <span>Oscillator</span>
            <span>GP15</span>
          </div>
          <div className="scope-screen h-20 rounded-2xl border border-green-300/25 bg-green-950/70 md:h-24">
            <svg viewBox="0 0 420 120" className="h-full w-full" role="img" aria-label="Animated oscilloscope waveform">
              <path className="scope-grid" d="M0 30H420M0 60H420M0 90H420M70 0V120M140 0V120M210 0V120M280 0V120M350 0V120" />
              <path className="scope-wave" d="M0 62 C35 12 70 112 105 62 S175 12 210 62 S280 112 315 62 S385 12 420 62" />
            </svg>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4">
          <Knob label="Pitch" value="803 Hz" />
          <Knob label="Mod rate" value="0.5 s" />
          <Knob label="Amount" value="LED" />
          <Knob label="Feedback" value="soon" />
        </div>

        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3">
          <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-stone-300">
            <Cable className="h-4 w-4 text-accent" />
            Patch cable route
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-primary px-3 py-1 font-bold">Pico</span>
            <span className="h-1 flex-1 rounded-full bg-accent" />
            <span className="rounded-full bg-secondary px-3 py-1 font-bold">LED</span>
            <span className="h-1 flex-1 rounded-full bg-accent" />
            <span className="rounded-full bg-stone-700 px-3 py-1 font-bold">Sound</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Knob({ label, value }: { label: string; value: string }) {
  return (
    <div className="control-tile rounded-[1rem] border border-white/10 bg-white/[0.07] p-3">
      <div className="mx-auto mb-2 h-14 w-14 rounded-full border-[7px] border-stone-700 bg-stone-200 shadow-[inset_0_-10px_0_rgba(0,0,0,0.18)] md:h-16 md:w-16">
        <div className="mx-auto mt-1.5 h-6 w-1.5 rounded-full bg-primary" />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <p className="font-display text-xl font-bold md:text-2xl">{value}</p>
    </div>
  );
}

function ResetJourneyDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="lg">
          <RotateCcw className="h-4 w-4" />
          Reset journey
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset your React journey?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears only the React site progress stored in this browser. It does not touch the old lessons or project files.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep progress</AlertDialogCancel>
          <AlertDialogAction onClick={clearProgress}>Reset journey</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
