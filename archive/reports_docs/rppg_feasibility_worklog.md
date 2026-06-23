# rPPG Feasibility Worklog

## Goal

Check single-view RGB feasibility first, then extend the same evaluation frame to multi-view RGB and RGB+IR.

## Current Plan

- [x] Inspect existing OCR labels, baseline rPPG script, and UI structure.
- [x] Add a single-view RGB candidate-bank evaluator.
- [x] Generate candidate/SQI/tracker/oracle metrics under `reports/rppg_single_view_sqi`.
- [x] Add a UI analysis screen so results can be reviewed without opening CSV files.
- [x] Run available verification commands and record any blockers.

## Proposed Single-View RGB Method

1. Generate many candidate traces from face ROIs and face sub-patches.
2. Run multiple classical signal transforms per candidate trace, including Green, G-R, CHROM, POS, PCA, and ICA.
3. Score candidate windows with signal-quality features instead of relying on BSS alone.
4. Track window-level BPM candidates with a smoothness penalty to avoid jumping to motion peaks.
5. Report baseline, SQI-selected, tracked, train-calibrated, and oracle upper-bound performance separately.

## Notes

- Existing baseline result: `reports/rppg_eval_min80/rppg_evaluation_report.md`.
- Existing OCR labels: `dataset_front/video_labels_ocr.csv`.
- Existing dog-face model: `DogFaceModel_Deploy/best.pt`.
- Latest single-view evaluator: `tools/evaluate_single_view_sqi.py`.
- Latest UI data artifact: `ui/src/generated/rppgSingleViewSqi.ts`.

## Latest Results

- Report: `reports/rppg_single_view_sqi/single_view_sqi_report.md`.
- UI tab: `Feasibility`.
- The UI now loads actual `dataset_front/*.mp4`, OCR preview frames/sheets/crops, selector chart images, and `dataset_multi/*.mp4` assets through Vite `/@fs` URLs.
- Vite URL checked: `http://127.0.0.1:3000/`.
- Python compile check passed for all scripts in `tools`.
- UI checks passed: `npm.cmd run build`, `npm.cmd run lint`.
- Asset checks passed over HTTP: `dataset_front/1.mp4`, `reports/ocr_preview/frames/1_0.5.jpg`, and `reports/rppg_single_view_sqi/selector_ranking.png`.
- Playwright package was not installed, so no browser screenshot was captured.

## 2026-05-25 UI Update

- Added actual measured waveform data to `ui/src/generated/rppgSingleViewSqi.ts`.
- Waveform source: cached `face_full` RGB trace from `reports/rppg_single_view_sqi/cache/*_candidate_traces.npz`.
- Displayed traces: normalized RGB, POS pulse, CHROM pulse.
- Added window-level HR tracks for POS face_full, CHROM face_full, SQI top-window, and oracle window peak.
- UI checks passed: `npm.cmd run lint`, `npm.cmd run build`.
- Dev server check passed: `http://127.0.0.1:3000/` returned 200 and generated data contains `measurementSeries`.

## 2026-05-25 Trained Selector Update

- Added a current-label trained RandomForest peak selector.
- Model artifact: `reports/rppg_single_view_sqi/models/current_label_peak_selector.joblib`.
- Metadata: `reports/rppg_single_view_sqi/models/current_label_peak_selector_metadata.json`.
- Positive label definition: `range_error <= 3 bpm OR target_abs_error <= 5 bpm`.
- Current-label fitted result: `trained_tracked_selector_current` target MAE 2.499 bpm, range MAE 0.075 bpm, within-range 85.71%.
- Conservative LOOCV result remains much worse, so this is calibration evidence, not an unbiased deployment estimate.
- UI now shows trained selector rows and an HR track overlay for the trained selector.

## 2026-05-25 Region Overlay Update

- Added selected ROI overlay generation to `tools/evaluate_single_view_sqi.py`.
- Overlay artifacts: `reports/rppg_single_view_sqi/region_overlays/*_region_overlay.jpg`.
- Each overlay shows the tracked dog-face box, the 5x5 candidate patch grid, the trained selector region, and the label-leaked oracle region.
- UI now shows the overlay for the selected front RGB video and a concise explanation of how the selector was trained.
- Training recipe shown in UI: 49,416 candidate rows, 4,951 positive rows, 25 features, RandomForest, positive if `range_error <= 3 bpm OR target_abs_error <= 5 bpm`.

## 2026-05-25 Multi-View RGB Update

- Added `tools/evaluate_multiview_rgb.py`.
- Applied the current-label trained single-view selector to `dataset_multi/front.mp4`, `left.mp4`, `right.mp4`, and `up.mp4`.
- Multi-view outputs are under `reports/rppg_multiview_rgb`.
- Important: these videos do not have synchronized ground-truth HR labels, so this is a view consistency/stability check, not an accuracy estimate.
- View summaries:
  - front: 134.033 bpm, 4 windows, detector 91.83%, top `chrom / patch_r03_c05`.
  - left: 109.424 bpm, 2 windows, detector 61.33%, top `chrom / face_full`.
  - right: 108.984 bpm, 2 windows, detector 68.33%, top `green / patch_r01_c04`.
  - up: 110.303 bpm, 3 windows, detector 76.33%, top `green / patch_r02_c03`.
- Fusion track: `reports/rppg_multiview_rgb/multiview_fusion.csv`.
- Multi-view HR plot: `reports/rppg_multiview_rgb/multiview_hr_track.png`.
- Multi-view ROI overlays: `reports/rppg_multiview_rgb/region_overlays/*_region_overlay.jpg`.
- UI now shows multi-view view cards, ROI overlays, fusion-window table, HR plot, and artifact links.
- Verification passed: Python compile checks, `npm.cmd run lint`, `npm.cmd run build`, and localhost HTTP checks for UI/assets.

## 2026-05-25 Single-View Model Sweep

- Added `tools/experiment_single_view_models.py`.
- Tested additional single-view selectors/regressors on the existing candidate bank:
  - SQI top/tracked rechecks.
  - Harmonic expansion: half/original/1.5x/double peak candidates.
  - RandomForest classifier ranker.
  - ExtraTrees classifier ranker.
  - HistGradientBoosting classifier ranker.
  - RandomForest / ExtraTrees / HistGB / Ridge error regressors.
  - RandomForest and HistGB direct HR regressors.
  - Constant-HR Kalman/SSM smoothing over selected window tracks.
  - Median ensemble over LOOCV selectors.
  - Current-fit calibration models and label-leaked oracle checks.
- Outputs:
  - `reports/rppg_single_view_experiments/single_view_experiment_summary.csv`
  - `reports/rppg_single_view_experiments/single_view_experiment_predictions.csv`
  - `reports/rppg_single_view_experiments/single_view_experiment_report.md`
  - `reports/rppg_single_view_experiments/single_view_experiment_ranking.png`
  - `ui/src/generated/rppgSingleViewExperiments.ts`
- Best current-fit calibration: `current_fit_rf_direct_hr_regression`, target MAE 0.054 bpm, range MAE 0.0 bpm, within-range 100%.
- Best candidate-bank oracle with harmonic expansion: target MAE 0.100 bpm, range MAE 0.013 bpm.
- Best fair LOOCV row remains weak: `loocv_rf_classifier_tracked`, target MAE 45.959 bpm, range MAE 39.602 bpm.
- Conclusion: single-view RGB candidate bank contains the correct HR information, but seven labeled videos are insufficient to learn a deployable selector. More labels or a stronger non-label prior is required before treating the current-fit model as generalizable.
- UI now includes the additional single-view model sweep table, ranking plot, and artifact links.

## 2026-05-25 Single-View Prior Sweep: Harmonic/Consensus/Motion

- Extended `tools/experiment_single_view_models.py` with the three requested non-label priors:
  - Harmonic-aware Viterbi: temporal tracker over half/original/1.5x/double peak candidates.
  - Spatial/method consensus: method count, region count, patch-neighbor count, localized consensus, and global artifact ratio.
  - Motion-residual rejection: detector-box motion spectrum peak and overlap penalty.
- Added enhanced LOOCV models using those prior features.
- Results did not improve generalization:
  - `harmonic_aware_viterbi_quality`: target MAE 49.657 bpm, range MAE 43.300 bpm.
  - `localized_consensus_motion_reject_harmonic_aware_viterbi_kalman_ssm`: target MAE 49.995 bpm, range MAE 43.637 bpm.
  - `loocv_rf_error_regressor_consensus_motion_harmonic_aware_viterbi`: target MAE 58.270 bpm, range MAE 51.913 bpm.
  - Existing best fair LOOCV remains `loocv_rf_classifier_tracked`: target MAE 45.897 bpm, range MAE 39.540 bpm.
- Failure mode: unlabeled consensus still favors the strong ~100 bpm artifact in most videos; localized consensus and detector-motion rejection were not enough to separate physiological HR from global/appearance-driven peaks.

## 2026-05-25 Dog-Specific Artifact Sweep

- Added dog-specific priors to `tools/experiment_single_view_models.py`:
  - Panting/mouth-motion score from lower-face RGB and lower-face redness traces.
  - Respiration/panting overlap penalty against candidate HR and harmonic frequencies.
  - Mouth/lower-face region penalty for `lower_face`, row-4/row-5 patches, and central mouth patches.
  - Fur/texture score from actual frame crops using edge density and Laplacian texture.
  - Upper/mid-face preference score.
- Added selectors:
  - `dog_panting_texture_reject_harmonic_aware_viterbi`
  - `dog_panting_texture_reject_harmonic_aware_viterbi_kalman_ssm`
  - `dog_upper_mid_mouth_reject_harmonic_aware_viterbi`
  - dog-prior LOOCV RF/HistGB classifier and RF error-regressor variants.
- Results still did not improve the fair LOOCV baseline:
  - `dog_panting_texture_reject_harmonic_aware_viterbi`: target MAE 49.594 bpm, range MAE 43.237 bpm.
  - `dog_upper_mid_mouth_reject_harmonic_aware_viterbi`: target MAE 50.975 bpm, range MAE 44.618 bpm.
  - `loocv_rf_error_regressor_dog_panting_texture_harmonic_aware_viterbi`: target MAE 48.961 bpm, range MAE 42.622 bpm.
  - Existing best fair LOOCV remains `loocv_rf_classifier_tracked`: target MAE 46.148 bpm, range MAE 39.791 bpm.
- Failure mode persists: dog-specific rejection mostly changes which wrong peak is selected, but the unsupervised selectors still collapse toward ~97-101 bpm in many videos. The current features do not provide enough evidence to identify the correct physiological peak without additional labels or stronger anatomical segmentation.

## 2026-05-26 GT-Free Feasibility Evidence

- Added `tools/evaluate_gt_free_feasibility.py`.
- Purpose: when synchronized HR ground truth is not available, evaluate whether RGB rPPG candidates behave more like a physiological signal than a camera/background artifact.
- Checks:
  - Spatial negative control: selected face/patch peak vs fixed background ROI peak.
  - Time-order negative control: same RGB samples are shuffled and the peak should weaken.
  - Perturbation robustness: brightness normalization and periodic sample-drop should not move BPM much.
  - Multi-view agreement: reject isolated view outliers and check whether remaining views agree within 12 bpm.
- Outputs:
  - `reports/rppg_gt_free_feasibility/gt_free_single_view_summary.csv`
  - `reports/rppg_gt_free_feasibility/gt_free_single_view_windows.csv`
  - `reports/rppg_gt_free_feasibility/gt_free_multiview_agreement.csv`
  - `reports/rppg_gt_free_feasibility/gt_free_feasibility_report.md`
  - `reports/rppg_gt_free_feasibility/gt_free_evidence_ranking.png`
  - `reports/rppg_gt_free_feasibility/gt_free_multiview_agreement.png`
  - `ui/src/generated/rppgGtFreeFeasibility.ts`
- Result:
  - Single-view GT-free evidence is inconclusive for all seven usable videos.
  - Median evidence score: 65.8/100; best score: 76.0/100.
  - Main rejection reason: stable ~100 bpm artifact risk. Several videos also show background peaks strong enough to compete with the selected face/patch peak.
  - Multi-view agreement after outlier rejection: 66.7% of windows with at least two views, still inconclusive.
- UI now includes GT-free evidence ranking, per-video rejection reasons, and outlier-rejected multi-view agreement.

## 2026-05-26 Motion/Body ROI Attempts

- Added `tools/evaluate_motion_body_candidates.py`.
- Motivation: rPPG does not have to be face-only; dog neck/chest/body regions may contain usable color variation, and dog motion should be modeled explicitly.
- Added body proxy ROIs based on the tracked face box and frame geometry:
  - `neck_chest`
  - `upper_body`
  - `lower_center_body`
  - plus face/lower-face/upper-face baselines.
- Added artifact reduction variants:
  - raw RGB rPPG.
  - background RGB common-mode residualization.
  - background + ROI motion + face-box motion residualization.
  - motion-coherence penalties against ROI frame-difference, face-box motion, and background motion.
- Outputs:
  - `reports/rppg_motion_body_candidates/motion_body_candidates.csv`
  - `reports/rppg_motion_body_candidates/motion_body_summary.csv`
  - `reports/rppg_motion_body_candidates/motion_body_predictions.csv`
  - `reports/rppg_motion_body_candidates/motion_body_report.md`
  - `reports/rppg_motion_body_candidates/motion_body_selector_summary.png`
  - `reports/rppg_motion_body_candidates/motion_body_predictions.png`
  - `ui/src/generated/rppgMotionBodyCandidates.ts`
- Result:
  - Body proxy candidates do contain HR-near peaks in some windows: label-leaked body windows hit within 5 bpm in about 52.1% of windows, similar to face candidates in this reduced ROI/method run.
  - Strong body examples: `4.mp4`, `5.mp4`, `6.mp4`, and `8.mp4` have many body-proxy windows near the OCR HR range.
  - Heuristic selection still fails: best non-oracle motion/body selector range MAE is 43.551 bpm, within-range 0%.
  - Motion/background residualization reduced the explicit 95-105 bpm artifact share in selected rows, but the selector mostly moved to other low-HR artifacts around 90-105 bpm instead of true HR.
- Interpretation:
  - Body ROIs are worth keeping as candidate sources.
  - Current body proxy boxes are not anatomical segmentation; they can include table/background/handler pixels.
  - The next meaningful improvement would need animal body/skin/low-fur segmentation or synchronized GT to learn which body windows are valid.

## 2026-05-26 Pet Artifact State + Pseudo Keypoint Update

- Extended `tools/evaluate_motion_body_candidates.py` with pet-specific artifact states:
  - `stable_low_motion`
  - `100bpm_artifact`
  - `motion_locked_peak`
  - `mouth_panting_motion`
  - `body_motion`
  - `keypoint_motion`
- Added face-box pseudo keypoint ROIs:
  - `left_eye_proxy`
  - `right_eye_proxy`
  - `nose_bridge_proxy`
  - `muzzle_proxy`
  - `mouth_proxy`
  - `left_ear_base_proxy`
  - `right_ear_base_proxy`
- Current run uses pseudo keypoints because no local pet keypoint/pose model is available in the workspace. The generated UI data records `keypointSource: face_box_pseudo_keypoint`.
- Candidate state distribution:
  - `stable_low_motion`: 4,323
  - `100bpm_artifact`: 2,320
  - `motion_locked_peak`: 383
  - `mouth_panting_motion`: 196
  - `keypoint_motion`: 162
- Result:
  - `keypoint_only_pet_state_sqi`: range MAE 45.937 bpm, within-range 0%.
  - `pet_state_keypoint_sqi`: range MAE 46.439 bpm, within-range 0%.
  - Label-leaked oracle still finds some correct windows using keypoint/body candidates, but not enough for a general selector.
- Interpretation:
  - Pet-specific artifact states are useful diagnostically: they show how many candidate peaks are 100 bpm artifacts or motion-locked.
  - Pseudo keypoints alone are not enough; true pet keypoint/segmentation is likely needed because face-box geometry does not guarantee eye/nose/mouth/ear alignment across pose, breed, and occlusion.
  - This supports the dataset request: collect synchronized GT plus pet keypoints/segmentation labels, or train a pet keypoint model first and use it to define stable anatomical ROIs.

## 2026-05-26 YOLO Animal Segmentation ROI

- Downloaded and used `yolo11n-seg.pt` with Ultralytics.
- Added `tools/evaluate_segmentation_roi_candidates.py`.
- Purpose: replace proxy body boxes with real animal masks so RGB extraction excludes table/background/handler pixels.
- Segmentation ROIs:
  - `animal_full`
  - `animal_non_face`
  - `animal_face_intersection`
  - `mask_neck_chest`
  - `mask_upper_body`
  - `mask_lower_body`
  - `mask_left_body`
  - `mask_right_body`
- Outputs:
  - `reports/rppg_segmentation_roi/segmentation_candidates.csv`
  - `reports/rppg_segmentation_roi/segmentation_summary.csv`
  - `reports/rppg_segmentation_roi/segmentation_predictions.csv`
  - `reports/rppg_segmentation_roi/segmentation_stats.csv`
  - `reports/rppg_segmentation_roi/segmentation_roi_report.md`
  - `reports/rppg_segmentation_roi/segmentation_selector_summary.png`
  - `ui/src/generated/rppgSegmentationRoi.ts`
- Result:
  - YOLO animal mask detection was 100% on all seven usable videos.
  - Median mask confidence ranged roughly 0.787-0.928.
  - Best non-oracle segmentation selector: `segmentation_non_face_sqi`, range MAE 36.526 bpm, within-range 0%.
  - Segmentation body/non-face selectors reduced explicit 100 bpm artifact to 0%, but still selected wrong low-HR peaks for high-HR videos.
  - Label-leaked segmentation oracle reaches within-range on 3/7 videos (`4.mp4`, `5.mp4`, `8.mp4`) but fails on high-HR videos.
- Interpretation:
  - Real segmentation solves part of the ROI contamination problem.
  - It does not solve correct peak selection by itself.
  - The next needed model is pet keypoint/landmark or anatomical segmentation, not just generic animal foreground segmentation.

## 2026-05-26 Pet Keypoint Provider Readiness

- Attempted real pet keypoint provider setup in the current workspace.
- Environment:
  - Python 3.14.3
  - `torch` available with CUDA.
  - `ultralytics` available.
  - `mmpose`, `deeplabcut`, and `sleap` are not installed.
- Install feasibility:
  - `mmpose==1.3.2` dry-run failed while building `chumpy` in the Python 3.14 environment.
  - `deeplabcut==3.0.0` dependency dry-run did not finish within the available command window; full install is high risk in this runtime.
  - No `conda`, `micromamba`, `uv`, or alternate Python 3.10/3.11 runtime is available locally.
- Added `tools/evaluate_pet_keypoint_readiness.py`.
- Outputs:
  - `reports/rppg_pet_keypoints/pet_keypoint_readiness_report.md`
  - `reports/rppg_pet_keypoints/pet_keypoint_input_schema.md`
  - `reports/rppg_pet_keypoints/pet_keypoint_input_example.csv`
  - `reports/rppg_pet_keypoints/pet_keypoints_normalized.csv`
  - `ui/src/generated/rppgPetKeypointReadiness.ts`
- Result:
  - The current app can now ingest a normalized pet keypoint CSV from MMPose, DeepLabCut, SLEAP, or manual annotation.
  - Real keypoint inference should be run in a separate Python 3.10/3.11 environment, then exported into the normalized schema for this workspace.

## 2026-05-26 DeepLabCut SuperAnimal Probe

- Created a separate keypoint runtime:
  - `.venv-keypoint` with Python 3.11.15.
  - Installed `deeplabcut==3.0.0`.
- Added `tools/run_deeplabcut_probe.py`.
- Ran DeepLabCut SuperAnimal on real project data:
  - Source: `dataset_front/4.mp4`.
  - Probe clip: `reports/rppg_pet_keypoints/dlc_probe/4_dlc_probe.mp4`.
  - Clip: 8 frames, 5 fps, 512x614.
  - Model: `superanimal_quadruped`, `hrnet_w32`, `fasterrcnn_resnet50_fpn_v2`.
  - Device: CPU.
- Outputs:
  - `reports/rppg_pet_keypoints/dlc_probe/4_dlc_probe_superanimal_quadruped_hrnet_w32_fasterrcnn_resnet50_fpn_v2.h5`
  - `reports/rppg_pet_keypoints/dlc_probe/4_dlc_probe_superanimal_quadruped_hrnet_w32_fasterrcnn_resnet50_fpn_v2_before_adapt.json`
  - `reports/rppg_pet_keypoints/dlc_probe/dlc_probe_manifest.json`
- Extended `tools/evaluate_pet_keypoint_readiness.py` to normalize DLC H5/CSV outputs.
- Normalized keypoint result:
  - 312 rows.
  - 39 quadruped keypoints.
  - Median confidence: 0.519.
  - Rows with confidence >= 0.5: 164.
  - Strong keypoints in this probe include `left_eye`, `right_eye`, `nose`, `front_left_paw`, and `front_left_knee`.
- UI update:
  - Feasibility tab now displays actual DLC probe status, keypoint row count, confidence summary, and artifact links.
- Interpretation:
  - We can run a real pet keypoint stack on this dataset.
  - This does not solve rPPG yet because it was only a short CPU sanity run, but it removes the previous blocker that pet keypoints were only hypothetical.
  - Next step is to combine DLC keypoints with the YOLO animal mask and extract anatomical ROI signals from eyes/ears/neck/chest while excluding mouth/paw/motion states.

## 2026-05-26 DLC Keypoint ROI rPPG Probe

- Extended the keypoint run from 8 frames to a 30-second probe:
  - Source: `dataset_front/4.mp4`.
  - Probe clip: `reports/rppg_pet_keypoints/dlc_probe_30s/4_dlc_probe.mp4`.
  - Clip: 150 frames, 5 fps, 512x614.
  - DeepLabCut output: `reports/rppg_pet_keypoints/dlc_probe_30s/4_dlc_probe_superanimal_quadruped_hrnet_w32_fasterrcnn_resnet50_fpn_v2.h5`.
- Re-normalized DLC keypoints:
  - 5,850 rows.
  - 39 quadruped keypoints.
  - Median confidence: 0.463.
- Added `tools/evaluate_dlc_keypoint_roi_probe.py`.
- Method:
  - Build anatomical ROIs from DLC keypoints: eyes, nose, ear bases, neck, throat, upper body.
  - Include artifact ROIs: mouth and front paws.
  - Intersect every ROI patch with the YOLO animal segmentation mask.
  - Extract RGB traces from the masked patch.
  - Evaluate green, G-minus-R, CHROM, and POS pulse candidates over 70-135 bpm.
- Outputs:
  - `reports/rppg_dlc_keypoint_roi_probe/dlc_keypoint_roi_summary.csv`
  - `reports/rppg_dlc_keypoint_roi_probe/dlc_keypoint_roi_traces.csv`
  - `reports/rppg_dlc_keypoint_roi_probe/dlc_keypoint_roi_report.md`
  - `reports/rppg_dlc_keypoint_roi_probe/dlc_keypoint_roi_summary.png`
  - `ui/src/generated/rppgDlcKeypointRoiProbe.ts`
- Result on `4.mp4`:
  - OCR target range: 111-120 bpm, target center 115.5 bpm.
  - Best candidate: neck ROI + POS.
  - Predicted HR: 113.672 bpm.
  - Target absolute error: 1.828 bpm.
  - Range error: 0 bpm.
  - SNR: 7.805.
  - Valid frames: 112/150.
- Interpretation:
  - This is the first successful pet-specific anatomical ROI rPPG signal in this workspace.
  - It is still only a single-video 30-second probe and uses 5 fps, so high-HR videos above roughly 135 bpm need a higher FPS keypoint run.
  - The result supports the next experiment: run DLC at 10 fps or native FPS for all usable videos, then compare anatomical ROI selectors against face-box and segmentation-only baselines.

## 2026-05-27 Adaptive ROI Selection UI Integration

- Read the latest adaptive ROI work products:
  - `PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md`
  - `docs/pipeline/01_Keypoint_Detection.md` through `08_Smart_Final_Selection.md`
  - `reports/rppg_pet_keypoints/full_evaluation_current_best/*`
  - `reports/rppg_pet_keypoints/dual_roi_candidates/dual_roi_candidates_results.csv`
  - `presentation_images/*_keypoints_kr.jpg`, `*_all_rois_kr.jpg`, `*_chosen_rois_kr_with_quality.jpg`
- Added `tools/generate_adaptive_roi_ui_data.py`.
- Generated:
  - `reports/rppg_pet_keypoints/adaptive_roi_latest/adaptive_roi_latest_report.md`
  - `ui/src/generated/rppgAdaptiveRoiLatest.ts`
- Added a new Feasibility tab section: `Latest Adaptive ROI Selection`.
- UI now shows:
  - DeepLabCut SuperAnimal Quadruped keypoint model and adaptive selector threshold.
  - Current full-evaluation summary: 6 videos, mean MAE 41.17 bpm, median MAE 33.35 bpm, high-HR recovery 1/2.
  - Per-zone single vs multi ROI selection decisions for videos 3, 6, and 7.
  - Keypoint overlay, all candidate ROI overlay, and chosen ROI overlay images from `presentation_images/`.
  - Direct links to latest report, deployment guide, and dual-candidate CSV.
- Verification:
  - `npm.cmd run lint` passed.
  - `npm.cmd run build` passed.
  - Browser DOM confirmed: `Latest Adaptive ROI Selection`, `Per-Zone ROI Decisions`, `throat_area_multi`, `nose_bridge_single`, `keypoints`, `candidates`, `chosen`, and `dual candidates`.
