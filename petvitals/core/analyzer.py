"""The analyzer plugin interface + registry.

An Analyzer consumes a Session and returns an AnalyzerResult (per-frame table +
JSON summary + an optional 0-3 early-warning contribution). New capabilities are
added by subclassing Analyzer and applying @register — nothing else in the
codebase needs to change.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # avoid hard import cycle / pandas optional at import time
    import pandas as pd
    from .session import Session


@dataclass
class AnalyzerResult:
    """Uniform output of every analyzer."""
    name: str
    per_frame: "pd.DataFrame"
    summary: dict
    ews_subscore: int = 0           # 0-3 contribution to the behavioral EWS
    ews_reasons: list[str] = field(default_factory=list)


class Analyzer(ABC):
    """Base class for all analyzers.

    Subclasses set a unique `name`, an optional `description`, and implement
    `analyze(session) -> AnalyzerResult`.
    """
    name: str = "base"
    description: str = ""

    @abstractmethod
    def analyze(self, session: "Session") -> AnalyzerResult:  # pragma: no cover
        ...


# ── registry ──────────────────────────────────────────────────────
_REGISTRY: dict[str, type[Analyzer]] = {}


def register(cls: type[Analyzer]) -> type[Analyzer]:
    """Class decorator: make an analyzer discoverable by name."""
    if not getattr(cls, "name", None) or cls.name == "base":
        raise ValueError(f"{cls.__name__} must define a unique `name`")
    if cls.name in _REGISTRY:
        raise ValueError(f"Duplicate analyzer name: {cls.name}")
    _REGISTRY[cls.name] = cls
    return cls


def get_analyzer(name: str) -> Analyzer:
    if name not in _REGISTRY:
        raise KeyError(f"Unknown analyzer '{name}'. Available: {available()}")
    return _REGISTRY[name]()


def available() -> list[str]:
    return sorted(_REGISTRY)


def describe() -> dict[str, str]:
    return {n: _REGISTRY[n].description for n in available()}
