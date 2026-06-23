# 아키텍처 & 확장 가이드 / Architecture & Extension Guide

**대상 / Audience**: 이 프로젝트에 **새 기능을 추가하려는 개발자** / developers adding new capabilities.

---

## 1. 한 문장 철학 / One-sentence philosophy

**EN** — One shared input (`Session`) flows through many independent **Analyzers**;
each emits a uniform `AnalyzerResult`; results are fused into one early-warning
score (EWS). Adding a capability = adding one analyzer file.

**KR** — 하나의 공통 입력(`Session`)이 여러 독립 **Analyzer**를 통과하고, 각 Analyzer는 동일한
형식의 `AnalyzerResult`를 내며, 결과들은 하나의 조기경보점수(EWS)로 융합됩니다.
**기능 추가 = Analyzer 파일 하나 추가.**

---

## 2. 레이어 / Layers

```
            video + DLC keypoints  (영상 + 키포인트)
                        │
            ┌───────────▼───────────┐
            │   core.Session         │  공통 입력 단위 / shared input unit
            └───────────┬───────────┘
                        │  (frames, fps, geometry helpers)
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   analyzers.pose   analyzers.rppg*  analyzers.feeding*   ← 플러그인 / plugins
   (posture)        (HR/RR)          (intake)               *= 향후/future
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                 AnalyzerResult ×N   (per-frame + summary + ews_subscore)
                        │
            ┌───────────▼───────────┐
            │   ews.fuse_ews         │  통합 조기경보 / combined EWS
            └───────────┬───────────┘
                        ▼
        cli (run / viz / list)   ·   viz.overlay (영상 오버레이)
```

---

## 3. 디렉토리 / Package layout (`petvitals/`)

| 경로 / path | 역할 / role |
|------|------|
| `core/session.py` | `Session` — 한 클립의 영상+키포인트+fps를 담는 공통 입력 / shared input |
| `core/keypoints.py` | 키포인트 CSV 로드, 키포인트 접근/평균 헬퍼, 그룹 상수(HEAD/SPINE/PAWS) |
| `core/geometry.py` | 스케일 불변 기하 — body_scale, 수직편차, PCA 주축 각도 |
| `core/analyzer.py` | **`Analyzer` ABC + `AnalyzerResult` + 레지스트리(`@register`)** |
| `analyzers/pose.py` | 자세/행동 분석기 (참조 구현) + `PoseConfig`(임계값) |
| `analyzers/__init__.py` | 분석기 등록 트리거(여기서 import해야 레지스트리에 올라감) |
| `ews/fusion.py` | 분석기별 sub-score를 합산해 통합 EWS 산출 |
| `viz/overlay.py` | 자세 라벨+스켈레톤 영상 오버레이 렌더링 |
| `cli.py`, `__main__.py` | 통합 CLI (`python -m petvitals ...`) |

> 기존 `tools/`의 50개 스크립트는 **연구/실험 코드**로 그대로 유지됩니다. `tools/pose_classifier.py`
> 와 `tools/visualize_pose.py`는 이제 패키지를 호출하는 **얇은 shim**(하위 호환)입니다.
> The 50 legacy `tools/` scripts remain as research code; the two pose tools are now
> thin shims over the package (backward compatible).

---

## 4. Analyzer 계약 / The analyzer contract

```python
@dataclass
class AnalyzerResult:
    name: str                  # 분석기 이름 / analyzer name
    per_frame: pd.DataFrame    # frame_index + 분석기별 컬럼 / per-frame columns
    summary: dict              # JSON 직렬화 가능 요약 / JSON-serializable summary
    ews_subscore: int = 0      # 0~3, 조기경보 기여도 / contribution to EWS
    ews_reasons: list = []     # 사람이 읽는 사유 / human-readable reasons
```

---

## 5. 새 분석기 추가 (3단계) / Add a new analyzer (3 steps)

예: 섭식 검출기 / Example — a feeding detector.

**① 파일 생성 / Create the file** `petvitals/analyzers/feeding.py`
```python
from ..core.analyzer import Analyzer, AnalyzerResult, register
from ..core.session import Session
import pandas as pd

@register
class FeedingAnalyzer(Analyzer):
    name = "feeding"
    description = "Detect eating/drinking events from head-at-bowl + jaw motion"

    def analyze(self, session: Session) -> AnalyzerResult:
        rows, events = [], 0
        for i, fr in enumerate(session.frames):
            eating = self._is_eating(fr)          # 여러분의 로직 / your logic
            events += int(eating)
            rows.append({"frame_index": session.frame_index[i], "eating": eating})
        per_frame = pd.DataFrame(rows)
        summary = {"eating_frames": int(events),
                   "eating_fraction": round(events / max(session.n_frames, 1), 3)}
        sub = 1 if summary["eating_fraction"] < 0.02 else 0   # 식욕부진 신호
        reasons = ["little/no feeding observed"] if sub else []
        return AnalyzerResult(self.name, per_frame, summary, sub, reasons)

    def _is_eating(self, frame) -> bool:
        ...
```

**② 등록 / Register it** — `petvitals/analyzers/__init__.py` 에 한 줄 추가:
```python
from . import feeding  # noqa: F401
```

**③ 끝 / Done.** 자동으로 사용 가능 / immediately available:
```bash
python -m petvitals list                       # feeding 이 목록에 표시됨
python -m petvitals run --stem 3               # 모든 분석기 실행 + EWS 융합
python -m petvitals run --stem 3 --analyzers pose feeding
```

EWS 융합·CLI·출력 파일은 **수정할 필요 없음** — `ews.fuse_ews`가 새 sub-score를 자동 합산합니다.
No changes to the CLI, EWS fusion, or output plumbing — `fuse_ews` aggregates the new
sub-score automatically.

---

## 6. 향후 분석기 매핑 / Mapping the roadmap to analyzers

| 로드맵 / roadmap | 분석기 / analyzer | 비고 / note |
|------|------|------|
| 자세 (#1) | `analyzers/pose.py` | ✅ 구현됨 / done |
| 활동·부동 (#2) | `pose` 내 통합 / inside pose | ✅ (mean_activity, immobile span) |
| HR/RR (rPPG) | `analyzers/rppg.py` | ✅ HR=캐시된 해부학 파이프라인 결과, RR=키포인트 흉부운동 / HR from cached pipeline, RR from keypoints |
| 섭식 (#3) | `analyzers/feeding.py` | 🔜 위 §5 패턴 / use §5 pattern |
| IR 체온·SpO₂·HRV | `analyzers/*.py` | 🔜 동일 패턴 / same pattern |
| 통합 EWS (#4) | `ews/fusion.py` | ✅ pose + rppg 융합 동작 / fuses pose + rppg |

---

## 7. CLI 요약 / CLI cheatsheet

```bash
python -m petvitals list                      # 분석기 목록 / list analyzers
python -m petvitals run  --stem 3             # 전체 분석기 실행 + EWS / run all + EWS
python -m petvitals run  --keypoints path.csv --analyzers pose
python -m petvitals viz  --stem 3 --sample-frames 4   # 오버레이 영상/프레임
```
출력 / outputs → `reports/pose_<stem>/`: `<analyzer>_per_frame.csv`,
`<analyzer>_session_summary.json`, `ews_summary.json`, `<stem>_pose_overlay.mp4`.
