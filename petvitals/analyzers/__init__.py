"""Analyzers. Import each module here so its @register runs on package load.

To add a new analyzer: create `mything.py` with a @register'd Analyzer subclass,
then add one import line below.
"""

from . import pose  # noqa: F401

__all__ = ["pose"]
