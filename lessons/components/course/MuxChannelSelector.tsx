import { useState } from "react";

const channels = [
  { bits: [0, 0, 0], channel: 0, pin: 13, label: "CH0 · Pitch today" },
  { bits: [0, 0, 1], channel: 1, pin: 14, label: "CH1" },
  { bits: [0, 1, 0], channel: 2, pin: 15, label: "CH2" },
  { bits: [0, 1, 1], channel: 3, pin: 12, label: "CH3" },
  { bits: [1, 0, 0], channel: 4, pin: 1, label: "CH4" },
  { bits: [1, 0, 1], channel: 5, pin: 5, label: "CH5" },
  { bits: [1, 1, 0], channel: 6, pin: 2, label: "CH6" },
  { bits: [1, 1, 1], channel: 7, pin: 4, label: "CH7" },
] as const;

export default function MuxChannelSelector() {
  const [s2, setS2] = useState(0);
  const [s1, setS1] = useState(0);
  const [s0, setS0] = useState(0);
  const selected = channels.find((row) => row.bits[0] === s2 && row.bits[1] === s1 && row.bits[2] === s0)!;
  const isDefault = s2 === 0 && s1 === 0 && s0 === 0;

  return (
    <section className="course-simulator" aria-labelledby="mux-selector-title">
      <div>
        <h3 id="mux-selector-title">Try the eight-way selector</h3>
      </div>
      <div className="course-simulator__body">
        <div className="course-led-stage">
          <output aria-live="polite">
            <small>Connected channel</small>
            {selected.label}
          </output>
        </div>
        <div className="course-simulator__controls">
          <div className="course-mux-bits">
            <BitToggle label="S2" value={s2} onChange={setS2} />
            <BitToggle label="S1" value={s1} onChange={setS1} />
            <BitToggle label="S0" value={s0} onChange={setS0} />
          </div>
          <output>
            <code>{s2}{s1}{s0} binary</code>
            <strong>Physical pin {selected.pin} connects to COMMON (pin 3)</strong>
          </output>
          {!isDefault ? (
            <p className="course-mux-selector__note">
              Today every selector pin is wired to GND, so the circuit is permanently <code>000</code>. This preview shows what a later
              lesson's software selection will do once S0–S2 connect to Pico digital outputs.
            </p>
          ) : (
            <p className="course-mux-selector__note">
              <code>000</code> is what your wiring produces right now: CH0 stays connected, carrying Pitch to GP28.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function BitToggle({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <button
      type="button"
      className={value ? "course-mux-bit course-mux-bit--high" : "course-mux-bit"}
      onClick={() => onChange(value ? 0 : 1)}
      aria-pressed={value === 1}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  );
}
