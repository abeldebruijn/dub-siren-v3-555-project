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

export type SurfaceDecimal =
  | Readonly<{
      kind: "decimal";
      supported: true;
      value: number;
      spelling: string;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "decimal";
      supported: false;
      value: null;
      spelling: string;
      span: SourceSpan;
    }>;

export type SurfaceResistance =
  | Readonly<{
      kind: "resistance";
      supported: true;
      ohms: number;
      spelling: string;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "resistance";
      supported: false;
      ohms: null;
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

export type SurfaceBoolean = SourceValue<boolean>;
export type CapacitorType =
  | "ceramic"
  | "electrolytic"
  | "film"
  | "tantalum"
  | "supercapacitor";
export type DisplayedCapacitorValue = "capacitance" | "max-voltage";

export type LedMember =
  | Readonly<{ kind: "color-member"; color: SurfaceColor; span: SourceSpan }>
  | Readonly<{ kind: "on-member"; on: SurfaceBoolean; span: SourceSpan }>
  | Readonly<{
      kind: "display-legs-member";
      displayLegs: SurfaceBoolean;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "invalid-led-member";
      diagnosticCodes: readonly string[];
      span: SourceSpan;
    }>;

export type CapacitorMember =
  | Readonly<{
      kind: "capacitor-type-member";
      type: SourceValue<CapacitorType>;
      span: SourceSpan;
    }>
  | Readonly<{ kind: "color-member"; color: SurfaceColor; span: SourceSpan }>
  | Readonly<{
      kind: "capacitance-member";
      capacitance: SurfaceDecimal;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "max-voltage-member";
      maxVoltage: SurfaceDecimal;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "displayed-member";
      values: readonly SourceValue<DisplayedCapacitorValue>[];
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "invalid-capacitor-member";
      diagnosticCodes: readonly string[];
      span: SourceSpan;
    }>;

export type ResistorMember =
  | Readonly<{
      kind: "resistor-value-member";
      value: SurfaceResistance;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "bands-member";
      bands: SurfaceInteger;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "invalid-resistor-member";
      diagnosticCodes: readonly string[];
      span: SourceSpan;
    }>;

export type ButtonMember =
  | Readonly<{
      kind: "pins-per-side-member";
      pinsPerSide: SurfaceInteger;
      span: SourceSpan;
    }>
  | Readonly<{ kind: "on-member"; on: SurfaceBoolean; span: SourceSpan }>
  | Readonly<{
      kind: "invalid-button-member";
      diagnosticCodes: readonly string[];
      span: SourceSpan;
    }>;

export type PotentiometerMember =
  | Readonly<{
      kind: "resistance-member";
      resistance: SurfaceResistance;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "control-value-member";
      value: SurfaceDecimal;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "invalid-potentiometer-member";
      diagnosticCodes: readonly string[];
      span: SourceSpan;
    }>;

export type SwitchMember =
  | Readonly<{
      kind: "options-member";
      options: SurfaceInteger;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "control-value-member";
      value: SurfaceInteger;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "invalid-switch-member";
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
      kind: "chip";
      name: SourceValue<string>;
      members: readonly ChipMember[];
      row: SurfaceInteger;
      flip: SourceValue<true> | null;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "led";
      name: SourceValue<string>;
      from: Endpoint;
      to: Endpoint;
      members: readonly LedMember[];
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "capacitor";
      name: SourceValue<string>;
      from: Endpoint;
      to: Endpoint;
      members: readonly CapacitorMember[];
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "resistor";
      name: SourceValue<string>;
      from: Endpoint;
      to: Endpoint;
      members: readonly ResistorMember[];
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "button";
      name: SourceValue<string>;
      members: readonly ButtonMember[];
      row: SurfaceInteger;
      outside: SourceValue<true> | null;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "potentiometer";
      name: SourceValue<string>;
      members: readonly PotentiometerMember[];
      row: SurfaceInteger;
      side: SourceValue<Side> | null;
      outside: SourceValue<true> | null;
      span: SourceSpan;
    }>
  | Readonly<{
      kind: "switch";
      name: SourceValue<string>;
      members: readonly SwitchMember[];
      row: SurfaceInteger;
      side: SourceValue<Side> | null;
      outside: SourceValue<true> | null;
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
      kind: "annotation";
      number: SurfaceInteger;
      target: Endpoint;
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
export type CanonicalViewport = CanonicalRect;
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
export type CanonicalTerminal = Readonly<{
  number: number;
  hole: ExactHole;
  name: string | null;
  source: SourceSpan | null;
}>;
export type CanonicalBoardTerminal = Readonly<
  Omit<CanonicalTerminal, "hole"> & { hole: ExactTerminalHole }
>;
export type CanonicalChip = Readonly<{
  kind: "chip";
  name: string;
  label: string | null;
  flip: boolean;
  color: RgbColor;
  body: CanonicalRect;
  terminals: readonly CanonicalBoardTerminal[];
  source: SourceSpan;
}>;
export type CanonicalSegment = Readonly<{
  from: CanonicalPoint;
  to: CanonicalPoint;
}>;
export type CanonicalLed = Readonly<{
  kind: "led";
  name: string;
  color: RgbColor;
  on: boolean;
  displayLegs: boolean;
  body: CanonicalSegment;
  terminals: readonly [CanonicalTerminal, CanonicalTerminal];
  source: SourceSpan;
}>;
export type CanonicalCapacitor = Readonly<{
  kind: "capacitor";
  name: string;
  type: CapacitorType;
  color: RgbColor;
  capacitance: number | null;
  maxVoltage: number | null;
  displayed: readonly DisplayedCapacitorValue[];
  body: CanonicalSegment;
  terminals: readonly [CanonicalTerminal, CanonicalTerminal];
  source: SourceSpan;
}>;
export type ResistorBandColor =
  | NamedColor
  | "gold"
  | "silver";
export type CanonicalResistor = Readonly<{
  kind: "resistor";
  name: string;
  resistance: number;
  bands: 4 | 5 | 6;
  bandColors: readonly ResistorBandColor[];
  body: CanonicalSegment;
  terminals: readonly [CanonicalTerminal, CanonicalTerminal];
  source: SourceSpan;
}>;
export type CanonicalButton = Readonly<{
  kind: "button";
  name: string;
  pinsPerSide: number;
  on: boolean;
  outside: boolean;
  body: CanonicalRect;
  terminals: readonly CanonicalBoardTerminal[];
  source: SourceSpan;
}>;
export type CanonicalPotentiometer = Readonly<{
  kind: "potentiometer";
  name: string;
  resistance: number;
  value: number;
  side: Side;
  outside: boolean;
  body: CanonicalRect;
  terminals: readonly [
    CanonicalBoardTerminal,
    CanonicalBoardTerminal,
    CanonicalBoardTerminal,
  ];
  source: SourceSpan;
}>;
export type CanonicalSwitch = Readonly<{
  kind: "switch";
  name: string;
  options: number;
  value: number;
  side: Side;
  outside: boolean;
  body: CanonicalRect;
  terminals: readonly CanonicalBoardTerminal[];
  source: SourceSpan;
}>;
export type CanonicalComponent =
  | CanonicalChip
  | CanonicalLed
  | CanonicalCapacitor
  | CanonicalResistor
  | CanonicalButton
  | CanonicalPotentiometer
  | CanonicalSwitch;
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
export type CanonicalAnnotation = Readonly<{
  number: number;
  target: CanonicalEndpoint;
  source: SourceSpan;
}>;
export type StructuralConnection =
  | Readonly<{
      kind: "wire";
      wire: number;
      from: ExactHole;
      to: ExactHole;
      source: SourceSpan;
    }>
  | Readonly<{
      kind: "contact";
      component: string;
      fromTerminal: number;
      toTerminal: number;
      from: ExactHole;
      to: ExactHole;
      source: SourceSpan;
    }>;
export type Occupancy =
  | Readonly<{
      kind: "component-terminal";
      hole: ExactHole;
      component: string;
      terminal: number;
    }>
  | Readonly<{
      kind: "component-covered";
      hole: ExactHole;
      component: string;
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
  viewport: CanonicalViewport;
  components: readonly CanonicalComponent[];
  wires: readonly CanonicalWire[];
  annotations: readonly CanonicalAnnotation[];
  connections: readonly StructuralConnection[];
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
