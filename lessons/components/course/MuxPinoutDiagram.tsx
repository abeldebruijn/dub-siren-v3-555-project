const leftPins = [
  { pin: 1, name: "CH A4", note: "Channel 4 in/out" },
  { pin: 2, name: "CH A6", note: "Channel 6 in/out" },
  { pin: 3, name: "COM", note: "Common out/in → GP28" },
  { pin: 4, name: "CH A7", note: "Channel 7 in/out" },
  { pin: 5, name: "CH A5", note: "Channel 5 in/out" },
  { pin: 6, name: "!E", note: "Enable, active low → GND" },
  { pin: 7, name: "VEE", note: "Negative supply → GND" },
  { pin: 8, name: "GND", note: "Ground → GND" },
] as const;

const rightPins = [
  { pin: 16, name: "VCC", note: "Positive supply → 3V3(OUT)" },
  { pin: 15, name: "CH A2", note: "Channel 2 in/out" },
  { pin: 14, name: "CH A1", note: "Channel 1 in/out" },
  { pin: 13, name: "CH A0", note: "Channel 0 in/out · Pitch today" },
  { pin: 12, name: "CH A3", note: "Channel 3 in/out" },
  { pin: 11, name: "S0", note: "Channel select 0 → GND" },
  { pin: 10, name: "S1", note: "Channel select 1 → GND" },
  { pin: 9, name: "S2", note: "Channel select 2 → GND" },
] as const;

export default function MuxPinoutDiagram() {
  return (
    <div className="course-mux-pinout">
      <div className="course-mux-pinout__diagram">
        <ol className="course-mux-pinout__side" aria-label="Left pins 1 through 8">
          {leftPins.map((row) => (
            <li key={row.pin}>
              <span className="course-mux-pinout__number">{row.pin}</span>
              <span className="course-mux-pinout__name">{row.name}</span>
              <small>{row.note}</small>
            </li>
          ))}
        </ol>
        <div className="course-mux-pinout__body">
          <span className="course-mux-pinout__notch" aria-hidden="true" />
          <strong>CD74HC4051E</strong>
          <span>16-pin, top view</span>
          <span>notch up · pin 1 top-left</span>
        </div>
        <ol className="course-mux-pinout__side course-mux-pinout__side--right" aria-label="Right pins 16 down to 9">
          {rightPins.map((row) => (
            <li key={row.pin}>
              <small>{row.note}</small>
              <span className="course-mux-pinout__name">{row.name}</span>
              <span className="course-mux-pinout__number">{row.pin}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="course-mux-pinout__footnote">
        Official TI pin names differ slightly from this course's beginner labels: <strong>CH A0</strong> is our CH0, and{" "}
        <strong>COM OUT/IN</strong> is our COMMON. <code>!E</code> is the active-low ENABLE input.
      </p>
    </div>
  );
}
