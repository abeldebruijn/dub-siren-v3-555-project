# Raspberry Pi Pico Dub Siren Resources

## Knowledge

- [Raspberry Pi Pico 2 documentation](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html)
  Primary hardware reference. Use for: board capabilities, GPIO, power pins, and official design files.
- [Official Raspberry Pi Pico 1/2 pinout](https://datasheets.raspberrypi.com/pico/Pico-2-Pinout.pdf)
  Primary one-page wiring reference. Use for: locating GP, GND, 3V3, and ADC pins before applying power.
- [CircuitPython for Raspberry Pi Pico 2](https://circuitpython.org/board/raspberry_pi_pico2/)
  Exact firmware download for the purchased non-wireless Pico 2. Use the latest stable release, not the Pico, Pico W, or Pico 2 W build.
- [Adafruit: Getting Started with Pico and CircuitPython](https://learn.adafruit.com/getting-started-with-raspberry-pi-pico-circuitpython)
  Maintained beginner guide for installing CircuitPython, external LEDs, buttons, and analogue input.
- [CircuitPython `usb_midi` documentation](https://docs.circuitpython.org/en/latest/shared-bindings/usb_midi/)
  Primary software API reference for the course’s Phase 1 destination: class-compliant USB-MIDI to the Mac.
- [Raspberry Pi: _Get Started with MicroPython on Raspberry Pi Pico_, 2nd edition](https://magazines-assets.raspberrypi.com/books/get-started-micropython-pico-2ed)
  Official, beginner-friendly electronics and MicroPython guide updated for Pico 2.
- [picozero documentation](https://picozero.readthedocs.io/en/latest/)
  Raspberry Pi Foundation’s beginner component library. Use for: `LED`, `Button`, `Pot`, and short MicroPython control programs.
- [Python language reference — binary bitwise operations](https://docs.python.org/3/reference/expressions.html#binary-bitwise-operations)
  Primary language reference. Use for: `&`, `>>`, masks, and extracting multiplexer selector bits.
- [Texas Instruments CD74HC4051 datasheet](https://www.ti.com/lit/ds/symlink/cd74hc4051.pdf)
  Manufacturer pinout and channel-selection reference for the purchased DIP-16 analogue multiplexer.
- [Lorlin CK rotary-switch datasheet](https://lorlinelectronics.co.uk/wp-content/uploads/2020/11/CK-ROTARY-Nov-2020-1.pdf)
  Manufacturer reference for the purchased CK1050: two poles, six positions, PCB terminals, adjustable stop, terminal map, and break-before-make action.
- [Vishay resistor colour-code card](https://www.vishay.com/docs/49411/resistor_color_code_calculator.pdf)
  Manufacturer reference for four- and five-band resistor colours, multipliers, and tolerances.
- [RP2350 datasheet](https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf)
  Primary chip reference. Use for: Pico 2 GPIO drive-strength settings and electrical limits.
- [M5Stack Module13.2 RCA documentation](https://docs.m5stack.com/en/module/RCA%20Module%2013.2)
  Manufacturer overview and product-specific M-Bus map. Use for: BCK, DIN, LRCK, 5 V, GND, audio outputs, and the optional 9-24 V DC input.
- [M5Stack Module13.2 RCA schematic](https://m5stack-doc.oss-cn-shenzhen.aliyuncs.com/552/SCH_Module_RCA_V1.0.pdf)
  Manufacturer circuit diagram. Use for: tracing the 5 V and 3.3 V rails, PCM5102A wiring, output filtering, and the DC/DC converter.
- [Texas Instruments PCM5102A datasheet](https://www.ti.com/lit/ds/symlink/pcm5102a.pdf)
  DAC manufacturer reference. Use for: I2S formats, clock behaviour, signal levels, sample sizes, and line-output limits.
- [MicroPython RP2 I2S quick reference](https://docs.micropython.org/en/latest/rp2/quickref.html#i2s-bus)
  Primary software reference. Use for: `machine.I2S`, TX mode, stereo buffers, and the rule that `ws` must be one GPIO number after `sck`.
- [TinyTronics Module13.2 RCA specifications](https://www.tinytronics.nl/en/platforms-and-systems/m5stack/m5core/modules/m5stack-rca-audio-video-module-13.2-for-m5core)
  Supplier electrical specification confirming 5 V operation through the pin header as an alternative to 9-24 V through the DC jack.
- [`shopping-raspberry.md`](shopping-raspberry.md)
  Local source of truth for owned parts and final-instrument constraints.
- [`reference/resistor-colour-codes.html`](reference/resistor-colour-codes.html)
  Local interactive reference. Use for: identifying a resistor from its colour bands, and sizing an LED's current-limiting resistor from supply voltage and forward voltage.

## Wisdom (Communities)

- [Raspberry Pi Forums — Microcontrollers](https://forums.raspberrypi.com/viewforum.php?f=143)
  Official community. Use for: board-specific faults, unusual wiring behaviour, and Pico 2 compatibility questions.
- [Adafruit Discord](https://adafru.it/discord)
  Moderated maker community. Use for: CircuitPython and beginner circuit troubleshooting after checking wiring and official docs.

## Gaps

- Exact manufacturer datasheets for the starter-pack LEDs, buttons, and potentiometers are unknown.
- The final amplifier, powered speaker, or mixer input has not yet been recorded, so its connector and gain requirements remain to be validated.
