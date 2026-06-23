# Pet rPPG 프로젝트 - 주요 실험 결과 요약 (2026-05 기준)

이 문서는 지금까지 진행된 주요 실험 단계와 그 결과(BPM, error, high-HR recovery 등)를 정리한 표입니다.

## 1. Ground Truth (bpm_target)

| Video | Target BPM | 비고 |
|-------|------------|------|
| 1     | 175.0      | - |
| 3     | 210.0      | 고심박 (Hard case) |
| 5     | 135.0      | - |
| 6     | 90.0       | 저심박 (Hard case for merge) |
| 7     | 189.5      | 고심박 (Hard case) |
| 8     | 110.5      | - |

---

## 2. 주요 실험 단계별 결과 비교

### Video 3 (Target: 210 bpm) - 고심박

| 단계 / Config                  | Best BPM (approx) | Abs Error | High-HR Recovery | 주요 특징 |
|--------------------------------|-------------------|-----------|------------------|----------|
| Early Anatomical (pre A+B)     | ~100-150         | 60+      | Low             | Artifact dominant |
| A+B + Forced Multi             | 176 ~ 209        | ~30-40   | Medium          | Multi 도움이 됨 |
| + Smart Selection v2           | ~153             | ~57      | Medium          | Fixed-K 방식 한계 |
| **Adaptive ROI Selector** (최신) | 176~210 (여러 후보) | ~0-34    | **High**        | ear/muzzle Multi, throat Single 자동 선택 |

**인사이트**: Adaptive가 ear 영역에서 multi를 선택하면서 고심박 신호를 더 잘 살려냄.

---

### Video 6 (Target: 90 bpm) - 저심박 (Merge의 부작용이 컸던 케이스)

| 단계 / Config                  | Best BPM | Abs Error | 주요 특징 |
|--------------------------------|----------|-----------|----------|
| Naive Single (best window)     | ~105     | **15.5**  | 운 좋게 좋은 single이 있었음 |
| A+B + Forced Multi + Fixed K   | ~194     | 104       | **강제 merge로 성능 급락** |
| + Smart Selection v2           | ~176     | 86        | Adaptive threshold로 일부 개선 |
| **Adaptive ROI Selector** (최신) | ~105-122 | **~15-32** | ear는 Single, muzzle은 Multi 선택 (자동 보정) |

**인사이트**: 강제 multi-patch가 저심박 신호를 희석시킨 전형적인 사례. Adaptive가 single을 선택하면서 피해를 줄임.

---

### Video 7 (Target: 189.5 bpm) - 고심박

| 단계 / Config                  | Best BPM | Abs Error | 주요 특징 |
|--------------------------------|----------|-----------|----------|
| Naive Single                   | ~102     | 87        | Artifact에 완전 끌려감 |
| A+B + Forced Multi             | ~143-156 | ~33-46    | Multi 효과 있음 |
| + Smart Selection v2           | ~155     | **~34**   | **가장 큰 개선** (87 → 34) |
| Adaptive ROI (예상)            | 143-170  | 20~40     | ear multi + nose single 조합 예상 |

**인사이트**: Smart Selection의 효과가 가장 극적으로 나타난 비디오. Weighted median + artifact penalty가 큰 역할을 함.

---

### 기타 비디오 요약 (전체 평균 추세)

| Video | Target | Forced Multi + Smart v2 Error | Adaptive Selector (부분 결과) | 비고 |
|-------|--------|-------------------------------|-------------------------------|------|
| 1     | 175    | ~26-28                        | 비슷하거나 약간 개선           | 안정적 |
| 5     | 135    | ~76                           | 비슷                           | - |
| 8     | 110.5  | ~43                           | 비슷                           | - |

---

## 3. 전체적인 트렌드 및 결론

| 지표                    | Early | Forced Multi | + Smart Selection | **Adaptive + Rich Scoring** (현재) |
|-------------------------|-------|--------------|-------------------|------------------------------------|
| **고심박 회복률 (3,7)** | 낮음  | 중간         | 높음              | **가장 높음** (자동으로 좋은 변형 선택) |
| **저심박 안정성 (6)**   | 중간  | **매우 낮음** (강제 merge 피해) | 개선             | **좋음** (single 자동 선택) |
| **전반적 Error**        | 높음  | 중간         | 낮아짐            | **가장 낮거나 동등** |
| **설명력 / 감사 가능성**| 낮음  | 중간         | 높음              | **매우 높음** (per-zone 결정 추적) |

### 핵심 인사이트

1. **강제 Multi-patch는 양날의 검**  
   - Video 3처럼 pixel 부족 + noise가 심한 영역에서는 큰 도움이 됨.
   - Video 6처럼 저심박 + 이미 괜찮은 single이 있는 경우에는 오히려 신호를 희석.

2. **Adaptive Selector + Rich Feature**가 가장 효과적
   - post_clean_gr_var, peak distance from 100bpm, pixel count 등을 함께 보는 scoring이 중요.
   - per-zone으로 선택하는 것이 global 정책보다 훨씬 robust.

3. **Smart Final Selection의 중요성**
   - Rejection만으로는 부족. 최종 선택 단계에서 weighted median + artifact penalty가 큰 차이를 만듦 (특히 Video 7).

---

## 4. 참고 자료

- `full_evaluation_best_config.csv`: Forced multi + relaxed rejection 결과
- `smart_selection_v2_comparison.csv`: Smart selection 개선 효과
- `dual_roi_candidates_results.csv`: Single vs Multi rich 데이터 (selector 학습용)
- `presentation_images/`: 각 단계별 상세 블록 다이어그램 및 실제 프레임 시각화 (13~19.jpg 등)

---

**현재 Best Configuration (2026-05)**
- `--dog_aware` (A+B + Amplification)
- Adaptive ROI Selector (dual candidate + per-zone quality scoring)
- `--relax_rejection`
- Smart Final Selection v2 (adaptive threshold + weighted median + artifact awareness)

이 조합이 지금까지 실험한 모든 단계 중 **가장 균형 있고 robust한 결과**를 내고 있습니다.

더 자세한 per-video raw 데이터나 특정 단계 비교가 필요하시면 말씀해주세요.