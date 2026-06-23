# YOLO Animal Segmentation ROI rPPG Evaluation

This run uses a pretrained YOLO segmentation model to restrict RGB extraction to detected dog/cat masks before rPPG candidate generation.

## Selector Summary

| selector | n | target_mae | target_rmse | range_mae | within_range_pct | body_window_share | residual_window_share | stable_window_share | artifact_100bpm_window_share |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| oracle_segmentation_window | 7 | 23.773 | 36.013 | 18.68 | 42.86 | 77.78 | 100.0 | 77.78 | 0.0 |
| segmentation_non_face_sqi | 7 | 42.883 | 57.819 | 36.526 | 0.0 | 100.0 | 100.0 | 100.0 | 0.0 |
| segmentation_body_sqi | 7 | 42.946 | 58.247 | 36.589 | 0.0 | 100.0 | 100.0 | 100.0 | 0.0 |
| segmentation_sqi | 7 | 43.7 | 59.799 | 37.343 | 0.0 | 55.56 | 100.0 | 88.89 | 6.25 |
| segmentation_stable_sqi | 7 | 43.951 | 59.885 | 37.594 | 0.0 | 66.67 | 100.0 | 100.0 | 0.0 |

## Per-Video Predictions

| selector | video | pred_bpm | target_abs_error | range_error | within_range | windows | body_window_share | residual_window_share | stable_window_share | artifact_100bpm_window_share | top_roi | top_state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| oracle_segmentation_window | 1.mp4 | 134.033 | 40.967 | 35.967 | False | 9 | 100.0 | 88.89 | 100.0 | 0.0 | mask_upper_body | stable_mask_roi |
| oracle_segmentation_window | 3.mp4 | 138.428 | 71.572 | 51.572 | False | 16 | 62.5 | 100.0 | 100.0 | 0.0 | animal_non_face | stable_mask_roi |
| oracle_segmentation_window | 4.mp4 | 115.137 | 0.363 | 0.0 | True | 9 | 77.78 | 100.0 | 22.22 | 0.0 | mask_left_body | motion_locked_peak |
| oracle_segmentation_window | 5.mp4 | 135.352 | 0.352 | 0.0 | True | 9 | 55.56 | 100.0 | 33.33 | 0.0 | animal_full | motion_locked_peak |
| oracle_segmentation_window | 6.mp4 | 93.164 | 3.164 | 3.164 | False | 10 | 100.0 | 100.0 | 60.0 | 30.0 | animal_non_face | stable_mask_roi |
| oracle_segmentation_window | 7.mp4 | 141.943 | 47.557 | 40.057 | False | 9 | 77.78 | 88.89 | 88.89 | 0.0 | mask_lower_body | stable_mask_roi |
| oracle_segmentation_window | 8.mp4 | 112.939 | 2.439 | 0.0 | True | 9 | 77.78 | 88.89 | 77.78 | 0.0 | mask_upper_body | stable_mask_roi |
| segmentation_body_sqi | 1.mp4 | 117.773 | 57.227 | 52.227 | False | 9 | 100.0 | 100.0 | 88.89 | 11.11 | mask_upper_body | stable_mask_roi |
| segmentation_body_sqi | 3.mp4 | 90.967 | 119.033 | 99.033 | False | 16 | 100.0 | 100.0 | 62.5 | 6.25 | mask_upper_body | stable_mask_roi |
| segmentation_body_sqi | 4.mp4 | 109.863 | 5.637 | 1.137 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | mask_left_body | stable_mask_roi |
| segmentation_body_sqi | 5.mp4 | 123.047 | 11.953 | 6.953 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | mask_neck_chest | stable_mask_roi |
| segmentation_body_sqi | 6.mp4 | 109.424 | 19.424 | 19.424 | False | 10 | 100.0 | 100.0 | 80.0 | 20.0 | mask_left_body | stable_mask_roi |
| segmentation_body_sqi | 7.mp4 | 114.697 | 74.803 | 67.303 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | mask_right_body | stable_mask_roi |
| segmentation_body_sqi | 8.mp4 | 123.047 | 12.547 | 10.047 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | mask_lower_body | stable_mask_roi |
| segmentation_non_face_sqi | 1.mp4 | 117.773 | 57.227 | 52.227 | False | 9 | 100.0 | 100.0 | 77.78 | 11.11 | animal_non_face | stable_mask_roi |
| segmentation_non_face_sqi | 3.mp4 | 90.967 | 119.033 | 99.033 | False | 16 | 100.0 | 100.0 | 50.0 | 12.5 | mask_upper_body | stable_mask_roi |
| segmentation_non_face_sqi | 4.mp4 | 108.105 | 7.395 | 2.895 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | mask_neck_chest | stable_mask_roi |
| segmentation_non_face_sqi | 5.mp4 | 123.047 | 11.953 | 6.953 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | mask_neck_chest | stable_mask_roi |
| segmentation_non_face_sqi | 6.mp4 | 109.863 | 19.863 | 19.863 | False | 10 | 100.0 | 100.0 | 80.0 | 20.0 | animal_non_face | stable_mask_roi |
| segmentation_non_face_sqi | 7.mp4 | 117.334 | 72.166 | 64.666 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | animal_non_face | stable_mask_roi |
| segmentation_non_face_sqi | 8.mp4 | 123.047 | 12.547 | 10.047 | False | 9 | 100.0 | 100.0 | 100.0 | 0.0 | mask_lower_body | stable_mask_roi |
| segmentation_sqi | 1.mp4 | 117.773 | 57.227 | 52.227 | False | 9 | 55.56 | 100.0 | 88.89 | 11.11 | animal_face_intersection | stable_mask_roi |
| segmentation_sqi | 3.mp4 | 90.527 | 119.473 | 99.473 | False | 16 | 50.0 | 100.0 | 68.75 | 6.25 | animal_face_intersection | stable_mask_roi |
| segmentation_sqi | 4.mp4 | 109.863 | 5.637 | 1.137 | False | 9 | 77.78 | 100.0 | 88.89 | 11.11 | animal_full | stable_mask_roi |
| segmentation_sqi | 5.mp4 | 123.047 | 11.953 | 6.953 | False | 9 | 88.89 | 100.0 | 100.0 | 0.0 | mask_neck_chest | stable_mask_roi |
| segmentation_sqi | 6.mp4 | 109.424 | 19.424 | 19.424 | False | 10 | 100.0 | 100.0 | 80.0 | 20.0 | mask_left_body | stable_mask_roi |
| segmentation_sqi | 7.mp4 | 106.787 | 82.713 | 75.213 | False | 9 | 44.44 | 100.0 | 100.0 | 0.0 | animal_full | stable_mask_roi |
| segmentation_sqi | 8.mp4 | 119.971 | 9.471 | 6.971 | False | 9 | 55.56 | 100.0 | 100.0 | 0.0 | animal_face_intersection | stable_mask_roi |
| segmentation_stable_sqi | 1.mp4 | 117.773 | 57.227 | 52.227 | False | 9 | 66.67 | 100.0 | 100.0 | 0.0 | animal_full | stable_mask_roi |
| segmentation_stable_sqi | 3.mp4 | 90.527 | 119.473 | 99.473 | False | 16 | 50.0 | 100.0 | 100.0 | 0.0 | animal_face_intersection | stable_mask_roi |
| segmentation_stable_sqi | 4.mp4 | 109.863 | 5.637 | 1.137 | False | 9 | 77.78 | 100.0 | 100.0 | 0.0 | animal_full | stable_mask_roi |
| segmentation_stable_sqi | 5.mp4 | 123.047 | 11.953 | 6.953 | False | 9 | 88.89 | 100.0 | 100.0 | 0.0 | mask_neck_chest | stable_mask_roi |
| segmentation_stable_sqi | 6.mp4 | 111.182 | 21.182 | 21.182 | False | 10 | 100.0 | 100.0 | 100.0 | 0.0 | mask_left_body | stable_mask_roi |
| segmentation_stable_sqi | 7.mp4 | 106.787 | 82.713 | 75.213 | False | 9 | 44.44 | 100.0 | 100.0 | 0.0 | animal_full | stable_mask_roi |
| segmentation_stable_sqi | 8.mp4 | 119.971 | 9.471 | 6.971 | False | 9 | 55.56 | 100.0 | 100.0 | 0.0 | animal_face_intersection | stable_mask_roi |

## Segmentation Stats

| video | samples | uniform_samples | windows | mask_detected_pct | median_mask_conf | median_mask_area_pct | classes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.mp4 | 957 | 956 | 9 | 100.0 | 0.905 | 25.47 | dog |
| 3.mp4 | 1451 | 1451 | 16 | 100.0 | 0.913 | 19.27 | cat, dog |
| 4.mp4 | 945 | 945 | 9 | 100.0 | 0.897 | 10.48 | dog |
| 5.mp4 | 908 | 907 | 9 | 100.0 | 0.887 | 12.89 | dog |
| 6.mp4 | 1035 | 1034 | 10 | 100.0 | 0.928 | 9.25 | dog |
| 7.mp4 | 933 | 932 | 9 | 100.0 | 0.787 | 11.28 | dog |
| 8.mp4 | 932 | 932 | 9 | 100.0 | 0.881 | 6.23 | dog |