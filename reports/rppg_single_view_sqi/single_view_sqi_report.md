# Single-View RGB rPPG Feasibility: Candidate/SQI Evaluation

## Setup

- Labels: `dataset_front/video_labels_ocr.csv`
- Usable labeled videos: 7
- Sample FPS: 15.0
- Window / step: 20.0s / 5.0s
- BPM search band: 80.0-240.0
- Candidate regions: 4 aggregate face ROIs + 5x5 face patches
- Candidate methods: green, g_minus_r, chrom, pos, pca, ica

## Selector Ranking

| selector                         | n | target_mae | target_rmse | range_mae | within_range_pct |
| -------------------------------- | - | ---------- | ----------- | --------- | ---------------- |
| oracle_window_peak               | 7 | 0.397      | 0.815       | 0.013     | 85.71            |
| trained_tracked_selector_current | 7 | 2.499      | 4.332       | 0.075     | 85.71            |
| trained_peak_selector_current    | 7 | 2.768      | 4.83        | 0.201     | 85.71            |
| oracle_method_region             | 7 | 32.023     | 47.567      | 26.579    | 28.57            |
| fixed_chrom_face_full            | 7 | 44.76      | 59.763      | 38.481    | 14.29            |
| supervised_tracked_ranker_loocv  | 7 | 44.955     | 58.711      | 38.607    | 14.29            |
| fixed_pos_face_full              | 7 | 45.074     | 60.585      | 38.717    | 0.0              |
| supervised_peak_ranker_loocv     | 7 | 45.52      | 58.592      | 39.163    | 0.0              |
| tracked_sqi                      | 7 | 49.72      | 63.088      | 43.363    | 0.0              |
| sqi_top_window                   | 7 | 49.908     | 63.194      | 43.551    | 0.0              |
| train_calibrated_fixed_loocv     | 7 | 53.863     | 66.272      | 47.506    | 0.0              |

## Tracked SQI Per Video

| video | pred_bpm | bpm_min | bpm_max | bpm_target | target_abs_error | range_error | within_range | selected_method | selected_region |
| ----- | -------- | ------- | ------- | ---------- | ---------------- | ----------- | ------------ | --------------- | --------------- |
| 1.mp4 | 99.316   | 170.0   | 180.0   | 175.0      | 75.684           | 70.684      | False        | g_minus_r       | upper_face      |
| 3.mp4 | 99.316   | 190.0   | 230.0   | 210.0      | 110.684          | 90.684      | False        | ica             | lower_face      |
| 4.mp4 | 99.756   | 111.0   | 120.0   | 115.5      | 15.744           | 11.244      | False        | pca             | patch_r01_c05   |
| 5.mp4 | 100.195  | 130.0   | 140.0   | 135.0      | 34.805           | 29.805      | False        | pca             | face_full       |
| 6.mp4 | 100.195  | 90.0    | 90.0    | 90.0       | 10.195           | 10.195      | False        | pca             | face_full       |
| 7.mp4 | 98.877   | 182.0   | 197.0   | 189.5      | 90.623           | 83.123      | False        | pca             | face_full       |
| 8.mp4 | 100.195  | 108.0   | 113.0   | 110.5      | 10.305           | 7.805       | False        | pca             | patch_r01_c02   |

## Top Fixed Method/Region Candidates

| method    | region_id     | region_label | region_kind | n | target_mae | target_rmse | range_mae | within_range_pct | median_quality_score |
| --------- | ------------- | ------------ | ----------- | - | ---------- | ----------- | --------- | ---------------- | -------------------- |
| g_minus_r | patch_r05_c05 | Patch R5 C5  | patch       | 7 | 43.128     | 57.337      | 36.771    | 0.0              | 4.555                |
| chrom     | patch_r05_c03 | Patch R5 C3  | patch       | 7 | 43.128     | 55.935      | 36.771    | 0.0              | 3.965                |
| pos       | patch_r05_c03 | Patch R5 C3  | patch       | 7 | 43.379     | 57.577      | 37.022    | 0.0              | 4.052                |
| chrom     | patch_r04_c05 | Patch R4 C5  | patch       | 7 | 43.568     | 56.527      | 37.21     | 0.0              | 4.132                |
| chrom     | patch_r01_c03 | Patch R1 C3  | patch       | 7 | 43.323     | 57.342      | 37.288    | 14.29            | 4.431                |
| chrom     | patch_r04_c01 | Patch R4 C1  | patch       | 7 | 43.505     | 57.583      | 37.414    | 14.29            | 4.032                |
| green     | patch_r05_c04 | Patch R5 C4  | patch       | 7 | 43.819     | 56.825      | 37.461    | 0.0              | 4.39                 |
| pos       | patch_r02_c02 | Patch R2 C2  | patch       | 7 | 44.013     | 61.23       | 37.656    | 0.0              | 4.204                |
| pos       | patch_r01_c02 | Patch R1 C2  | patch       | 7 | 44.264     | 59.484      | 37.907    | 0.0              | 4.142                |
| pos       | patch_r04_c01 | Patch R4 C1  | patch       | 7 | 44.195     | 59.279      | 38.104    | 14.29            | 4.256                |
| pos       | patch_r02_c01 | Patch R2 C1  | patch       | 7 | 44.635     | 57.479      | 38.278    | 0.0              | 4.212                |
| chrom     | patch_r02_c01 | Patch R2 C1  | patch       | 7 | 44.698     | 57.415      | 38.341    | 0.0              | 4.07                 |
| chrom     | patch_r03_c04 | Patch R3 C4  | patch       | 7 | 44.76      | 58.802      | 38.403    | 0.0              | 3.869                |
| chrom     | face_full     | Full face    | roi         | 7 | 44.76      | 59.763      | 38.481    | 14.29            | 4.198                |
| pca       | patch_r03_c04 | Patch R3 C4  | patch       | 7 | 44.886     | 59.976      | 38.529    | 0.0              | 4.807                |

## Interpretation

- `fixed_pos_face_full` is a direct POS baseline on the full dog-face ROI.
- `sqi_top_window` chooses the highest quality candidate per window without labels.
- `tracked_sqi` adds a temporal smoothness penalty so BPM does not jump between unrelated peaks.
- `trained_peak_selector_current` is fitted on the current OCR labels and shows calibration potential, not unbiased generalization.
- `trained_tracked_selector_current` adds temporal tracking to that current-label trained selector.
- `supervised_*_loocv` rows train on all other videos and are the conservative generalization check.
- `train_calibrated_fixed_loocv` chooses one fixed method/region using the other videos as calibration data.
- `oracle_*` rows leak labels and should be treated as upper bounds, not deployable performance.

## Caveats

- Labels are video-level OCR-reviewed monitor ranges, not frame-synchronous ECG/PPG ground truth.
- Patch-grid candidates can overfit this small dataset; leave-one-video-out numbers are more useful than in-sample winners.
- The method is built for single-view RGB feasibility and is intentionally structured for later multi-view fusion.
