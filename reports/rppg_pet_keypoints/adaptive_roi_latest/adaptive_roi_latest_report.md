# Adaptive ROI Latest UI Summary

- Generated: `2026-05-27T10:18:39`
- Production command: `python tools/analyze_video.py --stem <id> --dog_aware --relax_rejection`
- Full-evaluation MAE: `41.17` bpm mean, `33.35` bpm median.

## Adaptive ROI Decisions

### 3.mp4 target 210.0 bpm
- Throat: `throat_area_multi` (multi), q=6.936, bpm=177.5, snr=14.96
- Right ear: `ear_area_right_multi` (multi), q=14.387, bpm=150.0, snr=59.67
- Left ear: `ear_area_left_multi` (multi), q=7.234, bpm=140.6, snr=32.98
- Muzzle: `muzzle_area_multi` (multi), q=3.24, bpm=209.8, snr=14.48
- Nose bridge: `nose_bridge_single` (single), q=1.58, bpm=87.3, snr=10.62

### 6.mp4 target 90.0 bpm
- Throat: `throat_area_multi` (multi), q=14.018, bpm=176.4, snr=25.18
- Right ear: `right_ear_base_single` (single), q=19.007, bpm=185.7, snr=40.58
- Left ear: `left_ear_base_single` (single), q=17.936, bpm=214.5, snr=38.85
- Muzzle: `muzzle_skin_single` (single), q=12.436, bpm=122.5, snr=69.03
- Nose bridge: `nose_bridge_single` (single), q=18.458, bpm=117.8, snr=68.07

### 7.mp4 target 189.5 bpm
- Throat: `throat_exposed_single` (single), q=4.372, bpm=143.6, snr=22.18
- Right ear: `ear_area_right_multi` (multi), q=2.48, bpm=143.0, snr=16.05
- Left ear: `left_ear_base_single` (single), q=3.671, bpm=145.3, snr=42.06
- Muzzle: `muzzle_area_multi` (multi), q=5.524, bpm=102.5, snr=56.95
- Nose bridge: `nose_bridge_single` (single), q=8.13, bpm=171.1, snr=34.6

## Keypoint / ROI Gallery

- Frame-level keypoints, all ROI candidates, and chosen ROI overlays are exposed in the UI from `presentation_images/`.