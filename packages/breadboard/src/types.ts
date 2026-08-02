export type SourceSpan = Readonly<{ start: number; end: number }>;

export type SourcePosition = Readonly<{ line: number; column: number }>;

export type SourceRange = Readonly<{
  start: SourcePosition;
  end: SourcePosition;
}>;

export type Diagnostic = Readonly<{
  code: string;
  severity: "error" | "warning";
  range: SourceRange;
  message: string;
  related?: readonly SourceRange[];
}>;

export type SourceValue<T> = Readonly<{
  value: T;
  spelling: string;
  span: SourceSpan;
}>;

export type SurfaceInteger =
  | Readonly<{
      kind: "integer";
      supported: true;
      value: number;
      spelling: string;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "integer";
      supported: false;
      value: null;
      spelling: string;
      span: SourceSpan;
    }>;

export type SurfacePercentage =
  | Readonly<{
      kind: "percentage";
      supported: true;
      value: number;
      spelling: string;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "percentage";
      supported: false;
      value: null;
      spelling: string;
      span: SourceSpan;
    }>;

export type NamedColor =
  | "black"
  | "red"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "forest"
  | "blue"
  | "cyan"
  | "purple"
  | "grey"
  | "white";

export type SurfaceColor =
  | Readonly<{
      kind: "named-color";
      value: NamedColor;
      spelling: string;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "hex-color";
      value: string;
      spelling: string;
      span: SourceSpan;
    }>;

export type Side = "left" | "right";
export type Polarity = "positive" | "ground";

export type RailSelector = Readonly<{
  kind: "rail-selector";
  side: SourceValue<Side> | null;
  polarity: SourceValue<Polarity>;
  row: SurfaceInteger | null;
  span: SourceSpan;
}>;

export type TerminalSelector = Readonly<{
  kind: "terminal-selector";
  side: SourceValue<Side> | null;
  row: SurfaceInteger;
  column: SurfaceInteger | null;
  span: SourceSpan;
}>;

export type PinTarget =
  | Readonly<{ kind: "number"; number: SurfaceInteger; span: SourceSpan }>
  | Readonly<{
      kind: "alias";
      alias: SourceValue<string>;
      span: SourceSpan;
    }>;

export type PinSelector = Readonly<{
  kind: "pin-selector";
  instance: SourceValue<string>;
  target: PinTarget;
  span: SourceSpan;
}>;

export type Endpoint = RailSelector | TerminalSelector | PinSelector;

export type ExactRailPoint = Readonly<{
  kind: "exact-rail-point";
  side: SourceValue<Side>;
  polarity: SourceValue<Polarity>;
  row: SurfaceInteger;
  span: SourceSpan;
}>;

export type ExactTerminalPoint = Readonly<{
  kind: "exact-terminal-point";
  side: SourceValue<Side>;
  row: SurfaceInteger;
  column: SurfaceInteger;
  span: SourceSpan;
}>;

export type ExactRoutePoint = ExactRailPoint | ExactTerminalPoint;

export type ChipMember =
  | Readonly<{
      kind: "height-member";
      height: SurfaceInteger;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "width-member";
      width: SurfaceInteger;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "color-member";
      color: SurfaceColor;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "pin-member";
      number: SurfaceInteger;
      aliases: readonly SourceValue<string>[];
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "invalid-chip-member";
      diagnosticCodes: readonly string[];
      span: SourceSpan;
    }>;

export type SurfaceStatement =
  | Readonly<{
      kind: "breadboard";
      name: SourceValue<string> | null;
      rows: SurfaceInteger;
      columns: SurfaceInteger | null;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "chip-definition";
      name: SourceValue<string>;
      members: readonly ChipMember[];
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "placement";
      instance: SourceValue<string>;
      definition: SourceValue<string>;
      row: SurfaceInteger;
      flip: SourceValue<true> | null;
      color: SurfaceColor | null;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "wire";
      from: Endpoint;
      to: Endpoint;
      via: readonly ExactRoutePoint[] | null;
      color: SurfaceColor | null;
      saturation: SurfacePercentage | null;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "invalid-statement";
      diagnosticCodes: readonly string[];
      span: SourceSpan;
    }>;

export type SurfaceDocument = Readonly<{
  kind: "document";
  statements: readonly SurfaceStatement[];
  span: SourceSpan;
}>;

export type ExactRailHole = Readonly<{
  kind: "rail-hole";
  side: Side;
  polarity: Polarity;
  row: number;
}>;

export type ExactTerminalHole = Readonly<{
  kind: "terminal-hole";
  side: Side;
  row: number;
  column: number;
}>;

export type ExactHole = ExactRailHole | ExactTerminalHole;
export type RgbColor = Readonly<{ r: number; g: number; b: number }>;
export type CanonicalWireColor = Readonly<
  RgbColor & { underlay: boolean }
>;
export type CanonicalRect = Readonly<{
  x4: number;
  y4: number;
  width4: number;
  height4: number;
}>;
export type CanonicalPoint = Readonly<{
  x4: number;
  y4: number;
  source: SourceSpan | null;
}>;
export type CanonicalBoard = Readonly<{
  name: string | null;
  rows: number;
  columns: number;
  source: SourceSpan | null;
}>;
export type CanonicalPin = Readonly<{
  number: number;
  hole: ExactTerminalHole;
  label: string | null;
  source: SourceSpan | null;
}>;
export type CanonicalChip = Readonly<{
  definitionName: string;
  instanceName: string;
  flip: boolean;
  color: RgbColor;
  body: CanonicalRect;
  pins: readonly CanonicalPin[];
  source: SourceSpan;
}>;
export type CanonicalEndpoint = Readonly<{
  hole: ExactHole;
  source: SourceSpan;
}>;
export type CanonicalWire = Readonly<{
  number: number;
  from: CanonicalEndpoint;
  to: CanonicalEndpoint;
  path: readonly CanonicalPoint[];
  color: CanonicalWireColor;
  source: SourceSpan;
}>;
export type Occupancy =
  | Readonly<{
      kind: "chip-pin";
      hole: ExactHole;
      chip: string;
      pin: number;
    }>
  | Readonly<{
      kind: "chip-covered";
      hole: ExactHole;
      chip: string;
    }>
  | Readonly<{
      kind: "wire-endpoint";
      hole: ExactHole;
      wire: number;
      end: "from" | "to";
    }>;

export type CanonicalBreadboardModel = Readonly<{
  kind: "breadboard-model";
  board: CanonicalBoard;
  chips: readonly CanonicalChip[];
  wires: readonly CanonicalWire[];
  occupancy: readonly Occupancy[];
}>;

export type UnsupportedReason = Readonly<{
  code: "integer-out-of-range" | "resource-limit";
  message: string;
  span: SourceSpan | null;
}>;

export type CompileResult =
  | Readonly<{
      status: "valid";
      ast: SurfaceDocument;
      diagnostics: readonly Diagnostic[];
      model: CanonicalBreadboardModel;
      svg: string;
    }>
  | Readonly<{
      status: "invalid";
      ast: SurfaceDocument;
      diagnostics: readonly Diagnostic[];
      model: null;
      svg: null;
    }>
  | Readonly<{
      status: "unsupported";
      ast: SurfaceDocument;
      diagnostics: readonly Diagnostic[];
      model: null;
      svg: null;
      reason: UnsupportedReason;
    }>;
