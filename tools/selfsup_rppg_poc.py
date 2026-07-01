#!/usr/bin/env python3
"""Self-supervised rPPG POC with PHYSIOLOGY priors as losses (fusing the two approaches).

Label-free losses: band-limit + sparsity + anti-collapse + multi-view consistency,
PLUS physiological priors a true cardiac pulse has and an artifact lacks:
  - harmonic: reward a 2nd harmonic (periodic non-sinusoidal pulse)
  - RSA: reward respiratory-band modulation of the pulse amplitude envelope
         (cardio-respiratory coupling)
Runs on the 4-view dataset_multi traces; compares baseline vs +physio.

    python tools/selfsup_rppg_poc.py
Concept demo on ~40 s / 1 session (no HR labels) — proves the losses, not a model.
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
WIN_SEC, LO, HI = 10.0, 0.7, 4.0
RESP_LO, RESP_HI = 0.15, 1.0   # respiratory band (Hz) for the RSA envelope loss


def load_windows():
    data = {}; fs = None
    for v in VIEWS:
        d = np.load(CACHE / f"{v}_candidate_traces.npz", allow_pickle=True)
        fs = float(d["effective_fps"][0])
        data[v] = {r: (np.asarray(d[f"rgb__{r}"], float), np.asarray(d[f"valid__{r}"], bool))
                   for r in REGIONS if f"rgb__{r}" in d}
    W = int(WIN_SEC * fs)
    T = min(len(next(iter(data[v].values()))[0]) for v in VIEWS)
    groups = []
    for r in REGIONS:
        for s in range(0, T - W, int(2 * fs)):
            grp = []
            for v in VIEWS:
                if r not in data[v]:
                    continue
                rgb, valid = data[v][r]
                if valid[s:s + W].mean() < 0.6:
                    continue
                x = np.nan_to_num(rgb[s:s + W].copy())
                x = (x - x.mean(0)) / (x.std(0) + 1e-6)
                grp.append(x.T.astype(np.float32))
            if len(grp) >= 3:
                groups.append(grp)
    return groups, fs, W


def train(use_physio):
    import torch
    import torch.nn as nn
    torch.manual_seed(0)
    groups, fs, W = load_windows()
    freqs = torch.tensor(np.fft.rfftfreq(W, 1 / fs), dtype=torch.float32)
    band = (freqs >= LO) & (freqs <= HI)
    rband = (freqs >= RESP_LO) & (freqs <= RESP_HI)
    fb = freqs[band]

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

    model = TinyRPPG(); opt = torch.optim.Adam(model.parameters(), lr=3e-3)
    han = torch.hann_window(W)

    def spec(p):
        return torch.abs(torch.fft.rfft((p - p.mean(-1, keepdim=True)) * han)) ** 2

    def hilbert_env(p):                      # analytic-signal magnitude (differentiable)
        N = p.shape[-1]; Pf = torch.fft.fft(p)
        H = torch.zeros(N); H[0] = 1
        if N % 2 == 0:
            H[N // 2] = 1; H[1:N // 2] = 2
        else:
            H[1:(N + 1) // 2] = 2
        return torch.fft.ifft(Pf * H).abs()

    def physio_losses(p, P):
        # soft fundamental f0 within HR band
        Pb = P[:, band]; w = torch.softmax(Pb * 20 / (Pb.max(1, keepdim=True).values + 1e-8), 1)
        f0 = (w * fb).sum(1)                                   # [V]
        # harmonic: gaussian-weighted power at 2*f0 (full spectrum)
        df = float(freqs[1] - freqs[0])
        gm = torch.exp(-((freqs[None, :] - 2 * f0[:, None]) ** 2) / (2 * (2 * df) ** 2))
        harm = (P * gm).sum(1) / (P.sum(1) + 1e-8)
        l_harm = (1 - harm).mean()
        # RSA: respiratory-band modulation of the amplitude envelope
        env = hilbert_env(p); env = env - env.mean(1, keepdim=True)
        Pe = torch.abs(torch.fft.rfft(env * han)) ** 2
        rsa = Pe[:, rband].sum(1) / (Pe.sum(1) + 1e-8)
        l_rsa = (1 - rsa).mean()
        return l_harm, l_rsa, harm.mean().item(), rsa.mean().item()

    for step in range(250):
        g = groups[step % len(groups)]
        p = model(torch.tensor(np.stack(g))); P = spec(p)
        inb = P[:, band]; tot = P.sum(1) + 1e-8
        l_band = (1 - inb.sum(1) / tot).mean()
        l_sparse = (1 - inb.max(1).values / (inb.sum(1) + 1e-8)).mean()
        s = inb / (inb.sum(1, keepdim=True) + 1e-8); V = s.shape[0]; mv = 0.0
        for i in range(V):
            for j in range(i + 1, V):
                mv = mv + (1 - (s[i] * s[j]).sum())
        l_mv = mv / max(1, V * (V - 1) / 2)
        l_var = ((p.std(1) - 1) ** 2).mean()
        loss = l_band + 0.5 * l_sparse + 1.0 * l_mv + 0.1 * l_var
        if use_physio:
            l_harm, l_rsa, _, _ = physio_losses(p, P)
            loss = loss + 0.5 * l_harm + 0.5 * l_rsa
        opt.zero_grad(); loss.backward(); opt.step()

    # metrics
    model.eval(); spreads, harms, rsas = [], [], []
    with torch.no_grad():
        for g in groups:
            p = model(torch.tensor(np.stack(g))); P = spec(p)
            hr = fb[P[:, band].argmax(1)].numpy() * 60
            spreads.append(hr.max() - hr.min())
            _, _, h, r = physio_losses(p, P); harms.append(h); rsas.append(r)
    return dict(spread=float(np.mean(spreads)), harmonic=float(np.mean(harms)),
                rsa=float(np.mean(rsas)))


def main():
    try:
        import torch  # noqa: F401
    except Exception as e:
        print(f"torch unavailable: {e}"); return
    base = train(use_physio=False)
    phys = train(use_physio=True)
    print("metric              baseline   +physio(RSA+harmonic)")
    print(f"  cross-view spread {base['spread']:7.1f}    {phys['spread']:7.1f}  bpm (lower=better)")
    print(f"  harmonic presence {base['harmonic']:7.3f}    {phys['harmonic']:7.3f}  (higher=real pulse)")
    print(f"  RSA env coupling  {base['rsa']:7.3f}    {phys['rsa']:7.3f}  (higher=cardio-resp)")
    print("\n  (POC 40s/1 session, no HR labels - proves the fused losses train, not a model)")


if __name__ == "__main__":
    main()
