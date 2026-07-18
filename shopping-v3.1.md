# Dub Siren V3.1 shopping list

Check the first column after buying an item: change `[ ]` to `[x]`.

Preferred strategy: consolidate standard parts at [TME](https://www.tme.eu/nl/) or [DigiKey Netherlands](https://www.digikey.nl/). Prices and stock checked/researched July 2026. Verify dimensions and availability before payment.

## PCB and fitted components

| Bought | Qty | Component | Required specification | Buy / compare | Notes | Final price |
|---|---:|---|---|---|---|---:|
| [ ] | 1 | Dub Siren V3.1 PCB | Manufacture from repository Gerbers | [JLCPCB quote](https://jlcpcb.com/quote/pcbOrderUpload) / [PCBWay quote](https://www.pcbway.com/orderonline.aspx) | Bare PCB, not enclosure |  |
| [ ] | 1 | Film capacitor | 47 nF, 50 V+, 5 mm lead pitch | [TME search](https://www.tme.eu/nl/katalog/condensatoren_112855/?search=47nF%205mm) / [DigiKey search](https://www.digikey.nl/en/products?keywords=47nF%205mm%20film%20capacitor) | PCB reference `47NF` |  |
| [ ] | 1 | Film capacitor | 100 nF, 50 V+, 5 mm lead pitch | [TME search](https://www.tme.eu/nl/katalog/condensatoren_112855/?search=100nF%205mm) / [DigiKey search](https://www.digikey.nl/en/products?keywords=100nF%205mm%20film%20capacitor) | PCB export value; confusing reference `47NF1` |  |
| [ ] | 1 | Film capacitor | 150 nF, 50 V+, 5 mm lead pitch | [TME search](https://www.tme.eu/nl/katalog/condensatoren_112855/?search=150nF%205mm) / [DigiKey search](https://www.digikey.nl/en/products?keywords=150nF%205mm%20film%20capacitor) | Body must fit approximately 2.4 × 4.4 mm footprint |  |
| [ ] | 1 | Electrolytic capacitor | 10 µF, radial, 16–25 V, 2.5 mm pitch | [TME search](https://www.tme.eu/nl/katalog/elektrolytische-condensatoren_100243/?search=10uF%2025V%20radial) / [DigiKey search](https://www.digikey.nl/en/products?keywords=10uF%2025V%20radial) | Observe polarity |  |
| [ ] | 1 | Electrolytic capacitor | 47 µF, radial, 16–25 V, 2.5 mm pitch | [TME search](https://www.tme.eu/nl/katalog/elektrolytische-condensatoren_100243/?search=47uF%2025V%20radial) / [DigiKey search](https://www.digikey.nl/en/products?keywords=47uF%2025V%20radial) | Maximum body about 5 mm |  |
| [ ] | 1 | Electrolytic capacitor | 100 µF, radial, 16–25 V, 2.5 mm pitch | [TME search](https://www.tme.eu/nl/katalog/elektrolytische-condensatoren_100243/?search=100uF%2025V%20radial) / [DigiKey search](https://www.digikey.nl/en/products?keywords=100uF%2025V%20radial) | Maximum body about 6 mm |  |
| [ ] | 1 | Electrolytic capacitor | 220 µF, radial, 16–25 V, 3.5 mm pitch | [TME search](https://www.tme.eu/nl/katalog/elektrolytische-condensatoren_100243/?search=220uF%2025V%20radial) / [DigiKey search](https://www.digikey.nl/en/products?keywords=220uF%2025V%20radial) | Maximum body about 8 mm |  |
| [ ] | 1 | Resistor | 10 Ω, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=10R%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=10%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 3 | Resistor | 560 Ω, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=560R%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=560%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 2 | Resistor | 2.2 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=2.2K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=2.2k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 1 | Resistor | 4.7 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=4.7K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=4.7k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 2 | Resistor | 10 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=10K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=10k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 1 | Resistor | 68 kΩ, ¼ W, axial | [TME search](https://www.tme.eu/nl/katalog/tht-weerstanden_100026/?search=68K%200.25W) / [DigiKey search](https://www.digikey.nl/en/products?keywords=68k%20ohm%200.25W%20axial) | 1% metal film preferred |  |
| [ ] | 1 | NPN transistor | 2N3904, TO-92 | [TinyTronics](https://www.tinytronics.nl/nl/schakelaars/transistoren-en-mosfet%27s/transistoren/npn-transistor-2n3904) / [DigiKey search](https://www.digikey.nl/en/products?keywords=2N3904%20TO-92) | Verify E-B-C orientation |  |
| [ ] | 2 | Timer IC | NE555P, DIP-8 | [TME](https://www.tme.eu/nl/details/ne555p/watchdog-en-reset-circuits/texas-instruments/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=NE555P) | Buy one spare if convenient |  |
| [ ] | 1 | Op-amp IC | UA741CP, DIP-8 | [TME](https://www.tme.eu/nl/details/ua741cp/operationele-versterkers-tht/texas-instruments/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=UA741CP) | `UA741P` equivalent package |  |
| [ ] | 1 | Audio-amplifier IC | LM386N-1/NOPB, DIP-8 | [TME](https://www.tme.eu/nl/details/lm386n-1_nopb/audio-versterkers/texas-instruments/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=LM386N-1%2FNOPB) | Drives small speaker |  |
| [ ] | 4 | IC socket | DIP-8, 2.54 mm pitch | [TME search](https://www.tme.eu/nl/katalog/ic-voeten_100060/?search=DIP8) / [DigiKey search](https://www.digikey.nl/en/products?keywords=DIP-8%20socket) | Recommended; not in source BOM |  |
| [ ] | 5 | PCB potentiometer | Bourns PTD901-2015K-B503, 50 kΩ linear | [DigiKey exact part](https://www.digikey.nl/en/products/detail/bourns-inc/PTD901-2015K-B503/3781003) / [Mouser search](https://www.mouser.nl/c/?q=PTD901-2015K-B503) | Exact V3.1 PCB footprint |  |
| [ ] | 8 | JST-PH PCB header | B2B-PH-K-S, 2-pin, 2.0 mm, vertical | [TME search](https://www.tme.eu/nl/katalog/?search=B2B-PH-K-S) / [DigiKey search](https://www.digikey.nl/en/products?keywords=B2B-PH-K-S) | PCB side |  |
| [ ] | 1 | Pin header | 1×2, 2.54 mm, straight | [TME search](https://www.tme.eu/nl/katalog/pin-headers_112936/?search=1x2%202.54mm) / [DigiKey search](https://www.digikey.nl/en/products?keywords=1x2%202.54mm%20pin%20header) | LED connection |  |

## Connector mates, controls and audio

| Bought | Qty | Component | Required specification | Buy / compare | Notes | Final price |
|---|---:|---|---|---|---|---:|
| [ ] | 8 | JST-PH housing | PHR-2, 2-pin | [TME exact part](https://www.tme.eu/nl/details/phr-2/signaalconnectoren-raster-2-00mm/jst/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=PHR-2) | Cable side |  |
| [ ] | 20 | JST-PH crimp contact | SPH-002T-P0.5S, 24–30 AWG | [TME exact part](https://www.tme.eu/nl/details/sph-002t-p0.5s/signaalconnectoren-raster-2-00mm/jst/) / [DigiKey search](https://www.digikey.nl/en/products?keywords=SPH-002T-P0.5S) | Easier alternative: pre-crimped JST-PH leads |  |
| [ ] | 1 | LED | 5 mm, any colour | [TinyTronics LEDs](https://www.tinytronics.nl/nl/componenten/leds/standaard-leds) / [TME search](https://www.tme.eu/nl/katalog/leds_100684/?search=5mm%20LED) | Use with PCB LED header |  |
| [ ] | 2 | Reverb potentiometer | 50 kΩ linear, single-gang panel type | [TME search](https://www.tme.eu/nl/katalog/potmeters_24/?search=50k%20linear) / [DigiKey search](https://www.digikey.nl/en/products?keywords=50k%20linear%20panel%20potentiometer) | Echo and reverb controls |  |
| [ ] | 7 | Knob | Fits selected 6 mm shafts | [TinyTronics knobs](https://www.tinytronics.nl/nl/componenten/weerstanden/potmeters/knoppen) / [TME knobs](https://www.tme.eu/nl/katalog/knoppen_100076/) | Five siren + two reverb |  |
| [ ] | 1 | Momentary pushbutton | Normally open, panel mount | [TME search](https://www.tme.eu/nl/katalog/schakelaars_100056/?search=momentary%20pushbutton%20NO) / [TinyTronics switches](https://www.tinytronics.nl/nl/schakelaars) | Trigger control |  |
| [ ] | 2 | Toggle switch | SPDT, ON-ON, panel mount | [TME search](https://www.tme.eu/nl/katalog/tuimelschakelaars_100061/?search=SPDT%20ON-ON) / [DigiKey search](https://www.digikey.nl/en/products?keywords=SPDT%20ON-ON%20toggle) | Modulation and continuous/on-off function |  |
| [ ] | 1 | Speaker | 8 Ω, 0.5–1 W or higher | [TME search](https://www.tme.eu/nl/katalog/luidsprekers_100165/?search=8ohm%201W) / [TinyTronics search](https://www.tinytronics.nl/nl/index.php?route=product%2Fsearch&search=8%20ohm%20speaker) | Choose diameter after enclosure layout |  |
| [ ] | 1 | PT2399 reverb board | 50 × 50 mm, 6–15 V, R27 and S-G-G pads, no preamp | [Bol exact-style listing](https://www.bol.com/nl/nl/p/karzo-echo-reverb-module-pt2399-reverb-bord-zonder-voorversterker-dc-6-15v-compatibel/9300000256858335/) / [Bol description](https://www.bol.com/nl/nl/p/pt2399-reverb-module-voor-microfoon-eenvoudige-echo-en-galm-toevoegen/9300000269230153/) | Match board photograph exactly |  |
| [ ] | 1 | Regulated power supply | 9–12 V DC, at least 500 mA | [TinyTronics adapters](https://www.tinytronics.nl/nl/voedingen/netvoedingen) / [TME search](https://www.tme.eu/nl/katalog/stekkervoedingen_100325/?search=12V%201A) | Match polarity to chosen socket |  |
| [ ] | 1 | Power socket | Matches selected supply | [TME DC sockets](https://www.tme.eu/nl/katalog/dc-voedingsconnectoren_112914/) / [TinyTronics connectors](https://www.tinytronics.nl/nl/kabels-en-connectoren/connectoren) | Add strain relief |  |
| [ ] | 1 | Audio output socket | 3.5 mm or 6.35 mm, panel mount | [TME audio sockets](https://www.tme.eu/nl/katalog/jack-connectoren_112938/) / [Thonk jacks](https://www.thonk.co.uk/product-category/parts/jacks/) | Optional external amp/mixer output |  |
| [ ] | 1 roll | Hookup wire | Stranded, 24–26 AWG, several colours | [TME equipment wire](https://www.tme.eu/nl/katalog/montagedraden_100532/) / [TinyTronics wire](https://www.tinytronics.nl/nl/kabels-en-connectoren/kabels) | Use shielded cable for long audio runs |  |

## Important

- The source image says `47 nF × 2`; the Eagle V3.1 export says `47 nF × 1` and `100 nF × 1`. This list follows the Eagle value field.
- The PCB, enclosure, soldering tools and mechanical hardware are separate purchases.
- Pre-crimped JST-PH cables avoid buying an expensive genuine crimp tool.
