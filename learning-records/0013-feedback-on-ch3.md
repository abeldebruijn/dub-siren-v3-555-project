# Feedback uses the fourth two-bit channel

Lesson 13 adds the fourth purchased B10K potentiometer as Feedback. Its centre wiper connects to CD74HC4051 CH3 pin 12, while its outside legs join shared 3V3 and GND. CH3 is binary 011, so existing GP19/S1 and GP18/S0 both go high; no new Pico selector pin is needed.
