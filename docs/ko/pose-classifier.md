# 자세 / 행동 분류기

*English: [`docs/en/pose-classifier.md`](../en/pose-classifier.md)*
구현: [`petvitals/analyzers/pose.py`](../../petvitals/analyzers/pose.py)

## 목표

rPPG용으로 이미 뽑는 DLC 키포인트를 재활용해, 추가 촬영·추가 모델 없이 임상적으로 유용한
자세/행동 신호를 만든다. 라벨이 없으므로 **규칙 기반부터** — 설명 가능(auditable)하고, 동일 feature를
나중에 ML 분류기 입력으로 승격.

## 입력

DLC SuperAnimal quadruped, 39 키포인트, long-format CSV(`video, time_sec, frame_index,
keypoint, x, y, confidence`). ~10fps, **픽셀** 좌표(원점 좌상단, y는 아래로 증가), 점별 신뢰도
(이 데이터 평균 ~0.49 → 신뢰도 처리 필수). 모든 feature는 `body_scale`(척추 길이, bbox 대체)로
정규화 → 스케일 불변.

## 자세 클래스

`standing_normal`, `sitting`, `sternal_recumbency`(흉와위), `lateral_recumbency`(측와위),
`hunched_abdominal_pain`(복통), `orthopnea_resp_distress`(기좌호흡), `seizure_or_tremor`(발작),
`uncertain`(키포인트 부족).

## Feature (프레임별, `MIN_CONF` 이상만)

| feature | 의미 |
|---------|------|
| `vertical_separation` | (평균 발 y)−(평균 척추 y) — 크면 기립, 작으면 누움 |
| `back_curvature` | neck→tail 현에서 back_middle의 부호있는 편차 — 위로 굽으면 복통 |
| `spine_tilt` | 척추 점들의 PCA 주축 각도(꼬리 가려도 동작) — 크면 앉음 |
| `neck_extension`, `head_height`, `front_paw_spread` | 기좌호흡 단서 |
| `body_elongation` | bbox 종횡비 — 크면 측와위 |
| `motion_energy`, `tremor_index` | 활동량; 제자리 떨림 = 발작 |

## 의사결정 트리 (응급 우선)

```
키포인트 부족                              → uncertain
tremor 높음 AND motion 높음                → seizure_or_tremor
vertical_separation 낮음 → 길쭉?           → lateral_recumbency / sternal_recumbency
spine_tilt ≥ 24°                          → sitting
back_curvature 강한 (+)                    → hunched_abdominal_pain
목 신전 + 앞발 벌림 + 머리 낮음            → orthopnea_resp_distress
그 외                                      → standing_normal
```

이후 **시간축 평활화**: 다수결(±0.5초) + 이력(5프레임 연속 시 전환), 1초 미만의 짧은 `seizure`
구간은 억제(노이즈).

## 출력

프레임별 CSV + 세션 요약 JSON(자세 시간비율, 평균 활동량, 최장 부동 구간=욕창 위험, 플래그,
행동 EWS 하위점수). 시각 검증: `python -m petvitals viz --stem <n>` (라벨+스켈레톤 오버레이).

## 보정·검증 로그

- **동적 임계값**을 키포인트 노이즈 바닥(`motion_energy`≈0.06) 위로 올려 지터가 발작으로 오검출되지 않게.
- **앉음 보정**: `spine_tilt`가 neck_base+tail_base 둘 다 필요해 꼬리 가림 시 NaN → **PCA 척추축 적합**으로
  변경, 임계값은 클립 분포로(기립 ≈14°, 앉음 ≈31° → 24°). 결과: 앉음 0%→59%, 거짓 복통 16%→3%.
- **7개 클립 오버레이 검증**: 명확한 케이스(앉음·기립·kp0→uncertain) 통과. 남은 단일시점 한계: 누운 개도
  등이 발보다 높으면 누움/앉음 모호, 등 길고 머리 든 개는 척추 ~55°로 기립/앉음 모호.

## ML 분류기 (데이터 한계)

파이프라인: `tools/train_pose_model.py`가 동일 feature로 RandomForest를 **leave-one-clip-out CV**로
학습, 모델이 있으면 `PoseAnalyzer`가 사용(발작·판정불가는 규칙 유지). 정직한 결과: 6개 약라벨로는
LOCO 정확도 ≈ 0.24(규칙보다 나쁨) → **모델 미배포, 규칙이 기본**. 한계는 아키텍처가 아니라 라벨 수.
`reports/pose_training/labels.csv`에 실제 프레임 라벨을 추가하면 모델이 자동 활성화.

## 한계

단일 시점 휴리스틱, 저신뢰 프레임 다수, 단일 개체 가정. 향후: 다각도 융합(`dataset_multi`),
라벨 확충, 얼굴 통증(grimace), 그릇 ROI 섭식.
