"""Combine per-analyzer early-warning contributions into one score.

Today only the behavioral (pose) sub-score exists; as physiological analyzers
land (HR/RR/HRV, SpO2, IR temperature) they each contribute an `ews_subscore`
and `ews_reasons`, and this fuser aggregates them — no changes needed here.
"""

from __future__ import annotations

from typing import Iterable

from ..core.analyzer import AnalyzerResult

# severity bands for the aggregate score
BANDS = [(0, "stable"), (2, "watch"), (4, "concern"), (6, "critical")]


def _band(total: int) -> str:
    label = "stable"
    for threshold, name in BANDS:
        if total >= threshold:
            label = name
    return label


def fuse_ews(results: Iterable[AnalyzerResult]) -> dict:
    """Aggregate analyzer sub-scores into a combined EWS with a breakdown."""
    results = list(results)
    breakdown = {r.name: r.ews_subscore for r in results}
    reasons = [f"[{r.name}] {why}" for r in results for why in r.ews_reasons]
    total = sum(r.ews_subscore for r in results)
    return {
        "total_ews": total,
        "severity": _band(total),
        "by_analyzer": breakdown,
        "reasons": reasons,
        "note": "Behavioral-only until physiological analyzers (HR/RR/SpO2/IR) are added.",
    }
