import { Check, LockKeyhole } from "lucide-react";
import { docsBase, lessonTwoDoneItems } from "./courseData";
import { isLessonDone, setChecklistItem, useCourseProgress } from "./progress";

export default function LessonTwoChecklist() {
  const progress = useCourseProgress();
  const checked = progress["lesson-002"]?.checked ?? {};
  const done = isLessonDone(progress, "lesson-002", lessonTwoDoneItems.map(({ id }) => id));

  return (
    <section className="course-checklist" aria-labelledby="lesson-two-done-heading">
      <header><h2 id="lesson-two-done-heading">Done means</h2></header>
      <div className="course-checklist__items">
        {lessonTwoDoneItems.map((item) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <label className={isChecked ? "course-check course-check--done" : "course-check"} key={item.id}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(event) => setChecklistItem("lesson-002", item.id, event.target.checked)}
              />
              <span aria-hidden="true">{isChecked ? <Check /> : null}</span>
              <strong>{item.label}</strong>
            </label>
          );
        })}
      </div>
      <footer className={done ? "course-unlock course-unlock--ready" : "course-unlock"} aria-live="polite">
        <LockKeyhole aria-hidden="true" />
        <div>
          <strong>{done ? "Lesson 2 complete" : "Next lesson is locked"}</strong>
          <p>{done ? "Every checkpoint is complete. You are ready for the potentiometer lesson." : "Check every item above to finish this lesson."}</p>
        </div>
        {done ? <a href={`${docsBase}/lesson3.html`}>Next lesson →</a> : <span aria-disabled="true">Next lesson →</span>}
      </footer>
    </section>
  );
}
