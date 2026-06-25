# Improving the posture classifier with external pose data (AP-10K / APT-36K)

## Why this is the next lever
The posture classifier was data-limited (6 weak clip-labels, leave-one-clip-out
accuracy ≈ 0.24 — see [pose-classifier](../en/pose-classifier.md)). **AP-10K** (10k
images, 54 species) and **APT-36K** (36k video frames, 30 species, with tracking) are
the largest public animal-pose datasets and the natural way to add diversity.

## Two honest obstacles (and how we handle them)
1. **No posture-class labels.** Both are *pose-estimation* datasets: they give
   keypoints, not sitting/standing/lying labels. → We map their keypoints into our
   posture-feature space and **propose weak labels** for geometrically-unambiguous
   instances; a human pass corrects them into real labels.
2. **Different keypoint schema + hosting.** Both use a **17-keypoint COCO schema**
   (vs our 39-pt SuperAnimal), and the data is on **OneDrive (APT-36K) / Google Drive
   (AP-10K)** → download is a manual step. → We built a 17→feature adapter that is
   verified offline (`--self-test`) and runs the moment a COCO json is present. The
   retrain is scikit-learn (no GPU).

## Pipeline (already built & verified)
- [`tools/ingest_animal_pose.py`](../../tools/ingest_animal_pose.py): COCO (AP-10K/
  APT-36K, 17 kp) → petvitals posture features + weak `proposed_posture`. Canid filter.
  `--self-test` proves the standing/sitting/lying mapping with synthetic instances
  (verified: standing/sitting/lateral_recumbency all correct).
- [`tools/train_pose_model.py`](../../tools/train_pose_model.py) `--external <csv>`:
  augments training with the ingested features (uses a human-corrected `posture`
  column if present, else the weak `proposed_posture`), keeping leave-one-group-out CV.

## Step-by-step
```bash
# 0) verify the adapter without any download
python tools/ingest_animal_pose.py --self-test

# 1) download annotations (manual; hosts are OneDrive/Drive)
#    AP-10K : github.com/AlexTheBad/AP-10K     APT-36K : github.com/pandorgan/APT-36K

# 2) ingest the canid subset into our feature space
python tools/ingest_animal_pose.py --coco ap10k-train.json --family canid \
    --out reports/external_pose_features.csv

# 3) (recommended) human-correct a subset: add a 'posture' column to that CSV
#    (proposed_posture is a weak heuristic label; real labels give the real gain)

# 4) retrain with augmentation and read the honest LOCO number
python tools/train_pose_model.py --external reports/external_pose_features.csv
```

## What to expect (honest)
- Training on **weak** `proposed_posture` alone is largely *distillation* of our own
  heuristic — it broadens the feature distribution (helps generalization a bit) but
  adds little new information. **The real gain needs human-corrected labels** on the
  diverse external instances.
- AP-10K is single-frame (no motion/tremor features → those columns are imputed);
  APT-36K's tracking can later supply temporal features and multi-frame posture labels.
- Canid-only keeps it on-domain; adding other quadrupeds can help cross-species
  generalization but may dilute dog-specific posture cues.
