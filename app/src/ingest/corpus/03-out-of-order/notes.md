# 03-out-of-order

Synthetic data only. Plan section 5, case 2 (and rule 17 for unknown kinds): a newer head arrives before the older push, check attempt 2 before attempt 1, a newer Linear update before an older one, and an unknown event kind.
`o-9` carries a +02:00 offset (13:30+02:00 is 11:30Z), so it is older than `o-2` (12:00Z) even though it sorts later as text. `o-8` is `pr-11` in a different repo, so it is a separate entity.
The newest sourceVersion per entity wins regardless of arrival order: the check is `success` at `cccc222`, the head is `cccc222`, the issue is `In Review`. Older versions count as stale. The unknown kind is kept with a warning and never applied.
Partial coverage of case 2: "review at head B before the A->B push" and "check completed before queued within one attempt" are not here yet; they come with the full corpus in B1.
