import assert from "node:assert/strict";
import test from "node:test";

import { compile } from "../dist/index.js";

function codes(result: ReturnType<typeof compile>) {
  return result.diagnostics.map(({ code }) => code);
}

test("placed controls expose numeric and named pins with structural contacts", () => {
  const result = compile(`breadboard rows 9 columns 3
button S1 {
  pins-per-side 2
  on true
} at R1
potentiometer P1 {
  resistance 4.7K
  value 0.25
} at R3 right outside
switch S2 {
  options 2
  value 2
} at R5
wire S1.left1 --> P1.2
wire P1.wiper --> S2.common
annotation 1 at S1.4
annotation 2 at S1.right1
`);

  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  assert.deepEqual(codes(result), []);
  assert.deepEqual(
    result.model.components.map((component) => component.kind),
    ["button", "potentiometer", "switch"],
  );
  const [button, potentiometer, switchComponent] = result.model.components;
  assert.equal(button?.kind, "button");
  assert.equal(potentiometer?.kind, "potentiometer");
  assert.equal(switchComponent?.kind, "switch");
  if (
    button?.kind !== "button" ||
    potentiometer?.kind !== "potentiometer" ||
    switchComponent?.kind !== "switch"
  ) return;

  assert.deepEqual(
    button.terminals.map(({ number, name, hole }) => ({ number, name, hole })),
    [
      { number: 1, name: "left1", hole: { kind: "terminal-hole", side: "left", row: 1, column: 1 } },
      { number: 2, name: "left2", hole: { kind: "terminal-hole", side: "left", row: 2, column: 1 } },
      { number: 4, name: "right1", hole: { kind: "terminal-hole", side: "right", row: 1, column: 1 } },
      { number: 3, name: "right2", hole: { kind: "terminal-hole", side: "right", row: 2, column: 1 } },
    ],
  );
  assert.equal(potentiometer.resistance, 4_700);
  assert.equal(potentiometer.value, 0.25);
  assert.deepEqual(
    potentiometer.terminals.map(({ number, name, hole }) => ({ number, name, hole })),
    [
      { number: 1, name: "low", hole: { kind: "terminal-hole", side: "right", row: 3, column: 1 } },
      { number: 2, name: "wiper", hole: { kind: "terminal-hole", side: "right", row: 4, column: 1 } },
      { number: 3, name: "high", hole: { kind: "terminal-hole", side: "right", row: 5, column: 1 } },
    ],
  );
  assert.deepEqual(
    result.model.connections
      .filter((connection) => connection.kind === "contact")
      .map(({ component, fromTerminal, toTerminal }) => ({ component, fromTerminal, toTerminal })),
    [
      { component: "S1", fromTerminal: 1, toTerminal: 2 },
      { component: "S1", fromTerminal: 4, toTerminal: 3 },
      { component: "S1", fromTerminal: 1, toTerminal: 4 },
      { component: "S2", fromTerminal: 1, toTerminal: 3 },
    ],
  );
  assert.equal(result.model.annotations.length, 2);
  assert.deepEqual(result.model.annotations[0]?.target.hole, result.model.annotations[1]?.target.hole);
  assert.ok(result.model.viewport.width4 > (300 + 44 * 3) * 4);
});

test("control state, placement, duplicate properties, and annotations validate locally", () => {
  const result = compile(`breadboard rows 5 columns 3
button S1 {
  pins-per-side 2
  pins-per-side 3
} at R5
potentiometer P1 {
  value 1.1
} at R1
switch S2 {
  options 2
  value 3
} at R2 right
annotation 1 at P
annotation 1 at LP1
`);

  assert.equal(result.status, "invalid");
  assert.deepEqual(codes(result), [
    "component.duplicate-property",
    "control.invalid-value",
    "control.invalid-value",
    "annotation.target-not-exact",
    "annotation.duplicate-number",
  ]);
});

test("later two-terminal components can reference earlier component pins", () => {
  const result = compile(`breadboard rows 5 columns 3
led D1 from LP1 to LT-R1C1 {
}
resistor R1 from D1.2 to RG1 {
  value 10k
}
annotation 1 at R1.1
`);

  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  assert.deepEqual(result.model.components.map(({ kind }) => kind), ["led", "resistor"]);
  assert.equal(result.model.annotations.length, 1);
});

test("component occupancy and references follow declaration order", () => {
  const overlap = compile(`breadboard rows 4 columns 3
led D1 from LP1 to LT-R1C1 {
}
button S1 {
} at R1
`);
  assert.equal(overlap.status, "invalid");
  assert.deepEqual(codes(overlap), ["placement.overlap"]);

  const forward = compile(`breadboard rows 4 columns 3
led D1 from R2.1 to LG1 {
}
resistor R2 from LP1 to LT-R2C1 {
  value 10k
}
`);
  assert.equal(forward.status, "invalid");
  assert.deepEqual(codes(forward), ["name.forward-reference"]);
});

test("rail component pins and occupied annotation targets remain addressable", () => {
  const result = compile(`breadboard rows 4 columns 3
led D1 from LP1 to LT-R1C1 {
}
resistor R1 from D1.1 to RG2 {
  value 10k
}
annotation 1 at LP1
annotation 2 at D1.1
`);

  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  const resistor = result.model.components[1];
  assert.equal(resistor?.kind, "resistor");
  if (resistor?.kind === "resistor") {
    assert.deepEqual(resistor.terminals[0].hole, {
      kind: "rail-hole",
      side: "left",
      polarity: "positive",
      row: 2,
    });
  }
  assert.deepEqual(result.model.annotations.map(({ target }) => target.hole), [
    { kind: "rail-hole", side: "left", polarity: "positive", row: 1 },
    { kind: "rail-hole", side: "left", polarity: "positive", row: 1 },
  ]);
});

test("large control counts report overflow without allocating giant arrays", () => {
  for (const declaration of [
    `button S1 {\n  pins-per-side 4294967296\n} at R1`,
    `switch S1 {\n  options 4294967296\n} at R1`,
  ]) {
    const result = compile(`breadboard rows 4 columns 3\n${declaration}\n`);
    assert.equal(result.status, "invalid");
    assert.deepEqual(codes(result), ["placement.row-overflow"]);
  }
});
