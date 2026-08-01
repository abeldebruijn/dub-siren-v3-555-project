# Breadboard Description Language

A language for describing breadboard layouts that can be rendered as deterministic SVG diagrams.

## Language

**Breadboard description**:
A human-readable declaration of a breadboard, its placed components, and its routed wires.
_Avoid_: Circuit, schematic

**Hole**:
A concrete physical connection position on a breadboard.
_Avoid_: Pin, coordinate

**Hole selector**:
A case-insensitive coordinate expression that may omit location details for deterministic inference during resolution.
_Avoid_: Partial coordinate

**Resolved hole**:
The concrete hole selected from a hole selector by minimizing required intermediate route points, then applying occupancy rules.
_Avoid_: Inferred coordinate

**Wire endpoint**:
One of the two holes electrically joined and occupied by a wire.
_Avoid_: Route point

**Route point**:
A geometric point where a rendered wire makes a 90-degree turn; it neither occupies nor electrically connects to a hole.
_Avoid_: Wire endpoint, connection

**Chip definition**:
A reusable description of a chip's identity, pins, aliases, colour, and physical footprint.
_Avoid_: Chip instance, placement

**Pins per side**:
The number of physical pins on each of a chip's two pin sides.
_Avoid_: Width, total pins

**Chip height**:
The total number of terminal columns covered by a chip body; it may be even or odd.
_Avoid_: Pins per side

**Chip flip**:
A placement orientation that swaps which terminal receives the extra covered column of an odd-height chip. Without a flip, the right terminal receives the extra column.
_Avoid_: Rotation

**Chip instance**:
A named placement of a chip definition, centred across the terminal gap with its top pin pair anchored to a breadboard row.
_Avoid_: Chip definition

**Pin order**:
Counter-clockwise physical numbering beginning at the top-left, increasing down the left side, continuing at the bottom-right, and increasing up the right side.
_Avoid_: Alias order

**Breadboard**:
A board with a required row count, a configurable number of columns per terminal area, and continuous positive and ground rails on both sides.
_Avoid_: Board diagram

**Terminal column count**:
The number of hole columns in each terminal area of a breadboard; it defaults to five.
_Avoid_: Chip height

**Terminal column direction**:
Columns are numbered left-to-right within each terminal area.
_Avoid_: Distance from the centre gap

**Language specification**:
The normative definition of syntax, meaning, validation, and deterministic SVG rendering requirements for breadboard descriptions.
_Avoid_: Renderer implementation

**Electrical simulation**:
Analysis of circuit behaviour or correctness beyond the structural connections expressed by a breadboard description.
_Avoid_: Validation
