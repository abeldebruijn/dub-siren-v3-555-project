export const docsBase = "/pico-dub-siren/lessons";

export const lessonOneDoneItems = [
  { id: "blink", label: "The external LED blinks with the 1 kΩ resistor installed." },
  { id: "identify-path", label: "You can identify GP15, resistor, LED anode, LED cathode, and GND." },
  { id: "change-speed", label: "You changed blink speed and explained why it changed." },
  { id: "usb-safety", label: "You unplugged USB before every wiring change." },
] as const;

export const lessonTwoDoneItems = [
  { id: "button-controls-led", label: "The LED is on only while the button is held." },
  { id: "button-sides", label: "You can identify the button’s two connected sides." },
  { id: "internal-pull-up", label: "You can explain why the input needs no external resistor." },
  { id: "callbacks", label: "You know why the callback names have no parentheses." },
  { id: "button-toggles-led", label: "One press turns the LED on; the next turns it off." },
  { id: "control-rules", label: "You can explain momentary versus toggle control." },
  { id: "release-omitted", label: "You know omitted release code means release has no assigned action." },
] as const;

export const lessonThreeDoneItems = [
  { id: "all-five-values", label: "The Shell reaches every integer from 0 through 4." },
  { id: "pot-pins", label: "You can identify both outside pins and the centre wiper." },
  { id: "adc0", label: "You know GP26 is both GPIO 26 and ADC0." },
  { id: "safe-voltage", label: "You used 3V3(OUT), never VBUS or VSYS, for the potentiometer." },
  { id: "button-gates-led", label: "The button gates the LED." },
  { id: "pot-controls-brightness", label: "The potentiometer changes brightness while the button is held." },
  { id: "safe-led-swap", label: "You safely swapped the red LED for yellow or green." },
  { id: "siren-controls", label: "You can connect this pattern to Trigger and Mod Amount." },
] as const;

export const lessonFourDoneItems = [
  { id: "led-off-released", label: "The LED stays off at every knob position while Trigger is released." },
  { id: "slow-end-counted", label: "You counted flashes at the slowest end of the knob." },
  { id: "rate-changes-live", label: "Turning the knob while holding Trigger changes the rate immediately." },
  { id: "release-stops-fast", label: "Releasing Trigger turns the LED off without waiting for the interval." },
  { id: "explain-interval", label: "You can explain why a smaller interval means a faster rate." },
  { id: "lfo-to-siren", label: "You can connect this LFO to the siren’s Mod Rate control." },
] as const;

export const lessonFiveDoneItems = [
  { id: "rate-changes-speed-only", label: "Turning Rate changes speed without changing peak brightness." },
  { id: "amount-changes-brightness-only", label: "Turning Amount changes brightness without changing speed." },
  { id: "trigger-stops-immediately", label: "Releasing Trigger still stops the LED immediately." },
  { id: "identify-adc0-adc1", label: "You can identify GP26/ADC0 and GP27/ADC1." },
  { id: "predict-swapped-wipers", label: "You predicted the symptom of swapped centre-wiper connections." },
] as const;

export const lessons = [
  ["Make your first light blink", "Wire one safe LED path, then make the Pico pulse it with MicroPython."],
  ["Control the light with a button", "Compare momentary and toggle behavior with one button."],
  ["Read a turning knob", "Measure a potentiometer, then map it to LED brightness."],
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
