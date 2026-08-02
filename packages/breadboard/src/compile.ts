import { renderCanonicalSvg } from "./render.js";
import { resolveBreadboard } from "./resolve.js";
import { parseSyntax } from "./syntax/index.js";
import type { CompileResult } from "./types.js";

export function compile(source: string): CompileResult {
  const { ast, diagnostics } = parseSyntax(source);
  if (
    diagnostics.some(
      ({ severity, code }) =>
        severity === "error" && code !== "syntax.statement-order",
    )
  ) {
    return {
      status: "invalid",
      ast,
      diagnostics,
      model: null,
      svg: null,
    };
  }
  const resolution = resolveBreadboard(ast, source);
  const combinedDiagnostics = sortDiagnostics([
    ...diagnostics,
    ...resolution.diagnostics,
  ]);
  if (combinedDiagnostics.some(({ severity }) => severity === "error")) {
    return {
      status: "invalid",
      ast,
      diagnostics: combinedDiagnostics,
      model: null,
      svg: null,
    };
  }
  if (resolution.unsupported !== null) {
    return {
      status: "unsupported",
      ast,
      diagnostics: combinedDiagnostics,
      model: null,
      svg: null,
      reason: resolution.unsupported,
    };
  }
  if (resolution.model === null) {
    throw new Error("Resolver returned no model without diagnostics");
  }

  return {
    status: "valid",
    ast,
    diagnostics: combinedDiagnostics,
    model: resolution.model,
    svg: renderCanonicalSvg(resolution.model),
  };
}

function sortDiagnostics(
  diagnostics: readonly CompileResult["diagnostics"][number][],
) {
  return [...diagnostics].sort((left, right) => {
    const leftStart = left.range.start;
    const rightStart = right.range.start;
    const leftEnd = left.range.end;
    const rightEnd = right.range.end;
    return (
      leftStart.line - rightStart.line ||
      leftStart.column - rightStart.column ||
      leftEnd.line - rightEnd.line ||
      leftEnd.column - rightEnd.column ||
      (left.severity === right.severity ? 0 : left.severity === "error" ? -1 : 1) ||
      (left.code < right.code ? -1 : left.code > right.code ? 1 : 0)
    );
  });
}
