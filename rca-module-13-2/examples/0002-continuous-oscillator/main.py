from array import array
from machine import I2S, Pin
from math import pi, sin
from time import sleep_ms


SAMPLE_RATE = 44_100
AMPLITUDE = 8_000

# Every prepared block contains 100 ms of stereo audio.
CHUNK_LENGTH_MS = 100
REPEATS_PER_PITCH = 10

# Every frequency is divisible by 10. It therefore completes a whole
# number of sine-wave cycles inside one 100 ms chunk.
PITCHES_HZ = (220, 330, 440, 660, 880)


def make_tone(frequency_hz):
    """Prepare one seamless 100 ms stereo tone block."""
    frame_count = SAMPLE_RATE * CHUNK_LENGTH_MS // 1_000
    samples = array("h", [0] * (frame_count * 2))

    for frame in range(frame_count):
        phase = 2 * pi * frequency_hz * frame / SAMPLE_RATE
        sample = int(AMPLITUDE * sin(phase))

        samples[frame * 2] = sample
        samples[frame * 2 + 1] = sample

    return samples


# Do the expensive sine calculations before I2S playback begins.
print("Preparing tone blocks")
tones = []

for frequency_hz in PITCHES_HZ:
    tones.append(make_tone(frequency_hz))


audio = I2S(
    0,
    sck=Pin(16),  # GP16 -> BCK
    ws=Pin(17),   # GP17 -> LRCK
    sd=Pin(18),   # GP18 -> DIN
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=SAMPLE_RATE,
    ibuf=20_000,
)


try:
    print("Continuous prepared tones")

    for frequency_hz, tone in zip(PITCHES_HZ, tones):
        print("Pitch:", frequency_hz, "Hz")

        # 100 ms repeated ten times gives one second of sound.
        for _ in range(REPEATS_PER_PITCH):
            audio.write(tone)

    # Allow the final queued samples to leave the I2S buffer.
    sleep_ms(150)
    print("Finished")
finally:
    audio.deinit()
