from machine import Pin
from picozero import Button, LED, Pot
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
rate = Pot(26)
mux_adc = Pot(28)

mux_s0 = Pin(18, Pin.OUT)

MUX_SETTLE_MS = 2
CONTROL_SCAN_MS = 20

pitch_value = 0
amount_value = 0
last_pitch_hz = -1
last_change = ticks_ms()
light_on = False

next_control_scan = ticks_ms()
mux_waiting = False
mux_channel = 0
mux_started = ticks_ms()


def start_mux_read(channel):
    global mux_waiting, mux_channel, mux_started
    mux_channel = channel
    mux_s0.value(channel)
    mux_started = ticks_ms()
    mux_waiting = True


def finish_mux_read():
    global amount_value, mux_waiting, next_control_scan, pitch_value
    reading = mux_adc.value

    if mux_channel == 0:
        pitch_value += (reading - pitch_value) * 0.1
        start_mux_read(1)
    else:
        amount_value += (reading - amount_value) * 0.1
        mux_waiting = False
        next_control_scan = ticks_add(ticks_ms(), CONTROL_SCAN_MS)


while True:
    now = ticks_ms()

    if not mux_waiting and ticks_diff(now, next_control_scan) >= 0:
        start_mux_read(0)

    if mux_waiting and ticks_diff(now, mux_started) >= MUX_SETTLE_MS:
        finish_mux_read()

    pitch_hz = int(100 + pitch_value * 900)
    if abs(pitch_hz - last_pitch_hz) >= 5:
        print("Pitch:", pitch_hz, "Hz", "Amount:", round(amount_value, 2))
        last_pitch_hz = pitch_hz

    if button.is_pressed:
        interval = int(500 - rate.value * 450)

        if ticks_diff(now, last_change) >= interval:
            light_on = not light_on
            last_change = now

        led.value = amount_value if light_on else 0
    else:
        led.off()
        light_on = False
        last_change = now

    sleep_ms(1)