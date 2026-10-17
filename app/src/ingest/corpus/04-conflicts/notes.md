# 04-conflicts

Synthetic data only. Plan section 3 rule 4 (keep and show conflicts instead of picking a winner) and the scoped entity key.
- `c-p` and `c-q` each arrive twice on `chk-40` with different versions. Each `eventId` is a separate "same eventId, different content" conflict, neither is applied, and the two conflicts on one key are ordered by event id regardless of arrival.
- `t-a` (10:00Z) and `t-b` (12:00+02:00, the same instant) tie at the top of `rev-41`: a "version tie" conflict, no winner. `t-0` (09:00Z) is older and counts as stale.
- `x-1` (attempt 3) and `x-2` (a timestamp) mix version domains on `pr-42`: a conflict, nothing applied, nothing stale.
- `g-1` and `g-2` would share the key `github|synthetic-org|1000001|head|x|5|head|z` if `|` were not escaped. They are two entities.
