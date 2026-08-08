import { Check, LockKeyhole } from "lucide-react";
import { docsBase, lessonOneDoneItems } from "./courseData";
import { isLessonDone, setChecklistItem, useCourseProgress } from "./progress";

export default function LessonChecklist() {
  const progress = useCourseProgress();
  const checked = progress["lesson-001"]?.checked ?? {};
  const done = isLessonDone(progress, "lesson-001", lessonOneDoneItems.map(({ id }) => id));

  return (
    <section className="course-checklist" aria-labelledby="done-means-heading">
      <header>
        <h2 id="done-means-heading">Done means</h2>
      </header>
      <div className="course-checklist__items">
        {lessonOneDoneItems.map((item) => {
          const isChecked = Boolean(checked[item.id]);
          return (
            <label className={isChecked ? "course-check course-check--done" : "course-check"} key={item.id}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(event) => setChecklistItem("lesson-001", item.id, event.target.checked)}
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
          <strong>{done ? "Lesson 2 unlocked" : "Lesson 2 is locked"}</strong>
          <p>{done ? "Every checkpoint is complete. Continue when you are ready." : "Check every item above to make the next lesson available."}</p>
        </div>
        {done ? <a href={`${docsBase}/lesson2.html`}>Next lesson →</a> : <span aria-disabled="true">Next lesson →</span>}
      </footer>
    </section>
  );
}
