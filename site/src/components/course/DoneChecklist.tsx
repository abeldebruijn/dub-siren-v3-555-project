import confetti from "canvas-confetti";
import { Check, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getNextLesson } from "@/lessons";
import type { DoneItem, LessonMeta } from "@/lessons/types";
import { isLessonDone, setChecklistItem } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/useProgress";

type Props = {
  lesson: LessonMeta;
  items: DoneItem[];
};

export function DoneChecklist({ lesson, items }: Props) {
  const progress = useProgress();
  const checked = progress[lesson.slug]?.checked ?? {};
  const done = useMemo(() => isLessonDone(progress, lesson.slug, items.map((item) => item.id)), [items, lesson.slug, progress]);
  const previousDone = useRef(done);
  const nextLesson = getNextLesson(lesson);

  useEffect(() => {
    if (!previousDone.current && done) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#e9481d", "#ffd747", "#17764c", "#5b44c8"],
      });
    }
    previousDone.current = done;
  }, [done]);

  return (
    <section className="done-strip">
      <div className="mb-6 flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-green-300" />
        <h2 className="font-display text-3xl font-bold text-white">Done means</h2>
      </div>
      <div className="space-y-5">
        <div className="space-y-3">
          {items.map((item) => {
            const isChecked = Boolean(checked[item.id]);

            return (
              <label
                key={item.id}
                className={cn(
                  "done-check-row flex cursor-pointer items-start gap-4",
                  isChecked && "done-check-row-done",
                )}
              >
                <input
                  className="sr-only"
                  type="checkbox"
                  checked={isChecked}
                  onChange={(event) => setChecklistItem(lesson.slug, item.id, event.target.checked)}
                />
                <span className="done-check-box mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                  {isChecked ? <Check className="h-4 w-4" /> : null}
                </span>
                <span className="leading-7">{item.label}</span>
              </label>
            );
          })}
        </div>

        {done && nextLesson?.isMigrated ? (
          <Button asChild size="lg">
            <a href={`#/lessons/${nextLesson.slug}`}>Lesson {nextLesson.number} →</a>
          </Button>
        ) : done && nextLesson ? (
          <p className="border border-dashed border-white/20 p-4 text-sm text-slate-400">
            Lesson {nextLesson.number} is in the journey, but it has not been migrated to React yet.
          </p>
        ) : (
          <p className="text-sm text-slate-400">The next lesson appears after every box is checked.</p>
        )}
      </div>
    </section>
  );
}
