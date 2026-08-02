import type {
  CanonicalBreadboardModel,
  CanonicalChip,
  CanonicalPoint,
  CanonicalWire,
  RgbColor,
} from "./types.js";

const COLORS = {
  board: "#F5F2EB",
  boardOutline: "#CDBF9D",
  channel: "#D9CFB8",
  hole: "#544F45",
  label: "#413B31",
  secondaryLabel: "#756E60",
  positive: "#D64545",
  ground: "#252525",
} as const;

const SANS = "Arial, Helvetica, sans-serif";
const MONO = "Menlo, Consolas, monospace";

function formatQuarter(value4: number): string {
  const value = value4 / 4;
  if (Object.is(value, -0)) return "0";
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0$/u, "");
}

function hexColor(color: RgbColor): string {
  const channel = (value: number) =>
    value.toString(16).toUpperCase().padStart(2, "0");
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
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

function chipTextColor(color: RgbColor): "#252525" | "#FFFFFF" {
  const background = relativeLuminance(color);
  const dark = relativeLuminance({ r: 37, g: 37, b: 37 });
  const white = 1;
  const darkContrast =
    (Math.max(background, dark) + 0.05) /
    (Math.min(background, dark) + 0.05);
  const whiteContrast =
    (Math.max(background, white) + 0.05) /
    (Math.min(background, white) + 0.05);
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
  },
): string {
  const anchor = options.anchor ?? "middle";
  const fill = options.fill ?? COLORS.label;
  const family = options.family ?? SANS;
  return `    <text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-family="${family}" font-size="${options.size}" font-weight="bold">${escapeText(value)}</text>`;
}

function railHeading(x: number, code: string, sign: string): string {
  return `    <text x="${x}" y="25" text-anchor="middle" fill="${COLORS.label}" font-family="${SANS}" font-size="10" font-weight="bold">${code} <tspan font-size="8">${sign}</tspan></text>`;
}

function renderChip(
  chip: CanonicalChip,
  terminalX: (side: "left" | "right", column: number) => number,
  rowY: (row: number) => number,
): readonly string[] {
  const bodyX = formatQuarter(chip.body.x4);
  const bodyY = formatQuarter(chip.body.y4);
  const bodyWidth = formatQuarter(chip.body.width4);
  const bodyHeight = formatQuarter(chip.body.height4);
  const localHeight = chip.body.height4 / 4;
  const textColor = chipTextColor(chip.color);
  const lines = [
    "    <g>",
    `      <rect x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" rx="10" fill="${hexColor(chip.color)}" stroke="#3B382F" stroke-width="3"/>`,
  ];
  for (const pin of chip.pins) {
    lines.push(
      `      <circle cx="${terminalX(pin.hole.side, pin.hole.column)}" cy="${rowY(pin.hole.row)}" r="5.25" fill="#E5C968" stroke="#FFF7CB" stroke-width="1.5"/>`,
    );
  }
  lines.push(
    `      <svg x="${bodyX}" y="${bodyY}" width="${bodyWidth}" height="${bodyHeight}" overflow="hidden">`,
    '        <svg x="35%" y="0" width="30%" height="100%" overflow="hidden">',
    `          <text x="50%" y="${formatQuarter(Math.round((localHeight / 2 - 1) * 4))}" text-anchor="middle" fill="${textColor}" font-family="${SANS}" font-size="14" font-weight="bold">${escapeText(chip.definitionName)}</text>`,
    `          <text x="50%" y="${formatQuarter(Math.round((localHeight / 2 + 9) * 4))}" text-anchor="middle" fill="${textColor}" font-family="${MONO}" font-size="8" font-weight="bold">${escapeText(chip.instanceName)}</text>`,
    "        </svg>",
  );

  for (const side of ["left", "right"] as const) {
    const sidePins = chip.pins.filter((pin) => pin.hole.side === side);
    lines.push(
      side === "left"
        ? '        <svg x="0" y="0" width="35%" height="100%" overflow="hidden">'
        : '        <svg x="65%" y="0" width="35%" height="100%" overflow="hidden">',
    );
    for (const pin of sidePins) {
      const y4 = Math.round(
        (rowY(pin.hole.row) - chip.body.y4 / 4 + 2.5) * 4,
      );
      lines.push(
        side === "left"
          ? `          <text x="12" y="${formatQuarter(y4)}" text-anchor="start" fill="${textColor}" font-family="${MONO}" font-size="7" font-weight="bold">${pin.number}</text>`
          : `          <text x="100%" y="${formatQuarter(y4)}" dx="-12" text-anchor="end" fill="${textColor}" font-family="${MONO}" font-size="7" font-weight="bold">${pin.number}</text>`,
      );
    }
    for (const pin of sidePins) {
      if (pin.label === null) continue;
      const y4 = Math.round(
        (rowY(pin.hole.row) - chip.body.y4 / 4 + 2.5) * 4,
      );
      lines.push(
        side === "left"
          ? `          <text x="26" y="${formatQuarter(y4)}" text-anchor="start" fill="${textColor}" font-family="${MONO}" font-size="7" font-weight="bold">${escapeText(pin.label)}</text>`
          : `          <text x="100%" y="${formatQuarter(y4)}" dx="-26" text-anchor="end" fill="${textColor}" font-family="${MONO}" font-size="7" font-weight="bold">${escapeText(pin.label)}</text>`,
      );
    }
    lines.push("        </svg>");
  }
  lines.push("      </svg>", "    </g>");
  return lines;
}

function wirePath(points: readonly CanonicalPoint[]): string {
  const [first, ...rest] = points;
  if (first === undefined) throw new Error("wire path must contain a point");
  const commands = [`M ${formatQuarter(first.x4)} ${formatQuarter(first.y4)}`];
  let previous = first;
  for (const point of rest) {
    if (point.y4 === previous.y4) {
      commands.push(`H ${formatQuarter(point.x4)}`);
    } else if (point.x4 === previous.x4) {
      commands.push(`V ${formatQuarter(point.y4)}`);
    } else {
      throw new Error("wire path must be orthogonal");
    }
    previous = point;
  }
  return commands.join(" ");
}

function renderWire(wire: CanonicalWire): readonly string[] {
  const path = wirePath(wire.path);
  const color = hexColor(wire.color);
  const lines = [`    <g data-wire="${wire.number}">`];
  if (wire.color.underlay) {
    lines.push(
      `      <path d="${path}" fill="none" stroke="#3B382F" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }
  lines.push(
    `      <path d="${path}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    "    </g>",
  );
  return lines;
}

function renderMarker(point: CanonicalPoint, color: string): readonly string[] {
  const x = formatQuarter(point.x4);
  const y = formatQuarter(point.y4);
  return [
    "      <g>",
    `        <circle cx="${x}" cy="${y}" r="8" fill="${COLORS.board}" stroke="#3B382F" stroke-width="1.5"/>`,
    `        <circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`,
    `        <circle cx="${x}" cy="${y}" r="1.75" fill="#3B382F"/>`,
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
    `    <g data-wire="${wire.number}">`,
    ...renderMarker(from, hexColor(wire.color)),
    ...renderMarker(to, hexColor(wire.color)),
    "    </g>",
  ];
}

export function renderCanonicalSvg(model: CanonicalBreadboardModel): string {
  const { board } = model;
  const width = 300 + 44 * board.columns;
  const height = 56 + 22 * board.rows;
  const centreX = width / 2;
  const terminalX = (side: "left" | "right", column: number): number =>
    side === "left"
      ? centreX - 52 - 22 * (column - 1)
      : centreX + 52 + 22 * (column - 1);
  const rowY = (row: number): number => 42 + 22 * (row - 1);
  const railX = [62, 94, width - 94, width - 62] as const;
  const lines: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" overflow="hidden">`,
    `  <title>${board.name === null ? "Breadboard diagram" : `${escapeText(board.name)} breadboard diagram`}</title>`,
    `  <desc>${board.rows} rows, ${board.columns} terminal columns, ${model.chips.length} chips, ${model.wires.length} wires.</desc>`,
    '  <g data-layer="board">',
    `    <rect x="18" y="10" width="${width - 36}" height="${height - 24}" rx="24" fill="${COLORS.board}" stroke="${COLORS.boardOutline}" stroke-width="3"/>`,
    `    <rect x="${centreX - 10}" y="24" width="20" height="${height - 52}" rx="8" fill="${COLORS.channel}"/>`,
    "  </g>",
    '  <g data-layer="rails">',
    `    <line x1="${railX[0]}" y1="32" x2="${railX[0]}" y2="${height - 36}" stroke="${COLORS.positive}" stroke-width="3"/>`,
    `    <line x1="${railX[1]}" y1="32" x2="${railX[1]}" y2="${height - 36}" stroke="${COLORS.ground}" stroke-width="3"/>`,
    `    <line x1="${railX[2]}" y1="32" x2="${railX[2]}" y2="${height - 36}" stroke="${COLORS.positive}" stroke-width="3"/>`,
    `    <line x1="${railX[3]}" y1="32" x2="${railX[3]}" y2="${height - 36}" stroke="${COLORS.ground}" stroke-width="3"/>`,
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
      lines.push(
        `    <circle cx="${x}" cy="${y}" r="4.25" fill="${COLORS.hole}"/>`,
      );
    }
  }

  lines.push("  </g>", '  <g data-layer="labels">');
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
    lines.push(
      textElement(terminalX("left", column), 35, String(column), {
        fill: COLORS.secondaryLabel,
        family: MONO,
        size: 8,
      }),
    );
  }
  for (let column = 1; column <= board.columns; column += 2) {
    lines.push(
      textElement(terminalX("right", column), 35, String(column), {
        fill: COLORS.secondaryLabel,
        family: MONO,
        size: 8,
      }),
    );
  }

  for (let row = 5; row <= board.rows; row += 5) {
    const y = rowY(row) + 3;
    lines.push(
      textElement(terminalX("left", board.columns) - 12, y, String(row), {
        anchor: "end",
        fill: COLORS.secondaryLabel,
        family: MONO,
        size: 8,
      }),
    );
    lines.push(
      textElement(terminalX("right", board.columns) + 12, y, String(row), {
        anchor: "start",
        fill: COLORS.secondaryLabel,
        family: MONO,
        size: 8,
      }),
    );
  }

  lines.push("  </g>");
  if (model.chips.length === 0) {
    lines.push('  <g data-layer="chips"/>');
  } else {
    lines.push('  <g data-layer="chips">');
    for (const chip of model.chips) {
      lines.push(...renderChip(chip, terminalX, rowY));
    }
    lines.push("  </g>");
  }
  if (model.wires.length === 0) {
    lines.push('  <g data-layer="wires"/>');
  } else {
    lines.push('  <g data-layer="wires">');
    for (const wire of model.wires) lines.push(...renderWire(wire));
    lines.push("  </g>");
  }
  if (model.wires.length === 0) {
    lines.push('  <g data-layer="markers"/>');
  } else {
    lines.push('  <g data-layer="markers">');
    for (const wire of model.wires) lines.push(...renderWireMarkers(wire));
    lines.push("  </g>");
  }
  lines.push("</svg>");
  return `${lines.join("\n")}\n`;
}
