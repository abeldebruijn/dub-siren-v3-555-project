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
