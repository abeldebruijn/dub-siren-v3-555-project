import { useEffect, useState } from "react";

export default function RateAmountDemo() {
  const [rate, setRate] = useState(0.5);
  const [amount, setAmount] = useState(0.5);
  const [held, setHeld] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const interval = Math.round(500 - rate * 450);
  const brightness = held && lightOn ? amount : 0;

  useEffect(() => {
    if (!held) {
      setLightOn(false);
      return;
    }

    const timeout = window.setTimeout(() => setLightOn((value) => !value), interval);
    return () => window.clearTimeout(timeout);
  }, [held, interval, lightOn]);

  return (
    <section className="course-simulator" aria-labelledby="rate-amount-title">
      <div>
        <h3 id="rate-amount-title">Preview Rate and Amount</h3>
      </div>
      <div className="course-simulator__body">
        <div className="course-led-stage">
          <span
            className={brightness > 0 ? "course-led course-led--on" : "course-led"}
            style={brightness > 0 ? { opacity: 0.35 + brightness * 0.65 } : undefined}
            aria-label={brightness > 0 ? `LED on at ${Math.round(brightness * 100)}% brightness` : "LED off"}
          />
        </div>
        <div className="course-simulator__controls">
          <button type="button" className="course-reset" onClick={() => setHeld((value) => !value)}>
            {held ? "Release Trigger" : "Hold Trigger"}
          </button>
          <label className="course-slider">
            <span><code>rate.value</code><strong>{rate.toFixed(2)}</strong></span>
            <input type="range" min="0" max="1" step="0.01" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          </label>
          <label className="course-slider">
            <span><code>amount.value</code><strong>{amount.toFixed(2)}</strong></span>
            <input type="range" min="0" max="1" step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </label>
          <output>
            <code>interval = int(500 - rate.value * 450)</code>
            <strong>{interval} ms per toggle · peak brightness {Math.round(amount * 100)}%</strong>
          </output>
        </div>
      </div>
    </section>
  );
}
