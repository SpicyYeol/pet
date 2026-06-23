# 01. DLC 키포인트 추출 및 정규화

## 목적
강아지 영상에서 rPPG 신호를 추출하기 위한 해부학적 기준점을 정확하고 일관되게 얻는 것.

## 사용 모델
- **프레임워크**: DeepLabCut (DLC)
- **모델**: SuperAnimal Quadruped (HRNet-W32 backbone)
  - 모델 파일 예시: `superanimal_quadruped_hrnet_w32_fasterrcnn_resnet50_fpn_v2`
- **강점**: 별도의 강아지 데이터셋으로 fine-tuning 없이도 quadruped 전반에서 robust한 키포인트 검출 성능을 보임.

## 주요 사용 키포인트 (실제 프로젝트 기준)

| 영역         | 키포인트 이름                  | 주요 용도 |
|--------------|--------------------------------|-----------|
| 인후/목      | `throat_base`, `throat_end`, `neck` | throat_exposed, throat_area ROI |
| 귀           | `right_earbase`, `right_earend`, `left_earbase`, `left_earend` | ear 영역 ROI + panting proxy |
| 주둥이       | `nose`, `upper_jaw`            | muzzle, nose_bridge ROI |
| 턱/입        | `lower_jaw`, `mouth_end_left`, `mouth_end_right` | Panting proxy 계산 (가장 중요) |
| 몸통         | `withers`                      | upper_chest ROI (참고용) |

## 파이프라인 상세 단계

1. **DLC 추론**
   - 입력: 비디오 클립 (보통 30초 이내 probe 영상)
   - 출력: `*_superanimal_quadruped_*.h5`

2. **정규화 (`tools/normalize_dlc_h5.py`)**
   - DLC 원시 좌표를 이미지 크기에 맞춰 0~1 또는 픽셀 단위로 정규화
   - 신뢰도(low likelihood) 키포인트 필터링
   - 출력: `pet_keypoints_normalized.csv`
     - 컬럼: `frame_index`, `keypoint`, `x`, `y`, `likelihood`

3. **품질 확인**
   - 많은 키포인트가 프레임마다 안정적으로 검출되는지 확인
   - (선택) `lightweight_anatomical_tracker.py` 등으로 후속 트래킹 품질 검증

## 실제 데이터 예시 (Video 3, frame 120 기준)

- 총 검출 키포인트 수: ~39개 중 주요 10~12개 적극 활용
- 평균 likelihood: 0.85 이상 (양호)
- 특정 프레임에서 `mouth_end_left/right`의 움직임이 panting proxy의 핵심 신호로 사용됨

## 관련 코드 위치
- `tools/run_deeplabcut_probe.py` / `batch_generate_dlc_probes.py`
- `tools/normalize_dlc_h5.py`
- `tools/demo_rejection_anatomical_video4.py` (키포인트 로딩 부분)

## 시각화 자료
- `presentation_images/3_frame120_keypoints_kr.jpg`
- `presentation_images/6_frame100_keypoints_kr.jpg`

## 개선 여지
- 특정 키포인트(특히 mouth_end 계열)의 검출 안정성이 낮을 때 → 별도의 mouth tracking 모델 추가 고려
- 실시간 환경에서는 full DLC 대신 lightweight tracker (예: KLT + sparse keypoint)로 대체 가능

---

**다음 문서**: [02. 영역별 Dual Candidate 생성](./02_Dual_Candidate_Generation.md)