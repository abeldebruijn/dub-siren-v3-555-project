from array import array
from machine import I2S, Pin
from math import pi, sin


SAMPLE_RATE = 44_100
FREQUENCY_HZ = 440

# About one quarter of the signed 16-bit maximum.
# Start with the powered speaker volume low, then raise it gradually.
AMPLITUDE = 8_000

# 2,205 frames contain exactly 44 cycles at 440 Hz and 22,050 Hz.
# Repeating this buffer therefore does not create a discontinuity.
FRAME_COUNT = 2_205


tone = array("h", [0] * (FRAME_COUNT * 2))

for frame in range(FRAME_COUNT):
    angle = 2 * pi * FREQUENCY_HZ * frame / SAMPLE_RATE
    sample = int(AMPLITUDE * sin(angle))

    # Send the same sample to the left and right outputs.
    tone[frame * 2] = sample
    tone[frame * 2 + 1] = sample


audio = I2S(
    0,
    sck=Pin(10),
    ws=Pin(11),
    sd=Pin(12),
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=20_000,
)


try:
    print("CONTINUOUS TEST: 440 Hz")
    print("Press Stop when finished")

    while True:
        audio.write(tone)
finally:
    audio.deinit()
