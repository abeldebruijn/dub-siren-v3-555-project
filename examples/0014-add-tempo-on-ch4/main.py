from machine import Pin
from picozero import Button, LED, Pot
from time import sleep_ms, ticks_add, ticks_diff, ticks_ms

led = LED(15)
button = Button(14)
mux_adc = Pot(28)

# Three selector bits can reach all eight 4051 channels.
mux_s0 = Pin(18, Pin.OUT)
mux_s1 = Pin(19, Pin.OUT)
mux_s2 = Pin(20, Pin.OUT)

PITCH_CHANNEL = 0
AMOUNT_CHANNEL = 1
RATE_CHANNEL = 2
FEEDBACK_CHANNEL = 3
TEMPO_CHANNEL = 4

MUX_SETTLE_MS = 2
CONTROL_SCAN_MS = 20

pitch_value = 0
amount_value = 0
rate_value = 0
feedback_value = 0
tempo_value = 0

last_pitch_hz = -1
last_amount = -1
last_rate = -1
last_feedback = -1
last_tempo_bpm = -1
last_change = ticks_ms()
light_on = False

next_control_scan = ticks_ms()
mux_waiting = False
mux_channel = PITCH_CHANNEL
mux_started = ticks_ms()


def select_mux_channel(channel):
    # Extract the three binary bits for S0, S1 and S2.
    mux_s0.value(channel & 1)
    mux_s1.value((channel >> 1) & 1)
    mux_s2.value((channel >> 2) & 1)


def start_mux_read(channel):
    global mux_channel, mux_started, mux_waiting

    mux_channel = channel
    select_mux_channel(channel)
    mux_started = ticks_ms()
    mux_waiting = True


def finish_mux_read():
    global amount_value, feedback_value, mux_waiting
    global next_control_scan, pitch_value, rate_value, tempo_value

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
    elif mux_channel == FEEDBACK_CHANNEL:
        feedback_value = reading
        start_mux_read(TEMPO_CHANNEL)
    else:
        tempo_value = reading
        mux_waiting = False
        next_control_scan = ticks_add(ticks_ms(), CONTROL_SCAN_MS)


while True:
    now = ticks_ms()

    # Job 1: scan all five pots through GP28.
    if not mux_waiting and ticks_diff(now, next_control_scan) >= 0:
        start_mux_read(PITCH_CHANNEL)

    if mux_waiting and ticks_diff(now, mux_started) >= MUX_SETTLE_MS:
        finish_mux_read()

    # Convert raw 0.0-1.0 values into useful prototype ranges.
    pitch_hz = int(100 + pitch_value * 900)
    tempo_bpm = int(40 + tempo_value * 160)

    if (
        abs(pitch_hz - last_pitch_hz) >= 5
        or abs(amount_value - last_amount) >= 0.03
        or abs(rate_value - last_rate) >= 0.03
        or abs(feedback_value - last_feedback) >= 0.03
        or abs(tempo_bpm - last_tempo_bpm) >= 2
    ):
        print(
            "Pitch:", pitch_hz, "Hz",
            "Amount:", round(amount_value, 2),
            "Rate:", round(rate_value, 2),
            "Feedback:", round(feedback_value, 2),
            "Tempo:", tempo_bpm, "BPM",
        )
        last_pitch_hz = pitch_hz
        last_amount = amount_value
        last_rate = rate_value
        last_feedback = feedback_value
        last_tempo_bpm = tempo_bpm

    # Tempo and Feedback are only measured in this lesson.
    # Rate controls LED speed; Amount controls LED brightness.
    if button.is_pressed:
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
