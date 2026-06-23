# 03. A+B 전처리 + Cardiac Amplification (후보 평가용)

## 목적
Dual Candidate로 생성된 두 트레이스(Single / Multi)에 대해 **공정한 품질 비교**를 하기 위해 동일한 전처리를 적용하는 단계.

## 처리 내용

### 1. Panting Artifact Subtraction (A)
- **Panting Proxy 생성**
  - `upper_jaw` vs `lower_jaw` 수직 움직임 (55%)
  - `mouth_end_left` vs `mouth_end_right` 수평 움직임 (35%)
  - 귀 움직임 보조 신호 (10%)
  - Savitzky-Golay smoothing 적용

- **Subtraction 강도**
  - 후보 평가 단계: 0.85 (강하게)
  - 최종 분석 단계: 동일하게 0.85 + clipping

- **추가 처리**
  - 5~95 percentile clipping으로 outlier 제거

### 2. Cardiac Amplification (B)
- **Periodicity Reinforcement**
  - Green 채널에 대해 autocorrelation 기반 주기 추정
  - 주기와 2배 주기만큼 신호를 shift & average
  - 약한 cardiac 신호를 시간축에서 강화

## 왜 이 단계가 중요한가?

- A+B를 적용하지 않고 품질을 비교하면, panting artifact가 강한 후보가 오히려 높은 SNR을 보일 수 있음.
- A+B를 동일하게 적용한 후 비교해야 **진짜 cardiac signal**이 잘 살아있는 후보를 골라낼 수 있음.

## 실제 영향 예시 (Video 3, ear 영역)

- Single: A+B 전 variance 매우 높음 → post-clean 후에도 여전히 noisy
- Multi: A+B로 panting이 상당 부분 제거 → post-clean variance 급감, SNR 대폭 상승

## 관련 코드

- `apply_ab_amplification()`
- `periodicity_reinforcement()`
- `compute_panting_proxy()` (여러 버전 존재, 최신은 multi-keypoint 버전)

## 시각화 자료

- `presentation_images/13.jpg` (전체 파이프라인 데이터 흐름도 – 이 단계가 어디에 위치하는지 확인 가능)

## 개선 여지

- 현재는 모든 후보에 동일한 strength(0.85) 적용
- 영역별 또는 비디오별로 optimal strength를 찾는 adaptive subtraction도 가능

---

**다음 문서**: [04. Per-Zone Quality Scoring](./04_Per_Zone_Quality_Scoring.md)