export const completeProgram = `breadboard DubDemo rows 10 columns 5
chip NE555 {
  height 4
  width 2
  color black
  pin 1 GND
  pin 3 OUT
  pin 8 VCC
} at R2
led D1 from NE555.OUT to RG6 {
  color green
  on true
}
resistor R1 from NE555.VCC to LP8 {
  value 10k
  bands 4
}
wire NE555.GND --> LG2 color black
annotation 1 at NE555.OUT
`;

export const breadboardProgram = `breadboard Tiny rows 6 columns 3
led D1 from LP2 to LT-R2C3 {
  color red
  on true
}
`;

export const componentProgram = `breadboard Timer rows 8 columns 5
chip NE555 {
  height 4
  width 2
  color black
  pin 1 GND
  pin 3 OUT | SIGNAL
  pin 8 VCC
} at R3 flip
annotation 1 at NE555.OUT
`;

export const automaticWireProgram = `breadboard Tiny rows 5 columns 3
wire LP2 --> RT-R4C color blue saturation 70%
`;

export const viaWireProgram = `breadboard Routed rows 5 columns 3
wire LP1 --> RG5 via LT-R1C1, LT-R5C1 color yellow
`;

export const positionShortcutsProgram = `breadboard Shortcuts rows 5 columns 3
wire P --> P
wire R2C --> R2C color cyan
wire LP --> LT-R4C color orange
`;

export const pinAliasesProgram = `breadboard Aliases rows 6 columns 3
chip Gate {
  height 2
  pin 1 IN
  pin 2 OUT | SIGNAL | PWM
  pin 4 GND
} at R2
wire Gate.SIGNAL --> RP3 color blue
wire Gate.GND --> RG4 color black
`;

export const ledButtonProgram = `breadboard Controls rows 10 columns 5
led D1 from LP2 to LT-R2C1 {
  color green
  on true
  display-legs true
}
button S1 {
  pins-per-side 2
  on false
} at R6
wire D1.2 --> S1.left1 color green
annotation 1 at S1.right1
`;

export const capacitorResistorProgram = `breadboard Passives rows 10 columns 5
capacitor C1 from LT-R2C1 to LT-R5C1 {
  type electrolytic
  color blue
  capacitance 100
  max-voltage 16
  displayed capacitance max-voltage
}
resistor R1 from LT-R7C1 to RT-R7C1 {
  value 4.7k
  bands 5
}
`;

export const switchPotentiometerProgram = `breadboard Controls rows 14 columns 5
potentiometer P1 {
  resistance 10k
  value 0.25
} at R3 outside
switch SW1 {
  options 3
  value 2
} at R8 right outside
wire P1.wiper --> SW1.common color purple
`;

export const coloursProgram = `breadboard Colours rows 8 columns 3
led D1 from LP2 to LT-R2C1 {
  color #35A65B
  on true
}
wire LP4 --> RT-R4C color blue saturation 55%
wire LP7 --> RT-R7C color yellow
`;

export const diagnosticProgram = `breadboard Errors rows 8 columns 5
resistor R1 from LP1 to LP2 {
  value 100
}
annotation 1 at Missing.1
`;

export const twoComponentsProgram = `breadboard Pair rows 8 columns 3
chip A {
  height 2
  pin 1 IN
  pin 2 OUT
  pin 4 GND
} at R1
chip B {
  height 2
  pin 1 IN
  pin 2 OUT
  pin 4 GND
} at R5
wire A.OUT --> B.IN color blue
`;

export const commonConnectionsProgram = `breadboard Routes rows 5 columns 3
wire P --> P
wire R2C --> R2C color white
wire LP --> LT-R4C color orange
`;

export const discreteComponentsProgram = `breadboard Parts rows 14 columns 5
led D1 from LP2 to LT-R2C1 {
  color red
  on true
}
capacitor C1 from LT-R4C1 to LT-R6C1 {
  type ceramic
  capacitance 0.1
  displayed capacitance
}
resistor R1 from LT-R8C1 to RT-R8C1 {
  value 1k
  bands 4
}
button S1 {
  pins-per-side 2
  on true
} at R11
wire D1.2 --> S1.left1 color green
annotation 1 at C1.1
`;
