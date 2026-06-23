# petvitals/models/

Trained model artifacts live here. They are **not committed** (see root `.gitignore`)
because they are regenerable and can be large.

- `pose_rf.joblib` — produced by `python tools/train_pose_model.py`. When present,
  `PoseAnalyzer` uses it for posture classification (rules are kept for
  emergencies / no-data frames). When absent, the analyzer is rules-only.

> Current status: the bundled weak (clip-level) labels give a leave-one-clip-out
> CV accuracy well below the rules, so no model is shipped — the limitation is
> **label quantity**, not the pipeline. Add real frame-level labels to
> `reports/pose_training/labels.csv`, retrain, and the model auto-activates.
