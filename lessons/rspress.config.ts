import path from "node:path";
import { defineConfig } from "@rspress/core";

export default defineConfig({
  root: path.join(import.meta.dirname, "content"),
  base: "/pico-dub-siren/lessons/",
  route: {
    cleanUrls: true,
  },
  title: "Pico Dub Siren lessons",
  description: "Learn Raspberry Pi Pico electronics by building a dub siren.",
  icon: "/breadboard-mark.svg",
  globalStyles: path.join(import.meta.dirname, "styles/index.css"),
  markdown: {
    globalComponents: [
      path.join(import.meta.dirname, "components/course/BlinkSimulator.tsx"),
      path.join(import.meta.dirname, "components/course/CircuitPath.tsx"),
      path.join(import.meta.dirname, "components/course/CourseOverview.tsx"),
      path.join(import.meta.dirname, "components/course/LessonChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonCode.tsx"),
      path.join(import.meta.dirname, "components/course/LessonGate.tsx"),
    ],
    shiki: {
      defaultLanguage: "text",
    },
  },
  themeConfig: {
    lastUpdated: false,
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/abeldebruijn/pico-dub-siren",
      },
    ],
  },
});
