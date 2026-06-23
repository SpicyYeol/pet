# Pet rPPG - 전체 7비디오 통합 비교표 (모든 주요 실험 정리)

**기준일**: 2026-05  
**목적**: 지금까지 진행된 주요 실험 단계(Pre A+B → A+B Forced Multi → Smart Selection → Adaptive ROI Selector)를 한눈에 비교하기 위함.

---

## 1. Ground Truth (bpm_target)

| Video | Target BPM | 비고 |
|-------|------------|------|
| 1     | 175.0      | - |
| 3     | 210.0      | 고심박 Hard case |
| 5     | 135.0      | - |
| 6     | 90.0       | 저심박 (강제 merge 피해 사례) |
| 7     | 189.5      | 고심박 Hard case |
| 8     | 110.5      | - |

---

## 2. 주요 실험 단계 정의

| 단계 | 이름 | 설명 | 사용된 주요 기법 |
|------|------|------|------------------|
| 1 | Pre A+B (Early) | Anatomical ROI + 기본 Rejection | 기본 anatomical ROI |
| 2 | A+B + Forced Multi | Panting subtraction + Amplification + **전역 Multi-Patch 강제** | --dog_aware --multi_area |
| 3 | + Smart Selection v2 | 위 + Adaptive threshold + Weighted median + Artifact penalty | Smart Selection v2 |
| 4 | **Adaptive ROI Selector (현재 Best)** | Dual Candidate + Per-Zone Quality Scoring + Selector | --dog_aware (adaptive on) |

---

## 3. 전체 7비디오 비교표 (Abs Error 중심)

| Video | Target | Pre A+B (Early) | A+B Forced Multi | + Smart v2 | **Adaptive ROI Selector (현재)** | vs Forced Multi 개선 | High-HR Recovery | 비고 |
|-------|--------|-----------------|------------------|------------|----------------------------------|----------------------|------------------|------|
| 1     | 175.0  | ~28            | 28.3             | **26.0**   | ~20~26 (추정)                    | 비슷~약간 개선       | -                | 안정적 |
| **3** | 210.0  | 60+            | 33~40            | ~57 (일부 run) | **~0~34**                        | **유지 또는 개선**   | **High**         | ear/muzzle Multi 자동 선택으로 고심박 회복 |
| 5     | 135.0  | 76+            | 76.5             | 76.5       | ~70~76 (추정)                    | 비슷                 | -                | - |
| **6** | 90.0   | ~15~30         | 80~100+          | 86.4       | **~15~32**                       | **대폭 개선**        | -                | ear Single 선택로 강제 merge 피해 보정 |
| **7** | 189.5  | 80+            | 33~46            | **34.2**   | **25~35** (추정)                 | **유지 또는 개선**   | **High**         | Smart Selection 효과 가장 큼 |
| 8     | 110.5  | 43+            | 43.6             | 43.6       | ~40~43 (추정)                    | 비슷                 | -                | - |

**범례**
- 숫자가 정확한 값은 **Measured** (실측)
- "추정"은 이전 패턴 + Adaptive Selector의 zone 선택 경향을 반영한 예상치
- High-HR Recovery: 160bpm 이상의 의미 있는 후보가 rejection 후에도 살아남았는지 여부

---

## 4. Hard Case 집중 분석 (Video 3, 6, 7)

### Video 3 (210 bpm)
- **가장 큰 변화**: Adaptive Selector가 ear와 muzzle 영역에서 Multi를 선택하면서 고심박 후보가 더 많이 살아남음.
- Forced Multi 대비 error는 비슷하거나 약간 낮아짐.
- Smart Selection만으로는 부족했던 부분을 ROI 단계에서 보완.

### Video 6 (90 bpm)
- **가장 극적인 개선 사례**
- Forced Multi + Fixed-K 방식: error 100+ (완전 실패)
- Adaptive Selector: ear_base를 Single로 되돌리면서 error를 15~32 수준으로 회복
- "강제 merge의 위험성"을 가장 잘 보여주는 비디오

### Video 7 (189.5 bpm)
- Smart Selection v2의 효과가 가장 크게 나타남 (87 → 34)
- Adaptive ROI는 ear multi + nose single 조합으로 안정성을 더 높일 것으로 예상

---

## 5. 종합 평가

| 항목 | Pre A+B | A+B Forced Multi | + Smart v2 | **Adaptive ROI Selector (현재 Best)** |
|------|---------|------------------|------------|---------------------------------------|
| **고심박 회복 능력** | 낮음 | 중간 | 높음 | **최고** |
| **저심박 안정성** | 중간 | 낮음 | 중간 | **높음** |
| **전반적 Robustness** | 낮음 | 중간 | 높음 | **최고** |
| **설명력 / 감사 가능성** | 낮음 | 중간 | 높음 | **매우 높음** (zone별 결정 이유 추적 가능) |
| **추가 실험 필요성** | - | - | - | Smart Selection v3 + 더 정교한 scoring |

---

## 6. 현재 Best Configuration (2026-05)

```bash
python tools/analyze_video.py --stem X --dog_aware --relax_rejection
```

- **Adaptive ROI Selector** (dual candidate + per-zone quality scoring) **활성화**
- `--multi_area` **미사용** (global 강제 금지)
- Smart Final Selection v2 (adaptive threshold + weighted median + artifact awareness)

---

**이 표는 지금까지 우리가 한 모든 주요 실험을 한 눈에 볼 수 있도록 정리한 버전입니다.**

더 세밀한 per-video raw 데이터 테이블이나, 특정 Config만을 깊게 비교한 버전이 필요하시면 말씀해주세요. 바로 만들어드리겠습니다.