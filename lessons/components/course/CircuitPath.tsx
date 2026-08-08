const steps = ["GP15", "1 kΩ resistor", "LED", "GND"];

export default function CircuitPath() {
  return (
    <figure className="course-circuit" aria-labelledby="course-circuit-caption">
      <figcaption id="course-circuit-caption" className="course-eyebrow">One complete current path</figcaption>
      <div className="course-circuit__path">
        {steps.map((step, index) => (
          <div className="course-circuit__step" key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
            {index < steps.length - 1 ? <i aria-hidden="true">→</i> : null}
          </div>
        ))}
      </div>
      <p>Start at the Pico output pin. Current flows through the resistor and LED, then returns to ground.</p>
    </figure>
  );
}
