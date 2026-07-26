import { LessonOnePage } from "./lesson-001/LessonPage";
import { lessonOneContent } from "./lesson-001/content";
import type { LessonMeta } from "./types";

const titles = [
  "Make your first light blink",
  "Control the light with a button",
  "Turn a button into an on/off switch",
  "Read a turning knob",
  "Fade the light with a knob",
  "Control blink speed with a knob",
  "Control speed and brightness together",
  "Add a pitch dial",
  "Route pitch through the switch chip",
  "Share one Pico input between two dials",
  "Keep timing responsive",
  "Add a third dial to the switch chip",
  "Add a feedback dial",
  "Add a tempo dial",
];

const subtitles = [
  "Wire one safe LED path, then make the Pico pulse it with MicroPython.",
  "Read a push button and make the LED respond.",
  "Turn raw presses into one clean toggle.",
  "Read a potentiometer as numbers you can trust.",
  "Turn a knob into smooth LED brightness.",
  "Use a knob to control modulation speed.",
  "Make two knobs control two different behaviours.",
  "Add the pitch control that will shape the siren.",
  "Send pitch through the CD74HC4051 switch chip.",
  "Read two dials through one Pico analog input.",
  "Keep the mux reading loop responsive.",
  "Expand the switch chip to a third control.",
  "Add the feedback control for dub-siren character.",
  "Add the tempo dial for rhythmic control.",
];

export const lessons: LessonMeta[] = titles.map((title, index) => {
  const number = index + 1;
  const slug = `lesson-${String(number).padStart(3, "0")}`;

  if (number === 1) {
    return {
      number,
      slug,
      title,
      subtitle: subtitles[index],
      isMigrated: true,
      doneItems: lessonOneContent.doneItems,
      Component: LessonOnePage,
    };
  }

  return {
    number,
    slug,
    title,
    subtitle: subtitles[index],
    isMigrated: false,
    doneItems: [],
  };
});

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getPreviousLesson(current: LessonMeta) {
  return lessons.find((lesson) => lesson.number === current.number - 1);
}

export function getNextLesson(current: LessonMeta) {
  return lessons.find((lesson) => lesson.number === current.number + 1);
}
