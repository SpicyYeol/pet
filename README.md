# VET-PPG · Multi-Cam Telemetry HUD
### 카메라로 강아지 심박수·호흡수를 재는 시스템 (몸에 아무것도 안 붙이고!)
### Measuring a dog's heart rate & breathing from plain video — no sensors on the body

---

## 📌 한 줄 요약 / In one line

**강아지를 카메라로 찍기만 하면, 영상 속 피부색의 미세한 변화를 읽어 심박수(BPM)와 호흡수를 추정합니다.**
가슴에 센서를 붙이거나 동물을 붙잡을 필요가 없습니다.

**Point a camera at a dog, and the software reads the tiny color changes in its skin
to estimate heart rate (BPM) and breathing rate — no chest strap, no restraint.**

이 저장소에는 두 가지가 들어 있습니다 / This repo contains two things:
1. **분석 엔진** (Python) — 영상에서 심박/호흡을 계산하는 연구 코드 / the analysis engine that does the math
2. **모니터링 화면** (React UI) — 동물병원에서 쓸 수 있는 다중 카메라 대시보드 / a clinic-style dashboard

---

## 🐾 이게 뭔가요? / What is this, really?

병원에서 손가락에 집게(산소포화도 측정기)를 끼우면 맥박이 측정되죠? 그 집게는 빛을 쏘아
**피가 지나갈 때마다 변하는 피부색**을 읽습니다. 심장이 뛰면 혈관에 피가 몰리면서 피부색이
아주 미세하게(눈에는 안 보이게) 바뀌는데, 이걸 측정하는 거예요.

You know the finger clip at a hospital that reads your pulse? It shines light and
measures how your skin color changes **each time blood pumps through**. When the
heart beats, blood fills the vessels and the skin color shifts ever so slightly —
too subtle for the eye, but a camera can catch it.

**rPPG(remote photoplethysmography, 원격 광용적맥파)** 는 이 측정을 **집게 없이, 일반 카메라로
멀리서** 하는 기술입니다. 사람 얼굴로는 이미 잘 되지만, **강아지는 훨씬 어렵습니다.**

**rPPG (remote photoplethysmography)** does the same thing but **from a distance, with
an ordinary camera, no clip needed.** It already works on human faces — but **dogs are
much harder.**

---

## 😤 왜 강아지는 어려운가요? / Why are dogs so hard?

| 문제 / Problem | 설명 / Why it breaks things |
|---|---|
| 🦮 **털 (fur)** | 피부가 털에 가려져 색 변화 신호가 거의 안 보임 / fur hides the skin, burying the signal |
| 👅 **헐떡임 (panting)** | 강아지는 더우면 입을 벌리고 빠르게 헐떡임 → 얼굴 전체가 들썩여 심박 신호를 덮어버림 / panting makes the whole face bob, drowning the heartbeat |
| 🏃 **움직임 (motion)** | 가만히 안 있음 / they won't hold still |
| ✨ **반사광 (glare)** | 코·눈의 번들거림이 가짜 신호를 만듦 / shiny nose/eyes create fake signals |

그 결과, 순진하게 "얼굴 전체"를 보고 측정하면 심박이 빠른 영상에서도 **무조건 100 bpm 근처로
잘못 고정**되는 현상이 생깁니다. 이 프로젝트는 바로 그 문제를 푼 기록입니다.

The naive "just look at the whole face" approach gets **stuck reporting ~100 bpm even
when the real heart rate is 200+**. This project is the story of fixing that.

---

## 💡 핵심 아이디어 4가지 / The 4 key ideas

쉬운 비유와 함께 설명합니다. 기술 디테일은 아래 **🔬 방법론** 절에서 다룹니다.
Explained with simple analogies; the technical detail is in the **🔬 Methodology** section below.

1. **털이 얇은 곳만 골라본다 / Look only where the fur is thin**
   온몸 대신 **목·귀 안쪽·주둥이**처럼 피부가 잘 보이는 부위(ROI)만 봅니다. 강아지의 자세를
   알기 위해 AI로 **키포인트(눈·코·귀 등 관절 점)**를 먼저 찾습니다.
   Instead of the whole body, we watch thin-fur spots (throat, inner ears, muzzle). To
   find them we first detect **keypoints** (the dog's nose, ears, eyes…) with AI.

2. **헐떡임을 빼고, 심박은 키운다 (A+B) / Subtract the panting, amplify the heartbeat (A+B)**
   - **A**: 입·귀의 움직임으로 "헐떡임 패턴"을 추정해 신호에서 **빼버림**
   - **B**: 남은 신호에서 **규칙적으로 반복되는 심박 성분만 증폭**
   - **A**: estimate the panting rhythm from mouth/ear motion and **subtract it out**
   - **B**: then **amplify the regular, repeating heartbeat** that remains

3. **부위마다 더 좋은 방법을 스스로 고른다 / Auto-pick the best method per spot**
   어떤 부위는 작은 점 하나(single patch)가, 어떤 부위는 여러 점(multi-patch)이 더 깨끗합니다.
   프로그램이 **신호 품질을 직접 측정해서** 부위별로 더 나은 쪽을 자동 선택합니다.
   For some spots one sampling point is cleaner; for others several are. The program
   **measures signal quality and picks the better option automatically, per spot.**

4. **못 믿을 구간은 버린다 / Throw away the untrustworthy parts**
   영상을 짧은 구간(20초)으로 잘라 분석하고, 움직임이 심하거나 가짜 신호가 낀 구간은
   **버린 뒤**, 믿을 만한 구간들만 모아 최종 심박수를 정합니다.
   We chop the video into 20-second windows, **discard** the ones spoiled by motion or
   artifacts, and combine only the trustworthy windows into the final number.

---

## 📖 용어 사전 / Mini glossary

처음 보는 단어가 나오면 여기를 보세요 / Look here when a term is unfamiliar:

| 용어 | 쉬운 뜻 / Plain meaning |
|------|------------------------|
| **rPPG** | 카메라로 멀리서 맥박을 재는 기술 / measuring pulse from a camera, at a distance |
| **BPM** | 분당 심장 박동 수 (beats per minute) |
| **ROI** (Region of Interest) | 영상에서 "여기를 보겠다"고 정한 작은 영역 / the small patch we choose to analyze |
| **키포인트 / keypoint** | AI가 찾은 신체 지점(코·귀 등) / body landmarks the AI locates |
| **DLC (DeepLabCut) / SuperAnimal** | 동물 키포인트를 찾아주는 공개 AI 모델 / open AI model for animal keypoints |
| **YOLO** | 영상에서 사물/얼굴을 빠르게 찾아내는 AI / fast object/face detector |
| **SNR** (Signal-to-Noise Ratio) | 신호가 잡음보다 얼마나 또렷한지 / how clearly the signal stands out from noise |
| **MAE** (Mean Absolute Error) | 예측과 정답의 평균 오차(작을수록 좋음) / average error vs. truth (lower = better) |
| **윈도우 / window** | 분석을 위해 잘라낸 짧은 영상 구간 / a short time-slice of the video |
| **rejection (거부)** | 품질 나쁜 구간을 걸러내는 단계 / the step that filters out bad windows |

---

## 🔬 방법론: 어떻게 동작하나요? / Methodology: how it works

전체 흐름은 **8단계**입니다. 각 단계의 상세 문서는 [`docs/pipeline/`](docs/pipeline/) 에 있습니다.
메인 코드: [`tools/demo_rejection_anatomical_video4.py`](tools/demo_rejection_anatomical_video4.py)

The full flow has **8 stages**, each documented in [`docs/pipeline/`](docs/pipeline/).
Main script: [`tools/demo_rejection_anatomical_video4.py`](tools/demo_rejection_anatomical_video4.py)

```
                  입력: 영상 + DLC 키포인트  /  Input: video + DLC keypoints
                                    │
  1.  키포인트 검출        YOLO로 강아지를 찾고, DLC로 코·귀·목 등 지점을 표시
      Keypoint detection  Find the dog (YOLO), mark landmarks (DLC SuperAnimal)
                                    │
  2.  이중 후보 생성        부위마다 "점 1개" 버전과 "점 여러 개" 버전을 둘 다 만듦
      Dual candidates     For each spot, make both a single-patch and multi-patch version
                                    │
  3.  A+B 전처리 + 증폭     (A) 헐떡임 빼기 → (B) 심박 주기 키우기
      A+B preprocessing   (A) subtract panting → (B) amplify the heartbeat rhythm
                                    │
  4.  부위별 품질 점수       각 후보가 얼마나 깨끗한지 점수로 계산
      Per-spot quality    Score how clean each candidate is
                                    │
  5.  적응형 선택           부위마다 더 좋은 후보를 자동 선택 (확실히 나을 때만 multi 선택)
      Adaptive selector   Auto-pick the better candidate per spot (multi only if clearly better)
                                    │
  6.  선택본 전체 전처리      고른 부위에 A+B·증폭을 본격 적용
      Full preprocessing  Apply full A+B + amplification to the chosen spots
                                    │
  7.  윈도우별 rPPG + 거부   20초 구간마다 6가지 방법으로 심박 추정, 나쁜 구간 버림
      Windowed rPPG       Estimate BPM per 20s window (6 methods), reject bad windows
                                    │
  8.  스마트 최종 선택       믿을 만한 구간들을 모아 최종 심박수 + 신뢰도 산출
      Smart final pick    Combine trustworthy windows → final BPM + confidence
                                    │
        출력 / Output:  심박수(BPM) + 신뢰도 + "왜 이렇게 골랐는지" 기록
                        Heart rate + confidence + a trace of every decision
```

### 보너스: 심박 외에 호흡도 / Bonus: breathing too
[`tools/dual_respiratory_proxies.py`](tools/dual_respiratory_proxies.py) 는 임상적으로 다른 두 신호를 분리합니다:
- **흉부 호흡수 (thoracic breathing rate)** = 가슴의 오르내림 → **진짜 호흡수**
- **헐떡임 강도 (panting rate)** = 얼굴 움직임 → **헐떡임 지표** (호흡과 구분)

It separates two clinically different signals: **true respiration** (chest motion) and
a **panting indicator** (facial motion).

### 적응형 선택기의 실제 계산식 / The actual selector formula
[`tools/adaptive_roi_selector.py`](tools/adaptive_roi_selector.py) 에서 각 후보의 품질 점수를 이렇게 매깁니다:

```python
pix_factor   = pixel / (pixel + 600)            # 픽셀이 많을수록 잡음에 강함 / more pixels → more robust
clean_factor = 1 / (1 + post_clean_gr_var / 250) # 전처리 후 신호가 안정적일수록 높음 / steadier = higher
art_factor   = 1.0 if dist_from_100 >= 30 else 0.55  # 100bpm 가짜 신호에 페널티 / penalize the 100-bpm artifact
quality      = snr * pix_factor * clean_factor * art_factor
```

**왜 "확실히 나을 때만" multi를 고를까요?** 연구에서, 모든 부위에 무조건 점 여러 개를 쓰면
심박이 빠른 영상(Video 3)은 좋아졌지만 느린 영상(Video 6)은 오히려 나빠졌습니다. 그래서
**1.15배 이상 더 좋을 때만** multi를 선택하도록(보수적으로) 설계했습니다.

**Why "only if clearly better"?** Forcing multi-patch everywhere helped the fast-heart
clip (Video 3) but *hurt* the slow one (Video 6). So multi is chosen only when it scores
**≥1.15× better** — a deliberately conservative rule.

> 더 깊은 설계 배경: [`PET_RPPG_FINAL_STRATEGY.md`](PET_RPPG_FINAL_STRATEGY.md),
> 전체 알고리즘 명세: [`PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md`](PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md)
> ([한국어](PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE_KR.md))

---

## 📈 성능: 얼마나 정확한가요? / Performance: how accurate is it?

### 먼저, 숫자를 어떻게 읽나요? / How to read the numbers
- **정답값(ground truth)**: 영상 속 의료 모니터에 표시된 BPM을 사람이 OCR로 검수한 값
  ([`dataset_front/video_labels_ocr.csv`](dataset_front/video_labels_ocr.csv)). 사용 가능한 영상 7개(1,3,4,5,6,7,8).
- **지표**: **MAE(평균 절대 오차, bpm)** — **작을수록 정확**합니다.
- ⚠️ 이 정답값은 ECG/PPG처럼 정밀 동기화된 게 아니라 **영상 단위 근사값**입니다.

- **Ground truth**: the BPM shown on the medical monitor in each video, human-OCR-verified.
- **Metric**: **MAE in bpm — lower is better.**
- ⚠️ These labels are **coarse, video-level** readings, not synchronized ECG/PPG.

### 기술을 하나씩 더할 때마다의 변화 / Improvement, step by step
오차(MAE)가 어떻게 줄어들었는지 보여주는 "발전 일기"입니다.
A "progress diary" showing how the error (MAE) dropped as each idea was added.

| 단계 / Step | 추가한 기술 / What we added | 7영상 평균 오차<br>7-video MAE | 의미 / Meaning |
|---|---|:---:|---|
| 0 | 기준선: 얼굴 전체 보기 / baseline face-box | **~70–90+** | 빠른 심박 영상은 100bpm에 고착 / fast hearts stuck at 100 |
| 1 | 해부학 ROI (키포인트 + 얇은 털) | ~55–65 | 빠른 심박 후보가 처음 등장 / fast-HR candidates appear |
| 2 | **A+B 전처리** (헐떡임 제거 + 증폭) | ~45–55 | **가장 큰 단일 향상** / biggest single jump |
| 3 | 멀티 패치 ROI | ~40–48 | 픽셀 +30~180%, 분산 −20~40% |
| 4 | 적응형 선택기 | ~38–42 | 느린 심박 영상 손해 없이 유지 / no regression on slow clips |
| 5 | **강아지 전용 가중치 v1** | **37.5** ✅ | **현재 최고** — Video 7 오차 21.3 / best so far |
| 6 | 강아지 전용 v2 (데이터만 늘림) | 70.3 ❌ | 교훈: 데이터를 무작정 늘리면 악화 / lesson: more data ≠ better |

**한 줄 결론**: 기준선 약 70~90 bpm 오차 → 최종 **약 37.5 bpm**까지 절반 가까이 줄였습니다.
특히 가장 어려운 고심박 영상(Video 7, 실제 189.5 bpm)에서 **오차 21.3 bpm**으로 가장 좋았습니다.

**Bottom line**: from ~70–90 bpm error down to **~37.5 bpm** — roughly halved. On the
hardest fast-heart clip (Video 7, true 189.5 bpm) the error reached **21.3 bpm**.

### 배운 교훈 / Lessons learned
- **A+B 전처리와 적응형 선택기**가 고심박 영상에서 결정적이었습니다.
- **데이터를 그냥 많이 넣는다고 좋아지지 않습니다** — v2는 고심박 샘플 비중이 낮아져 오히려 나빠졌습니다.
- A+B preprocessing and the adaptive selector were the game-changers; blindly adding
  training data (v2) backfired because it diluted the fast-heart samples.

상세 평가 리포트 / Detailed reports: [`reports/rppg_eval/`](reports/rppg_eval/),
진화표 / evolution table: [`reports/PET_RPPG_Performance_Evolution_Table.md`](reports/PET_RPPG_Performance_Evolution_Table.md)

---

## 📂 폴더 구조 / Folder structure

```
.
├── tools/                  ⭐ 핵심: 파이프라인·실험·평가 Python 50개
│                              The core: 50 Python scripts (pipeline, experiments, evals)
│   ├── demo_rejection_anatomical_video4.py   ← 메인 파이프라인 / main pipeline
│   ├── adaptive_roi_selector.py              ← 부위 선택 엔진 / ROI decision engine
│   ├── analyze_video.py                      ← 가장 쉬운 실행 진입점 / easiest entry point
│   ├── rppg_rejection.py                     ← 나쁜 구간 거르기 / window rejection
│   └── evaluate_*.py, experiment_*.py        ← 평가·실험용 / evaluation & ablations
├── docs/pipeline/          📘 8단계 각각의 상세 설명 / per-stage method docs
├── DogFaceModel_Deploy/    🐕 강아지 얼굴 검출 YOLO 모델 + 데모 / dog-face YOLO model + demo
├── ui/                     🖥️ 임상 모니터링 화면 (React + Vite, Gemini API)
│                              clinic dashboard front-end
├── dataset_front/          🎬 정면 영상 + OCR 정답 라벨 / front-view clips + labels
├── dataset_multi/          🎬 다각도 영상(정면/좌/우/위) / multi-view clips
├── reports/                📊 평가 리포트·CSV·그래프·발표자료 / reports, CSVs, plots, slides
├── presentation_images/    🖼️ 알고리즘 다이어그램·주석 프레임 / diagrams & annotated frames
├── archive/                🗄️ 옛 실험·대체된 리포트(보관용) / old experiments (kept for history)
├── requirements.txt        📦 Python 의존성 / Python dependencies
├── LICENSE                 ⚖️ MIT
└── PET_RPPG_*.md           📝 설계·전략·개선계획 문서 / design & strategy docs
```

> **git에 올라가지 않는 것들** (용량 문제, [`.gitignore`](.gitignore) 참고):
> 가상환경(`.venv-*`, 약 7GB), 캐시(`.uv-cache`, 1.4GB), `node_modules`, 원본 영상(`*.mp4`),
> 모델 가중치(`*.pt`, `*.joblib`), 중간 캐시(`*.npz`, `*.h5`).
> → **모델 가중치와 영상 데이터는 별도로 받아야 합니다** (Git LFS 또는 외부 저장소).
>
> **Not in git** (too large): virtualenvs (~7 GB), caches, `node_modules`, raw `*.mp4`,
> model weights (`*.pt`, `*.joblib`), intermediate caches. **Get weights and datasets
> separately** (Git LFS or external storage).

---

## 🚀 설치와 실행 / Install & run

### A. 분석 엔진 (Python)

**0단계 — 준비물 / Prerequisites**
- Python **3.11** 권장 / recommended
- (선택) NVIDIA GPU — 키포인트를 직접 생성할 때 훨씬 빠름 / optional GPU for generating keypoints

**1단계 — 환경 만들기 / Create the environment**
```bash
python -m venv .venv

# 활성화 / activate
source .venv/Scripts/activate     # Windows (Git Bash)
# .venv\Scripts\activate          # Windows (PowerShell/CMD)
# source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
# 설치되는 것: opencv-python, numpy, pandas, scipy, scikit-learn, torch, ultralytics, matplotlib
```

**2단계 — 데이터 준비 / Prepare data**
분석하려면 ① 영상과 ② 그 영상의 키포인트 CSV가 필요합니다.
You need ① a video and ② its keypoints CSV.

- 이미 만들어진 키포인트가 있으면 `reports/rppg_pet_keypoints/dlc_probe_<번호>/` 형태로 두면 됩니다.
- 처음부터 만들려면 **DLC SuperAnimal(quadruped)** + **YOLO 얼굴 모델**([`DogFaceModel_Deploy/best.pt`](DogFaceModel_Deploy/))이 필요합니다(GPU 권장).
- If keypoints already exist, place them under `reports/rppg_pet_keypoints/dlc_probe_<id>/`.
- To generate from scratch, you need DLC SuperAnimal (quadruped) + the YOLO face model (GPU recommended).

**3단계 — 실행 / Run**
```bash
python tools/analyze_video.py --stem 3 --dog_aware --relax_rejection
```

**결과 예시 / Example output**
```
Heart Rate                              : 198.4 bpm   (confidence 0.82)
Thoracic Breathing Rate (Main 호흡수)   : 22.0 bpm
Panting Rate (Artifact/Panting 지표)    : 95.0 bpm
```

**자주 쓰는 옵션 / Common flags**

| 옵션 / Flag | 무슨 일을 하나 / What it does | 운영 권장 / Production |
|------|------|:---:|
| `--dog_aware` | A+B 전처리 + 증폭 + 적응형 ROI 켜기 / turn on A+B + adaptive ROI | ✅ 기본 |
| `--relax_rejection` | 강아지에 맞춘 완화된 거부 기준 사용 / dog-tuned, more lenient filtering | ✅ |
| `--multi_area` | (옛 방식) 모든 부위에 멀티패치 강제 / force legacy multi-patch | 비교 실험용만 |
| `--aggressive` | 더 엄격하게 구간 거르기 / stricter filtering | 선택 |

> 💡 **추천 기본 명령**: `--dog_aware --relax_rejection` 두 개만 붙이면 됩니다.
> Just use `--dog_aware --relax_rejection` for normal runs.

### B. 모니터링 화면 (React UI)

```bash
cd ui
npm install
cp .env.example .env      # 파일을 열어 GEMINI_API_KEY 입력 / open it and set your Gemini API key
npm run dev               # 브라우저에서 http://localhost:3000 접속
```

화면 구성 / Screens:
- **Dashboard** — 여러 카메라를 한 화면에 모은 실시간 HUD / multi-cam live HUD
- **Feasibility** — RGB 신호 후보 분석 / RGB candidate analysis
- **History** — 환자(동물)별 과거 측정 기록 / past traces per patient
- **Patients** — 환자 등록·관리 / patient records
- **Settings** — 경보 임계값 설정 / alert thresholds

---

## ❓ 자주 묻는 질문 / FAQ

**Q. 웹캠으로 우리 강아지를 실시간으로 잴 수 있나요?**
A. 현재는 **미리 촬영한 영상 + 키포인트**를 분석하는 연구용 단계입니다. 실시간은 향후 과제예요.
*Not yet — this is a research pipeline for pre-recorded clips. Real-time is future work.*

**Q. 키포인트 CSV가 없으면요?**
A. DLC SuperAnimal로 먼저 키포인트를 생성해야 합니다. `tools/run_deeplabcut_probe.py` 참고.
*You must first generate keypoints with DLC SuperAnimal — see `tools/run_deeplabcut_probe.py`.*

**Q. 왜 오차가 아직 수십 bpm인가요?**
A. 털·헐떡임·움직임 때문에 본질적으로 어렵고, 정답 라벨 자체도 영상 단위 근사값입니다.
사람 얼굴 rPPG보다 훨씬 도전적인 문제예요.
*Dogs are intrinsically hard (fur/panting/motion) and even the ground-truth labels are
coarse. This is far harder than human-face rPPG.*

**Q. 모델 가중치(`best.pt` 등)는 어디 있나요?**
A. 용량 때문에 git에서 제외했습니다. 별도로 전달받아 해당 폴더에 넣어주세요.
*Excluded from git for size — obtain separately and drop into the matching folder.*

---

## ⚠️ 유의사항 / Important caveats

- 정답 라벨은 **영상 단위 OCR 값**이며 동기화된 ECG/PPG가 아닙니다.
- 털·혀·움직임·반사광·영상 압축 때문에 사람 데이터보다 훨씬 어렵습니다.
- 🚑 **이것은 연구·프로토타입 결과물이며, 의료기기가 아니고 임상 검증되지 않았습니다.**
  실제 진료 판단에 그대로 사용하지 마세요.

- Labels are coarse video-level OCR values, not synchronous ECG/PPG.
- Fur, tongue, motion, glare and compression make this much harder than human rPPG.
- 🚑 **This is a research prototype — NOT a medical device and NOT clinically validated.**
  Do not use it for actual clinical decisions.

---

## ⚖️ 라이선스 / License

본 프로젝트는 **MIT 라이선스**입니다 — [`LICENSE`](LICENSE) 참고.
단, 포함된 third-party 구성요소는 각자의 라이선스를 따릅니다: **Ultralytics YOLO = AGPL-3.0**,
DeepLabCut / SuperAnimal도 별도 약관이 있습니다. **상업적 이용·재배포 전 반드시 확인하세요.**

Released under the **MIT License** (see [`LICENSE`](LICENSE)). Third-party components keep
their own terms: **Ultralytics YOLO is AGPL-3.0**, and DeepLabCut / SuperAnimal have their
own licenses — review them before any commercial or redistributed use.
