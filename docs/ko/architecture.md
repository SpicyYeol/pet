# 아키텍처 & 확장 가이드

*English: [`docs/en/architecture.md`](../en/architecture.md)*

## 설계 철학

하나의 공통 입력(`Session`)이 여러 독립 **분석기(analyzer)**를 통과하고, 각 분석기는 동일한 형식의
`AnalyzerResult`를 내며, 결과들은 하나의 조기경보점수(EWS)로 융합됩니다.
**기능 추가 = 분석기 파일 하나 추가.**

```
        영상 + DLC 키포인트
                 │
            core.Session                 공통 입력 단위
                 │
   ┌─────────────┼─────────────┐
   ▼             ▼             ▼
 pose      rppg / hrv     spo2 / temperature      ← 분석기(플러그인)
 feeding   resp_effort    mucous
   └─────────────┼─────────────┘
                 ▼
         AnalyzerResult ×N   (프레임별 + 요약 + 0~3 sub-score)
                 │
            ews.fuse_ews                 통합 EWS
                 │
   cli (run / viz / list)  ·  viz.overlay  ·  Streamlit 대시보드
```

## 패키지 구조 (`petvitals/`)

| 경로 | 역할 |
|------|------|
| `core/session.py` | `Session` — 한 클립의 영상+키포인트+fps |
| `core/keypoints.py` | 키포인트 CSV 로드, 접근 헬퍼, 키포인트 그룹 |
| `core/geometry.py` | 스케일 불변 기하 (body_scale, PCA 척추각) |
| `core/baselines.py` | 종/품종/개체별 정상범위 |
| `core/refvitals.py` | 외부 센서 입력(SpO₂·체온) |
| `core/analyzer.py` | **Analyzer 인터페이스 + AnalyzerResult + 레지스트리(`@register`)** |
| `analyzers/*.py` | 플러그인 (pose, rppg, hrv, feeding, spo2, temperature, resp_effort, mucous) |
| `ews/fusion.py` | 분석기 sub-score를 통합 EWS로 합산 |
| `viz/overlay.py` | 자세 오버레이 렌더링 |
| `cli.py`, `__main__.py` | 통합 CLI (`python -m petvitals`) |

`tools/`의 50개 스크립트는 연구 코드로 유지되며, `tools/pose_classifier.py`·`visualize_pose.py`는
패키지를 호출하는 얇은 shim입니다.

## Analyzer 계약

```python
@dataclass
class AnalyzerResult:
    name: str                  # 분석기 이름
    per_frame: pd.DataFrame    # frame_index + 분석기별 컬럼
    summary: dict              # JSON 직렬화 가능 요약
    ews_subscore: int = 0      # 0~3, EWS 기여도
    ews_reasons: list = []     # 사람이 읽는 사유
```

## 새 분석기 추가 (3단계)

```python
# 1) petvitals/analyzers/myfeature.py
from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.session import Session
import pandas as pd

@register
class MyAnalyzer(Analyzer):
    name = "myfeature"
    description = "무엇을 하는지"
    def analyze(self, session: Session) -> AnalyzerResult:
        ...
        return AnalyzerResult(self.name, pd.DataFrame(...), summary, subscore, reasons)
```

```python
# 2) petvitals/analyzers/__init__.py
from . import myfeature  # noqa: F401
```

3. 끝 — `python -m petvitals list`에 표시되고 `run`으로 실행되며 EWS에 자동 합류합니다.
CLI·융합·출력은 손댈 필요 없습니다.

## 로드맵 → 분석기 매핑

| 기능 | 분석기 | 상태 |
|------|--------|------|
| 자세(#1) + 활동·부동(#2) | `analyzers/pose.py` | ✅ |
| HR/RR (rPPG) | `analyzers/rppg.py` | ✅ HR=캐시 파이프라인, RR=키포인트 |
| HRV | `analyzers/hrv.py` | ✅ 캐시 BVP에서 SDNN/RMSSD |
| 섭식/구강활동(#3) | `analyzers/feeding.py` | ✅ v0 프록시, 그릇 ROI는 향후 |
| SpO₂ | `analyzers/spo2.py` | ✅ 외부 센서 입력 |
| 체온 | `analyzers/temperature.py` | ✅ 열화상/레퍼런스 입력 |
| 종/품종/개체 baseline | `core/baselines.py` + `reports/patient_profiles/` | ✅ 범위 결정 |
| 호흡 effort/패턴/무호흡 | `analyzers/respeffort.py` | ✅ 신호품질 게이팅 |
| 점막색(관류) | `analyzers/mucous.py` | ✅ v0, 보정 안 됨 |
| 통합 EWS(#4) | `ews/fusion.py` + UI | ✅ 전체 융합, 대시보드 표시 |
| 자세 ML 분류기 | `tools/train_pose_model.py` + `analyzers/pose.py` | 🟡 파이프라인 완성, 데이터 한계 |
| CRT·혈압·부정맥·통증·고양이 | — | 🔜 |

## CLI

```bash
python -m petvitals list                 # 분석기 목록
python -m petvitals run  --stem 3        # 전체 실행 + EWS
python -m petvitals viz  --stem 3        # 자세 오버레이
python tools/export_ews_ui.py            # 대시보드용 EWS 데이터 내보내기
```

출력 → `reports/pose_<stem>/`: `<analyzer>_per_frame.csv`,
`<analyzer>_session_summary.json`, `ews_summary.json`, `<stem>_pose_overlay.mp4`.
