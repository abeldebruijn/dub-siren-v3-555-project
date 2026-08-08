import { Check, LockKeyhole, RotateCcw } from "lucide-react";
import { docsBase, lessonOneDoneItems, lessons, lessonSlug } from "./courseData";
import { clearProgress, isLessonDone, useCourseProgress } from "./progress";

export default function CourseOverview() {
  const progress = useCourseProgress();
  const lessonOneDone = isLessonDone(progress, "lesson-001", lessonOneDoneItems.map(({ id }) => id));

  return (
    <section className="course-roadmap" aria-label="Course lessons">
      <header className="course-roadmap__header">
        <div>
          <p className="course-eyebrow">Pico Dub Siren</p>
          <h2>Fourteen small circuits</h2>
          <p>Each lesson adds one useful control. Finish a lesson’s checklist to unlock the next circuit.</p>
        </div>
        {Object.keys(progress).length > 0 ? (
          <button type="button" className="course-reset" onClick={clearProgress}>
            <RotateCcw aria-hidden="true" /> Reset progress
          </button>
        ) : null}
      </header>

      <ol className="course-roadmap__list">
        {lessons.map(([title, subtitle], index) => {
          const number = index + 1;
          const slug = lessonSlug(number);
          const done = number === 1 && lessonOneDone;
          const available = number === 1 || (number === 2 && lessonOneDone);
          const contentReady = number <= 2;
          const state = done ? "done" : available && contentReady ? "available" : "locked";
          const content = (
            <>
              <span className="course-roadmap__number">{String(number).padStart(2, "0")}</span>
              <span className="course-roadmap__copy">
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
              <span className={`course-roadmap__state course-roadmap__state--${state}`}>
                {done ? <Check aria-hidden="true" /> : state === "locked" ? <LockKeyhole aria-hidden="true" /> : null}
                {done ? "Done" : state === "available" ? (number === 1 ? "Start" : "Unlocked") : "Locked"}
              </span>
            </>
          );

          return (
            <li key={slug}>
              {available && contentReady ? (
                <a href={`${docsBase}/${slug}.html`} className="course-roadmap__lesson">
                  {content}
                </a>
              ) : (
                <div className="course-roadmap__lesson course-roadmap__lesson--locked" aria-disabled="true">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
