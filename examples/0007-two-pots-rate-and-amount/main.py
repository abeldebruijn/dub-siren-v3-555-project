from picozero import Button, LED, Pot
from time import sleep, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
rate = Pot(26)
amount = Pot(27)

last_change = ticks_ms()
light_on = False

while True:
    interval = int(500 - rate.value * 450)

    if button.is_pressed:
        now = ticks_ms()
        if ticks_diff(now, last_change) >= interval:
            light_on = not light_on
            last_change = now

        led.value = amount.value if light_on else 0
    else:
        led.off()
        light_on = False
        last_change = ticks_ms()

    sleep(0.01)
