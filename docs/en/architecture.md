# Architecture & Extension Guide

*Korean / 한국어: [`docs/ko/architecture.md`](../ko/architecture.md)*

## Philosophy

One shared input (`Session`) flows through many independent **analyzers**; each
emits a uniform `AnalyzerResult`; results are fused into one early-warning score
(EWS). **Adding a capability = adding one analyzer file.**

```
        video + DLC keypoints
                 │
            core.Session                 shared input unit
                 │
   ┌─────────────┼─────────────┐
   ▼             ▼             ▼
 pose      rppg / hrv     spo2 / temperature      ← analyzers (plugins)
 feeding   resp_effort    mucous
   └─────────────┼─────────────┘
                 ▼
         AnalyzerResult ×N   (per-frame + summary + 0–3 sub-score)
                 │
            ews.fuse_ews                 combined EWS
                 │
   cli (run / viz / list)  ·  viz.overlay  ·  Streamlit dashboard
```

## Package layout (`petvitals/`)

| Path | Role |
|------|------|
| `core/session.py` | `Session` — one clip's video + keypoints + fps |
| `core/keypoints.py` | keypoint CSV IO, access helpers, keypoint groups |
| `core/geometry.py` | scale-invariant geometry (body_scale, PCA spine angle) |
| `core/baselines.py` | species/breed/patient vital ranges |
| `core/refvitals.py` | external sensor readings (SpO₂, temperature) |
| `core/analyzer.py` | **Analyzer ABC + AnalyzerResult + registry (`@register`)** |
| `analyzers/*.py` | the plugins (pose, rppg, hrv, feeding, spo2, temperature, resp_effort, mucous) |
| `ews/fusion.py` | combine analyzer sub-scores into the EWS |
| `viz/overlay.py` | posture overlay renderer |
| `cli.py`, `__main__.py` | unified CLI (`python -m petvitals`) |

The 50 legacy scripts in `tools/` remain as research code; `tools/pose_classifier.py`
and `tools/visualize_pose.py` are thin shims over the package.

## The analyzer contract

```python
@dataclass
class AnalyzerResult:
    name: str                  # analyzer name
    per_frame: pd.DataFrame    # frame_index + per-frame columns
    summary: dict              # JSON-serializable summary
    ews_subscore: int = 0      # 0–3 contribution to the EWS
    ews_reasons: list = []     # human-readable reasons
```

## Add a new analyzer (3 steps)

```python
# 1) petvitals/analyzers/myfeature.py
from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.session import Session
import pandas as pd

@register
class MyAnalyzer(Analyzer):
    name = "myfeature"
    description = "what it does"
    def analyze(self, session: Session) -> AnalyzerResult:
        ...
        return AnalyzerResult(self.name, pd.DataFrame(...), summary, subscore, reasons)
```

```python
# 2) petvitals/analyzers/__init__.py
from . import myfeature  # noqa: F401
```

3. Done — it appears in `python -m petvitals list`, runs with `run`, and folds into
the EWS automatically. No changes to the CLI, fusion, or output plumbing.

## Roadmap → analyzer mapping

| Capability | Analyzer | Status |
|------------|----------|--------|
| Posture (#1) + activity/immobility (#2) | `analyzers/pose.py` | ✅ |
| HR/RR (rPPG) | `analyzers/rppg.py` | ✅ HR from cached pipeline, RR from keypoints |
| HRV | `analyzers/hrv.py` | ✅ SDNN/RMSSD from cached BVP |
| Feeding / oral activity (#3) | `analyzers/feeding.py` | ✅ v0 proxy, bowl ROI = future |
| SpO₂ | `analyzers/spo2.py` | ✅ external sensor input |
| Temperature | `analyzers/temperature.py` | ✅ thermal/reference input |
| Species/breed/patient baselines | `core/baselines.py` + `reports/patient_profiles/` | ✅ drives the ranges |
| Respiratory effort / pattern / apnea | `analyzers/respeffort.py` | ✅ signal-quality gated |
| Mucous-membrane color (perfusion) | `analyzers/mucous.py` | ✅ v0, uncalibrated |
| Combined EWS (#4) | `ews/fusion.py` + UI | ✅ fuses all, shown in the dashboard |
| Pose ML classifier | `tools/train_pose_model.py` + `analyzers/pose.py` | 🟡 pipeline ready, data-limited |
| CRT / blood pressure / arrhythmia / pain / cat | — | 🔜 |

## CLI

```bash
python -m petvitals list                 # list analyzers
python -m petvitals run  --stem 3        # run all + EWS
python -m petvitals viz  --stem 3        # posture overlay
python tools/export_ews_ui.py            # export EWS data for the dashboard
```

Outputs → `reports/pose_<stem>/`: `<analyzer>_per_frame.csv`,
`<analyzer>_session_summary.json`, `ews_summary.json`, `<stem>_pose_overlay.mp4`.
