import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNextLesson } from "@/lessons";
import type { DoneItem, LessonMeta } from "@/lessons/types";
import { isLessonDone, setChecklistItem } from "@/lib/progress";
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
    <Card className="border-2 border-stone-900/10 bg-amber-50/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-secondary" />
          Done means
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white/70 p-4 transition hover:bg-white"
            >
              <input
                className="mt-1 h-5 w-5 accent-[hsl(var(--secondary))]"
                type="checkbox"
                checked={Boolean(checked[item.id])}
                onChange={(event) => setChecklistItem(lesson.slug, item.id, event.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        {done && nextLesson?.isMigrated ? (
          <Button asChild size="lg">
            <a href={`#/lessons/${nextLesson.slug}`}>Lesson {nextLesson.number} →</a>
          </Button>
        ) : done && nextLesson ? (
          <p className="rounded-2xl border border-dashed bg-white/70 p-4 text-sm text-muted-foreground">
            Lesson {nextLesson.number} is in the journey, but it has not been migrated to React yet.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">The next lesson appears after every box is checked.</p>
        )}
      </CardContent>
    </Card>
  );
}
