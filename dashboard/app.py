"""petvitals Streamlit dashboard.

A clean, low-maintenance UI that calls the petvitals analyzers directly (no Node
build, no generated TS bridge) and shows the fused early-warning score per clip.

    pip install -r requirements.txt
    streamlit run dashboard/app.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import streamlit as st

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

import petvitals  # noqa: E402,F401  (registers analyzers)
from petvitals.core.analyzer import available, get_analyzer  # noqa: E402
from petvitals.core.keypoints import resolve_keypoints_path  # noqa: E402
from petvitals.core.session import Session  # noqa: E402
from petvitals.ews import fuse_ews  # noqa: E402

STEMS = ["1", "3", "4", "5", "6", "7", "8"]
SEV_COLOR = {"stable": "#22c55e", "watch": "#f59e0b", "concern": "#fb923c", "critical": "#ef4444"}


@st.cache_data(show_spinner=False)
def analyze_stem(stem: str) -> dict:
    session = Session.from_stem(stem)
    results = [get_analyzer(n).analyze(session) for n in available()]
    ews = fuse_ews(results)
    summaries = {r.name: r.summary for r in results}
    pose_pf = next((r.per_frame for r in results if r.name == "pose"), pd.DataFrame())
    return {
        "stem": stem,
        "duration": session.duration_sec,
        "ews": ews,
        "summaries": summaries,
        "subscores": {r.name: r.ews_subscore for r in results},
        "pose_per_frame": pose_pf,
    }


@st.cache_data(show_spinner=True)
def overview() -> pd.DataFrame:
    rows = []
    for s in STEMS:
        if resolve_keypoints_path(s) is None:
            continue
        d = analyze_stem(s)
        sm = d["summaries"]
        pose = sm.get("pose", {})
        rppg = sm.get("rppg", {})
        frac = pose.get("posture_time_fraction", {})
        rows.append({
            "stem": s,
            "EWS": d["ews"]["total_ews"],
            "severity": d["ews"]["severity"],
            "HR": rppg.get("hr_bpm"),
            "RR": rppg.get("rr_bpm"),
            "SpO2": sm.get("spo2", {}).get("spo2_pct"),
            "Temp": sm.get("temperature", {}).get("temp_c"),
            "posture": max(frac, key=frac.get) if frac else "n/a",
            "breed": rppg.get("breed_class", "—"),
        })
    return pd.DataFrame(rows).sort_values("EWS", ascending=False)


def severity_banner(ews: dict):
    sev = ews["severity"]
    color = SEV_COLOR.get(sev, "#888")
    st.markdown(
        f"<div style='padding:14px 18px;border-radius:12px;background:{color}22;"
        f"border:1px solid {color};margin-bottom:8px'>"
        f"<span style='font-size:30px;font-weight:800;color:{color}'>EWS {ews['total_ews']}</span>"
        f"<span style='font-size:16px;color:{color};margin-left:10px'>{sev.upper()}</span></div>",
        unsafe_allow_html=True)


# ── page ───────────────────────────────────────────────────────────
st.set_page_config(page_title="petvitals · EWS", layout="wide", page_icon="🐾")
st.title("🐾 petvitals — Contactless Vitals & Behavior EWS")
st.caption("Behavior (pose) + vitals (HR/RR/HRV/SpO₂/temp/respiration/mucous) fused per patient. "
           "Research prototype — not a medical device; thresholds are configurable defaults.")

tab_overview, tab_detail = st.tabs(["Overview", "Patient detail"])

with tab_overview:
    df = overview()
    st.dataframe(
        df.style.apply(
            lambda r: [f"background-color: {SEV_COLOR.get(r['severity'], '#888')}33"] * len(r),
            axis=1),
        use_container_width=True, hide_index=True)
    st.bar_chart(df.set_index("stem")["EWS"], color="#ef4444")

with tab_detail:
    stems = [s for s in STEMS if resolve_keypoints_path(s)]
    stem = st.selectbox("Patient / clip", stems, format_func=lambda s: f"#{s}")
    d = analyze_stem(stem)
    sm, sub = d["summaries"], d["subscores"]
    rppg = sm.get("rppg", {})

    severity_banner(d["ews"])
    bc = rppg.get("breed_class", "—")
    st.caption(f"{d['duration']}s window · breed: {bc} · baseline: {rppg.get('baseline_source', '—')}")

    c = st.columns(6)
    c[0].metric("Heart rate", f"{rppg.get('hr_bpm', '—')} bpm")
    c[1].metric("Respiration", f"{rppg.get('rr_bpm', '—')} brpm")
    c[2].metric("SpO₂", f"{sm.get('spo2', {}).get('spo2_pct', '—')} %")
    c[3].metric("Temp", f"{sm.get('temperature', {}).get('temp_c', '—')} °C")
    hrv = sm.get("hrv", {})
    c[4].metric("HRV SDNN", f"{hrv.get('sdnn_ms', '—')} ms" if hrv.get("hrv_available") else "—")
    c[5].metric("Mucous", sm.get("mucous", {}).get("mm_color", "—")
                if sm.get("mucous", {}).get("usable_read") else "—")

    left, right = st.columns([1, 1])
    with left:
        st.subheader("Per-analyzer contribution")
        sub_df = pd.DataFrame({"analyzer": list(sub), "sub-score": list(sub.values())})
        st.bar_chart(sub_df.set_index("analyzer"), color="#f59e0b", horizontal=True)
        reasons = d["ews"]["reasons"]
        if reasons:
            st.subheader("Reasons")
            for r in reasons:
                st.markdown(f"- {r}")
        flags = sorted({k for s in sm.values() for k, v in s.get("flags", {}).items() if v})
        if flags:
            st.caption("flags: " + " · ".join(flags))
    with right:
        st.subheader("Posture mix")
        frac = sm.get("pose", {}).get("posture_time_fraction", {})
        if frac:
            st.bar_chart(pd.Series(frac, name="fraction"), color="#22c55e", horizontal=True)
        pf = d["pose_per_frame"]
        if not pf.empty and "motion_energy" in pf:
            st.subheader("Activity over time")
            me = pd.to_numeric(pf["motion_energy"], errors="coerce")
            st.line_chart(pd.DataFrame({"motion": me.values}, index=pf["time_sec"]))

    with st.expander("Raw analyzer summaries (JSON)"):
        st.json(sm)
