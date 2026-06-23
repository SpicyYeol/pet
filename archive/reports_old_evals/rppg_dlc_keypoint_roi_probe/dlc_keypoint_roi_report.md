# DLC Keypoint ROI rPPG Probe

- Target for `4.mp4`: 111.0-120.0 bpm, center 115.5 bpm.
- Probe FPS: 5.000. Practical max detectable HR is capped by sampling; this run used 70-135 bpm.
- YOLO animal mask intersection: `True`.

## Top Candidates

| ROI | Method | Peak BPM | Range error | SNR | Valid frames |
| --- | --- | ---: | ---: | ---: | ---: |
| Neck | pos | 113.672 | 0.000 | 7.805 | 112 |
| Nose bridge | pos | 118.945 | 0.000 | 3.761 | 129 |
| Ear bases | green | 120.410 | 0.410 | 5.189 | 112 |
| Neck | g_minus_r | 110.156 | 0.844 | 6.571 | 112 |
| Nose bridge | green | 109.863 | 1.137 | 5.670 | 129 |
| Ear bases | pos | 122.461 | 2.461 | 5.289 | 112 |
| Neck | green | 104.297 | 6.703 | 4.571 | 112 |
| Eyes | g_minus_r | 93.750 | 17.250 | 3.390 | 129 |
| Ear bases | g_minus_r | 93.457 | 17.543 | 5.718 | 112 |
| Eyes | green | 92.578 | 18.422 | 3.129 | 129 |

## Interpretation

- This is an actual anatomical ROI extraction from DeepLabCut SuperAnimal keypoints, not a face-box proxy.
- It is still a single 30-second probe on one video, so it should guide ROI design rather than be treated as final performance.
- Artifact ROIs are included deliberately: mouth and paw peaks help identify panting or motion-locked states that should be rejected.