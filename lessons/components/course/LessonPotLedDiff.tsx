import { CodeDiffPanel } from "./LessonCodeDiff";

const readPositions = `from picozero import Pot
from time import sleep

pot = Pot(26)

while True:
    position = min(int(pot.value * 5), 4)
    print(position)
    sleep(0.1)
`;

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

export default function LessonPotLedDiff() {
  return <CodeDiffPanel before={readPositions} after={controlBrightness} label="Changes from reading positions to controlling LED brightness" />;
}
