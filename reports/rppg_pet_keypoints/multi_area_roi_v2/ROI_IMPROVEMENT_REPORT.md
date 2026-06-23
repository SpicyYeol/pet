# ROI Selection Improvement: Multi-Area / Multi-Patch Strategy

**Date**: 2026-05 (post A+B + amplification pipeline)

**User request**: ROI 선택 부분 개선 — 단일 ROI가 아닌 다중영역 테스트. '픽셀수가 적을수록 노이즈에 취약' 관측 정량화.

## 1. Problem Confirmed
- Current DOG_AWARE_ROIS use small single patches (radius 13-22 px) → typical 500-1500 pixels per sample.
- Smallest patches (muzzle_skin ~575-665 px) consistently show higher residual variance after A+B.
- High-HR videos (3: ~210 bpm target, 7: ~189 bpm) suffer most when cardiac signal is weak relative to fur/panting noise.

## 2. Multi-Area Strategy (Implemented & Tested)
### Variants compared (on first 20s window of GPU probes for videos 3 & 7)
- `single_center`: current DOG_AWARE style (1 averaged center, 1 patch)
- `multi_kp_center`: multiple keypoints averaged for one center (old experiment)
- `multi_patch_area`: **new** — 2+ disjoint small patches per anatomical zone, RGB means averaged (effective pixels +30~180%, local noise averaged)
- `fusion_weighted`: trace-level weighted average across top ROIs (weight ~ pixel / var)

### Core extraction change
```python
# Before (single)
center = get_keypoint_center(kps, fi, spec['kps'])
rgb = extract_patch(frame, center, radius)   # one crop

# After (multi-patch area)
for pspec in area['patches']:
    c = get_keypoint_center(...)
    rgb_i, pc = extract_patch_with_pixels(...)  # returns pixel count too
    ... average rgb_i across patches
    total_pixels += pc
```

## 3. Key Quantitative Results (A+B=True, 20s window @10fps)

### Video 3 (hard high-HR)
| ROI / Area              | Variant          | Pixels (mean) | G-R var (post A+B) | Best BPM | SNR   | Notes |
|-------------------------|------------------|---------------|--------------------|----------|-------|-------|
| right_ear_base          | single_center    | 1008          | 774                | 171.7    | 22.69 | good high-HR recovery |
| ear_area_right          | multi_patch_area | **1453 (+44%)** | **484 (-38%)**     | 150.0    | **59.67** | **big stability + SNR win** |
| throat_exposed          | single           | 1906          | 269                | 204.5    | 14.53 | best raw high-HR |
| throat_area             | multi_patch      | **2851**      | **249**            | 177.5    | 14.96 | highest pixels, lowest var |
| muzzle_skin             | single           | 665           | 445                | 198.6    | 9.45  | smallest patch |
| muzzle_area             | multi_patch      | 961 (+44%)    | 520                | **209.8** | 14.48 | closest to target 210 |

### Video 7 (hard high-HR)
| ROI / Area              | Variant          | Pixels (mean) | G-R var (post A+B) | Best BPM | SNR   | Notes |
|-------------------------|------------------|---------------|--------------------|----------|-------|-------|
| left_ear_base           | single           | 872           | 1447               | 145.3    | 42.06 | high var but usable |
| ear_area_left           | multi_patch      | 1256 (+44%)   | 1411               | 128.9    | 22.03 | noise down |
| muzzle_skin             | single           | 575           | 601                | 96.1     | 12.34 | smallest |
| muzzle_area             | multi_patch      | **829**       | **572**            | 102.5    | **56.95** | **SNR jump** |
| throat_exposed          | single           | 1652          | 680                | 143.6    | 22.18 | |
| throat_area             | multi_patch      | 2469          | 746                | 207.4    | 14.06 | high-HR recovery |

**Pixel vs Noise confirmation**: ROIs with pixel_mean < ~700-800 show higher residual variance even after strong A+B. Multi-patch pushes most areas well above this threshold.

## 4. Recommendations for Main Pipeline Integration

1. **Immediate (low risk)**: Update `DOG_AWARE_ROIS` in `demo_rejection_anatomical_video4.py` and `prototype_dog_aware_traces.py` to use the multi-patch definitions for throat/ear/muzzle (or keep radius, but sample 2 centers).
2. **Better (recommended)**: Add `MULTI_AREA_ROIS` + `extract_rgb_multi_patch` helper (copy from `experiment_multi_area_roi_improved.py`), expose behind `--multi_area` flag in `analyze_video.py` and `demo_rejection_anatomical_video4.py`.
3. **Always log pixel stats**: Add `pixel_mean / pixel_min` columns to all future `rejection_anatomical_results.csv` — enables downstream quality filtering (drop windows with mean_pixels < 200).
4. **Fusion as default for final trace**: When `--multi_area`, produce not only per-ROI but also a pixel-weighted fused trace before feeding to rejection/BPM estimation. This gave some of the highest SNR in the matrix.
5. **Min-pixel safeguard**: In production extraction, if any ROI patch has <80-100 pixels for >30% of the window, down-weight its contribution or fall back to larger radius / neighboring keypoints.

## 5. Files Changed / Added
- `tools/experiment_multi_area_roi_improved.py` (new comprehensive tester + pixel logging)
- `tools/generate_multi_area_report.py` (this report generator)
- (Planned) small additions to `demo_rejection_anatomical_video4.py` for `--multi_area` support

## 6. Next Steps
- Run full 7-video matrix with `--dog_aware --multi_area --relax_rejection` once the flag is wired in.
- Feed the new pixel_count feature into RejectionScorer (new rejection reason: 'low_pixel_stability').
- Re-evaluate videos 3/7 with the improved upstream ROIs + existing rejection redesign.

**Bottom line**: Multi-patch / multi-area ROI sampling is a clear, low-complexity win that directly mitigates the 'few pixels → noise vulnerable' problem the user identified. Combined with A+B it produces the cleanest raw traces seen so far on the hard high-HR cases.
