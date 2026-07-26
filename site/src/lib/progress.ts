export type LessonStatus = "todo" | "in-progress" | "done";

export type LessonProgress = {
  visited: boolean;
  checked: Record<string, boolean>;
};

export type CourseProgress = Record<string, LessonProgress>;

export const progressStorageKey = "dub-siren-v3.react-progress.v1";

export function readProgress(): CourseProgress {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CourseProgress;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeProgress(progress: CourseProgress) {
  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  window.dispatchEvent(new Event("dub-siren-progress"));
}

export function clearProgress() {
  window.localStorage.removeItem(progressStorageKey);
  window.dispatchEvent(new Event("dub-siren-progress"));
}

export function markVisited(slug: string) {
  const progress = readProgress();
  const current = progress[slug] ?? { visited: false, checked: {} };
  writeProgress({
    ...progress,
    [slug]: {
      ...current,
      visited: true,
    },
  });
}

export function setChecklistItem(slug: string, itemId: string, checked: boolean) {
  const progress = readProgress();
  const current = progress[slug] ?? { visited: true, checked: {} };
  writeProgress({
    ...progress,
    [slug]: {
      ...current,
      visited: true,
      checked: {
        ...current.checked,
        [itemId]: checked,
      },
    },
  });
}

export function isLessonDone(progress: CourseProgress, slug: string, doneItemIds: string[]) {
  if (doneItemIds.length === 0) return false;
  const checked = progress[slug]?.checked ?? {};
  return doneItemIds.every((id) => checked[id]);
}

export function lessonStatus(progress: CourseProgress, slug: string, doneItemIds: string[]): LessonStatus {
  if (isLessonDone(progress, slug, doneItemIds)) return "done";
  if (progress[slug]?.visited) return "in-progress";
  return "todo";
}

export function hasAnyProgress(progress: CourseProgress) {
  return Object.values(progress).some((item) => item.visited || Object.values(item.checked).some(Boolean));
}
