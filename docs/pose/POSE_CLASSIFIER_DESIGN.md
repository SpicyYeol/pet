# 자세 분류기 설계 문서 (v0, 규칙 기반)
# Posture Classifier — Design Document (v0, rule-based)

**상태 / Status**: 프로토타입 / Prototype
**작성일 / Date**: 2026-06-23
**구현 / Implementation**: [`tools/pose_classifier.py`](../../tools/pose_classifier.py)
**입력 데이터 / Input**: 기존 DLC 키포인트 CSV (`pet_keypoints_normalized.csv`)

---

## 1. 목표 / Goal

**EN** — Turn the DLC keypoints we *already extract for rPPG ROI selection* into a
clinically useful **posture / behavior signal**, at near-zero extra cost (no new
capture, no new model). This is roadmap item #1 (pose classifier) plus item #2
(activity / immobility tracking) — see [[roadmap-behavior-vitals]].

**KR** — rPPG ROI 선택을 위해 **이미 뽑고 있는** DLC 키포인트를 재활용하여, 추가 촬영·추가 모델
없이 **임상적으로 유용한 자세/행동 신호**를 만든다. 로드맵 1번(자세 분류기) + 2번(활동·부동 추적)을
함께 다룬다.

**왜 규칙 기반(v0)부터인가 / Why rule-based first**
- 라벨 데이터가 아직 없음 → 지도학습 불가. 규칙 기반은 라벨 0개로 바로 시작 가능.
- 결과가 **설명 가능(auditable)** — "등 곡률이 높아서 복통 자세로 판정"처럼 근거를 남김.
- 나중에 라벨이 쌓이면 동일한 feature를 그대로 ML 분류기 입력으로 승격.
- No labels yet → start with transparent heuristics; promote the same features to an
  ML classifier once labels accumulate.

---

## 2. 입력 데이터 명세 / Input data spec

DLC SuperAnimal **quadruped, 39 keypoints**, long format CSV:

| column | 의미 |
|--------|------|
| `video`, `time_sec`, `frame_index` | 프레임 식별 / frame id (~10 fps) |
| `keypoint` | 39개 중 하나 / one of 39 names |
| `x`, `y` | **픽셀 좌표** (원점 좌상단, y는 아래로 증가) / pixel coords, origin top-left, y grows downward |
| `confidence` | 0~1 (이 데이터 평균 ≈ 0.49로 낮음 → 신뢰도 처리 필수) |
| `source` | 모델명 |

사용하는 핵심 키포인트 / keypoints we use (나머지 antler 등은 무시 / others like antlers ignored):

```
머리 head : nose, upper_jaw, lower_jaw, left_eye, right_eye,
            left_earbase, right_earbase, throat_base, throat_end
목 neck   : neck_base, neck_end
척추 spine: back_base, back_middle, back_end, tail_base
다리 legs : front_left_paw, front_right_paw, back_left_paw, back_right_paw,
            front_left_thai, front_right_thai (어깨/엉덩이 대용)
```

> ⚠️ 좌표는 픽셀이라 **개체 크기·카메라 거리에 따라 스케일이 다름**. 모든 feature는
> **body_scale로 정규화**해 스케일 불변(scale-invariant)으로 만든다.
> All features are normalized by `body_scale` so they are scale-invariant.
> `body_scale = dist(neck_base, tail_base)` (척추 길이), 없으면 신뢰 키포인트 bbox 대각선으로 대체.

---

## 3. 자세 클래스 (v0) / Posture classes

임상 의미가 큰 것부터 4~5개로 시작 / Start with the 4–5 most clinically meaningful:

| 클래스 / class | 한글 | 임상 의미 / clinical meaning |
|---|---|---|
| `standing_normal` | 정상 기립 | 기준 상태 / baseline |
| `sitting` | 앉음 | 기준 상태 / baseline |
| `sternal_recumbency` | 엎드림(흉와위) | 안정 또는 기력저하 / resting or lethargy |
| `lateral_recumbency` | 옆으로 누움(측와위) | 허탈·중증 가능 / collapse / severe |
| `hunched_abdominal_pain` | 복통 자세(등 굽음) | **복통**(췌장염·복막염 등) |
| `orthopnea_resp_distress` | 기좌호흡 자세(목 신전·팔꿈치 벌림) | **호흡곤란 — 응급** |
| `seizure_or_tremor` | 발작/진전 (동적) | **경련·저혈당·저체온 — 응급** |
| `uncertain` | 판정 불가 | 키포인트 부족 / too few valid keypoints |

> v0는 **단일 카메라 휴리스틱**이라 측와위/엎드림 구분, 기좌호흡 같은 3D 자세는 한계가 있다.
> 다각도(`dataset_multi`) 입력 시 정확도가 올라간다(향후). Single-view heuristics have limits;
> multi-view fusion is future work.

---

## 4. 특징(feature) 정의 / Feature definitions

각 프레임마다 신뢰도 `conf >= MIN_CONF`(기본 0.30)인 키포인트만 사용. 모두 body_scale로 정규화.
Per frame, use only keypoints with `conf >= MIN_CONF` (default 0.30); all normalized by body_scale.

| feature | 정의 / definition | 무엇을 잡나 / signal |
|---|---|---|
| `vertical_separation` | (평균 발 y) − (평균 척추 y), ÷ body_scale | 큼=기립, 작음=누움 / standing vs recumbent |
| `back_curvature` | 척추 현(neck_base→tail_base)에서 back_middle의 부호있는 수직 편차 | +면 등이 위로 굽음=복통 / kyphosis = abdominal pain |
| `spine_tilt` | 척추 점들의 **PCA 주축** 각도(꼬리 가려도 동작) / PCA principal-axis angle of spine points (works even if tail is occluded) | 큼=앉음/상체 듦 / sitting |
| `neck_extension` | dist(nose, neck_base) ÷ body_scale | 큼=목 앞으로 신전=기좌호흡 단서 |
| `head_height` | (평균 척추 y) − (nose y), ÷ body_scale | 머리 들림/떨굼 / head up vs dropped |
| `front_paw_spread` | 앞발 좌우 간격 ÷ body_scale | 큼=팔꿈치 벌림(기좌호흡) / elbow abduction |
| `body_elongation` | 몸통 bbox 장축/단축 비 | 큼=쭉 뻗음(측와위) / extended (lateral) |
| `motion_energy` | 직전 프레임 대비 신뢰 키포인트 평균 변위 ÷ body_scale | 활동량 / activity level |
| `tremor_index` | 짧은 윈도우에서 (총 움직임)−(무게중심 순이동) | 제자리 떨림=발작/진전 / shaking in place |

부호 주의(이미지 y는 아래로 증가) / Sign note (image y grows downward): "위(up)"는 더 작은 y.
`back_curvature` 부호는 외적(cross product)으로 계산.

---

## 5. 분류 알고리즘 / Classification algorithm

우선순위 의사결정 트리(응급 → 안정 순). 임계값은 모두 파일 상단 상수로 노출·튜닝 가능.
Priority decision tree (emergencies first). All thresholds are constants at the top of
the file, ready to calibrate.

```
프레임별 raw 판정 / per-frame raw label:
  if 유효 키포인트 부족                       → uncertain
  elif tremor_index 高 and motion_energy 高    → seizure_or_tremor
  elif vertical_separation 低 (누워있음):
        if body_elongation 高                  → lateral_recumbency
        else                                   → sternal_recumbency
  elif spine_tilt 高                           → sitting
  else  (기립 상태):
        if back_curvature 强(+)                → hunched_abdominal_pain
        elif neck_extension 高 and front_paw_spread 高 and head_height 低
                                               → orthopnea_resp_distress
        else                                   → standing_normal
```

### 시간축 후처리 / Temporal post-processing
프레임 단위 판정은 깜빡임(flicker)이 많다 → 두 단계로 안정화:
1. **다수결 평활화(rolling mode)**: ±0.5초 윈도우의 최빈값.
2. **이력(hysteresis)**: 상태를 바꾸려면 새 상태가 N프레임(기본 5≈0.5초) 연속 유지돼야 함.

Frame-level labels flicker → (1) rolling-mode smoothing over ±0.5 s, then
(2) hysteresis: require N consecutive frames (default 5 ≈ 0.5 s) before switching state.

---

## 6. 출력 / Outputs

1. **프레임별 CSV** `pose_per_frame.csv`
   `frame_index, time_sec, posture_raw, posture_smoothed, <features...>, n_valid_kp`
2. **세션 요약 JSON** `pose_session_summary.json`
   - 클래스별 시간 비율 / time fraction per class
   - 최장 부동 구간(초) / longest immobile span — **욕창(decubitus) 위험**
   - 평균 활동량 / mean activity (motion_energy)
   - 행동 플래그 / behavioral flags: `orthopnea_detected`, `seizure_detected`,
     `prolonged_immobility`, `abdominal_pain_posture`
   - **행동 EWS 하위점수(0~3)** — vital과 합산할 스텁 / a behavior sub-score to fuse with vitals
3. 콘솔 요약 출력 / pretty console summary.

---

## 7. vital과의 통합 (로드맵 4번) / Fusing with vitals (roadmap #4)

자세/행동 신호는 두 방향으로 쓰인다 / used two ways:
- **되먹임(gating)**: `motion_energy`가 낮은(=가만히 있는) 구간에서만 HR/RR을 신뢰 → rPPG 정확도↑.
  Trust HR/RR only in low-motion windows → improves rPPG accuracy.
- **조기경보(EWS)**: 행동 EWS 하위점수 + 생리 점수(HR/RR/HRV/SpO₂/IR체온)를 합산.
  ```
  behavioral_subscore = f(식욕↓, 활동량↓, 비정상자세, 부동지속)
  total_EWS = behavioral_subscore + physiological_subscore
  ```

---

## 8. 검증 계획 / Validation plan

1. **정성 검증(now)**: 8개 probe 영상에 대해 분류기 실행 → 프레임 라벨을 영상에 오버레이해 눈으로 확인.
   Run on all 8 probe clips, overlay labels on video, eyeball them.
2. **소량 라벨링**: 영상당 20~30프레임 수동 라벨 → confusion matrix, 임계값 보정.
   Hand-label ~20–30 frames/clip → confusion matrix, calibrate thresholds.
3. **지표 / metrics**: per-class precision/recall, 응급 클래스(기좌호흡·발작)는 **recall 우선**(놓치면 안 됨).
   Prioritize recall for emergency classes — a miss is worse than a false alarm.

---

## 8.5 보정 로그 / Calibration log

- **2026-06-23** — 오버레이 검증(`visualize_pose.py`)에서 **앉은 강아지가 기립으로 오판정**되는 것을
  발견. 원인: `spine_tilt`가 neck_base+tail_base 둘 다 필요해 꼬리 가림 시 NaN. → 척추 점들의
  **PCA 주축**으로 변경(부분만 보여도 동작). 임계값은 probe 클립 분포로 보정(`T_SPINE_TILT_SIT`:
  기립 stem6 ≈ 14°, 앉음 stem3 ≈ 31° → **24°**). 결과: stem3 sitting 0%→59%, 거짓 복통 플래그 16%→3%.
- Found via overlay verification that a sitting dog was scored as standing because
  `spine_tilt` was NaN when `tail_base` was occluded. Switched to a PCA spine-axis
  fit and set the threshold from the clip distribution (standing ≈14°, sitting ≈31°
  → **24°**). Result: stem 3 sitting 0%→59%, false abdominal-pain flag 16%→3%.

## 8.6 일괄 오버레이 검증 (7개 클립) / Batch overlay verification (7 clips)

**2026-06-23**, `visualize_pose.py`로 7개 probe 클립의 샘플 프레임을 눈으로 검증한 결과:

| stem | 실제 자세 / actual | 라벨 / label | 판정 |
|------|------|------|:---:|
| 3 | 앉음 (불독) | SITTING | ✅ |
| 4 | 앉음 (시츄) | SITTING | ✅ |
| 6 | 기립 (정면) | STANDING | ✅ |
| 7 | 기립 (키포인트 0개) | UNCERTAIN | ✅ (방어적 정상) |
| 1 | **누움/흉와위 (대형견)** | STANDING | ❌ 누움 미검출 |
| 8 | **누움 (닥스훈트, 몸 가림)** | SITTING | ❌ 누움 미검출 |
| 5 | **기립 (닥스훈트, 머리 듦)** | SITTING | ❌ 기립/앉음 모호 |

**핵심 결론 / Key conclusion**: 명확한 케이스(정면 기립, 분명한 앉음)는 잘 맞지만, **단일 시점 휴리스틱의
본질적 한계**가 드러남:
1. **누움(recumbency) 검출 불가** — 누운 개도 등이 발보다 높으면 sep가 커서 기립/앉음으로 보임.
   바닥 기준면(ground plane) 없이는 2D만으로 구분이 어렵다.
2. **기립 vs 앉음 모호** — 닥스훈트처럼 등이 길고 머리를 들면 척추가 대각선(~55°)이 되어 앉음과 겹침.
   (PCA 선형성으로는 구분 불가 — stem 5의 척추는 오히려 더 곧음.)

**시사점 / Implication**: 휴리스틱은 한계 수익(diminishing returns)에 도달. 다음은 **소량 라벨링 +
경량 ML 분류기**(동일 feature 재사용) 또는 **다각도 융합**이 정답. Heuristic tuning has hit its
single-view ceiling; the right next step is labeling + a small ML classifier (reusing the
same features) and/or multi-view fusion — not more thresholds.

## 8.7 ML 분류기 파이프라인 (v0) / ML classifier pipeline (v0)

규칙 기반이 단일 시점 한계에 도달(§8.6)해, 동일 feature를 입력으로 쓰는 **ML 분류기 파이프라인**을 구축했다:
- 라벨: `reports/pose_training/labels.csv` (현재는 **약지도 클립 단위** 라벨, 눈검증 기반)
- 학습: `tools/train_pose_model.py` — PoseAnalyzer의 feature를 그대로 추출 → RandomForest 학습 →
  **leave-one-clip-out CV**(같은 개를 학습·평가에 함께 쓰지 않음) → `petvitals/models/pose_rf.joblib` 저장
- 추론: 모델이 있으면 `PoseAnalyzer`가 자세 분류에 사용(발작·판정불가는 규칙 유지), 없으면 규칙 fallback

**정직한 결과 / Honest result (2026-06-23)**: 6개 클립·클립단위 약라벨로는 leave-one-clip-out
정확도가 **약 0.24로 규칙보다 나빴다**(클래스당 2클립뿐이라 개체 간 일반화 실패). 따라서 **과소학습
모델은 배포하지 않고 규칙을 기본값으로 유지**한다. → 한계는 **아키텍처가 아니라 라벨 수**임이 수치로 확인됨.
The pipeline works end-to-end, but with only 6 weak clip-labels LOCO accuracy was ~0.24
(worse than rules), so no model is shipped — the blocker is **label quantity, not the code**.

**다음 / next**: 프레임 단위 실제 라벨을 늘리면(특히 측와위/흉와위, 머리 든 기립) 동일 스크립트가
자동으로 모델을 활성화. 다각도(`dataset_multi`) feature 추가 시 누움 모호성 추가 개선 기대.

## 9. 한계와 향후 / Limitations & next steps

- v0는 **단일 시점·휴리스틱** → 측와위/엎드림, 기좌호흡 판정은 근사치.
- 키포인트 신뢰도가 낮은 프레임이 많음(평균 0.49) → `uncertain` 비율을 모니터링.
- **다개체** 영상은 개체 ID가 전제(현재는 단일 개체 가정).
- 향후 / future: ① 다각도 융합, ② feature→경량 ML 분류기, ③ 얼굴 grimace 결합(통증), ④ 섭식 검출(로드맵 3번).

---

## 10. 사용법 / Usage

```bash
# 특정 probe stem으로 실행 / run on a probe stem
python tools/pose_classifier.py --stem 3

# 임의의 키포인트 CSV로 실행 / run on any keypoints CSV
python tools/pose_classifier.py --keypoints path/to/pet_keypoints_normalized.csv --out reports/pose_3

# 모든 임계값은 --help로 노출 / all thresholds exposed via flags
python tools/pose_classifier.py --help
```
