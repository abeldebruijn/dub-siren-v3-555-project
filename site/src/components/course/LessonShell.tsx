import { useEffect } from "react";
import { ArrowLeft, CheckCircle2, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNextLesson, getPreviousLesson } from "@/lessons";
import type { LessonMeta } from "@/lessons/types";
import { isLessonDone, markVisited } from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";

type Props = {
  lesson: LessonMeta;
};

export function LessonShell({ lesson }: Props) {
  const progress = useProgress();
  const previous = getPreviousLesson(lesson);
  const next = getNextLesson(lesson);
  const done = isLessonDone(progress, lesson.slug, lesson.doneItems.map((item) => item.id));
  const LessonComponent = lesson.Component;

  useEffect(() => {
    markVisited(lesson.slug);
  }, [lesson.slug]);

  return (
    <main className="dark-course lesson-page min-h-screen w-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-5 py-8 md:px-8 md:py-12">
        <header className="lesson-page-hero relative overflow-hidden border-b border-slate-700/70 pb-10 pt-6">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
            <div>
              <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
                Pico Dub Siren · lesson {String(lesson.number).padStart(2, "0")}
              </p>
              <h1 className="max-w-4xl font-display text-5xl font-black leading-[0.9] text-white md:text-8xl">{lesson.title}</h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300 md:text-2xl">{lesson.subtitle}</p>
            </div>
            <nav className="lesson-status-panel text-stone-50">
              <div className="mb-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-green-300">
                <span>Patch status</span>
                <span>{done ? "Done" : "Open"}</span>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <div className="patch-socket flex h-14 w-14 items-center justify-center rounded-full font-mono font-black">{lesson.number}</div>
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    {done ? <CheckCircle2 className="h-4 w-4 text-green-300" /> : <CircleDot className="h-4 w-4 text-accent" />}
                    {done ? "Ready for next patch" : "Finish the checklist"}
                  </p>
                  <p className="text-sm text-stone-400">Next lesson unlocks when done.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-start border-white/20 bg-transparent text-white hover:bg-accent hover:text-stone-950">
                  <a href="/pico-dub-siren/">
                    <ArrowLeft className="h-4 w-4" />
                    Journey
                  </a>
                </Button>
                {previous?.isMigrated ? (
                  <Button asChild variant="ghost" className="justify-start text-white hover:bg-white/10">
                    <a href={`/pico-dub-siren/lessons/lesson${previous.number}.html`}>← Lesson {previous.number}</a>
                  </Button>
                ) : null}
                {done && next?.isMigrated ? (
                  <Button asChild variant="ghost" className="justify-start text-white hover:bg-white/10">
                    <a href={`/pico-dub-siren/lessons/lesson${next.number}.html`}>Lesson {next.number} →</a>
                  </Button>
                ) : null}
              </div>
            </nav>
          </div>
        </header>

        {LessonComponent ? <LessonComponent /> : null}
      </div>
    </main>
  );
}
