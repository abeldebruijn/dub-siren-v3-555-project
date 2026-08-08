import { BreadboardDiagram } from "./CircuitPath";

export const lessonThreeSource = `breadboard Lesson3 rows 30 columns 5
chip Pico2 {
  height 20
  width 6
  color forest
  pin 18 GND
  pin 19 GP14
  pin 20 GP15
  pin 31 GP26 | ADC0
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

potentiometer P1 {
  resistance 10k
  value 0.5
} at R26 right outside

wire Pico2.38 --> G color blue saturation 12%
wire D1.2 --> G color blue saturation 12%
wire Pico2.GP14 --> S1.left1 color purple saturation 18%
wire S1.right1 --> G color blue saturation 12%
wire Pico2.36 --> P color red
wire P1.3 --> P color red
wire P1.2 --> Pico2.GP26 color cyan
wire P1.1 --> G color black`;

export default function LessonThreeCircuit() {
  return (
    <BreadboardDiagram
      source={lessonThreeSource}
      label="Lesson 3 breadboard with a ten kilo-ohm potentiometer connected to 3V3, GP26 ADC0, and ground"
      caption="Red: 3V3 · cyan: wiper → GP26/ADC0 · black: GND"
    />
  );
}
