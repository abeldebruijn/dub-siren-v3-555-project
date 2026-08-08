import { compile } from "@dub-siren/breadboard";
import { ArrowUpRight, Maximize2, X } from "lucide-react";
import { useRef } from "react";

const source = `breadboard Lesson1 rows 24 columns 5
chip Pico2 {
  height 20
  width 6
  color forest
  pin 18 GND
  pin 20 GP15
  pin 36 3V3
  pin 38 GND
} at R1

resistor R1 from Pico2.GP15 to LT-R23C4 {
  value 1k
}

led D1 from R1.2 to RT-R23C2 {
  color red
  on true
}

// wire Pico2.36 --> P color red
wire Pico2.38 --> G color black

wire D1.2 --> G color black`;

const result = compile(source);
const playgroundHref = `/pico-dub-siren/breadboard/playground/?${new URLSearchParams({ source }).toString()}`;

export default function CircuitPath() {
  const pinoutDialog = useRef<HTMLDialogElement>(null);

  if (result.status !== "valid") {
    return <p role="alert">The lesson breadboard could not be rendered.</p>;
  }

  return (
    <figure className="course-circuit course-breadboard">
      <header className="course-breadboard__header">
        <strong>Breadboard diagram</strong>
        <button type="button" onClick={() => pinoutDialog.current?.showModal()}>
          View Pico pinout <Maximize2 aria-hidden="true" />
        </button>
      </header>
      <div
        className="course-breadboard__svg"
        role="img"
        aria-label="Breadboard circuit connecting Pico GP15 through a one kilo-ohm resistor and LED to ground"
        dangerouslySetInnerHTML={{ __html: result.svg }}
      />
      <figcaption className="course-breadboard__toolbar">
        <span>GP15 → 1 kΩ resistor → LED → GND</span>
        <a href={playgroundHref}>
          Open in playground <ArrowUpRight aria-hidden="true" />
        </a>
      </figcaption>
      <dialog
        ref={pinoutDialog}
        className="course-pinout-dialog"
        aria-labelledby="pico-pinout-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) pinoutDialog.current?.close();
        }}
      >
        <header>
          <div>
            <span>Official Raspberry Pi diagram</span>
            <h3 id="pico-pinout-title">Raspberry Pi Pico 2 pinout</h3>
          </div>
          <button type="button" aria-label="Close Pico pinout" onClick={() => pinoutDialog.current?.close()}>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="course-pinout-dialog__image">
          <img
            src="/pico-dub-siren/lessons/pico-2-pinout.png"
            alt="Official Raspberry Pi Pico and Pico 2 pinout showing all forty physical pins and their GPIO, power, ground, UART, SPI, I2C, ADC, and system-control functions"
          />
        </div>
      </dialog>
    </figure>
  );
}
