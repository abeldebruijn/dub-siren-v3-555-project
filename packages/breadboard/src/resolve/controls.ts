import type {
  CanonicalButton,
  CanonicalComponent,
  CanonicalPoint,
  CanonicalPotentiometer,
  CanonicalSwitch,
  ExactHole,
  ExactTerminalHole,
  Occupancy,
  SourceSpan,
  SurfaceStatement,
  StructuralConnection,
} from "../types.js";

type ControlStatement = Extract<
  SurfaceStatement,
  { kind: "button" | "potentiometer" | "switch" }
>;

export type ComponentReference = Readonly<{
  name: string;
  source: SourceSpan;
  terminals: readonly Readonly<{
    number: number;
    names: readonly string[];
    hole: ExactHole;
  }>[];
}>;

export type ControlResolutionOptions = Readonly<{
  rows: number;
  columns: number;
  occupiedSource(hole: ExactHole): SourceSpan | null;
  pointForHole(hole: ExactHole): CanonicalPoint;
  claimName(name: string, span: SourceSpan): boolean;
  report(
    code: string,
    span: SourceSpan,
    message: string,
    related?: readonly SourceSpan[],
    severity?: "error" | "warning",
  ): void;
}>;

export type ControlResolution = Readonly<{
  components: readonly (CanonicalButton | CanonicalPotentiometer | CanonicalSwitch)[];
  occupancy: readonly Occupancy[];
  connections: readonly Extract<StructuralConnection, { kind: "contact" }>[];
  references: readonly ComponentReference[];
  claimedHoles: readonly Readonly<{ hole: ExactTerminalHole; source: SourceSpan }>[];
}>;

function duplicateMembers(
  statement: ControlStatement,
  options: ControlResolutionOptions,
) {
  const first = new Map<string, SourceSpan>();
  let valid = true;
  for (const member of statement.members) {
    if (member.kind.startsWith("invalid-")) continue;
    const key = member.kind;
    const previous = first.get(key);
    if (previous === undefined) {
      first.set(key, member.span);
      continue;
    }
    options.report(
      "component.duplicate-property",
      member.span,
      "Component property is declared more than once",
      [previous],
    );
    valid = false;
  }
  return valid;
}

function terminalHole(
  side: "left" | "right",
  row: number,
): ExactTerminalHole {
  return { kind: "terminal-hole", side, row, column: 1 };
}

function rectAround(
  points: readonly CanonicalPoint[],
  paddingX4 = 40,
  paddingY4 = 40,
) {
  const xs = points.map(({ x4 }) => x4);
  const ys = points.map(({ y4 }) => y4);
  const left = Math.min(...xs) - paddingX4;
  const top = Math.min(...ys) - paddingY4;
  return {
    x4: left,
    y4: top,
    width4: Math.max(...xs) + paddingX4 - left,
    height4: Math.max(...ys) + paddingY4 - top,
  };
}

function controlBody(
  statement: ControlStatement,
  holes: readonly ExactTerminalHole[],
  options: ControlResolutionOptions,
) {
  const points = holes.map(options.pointForHole);
  const body = rectAround(points, 72, 40);
  if (statement.outside === null) return body;
  const boardWidth4 = (300 + 44 * options.columns) * 4;
  if (statement.kind === "button") {
    const boardHeight4 = (56 + 22 * options.rows) * 4;
    const firstY4 = points[0]?.y4 ?? 0;
    const lastY4 = points.at(-1)?.y4 ?? firstY4;
    const above = firstY4 <= boardHeight4 - lastY4;
    return { ...body, y4: above ? -body.height4 - 32 : boardHeight4 + 32 };
  }
  return {
    ...body,
    x4:
      (statement.side?.value ?? "left") === "left"
        ? -body.width4 - 32
        : boardWidth4 + 32,
  };
}

function contacts(
  component: string,
  terminals: readonly Readonly<{ number: number; hole: ExactTerminalHole }>[] ,
  pairs: readonly (readonly [number, number])[],
  source: SourceSpan,
) {
  const byNumber = new Map(terminals.map((terminal) => [terminal.number, terminal]));
  return pairs.flatMap(([fromTerminal, toTerminal]) => {
    const from = byNumber.get(fromTerminal);
    const to = byNumber.get(toTerminal);
    return from === undefined || to === undefined
      ? []
      : [{
          kind: "contact" as const,
          component,
          fromTerminal,
          toTerminal,
          from: from.hole,
          to: to.hole,
          source,
        }];
  });
}

function validateHoles(
  statement: ControlStatement,
  holes: readonly ExactTerminalHole[],
  options: ControlResolutionOptions,
) {
  const overflow = holes.find(({ row }) => row < 1 || row > options.rows);
  if (overflow !== undefined) {
    options.report(
      "placement.row-overflow",
      statement.row.span,
      "Control placement exceeds the breadboard rows",
    );
    return false;
  }
  const collision = holes.find((hole) => options.occupiedSource(hole) !== null);
  if (collision !== undefined) {
    const previous = options.occupiedSource(collision);
    options.report(
      "placement.overlap",
      statement.span,
      "Control terminal overlaps an occupied hole",
      previous === null ? [] : [previous],
    );
    return false;
  }
  return true;
}

function button(
  statement: Extract<ControlStatement, { kind: "button" }>,
  options: ControlResolutionOptions,
) {
  const pinsMember = statement.members.find(
    (member) => member.kind === "pins-per-side-member",
  );
  const onMember = statement.members.find((member) => member.kind === "on-member");
  const pinsPerSide = pinsMember?.kind === "pins-per-side-member"
    ? pinsMember.pinsPerSide.value
    : 2;
  if (pinsPerSide === null || pinsPerSide < 1) {
    if (pinsMember?.kind === "pins-per-side-member") {
      options.report(
        "control.invalid-pins-per-side",
        pinsMember.pinsPerSide.span,
        "Button pins-per-side must be a positive integer",
      );
    }
    return null;
  }
  const row = statement.row.value;
  if (row === null) return null;
  if (row + pinsPerSide - 1 > options.rows) {
    options.report(
      "placement.row-overflow",
      statement.row.span,
      "Control placement exceeds the breadboard rows",
    );
    return null;
  }
  const terminals = Array.from({ length: pinsPerSide }, (_, index) => ({
    number: index + 1,
    name: `left${index + 1}`,
    hole: terminalHole("left", row + index),
    source: statement.span,
  })).concat(
    Array.from({ length: pinsPerSide }, (_, index) => ({
      number: pinsPerSide * 2 - index,
      name: `right${index + 1}`,
      hole: terminalHole("right", row + index),
      source: statement.span,
    })),
  );
  if (!validateHoles(statement, terminals.map(({ hole }) => hole), options)) {
    return null;
  }
  const on = onMember?.kind === "on-member" ? onMember.on.value : false;
  const sidePairs = Array.from({ length: Math.max(0, pinsPerSide - 1) }, (_, index) => [
    index + 1,
    index + 2,
  ] as const).concat(
    Array.from({ length: Math.max(0, pinsPerSide - 1) }, (_, index) => [
      pinsPerSide * 2 - index,
      pinsPerSide * 2 - index - 1,
    ] as const),
  );
  const connectionPairs = on
    ? [...sidePairs, [1, pinsPerSide * 2] as const]
    : sidePairs;
  const component: CanonicalButton = {
    kind: "button",
    name: statement.name.spelling,
    pinsPerSide,
    on,
    outside: statement.outside !== null,
    body: controlBody(statement, terminals.map(({ hole }) => hole), options),
    terminals,
    source: statement.span,
  };
  return {
    component,
    connections: contacts(component.name, terminals, connectionPairs, statement.span),
    reference: {
      name: component.name,
      source: statement.span,
      terminals: terminals.map(({ number, name, hole }) => ({
        number,
        names: name === null ? [] : [name],
        hole,
      })),
    },
  };
}

function potentiometer(
  statement: Extract<ControlStatement, { kind: "potentiometer" }>,
  options: ControlResolutionOptions,
) {
  const resistanceMember = statement.members.find(
    (member) => member.kind === "resistance-member",
  );
  const valueMember = statement.members.find(
    (member) => member.kind === "control-value-member",
  );
  const resistance = resistanceMember?.kind === "resistance-member"
    ? resistanceMember.resistance.ohms
    : 10_000;
  const value = valueMember?.kind === "control-value-member"
    ? valueMember.value.value
    : 0.5;
  let valid = true;
  if (resistance === null || resistance <= 0) {
    options.report(
      "control.invalid-resistance",
      resistanceMember?.kind === "resistance-member"
        ? resistanceMember.resistance.span
        : statement.span,
      "Potentiometer resistance must be greater than zero",
    );
    valid = false;
  }
  if (value === null || value < 0 || value > 1) {
    options.report(
      "control.invalid-value",
      valueMember?.kind === "control-value-member"
        ? valueMember.value.span
        : statement.span,
      "Potentiometer value must be from 0 through 1",
    );
    valid = false;
  }
  if (!valid || resistance === null || value === null) return null;
  const row = statement.row.value;
  if (row === null) return null;
  const side = statement.side?.value ?? "left";
  const terminals: CanonicalPotentiometer["terminals"] = [
    { number: 1, name: "low", hole: terminalHole(side, row), source: statement.span },
    { number: 2, name: "wiper", hole: terminalHole(side, row + 1), source: statement.span },
    { number: 3, name: "high", hole: terminalHole(side, row + 2), source: statement.span },
  ];
  if (!validateHoles(statement, terminals.map(({ hole }) => hole), options)) {
    return null;
  }
  const component: CanonicalPotentiometer = {
    kind: "potentiometer",
    name: statement.name.spelling,
    resistance,
    value,
    side,
    outside: statement.outside !== null,
    body: controlBody(statement, terminals.map(({ hole }) => hole), options),
    terminals,
    source: statement.span,
  };
  return {
    component,
    connections: [],
    reference: {
      name: component.name,
      source: statement.span,
      terminals: terminals.map(({ number, name, hole }) => ({
        number,
        names: name === null ? [] : [name],
        hole,
      })),
    },
  };
}

function switchControl(
  statement: Extract<ControlStatement, { kind: "switch" }>,
  options: ControlResolutionOptions,
) {
  const optionsMember = statement.members.find(
    (member) => member.kind === "options-member",
  );
  const valueMember = statement.members.find(
    (member) => member.kind === "control-value-member",
  );
  const optionCount = optionsMember?.kind === "options-member"
    ? optionsMember.options.value
    : 2;
  const value = valueMember?.kind === "control-value-member"
    ? valueMember.value.value
    : 1;
  let valid = true;
  if (optionCount === null || optionCount < 2) {
    options.report(
      "control.invalid-options",
      optionsMember?.kind === "options-member"
        ? optionsMember.options.span
        : statement.span,
      "Switch options must be at least 2",
    );
    valid = false;
  }
  if (
    value === null ||
    optionCount === null ||
    value < 1 ||
    value > optionCount
  ) {
    options.report(
      "control.invalid-value",
      valueMember?.kind === "control-value-member"
        ? valueMember.value.span
        : statement.span,
      "Switch value must select a declared option",
    );
    valid = false;
  }
  if (!valid || optionCount === null || value === null) return null;
  const row = statement.row.value;
  if (row === null) return null;
  if (row + optionCount > options.rows) {
    options.report(
      "placement.row-overflow",
      statement.row.span,
      "Control placement exceeds the breadboard rows",
    );
    return null;
  }
  const side = statement.side?.value ?? "left";
  const terminals = Array.from({ length: optionCount + 1 }, (_, index) => ({
    number: index + 1,
    name: index === 0 ? "common" : `option${index}`,
    hole: terminalHole(side, row + index),
    source: statement.span,
  }));
  if (!validateHoles(statement, terminals.map(({ hole }) => hole), options)) {
    return null;
  }
  const component: CanonicalSwitch = {
    kind: "switch",
    name: statement.name.spelling,
    options: optionCount,
    value,
    side,
    outside: statement.outside !== null,
    body: controlBody(statement, terminals.map(({ hole }) => hole), options),
    terminals,
    source: statement.span,
  };
  return {
    component,
    connections: contacts(component.name, terminals, [[1, value + 1]], statement.span),
    reference: {
      name: component.name,
      source: statement.span,
      terminals: terminals.map(({ number, name, hole }) => ({
        number,
        names: name === null ? [] : [name],
        hole,
      })),
    },
  };
}

export function resolvePlacedControls(
  statements: readonly SurfaceStatement[],
  options: ControlResolutionOptions,
): ControlResolution {
  const components: ControlResolution["components"][number][] = [];
  const occupancy: Occupancy[] = [];
  const connections: ControlResolution["connections"][number][] = [];
  const references: ComponentReference[] = [];
  const claimedHoles: { hole: ExactTerminalHole; source: SourceSpan }[] = [];
  const localOccupied = new Map<string, SourceSpan>();
  const key = (hole: ExactTerminalHole) => `${hole.side}:${hole.row}:${hole.column}`;
  const localOptions: ControlResolutionOptions = {
    ...options,
    occupiedSource(hole) {
      const local = hole.kind === "terminal-hole" ? localOccupied.get(key(hole)) : undefined;
      return local ?? options.occupiedSource(hole);
    },
  };

  for (const statement of statements) {
    if (
      statement.kind !== "button" &&
      statement.kind !== "potentiometer" &&
      statement.kind !== "switch"
    ) {
      continue;
    }
    const uniqueMembers = duplicateMembers(statement, localOptions);
    const uniqueName = options.claimName(statement.name.value, statement.name.span);
    if (!uniqueMembers || !uniqueName) continue;
    const resolved = statement.kind === "button"
      ? button(statement, localOptions)
      : statement.kind === "potentiometer"
        ? potentiometer(statement, localOptions)
        : switchControl(statement, localOptions);
    if (resolved === null) continue;
    components.push(resolved.component);
    connections.push(...resolved.connections);
    references.push(resolved.reference);
    for (const terminal of resolved.component.terminals) {
      occupancy.push({
        kind: "component-terminal",
        hole: terminal.hole,
        component: resolved.component.name,
        terminal: terminal.number,
      });
      claimedHoles.push({ hole: terminal.hole, source: statement.span });
      localOccupied.set(key(terminal.hole), statement.span);
    }
  }

  return { components, occupancy, connections, references, claimedHoles };
}

export function controlReferences(
  components: readonly CanonicalComponent[],
): readonly ComponentReference[] {
  return components.flatMap((component) =>
    component.kind === "button" ||
    component.kind === "potentiometer" ||
    component.kind === "switch"
      ? [{
          name: component.name,
          source: component.source,
          terminals: component.terminals.map(({ number, name, hole }) => ({
            number,
            names: name === null ? [] : [name],
            hole,
          })),
        }]
      : [],
  );
}
