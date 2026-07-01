# VET-PPG · Contactless Pet Vitals & Behavior

*한국어 README: [README.ko.md](README.ko.md)*

Estimate a dog's **heart rate, respiration and behavior from plain video** — no
sensors on the body — and fuse everything into a single early-warning score (EWS).

This repo has two parts:
1. **rPPG pipeline** (`tools/`) — heart/breathing-rate extraction from RGB video.
2. **`petvitals` package** — a modular, plugin-based analyzer framework that turns
   shared inputs (video + DLC keypoints) into clinical signals and a combined EWS,
   shown in a Streamlit dashboard.

<p align="center">
  <img src="docs/img/pose_demo.gif" width="360" alt="live posture overlay demo"><br>
  <em>Live posture overlay (<code>petvitals viz</code>): DLC skeleton + classified posture + per-frame readout.</em>
</p>

---

## What & why

Like a hospital finger-clip reads pulse from skin-color changes, **rPPG** reads
them from a camera at a distance. Dogs are much harder than humans — **fur,
panting, motion, glare** — so naive face-box methods collapse to a ~100 bpm
artifact. The approach: anatomical thin-fur ROIs from SuperAnimal keypoints +
panting-subtraction/cardiac-amplification (A+B) + a data-driven per-zone ROI
selector. Details: [`docs/research/`](docs/research/).

<p align="center">
  <img src="presentation_images/3_frame120_keypoints_kr.jpg" width="380" alt="DLC keypoints">
  <img src="presentation_images/3_frame120_chosen_rois_kr_with_quality.jpg" width="380" alt="adaptive ROI selection">
</p>
<p align="center"><em>SuperAnimal keypoints (left) → the adaptive selector picks thin-fur ROIs
(right: nose_bridge + throat) for a brachycephalic dog. Monitor reads ~218 bpm.</em></p>

> ⚠️ Research prototype — **not a medical device, not clinically validated.** All
> thresholds are configurable defaults, not clinical cutoffs.

---

## Performance (rPPG HR)

Ground truth = OCR'd monitor BPM (`dataset_front/video_labels_ocr.csv`, 7 clips).
Metric = mean absolute error (bpm, lower = better).

| Stage | 7-video MAE |
|-------|:-----------:|
| Baseline face-box | ~70–90+ |
| + Anatomical ROIs | ~55–65 |
| + A+B preprocessing | ~45–55 |
| + Multi-patch | ~40–48 |
| + Adaptive selector | ~38–42 |
| + Dog-specific weights v1 | **37.5** (best; Video 7 → 21.3) |

Full table: [`docs/research/PERFORMANCE_EVOLUTION_TABLE.md`](docs/research/PERFORMANCE_EVOLUTION_TABLE.md).
These are coarse video-level labels — prototype method-selection, not clinical validation.
**These evolution numbers are dev-set/in-sample (optimistic)** — e.g. the 37.5 row trained
on videos 3/6/7 and reports the mean *including* them. For the honest held-out picture see
the preliminary agreement below (it is a *different* pipeline, not the held-out version of 37.5).

<p align="center">
  <img src="docs/img/bvp_waveforms.png" width="430" alt="extracted BVP pulse waveforms">
</p>
<p align="center"><em>Recovered rPPG pulse (BVP) waveforms per clip from the best anatomical ROI.</em></p>

**Preliminary agreement (honest):** an oracle selector matches the monitor HR to
**±2 bpm** (the signal *is* recoverable), but the honest leave-one-video-out selector
gives **MAE ~45 bpm** with a −38 bias that worsens on fast hearts. The signal is
present; robust automatic selection is the open, **data-limited** problem. Full
analysis: [`docs/research/PRELIMINARY_VALIDATION.md`](docs/research/PRELIMINARY_VALIDATION.md).

<p align="center"><img src="docs/img/bland_altman.png" width="640" alt="Bland-Altman: oracle vs held-out"></p>

Physiology-grounded priors (allometric HR by body mass, fever adjustment, rest/motion
gating, Poincaré/RSA HRV, cyanosis-Hb caveat) are wired in. The **RSA cardio-respiratory
selector** — a label-free cardiac-vs-artifact discriminator — is validated on the probe
clips: **held-out HR MAE 30.8 vs 53.6 bpm** for the prior cached pipeline (wins 6/7),
so it is **now the default** (falls back to cached HR when no video; both reported).
Note: A+B extraction was tested and *regressed* it (48.9), so the simple extraction is used. See
[`PHYSIOLOGY_FEATURES.md`](docs/research/PHYSIOLOGY_FEATURES.md) and
[`RSA_SELECTOR_DESIGN.md`](docs/research/RSA_SELECTOR_DESIGN.md).

---

## The `petvitals` framework

One shared `Session` → many independent **analyzers** → fused **EWS**. Adding a
capability is one file + one import. Current analyzers:

`pose` (posture/activity) · `rppg` (HR/RR/panting) · `hrv` (SDNN/RMSSD) ·
`feeding` (oral activity) · `spo2` · `temperature` · `resp_effort` (pattern/apnea) ·
`mucous` (membrane color). Ranges come from species/breed/patient baselines.

Design + "add an analyzer" guide: [`docs/en/architecture.md`](docs/en/architecture.md).

<p align="center">
  <img src="docs/img/dashboard.png" width="560" alt="dashboard patient detail">
</p>
<p align="center">
  <img src="docs/img/ews_overview.png" width="520" alt="combined EWS per patient">
</p>
<p align="center"><em>Dashboard patient-detail view and the per-patient EWS overview
(behavior + vitals), reproduced from real analyzer output.</em></p>

---

## Quick start

### rPPG pipeline (Python)
```bash
python -m venv .venv && source .venv/Scripts/activate   # Win: .venv\Scripts\activate
pip install -r requirements.txt
python tools/analyze_video.py --stem 3 --dog_aware --relax_rejection
```

### petvitals analyzers + EWS
```bash
python -m petvitals list                 # list analyzers
python -m petvitals run  --stem 1        # all analyzers + fused EWS (precomputed keypoints)
python -m petvitals viz  --stem 3        # posture overlay video/frames

# End-to-end on a NEW clip (video -> keypoints -> analyzers -> EWS):
python -m petvitals analyze clip.mp4                       # generates keypoints (needs DeepLabCut env)
python -m petvitals analyze clip.mp4 --keypoints kp.csv    # skip DLC, use existing keypoints
```
> Keypoint generation needs DeepLabCut SuperAnimal (heavy, GPU) — run it in the DLC
> environment, or pass `--keypoints`. The analyzer/EWS half has no such dependency.

### Dashboard (Streamlit)
```bash
pip install -r requirements.txt          # includes streamlit
python tools/export_ews_ui.py            # compute EWS for all clips
streamlit run dashboard/app.py           # open the dashboard
```

---

## Repository layout

```
petvitals/        modular analysis package (core / analyzers / ews / viz / cli)
tools/            rPPG pipeline + research scripts (50) + exporters
dashboard/        Streamlit dashboard (app.py) — primary UI
ui/               legacy React/AI-Studio HUD (optional; superseded by dashboard/)
docs/
  en/  ko/        maintained docs, split by language (architecture, clinical, pose)
  research/       legacy rPPG design docs + per-stage pipeline + perf table
reports/          evaluation outputs, patient profiles, sensor inputs
dataset_front/    front-view clips + OCR labels   dataset_multi/  multi-view clips
DogFaceModel_Deploy/   dog-face YOLO model + demo
archive/          superseded experiments & old report docs
```

> **Not in git** (size; see `.gitignore`): virtualenvs, caches, `node_modules`,
> raw `*.mp4`, model weights. Get datasets/weights separately.

---

## Datasets & data sources

What public data can improve, and what must be collected. **The behavioral/keypoint
half and breed individualization are coverable from public datasets; the
physiological vitals (HR/RR/HRV/SpO₂/temperature) have no usable public animal data
and must be collected with synchronized reference devices** — see
[`docs/research/PRELIMINARY_VALIDATION.md`](docs/research/PRELIMINARY_VALIDATION.md).

| Dataset | What it gives | Improves (EWS) | Usable now |
|---|---|---|---|
| **DLC SuperAnimal / Quadruped-80K** | the keypoint model we use | all keypoint-derived sub-scores | ✅ in use |
| **APT-36K / AP-10K** | video/image + keypoints (17-kp COCO) | posture classifier (ingest wired) | ✅ adapter [built](docs/research/EXTERNAL_POSE_DATA.md) |
| **AnimalKingdom / MammalNet** | animal behavior/action video | behavior sub-scores | ✅ |
| **Animal Pose / StanfordExtra** | dog/cat keypoints | species-specific fine-tune | ✅ |
| **Stanford Dogs / Tsinghua Dogs / Oxford-IIIT Pet** | breed labels | **breed baseline → all vital thresholds** | ✅ (used below) |
| **DogFLW / CatFLW (+ grimace scales)** | facial landmarks + pain | new **pain** sub-score | ✅ |
| dog accelerometer (IMU) sets | activity ground truth | activity/immobility validation | ✅ |
| human rPPG (UBFC, PURE, MMPD…) | video + synced HR | HR-extraction transfer only | △ transfer |
| **animal rPPG / ECG / vitals** | synced HR/RR/SpO₂ for animals | HR/RR/HRV/SpO₂/temp scoring | 🔴 **none — collect** |

**Where to collect the missing piece**: synchronized **video + ECG (gold standard)
± pulse oximeter + continuous temperature** in veterinary clinics — ICU/anesthesia
recovery, cardiology (home SRR), across breeds/coat colors and the high-HR regime.

**Already applied here**: [`tools/build_breed_map.py`](tools/build_breed_map.py) pulls the
120-breed Stanford-Dogs/ImageNet taxonomy (MIT) → [`petvitals/core/breeds.py`](petvitals/core/breeds.py)
(breed → size/skull class), so a patient profile can give a free-text `breed` (e.g.
"French Bulldog") and [`core/baselines.py`](petvitals/core/baselines.py) auto-resolves the
breed-adjusted HR/RR/temperature ranges used by the EWS.

> Verify each dataset's license before use (research-only / CC / etc.).

---

## Documentation

| Topic | EN | KO |
|-------|----|----|
| Architecture & extending | [en](docs/en/architecture.md) | [ko](docs/ko/architecture.md) |
| Clinical requirements | [en](docs/en/clinical-requirements.md) | [ko](docs/ko/clinical-requirements.md) |
| Pose classifier | [en](docs/en/pose-classifier.md) | [ko](docs/ko/pose-classifier.md) |
| rPPG research / pipeline | [`docs/research/`](docs/research/) | (KR guide included) |

---

## License

MIT (see [`LICENSE`](LICENSE)). Third-party components keep their own terms:
**Ultralytics YOLO = AGPL-3.0**, DeepLabCut / SuperAnimal have their own licenses —
review before commercial or redistributed use.
