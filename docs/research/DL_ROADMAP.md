# Deep-learning methodology — where it fits (and why not yet)

*요약(KO): DL은 이 프로젝트의 자연스러운 종착점이지만 대부분 **데이터에 막혀** 있다. 지도학습
rPPG 네트워크·학습형 선택기는 동기화 라벨/다수 클립이 필요하고, n=7에서는 오히려 **생리 기반 규칙(RSA)이
학습 모델보다 잘 일반화**한다(학습형 선택기 MAE 44.7 vs RSA 30.8). 라벨 없이 되는 **자기지도 rPPG
(Contrast-Phys/SiNC)** 가 현재 상황에 가장 맞는 DL 방향이며, 결국 데이터 확보로 수렴한다.*

## The honest constraint
Every supervised DL option needs what we don't have: **synchronized HR labels** and/or
**many clips**. At n=7 clips with coarse OCR labels, classical + physiology methods win —
which is why the pipeline is built that way.

**Evidence** (`tools/eval_learned_selector.py`): a RandomForest fusing all 9 physiological
SQIs, evaluated leave-one-clip-out, gives **MAE 44.7 bpm — worse than the RSA hand rule
(30.8)** and still misses stem 7. With 7 heterogeneous dogs the learned model does not
generalize; the physiology-grounded rule does. (A deeper MLP/net would overfit *more*, not
less, at this scale.)

## DL options mapped to feasibility

| Approach | What it is | Blocker | When it wins |
|---|---|---|---|
| **Supervised end-to-end rPPG nets** (DeepPhys, PhysNet, PhysFormer, TS-CAN, EfficientPhys; via rPPG-Toolbox) | video → pulse/HR, spatiotemporal CNN/transformer | needs labeled (synced-HR) dog video; human-pretrained transfers poorly (fur, no skin) | after a labeled dog cohort exists |
| **Self-supervised rPPG** (Contrast-Phys, SiNC) | learns a pulse extractor from **unlabeled** video using periodicity / spatial-consistency / frequency priors | needs a moderate amount of unlabeled dog video (have some; more helps) | **the label-free DL path — most fitting now** |
| **Learned candidate selector** (RF/GBM/MLP on SQIs) | fuse the 9 physiological SQIs to pick the true candidate | needs many labeled clips; n=7 overfits (shown: 44.7 > 30.8) | with a labeled multi-clip set |
| **Behavior/action DL** (SlowFast, video transformers) | posture/behavior from video | needs labeled behavior data; pose ML already data-limited (LOCO 0.24) | with labeled behavior data |
| **Physiology-informed nets** | embed RSA/harmonic priors as inductive bias / loss | research-heavy; still benefits from data | later-stage refinement |

Note: keypoints already come from a deep net (**DLC SuperAnimal**), and detection from a deep
net (**YOLO**) — the perception front-end is DL; the gap is the *label-scarce* HR/behavior heads.

## Recommended DL path (in order)
1. **Self-supervised rPPG POC** on our (unlabeled) dog clips + `dataset_multi` — the only DL
   that needs no HR labels. Priors: temporal periodicity, cross-ROI/cross-view consistency,
   frequency-band constraints. Cross-check against the RSA selector.
2. **rPPG-Toolbox integration** as a wrapped analyzer (torch is already a dependency): run
   pretrained nets for a domain-gap baseline, then fine-tune once a labeled cohort exists.
3. **Learned multi-feature selector** (GBM/MLP on the 9 SQIs) — infrastructure is ready
   (`tools/eval_learned_selector.py`); activate when the labeled clip count grows.

## Takeaway
DL is the end-state, not the current best. Our physiology results (RSA breakthrough,
complementary SQIs) both (a) provide strong priors a self-supervised/physiology-informed net
can use, and (b) quantify *why* DL needs data — the same synchronized-reference cohort the
rest of the project calls for. See
[`physiology-breakthrough`](../en/physiology-breakthrough.md) and
[`RSA_SELECTOR_DESIGN`](RSA_SELECTOR_DESIGN.md).
