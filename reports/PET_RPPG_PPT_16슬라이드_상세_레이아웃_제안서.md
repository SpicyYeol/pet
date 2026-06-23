# PET rPPG 발표용 PPT — 16슬라이드 상세 레이아웃 제안서

**목적**: 실제 PowerPoint 제작 시 바로 참고할 수 있는 상세 가이드  
**총 슬라이드 수**: 16장  
**추천 발표 시간**: 20~25분  
**디자인 컨셉**: 기술적 깊이 + 시각적 설득력 (Clean & Professional)

---

## 전체 디자인 가이드라인 (전 슬라이드 공통)

- **템플릿 스타일**: Clean white background + subtle grid or light gradient
- **주 색상**:
  - Primary: #1E3A5F (Deep Navy)
  - Accent: #E85D04 (Vibrant Orange) — 강조용
  - Secondary: #2D6A4F (Teal Green) — 긍정적 결과 강조
- **폰트**:
  - 제목: Pretendard / Noto Sans KR Bold
  - 본문: Pretendard / Noto Sans KR Regular
  - 코드/숫자: Consolas 또는 JetBrains Mono
- **레이아웃 원칙**:
  - 한 슬라이드에 텍스트 과도하게 넣지 말기 (최대 5~6줄)
  - 큰 이미지 + 최소 텍스트 우선
  - 중요한 숫자/키워드는 크게 강조
- **애니메이션**: 최소화 (필요한 경우에만 Fade 또는 Appear)

---

## 슬라이드별 상세 제안

### 슬라이드 1: 타이틀 슬라이드

**레이아웃**: Full background image + overlay text (중앙 정렬)

**추천 배경**:
- Video 7의 고품질 프레임 (강아지 얼굴이 잘 보이는 장면) + 반투명 다크 오버레이

**내용**:
- 메인 타이틀 (크게, 중앙 상단)
  - **강아지 심박수 추정을 위한 영상 기반 rPPG 파이프라인**
- 부제 (조금 작게)
  - 털·헐떡임·고심박 환경을 극복한 적응형 접근법
- 발표자 이름 + 소속 + 날짜 (하단)

**비고**: 로고 넣을 공간 확보

---

### 슬라이드 2: 문제 정의

**레이아웃**: 3열 카드 레이아웃 (왼쪽부터 오른쪽으로)

**내용**:
- 제목: "기존 rPPG 기술은 왜 강아지에게 실패하는가?"

**3개의 카드**:
1. **털로 인한 신호 감쇠**
2. **강한 헐떡임 아티팩트**
3. **높은 심박수 (150~220 bpm)**

각 카드 아래에 간단한 설명 + 작은 아이콘

**하단**:
- "Video 3, 7에서 기존 방법은 대부분 ~100 bpm에 고착"

**이미지**: Video 3 또는 7의 실패 사례 스펙트럼 간단 스크린샷 (선택)

---

### 슬라이드 3: 전체 파이프라인 개요

**레이아웃**: 큰 이미지 중심 + 하단 요약 텍스트

**추천 이미지**:
- `presentation_images/18.jpg` 또는 `19.jpg` (2페이지 블록 다이어그램 중 하나, 전체 화면으로 크게)

**제목**: "제안하는 8단계 적응형 rPPG 파이프라인"

**하단 한 줄 강조**:
"단순한 신호 처리 개선이 아니라, ROI부터 모델까지 전체를 함께 최적화"

---

### 슬라이드 4: 단계 1-2 상세 (키포인트 + Dual Candidate)

**레이아웃**: 좌우 분할 (Left: 설명, Right: 이미지)

**왼쪽**:
- 제목: "1. 키포인트 검출 & 2. Dual Candidate 생성"
- bullet points:
  - DLC SuperAnimal Quadruped 모델 사용
  - 각 zone에 Single과 Multi-Patch 후보 동시에 생성

**오른쪽**:
- `presentation_images/3_frame120_keypoints_kr.jpg`
- `presentation_images/3_frame120_all_rois_kr.jpg` (작게 2장 배치)

---

### 슬라이드 5: 단계 3 — A+B 전처리

**레이아웃**: 중앙 큰 다이어그램 + 양옆 간단 설명

**제목**: "3. A+B 전처리: 신호 품질을 근본적으로 끌어올리다"

**내용**:
- A: 강력한 헐떡임 제거 (0.85 강도)
- B: 시간영역 주기성 강화

**하단 강조**:
"이 단계 이후 Video 3, 7에서 170~210+ bpm 후보가 처음으로 안정적으로 검출되기 시작"

---

### 슬라이드 6: 단계 4 — Adaptive ROI Selector (하이라이트 1)

**레이아웃**: 큰 이미지 + 오른쪽 설명 박스

**추천 이미지**:
- `presentation_images/3_frame120_chosen_rois_kr_with_quality.jpg` (가장 크게)

**제목**: "4. Adaptive ROI Selector — 데이터로 판단하는 선택"

**오른쪽 텍스트**:
- 기존 문제: "무조건 Multi-Patch 적용 → Video 6 성능 저하"
- 해결: zone별로 Single vs Multi 품질을 실시간 비교
- 핵심 수식: Quality = SNR × Pixel Factor × Cleanliness × Artifact Distance

**강조 박스**:
"Multi가 meaningfully better할 때만 선택 (threshold 1.15)"

---

### 슬라이드 7: ROI 픽셀 수 상세 분석 (하이라이트 2)

**레이아웃**: 3열 비교 레이아웃 (Video 3, 6, 7)

**제목**: "ROI 픽셀 수 — Multi-Patch가 실제로 얼마나 유리한가?"

**추천 이미지** (3장 모두 사용):
- `reports/rppg_pet_keypoints/roi_pixel_visualization/video3_frame120_roi_pixel_detail.jpg`
- `reports/rppg_pet_keypoints/roi_pixel_visualization/video6_frame100_roi_pixel_detail.jpg`
- `reports/rppg_pet_keypoints/roi_pixel_visualization/video7_frame90_roi_pixel_detail.jpg`

**하단 테이블** (간단 요약):
| ROI              | Single     | Multi-Patch | 증가율 |
|------------------|------------|-------------|--------|
| throat_area      | 1,936 px   | 2,896 px    | +49%   |
| ear_area_right   | 1,024 px   | 1,476 px    | +44%   |
| muzzle_skin      | 676 px     | 976 px      | +44%   |

**강조 문구**:
"픽셀 수가 적을수록 노이즈에 취약하다는 사용자의 지적을 정량적으로 증명"

---

### 슬라이드 8: 단계 6-8 요약 (rPPG 적용 ~ 최종 선택)

**레이아웃**: 흐름 다이어그램 중심

**제목**: "5~8단계: 신호 추출 → 거절 → 최종 선택"

**이미지**:
- `presentation_images/19.jpg` (후반부 흐름이 잘 보이는 페이지)

**핵심 키워드** (3개 박스):
- dog_learned (강아지 전용 모델)
- Pixel Stability 기반 Rejection
- Smart Final Selection

---

### 슬라이드 9: dog_learned 모델 상세

**레이아웃**: 좌우 분할

**왼쪽**:
- 제목: "Dog-Specific Signal Model"
- Weight 학습 과정 간단 설명
- Combined Correctness Objective

**오른쪽**:
- Weight 변화 표 (Original → v1 → v2)
- 현재 추천 weights: `[0.286, -0.7886, 0.5443]`

---

### 슬라이드 10: 정량적 결과 (7비디오)

**레이아웃**: 큰 테이블 + 하이라이트

**제목**: "7비디오 전체 평가 결과 (HR 정확도)"

**테이블**:
| Method           | Mean Error | Median Error | 순위 |
|------------------|------------|--------------|------|
| pos              | 31.1       | 29.5         | 1    |
| dog_learned (v1) | **37.5**   | **32.5**     | **2**|
| g_minus_r        | 41.8       | 18.1         | 3    |
| ...              | ...        | ...          | ...  |
| green            | 60.5       | 77.7         | -    |

**하이라이트 박스**:
"Video 7 (189.5 bpm) 단독 실행 시 dog_learned가 21.3 bpm 오차 기록"

---

### 슬라이드 11: 주요 인사이트 3가지

**레이아웃**: 3개의 큰 카드 (세로 배치)

1. **Adaptive per-zone 선택**이 글로벌 규칙보다 우수
2. **픽셀 수**가 노이즈 저항력에 직접적 영향
3. **Prior-guided estimation**은 고심박 비디오에서 가장 강력한 후처리 기법

각 카드에 간단한 증거 숫자 또는 이미지 썸네일

---

### 슬라이드 12: Video 7 상세 분석 (사례 연구)

**레이아웃**: 이미지 + 분석 텍스트

**이미지**:
- `video7_frame90_roi_pixel_detail.jpg` (크게)
- 이전에 생성한 diagnostic 이미지 (필요 시)

**내용**:
- OLD vs NEW weights 비교
- Prior-guided 사용 시 극적인 개선 (59.5 → 12.3)

---

### 슬라이드 13: 한계 및 향후 과제

**레이아웃**: 좌우 분할

**왼쪽**: 현재 한계
- Ground truth가 video-level
- Linear 모델의 한계
- Video 4 probe 처리 불안정

**오른쪽**: 향후 과제 (우선순위 순)
1. estimate_bpm_with_prior를 기본 동작으로 통합
2. 더 정교한 피부/털 구분 기반 픽셀 필터링
3. 고심박 특화 모델 또는 데이터 재균형

---

### 슬라이드 14: 결론

**레이아웃**: 큰 메시지 중심

**제목**: "결론"

**중앙 큰 텍스트** (3줄):
"인간을 위한 기술이 아니라,  
실제 강아지를 위한 기술을 만들었다."

**하단**:
- 핵심 기여 3가지 bullet
- "Adaptive + Pixel-aware + Dog-specific"

---

### 슬라이드 15: Q&A

**레이아웃**: 심플

**제목**: "Q & A"

**하단**:
- 연락처 / GitHub 링크 (필요 시)
- "Thank you"

---

### 슬라이드 16: Appendix (백업 슬라이드)

**용도**: 질문이 나올 때 대비

**내용**:
- 상세 Weight 값 표
- 전체 파이프라인 pseudocode
- 추가 실험 결과 (필요한 경우)

---

## 제작 시 추천 작업 순서

1. 슬라이드 3, 6, 7, 10을 가장 먼저 완성 (핵심 메시지)
2. 이미지 리소스 먼저 정리 (특히 새로 만든 ROI pixel 이미지)
3. 폰트/색상 통일 후 전체 슬라이드 제작
4. 애니메이션은 최소화

---

**이 문서를 기반으로 실제 PPT를 제작하시면 됩니다.**

필요하시면:
- 이 내용을 바탕으로 실제 .pptx 파일 생성 (python-pptx 사용)
- 더 짧은 12슬라이드 버전 재구성
- 특정 슬라이드(예: ROI 픽셀 분석 슬라이드)의 더 세밀한 레이아웃 제안

원하는 작업 말씀해주세요.