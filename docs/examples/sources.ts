export const completeProgram = `breadboard Demo rows 5 columns 3
chip Mini {
  height 2
  width 2
  color forest
  pin 1 IN | SIGNAL
  pin 2 OUT
  pin 4 GND
}
place U1 Mini at R2
wire LP2 --> U1.IN color red
wire U1.OUT --> RT-R5C3 color cyan saturation 65%
`;

export const breadboardProgram = `breadboard Tiny rows 5 columns 3
wire LP2 --> LT-R2C3 color red
`;

export const componentProgram = `breadboard Tiny rows 5 columns 3
chip Mini {
  height 2
  width 2
  color forest
  pin 1 IN | SIGNAL
  pin 2 OUT
  pin 4 GND
}
place U1 Mini at R2
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

export const pinAliasesProgram = `breadboard Aliases rows 5 columns 3
chip Gate {
  height 2
  pin 1 IN
  pin 2 OUT | SIGNAL | PWM
  pin 4 GND
}
place U1 Gate at R2
wire U1.SIGNAL --> RP3 color blue
wire U1.GND --> RG4 color black
`;

export const coloursProgram = `breadboard Colours rows 5 columns 3
wire LP1 --> RT-R1C color red
wire LP3 --> RT-R3C color blue saturation 55%
wire LP5 --> RT-R5C color yellow
`;

export const diagnosticProgram = `breadboard Errors rows 5 columns 3
chip Gate {
  height 2
  pin 1 IN
  pin 2 OUT
}
place U1 Gate at R2
wire U1.NOPE --> RP2
`;

export const twoComponentsProgram = `breadboard Pair rows 5 columns 3
chip Gate {
  height 2
  width 2
  color forest
  pin 1 IN
  pin 2 OUT
  pin 4 GND
}
place A Gate at R1
place B Gate at R4
wire A.OUT --> B.IN color blue
`;

export const commonConnectionsProgram = `breadboard Routes rows 5 columns 3
wire P --> P
wire R2C --> R2C color white
wire LP --> LT-R4C color orange
`;
