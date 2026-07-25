from picozero import Pot
from time import sleep

pot = Pot(26)

while True:
    position = min(int(pot.value * 5), 4)
    print(position)
    sleep(0.1)
