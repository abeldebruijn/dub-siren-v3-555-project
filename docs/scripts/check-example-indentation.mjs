import { readFile } from "node:fs/promises";

const chipExamplePages = [
  "index.html",
  "language/components.html",
  "language/pins-and-aliases.html",
  "examples/two-components.html",
];

for (const page of chipExamplePages) {
  const html = await readFile(new URL(`../doc_build/${page}`, import.meta.url), "utf8");
  if (!html.includes("\n  height")) {
    throw new Error(`${page} lost chip-member indentation`);
  }
}
