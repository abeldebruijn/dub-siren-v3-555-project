from picozero import Button, LED

led = LED(15)
button = Button(14)

button.when_pressed = led.toggle
