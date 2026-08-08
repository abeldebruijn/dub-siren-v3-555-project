import { useId, useMemo, useState, type CSSProperties } from "react";

type Colour = {
  name: string;
  hex: string;
  digit: number | null;
  multiplier: number;
  tolerance: number | null;
};

const colours: Colour[] = [
  { name: "black", hex: "#171717", digit: 0, multiplier: 1, tolerance: null },
  { name: "brown", hex: "#70452d", digit: 1, multiplier: 10, tolerance: 1 },
  { name: "red", hex: "#d52d2d", digit: 2, multiplier: 100, tolerance: 2 },
  { name: "orange", hex: "#e87918", digit: 3, multiplier: 1_000, tolerance: null },
  { name: "yellow", hex: "#f2cf25", digit: 4, multiplier: 10_000, tolerance: null },
  { name: "green", hex: "#2f8b4b", digit: 5, multiplier: 100_000, tolerance: 0.5 },
  { name: "blue", hex: "#285bb8", digit: 6, multiplier: 1_000_000, tolerance: 0.25 },
  { name: "violet", hex: "#7544a8", digit: 7, multiplier: 10_000_000, tolerance: 0.1 },
  { name: "grey", hex: "#929292", digit: 8, multiplier: 100_000_000, tolerance: 0.05 },
  { name: "white", hex: "#f5f3ec", digit: 9, multiplier: 1_000_000_000, tolerance: null },
  { name: "gold", hex: "#c8a52c", digit: null, multiplier: 0.1, tolerance: 5 },
  { name: "silver", hex: "#b9bec2", digit: null, multiplier: 0.01, tolerance: 10 },
];

const byDigit = new Map(colours.filter((colour) => colour.digit !== null).map((colour) => [colour.digit, colour]));
const byMultiplier = new Map(colours.map((colour) => [colour.multiplier, colour]));
const byName = new Map(colours.map((colour) => [colour.name, colour]));
const e24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];

function parseOhms(raw: string) {
  const value = raw.trim().toLowerCase().replaceAll(",", "").replace(/ohms?|Ω/g, "").replaceAll(" ", "");
  const embedded = value.match(/^(\d+)([km])([0-9]+)$/);
  if (embedded) {
    const factor = embedded[2] === "k" ? 1_000 : 1_000_000;
    return Number(`${embedded[1]}.${embedded[3]}`) * factor;
  }
  const simple = value.match(/^(\d*\.?\d+)([km]?)$/);
  if (!simple) return Number.NaN;
  const factor = simple[2] === "k" ? 1_000 : simple[2] === "m" ? 1_000_000 : 1;
  return Number(simple[1]) * factor;
}

function formatOhms(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toPrecision(3))} MΩ`;
  if (value >= 1_000) return `${Number((value / 1_000).toPrecision(3))} kΩ`;
  return `${Number(value.toPrecision(3))} Ω`;
}

function formatMultiplier(value: number) {
  if (value >= 1_000_000) return `×${value / 1_000_000}M`;
  if (value >= 1_000) return `×${value / 1_000}k`;
  return `×${value}`;
}

function getBands(value: number, digitCount: 2 | 3) {
  if (!Number.isFinite(value) || value <= 0) return null;
  for (let exponent = -2; exponent <= 9; exponent += 1) {
    const multiplier = 10 ** exponent;
    const significant = value / multiplier;
    const minimum = digitCount === 2 ? 10 : 100;
    const maximum = digitCount === 2 ? 99 : 999;
    if (significant >= minimum && significant <= maximum && Math.abs(significant - Math.round(significant)) < 1e-7) {
      const digits = String(Math.round(significant)).split("").map(Number);
      const bandColours = digits.map((digit) => byDigit.get(digit));
      const multiplierColour = byMultiplier.get(multiplier);
      if (bandColours.every(Boolean) && multiplierColour) return [...bandColours, multiplierColour] as Colour[];
    }
  }
  return null;
}

function standardValues() {
  const values: number[] = [];
  for (let power = -1; power <= 7; power += 1) {
    for (const base of e24) values.push(base * 10 ** power);
  }
  return values;
}

const standards = standardValues();

function nearestStandard(value: number) {
  return standards.reduce((best, candidate) => Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best, standards[0]);
}

function nextStandard(value: number) {
  return standards.find((candidate) => candidate >= value) ?? standards.at(-1)!;
}

function ResistorDrawing({ bands }: { bands: Colour[] }) {
  const clipId = useId().replaceAll(":", "");
  const positions = bands.length === 4 ? [146, 179, 217, 286] : [134, 161, 188, 222, 286];
  return (
    <svg viewBox="0 0 440 142" role="img" aria-label={`Resistor with ${bands.map((band) => band.name).join(", ")} bands`}>
      <defs>
        <clipPath id={clipId}><rect x="92" y="35" width="256" height="72" rx="30" /></clipPath>
      </defs>
      <path d="M8 71H98M342 71h90" stroke="currentColor" strokeWidth="5" opacity=".45" />
      <rect x="92" y="35" width="256" height="72" rx="30" fill="#dfc89c" stroke="#8b7650" strokeWidth="3" />
      <g clipPath={`url(#${clipId})`}>
        {bands.map((band, index) => <rect key={`${band.name}-${index}`} x={positions[index]} y="31" width="17" height="80" fill={band.hex} stroke="rgba(0,0,0,.2)" />)}
      </g>
      <text x="220" y="132" textAnchor="middle">read left → right</text>
    </svg>
  );
}

function ColourLegend() {
  return (
    <div className="resistor-legend" aria-label="Resistor colour code legend">
      {colours.map((colour) => (
        <div className="resistor-legend__item" key={colour.name}>
          <span className="resistor-legend__swatch" style={{ "--resistor-colour": colour.hex } as CSSProperties} />
          <strong>{colour.name}</strong>
          <span>{colour.digit === null ? "—" : colour.digit}</span>
          <small>{formatMultiplier(colour.multiplier)}</small>
        </div>
      ))}
    </div>
  );
}

function Decoder() {
  const [input, setInput] = useState("1k");
  const [digitCount, setDigitCount] = useState<2 | 3>(2);
  const [tolerance, setTolerance] = useState("gold");
  const value = parseOhms(input);
  const encoded = useMemo(() => getBands(value, digitCount), [value, digitCount]);
  const toleranceColour = byName.get(tolerance)!;
  const bands = encoded ? [...encoded, toleranceColour] : null;
  const nearest = Number.isFinite(value) ? nearestStandard(value) : Number.NaN;

  return (
    <div className="resistor-widget">
      <div className="resistor-widget__controls">
        <label>
          Resistance
          <input value={input} onChange={(event) => setInput(event.target.value)} aria-label="Resistance value" />
          <small>Try 330, 1k, 4k7, 2.2k or 1M</small>
        </label>
        <fieldset>
          <legend>Band layout</legend>
          <div className="resistor-segmented">
            <button type="button" className={digitCount === 2 ? "is-active" : ""} onClick={() => setDigitCount(2)}>4 band</button>
            <button type="button" className={digitCount === 3 ? "is-active" : ""} onClick={() => setDigitCount(3)}>5 band</button>
          </div>
        </fieldset>
        <label>
          Tolerance
          <select value={tolerance} onChange={(event) => setTolerance(event.target.value)}>
            <option value="gold">Gold · ±5%</option>
            <option value="silver">Silver · ±10%</option>
            <option value="brown">Brown · ±1%</option>
            <option value="red">Red · ±2%</option>
          </select>
        </label>
      </div>

      <div className="resistor-presets" aria-label="Common resistor values">
        {["100", "220", "330", "1k", "4k7", "10k", "47k", "100k", "1M"].map((preset) => (
          <button type="button" key={preset} onClick={() => setInput(preset)}>{preset}</button>
        ))}
      </div>

      <div className="resistor-widget__result">
        {bands ? <ResistorDrawing bands={bands} /> : <p className="resistor-error">That value cannot be represented exactly with this band layout. Try the other layout.</p>}
        <div className="resistor-summary">
          <div><span>Value</span><strong>{formatOhms(value)}</strong></div>
          <div><span>Bands</span><strong>{bands?.map((band) => band.name).join(" · ") ?? "—"}</strong></div>
          <div><span>Nearest E24</span><strong>{formatOhms(nearest)}</strong></div>
        </div>
      </div>
    </div>
  );
}

function Calculator() {
  const [supply, setSupply] = useState(3.3);
  const [forwardVoltage, setForwardVoltage] = useState(2);
  const [resistor, setResistor] = useState("1k");
  const [targetCurrent, setTargetCurrent] = useState(3);
  const resistance = parseOhms(resistor);
  const headroom = supply - forwardVoltage;
  const exactMinimum = headroom > 0 ? headroom / (targetCurrent / 1_000) : Number.NaN;
  const recommended = Number.isFinite(exactMinimum) ? nextStandard(exactMinimum) : Number.NaN;
  const actualCurrent = resistance > 0 && headroom > 0 ? headroom / resistance * 1_000 : Number.NaN;
  const power = resistance > 0 && headroom > 0 ? headroom ** 2 / resistance : Number.NaN;
  const safe = Number.isFinite(actualCurrent) && actualCurrent <= targetCurrent * 1.1;
  const verdict = !Number.isFinite(actualCurrent)
    ? "Check the values"
    : safe
      ? `${actualCurrent.toFixed(1)} mA is at or below your target.`
      : `${actualCurrent.toFixed(1)} mA exceeds your target. Choose more resistance.`;

  return (
    <div className="resistor-widget">
      <div className="resistor-widget__controls resistor-widget__controls--calculator">
        <label>
          Supply
          <select value={supply} onChange={(event) => setSupply(Number(event.target.value))}>
            <option value="3.3">3.3 V · Pico GPIO</option>
            <option value="5">5 V · external</option>
            <option value="9">9 V · external</option>
          </select>
        </label>
        <label>
          LED colour / V<sub>f</sub>
          <select value={forwardVoltage} onChange={(event) => setForwardVoltage(Number(event.target.value))}>
            <option value="2">Red · 2.0 V</option>
            <option value="2.1">Yellow · 2.1 V</option>
            <option value="2.2">Green · 2.2 V</option>
            <option value="3.1">Blue · 3.1 V</option>
            <option value="3.2">White · 3.2 V</option>
          </select>
        </label>
        <label>
          Resistor
          <input value={resistor} onChange={(event) => setResistor(event.target.value)} />
        </label>
        <label>
          Target current
          <span className="resistor-range-value">{targetCurrent} mA</span>
          <input type="range" min="1" max="12" step="1" value={targetCurrent} onChange={(event) => setTargetCurrent(Number(event.target.value))} />
        </label>
      </div>

      <div className="resistor-presets" aria-label="Resistor presets">
        {["100", "330", "680", "1k", "4k7", "10k"].map((preset) => (
          <button type="button" key={preset} onClick={() => setResistor(preset)}>{preset}</button>
        ))}
      </div>

      <div className={`resistor-verdict ${safe ? "is-safe" : "is-warning"}`} role="status">
        <span>{safe ? "Within target" : "Check this choice"}</span>
        <strong>{verdict}</strong>
      </div>
      <div className="resistor-summary resistor-summary--calculator">
        <div><span>Minimum</span><strong>{formatOhms(exactMinimum)}</strong></div>
        <div><span>Choose E24</span><strong>{formatOhms(recommended)}</strong></div>
        <div><span>Actual current</span><strong>{Number.isFinite(actualCurrent) ? `${actualCurrent.toFixed(1)} mA` : "—"}</strong></div>
        <div><span>Resistor power</span><strong>{Number.isFinite(power) ? `${(power * 1_000).toFixed(1)} mW` : "—"}</strong></div>
      </div>
      <p className="resistor-math">R = ({supply} V − {forwardVoltage} V) ÷ {targetCurrent / 1_000} A = {formatOhms(exactMinimum)}</p>
    </div>
  );
}

export default function ResistorWidget({ mode }: { mode: "legend" | "decoder" | "calculator" }) {
  if (mode === "legend") return <ColourLegend />;
  if (mode === "calculator") return <Calculator />;
  return <Decoder />;
}
