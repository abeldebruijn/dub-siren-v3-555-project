import { compile } from "@dub-siren/breadboard";

const source = `breadboard Lesson1 rows 24 columns 5
chip Pico2 {
  height 20
  width 3
  color forest
  pin 18 GND
  pin 20 GP15
} at R2
resistor R1 from Pico2.GP15 to LT-R23C1 {
  value 1k
}
led D1 from R1.2 to LG23 {
  color red
  on true
}
wire Pico2.GND --> LG18 color black`;

const result = compile(source);

export default function CircuitPath() {
  if (result.status !== "valid") {
    return <p role="alert">The lesson breadboard could not be rendered.</p>;
  }

  return (
    <figure className="course-circuit course-breadboard">
      <div
        className="course-breadboard__svg"
        role="img"
        aria-label="Breadboard circuit connecting Pico GP15 through a one kilo-ohm resistor and LED to ground"
        dangerouslySetInnerHTML={{ __html: result.svg }}
      />
      <figcaption>GP15 → 1 kΩ resistor → LED → GND</figcaption>
    </figure>
  );
}
