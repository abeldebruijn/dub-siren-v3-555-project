import path from "node:path";
import { defineConfig } from "@rspress/core";

export default defineConfig({
  root: path.join(import.meta.dirname, "content"),
  base: "/dub-siren-v3-555-project/docs/",
  title: "Breadboard language",
  description: "The interactive reference for the Breadboard diagram language.",
  icon: "/breadboard-mark.svg",
  globalStyles: path.join(import.meta.dirname, "styles/index.css"),
  markdown: {
    globalComponents: [
      path.join(import.meta.dirname, "components/BreadboardExample.tsx"),
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
        content: "https://github.com/abeldebruijn/dub-siren-v3-555-project",
      },
    ],
  },
});
