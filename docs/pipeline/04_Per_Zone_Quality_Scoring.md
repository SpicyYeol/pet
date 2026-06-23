# 04. Per-Zone Quality Scoring

## 목적
각 영역에서 생성된 Single과 Multi 후보 중 **어느 것이 더 우수한 신호를 가지고 있는지** 객관적으로 정량화하는 단계.

## 핵심 Quality Formula (2026-05 기준)

```python
quality = snr * pix_factor * clean_factor * artifact_factor

pix_factor   = pixel_mean / (pixel_mean + 600)
clean_factor = 1 / (1 + post_clean_gr_var / 250)
artifact_factor = 1.0 if peak_dist_from_100 >= 30 else 0.55
```

### 각 요소의 의미

- **SNR**: 해당 후보에서 가장 잘 나온 rPPG 방법의 SNR
- **pix_factor**: 픽셀 수가 너무 적으면 노이즈에 취약하다는 점을 반영
- **clean_factor**: A+B 후에도 여전히 variance가 높으면 품질이 낮다고 판단
- **artifact_factor**: 100bpm 근처에 peak가 있으면 강하게 패널티

## 실제 계산 예시 (Video 3, Right Ear 영역)

**Single (right_ear_base)**
- SNR: 22.69
- Pixel: 1008
- Post-clean GR var: 774
- Dist from 100bpm: 71.7
- **Quality ≈ 3.89**

**Multi (ear_area_right)**
- SNR: 59.67
- Pixel: 1453
- Post-clean GR var: 484
- Dist from 100bpm: 50.0
- **Quality ≈ 14.39** (약 3.7배 우수)

→ 이 차이 때문에 Adaptive Selector가 Multi를 선택

## 코드 위치

- `tools/adaptive_roi_selector.py` → `_zone_quality()`
- `tools/demo_rejection_anatomical_video4.py` → adaptive 블록 내 dual_rows 생성 부분

## 시각화 자료

- `presentation_images/11.jpg` (Quality Scoring 상세 블록 다이어그램)
- `presentation_images/8.jpg` (실제 계산 예시)

## 개선 여지

- 현재는 hand-crafted 가중치
- 추후에는 "좋은 ROI"에 대한 라벨을 모아서 간단한 모델로 대체 가능
- 영역별로 다른 가중치를 학습하는 것도 고려 가능

---

**다음 문서**: [05. Adaptive Decision](./05_Adaptive_Decision.md)