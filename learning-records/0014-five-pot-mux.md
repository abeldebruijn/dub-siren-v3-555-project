# Five pots share one ADC

Lesson 14 adds the fifth B10K potentiometer as Tempo. Its centre wiper connects to CD74HC4051 CH4 pin 1, while S2 pin 9 moves from GND to Pico GP20. CH4 is binary 100, so S2 is high and S1/S0 are low. All five final potentiometers now share GP28 without using the reserved GP10–GP12 pins.
