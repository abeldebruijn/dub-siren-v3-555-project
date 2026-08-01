from array import array
from machine import I2S, Pin
from math import pi, sin
from time import sleep_ms


# The DAC receives 44,100 stereo sample frames every second.
# The module uses BCK to generate its internal master clock.
# 44.1 kHz is supported by that three-wire PLL mode.
SAMPLE_RATE = 44_100

# This matches the clearly audible continuous diagnostic tone.
# Start with the powered speaker or amplifier volume low.
AMPLITUDE = 8_000

# Three fixed test notes: A3, A4, and A5.
TONES_HZ = (220, 440, 880)
TONE_LENGTH_MS = 700
CHUNK_LENGTH_MS = 100


# MicroPython calls the I2S bit clock "sck" and the word clock "ws".
# On the RCA module those same signals are labelled BCK and LRCK.
audio = I2S(
    0,
    sck=Pin(16),       # GP16 -> RCA module BCK
    ws=Pin(17),        # GP17 -> RCA module LRCK
    sd=Pin(18),        # GP18 -> RCA module DIN
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=20_000,
)


def make_tone(frequency_hz):
    """Build a small stereo chunk that can be played repeatedly."""
    frame_count = SAMPLE_RATE * CHUNK_LENGTH_MS // 1_000
    samples = array("h", [0] * (frame_count * 2))

    for frame in range(frame_count):
        angle = 2 * pi * frequency_hz * frame / SAMPLE_RATE
        sample = int(AMPLITUDE * sin(angle))

        # Stereo frames alternate left, right. Send the same tone to both.
        samples[frame * 2] = sample
        samples[frame * 2 + 1] = sample

    return samples


try:
    print("Playing 220 Hz, 440 Hz, then 880 Hz")

    for frequency_hz in TONES_HZ:
        print("Tone:", frequency_hz, "Hz")
        tone = make_tone(frequency_hz)

        # Reuse the same 100 ms chunk seven times. This plays for 700 ms
        # without allocating a 123 KB tone buffer on the Pico.
        for _ in range(TONE_LENGTH_MS // CHUNK_LENGTH_MS):
            audio.write(tone)

        del tone
        sleep_ms(300)

    print("Finished")
finally:
    # Release the I2S hardware when the program ends or is stopped.
    audio.deinit()
