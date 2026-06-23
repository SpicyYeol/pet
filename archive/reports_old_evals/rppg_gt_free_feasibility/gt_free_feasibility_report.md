# GT-Free rPPG Feasibility Evidence

This report does not estimate accuracy against HR ground truth. It asks whether the extracted signal behaves more like a physiological rPPG signal than a camera/background artifact.

## Checks

- Spatial negative control: selected face/patch peak must beat fixed background ROI peaks.
- Time-order negative control: the peak should weaken after shuffling the same RGB samples.
- Perturbation robustness: BPM should survive brightness normalization and periodic sample drop.
- Multi-view agreement: synchronized views should agree after rejecting isolated view outliers.

## Single-View Summary

- Supportive: 0
- Inconclusive: 7
- Weak: 0

| video | windows | median_selected_bpm | median_background_snr_ratio | background_margin_score | shuffle_drop_score | perturbation_stability_score | temporal_stability_score | temporal_median_step_bpm | face_quality_score | artifact_100bpm_window_share | evidence_score | status | rejection_reasons |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6.mp4 | 10 | 99.975 | 0.439 | 0.749 | 0.875 | 1.0 | 0.964 | 0.439 | 1.0 | 0.9 | 76.0 | inconclusive | 100bpm_artifact_risk |
| 8.mp4 | 9 | 99.756 | 0.477 | 0.673 | 0.886 | 0.973 | 0.929 | 0.879 | 1.0 | 0.778 | 73.2 | inconclusive | 100bpm_artifact_risk |
| 7.mp4 | 9 | 98.438 | 0.573 | 0.507 | 0.82 | 0.973 | 0.848 | 1.978 | 1.0 | 0.667 | 66.9 | inconclusive | 100bpm_artifact_risk |
| 4.mp4 | 9 | 99.756 | 0.685 | 0.345 | 0.912 | 0.973 | 0.964 | 0.439 | 1.0 | 1.0 | 65.8 | inconclusive | 100bpm_artifact_risk |
| 3.mp4 | 16 | 98.877 | 0.808 | 0.197 | 0.855 | 0.973 | 0.557 | 7.032 | 1.0 | 0.438 | 65.7 | inconclusive | background_peak_competes |
| 1.mp4 | 9 | 99.316 | 0.868 | 0.129 | 0.867 | 0.947 | 0.848 | 1.977 | 1.0 | 0.667 | 57.5 | inconclusive | background_peak_competes, 100bpm_artifact_risk |
| 5.mp4 | 9 | 99.756 | 1.25 | 0.0 | 0.818 | 0.947 | 0.599 | 6.152 | 1.0 | 0.667 | 50.2 | inconclusive | background_peak_competes, 100bpm_artifact_risk |

## Multi-View Summary

| windows | windows_with_two_or_more_views | agreement_windows | agreement_pct | median_raw_spread_bpm | median_accepted_spread_bpm | status | interpretation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 3 | 2 | 66.7 | 14.062 | 3.955 | inconclusive | Agreement is GT-free: it checks cross-view consistency after rejecting isolated view outliers. |

| window_index | window_start_sec | raw_view_count | accepted_view_count | raw_spread_bpm | accepted_spread_bpm | consensus_bpm | agreement | accepted_views | rejected_views | raw_values |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0.0 | 4 | 4 | 9.668 | 9.668 | 108.984 | True | front, left, right, up | none | front:118.2, left:108.5, right:109.0, up:110.3 |
| 1 | 5.0 | 4 | 3 | 24.17 | 3.955 | 109.424 | True | left, right, up | front | front:132.7, left:109.4, right:112.5, up:108.5 |
| 2 | 10.0 | 2 | 0 | 18.457 |  |  | False |  | front, up | front:134.0, up:115.6 |
| 3 | 15.0 | 1 | 1 | 0.0 | 0.0 | 140.625 | False | front | none | front:140.6 |

## Window Evidence Preview

| video | window_index | window_start_sec | window_end_sec | selected_region | selected_method | selected_bpm | face_snr | face_quality | background_region | background_bpm | background_snr | background_snr_ratio | background_margin_score | shuffle_bpm | shuffle_snr | shuffle_drop_score | perturbation_median_dev_bpm | perturbation_stability_score | perturbation_detail | face_quality_score | window_evidence_score | flags |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1.mp4 | 0 | 0.0 | 19.933 | mid_face | green | 99.316 | 37.669 | 5.686 | bg_bottom_right | 97.559 | 32.699 | 0.868 | 0.129 | 161.279 | 9.112 | 0.758 | 0.0 | 1.0 | brightness_norm:99.3; drop_every_3:99.3 | 1.0 | 62.8 | background_peak_competes |
| 1.mp4 | 1 | 5.0 | 24.933 | patch_r02_c02 | g_minus_r | 90.967 | 39.597 | 5.577 | bg_bottom_left | 92.725 | 27.922 | 0.705 | 0.318 | 200.83 | 10.098 | 0.745 | 0.0 | 1.0 | brightness_norm:91.0; drop_every_3:91.0 | 1.0 | 69.3 |  |
| 1.mp4 | 2 | 10.0 | 29.933 | mid_face | pos | 90.967 | 26.539 | 5.092 | bg_top_right | 84.814 | 57.103 | 2.152 | 0.0 | 127.441 | 5.778 | 0.782 | 5.493 | 0.503 | brightness_norm:102.0; drop_every_3:91.0 | 1.0 | 44.9 | background_peak_competes |
| 1.mp4 | 3 | 15.0 | 34.933 | patch_r02_c02 | g_minus_r | 102.832 | 32.78 | 5.707 | bg_bottom_right | 105.469 | 45.865 | 1.399 | 0.0 | 170.508 | 6.62 | 0.798 | 0.439 | 0.947 | brightness_norm:103.3; drop_every_3:103.3 | 1.0 | 57.7 | background_peak_competes |
| 1.mp4 | 4 | 20.0 | 39.933 | upper_face | g_minus_r | 100.635 | 68.413 | 6.594 | bg_bottom_left | 106.787 | 88.002 | 1.286 | 0.0 | 98.438 | 8.531 | 0.875 | 1.318 | 0.848 | brightness_norm:103.3; drop_every_3:100.6 | 1.0 | 56.8 | background_peak_competes |
| 1.mp4 | 5 | 25.0 | 44.933 | upper_face | g_minus_r | 99.756 | 156.084 | 7.597 | bg_bottom_left | 102.393 | 75.771 | 0.485 | 0.658 | 190.283 | 6.692 | 0.957 | 0.44 | 0.947 | brightness_norm:98.9; drop_every_3:99.8 | 1.0 | 85.2 |  |
| 1.mp4 | 6 | 30.0 | 49.933 | patch_r01_c04 | green | 99.316 | 61.705 | 6.628 | bg_bottom_right | 133.154 | 24.902 | 0.404 | 0.826 | 141.943 | 3.973 | 0.936 | 0.439 | 0.947 | brightness_norm:98.9; drop_every_3:98.9 | 1.0 | 90.7 |  |
| 1.mp4 | 7 | 35.0 | 54.933 | patch_r04_c02 | g_minus_r | 94.043 | 69.333 | 5.996 | bg_top_left | 102.832 | 59.09 | 0.852 | 0.146 | 211.816 | 7.383 | 0.894 | 0.439 | 0.947 | brightness_norm:94.5; drop_every_3:93.6 | 1.0 | 65.2 | background_peak_competes |
| 1.mp4 | 8 | 40.0 | 59.933 | lower_face | green | 95.801 | 47.592 | 5.953 | bg_top_left | 100.195 | 41.769 | 0.878 | 0.119 | 94.922 | 6.346 | 0.867 | 0.22 | 0.973 | brightness_norm:96.2; drop_every_3:95.8 | 1.0 | 64.3 | background_peak_competes |
| 3.mp4 | 0 | 0.0 | 19.933 | patch_r02_c03 | g_minus_r | 105.908 | 39.197 | 5.824 | bg_top_left | 90.088 | 63.923 | 1.631 | 0.0 | 152.49 | 8.354 | 0.787 | 0.22 | 0.973 | brightness_norm:106.3; drop_every_3:105.9 | 1.0 | 58.1 | background_peak_competes |
| 3.mp4 | 1 | 5.0 | 24.933 | patch_r05_c02 | g_minus_r | 98.438 | 44.185 | 6.134 | bg_top_left | 112.939 | 55.92 | 1.266 | 0.0 | 171.826 | 10.503 | 0.762 | 0.001 | 1.0 | brightness_norm:98.4; drop_every_3:98.4 | 1.0 | 58.3 | background_peak_competes |
| 3.mp4 | 2 | 10.0 | 29.933 | patch_r05_c05 | green | 112.5 | 37.784 | 6.079 | bg_top_left | 113.818 | 38.776 | 1.026 | 0.0 | 106.348 | 5.309 | 0.859 | 13.403 | 0.187 | brightness_norm:85.7; drop_every_3:112.5 | 1.0 | 37.9 | background_peak_competes, perturbation_unstable |
| 3.mp4 | 3 | 15.0 | 34.933 | patch_r01_c01 | pos | 112.939 | 58.329 | 6.248 | bg_top_right | 102.393 | 27.887 | 0.478 | 0.672 | 153.809 | 3.62 | 0.938 | 0.0 | 1.0 | brightness_norm:112.9; drop_every_3:112.9 | 1.0 | 86.7 |  |
| 3.mp4 | 4 | 20.0 | 39.933 | patch_r02_c03 | green | 110.303 | 40.768 | 6.117 | bg_bottom_right | 99.756 | 35.467 | 0.87 | 0.127 | 136.23 | 5.746 | 0.859 | 0.659 | 0.921 | brightness_norm:109.4; drop_every_3:109.9 | 1.0 | 63.0 | background_peak_competes |
| 3.mp4 | 5 | 25.0 | 44.933 | mid_face | green | 97.559 | 49.607 | 6.313 | bg_bottom_left | 90.967 | 25.441 | 0.513 | 0.608 | 154.248 | 10.107 | 0.796 | 0.879 | 0.896 | brightness_norm:98.9; drop_every_3:97.1 | 1.0 | 78.1 |  |
| 3.mp4 | 6 | 30.0 | 49.933 | face_full | green | 94.482 | 57.566 | 6.48 | bg_bottom_right | 99.316 | 42.961 | 0.746 | 0.266 | 127.881 | 9.847 | 0.829 | 0.879 | 0.896 | brightness_norm:96.2; drop_every_3:94.5 | 1.0 | 66.6 |  |
| 3.mp4 | 7 | 35.0 | 54.933 | mid_face | green | 92.285 | 129.964 | 7.349 | bg_bottom_left | 85.254 | 45.814 | 0.353 | 0.949 | 132.275 | 3.556 | 0.973 | 4.395 | 0.577 | brightness_norm:101.1; drop_every_3:92.3 | 1.0 | 85.7 |  |
| 3.mp4 | 8 | 40.0 | 59.933 | patch_r03_c01 | g_minus_r | 95.361 | 46.502 | 6.245 | bg_bottom_left | 101.074 | 51.837 | 1.115 | 0.0 | 150.732 | 6.962 | 0.85 | 0.22 | 0.973 | brightness_norm:95.4; drop_every_3:94.9 | 1.0 | 59.6 | background_peak_competes |
| 3.mp4 | 9 | 45.0 | 64.933 | patch_r05_c01 | green | 102.393 | 45.762 | 5.999 | bg_bottom_right | 98.877 | 60.991 | 1.333 | 0.0 | 126.562 | 7.124 | 0.844 | 1.758 | 0.803 | brightness_norm:105.9; drop_every_3:102.4 | 1.0 | 54.7 | background_peak_competes |
| 3.mp4 | 10 | 50.0 | 69.933 | patch_r03_c01 | g_minus_r | 88.77 | 76.095 | 6.53 | bg_bottom_right | 97.998 | 38.133 | 0.501 | 0.629 | 218.848 | 11.671 | 0.847 | 0.22 | 0.973 | brightness_norm:89.2; drop_every_3:88.8 | 1.0 | 82.2 |  |
| 3.mp4 | 11 | 55.0 | 74.933 | patch_r04_c03 | pos | 101.953 | 60.27 | 6.532 | bg_bottom_right | 94.482 | 32.982 | 0.547 | 0.549 | 127.881 | 9.574 | 0.841 | 0.0 | 1.0 | brightness_norm:102.0; drop_every_3:102.0 | 1.0 | 79.9 |  |
| 3.mp4 | 12 | 60.0 | 79.933 | patch_r04_c03 | pos | 101.074 | 131.607 | 7.541 | bg_top_left | 90.527 | 62.747 | 0.477 | 0.674 | 184.57 | 7.158 | 0.946 | 0.22 | 0.973 | brightness_norm:101.5; drop_every_3:101.1 | 1.0 | 86.2 |  |
| 3.mp4 | 13 | 65.0 | 84.933 | patch_r04_c04 | g_minus_r | 90.527 | 51.143 | 6.14 | bg_bottom_left | 80.42 | 53.723 | 1.05 | 0.0 | 187.646 | 6.459 | 0.874 | 9.668 | 0.299 | brightness_norm:109.9; drop_every_3:90.5 | 1.0 | 41.3 | background_peak_competes, perturbation_unstable |
| 3.mp4 | 14 | 70.0 | 89.933 | patch_r02_c04 | g_minus_r | 85.254 | 77.642 | 6.538 | bg_top_right | 88.33 | 56.104 | 0.723 | 0.296 | 134.912 | 9.191 | 0.882 | 0.0 | 1.0 | brightness_norm:85.3; drop_every_3:85.3 | 1.0 | 71.8 |  |
| 3.mp4 | 15 | 75.0 | 94.933 | patch_r01_c05 | g_minus_r | 99.316 | 61.634 | 6.549 | bg_top_right | 100.635 | 60.641 | 0.984 | 0.015 | 166.113 | 4.64 | 0.925 | 0.22 | 0.973 | brightness_norm:98.9; drop_every_3:99.3 | 1.0 | 62.0 | background_peak_competes |
| 4.mp4 | 0 | 0.0 | 19.933 | patch_r05_c04 | green | 99.316 | 125.104 | 7.758 | bg_bottom_right | 93.164 | 64.578 | 0.516 | 0.602 | 148.096 | 5.384 | 0.957 | 0.22 | 0.973 | brightness_norm:99.8; drop_every_3:99.3 | 1.0 | 83.9 |  |
| 4.mp4 | 1 | 5.0 | 24.933 | patch_r04_c01 | g_minus_r | 99.756 | 72.8 | 6.901 | bg_bottom_right | 92.285 | 92.604 | 1.272 | 0.0 | 171.387 | 6.206 | 0.915 | 0.0 | 1.0 | brightness_norm:99.8; drop_every_3:99.8 | 1.0 | 62.0 | background_peak_competes |
| 4.mp4 | 2 | 10.0 | 29.933 | upper_face | green | 99.756 | 70.696 | 6.801 | bg_bottom_right | 94.043 | 48.414 | 0.685 | 0.345 | 215.332 | 6.22 | 0.912 | 2.417 | 0.739 | brightness_norm:95.4; drop_every_3:99.3 | 1.0 | 67.0 |  |
| 4.mp4 | 3 | 15.0 | 34.933 | patch_r01_c05 | green | 98.438 | 67.281 | 6.788 | bg_bottom_right | 85.693 | 38.254 | 0.569 | 0.514 | 109.863 | 4.042 | 0.94 | 5.713 | 0.49 | brightness_norm:109.9; drop_every_3:98.4 | 1.0 | 66.8 |  |
| 4.mp4 | 4 | 20.0 | 39.933 | patch_r02_c05 | chrom | 98.438 | 66.391 | 6.734 | bg_bottom_left | 96.24 | 49.23 | 0.742 | 0.272 | 157.324 | 10.177 | 0.847 | 0.22 | 0.973 | brightness_norm:98.4; drop_every_3:98.0 | 1.0 | 69.4 |  |
| 4.mp4 | 5 | 25.0 | 44.933 | patch_r04_c04 | g_minus_r | 100.195 | 33.041 | 5.762 | bg_bottom_left | 95.801 | 59.725 | 1.808 | 0.0 | 197.754 | 17.293 | 0.477 | 0.22 | 0.973 | brightness_norm:99.8; drop_every_3:100.2 | 1.0 | 50.7 | background_peak_competes |
| 4.mp4 | 6 | 30.0 | 49.933 | patch_r03_c04 | g_minus_r | 100.195 | 46.377 | 6.364 | bg_bottom_left | 96.68 | 64.101 | 1.382 | 0.0 | 148.096 | 8.396 | 0.819 | 0.0 | 1.0 | brightness_norm:100.2; drop_every_3:100.2 | 1.0 | 59.7 | background_peak_competes |
| 4.mp4 | 7 | 35.0 | 54.933 | patch_r01_c05 | green | 99.756 | 140.945 | 7.866 | bg_bottom_right | 98.438 | 38.204 | 0.271 | 1.0 | 148.975 | 7.429 | 0.947 | 0.22 | 0.973 | brightness_norm:99.8; drop_every_3:99.3 | 1.0 | 98.0 |  |
| 4.mp4 | 8 | 40.0 | 59.933 | patch_r03_c02 | green | 101.074 | 64.624 | 6.767 | bg_bottom_right | 116.016 | 35.406 | 0.548 | 0.548 | 94.922 | 8.768 | 0.864 | 0.44 | 0.947 | brightness_norm:102.0; drop_every_3:101.1 | 1.0 | 79.0 |  |
| 5.mp4 | 0 | 0.0 | 19.933 | patch_r03_c01 | green | 101.074 | 42.612 | 5.998 | bg_top_left | 97.559 | 21.071 | 0.494 | 0.641 | 107.666 | 6.337 | 0.851 | 0.659 | 0.921 | brightness_norm:99.8; drop_every_3:101.1 | 1.0 | 81.3 |  |
| 5.mp4 | 1 | 5.0 | 24.933 | patch_r01_c01 | green | 97.559 | 37.629 | 6.086 | bg_top_right | 129.199 | 16.242 | 0.432 | 0.765 | 160.84 | 6.854 | 0.818 | 5.713 | 0.49 | brightness_norm:108.5; drop_every_3:97.1 | 1.0 | 72.9 |  |
| 5.mp4 | 2 | 10.0 | 29.933 | patch_r05_c02 | green | 110.742 | 24.121 | 5.278 | bg_bottom_right | 89.209 | 42.393 | 1.758 | 0.0 | 131.836 | 10.043 | 0.584 | 1.538 | 0.825 | brightness_norm:108.1; drop_every_3:111.2 | 1.0 | 49.1 | background_peak_competes |
| 5.mp4 | 3 | 15.0 | 34.933 | face_full | g_minus_r | 99.756 | 24.437 | 5.296 | bg_bottom_left | 94.482 | 86.063 | 3.522 | 0.0 | 134.033 | 4.667 | 0.809 | 0.0 | 1.0 | brightness_norm:99.8; drop_every_3:99.8 | 1.0 | 59.4 | background_peak_competes |
| 5.mp4 | 4 | 20.0 | 39.933 | patch_r02_c05 | pos | 104.15 | 42.694 | 5.947 | bg_bottom_right | 98.877 | 62.926 | 1.474 | 0.0 | 198.193 | 9.761 | 0.771 | 0.22 | 0.973 | brightness_norm:104.6; drop_every_3:104.2 | 1.0 | 57.8 | background_peak_competes |
| 5.mp4 | 5 | 25.0 | 44.933 | patch_r03_c03 | pos | 99.756 | 29.371 | 5.698 | bg_top_right | 85.254 | 36.719 | 1.25 | 0.0 | 148.096 | 17.291 | 0.411 | 0.44 | 0.947 | brightness_norm:98.9; drop_every_3:99.8 | 1.0 | 48.4 | background_peak_competes |

## Interpretation

A supportive score is evidence for feasibility, not validation. A weak score means the present RGB signal is not separable from controls strongly enough to claim GT-free feasibility.