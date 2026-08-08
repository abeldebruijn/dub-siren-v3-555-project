import { useState } from "react";

const wires = [
  {
    id: "vcc",
    label: "Pin 16 · VCC → 3V3(OUT)",
    reason: "Powers the chip and defines its upper voltage rail. Our pots also produce at most 3.3 V, so signal and chip use the same safe ceiling.",
  },
  {
    id: "gnd",
    label: "Pin 8 · GND → GND",
    reason: "Digital zero reference for the chip's selector logic. Without a common ground, 0 and 1 have no reliable meaning relative to the Pico.",
  },
  {
    id: "vee",
    label: "Pin 7 · VEE → GND",
    reason: "Defines the lowest analogue voltage the switches may pass. The 4051 can support negative signals with a negative VEE supply, but every pot in this project stays between 0 and 3.3 V, so VEE is zero volts.",
  },
  {
    id: "enable",
    label: "Pin 6 · ENABLE → GND",
    reason: "ENABLE has a bar in the datasheet: it is active-low. Ground enables the selected switch. Driving it high would open all eight switches and disconnect COMMON.",
  },
  {
    id: "selectors",
    label: "Pins 11, 10, 9 · S0, S1, S2 → GND",
    reason: "These are the three binary selector bits. Grounding all three creates 000, selecting CH0. They must never float; an uncertain selector could jump between pots.",
  },
  {
    id: "capacitor",
    label: "100 nF ceramic capacitor · pin 16 to pin 8",
    reason: "A tiny local energy reservoir. It supplies brief current spikes when internal switches change and carries high-frequency supply noise to ground. Place it close to the IC. It is non-polar.",
  },
] as const;

export default function MuxSupportWireExplorer() {
  const [openId, setOpenId] = useState<(typeof wires)[number]["id"] | null>(wires[0].id);
  const open = wires.find((wire) => wire.id === openId) ?? null;

  return (
    <section className="course-mux-explorer" aria-labelledby="mux-explorer-title">
      <header>
        <span>Click each connection</span>
        <h3 id="mux-explorer-title">Why every support wire is needed</h3>
      </header>
      <div className="course-mux-explorer__body">
        <div className="course-mux-explorer__list" role="list">
          {wires.map((wire) => (
            <button
              type="button"
              key={wire.id}
              className={wire.id === openId ? "course-mux-explorer__item course-mux-explorer__item--active" : "course-mux-explorer__item"}
              onClick={() => setOpenId(wire.id)}
              aria-pressed={wire.id === openId}
            >
              {wire.label}
            </button>
          ))}
        </div>
        <div className="course-mux-explorer__reason" aria-live="polite">
          {open ? <p>{open.reason}</p> : <p>Select a connection to see why it is needed.</p>}
        </div>
      </div>
    </section>
  );
}
