# 02-duplicated

Synthetic data only. Plan section 5, case 3: the same webhook delivery twice, the same fact seen by poll and webhook (same eventId), and a Linear page fetched twice across a cursor reset.
Each eventId is applied once; repeats are counted as duplicates.
