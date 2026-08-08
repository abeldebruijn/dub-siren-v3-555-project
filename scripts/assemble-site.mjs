import { cp, mkdir } from "node:fs/promises";

const docsOutput = new URL("../docs/doc_build/", import.meta.url);
const lessonsOutput = new URL("../lessons/doc_build/", import.meta.url);
const siteIndex = new URL("../site/dist/index.html", import.meta.url);
const deployedDocs = new URL("../site/dist/breadboard/docs/", import.meta.url);
const deployedLessons = new URL("../site/dist/lessons/", import.meta.url);
const deployedPlayground = new URL("../site/dist/breadboard/playground/", import.meta.url);

await mkdir(deployedDocs, { recursive: true });
await mkdir(deployedLessons, { recursive: true });
await mkdir(deployedPlayground, { recursive: true });
await cp(docsOutput, deployedDocs, { recursive: true, force: true });
await cp(lessonsOutput, deployedLessons, { recursive: true, force: true });
await cp(siteIndex, new URL("index.html", deployedPlayground), { force: true });
