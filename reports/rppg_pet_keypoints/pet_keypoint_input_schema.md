# Pet Keypoint Input Schema

The rPPG keypoint adapter expects a normalized long CSV. One row is one keypoint at one video time/frame.

Required columns:

| column | meaning |
| --- | --- |
| video | Video filename, e.g. `1.mp4` |
| time_sec | Timestamp in seconds. Use this when available. |
| frame_index | Frame index. Use this if `time_sec` is unavailable. |
| keypoint | Anatomical keypoint name, e.g. `nose`, `left_eye`, `right_eye`, `left_ear_base`, `mouth`, `left_shoulder` |
| x | Pixel x coordinate |
| y | Pixel y coordinate |
| confidence | Keypoint confidence/probability, 0-1 preferred |
| source | Provider name, e.g. `mmpose_ap10k`, `deeplabcut_superanimal_quadruped`, `sleap`, `manual` |

Minimum useful keypoints for this project:

- Face: `nose`, `left_eye`, `right_eye`, `left_ear_base`, `right_ear_base`, `mouth`
- Body: `neck`, `left_shoulder`, `right_shoulder`, `left_hip`, `right_hip`

Recommended ROI policy:

- Use eye/ear/nose bridge for face rPPG candidates.
- Use mouth/muzzle keypoints as panting artifact state, not HR source.
- Use shoulder/neck/chest body ROIs for body rPPG candidates.
- Intersect all keypoint ROIs with the YOLO animal mask before RGB extraction.