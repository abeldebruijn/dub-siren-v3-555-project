import { useEffect, useState } from "react";

export default function FlashRateDemo() {
  const [potValue, setPotValue] = useState(0.5);
  const [held, setHeld] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const interval = Math.round(500 - potValue * 450);

  useEffect(() => {
    if (!held) {
      setIsOn(false);
      return;
    }

    const timeout = window.setTimeout(() => setIsOn((value) => !value), interval);
    return () => window.clearTimeout(timeout);
  }, [held, interval, isOn]);

  return (
    <section className="course-simulator" aria-labelledby="flash-rate-title">
      <div>
        <h3 id="flash-rate-title">Preview the LFO</h3>
      </div>
      <div className="course-simulator__body">
        <div className="course-led-stage">
          <span className={isOn ? "course-led course-led--on" : "course-led"} aria-label={isOn ? "LED on" : "LED off"} />
        </div>
        <div className="course-simulator__controls">
          <button type="button" className="course-reset" onClick={() => setHeld((value) => !value)}>
            {held ? "Release Trigger" : "Hold Trigger"}
          </button>
          <label className="course-slider">
            <span><code>pot.value</code><strong>{potValue.toFixed(2)}</strong></span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={potValue}
              onChange={(event) => setPotValue(Number(event.target.value))}
            />
          </label>
          <output>
            <code>interval = int(500 - pot.value * 450)</code>
            <strong>{interval} ms per toggle</strong>
          </output>
        </div>
      </div>
    </section>
  );
}
