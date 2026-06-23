# Multi-View RGB rPPG Consistency Check

## Setup

- Inputs: `dataset_multi/*.mp4`
- Selector model: `reports/rppg_single_view_sqi/models/current_label_peak_selector.joblib`
- Window / step: 20.0s / 5.0s
- BPM search band: 80.0-240.0
- Candidate regions: 4 aggregate face ROIs + 5x5 face patches
- Candidate methods: green, g_minus_r, chrom, pos, pca, ica

## Important Interpretation

- These multi-view videos do not have synchronized monitor labels in this dataset.
- The reported values are view consistency/stability checks, not accuracy metrics.
- The selector is the current-label single-view RGB model, so results should be treated as stage-2 feasibility signals.

## View Summary

| view  | pred_bpm | weighted_mean_bpm | median_bpm | iqr_bpm | windows | median_selector_score | top_method | top_region    | detected_pct | median_box_conf | samples |
| ----- | -------- | ----------------- | ---------- | ------- | ------- | --------------------- | ---------- | ------------- | ------------ | --------------- | ------- |
| front | 134.033  | 134.201           | 133.374    | 6.591   | 4       | 0.69                  | chrom      | patch_r03_c05 | 91.83        | 0.879           | 600     |
| left  | 109.424  | 109.077           | 108.984    | 0.439   | 2       | 0.6333                | chrom      | face_full     | 61.33        | 0.285           | 600     |
| right | 108.984  | 110.156           | 110.742    | 1.758   | 2       | 0.6367                | green      | patch_r01_c04 | 68.33        | 0.708           | 600     |
| up    | 110.303  | 111.494           | 110.303    | 3.515   | 3       | 0.6667                | green      | patch_r02_c03 | 76.33        | 0.383           | 600     |

## Fusion Track Preview

| window_index | window_start_sec | fused_bpm | weighted_mean_bpm | view_count | min_view_bpm | max_view_bpm | view_spread_bpm | median_selector_score | views               |
| ------------ | ---------------- | --------- | ----------------- | ---------- | ------------ | ------------ | --------------- | --------------------- | ------------------- |
| 0            | 0.0              | 108.984   | 109.997           | 4          | 108.545      | 118.213      | 9.668           | 0.5733                | front,left,right,up |
| 1            | 5.0              | 109.424   | 115.244           | 4          | 108.545      | 132.715      | 24.17           | 0.6567                | front,left,right,up |
| 2            | 10.0             | 134.033   | 129.089           | 2          | 115.576      | 134.033      | 18.457          | 0.71                  | front,up            |
| 3            | 15.0             | 140.625   | 140.625           | 1          | 140.625      | 140.625      | 0.0             | 0.7267                | front               |
