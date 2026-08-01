from array import array
from machine import I2S, Pin
from math import pi, sin


# The PCM5102A is using its three-wire BCK PLL because no separate
# master-clock wire is connected. 44.1 kHz is a supported PLL rate;
# 22.05 kHz is not.
SAMPLE_RATE = 44_100
FREQUENCY_HZ = 440
AMPLITUDE = 8_000
FRAME_COUNT = 2_205


tone = array("h", [0] * (FRAME_COUNT * 2))

for frame in range(FRAME_COUNT):
    angle = 2 * pi * FREQUENCY_HZ * frame / SAMPLE_RATE
    sample = int(AMPLITUDE * sin(angle))
    tone[frame * 2] = sample
    tone[frame * 2 + 1] = sample


# This test uses the GP16/GP17/GP18 I2S pin group.
audio = I2S(
    0,
    sck=Pin(16),  # GP16, physical pin 21 -> RCA BCK, bus pin 22
    ws=Pin(17),   # GP17, physical pin 22 -> RCA LRCK, bus pin 24
    sd=Pin(18),   # GP18, physical pin 24 -> RCA DIN, bus pin 23
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=20_000,
)


try:
    print("GP16 TEST: continuous 440 Hz")
    print("Press Stop when finished")

    while True:
        audio.write(tone)
finally:
    audio.deinit()
