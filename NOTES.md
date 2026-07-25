# Teaching notes

- Learner reports no prior Raspberry Pi Pico or electronics experience.
- Prefer one short physical win per lesson, plain language, and visible feedback.
- Follow requested order: blinking LED → buttons → potentiometers → changing LEDs → integrated siren controls.
- Use only parts confirmed in `shopping-raspberry.md`; label optional/unpurchased parts clearly.
- Learner prefers MicroPython with concise `picozero` imports such as `from picozero import LED, Pot`.
- Use `picozero` for beginner LED, button, and potentiometer lessons. Reassess firmware/runtime before class-compliant USB-MIDI work.
- Never assume the breadboard power rails are continuous; test or bridge them when rails are introduced.
- Keep GP10–GP12 free for the proposed later PCM5102A connection.
