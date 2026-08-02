import { readdir, readFile } from "node:fs/promises";

type ExpectedDiagnostic = Readonly<{
  code: string;
  severity: "error" | "warning";
  range: Readonly<{
    start: Readonly<{ line: number; column: number }>;
    end: Readonly<{ line: number; column: number }>;
  }>;
  related?: readonly Readonly<{
    start: Readonly<{ line: number; column: number }>;
    end: Readonly<{ line: number; column: number }>;
  }>[];
}>;

type ConformanceFixture = Readonly<{
  name: string;
  source: string;
  diagnostics: readonly ExpectedDiagnostic[];
  svg: string | null;
}>;

export async function loadConformanceFixtures(
  directory: URL,
): Promise<readonly ConformanceFixture[]> {
  const names = (await readdir(directory))
    .filter((name) => name.endsWith(".bd"))
    .map((name) => name.slice(0, -3))
    .sort();

  return Promise.all(
    names.map(async (name) => {
      const source = await readFile(new URL(`${name}.bd`, directory), "utf8");
      const diagnostics = JSON.parse(
        await readFile(
          new URL(`${name}.diagnostics.json`, directory),
          "utf8",
        ),
      ) as readonly ExpectedDiagnostic[];
      const hasErrors = diagnostics.some(
        (diagnostic) => diagnostic.severity === "error",
      );
      let svg: string | null = null;

      if (!hasErrors) {
        svg = await readFile(new URL(`${name}.svg`, directory), "utf8");
      }

      return { name, source, diagnostics, svg };
    }),
  );
}
