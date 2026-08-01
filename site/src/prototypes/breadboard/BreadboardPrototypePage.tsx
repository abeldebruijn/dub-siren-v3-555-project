import { useEffect, useMemo, useState } from "react";
import "./breadboard-prototype.css";

// PROTOTYPE — Three ways to inspect one breadboard-language specimen,
// switchable via ?variant=A|B|C on #/prototype/breadboard.

const variants = [
  { key: "A", name: "Split workbench" },
  { key: "B", name: "Annotated specimen" },
  { key: "C", name: "Resolution inspector" },
] as const;

type VariantKey = (typeof variants)[number]["key"];

const source = `breadboard main rows 32 columns 5

chip Pico2 {
  pins-per-side 20
  height 10
  color forest
  pin 1  GP0 | SPI0_RX | UART0_TX
  pin 2  GP1 | SPI0_CSn | UART0_RX
  pin 3  GND
  pin 8  GND
  pin 40 VBUS
}

chip OddMux {
  pins-per-side 8
  height 5
  pin 1 A0
  pin 8 GND
  pin 16 VCC
}

place pico Pico2 at R2
place mux OddMux at R24 flip color purple

wire P --> P
wire pico.GP0 --> LT-R23C
wire pico.GND --> G color blue saturation 40%
wire LP --> LT-R28C
wire R22C --> R22C color white
wire LP1 --> LT-R3C5 via LT-R1C5 color orange saturation 45%`;

const resolutions = [
  ["P → P", "LP22 → RP22", "red", "paired side inference"],
  ["pico.GP0 → LT-R23C", "LT-R2C3 → LT-R23C5", "brown", "alias + free-hole fallback"],
  ["pico.GND → G", "LT-R8C3 → LG8", "blue · S40", "repeated alias candidate"],
  ["LP → LT-R28C", "LP28 → LT-R28C5", "red", "row + nearest column"],
  ["R22C → R22C", "LT-R22C1 → RT-R22C1", "white", "left-to-right pair inference"],
];

function holeX(side: "LT" | "RT", column: number) {
  return side === "LT" ? 230 - column * 22 : 290 + column * 22;
}

function rowY(row: number) {
  return 42 + (row - 1) * 22;
}

function BreadboardDiagram({ annotated = false }: { annotated?: boolean }) {
  const rows = Array.from({ length: 32 }, (_, index) => index + 1);
  const columns = Array.from({ length: 5 }, (_, index) => index + 1);
  const picoLeftX = holeX("LT", 3);
  const picoRightX = holeX("RT", 3);
  const connections = [
    [62, rowY(22), "#d64545"], [426, rowY(22), "#d64545"],
    [picoLeftX, rowY(2), "#79502d"], [holeX("LT", 5), rowY(23), "#79502d"],
    [picoLeftX, rowY(8), "#5277a8"], [94, rowY(8), "#5277a8"],
    [62, rowY(28), "#d64545"], [holeX("LT", 5), rowY(28), "#d64545"],
    [holeX("LT", 1), rowY(22), "#fafafa"], [holeX("RT", 1), rowY(22), "#fafafa"],
    [62, rowY(1), "#b57f50"], [holeX("LT", 5), rowY(3), "#b57f50"],
  ] as const;

  return (
    <svg className="bp-board" viewBox="0 0 520 760" role="img" aria-label="Expected breadboard diagram">
      <rect x="18" y="10" width="484" height="736" rx="24" fill="#efe7d4" stroke="#cdbf9d" strokeWidth="3" />
      <rect x="250" y="24" width="20" height="708" rx="8" fill="#d9cfb8" />
      <line x1="62" x2="62" y1="32" y2="724" stroke="#d64545" strokeWidth="3" />
      <line x1="94" x2="94" y1="32" y2="724" stroke="#252525" strokeWidth="3" />
      <line x1="426" x2="426" y1="32" y2="724" stroke="#d64545" strokeWidth="3" />
      <line x1="458" x2="458" y1="32" y2="724" stroke="#252525" strokeWidth="3" />

      {rows.flatMap((row) => [62, 94, 426, 458].map((x) => (
        <circle key={`${row}-${x}`} cx={x} cy={rowY(row)} r="4.3" fill="#544f45" />
      )))}
      {rows.flatMap((row) => columns.flatMap((column) => (["LT", "RT"] as const).map((side) => (
        <circle key={`${side}-${row}-${column}`} cx={holeX(side, column)} cy={rowY(row)} r="4.3" fill="#544f45" />
      ))))}

      <g className="bp-row-numbers">
        {rows.filter((row) => row % 5 === 0).flatMap((row) => [
          <text key={`left-row-${row}`} x="108" y={rowY(row) + 3}>{row}</text>,
          <text key={`right-row-${row}`} x="412" y={rowY(row) + 3}>{row}</text>,
        ])}
      </g>

      <rect x={picoLeftX - 5} y={rowY(2) - 9} width={picoRightX - picoLeftX + 10} height={22 * 19 + 18} rx="13" fill="#155d3a" stroke="#0c3f28" strokeWidth="3" />
      <text x="260" y={rowY(11)} textAnchor="middle" fill="#fff8dd" fontSize="22" fontWeight="800">PICO 2</text>
      <circle cx={picoLeftX} cy={rowY(2)} r="6" fill="#d7b64a" />
      <circle cx={picoRightX} cy={rowY(2)} r="6" fill="#d7b64a" />
      {rows.slice(1, 21).flatMap((row) => [picoLeftX, picoRightX].map((x) => (
        <circle key={`pico-${row}-${x}`} cx={x} cy={rowY(row)} r="5.2" fill="#e5c968" stroke="#fff7cb" strokeWidth="1.5" />
      )))}
      <g className="bp-pin-numbers">
        {rows.slice(1, 21).flatMap((row, index) => [
          <text key={`pico-pin-left-${row}`} x={picoLeftX + 11} y={rowY(row) + 2.7}>{index + 1}</text>,
          <text key={`pico-pin-right-${row}`} x={picoRightX - 11} y={rowY(row) + 2.7}>{40 - index}</text>,
        ])}
      </g>

      <rect x={holeX("LT", 3) - 10} y={rowY(24) - 9} width={holeX("RT", 2) - holeX("LT", 3) + 20} height={22 * 7 + 18} rx="10" fill="#6f3d86" stroke="#49245a" strokeWidth="3" />
      <text x="260" y={rowY(27) + 6} textAnchor="middle" fill="white" fontSize="14" fontWeight="800">ODD MUX</text>
      {rows.slice(23, 31).flatMap((row) => [holeX("LT", 3), holeX("RT", 2)].map((x) => (
        <circle key={`mux-${row}-${x}`} cx={x} cy={rowY(row)} r="5.2" fill="#d9b55d" />
      )))}

      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6">
        <path d={`M 62 ${rowY(22)} H 426`} stroke="#d64545" />
        <path d={`M ${picoLeftX} ${rowY(2)} H 142 V ${rowY(23)} H ${holeX("LT", 5)}`} stroke="#79502d" />
        <path d={`M ${picoLeftX} ${rowY(8)} H 94`} stroke="#5277a8" />
        <path d={`M 62 ${rowY(28)} H ${holeX("LT", 5)}`} stroke="#d64545" />
        <path d={`M ${holeX("LT", 1)} ${rowY(22)} H ${holeX("RT", 1)}`} stroke="#fafafa" />
        <path d={`M 62 ${rowY(1)} H ${holeX("LT", 5)} V ${rowY(3)}`} stroke="#b57f50" />
      </g>

      <g className="bp-connections">
        {connections.map(([x, y, color], index) => (
          <g key={`${x}-${y}-${index}`}>
            <circle cx={x} cy={y} r="8" />
            <circle cx={x} cy={y} r="5" fill={color} />
            <circle cx={x} cy={y} r="1.8" className="bp-connection-core" />
          </g>
        ))}
      </g>

      <g fontSize="10" fontWeight="800" fill="#413b31">
        <text x="47" y="26">LP</text><text x="61" y="21" fontSize="8">+</text>
        <text x="80" y="26">LG</text><text x="95" y="21" fontSize="8">−</text>
        <text x="411" y="26">RP</text><text x="426" y="21" fontSize="8">+</text>
        <text x="444" y="26">RG</text><text x="459" y="21" fontSize="8">−</text>
      </g>

      {annotated && (
        <g className="bp-annotations">
          <circle cx="32" cy={rowY(22)} r="12" /><text x="32" y={rowY(22) + 4}>1</text>
          <circle cx="108" cy={rowY(23)} r="12" /><text x="108" y={rowY(23) + 4}>2</text>
          <circle cx="405" cy={rowY(27)} r="12" /><text x="405" y={rowY(27) + 4}>3</text>
          <circle cx="260" cy={rowY(22)} r="12" /><text x="260" y={rowY(22) + 4}>4</text>
        </g>
      )}
    </svg>
  );
}

function SourcePanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`bp-source ${compact ? "is-compact" : ""}`}>
      <header><span>PROVISIONAL SOURCE</span><span>breadboard.bd</span></header>
      <pre><code>{source}</code></pre>
    </section>
  );
}

function VariantA() {
  return (
    <main className="bp-shell bp-a">
      <div className="bp-title"><p>Variant A · Split workbench</p><h1>Source beside outcome</h1><span>Best for authoring: immediate visual comparison.</span></div>
      <div className="bp-split"><SourcePanel /><section className="bp-canvas"><BreadboardDiagram /></section></div>
    </main>
  );
}

function VariantB() {
  return (
    <main className="bp-shell bp-b">
      <div className="bp-title"><p>Variant B · Annotated specimen</p><h1>Diagram first, language explained</h1><span>Best for a spec page: show the result, then teach the declarations.</span></div>
      <div className="bp-feature"><section className="bp-canvas"><BreadboardDiagram annotated /></section>
        <aside className="bp-callouts">
          <h2>What this specimen proves</h2>
          <p><b>1</b> Partial rail selectors align by row.</p><p><b>2</b> Aliases land on a free hole in the pin group.</p>
          <p><b>3</b> Odd height + flip changes pin columns.</p><p><b>4</b> Crossings stay electrically separate.</p>
        </aside></div>
      <SourcePanel compact />
    </main>
  );
}

function VariantC() {
  return (
    <main className="bp-shell bp-c">
      <div className="bp-title"><p>Variant C · Resolution inspector</p><h1>Make inference inspectable</h1><span>Best for debugging: source, concrete endpoints, then diagram.</span></div>
      <SourcePanel compact />
      <section className="bp-table"><header><span>DECLARATION</span><span>RESOLVED</span><span>COLOUR</span><span>WHY</span></header>
        {resolutions.map((row) => <div key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
      </section>
      <section className="bp-canvas bp-wide"><BreadboardDiagram /></section>
    </main>
  );
}

function PrototypeSwitcher({ current, onChange }: { current: VariantKey; onChange: (key: VariantKey) => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable='true']")) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const index = variants.findIndex((item) => item.key === current);
      const delta = event.key === "ArrowRight" ? 1 : -1;
      onChange(variants[(index + delta + variants.length) % variants.length].key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, onChange]);

  const index = variants.findIndex((item) => item.key === current);
  const cycle = (delta: number) => onChange(variants[(index + delta + variants.length) % variants.length].key);
  const active = variants[index];

  return <nav className="bp-switcher" aria-label="Prototype variant switcher">
    <button onClick={() => cycle(-1)} aria-label="Previous variant">←</button>
    <strong>{active.key} — {active.name}</strong>
    <button onClick={() => cycle(1)} aria-label="Next variant">→</button>
  </nav>;
}

export function BreadboardPrototypePage() {
  const initial = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
    return variants.some((item) => item.key === value) ? value as VariantKey : "A";
  }, []);
  const [variant, setVariant] = useState<VariantKey>(initial);

  const changeVariant = (next: VariantKey) => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    window.history.replaceState({}, "", url);
    setVariant(next);
  };

  return <div className="bp-root">
    {variant === "A" && <VariantA />}
    {variant === "B" && <VariantB />}
    {variant === "C" && <VariantC />}
    {!import.meta.env.PROD && <PrototypeSwitcher current={variant} onChange={changeVariant} />}
  </div>;
}
