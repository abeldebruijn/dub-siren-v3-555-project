import type {
  CanonicalCapacitor,
  CanonicalComponent,
  CanonicalLed,
  CanonicalPoint,
  CanonicalResistor,
  CapacitorMember,
  Diagnostic,
  Endpoint,
  ExactHole,
  Occupancy,
  ResistorBandColor,
  RgbColor,
  LedMember,
  SourceSpan,
  SurfaceColor,
  SurfaceStatement,
} from "../types.js";

export type HoleCandidate = Readonly<{ hole: ExactHole; order: number }>;

type TwoTerminalStatement = Extract<
  SurfaceStatement,
  { kind: "led" | "capacitor" | "resistor" }
>;

export type TwoTerminalResolution = Readonly<{
  components: readonly CanonicalComponent[];
  occupancy: readonly Occupancy[];
}>;

export type TwoTerminalResolver = Readonly<{
  statements: readonly SurfaceStatement[];
  candidates: (endpoint: Endpoint) => readonly HoleCandidate[] | null;
  groupKey: (hole: ExactHole) => string;
  point: (hole: ExactHole) => CanonicalPoint;
  color: (value: SurfaceColor | null) => RgbColor;
  report: (
    code: string,
    span: SourceSpan,
    message: string,
    related?: readonly SourceSpan[],
    severity?: Diagnostic["severity"],
  ) => void;
  occupy: (hole: ExactHole, span: SourceSpan) => void;
  register?: (component: CanonicalComponent) => void;
}>;

const TYPE_COLORS: Readonly<Record<CanonicalCapacitor["type"], RgbColor>> = {
  ceramic: { r: 217, g: 122, b: 36 },
  electrolytic: { r: 38, g: 97, b: 156 },
  film: { r: 214, g: 69, b: 69 },
  tantalum: { r: 224, g: 185, b: 41 },
  supercapacitor: { r: 37, g: 37, b: 37 },
};

const DIGIT_COLORS: readonly ResistorBandColor[] = [
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "grey",
  "white",
];

function isPolarized(type: CanonicalCapacitor["type"]) {
  return type === "electrolytic" || type === "tantalum" || type === "supercapacitor";
}

function isRail(
  hole: ExactHole,
  polarity: "positive" | "ground",
): boolean {
  return hole.kind === "rail-hole" && hole.polarity === polarity;
}

function selectEndpoints(
  statement: TwoTerminalStatement,
  resolver: TwoTerminalResolver,
): Readonly<{ from: HoleCandidate; to: HoleCandidate }> | null {
  const fromCandidates = resolver.candidates(statement.from);
  const toCandidates = resolver.candidates(statement.to);
  if (fromCandidates === null || toCandidates === null) return null;

  const pairs = fromCandidates.flatMap((from) =>
    toCandidates
      .filter(
        (to) =>
          resolver.groupKey(from.hole) !== resolver.groupKey(to.hole) &&
          !(isRail(from.hole, "positive") && isRail(to.hole, "positive")) &&
          !(isRail(from.hole, "ground") && isRail(to.hole, "ground")),
      )
      .map((to) => {
        const fromPoint = resolver.point(from.hole);
        const toPoint = resolver.point(to.hole);
        return {
          from,
          to,
          length: Math.abs(fromPoint.x4 - toPoint.x4) + Math.abs(fromPoint.y4 - toPoint.y4),
        };
      }),
  );
  if (pairs.length === 0) {
    const sameGroup = fromCandidates.some((from) =>
      toCandidates.some((to) => resolver.groupKey(from.hole) === resolver.groupKey(to.hole)),
    );
    resolver.report(
      sameGroup ? "component.same-group" : "component.same-polarity-rail",
      statement.span,
      sameGroup
        ? "Component endpoints resolve to the same electrical group"
        : "Component endpoints cannot both use positive rails or both use ground rails",
    );
    return null;
  }
  pairs.sort(
    (left, right) =>
      left.length - right.length ||
      left.from.order - right.from.order ||
      left.to.order - right.to.order,
  );
  return pairs[0] ?? null;
}

function sourceColor(
  members: readonly (LedMember | CapacitorMember)[],
): SurfaceColor | null {
  const member = members.find((value) => value.kind === "color-member");
  return member?.color ?? null;
}

function duplicateMembers(
  members: readonly { kind: string; span: SourceSpan }[],
  component: string,
  resolver: TwoTerminalResolver,
): boolean {
  const seen = new Map<string, SourceSpan>();
  let valid = true;
  for (const member of members) {
    if (member.kind.startsWith("invalid-")) {
      valid = false;
      continue;
    }
    const first = seen.get(member.kind);
    if (first !== undefined) {
      resolver.report(
        `${component}.duplicate-property`,
        member.span,
        "Component property cannot be repeated",
        [first],
      );
      valid = false;
    } else {
      seen.set(member.kind, member.span);
    }
  }
  return valid;
}

function validPositive(
  value: { supported: boolean; value?: number | null; ohms?: number | null; span: SourceSpan },
  component: string,
  property: string,
  resolver: TwoTerminalResolver,
): number | null {
  const number = "ohms" in value ? value.ohms : value.value;
  if (!value.supported || number === null || number === undefined || number <= 0) {
    resolver.report(
      `${component}.invalid-${property}`,
      value.span,
      `${property} must be a positive value`,
    );
    return null;
  }
  return number;
}

function resistorBands(value: number, bands: 4 | 5 | 6): readonly ResistorBandColor[] | null {
  const figures = bands === 4 ? 2 : 3;
  const minimum = 10 ** (figures - 1);
  const maximum = 10 ** figures - 1;
  for (let multiplier = -2; multiplier <= 9; multiplier += 1) {
    const scaled = value / 10 ** multiplier;
    const rounded = Math.round(scaled);
    if (
      rounded >= minimum &&
      rounded <= maximum &&
      Math.abs(scaled - rounded) <= Math.max(1, Math.abs(scaled)) * 1e-12
    ) {
      const digits = String(rounded)
        .split("")
        .map((digit) => DIGIT_COLORS[Number(digit)] as ResistorBandColor);
      const multiplierColor =
        multiplier === -2 ? "silver" : multiplier === -1 ? "gold" : DIGIT_COLORS[multiplier];
      return [
        ...digits,
        multiplierColor as ResistorBandColor,
        "gold",
        ...(bands === 6 ? (["brown"] as const) : []),
      ];
    }
  }
  return null;
}

function terminals(
  statement: TwoTerminalStatement,
  from: ExactHole,
  to: ExactHole,
) {
  return [
    { number: 1, hole: from, name: null, source: statement.from.span },
    { number: 2, hole: to, name: null, source: statement.to.span },
  ] as const;
}

function resolveLed(
  statement: Extract<TwoTerminalStatement, { kind: "led" }>,
  selected: Readonly<{ from: HoleCandidate; to: HoleCandidate }>,
  resolver: TwoTerminalResolver,
): CanonicalLed | null {
  if (!duplicateMembers(statement.members, "led", resolver)) return null;
  const onMember = statement.members.find((member) => member.kind === "on-member");
  const legsMember = statement.members.find((member) => member.kind === "display-legs-member");
  if (isRail(selected.from.hole, "ground")) {
    resolver.report(
      "component.polarity-warning",
      statement.from.span,
      "LED polarity is directly connected to the opposite rail",
      [],
      "warning",
    );
  }
  if (isRail(selected.to.hole, "positive")) {
    resolver.report(
      "component.polarity-warning",
      statement.to.span,
      "LED polarity is directly connected to the opposite rail",
      [],
      "warning",
    );
  }
  return {
    kind: "led",
    name: statement.name.spelling,
    color: resolver.color(sourceColor(statement.members) ?? { kind: "named-color", value: "red", spelling: "red", span: statement.span }),
    on: onMember?.kind === "on-member" ? onMember.on.value : false,
    displayLegs: legsMember?.kind === "display-legs-member" ? legsMember.displayLegs.value : true,
    body: { from: resolver.point(selected.from.hole), to: resolver.point(selected.to.hole) },
    terminals: terminals(statement, selected.from.hole, selected.to.hole),
    source: statement.span,
  };
}

function resolveCapacitor(
  statement: Extract<TwoTerminalStatement, { kind: "capacitor" }>,
  selected: Readonly<{ from: HoleCandidate; to: HoleCandidate }>,
  resolver: TwoTerminalResolver,
): CanonicalCapacitor | null {
  if (!duplicateMembers(statement.members, "capacitor", resolver)) return null;
  const typeMember = statement.members.find((member) => member.kind === "capacitor-type-member");
  const type = typeMember?.kind === "capacitor-type-member" ? typeMember.type.value : "ceramic";
  const capacitanceMember = statement.members.find((member) => member.kind === "capacitance-member");
  const maxVoltageMember = statement.members.find((member) => member.kind === "max-voltage-member");
  const capacitance =
    capacitanceMember?.kind === "capacitance-member"
      ? validPositive(capacitanceMember.capacitance, "capacitor", "capacitance", resolver)
      : null;
  const maxVoltage =
    maxVoltageMember?.kind === "max-voltage-member"
      ? validPositive(maxVoltageMember.maxVoltage, "capacitor", "max-voltage", resolver)
      : null;
  const displayedMember = statement.members.find((member) => member.kind === "displayed-member");
  const displayed = displayedMember?.kind === "displayed-member" ? displayedMember.values : [];
  let valid = (capacitanceMember === undefined || capacitance !== null) && (maxVoltageMember === undefined || maxVoltage !== null);
  const displayFirst = new Map<string, SourceSpan>();
  for (const value of displayed) {
    const first = displayFirst.get(value.value);
    if (first !== undefined) {
      resolver.report("capacitor.duplicate-displayed-value", value.span, "Displayed value cannot be repeated", [first]);
      valid = false;
    } else {
      displayFirst.set(value.value, value.span);
    }
    if ((value.value === "capacitance" && capacitanceMember === undefined) || (value.value === "max-voltage" && maxVoltageMember === undefined)) {
      resolver.report("capacitor.displayed-not-declared", value.span, "Displayed value must be declared", []);
      valid = false;
    }
  }
  if (!valid) return null;
  if (isPolarized(type) && isRail(selected.from.hole, "ground")) {
    resolver.report(
      "component.polarity-warning",
      statement.from.span,
      "Polarized capacitor polarity is directly connected to the opposite rail",
      [],
      "warning",
    );
  }
  if (isPolarized(type) && isRail(selected.to.hole, "positive")) {
    resolver.report(
      "component.polarity-warning",
      statement.to.span,
      "Polarized capacitor polarity is directly connected to the opposite rail",
      [],
      "warning",
    );
  }
  const declaredColor = sourceColor(statement.members);
  return {
    kind: "capacitor",
    name: statement.name.spelling,
    type,
    color: declaredColor === null ? TYPE_COLORS[type] : resolver.color(declaredColor),
    capacitance,
    maxVoltage,
    displayed: displayed.map((value) => value.value),
    body: { from: resolver.point(selected.from.hole), to: resolver.point(selected.to.hole) },
    terminals: terminals(statement, selected.from.hole, selected.to.hole),
    source: statement.span,
  };
}

function resolveResistor(
  statement: Extract<TwoTerminalStatement, { kind: "resistor" }>,
  selected: Readonly<{ from: HoleCandidate; to: HoleCandidate }>,
  resolver: TwoTerminalResolver,
): CanonicalResistor | null {
  if (!duplicateMembers(statement.members, "resistor", resolver)) return null;
  const valueMember = statement.members.find((member) => member.kind === "resistor-value-member");
  if (valueMember?.kind !== "resistor-value-member") {
    resolver.report("resistor.value-required", statement.span, "Resistor value is required");
    return null;
  }
  const resistance = validPositive(valueMember.value, "resistor", "value", resolver);
  const bandsMember = statement.members.find((member) => member.kind === "bands-member");
  const bandsValue = bandsMember?.kind === "bands-member" ? bandsMember.bands.value : 4;
  if (bandsValue !== 4 && bandsValue !== 5 && bandsValue !== 6) {
    resolver.report("resistor.invalid-bands", bandsMember?.span ?? statement.span, "Resistor bands must be 4, 5, or 6");
    return null;
  }
  if (resistance === null) return null;
  const bandColors = resistorBands(resistance, bandsValue);
  if (bandColors === null) {
    resolver.report("resistor.value-not-representable", valueMember.value.span, "Value cannot be represented by the selected band count");
    return null;
  }
  return {
    kind: "resistor",
    name: statement.name.spelling,
    resistance,
    bands: bandsValue,
    bandColors,
    body: { from: resolver.point(selected.from.hole), to: resolver.point(selected.to.hole) },
    terminals: terminals(statement, selected.from.hole, selected.to.hole),
    source: statement.span,
  };
}

export function resolveTwoTerminalComponents(
  resolver: TwoTerminalResolver,
): TwoTerminalResolution {
  const components: CanonicalComponent[] = [];
  const occupancy: Occupancy[] = [];
  for (const statement of resolver.statements) {
    if (statement.kind !== "led" && statement.kind !== "capacitor" && statement.kind !== "resistor") continue;
    const selected = selectEndpoints(statement, resolver);
    if (selected === null) continue;
    const component =
      statement.kind === "led"
        ? resolveLed(statement, selected, resolver)
        : statement.kind === "capacitor"
          ? resolveCapacitor(statement, selected, resolver)
          : resolveResistor(statement, selected, resolver);
    if (component === null) continue;
    components.push(component);
    resolver.register?.(component);
    const endpoints = [selected.from, selected.to] as const;
    for (const [index, endpoint] of endpoints.entries()) {
      const entry: Occupancy = {
        kind: "component-terminal",
        hole: endpoint.hole,
        component: component.name,
        terminal: index + 1,
      };
      occupancy.push(entry);
      resolver.occupy(endpoint.hole, statement.span);
    }
  }
  return { components, occupancy };
}
