import { CodeDiffPanel } from "./LessonCodeDiff";

const momentary = `from picozero import Button, LED

led = LED(15)
button = Button(14)

button.when_pressed = led.on
button.when_released = led.off
`;

const toggle = `from picozero import Button, LED

led = LED(15)
button = Button(14)

button.when_pressed = led.toggle
`;

export default function LessonToggleDiff() {
  return <CodeDiffPanel before={momentary} after={toggle} label="Changes from momentary to toggle button behavior" />;
}
