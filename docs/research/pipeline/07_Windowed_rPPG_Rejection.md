# 07. 윈도우 단위 rPPG + Rejection

## 목적
선택된 ROI의 전처리된 RGB 시계열을 20초 윈도우 단위로 나누어 실제 rPPG 분석을 수행하고, 신뢰할 수 없는 윈도우를 걸러내는 단계.

## 주요 처리

### 1. 슬라이딩 윈도우
- 길이: 200 프레임 (20초 @ 10fps)
- 스텝: 50 프레임 (5초)
- 각 윈도우마다 독립적으로 rPPG 분석 수행

### 2. rPPG 방법 적용
현재 사용 중인 6가지 방법:
- Green
- Green minus Red (G-R)
- CHROM
- POS
- PCA
- ICA

### 3. RejectionScorer 적용
주요 평가 항목:
- **Motion magnitude** (키포인트 기반)
- **100bpm artifact power ratio**
- **Mouth opening proxy**
- **Background correlation**
- **Pixel stability** (신규: 평균 픽셀 수가 너무 적으면 신뢰도 하락)

현재 dog_aware 모드에서는 비교적 완화된 임계값을 사용 (motion 22, artifact 0.55, mouth 42 수준).

## 실제 동작 예시 (Video 3)

- 총 48개 윈도우 생성
- Adaptive ROI 적용 후 100% 윈도우가 relaxed rejection을 통과
- 일부 윈도우에서 200bpm 이상의 고심박 후보가 높은 SNR로 등장

## 관련 코드

- `tools/demo_rejection_anatomical_video4.py` 내 윈도우 루프
- `tools/rppg_rejection.py` (RejectionScorer 클래스)

## 시각화 자료

- `presentation_images/13.jpg` (전체 파이프라인에서 이 단계의 위치와 데이터 흐름 확인)

## 개선 여지

- 현재는 고정된 윈도우 길이/스텝
- 비디오 특성에 따라 adaptive windowing 고려 가능
- Pixel stability feature를 RejectionScorer에 더 강하게 반영하는 방향 연구 중

---

**다음 문서**: [08. Smart Final Selection](./08_Smart_Final_Selection.md)