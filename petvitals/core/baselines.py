"""Species / breed / individual baseline ranges for vital-sign EWS scoring.

Fixed "canine" thresholds are clinically unsafe: HR/RR/temperature normals differ
by species, breed class (brachycephalic, toy, giant, sighthound...), age, and the
individual. This module resolves the *effective* normal/severe ranges for a clip
from, in priority order:

  1. an explicit per-patient profile  reports/patient_profiles/<stem>.json
     (may include resting baselines + breed_class/species/age_group)
  2. the breed-class table, 3. the species table, 4. a generic dog default.

Analyzers (rppg, spo2, temperature) call `resolve_ranges(stem)` instead of
hard-coding numbers, so adding a patient profile immediately re-tunes the alarms.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from .breeds import classify_breed

_REPO_ROOT = Path(__file__).resolve().parents[2]
_PROFILE_DIR = _REPO_ROOT / "reports/patient_profiles"

# (hr_normal, rr_normal, temp_normal_C). severe bounds are derived by widening.
_SPECIES = {
    "dog": {"hr": (60, 160), "rr": (10, 40), "temp": (38.0, 39.2)},
    "cat": {"hr": (120, 220), "rr": (20, 40), "temp": (38.1, 39.2)},
}
# breed-class overrides (dog) — clinically-motivated defaults, configurable.
_BREED_CLASS = {
    "brachycephalic": {"rr": (10, 50)},            # higher resting resp effort/panting
    "toy":            {"hr": (80, 180)},
    "puppy":          {"hr": (70, 220), "rr": (15, 40)},
    "giant":          {"hr": (50, 130)},
    "large":          {"hr": (55, 140)},
    "sighthound":     {"hr": (50, 120)},
    "chondrodystrophic": {"hr": (70, 170)},   # dachshund/corgi/basset (small-bodied)
    "default":        {},
}
SPO2_NORMAL_MIN = 95.0
SPO2_MILD_MIN = 90.0

# typical adult body mass (kg) per class -> allometric resting-HR prior.
# HR scales with mass: HR ~ 241 * M^-0.25 (Stahl mammalian allometry), which
# reproduces "small dogs faster, giants slower". Used as a soft selection prior.
_CLASS_MASS_KG = {
    "toy": 3.0, "brachycephalic": 12.0, "chondrodystrophic": 9.0, "default": 18.0,
    "large": 30.0, "sighthound": 26.0, "giant": 55.0,
}
_CAT_MASS_KG = 4.0


def allometric_hr_center(mass_kg: float) -> float:
    """Physiological resting-HR center from body mass (241 * M^-0.25)."""
    return 241.0 * (max(mass_kg, 0.5) ** -0.25)


def _widen(lo: float, hi: float, frac: float = 0.18):
    span = hi - lo
    return (round(lo - span * frac, 1), round(hi + span * frac, 1))


def load_profile(stem: str) -> Optional[dict]:
    p = _PROFILE_DIR / f"{stem}.json"
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def resolve_ranges(stem: str) -> dict:
    """Return effective vital ranges + a human-readable source string."""
    profile = load_profile(stem) or {}
    species = (profile.get("species") or "dog").lower()
    base = dict(_SPECIES.get(species, _SPECIES["dog"]))
    source = f"species:{species}"

    breed_class = (profile.get("breed_class") or "").lower()
    if not breed_class and profile.get("breed"):
        breed_class = classify_breed(profile["breed"])   # free-text breed -> class
    if species == "dog" and breed_class in _BREED_CLASS and breed_class != "default":
        base.update(_BREED_CLASS[breed_class])
        source = f"breed:{breed_class}"

    # optional: tighten around a known resting baseline (± tolerance)
    bl = profile.get("baseline") or {}
    note = []
    if "hr_resting" in bl:
        hr = float(bl["hr_resting"])
        base["hr"] = (round(hr * 0.7), round(hr * 1.4))
        note.append(f"HR around resting {hr:.0f}")
        source = "patient_baseline"
    if "rr_resting" in bl:
        rr = float(bl["rr_resting"])
        base["rr"] = (round(rr * 0.6), round(rr * 1.8))
        note.append(f"RR around resting {rr:.0f}")
        source = "patient_baseline"

    # allometric HR prior center (+ fever tachycardia adjustment, ~10 bpm/°C)
    mass = profile.get("weight_kg")
    if mass is None:
        mass = _CAT_MASS_KG if species == "cat" else _CLASS_MASS_KG.get(breed_class, 18.0)
    hr_center = allometric_hr_center(float(mass))
    if "hr_resting" in bl:
        hr_center = float(bl["hr_resting"])
    temp_meas = (profile.get("temp_c")
                 or (load_profile(stem) or {}).get("temp_c"))
    if temp_meas is not None:
        hr_center += max(0.0, float(temp_meas) - base["temp"][1]) * 10.0  # fever tachycardia

    return {
        "hr_normal": tuple(base["hr"]),
        "hr_severe": _widen(*base["hr"]),
        "rr_normal": tuple(base["rr"]),
        "rr_severe": _widen(*base["rr"]),
        "temp_normal": tuple(base["temp"]),
        "temp_severe_high": round(base["temp"][1] + 0.8, 1),
        "temp_severe_low": round(base["temp"][0] - 1.0, 1),
        "spo2_normal_min": SPO2_NORMAL_MIN,
        "spo2_mild_min": SPO2_MILD_MIN,
        "hr_prior_center": round(hr_center, 1),   # allometric/physiological expected HR
        "source": source,
        "species": species,
        "breed_class": breed_class or "default",
        "note": "; ".join(note) if note else "",
    }
