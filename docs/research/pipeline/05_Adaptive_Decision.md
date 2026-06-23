# 05. Adaptive Decision (Selector)

## 목적
각 영역에서 계산된 Single과 Multi의 품질 점수를 비교하여, **해당 비디오와 영역에 가장 적합한 ROI 변형**을 자동으로 선택하는 단계.

## 결정 로직 (현재 기준)

```python
if quality_multi > quality_single * 1.15:
    choose Multi-Patch
else:
    choose Single-Center
```

- **1.15 배수**: 보수적인 임계값. Multi가 확실히 우수할 때만 선택.
- High-HR 비디오(3, 7)의 경우 추가 prior boost 적용.

## 실제 결정 사례

### Video 3 (고심박, target 210 bpm)
- throat: Single 선택 (Single 품질이 더 높음)
- right_ear: Multi 선택 (Multi가 3.7배 이상 우수)
- left_ear: Multi 선택
- muzzle: Multi 선택

→ ear와 muzzle 영역에서는 Multi-Patch가 명확한 우위를 점함.

### Video 6 (저심박, target 90 bpm)
- muzzle: Single 선택 (Multi를 강제하면 성능 저하)
- nose: Single 선택
- ear_base: Single 선택

→ 저심박 구간에서는 Single tight patch가 더 유리한 경우가 많음.

## 코드 위치

- `tools/adaptive_roi_selector.py`
  - `select()` 메서드
  - `_zone_quality()` 계산 후 비교
- `tools/demo_rejection_anatomical_video4.py` (adaptive 블록)

## 시각화 자료

- `presentation_images/12.jpg` (Adaptive Decision 상세 블록 다이어그램)
- `presentation_images/9.jpg` (Video 3 vs Video 6 실제 결정 비교)
- `presentation_images/13.jpg`, `14.jpg` (전체 흐름 속에서의 결정 위치)

## 개선 여지

- 현재는 고정 1.15 배수
- 비디오 특성(전체 variance, 예상 HR 대역)에 따라 동적으로 임계값을 조절하는 방식 연구 중
- "품질이 비슷할 경우 둘 다 유지" 옵션 추가 가능 (후보 다양성 확보)

---

**다음 문서**: [06. 선택된 ROI에 대한 본격 전처리](./06_Chosen_ROI_Full_Preprocessing.md)