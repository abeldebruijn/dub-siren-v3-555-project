from machine import Pin
from time import sleep_ms

# Physical selector positions 1-5 connect to GP2-GP6.
# Pin.PULL_UP keeps every input at 1 until the selector grounds it.
selector_inputs = (
    Pin(2, Pin.IN, Pin.PULL_UP),
    Pin(3, Pin.IN, Pin.PULL_UP),
    Pin(4, Pin.IN, Pin.PULL_UP),
    Pin(5, Pin.IN, Pin.PULL_UP),
    Pin(6, Pin.IN, Pin.PULL_UP),
)

mod_names = (
    "Rising saw",
    "Falling saw",
    "Triangle",
    "Sine",
    "Square",
)


def read_mod_type():
    # The selected input reads 0 because common A is connected to GND.
    for index, input_pin in enumerate(selector_inputs):
        if input_pin.value() == 0:
            return index

    # A break-before-make switch briefly selects nothing while turning.
    return None


last_mod_type = None

while True:
    mod_type = read_mod_type()

    if mod_type is not None and mod_type != last_mod_type:
        # Wait for the mechanical contact to settle, then verify it again.
        sleep_ms(10)

        if read_mod_type() == mod_type:
            last_mod_type = mod_type
            print("Mod type:", mod_type, mod_names[mod_type])

    sleep_ms(5)
