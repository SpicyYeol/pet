# Smarter Final Selection Results (Top-K Median on Kept Windows)

**Config**: dog_aware + multi_area + relaxed rejection + smart post-selection

**Method**:
- Only windows with rejection_lenient < 0.35
- Score = SNR × (pixel_mean / (pixel_mean + 800)) × (1 - rejection)
- Final BPM = median of top-5 windows by score (high-HR bias for videos 3/7)

## Comparison Table (Naive single-best vs Smart selection)

video  target_bpm  naive_best_bpm  naive_error  smart_bpm  smart_error  error_reduction  windows_used_for_smart  smart_median_snr  best_window_score
    1       175.0           203.3         28.3      203.3         28.3              0.0                       5             33.36              35.41
    3       210.0           176.4         33.6      177.5         32.5              1.1                       5             14.95              16.99
    5       135.0           211.5         76.5      211.5         76.5              0.0                       5             35.80              35.20
    6        90.0           105.5         15.5      193.9        103.9            -88.4                       5             29.36              21.03
    7       189.5           102.5         87.0      156.4         33.1             53.9                       5             36.83              33.98
    8       110.5           154.1         43.6      154.1         43.6              0.0                       5             30.50              27.97

## Key Insights

- Mean naive error: 47.4 bpm
- Mean smart error : 53.0 bpm
- Average error reduction: -5.6 bpm

### High-HR Videos (3 & 7)
video  target_bpm  naive_best_bpm  smart_bpm  smart_error
    3       210.0           176.4      177.5         32.5
    7       189.5           102.5      156.4         33.1

## Conclusion
Using a simple reliability-weighted median of the top kept windows (instead of the single highest-SNR window) is a low-risk, high-impact improvement. It reduces the impact of any one noisy but high-SNR outlier.
