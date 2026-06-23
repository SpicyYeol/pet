# Anatomical + Rejection vs Face-box Baseline (7 Videos)

Generated automatically by `tools/compare_anatomical_results.py`

| Video | Target | Face-box Best | Face-box MAE | Raw Best | Raw Abs Err | Aggressive Best | Aggressive Abs Err | Kept % | Mean Motion | High Artifact % | Windows |
|-------|--------|---------------|--------------|----------|-------------|-----------------|-------------------|--------|-------------|-----------------|---------|
| 1.mp4 | 175.0 | 99.0 | 76.0 | 168.2 (nose_bridge) | 6.8 | 168.2 (nose_bridge) | 6.8 | 43.3% | 4.38 | 6.7% | 60 | analyzed |
| 3.mp4 | 210.0 | 102.0 | 108.0 | 169.3 (right_ear_base) | 40.7 | nan (nan) | - | 0.0% | 16.71 | 3.3% | 60 | analyzed |
| 4.mp4 | 115.5 | 102.0 | 13.5 | 129.5 (right_ear_base) | 14.0 | 129.5 (right_ear_base) | 14.0 | 52.5% | 4.72 | 10.5% | 162 | analyzed |
| 5.mp4 | 135.0 | 100.0 | 35.0 | 86.7 (throat_exposed) | 48.3 | nan (nan) | - | 0.0% | 4.95 | 10.0% | 60 | analyzed |
| 6.mp4 | 90.0 | 100.0 | 10.0 | 95.5 (muzzle_skin) | 5.5 | 87.3 (nose_bridge) | 2.7 | 38.3% | 4.3 | 28.3% | 60 | analyzed |
| 7.mp4 | 189.5 | 108.0 | 81.5 | 127.1 (nose_bridge) | 62.4 | nan (nan) | - | 0.0% | 13.65 | 16.7% | 60 | analyzed |
| 8.mp4 | 110.5 | 100.0 | 10.5 | 149.4 (right_ear_base) | 38.9 | 148.2 (left_ear_base) | 37.7 | 25.0% | 4.62 | 19.4% | 36 | analyzed |

## Per-ROI Performance (Videos with Anatomical Analysis)

### 1.mp4 (Target: 175.0)
| Rank | ROI | Best BPM | Best SNR | Best Method |
|------|-----|----------|----------|-------------|
| 1 | nose_bridge | 168.2 | 14.29 | ica |
| 2 | throat_exposed | 96.1 | 14.06 | pca |
| 3 | right_ear_base | 130.1 | 12.26 | ica |

### 3.mp4 (Target: 210.0)
| Rank | ROI | Best BPM | Best SNR | Best Method |
|------|-----|----------|----------|-------------|
| 1 | right_ear_base | 169.3 | 23.39 | green |
| 2 | left_ear_base | 211.5 | 23.3 | green |
| 3 | muzzle_skin | 148.2 | 19.34 | ica |

### 4.mp4 (Target: 115.5)
| Rank | ROI | Best BPM | Best SNR | Best Method |
|------|-----|----------|----------|-------------|
| 1 | right_ear_base | 129.5 | 16.91 | pca |
| 2 | left_ear_base | 130.1 | 13.26 | green |
| 3 | nose_bridge | 99.6 | 12.24 | green |

### 5.mp4 (Target: 135.0)
| Rank | ROI | Best BPM | Best SNR | Best Method |
|------|-----|----------|----------|-------------|
| 1 | throat_exposed | 86.7 | 23.79 | green |
| 2 | nose_bridge | 90.2 | 16.39 | ica |
| 3 | left_ear_base | 130.7 | 11.78 | g_minus_r |

### 6.mp4 (Target: 90.0)
| Rank | ROI | Best BPM | Best SNR | Best Method |
|------|-----|----------|----------|-------------|
| 1 | muzzle_skin | 95.5 | 25.07 | pos |
| 2 | throat_exposed | 101.4 | 11.27 | pca |
| 3 | nose_bridge | 87.3 | 10.73 | pca |

### 7.mp4 (Target: 189.5)
| Rank | ROI | Best BPM | Best SNR | Best Method |
|------|-----|----------|----------|-------------|
| 1 | nose_bridge | 127.1 | 57.66 | green |
| 2 | muzzle_skin | 155.3 | 42.09 | green |
| 3 | right_ear_base | 145.3 | 33.92 | pos |

### 8.mp4 (Target: 110.5)
| Rank | ROI | Best BPM | Best SNR | Best Method |
|------|-----|----------|----------|-------------|
| 1 | right_ear_base | 149.4 | 16.69 | pos |
| 2 | nose_bridge | 104.9 | 11.42 | pos |
| 3 | left_ear_base | 96.1 | 8.66 | pca |
