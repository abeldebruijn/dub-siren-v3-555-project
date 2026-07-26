from picozero import Button, LED, Pot
from time import sleep, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
rate = Pot(26)
amount = Pot(27)
pitch = Pot(28)

last_change = ticks_ms()
light_on = False
last_pitch_hz = -1
smoothed_pitch = pitch.value


while True:
    interval = int(500 - rate.value * 450)
    smoothed_pitch += (pitch.value - smoothed_pitch) * 0.1
    pitch_hz = int(100 + smoothed_pitch * 900)

    if abs(pitch_hz - last_pitch_hz) >= 5:
        print("Pitch:", pitch_hz, "Hz")
        last_pitch_hz = pitch_hz

    if button.is_pressed: # type: ignore
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