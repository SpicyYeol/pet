# 수의 임상 요구사항 / Veterinary clinical requirements

이 시스템이 "신호 추출 데모"를 넘어 **수의 임상에서 실제로 유용**해지기 위해 필요한 것들. 임상 가치
순으로, 카메라 단독 가능 여부와 함께 정리한다. This is the gap list between the current signal-
extraction prototype and something clinically useful, ordered by value.

> ⚠️ 데이터셋 특이사항: 본 데이터의 개들은 **단두종(불독·프렌치불독·시츄·퍼그)** 이며 배경에
> **마취기(Dräger/Fabius)** 가 보인다 — 즉 *마취/회복 중 단두종*. 이들은 호흡·기도 baseline이
> 비정상이고 마취 위험이 높아, **고정 "개 정상범위"를 쓰면 위험**하다.

---

## 🔴 최우선 (P0)

### 1. 임상 검증 / Clinical validation
- 현재 정답은 모니터 OCR HR(거침)뿐. **동기화 gold standard**(ECG·펄스옥시미터·capnography·연속 체온)와의
  일치도 검증 필요: Bland–Altman, 상태별 민감도/특이도, **종·품종·털색·체구·연령 층화**.
- 어두운/긴 털, 색소 침착 점막에서의 성능 저하를 정량화.

### 2. 종·품종·개체별 baseline (고정 임계값 대체)
- HR/RR/체온 정상치는 고양이≠개, 자견≠노령, 토이≠대형, 단두종≠그 외로 크게 다름.
  그레이하운드=서맥 정상, 단두종=빈호흡/노력성 baseline.
- **개체 baseline + 편차 경보**가 핵심. → 구현: [`petvitals/core/baselines.py`](../petvitals/core/baselines.py),
  환자 프로파일 `reports/patient_profiles/<stem>.json`.

### 3. 호흡의 "질" (rate만으론 부족)
- 노력성 호흡(effort)·패턴·곤란(dyspnea)·복식/역설 호흡·무호흡(apnea), **수면 호흡수(SRR, 심장병 핵심)**,
  단두종 stertor/stridor. → 구현: [`petvitals/analyzers/respeffort.py`](../petvitals/analyzers/respeffort.py).

---

## 🟠 임상 기본 (P1)

| 영역 | 필요 | 카메라 | 상태 |
|------|------|:---:|------|
| 순환/관류 — 점막색(창백·청색증·황달·충혈) | 잇몸/혀/결막 색 분류 | ★★ | ✅ [`mucous.py`](../petvitals/analyzers/mucous.py) |
| 순환 — CRT, 혈압(NIBP/PTT) | 모세혈관 재충전, 혈압 대용 | ★ | 🔜 |
| 부정맥/리듬 | VPC·AF·AV block (HR 아님). **개의 RSA는 정상** → HRV 해석 종특이적 | rPPG 한계, ECG 필요 | 🔜 |
| 통증 | 검증 척도(개 Glasgow CMPS, 고양이 Grimace) — 표정+자세+행동 | ★★ | 🔜 |
| 의식/신경 | mentation(BAR/QAR/둔화/혼미/혼수), 발작, 머리기울임, 진전, 운동실조 | ★★ | 일부(pose) |
| 체중/수분 | 체중 추세(케이지 저울), 부종, 탈수 | 저울 ★ | 🔜 |

---

## 🟡 "모니터링" 시스템 요건 (P1–P2)

- **맥락 인식**: 마취/진정 상태·투여 약물·ET튜브·IV라인·넥카라·붕대·담요가 ROI를 가림 → 모르면 수치 무의미.
- **핸들러/장비 분리 + 개체 ID**: 프레임의 사람·여러 동물 구분, 다개체 케이지.
- **연속·추세·스마트 알람**: 30초 클립이 아니라 시간단위 연속 + baseline 편차 경보 + 알람피로 관리, 야간 IR.
- **기록/규제**: EMR 연동, 감사 추적, "의료기기 아님" 규제 지위, 직원 에스컬레이션.

---

## 🟢 비접촉이 *특히* 강한 유스케이스 (전략)

- **무자극 측정(fear-free)** — 특히 **고양이**(붙잡으면 흰가운 빈맥). 비접촉의 최대 차별점 → 고양이 확장 권장.
- **재택 수면 호흡수(SRR)** — 심장병 환자 모니터링의 검증된 활용.
- **야간 무인 ICU** 감시.

---

## 구현 현황 / Implementation status (2026-06-23)

| 항목 | 분석기 | 상태 |
|------|--------|------|
| 개체/품종 baseline | `core/baselines.py` + `reports/patient_profiles/` | ✅ rppg·spo2·temperature가 사용 |
| 호흡 effort/패턴/무호흡 | `analyzers/respeffort.py` | ✅ v0 |
| 점막색(관류) | `analyzers/mucous.py` | ✅ v0 (보정 안 됨, 조명 민감 — 저신뢰 게이팅) |
| HR/RR/HRV/SpO₂/체온/자세/구강 | 기존 분석기 | ✅ |
| CRT·혈압·부정맥·통증·의식·고양이 | — | 🔜 향후 |

> 모든 임계값은 **임상 컷오프가 아닌 설정 가능한 기본값**이며, 임상 검증 전까지 진단에 사용 불가.
