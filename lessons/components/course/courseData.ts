export const docsBase = "/pico-dub-siren/lessons";

export const lessonOneDoneItems = [
  { id: "blink", label: "The external LED blinks with the 1 kΩ resistor installed." },
  { id: "identify-path", label: "You can identify GP15, resistor, LED anode, LED cathode, and GND." },
  { id: "change-speed", label: "You changed blink speed and explained why it changed." },
  { id: "usb-safety", label: "You unplugged USB before every wiring change." },
] as const;

export const lessons = [
  ["Make your first light blink", "Wire one safe LED path, then make the Pico pulse it with MicroPython."],
  ["Control the light with a button", "Read a push button and make the LED respond."],
  ["Turn a button into an on/off switch", "Turn raw presses into one clean toggle."],
  ["Read a turning knob", "Read a potentiometer as numbers you can trust."],
  ["Fade the light with a knob", "Turn a knob into smooth LED brightness."],
  ["Control blink speed with a knob", "Use a knob to control modulation speed."],
  ["Control speed and brightness together", "Make two knobs control two different behaviours."],
  ["Add a pitch dial", "Add the pitch control that will shape the siren."],
  ["Route pitch through the switch chip", "Send pitch through the CD74HC4051 switch chip."],
  ["Share one Pico input between two dials", "Read two dials through one Pico analog input."],
  ["Keep timing responsive", "Keep the mux reading loop responsive."],
  ["Add a third dial to the switch chip", "Expand the switch chip to a third control."],
  ["Add a feedback dial", "Add the feedback control for dub-siren character."],
  ["Add a tempo dial", "Add the tempo control for rhythmic control."],
] as const;

export function lessonSlug(number: number) {
  return `lesson${number}`;
}
