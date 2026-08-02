import { mkdir, readFile, writeFile } from "node:fs/promises";

import { createSyntaxDiagramsCode } from "chevrotain";

import { breadboardParser } from "../dist/syntax/parser.js";

const output = new URL("../generated/breadboard-grammar.html", import.meta.url);
const html = createSyntaxDiagramsCode(
  breadboardParser.getSerializedGastProductions(),
)
  .replace(/\r\n?/gu, "\n")
  .replace(/[ \t]+$/gmu, "");

if (process.argv.includes("--check")) {
  const existing = await readFile(output, "utf8").catch(() => null);
  if (existing !== html) {
    console.error("Generated breadboard grammar is stale");
    process.exitCode = 1;
  }
} else {
  await mkdir(new URL("../generated/", import.meta.url), { recursive: true });
  await writeFile(output, html, "utf8");
}
