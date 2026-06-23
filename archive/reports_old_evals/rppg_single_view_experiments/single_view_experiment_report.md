# Single-View RGB Additional Model Experiments

## Interpretation Rules

- `loocv_*` rows are the fairer check: train on six videos and test on the held-out video.
- `current_fit_*` rows are calibration/upper-bound style checks fitted on the same seven labeled videos.
- `oracle_*` rows leak the label and are only used to check whether the right peak exists in the candidate bank.
- Harmonic rows expand each spectral peak into half/original/1.5x/double BPM candidates.
- `consensus_*` rows add method/ROI/neighbor agreement within each window.
- `motion_reject_*` rows penalize candidates close to detector-box motion frequencies.
- `dog_*` rows add panting/mouth-motion, lower-face, texture/fur, and respiration-overlap penalties.
- `harmonic_aware_viterbi` rows use a temporal tracker that preserves HR continuity while allowing harmonic-state candidates.
- `kalman_ssm` rows apply a constant-HR state-space smoother over selected window BPM values.

## Selector Ranking

| selector                                                             | n | target_mae | target_rmse | range_mae | within_range_pct | median_harmonic_adjusted_pct |
| -------------------------------------------------------------------- | - | ---------- | ----------- | --------- | ---------------- | ---------------------------- |
| current_fit_rf_direct_hr_regression                                  | 7 | 0.065      | 0.14        | 0.0       | 100.0            | 0.0                          |
| oracle_harmonic_window_peak                                          | 7 | 0.1        | 0.108       | 0.013     | 85.71            | 0.0                          |
| current_fit_extra_trees_error_regressor_harmonic_tracked             | 7 | 0.131      | 0.157       | 0.013     | 85.71            | 30.0                         |
| current_fit_rf_error_regressor_harmonic_tracked                      | 7 | 0.183      | 0.216       | 0.013     | 85.71            | 55.56                        |
| oracle_existing_window_peak                                          | 7 | 0.397      | 0.815       | 0.013     | 85.71            | 0.0                          |
| current_fit_rf_harmonic_tracked_kalman_ssm                           | 7 | 2.276      | 2.763       | 0.167     | 85.71            | 88.89                        |
| current_fit_rf_harmonic_tracked                                      | 7 | 1.903      | 2.226       | 0.201     | 85.71            | 88.89                        |
| current_fit_histgb_harmonic_tracked_kalman_ssm                       | 7 | 4.797      | 7.983       | 0.287     | 71.43            | 50.0                         |
| current_fit_histgb_harmonic_tracked                                  | 7 | 5.077      | 8.099       | 0.402     | 57.14            | 50.0                         |
| current_fit_extra_trees_harmonic_tracked_kalman_ssm                  | 7 | 5.694      | 6.317       | 1.56      | 42.86            | 11.11                        |
| current_fit_extra_trees_harmonic_tracked                             | 7 | 5.764      | 6.435       | 1.581     | 42.86            | 11.11                        |
| loocv_rf_classifier_tracked                                          | 7 | 46.148     | 59.354      | 39.791    | 0.0              | 0.0                          |
| loocv_rf_error_regressor_dog_panting_texture_harmonic_aware_viterbi  | 7 | 48.961     | 54.995      | 42.622    | 14.29            | 37.5                         |
| dog_panting_texture_reject_harmonic_aware_viterbi                    | 7 | 49.594     | 62.93       | 43.237    | 0.0              | 0.0                          |
| harmonic_aware_viterbi_quality                                       | 7 | 49.657     | 62.884      | 43.3      | 0.0              | 0.0                          |
| harmonic_sqi_tracked                                                 | 7 | 49.72      | 63.088      | 43.363    | 0.0              | 0.0                          |
| sqi_tracked_recheck                                                  | 7 | 49.72      | 63.088      | 43.363    | 0.0              | 0.0                          |
| harmonic_sqi_top_window                                              | 7 | 49.783     | 63.174      | 43.426    | 0.0              | 11.11                        |
| sqi_top_window_recheck                                               | 7 | 49.908     | 63.194      | 43.551    | 0.0              | 0.0                          |
| localized_consensus_motion_reject_harmonic_aware_viterbi_kalman_ssm  | 7 | 49.995     | 63.087      | 43.637    | 0.0              | 0.0                          |
| consensus_motion_reject_top_window                                   | 7 | 50.034     | 63.214      | 43.677    | 0.0              | 0.0                          |
| localized_consensus_harmonic_aware_viterbi                           | 7 | 50.159     | 63.302      | 43.802    | 0.0              | 0.0                          |
| localized_consensus_motion_reject_harmonic_aware_viterbi             | 7 | 50.159     | 63.302      | 43.802    | 0.0              | 0.0                          |
| dog_panting_texture_reject_harmonic_aware_viterbi_kalman_ssm         | 7 | 50.162     | 63.752      | 43.804    | 0.0              | 0.0                          |
| consensus_motion_reject_harmonic_aware_viterbi                       | 7 | 50.222     | 63.437      | 43.865    | 0.0              | 0.0                          |
| harmonic_sqi_tracked_kalman_ssm                                      | 7 | 50.233     | 63.7        | 43.876    | 0.0              | 0.0                          |
| consensus_harmonic_aware_viterbi                                     | 7 | 50.285     | 63.543      | 43.928    | 0.0              | 0.0                          |
| consensus_motion_reject_harmonic_aware_viterbi_kalman_ssm            | 7 | 50.585     | 63.978      | 44.228    | 0.0              | 0.0                          |
| dog_upper_mid_mouth_reject_harmonic_aware_viterbi_kalman_ssm         | 7 | 50.74      | 64.747      | 44.382    | 0.0              | 0.0                          |
| dog_upper_mid_mouth_reject_harmonic_aware_viterbi                    | 7 | 50.975     | 65.275      | 44.618    | 0.0              | 0.0                          |
| loocv_rf_error_regressor_consensus_motion_harmonic_aware_viterbi     | 7 | 51.441     | 57.4        | 45.102    | 14.29            | 43.75                        |
| loocv_rf_direct_hr_regression                                        | 7 | 58.478     | 61.962      | 52.121    | 0.0              | 0.0                          |
| loocv_rf_direct_hr_regression_kalman_ssm                             | 7 | 59.534     | 63.362      | 53.177    | 0.0              | 0.0                          |
| loocv_histgb_direct_hr_regression                                    | 7 | 60.122     | 63.084      | 53.765    | 0.0              | 0.0                          |
| loocv_histgb_classifier_consensus_motion_harmonic_aware_viterbi      | 7 | 61.01      | 67.88       | 54.653    | 0.0              | 33.33                        |
| loocv_rf_classifier_consensus_motion_harmonic_aware_viterbi          | 7 | 60.619     | 68.105      | 55.033    | 14.29            | 88.89                        |
| loocv_rf_classifier_harmonic_tracked                                 | 7 | 62.318     | 70.948      | 55.961    | 0.0              | 100.0                        |
| loocv_extra_trees_classifier_consensus_motion_harmonic_aware_viterbi | 7 | 62.726     | 72.086      | 56.512    | 14.29            | 100.0                        |
| loocv_rf_classifier_dog_panting_texture_harmonic_aware_viterbi       | 7 | 64.198     | 72.466      | 58.361    | 14.29            | 100.0                        |
| loocv_rf_classifier_harmonic_tracked_kalman_ssm                      | 7 | 64.945     | 73.711      | 58.588    | 0.0              | 100.0                        |
| loocv_ridge_error_regressor_harmonic_tracked                         | 7 | 66.479     | 77.037      | 60.195    | 14.29            | 100.0                        |
| loocv_extra_trees_classifier_harmonic_tracked                        | 7 | 67.78      | 74.318      | 61.423    | 0.0              | 100.0                        |
| loocv_histgb_classifier_dog_panting_texture_harmonic_aware_viterbi   | 7 | 69.122     | 72.003      | 62.765    | 0.0              | 66.67                        |
| loocv_model_ensemble_median                                          | 7 | 70.333     | 76.135      | 63.976    | 0.0              | 100.0                        |
| loocv_histgb_classifier_harmonic_tracked                             | 7 | 72.767     | 76.541      | 66.41     | 0.0              | 100.0                        |
| loocv_extra_trees_error_regressor_harmonic_tracked                   | 7 | 80.579     | 83.19       | 74.222    | 0.0              | 100.0                        |
| loocv_rf_error_regressor_harmonic_tracked                            | 7 | 90.309     | 92.977      | 83.952    | 0.0              | 88.89                        |
| loocv_histgb_error_regressor_harmonic_tracked                        | 7 | 91.314     | 92.23       | 84.957    | 0.0              | 100.0                        |

## Per-Video Predictions For Top 8 Selectors

| selector                                                 | video | pred_bpm | bpm_min | bpm_max | target_abs_error | range_error | within_range | selected_method | selected_region | harmonic_adjusted_pct |
| -------------------------------------------------------- | ----- | -------- | ------- | ------- | ---------------- | ----------- | ------------ | --------------- | --------------- | --------------------- |
| current_fit_extra_trees_error_regressor_harmonic_tracked | 1.mp4 | 174.902  | 170.0   | 180.0   | 0.098            | 0.0         | True         | chrom           | patch_r04_c05   | 88.89                 |
| current_fit_extra_trees_error_regressor_harmonic_tracked | 3.mp4 | 210.058  | 190.0   | 230.0   | 0.058            | 0.0         | True         | chrom           | patch_r04_c05   | 100.0                 |
| current_fit_extra_trees_error_regressor_harmonic_tracked | 4.mp4 | 115.576  | 111.0   | 120.0   | 0.076            | 0.0         | True         | chrom           | patch_r01_c05   | 0.0                   |
| current_fit_extra_trees_error_regressor_harmonic_tracked | 5.mp4 | 134.912  | 130.0   | 140.0   | 0.088            | 0.0         | True         | g_minus_r       | patch_r02_c03   | 11.11                 |
| current_fit_extra_trees_error_regressor_harmonic_tracked | 6.mp4 | 90.088   | 90.0    | 90.0    | 0.088            | 0.088       | False        | green           | patch_r03_c04   | 30.0                  |
| current_fit_extra_trees_error_regressor_harmonic_tracked | 7.mp4 | 189.185  | 182.0   | 197.0   | 0.315            | 0.0         | True         | chrom           | lower_face      | 77.78                 |
| current_fit_extra_trees_error_regressor_harmonic_tracked | 8.mp4 | 110.303  | 108.0   | 113.0   | 0.197            | 0.0         | True         | chrom           | patch_r02_c02   | 0.0                   |
| current_fit_histgb_harmonic_tracked_kalman_ssm           | 1.mp4 | 177.166  | 170.0   | 180.0   | 2.166            | 0.0         | True         | g_minus_r       | patch_r02_c02   | 88.89                 |
| current_fit_histgb_harmonic_tracked_kalman_ssm           | 3.mp4 | 230.288  | 190.0   | 230.0   | 20.288           | 0.288       | False        | pos             | patch_r03_c02   | 100.0                 |
| current_fit_histgb_harmonic_tracked_kalman_ssm           | 4.mp4 | 112.595  | 111.0   | 120.0   | 2.905            | 0.0         | True         | g_minus_r       | patch_r01_c01   | 0.0                   |
| current_fit_histgb_harmonic_tracked_kalman_ssm           | 5.mp4 | 134.405  | 130.0   | 140.0   | 0.595            | 0.0         | True         | chrom           | patch_r03_c04   | 11.11                 |
| current_fit_histgb_harmonic_tracked_kalman_ssm           | 6.mp4 | 91.723   | 90.0    | 90.0    | 1.723            | 1.723       | False        | green           | patch_r03_c02   | 50.0                  |
| current_fit_histgb_harmonic_tracked_kalman_ssm           | 7.mp4 | 193.008  | 182.0   | 197.0   | 3.508            | 0.0         | True         | g_minus_r       | patch_r04_c01   | 88.89                 |
| current_fit_histgb_harmonic_tracked_kalman_ssm           | 8.mp4 | 108.105  | 108.0   | 113.0   | 2.395            | 0.0         | True         | ica             | patch_r05_c04   | 0.0                   |
| current_fit_rf_direct_hr_regression                      | 1.mp4 | 175.0    | 170.0   | 180.0   | 0.0              | 0.0         | True         | g_minus_r       | upper_face      | 0.0                   |
| current_fit_rf_direct_hr_regression                      | 3.mp4 | 209.907  | 190.0   | 230.0   | 0.093            | 0.0         | True         | ica             | lower_face      | 0.0                   |
| current_fit_rf_direct_hr_regression                      | 4.mp4 | 115.5    | 111.0   | 120.0   | 0.0              | 0.0         | True         | pca             | patch_r01_c05   | 0.0                   |
| current_fit_rf_direct_hr_regression                      | 5.mp4 | 135.0    | 130.0   | 140.0   | 0.0              | 0.0         | True         | g_minus_r       | mid_face        | 0.0                   |
| current_fit_rf_direct_hr_regression                      | 6.mp4 | 90.0     | 90.0    | 90.0    | 0.0              | 0.0         | True         | pca             | face_full       | 0.0                   |
| current_fit_rf_direct_hr_regression                      | 7.mp4 | 189.5    | 182.0   | 197.0   | 0.0              | 0.0         | True         | pca             | face_full       | 0.0                   |
| current_fit_rf_direct_hr_regression                      | 8.mp4 | 110.859  | 108.0   | 113.0   | 0.359            | 0.0         | True         | pca             | patch_r01_c02   | 0.0                   |
| current_fit_rf_error_regressor_harmonic_tracked          | 1.mp4 | 174.902  | 170.0   | 180.0   | 0.098            | 0.0         | True         | chrom           | patch_r01_c01   | 100.0                 |
| current_fit_rf_error_regressor_harmonic_tracked          | 3.mp4 | 210.058  | 190.0   | 230.0   | 0.058            | 0.0         | True         | ica             | patch_r05_c03   | 100.0                 |
| current_fit_rf_error_regressor_harmonic_tracked          | 4.mp4 | 115.137  | 111.0   | 120.0   | 0.363            | 0.0         | True         | ica             | patch_r01_c04   | 0.0                   |
| current_fit_rf_error_regressor_harmonic_tracked          | 5.mp4 | 135.132  | 130.0   | 140.0   | 0.132            | 0.0         | True         | g_minus_r       | patch_r03_c05   | 55.56                 |
| current_fit_rf_error_regressor_harmonic_tracked          | 6.mp4 | 90.088   | 90.0    | 90.0    | 0.088            | 0.088       | False        | chrom           | patch_r05_c01   | 20.0                  |
| current_fit_rf_error_regressor_harmonic_tracked          | 7.mp4 | 189.843  | 182.0   | 197.0   | 0.343            | 0.0         | True         | chrom           | patch_r05_c01   | 88.89                 |
| current_fit_rf_error_regressor_harmonic_tracked          | 8.mp4 | 110.303  | 108.0   | 113.0   | 0.197            | 0.0         | True         | g_minus_r       | face_full       | 0.0                   |
| current_fit_rf_harmonic_tracked                          | 1.mp4 | 174.024  | 170.0   | 180.0   | 0.976            | 0.0         | True         | green           | patch_r02_c02   | 100.0                 |
| current_fit_rf_harmonic_tracked                          | 3.mp4 | 214.233  | 190.0   | 230.0   | 4.233            | 0.0         | True         | chrom           | patch_r01_c02   | 100.0                 |
| current_fit_rf_harmonic_tracked                          | 4.mp4 | 113.379  | 111.0   | 120.0   | 2.121            | 0.0         | True         | green           | patch_r01_c03   | 0.0                   |
| current_fit_rf_harmonic_tracked                          | 5.mp4 | 132.275  | 130.0   | 140.0   | 2.725            | 0.0         | True         | chrom           | patch_r04_c04   | 88.89                 |
| current_fit_rf_harmonic_tracked                          | 6.mp4 | 91.406   | 90.0    | 90.0    | 1.406            | 1.406       | False        | g_minus_r       | face_full       | 30.0                  |
| current_fit_rf_harmonic_tracked                          | 7.mp4 | 190.722  | 182.0   | 197.0   | 1.222            | 0.0         | True         | green           | patch_r04_c03   | 100.0                 |
| current_fit_rf_harmonic_tracked                          | 8.mp4 | 109.863  | 108.0   | 113.0   | 0.637            | 0.0         | True         | g_minus_r       | lower_face      | 0.0                   |
| current_fit_rf_harmonic_tracked_kalman_ssm               | 1.mp4 | 173.302  | 170.0   | 180.0   | 1.698            | 0.0         | True         | green           | patch_r02_c02   | 100.0                 |
| current_fit_rf_harmonic_tracked_kalman_ssm               | 3.mp4 | 215.72   | 190.0   | 230.0   | 5.72             | 0.0         | True         | chrom           | patch_r01_c02   | 100.0                 |
| current_fit_rf_harmonic_tracked_kalman_ssm               | 4.mp4 | 113.158  | 111.0   | 120.0   | 2.342            | 0.0         | True         | green           | patch_r01_c03   | 0.0                   |
| current_fit_rf_harmonic_tracked_kalman_ssm               | 5.mp4 | 132.249  | 130.0   | 140.0   | 2.751            | 0.0         | True         | chrom           | patch_r04_c04   | 88.89                 |
| current_fit_rf_harmonic_tracked_kalman_ssm               | 6.mp4 | 91.167   | 90.0    | 90.0    | 1.167            | 1.167       | False        | g_minus_r       | face_full       | 30.0                  |
| current_fit_rf_harmonic_tracked_kalman_ssm               | 7.mp4 | 191.295  | 182.0   | 197.0   | 1.795            | 0.0         | True         | green           | patch_r04_c03   | 100.0                 |
| current_fit_rf_harmonic_tracked_kalman_ssm               | 8.mp4 | 110.04   | 108.0   | 113.0   | 0.46             | 0.0         | True         | g_minus_r       | lower_face      | 0.0                   |
| oracle_existing_window_peak                              | 1.mp4 | 174.902  | 170.0   | 180.0   | 0.098            | 0.0         | True         | green           | patch_r01_c04   | 0.0                   |
| oracle_existing_window_peak                              | 3.mp4 | 207.861  | 190.0   | 230.0   | 2.139            | 0.0         | True         | ica             | mid_face        | 0.0                   |
| oracle_existing_window_peak                              | 4.mp4 | 115.576  | 111.0   | 120.0   | 0.076            | 0.0         | True         | pos             | patch_r01_c04   | 0.0                   |
| oracle_existing_window_peak                              | 5.mp4 | 134.912  | 130.0   | 140.0   | 0.088            | 0.0         | True         | g_minus_r       | patch_r02_c03   | 0.0                   |
| oracle_existing_window_peak                              | 6.mp4 | 90.088   | 90.0    | 90.0    | 0.088            | 0.088       | False        | green           | patch_r01_c04   | 0.0                   |
| oracle_existing_window_peak                              | 7.mp4 | 189.404  | 182.0   | 197.0   | 0.096            | 0.0         | True         | chrom           | patch_r02_c05   | 0.0                   |
| oracle_existing_window_peak                              | 8.mp4 | 110.303  | 108.0   | 113.0   | 0.197            | 0.0         | True         | g_minus_r       | face_full       | 0.0                   |
| oracle_harmonic_window_peak                              | 1.mp4 | 174.902  | 170.0   | 180.0   | 0.098            | 0.0         | True         | pca             | face_full       | 100.0                 |
| oracle_harmonic_window_peak                              | 3.mp4 | 210.058  | 190.0   | 230.0   | 0.058            | 0.0         | True         | green           | upper_face      | 100.0                 |
| oracle_harmonic_window_peak                              | 4.mp4 | 115.576  | 111.0   | 120.0   | 0.076            | 0.0         | True         | pos             | patch_r01_c04   | 0.0                   |
| oracle_harmonic_window_peak                              | 5.mp4 | 134.912  | 130.0   | 140.0   | 0.088            | 0.0         | True         | g_minus_r       | patch_r02_c03   | 0.0                   |
| oracle_harmonic_window_peak                              | 6.mp4 | 90.088   | 90.0    | 90.0    | 0.088            | 0.088       | False        | green           | patch_r01_c04   | 0.0                   |
| oracle_harmonic_window_peak                              | 7.mp4 | 189.404  | 182.0   | 197.0   | 0.096            | 0.0         | True         | chrom           | patch_r02_c05   | 0.0                   |
| oracle_harmonic_window_peak                              | 8.mp4 | 110.303  | 108.0   | 113.0   | 0.197            | 0.0         | True         | g_minus_r       | face_full       | 0.0                   |
