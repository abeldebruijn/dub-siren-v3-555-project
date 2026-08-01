# Breadboard Description Language

A language for describing breadboard layouts that can be rendered as deterministic SVG diagrams.

## Language

**Breadboard description**:
A human-readable declaration of a breadboard, its placed components, and its routed wires.
_Avoid_: Circuit, schematic

**Breadboard compiler**:
The language pipeline that turns a Breadboard description into diagnostics and, when valid, Canonical SVG.
_Avoid_: Interpreter

**Breadboard editor**:
The user-facing course page for editing a Breadboard description, viewing diagnostics and Canonical SVG, and inspecting its intermediate representations.
_Avoid_: Developer playground

**Surface AST**:
The parsed representation that preserves declaration order, declared spelling, omitted fields, and source spans before defaults and references are resolved. It excludes whitespace and comments.
_Avoid_: Canonical Breadboard Model

**Canonical Breadboard Model**:
The fully validated and resolved representation consumed by Canonical SVG generation.
_Avoid_: Surface AST

**Desugaring**:
The deterministic transformation from a Surface AST into a Canonical Breadboard Model by applying defaults and resolving references, selectors, occupancy, routes, and colours.
_Avoid_: Parsing

**Hole**:
A concrete physical connection position on a breadboard.
_Avoid_: Pin, coordinate

**Hole selector**:
A case-insensitive coordinate expression that may omit location details for deterministic inference during resolution.
_Avoid_: Partial coordinate

**Exact hole coordinate**:
A hole selector containing every required location part; it identifies one hole and never falls back when that hole is occupied.
_Avoid_: Allocating selector

**Terminal selector**:
A terminal hole selector with a required board row and optional terminal side and column.
_Avoid_: Rowless terminal selector

**Rail selector**:
A rail hole selector with required polarity and optional side and row.
_Avoid_: Polarity-free rail selector

**Resolved hole**:
The concrete free hole selected from a hole selector by deterministic joint endpoint resolution.
_Avoid_: Inferred coordinate

**Wire endpoint**:
One of the two holes electrically joined and occupied by a wire.
_Avoid_: Route point

**Wire crossing**:
A perpendicular visual intersection between wire segments that creates no electrical connection.
_Avoid_: Junction

**Wire overlap**:
A collinear shared path between wire segments that creates no electrical connection and produces a warning.
_Avoid_: Wire crossing, junction

**Default wire colour**:
The colour derived from the resolved source: red for positive rails, black for ground rails, otherwise a stable hash into the ordered jumper-wire palette.
_Avoid_: Random colour

**Route point**:
A geometric point where a wire makes a 90-degree turn; it neither occupies nor electrically connects to a hole.
_Avoid_: Wire endpoint, connection

**Explicit route point**:
A user-declared mandatory route point anchored to an exact board coordinate; it may lie over an unavailable hole.
_Avoid_: Inferred route point

**Chip definition**:
A reusable description of a chip's identity, pins, aliases, colour, height, and width.
_Avoid_: Chip instance, placement

**Chip height**:
The number of physical pins on each side of a chip and therefore the number of board rows it occupies. An explicit height overrides height inferred as half the highest declared pin number.
_Avoid_: Width, total pins

**Chip width**:
The total number of terminal columns covered by a chip body. It defaults to two and may be even or odd.
_Avoid_: Height, pin count

**Chip footprint**:
The terminal columns covered symmetrically outward from the centre gap, with the two pin columns at the outer edges, across the board rows occupied by the chip height.
_Avoid_: Chip width, chip height, pin count

**Covered hole**:
A hole physically obscured by a chip body; it has no occupant but cannot receive a pin or wire endpoint in the current specification.
_Avoid_: Occupied hole

**Chip flip**:
A horizontal mirror of a chip placement. Pin 1 moves from the top-left to the top-right, pin numbering mirrors between terminal sides, and an odd-width footprint's extra covered column moves to the opposite terminal.
_Avoid_: Rotation

**Chip instance**:
A named placement of a chip definition, centred across the terminal gap with its top pin pair anchored to a breadboard row.
_Avoid_: Chip definition

**Pin order**:
Counter-clockwise physical numbering beginning at the top-left, increasing down the left side, continuing at the bottom-right, and increasing up the right side. A flipped placement mirrors this order horizontally.
_Avoid_: Alias order

**Pin alias**:
A human-readable name attached to a physical chip pin; the same alias may identify multiple pins on one chip definition.
_Avoid_: Pin number

**Primary pin alias**:
The first alias declared for a pin and the name rendered as its label; later aliases remain valid references.
_Avoid_: Unique alias

**Unnamed pin**:
A physical chip pin without declared aliases; it remains occupied and addressable by pin number but has no rendered label.
_Avoid_: Missing pin

**Pin selector**:
A chip-instance reference that identifies one physical pin by number or one or more pins by shared alias.
_Avoid_: Hole selector

**Breadboard**:
A board with a required row count, a configurable number of columns per terminal area, and continuous positive and ground rails on both sides.
_Avoid_: Board diagram

**Rail coordinate**:
A concrete rail hole written with side and polarity followed by its row: `LP1`, `LG1`, `RP1`, or `RG1`.
_Avoid_: LPR, LPG, RPR, RPG

**Board row**:
A horizontal index shared by both rails and both terminal areas.
_Avoid_: Rail row, terminal row

**Electrical group**:
A set of holes internally connected by the breadboard: every row of each terminal is its own group, while each rail is one group across all rows.
_Avoid_: Area, visual neighbour

**Redundant wire**:
A wire whose endpoints belong to the same electrical group and therefore adds no connection; it is invalid.
_Avoid_: Short wire

**Duplicate connection**:
A valid wire joining electrical groups that earlier wires already connect transitively; it produces a warning.
_Avoid_: Redundant wire

**Terminal column count**:
The number of hole columns in each terminal area of a breadboard; it defaults to five.
_Avoid_: Chip height

**Terminal column direction**:
Columns are numbered from the centre gap outward on both terminal areas.
_Avoid_: Global left-to-right numbering

**Language specification**:
The normative definition of syntax, meaning, validation, and deterministic SVG rendering requirements for breadboard descriptions.
_Avoid_: Renderer implementation

**Canonical SVG**:
The single byte-for-byte SVG serialization required for a valid breadboard description, including element order, attributes, numeric formatting, whitespace, identifiers, and colours.
_Avoid_: Visually equivalent SVG

**Canonical SVG unit**:
One CSS pixel in the SVG coordinate system. Coordinates use whole or quarter units only; consumers may scale the completed SVG externally.
_Avoid_: Arbitrary floating-point coordinate

**Diagnostic**:
A deterministic error or warning identified by a stable symbolic code, severity, source span, and optional related span. Human message wording is informative rather than conformant.
_Avoid_: Console message

**Conformance fixture**:
A breadboard description paired with expected ordered diagnostics and, when no errors exist, exact Canonical SVG bytes.
_Avoid_: Unit test, visual snapshot

**Electrical simulation**:
Analysis of circuit behaviour or correctness beyond the structural connections expressed by a breadboard description.
_Avoid_: Validation

## Validated presentation decisions

- Representative examples use a split workbench: source on the left, expected breadboard diagram on the right.
- Explanatory notes are deferred; the first specification should keep the example focused.
- Chips show physical pin numbers inside their bodies. Rails show every fifth board-row number.
- Positive and ground rails carry small `+` and `−` marks.
- Wire insertion points use the wire colour. Wire colour may set saturation; opacity is not supported.
