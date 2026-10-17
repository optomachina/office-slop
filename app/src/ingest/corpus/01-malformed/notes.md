# 01-malformed

Synthetic data only. Plan section 5, case 1: truncated JSON, a string repo id, a missing entity id, a null head SHA, an HTML error page, an empty body, an old schema version and an event with an extra field.
Every bad line is rejected with a warning and changes no state; the two valid events (one with an ignored extra field) are applied.
