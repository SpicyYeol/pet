"""petvitals — modular contactless vital-sign & behavior analysis for pets.

The package turns shared inputs (a video + DLC keypoints, bundled in a `Session`)
into clinical signals through pluggable *analyzers*. Adding a new capability
(feeding detection, IR temperature, rPPG HR/RR, ...) is a single file:

    from petvitals.core.analyzer import Analyzer, AnalyzerResult, register

    @register
    class MyAnalyzer(Analyzer):
        name = "my_feature"
        def analyze(self, session) -> AnalyzerResult:
            ...

Drop the file in `petvitals/analyzers/`, import it in `analyzers/__init__.py`,
and it is immediately available to the CLI and the EWS fusion.

See docs/ARCHITECTURE.md for the full design.
"""

from .core.session import Session
from .core.analyzer import Analyzer, AnalyzerResult, register, get_analyzer, available
from . import analyzers  # noqa: F401  — import for side effect: registers analyzers

__all__ = [
    "Session", "Analyzer", "AnalyzerResult",
    "register", "get_analyzer", "available",
]

__version__ = "0.1.0"
