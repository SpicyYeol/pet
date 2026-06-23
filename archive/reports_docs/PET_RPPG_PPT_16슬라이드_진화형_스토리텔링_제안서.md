# PET rPPG 발표용 PPT — 16슬라이드 진화형 스토리텔링 구조 제안서

**최신 추가 (2026-05-28)**: 가로형 + 한영 병기 + 모듈 역할 설명이 포함된 세련된 전체 플로우 차트가 새로 생성되었습니다.

**추천 이미지**:
- `reports/rppg_pet_keypoints/PET_RPPG_Horizontal_Flowchart_Final.png` ← **최신 버전 (A+B → 생리적 신호 강화으로 이름 변경)**

**추천 사용 위치**:
- 슬라이드 3번 (문제 정의 직후) — "전체 알고리즘 플로우 차트" 전용 슬라이드로 가장 강력한 하이라이트

이 이미지에서는 기존 "A + B 전처리"를 **"생리적 신호 강화 (Physiological Signal Enhancement)"**으로 변경하여 발표용으로 훨씬 세련되게 만들었습니다. 각 모듈에 역할 설명도 함께 포함되어 있습니다.

**실제 PPTX 반영 완료**: 2026-05-28 기준, `PET_RPPG_Evolution_Story_16slides.pptx`에 새로운 플로우 차트 슬라이드가 추가되었습니다 (슬라이드 마지막에 위치 → 수동으로 원하는 위치로 이동 추천).

**핵심 철학 변경**: 
기존 "기능 나열" 방식 → **"문제 → 왜 이 알고리즘을 도입했는가 → 도입 후 성능이 얼마나 좋아졌는가"** 의 Step-by-step 진화 스토리

이 구조가 기술 발표에서 훨씬 더 설득력 있고 기억에 남습니다.

---

## 전체 슬라이드 흐름 (16장)

### 슬라이드 1: 타이틀
- 제목 + 부제 + 발표자

### 슬라이드 2: 문제 정의 (강력한 Motivation)
- 기존 인간 중심 rPPG가 강아지에게 왜 실패하는가?
- Video 3, 7의 실제 실패 사례 강조

### 슬라이드 3: 우리의 해결 여정 개요 (Timeline)
- 5번의 주요 Iteration을 한 장으로 보여줌
- 각 단계에서 해결한 핵심 문제 간단 표기

### 슬라이드 4: Iteration 1 — Anatomical ROI + DLC Keypoints
- **당시 문제**: Face-box 방식이 100bpm에 고착
- **도입한 것**: DLC SuperAnimal + 얇은 털 영역 ROI
- **성능 변화**: Video 3/7에서 고심박 후보가 처음 등장
- **시각화**: Keypoints 이미지 + Before/After 개념

### 슬라이드 5: Iteration 2 — A+B 전처리
- **당시 문제**: 신호가 너무 약해서 주파수 영역에서 peak이 안 보임
- **도입한 것**: 강력한 헐떡임 제거 + 시간영역 증폭
- **성능 변화**: 170~210+ bpm 후보가 안정적으로 검출되기 시작
- **시각화**: A+B 전후 trace 비교 (가능하면)

### 슬라이드 6: Iteration 3 — Multi-Patch ROI
- **당시 문제**: "픽셀 수가 적을수록 노이즈에 취약하다" (사용자 피드백)
- **도입한 것**: Zone당 여러 작은 패치 샘플링
- **성능 변화**: 픽셀 수 30~50%+ 증가 + variance 감소
- **시각화**: 우리가 방금 만든 ROI Pixel 상세 이미지 (강조)

### 슬라이드 7: Iteration 4 — Adaptive ROI Selector
- **당시 문제**: Multi-Patch를 무조건 적용하면 Video 6(저HR) 성능이 오히려 떨어짐
- **도입한 것**: Per-zone 데이터 기반 선택 (AdaptiveROISelector)
- **성능 변화**: Video 6 저하 없이 고심박 성능 유지/향상
- **시각화**: Chosen ROIs with Quality 이미지 + Adaptive 로직 설명

### 슬라이드 8: Iteration 5 — Dog-specific Signal Model
- **당시 문제**: CHROM/POS 등 인간 피부 모델이 강아지 fur/skin에 부적합
- **도입한 것**: 데이터로 학습한 RGB 가중치 + Correctness objective
- **성능 변화**: v1 기준 전체 7비디오 37.5 bpm (기존 대비 큰 개선)
- **특히 강조**: Video 7에서 21.3 bpm 기록

### 슬라이드 9: ROI 픽셀 수 — 우리가 가장 많이 고민한 부분 (Deep Dive)
- Multi vs Single 실제 픽셀 수 비교 (새로 만든 이미지 3장 사용)
- "왜 Multi-Patch를 도입했는가"에 대한 가장 강력한 시각적 증거

### 슬라이드 10~11: 성능 진화 비교 (전체 + 개별 비디오) — 가장 중요한 슬라이드

**추천 구성 (2슬라이드 추천)**:

**슬라이드 10: 전체 데이터 관점**
- 제목: "기술을 추가할 때마다 전체 데이터(7비디오)에서 성능은 어떻게 변했는가?"
- 7비디오 Mean Error 진화 표 (전체 평균 중심)
- 출처: `reports/PET_RPPG_Performance_Evolution_Full_Dataset.md`

**슬라이드 11: 개별 비디오 관점 (주요 케이스)**
- 제목: "특히 중요한 비디오에서는 어떻게 달랐는가?"
- Video 7, Video 3, Video 6 중심으로 상세 변화 표
- 각 비디오에서 어떤 단계가 결정적이었는지 강조
- 출처: `reports/PET_RPPG_Performance_Evolution_Per_Video_and_Overall.md`

이 두 장을 함께 사용하면 "전체적인 트렌드"와 "구체적인 증거"를 동시에 전달할 수 있습니다.

### 슬라이드 11: 주요 교훈 3가지
- Adaptive 선택의 중요성
- 픽셀 수의 의미
- Prior-guided estimation의 강력함

### 슬라이드 12: 한계 및 향후 방향

### 슬라이드 13: 결론
- "인간을 위한 기술이 아니라, 실제 강아지를 위한 기술을 만들었다"

### 슬라이드 14: Q&A

### 슬라이드 15~16: Appendix (상세 데이터, Weight 값, 추가 실험 등)

---

## 각 Iteration 슬라이드의 이상적인 구성 패턴 (반복 추천)

**추천 내부 구조 (한 슬라이드당)**:

1. **당시 직면했던 문제** (1~2줄 + 시각적 증거)
2. **우리가 도입한 해결책** (알고리즘/기법 이름 + 간단 원리)
3. **도입 후 성능 변화** (Before vs After 숫자 — 가장 중요!)
4. **시각적 증거** (이미지 또는 표)

이 패턴을 최대한 일관되게 유지하면 청중이 "아, 그래서 이걸 왜 넣었구나"를 명확히 이해합니다.

---

## 추천 슬라이드 제목 (최종안)

1. 타이틀
2. 기존 기술의 한계 — 왜 강아지 rPPG가 어려운가
3. 우리의 해결 여정 (5번의 주요 개선)
4. Iteration 1: Anatomical ROI + DLC Keypoints
5. Iteration 2: A+B 전처리 (헐떡임 제거 + 증폭)
6. Iteration 3: Multi-Patch ROI — 픽셀 수 문제 해결
7. Iteration 4: Adaptive ROI Selector
8. Iteration 5: Dog-specific Signal Model
9. ROI 픽셀 수 상세 분석 (Deep Dive)
10. 7비디오 종합 성능 결과
11. 핵심 교훈
12. 한계와 향후 과제
13. 결론
14. Q&A
15. Appendix 1
16. Appendix 2

---

이 구조로 가면 "무슨 기능을 넣었는지"가 아니라 **"어떤 문제를 해결하기 위해 무엇을 했고, 그 결과가 얼마나 좋아졌는지"**가 명확하게 전달됩니다.

---

## Iteration 8 추가 제안 (2026-05 최신) — "단순 Weight를 넘어선 새로운 패러다임"

**사용자 피드백 반영**: "지금 방식으로 뭘하기에는 부족해보임. 단순 weight에 의존하지 않는 뭔가 새로운 방식이 필요함."

### 슬라이드 추가 추천 (기존 16슬라이드 뒤에 2~3장 추가)

**슬라이드 A: Iteration 8 — Spectrum-Domain Learned Selector (Direction 1)**

- **당시 문제**: RGB 3채널 weight를 아무리 학습해도 (v1, v2, high-HR focused, Prior, Ensemble까지) 고심박 Video 3/7에서 peak ambiguity가 해결되지 않음. 1/2/3 실험에서 현실적 모드 36 MAE 한계 확인.
- **도입한 것**: RGB weight 학습 **완전 포기**. 고정 views (Green, G-R 등)에서 **스펙트럼 shape 자체**를 feature로 사용 (binned power + peak 위치 + high-HR band vs 100bpm artifact power ratio).
- **학습**: 60개 labeled window로 Ridge (descriptors-only).
- **성능 변화**:
  - 전체 7비디오 **18.2 MAE** (이전 weight 기반 현실적 최고 ~36 대비 큰 개선)
  - Video 3 (210): **8.9** (역대 최고 수준)
  - Video 7: 38.9, Video 8: 1.6
- **의미**: "HR 정답"을 주파수 도메인에서 직접 모델링. Weight vector가 더 이상 핵심이 아님.
- **시각화 추천**: 
  - Spectrum descriptors가 무엇인지 간단 다이어그램
  - 이전 weight 방법 vs Spectrum 방법 비교 표 (같은 window에서 peak 선택 차이)

**슬라이드 B: Iteration 8 — State Tracker (Direction 3) + 1+3 통합**

- **도입한 것**: 기존 단순 IIR Prior 대신 **2-state Kalman Filter** (HR + velocity).
  - 개 생리학 제약 명시적 모델링 (HR 급변 불가능, velocity damping)
- **1+3 통합 결과**:
  - pure Spectrum (1): 18.2
  - 1+3: 27.4 (아직 calibration 부족으로 pure1에 밀림)
  - pure Tracker (3): 41.3 (관측이 약하면 무용지물)
- **핵심 메시지**: Tracker는 관측 모델(Spectrum)이 좋아야 빛을 발함. 둘의 joint calibration이 다음 레버리지.

**슬라이드 C: 지금까지의 여정 요약 + 새로운 방향성 선언**

- "RGB Weight 최적화 게임"의 한계 명확히 선언 (1/2/3 실험 증거 인용)
- Spectrum Selector가 처음으로 weight-free paradigm에서 competitive한 성능 달성
- 다음 과제:
  1. Spectrum 학습 데이터 대량 확보 (pseudo-label 포함 200+ windows)
  2. Spectrum feature를 더 학습 가능하게 (tiny 1D conv on periodogram)
  3. Spectrum uncertainty + Kalman joint calibration → 1+3의 진짜 성능 실현
- **발표용 한 줄**: "우리는 이제 '더 좋은 weight 3개'를 찾는 단계를 넘어, 강아지 심박 신호의 본질적 특성(스펙트럼 shape + 생리학적 시간 변화)을 직접 모델링하기 시작했습니다."

### 슬라이드 추가 시 추천 위치
- 기존 성능 진화 표 슬라이드 바로 뒤 (또는 Appendix 직전)
- "한계와 향후 과제" 슬라이드와 자연스럽게 연결

이 내용으로 실제 슬라이드 2~3장을 새로 생성해 드리겠습니다 (pptxgenjs로 별도 파일 생성 → 사용자가 메인 PPTX에 복사/붙여넣기 쉽게).