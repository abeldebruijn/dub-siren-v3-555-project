import { useState } from "react";

export default function PotPositionDemo() {
  const [value, setValue] = useState(0.5);
  const position = Math.min(Math.trunc(value * 5), 4);

  return (
    <section className="course-pot-demo" aria-labelledby="pot-preview-title">
      <header>
        <div>
          <span>Preview the maths</span>
          <h3 id="pot-preview-title">Turn voltage into five positions</h3>
        </div>
        <output aria-live="polite"><small>Shell prints</small>{position}</output>
      </header>
      <label>
        <span><code>pot.value</code><strong>{value.toFixed(2)}</strong></span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      </label>
      <div className="course-pot-demo__steps" aria-label={`Position ${position} selected`}>
        {[0, 1, 2, 3, 4].map((step) => <span className={step === position ? "is-active" : ""} key={step}>{step}</span>)}
      </div>
    </section>
  );
}
