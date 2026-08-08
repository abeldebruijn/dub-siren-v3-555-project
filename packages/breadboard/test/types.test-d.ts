import type {
  CanonicalBoardTerminal,
  CanonicalBreadboardModel,
  CanonicalComponent,
  CanonicalTerminal,
  CompileResult,
  ExactHole,
  ExactTerminalHole,
  SurfaceStatement,
} from "../src/types.js";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<Value extends true> = Value;

type _compileStatusesStayStable = Assert<
  Equal<CompileResult["status"], "valid" | "invalid" | "unsupported">
>;
type _v02SurfaceStatementsExist = Assert<
  Equal<
    Extract<
      SurfaceStatement["kind"],
      | "chip"
      | "led"
      | "capacitor"
      | "resistor"
      | "button"
      | "potentiometer"
      | "switch"
      | "annotation"
    >,
    | "chip"
    | "led"
    | "capacitor"
    | "resistor"
    | "button"
    | "potentiometer"
    | "switch"
    | "annotation"
  >
>;
type _componentKindsAreExhaustive = Assert<
  Equal<
    CanonicalComponent["kind"],
    | "chip"
    | "led"
    | "capacitor"
    | "resistor"
    | "button"
    | "potentiometer"
    | "switch"
  >
>;
type _componentEndpointsMayUseRails = Assert<
  Equal<CanonicalTerminal["hole"], ExactHole>
>;
type _placedTerminalsStayOnTerminalAreas = Assert<
  Equal<CanonicalBoardTerminal["hole"], ExactTerminalHole>
>;
type _modelSeamIsComplete = Assert<
  Equal<
    keyof CanonicalBreadboardModel,
    | "kind"
    | "board"
    | "viewport"
    | "components"
    | "wires"
    | "annotations"
    | "connections"
    | "occupancy"
  >
>;
