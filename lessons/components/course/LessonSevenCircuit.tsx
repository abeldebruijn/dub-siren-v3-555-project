import { BreadboardDiagram } from "./CircuitPath";
import MuxPinoutDiagram from "./MuxPinoutDiagram";

export const lessonSevenSource = `breadboard Lesson7 rows 44 columns 9
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

chip Mux4051 {
  height 8
  width 5
  color purple
  pin 1 CH4
  pin 2 CH6
  pin 3 COMMON
  pin 4 CH7
  pin 5 CH5
  pin 6 ENABLE
  pin 7 VEE
  pin 8 GND
  pin 9 S2
  pin 10 S1
  pin 11 S0
  pin 12 CH3
  pin 13 CH0
  pin 14 CH1
  pin 15 CH2
  pin 16 VCC
} at R32

potentiometer P3 {
  resistance 10k
  value 0.5
} at R42 outside

capacitor C1 from Mux4051.VCC to Mux4051.GND {
  type ceramic
  capacitance 0.1
  displayed capacitance
}

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
wire LP --> RP color red saturation 8%
wire LG --> RG color blue saturation 6%
wire P3.3 --> P color red saturation 18%
wire P3.1 --> G color blue saturation 12%
wire P3.2 --> Mux4051.CH0 color green saturation 18%
wire Mux4051.COMMON --> Pico2.GP28 via LT-R30C2 color orange saturation 18%
wire Mux4051.S0 --> G color grey
wire Mux4051.S1 --> G color grey
wire Mux4051.S2 --> G color grey
wire Mux4051.ENABLE --> G color grey
wire Mux4051.VEE --> G color grey
wire Mux4051.VCC --> P color red saturation 18%
wire Mux4051.GND --> G color blue saturation 12%`;

export default function LessonSevenCircuit() {
  return (
    <BreadboardDiagram
      source={lessonSevenSource}
      label="Lesson 7 breadboard with a CD74HC4051 multiplexer across the centre trench: Pitch now wires to channel 0 (pin 13), COMMON (pin 3) wires to GP28, all three selector pins and ENABLE and VEE are grounded, VCC comes from 3V3, and a 100 nanofarad capacitor bridges VCC and GND"
      caption="Green: Pitch wiper → CH0 (pin 13) · orange: COMMON (pin 3) → GP28 · grey: S0/S1/S2, ENABLE, VEE → GND · red/blue: VCC/GND · C1: 100 nF bypass capacitor"
      extraPinout={{
        id: "mux-pinout",
        buttonLabel: "View Mux pinout",
        source: "Texas Instruments CD74HC4051 datasheet",
        title: "CD74HC4051E pinout",
        content: <MuxPinoutDiagram />,
      }}
    />
  );
}
