import { EOF, type CstNode } from "chevrotain";

import type { Diagnostic, SourceSpan, SurfaceDocument } from "../types.js";
import { surfaceAstBuilder } from "./ast.js";
import { breadboardParser } from "./parser.js";
import { breadboardLexer, Newline } from "./tokens.js";

export type SyntaxResult = Readonly<{
  ast: SurfaceDocument;
  diagnostics: readonly Diagnostic[];
}>;

type LocatedDiagnostic = Readonly<{
  diagnostic: Diagnostic;
  span: SourceSpan;
}>;

function positionAt(source: string, offset: number) {
  const before = source.slice(0, Math.max(0, offset));
  const lines = before.split(/\r?\n/u);
  return {
    line: lines.length,
    column: Array.from(lines.at(-1) ?? "").length + 1,
  };
}

function locatedDiagnostic(
  source: string,
  code: string,
  span: SourceSpan,
  message: string,
): LocatedDiagnostic {
  return {
    span,
    diagnostic: {
      code,
      severity: "error",
      range: {
        start: positionAt(source, span.start),
        end: positionAt(source, span.end),
      },
      message,
    },
  };
}

function parserDiagnostics(source: string): LocatedDiagnostic[] {
  return breadboardParser.errors.map((error) => {
    const token = error.token;
    const eof = token.tokenType === EOF;
    const offset = eof || token.startOffset < 0 ? source.length : token.startOffset;
    const missingAtLineEnd =
      error.name === "MismatchedTokenException" &&
      (token.tokenType === Newline || eof);
    const span = missingAtLineEnd
      ? { start: offset, end: offset }
      : {
          start: offset,
          end: eof
            ? offset
            : (token.endOffset ?? offset + token.image.length - 1) + 1,
        };
    const code = eof
      ? "syntax.unexpected-eof"
      : error.name === "MismatchedTokenException" &&
          error.context.ruleStack.includes("pinMember")
        ? "syntax.invalid-alias"
        : "syntax.unexpected-token";
    return locatedDiagnostic(
      source,
      code,
      span,
      eof
        ? "Unexpected end of input"
        : code === "syntax.invalid-alias"
          ? "Invalid pin alias"
          : "Unexpected token",
    );
  });
}

function astDiagnostics(
  source: string,
  ast: SurfaceDocument,
  parser: readonly LocatedDiagnostic[],
): LocatedDiagnostic[] {
  const diagnostics: LocatedDiagnostic[] = [];
  const append = (code: string, span: SourceSpan) => {
    if (
      code === "syntax.unexpected-token" &&
      source.slice(span.start, span.end) === "\uFEFF"
    ) {
      return;
    }
    const supersededByParser = parser.some(
      ({ span: parserSpan }) =>
        parserSpan.start >= span.start &&
        (parserSpan.start <= span.end ||
          !/[\r\n]/u.test(source.slice(span.end, parserSpan.start))),
    );
    if (!supersededByParser) {
      diagnostics.push(
        locatedDiagnostic(
          source,
          code,
          span,
          code === "syntax.unexpected-token"
            ? "Unexpected token"
            : "Invalid syntax",
        ),
      );
    }
  };

  for (const statement of ast.statements) {
    if (statement.kind === "invalid-statement") {
      for (const code of statement.diagnosticCodes) append(code, statement.span);
    } else if (statement.kind === "chip-definition") {
      for (const member of statement.members) {
        if (member.kind === "invalid-chip-member") {
          for (const code of member.diagnosticCodes) append(code, member.span);
        }
      }
    }
  }
  return diagnostics;
}

function statementOrderDiagnostics(
  source: string,
  ast: SurfaceDocument,
): LocatedDiagnostic[] {
  const rank = {
    breadboard: 0,
    "chip-definition": 1,
    placement: 2,
    wire: 3,
  } as const;
  const diagnostics: LocatedDiagnostic[] = [];
  let highest = -1;
  for (const statement of ast.statements) {
    if (statement.kind === "invalid-statement") continue;
    const current = rank[statement.kind];
    if (current < highest) {
      diagnostics.push(
        locatedDiagnostic(
          source,
          "syntax.statement-order",
          statement.span,
          "Statement appears after a later document section",
        ),
      );
    } else {
      highest = current;
    }
  }
  return diagnostics;
}

const COLOR_NAMES = new Set([
  "black",
  "red",
  "brown",
  "orange",
  "yellow",
  "green",
  "forest",
  "blue",
  "cyan",
  "purple",
  "grey",
  "white",
]);

function literalDiagnostics(
  source: string,
  ast: SurfaceDocument,
): LocatedDiagnostic[] {
  const diagnostics: LocatedDiagnostic[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (value === null || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    const span = node.span as SourceSpan | undefined;
    if (
      node.kind === "integer" &&
      node.supported === true &&
      typeof node.spelling === "string" &&
      !/^[1-9]\d*$/u.test(node.spelling) &&
      span !== undefined
    ) {
      diagnostics.push(
        locatedDiagnostic(
          source,
          "syntax.invalid-integer",
          span,
          "Expected a positive integer without leading zeroes",
        ),
      );
    } else if (
      node.kind === "percentage" &&
      node.supported === true &&
      typeof node.spelling === "string" &&
      (typeof node.value !== "number" ||
        node.value < 0 ||
        node.value > 100 ||
        !/^(?:0|[1-9]\d*)%$/u.test(node.spelling)) &&
      span !== undefined
    ) {
      diagnostics.push(
        locatedDiagnostic(
          source,
          "syntax.invalid-percentage",
          span,
          "Expected a percentage from 0% through 100%",
        ),
      );
    } else if (
      node.kind === "named-color" &&
      typeof node.spelling === "string" &&
      !COLOR_NAMES.has(node.spelling.toLowerCase()) &&
      span !== undefined
    ) {
      diagnostics.push(
        locatedDiagnostic(
          source,
          "syntax.invalid-colour",
          span,
          "Unknown colour",
        ),
      );
    }
    for (const child of Object.values(node)) walk(child);
  };
  walk(ast);
  return diagnostics;
}

const RESERVED_NAMES = new Set([
  "breadboard",
  "rows",
  "columns",
  "chip",
  "height",
  "width",
  "color",
  "pin",
  "place",
  "at",
  "flip",
  "wire",
  "via",
  "saturation",
  "capacitor",
  "led",
  "button",
  "resistor",
  "potentiometer",
  "diode",
  "transistor",
  "switch",
  "relay",
  "speaker",
  "buzzer",
  "motor",
  "inductor",
  "transformer",
  "crystal",
  "oscillator",
  "sensor",
  "connector",
]);

function nameDiagnostics(
  source: string,
  ast: SurfaceDocument,
): LocatedDiagnostic[] {
  const names: { value: string; span: SourceSpan }[] = [];
  for (const statement of ast.statements) {
    if (statement.kind === "breadboard" && statement.name !== null) {
      names.push(statement.name);
    } else if (statement.kind === "chip-definition") {
      names.push(statement.name);
    } else if (statement.kind === "placement") {
      names.push(statement.instance, statement.definition);
    }
  }
  return names.flatMap((name) => {
    const code = !/^[A-Za-z_][A-Za-z0-9_-]*$/u.test(name.value)
      ? "syntax.invalid-identifier"
      : RESERVED_NAMES.has(name.value.toLowerCase())
        ? "syntax.reserved-name"
        : null;
    return code === null
      ? []
      : [
          locatedDiagnostic(
            source,
            code,
            name.span,
            code === "syntax.reserved-name"
              ? "Reserved name"
              : "Invalid identifier",
          ),
        ];
  });
}

function sortDiagnostics(values: LocatedDiagnostic[]): readonly Diagnostic[] {
  return values
    .sort(
      (left, right) =>
        left.span.start - right.span.start ||
        left.span.end - right.span.end ||
        (left.diagnostic.code < right.diagnostic.code
          ? -1
          : left.diagnostic.code > right.diagnostic.code
            ? 1
            : 0),
    )
    .filter(
      (value, index, all) =>
        index === 0 ||
        value.span.start !== all[index - 1].span.start ||
        value.span.end !== all[index - 1].span.end ||
        value.diagnostic.code !== all[index - 1].diagnostic.code,
    )
    .map(({ diagnostic }) => diagnostic);
}

export function parseSyntax(source: string): SyntaxResult {
  const lexResult = breadboardLexer.tokenize(source);
  breadboardParser.input = lexResult.tokens;
  const cst = breadboardParser.document() as CstNode;
  const ast = surfaceAstBuilder.visit(cst, source) as SurfaceDocument;
  const fromParser = parserDiagnostics(source);
  const fromLexer = lexResult.errors.map((error) =>
    locatedDiagnostic(
      source,
      "syntax.unexpected-token",
      { start: error.offset, end: error.offset + error.length },
      "Unexpected token",
    ),
  );
  const bom = source.charCodeAt(0) === 0xfeff
    ? [
        locatedDiagnostic(
          source,
          "syntax.bom",
          { start: 0, end: 1 },
          "Byte-order mark is not allowed",
        ),
      ]
    : [];

  return {
    ast,
    diagnostics: sortDiagnostics([
      ...fromLexer,
      ...bom,
      ...fromParser,
      ...astDiagnostics(source, ast, fromParser),
      ...literalDiagnostics(source, ast),
      ...nameDiagnostics(source, ast),
      ...statementOrderDiagnostics(source, ast),
    ]),
  };
}
