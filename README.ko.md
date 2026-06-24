# VET-PPG · 비접촉 반려동물 활력·행동 분석

*English README: [README.md](README.md)*

**일반 영상만으로 강아지의 심박·호흡·행동을 추정**하고(몸에 센서 부착 없음), 이를 하나의
조기경보점수(EWS)로 융합합니다.

저장소는 두 부분으로 구성됩니다:
1. **rPPG 파이프라인** (`tools/`) — RGB 영상에서 심박/호흡수 추출.
2. **`petvitals` 패키지** — 공통 입력(영상 + DLC 키포인트)을 임상 신호와 통합 EWS로 바꾸는
   모듈형 플러그인 분석 프레임워크. Streamlit 대시보드로 표시.

<p align="center">
  <img src="docs/img/pose_demo.gif" width="360" alt="자세 오버레이 데모"><br>
  <em>자세 오버레이 실시간 데모(<code>petvitals viz</code>): DLC 스켈레톤 + 자세 분류 + 프레임별 지표.</em>
</p>

---

## 무엇을 / 왜

병원 손가락 집게가 피부색 변화로 맥박을 읽듯, **rPPG**는 카메라로 멀리서 같은 일을 합니다.
강아지는 **털·헐떡임·움직임·반사광** 때문에 사람보다 훨씬 어려워, 단순 얼굴박스 방식은 약 100bpm
아티팩트에 고착됩니다. 해결: SuperAnimal 키포인트 기반 해부학적 얇은 털 ROI + 헐떡임 제거/심박
증폭(A+B) + 데이터 기반 존별 ROI 선택. 상세: [`docs/research/`](docs/research/).

<p align="center">
  <img src="presentation_images/3_frame120_keypoints_kr.jpg" width="380" alt="DLC 키포인트">
  <img src="presentation_images/3_frame120_chosen_rois_kr_with_quality.jpg" width="380" alt="적응형 ROI 선택">
</p>
<p align="center"><em>SuperAnimal 키포인트(좌) → 적응형 선택기가 얇은 털 ROI(우: 콧등 + 목)를 선택.
단두종, 모니터 표시 약 218 bpm.</em></p>

> ⚠️ 연구 프로토타입 — **의료기기 아님, 임상 검증 안 됨.** 모든 임계값은 임상 컷오프가 아닌 설정값.

---

## 성능 (rPPG 심박)

정답 = 모니터 OCR BPM(`dataset_front/video_labels_ocr.csv`, 7개 클립). 지표 = 평균 절대 오차(bpm, 작을수록 좋음).

| 단계 | 7비디오 MAE |
|------|:-----------:|
| 기준 얼굴박스 | ~70–90+ |
| + 해부학 ROI | ~55–65 |
| + A+B 전처리 | ~45–55 |
| + 멀티패치 | ~40–48 |
| + 적응형 선택기 | ~38–42 |
| + 강아지 전용 가중치 v1 | **37.5** (최고; Video 7 → 21.3) |

전체 표: [`docs/research/PERFORMANCE_EVOLUTION_TABLE.md`](docs/research/PERFORMANCE_EVOLUTION_TABLE.md).
영상 단위 근사 라벨이므로 임상 검증이 아닌 방법 선택 근거.

<p align="center">
  <img src="docs/img/bvp_waveforms.png" width="430" alt="추출된 BVP 맥파">
</p>
<p align="center"><em>최적 해부학 ROI에서 복원한 클립별 rPPG 맥파(BVP) 파형.</em></p>

**예비 일치도(정직하게):** 정답을 아는 oracle 선택기는 모니터 HR과 **±2 bpm** 일치(신호는 복원 가능)
하지만, 라벨을 안 보는 leave-one-video-out 선택기는 **MAE ~45 bpm**, 편향 −38(고심박에서 악화)입니다.
**신호는 있으나 자동 선택이 미해결**인 데이터 한계 문제입니다. 전체 분석:
[`docs/research/PRELIMINARY_VALIDATION.md`](docs/research/PRELIMINARY_VALIDATION.md).

<p align="center"><img src="docs/img/bland_altman.png" width="640" alt="Bland-Altman: oracle vs held-out"></p>

---

## `petvitals` 프레임워크

하나의 `Session` → 여러 독립 **분석기** → 통합 **EWS**. 기능 추가는 파일 하나 + import 한 줄.
현재 분석기:

`pose`(자세/활동) · `rppg`(HR/RR/헐떡임) · `hrv`(SDNN/RMSSD) · `feeding`(구강활동) ·
`spo2` · `temperature` · `resp_effort`(패턴/무호흡) · `mucous`(점막색). 범위는 종/품종/개체 baseline 기반.

설계 + "분석기 추가" 가이드: [`docs/ko/architecture.md`](docs/ko/architecture.md).

<p align="center">
  <img src="docs/img/dashboard.png" width="560" alt="대시보드 환자 상세">
</p>
<p align="center">
  <img src="docs/img/ews_overview.png" width="520" alt="환자별 통합 EWS">
</p>
<p align="center"><em>대시보드 환자 상세 뷰와 환자별 EWS 개요(행동+생리), 실제 분석기 출력으로 생성.</em></p>

---

## 빠른 시작

### rPPG 파이프라인 (Python)
```bash
python -m venv .venv && source .venv/Scripts/activate   # Win: .venv\Scripts\activate
pip install -r requirements.txt
python tools/analyze_video.py --stem 3 --dog_aware --relax_rejection
```

### petvitals 분석기 + EWS
```bash
python -m petvitals list                 # 분석기 목록
python -m petvitals run  --stem 1        # 전체 분석기 + 통합 EWS (사전계산 키포인트)
python -m petvitals viz  --stem 3        # 자세 오버레이 영상/프레임

# 새 영상 엔드투엔드 (영상 → 키포인트 → 분석기 → EWS):
python -m petvitals analyze clip.mp4                       # 키포인트 생성 (DeepLabCut 환경 필요)
python -m petvitals analyze clip.mp4 --keypoints kp.csv    # DLC 생략, 기존 키포인트 사용
```
> 키포인트 생성은 DeepLabCut SuperAnimal(무거움·GPU)이 필요 — DLC 환경에서 실행하거나 `--keypoints`로
> 기존 키포인트를 넘기세요. 분석기/EWS 단계는 그 의존성이 없습니다.

### 대시보드 (Streamlit)
```bash
pip install -r requirements.txt          # streamlit 포함
python tools/export_ews_ui.py            # 전 클립 EWS 계산
streamlit run dashboard/app.py           # 대시보드 열기
```

---

## 저장소 구조

```
petvitals/        모듈형 분석 패키지 (core / analyzers / ews / viz / cli)
tools/            rPPG 파이프라인 + 연구 스크립트(50) + 내보내기 도구
dashboard/        Streamlit 대시보드 (app.py) — 기본 UI
ui/               레거시 React/AI-Studio HUD (선택; dashboard/로 대체됨)
docs/
  en/  ko/        유지보수 문서, 언어별 분리 (architecture, clinical, pose)
  research/       레거시 rPPG 설계 문서 + 단계별 파이프라인 + 성능표
reports/          평가 산출물, 환자 프로파일, 센서 입력
dataset_front/    정면 클립 + OCR 라벨   dataset_multi/  다각도 클립
DogFaceModel_Deploy/   강아지 얼굴 YOLO 모델 + 데모
archive/          대체된 실험 & 옛 리포트 문서
```

> **git 미추적**(용량, `.gitignore` 참고): 가상환경·캐시·`node_modules`·원본 `*.mp4`·모델 가중치.
> 데이터셋/가중치는 별도 입수.

---

## 문서

| 주제 | EN | KO |
|------|----|----|
| 아키텍처 & 확장 | [en](docs/en/architecture.md) | [ko](docs/ko/architecture.md) |
| 임상 요구사항 | [en](docs/en/clinical-requirements.md) | [ko](docs/ko/clinical-requirements.md) |
| 자세 분류기 | [en](docs/en/pose-classifier.md) | [ko](docs/ko/pose-classifier.md) |
| rPPG 연구/파이프라인 | [`docs/research/`](docs/research/) | (KR 가이드 포함) |

---

## 라이선스

MIT ([`LICENSE`](LICENSE)). third-party는 각자 라이선스: **Ultralytics YOLO = AGPL-3.0**,
DeepLabCut / SuperAnimal 별도 약관 — 상업적 이용·재배포 전 확인.
