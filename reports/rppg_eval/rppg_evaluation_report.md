# rPPG Method Evaluation

## Setup

- Labels: `dataset_front/video_labels_ocr.csv`
- Usable labeled videos: 7
- Sample FPS: 15.0
- Window / step: 20.0s / 5.0s
- BPM search band: 50.0-240.0
- Face ROI: YOLO dog-face detector `DogFaceModel_Deploy/best.pt`

## Winner

- Best combination: **g_minus_r + face_full** (range MAE 59.811 bpm, target MAE 66.168 bpm, within-range 0.0%).

## Method Ranking

| method    | best_roi   | range_mae | target_mae | within_range_pct | median_snr |
| --------- | ---------- | --------- | ---------- | ---------------- | ---------- |
| g_minus_r | face_full  | 59.811    | 66.168     | 0.0              | 27.964     |
| ica       | face_full  | 62.548    | 68.905     | 0.0              | 42.581     |
| pca       | upper_face | 63.113    | 69.47      | 0.0              | 41.41      |
| green     | mid_face   | 63.992    | 70.349     | 0.0              | 25.423     |
| chrom     | upper_face | 64.368    | 70.726     | 0.0              | 22.055     |
| pos       | lower_face | 65.586    | 71.944     | 0.0              | 17.699     |

## Top Method/ROI Combinations

| method    | roi        | n | target_mae | target_rmse | range_mae | within_range_pct | median_snr | median_window_count |
| --------- | ---------- | - | ---------- | ----------- | --------- | ---------------- | ---------- | ------------------- |
| g_minus_r | face_full  | 7 | 66.168     | 81.707      | 59.811    | 0.0              | 27.964     | 9.0                 |
| ica       | face_full  | 7 | 68.905     | 86.494      | 62.548    | 0.0              | 42.581     | 9.0                 |
| g_minus_r | upper_face | 7 | 69.37      | 84.221      | 63.013    | 0.0              | 30.028     | 9.0                 |
| pca       | upper_face | 7 | 69.47      | 83.538      | 63.113    | 0.0              | 41.41      | 9.0                 |
| g_minus_r | lower_face | 7 | 69.973     | 84.737      | 63.615    | 0.0              | 34.634     | 9.0                 |
| green     | mid_face   | 7 | 70.349     | 82.479      | 63.992    | 0.0              | 25.423     | 9.0                 |
| pca       | face_full  | 7 | 70.625     | 86.507      | 64.268    | 0.0              | 45.668     | 9.0                 |
| chrom     | upper_face | 7 | 70.726     | 83.187      | 64.368    | 0.0              | 22.055     | 9.0                 |
| green     | upper_face | 7 | 70.788     | 84.427      | 64.431    | 0.0              | 31.775     | 9.0                 |
| ica       | upper_face | 7 | 71.04      | 85.809      | 64.683    | 0.0              | 30.905     | 9.0                 |
| pos       | lower_face | 7 | 71.944     | 83.718      | 65.586    | 0.0              | 17.699     | 9.0                 |
| green     | face_full  | 7 | 72.672     | 86.619      | 66.315    | 0.0              | 29.622     | 9.0                 |

## Winner Per Video

| video | pred_bpm | bpm_min | bpm_max | bpm_target | target_abs_error | range_error | within_range | median_snr |
| ----- | -------- | ------- | ------- | ---------- | ---------------- | ----------- | ------------ | ---------- |
| 1.mp4 | 89.209   | 170.0   | 180.0   | 175.0      | 85.791           | 80.791      | False        | 15.563     |
| 3.mp4 | 72.07    | 190.0   | 230.0   | 210.0      | 137.93           | 117.93      | False        | 31.254     |
| 4.mp4 | 83.936   | 111.0   | 120.0   | 115.5      | 31.564           | 27.064      | False        | 22.792     |
| 5.mp4 | 69.434   | 130.0   | 140.0   | 135.0      | 65.566           | 60.566      | False        | 25.252     |
| 6.mp4 | 99.756   | 90.0    | 90.0    | 90.0       | 9.756            | 9.756       | False        | 51.086     |
| 7.mp4 | 67.676   | 182.0   | 197.0   | 189.5      | 121.824          | 114.324     | False        | 44.456     |
| 8.mp4 | 99.756   | 108.0   | 113.0   | 110.5      | 10.744           | 8.244       | False        | 27.964     |

## Caveats

- The labels are video-level OCR-reviewed BPM ranges, not frame-synchronous ECG/PPG ground truth.
- Dog fur, tongue visibility, motion, specular highlights, and compression make these videos harder than human skin rPPG datasets.
- Results should be treated as dataset-specific method selection for this prototype, not clinical validation.
