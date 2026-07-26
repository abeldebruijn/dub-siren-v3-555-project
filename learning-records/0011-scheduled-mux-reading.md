# Scheduled mux reads reduce timing interference

The learner noticed that Lesson 10's two 2 ms mux-settle sleeps plus the bottom 10 ms loop sleep slowed the fastest LED flashing. Lesson 11 introduces scheduled mux reading with `ticks_ms`, `ticks_diff`, and `ticks_add`, so LED timing can be checked frequently while Pitch and Amount are scanned through the 4051 at a slower human-control rate.

The learner initially expected Pitch to change the LED flash frequency, then correctly identified that Rate controls LED speed while Pitch is only printed. Lesson 11 remains a coding lesson because understanding the independent scheduled jobs is important for the later synthesizer.
