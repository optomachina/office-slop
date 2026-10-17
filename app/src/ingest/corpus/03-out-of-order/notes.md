# 03-out-of-order

Synthetic data only. Plan section 5, case 2 (and rule 17 for unknown kinds): a newer head arrives before the older push, check attempt 2 before attempt 1, a newer Linear update before an older one, and an unknown event kind.
The newest sourceVersion per entity wins regardless of arrival order; older versions count as stale; the unknown kind is kept with a warning and never applied.
