# Dub Siren V3 — 555 Project

DIY analog dub siren based on [Lonesoulsurfer's Instructables project](https://www.instructables.com/Dub-Siren-V3-555-Project/).

## What is a dub siren?

A dub siren is a small electronic sound-effects instrument used in dub and reggae. It produces sweeping sirens, pulses, bleeps, drones, and long tones. The performer changes the sound live with potentiometers and switches; echo or reverb gives it the characteristic spacious dub sound.

## How this version works

The core circuit uses:

- two 555 timer ICs as adjustable oscillators;
- an LM741 operational amplifier for signal control;
- potentiometers to vary pitch, speed, and modulation;
- switches and a momentary button to select or trigger sounds;
- an LED to show the pulse rate;
- an LM386-based audio stage to drive the output;
- an optional ready-made echo/reverb module;
- a speaker and/or audio output for an amplifier or mixer.

One slow oscillator modulates the audio oscillator. Changing their timing resistance and capacitance creates different rhythms and pitch sweeps. The audio stage makes the generated signal usable with a speaker or external sound system.

## Project goal

Build and understand the instrument ourselves, in stages:

1. Review the schematic and bill of materials.
2. Prototype and test each circuit section safely.
3. Assemble the dub-siren PCB.
4. Add controls, audio output, amplification, and optional reverb.
5. Fit everything into an enclosure.
6. Test, troubleshoot, and document modifications.

## Repository status

This repository is the working record for our build. Schematics, parts lists, PCB files, wiring notes, test results, enclosure plans, and photos will be added as the project develops.

## Safety

This is a low-voltage electronics project, but incorrect wiring can damage components, batteries, amplifiers, or headphones. Verify polarity and supply voltage before applying power. Test at low volume first; siren tones can be unexpectedly loud. Never connect the speaker-level output directly to a mixer or other line-level input.

## Credit

Original design and build guide: [Dub Siren V3 — 555 Project on Instructables](https://www.instructables.com/Dub-Siren-V3-555-Project/). This repository is an independent personal build based on that guide.

## Parts and buying guide

Research checked **18 July 2026**, for delivery in the Netherlands. Prices and stock change; verify the basket before paying. Estimates include 21% VAT where the seller publishes a Dutch gross price. Enclosure, PCB manufacture, tools, solder, hookup wire, knobs, power supply/battery and audio sockets are excluded.

### BOM check before ordering

The image/PDF list and the Eagle assembly export do not fully agree:

- The image says **47 nF × 2**; the PCB export says **47 nF × 1 plus 100 nF × 1** (`47NF1` is the confusing reference designator). Follow the PCB value/schematic: buy both 47 nF and 100 nF. Confirm against the board silkscreen before soldering.
- The image says polyester film capacitors. The PCB footprint is 5 mm pitch, maximum body about 2.4 × 4.4 mm. Check dimensions, not only capacitance.
- The five PCB pots have a specific footprint: **Bourns PTD901-2015K-B503**, 50 kΩ linear, 9 mm, side-adjust, 15 mm shaft. A generic panel pot will not necessarily fit.
- `B2B-PH-K-S × 8` means only the PCB headers. For removable leads also buy **PHR-2 housings × 8** and **SPH-002T-P0.5S crimp contacts × 16–20**. Crimping these without the correct tool is awkward; pre-crimped JST-PH leads are a practical alternative.
- The two extra 50 kΩ pots are for the reverb-module modification and are not mounted on the siren PCB.

### Purchase list

The first link is the preferred distributor search/product; the alternative lets you compare the same item. Prices are realistic small-quantity allowances, not guaranteed quotes.

| Part | Qty to buy | Recommended specification / part | TME allowance | DigiKey alternative |
|---|---:|---|---:|---|
| Film capacitor 47 nF | 1 | 50 V+, 5 mm pitch, body fits PCB | €0.20 | €0.35 |
| Film capacitor 100 nF | 1 | 50 V+, 5 mm pitch, body fits PCB | €0.20 | €0.35 |
| Film capacitor 150 nF | 1 | 50 V+, 5 mm pitch, body fits PCB | €0.25 | €0.40 |
| Electrolytic capacitors | 1 each | 10 µF, 47 µF, 100 µF, 220 µF; radial, 16 V+; check diameter | €1.00 | €1.50 |
| ¼ W resistors | 10 | 10 Ω ×1, 560 Ω ×3, 2.2 kΩ ×2, 4.7 kΩ ×1, 10 kΩ ×2, 68 kΩ ×1 | €0.70 | €1.20 |
| Timer | 2 | [NE555P, DIP-8](https://www.tme.eu/nl/details/ne555p/watchdog-en-reset-circuits/texas-instruments/) | €1.02 | [NE555P search](https://www.digikey.nl/en/products?keywords=NE555P), about €1.40 |
| Op amp | 1 | [UA741CP, DIP-8](https://www.tme.eu/nl/details/ua741cp/operationele-versterkers-tht/texas-instruments/) | €0.65 | [UA741CP search](https://www.digikey.nl/en/products?keywords=UA741CP), about €0.70 |
| Audio amplifier | 1 | [LM386N-1/NOPB, DIP-8](https://www.tme.eu/nl/details/lm386n-1_nopb/audio-versterkers/texas-instruments/) | €1.35 | [LM386N-1/NOPB search](https://www.digikey.nl/en/products?keywords=LM386N-1%2FNOPB), about €1.55 |
| NPN transistor | 1 | 2N3904, TO-92; verify E-B-C orientation | €0.15 | [TinyTronics 2N3904](https://www.tinytronics.nl/nl/schakelaars/transistoren-en-mosfet%27s/transistoren/npn-transistor-2n3904), €0.15 |
| PCB potentiometer | 5 | [PTD901-2015K-B503](https://www.digikey.nl/en/products/detail/bourns-inc/PTD901-2015K-B503/3781003), exact footprint | — | €8.30 total |
| Reverb potentiometer | 2 | 50 kΩ linear, single-gang panel pot; physical style is flexible | €2.50 | about €3.30 |
| JST-PH PCB header | 8 | B2B-PH-K-S, 2-pin, 2.0 mm pitch | €2.00 | about €2.40 |
| JST-PH housing + contacts | 8 + 20 | PHR-2 + SPH-002T-P0.5S, or eight pre-crimped pairs | €3.50 | about €4.50 |
| LED + 2-pin header | 1 each | 5 mm LED plus 2.54 mm 1×2 straight header | €0.35 | about €0.55 |
| Momentary switch | 1 | Normally-open panel pushbutton; electrical rating not critical at 9–12 V | €1.50 | about €2.50 |
| SPDT switches | 2 | ON-ON panel toggle | €4.00 | about €6.00 |
| Speaker | 1 | 8 Ω, 0.5–1 W minimum; choose diameter after enclosure layout | €3.50 | about €5.00 |
| Reverb board | 1 | Exact-style **PT2399 50 × 50 mm “reverb plate”, 6–15 V, no preamp, R27 and S-G-G pads** | not normally stocked | [Bol listing](https://www.bol.com/nl/nl/p/karzo-echo-reverb-module-pt2399-reverb-bord-zonder-voorversterker-dc-6-15v-compatibel/9300000256858335/), €27.48 delivered |

Useful distributor searches: [TME capacitors](https://www.tme.eu/nl/katalog/condensatoren_112855/), [TME resistors](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/), [TME switches](https://www.tme.eu/nl/katalog/schakelaars-en-controlelampjes_100032/), [DigiKey PTD901 exact pot](https://www.digikey.nl/en/products/detail/bourns-inc/PTD901-2015K-B503/3781003). The exact pot was listed at €1.66 each in single quantity when checked.

Do not substitute the similarly named larger PT2399/NE5532 microphone preamp boards without redesigning power and wiring. The original guide modifies R27 on the small 50 × 50 mm module; the [Bol description of that board](https://www.bol.com/nl/nl/p/pt2399-reverb-module-voor-microfoon-eenvoudige-echo-en-galm-toevoegen/9300000269230153/) also identifies the 6–15 V supply and S-G-G/R27 modification.

### Cost estimates

| Plan | Vendors | Components | Shipping | Estimated delivered total | Trade-off |
|---|---|---:|---:|---:|---|
| **Recommended: EU distributor + exact reverb** | TME/DigiKey + Bol | €36–€43 + €27.48 | €0–€18 distributor; Bol listing includes delivery | **€64–€82** | Traceable components and correct PCB pot; two orders. Add useful spares to make a DigiKey basket €50 and avoid its €18 sub-threshold shipping. |
| **Lowest credible mixed basket** | TME + low-cost marketplace reverb | €36–€43 + €9–€15 | TME €7.14; marketplace often included | **€52–€65** | Best price, but module source/quality and delivery are less predictable. Match the board photo, R27 and S-G-G pads exactly. |
| **Mostly DigiKey, no basket padding** | DigiKey + Bol | about €39 + €27.48 | DigiKey €18; Bol included | **about €84.50** | Easy exact-part ordering, but poor value below DigiKey's free-shipping threshold. |
| **Mostly DigiKey, useful spares** | DigiKey + Bol | €50 basket + €27.48 | €0 + included | **about €77.50** | Spend the shipping charge on spare ICs, capacitors, resistors, JST leads and IC sockets instead. |

TME's cheapest published Netherlands delivery is **€5.90 ex VAT / €7.14 incl. VAT** for up to 15 kg and normally 2–3 working days. DigiKey charges **€18 below €50** and publishes free Netherlands shipping from **€50**. The Bol exact-style module was **€27.48 including delivery** when checked. These rules explain why splitting ordinary passives across several distributors is not economical.

### Recommended ordering strategy

1. Buy the exact five Bourns pots and all ordinary components in one DigiKey order. Bring the basket to €50 with genuinely useful items: four DIP-8 sockets, spare NE555s, spare electrolytics, extra JST contacts/pre-crimp leads, hookup wire and a 9–12 V regulated supply. This costs less than paying €18 shipping on a €39 basket.
2. Buy the exact-style PT2399 reverb plate separately. Bol is expensive but has clear Dutch delivered pricing. A marketplace listing around €9–€15 reduces the build by roughly €12–€18, but compare the PCB photograph carefully.
3. Delay buying the speaker and panel switches until the enclosure/control layout is chosen. Their dimensions matter more than their electrical specifications.
4. Buy DIP-8 sockets for the two NE555s, UA741 and LM386 even though the source BOM omits them. Four sockets should cost roughly €1–€2 and make repair safer.

Expected electronics budget: reserve **€80** for the reliable route, or **€60** if using a carefully matched low-cost reverb module. Add approximately **€5–€15** later if power input, battery holder, line-out jack, speaker wire or knobs are required.
