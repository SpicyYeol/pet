# VET-PPG · Multi-Cam Telemetry HUD
### Contactless heart-rate & respiration for dogs from RGB video
### RGB 영상 기반 반려견 비접촉 심박·호흡 측정 시스템

> Remote photoplethysmography (rPPG) for furry pets — DLC keypoints → adaptive
> anatomical ROI selection → A+B physiological amplification → windowed rPPG with
> rejection → robust HR/respiration output, plus a multi-cam clinical HUD.
>
> 털이 있는 반려동물을 위한 원격 광용적맥파(rPPG) 파이프라인 — DeepLabCut 키포인트 →
> 적응형 해부학적 ROI 선택 → A+B 생리신호 증폭 → 윈도우 단위 rPPG + 거부(rejection) →
> 강건한 심박/호흡 추정, 그리고 다중 카메라 임상 HUD UI를 포함합니다.

---

## 1. Overview / 개요

**EN** — Estimating heart rate from video is well studied on bare human skin, but
**fur, panting, motion and specular highlights** make dogs far harder: naive
face-box methods collapse to a ~100 bpm artifact on high-heart-rate clips. This
project solves that with **anatomical thin-fur ROIs** (throat, ear bases, muzzle)
driven by SuperAnimal keypoints, a **panting-subtraction + cardiac-amplification**
preprocessing stage, and a **data-driven per-zone ROI selector** that decides —
per video, per zone — whether a single patch or a multi-patch sample is better.

**KR** — 사람의 맨살에서는 영상 기반 심박 추정이 잘 연구되어 있지만, **털·헐떡임·움직임·
반사광** 때문에 반려견은 훨씬 어렵습니다. 단순 얼굴 박스 방식은 고심박 영상에서 약 100 bpm
아티팩트에 고착됩니다. 본 프로젝트는 SuperAnimal 키포인트 기반의 **해부학적 얇은 털 ROI**
(목/귀밑/주둥이), **헐떡임 제거 + 심장 신호 증폭(A+B)** 전처리, 그리고 영상·존(zone)마다
단일 패치와 다중 패치 중 무엇이 더 좋은지 스스로 결정하는 **데이터 기반 적응형 ROI 선택기**로
이 문제를 해결합니다.

---

## 2. Performance / 성능

> Ground truth = OCR-reviewed monitor BPM readings in
> `dataset_front/video_labels_ocr.csv` (video-level, 7 usable clips: 1,3,4,5,6,7,8).
> Metric = Mean Absolute Error (MAE) in bpm. These are **coarse video-level labels,
> not synchronous ECG/PPG** — treat as prototype method-selection, not clinical validation.
>
> 정답값 = `dataset_front/video_labels_ocr.csv`의 OCR 검수된 모니터 BPM(영상 단위, 사용 가능 7개:
> 1,3,4,5,6,7,8). 지표 = 평균 절대 오차(MAE, bpm). 동기화된 ECG/PPG가 아닌 **영상 단위 근사 라벨**
> 이므로 임상 검증이 아니라 프로토타입 단계의 방법 선택 근거로 보아야 합니다.

### 2.1 Iteration evolution / 반복 개선 진화

| # | Added technique / 추가 기술 | 7-video MAE | Video 3 (210bpm) | Video 7 (189.5bpm) | Note / 비고 |
|---|---|---|---|---|---|
| 0 | Baseline face-box (green/CHROM/POS) / 기준 얼굴박스 | ~70–90+ | 100+ (lock) | 90–100+ (lock) | High-HR clips stuck at ~100 bpm artifact / 고심박 100bpm 고착 |
| 1 | Anatomical ROIs (DLC keypoints + thin-fur) / 해부학 ROI | ~55–65 | improved | improved | High-HR candidates first appear / 고심박 후보 첫 등장 |
| 2 | **A+B preprocessing** (panting removal + amp) / A+B 전처리 | ~45–55 | 40–60s | 40–60s | **Biggest single jump** / 가장 큰 단일 향상 |
| 3 | Multi-patch ROIs / 다중 패치 ROI | ~40–48 | improved | improved | +30–180% pixels, −20–40% variance / 픽셀↑ 분산↓ |
| 4 | Adaptive selector (per-zone) / 적응형 선택기 | ~38–42 | stable | stable | Keeps high-HR gains without hurting Video 6 / 저심박 저하 없음 |
| 5 | **Dog-specific weights v1** (36 win) / 강아지 전용 가중치 v1 | **37.5** | ~49.5 | **21.3** (best) | **Best to date** / 현재 최고 |
| 6 | Dog-specific v2 (60 win, retrained) / v2 재학습 | 70.3 | 122.7 | 94.6 | Cautionary: data imbalance hurts / 데이터 불균형의 위험 사례 |

### 2.2 Baseline face-box detail / 기준 얼굴박스 상세
From `reports/rppg_eval/rppg_evaluation_report.md` — best baseline combo was
`g_minus_r + face_full` at **range MAE 59.8 / target MAE 66.2 bpm, 0% within-range**,
confirming face-box methods cannot recover high heart rates. The anatomical +
adaptive pipeline above is the answer to that failure.

`reports/rppg_eval/rppg_evaluation_report.md` 기준, 최고 baseline 조합은
`g_minus_r + face_full`로 **range MAE 59.8 / target MAE 66.2 bpm, within-range 0%**
였습니다. 얼굴박스 방식은 고심박을 복원하지 못함을 확인했고, 위 해부학+적응형 파이프라인이
그 해결책입니다.

**Key insight / 핵심 교훈:** A+B amplification and the adaptive selector were
decisive on hard high-HR clips; simply adding more training data (v2) *worsened*
results — high-HR sample balance matters more than volume.
A+B 증폭과 적응형 선택기가 고심박 영상에서 결정적이었고, 단순히 데이터를 늘린 v2는 오히려
악화되었습니다 — 양보다 고심박 샘플 비중이 중요합니다.

---

## 3. Methodology / 방법론

**EN** — The production pipeline (`tools/demo_rejection_anatomical_video4.py`) runs
8 stages. Each stage is documented in `docs/pipeline/`.

**KR** — 운영 파이프라인(`tools/demo_rejection_anatomical_video4.py`)은 8단계로 동작하며
각 단계는 `docs/pipeline/`에 문서화되어 있습니다.

```
Video + DLC keypoints / 영상 + DLC 키포인트
        ↓
1. Keypoint detection (YOLO seg + DLC SuperAnimal quadruped) / 키포인트 검출
        ↓
2. Dual candidate generation per zone (single-center vs multi-patch) / 존별 이중 후보 생성
        ↓
3. A+B preprocessing + amplification / A+B 전처리 + 증폭
     A) panting-proxy subtraction (mouth+ear motion, strength 0.85 + clip)
        헐떡임 프록시 제거(입+귀 움직임, 강도 0.85 + 클리핑)
     B) time-domain cardiac periodicity reinforcement on green channel
        그린 채널 시간영역 심박 주기성 강화
        ↓
4. Per-zone quality scoring / 존별 품질 점수
     quality = SNR × pix_factor × clean_factor × art_factor
        ↓
5. AdaptiveROISelector — data-driven per-zone decision / 적응형 ROI 선택 (데이터 기반)
     multi-patch only chosen when ≥1.15× better (conservative) / 1.15배 우수할 때만 다중 선택
        ↓
6. Chosen ROI(s) → full A+B + amplification / 선택된 ROI 전체 전처리
        ↓
7. Windowed rPPG (20s win / 5s step, 6 methods: green, g-r, CHROM, POS, PCA, ICA)
   + rejection (motion / 100-bpm artifact / mouth / pixel stability)
   윈도우 rPPG + 거부 (움직임·100bpm 아티팩트·입·픽셀 안정성)
        ↓
8. Smart final selection (weighted median / clustering) / 스마트 최종 선택
        ↓
Output: HR bpm + confidence + decision trace / 심박 + 신뢰도 + 결정 추적
```

**Dual output / 이중 출력** — `dual_respiratory_proxies.py` separates two clinically
distinct signals: **thoracic breathing rate** (chest motion = true respiration /
호흡수) and **panting rate + intensity** (facial = artifact/panting indicator /
헐떡임 지표).

**Adaptive ROI core / 적응형 ROI 핵심** (`tools/adaptive_roi_selector.py`):
```python
pix_factor   = pixel / (pixel + 600)          # more pixels → less noise / 픽셀↑ 노이즈↓
clean_factor = 1 / (1 + post_clean_gr_var / 250)
art_factor   = 1.0 if dist_from_100 >= 30 else 0.55   # penalize 100-bpm artifact
quality      = snr * pix_factor * clean_factor * art_factor
```
The conservative `1.15×` multi-patch threshold is the lesson from research: forcing
multi-patch everywhere helped high-HR Video 3 but hurt low-HR Video 6.
보수적인 `1.15×` 임계값은 연구의 교훈입니다 — 모든 곳에 다중 패치를 강제하면 고심박 Video 3는
좋아지지만 저심박 Video 6는 악화됩니다.

Full algorithm & deployment spec: [`PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md`](PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md)
([KR](PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE_KR.md)), strategy: [`PET_RPPG_FINAL_STRATEGY.md`](PET_RPPG_FINAL_STRATEGY.md).

---

## 4. Repository structure / 저장소 구조

```
.
├── tools/                     # 50 Python scripts — pipeline, experiments, evaluators
│                              # 파이프라인·실험·평가 스크립트 (연구 코어)
│   ├── demo_rejection_anatomical_video4.py   # main pipeline / 메인 파이프라인
│   ├── adaptive_roi_selector.py              # decision engine / 결정 엔진
│   ├── analyze_video.py                      # thin CLI wrapper / CLI 래퍼
│   ├── rppg_rejection.py                     # rejection scorer / 거부 스코어러
│   └── evaluate_*.py, experiment_*.py        # eval & ablation / 평가·실험
├── docs/pipeline/             # 8 per-stage method docs / 단계별 방법 문서
├── PET_RPPG_Deploy/           # minimal deployable subset / 최소 배포 패키지
├── DogFaceModel_Deploy/       # YOLO dog-face model (best.pt) + demo
├── ui/                        # React + Vite clinical HUD (AI Studio / Gemini)
│                              # 임상 HUD 프런트엔드
├── dataset_front/             # front-view clips + OCR ground-truth labels
├── dataset_multi/             # multi-view clips (front/left/right/up)
├── reports/                   # evaluation reports, CSVs, plots, slide decks
├── presentation_images/       # block diagrams & annotated frames / 발표 이미지
├── archive/                   # old experiments & superseded reports / 보관용
├── yolo11n-seg.pt             # YOLO11 segmentation weights
└── PET_RPPG_*_GUIDE / STRATEGY / IMPROVEMENT_PLAN .md   # design docs / 설계 문서
```

> **Not tracked in git / git 미추적** (see `.gitignore`): `.uv-cache/` (1.4 GB),
> `.venv-dlc-gpu/` (5.4 GB), `.venv-keypoint/` (1.5 GB), `ui/node_modules/`,
> `ui/dist/`, raw `*.mp4` datasets, `*.npz/*.h5` caches, model `*.pt`, `*.pptx`.
> Distribute model weights and datasets separately (Git LFS or external storage).
> 모델 가중치와 데이터셋은 별도 배포(Git LFS 또는 외부 저장소)를 권장합니다.

---

## 5. Quick start / 빠른 시작

### 5.1 rPPG pipeline (Python)
```bash
# 1. Environment / 환경 (Python 3.11)
python -m venv .venv && source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r PET_RPPG_Deploy/requirements.txt
#   opencv-python numpy pandas scipy scikit-learn torch ultralytics matplotlib

# 2. Run on a prepared video (DLC probe already generated) / DLC 결과가 준비된 영상 분석
python tools/analyze_video.py --stem 3 --dog_aware --relax_rejection

# Output / 출력
#   Thoracic Breathing Rate (Main 호흡수) : xx.x bpm
#   Panting Rate (Artifact/Panting 지표)  : xx.x bpm
#   Heart Rate + confidence + decision trace
```

**Flags / 플래그**

| Flag | Effect / 효과 | Production / 운영 |
|------|---------------|------------------|
| `--dog_aware` | A+B + amplification + adaptive ROI / A+B·증폭·적응형 ROI | ✅ default |
| `--relax_rejection` | dog-tuned relaxed thresholds / 강아지용 완화 임계값 | ✅ |
| `--multi_area` | force legacy global multi-patch / 레거시 전역 다중 패치 강제 | ablation only |
| `--aggressive` | tighter rejection thresholds / 더 엄격한 거부 | optional |

> Generating keypoints from scratch needs **DLC SuperAnimal (quadruped)** + the
> **YOLO dog-face model** (`DogFaceModel_Deploy/best.pt`); GPU probe recommended.
> 키포인트를 처음부터 생성하려면 DLC SuperAnimal(quadruped)와 YOLO 얼굴 모델이 필요하며 GPU 권장.

### 5.2 Clinical HUD UI (React + Vite)
```bash
cd ui
npm install
cp .env.example .env        # set GEMINI_API_KEY / Gemini API 키 설정
npm run dev                 # http://localhost:3000
```
Views / 화면: **Dashboard** (multi-cam spatial-fusion HUD), **Feasibility**
(RGB candidate analysis), **History** (patient traces), **Patients** (records),
**Settings** (alert thresholds).

---

## 6. Caveats / 유의사항

- Labels are **video-level OCR readings**, not synchronous ECG/PPG. / 라벨은 동기 ECG/PPG가 아닌 영상 단위 OCR 값.
- Fur, tongue visibility, motion, specular highlights and compression make these
  clips harder than human-skin rPPG datasets. / 털·혀·움직임·반사광·압축으로 사람보다 난도 높음.
- **Prototype / research output — not a medical device and not clinically validated.**
  / **프로토타입·연구 산출물이며 의료기기가 아니고 임상 검증되지 않았습니다.**

---

## 7. License / 라이선스

No license file is currently present. Add one (e.g. MIT / Apache-2.0) before public
release. Note third-party components (Ultralytics YOLO = AGPL-3.0, DeepLabCut) carry
their own licenses. / 현재 라이선스 파일이 없습니다. 공개 전 라이선스를 추가하세요. YOLO(AGPL-3.0),
DeepLabCut 등 third-party 구성요소는 각자의 라이선스를 따릅니다.
