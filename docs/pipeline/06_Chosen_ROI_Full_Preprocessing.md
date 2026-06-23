# 06. 선택된 ROI에 대한 본격 전처리

## 목적
Adaptive Selector가 최종적으로 선택한 ROI에 대해, **실제 분석에 사용할 만큼 깨끗하고 강한 cardiac 신호**를 만드는 단계.

## 이전 단계(3)와의 차이

- 단계 3: 후보 평가용 (빠른 품질 비교 목적, 가벼운 전처리)
- 단계 6: 본 분석용 (더 강력하고 일관된 전처리 적용)

## 처리 내용

- **Panting Subtraction**: strength 0.85 + 5~95% clipping (평가용과 동일하지만, 선택된 ROI에만 집중 적용)
- **Cardiac Amplification**: Periodicity Reinforcement (주기 기반 신호 강화)
- 추가적으로:
  - 전체 비디오 길이에 걸쳐 일관된 전처리 적용
  - 후속 윈도우 분석을 위한 안정적인 RGB 시계열 생성

## 왜 이 단계가 중요한가?

선택된 ROI라도 전처리가 약하면, downstream의 rPPG 방법과 Rejection이 제대로 동작하지 않는다.

특히 고심박 비디오에서는 A+B를 충분히 강하게 해야 100bpm artifact를 억누르고 진짜 cardiac peak를 드러낼 수 있다.

## 관련 코드

- `apply_ab_amplification()` (강도 0.85 고정)
- `periodicity_reinforcement()`

## 시각화 자료

- `presentation_images/13.jpg` (Video 3 전체 흐름에서 이 단계의 역할 확인 가능)

## 개선 여지

- 선택된 ROI의 특성(예: muzzle은 panting 영향이 적음)에 따라 subtraction strength를 동적으로 조절하는 연구 여지 있음

---

**다음 문서**: [07. 윈도우 단위 rPPG + Rejection](./07_Windowed_rPPG_Rejection.md)