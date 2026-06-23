# Posture / Behavior Classifier

*Korean / 한국어: [`docs/ko/pose-classifier.md`](../ko/pose-classifier.md)*
Implementation: [`petvitals/analyzers/pose.py`](../../petvitals/analyzers/pose.py)

## Goal

Reuse the DLC keypoints already extracted for rPPG to produce a clinically useful
posture/behavior signal at near-zero extra cost (no new capture, no new model).
Rule-based first because there are no labels yet — transparent and auditable, and
the same features feed the optional ML classifier later.

## Input

DLC SuperAnimal quadruped, 39 keypoints, long-format CSV (`video, time_sec,
frame_index, keypoint, x, y, confidence`). ~10 fps, **pixel** coords (origin
top-left, y grows down), confidence per point (this dataset averages ~0.49, so
confidence handling matters). All features are normalized by `body_scale`
(spine length, bbox fallback) → scale-invariant.

## Posture classes

`standing_normal`, `sitting`, `sternal_recumbency`, `lateral_recumbency`,
`hunched_abdominal_pain`, `orthopnea_resp_distress`, `seizure_or_tremor`,
`uncertain` (too few valid keypoints).

## Features (per frame, ≥ `MIN_CONF` keypoints only)

| feature | meaning |
|---------|---------|
| `vertical_separation` | (mean paw y) − (mean trunk y) — large = standing, small = recumbent |
| `back_curvature` | signed deviation of back_middle from the neck→tail chord — arched up = abdominal pain |
| `spine_tilt` | PCA principal-axis angle of spine points (works even when the tail is occluded) — high = sitting |
| `neck_extension`, `head_height`, `front_paw_spread` | orthopnea cues |
| `body_elongation` | bbox aspect ratio — high = lateral recumbency |
| `motion_energy`, `tremor_index` | activity; shake-in-place = seizure |

## Decision tree (emergencies first)

```
too few keypoints                         → uncertain
tremor high AND motion high               → seizure_or_tremor
vertical_separation low → elongated?      → lateral_recumbency / sternal_recumbency
spine_tilt ≥ 24°                          → sitting
back_curvature strongly +                 → hunched_abdominal_pain
neck extended + paws spread + head low    → orthopnea_resp_distress
else                                      → standing_normal
```

Then **temporal smoothing**: rolling-mode (±0.5 s) + hysteresis (5 frames to
switch), and short `seizure` runs (<1 s) are suppressed (noise, not a seizure).

## Outputs

Per-frame CSV + session-summary JSON (posture time fractions, mean activity,
longest immobile span = decubitus risk, flags, behavioral EWS sub-score).
Visual check: `python -m petvitals viz --stem <n>` overlays labels + skeleton.

## Calibration & verification log

- **Dynamic thresholds** were raised above the keypoint-noise floor
  (`motion_energy` noise ≈ 0.06) so detector jitter no longer reads as seizures.
- **Sitting fix**: `spine_tilt` originally needed both neck_base and tail_base and
  went NaN when the tail was occluded → switched to a PCA spine-axis fit;
  threshold set from clip distributions (standing ≈14°, sitting ≈31° → 24°).
  Result on a sitting clip: sitting 0% → 59%, false abdominal-pain flag 16% → 3%.
- **7-clip overlay verification**: clear cases pass (sitting, standing,
  kp=0→uncertain). Remaining single-view limits: recumbency is ambiguous when a
  lying dog's back sits above its paws; standing-vs-sitting is ambiguous for
  long-backed head-up dogs (~55° spine).

## ML classifier (data-limited)

Pipeline: `tools/train_pose_model.py` reuses the exact features, trains a
RandomForest with **leave-one-clip-out CV**, and `PoseAnalyzer` uses a saved model
when present (rules kept for emergencies/no-data). Honest result: with only 6 weak
clip-labels, LOCO accuracy ≈ 0.24 (worse than rules), so **no model is shipped and
rules remain the default** — the blocker is label quantity, not the architecture.
Add real frame-level labels to `reports/pose_training/labels.csv` and the model
auto-activates.

## Limitations

Single-view heuristics; many low-confidence frames; assumes a single animal.
Future: multi-view fusion (`dataset_multi`), more labels, facial pain (grimace),
bowl-ROI feeding.
