from picozero import Pot
from time import sleep

pitch = Pot(28)
smoothed_pitch = pitch.value
last_pitch_hz = -1

while True:
    smoothed_pitch += (pitch.value - smoothed_pitch) * 0.1
    pitch_hz = int(100 + smoothed_pitch * 900)

    if abs(pitch_hz - last_pitch_hz) >= 5:
        print("Pitch through 4051:", pitch_hz, "Hz")
        last_pitch_hz = pitch_hz

    sleep(0.01)
