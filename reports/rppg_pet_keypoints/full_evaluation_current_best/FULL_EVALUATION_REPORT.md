# Pet rPPG — Full Evaluation (Current Best Config)

**Config**: `--dog_aware --multi_area --relax_rejection` (2026-05)

**Date**: Auto-generated

## Summary Table

video  target_bpm  best_raw_bpm  best_relaxed_bpm  abs_error  best_relaxed_snr  windows_total  windows_kept_relaxed  kept_pct  avg_pixel_mean_kept  high_hr_recovery
    1       175.0         203.3             203.3       28.3             54.60             48                    48     100.0               1706.0             False
    3       210.0         176.4             176.4       33.6             21.67             48                    48     100.0               1681.0              True
    5       135.0         211.5             211.5       76.5             54.33             48                    47      97.9               1676.0             False
    6        90.0         105.5             121.9       31.9             31.25             48                    47      97.9               1717.0             False
    7       189.5         102.5             156.4       33.1             55.17             48                    42      87.5               1575.0             False
    8       110.5         154.1             154.1       43.6             51.98             48                    41      85.4               1679.0             False

## Key Insights

- Videos evaluated: 6
- Mean absolute error: 41.2 bpm
- Median absolute error: 33.4 bpm
- High-HR recovery (videos 3 & 7): 1/2

## Notes
- `best_relaxed_bpm` uses the lenient rejection threshold after dog_aware + multi-area preprocessing.
- `pixel_mean` comes from the new multi-patch extraction (higher = more stable).
- High-HR recovery = credible peak near target band surfaced with decent SNR.
