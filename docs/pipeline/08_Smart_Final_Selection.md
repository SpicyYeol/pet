# 08. Smart Final Selection

## 목적
Rejection을 통과한 여러 윈도우 중에서 **가장 신뢰할 수 있는 최종 BPM**을 뽑아내는 마지막 단계.

## 왜 "Smart"인가?

단순히 "rejection을 통과한 윈도우 중 SNR이 가장 높은 것"을 고르는 것은 위험하다.

- 한두 개의 운 좋은 (또는 운 나쁜) 윈도우에 과도하게 의존할 수 있음
- artifact가 섞인 고SNR 윈도우가 진짜 cardiac 신호보다 더 높게 평가될 수 있음

## 현재 Smart Selection 전략 (v2 기준)

### 1. Adaptive Thresholding
- 전체 kept window의 score 중 상위 일정 비율 또는 max score의 일정 비율 이상만 선별
- 고정 K(예: top 5)를 사용하지 않음

### 2. Composite Scoring
```python
score = snr * pixel_factor * (1 - rejection) * artifact_penalty
```
- pixel_factor: 픽셀 수가 너무 적은 윈도우는 신뢰도 하락
- artifact_penalty: 100bpm 근처 peak에 강한 페널티

### 3. 최종 추정 방식
- **Score-weighted median** (기본 추천)
- 또는 strongest cluster 내 weighted median (분포가 갈라질 때)

## 실제 효과 예시

- Video 7: Naive single best는 102.5 bpm (artifact 영향), Smart selection은 156.4 bpm으로 크게 개선
- Video 6: Fixed K 방식이 오히려 성능을 망친 경우, adaptive + artifact-aware 방식이 상대적으로 안정적

## 관련 코드

- `tools/evaluate_smart_selection_v2.py`
- `tools/full_evaluation_current_best.py` (집계 및 비교용)

## 시각화 자료

- `presentation_images/13.jpg`, `14.jpg` (전체 흐름 속 Smart Selection 위치)
- 이전 smart selection 비교 보고서 (smart_selection_v2_comparison.csv)

## 개선 여지

- Temporal consistency (인접 윈도우 간 BPM 연속성) 추가 고려
- Multi-camera가 있을 경우 cross-view consistency도 scoring에 반영 가능

---

**이 문서로 8단계 파이프라인에 대한 서브 문서 작성이 모두 완료되었습니다.**

필요하시면 이 8개 문서를 하나로 합친 "상세 파이프라인 백서" 버전이나, 발표용 요약 슬라이드 이미지 등을 추가로 만들어드릴 수 있습니다.