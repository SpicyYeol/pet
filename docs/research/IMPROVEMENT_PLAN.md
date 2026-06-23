# Pet rPPG Performance Improvement Plan (2026-05)

## Current Diagnosis (as of full video 4 DLC run)

### What is broken
- Face-box (DogFaceModel + YOLO face patches) + classical rPPG (POS/CHROM/green/g-r/ICA/PCA) is fundamentally limited on furry animals.
- On high-HR videos (target 170-230 bpm), predictions collapse to the dominant ~95-110 bpm artifact.
- Spectrum evidence (video 3.mp4): True HR peak often exists but ranks ~#2900 in the analysis band while the artifact dominates with 20-45x SNR.
- Video-level OCR labels are coarse → exact-BPM supervised learning is noisy.

### What actually works (biggest signal so far)
- DeepLabCut SuperAnimal quadruped keypoints + YOLO animal segmentation mask intersection on **anatomical low-fur regions**:
  - Neck / throat / upper chest
  - Nose bridge / muzzle skin
  - Ear bases (inner)
  - Periocular skin (when visible and not moving)
- On video 4 (target 111-120 bpm):
  - Ear bases + g-r/chrom → ~125 bpm with SNR ~14
  - Nose bridge + green → 97.7 bpm with highest SNR (15.64)
  - This is dramatically better than face-box methods on the same data.

**Conclusion**: ROI quality (which tissue we measure) is the #1 bottleneck by a large margin. Everything else is secondary until we fix the input signal.

---

## Recommended Priority Order (Impact / Effort)

### Tier 1 — Do This First (Highest Leverage)

**"Stable Anatomical Low-Fur ROI Pipeline"**

1. Make anatomical ROI extraction the default (not an experiment).
2. Define a small, stable set of target patches:
   - Neck/throat (best so far in multiple probes)
   - Nose leather / bridge
   - Left + right ear base (inner)
   - Upper chest (when visible)
   - Optional: periocular if eye keypoints are reliable
3. Always combine with high-quality animal mask (current yolo11n-seg is already useful).
4. Per-ROI + per-window rejection features (critical):
   - Keypoint motion magnitude
   - Mouth opening / tongue visibility
   - Paw/leg movement
   - 95-115 bpm band power penalty (explicit anti-artifact)
   - Correlation with background RGB
5. Simple but robust trace cleaning: spatial median + temporal interpolation + outlier frame rejection before any rPPG method.

**Expected gain**: Largest single jump we have seen in the project so far. Turns "mostly unusable" into "sometimes usable with good rejection".

### Tier 2 — Complementary (Do in Parallel)

**Better Supervision + Selection**

- Stop training selectors on "exact BPM error < X".
- New positive definition: "There exists a peak inside the label band + low motion + high anatomical confidence + low 100bpm artifact power".
- This is much more robust given the weak labels.
- Add a "reject this window" class for obvious artifacts.

**Multi-view Anatomical Correspondence**

- Once we have multi-cam + keypoints, enforce that the same anatomical structure (e.g. left neck) across views should agree after motion rejection.
- This is a very strong GT-free signal.

### Tier 3 — Longer Term / Higher Cost

- Fine-tune or distill a fast pet-specific keypoint/landmark model focused on high-signal skin regions (current SuperAnimal is good but slow on CPU and not optimized for rPPG).
- Collect even a small synchronized dataset (pulse ox + video on 5-10 dogs) for real validation and better training.
- Investigate fur-specific rPPG tricks (polarization, different wavelengths, learned spatial filters).

---

## Immediate Next Experiments (Ready to Run)

1. **Full anatomical sweep on all 7 usable videos**
   - Run DLC (or the existing probe approach) on videos 1,3,5,6,7,8.
   - Compare anatomical vs previous face-box MAE / within-range on each.

2. **Rejection module prototype**
   - Add the 5 rejection features above to the candidate bank.
   - Measure how much "bad windows" we can remove while keeping good ones.

3. **Neck/ear focused lightweight tracker**
   - Instead of full DLC every frame, detect anatomical patches once per second + KLT / lightweight tracking.
   - Goal: real-time friendly version for the HUD.

4. **Spectrum audit on all videos**
   - For every video + every promising anatomical ROI, produce the same rank + relative power analysis we did for video 3.
   - This will tell us for which videos the signal is actually present vs truly hopeless.

---

## Current Best Practical Pipeline (v0.3 Recommendation)

```
Input frames
    ↓
YOLO animal segmentation (mask)
    ↓
DLC SuperAnimal (or future fast pet model) → anatomical keypoints
    ↓
Define 4-6 low-fur patches (neck, nose, ears, chest)
    ↓
Intersect patches with mask + reject obvious motion/mouth frames
    ↓
Per-patch RGB trace (robust spatial average)
    ↓
Classical rPPG (POS + CHROM + green as ensemble) + strong bandpass
    ↓
Per-window features:
    - Peak in label band?
    - 100bpm artifact power
    - Motion magnitude
    - Background correlation
    ↓
Lightweight selector / median ensemble (or simple rules first)
    ↓
Output BPM + confidence
```

This is the direction that has the highest probability of turning the current prototype into something actually useful on real pet video.

---

## Evidence So Far (as of 2026-05-26)

- Face-box methods: target MAE typically 40-66 bpm, within-range often 0%.
- Anatomical (video 4 full run): multiple ROIs producing peaks in 97-125 bpm range with SNR 14+ while target is 115.5.
- 30s probe on same video: neck + POS gave 113.67 bpm (error <2 bpm).
- Spectrum on worst video: true peak exists but is buried under artifact when using bad ROIs.

The data strongly supports shifting the research focus from "better rPPG math" to "better tissue selection + rejection".

---

Next concrete actions for the team:
- Implement Tier 1 rejection features.
- Run the full 7-video anatomical comparison.
- Prototype the lightweight tracking version for HUD feasibility.

This plan is based on all experiments run in this workspace up to the full video 4 DLC analysis.

---

## Detailed Implementation Specs

### B. Rejection Features Module (Highest immediate priority)

Create `tools/rppg_rejection.py` with the following functions:

```python
def compute_motion_features(keypoints_df: pd.DataFrame, 
                              frame_indices: list[int]) -> pd.DataFrame:
    """Returns per-frame: motion_magnitude, accel, keypoint_conf_median"""

def compute_100bpm_artifact_power(pulse: np.ndarray, fs: float) -> float:
    """Power ratio in [95, 115] bpm band vs rest of analysis band"""

def compute_mouth_opening_score(keypoints_df: pd.DataFrame, frame_idx: int) -> float:
    """Distance + angle based mouth opening proxy using jaw/upper_jaw keypoints"""

def compute_background_correlation(roi_rgb: np.ndarray, bg_rgb: np.ndarray) -> float:
    """Pearson correlation between ROI trace and background trace"""

def rejection_score(features: dict) -> float:
    """
    Combines into [0,1] rejection probability.
    High score = strongly reject this window.
    """
```

**Integration point**: 
- In candidate generation (evaluate_single_view_sqi style), attach these features to every window.
- New positive label for training: `in_label_band and motion < thresh and artifact_power < thresh and bg_corr < 0.3`

**Expected quick win**: Remove 30-60% of bad windows while keeping most good ones.

### C. Lightweight Anatomical Tracker Design

Goal: Replace full DLC every frame with something 5-10x faster for HUD.

Proposed architecture:

1. **Anchor detection** (every 0.5~1 sec):
   - Run lightweight detector (YOLO seg + small pose head, or even just YOLO keypoints if available).
   - Or run full SuperAnimal only at low FPS.

2. **Patch tracking** (high FPS):
   - Use KLT (cv2.calcOpticalFlowPyrLK) or simple correlation tracking on the 4-6 anatomical patches.
   - Update patch centers from tracked keypoints.

3. **Periodic re-anchor + quality check**:
   - Every N frames, re-detect and correct drift.
   - If confidence drops or motion too high → fall back to full detection.

**Files to create**:
- `tools/lightweight_anatomical_tracker.py`
- Example using the existing 4.mp4 clip.

### A. 7-Video Anatomical Sweep — Practical Execution Plan

Since full DLC on all videos is time-consuming on CPU, recommended phased approach:

**Phase 1 (Fast, 1-2 days)**:
- Use existing 30s/60s probes where available.
- For videos without probes: create short high-quality clips (15-30s) around periods with good monitor visibility using `tools/run_deeplabcut_probe.py`.
- Run `normalize_dlc_h5.py` + `analyze_anatomical_rois_full.py` on all.

**Phase 2 (Full quality)**:
- Run full or 2-minute high-FPS clips on all 7 usable videos.
- This is the definitive comparison.

**Ready-to-use driver** (to be created):
`tools/run_full_anatomical_sweep.py --videos dataset_front/1.mp4,3.mp4,... --output-root reports/rppg_anatomical_full_sweep`

---

## Immediate Action Checklist (You can start today)

- [ ] Implement core rejection features (B) → I can start this right now.
- [ ] Add rejection features into the existing candidate bank in `evaluate_single_view_sqi.py`.
- [ ] Create `tools/normalize_dlc_h5.py` usage guide + batch script for remaining videos.
- [ ] Prototype KLT-based patch tracker on one video (C).
- [ ] Write a short "Anatomical ROI definition spec" document (which exact keypoints + radius for neck, ear, nose, etc.).

---

## Current Best Numbers (as of 2026-05-26)

**Face-box baseline (video 4)**: Often stuck ~99-110 bpm, target 115.5
**Anatomical (full DLC run)**:
- Best: nose_bridge + green (SNR 15.64, 97.71 bpm)
- Strong: ear_bases + g_minus_r (SNR 14.1, 125.4 bpm)

This gap is the justification for the entire plan above.

