from machine import Pin
from picozero import Button, LED, Pot
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
mux_adc = Pot(28)

# Two selector bits can choose CH0, CH1, CH2 or CH3.
# S2 remains connected to GND, so CH4-CH7 are not used yet.
mux_s0 = Pin(18, Pin.OUT)
mux_s1 = Pin(19, Pin.OUT)

PITCH_CHANNEL = 0
AMOUNT_CHANNEL = 1
RATE_CHANNEL = 2
FEEDBACK_CHANNEL = 3

MUX_SETTLE_MS = 2
CONTROL_SCAN_MS = 20

pitch_value = 0
amount_value = 0
rate_value = 0
feedback_value = 0

last_pitch_hz = -1
last_amount = -1
last_rate = -1
last_feedback = -1
last_change = ticks_ms()
light_on = False

next_control_scan = ticks_ms()
mux_waiting = False
mux_channel = PITCH_CHANNEL
mux_started = ticks_ms()


def select_mux_channel(channel):
    # Channel numbers 0, 1 and 2 are binary 00, 01 and 10.
    # "& 1" extracts the right-hand bit for S0.
    mux_s0.value(channel & 1)

    # ">> 1" moves the second bit right; "& 1" extracts it for S1.
    mux_s1.value((channel >> 1) & 1)


def start_mux_read(channel):
    global mux_channel, mux_started, mux_waiting

    mux_channel = channel
    select_mux_channel(channel)
    mux_started = ticks_ms()
    mux_waiting = True


def finish_mux_read():
    global amount_value, feedback_value, mux_waiting
    global next_control_scan, pitch_value, rate_value

    reading = mux_adc.value

    if mux_channel == PITCH_CHANNEL:
        pitch_value = reading
        start_mux_read(AMOUNT_CHANNEL)
    elif mux_channel == AMOUNT_CHANNEL:
        amount_value = reading
        start_mux_read(RATE_CHANNEL)
    elif mux_channel == RATE_CHANNEL:
        rate_value = reading
        start_mux_read(FEEDBACK_CHANNEL)
    else:
        feedback_value = reading
        mux_waiting = False
        next_control_scan = ticks_add(ticks_ms(), CONTROL_SCAN_MS)


while True:
    now = ticks_ms()

    # Job 1: scan Pitch, Amount and Rate through the shared ADC.
    if not mux_waiting and ticks_diff(now, next_control_scan) >= 0:
        start_mux_read(PITCH_CHANNEL)

    if mux_waiting and ticks_diff(now, mux_started) >= MUX_SETTLE_MS:
        finish_mux_read()

    # Print only when one of the controls changes enough to be useful.
    pitch_hz = int(100 + pitch_value * 900)
    if (
        abs(pitch_hz - last_pitch_hz) >= 5
        or abs(amount_value - last_amount) >= 0.03
        or abs(rate_value - last_rate) >= 0.03
        or abs(feedback_value - last_feedback) >= 0.03
    ):
        print(
            "Pitch:", pitch_hz, "Hz",
            "Amount:", round(amount_value, 2),
            "Rate:", round(rate_value, 2),
            "Feedback:", round(feedback_value, 2),
        )
        last_pitch_hz = pitch_hz
        last_amount = amount_value
        last_rate = rate_value
        last_feedback = feedback_value

    # Job 2: Rate controls LED speed; Amount controls LED brightness.
    if button.is_pressed: # type: ignore
        interval = int(500 - rate_value * 450)

        if ticks_diff(now, last_change) >= interval:
            light_on = not light_on
            last_change = now

        led.value = amount_value if light_on else 0
    else:
        led.off()
        light_on = False
        last_change = now

    sleep_ms(1)