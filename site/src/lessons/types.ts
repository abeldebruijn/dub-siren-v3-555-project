import type { ComponentType } from "react";

export type DoneItem = {
  id: string;
  label: string;
};

export type LessonMeta = {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  isMigrated: boolean;
  doneItems: DoneItem[];
  Component?: ComponentType;
};
