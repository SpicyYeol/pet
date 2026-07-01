#!/usr/bin/env python3
"""Self-supervised rPPG POC — label-free losses (band-limit + sparsity + multi-view
consistency) on the 4-view dataset_multi traces. Proves the losses + pipeline; it is a
concept demo on ~40 s / 1 session, NOT a generalizable model.

    python tools/selfsup_rppg_poc.py
"""
from __future__ import annotations
import sys
from pathlib import Path
import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))
CACHE = _ROOT / "reports/rppg_multiview_rgb/cache"
VIEWS = ["front", "left", "right", "up"]
REGIONS = ["face_full", "upper_face", "mid_face", "lower_face"]
WIN_SEC = 10.0
LO, HI = 0.7, 4.0   # HR band (Hz) = 42-240 bpm


def load_windows():
    data = {}
    fs = None
    for v in VIEWS:
        d = np.load(CACHE / f"{v}_candidate_traces.npz", allow_pickle=True)
        fs = float(d["effective_fps"][0])
        data[v] = {r: (np.asarray(d[f"rgb__{r}"], float), np.asarray(d[f"valid__{r}"], bool))
                   for r in REGIONS if f"rgb__{r}" in d}
    W = int(WIN_SEC * fs)
    T = min(len(next(iter(data[v].values()))[0]) for v in VIEWS)
    groups = []   # each: list of (V) windows [3, W] present in >=3 views, same region+time
    for r in REGIONS:
        for s in range(0, T - W, int(2 * fs)):
            grp = []
            for v in VIEWS:
                if r not in data[v]:
                    continue
                rgb, valid = data[v][r]
                if valid[s:s + W].mean() < 0.6:
                    continue
                x = rgb[s:s + W].copy()
                x = np.nan_to_num(x, nan=np.nanmean(x) if np.isfinite(np.nanmean(x)) else 0.0)
                x = (x - x.mean(0)) / (x.std(0) + 1e-6)
                grp.append(x.T.astype(np.float32))   # [3, W]
            if len(grp) >= 3:
                groups.append(grp)
    return groups, fs, W


def main():
    try:
        import torch
        import torch.nn as nn
    except Exception as e:
        print(f"torch unavailable: {e}"); return
    torch.manual_seed(0)
    groups, fs, W = load_windows()
    if not groups:
        print("no multi-view windows"); return
    freqs = np.fft.rfftfreq(W, 1 / fs)
    band = torch.tensor((freqs >= LO) & (freqs <= HI))
    print(f"windows(groups)={len(groups)}  W={W}  fs={fs:.1f}  band bins={int(band.sum())}")

    class TinyRPPG(nn.Module):
        def __init__(s):
            super().__init__()
            s.net = nn.Sequential(
                nn.Conv1d(3, 16, 5, padding=2), nn.BatchNorm1d(16), nn.ReLU(),
                nn.Conv1d(16, 16, 5, padding=4, dilation=2), nn.BatchNorm1d(16), nn.ReLU(),
                nn.Conv1d(16, 16, 5, padding=8, dilation=4), nn.BatchNorm1d(16), nn.ReLU(),
                nn.Conv1d(16, 1, 1))
        def forward(s, x):
            y = s.net(x).squeeze(1)
            return y - y.mean(1, keepdim=True)

    model = TinyRPPG()
    opt = torch.optim.Adam(model.parameters(), lr=3e-3)

    def spectrum(p):
        han = torch.hann_window(p.shape[-1])
        P = torch.abs(torch.fft.rfft((p - p.mean(-1, keepdim=True)) * han)) ** 2
        return P

    def losses(P):
        inb = P[:, band]; tot = P.sum(1) + 1e-8
        l_band = (1 - inb.sum(1) / tot).mean()
        l_sparse = (1 - inb.max(1).values / (inb.sum(1) + 1e-8)).mean()
        return l_band, l_sparse, inb

    for step in range(250):
        g = groups[step % len(groups)]
        x = torch.tensor(np.stack(g))            # [V,3,W]
        p = model(x)                             # [V,W]
        P = spectrum(p)
        l_band, l_sparse, inb = losses(P)
        s = inb / (inb.sum(1, keepdim=True) + 1e-8)     # per-view in-band distribution
        mv = 0.0; V = s.shape[0]
        for i in range(V):
            for j in range(i + 1, V):
                mv = mv + (1 - (s[i] * s[j]).sum())      # 1 - overlap
        l_mv = mv / max(1, V * (V - 1) / 2)
        l_var = ((p.std(1) - 1) ** 2).mean()
        loss = l_band + 0.5 * l_sparse + 1.0 * l_mv + 0.1 * l_var
        opt.zero_grad(); loss.backward(); opt.step()
        if step % 50 == 0 or step == 249:
            print(f"  step {step:3d}  loss {loss.item():.3f}  band {l_band.item():.3f} "
                  f"sparse {l_sparse.item():.3f}  multiview {float(l_mv):.3f}")

    # evaluate cross-view HR agreement (learned vs raw-green baseline)
    fb = freqs[(freqs >= LO) & (freqs <= HI)]
    model.eval()
    spreads_m, spreads_g = [], []
    with torch.no_grad():
        for g in groups:
            x = torch.tensor(np.stack(g))
            P = spectrum(model(x))[:, band].numpy()
            hr_m = fb[P.argmax(1)] * 60
            # raw-green baseline HR per view (channel 1)
            green = np.stack([w[1] for w in g])
            Pg = np.abs(np.fft.rfft((green - green.mean(1, keepdims=True))
                                    * np.hanning(W))) ** 2
            hr_g = fb[Pg[:, (freqs >= LO) & (freqs <= HI)].argmax(1)] * 60
            spreads_m.append(hr_m.max() - hr_m.min()); spreads_g.append(hr_g.max() - hr_g.min())
    print(f"\ncross-view HR spread (lower=more consistent):")
    print(f"  raw green      : {np.mean(spreads_g):5.1f} bpm")
    print(f"  learned (POC)  : {np.mean(spreads_m):5.1f} bpm")
    print("  (POC on 40s/1 session - demonstrates the losses; not a generalizable model)")


if __name__ == "__main__":
    main()
