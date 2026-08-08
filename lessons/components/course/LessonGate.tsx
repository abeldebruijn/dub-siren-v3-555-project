import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { docsBase, lessonOneDoneItems } from "./courseData";
import { isLessonDone, useCourseProgress } from "./progress";

export default function LessonGate({ children }: { children: ReactNode }) {
  const progress = useCourseProgress();
  const unlocked = isLessonDone(progress, "lesson-001", lessonOneDoneItems.map(({ id }) => id));

  if (unlocked) return <>{children}</>;

  return (
    <section className="course-gate">
      <LockKeyhole aria-hidden="true" />
      <p className="course-eyebrow">Lesson locked</p>
      <h1>Finish lesson 1 first</h1>
      <p>The next lesson becomes available after every “Done means” checkpoint in lesson 1 is checked.</p>
      <a href={`${docsBase}/lesson1.html`}>Return to lesson 1</a>
    </section>
  );
}
