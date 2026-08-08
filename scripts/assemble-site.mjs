import { cp, mkdir } from "node:fs/promises";

const docsOutput = new URL("../docs/doc_build/", import.meta.url);
const deployedDocs = new URL("../site/dist/docs/", import.meta.url);

await mkdir(deployedDocs, { recursive: true });
await cp(docsOutput, deployedDocs, { recursive: true, force: true });
