import type { CstNode, IToken } from "chevrotain";

import type {
  ButtonMember,
  CapacitorMember,
  CapacitorType,
  DisplayedCapacitorValue,
  Endpoint,
  ExactRoutePoint,
  LedMember,
  NamedColor,
  PotentiometerMember,
  ResistorMember,
  Side,
  SourceSpan,
  SourceValue,
  SurfaceColor,
  SurfaceDecimal,
  SurfaceDocument,
  SurfaceInteger,
  SurfacePercentage,
  SurfaceResistance,
  SurfaceStatement,
  SwitchMember,
} from "../types.js";
import { breadboardParser } from "./parser.js";
import { Newline } from "./tokens.js";

type CstChildren = Record<string, (CstNode | IToken)[]>;
type MaybeEndpoint = Endpoint | null;
type MaybeRoutePoint = ExactRoutePoint | null;

const NAMED_COLORS = new Set<NamedColor>([
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

function isToken(value: CstNode | IToken): value is IToken {
  return "image" in value;
}

function token(children: CstChildren, name: string, index = 0): IToken {
  const value = children[name]?.[index];
  if (value === undefined || !isToken(value)) {
    throw new Error(`Missing ${name} token in recovered CST`);
  }
  return value;
}

function usableToken(
  children: CstChildren,
  name: string,
  index = 0,
): IToken | undefined {
  const value = children[name]?.[index];
  return value !== undefined && isToken(value) && !value.isInsertedInRecovery
    ? value
    : undefined;
}

function tokenEnd(value: IToken): number {
  return (value.endOffset ?? value.startOffset + value.image.length - 1) + 1;
}

function spanOfToken(value: IToken): SourceSpan {
  return { start: value.startOffset, end: tokenEnd(value) };
}

function spanOfChildren(children: CstChildren): SourceSpan {
  const spans: SourceSpan[] = [];
  for (const values of Object.values(children)) {
    for (const value of values) {
      if (isToken(value)) {
        if (!value.isInsertedInRecovery && value.tokenType !== Newline) {
          spans.push(spanOfToken(value));
        }
      } else if (
        value.location !== undefined &&
        value.location.startOffset !== undefined &&
        value.location.startOffset >= 0 &&
        value.location.endOffset !== undefined
      ) {
        spans.push({
          start: value.location.startOffset,
          end: value.location.endOffset + 1,
        });
      }
    }
  }
  if (spans.length === 0) return { start: 0, end: 0 };
  return {
    start: Math.min(...spans.map(({ start }) => start)),
    end: Math.max(...spans.map(({ end }) => end)),
  };
}

function spanOfNode(node: CstNode): SourceSpan {
  const { startOffset, endOffset } = node.location ?? {};
  return startOffset === undefined || startOffset < 0 || endOffset === undefined
    ? { start: 0, end: 0 }
    : { start: startOffset, end: endOffset + 1 };
}

function sourceString(value: IToken): SourceValue<string> {
  return {
    value: value.image,
    spelling: value.image,
    span: spanOfToken(value),
  };
}

function sourceLiteral<T>(value: IToken, decoded: T): SourceValue<T> {
  return {
    value: decoded,
    spelling: value.image,
    span: spanOfToken(value),
  };
}

function sourcePart<T>(
  value: IToken,
  start: number,
  length: number,
  decoded: T,
): SourceValue<T> {
  return {
    value: decoded,
    spelling: value.image.slice(start, start + length),
    span: {
      start: value.startOffset + start,
      end: value.startOffset + start + length,
    },
  };
}

function integerPart(
  value: IToken,
  start: number,
  spelling: string,
): SurfaceInteger {
  return integerFromSpelling(spelling, {
    start: value.startOffset + start,
    end: value.startOffset + start + spelling.length,
  });
}

function integerFromSpelling(
  spelling: string,
  span: SourceSpan,
): SurfaceInteger {
  const value = Number(spelling);
  return Number.isSafeInteger(value)
    ? { kind: "integer", supported: true, value, spelling, span }
    : { kind: "integer", supported: false, value: null, spelling, span };
}

function surfaceInteger(value: IToken): SurfaceInteger {
  return integerFromSpelling(value.image, spanOfToken(value));
}

function rowInteger(value: IToken): SurfaceInteger {
  return integerFromSpelling(value.image.slice(1), {
    start: value.startOffset + 1,
    end: tokenEnd(value),
  });
}

function surfacePercentage(value: IToken): SurfacePercentage {
  const spelling = value.image;
  const number = Number(spelling.slice(0, -1));
  return Number.isSafeInteger(number)
    ? {
        kind: "percentage",
        supported: true,
        value: number,
        spelling,
        span: spanOfToken(value),
      }
    : {
        kind: "percentage",
        supported: false,
        value: null,
        spelling,
        span: spanOfToken(value),
      };
}

function surfaceDecimal(value: IToken): SurfaceDecimal {
  const spelling = value.image;
  const number = Number(spelling);
  return Number.isFinite(number) && Math.abs(number) <= Number.MAX_SAFE_INTEGER
    ? {
        kind: "decimal",
        supported: true,
        value: number,
        spelling,
        span: spanOfToken(value),
      }
    : {
        kind: "decimal",
        supported: false,
        value: null,
        spelling,
        span: spanOfToken(value),
      };
}

function surfaceResistance(value: IToken): SurfaceResistance {
  const spelling = value.image;
  const suffix = /[kKmM]$/u.exec(spelling)?.[0].toLowerCase() ?? null;
  const magnitude = Number(suffix === null ? spelling : spelling.slice(0, -1));
  const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : 1;
  const ohms = magnitude * multiplier;
  return Number.isFinite(ohms) && Math.abs(ohms) <= Number.MAX_SAFE_INTEGER
    ? {
        kind: "resistance",
        supported: true,
        ohms,
        spelling,
        span: spanOfToken(value),
      }
    : {
        kind: "resistance",
        supported: false,
        ohms: null,
        spelling,
        span: spanOfToken(value),
      };
}

function firstUsableToken(children: CstChildren): IToken | undefined {
  return Object.values(children)
    .flat()
    .find((value): value is IToken => isToken(value) && !value.isInsertedInRecovery);
}

function invalidMember(kind: string, children: CstChildren) {
  return {
    kind,
    diagnosticCodes: ["syntax.unexpected-token"],
    span: spanOfChildren(children),
  };
}

function retypeInvalidMember<T>(value: unknown, kind: string): T {
  if (
    value !== null &&
    typeof value === "object" &&
    "kind" in value &&
    typeof value.kind === "string" &&
    value.kind.startsWith("invalid-")
  ) {
    return { ...value, kind } as T;
  }
  return value as T;
}

const BaseVisitor = breadboardParser.getBaseCstVisitorConstructorWithDefaults();

class SurfaceAstBuilder extends BaseVisitor {
  public constructor() {
    super();
    this.validateVisitor();
  }

  public document(children: CstChildren, source: string): SurfaceDocument {
    return {
      kind: "document",
      statements: (children.statement ?? []).map((node) =>
        this.visit(node as CstNode),
      ) as SurfaceStatement[],
      span: { start: 0, end: source.length },
    };
  }

  public statement(children: CstChildren): SurfaceStatement {
    const node = Object.values(children).flat()[0] as CstNode | undefined;
    const value = node === undefined ? undefined : this.visit(node);
    return (value ?? {
      kind: "invalid-statement",
      diagnosticCodes: ["syntax.unexpected-token"],
      span: spanOfChildren(children),
    }) as SurfaceStatement;
  }

  public breadboardStatement(children: CstChildren): SurfaceStatement {
    const integers = (children.IntegerLiteral ?? []) as IToken[];
    const rows = usableToken(children, "IntegerLiteral");
    if (rows === undefined) {
      return {
        kind: "invalid-statement",
        diagnosticCodes: ["syntax.unexpected-token"],
        span: spanOfChildren(children),
      };
    }
    const name = usableToken(children, "NameLike");
    return {
      kind: "breadboard",
      name: name === undefined ? null : sourceString(name),
      rows: surfaceInteger(rows),
      columns:
        integers[1] === undefined ? null : surfaceInteger(integers[1]),
      span: spanOfChildren(children),
    };
  }

  public chipDefinitionStatement(children: CstChildren): SurfaceStatement {
    const name = usableToken(children, "NameLike");
    if (name === undefined) {
      return {
        kind: "invalid-statement",
        diagnosticCodes: ["syntax.unexpected-token"],
        span: spanOfChildren(children),
      };
    }
    const members = (children.chipMemberLine ?? []).map((node) =>
      this.visit(node as CstNode),
    );
    const row = usableToken(children, "RowCoordinate");
    if (row === undefined) {
      return {
        kind: "chip-definition",
        name: sourceString(name),
        members,
        span: spanOfChildren(children),
      };
    }
    const flip = usableToken(children, "FlipKeyword");
    return {
      kind: "chip",
      name: sourceString(name),
      members,
      row: rowInteger(row),
      flip: flip === undefined ? null : sourceLiteral(flip, true),
      span: spanOfChildren(children),
    };
  }

  public chipMemberLine(children: CstChildren) {
    return this.visit(Object.values(children).flat()[0] as CstNode);
  }

  public heightMember(children: CstChildren) {
    const height = token(children, "IntegerLiteral");
    if (height.isInsertedInRecovery) {
      return {
        kind: "invalid-chip-member" as const,
        diagnosticCodes: ["syntax.unexpected-token"],
        span: spanOfChildren(children),
      };
    }
    return {
      kind: "height-member" as const,
      height: surfaceInteger(height),
      span: spanOfChildren(children),
    };
  }

  public widthMember(children: CstChildren) {
    const width = token(children, "IntegerLiteral");
    if (width.isInsertedInRecovery) {
      return {
        kind: "invalid-chip-member" as const,
        diagnosticCodes: ["syntax.unexpected-token"],
        span: spanOfChildren(children),
      };
    }
    return {
      kind: "width-member" as const,
      width: surfaceInteger(width),
      span: spanOfChildren(children),
    };
  }

  public colorMember(children: CstChildren) {
    const colorNode = children.colorValue?.[0] as CstNode | undefined;
    const color =
      colorNode === undefined ? null : (this.visit(colorNode) as SurfaceColor | null);
    if (color === null) {
      return {
        kind: "invalid-chip-member" as const,
        diagnosticCodes: ["syntax.unexpected-token"],
        span: spanOfChildren(children),
      };
    }
    return {
      kind: "color-member" as const,
      color,
      span: spanOfChildren(children),
    };
  }

  public pinMember(children: CstChildren) {
    const aliases = (children.NameLike ?? []) as IToken[];
    const integers = (children.IntegerLiteral ?? []) as IToken[];
    const invalidAlias = integers[1];
    if (invalidAlias !== undefined && !invalidAlias.isInsertedInRecovery) {
      return {
        kind: "invalid-chip-member" as const,
        diagnosticCodes: ["syntax.invalid-alias"],
        span: spanOfToken(invalidAlias),
      };
    }
    if (
      integers[0] === undefined ||
      aliases.length === 0 ||
      aliases.some(({ isInsertedInRecovery }) => isInsertedInRecovery)
    ) {
      return {
        kind: "invalid-chip-member" as const,
        diagnosticCodes: ["syntax.invalid-alias"],
        span: spanOfChildren(children),
      };
    }
    return {
      kind: "pin-member" as const,
      number: surfaceInteger(integers[0]),
      aliases: aliases.map(sourceString),
      span: spanOfChildren(children),
    };
  }

  public placementStatement(children: CstChildren): SurfaceStatement {
    const identifiers = (children.NameLike ?? []) as IToken[];
    const row = usableToken(children, "RowCoordinate");
    if (
      identifiers.length < 2 ||
      identifiers.some(({ isInsertedInRecovery }) => isInsertedInRecovery) ||
      row === undefined
    ) {
      return {
        kind: "invalid-statement",
        diagnosticCodes: ["syntax.unexpected-token"],
        span: spanOfChildren(children),
      };
    }
    const flip = children.FlipKeyword?.[0] as IToken | undefined;
    const colorNode = children.colorValue?.[0] as CstNode | undefined;
    return {
      kind: "placement",
      instance: sourceString(identifiers[0]),
      definition: sourceString(identifiers[1]),
      row: rowInteger(row),
      flip: flip === undefined ? null : sourceLiteral(flip, true),
      color:
        colorNode === undefined
          ? null
          : (this.visit(colorNode) as SurfaceColor),
      span: spanOfChildren(children),
    };
  }

  public ledStatement(children: CstChildren): SurfaceStatement {
    return this.twoTerminalStatement("led", children, "ledMemberLine");
  }

  public ledMemberLine(children: CstChildren): LedMember {
    const node = Object.values(children).flat()[0] as CstNode;
    if (node.name === "invalidComponentMember") {
      return invalidMember("invalid-led-member", node.children) as LedMember;
    }
    return retypeInvalidMember<LedMember>(
      this.visit(node),
      "invalid-led-member",
    );
  }

  public onMember(children: CstChildren): LedMember | ButtonMember {
    const value = children.booleanValue?.[0] as CstNode | undefined;
    const boolean = value === undefined ? null : this.visit(value);
    return boolean === null
      ? (invalidMember("invalid-led-member", children) as LedMember)
      : {
          kind: "on-member",
          on: boolean,
          span: spanOfChildren(children),
        };
  }

  public displayLegsMember(children: CstChildren): LedMember {
    const value = children.booleanValue?.[0] as CstNode | undefined;
    const boolean = value === undefined ? null : this.visit(value);
    return boolean === null
      ? (invalidMember("invalid-led-member", children) as LedMember)
      : {
          kind: "display-legs-member",
          displayLegs: boolean,
          span: spanOfChildren(children),
        };
  }

  public booleanValue(children: CstChildren) {
    const value = firstUsableToken(children);
    if (value === undefined) return null;
    const normalized = value.image.toLowerCase();
    return normalized === "true" || normalized === "false"
      ? sourceLiteral(value, normalized === "true")
      : null;
  }

  public capacitorStatement(children: CstChildren): SurfaceStatement {
    return this.twoTerminalStatement(
      "capacitor",
      children,
      "capacitorMemberLine",
    );
  }

  public capacitorMemberLine(children: CstChildren): CapacitorMember {
    const node = Object.values(children).flat()[0] as CstNode;
    if (node.name === "invalidComponentMember") {
      return invalidMember(
        "invalid-capacitor-member",
        node.children,
      ) as CapacitorMember;
    }
    return retypeInvalidMember<CapacitorMember>(
      this.visit(node),
      "invalid-capacitor-member",
    );
  }

  public capacitorTypeMember(children: CstChildren): CapacitorMember {
    const value = usableToken(children, "NameLike");
    const accepted = new Set<CapacitorType>([
      "ceramic",
      "electrolytic",
      "film",
      "tantalum",
      "supercapacitor",
    ]);
    const normalized = value?.image.toLowerCase() as CapacitorType | undefined;
    return value !== undefined && normalized !== undefined && accepted.has(normalized)
      ? {
          kind: "capacitor-type-member",
          type: sourceLiteral(value, normalized),
          span: spanOfChildren(children),
        }
      : (invalidMember(
          "invalid-capacitor-member",
          children,
        ) as CapacitorMember);
  }

  public capacitanceMember(children: CstChildren): CapacitorMember {
    const value = children.decimalValue?.[0] as CstNode | undefined;
    return value === undefined
      ? (invalidMember("invalid-capacitor-member", children) as CapacitorMember)
      : {
          kind: "capacitance-member",
          capacitance: this.visit(value),
          span: spanOfChildren(children),
        };
  }

  public maxVoltageMember(children: CstChildren): CapacitorMember {
    const value = children.decimalValue?.[0] as CstNode | undefined;
    return value === undefined
      ? (invalidMember("invalid-capacitor-member", children) as CapacitorMember)
      : {
          kind: "max-voltage-member",
          maxVoltage: this.visit(value),
          span: spanOfChildren(children),
        };
  }

  public displayedMember(children: CstChildren): CapacitorMember {
    const values = ((children.NameLike ?? []) as IToken[]).filter(
      ({ isInsertedInRecovery }) => !isInsertedInRecovery,
    );
    const accepted = new Set<DisplayedCapacitorValue>([
      "capacitance",
      "max-voltage",
    ]);
    const normalized = values.map(
      ({ image }) => image.toLowerCase() as DisplayedCapacitorValue,
    );
    return values.length > 0 && normalized.every((value) => accepted.has(value))
      ? {
          kind: "displayed-member",
          values: values.map((value, index) =>
            sourceLiteral(value, normalized[index] as DisplayedCapacitorValue),
          ),
          span: spanOfChildren(children),
        }
      : (invalidMember(
          "invalid-capacitor-member",
          children,
        ) as CapacitorMember);
  }

  public decimalValue(children: CstChildren): SurfaceDecimal {
    const value = firstUsableToken(children);
    if (value === undefined) {
      return {
        kind: "decimal",
        supported: false,
        value: null,
        spelling: "",
        span: spanOfChildren(children),
      };
    }
    return surfaceDecimal(value);
  }

  public resistorStatement(children: CstChildren): SurfaceStatement {
    return this.twoTerminalStatement(
      "resistor",
      children,
      "resistorMemberLine",
    );
  }

  public resistorMemberLine(children: CstChildren): ResistorMember {
    const node = Object.values(children).flat()[0] as CstNode;
    return node.name === "invalidComponentMember"
      ? (invalidMember("invalid-resistor-member", node.children) as ResistorMember)
      : (this.visit(node) as ResistorMember);
  }

  public resistorValueMember(children: CstChildren): ResistorMember {
    const value = children.resistanceValue?.[0] as CstNode | undefined;
    return value === undefined
      ? (invalidMember("invalid-resistor-member", children) as ResistorMember)
      : {
          kind: "resistor-value-member",
          value: this.visit(value),
          span: spanOfChildren(children),
        };
  }

  public bandsMember(children: CstChildren): ResistorMember {
    const value = usableToken(children, "IntegerLiteral");
    return value === undefined
      ? (invalidMember("invalid-resistor-member", children) as ResistorMember)
      : {
          kind: "bands-member",
          bands: surfaceInteger(value),
          span: spanOfChildren(children),
        };
  }

  public resistanceValue(children: CstChildren): SurfaceResistance {
    const value = firstUsableToken(children);
    if (value === undefined) {
      return {
        kind: "resistance",
        supported: false,
        ohms: null,
        spelling: "",
        span: spanOfChildren(children),
      };
    }
    return surfaceResistance(value);
  }

  public buttonStatement(children: CstChildren): SurfaceStatement {
    const statement = this.controlStatement(children, "buttonMemberLine");
    return statement === null
      ? this.invalidStatement(children)
      : {
          kind: "button",
          name: statement.name,
          members: statement.members as ButtonMember[],
          row: statement.row,
          outside: statement.outside,
          span: spanOfChildren(children),
        };
  }

  public buttonMemberLine(children: CstChildren): ButtonMember {
    const node = Object.values(children).flat()[0] as CstNode;
    if (node.name === "invalidComponentMember") {
      return invalidMember("invalid-button-member", node.children) as ButtonMember;
    }
    return retypeInvalidMember<ButtonMember>(
      this.visit(node),
      "invalid-button-member",
    );
  }

  public pinsPerSideMember(children: CstChildren): ButtonMember {
    const value = usableToken(children, "IntegerLiteral");
    return value === undefined
      ? (invalidMember("invalid-button-member", children) as ButtonMember)
      : {
          kind: "pins-per-side-member",
          pinsPerSide: surfaceInteger(value),
          span: spanOfChildren(children),
        };
  }

  public potentiometerStatement(children: CstChildren): SurfaceStatement {
    const statement = this.controlStatement(
      children,
      "potentiometerMemberLine",
    );
    if (statement === null) return this.invalidStatement(children);
    const right = usableToken(children, "RightKeyword");
    return {
      kind: "potentiometer",
      name: statement.name,
      members: statement.members as PotentiometerMember[],
      row: statement.row,
      side: right === undefined ? null : sourceLiteral(right, "right" as const),
      outside: statement.outside,
      span: spanOfChildren(children),
    };
  }

  public potentiometerMemberLine(
    children: CstChildren,
  ): PotentiometerMember {
    const node = Object.values(children).flat()[0] as CstNode;
    return node.name === "invalidComponentMember"
      ? (invalidMember(
          "invalid-potentiometer-member",
          node.children,
        ) as PotentiometerMember)
      : (this.visit(node) as PotentiometerMember);
  }

  public resistanceMember(children: CstChildren): PotentiometerMember {
    const value = children.resistanceValue?.[0] as CstNode | undefined;
    return value === undefined
      ? (invalidMember(
          "invalid-potentiometer-member",
          children,
        ) as PotentiometerMember)
      : {
          kind: "resistance-member",
          resistance: this.visit(value),
          span: spanOfChildren(children),
        };
  }

  public controlDecimalValueMember(
    children: CstChildren,
  ): PotentiometerMember {
    const value = children.decimalValue?.[0] as CstNode | undefined;
    return value === undefined
      ? (invalidMember(
          "invalid-potentiometer-member",
          children,
        ) as PotentiometerMember)
      : {
          kind: "control-value-member",
          value: this.visit(value),
          span: spanOfChildren(children),
        };
  }

  public switchStatement(children: CstChildren): SurfaceStatement {
    const statement = this.controlStatement(children, "switchMemberLine");
    if (statement === null) return this.invalidStatement(children);
    const right = usableToken(children, "RightKeyword");
    return {
      kind: "switch",
      name: statement.name,
      members: statement.members as SwitchMember[],
      row: statement.row,
      side: right === undefined ? null : sourceLiteral(right, "right" as const),
      outside: statement.outside,
      span: spanOfChildren(children),
    };
  }

  public switchMemberLine(children: CstChildren): SwitchMember {
    const node = Object.values(children).flat()[0] as CstNode;
    return node.name === "invalidComponentMember"
      ? (invalidMember("invalid-switch-member", node.children) as SwitchMember)
      : (this.visit(node) as SwitchMember);
  }

  public optionsMember(children: CstChildren): SwitchMember {
    const value = usableToken(children, "IntegerLiteral");
    return value === undefined
      ? (invalidMember("invalid-switch-member", children) as SwitchMember)
      : {
          kind: "options-member",
          options: surfaceInteger(value),
          span: spanOfChildren(children),
        };
  }

  public controlIntegerValueMember(children: CstChildren): SwitchMember {
    const value = usableToken(children, "IntegerLiteral");
    return value === undefined
      ? (invalidMember("invalid-switch-member", children) as SwitchMember)
      : {
          kind: "control-value-member",
          value: surfaceInteger(value),
          span: spanOfChildren(children),
        };
  }

  public annotationStatement(children: CstChildren): SurfaceStatement {
    const number = usableToken(children, "IntegerLiteral");
    const endpoint = children.endpoint?.[0] as CstNode | undefined;
    const target = endpoint === undefined ? null : (this.visit(endpoint) as Endpoint);
    return number === undefined || target === null
      ? this.invalidStatement(children)
      : {
          kind: "annotation",
          number: surfaceInteger(number),
          target,
          span: spanOfChildren(children),
        };
  }

  public wireStatement(children: CstChildren): SurfaceStatement {
    const endpoints = (children.endpoint ?? []).map((node) =>
      this.visit(node as CstNode),
    ) as MaybeEndpoint[];
    const routePoints = (children.exactRoutePoint ?? []).map((node) =>
      this.visit(node as CstNode),
    ) as MaybeRoutePoint[];
    if (endpoints.includes(null) || endpoints.length < 2) {
      return {
        kind: "invalid-statement",
        diagnosticCodes: ["selector.invalid-form"],
        span: spanOfChildren(children),
      };
    }
    if (routePoints.includes(null)) {
      const invalidIndex = routePoints.findIndex((point) => point === null);
      const invalidNode = children.exactRoutePoint?.[invalidIndex] as
        | CstNode
        | undefined;
      return {
        kind: "invalid-statement",
        diagnosticCodes: ["route.point-not-exact"],
        span:
          invalidNode === undefined
            ? spanOfChildren(children)
            : spanOfNode(invalidNode),
      };
    }
    const colorNode = children.colorValue?.[0] as CstNode | undefined;
    const saturation = children.PercentageLiteral?.[0] as IToken | undefined;
    return {
      kind: "wire",
      from: endpoints[0] as Endpoint,
      to: endpoints[1] as Endpoint,
      via:
        children.ViaKeyword === undefined
          ? null
          : (routePoints as ExactRoutePoint[]),
      color:
        colorNode === undefined
          ? null
          : (this.visit(colorNode) as SurfaceColor),
      saturation:
        saturation === undefined ? null : surfacePercentage(saturation),
      span: spanOfChildren(children),
    };
  }

  public endpoint(children: CstChildren): MaybeEndpoint {
    const pin = children.pinSelector?.[0] as CstNode | undefined;
    if (pin !== undefined) return this.visit(pin) as Endpoint;
    const value = usableToken(children, "Identifier");
    return value === undefined ? null : this.selector(value);
  }

  public pinSelector(children: CstChildren): MaybeEndpoint {
    const identifiers = (children.NameLike ?? []) as IToken[];
    const number = children.IntegerLiteral?.[0] as IToken | undefined;
    const targetToken = number ?? identifiers[1];
    if (
      identifiers[0] === undefined ||
      targetToken === undefined ||
      identifiers.some(({ isInsertedInRecovery }) => isInsertedInRecovery) ||
      number?.isInsertedInRecovery
    ) {
      return null;
    }
    return {
      kind: "pin-selector",
      instance: sourceString(identifiers[0]),
      target:
        number === undefined
          ? {
              kind: "alias",
              alias: sourceString(identifiers[1]),
              span: spanOfToken(targetToken),
            }
          : {
              kind: "number",
              number: surfaceInteger(number),
              span: spanOfToken(targetToken),
            },
      span: spanOfChildren(children),
    };
  }

  public exactRoutePoint(children: CstChildren): MaybeRoutePoint {
    const value = token(children, "Identifier");
    const spelling = value.image;
    const rail = /^([LR])([PG])(\d+)$/iu.exec(spelling);
    if (rail !== null) {
      return {
        kind: "exact-rail-point",
        side: sourcePart(
          value,
          0,
          1,
          rail[1].toLowerCase() === "l" ? "left" : "right",
        ),
        polarity: sourcePart(
          value,
          1,
          1,
          rail[2].toLowerCase() === "p" ? "positive" : "ground",
        ),
        row: integerPart(value, 2, rail[3]),
        span: spanOfToken(value),
      };
    }
    const terminal = /^(LT|RT)-R(\d+)C(\d+)$/iu.exec(spelling);
    if (terminal !== null) {
      const columnStart = spelling.toUpperCase().lastIndexOf("C") + 1;
      return {
        kind: "exact-terminal-point",
        side: sourcePart(
          value,
          0,
          2,
          terminal[1].toLowerCase() === "lt" ? "left" : "right",
        ),
        row: integerPart(value, 4, terminal[2]),
        column: integerPart(value, columnStart, terminal[3]),
        span: spanOfToken(value),
      };
    }
    return null;
  }

  public colorValue(children: CstChildren): SurfaceColor | null {
    const hex = children.HexColorLiteral?.[0] as IToken | undefined;
    const invalidHex = children.InvalidHexColorLiteral?.[0] as
      | IToken
      | undefined;
    const value = hex ?? invalidHex ?? usableToken(children, "Identifier");
    if (value === undefined) return null;
    if (hex !== undefined) {
      return {
        kind: "hex-color",
        value: hex.image.toUpperCase(),
        spelling: hex.image,
        span: spanOfToken(hex),
      };
    }
    const named = value.image.toLowerCase() as NamedColor;
    return {
      kind: "named-color",
      value: NAMED_COLORS.has(named) ? named : "black",
      spelling: value.image,
      span: spanOfToken(value),
    };
  }

  public invalidStatement(children: CstChildren): SurfaceStatement {
    return {
      kind: "invalid-statement",
      diagnosticCodes: ["syntax.unexpected-token"],
      span: spanOfChildren(children),
    };
  }

  public invalidChipMember(children: CstChildren) {
    return {
      kind: "invalid-chip-member" as const,
      diagnosticCodes: ["syntax.unexpected-token"],
      span: spanOfChildren(children),
    };
  }

  public invalidComponentMember(children: CstChildren) {
    return invalidMember("invalid-component-member", children);
  }

  private twoTerminalStatement(
    kind: "led" | "capacitor" | "resistor",
    children: CstChildren,
    memberRule: "ledMemberLine" | "capacitorMemberLine" | "resistorMemberLine",
  ): SurfaceStatement {
    const name = usableToken(children, "NameLike");
    const endpoints = (children.endpoint ?? []).map((node) =>
      this.visit(node as CstNode),
    ) as MaybeEndpoint[];
    if (name === undefined || endpoints.length < 2 || endpoints.includes(null)) {
      return this.invalidStatement(children);
    }
    const base = {
      name: sourceString(name),
      from: endpoints[0] as Endpoint,
      to: endpoints[1] as Endpoint,
      members: (children[memberRule] ?? []).map((node) =>
        this.visit(node as CstNode),
      ),
      span: spanOfChildren(children),
    };
    if (kind === "led") return { kind, ...base } as SurfaceStatement;
    if (kind === "capacitor") return { kind, ...base } as SurfaceStatement;
    return { kind, ...base } as SurfaceStatement;
  }

  private controlStatement(
    children: CstChildren,
    memberRule:
      | "buttonMemberLine"
      | "potentiometerMemberLine"
      | "switchMemberLine",
  ) {
    const name = usableToken(children, "NameLike");
    const row = usableToken(children, "RowCoordinate");
    if (name === undefined || row === undefined) return null;
    const outside = usableToken(children, "OutsideKeyword");
    return {
      name: sourceString(name),
      members: (children[memberRule] ?? []).map((node) =>
        this.visit(node as CstNode),
      ),
      row: rowInteger(row),
      outside:
        outside === undefined ? null : sourceLiteral(outside, true as const),
    };
  }

  private selector(value: IToken): MaybeEndpoint {
    const spelling = value.image;
    const rail = /^([LR])?([PG])(\d+)?$/iu.exec(spelling);
    if (rail !== null) {
      const sideLength = rail[1] === undefined ? 0 : 1;
      return {
        kind: "rail-selector",
        side:
          rail[1] === undefined
            ? null
            : sourcePart<Side>(
                value,
                0,
                1,
                rail[1].toLowerCase() === "l" ? "left" : "right",
              ),
        polarity: sourcePart(
          value,
          sideLength,
          1,
          rail[2].toLowerCase() === "p" ? "positive" : "ground",
        ),
        row:
          rail[3] === undefined
            ? null
            : integerPart(value, sideLength + 1, rail[3]),
        span: spanOfToken(value),
      };
    }
    const terminal = /^(?:(LT|RT)-)?R(\d+)C(\d+)?$/iu.exec(spelling);
    if (terminal !== null) {
      const prefixLength = terminal[1] === undefined ? 0 : 3;
      const columnMarker = spelling.toUpperCase().lastIndexOf("C");
      return {
        kind: "terminal-selector",
        side:
          terminal[1] === undefined
            ? null
            : sourcePart<Side>(
                value,
                0,
                2,
                terminal[1].toLowerCase() === "lt" ? "left" : "right",
              ),
        row: integerPart(value, prefixLength + 1, terminal[2]),
        column:
          terminal[3] === undefined
            ? null
            : integerPart(value, columnMarker + 1, terminal[3]),
        span: spanOfToken(value),
      };
    }
    return null;
  }
}

export const surfaceAstBuilder = new SurfaceAstBuilder();
