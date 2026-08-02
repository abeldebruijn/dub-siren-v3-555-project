import { createToken, Lexer, type TokenType } from "chevrotain";

export const LineContent = createToken({
  name: "LineContent",
  pattern: Lexer.NA,
});
export const NameLike = createToken({ name: "NameLike", pattern: Lexer.NA });

const content = { categories: [LineContent] };
const nameContent = { categories: [LineContent, NameLike] };

export const Whitespace = createToken({
  name: "Whitespace",
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED,
});
export const Comment = createToken({
  name: "Comment",
  pattern: /\/\/[^\r\n]*/,
  group: Lexer.SKIPPED,
});
export const Newline = createToken({
  name: "Newline",
  pattern: /\r?\n/,
  line_breaks: true,
});

export const Identifier = createToken({
  name: "Identifier",
  pattern: /[A-Za-z_][A-Za-z0-9_-]*/,
  ...nameContent,
});

function keyword(name: string, pattern: RegExp): TokenType {
  return createToken({
    name,
    pattern,
    longer_alt: Identifier,
    ...nameContent,
  });
}

export const BreadboardKeyword = keyword("BreadboardKeyword", /breadboard/i);
export const RowsKeyword = keyword("RowsKeyword", /rows/i);
export const ColumnsKeyword = keyword("ColumnsKeyword", /columns/i);
export const ChipKeyword = keyword("ChipKeyword", /chip/i);
export const HeightKeyword = keyword("HeightKeyword", /height/i);
export const WidthKeyword = keyword("WidthKeyword", /width/i);
export const ColorKeyword = keyword("ColorKeyword", /color/i);
export const PinKeyword = keyword("PinKeyword", /pin/i);
export const PlaceKeyword = keyword("PlaceKeyword", /place/i);
export const AtKeyword = keyword("AtKeyword", /at/i);
export const FlipKeyword = keyword("FlipKeyword", /flip/i);
export const WireKeyword = keyword("WireKeyword", /wire/i);
export const ViaKeyword = keyword("ViaKeyword", /via/i);
export const SaturationKeyword = keyword("SaturationKeyword", /saturation/i);

export const Arrow = createToken({ name: "Arrow", pattern: /-->/, ...content });
export const LeftBrace = createToken({
  name: "LeftBrace",
  pattern: /\{/,
  ...content,
});
export const RightBrace = createToken({
  name: "RightBrace",
  pattern: /\}/,
  ...content,
});
export const Pipe = createToken({ name: "Pipe", pattern: /\|/, ...content });
export const Comma = createToken({ name: "Comma", pattern: /,/, ...content });
export const Dot = createToken({ name: "Dot", pattern: /\./, ...content });
export const HexColorLiteral = createToken({
  name: "HexColorLiteral",
  pattern: /#[0-9A-Fa-f]{6}/,
  ...content,
});
export const InvalidHexColorLiteral = createToken({
  name: "InvalidHexColorLiteral",
  pattern: /#[^\s,}]*/,
  ...content,
});
export const PercentageLiteral = createToken({
  name: "PercentageLiteral",
  pattern: /\d+%/,
  ...content,
});
export const InvalidIdentifier = createToken({
  name: "InvalidIdentifier",
  pattern: /(?:\d+[A-Za-z_-][A-Za-z0-9_-]*|-[A-Za-z0-9_-]+)/,
  ...nameContent,
});
export const RowCoordinate = createToken({
  name: "RowCoordinate",
  pattern: /R\d+/i,
  longer_alt: Identifier,
  ...nameContent,
});
export const IntegerLiteral = createToken({
  name: "IntegerLiteral",
  pattern: /\d+/,
  ...content,
});
export const UnexpectedCharacter = createToken({
  name: "UnexpectedCharacter",
  pattern: /./,
  ...content,
});

export const topLevelKeywords = [
  BreadboardKeyword,
  ChipKeyword,
  PlaceKeyword,
  WireKeyword,
];
export const chipMemberKeywords = [
  HeightKeyword,
  WidthKeyword,
  ColorKeyword,
  PinKeyword,
];

export const breadboardTokens = [
  LineContent,
  NameLike,
  Whitespace,
  Comment,
  Newline,
  Arrow,
  LeftBrace,
  RightBrace,
  Pipe,
  Comma,
  Dot,
  HexColorLiteral,
  InvalidHexColorLiteral,
  PercentageLiteral,
  BreadboardKeyword,
  RowsKeyword,
  ColumnsKeyword,
  ChipKeyword,
  HeightKeyword,
  WidthKeyword,
  ColorKeyword,
  PinKeyword,
  PlaceKeyword,
  AtKeyword,
  FlipKeyword,
  WireKeyword,
  ViaKeyword,
  SaturationKeyword,
  InvalidIdentifier,
  RowCoordinate,
  Identifier,
  IntegerLiteral,
  UnexpectedCharacter,
];

export const breadboardLexer = new Lexer(breadboardTokens, {
  positionTracking: "full",
});
