from picozero import Button, LED, Pot
from time import sleep

led = LED(15)
button = Button(14)
pot = Pot(26)

while True:
    if button.is_pressed:
        led.value = pot.value
    else:
        led.off()
    sleep(0.01)
