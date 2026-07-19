# Digital Dub Siren — Raspberry Pi Pico 2 shopping list

This list matches the revised panel:

- Three large controls: **Pitch**, **Mod Amount**, **Mod Rate**
- Two smaller controls: **Feedback**, **Tempo**
- One five-position **Mod Type** selector
- One momentary **Trigger** button
- One modulation-rate LED
- Eerste prototype: **USB-MIDI naar een Mac**
- Latere standalone uitbreiding: **PCM5102A line-output via RCA of 3,5 mm**

Change `[ ]` to `[x]` after buying an item. Write the actual amount after **Final price**.

Items marked **starter pack** are already supplied by the TinyTronics starter pack. Its two 10 kΩ potentiometers, 12 × 12 mm tactile buttons and assorted button caps are not counted here: the panel design requires shafted panel potentiometers, a panel-mount trigger and matching rotary knobs.

## Development route

Build the instrument first as a class-compliant USB-MIDI controller. The Pico reads all controls and sends MIDI messages through the same USB cable used for power and programming. A synthesizer patch on the Mac generates the oscillator, modulation, delay and feedback, then sends audio through the Mac's headphone socket or audio interface.

```text
Phase 1: controls -> Pico 2 -> USB-MIDI -> Mac synth/patch -> Mac audio output
```

Later, add the PCM5102A and move or copy the sound engine into the Pico firmware. This creates a standalone instrument while allowing USB-MIDI support to remain available.

```text
Phase 2: controls -> Pico 2 sound engine -> PCM5102A -> RCA or 3.5 mm line output
                     |
                     +-> optional USB-MIDI
```

Use USB-MIDI rather than a custom USB-serial protocol. macOS music applications can recognize class-compliant USB-MIDI directly; a serial protocol would require a separate translation application on the Mac.

## How the final standalone chain works

The five potentiometers produce control voltages. The CD74HC4051 selects one control at a time because the Pico does not expose enough analogue inputs for all five. During phase 1, the Pico converts the controls into USB-MIDI messages and the Mac generates the audio. During phase 2, the Pico also generates the oscillator and modulation in software and calculates delay and feedback. Digital audio then travels over I²S to the PCM5102A DAC. The DAC converts it to analogue stereo line-level audio for a mixer, amplifier or powered speaker through RCA or 3.5 mm.

```text
5 pots -> CD74HC4051 -> Pico 2 sound engine -> PCM5102A DAC -> RCA/3.5 mm output
                         ^
5-position selector -----|
trigger button -----------|
                         +-> modulation-rate LED
```

## Processor and control-input parts

- [x] **1 × Raspberry Pi Pico 2 H — approximately €6–€8**
  - Specification: RP2350 board without wireless, with headers already soldered.
  - Why needed: this is the instrument's brain. It reads the controls, generates the oscillator, applies the selected modulation, runs the delay and controls the LED.
  - Why Pico 2 rather than Pico 1: its 520 KB RAM gives substantially more room for the delay buffer, and its faster processors provide more DSP headroom.
  - Where: [www.kiwi-electronics.com/nl/raspberry-pi-pico-10494](http://www.kiwi-electronics.com/nl/raspberry-pi-pico-10494)
  - Final price: € 6.15 + 4.22 shipping

- [x] **1 × CD74HC4051E or 74HC4051 analogue multiplexer — approximately €1–€2**
  - Specification: DIP-16 through-hole package; must work at 3.3 V.
  - Why needed: the Pico board has only three exposed ADC inputs, but this panel has five analogue potentiometers. The 4051 connects each pot to one Pico ADC input in rapid succession.
  - Buy: [TME search](https://www.tme.eu/nl/katalog/?search=74HC4051%20DIP) / [DigiKey search](https://www.digikey.nl/en/products?keywords=CD74HC4051E)
  - Where: https://www.tme.eu/nl/details/cd74hc4051e/decoders-multiplexers-schakelaars/texas-instruments/
  - Final price: € 0.643 + shipping

- [x] **1 × TE Connectivity 1-2199298-4 DIP-16 IC socket — €0.27 including VAT**
  - Exact specification: DIP-16, 2.54 mm pin pitch, 7.62 mm row spacing, through-hole/THT, minimum order quantity 1.
  - Compatibility: correct narrow DIP-16 socket for the CD74HC4051E multiplexer specified above.
  - Why useful: protects the multiplexer from soldering heat and allows replacement without desoldering in the permanent perfboard or PCB build.
  - Prototype note: optional on a breadboard; the CD74HC4051E can plug directly into the breadboard.
  - Buy: [TME — TE Connectivity 1-2199298-4](https://www.tme.eu/nl/details/1-2199298-4/standaard-dip-stands/te-connectivity/)
  - Alternative: https://www.tinytronics.nl/nl/componenten/voetjes/16-pins-ic-voet
  - Price checked 19 July 2026: €0.221 excluding VAT, approximately €0.27 including 21% VAT; shipping excluded. TME listed 4,627 in stock.
  - Final price: €0.27

## Five continuous controls

- [x] **5 × B10K linear panel potentiometers — approximately €7–€14 total**
  - Quantity and functions: Pitch, Mod Amount, Mod Rate, Feedback and Tempo.
  - Specification: 10 kΩ linear taper; preferably identical 6 mm shafts so the knobs fit reliably.
  - Why needed: each pot creates a variable voltage between 0 V and 3.3 V. The Pico converts that voltage into the corresponding software control value.
  - Buy: [TinyTronics B10K example](https://www.tinytronics.nl/nl/componenten/weerstanden/potmeters/10k%CF%89-audio-potmeter-1-kanaals-lineair) / [TME search](https://www.tme.eu/nl/katalog/potentiometers_100028/?search=10k%20linear%20panel)
  - Where: https://www.tinytronics.nl/nl/componenten/weerstanden/potmeters/10k%CF%89-audio-potmeter-1-kanaals-lineair
  - Final price: € 4.00 + shipping

- [x] **3 × large knob caps — approximately €3–€7 total**
  - Functions: Pitch, Mod Amount and Mod Rate.
  - Specification: fits the chosen potentiometer shaft; about 30–40 mm diameter to match the sketch.
  - Why needed: provides the three main controls with a broad, precise movement and clear visual hierarchy.
  - Buy: [TinyTronics knobs](https://www.tinytronics.nl/nl/componenten/weerstanden/potmeters/knoppen) / [TME knobs](https://www.tme.eu/nl/katalog/knoppen_100076/)
  - Final price: €2,70 (total) + shipping

- [x] **2 × small knob caps — approximately €2–€5 total**
  - Functions: Feedback and Tempo.
  - Specification: fits the same pot shaft; about 18–25 mm diameter.
  - Why needed: operates the two delay controls while keeping them visually secondary to the main siren controls.
  - Buy: [TinyTronics knobs](https://www.tinytronics.nl/nl/componenten/weerstanden/potmeters/knoppen) / [TME knobs](https://www.tme.eu/nl/katalog/knoppen_100076/)
  - Final price: €1,00 (total) + shipping

## Mode, trigger and indication

- [x] **1 × Lorlin CK1050 rotary selector switch — approximately €4–€5**
  - Specification: `2P6T`, six latching positions, panel mount, with an adjustable rotation limiter. Set the supplied limiter to five positions and use one pole as the required `1P5T` selector; leave the second pole unconnected.
  - Mechanical details: 30° between positions, 6 mm smooth shaft, 50 mm shaft length, Ø10 mm mounting hole and M10 × 0.75 mounting thread. PCB terminals; solder short wires to them for panel wiring.
  - Why needed: tells the Pico which modulation shape to use. Suggested modes: rising saw, falling saw, triangle, sine and square.
  - Wiring plan: connect the common contact to ground and the five position contacts to five Pico GPIO inputs using internal pull-ups. This gives an unambiguous selection without extra resistors.
  - Buy: [TME — Lorlin CK1050](https://www.tme.eu/nl/details/ck1050/draaischakelaars/lorlin/)
  - Availability checked 19 July 2026: TME listed more than 7,000 in stock. TinyTronics and Kiwi Electronics did not show a suitable mechanical 4-, 5- or 6-position rotary selector.
  - Final price: € 3.23 + shipping

- [x] **1 × selector knob cap — approximately €1–€3**
  - Specification: must fit the rotary switch shaft; use a pointer-style knob so the active symbol is obvious.
  - Why needed: lets the user select and see the active modulation shape.
  - Buy: [TinyTronics knobs](https://www.tinytronics.nl/nl/componenten/weerstanden/potmeters/knoppen) / [TME knobs](https://www.tme.eu/nl/katalog/knoppen_100076/)
  - Where: TinyTronics
  - Final price: €0,75 + shipping

- [x] **1 × normally-open momentary panel button — approximately €1–€4**
  - Specification: `SPST-NO`, momentary action; choose the desired cap size and colour.
  - Why needed: starts or gates the siren only while pressed. It connects a Pico GPIO to ground; the Pico's internal pull-up avoids an external resistor.
  - Buy: [TME PS-05/B example](https://www.tme.eu/nl/details/ps-05_b/standaardschakelaars/) / [TinyTronics switches](https://www.tinytronics.nl/nl/schakelaars)
  - Where: https://www.tme.eu/nl/details/ps-05_b/standaardschakelaars/
  - Final price: €

- [x] **1 × 5 mm LED — included in starter pack**
  - Specification: any colour; the orange/red shown in the sketch is suitable.
  - Why needed: flashes at the Mod Rate, making the low-frequency modulation speed visible even before the audio is connected.
  - Buy: [TinyTronics LEDs](https://www.tinytronics.nl/nl/componenten/leds/standaard-leds) / [TME search](https://www.tme.eu/nl/katalog/leds_100684/?search=5mm%20LED)
  - Final price: €0 (starter pack)

- [x] **1 × 1 kΩ resistor — included in starter pack**
  - Specification: ¼ W through-hole resistor. The included 1 kΩ value replaces the originally proposed 330 Ω value; it gives a dimmer but safe indicator LED at 3.3 V.
  - Why needed: limits current through the LED and protects both the LED and Pico GPIO.
  - Final price: €0 (starter pack)

## Phase 1 — USB-MIDI output

- [x] **1 x Raspberry Pi Pico 2 H USB connection — already included**
  - The Pico firmware presents itself to macOS as a class-compliant USB-MIDI device.
  - Suggested messages: Trigger = Note On/Off; Pitch = Pitch Bend; continuous controls = MIDI CC; Mod Type = Program Change or CC values 0–4.
  - Keep the modulation-rate LED under local Pico control so it works without depending on the Mac display.

- [x] **1 x micro-USB data cable — approximately EUR 3–EUR 8, if not already owned**
  - Specification: micro-USB to the connector required by the Mac or USB hub; it must support data, not charging only.
  - Why needed: powers and programs the Pico and carries USB-MIDI simultaneously.
  - Final price: EUR 0

The Mac needs a synth or patch made in software such as GarageBand, Logic, Ableton Live, Pure Data or Max. MIDI itself contains control messages, not audio.

## Phase 2 — optional standalone RCA or 3.5 mm output

Reserve three Pico GPIO pins for the future I²S connection. Proposed allocation: `GP10 = BCLK`, `GP11 = LRCLK` and `GP12 = DATA`. Confirm this allocation against the selected firmware library before permanent soldering.

- [ ] **1 × PCM5102A I²S DAC module — approximately €6–€12**
  - Specification: accepts 3.3 V I²S signals and exposes `LOUT`, `ROUT` and `GND` pins for the RCA route. A fitted stereo 3.5 mm jack is useful but optional. Verify the module's supply-voltage instructions before wiring it.
  - Why needed: the Pico creates digital samples but has no proper analogue audio output. The DAC converts those samples into clean stereo line-level audio.
  - Buy: [TinyTronics product information](https://www.tinytronics.nl/en/pcm5102-dac-audio-decoder-i2s) / [DigiKey search](https://www.digikey.nl/en/products?keywords=PCM5102A%20module) / [Amazon.nl search](https://www.amazon.nl/s?k=PCM5102A+I2S+DAC)
  - Final price: €

Choose one primary output route:

### Route A — stereo RCA output

```text
PCM5102A LOUT  -> white RCA centre pin
PCM5102A ROUT  -> red RCA centre pin
PCM5102A GND   -> both RCA outer contacts
```

- [ ] **1 × red/white panel-mount RCA socket pair — approximately €2–€7**
  - Specification: female RCA/phono sockets; preferably an insulated pair so the audio ground does not unintentionally connect to a metal enclosure.
  - Why needed: provides standard left/right line outputs for a mixer, amplifier or powered speakers.
  - Mark white as left and red as right.
  - Final price: €

- [ ] **Approximately 30–50 cm shielded stereo audio wire — approximately €1–€4**
  - Connect both shields/returns to `GND` at the DAC. Keep these wires short and away from USB, LED and digital clock wiring.
  - Final price: €

- [ ] **1 × stereo RCA cable — approximately €4–€10, if not already owned**
  - Select RCA-to-RCA or RCA-to-6.35 mm depending on the destination equipment.
  - Final price: €

### Route B — stereo 3.5 mm output

- [ ] **1 × 3.5 mm stereo audio cable — approximately €3–€7**
  - Specification: TRS male-to-male, or the cable required by the destination mixer/amplifier.
  - Why needed: carries the DAC's analogue line output to a mixer, powered speaker or amplifier.
  - Buy: [Thomann](https://www.thomann.de/nl/mini_jack_kabels.html) / [Amazon.nl search](https://www.amazon.nl/s?k=3.5mm+stereo+audio+kabel)
  - Final price: €

The PCM5102A is normally unbalanced line-level. Neither RCA nor 3.5 mm drives a passive speaker, and the output may not drive headphones properly. Use a mixer, powered speaker or external amplifier.

The DAC and output-connector items are not required for the phase-1 USB-MIDI prototype. Purchase them when standalone audio is implemented. Both connector types can be fitted in parallel, but treat them as duplicate line outputs and normally connect only one destination at a time.

## Power stability and wiring

- [x] **1 × 100 nF ceramic capacitor — approximately €0.10–€0.50**
  - Why needed: sits beside the 4051 power pins and absorbs fast electrical noise caused by digital switching, preventing unstable knob readings.
  - Buy: [TME search](https://www.tme.eu/nl/katalog/keramische-condensatoren_100126/?search=100nF) / [DigiKey search](https://www.digikey.nl/en/products?keywords=100nF%20ceramic%20through%20hole)
  - Where: https://www.tme.eu/nl/en/details/k104k10x7rf5ul2/ceramic-capacitors/vishay/
  - Final price: €0.20

- [x] **1 × 10 µF electrolytic capacitor — approximately €0.10–€0.50**
  - Specification: radial, rated for at least 10 V.
  - Why needed: smooths slower variations on the breadboard's 3.3 V supply rail and helps keep control readings and audio stable.
  - Buy: [TME search](https://www.tme.eu/nl/katalog/elektrolytische-condensatoren_100243/?search=10uF%2025V) / [DigiKey search](https://www.digikey.nl/en/products?keywords=10uF%2025V%20radial)
  - Where: https://www.tme.eu/nl/en/details/eeefn1a100r/smd-electrolytic-capacitors/panasonic/
  - Final price: €

- [x] **1 × full-size breadboard — approximately €5–€9**
  - Specification: about 830 tie points with continuous power rails preferred.
  - Why needed: holds the Pico, 4051 and supporting parts during development without soldering.
  - Buy: [TinyTronics breadboards](https://www.tinytronics.nl/nl/gereedschap-en-montage/prototyping/breadboards) / [Kiwi Electronics search](https://www.kiwi-electronics.com/nl/zoeken?search=breadboard)
  - Where: https://www.tinytronics.nl/nl/gereedschap-en-montage/prototyping-toebehoren/breadboards/breadboard-830-points?sort=p.price&order=ASC
  - Final price: € 3.00 + shipping

- [x] **1 mixed set of Dupont jumper wires — approximately €3–€7**
  - Specification: male-to-male and female-to-male wires; obtain at least 40 pieces.
  - Why needed: connects the breadboard, panel controls, selector, trigger, LED and DAC. Female ends fit module headers; male ends fit the breadboard.
  - Buy: [TinyTronics jumper wires](https://www.tinytronics.nl/nl/kabels-en-connectoren/kabels/jumper-wires) / [Kiwi Electronics search](https://www.kiwi-electronics.com/nl/zoeken?search=jumper%20wires)
  - Where: https://www.tinytronics.nl/nl/kabels-en-connectoren/kabels/jumper-wires
  - Final price: €2.75 + shipping

## Solder-free prototype limitation

The Pico 2 H and most DAC modules already have headers and fit jumper wires. Panel potentiometers, the rotary selector, button and LED usually have solder lugs or bare pins. For the first solder-free prototype, add one of these connection methods:

- [x] **Screw-terminal/Dupont adapters and short stripped wires — €8–€15**

These temporary connections are less reliable than soldering. A permanent enclosure build will require solder joints, crimp connectors or a custom control PCB.

## Expected cost

- Phase-1 electronics and controls: approximately **€23–€43**
- Breadboard, wiring and USB data cable: approximately **€10–€22**
- Optional phase-2 DAC with 3.5 mm route: approximately **€9–€19**
- Optional phase-2 DAC with RCA route: approximately **€13–€33**
- Optional USB power adapter: approximately **€0–€10**
- One Dutch shipment: allow approximately **€5–€8**
- **Expected phase-1 prototype total: approximately €38–€83**
- **Expected complete standalone total after phase 2: approximately €47–€116**, depending on output route

The upper end assumes individually purchased panel controls and temporary solder-free adapters. Ordering most small parts from one supplier should keep the build closer to the lower half of the range.

## Final-price checklist

- Processor and input electronics: €
- Five potentiometers and five control knobs: €
- Five-position selector and selector knob: €
- Trigger and LED: €
- USB data cable: €
- Later: PCM5102A and selected RCA/3.5 mm output parts: €
- Breadboard, wiring and power: €
- Shipping: €
- **Grand total: €**


18.46 EUR + €20.85 + € 4,22

## Software and equipment already required

- A Mac with USB for programming and running the phase-1 sound engine.
- Free Arduino IDE with Pico support or the Raspberry Pi Pico C/C++ SDK, including USB-MIDI support.
- A Mac synth/patch and audio output, headphones or an audio interface for phase 1.
- For phase 2 only: a mixer, powered speaker or amplifier with a suitable line input.
- No microSD card, operating system or paid software is required.
