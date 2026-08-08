import { useEffect, useState } from "react";

export type LessonProgress = {
  visited: boolean;
  checked: Record<string, boolean>;
};

export type CourseProgress = Record<string, LessonProgress>;

export const progressStorageKey = "dub-siren-v3.react-progress.v1";
export const progressEvent = "dub-siren-progress";

export function readProgress(): CourseProgress {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(progressStorageKey);
    if (!stored) return {};
    const progress = JSON.parse(stored) as CourseProgress;
    return progress && typeof progress === "object" ? progress : {};
  } catch {
    return {};
  }
}

export function setChecklistItem(lesson: string, item: string, checked: boolean) {
  const progress = readProgress();
  const current = progress[lesson] ?? { visited: true, checked: {} };
  const next = {
    ...progress,
    [lesson]: {
      visited: true,
      checked: { ...current.checked, [item]: checked },
    },
  };

  window.localStorage.setItem(progressStorageKey, JSON.stringify(next));
  window.dispatchEvent(new Event(progressEvent));
}

export function clearProgress() {
  window.localStorage.removeItem(progressStorageKey);
  window.dispatchEvent(new Event(progressEvent));
}

export function isLessonDone(progress: CourseProgress, lesson: string, items: readonly string[]) {
  return items.length > 0 && items.every((item) => progress[lesson]?.checked[item]);
}

export function useCourseProgress() {
  const [progress, setProgress] = useState<CourseProgress>({});

  useEffect(() => {
    const sync = () => setProgress(readProgress());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(progressEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(progressEvent, sync);
    };
  }, []);

  return progress;
}
