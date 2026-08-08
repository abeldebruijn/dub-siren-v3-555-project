import type {
  CanonicalAnnotation,
  CanonicalBoardTerminal,
  CanonicalBreadboardModel,
  CanonicalButton,
  CanonicalCapacitor,
  CanonicalChip,
  CanonicalComponent,
  CanonicalLed,
  CanonicalPoint,
  CanonicalPotentiometer,
  CanonicalRect,
  CanonicalResistor,
  CanonicalSwitch,
  CanonicalTerminal,
  CanonicalWire,
  ExactHole,
  ResistorBandColor,
  RgbColor,
} from "./types.js";

const COLORS = {
  board: "#F5F2EB",
  boardOutline: "#B9AD8D",
  channel: "#DFD5B9",
  hole: "#D1CCC3",
  label: "#413B31",
  secondaryLabel: "#756E60",
  positive: "#D64545",
  ground: "#252525",
  leg: "#746F67",
  componentOutline: "#3B382F",
  control: "#454F5A",
  controlDark: "#242A31",
  controlLight: "#F3EEE4",
  resistor: "#D8B47E",
  resistorOutline: "#8D704A",
  annotation: "#F4B84F",
} as const;

const BAND_COLORS: Readonly<Record<ResistorBandColor, string>> = {
  black: "#252525",
  red: "#D64545",
  brown: "#79502D",
  orange: "#D97A24",
  yellow: "#E0B929",
  green: "#3F8F55",
  forest: "#155D3A",
  blue: "#26619C",
  cyan: "#2AA7B8",
  purple: "#6F3D86",
  grey: "#858585",
  white: "#FAFAFA",
  gold: "#D4AF37",
  silver: "#B7B7B7",
};

const SANS = "Arial, Helvetica, sans-serif";
const MONO = "Menlo, Consolas, monospace";

function formatQuarter(value4: number): string {
  const value = value4 / 4;
  if (Object.is(value, -0)) return "0";
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0$/u, "");
}

function px(value: number): string {
  return formatQuarter(Math.round(value * 4));
}

function hexColor(color: RgbColor): string {
  const channel = (value: number) =>
    value.toString(16).toUpperCase().padStart(2, "0");
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}

function offColor(color: RgbColor): RgbColor {
  const grey = Math.round((color.r + color.g + color.b) / 3);
  const mix = (channel: number) => Math.round(channel * 0.45 + grey * 0.55);
  return { r: mix(color.r), g: mix(color.g), b: mix(color.b) };
}

function relativeLuminance(color: RgbColor): number {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * linear(color.r) +
    0.7152 * linear(color.g) +
    0.0722 * linear(color.b)
  );
}

function textColor(color: RgbColor): "#252525" | "#FFFFFF" {
  const background = relativeLuminance(color);
  const dark = relativeLuminance({ r: 37, g: 37, b: 37 });
  const darkContrast =
    (Math.max(background, dark) + 0.05) /
    (Math.min(background, dark) + 0.05);
  const whiteContrast =
    (Math.max(background, 1) + 0.05) /
    (Math.min(background, 1) + 0.05);
  return darkContrast >= whiteContrast ? "#252525" : "#FFFFFF";
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function textElement(
  x: number,
  y: number,
  value: string,
  options: {
    anchor?: "start" | "middle" | "end";
    fill?: string;
    family?: string;
    size: number;
    indent?: string;
  },
): string {
  const anchor = options.anchor ?? "middle";
  const fill = options.fill ?? COLORS.label;
  const family = options.family ?? SANS;
  const indent = options.indent ?? "    ";
  return `${indent}<text x="${px(x)}" y="${px(y)}" text-anchor="${anchor}" fill="${fill}" font-family="${family}" font-size="${options.size}" font-weight="bold">${escapeText(value)}</text>`;
}

function railHeading(x: number, code: string, sign: string): string {
  return `    <text x="${px(x)}" y="25" text-anchor="middle" fill="${COLORS.label}" font-family="${SANS}" font-size="10" font-weight="bold">${code} <tspan font-size="8">${sign}</tspan></text>`;
}

function point(point4: CanonicalPoint): readonly [number, number] {
  return [point4.x4 / 4, point4.y4 / 4];
}

function rect(rect4: CanonicalRect) {
  return {
    x: rect4.x4 / 4,
    y: rect4.y4 / 4,
    width: rect4.width4 / 4,
    height: rect4.height4 / 4,
  };
}

function interpolate(
  from: CanonicalPoint,
  to: CanonicalPoint,
  ratio: number,
): readonly [number, number] {
  return [
    Math.round((from.x4 + (to.x4 - from.x4) * ratio)) / 4,
    Math.round((from.y4 + (to.y4 - from.y4) * ratio)) / 4,
  ];
}

function segmentPath(from: CanonicalPoint, to: CanonicalPoint): string {
  const [fromX, fromY] = point(from);
  const [toX, toY] = point(to);
  return `M ${px(fromX)} ${px(fromY)} L ${px(toX)} ${px(toY)}`;
}

function linePath(
  from: readonly [number, number],
  to: readonly [number, number],
): string {
  return `M ${px(from[0])} ${px(from[1])} L ${px(to[0])} ${px(to[1])}`;
}

function quadrilateral(
  from: CanonicalPoint,
  to: CanonicalPoint,
  startRatio: number,
  endRatio: number,
  halfThickness: number,
): string {
  const [startX, startY] = interpolate(from, to, startRatio);
  const [endX, endY] = interpolate(from, to, endRatio);
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.hypot(dx, dy) || 1;
  const ox = (-dy / length) * halfThickness;
  const oy = (dx / length) * halfThickness;
  return [
    `M ${px(startX + ox)} ${px(startY + oy)}`,
    `L ${px(endX + ox)} ${px(endY + oy)}`,
    `L ${px(endX - ox)} ${px(endY - oy)}`,
    `L ${px(startX - ox)} ${px(startY - oy)} Z`,
  ].join(" ");
}

function terminalMarker(
  terminal: CanonicalTerminal,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
  color: string,
): string {
  const [x, y] = point(pointForHole(terminal.hole));
  return `      <circle cx="${px(x)}" cy="${px(y)}" r="4" fill="${COLORS.board}" stroke="${color}" stroke-width="2.5"/>`;
}

function renderChip(chip: CanonicalChip): readonly string[] {
  const body = rect(chip.body);
  const color = hexColor(chip.color);
  return [
    `    <g data-component="${escapeText(chip.name)}" data-kind="chip">`,
    `      <rect x="${px(body.x)}" y="${px(body.y)}" width="${px(body.width)}" height="${px(body.height)}" rx="6" fill="${color}" stroke="${COLORS.componentOutline}" stroke-width="3"/>`,
    "    </g>",
  ];
}

function renderChipLabels(
  chip: CanonicalChip,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const body = rect(chip.body);
  const color = textColor(chip.color);
  const centreX = body.x + body.width / 2;
  const centreY = body.y + body.height / 2;
  const lines = [
    `    <g data-component-label="${escapeText(chip.name)}">`,
    textElement(centreX, centreY - 1, chip.label ?? chip.name, {
      fill: color,
      size: 10,
      indent: "      ",
    }),
  ];
  if (chip.label !== null) {
    lines.push(textElement(centreX, centreY + 8, chip.name, {
      fill: color,
      family: MONO,
      size: 7,
      indent: "      ",
    }));
  }
  for (const pin of chip.terminals) {
    const [x, y] = point(pointForHole(pin.hole));
    const side = pin.hole.side;
    const label = pin.name === null
      ? String(pin.number)
      : side === "left"
        ? `${pin.number} ${pin.name}`
        : `${pin.name} ${pin.number}`;
    lines.push(textElement(x + (side === "left" ? 7 : -7), y + 2.5, label, {
      anchor: side === "left" ? "start" : "end",
      fill: color,
      family: MONO,
      size: 6,
      indent: "      ",
    }));
  }
  lines.push("    </g>");
  return lines;
}

function renderTwoTerminalLegs(
  component: CanonicalLed | CanonicalCapacitor | CanonicalResistor,
  bodyStart = 0.38,
  bodyEnd = 0.62,
): readonly string[] {
  const start = interpolate(component.body.from, component.body.to, bodyStart);
  const end = interpolate(component.body.from, component.body.to, bodyEnd);
  const from = point(component.body.from);
  const to = point(component.body.to);
  return [
    `      <path d="${linePath(from, start)}" fill="none" stroke="${COLORS.leg}" stroke-width="4" stroke-linecap="round"/>`,
    `      <path d="${linePath(end, to)}" fill="none" stroke="${COLORS.leg}" stroke-width="4" stroke-linecap="round"/>`,
  ];
}

function renderLed(
  led: CanonicalLed,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const [centreX, centreY] = interpolate(led.body.from, led.body.to, 0.5);
  const fill = hexColor(led.on ? led.color : offColor(led.color));
  const lines = [
    `    <g data-component="${escapeText(led.name)}" data-kind="led" data-state="${led.on ? "on" : "off"}">`,
  ];
  if (led.displayLegs) lines.push(...renderTwoTerminalLegs(led));
  lines.push(
    `      <circle cx="${px(centreX)}" cy="${px(centreY)}" r="7" fill="${fill}" stroke="${COLORS.componentOutline}" stroke-width="1.5"/>`,
    terminalMarker(led.terminals[0], pointForHole, COLORS.positive),
    terminalMarker(led.terminals[1], pointForHole, COLORS.ground),
    "    </g>",
  );
  return lines;
}

function renderLedLabels(led: CanonicalLed): readonly string[] {
  const [fromX, fromY] = point(led.body.from);
  const [toX, toY] = point(led.body.to);
  const [centreX, centreY] = interpolate(led.body.from, led.body.to, 0.5);
  return [
    textElement(centreX, centreY - 10, led.name, { family: MONO, size: 7 }),
    textElement(fromX + 7, fromY - 6, "+", { fill: COLORS.positive, size: 8 }),
    textElement(toX + 7, toY - 6, "−", { fill: COLORS.ground, size: 8 }),
  ];
}

function renderCapacitor(
  capacitor: CanonicalCapacitor,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const color = hexColor(capacitor.color);
  const [centreX, centreY] = interpolate(capacitor.body.from, capacitor.body.to, 0.5);
  const polarized = capacitor.type === "electrolytic" ||
    capacitor.type === "tantalum" ||
    capacitor.type === "supercapacitor";
  const lines = [
    `    <g data-component="${escapeText(capacitor.name)}" data-kind="capacitor" data-capacitor-type="${capacitor.type}">`,
    ...renderTwoTerminalLegs(capacitor, 0.36, 0.64),
  ];
  if (capacitor.type === "tantalum") {
    lines.push(
      `      <circle cx="${px(centreX)}" cy="${px(centreY)}" r="7" fill="${color}" stroke="${COLORS.componentOutline}" stroke-width="1.5"/>`,
    );
  } else {
    const start = capacitor.type === "ceramic" ? 0.46 : 0.36;
    const end = capacitor.type === "ceramic" ? 0.54 : 0.64;
    const thickness = capacitor.type === "supercapacitor"
      ? 8
      : capacitor.type === "electrolytic" || capacitor.type === "ceramic"
        ? 7
        : 5;
    lines.push(
      `      <path d="${quadrilateral(capacitor.body.from, capacitor.body.to, start, end, thickness)}" fill="${color}" stroke="${COLORS.componentOutline}" stroke-width="1.5" stroke-linejoin="round"/>`,
    );
    if (capacitor.type === "supercapacitor") {
      for (const ratio of [0.4, 0.6]) {
        const [bandX, bandY] = interpolate(capacitor.body.from, capacitor.body.to, ratio);
        const [fromX, fromY] = point(capacitor.body.from);
        const [toX, toY] = point(capacitor.body.to);
        const length = Math.hypot(toX - fromX, toY - fromY) || 1;
        const offsetX = (-(toY - fromY) / length) * 7;
        const offsetY = ((toX - fromX) / length) * 7;
        lines.push(
          `      <path d="${linePath([bandX + offsetX, bandY + offsetY], [bandX - offsetX, bandY - offsetY])}" fill="none" stroke="#FFFFFF" stroke-width="1"/>`,
        );
      }
    }
  }
  lines.push(
    terminalMarker(capacitor.terminals[0], pointForHole, polarized ? COLORS.positive : COLORS.leg),
    terminalMarker(capacitor.terminals[1], pointForHole, polarized ? COLORS.ground : COLORS.leg),
    "    </g>",
  );
  return lines;
}

function renderCapacitorLabels(capacitor: CanonicalCapacitor): readonly string[] {
  const [fromX, fromY] = point(capacitor.body.from);
  const [toX, toY] = point(capacitor.body.to);
  const [centreX, centreY] = interpolate(capacitor.body.from, capacitor.body.to, 0.5);
  const values = capacitor.displayed.flatMap((displayed) => {
    if (displayed === "capacitance" && capacitor.capacitance !== null) {
      return [`${capacitor.capacitance}µF`];
    }
    if (displayed === "max-voltage" && capacitor.maxVoltage !== null) {
      return [`${capacitor.maxVoltage}V`];
    }
    return [];
  });
  const lines = [
    textElement(centreX, centreY - 11, [capacitor.name, ...values].join(" "), {
      family: MONO,
      size: 7,
    }),
  ];
  if (
    capacitor.type === "electrolytic" ||
    capacitor.type === "tantalum" ||
    capacitor.type === "supercapacitor"
  ) {
    lines.push(
      textElement(fromX + 7, fromY - 6, "+", { fill: COLORS.positive, size: 8 }),
      textElement(toX + 7, toY - 6, "−", { fill: COLORS.ground, size: 8 }),
    );
  }
  return lines;
}

function renderResistor(
  resistor: CanonicalResistor,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const lines = [
    `    <g data-component="${escapeText(resistor.name)}" data-kind="resistor" data-bands="${resistor.bands}">`,
    ...renderTwoTerminalLegs(resistor, 0.3, 0.7),
    `      <path d="${quadrilateral(resistor.body.from, resistor.body.to, 0.3, 0.7, 6)}" fill="${COLORS.resistor}" stroke="${COLORS.resistorOutline}" stroke-width="1.5" stroke-linejoin="round"/>`,
  ];
  for (let index = 0; index < resistor.bandColors.length; index += 1) {
    const ratio = 0.36 + (index * 0.28) / Math.max(1, resistor.bandColors.length - 1);
    const [centreX, centreY] = interpolate(resistor.body.from, resistor.body.to, ratio);
    const [fromX, fromY] = point(resistor.body.from);
    const [toX, toY] = point(resistor.body.to);
    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.hypot(dx, dy) || 1;
    const ox = (-dy / length) * 5.5;
    const oy = (dx / length) * 5.5;
    lines.push(
      `      <path d="${linePath([centreX + ox, centreY + oy], [centreX - ox, centreY - oy])}" fill="none" stroke="${BAND_COLORS[resistor.bandColors[index] as ResistorBandColor]}" stroke-width="2.5"/>`,
    );
  }
  lines.push(
    terminalMarker(resistor.terminals[0], pointForHole, COLORS.leg),
    terminalMarker(resistor.terminals[1], pointForHole, COLORS.leg),
    "    </g>",
  );
  return lines;
}

function renderResistorLabels(resistor: CanonicalResistor): readonly string[] {
  const [centreX, centreY] = interpolate(resistor.body.from, resistor.body.to, 0.5);
  return [textElement(centreX, centreY - 11, resistor.name, { family: MONO, size: 7 })];
}

function islandTerminalPoints(
  component: CanonicalButton | CanonicalPotentiometer | CanonicalSwitch,
): readonly (readonly [number, number])[] {
  const body = rect(component.body);
  if (component.kind === "button") {
    const above = body.y + body.height < 0;
    return component.terminals.map((terminal) => {
      const original = terminal.hole;
      const x = body.x + (original.side === "left" ? body.width * 0.28 : body.width * 0.72);
      return [x, above ? body.y + body.height - 7 : body.y + 7] as const;
    });
  }
  const onLeft = component.side === "left";
  return component.terminals.map((terminal, index) => [
    onLeft ? body.x + body.width - 7 : body.x + 7,
    body.y + ((index + 1) * body.height) / (component.terminals.length + 1),
  ] as const);
}

function controlTerminalPoints(
  component: CanonicalButton | CanonicalPotentiometer | CanonicalSwitch,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly (readonly [number, number])[] {
  return component.outside
    ? islandTerminalPoints(component)
    : component.terminals.map((terminal) => point(pointForHole(terminal.hole)));
}

function renderControlBase(
  component: CanonicalButton | CanonicalPotentiometer | CanonicalSwitch,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): string[] {
  const lines: string[] = [];
  const terminalPoints = controlTerminalPoints(component, pointForHole);
  if (component.outside) {
    const body = rect(component.body);
    lines.push(
      `      <rect x="${px(body.x)}" y="${px(body.y)}" width="${px(body.width)}" height="${px(body.height)}" rx="8" fill="${COLORS.board}" stroke="${COLORS.boardOutline}" stroke-width="2"/>`,
    );
    for (let index = 0; index < component.terminals.length; index += 1) {
      const terminal = component.terminals[index] as CanonicalBoardTerminal;
      const boardPoint = point(pointForHole(terminal.hole));
      const islandPoint = terminalPoints[index] as readonly [number, number];
      lines.push(
        `      <path d="${linePath(boardPoint, islandPoint)}" fill="none" stroke="${COLORS.leg}" stroke-width="4" stroke-linecap="round"/>`,
        `      <circle cx="${px(islandPoint[0])}" cy="${px(islandPoint[1])}" r="4" fill="${COLORS.hole}"/>`,
      );
    }
  }
  for (const terminal of component.terminals) {
    lines.push(terminalMarker(terminal, pointForHole, COLORS.leg));
  }
  return lines;
}

function renderButton(
  button: CanonicalButton,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const points = controlTerminalPoints(button, pointForHole);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const centreX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centreY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const bodyWidth = 28;
  const bodyHeight = Math.max(18, Math.max(...ys) - Math.min(...ys) + 14);
  const lines = [
    `    <g data-component="${escapeText(button.name)}" data-kind="button" data-state="${button.on ? "on" : "off"}" data-outside="${button.outside}">`,
    ...renderControlBase(button, pointForHole),
  ];
  for (const [x, y] of points) {
    lines.push(
      `      <path d="${linePath([x, y], [centreX + (x < centreX ? -bodyWidth / 2 : bodyWidth / 2), y])}" fill="none" stroke="${COLORS.leg}" stroke-width="4" stroke-linecap="round"/>`,
    );
  }
  lines.push(
    `      <rect x="${px(centreX - bodyWidth / 2)}" y="${px(centreY - bodyHeight / 2)}" width="${px(bodyWidth)}" height="${px(bodyHeight)}" rx="5" fill="${COLORS.control}" stroke="${COLORS.controlDark}" stroke-width="1.5"/>`,
    `      <circle cx="${px(centreX)}" cy="${px(centreY + (button.on ? 2 : -2))}" r="6" fill="${COLORS.controlLight}" stroke="${COLORS.boardOutline}" stroke-width="1.5"/>`,
    "    </g>",
  );
  return lines;
}

function renderPotentiometer(
  potentiometer: CanonicalPotentiometer,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const body = rect(potentiometer.body);
  const points = controlTerminalPoints(potentiometer, pointForHole);
  const centreX = body.x + body.width / 2;
  const centreY = body.y + body.height / 2;
  const angle = -135 + potentiometer.value * 270;
  const radians = (angle * Math.PI) / 180;
  const indicatorX = centreX + Math.cos(radians) * 7;
  const indicatorY = centreY + Math.sin(radians) * 7;
  const lines = [
    `    <g data-component="${escapeText(potentiometer.name)}" data-kind="potentiometer" data-value="${potentiometer.value}" data-outside="${potentiometer.outside}">`,
    ...renderControlBase(potentiometer, pointForHole),
  ];
  if (!potentiometer.outside) {
    for (const [x, y] of points) {
      lines.push(`      <path d="${linePath([x, y], [centreX, y])}" fill="none" stroke="${COLORS.leg}" stroke-width="4" stroke-linecap="round"/>`);
    }
  }
  lines.push(
    `      <rect x="${px(centreX - 13)}" y="${px(centreY - 19)}" width="26" height="38" rx="5" fill="#347CA0" stroke="#1D526B" stroke-width="1.5"/>`,
    `      <circle cx="${px(centreX)}" cy="${px(centreY)}" r="9" fill="#D8E4E8" stroke="#2D5769" stroke-width="1.5"/>`,
    `      <path d="${linePath([centreX, centreY], [indicatorX, indicatorY])}" fill="none" stroke="#2D5769" stroke-width="2" stroke-linecap="round"/>`,
    "    </g>",
  );
  return lines;
}

function renderSwitch(
  switchControl: CanonicalSwitch,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const body = rect(switchControl.body);
  const points = controlTerminalPoints(switchControl, pointForHole);
  const centreX = body.x + body.width / 2;
  const top = body.y + 7;
  const bottom = body.y + body.height - 7;
  const selectedY = top + ((switchControl.value - 1) * (bottom - top)) /
    Math.max(1, switchControl.options - 1);
  const lines = [
    `    <g data-component="${escapeText(switchControl.name)}" data-kind="switch" data-value="${switchControl.value}" data-options="${switchControl.options}" data-outside="${switchControl.outside}">`,
    ...renderControlBase(switchControl, pointForHole),
  ];
  if (!switchControl.outside) {
    for (const [x, y] of points) {
      lines.push(`      <path d="${linePath([x, y], [centreX, y])}" fill="none" stroke="${COLORS.leg}" stroke-width="4" stroke-linecap="round"/>`);
    }
  }
  lines.push(
    `      <rect x="${px(centreX - 11)}" y="${px(body.y + 3)}" width="22" height="${px(body.height - 6)}" rx="5" fill="#3F4852" stroke="${COLORS.controlDark}" stroke-width="1.5"/>`,
    `      <line x1="${px(centreX)}" y1="${px(top)}" x2="${px(centreX)}" y2="${px(bottom)}" stroke="${COLORS.controlDark}" stroke-width="7" stroke-linecap="round"/>`,
    `      <circle cx="${px(centreX)}" cy="${px(selectedY)}" r="5" fill="${COLORS.controlLight}"/>`,
    "    </g>",
  );
  return lines;
}

function renderControlLabel(
  component: CanonicalButton | CanonicalPotentiometer | CanonicalSwitch,
): string {
  const body = rect(component.body);
  const value = component.kind === "button"
    ? (component.on ? "on" : "off")
    : component.kind === "potentiometer"
      ? `${Math.round(component.value * 100)}%`
      : String(component.value);
  return textElement(body.x + body.width / 2, body.y - 4, `${component.name} ${value}`, {
    family: MONO,
    size: 7,
  });
}

function renderComponent(
  component: CanonicalComponent,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  switch (component.kind) {
    case "chip": return renderChip(component);
    case "led": return renderLed(component, pointForHole);
    case "capacitor": return renderCapacitor(component, pointForHole);
    case "resistor": return renderResistor(component, pointForHole);
    case "button": return renderButton(component, pointForHole);
    case "potentiometer": return renderPotentiometer(component, pointForHole);
    case "switch": return renderSwitch(component, pointForHole);
  }
}

function renderComponentLabels(
  component: CanonicalComponent,
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  switch (component.kind) {
    case "chip": return renderChipLabels(component, pointForHole);
    case "led": return renderLedLabels(component);
    case "capacitor": return renderCapacitorLabels(component);
    case "resistor": return renderResistorLabels(component);
    case "button":
    case "potentiometer":
    case "switch": return [renderControlLabel(component)];
  }
}

function wirePath(points: readonly CanonicalPoint[]): string {
  const [first, ...rest] = points;
  if (first === undefined) throw new Error("wire path must contain a point");
  const commands = [`M ${formatQuarter(first.x4)} ${formatQuarter(first.y4)}`];
  let previous = first;
  for (const routePoint of rest) {
    if (routePoint.y4 === previous.y4) {
      commands.push(`H ${formatQuarter(routePoint.x4)}`);
    } else if (routePoint.x4 === previous.x4) {
      commands.push(`V ${formatQuarter(routePoint.y4)}`);
    } else {
      throw new Error("wire path must be orthogonal");
    }
    previous = routePoint;
  }
  return commands.join(" ");
}

function renderWire(wire: CanonicalWire): readonly string[] {
  const path = wirePath(wire.path);
  const color = hexColor(wire.color);
  const lines = [`    <g data-wire="${wire.number}">`];
  if (wire.color.underlay) {
    lines.push(
      `      <path d="${path}" fill="none" stroke="${COLORS.componentOutline}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }
  lines.push(
    `      <path d="${path}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    "    </g>",
  );
  return lines;
}

function renderWireMarker(point4: CanonicalPoint, color: string): readonly string[] {
  const [x, y] = point(point4);
  return [
    "      <g>",
    `        <circle cx="${px(x)}" cy="${px(y)}" r="8" fill="${COLORS.board}" stroke="${COLORS.componentOutline}" stroke-width="1.5"/>`,
    `        <circle cx="${px(x)}" cy="${px(y)}" r="5" fill="${color}"/>`,
    `        <circle cx="${px(x)}" cy="${px(y)}" r="1.75" fill="${COLORS.componentOutline}"/>`,
    "      </g>",
  ];
}

function renderWireMarkers(wire: CanonicalWire): readonly string[] {
  const from = wire.path[0];
  const to = wire.path.at(-1);
  if (from === undefined || to === undefined) {
    throw new Error("wire path must contain endpoints");
  }
  return [
    `    <g data-wire-markers="${wire.number}">`,
    ...renderWireMarker(from, hexColor(wire.color)),
    ...renderWireMarker(to, hexColor(wire.color)),
    "    </g>",
  ];
}

function holeKey(hole: ExactHole): string {
  return hole.kind === "rail-hole"
    ? `${hole.side}-${hole.polarity}-${hole.row}`
    : `${hole.side}-${hole.row}-${hole.column}`;
}

function renderAnnotations(
  annotations: readonly CanonicalAnnotation[],
  pointForHole: (hole: ExactHole) => CanonicalPoint,
): readonly string[] {
  const offsets = [
    [10, -10],
    [10, 10],
    [-10, -10],
    [-10, 10],
  ] as const;
  const counts = new Map<string, number>();
  return annotations.flatMap((annotation) => {
    const key = holeKey(annotation.target.hole);
    const count = counts.get(key) ?? 0;
    counts.set(key, count + 1);
    const base = offsets[count % offsets.length] as readonly [number, number];
    const ring = Math.floor(count / offsets.length);
    const [targetX, targetY] = point(pointForHole(annotation.target.hole));
    const x = targetX + base[0] + Math.sign(base[0]) * ring * 8;
    const y = targetY + base[1] + Math.sign(base[1]) * ring * 8;
    return [
      `    <g data-annotation="${annotation.number}">`,
      `      <path d="${linePath([targetX, targetY], [x, y])}" fill="none" stroke="${COLORS.annotation}" stroke-width="1.5"/>`,
      `      <circle cx="${px(x)}" cy="${px(y)}" r="7" fill="${COLORS.annotation}" stroke="${COLORS.componentOutline}" stroke-width="1.5"/>`,
      textElement(x, y + 2.5, String(annotation.number), {
        fill: COLORS.ground,
        family: MONO,
        size: 7,
        indent: "      ",
      }),
      "    </g>",
    ];
  });
}

export function renderCanonicalSvg(model: CanonicalBreadboardModel): string {
  const { board, viewport } = model;
  const boardWidth = 300 + 44 * board.columns;
  const boardHeight = 56 + 22 * board.rows;
  const centreX = boardWidth / 2;
  const terminalX = (side: "left" | "right", column: number): number =>
    side === "left"
      ? centreX - 52 - 22 * (column - 1)
      : centreX + 52 + 22 * (column - 1);
  const rowY = (row: number): number => 42 + 22 * (row - 1);
  const railX = [
    62,
    94,
    boardWidth - 94,
    boardWidth - 62,
  ] as const;
  const pointForHole = (hole: ExactHole): CanonicalPoint => ({
    x4: Math.round((hole.kind === "rail-hole"
      ? hole.side === "left"
        ? hole.polarity === "positive" ? railX[0] : railX[1]
        : hole.polarity === "positive" ? railX[2] : railX[3]
      : terminalX(hole.side, hole.column)) * 4),
    y4: rowY(hole.row) * 4,
    source: null,
  });
  const viewportX = viewport.x4 / 4;
  const viewportY = viewport.y4 / 4;
  const width = viewport.width4 / 4;
  const height = viewport.height4 / 4;
  const lines: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" width="${px(width)}" height="${px(height)}" viewBox="${px(viewportX)} ${px(viewportY)} ${px(width)} ${px(height)}" preserveAspectRatio="xMidYMid meet" overflow="visible">`,
    `  <title>${board.name === null ? "Breadboard diagram" : `${escapeText(board.name)} breadboard diagram`}</title>`,
    `  <desc>${board.rows} rows, ${board.columns} terminal columns, ${model.components.length} components, ${model.wires.length} wires, ${model.annotations.length} annotations.</desc>`,
    '  <g data-layer="board">',
    `    <rect x="18" y="10" width="${boardWidth - 36}" height="${boardHeight - 24}" rx="12" fill="${COLORS.board}" stroke="${COLORS.boardOutline}" stroke-width="3"/>`,
    `    <rect x="${centreX - 10}" y="24" width="20" height="${boardHeight - 52}" rx="8" fill="${COLORS.channel}"/>`,
    "  </g>",
    '  <g data-layer="rails">',
    `    <line x1="${railX[0]}" y1="32" x2="${railX[0]}" y2="${boardHeight - 36}" stroke="${COLORS.positive}" stroke-width="3"/>`,
    `    <line x1="${railX[1]}" y1="32" x2="${railX[1]}" y2="${boardHeight - 36}" stroke="${COLORS.ground}" stroke-width="3"/>`,
    `    <line x1="${railX[2]}" y1="32" x2="${railX[2]}" y2="${boardHeight - 36}" stroke="${COLORS.positive}" stroke-width="3"/>`,
    `    <line x1="${railX[3]}" y1="32" x2="${railX[3]}" y2="${boardHeight - 36}" stroke="${COLORS.ground}" stroke-width="3"/>`,
    "  </g>",
    '  <g data-layer="holes">',
  ];

  for (let row = 1; row <= board.rows; row += 1) {
    const y = rowY(row);
    const xs = [
      railX[0],
      railX[1],
      ...Array.from({ length: board.columns }, (_, index) =>
        terminalX("left", board.columns - index),
      ),
      ...Array.from({ length: board.columns }, (_, index) =>
        terminalX("right", index + 1),
      ),
      railX[2],
      railX[3],
    ];
    for (const x of xs) {
      lines.push(`    <circle cx="${x}" cy="${y}" r="4.25" fill="${COLORS.hole}"/>`);
    }
  }

  lines.push("  </g>");
  if (model.wires.length === 0) {
    lines.push('  <g data-layer="wires"/>');
  } else {
    lines.push('  <g data-layer="wires">');
    for (const wire of model.wires) lines.push(...renderWire(wire));
    lines.push("  </g>");
  }

  lines.push('  <g data-layer="components">');
  for (const wire of model.wires) lines.push(...renderWireMarkers(wire));
  for (const component of model.components) {
    lines.push(...renderComponent(component, pointForHole));
  }
  lines.push("  </g>");

  if (model.annotations.length === 0) {
    lines.push('  <g data-layer="annotations"/>');
  } else {
    lines.push('  <g data-layer="annotations">');
    lines.push(...renderAnnotations(model.annotations, pointForHole));
    lines.push("  </g>");
  }

  lines.push('  <g data-layer="labels">');
  lines.push(railHeading(railX[0], "LP", "+"));
  lines.push(railHeading(railX[1], "LG", "−"));
  lines.push(railHeading(railX[2], "RP", "+"));
  lines.push(railHeading(railX[3], "RG", "−"));
  lines.push(textElement(terminalX("left", 1), 25, "LT", { size: 10 }));
  lines.push(textElement(terminalX("right", 1), 25, "RT", { size: 10 }));
  for (
    let column = board.columns % 2 === 0 ? board.columns - 1 : board.columns;
    column >= 1;
    column -= 2
  ) {
    lines.push(textElement(terminalX("left", column), 35, String(column), {
      fill: COLORS.secondaryLabel,
      family: MONO,
      size: 8,
    }));
  }
  for (let column = 1; column <= board.columns; column += 2) {
    lines.push(textElement(terminalX("right", column), 35, String(column), {
      fill: COLORS.secondaryLabel,
      family: MONO,
      size: 8,
    }));
  }
  for (let row = 5; row <= board.rows; row += 5) {
    const y = rowY(row) + 3;
    lines.push(textElement(terminalX("left", board.columns) - 12, y, String(row), {
      anchor: "end",
      fill: COLORS.secondaryLabel,
      family: MONO,
      size: 8,
    }));
    lines.push(textElement(terminalX("right", board.columns) + 12, y, String(row), {
      anchor: "start",
      fill: COLORS.secondaryLabel,
      family: MONO,
      size: 8,
    }));
  }
  for (const component of model.components) {
    lines.push(...renderComponentLabels(component, pointForHole));
  }
  lines.push("  </g>", "</svg>");
  return `${lines.join("\n")}\n`;
}
