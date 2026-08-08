import { CodeDiffPanel } from "./LessonCodeDiff";

const buttonCode = `from picozero import Button, LED

led = LED(15)
button = Button(14)

button.when_pressed = led.toggle
`;

const potentiometerCode = `from picozero import Pot
from time import sleep

pot = Pot(26)

while True:
    position = min(int(pot.value * 5), 4)
    print(position)
    sleep(0.1)
`;

export default function LessonThreeCodeDiff() {
  return <CodeDiffPanel before={buttonCode} after={potentiometerCode} label="Changes to main.py for reading the potentiometer" />;
}
