import { CodeDiffPanel } from "./LessonCodeDiff";

const controlBrightness = `from picozero import Button, LED, Pot
from time import sleep

led = LED(15)
button = Button(14)
pot = Pot(26)

while True:
    if button.is_pressed:
        led.value = pot.value
    else:
        led.off()
    sleep(0.01)
`;

const controlFlashRate = `from picozero import Button, LED, Pot
from time import sleep, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
pot = Pot(26)

last_change = ticks_ms()

while True:
    interval = int(500 - pot.value * 450)

    if button.is_pressed:
        now = ticks_ms()
        if ticks_diff(now, last_change) >= interval:
            led.toggle()
            last_change = now
    else:
        led.off()
        last_change = ticks_ms()

    sleep(0.01)
`;

export default function LessonFourCodeDiff() {
  return <CodeDiffPanel before={controlBrightness} after={controlFlashRate} label="Changes to main.py for a pot-controlled flash rate" />;
}
