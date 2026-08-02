import assert from "node:assert/strict";
import test from "node:test";

import { compile } from "../dist/index.js";

function codes(result: ReturnType<typeof compile>) {
  return result.diagnostics.map(({ code }) => code);
}

test("compile resolves a chip definition and placement into physical state", () => {
  const source = `breadboard rows 6 columns 5
chip Timer {
  height 2
  width 4
  color red
  pin 1 VCC
  pin 2 OUT | SIGNAL
  pin 4 GND
}
place U1 Timer at R2
`;

  const result = compile(source);

  assert.equal(result.status, "valid");
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.model.chips.length, 1);
  assert.deepEqual(result.model.chips[0]?.body, {
    x4: 724,
    y4: 220,
    width4: 632,
    height4: 160,
  });
  assert.deepEqual(
    result.model.chips[0]?.pins.map(({ number, hole, label }) => ({
      number,
      hole,
      label,
    })),
    [
      {
        number: 1,
        hole: { kind: "terminal-hole", side: "left", row: 2, column: 2 },
        label: "VCC",
      },
      {
        number: 2,
        hole: { kind: "terminal-hole", side: "left", row: 3, column: 2 },
        label: "OUT",
      },
      {
        number: 3,
        hole: { kind: "terminal-hole", side: "right", row: 3, column: 2 },
        label: null,
      },
      {
        number: 4,
        hole: { kind: "terminal-hole", side: "right", row: 2, column: 2 },
        label: "GND",
      },
    ],
  );
  assert.equal(result.model.occupancy.length, 8);
});

test("compile reports independent declaration and dimension errors", () => {
  const source = `breadboard Shared rows 4 columns 2
breadboard rows 4
chip Shared {
  height 2
  height 3
  width 5
  pin 2 A | a
  pin 1 B
  pin 1 C
  color red
  pin 7 Z
}
chip Odd {
  pin 3 A
}
`;

  const result = compile(source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(codes(result), [
    "document.multiple-boards",
    "name.duplicate",
    "chip.duplicate-property",
    "chip.width-out-of-range",
    "chip.duplicate-alias",
    "chip.pin-order",
    "chip.duplicate-pin",
    "chip.member-order",
    "chip.pin-out-of-range",
    "chip.inferred-height-not-integral",
  ]);
  assert.equal(result.model, null);
  assert.equal(result.svg, null);
});

test("compile validates placement references, rows, and footprint occupancy", () => {
  const source = `breadboard rows 4 columns 3
chip Unit {
  height 2
  width 2
  pin 1 A
}
place U1 Missing at R1
place U2 Unit at R4
place U3 Unit at R1
place U4 Unit at R2
`;

  const result = compile(source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(codes(result), [
    "placement.unknown-chip",
    "placement.row-overflow",
    "placement.overlap",
  ]);
});

test("compile jointly resolves partial selectors and creates a canonical wire", () => {
  const source = `breadboard rows 3 columns 2
wire P --> LT-R2C
`;

  const result = compile(source);

  assert.equal(result.status, "valid");
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.model.wires[0], {
    number: 1,
    from: {
      hole: { kind: "rail-hole", side: "left", polarity: "positive", row: 2 },
      source: { start: 33, end: 34 },
    },
    to: {
      hole: { kind: "terminal-hole", side: "left", row: 2, column: 2 },
      source: { start: 39, end: 45 },
    },
    path: [
      { x4: 248, y4: 256, source: null },
      { x4: 480, y4: 256, source: null },
    ],
    color: { r: 214, g: 69, b: 69, underlay: false },
    source: { start: 28, end: 45 },
  });
});

test("compile rejects native-group wires and warns on duplicate connectivity", () => {
  const redundant = compile(`breadboard rows 3 columns 2
wire LT-R1C1 --> LT-R1C2
`);
  assert.equal(redundant.status, "invalid");
  assert.deepEqual(codes(redundant), ["wire.redundant"]);

  const duplicate = compile(`breadboard rows 3 columns 2
wire LP1 --> RG1
wire LP2 --> RG2
`);
  assert.equal(duplicate.status, "valid");
  assert.deepEqual(codes(duplicate), ["connection.duplicate"]);
  assert.equal(duplicate.model.wires.length, 2);
});

test("compile preserves valid explicit bends and rejects malformed routes", () => {
  const valid = compile(`breadboard rows 3 columns 2
wire LP1 --> RG3 via LT-R1C1, LT-R3C1
`);
  assert.equal(valid.status, "valid");
  assert.deepEqual(
    valid.model.wires[0]?.path.map(({ x4, y4, source }) => ({ x4, y4, source })),
    [
      { x4: 248, y4: 168, source: null },
      { x4: 568, y4: 168, source: { start: 49, end: 56 } },
      { x4: 568, y4: 344, source: { start: 58, end: 65 } },
      { x4: 1304, y4: 344, source: null },
    ],
  );

  const cases = [
    ["wire LP1 --> RG3 via LT-R2C1", "route.diagonal"],
    ["wire LP1 --> RG3 via LP1, LT-R3C1", "route.duplicate-point"],
    ["wire LP1 --> RG1 via LT-R1C1", "route.collinear"],
    ["wire LP1 --> RG1 via LT-R1C1, LG1", "route.reversal"],
    ["wire LP1 --> RG3 via LT-R9C1", "route.point-not-hole"],
    ["wire LP1 --> RG3 via R2C", "route.point-not-exact"],
  ] as const;
  for (const [wire, expected] of cases) {
    const result = compile(`breadboard rows 3 columns 2\n${wire}\n`);
    assert.equal(result.status, "invalid", wire);
    assert.deepEqual(codes(result), [expected], wire);
  }
});

test("automatic routing detours above chip obstacles on the finite grid", () => {
  const result = compile(`breadboard rows 6 columns 5
chip Block {
  height 2
  width 4
  pin 1 A
}
place U1 Block at R3
wire LP3 --> RG3
`);

  assert.equal(result.status, "valid");
  assert.deepEqual(
    result.model.wires[0]?.path.map(({ x4, y4 }) => ({ x4, y4 })),
    [
      { x4: 248, y4: 344 },
      { x4: 248, y4: 279 },
      { x4: 1832, y4: 279 },
      { x4: 1832, y4: 344 },
    ],
  );
});

test("pin selectors expand aliases to free holes and selector failures stay specific", () => {
  const valid = compile(`breadboard rows 3 columns 3
chip Gate {
  height 1
  width 2
  pin 1 A | SIGNAL
  pin 2 GND
}
place U1 Gate at R2
wire U1.SIGNAL --> RG2
`);
  assert.equal(valid.status, "valid");
  assert.deepEqual(valid.model.wires[0]?.from.hole, {
    kind: "terminal-hole",
    side: "left",
    row: 2,
    column: 2,
  });

  const prefix = `breadboard rows 3 columns 3
chip Gate {
  height 1
  pin 1 A
}
place U1 Gate at R2
`;
  const cases = [
    ["wire Missing.1 --> LP1", "selector.unknown-instance"],
    ["wire U1.3 --> LP1", "selector.unknown-pin"],
    ["wire U1.NOPE --> LP1", "selector.unknown-alias"],
    ["wire LP9 --> RG1", "selector.out-of-range"],
    ["wire LT-R2C1 --> RG1", "selector.exact-hole-unavailable"],
    ["wire LT-R1C --> LT-R1C", "selector.no-valid-pair"],
  ] as const;
  for (const [wire, expected] of cases) {
    const result = compile(`${prefix}${wire}\n`);
    assert.equal(result.status, "invalid", wire);
    assert.deepEqual(codes(result), [expected], wire);
  }

  const noFree = compile(`breadboard rows 1 columns 1
chip Full {
  height 1
  width 2
  pin 1 A
}
place U1 Full at R1
wire U1.A --> LP1
`);
  assert.equal(noFree.status, "invalid");
  assert.deepEqual(codes(noFree), ["selector.no-free-hole"]);
});

test("wire colour precedence, saturation, underlay, and overlap are deterministic", () => {
  const result = compile(`breadboard rows 3 columns 2
wire LP1 --> RG1
wire LG1 --> RP1 color #E0B929 saturation 0%
`);

  assert.equal(result.status, "valid");
  assert.deepEqual(codes(result), ["route.overlap"]);
  assert.deepEqual(result.model.wires[0]?.color, {
    r: 214,
    g: 69,
    b: 69,
    underlay: false,
  });
  assert.deepEqual(result.model.wires[1]?.color, {
    r: 133,
    g: 133,
    b: 133,
    underlay: true,
  });
});

test("safe-range and resource limits return unsupported, not language errors", () => {
  const unsafe = compile(`breadboard rows 9007199254740992\n`);
  assert.equal(unsafe.status, "unsupported");
  if (unsafe.status === "unsupported") {
    assert.equal(unsafe.reason.code, "integer-out-of-range");
  }

  const huge = compile(`breadboard rows 1000000 columns 1000000\n`);
  assert.equal(huge.status, "unsupported");
  if (huge.status === "unsupported") {
    assert.equal(huge.reason.code, "resource-limit");
  }
});

test("inferred height, odd-width flip, shared aliases, and hashed colours resolve", () => {
  const result = compile(`breadboard rows 5 columns 3
chip Pair {
  width 3
  pin 1 GND
  pin 4 GND
}
place A Pair at R1
place B Pair at R4 flip
wire A.GND --> LP1
`);

  assert.equal(result.status, "valid");
  assert.equal(result.model.chips[0]?.pins.length, 4);
  assert.deepEqual(result.model.chips[0]?.pins[0]?.hole, {
    kind: "terminal-hole",
    side: "left",
    row: 1,
    column: 1,
  });
  assert.deepEqual(result.model.chips[1]?.pins[0]?.hole, {
    kind: "terminal-hole",
    side: "right",
    row: 4,
    column: 1,
  });
  assert.deepEqual(result.model.wires[0]?.from.hole, {
    kind: "terminal-hole",
    side: "left",
    row: 1,
    column: 3,
  });
  assert.deepEqual(result.model.wires[0]?.color, {
    r: 63,
    g: 143,
    b: 85,
    underlay: false,
  });
});

test("references to later declarations get a forward-reference diagnostic", () => {
  const result = compile(`breadboard rows 3 columns 2
place U1 Later at R1
chip Later {
  height 1
  pin 1 A
}
`);

  assert.equal(result.status, "invalid");
  assert.deepEqual(codes(result), [
    "name.forward-reference",
    "syntax.statement-order",
  ]);
});

test("unresolved declarations suppress dependent placement and selector cascades", () => {
  const result = compile(`breadboard rows 3 columns 2
chip Bad {
  pin 3 A
}
place U1 Bad at R1
wire U1.1 --> LP1
`);

  assert.equal(result.status, "invalid");
  assert.deepEqual(codes(result), ["chip.inferred-height-not-integral"]);
});

test("pin selectors reject chip instances declared later", () => {
  const result = compile(`breadboard rows 3 columns 2
chip Gate {
  height 1
  pin 1 A
}
wire U1.1 --> LP1
place U1 Gate at R1
`);

  assert.equal(result.status, "invalid");
  assert.deepEqual(codes(result), [
    "name.forward-reference",
    "syntax.statement-order",
  ]);
});
