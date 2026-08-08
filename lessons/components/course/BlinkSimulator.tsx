import { useEffect, useMemo, useState } from "react";

export default function BlinkSimulator() {
  const [onTime, setOnTime] = useState(0.5);
  const [offTime, setOffTime] = useState(0.5);
  const [isOn, setIsOn] = useState(true);
  const cycle = onTime + offTime;
  const blinksPerSecond = useMemo(() => (1 / cycle).toFixed(1), [cycle]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setIsOn((value) => !value),
      (isOn ? onTime : offTime) * 1000,
    );
    return () => window.clearTimeout(timeout);
  }, [isOn, offTime, onTime]);

  return (
    <section className="course-simulator" aria-labelledby="blink-simulator-title">
      <div>
        <h3 id="blink-simulator-title">Blink simulator</h3>
      </div>
      <div className="course-simulator__body">
        <div className="course-led-stage">
          <span className={isOn ? "course-led course-led--on" : "course-led"} aria-label={isOn ? "LED on" : "LED off"} />
        </div>
        <div className="course-simulator__controls">
          <TimeSlider label="on_time" value={onTime} onChange={setOnTime} />
          <TimeSlider label="off_time" value={offTime} onChange={setOffTime} />
          <output>
            <code>cycle = on_time + off_time</code>
            <strong>{cycle.toFixed(1)}s cycle · {blinksPerSecond} blinks/s</strong>
          </output>
        </div>
      </div>
    </section>
  );
}

function TimeSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="course-slider">
      <span><code>{label}</code><strong>{value.toFixed(1)}s</strong></span>
      <input
        type="range"
        min="0.1"
        max="1.5"
        step="0.1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
