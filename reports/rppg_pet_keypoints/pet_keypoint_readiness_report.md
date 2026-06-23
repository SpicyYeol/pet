# Pet Keypoint Readiness

- Python: `3.11.15`
- Provider Python: `.venv-keypoint/Scripts/python.exe`
- Input keypoint file: `reports/rppg_pet_keypoints/dlc_probe_30s/4_dlc_probe_superanimal_quadruped_hrnet_w32_fasterrcnn_resnet50_fpn_v2.h5`

## Providers

| provider | installed | runtime | role | note |
| --- | --- | --- | --- | --- |
| MMPose AP-10K / AnimalPose | False | not installed | real animal keypoints | Preferred for AP-10K style dog/cat anatomical landmarks. |
| DeepLabCut SuperAnimal-Quadruped | True | current Python | quadruped keypoints | Installed in the separate keypoint runtime and tested with a real probe clip. |
| SLEAP | False | not installed | custom animal pose training/tracking | Best if we create our own annotation set. |
| Ultralytics YOLO segmentation | True | C:\Users\wagon\AppData\Local\Programs\Python\Python314\python.exe | animal foreground mask | Already used for dog/cat mask ROI extraction. |

## Current Decision

- Generic YOLO animal segmentation is already integrated.
- DeepLabCut SuperAnimal-Quadruped has been installed in the separate keypoint runtime and was tested on a real probe clip.
- The first DLC probe is a short, downscaled CPU sanity check; it proves the animal keypoint stack can run on this data, not that the rPPG ROI is solved yet.
- Next technical step: combine DLC keypoints with the YOLO animal mask to extract eye/ear/neck/chest ROI signals and reject mouth/paw/motion artifact states.

## DLC Probe

- Status: `completed`
- Source video: `dataset_front\4.mp4`
- Clip: `reports\rppg_pet_keypoints\dlc_probe_30s\4_dlc_probe.mp4`
- Clip frames: `150` at `5.0` fps
- Clip size: `[512, 614]`

## Normalized Keypoints

- Rows: 5850
- Videos: 1
- Keypoints: back_base, back_end, back_left_knee, back_left_paw, back_left_thai, back_middle, back_right_knee, back_right_paw, back_right_thai, belly_bottom, body_middle_left, body_middle_right, front_left_knee, front_left_paw, front_left_thai, front_right_knee, front_right_paw, front_right_thai, left_antler_base, left_antler_end, left_earbase, left_earend, left_eye, lower_jaw, mouth_end_left, mouth_end_right, neck_base, neck_end, nose, right_antler_base, right_antler_end, right_earbase, right_earend, right_eye, tail_base, tail_end, throat_base, throat_end, upper_jaw
- Median confidence: 0.463
- Rows with confidence >= 0.5: 2702

Top median-confidence keypoints:

- `left_eye`: 0.893
- `nose`: 0.879
- `right_eye`: 0.871
- `front_left_paw`: 0.823
- `upper_jaw`: 0.815
- `right_earend`: 0.779
- `front_right_paw`: 0.776
- `front_right_thai`: 0.769
- `front_left_thai`: 0.765
- `front_left_knee`: 0.732