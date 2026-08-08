import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function pitchHz(value: number) {
  return Math.round(100 + value * 900);
}

export default function PitchSmoothingDemo() {
  const [target, setTarget] = useState(0.5);
  const [noisy, setNoisy] = useState(true);
  const [smoothed, setSmoothed] = useState(0.5);
  const [printedHz, setPrintedHz] = useState(pitchHz(0.5));
  const printedRef = useRef(printedHz);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const jitter = noisy ? (Math.random() - 0.5) * 0.03 : 0;
      const raw = Math.min(1, Math.max(0, target + jitter));
      setSmoothed((previous) => {
        const next = previous + (raw - previous) * 0.1;
        const hz = pitchHz(next);
        if (Math.abs(hz - printedRef.current) >= 5) {
          printedRef.current = hz;
          setPrintedHz(hz);
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [target, noisy]);

  return (
    <section className="course-simulator" aria-labelledby="pitch-smoothing-title">
      <div>
        <h3 id="pitch-smoothing-title">Preview the low-pass filter</h3>
      </div>
      <div className="course-simulator__body">
        <div className="course-led-stage">
          <output aria-live="polite">
            <small>Shell prints</small>
            Pitch: {printedHz} Hz
          </output>
        </div>
        <div className="course-simulator__controls">
          <label className="course-slider">
            <span><code>pitch.value</code><strong>{target.toFixed(2)}</strong></span>
            <input type="range" min="0" max="1" step="0.01" value={target} onChange={(event) => setTarget(Number(event.target.value))} />
          </label>
          <label className={noisy ? "course-check course-check--done" : "course-check"}>
            <input type="checkbox" checked={noisy} onChange={(event) => setNoisy(event.target.checked)} />
            <span aria-hidden="true">{noisy ? <Check /> : null}</span>
            <strong>Simulate ordinary ADC/wiring noise</strong>
          </label>
          <output>
            <code>smoothed_pitch += (pitch.value - smoothed_pitch) * 0.1</code>
            <strong>Filtered reading: {pitchHz(smoothed)} Hz</strong>
          </output>
        </div>
      </div>
    </section>
  );
}
