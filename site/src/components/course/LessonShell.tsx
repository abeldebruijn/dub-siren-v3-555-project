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
    <main className="dark-course mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-8 md:py-12">
      <header className="relative overflow-hidden rounded-[2.4rem] border border-slate-700/70 bg-[#0d1117] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="grid gap-5 md:grid-cols-[1fr_18rem]">
          <div>
            <div className="rounded-[2rem] bg-white/[0.035] p-6 md:p-10">
              <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-yellow-300 shadow-sm">
              Dub Siren V3 · lesson {String(lesson.number).padStart(2, "0")}
              </p>
              <h1 className="font-display text-5xl font-black leading-[0.95] text-white md:text-7xl">{lesson.title}</h1>
              <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-300">{lesson.subtitle}</p>
            </div>
          </div>
          <nav className="rounded-[2rem] bg-stone-950 p-5 text-stone-50">
            <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-green-300">
                <span>Patch status</span>
                <span>{done ? "Done" : "Open"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="patch-socket flex h-14 w-14 items-center justify-center rounded-full font-mono font-black">{lesson.number}</div>
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    {done ? <CheckCircle2 className="h-4 w-4 text-green-300" /> : <CircleDot className="h-4 w-4 text-accent" />}
                    {done ? "Ready for next patch" : "Finish the checklist"}
                  </p>
                  <p className="text-sm text-stone-400">Next lesson unlocks when done.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="justify-start border-white/20 bg-white/10 text-white hover:bg-accent hover:text-stone-950">
                <a href="#/">
                  <ArrowLeft className="h-4 w-4" />
                  Journey
                </a>
              </Button>
              {previous?.isMigrated ? (
                <Button asChild variant="ghost" className="justify-start text-white hover:bg-white/10">
                  <a href={`#/lessons/${previous.slug}`}>← Lesson {previous.number}</a>
                </Button>
              ) : null}
              {done && next?.isMigrated ? (
                <Button asChild variant="ghost" className="justify-start text-white hover:bg-white/10">
                  <a href={`#/lessons/${next.slug}`}>Lesson {next.number} →</a>
                </Button>
              ) : null}
            </div>
          </nav>
        </div>
      </header>

      {LessonComponent ? <LessonComponent /> : null}
    </main>
  );
}
