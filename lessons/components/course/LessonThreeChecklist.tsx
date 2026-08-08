import { Check, LockKeyhole } from "lucide-react";
import { lessonThreeDoneItems } from "./courseData";
import { isLessonDone, setChecklistItem, useCourseProgress } from "./progress";

export default function LessonThreeChecklist() {
  const progress = useCourseProgress();
  const checked = progress["lesson-003"]?.checked ?? {};
  const done = isLessonDone(progress, "lesson-003", lessonThreeDoneItems.map(({ id }) => id));

  return (
    <section className="course-checklist" aria-labelledby="lesson-three-done-heading">
      <header><h2 id="lesson-three-done-heading">Done means</h2></header>
      <div className="course-checklist__items">
        {lessonThreeDoneItems.map((item) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <label className={isChecked ? "course-check course-check--done" : "course-check"} key={item.id}>
              <input type="checkbox" checked={isChecked} onChange={(event) => setChecklistItem("lesson-003", item.id, event.target.checked)} />
              <span aria-hidden="true">{isChecked ? <Check /> : null}</span>
              <strong>{item.label}</strong>
            </label>
          );
        })}
      </div>
      <footer className={done ? "course-unlock course-unlock--ready" : "course-unlock"} aria-live="polite">
        <LockKeyhole aria-hidden="true" />
        <div>
          <strong>{done ? "Lesson 3 complete" : "Next lesson is locked"}</strong>
          <p>{done ? "Every checkpoint is complete. You are ready to let the knob control blink speed." : "Check every item above to finish this lesson."}</p>
        </div>
      </footer>
    </section>
  );
}
