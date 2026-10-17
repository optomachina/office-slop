# 01-malformed

Synthetic data only. Plan section 5, case 1: truncated JSON, a string repo id, a missing entity id, a null head SHA, an HTML error page, an empty body, an old schema version and an event with an extra field.
Every bad line is rejected, listed in `rejected` with its line number, a digest of the line and the reason, and changes no state. That includes the event with the extra field (`m-3`): the contract fails closed on unknown keys. Only `m-1` is applied, with its payload and provenance.
