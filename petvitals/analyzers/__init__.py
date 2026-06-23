"""Analyzers. Import each module here so its @register runs on package load.

To add a new analyzer: create `mything.py` with a @register'd Analyzer subclass,
then add one import line below.
"""

from . import pose  # noqa: F401
from . import rppg  # noqa: F401
from . import hrv  # noqa: F401
from . import feeding  # noqa: F401
from . import spo2  # noqa: F401
from . import temperature  # noqa: F401
from . import respeffort  # noqa: F401
from . import mucous  # noqa: F401

__all__ = ["pose", "rppg", "hrv", "feeding", "spo2", "temperature",
           "respeffort", "mucous"]
