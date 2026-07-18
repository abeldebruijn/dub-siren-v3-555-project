# Dub Siren V4 shopping list

Check the first column after buying an item: change `[ ]` to `[x]`.

**Do not order the seven PCB potentiometers until their footprint is measured against the V4 board.** The specified Panasonic EVU-F series was discontinued with no official replacement. V4 is easier to wire but currently harder to source exactly than V3.1.

## PCB and fitted components

| Bought | Qty | Component | Required specification | Buy / compare | Notes | Final price |
|---|---:|---|---|---|---|---:|
| [ ] | 1 | Dub Siren V4 PCB | Manufacture from V4 Gerbers | [JLCPCB quote](https://jlcpcb.com/quote/pcbOrderUpload) / [PCBWay quote](https://www.pcbway.com/orderonline.aspx) | Use V4 files, not repository V3.1 files |  |
| [ ] | 1 | Film capacitor | 47 nF, 50 V+, 5 mm lead pitch | [TME search](https://www.tme.eu/nl/katalog/condensatoren_112855/?search=47nF%205mm) / [DigiKey search](https://www.digikey.nl/en/products?keywords=47nF%205mm%20film%20capacitor) | PCB reference `47NF` |  |
| [ ] | 1 | Film capacitor | 100 nF, 50 V+, 5 mm lead pitch | [TME search](https://www.tme.eu/nl/katalog/condensatoren_112855/?search=100nF%205mm) / [DigiKey search](https://www.digikey.nl/en/products?keywords=100nF%205mm%20film%20capacitor) | PCB reference `47NF1` but value is 100 nF |  |
| [ ] | 1 | Film capacitor | 150 nF, 50 V+, 5 mm lead pitch | [TME search](https://www.tme.eu/nl/katalog/condensatoren_112855/?search=150nF%205mm) / [DigiKey search](https://www.digikey.nl/en/products?keywords=150nF%205mm%20film%20capacitor) | Body fits approximately 2.4 × 4.4 mm footprint |  |
| [ ] | 1 each | Electrolytic capacitors | 10 µF, 47 µF, 100 µF and 220 µF; radial, 16–25 V | [TME electrolytics](https://www.tme.eu/nl/katalog/elektrolytische-condensatoren_100243/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=radial%20electrolytic%2025V) | 2.5 mm pitch except 220 µF at 3.5 mm; observe polarity |  |
| [ ] | 1 | Resistor | 10 Ω, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=10R%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=10%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 3 | Resistor | 560 Ω, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=560R%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=560%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 2 | Resistor | 2.2 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=2.2K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=2.2k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 1 | Resistor | 4.7 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=4.7K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=4.7k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 2 | Resistor | 10 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=10K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=10k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 1 | Resistor | 68 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=68K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=68k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 1 | NPN transistor | 2N3904, TO-92 | [TinyTronics](https://www.tinytronics.nl/nl/schakelaars/transistoren-en-mosfet%27s/transistoren/npn-transistor-2n3904) / [DigiKey search](https://www.digikey.nl/en/products?keywords=2N3904%20TO-92) | Verify E-B-C orientation |  |
| [ ] | 2 | Timer IC | NE555P, DIP-8 | [TME](https://www.tme.eu/nl/details/ne555p/watchdog-en-reset-circuits/texas-instruments/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=NE555P) | Same as V3.1 |  |
| [ ] | 1 | Op-amp IC | UA741CP, DIP-8 | [TME](https://www.tme.eu/nl/details/ua741cp/operationele-versterkers-tht/texas-instruments/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=UA741CP) | Same as V3.1 |  |
| [ ] | 1 | Audio-amplifier IC | LM386N-1/NOPB, DIP-8 | [TME](https://www.tme.eu/nl/details/lm386n-1_nopb/audio-versterkers/texas-instruments/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=LM386N-1%2FNOPB) | Same as V3.1 |  |
| [ ] | 4 | IC socket | DIP-8, 2.54 mm pitch | [TME search](https://www.tme.eu/nl/katalog/ic-voeten_100060/?search=DIP8) / [DigiKey search](https://www.digikey.nl/en/products?keywords=DIP-8%20socket) | Recommended; not in source BOM |  |
| [ ] | 1 | LED | 5 mm, any colour | [TinyTronics LEDs](https://www.tinytronics.nl/nl/componenten/leds/standaard-leds) / [TME search](https://www.tme.eu/nl/katalog/leds_100684/?search=5mm%20LED) | Mounted directly on V4 PCB |  |
| [ ] | 7 | PCB potentiometer | 50 kΩ linear, Panasonic EVUF3A footprint | [Discontinuation notice](https://www.ic-components.cz/files/c1/EVU-F3AF30B53.pdf) / [Thonk 9 mm pots](https://www.thonk.co.uk/product-category/parts/potentiometers/) | **STOP: EVU-F family discontinued. Confirm pin/board-lock spacing, shaft and height before choosing substitute** |  |
| [ ] | 6 | JST-PH PCB header | B2B-PH-K-S, 2-pin, 2.0 mm, vertical | [TME search](https://www.tme.eu/nl/katalog/?search=B2B-PH-K-S) / [DigiKey search](https://www.digikey.nl/en/products?keywords=B2B-PH-K-S) | PCB side |  |
| [ ] | 2 | JST-PH PCB header | B3B-PH-K-S, 3-pin, 2.0 mm, vertical | [TME exact part](https://www.tme.eu/nl/details/b3b-ph-k-s/signaalconnectoren-raster-2-00mm/jst/b3b-ph-k-s-lf-sn/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=B3B-PH-K-S) | Echo and reverb inputs |  |
| [ ] | 2 | PCB toggle switch | SPDT ON-ON matching `TL36PO / TL3XPO` footprint | [TME SPDT search](https://www.tme.eu/nl/katalog/tuimelschakelaars_100061/?search=SPDT%20ON-ON%20PCB) / [DigiKey search](https://www.digikey.nl/en/products?keywords=SPDT%20ON-ON%20PC%20pin%20toggle) | Confirm pin pitch and mounting holes from V4 PCB before buying |  |
| [ ] | 1 | PCB audio jack | WQP-PJ301M-12 / compatible Thonkiconn, 3.5 mm mono switched | [Thonk exact family](https://www.thonk.co.uk/shop/thonkiconn/) / [JLCPCB part](https://jlcpcb.com/partdetail/JLCPCBAssembly-WQP_PJ301M12/C9900080080) | Newer PJ398SM/WQP518MA may fit; compare footprint |  |

## Connector mates and external parts

| Bought | Qty | Component | Required specification | Buy / compare | Notes | Final price |
|---|---:|---|---|---|---|---:|
| [ ] | 6 | JST-PH housing | PHR-2, 2-pin | [TME exact part](https://www.tme.eu/nl/details/phr-2/signaalconnectoren-raster-2-00mm/jst/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=PHR-2) | Cable side |  |
| [ ] | 2 | JST-PH housing | PHR-3, 3-pin | [TME search](https://www.tme.eu/nl/katalog/?search=PHR-3) / [DigiKey search](https://www.digikey.nl/en/products?keywords=PHR-3) | Cable side |  |
| [ ] | 24 | JST-PH crimp contact | SPH-002T-P0.5S, 24–30 AWG | [TME exact part](https://www.tme.eu/nl/details/sph-002t-p0.5s/signaalconnectoren-raster-2-00mm/jst/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=SPH-002T-P0.5S) | Includes spares; pre-crimped leads are easier |  |
| [ ] | 7 | Knob | Fits final potentiometer shafts | [TinyTronics knobs](https://www.tinytronics.nl/nl/componenten/weerstanden/potmeters/knoppen) / [TME knobs](https://www.tme.eu/nl/katalog/knoppen_100076/) | Do not order before selecting pots |  |
| [ ] | 1 | Momentary pushbutton | Normally open, panel mount | [TME search](https://www.tme.eu/nl/katalog/schakelaars_100056/?search=momentary%20pushbutton%20NO) / [TinyTronics switches](https://www.tinytronics.nl/nl/schakelaars) | V4 still has `MOMENTARY-SW` connector |  |
| [ ] | 1 | Speaker | 8 Ω, 0.5–1 W or higher | [TME search](https://www.tme.eu/nl/katalog/luidsprekers_100165/?search=8ohm%201W) / [TinyTronics search](https://www.tinytronics.nl/nl/index.php?route=product%2Fsearch&search=8%20ohm%20speaker) | Choose size after enclosure layout |  |
| [ ] | 1 | PT2399 reverb board | 50 × 50 mm, 6–15 V, R27 and S-G-G pads, no preamp | [Bol exact-style listing](https://www.bol.com/nl/nl/p/karzo-echo-reverb-module-pt2399-reverb-bord-zonder-voorversterker-dc-6-15v-compatibel/9300000256858335/) / [Bol description](https://www.bol.com/nl/nl/p/pt2399-reverb-module-voor-microfoon-eenvoudige-echo-en-galm-toevoegen/9300000269230153/) | Still external; V4 integrates its two controls |  |
| [ ] | 1 | Regulated power supply | 9–12 V DC, at least 500 mA | [TinyTronics adapters](https://www.tinytronics.nl/nl/voedingen/netvoedingen) / [TME search](https://www.tme.eu/nl/katalog/stekkervoedingen_100325/?search=12V%201A) | Match polarity to chosen socket |  |
| [ ] | 1 | Power socket | Matches selected supply | [TME DC sockets](https://www.tme.eu/nl/katalog/dc-voedingsconnectoren_112914/) / [TinyTronics connectors](https://www.tinytronics.nl/nl/kabels-en-connectoren/connectoren) | V4 `PWR` connector is internal |  |
| [ ] | 1 roll | Hookup wire | Stranded, 24–26 AWG, several colours | [TME equipment wire](https://www.tme.eu/nl/katalog/montagedraden_100532/) / [TinyTronics wire](https://www.tinytronics.nl/nl/kabels-en-connectoren/kabels) | Less panel wiring than V3.1 |  |

## Important

- V4 uses the same standard electrical core as V3.1. Its sourcing risk is mechanical: seven obsolete-footprint pots and two vaguely specified PCB switches.
- Do not assume any generic 9 mm 50 kΩ pot or SPDT switch is a drop-in fit.
- The PCB, enclosure, soldering tools and mechanical hardware are separate purchases.
