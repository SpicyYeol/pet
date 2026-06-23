# Motion/Body Candidate rPPG Evaluation

This run expands beyond dog-face-only ROIs by adding neck/chest/body proxy ROIs and motion/background residualization.

## Methods

- ROI expansion: face, upper/mid/lower face, neck/chest, upper body, shoulders, lower-center body proxy.
- Common-mode removal: regress background RGB changes out of ROI RGB.
- Motion residualization: regress ROI frame-difference, face-box motion, background motion, and background brightness out of pulse traces.
- Motion-aware scoring: penalize peaks coherent with ROI/background/box motion and the recurring 95-105 bpm artifact.
- Pet-specific artifact state: stable low-motion, 100 bpm artifact, motion-locked peak, mouth/panting motion, body/keypoint motion.
- Pet keypoint utilization: pseudo keypoint ROIs from face box geometry until a real dog/cat keypoint model is available.

## Selector Summary

| selector | n | target_mae | target_rmse | range_mae | within_range_pct | body_window_share | keypoint_window_share | residual_window_share | artifact_100bpm_window_share | stable_window_share |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| oracle_motion_body_window | 7 | 20.967 | 34.33 | 16.106 | 42.86 | 33.33 | 56.25 | 62.5 | 0.0 | 100.0 |
| face_motion_residual_sqi | 7 | 51.603 | 66.246 | 45.246 | 0.0 | 0.0 | 0.0 | 100.0 | 11.11 | 77.78 |
| keypoint_only_pet_state_sqi | 7 | 52.294 | 67.581 | 45.937 | 0.0 | 0.0 | 100.0 | 88.89 | 0.0 | 100.0 |
| non_mouth_keypoint_sqi | 7 | 52.608 | 68.235 | 46.251 | 0.0 | 0.0 | 100.0 | 90.0 | 0.0 | 88.89 |
| pet_state_keypoint_sqi | 7 | 52.796 | 67.708 | 46.439 | 0.0 | 22.22 | 66.67 | 88.89 | 0.0 | 100.0 |
| stable_only_pet_state_sqi | 7 | 52.859 | 67.796 | 46.502 | 0.0 | 25.0 | 44.44 | 88.89 | 0.0 | 100.0 |
| motion_body_sqi | 7 | 54.303 | 68.057 | 47.946 | 0.0 | 30.0 | 55.56 | 88.89 | 0.0 | 93.75 |
| motion_reject_raw_sqi | 7 | 55.119 | 68.917 | 48.762 | 0.0 | 22.22 | 44.44 | 0.0 | 0.0 | 88.89 |
| body_motion_residual_sqi | 7 | 55.37 | 68.436 | 49.013 | 0.0 | 100.0 | 0.0 | 100.0 | 0.0 | 100.0 |
| body_only_motion_sqi | 7 | 55.558 | 68.493 | 49.201 | 0.0 | 100.0 | 0.0 | 80.0 | 11.11 | 88.89 |

## Per-Video Predictions

| selector | video | pred_bpm | bpm_min | bpm_max | bpm_target | target_abs_error | range_error | within_range | windows | body_window_share | keypoint_window_share | residual_window_share | artifact_100bpm_window_share | stable_window_share | top_state | top_roi | top_method | top_preprocess |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| body_motion_residual_sqi | 1.mp4 | 94.482 | 170.0 | 180.0 | 175.0 | 80.518 | 75.518 | False | 9 | 100.0 | 0.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | lower_center_body | chrom | bg_motion_residual |
| body_motion_residual_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 100.0 | 0.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | lower_center_body | chrom | bg_motion_residual |
| body_motion_residual_sqi | 4.mp4 | 94.922 | 111.0 | 120.0 | 115.5 | 20.578 | 16.078 | False | 9 | 100.0 | 0.0 | 100.0 | 0.0 | 88.89 | stable_low_motion | neck_chest | green | bg_motion_residual |
| body_motion_residual_sqi | 5.mp4 | 86.572 | 130.0 | 140.0 | 135.0 | 48.428 | 43.428 | False | 9 | 100.0 | 0.0 | 100.0 | 11.11 | 88.89 | stable_low_motion | upper_body | green | bg_motion_residual |
| body_motion_residual_sqi | 6.mp4 | 94.482 | 90.0 | 90.0 | 90.0 | 4.482 | 4.482 | False | 10 | 100.0 | 0.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | upper_body | green | bg_motion_residual |
| body_motion_residual_sqi | 7.mp4 | 94.922 | 182.0 | 197.0 | 189.5 | 94.578 | 87.078 | False | 9 | 100.0 | 0.0 | 100.0 | 22.22 | 77.78 | stable_low_motion | lower_center_body | chrom | bg_motion_residual |
| body_motion_residual_sqi | 8.mp4 | 90.527 | 108.0 | 113.0 | 110.5 | 19.973 | 17.473 | False | 9 | 100.0 | 0.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | lower_center_body | green | bg_motion_residual |
| body_only_motion_sqi | 1.mp4 | 94.482 | 170.0 | 180.0 | 175.0 | 80.518 | 75.518 | False | 9 | 100.0 | 0.0 | 77.78 | 11.11 | 88.89 | stable_low_motion | neck_chest | chrom | bg_motion_residual |
| body_only_motion_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 100.0 | 0.0 | 81.25 | 0.0 | 100.0 | stable_low_motion | lower_center_body | chrom | bg_motion_residual |
| body_only_motion_sqi | 4.mp4 | 94.922 | 111.0 | 120.0 | 115.5 | 20.578 | 16.078 | False | 9 | 100.0 | 0.0 | 77.78 | 11.11 | 77.78 | stable_low_motion | neck_chest | green | bg_motion_residual |
| body_only_motion_sqi | 5.mp4 | 86.572 | 130.0 | 140.0 | 135.0 | 48.428 | 43.428 | False | 9 | 100.0 | 0.0 | 100.0 | 11.11 | 88.89 | stable_low_motion | upper_body | green | bg_motion_residual |
| body_only_motion_sqi | 6.mp4 | 94.482 | 90.0 | 90.0 | 90.0 | 4.482 | 4.482 | False | 10 | 100.0 | 0.0 | 80.0 | 0.0 | 100.0 | stable_low_motion | upper_body | green | bg_motion_residual |
| body_only_motion_sqi | 7.mp4 | 94.922 | 182.0 | 197.0 | 189.5 | 94.578 | 87.078 | False | 9 | 100.0 | 0.0 | 100.0 | 22.22 | 77.78 | stable_low_motion | lower_center_body | chrom | bg_motion_residual |
| body_only_motion_sqi | 8.mp4 | 89.209 | 108.0 | 113.0 | 110.5 | 21.291 | 18.791 | False | 9 | 100.0 | 0.0 | 66.67 | 0.0 | 100.0 | stable_low_motion | lower_center_body | green | bg_motion_residual |
| face_motion_residual_sqi | 1.mp4 | 94.482 | 170.0 | 180.0 | 175.0 | 80.518 | 75.518 | False | 9 | 0.0 | 0.0 | 100.0 | 11.11 | 88.89 | stable_low_motion | upper_face | green | bg_motion_residual |
| face_motion_residual_sqi | 3.mp4 | 89.209 | 190.0 | 230.0 | 210.0 | 120.791 | 100.791 | False | 16 | 0.0 | 0.0 | 100.0 | 0.0 | 81.25 | stable_low_motion | lower_face | green | bg_motion_residual |
| face_motion_residual_sqi | 4.mp4 | 105.029 | 111.0 | 120.0 | 115.5 | 10.471 | 5.971 | False | 9 | 0.0 | 0.0 | 100.0 | 33.33 | 66.67 | stable_low_motion | face_full | green | bg_motion_residual |
| face_motion_residual_sqi | 5.mp4 | 88.77 | 130.0 | 140.0 | 135.0 | 46.23 | 41.23 | False | 9 | 0.0 | 0.0 | 100.0 | 11.11 | 77.78 | stable_low_motion | face_full | green | bg_motion_residual |
| face_motion_residual_sqi | 6.mp4 | 92.725 | 90.0 | 90.0 | 90.0 | 2.725 | 2.725 | False | 10 | 0.0 | 0.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | face_full | chrom | bg_motion_residual |
| face_motion_residual_sqi | 7.mp4 | 105.029 | 182.0 | 197.0 | 189.5 | 84.471 | 76.971 | False | 9 | 0.0 | 0.0 | 100.0 | 0.0 | 77.78 | stable_low_motion | face_full | green | bg_motion_residual |
| face_motion_residual_sqi | 8.mp4 | 94.482 | 108.0 | 113.0 | 110.5 | 16.018 | 13.518 | False | 9 | 0.0 | 0.0 | 100.0 | 33.33 | 66.67 | stable_low_motion | face_full | green | bg_motion_residual |
| keypoint_only_pet_state_sqi | 1.mp4 | 94.043 | 170.0 | 180.0 | 175.0 | 80.957 | 75.957 | False | 9 | 0.0 | 100.0 | 88.89 | 0.0 | 100.0 | stable_low_motion | left_ear_base_proxy | green | bg_motion_residual |
| keypoint_only_pet_state_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 0.0 | 100.0 | 50.0 | 0.0 | 93.75 | stable_low_motion | left_ear_base_proxy | chrom | bg_motion_residual |
| keypoint_only_pet_state_sqi | 4.mp4 | 105.029 | 111.0 | 120.0 | 115.5 | 10.471 | 5.971 | False | 9 | 0.0 | 100.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | muzzle_proxy | chrom | bg_motion_residual |
| keypoint_only_pet_state_sqi | 5.mp4 | 94.043 | 130.0 | 140.0 | 135.0 | 40.957 | 35.957 | False | 9 | 0.0 | 100.0 | 88.89 | 0.0 | 77.78 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| keypoint_only_pet_state_sqi | 6.mp4 | 92.725 | 90.0 | 90.0 | 90.0 | 2.725 | 2.725 | False | 10 | 0.0 | 100.0 | 80.0 | 0.0 | 100.0 | stable_low_motion | right_ear_base_proxy | chrom | bg_motion_residual |
| keypoint_only_pet_state_sqi | 7.mp4 | 93.604 | 182.0 | 197.0 | 189.5 | 95.896 | 88.396 | False | 9 | 0.0 | 100.0 | 100.0 | 0.0 | 55.56 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| keypoint_only_pet_state_sqi | 8.mp4 | 94.482 | 108.0 | 113.0 | 110.5 | 16.018 | 13.518 | False | 9 | 0.0 | 100.0 | 88.89 | 0.0 | 100.0 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| motion_body_sqi | 1.mp4 | 94.043 | 170.0 | 180.0 | 175.0 | 80.957 | 75.957 | False | 9 | 33.33 | 55.56 | 88.89 | 0.0 | 100.0 | stable_low_motion | left_ear_base_proxy | chrom | bg_motion_residual |
| motion_body_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 25.0 | 62.5 | 62.5 | 0.0 | 93.75 | stable_low_motion | left_ear_base_proxy | chrom | bg_motion_residual |
| motion_body_sqi | 4.mp4 | 94.482 | 111.0 | 120.0 | 115.5 | 21.018 | 16.518 | False | 9 | 11.11 | 66.67 | 88.89 | 0.0 | 88.89 | stable_low_motion | muzzle_proxy | green | bg_motion_residual |
| motion_body_sqi | 5.mp4 | 90.527 | 130.0 | 140.0 | 135.0 | 44.473 | 39.473 | False | 9 | 44.44 | 33.33 | 88.89 | 0.0 | 77.78 | stable_low_motion | upper_body | green | bg_motion_residual |
| motion_body_sqi | 6.mp4 | 91.846 | 90.0 | 90.0 | 90.0 | 1.846 | 1.846 | False | 10 | 30.0 | 30.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | face_full | chrom | bg_motion_residual |
| motion_body_sqi | 7.mp4 | 94.922 | 182.0 | 197.0 | 189.5 | 94.578 | 87.078 | False | 9 | 22.22 | 55.56 | 100.0 | 0.0 | 66.67 | stable_low_motion | left_eye_proxy | green | bg_motion_residual |
| motion_body_sqi | 8.mp4 | 92.285 | 108.0 | 113.0 | 110.5 | 18.215 | 15.715 | False | 9 | 66.67 | 22.22 | 77.78 | 0.0 | 100.0 | stable_low_motion | lower_center_body | green | bg_motion_residual |
| motion_reject_raw_sqi | 1.mp4 | 89.209 | 170.0 | 180.0 | 175.0 | 85.791 | 80.791 | False | 9 | 0.0 | 88.89 | 0.0 | 11.11 | 88.89 | stable_low_motion | right_ear_base_proxy | green | raw |
| motion_reject_raw_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 18.75 | 75.0 | 0.0 | 0.0 | 93.75 | stable_low_motion | nose_bridge_proxy | chrom | raw |
| motion_reject_raw_sqi | 4.mp4 | 94.482 | 111.0 | 120.0 | 115.5 | 21.018 | 16.518 | False | 9 | 22.22 | 44.44 | 0.0 | 0.0 | 88.89 | stable_low_motion | muzzle_proxy | green | raw |
| motion_reject_raw_sqi | 5.mp4 | 90.527 | 130.0 | 140.0 | 135.0 | 44.473 | 39.473 | False | 9 | 22.22 | 44.44 | 0.0 | 22.22 | 55.56 | stable_low_motion | nose_bridge_proxy | green | raw |
| motion_reject_raw_sqi | 6.mp4 | 92.285 | 90.0 | 90.0 | 90.0 | 2.285 | 2.285 | False | 10 | 30.0 | 30.0 | 0.0 | 0.0 | 100.0 | stable_low_motion | upper_face | green | raw |
| motion_reject_raw_sqi | 7.mp4 | 94.922 | 182.0 | 197.0 | 189.5 | 94.578 | 87.078 | False | 9 | 11.11 | 66.67 | 0.0 | 0.0 | 55.56 | stable_low_motion | nose_bridge_proxy | green | raw |
| motion_reject_raw_sqi | 8.mp4 | 91.846 | 108.0 | 113.0 | 110.5 | 18.654 | 16.154 | False | 9 | 77.78 | 22.22 | 0.0 | 0.0 | 100.0 | stable_low_motion | neck_chest | green | raw |
| non_mouth_keypoint_sqi | 1.mp4 | 90.088 | 170.0 | 180.0 | 175.0 | 84.912 | 79.912 | False | 9 | 0.0 | 100.0 | 100.0 | 11.11 | 88.89 | stable_low_motion | left_ear_base_proxy | green | bg_motion_residual |
| non_mouth_keypoint_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 0.0 | 100.0 | 50.0 | 0.0 | 100.0 | stable_low_motion | right_eye_proxy | chrom | bg_motion_residual |
| non_mouth_keypoint_sqi | 4.mp4 | 106.787 | 111.0 | 120.0 | 115.5 | 8.713 | 4.213 | False | 9 | 0.0 | 100.0 | 100.0 | 11.11 | 88.89 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| non_mouth_keypoint_sqi | 5.mp4 | 94.043 | 130.0 | 140.0 | 135.0 | 40.957 | 35.957 | False | 9 | 0.0 | 100.0 | 88.89 | 0.0 | 77.78 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| non_mouth_keypoint_sqi | 6.mp4 | 92.725 | 90.0 | 90.0 | 90.0 | 2.725 | 2.725 | False | 10 | 0.0 | 100.0 | 90.0 | 0.0 | 100.0 | stable_low_motion | right_ear_base_proxy | chrom | bg_motion_residual |
| non_mouth_keypoint_sqi | 7.mp4 | 93.604 | 182.0 | 197.0 | 189.5 | 95.896 | 88.396 | False | 9 | 0.0 | 100.0 | 100.0 | 0.0 | 55.56 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| non_mouth_keypoint_sqi | 8.mp4 | 94.482 | 108.0 | 113.0 | 110.5 | 16.018 | 13.518 | False | 9 | 0.0 | 100.0 | 77.78 | 0.0 | 100.0 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| oracle_motion_body_window | 1.mp4 | 151.611 | 170.0 | 180.0 | 175.0 | 23.389 | 18.389 | False | 9 | 44.44 | 33.33 | 55.56 | 0.0 | 100.0 | stable_low_motion | neck_chest | chrom | bg_motion_residual |
| oracle_motion_body_window | 3.mp4 | 137.109 | 190.0 | 230.0 | 210.0 | 72.891 | 52.891 | False | 16 | 43.75 | 56.25 | 62.5 | 0.0 | 87.5 | stable_low_motion | lower_center_body | chrom | bg_motion_residual |
| oracle_motion_body_window | 4.mp4 | 114.697 | 111.0 | 120.0 | 115.5 | 0.803 | 0.0 | True | 9 | 22.22 | 77.78 | 88.89 | 0.0 | 100.0 | stable_low_motion | nose_bridge_proxy | chrom | bg_motion_residual |
| oracle_motion_body_window | 5.mp4 | 134.473 | 130.0 | 140.0 | 135.0 | 0.527 | 0.0 | True | 9 | 33.33 | 55.56 | 88.89 | 0.0 | 66.67 | stable_low_motion | left_ear_base_proxy | chrom | bg_motion_residual |
| oracle_motion_body_window | 6.mp4 | 90.088 | 90.0 | 90.0 | 90.0 | 0.088 | 0.088 | False | 10 | 20.0 | 70.0 | 50.0 | 0.0 | 100.0 | stable_low_motion | lower_center_body | green | bg_motion_residual |
| oracle_motion_body_window | 7.mp4 | 140.625 | 182.0 | 197.0 | 189.5 | 48.875 | 41.375 | False | 9 | 11.11 | 66.67 | 44.44 | 0.0 | 66.67 | stable_low_motion | muzzle_proxy | chrom | raw |
| oracle_motion_body_window | 8.mp4 | 110.303 | 108.0 | 113.0 | 110.5 | 0.197 | 0.0 | True | 9 | 44.44 | 33.33 | 66.67 | 0.0 | 100.0 | stable_low_motion | lower_center_body | chrom | bg_motion_residual |
| pet_state_keypoint_sqi | 1.mp4 | 94.043 | 170.0 | 180.0 | 175.0 | 80.957 | 75.957 | False | 9 | 22.22 | 66.67 | 88.89 | 0.0 | 100.0 | stable_low_motion | left_ear_base_proxy | green | bg_motion_residual |
| pet_state_keypoint_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 18.75 | 68.75 | 56.25 | 0.0 | 93.75 | stable_low_motion | left_ear_base_proxy | chrom | bg_motion_residual |
| pet_state_keypoint_sqi | 4.mp4 | 105.029 | 111.0 | 120.0 | 115.5 | 10.471 | 5.971 | False | 9 | 11.11 | 66.67 | 88.89 | 0.0 | 100.0 | stable_low_motion | left_ear_base_proxy | green | bg_motion_residual |
| pet_state_keypoint_sqi | 5.mp4 | 90.527 | 130.0 | 140.0 | 135.0 | 44.473 | 39.473 | False | 9 | 44.44 | 44.44 | 88.89 | 0.0 | 88.89 | stable_low_motion | upper_body | green | bg_motion_residual |
| pet_state_keypoint_sqi | 6.mp4 | 91.846 | 90.0 | 90.0 | 90.0 | 1.846 | 1.846 | False | 10 | 30.0 | 30.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | face_full | chrom | bg_motion_residual |
| pet_state_keypoint_sqi | 7.mp4 | 94.922 | 182.0 | 197.0 | 189.5 | 94.578 | 87.078 | False | 9 | 22.22 | 77.78 | 100.0 | 0.0 | 66.67 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| pet_state_keypoint_sqi | 8.mp4 | 92.285 | 108.0 | 113.0 | 110.5 | 18.215 | 15.715 | False | 9 | 66.67 | 22.22 | 77.78 | 0.0 | 100.0 | stable_low_motion | lower_center_body | green | bg_motion_residual |
| stable_only_pet_state_sqi | 1.mp4 | 94.043 | 170.0 | 180.0 | 175.0 | 80.957 | 75.957 | False | 9 | 22.22 | 66.67 | 88.89 | 0.0 | 100.0 | stable_low_motion | left_ear_base_proxy | green | bg_motion_residual |
| stable_only_pet_state_sqi | 3.mp4 | 90.967 | 190.0 | 230.0 | 210.0 | 119.033 | 99.033 | False | 16 | 25.0 | 62.5 | 62.5 | 0.0 | 100.0 | stable_low_motion | left_ear_base_proxy | chrom | bg_motion_residual |
| stable_only_pet_state_sqi | 4.mp4 | 105.029 | 111.0 | 120.0 | 115.5 | 10.471 | 5.971 | False | 9 | 11.11 | 66.67 | 88.89 | 0.0 | 100.0 | stable_low_motion | left_ear_base_proxy | green | bg_motion_residual |
| stable_only_pet_state_sqi | 5.mp4 | 90.527 | 130.0 | 140.0 | 135.0 | 44.473 | 39.473 | False | 9 | 44.44 | 33.33 | 88.89 | 0.0 | 100.0 | stable_low_motion | upper_body | green | bg_motion_residual |
| stable_only_pet_state_sqi | 6.mp4 | 91.846 | 90.0 | 90.0 | 90.0 | 1.846 | 1.846 | False | 10 | 30.0 | 30.0 | 100.0 | 0.0 | 100.0 | stable_low_motion | face_full | chrom | bg_motion_residual |
| stable_only_pet_state_sqi | 7.mp4 | 94.482 | 182.0 | 197.0 | 189.5 | 95.018 | 87.518 | False | 9 | 22.22 | 44.44 | 88.89 | 0.0 | 100.0 | stable_low_motion | nose_bridge_proxy | green | bg_motion_residual |
| stable_only_pet_state_sqi | 8.mp4 | 92.285 | 108.0 | 113.0 | 110.5 | 18.215 | 15.715 | False | 9 | 66.67 | 22.22 | 77.78 | 0.0 | 100.0 | stable_low_motion | lower_center_body | green | bg_motion_residual |

## Extraction Stats

| video | windows | duration_sec | samples | roi_count | median_face_box_motion | median_background_motion |
| --- | --- | --- | --- | --- | --- | --- |
| 1.mp4 | 9 | 63.667 | 956 | 13 | 0.0 | 0.002549 |
| 3.mp4 | 16 | 96.667 | 1451 | 13 | 0.0 | 0.004171 |
| 4.mp4 | 9 | 62.933 | 945 | 13 | 0.0 | 0.003714 |
| 5.mp4 | 9 | 60.4 | 907 | 13 | 0.0 | 0.006277 |
| 6.mp4 | 10 | 68.867 | 1034 | 13 | 0.0 | 0.004968 |
| 7.mp4 | 9 | 62.067 | 932 | 13 | 0.0 | 0.002524 |
| 8.mp4 | 9 | 62.067 | 932 | 13 | 0.0 | 0.002346 |