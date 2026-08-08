import assert from "node:assert/strict";
import test from "node:test";

import { compile } from "../dist/index.js";

function codes(result: ReturnType<typeof compile>) {
  return result.diagnostics.map(({ code }) => code);
}

test("two-terminal components resolve strict endpoints and diagonal bodies", () => {
  const result = compile(`breadboard rows 5 columns 2
led D1 from LP1 to LT-R2C1 {
  on true
}
capacitor C1 from LT-R3C1 to RT-R4C2 {
  type electrolytic
  capacitance 100
  max-voltage 16
  displayed capacitance max-voltage
}
resistor R1 from LP2 to RG3 {
  value 4.7K
}
`);

  assert.equal(result.status, "valid");
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(
    result.model.components.map(({ kind, name }) => ({ kind, name })),
    [
      { kind: "led", name: "D1" },
      { kind: "capacitor", name: "C1" },
      { kind: "resistor", name: "R1" },
    ],
  );
  const capacitor = result.model.components[1];
  assert.equal(capacitor?.kind, "capacitor");
  if (capacitor?.kind === "capacitor") {
    assert.deepEqual(capacitor.body, {
      from: { x4: 568, y4: 344, source: null },
      to: { x4: 1072, y4: 432, source: null },
    });
    assert.deepEqual(capacitor.displayed, ["capacitance", "max-voltage"]);
    assert.deepEqual(capacitor.color, { r: 38, g: 97, b: 156 });
  }
  const resistor = result.model.components[2];
  assert.equal(resistor?.kind, "resistor");
  if (resistor?.kind === "resistor") {
    assert.equal(resistor.resistance, 4700);
    assert.equal(resistor.bands, 4);
    assert.deepEqual(resistor.bandColors, ["yellow", "purple", "red", "gold"]);
  }
  assert.equal(result.model.occupancy.filter(({ kind }) => kind === "component-terminal").length, 6);
});

test("two-terminal components reject invalid electrical endpoint pairs", () => {
  const cases = [
    [`resistor R1 from LT-R1C1 to LT-R1C2 {\n  value 100\n}`, "component.same-group"],
    [`capacitor C1 from LP1 to RP1 {\n}`, "component.same-polarity-rail"],
    [
      `led D1 from LP1 to LT-R1C1 {\n}\nresistor R1 from LP2 to LT-R1C1 {\n  value 100\n}`,
      "selector.exact-hole-unavailable",
    ],
  ] as const;
  for (const [component, expected] of cases) {
    const result = compile(`breadboard rows 3 columns 2\n${component}\n`);
    assert.equal(result.status, "invalid", component);
    assert.ok(codes(result).includes(expected), component);
  }
});

test("two-terminal property validation and rail polarity warnings are precise", () => {
  const warning = compile(`breadboard rows 3 columns 2
led D1 from LG1 to LT-R1C1 {
}
capacitor C1 from LT-R2C1 to RP2 {
  type tantalum
}
`);
  assert.equal(warning.status, "valid");
  assert.deepEqual(codes(warning), [
    "component.polarity-warning",
    "component.polarity-warning",
  ]);

  const invalid = compile(`breadboard rows 3 columns 2
capacitor C1 from LP1 to LT-R1C1 {
  displayed capacitance
}
resistor R1 from LP2 to LT-R2C1 {
  value 1234
  bands 4
}
`);
  assert.equal(invalid.status, "invalid");
  assert.ok(codes(invalid).includes("capacitor.displayed-not-declared"));
  assert.ok(codes(invalid).includes("resistor.value-not-representable"));
});

test("each directly reversed polarized endpoint emits its own warning", () => {
  const result = compile(`breadboard rows 3 columns 2
led D1 from LG1 to RP1 {
}
capacitor C1 from LG2 to RP2 {
  type electrolytic
}
`);

  assert.equal(result.status, "valid");
  assert.deepEqual(codes(result), [
    "component.polarity-warning",
    "component.polarity-warning",
    "component.polarity-warning",
    "component.polarity-warning",
  ]);
});
