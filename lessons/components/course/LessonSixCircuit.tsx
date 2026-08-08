import { BreadboardDiagram } from "./CircuitPath";

export const lessonSixSource = `breadboard Lesson6 rows 36 columns 7
chip Pico2 {
  height 20
  width 6
  color forest
  pin 18 GND
  pin 19 GP14
  pin 20 GP15
  pin 31 GP26 | ADC0
  pin 32 GP27 | ADC1
  pin 34 GP28 | ADC2
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
} at R26 outside

potentiometer P2 {
  resistance 10k
  value 0.5
} at R26 right outside

potentiometer P3 {
  resistance 10k
  value 0.5
} at R32 outside

wire Pico2.38 --> G color blue saturation 12%
wire D1.2 --> G color blue saturation 12%
wire Pico2.GP14 --> S1.left1 color purple saturation 18%
wire S1.right1 --> G color blue saturation 12%
wire Pico2.36 --> P color red saturation 18%
wire P1.3 --> P color red saturation 18%
wire P1.2 --> Pico2.GP26 via LT-R24C2 color cyan saturation 18%
wire P1.1 --> G color blue saturation 12%
wire P2.3 --> P color red
wire P2.2 --> Pico2.GP27 via RT-R9C5 color yellow
wire P2.1 --> G color black
wire P3.3 --> P color red saturation 18%
wire P3.2 --> Pico2.GP28 via LT-R30C2 color green saturation 18%
wire P3.1 --> G color blue saturation 12%
wire LP --> RP color red saturation 8%
wire LG --> RG color blue saturation 6%`;

export default function LessonSixCircuit() {
  return (
    <BreadboardDiagram
      source={lessonSixSource}
      label="Lesson 6 breadboard with a third potentiometer sharing 3V3 and ground, its wiper on GP28 ADC2, alongside the existing Rate and Amount potentiometers on GP26 and GP27, and the left and right power rails bridged"
      caption="Green: new Pitch wiper → GP28/ADC2 · cyan: Rate wiper → GP26/ADC0 · yellow: Amount wiper → GP27/ADC1 · muted red/blue: LP↔RP and LG↔RG bridge the split rails · all three share 3V3 and GND"
    />
  );
}
