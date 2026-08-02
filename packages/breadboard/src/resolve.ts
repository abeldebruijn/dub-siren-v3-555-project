import type {
  CanonicalPoint,
  CanonicalBreadboardModel,
  CanonicalChip,
  CanonicalPin,
  CanonicalWire,
  Diagnostic,
  Endpoint,
  ExactHole,
  ExactRailHole,
  ExactTerminalHole,
  Occupancy,
  RgbColor,
  SourceSpan,
  SurfaceColor,
  SurfaceDocument,
  SurfaceStatement,
  UnsupportedReason,
} from "./types.js";

type ChipStatement = Extract<SurfaceStatement, { kind: "chip-definition" }>;
type PlacementStatement = Extract<SurfaceStatement, { kind: "placement" }>;

type ResolvedDefinition = Readonly<{
  statement: ChipStatement;
  height: number;
  width: number;
  color: RgbColor;
  pins: ReadonlyMap<
    number,
    Readonly<{ label: string; aliases: readonly string[]; span: SourceSpan }>
  >;
}>;

type ResolvedInstance = Readonly<{
  definition: ResolvedDefinition;
  chip: CanonicalChip;
}>;

type HoleCandidate = Readonly<{
  hole: ExactHole;
  order: number;
}>;

type ValidationContext = {
  diagnostics: Diagnostic[];
  source: string;
};

export type ResolutionResult = Readonly<{
  model: CanonicalBreadboardModel | null;
  diagnostics: readonly Diagnostic[];
  unsupported: UnsupportedReason | null;
}>;

const NAMED_COLORS: Readonly<Record<string, RgbColor>> = {
  black: { r: 37, g: 37, b: 37 },
  red: { r: 214, g: 69, b: 69 },
  brown: { r: 121, g: 80, b: 45 },
  orange: { r: 217, g: 122, b: 36 },
  yellow: { r: 224, g: 185, b: 41 },
  green: { r: 63, g: 143, b: 85 },
  forest: { r: 21, g: 93, b: 58 },
  blue: { r: 38, g: 97, b: 156 },
  cyan: { r: 42, g: 167, b: 184 },
  purple: { r: 111, g: 61, b: 134 },
  grey: { r: 133, g: 133, b: 133 },
  white: { r: 250, g: 250, b: 250 },
};

function colorValue(color: SurfaceColor | null): RgbColor {
  if (color === null) return NAMED_COLORS.black as RgbColor;
  if (color.kind === "named-color") {
    return NAMED_COLORS[color.value] as RgbColor;
  }
  return {
    r: Number.parseInt(color.value.slice(1, 3), 16),
    g: Number.parseInt(color.value.slice(3, 5), 16),
    b: Number.parseInt(color.value.slice(5, 7), 16),
  };
}

function positionAt(source: string, offset: number) {
  const before = source.slice(0, Math.max(0, offset));
  const lines = before.split(/\r?\n/u);
  return {
    line: lines.length,
    column: Array.from(lines.at(-1) ?? "").length + 1,
  };
}

function rangeAt(source: string, span: SourceSpan) {
  return {
    start: positionAt(source, span.start),
    end: positionAt(source, span.end),
  };
}

function report(
  context: ValidationContext,
  code: string,
  span: SourceSpan,
  message: string,
  related: readonly SourceSpan[] = [],
  severity: "error" | "warning" = "error",
) {
  context.diagnostics.push({
    code,
    severity,
    range: rangeAt(context.source, span),
    message,
    ...(related.length === 0
      ? {}
      : { related: related.map((value) => rangeAt(context.source, value)) }),
  });
}

function terminalX4(columns: number, side: "left" | "right", column: number) {
  const centreX4 = (300 + 44 * columns) * 2;
  const delta = 4 * (52 + 22 * (column - 1));
  return side === "left" ? centreX4 - delta : centreX4 + delta;
}

function railX4(
  columns: number,
  side: "left" | "right",
  polarity: "positive" | "ground",
) {
  const width = 300 + 44 * columns;
  const x =
    side === "left"
      ? polarity === "positive"
        ? 62
        : 94
      : polarity === "positive"
        ? width - 94
        : width - 62;
  return x * 4;
}

function rowY4(row: number) {
  return 4 * (42 + 22 * (row - 1));
}

function holeKey(hole: ExactHole): string {
  return hole.kind === "rail-hole"
    ? `rail:${hole.side}:${hole.polarity}:${hole.row}`
    : `terminal:${hole.side}:${hole.row}:${hole.column}`;
}

function groupKey(hole: ExactHole): string {
  return hole.kind === "rail-hole"
    ? `rail:${hole.side}:${hole.polarity}`
    : `terminal:${hole.side}:${hole.row}`;
}

function holePoint(columns: number, hole: ExactHole): CanonicalPoint {
  return {
    x4:
      hole.kind === "rail-hole"
        ? railX4(columns, hole.side, hole.polarity)
        : terminalX4(columns, hole.side, hole.column),
    y4: rowY4(hole.row),
    source: null,
  };
}

function holeOrder(columns: number, hole: ExactHole): number {
  const lane =
    hole.kind === "rail-hole"
      ? hole.side === "left"
        ? hole.polarity === "positive"
          ? 0
          : 1
        : hole.polarity === "positive"
          ? columns * 2 + 2
          : columns * 2 + 3
      : hole.side === "left"
        ? 2 + (columns - hole.column)
        : 2 + columns + (hole.column - 1);
  return (hole.row - 1) * (columns * 2 + 4) + lane;
}

function allHoles(rows: number, columns: number): readonly ExactHole[] {
  const holes: ExactHole[] = [];
  for (let row = 1; row <= rows; row += 1) {
    holes.push(
      { kind: "rail-hole", side: "left", polarity: "positive", row },
      { kind: "rail-hole", side: "left", polarity: "ground", row },
    );
    for (let column = columns; column >= 1; column -= 1) {
      holes.push({ kind: "terminal-hole", side: "left", row, column });
    }
    for (let column = 1; column <= columns; column += 1) {
      holes.push({ kind: "terminal-hole", side: "right", row, column });
    }
    holes.push(
      { kind: "rail-hole", side: "right", polarity: "positive", row },
      { kind: "rail-hole", side: "right", polarity: "ground", row },
    );
  }
  return holes;
}

function definitionFrom(
  statement: ChipStatement,
  boardColumns: number,
  context: ValidationContext,
): ResolvedDefinition | null {
  const containsUnsupported = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.some(containsUnsupported);
    if (value === null || typeof value !== "object") return false;
    const node = value as Record<string, unknown>;
    return (
      ((node.kind === "integer" || node.kind === "percentage") &&
        node.supported === false) ||
      Object.values(node).some(containsUnsupported)
    );
  };
  if (containsUnsupported(statement)) return null;
  let valid = true;
  let highestRank = -1;
  const propertyFirst = new Map<string, SourceSpan>();
  const pinFirst = new Map<number, SourceSpan>();
  let previousPin = 0;

  for (const member of statement.members) {
    if (member.kind === "invalid-chip-member") continue;
    const rank =
      member.kind === "height-member"
        ? 0
        : member.kind === "width-member"
          ? 1
          : member.kind === "color-member"
            ? 2
            : 3;
    if (rank < highestRank) {
      report(
        context,
        "chip.member-order",
        member.span,
        "Chip member appears out of order",
      );
      valid = false;
    } else {
      highestRank = rank;
    }
    if (member.kind !== "pin-member") {
      const property = member.kind;
      const first = propertyFirst.get(property);
      if (first !== undefined) {
        report(
          context,
          "chip.duplicate-property",
          member.span,
          "Duplicate chip property",
          [first],
        );
        valid = false;
      } else {
        propertyFirst.set(property, member.span);
      }
      continue;
    }
    const number = member.number.value;
    if (number === null) continue;
    const firstPin = pinFirst.get(number);
    if (firstPin !== undefined) {
      report(
        context,
        "chip.duplicate-pin",
        member.number.span,
        "Duplicate pin declaration",
        [firstPin],
      );
      valid = false;
    } else {
      if (number < previousPin) {
        report(
          context,
          "chip.pin-order",
          member.number.span,
          "Pin declarations must be ascending",
        );
        valid = false;
      }
      pinFirst.set(number, member.number.span);
      previousPin = number;
    }
    const aliasFirst = new Map<string, SourceSpan>();
    for (const alias of member.aliases) {
      const key = alias.value.toLowerCase();
      const firstAlias = aliasFirst.get(key);
      if (firstAlias !== undefined) {
        report(
          context,
          "chip.duplicate-alias",
          alias.span,
          "Duplicate alias on one pin",
          [firstAlias],
        );
        valid = false;
      } else {
        aliasFirst.set(key, alias.span);
      }
    }
  }

  const heightMember = statement.members.find(
    (member) => member.kind === "height-member",
  );
  const widthMember = statement.members.find(
    (member) => member.kind === "width-member",
  );
  const colorMember = statement.members.find(
    (member) => member.kind === "color-member",
  );
  const pinMembers = statement.members.filter(
    (member) => member.kind === "pin-member",
  );
  const highestPin = Math.max(
    0,
    ...pinMembers.map((member) => member.number.value ?? 0),
  );
  const height =
    heightMember?.kind === "height-member"
      ? heightMember.height.value
      : highestPin > 0 && highestPin % 2 === 0
        ? highestPin / 2
        : null;
  if (height === null) {
    report(
      context,
      highestPin === 0
        ? "chip.height-not-inferable"
        : "chip.inferred-height-not-integral",
      statement.span,
      highestPin === 0
        ? "Chip height cannot be inferred without pins"
        : "Highest pin does not infer an integral height",
    );
    valid = false;
  }
  const resolvedHeight = height ?? 1;
  const width =
    widthMember?.kind === "width-member"
      ? (widthMember.width.value ?? 2)
      : 2;
  if (width < 2 || width > boardColumns * 2) {
    report(
      context,
      "chip.width-out-of-range",
      widthMember?.kind === "width-member" ? widthMember.width.span : statement.span,
      "Chip width exceeds the breadboard terminals",
    );
    valid = false;
  }
  if (height !== null) {
    for (const member of pinMembers) {
      const number = member.number.value;
      if (number !== null && number > resolvedHeight * 2) {
        report(
          context,
          "chip.pin-out-of-range",
          member.number.span,
          "Pin number exceeds the chip height",
        );
        valid = false;
      }
    }
  }
  if (!valid) return null;
  return {
    statement,
    height: resolvedHeight,
    width,
    color:
      colorMember?.kind === "color-member"
        ? colorValue(colorMember.color)
        : colorValue(null),
    pins: new Map(
      pinMembers.map((member) => [
        member.number.value ?? 0,
        {
          label: member.aliases[0]?.value ?? "",
          aliases: member.aliases.map(({ value }) => value.toLowerCase()),
          span: member.span,
        },
      ]),
    ),
  };
}

function selectorCandidates(
  endpoint: Endpoint,
  rows: number,
  columns: number,
  holes: readonly ExactHole[],
  occupied: ReadonlyMap<string, SourceSpan>,
  instances: ReadonlyMap<string, ResolvedInstance>,
  declaredInstances: ReadonlySet<string>,
  context: ValidationContext,
): readonly HoleCandidate[] | null {
  const available = (hole: ExactHole) => !occupied.has(holeKey(hole));
  const candidates = (values: readonly ExactHole[]) =>
    values
      .filter(available)
      .map((hole) => ({ hole, order: holeOrder(columns, hole) }));

  if (endpoint.kind === "rail-selector") {
    const row = endpoint.row?.value ?? null;
    if (row !== null && (row < 1 || row > rows)) {
      report(context, "selector.out-of-range", endpoint.row?.span ?? endpoint.span, "Rail row is outside the breadboard");
      return null;
    }
    const matching = holes.filter(
      (hole): hole is ExactRailHole =>
        hole.kind === "rail-hole" &&
        hole.polarity === endpoint.polarity.value &&
        (endpoint.side === null || hole.side === endpoint.side.value) &&
        (row === null || hole.row === row),
    );
    const exact = endpoint.side !== null && endpoint.row !== null;
    if (exact && matching[0] !== undefined && !available(matching[0])) {
      report(context, "selector.exact-hole-unavailable", endpoint.span, "Exact rail hole is unavailable");
      return null;
    }
    const result = candidates(matching);
    if (result.length === 0) {
      report(context, "selector.no-free-hole", endpoint.span, "Selector has no free hole");
      return null;
    }
    return result;
  }

  if (endpoint.kind === "terminal-selector") {
    const row = endpoint.row.value;
    const column = endpoint.column?.value ?? null;
    if (row === null || row < 1 || row > rows || (column !== null && (column < 1 || column > columns))) {
      const span =
        row === null || row < 1 || row > rows
          ? endpoint.row.span
          : (endpoint.column?.span ?? endpoint.span);
      report(context, "selector.out-of-range", span, "Terminal selector is outside the breadboard");
      return null;
    }
    const matching = holes.filter(
      (hole): hole is ExactTerminalHole =>
        hole.kind === "terminal-hole" &&
        hole.row === row &&
        (endpoint.side === null || hole.side === endpoint.side.value) &&
        (column === null || hole.column === column),
    );
    const exact = endpoint.side !== null && endpoint.column !== null;
    if (exact && matching[0] !== undefined && !available(matching[0])) {
      report(context, "selector.exact-hole-unavailable", endpoint.span, "Exact terminal hole is unavailable");
      return null;
    }
    const result = candidates(matching);
    if (result.length === 0) {
      report(context, "selector.no-free-hole", endpoint.span, "Selector has no free hole");
      return null;
    }
    return result;
  }

  const instanceKey = endpoint.instance.value.toLowerCase();
  const instance = instances.get(instanceKey);
  if (instance === undefined) {
    if (!declaredInstances.has(instanceKey)) {
      report(context, "selector.unknown-instance", endpoint.instance.span, "Unknown chip instance");
    }
    return null;
  }
  if (instance.chip.source.start > endpoint.span.start) {
    report(
      context,
      "name.forward-reference",
      endpoint.instance.span,
      "Chip instance is declared later",
      [instance.chip.source],
    );
    return null;
  }
  let matchingPins: readonly CanonicalPin[];
  if (endpoint.target.kind === "number") {
    const number = endpoint.target.number.value;
    if (number === null || number < 1 || number > instance.definition.height * 2) {
      report(context, "selector.unknown-pin", endpoint.target.span, "Unknown physical pin");
      return null;
    }
    matchingPins = instance.chip.pins.filter((pin) => pin.number === number);
  } else {
    const alias = endpoint.target.alias.value.toLowerCase();
    matchingPins = instance.chip.pins.filter((pin) =>
      instance.definition.pins.get(pin.number)?.aliases.includes(alias),
    );
    if (matchingPins.length === 0) {
      report(context, "selector.unknown-alias", endpoint.target.span, "Unknown pin alias");
      return null;
    }
  }
  const groups = new Set(matchingPins.map(({ hole }) => groupKey(hole)));
  const result = candidates(
    holes.filter(
      (hole) => hole.kind === "terminal-hole" && groups.has(groupKey(hole)),
    ),
  );
  if (result.length === 0) {
    report(context, "selector.no-free-hole", endpoint.span, "Pin selector has no free terminal hole");
    return null;
  }
  return result;
}

function canonicalHole(hole: ExactHole): string {
  if (hole.kind === "rail-hole") {
    return `${hole.side === "left" ? "L" : "R"}${hole.polarity === "positive" ? "P" : "G"}${hole.row}`;
  }
  return `${hole.side === "left" ? "LT" : "RT"}-R${hole.row}C${hole.column}`;
}

function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

function applySaturation(color: RgbColor, percentage: number): RgbColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const finalSaturation = saturation * (percentage / 100);
  const chroma = (1 - Math.abs(2 * lightness - 1)) * finalSaturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  const [rr, gg, bb] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const round = (channel: number) => Math.floor((channel + m) * 255 + 0.5);
  return { r: round(rr), g: round(gg), b: round(bb) };
}

function wireColor(
  statement: Extract<SurfaceStatement, { kind: "wire" }>,
  from: ExactHole,
) {
  const palette = ["brown", "orange", "yellow", "green", "blue", "purple", "grey", "white"] as const;
  const base =
    statement.color !== null
      ? colorValue(statement.color)
      : from.kind === "rail-hole" && from.polarity === "positive"
        ? colorValue({ kind: "named-color", value: "red", spelling: "red", span: statement.from.span })
        : from.kind === "rail-hole" && from.polarity === "ground"
          ? colorValue({ kind: "named-color", value: "black", spelling: "black", span: statement.from.span })
          : (NAMED_COLORS[palette[fnv1a(canonicalHole(from)) % palette.length]] as RgbColor);
  const underlay =
    (base.r === 250 && base.g === 250 && base.b === 250) ||
    (base.r === 224 && base.g === 185 && base.b === 41);
  const final = applySaturation(base, statement.saturation?.value ?? 100);
  return { ...final, underlay };
}

function explicitRoute(
  statement: Extract<SurfaceStatement, { kind: "wire" }>,
  from: ExactHole,
  to: ExactHole,
  rows: number,
  columns: number,
  context: ValidationContext,
): readonly CanonicalPoint[] | null {
  if (statement.via === null) return null;
  const interior: CanonicalPoint[] = [];
  for (const point of statement.via) {
    const row = point.row.value;
    const column = point.kind === "exact-terminal-point" ? point.column.value : null;
    if (
      row === null ||
      row < 1 ||
      row > rows ||
      (column !== null && (column < 1 || column > columns))
    ) {
      report(
        context,
        "route.point-not-hole",
        point.span,
        "Route point is outside the breadboard",
      );
      return [];
    }
    const hole: ExactHole =
      point.kind === "exact-rail-point"
        ? {
            kind: "rail-hole",
            side: point.side.value,
            polarity: point.polarity.value,
            row,
          }
        : {
            kind: "terminal-hole",
            side: point.side.value,
            row,
            column: column as number,
          };
    interior.push({ ...holePoint(columns, hole), source: point.span });
  }
  const path = [holePoint(columns, from), ...interior, holePoint(columns, to)];
  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1] as CanonicalPoint;
    const current = path[index] as CanonicalPoint;
    const span = current.source ?? statement.to.span;
    if (previous.x4 === current.x4 && previous.y4 === current.y4) {
      report(context, "route.duplicate-point", span, "Route repeats a point");
      return [];
    }
    if (previous.x4 !== current.x4 && previous.y4 !== current.y4) {
      report(context, "route.diagonal", span, "Route segment is diagonal");
      return [];
    }
  }
  for (let index = 1; index < path.length - 1; index += 1) {
    const before = path[index - 1] as CanonicalPoint;
    const current = path[index] as CanonicalPoint;
    const after = path[index + 1] as CanonicalPoint;
    const first = { x: current.x4 - before.x4, y: current.y4 - before.y4 };
    const second = { x: after.x4 - current.x4, y: after.y4 - current.y4 };
    if ((first.x === 0) === (second.x === 0)) {
      const dot = first.x * second.x + first.y * second.y;
      report(
        context,
        dot < 0 ? "route.reversal" : "route.collinear",
        current.source ?? statement.span,
        dot < 0 ? "Route reverses direction" : "Route point is not a turn",
      );
      return [];
    }
  }
  return path;
}

type GridPoint = Readonly<{ x4: number; y4: number }>;
type Segment = Readonly<{ from: GridPoint; to: GridPoint }>;
type RouteCost = readonly [number, number, number, number, number];

function segments(path: readonly CanonicalPoint[]): readonly Segment[] {
  return path.slice(1).map((to, index) => ({
    from: path[index] as CanonicalPoint,
    to,
  }));
}

function overlapLength(left: Segment, right: Segment): number {
  if (
    left.from.y4 === left.to.y4 &&
    right.from.y4 === right.to.y4 &&
    left.from.y4 === right.from.y4
  ) {
    return Math.max(
      0,
      Math.min(Math.max(left.from.x4, left.to.x4), Math.max(right.from.x4, right.to.x4)) -
        Math.max(Math.min(left.from.x4, left.to.x4), Math.min(right.from.x4, right.to.x4)),
    );
  }
  if (
    left.from.x4 === left.to.x4 &&
    right.from.x4 === right.to.x4 &&
    left.from.x4 === right.from.x4
  ) {
    return Math.max(
      0,
      Math.min(Math.max(left.from.y4, left.to.y4), Math.max(right.from.y4, right.to.y4)) -
        Math.max(Math.min(left.from.y4, left.to.y4), Math.min(right.from.y4, right.to.y4)),
    );
  }
  return 0;
}

function crosses(left: Segment, right: Segment): boolean {
  const horizontal = left.from.y4 === left.to.y4 ? left : right;
  const vertical = horizontal === left ? right : left;
  if (
    horizontal.from.y4 !== horizontal.to.y4 ||
    vertical.from.x4 !== vertical.to.x4
  ) {
    return false;
  }
  const x = vertical.from.x4;
  const y = horizontal.from.y4;
  return (
    x > Math.min(horizontal.from.x4, horizontal.to.x4) &&
    x < Math.max(horizontal.from.x4, horizontal.to.x4) &&
    y > Math.min(vertical.from.y4, vertical.to.y4) &&
    y < Math.max(vertical.from.y4, vertical.to.y4)
  );
}

function compareNumbers(left: readonly number[], right: readonly number[]) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] ?? -1) - (right[index] ?? -1);
    if (difference !== 0) return difference;
  }
  return 0;
}

function compareGridPath(left: readonly GridPoint[], right: readonly GridPoint[]) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index];
    const b = right[index];
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    const difference = a.y4 - b.y4 || a.x4 - b.x4;
    if (difference !== 0) return difference;
  }
  return 0;
}

function collapsePath(path: readonly GridPoint[]): readonly GridPoint[] {
  const result: GridPoint[] = [];
  for (const point of path) {
    const before = result.at(-2);
    const previous = result.at(-1);
    if (
      before !== undefined &&
      previous !== undefined &&
      ((before.x4 === previous.x4 && previous.x4 === point.x4) ||
        (before.y4 === previous.y4 && previous.y4 === point.y4))
    ) {
      result[result.length - 1] = point;
    } else {
      result.push(point);
    }
  }
  return result;
}

function automaticRoute(
  from: CanonicalPoint,
  to: CanonicalPoint,
  chips: readonly CanonicalChip[],
  earlierWires: readonly CanonicalWire[],
  rows: number,
  columns: number,
): readonly CanonicalPoint[] | null {
  const width4 = (300 + 44 * columns) * 4;
  const height4 = (56 + 22 * rows) * 4;
  const obstacles = chips.map(({ body }) => ({
    left: body.x4 - 28,
    right: body.x4 + body.width4 + 28,
    top: body.y4 - 28,
    bottom: body.y4 + body.height4 + 28,
  }));
  const xs = new Set([from.x4, to.x4, 32, width4 - 32]);
  const ys = new Set([from.y4, to.y4, 16, height4 - 32]);
  for (const obstacle of obstacles) {
    xs.add(obstacle.left - 1);
    xs.add(obstacle.right + 1);
    ys.add(obstacle.top - 1);
    ys.add(obstacle.bottom + 1);
  }
  const blockedPoint = (point: GridPoint) =>
    obstacles.some(
      (obstacle) =>
        point.x4 >= obstacle.left &&
        point.x4 <= obstacle.right &&
        point.y4 >= obstacle.top &&
        point.y4 <= obstacle.bottom,
    );
  const blockedSegment = (segment: Segment) =>
    obstacles.some((obstacle) => {
      if (segment.from.y4 === segment.to.y4) {
        return (
          segment.from.y4 >= obstacle.top &&
          segment.from.y4 <= obstacle.bottom &&
          Math.max(Math.min(segment.from.x4, segment.to.x4), obstacle.left) <=
            Math.min(Math.max(segment.from.x4, segment.to.x4), obstacle.right)
        );
      }
      return (
        segment.from.x4 >= obstacle.left &&
        segment.from.x4 <= obstacle.right &&
        Math.max(Math.min(segment.from.y4, segment.to.y4), obstacle.top) <=
          Math.min(Math.max(segment.from.y4, segment.to.y4), obstacle.bottom)
      );
    });
  const nodes = [...ys].flatMap((y4) =>
    [...xs]
      .map((x4) => ({ x4, y4 }))
      .filter((point) => !blockedPoint(point)),
  );
  const earlierSegments = earlierWires.flatMap(({ path }) => segments(path));
  type State = Readonly<{
    point: GridPoint;
    direction: "H" | "V" | null;
    cost: RouteCost;
    path: readonly GridPoint[];
  }>;
  const compareState = (left: State, right: State) =>
    compareNumbers(left.cost, right.cost) ||
    compareGridPath(collapsePath(left.path), collapsePath(right.path));
  const queue: State[] = [
    { point: from, direction: null, cost: [0, 0, 0, 0, 0], path: [from] },
  ];
  const best = new Map<string, State>();

  while (queue.length > 0) {
    queue.sort(compareState);
    const state = queue.shift() as State;
    const key = `${state.point.x4}:${state.point.y4}:${state.direction ?? "N"}`;
    const prior = best.get(key);
    if (prior !== undefined && compareState(prior, state) <= 0) continue;
    best.set(key, state);
    if (state.point.x4 === to.x4 && state.point.y4 === to.y4) {
      return collapsePath(state.path).map(({ x4, y4 }) => ({
        x4,
        y4,
        source: null,
      }));
    }
    for (const next of nodes) {
      if (
        (next.x4 === state.point.x4 && next.y4 === state.point.y4) ||
        (next.x4 !== state.point.x4 && next.y4 !== state.point.y4)
      ) {
        continue;
      }
      const edge = { from: state.point, to: next };
      if (blockedSegment(edge)) continue;
      const direction = next.y4 === state.point.y4 ? "H" : "V";
      const bend = state.direction !== null && state.direction !== direction ? 1 : 0;
      const overlap = earlierSegments.reduce(
        (total, segment) => total + overlapLength(edge, segment),
        0,
      );
      const crossing = earlierSegments.filter((segment) => crosses(edge, segment)).length;
      const distance =
        Math.abs(next.x4 - state.point.x4) +
        Math.abs(next.y4 - state.point.y4);
      const firstVertical = state.direction === null && direction === "V" ? 1 : 0;
      const candidate: State = {
        point: next,
        direction,
        cost: [
          state.cost[0] + bend,
          state.cost[1] + overlap,
          state.cost[2] + crossing,
          state.cost[3] + distance,
          state.cost[4] + firstVertical,
        ],
        path: [...state.path, next],
      };
      queue.push(candidate);
    }
  }
  return null;
}

function pathsOverlap(
  left: readonly CanonicalPoint[],
  right: readonly CanonicalPoint[],
) {
  return segments(left).some((a) =>
    segments(right).some((b) => overlapLength(a, b) > 0),
  );
}

class Connectivity {
  private readonly parent = new Map<string, string>();

  public connected(left: string, right: string) {
    return this.find(left) === this.find(right);
  }

  public union(left: string, right: string) {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot !== rightRoot) this.parent.set(rightRoot, leftRoot);
  }

  private find(value: string): string {
    const parent = this.parent.get(value);
    if (parent === undefined) {
      this.parent.set(value, value);
      return value;
    }
    if (parent === value) return value;
    const root = this.find(parent);
    this.parent.set(value, root);
    return root;
  }
}

function placeChip(
  placement: PlacementStatement,
  definition: ResolvedDefinition,
  columns: number,
): Readonly<{ chip: CanonicalChip; occupancy: readonly Occupancy[] }> {
  const flip = placement.flip !== null;
  const leftWidth = flip
    ? Math.ceil(definition.width / 2)
    : Math.floor(definition.width / 2);
  const rightWidth = definition.width - leftWidth;
  const pinColumn = { left: leftWidth, right: rightWidth } as const;
  const pins: CanonicalPin[] = [];
  const occupancy: Occupancy[] = [];
  const pinByHole = new Map<string, number>();

  for (let number = 1; number <= definition.height * 2; number += 1) {
    const firstSide = number <= definition.height;
    const side = flip
      ? firstSide
        ? "right"
        : "left"
      : firstSide
        ? "left"
        : "right";
    const offset = firstSide
      ? number - 1
      : definition.height * 2 - number;
    const hole: ExactTerminalHole = {
      kind: "terminal-hole",
      side,
      row: (placement.row.value ?? 1) + offset,
      column: pinColumn[side],
    };
    const declaration = definition.pins.get(number);
    pins.push({
      number,
      hole,
      label: declaration?.label || null,
      source: declaration?.span ?? null,
    });
    pinByHole.set(holeKey(hole), number);
  }

  for (let row = placement.row.value ?? 1; row < (placement.row.value ?? 1) + definition.height; row += 1) {
    for (const side of ["left", "right"] as const) {
      for (let column = 1; column <= (side === "left" ? leftWidth : rightWidth); column += 1) {
        const hole: ExactTerminalHole = {
          kind: "terminal-hole",
          side,
          row,
          column,
        };
        const pin = pinByHole.get(holeKey(hole));
        occupancy.push(
          pin === undefined
            ? {
                kind: "chip-covered",
                hole,
                chip: placement.instance.value,
              }
            : {
                kind: "chip-pin",
                hole,
                chip: placement.instance.value,
                pin,
              },
        );
      }
    }
  }

  const leftX4 = terminalX4(columns, "left", leftWidth);
  const rightX4 = terminalX4(columns, "right", rightWidth);
  const topY4 = rowY4(placement.row.value ?? 1);
  const bottomY4 = rowY4(
    (placement.row.value ?? 1) + definition.height - 1,
  );
  return {
    chip: {
      definitionName: definition.statement.name.spelling,
      instanceName: placement.instance.spelling,
      flip,
      color:
        placement.color === null ? definition.color : colorValue(placement.color),
      body: {
        x4: leftX4 - 20,
        y4: topY4 - 36,
        width4: rightX4 - leftX4 + 40,
        height4: bottomY4 - topY4 + 72,
      },
      pins,
      source: placement.span,
    },
    occupancy,
  };
}

export function resolveBreadboard(
  ast: SurfaceDocument,
  source: string,
): ResolutionResult {
  const context: ValidationContext = { diagnostics: [], source };
  let unsupportedInteger: SourceSpan | null = null;
  const findUnsupported = (value: unknown): void => {
    if (unsupportedInteger !== null) return;
    if (Array.isArray(value)) {
      for (const item of value) findUnsupported(item);
      return;
    }
    if (value === null || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if (
      (node.kind === "integer" || node.kind === "percentage") &&
      node.supported === false
    ) {
      unsupportedInteger = node.span as SourceSpan;
      return;
    }
    for (const child of Object.values(node)) findUnsupported(child);
  };
  findUnsupported(ast);
  const boardStatements = ast.statements.filter(
    (statement) => statement.kind === "breadboard",
  );
  const boardStatement = boardStatements[0];
  for (const duplicate of boardStatements.slice(1)) {
    report(
      context,
      "document.multiple-boards",
      duplicate.span,
      "Only one breadboard declaration is allowed",
      boardStatement === undefined ? [] : [boardStatement.span],
    );
  }
  const rows =
    boardStatement?.kind === "breadboard" ? (boardStatement.rows.value ?? 30) : 30;
  const columns =
    boardStatement?.kind === "breadboard"
      ? (boardStatement.columns?.value ?? 5)
      : 5;
  const resourceLimit =
    unsupportedInteger === null && rows * (columns * 2 + 4) > 200_000;
  const definitions = new Map<string, ResolvedDefinition>();
  const definitionStatements = new Map<string, ChipStatement>();
  const names = new Map<string, SourceSpan>();
  if (boardStatement?.kind === "breadboard" && boardStatement.name !== null) {
    names.set(boardStatement.name.value.toLowerCase(), boardStatement.name.span);
  }
  for (const statement of ast.statements) {
    if (statement.kind === "chip-definition") {
      const nameKey = statement.name.value.toLowerCase();
      if (!definitionStatements.has(nameKey)) {
        definitionStatements.set(nameKey, statement);
      }
      const firstName = names.get(nameKey);
      if (firstName !== undefined) {
        report(
          context,
          "name.duplicate",
          statement.name.span,
          "Name is already declared",
          [firstName],
        );
      } else {
        names.set(nameKey, statement.name.span);
      }
      const definition = definitionFrom(statement, columns, context);
      if (definition !== null) {
        definitions.set(nameKey, definition);
      }
    }
  }

  if (resourceLimit) {
    return {
      model: null,
      diagnostics: context.diagnostics,
      unsupported: {
        code: "resource-limit",
        message: "Breadboard exceeds the compiler resource limit",
        span: boardStatement?.span ?? null,
      },
    };
  }

  const chips: CanonicalChip[] = [];
  const occupancy: Occupancy[] = [];
  const occupied = new Map<string, SourceSpan>();
  const instances = new Map<string, ResolvedInstance>();
  const declaredInstances = new Set<string>();
  for (const statement of ast.statements) {
    if (statement.kind !== "placement") continue;
    const nameKey = statement.instance.value.toLowerCase();
    declaredInstances.add(nameKey);
    if (!statement.row.supported) continue;
    const firstName = names.get(nameKey);
    if (firstName !== undefined) {
      report(
        context,
        "name.duplicate",
        statement.instance.span,
        "Name is already declared",
        [firstName],
      );
      continue;
    }
    names.set(nameKey, statement.instance.span);
    const definitionKey = statement.definition.value.toLowerCase();
    const declaration = definitionStatements.get(definitionKey);
    if (declaration !== undefined && declaration.span.start > statement.span.start) {
      report(
        context,
        "name.forward-reference",
        statement.definition.span,
        "Chip definition is declared later",
        [declaration.name.span],
      );
      continue;
    }
    const definition = definitions.get(definitionKey);
    if (definition === undefined) {
      if (declaration === undefined) {
        report(
          context,
          "placement.unknown-chip",
          statement.definition.span,
          "Unknown chip definition",
        );
      }
      continue;
    }
    const row = statement.row.value ?? 1;
    if (row + definition.height - 1 > rows) {
      report(
        context,
        "placement.row-overflow",
        statement.row.span,
        "Chip placement exceeds the breadboard rows",
      );
      continue;
    }
    const placed = placeChip(statement, definition, columns);
    const collision = placed.occupancy.find((entry) =>
      occupied.has(holeKey(entry.hole as ExactTerminalHole)),
    );
    if (collision !== undefined) {
      const first = occupied.get(holeKey(collision.hole as ExactTerminalHole));
      report(
        context,
        "placement.overlap",
        statement.span,
        "Chip footprint overlaps an earlier placement",
        first === undefined ? [] : [first],
      );
      continue;
    }
    chips.push(placed.chip);
    occupancy.push(...placed.occupancy);
    instances.set(nameKey, { definition, chip: placed.chip });
    for (const entry of placed.occupancy) {
      occupied.set(holeKey(entry.hole), statement.span);
    }
  }

  const holes = allHoles(rows, columns);
  const wires: CanonicalWire[] = [];
  const connectivity = new Connectivity();
  const wireStatements = ast.statements.filter(
    (statement) => statement.kind === "wire",
  );
  for (const [index, statement] of wireStatements.entries()) {
    const hasUnsupported = (value: unknown): boolean => {
      if (Array.isArray(value)) return value.some(hasUnsupported);
      if (value === null || typeof value !== "object") return false;
      const node = value as Record<string, unknown>;
      return (
        ((node.kind === "integer" || node.kind === "percentage") &&
          node.supported === false) ||
        Object.values(node).some(hasUnsupported)
      );
    };
    if (hasUnsupported(statement)) continue;
    const fromCandidates = selectorCandidates(
      statement.from,
      rows,
      columns,
      holes,
      occupied,
      instances,
      declaredInstances,
      context,
    );
    const toCandidates = selectorCandidates(
      statement.to,
      rows,
      columns,
      holes,
      occupied,
      instances,
      declaredInstances,
      context,
    );
    if (fromCandidates === null || toCandidates === null) continue;
    const pairs = fromCandidates.flatMap((from) =>
      toCandidates
        .filter((to) => groupKey(from.hole) !== groupKey(to.hole))
        .map((to) => {
          const fromPoint = holePoint(columns, from.hole);
          const toPoint = holePoint(columns, to.hole);
          return {
            from,
            to,
            bends:
              fromPoint.x4 === toPoint.x4 || fromPoint.y4 === toPoint.y4
                ? 0
                : 1,
            length:
              Math.abs(fromPoint.x4 - toPoint.x4) +
              Math.abs(fromPoint.y4 - toPoint.y4),
          };
        }),
    );
    if (pairs.length === 0) {
      const exact = (endpoint: Endpoint) =>
        endpoint.kind === "rail-selector"
          ? endpoint.side !== null && endpoint.row !== null
          : endpoint.kind === "terminal-selector"
            ? endpoint.side !== null && endpoint.column !== null
            : false;
      report(
        context,
        exact(statement.from) && exact(statement.to)
          ? "wire.redundant"
          : "selector.no-valid-pair",
        statement.span,
        "Wire endpoints cannot form a valid connection",
      );
      continue;
    }
    pairs.sort(
      (left, right) =>
        left.bends - right.bends ||
        left.length - right.length ||
        left.from.order - right.from.order ||
        left.to.order - right.to.order,
    );
    const selected = pairs[0];
    if (selected === undefined) continue;
    const fromPoint = holePoint(columns, selected.from.hole);
    const toPoint = holePoint(columns, selected.to.hole);
    const explicit = explicitRoute(
      statement,
      selected.from.hole,
      selected.to.hole,
      rows,
      columns,
      context,
    );
    if (explicit !== null && explicit.length === 0) continue;
    const path =
      explicit ??
      automaticRoute(
        fromPoint,
        toPoint,
        chips,
        wires,
        rows,
        columns,
      );
    if (path === null) {
      report(context, "route.no-path", statement.span, "No automatic route is available");
      continue;
    }
    const fromGroup = groupKey(selected.from.hole);
    const toGroup = groupKey(selected.to.hole);
    if (connectivity.connected(fromGroup, toGroup)) {
      report(
        context,
        "connection.duplicate",
        statement.span,
        "Earlier wires already connect these electrical groups",
        [],
        "warning",
      );
    }
    connectivity.union(fromGroup, toGroup);
    if (wires.some((wire) => pathsOverlap(path, wire.path))) {
      report(
        context,
        "route.overlap",
        statement.span,
        "Wire route overlaps an earlier wire",
        [],
        "warning",
      );
    }
    const number = index + 1;
    wires.push({
      number,
      from: { hole: selected.from.hole, source: statement.from.span },
      to: { hole: selected.to.hole, source: statement.to.span },
      path,
      color: wireColor(statement, selected.from.hole),
      source: statement.span,
    });
    occupancy.push(
      {
        kind: "wire-endpoint",
        hole: selected.from.hole,
        wire: number,
        end: "from",
      },
      {
        kind: "wire-endpoint",
        hole: selected.to.hole,
        wire: number,
        end: "to",
      },
    );
    occupied.set(holeKey(selected.from.hole), statement.from.span);
    occupied.set(holeKey(selected.to.hole), statement.to.span);
  }

  occupancy.sort(
    (left, right) =>
      holeOrder(columns, left.hole) - holeOrder(columns, right.hole),
  );

  return {
    model: {
      kind: "breadboard-model",
      board: {
        name:
          boardStatement?.kind === "breadboard"
            ? (boardStatement.name?.value ?? null)
            : null,
        rows,
        columns,
        source:
          boardStatement?.kind === "breadboard" ? boardStatement.span : null,
      },
      chips,
      wires,
      occupancy,
    },
    diagnostics: context.diagnostics,
    unsupported:
      unsupportedInteger === null
        ? null
        : {
            code: "integer-out-of-range",
            message: "Integer exceeds the supported safe range",
            span: unsupportedInteger,
          },
  };
}
