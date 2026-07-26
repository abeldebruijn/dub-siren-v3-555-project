from machine import Pin
from picozero import Button, LED, Pot
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

# Parts connected directly to Pico pins.
led = LED(15)
button = Button(14)
rate = Pot(26)       # Rate stays direct: it controls LED flash speed.
mux_adc = Pot(28)    # Shared ADC input from 4051 COMMON pin 3.

# S0 selects which 4051 channel reaches the shared ADC:
# 0 selects Pitch on CH0; 1 selects Amount on CH1.
mux_s0 = Pin(18, Pin.OUT)

# After changing channel, give the voltage 2 ms to settle before reading.
MUX_SETTLE_MS = 2

# Human hands move slowly. Reading both knobs every 20 ms is responsive enough.
CONTROL_SCAN_MS = 20

# These variables remember the latest smoothed knob readings.
pitch_value = 0
amount_value = 0

# These variables remember the output state.
last_pitch_hz = -1
last_change = ticks_ms()
light_on = False

# These variables remember where the scheduled MUX scan is.
next_control_scan = ticks_ms()
mux_waiting = False       # False means no channel is currently settling.
mux_channel = 0           # Channel currently selected: 0=Pitch, 1=Amount.
mux_started = ticks_ms()  # Time when that channel was selected.


def start_mux_read(channel):
    # We assign to these outside this function, so Python requires "global".
    global mux_waiting, mux_channel, mux_started

    # Select a channel, then remember when its settling period started.
    # We deliberately do not read the ADC yet.
    mux_channel = channel
    mux_s0.value(channel)
    mux_started = ticks_ms()
    mux_waiting = True


def finish_mux_read():
    # This function runs only after MUX_SETTLE_MS has passed.
    global amount_value, mux_waiting, next_control_scan, pitch_value

    # Both knobs arrive through the same GP28 ADC input.
    reading = mux_adc.value

    if mux_channel == 0:
        # CH0 is Pitch. Smooth it, then immediately begin settling CH1.
        pitch_value += (reading - pitch_value) * 0.1
        start_mux_read(1)
    else:
        # CH1 is Amount. Smooth it, then end this two-channel scan.
        amount_value += (reading - amount_value) * 0.1
        mux_waiting = False

        # Do not start another scan until 20 ms from now.
        next_control_scan = ticks_add(ticks_ms(), CONTROL_SCAN_MS)


while True:
    # Take one time reading and use it for all timing checks in this loop.
    now = ticks_ms()

    # Job 1: when the next control scan is due, start with Pitch on CH0.
    if not mux_waiting and ticks_diff(now, next_control_scan) >= 0:
        start_mux_read(0)

    # Keep looping while the selected channel settles.
    # Once 2 ms has passed, finish the read without a blocking sleep(0.002).
    if mux_waiting and ticks_diff(now, mux_started) >= MUX_SETTLE_MS:
        finish_mux_read()

    # Pitch is only converted to Hz and printed in this lesson.
    # It does not control LED speed. Audio comes in a later lesson.
    pitch_hz = int(100 + pitch_value * 900)
    if abs(pitch_hz - last_pitch_hz) >= 5:
        print("Pitch:", pitch_hz, "Hz", "Amount:", round(amount_value, 2))
        last_pitch_hz = pitch_hz

    # Job 2: update the LED whenever its own timer says it is time.
    if button.is_pressed:
        # Rate controls time between LED toggles: 500 ms down to 50 ms.
        interval = int(500 - rate.value * 450)

        if ticks_diff(now, last_change) >= interval:
            light_on = not light_on
            last_change = now

        # Amount controls brightness during the ON half of the flash.
        led.value = amount_value if light_on else 0
    else:
        # Releasing the button stops immediately and resets the flash state.
        led.off()
        light_on = False
        last_change = now

    # Job 3: pace the loop. This small 1 ms pause avoids running needlessly
    # at full speed while still checking LED timing much faster than Lesson 10.
    sleep_ms(1)
