# rPPG Method Evaluation

## Setup

- Labels: `dataset_front/video_labels_ocr.csv`
- Usable labeled videos: 7
- Sample FPS: 15.0
- Window / step: 20.0s / 5.0s
- BPM search band: 80.0-240.0
- Face ROI: YOLO dog-face detector `DogFaceModel_Deploy/best.pt`

## Winner

- Best combination: **pos + face_full** (range MAE 37.587 bpm, target MAE 43.944 bpm, within-range 0.0%).

## Method Ranking

| method    | best_roi   | range_mae | target_mae | within_range_pct | median_snr |
| --------- | ---------- | --------- | ---------- | ---------------- | ---------- |
| pos       | face_full  | 37.587    | 43.944     | 0.0              | 11.535     |
| chrom     | face_full  | 37.728    | 44.007     | 14.29            | 11.395     |
| g_minus_r | mid_face   | 41.228    | 47.586     | 0.0              | 18.777     |
| ica       | face_full  | 41.354    | 47.711     | 0.0              | 29.538     |
| green     | lower_face | 42.484    | 48.841     | 0.0              | 14.742     |
| pca       | upper_face | 43.426    | 49.783     | 0.0              | 31.748     |

## Top Method/ROI Combinations

| method    | roi        | n | target_mae | target_rmse | range_mae | within_range_pct | median_snr | median_window_count |
| --------- | ---------- | - | ---------- | ----------- | --------- | ---------------- | ---------- | ------------------- |
| pos       | face_full  | 7 | 43.944     | 57.579      | 37.587    | 0.0              | 11.535     | 9.0                 |
| chrom     | face_full  | 7 | 44.007     | 58.17       | 37.728    | 14.29            | 11.395     | 9.0                 |
| pos       | mid_face   | 7 | 44.697     | 56.981      | 38.34     | 0.0              | 13.23      | 9.0                 |
| chrom     | lower_face | 7 | 44.823     | 59.077      | 38.607    | 14.29            | 12.09      | 9.0                 |
| pos       | lower_face | 7 | 46.016     | 61.446      | 39.799    | 14.29            | 11.397     | 9.0                 |
| pos       | upper_face | 7 | 46.644     | 59.62       | 40.286    | 0.0              | 12.041     | 9.0                 |
| chrom     | upper_face | 7 | 46.895     | 60.472      | 40.538    | 0.0              | 16.554     | 9.0                 |
| g_minus_r | mid_face   | 7 | 47.586     | 60.224      | 41.228    | 0.0              | 18.777     | 9.0                 |
| ica       | face_full  | 7 | 47.711     | 60.562      | 41.354    | 0.0              | 29.538     | 9.0                 |
| chrom     | mid_face   | 7 | 48.213     | 60.727      | 41.856    | 0.0              | 10.393     | 9.0                 |
| g_minus_r | lower_face | 7 | 48.778     | 60.623      | 42.421    | 0.0              | 18.778     | 9.0                 |
| g_minus_r | upper_face | 7 | 48.841     | 61.258      | 42.484    | 0.0              | 17.922     | 9.0                 |

## Label-Band Signal Diagnostic

This label-assisted diagnostic asks whether a method preserves an HR-frequency peak inside the OCR label range. A low error here does not mean the blind estimator can select that peak without labels.

| method    | roi        | n | label_peak_mae | median_label_peak_snr | median_label_peak_rank | top100_rank_pct |
| --------- | ---------- | - | -------------- | --------------------- | ---------------------- | --------------- |
| g_minus_r | lower_face | 7 | 2.236          | 3.07                  | 307.0                  | 28.57           |
| pos       | face_full  | 7 | 2.286          | 3.04                  | 178.0                  | 28.57           |
| g_minus_r | upper_face | 7 | 2.564          | 3.917                 | 307.0                  | 0.0             |
| chrom     | face_full  | 7 | 2.825          | 3.874                 | 192.0                  | 14.29           |
| ica       | face_full  | 7 | 2.881          | 7.131                 | 190.0                  | 42.86           |
| ica       | upper_face | 7 | 2.992          | 4.895                 | 253.0                  | 0.0             |
| green     | mid_face   | 7 | 3.163          | 8.357                 | 177.0                  | 28.57           |
| ica       | mid_face   | 7 | 3.258          | 5.382                 | 216.0                  | 28.57           |
| g_minus_r | face_full  | 7 | 3.344          | 5.059                 | 251.0                  | 28.57           |
| pca       | lower_face | 7 | 3.4            | 4.424                 | 261.0                  | 14.29           |
| pos       | upper_face | 7 | 3.458          | 5.303                 | 168.0                  | 42.86           |
| pca       | mid_face   | 7 | 3.464          | 4.516                 | 178.0                  | 14.29           |

## Winner Per Video

| video | pred_bpm | bpm_min | bpm_max | bpm_target | target_abs_error | range_error | within_range | median_snr |
| ----- | -------- | ------- | ------- | ---------- | ---------------- | ----------- | ------------ | ---------- |
| 1.mp4 | 113.818  | 170.0   | 180.0   | 175.0      | 61.182           | 56.182      | False        | 9.374      |
| 3.mp4 | 102.393  | 190.0   | 230.0   | 210.0      | 107.607          | 87.607      | False        | 16.512     |
| 4.mp4 | 102.393  | 111.0   | 120.0   | 115.5      | 13.107           | 8.607       | False        | 11.701     |
| 5.mp4 | 102.393  | 130.0   | 140.0   | 135.0      | 32.607           | 27.607      | False        | 8.197      |
| 6.mp4 | 92.725   | 90.0    | 90.0    | 90.0       | 2.725            | 2.725       | False        | 17.29      |
| 7.mp4 | 108.545  | 182.0   | 197.0   | 189.5      | 80.955           | 73.455      | False        | 11.535     |
| 8.mp4 | 101.074  | 108.0   | 113.0   | 110.5      | 9.426            | 6.926       | False        | 9.983      |

## Caveats

- The labels are video-level OCR-reviewed BPM ranges, not frame-synchronous ECG/PPG ground truth.
- Dog fur, tongue visibility, motion, specular highlights, and compression make these videos harder than human skin rPPG datasets.
- Results should be treated as dataset-specific method selection for this prototype, not clinical validation.
