import { BreadboardDiagram } from "./CircuitPath";

export const lessonTwoSource = `breadboard Lesson2 rows 24 columns 5
chip Pico2 {
  height 20
  width 6
  color forest
  pin 18 GND
  pin 19 GP14
  pin 20 GP15
  pin 36 3V3
  pin 38 GND
} at R1

button S1 {
  on false
} at R21

resistor R1 from Pico2.GP15 to LT-R23C4 {
  value 1k
}

led D1 from R1.2 to RT-R23C2 {
  color red
  on true
}

wire Pico2.38 --> G color blue saturation 12%
wire D1.2 --> G color blue saturation 12%
wire Pico2.GP14 --> S1.left1 color purple
wire S1.right1 --> G color black`;

export default function LessonTwoCircuit() {
  return (
    <BreadboardDiagram
      source={lessonTwoSource}
      label="Lesson 2 breadboard circuit with the existing GP15 LED path desaturated and a new vivid GP14 button input"
      caption="Vivid: GP14 → button → GND · muted: existing LED path"
    />
  );
}
