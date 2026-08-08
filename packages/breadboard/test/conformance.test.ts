import assert from "node:assert/strict";
import test from "node:test";

import { compile } from "../dist/index.js";
import { loadConformanceFixtures } from "./support/fixtures.ts";

function normativeDiagnostics(
  diagnostics: readonly {
    code: string;
    severity: "error" | "warning";
    range: unknown;
    related?: unknown;
  }[],
) {
  return diagnostics.map(({ code, severity, range, related }) => ({
    code,
    severity,
    range,
    ...(related === undefined ? {} : { related }),
  }));
}

test("empty document compiles as the default breadboard", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "empty-default");
  assert.ok(fixture);

  assert.deepEqual(fixture.diagnostics, []);

  const result = compile(fixture.source);

  assert.equal(result.status, "valid");
  assert.deepEqual(result.ast, {
    kind: "document",
    statements: [],
    span: { start: 0, end: fixture.source.length },
  });
  assert.deepEqual(result.diagnostics, fixture.diagnostics);
  assert.deepEqual(result.model, {
    kind: "breadboard-model",
    board: { name: null, rows: 30, columns: 5, source: null },
    viewport: { x4: 0, y4: 0, width4: 2080, height4: 2864 },
    components: [],
    wires: [],
    annotations: [],
    connections: [],
    occupancy: [],
  });
  assert.equal(result.svg, fixture.svg);
});

test("malformed line recovers at newline and preserves later statements", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(
    ({ name }) => name === "recovery-across-statements",
  );
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(
    normativeDiagnostics(result.diagnostics),
    fixture.diagnostics,
  );
  assert.deepEqual(
    result.ast.statements.map(({ kind }) => kind),
    [
      "breadboard",
      "chip-definition",
      "placement",
      "wire",
      "invalid-statement",
      "wire",
    ],
  );
  assert.equal(result.ast.statements[1]?.kind, "chip-definition");
  if (result.ast.statements[1]?.kind === "chip-definition") {
    assert.deepEqual(
      result.ast.statements[1].members.map(({ kind }) => kind),
      [
        "height-member",
        "width-member",
        "color-member",
        "pin-member",
        "pin-member",
      ],
    );
  }
  assert.equal(result.ast.statements[3]?.kind, "wire");
  if (result.ast.statements[3]?.kind === "wire") {
    assert.equal(result.ast.statements[3].from.kind, "pin-selector");
    assert.equal(result.ast.statements[3].via?.length, 2);
    assert.equal(result.ast.statements[3].saturation?.value, 50);
  }
  assert.equal(result.model, null);
  assert.equal(result.svg, null);
});

test("chip recovery synchronizes at newline and closing brace", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "brace-recovery");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(
    normativeDiagnostics(result.diagnostics),
    fixture.diagnostics,
  );
  assert.deepEqual(
    result.ast.statements.map(({ kind }) => kind),
    ["chip-definition", "wire"],
  );
  const chip = result.ast.statements[0];
  assert.equal(chip?.kind, "chip-definition");
  if (chip?.kind === "chip-definition") {
    assert.deepEqual(
      chip.members.map(({ kind }) => kind),
      ["invalid-chip-member", "invalid-chip-member"],
    );
  }
});

test("invalid literal diagnostics are specific and source ordered", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "invalid-literals");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(
    normativeDiagnostics(result.diagnostics),
    fixture.diagnostics,
  );
  const board = result.ast.statements[0];
  assert.equal(board?.kind, "breadboard");
  if (board?.kind === "breadboard") {
    assert.equal(board.rows.spelling, "03");
    assert.equal(board.columns?.value, 0);
  }
  const wire = result.ast.statements[2];
  assert.equal(wire?.kind, "wire");
  if (wire?.kind === "wire") {
    assert.equal(wire.saturation?.value, 101);
  }
});

test("BOM, statement order, and missing brace use stable diagnostics", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "syntax-boundaries");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(
    normativeDiagnostics(result.diagnostics),
    fixture.diagnostics,
  );
  assert.deepEqual(
    result.ast.statements.map(({ kind }) => kind),
    [
      "invalid-statement",
      "wire",
      "breadboard",
      "chip-definition",
    ],
  );
});

test("numeric pin alias gets its specific diagnostic", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "invalid-alias");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(
    normativeDiagnostics(result.diagnostics),
    fixture.diagnostics,
  );
  const chip = result.ast.statements[0];
  assert.equal(chip?.kind, "chip-definition");
  if (chip?.kind === "chip-definition") {
    assert.equal(chip.members[0]?.kind, "invalid-chip-member");
  }
});

test("names distinguish invalid identifiers, reserved names, and aliases", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "invalid-names");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(
    normativeDiagnostics(result.diagnostics),
    fixture.diagnostics,
  );
  const chip = result.ast.statements[1];
  assert.equal(chip?.kind, "chip-definition");
  if (chip?.kind === "chip-definition") {
    const pin = chip.members[0];
    assert.equal(pin?.kind, "pin-member");
    if (pin?.kind === "pin-member") {
      assert.equal(pin.aliases[0]?.value, "9alias");
    }
  }
});

test("explicit breadboard declaration reaches the same compile interface", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "explicit-board");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "valid");
  assert.deepEqual(result.ast, {
    kind: "document",
    statements: [
      {
        kind: "breadboard",
        name: {
          value: "Stage",
          spelling: "Stage",
          span: { start: 11, end: 16 },
        },
        rows: {
          kind: "integer",
          supported: true,
          value: 2,
          spelling: "2",
          span: { start: 22, end: 23 },
        },
        columns: {
          kind: "integer",
          supported: true,
          value: 3,
          spelling: "3",
          span: { start: 32, end: 33 },
        },
        span: { start: 0, end: 33 },
      },
    ],
    span: { start: 0, end: fixture.source.length },
  });
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.model, {
    kind: "breadboard-model",
    board: {
      name: "Stage",
      rows: 2,
      columns: 3,
      source: { start: 0, end: 33 },
    },
    viewport: { x4: 0, y4: 0, width4: 1728, height4: 400 },
    components: [],
    wires: [],
    annotations: [],
    connections: [],
    occupancy: [],
  });
  assert.equal(result.svg, fixture.svg);
});

test("V0.2 declarations preserve literals, modifiers, and source order", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "v02-declarations");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(normativeDiagnostics(result.diagnostics), fixture.diagnostics);
  assert.deepEqual(
    result.ast.statements.map(({ kind }) => kind),
    [
      "breadboard",
      "chip",
      "led",
      "capacitor",
      "resistor",
      "button",
      "potentiometer",
      "switch",
      "wire",
      "annotation",
    ],
  );

  const chip = result.ast.statements[1];
  assert.equal(chip?.kind, "chip");
  if (chip?.kind === "chip") {
    assert.equal(chip.row.value, 5);
    assert.equal(chip.flip?.value, true);
  }

  const capacitor = result.ast.statements[3];
  assert.equal(capacitor?.kind, "capacitor");
  if (capacitor?.kind === "capacitor") {
    const displayed = capacitor.members.find(
      ({ kind }) => kind === "displayed-member",
    );
    assert.equal(displayed?.kind, "displayed-member");
    if (displayed?.kind === "displayed-member") {
      assert.deepEqual(
        displayed.values.map(({ value }) => value),
        ["capacitance", "max-voltage"],
      );
    }
  }

  const resistor = result.ast.statements[4];
  assert.equal(resistor?.kind, "resistor");
  if (resistor?.kind === "resistor") {
    const value = resistor.members.find(
      ({ kind }) => kind === "resistor-value-member",
    );
    assert.equal(value?.kind, "resistor-value-member");
    if (value?.kind === "resistor-value-member") {
      assert.equal(value.value.spelling, "4.7K");
      assert.equal(value.value.ohms, 4700);
    }
  }

  const potentiometer = result.ast.statements[6];
  assert.equal(potentiometer?.kind, "potentiometer");
  if (potentiometer?.kind === "potentiometer") {
    assert.equal(potentiometer.side?.value, "right");
    assert.equal(potentiometer.outside?.value, true);
  }
});

test("V0.2 member recovery and singleton-place errors stay local", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "v02-recovery");
  assert.ok(fixture);

  const result = compile(fixture.source);

  assert.equal(result.status, "invalid");
  assert.deepEqual(normativeDiagnostics(result.diagnostics), fixture.diagnostics);
  const led = result.ast.statements[1];
  assert.equal(led?.kind, "led");
  if (led?.kind === "led") {
    assert.deepEqual(
      led.members.map(({ kind }) => kind),
      ["invalid-led-member", "invalid-led-member"],
    );
  }
  assert.equal(result.ast.statements.at(-1)?.kind, "wire");
});

test("every conformance fixture matches normative diagnostics and SVG bytes", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );

  for (const fixture of fixtures) {
    const result = compile(fixture.source);
    assert.deepEqual(
      normativeDiagnostics(result.diagnostics),
      fixture.diagnostics,
      fixture.name,
    );
    if (fixture.svg === null) {
      assert.equal(result.status, "invalid", fixture.name);
      assert.equal(result.svg, null, fixture.name);
    } else {
      assert.equal(result.status, "valid", fixture.name);
      assert.equal(result.svg, fixture.svg, fixture.name);
    }
  }
});

test("valid SVG uses the canonical constrained vocabulary", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const allowedElements = new Set([
    "svg",
    "title",
    "desc",
    "rect",
    "line",
    "circle",
    "path",
    "text",
    "tspan",
    "g",
  ]);

  for (const fixture of fixtures) {
    if (fixture.svg === null) continue;
    assert.ok(fixture.svg.endsWith("\n"), fixture.name);
    assert.equal(fixture.svg.includes("\r"), false, fixture.name);
    assert.match(
      fixture.svg,
      /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" role="img" /u,
      fixture.name,
    );
    assert.deepEqual(
      [...fixture.svg.matchAll(/<g data-layer="([^"]+)"/gu)].map(([, layer]) => layer),
      ["board", "rails", "holes", "wires", "components", "annotations", "labels"],
      fixture.name,
    );
    assert.equal(
      /\s(?:id|class|style|transform|opacity)=/u.test(fixture.svg),
      false,
      fixture.name,
    );
    for (const [, slash, element] of fixture.svg.matchAll(/<(\/)?([A-Za-z]+)/gu)) {
      assert.ok(slash !== undefined || allowedElements.has(element ?? ""), fixture.name);
    }
  }
});

test("V0.2 SVG covers every glyph, outside viewports, and annotation offsets", async () => {
  const fixtures = await loadConformanceFixtures(
    new URL("./conformance/", import.meta.url),
  );
  const fixture = fixtures.find(({ name }) => name === "v02-rendering");
  assert.ok(fixture?.svg);

  for (const kind of [
    "led",
    "capacitor",
    "resistor",
    "button",
    "potentiometer",
    "switch",
  ]) {
    assert.match(fixture.svg, new RegExp(`data-kind="${kind}"`, "u"));
  }
  for (const type of [
    "ceramic",
    "electrolytic",
    "film",
    "tantalum",
    "supercapacitor",
  ]) {
    assert.match(fixture.svg, new RegExp(`data-capacitor-type="${type}"`, "u"));
  }
  assert.match(fixture.svg, /viewBox="-44 0 608 496"/u);
  assert.match(fixture.svg, /overflow="visible"/u);
  assert.equal([...fixture.svg.matchAll(/data-annotation=/gu)].length, 3);
  assert.match(fixture.svg, /data-bands="4"/u);
  assert.match(fixture.svg, /data-bands="6"/u);
  assert.match(fixture.svg, />C2 100µF 16V</u);
});
