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
  builderConfig: {
    dev: {
      lazyCompilation: false,
    },
  },
  markdown: {
    globalComponents: [
      path.join(import.meta.dirname, "components/course/BlinkSimulator.tsx"),
      path.join(import.meta.dirname, "components/course/ButtonAnatomy.tsx"),
      path.join(import.meta.dirname, "components/course/CircuitPath.tsx"),
      path.join(import.meta.dirname, "components/course/CourseOverview.tsx"),
      path.join(import.meta.dirname, "components/course/FlashRateDemo.tsx"),
      path.join(import.meta.dirname, "components/course/LessonChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonCode.tsx"),
      path.join(import.meta.dirname, "components/course/LessonCodeDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonToggleDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonFourChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonFourCodeDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonFiveChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonFiveCircuit.tsx"),
      path.join(import.meta.dirname, "components/course/LessonFiveCodeDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonPotLedDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonSevenChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonSevenCircuit.tsx"),
      path.join(import.meta.dirname, "components/course/LessonSevenCodeDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonSevenQuiz.tsx"),
      path.join(import.meta.dirname, "components/course/LessonSixChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonSixCircuit.tsx"),
      path.join(import.meta.dirname, "components/course/LessonSixCodeDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonThreeChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonThreeCircuit.tsx"),
      path.join(import.meta.dirname, "components/course/LessonThreeCodeDiff.tsx"),
      path.join(import.meta.dirname, "components/course/LessonGate.tsx"),
      path.join(import.meta.dirname, "components/course/LessonTwoChecklist.tsx"),
      path.join(import.meta.dirname, "components/course/LessonTwoCircuit.tsx"),
      path.join(import.meta.dirname, "components/course/MuxChannelSelector.tsx"),
      path.join(import.meta.dirname, "components/course/MuxSupportWireExplorer.tsx"),
      path.join(import.meta.dirname, "components/course/PitchSmoothingDemo.tsx"),
      path.join(import.meta.dirname, "components/course/RateAmountDemo.tsx"),
      path.join(import.meta.dirname, "components/course/ResistorWidget.tsx"),
      path.join(import.meta.dirname, "components/course/PotPositionDemo.tsx"),
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
