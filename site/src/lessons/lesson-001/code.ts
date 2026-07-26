export const lessonOneCode = `from picozero import LED

led = LED(15)
led.blink(on_time=0.5, off_time=0.5)`;

export const lessonOneLineNotes: Record<number, { title: string; body: string }> = {
  1: {
    title: "Bring in the LED helper",
    body: "picozero hides the low-level pin switching. You can think in terms of an LED component instead of raw voltages.",
  },
  3: {
    title: "Tell the Pico where the LED lives",
    body: "LED(15) means the signal wire is on GP15. If the wire moves to another GPIO pin, this number must change too.",
  },
  4: {
    title: "Make a repeating rhythm",
    body: "The LED turns on for 0.5 seconds and off for 0.5 seconds. One full blink cycle takes 1 second.",
  },
};
