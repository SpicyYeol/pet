#!/usr/bin/env python3
"""
AdaptiveROISelector

This is the core module for the final adaptive ROI strategy.

Philosophy:
- Never force global "multi-patch for everything".
- For each anatomical zone, look at both single-center and multi-patch candidates.
- Use a data-driven zone_quality score that balances:
    * Signal strength (SNR)
    * Pixel stability (more pixels = less noise vulnerable)
    * Cleanliness after preprocessing (post_clean_gr_var)
    * Artifact avoidance (distance of peak from 100 bpm)
- Prefer multi-patch only when it is *meaningfully* better.
- Otherwise keep the tighter single patch to preserve weak cardiac signal.

This directly solves:
- Video 6 (low HR): single patches on muzzle/nose are often superior.
- Video 3/7 (high HR): certain multi-patch zones (e.g. ear) can be dramatically better.

The selector can be used in two modes:
1. Hard decision mode: return only the best variant per zone (simpler pipeline).
2. Rich candidate mode: keep both (or top-2) when quality is close → let downstream smart selection decide.

Usage example (on dual-candidate DataFrame):
    selector = AdaptiveROISelector()
    chosen = selector.select(df)          # returns dict of chosen specs
    or
    df_with_decision = selector.tag_decisions(df)
"""

from __future__ import annotations

import pandas as pd
import numpy as np
from typing import Dict, List, Any


class AdaptiveROISelector:
    def __init__(
        self,
        multi_bonus_threshold: float = 1.15,
        min_pixel_for_consideration: int = 400,
        artifact_dist_threshold: int = 30,
    ):
        """
        multi_bonus_threshold:
            Multi-patch must beat single by at least this factor in zone_quality
            to be chosen. >1.0 makes us conservative about merging.
        """
        self.multi_bonus_threshold = multi_bonus_threshold
        self.min_pixel_for_consideration = min_pixel_for_consideration
        self.artifact_dist_threshold = artifact_dist_threshold

    def _zone_quality(self, row: pd.Series) -> float:
        """Core quality function for one candidate (single or multi)."""
        snr = float(row.get("best_snr", 0))
        pixel = float(row.get("pixel_mean", 500))
        post_var = float(row.get("post_clean_gr_var", 999))
        dist_100 = float(row.get("peak_dist_from_100", 0))

        if pixel < self.min_pixel_for_consideration:
            return 0.0

        pix_factor = pixel / (pixel + 600)
        clean_factor = 1.0 / (1.0 + post_var / 250)
        artifact_factor = 1.0 if dist_100 >= self.artifact_dist_threshold else 0.55

        quality = snr * pix_factor * clean_factor * artifact_factor
        return float(quality)

    def select(
        self, candidates_df: pd.DataFrame, high_hr_prior: bool = False
    ) -> Dict[str, Dict[str, Any]]:
        """
        Given a DataFrame containing both 'single' and 'multi' variants for various zones,
        return a dict: {base_name: chosen_candidate_row_dict}
        """
        results = {}
        for base_name in candidates_df["base_name"].unique():
            zone_df = candidates_df[candidates_df["base_name"] == base_name].copy()
            if len(zone_df) == 0:
                continue

            zone_df["zone_quality"] = zone_df.apply(self._zone_quality, axis=1)

            # Optional high-HR prior (used for videos 3/7)
            if high_hr_prior:
                zone_df.loc[zone_df["best_bpm"] > 160, "zone_quality"] *= 1.12

            single = zone_df[zone_df["roi_family"] == "single"]
            multi = zone_df[zone_df["roi_family"] == "multi"]

            if len(single) == 0:
                chosen = multi.iloc[0].to_dict() if len(multi) > 0 else None
            elif len(multi) == 0:
                chosen = single.iloc[0].to_dict()
            else:
                q_single = single.iloc[0]["zone_quality"]
                q_multi = multi.iloc[0]["zone_quality"]

                if q_multi > q_single * self.multi_bonus_threshold:
                    chosen = multi.iloc[0].to_dict()
                    chosen["zone_quality"] = q_multi
                else:
                    chosen = single.iloc[0].to_dict()
                    chosen["zone_quality"] = q_single

            if chosen:
                results[base_name] = chosen

        return results

    def tag_decisions(self, candidates_df: pd.DataFrame, high_hr_prior: bool = False) -> pd.DataFrame:
        """Add columns: chosen_for_zone (bool), decision_reason (str)"""
        df = candidates_df.copy()
        df["zone_quality"] = df.apply(self._zone_quality, axis=1)

        if high_hr_prior:
            df.loc[df["best_bpm"] > 160, "zone_quality"] *= 1.12

        for base in df["base_name"].unique():
            zone = df[df["base_name"] == base].copy()
            single = zone[zone["roi_family"] == "single"]
            multi = zone[zone["roi_family"] == "multi"]

            if len(single) == 0 or len(multi) == 0:
                continue

            q_s = single.iloc[0]["zone_quality"]
            q_m = multi.iloc[0]["zone_quality"]

            if q_m > q_s * self.multi_bonus_threshold:
                chosen_family = "multi"
                reason = f"multi wins (q_m={q_m:.2f} > {self.multi_bonus_threshold:.2f} * q_s={q_s:.2f})"
            else:
                chosen_family = "single"
                reason = f"single preferred (q_m={q_m:.2f} <= {self.multi_bonus_threshold:.2f} * q_s={q_s:.2f})"

            df.loc[zone.index, "chosen_for_zone"] = (df.loc[zone.index, "roi_family"] == chosen_family)
            df.loc[zone.index, "decision_reason"] = reason

        return df

    @classmethod
    def from_dual_candidates(cls, dual_df: pd.DataFrame, high_hr_prior: bool = False, **kwargs) -> 'AdaptiveROISelector':
        """Convenience: create selector and immediately get decisions + chosen specs from dual candidate output."""
        selector = cls(**kwargs)
        tagged = selector.tag_decisions(dual_df, high_hr_prior=high_hr_prior)
        return selector, tagged


if __name__ == "__main__":
    # Quick self-test on the dual candidate data
    csv_path = "reports/rppg_pet_keypoints/dual_roi_candidates/dual_roi_candidates_results.csv"
    df = pd.read_csv(csv_path)

    selector = AdaptiveROISelector()

    print("=== Final Adaptive Per-Zone Choices ===\n")
    for video in [6, 3, 7]:
        sub = df[df["video"] == video]
        high_hr = video in (3, 7)
        decisions = selector.select(sub, high_hr_prior=high_hr)

        print(f"Video {video} (high_hr_prior={high_hr}):")
        for base, chosen in sorted(decisions.items()):
            fam = chosen.get("roi_family")
            bpm = chosen.get("best_bpm")
            snr = chosen.get("best_snr")
            q = chosen.get("zone_quality", 0)
            print(f"  {base:15s} → {fam.upper():6s} (bpm={bpm:6.1f}, snr={snr:5.2f}, q={q:6.2f})")
        print()
