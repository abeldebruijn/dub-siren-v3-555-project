# Faulty cable caused the Pitch jumps

Exponential smoothing originally appeared to solve the unstable Pitch readings. The learner later found the actual cause was a faulty cable. After replacing or reseating the connection, direct ADC readings remained stable without smoothing.

Future analogue-input problems should be diagnosed at the wiring and connector level before adding software filtering. Keep small change thresholds for useful Shell output, but add smoothing only when measured noise remains after the physical circuit is verified.
