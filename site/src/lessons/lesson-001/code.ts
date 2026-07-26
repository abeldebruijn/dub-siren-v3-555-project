export const lessonOneCode = `from picozero import LED

led = LED(15)
led.blink(on_time=0.5, off_time=0.5)`;

export const lessonOneLineNotes: Record<number, { title: string; body: string }> = {
  1: {
    title: "picozero dependency",
    body: "Make sure picozero is installed on your Pico.",
  },
  4: {
    title: "Adjust the blink timing",
    body: "This can be adjusted. Use the interactive blink simulator below to see how changing these values will change your circuit.",
  },
};
