# Anatomical BVP Visualization Report

BVP (Blood Volume Pulse) signals re-extracted from the latest Anatomical + Rejection analysis runs.
These are the actual pulse waveforms that produced the BPM numbers in the 7-video comparison table.

## Per-Video Best BVP

### 1.mp4 — left_ear_base (ica)  |  140.0 bpm, SNR 12.6
![waveform](1_waveform.png)
![spectrum](1_spectrum.png)
Rejection score: 0.15

### 3.mp4 — nose_bridge (ica)  |  87.9 bpm, SNR 19.29
![waveform](3_waveform.png)
![spectrum](3_spectrum.png)
Rejection score: 0.5

### 4.mp4 — right_ear_base (pca)  |  129.5 bpm, SNR 16.91
![waveform](4_waveform.png)
![spectrum](4_spectrum.png)
Rejection score: 0.15

### 5.mp4 — right_ear_base (ica)  |  157.6 bpm, SNR 18.65
![waveform](5_waveform.png)
![spectrum](5_spectrum.png)
Rejection score: 0.5

### 6.mp4 — nose_bridge (pos)  |  92.6 bpm, SNR 15.8
![waveform](6_waveform.png)
![spectrum](6_spectrum.png)
Rejection score: 0.7

### 7.mp4 — nose_bridge (green)  |  95.5 bpm, SNR 19.76
![waveform](7_waveform.png)
![spectrum](7_spectrum.png)
Rejection score: 0.85

### 8.mp4 — right_ear_base (pos)  |  149.4 bpm, SNR 16.69
![waveform](8_waveform.png)
![spectrum](8_spectrum.png)
Rejection score: 0.35

## Raw Data
- `raw_bvp_traces.npz` + `raw_bvp_traces_meta.json` saved in this folder.
- Total traces: 7