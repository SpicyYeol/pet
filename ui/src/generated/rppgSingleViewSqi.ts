export const RPPG_SINGLE_VIEW_SQI = {
  "generatedAt": "2026-05-25T08:51:58",
  "setup": {
    "labelsCsv": "dataset_front/video_labels_ocr.csv",
    "outDir": "reports/rppg_single_view_sqi",
    "sampleFps": 15.0,
    "windowSec": 20.0,
    "stepSec": 5.0,
    "minBpm": 80.0,
    "maxBpm": 240.0,
    "grid": "5x5",
    "methods": [
      "green",
      "g_minus_r",
      "chrom",
      "pos",
      "pca",
      "ica"
    ]
  },
  "assets": {
    "selectorRankingUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/selector_ranking.png",
    "methodRegionRankingUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/method_region_ranking.png",
    "reportUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/single_view_sqi_report.md",
    "candidateWindowPeaksCsvUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/candidate_window_peaks.csv",
    "selectorPredictionsCsvUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/selector_predictions.csv",
    "trainedSelectorModelUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/models/current_label_peak_selector.joblib",
    "trainedSelectorMetadataUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/models/current_label_peak_selector_metadata.json"
  },
  "trainedSelector": {
    "model_path": "reports/rppg_single_view_sqi/models/current_label_peak_selector.joblib",
    "feature_columns": [
      "window_start_sec",
      "peak_rank",
      "peak_bpm",
      "snr",
      "total_power_ratio",
      "spectral_entropy",
      "h2_ratio",
      "half_ratio",
      "valid_fraction",
      "box_motion",
      "color_cv",
      "quality_score",
      "patch_row",
      "patch_col",
      "is_patch",
      "method_green",
      "method_g_minus_r",
      "method_chrom",
      "method_pos",
      "method_pca",
      "method_ica",
      "region_face_full",
      "region_upper_face",
      "region_mid_face",
      "region_lower_face"
    ],
    "positive_definition": "range_error <= 3 bpm OR target_abs_error <= 5 bpm",
    "training_rows": 49416,
    "positive_rows": 4951,
    "positive_rate": 0.10019,
    "videos": [
      "1.mp4",
      "3.mp4",
      "4.mp4",
      "5.mp4",
      "6.mp4",
      "7.mp4",
      "8.mp4"
    ],
    "warning": "Fitted on the same labeled videos shown in the UI; not an unbiased estimate for new videos."
  },
  "videos": [
    {
      "video": "1.mp4",
      "path": "dataset_front/1.mp4",
      "usable": true,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "label_source": "ocr_reviewed",
      "notes": "Monitor HR digits consistently read around 170-180 bpm.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/1.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/1_0.5.jpg",
      "monitorCropUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/1_monitor_crop.jpg",
      "monitorSheetUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/generated/1_monitor_sheet.jpg",
      "regionOverlayUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/region_overlays/1_region_overlay.jpg",
      "trainedMethod": "chrom",
      "trainedRegion": "patch_r01_c03",
      "trainedPredBpm": 175.781,
      "oracleMethod": "green",
      "oracleRegion": "patch_r01_c04",
      "oraclePredBpm": 174.902,
      "stats": {
        "video": "1.mp4",
        "samples": 957,
        "effective_fps": 15.003,
        "detected_pct": 100.0,
        "median_box_conf": 0.919,
        "regions": 29
      }
    },
    {
      "video": "2.mp4",
      "path": "dataset_front/2.mp4",
      "usable": false,
      "bpm_min": "",
      "bpm_max": "",
      "bpm_target": "",
      "label_source": "no_readable_monitor",
      "notes": "No readable vital monitor in sampled frames.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/2.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/2_0.5.jpg",
      "monitorCropUrl": "",
      "monitorSheetUrl": "",
      "regionOverlayUrl": "",
      "trainedMethod": "",
      "trainedRegion": "",
      "trainedPredBpm": "",
      "oracleMethod": "",
      "oracleRegion": "",
      "oraclePredBpm": "",
      "stats": {}
    },
    {
      "video": "3.mp4",
      "path": "dataset_front/3.mp4",
      "usable": true,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "label_source": "ocr_reviewed",
      "notes": "Readable monitor HR samples include high-190s through low-220s.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/3.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/3_0.5.jpg",
      "monitorCropUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/3_monitor_crop.jpg",
      "monitorSheetUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/generated/3_monitor_sheet.jpg",
      "regionOverlayUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/region_overlays/3_region_overlay.jpg",
      "trainedMethod": "pos",
      "trainedRegion": "face_full",
      "trainedPredBpm": 199.072,
      "oracleMethod": "ica",
      "oracleRegion": "mid_face",
      "oraclePredBpm": 207.861,
      "stats": {
        "video": "3.mp4",
        "samples": 1451,
        "effective_fps": 14.996,
        "detected_pct": 100.0,
        "median_box_conf": 0.913,
        "regions": 29
      }
    },
    {
      "video": "4.mp4",
      "path": "dataset_front/4.mp4",
      "usable": true,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "label_source": "ocr_reviewed",
      "notes": "Readable monitor HR samples cluster around 112-121 bpm.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/4.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/4_0.5.jpg",
      "monitorCropUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/4_monitor_crop.jpg",
      "monitorSheetUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/generated/4_monitor_sheet.jpg",
      "regionOverlayUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/region_overlays/4_region_overlay.jpg",
      "trainedMethod": "pca",
      "trainedRegion": "patch_r02_c05",
      "trainedPredBpm": 112.5,
      "oracleMethod": "pos",
      "oracleRegion": "patch_r01_c04",
      "oraclePredBpm": 115.576,
      "stats": {
        "video": "4.mp4",
        "samples": 945,
        "effective_fps": 14.997,
        "detected_pct": 100.0,
        "median_box_conf": 0.894,
        "regions": 29
      }
    },
    {
      "video": "5.mp4",
      "path": "dataset_front/5.mp4",
      "usable": true,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "label_source": "ocr_reviewed",
      "notes": "Readable monitor HR samples cluster around 130-140 bpm.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/5.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/5_0.5.jpg",
      "monitorCropUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/5_monitor_crop.jpg",
      "monitorSheetUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/generated/5_monitor_sheet.jpg",
      "regionOverlayUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/region_overlays/5_region_overlay.jpg",
      "trainedMethod": "g_minus_r",
      "trainedRegion": "patch_r04_c04",
      "trainedPredBpm": 135.352,
      "oracleMethod": "g_minus_r",
      "oracleRegion": "patch_r02_c03",
      "oraclePredBpm": 134.912,
      "stats": {
        "video": "5.mp4",
        "samples": 908,
        "effective_fps": 15.003,
        "detected_pct": 100.0,
        "median_box_conf": 0.923,
        "regions": 29
      }
    },
    {
      "video": "6.mp4",
      "path": "dataset_front/6.mp4",
      "usable": true,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "label_source": "ocr_reviewed",
      "notes": "Readable monitor HR samples are approximately 90 bpm.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/6.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/6_0.5.jpg",
      "monitorCropUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/6_monitor_crop.jpg",
      "monitorSheetUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/generated/6_monitor_sheet.jpg",
      "regionOverlayUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/region_overlays/6_region_overlay.jpg",
      "trainedMethod": "chrom",
      "trainedRegion": "patch_r02_c02",
      "trainedPredBpm": 90.527,
      "oracleMethod": "green",
      "oracleRegion": "patch_r01_c04",
      "oraclePredBpm": 90.088,
      "stats": {
        "video": "6.mp4",
        "samples": 1035,
        "effective_fps": 15.005,
        "detected_pct": 100.0,
        "median_box_conf": 0.926,
        "regions": 29
      }
    },
    {
      "video": "7.mp4",
      "path": "dataset_front/7.mp4",
      "usable": true,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "label_source": "ocr_reviewed",
      "notes": "Readable monitor HR samples are approximately 182-197 bpm.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/7.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/7_0.5.jpg",
      "monitorCropUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/7_monitor_crop.jpg",
      "monitorSheetUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/generated/7_monitor_sheet.jpg",
      "regionOverlayUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/region_overlays/7_region_overlay.jpg",
      "trainedMethod": "g_minus_r",
      "trainedRegion": "patch_r04_c04",
      "trainedPredBpm": 190.723,
      "oracleMethod": "chrom",
      "oracleRegion": "patch_r02_c05",
      "oraclePredBpm": 189.404,
      "stats": {
        "video": "7.mp4",
        "samples": 933,
        "effective_fps": 15.004,
        "detected_pct": 100.0,
        "median_box_conf": 0.911,
        "regions": 29
      }
    },
    {
      "video": "8.mp4",
      "path": "dataset_front/8.mp4",
      "usable": true,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "label_source": "ocr_reviewed",
      "notes": "Readable monitor HR samples are approximately 108-113 bpm.",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_front/8.mp4",
      "frameUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/8_0.5.jpg",
      "monitorCropUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/frames/8_monitor_crop.jpg",
      "monitorSheetUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/ocr_preview/generated/8_monitor_sheet.jpg",
      "regionOverlayUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_single_view_sqi/region_overlays/8_region_overlay.jpg",
      "trainedMethod": "g_minus_r",
      "trainedRegion": "patch_r02_c01",
      "trainedPredBpm": 111.182,
      "oracleMethod": "g_minus_r",
      "oracleRegion": "face_full",
      "oraclePredBpm": 110.303,
      "stats": {
        "video": "8.mp4",
        "samples": 932,
        "effective_fps": 14.995,
        "detected_pct": 100.0,
        "median_box_conf": 0.925,
        "regions": 29
      }
    }
  ],
  "multiViewAssets": [
    {
      "id": "front",
      "label": "Front RGB",
      "path": "dataset_multi/front.mp4",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_multi/front.mp4",
      "status": "asset_ready"
    },
    {
      "id": "left",
      "label": "Left RGB",
      "path": "dataset_multi/left.mp4",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_multi/left.mp4",
      "status": "asset_ready"
    },
    {
      "id": "right",
      "label": "Right RGB",
      "path": "dataset_multi/right.mp4",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_multi/right.mp4",
      "status": "asset_ready"
    },
    {
      "id": "up",
      "label": "Top RGB",
      "path": "dataset_multi/up.mp4",
      "videoUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/dataset_multi/up.mp4",
      "status": "asset_ready"
    }
  ],
  "measurementSeries": [
    {
      "video": "1.mp4",
      "durationSec": 63.719,
      "label": {
        "bpm_min": 170.0,
        "bpm_max": 180.0,
        "bpm_target": 175.0
      },
      "waveform": [
        {
          "t": 0.0,
          "r": -0.562,
          "g": -0.4639,
          "b": -0.3759,
          "pos": -0.0062,
          "chrom": 0.0097
        },
        {
          "t": 0.133,
          "r": -0.5358,
          "g": -0.442,
          "b": -0.358,
          "pos": -0.1149,
          "chrom": 0.0931
        },
        {
          "t": 0.2,
          "r": -0.5011,
          "g": -0.4069,
          "b": -0.3238,
          "pos": -0.0633,
          "chrom": 0.1465
        },
        {
          "t": 0.333,
          "r": -0.4879,
          "g": -0.3939,
          "b": -0.3164,
          "pos": 0.3192,
          "chrom": -0.2423
        },
        {
          "t": 0.4,
          "r": -0.5188,
          "g": -0.423,
          "b": -0.3455,
          "pos": 0.111,
          "chrom": -0.1819
        },
        {
          "t": 0.533,
          "r": -0.5799,
          "g": -0.4792,
          "b": -0.3954,
          "pos": -0.463,
          "chrom": 0.3232
        },
        {
          "t": 0.6,
          "r": -0.5445,
          "g": -0.4452,
          "b": -0.3655,
          "pos": -0.065,
          "chrom": 0.0848
        },
        {
          "t": 0.733,
          "r": -0.5551,
          "g": -0.4522,
          "b": -0.3785,
          "pos": 0.433,
          "chrom": -0.3077
        },
        {
          "t": 0.8,
          "r": -0.5813,
          "g": -0.4773,
          "b": -0.4018,
          "pos": 0.0422,
          "chrom": 0.0174
        },
        {
          "t": 0.933,
          "r": -0.6174,
          "g": -0.512,
          "b": -0.4347,
          "pos": -0.3386,
          "chrom": 0.3378
        },
        {
          "t": 1.0,
          "r": -0.6358,
          "g": -0.5266,
          "b": -0.4519,
          "pos": -0.2464,
          "chrom": 0.1468
        },
        {
          "t": 1.133,
          "r": -0.6073,
          "g": -0.4974,
          "b": -0.4274,
          "pos": 0.3464,
          "chrom": -0.4649
        },
        {
          "t": 1.267,
          "r": -0.4979,
          "g": -0.4007,
          "b": -0.3398,
          "pos": 0.2206,
          "chrom": -0.0425
        },
        {
          "t": 1.333,
          "r": -0.5165,
          "g": -0.4182,
          "b": -0.3514,
          "pos": -0.2437,
          "chrom": 0.3709
        },
        {
          "t": 1.467,
          "r": -0.498,
          "g": -0.3955,
          "b": -0.3333,
          "pos": -0.1802,
          "chrom": 0.1663
        },
        {
          "t": 1.533,
          "r": -0.4794,
          "g": -0.3781,
          "b": -0.3194,
          "pos": -0.1225,
          "chrom": 0.0956
        },
        {
          "t": 1.667,
          "r": -0.4844,
          "g": -0.3819,
          "b": -0.3267,
          "pos": -0.1678,
          "chrom": 0.0975
        },
        {
          "t": 1.733,
          "r": -0.4548,
          "g": -0.3552,
          "b": -0.3015,
          "pos": 0.0237,
          "chrom": -0.0269
        },
        {
          "t": 1.867,
          "r": -0.4477,
          "g": -0.3506,
          "b": -0.2976,
          "pos": 0.8223,
          "chrom": -0.7796
        },
        {
          "t": 1.933,
          "r": -0.4473,
          "g": -0.3507,
          "b": -0.2972,
          "pos": 0.4794,
          "chrom": -0.4697
        },
        {
          "t": 2.067,
          "r": -0.5143,
          "g": -0.4211,
          "b": -0.3388,
          "pos": -0.8237,
          "chrom": 0.8097
        },
        {
          "t": 2.133,
          "r": -0.4835,
          "g": -0.392,
          "b": -0.3107,
          "pos": -0.4301,
          "chrom": 0.4143
        },
        {
          "t": 2.267,
          "r": -0.4681,
          "g": -0.3791,
          "b": -0.2954,
          "pos": -0.0097,
          "chrom": 0.0286
        },
        {
          "t": 2.333,
          "r": -0.4677,
          "g": -0.3775,
          "b": -0.2935,
          "pos": -0.0412,
          "chrom": 0.0794
        },
        {
          "t": 2.467,
          "r": -0.4456,
          "g": -0.3535,
          "b": -0.2726,
          "pos": 0.4148,
          "chrom": -0.4049
        },
        {
          "t": 2.6,
          "r": -0.447,
          "g": -0.3553,
          "b": -0.273,
          "pos": 0.0469,
          "chrom": -0.0827
        },
        {
          "t": 2.667,
          "r": -0.445,
          "g": -0.3532,
          "b": -0.274,
          "pos": 0.0398,
          "chrom": -0.0843
        },
        {
          "t": 2.8,
          "r": -0.4268,
          "g": -0.336,
          "b": -0.2558,
          "pos": -0.3334,
          "chrom": 0.3678
        },
        {
          "t": 2.867,
          "r": -0.4109,
          "g": -0.3203,
          "b": -0.2386,
          "pos": -0.6136,
          "chrom": 0.6985
        },
        {
          "t": 3.0,
          "r": -0.3758,
          "g": -0.2887,
          "b": -0.2317,
          "pos": 0.2934,
          "chrom": -0.3149
        },
        {
          "t": 3.067,
          "r": -0.3763,
          "g": -0.2885,
          "b": -0.2318,
          "pos": 0.5643,
          "chrom": -0.6348
        },
        {
          "t": 3.2,
          "r": -0.3542,
          "g": -0.2663,
          "b": -0.2108,
          "pos": -0.0444,
          "chrom": 0.0617
        },
        {
          "t": 3.267,
          "r": -0.3394,
          "g": -0.2534,
          "b": -0.1969,
          "pos": -0.152,
          "chrom": 0.2002
        },
        {
          "t": 3.4,
          "r": -0.3359,
          "g": -0.2492,
          "b": -0.1961,
          "pos": -0.056,
          "chrom": 0.0665
        },
        {
          "t": 3.467,
          "r": -0.3329,
          "g": -0.2507,
          "b": -0.1982,
          "pos": -0.039,
          "chrom": 0.0388
        },
        {
          "t": 3.6,
          "r": -0.3336,
          "g": -0.2548,
          "b": -0.2055,
          "pos": 0.0385,
          "chrom": -0.0683
        },
        {
          "t": 3.733,
          "r": -0.3261,
          "g": -0.2531,
          "b": -0.2022,
          "pos": -0.161,
          "chrom": 0.1596
        },
        {
          "t": 3.8,
          "r": -0.3235,
          "g": -0.2497,
          "b": -0.1986,
          "pos": 0.049,
          "chrom": -0.0302
        },
        {
          "t": 3.933,
          "r": -0.3084,
          "g": -0.2356,
          "b": -0.1867,
          "pos": 0.1888,
          "chrom": -0.1477
        },
        {
          "t": 4.0,
          "r": -0.3326,
          "g": -0.2691,
          "b": -0.2213,
          "pos": -0.1457,
          "chrom": 0.1733
        },
        {
          "t": 4.133,
          "r": -0.3265,
          "g": -0.2636,
          "b": -0.2166,
          "pos": -0.1232,
          "chrom": 0.1178
        },
        {
          "t": 4.2,
          "r": -0.3283,
          "g": -0.2674,
          "b": -0.222,
          "pos": 0.028,
          "chrom": -0.0375
        },
        {
          "t": 4.333,
          "r": -0.3102,
          "g": -0.2555,
          "b": -0.2127,
          "pos": 0.1679,
          "chrom": -0.2301
        },
        {
          "t": 4.4,
          "r": -0.3063,
          "g": -0.2554,
          "b": -0.2142,
          "pos": 0.1628,
          "chrom": -0.2254
        },
        {
          "t": 4.533,
          "r": -0.2543,
          "g": -0.2195,
          "b": -0.1821,
          "pos": -0.1921,
          "chrom": 0.2774
        },
        {
          "t": 4.6,
          "r": -0.2202,
          "g": -0.1917,
          "b": -0.1583,
          "pos": -0.0915,
          "chrom": 0.2139
        },
        {
          "t": 4.733,
          "r": -0.1833,
          "g": -0.1607,
          "b": -0.1362,
          "pos": 0.1318,
          "chrom": -0.134
        },
        {
          "t": 4.867,
          "r": -0.1213,
          "g": -0.108,
          "b": -0.0865,
          "pos": -0.3613,
          "chrom": 0.3681
        },
        {
          "t": 4.933,
          "r": -0.0908,
          "g": -0.0799,
          "b": -0.0576,
          "pos": -0.1992,
          "chrom": 0.1615
        },
        {
          "t": 5.067,
          "r": -0.0355,
          "g": -0.0224,
          "b": -0.0053,
          "pos": 0.349,
          "chrom": -0.5272
        },
        {
          "t": 5.133,
          "r": -0.0215,
          "g": -0.0104,
          "b": 0.011,
          "pos": 0.3491,
          "chrom": -0.4229
        },
        {
          "t": 5.267,
          "r": -0.0115,
          "g": -0.0059,
          "b": 0.0179,
          "pos": 0.0343,
          "chrom": 0.1439
        },
        {
          "t": 5.333,
          "r": -0.0646,
          "g": -0.0544,
          "b": -0.0233,
          "pos": -0.3401,
          "chrom": 0.5689
        },
        {
          "t": 5.467,
          "r": -0.2387,
          "g": -0.2018,
          "b": -0.151,
          "pos": -0.3707,
          "chrom": 0.4532
        },
        {
          "t": 5.533,
          "r": -0.3394,
          "g": -0.2816,
          "b": -0.2252,
          "pos": 0.1376,
          "chrom": -0.273
        },
        {
          "t": 5.667,
          "r": -0.481,
          "g": -0.3954,
          "b": -0.3244,
          "pos": 0.4479,
          "chrom": -0.6453
        },
        {
          "t": 5.733,
          "r": -0.5185,
          "g": -0.4273,
          "b": -0.3495,
          "pos": 0.1455,
          "chrom": -0.2389
        },
        {
          "t": 5.867,
          "r": -0.5331,
          "g": -0.4405,
          "b": -0.3576,
          "pos": -0.5353,
          "chrom": 0.5782
        },
        {
          "t": 5.933,
          "r": -0.5245,
          "g": -0.4338,
          "b": -0.3481,
          "pos": -0.2097,
          "chrom": 0.3807
        },
        {
          "t": 6.067,
          "r": -0.4755,
          "g": -0.3957,
          "b": -0.3308,
          "pos": 0.4509,
          "chrom": -0.3386
        },
        {
          "t": 6.2,
          "r": -0.498,
          "g": -0.4173,
          "b": -0.3461,
          "pos": -0.1952,
          "chrom": 0.0786
        },
        {
          "t": 6.267,
          "r": -0.4955,
          "g": -0.4126,
          "b": -0.3385,
          "pos": -0.1733,
          "chrom": 0.0832
        },
        {
          "t": 6.4,
          "r": -0.4821,
          "g": -0.3958,
          "b": -0.3179,
          "pos": -0.022,
          "chrom": 0.0268
        },
        {
          "t": 6.467,
          "r": -0.4826,
          "g": -0.3939,
          "b": -0.3136,
          "pos": 0.0042,
          "chrom": 0.035
        },
        {
          "t": 6.6,
          "r": -0.4885,
          "g": -0.4043,
          "b": -0.3275,
          "pos": -0.0424,
          "chrom": 0.0782
        },
        {
          "t": 6.667,
          "r": -0.4942,
          "g": -0.4106,
          "b": -0.3328,
          "pos": 0.024,
          "chrom": -0.0215
        },
        {
          "t": 6.8,
          "r": -0.4927,
          "g": -0.4086,
          "b": -0.3287,
          "pos": 0.2014,
          "chrom": -0.2455
        },
        {
          "t": 6.867,
          "r": -0.4881,
          "g": -0.4076,
          "b": -0.3273,
          "pos": 0.1397,
          "chrom": -0.178
        },
        {
          "t": 7.0,
          "r": -0.4748,
          "g": -0.3948,
          "b": -0.3036,
          "pos": -0.1972,
          "chrom": 0.2528
        },
        {
          "t": 7.067,
          "r": -0.4902,
          "g": -0.41,
          "b": -0.3201,
          "pos": -0.2614,
          "chrom": 0.3217
        },
        {
          "t": 7.2,
          "r": -0.4962,
          "g": -0.4181,
          "b": -0.3324,
          "pos": 0.0044,
          "chrom": -0.0141
        },
        {
          "t": 7.333,
          "r": -0.4892,
          "g": -0.4108,
          "b": -0.3237,
          "pos": 0.0837,
          "chrom": -0.0527
        },
        {
          "t": 7.4,
          "r": -0.5024,
          "g": -0.4224,
          "b": -0.3366,
          "pos": 0.0752,
          "chrom": -0.1042
        },
        {
          "t": 7.533,
          "r": -0.5043,
          "g": -0.4247,
          "b": -0.3404,
          "pos": 0.2133,
          "chrom": -0.2804
        },
        {
          "t": 7.6,
          "r": -0.4967,
          "g": -0.4187,
          "b": -0.3362,
          "pos": 0.1272,
          "chrom": -0.1128
        },
        {
          "t": 7.733,
          "r": -0.4901,
          "g": -0.4144,
          "b": -0.3289,
          "pos": -0.3002,
          "chrom": 0.3584
        },
        {
          "t": 7.8,
          "r": -0.5015,
          "g": -0.4258,
          "b": -0.3467,
          "pos": -0.3287,
          "chrom": 0.376
        },
        {
          "t": 7.933,
          "r": -0.4888,
          "g": -0.4141,
          "b": -0.3418,
          "pos": 0.017,
          "chrom": 0.0012
        },
        {
          "t": 8.0,
          "r": -0.4835,
          "g": -0.4033,
          "b": -0.343,
          "pos": 0.2542,
          "chrom": -0.3155
        },
        {
          "t": 8.133,
          "r": -0.4721,
          "g": -0.3905,
          "b": -0.3315,
          "pos": 0.2697,
          "chrom": -0.2996
        },
        {
          "t": 8.2,
          "r": -0.4497,
          "g": -0.37,
          "b": -0.3116,
          "pos": 0.0473,
          "chrom": -0.0025
        },
        {
          "t": 8.333,
          "r": -0.4521,
          "g": -0.372,
          "b": -0.3115,
          "pos": -0.2736,
          "chrom": 0.26
        },
        {
          "t": 8.467,
          "r": -0.3906,
          "g": -0.3171,
          "b": -0.2666,
          "pos": -0.0262,
          "chrom": 0.0847
        },
        {
          "t": 8.533,
          "r": -0.3637,
          "g": -0.2906,
          "b": -0.242,
          "pos": 0.0679,
          "chrom": -0.0316
        },
        {
          "t": 8.667,
          "r": -0.3359,
          "g": -0.2635,
          "b": -0.2155,
          "pos": 0.0097,
          "chrom": -0.0237
        },
        {
          "t": 8.733,
          "r": -0.317,
          "g": -0.2502,
          "b": -0.2027,
          "pos": -0.0657,
          "chrom": 0.0759
        },
        {
          "t": 8.867,
          "r": -0.2971,
          "g": -0.2334,
          "b": -0.1883,
          "pos": 0.2659,
          "chrom": -0.3412
        },
        {
          "t": 8.933,
          "r": -0.2734,
          "g": -0.2116,
          "b": -0.17,
          "pos": 0.1386,
          "chrom": -0.1689
        },
        {
          "t": 9.067,
          "r": -0.2583,
          "g": -0.2091,
          "b": -0.1657,
          "pos": -0.298,
          "chrom": 0.3932
        },
        {
          "t": 9.133,
          "r": -0.2677,
          "g": -0.2192,
          "b": -0.1749,
          "pos": -0.035,
          "chrom": 0.0813
        },
        {
          "t": 9.267,
          "r": -0.2967,
          "g": -0.2467,
          "b": -0.1999,
          "pos": 0.0375,
          "chrom": -0.0676
        },
        {
          "t": 9.333,
          "r": -0.3103,
          "g": -0.2621,
          "b": -0.2146,
          "pos": -0.0448,
          "chrom": 0.0084
        },
        {
          "t": 9.467,
          "r": -0.3197,
          "g": -0.2739,
          "b": -0.2301,
          "pos": 0.0922,
          "chrom": -0.0951
        },
        {
          "t": 9.533,
          "r": -0.3188,
          "g": -0.2756,
          "b": -0.2325,
          "pos": 0.0475,
          "chrom": -0.0035
        },
        {
          "t": 9.667,
          "r": -0.3283,
          "g": -0.2849,
          "b": -0.2442,
          "pos": -0.0286,
          "chrom": 0.0416
        },
        {
          "t": 9.8,
          "r": -0.3339,
          "g": -0.2903,
          "b": -0.2519,
          "pos": -0.0231,
          "chrom": -0.0527
        },
        {
          "t": 9.867,
          "r": -0.3216,
          "g": -0.2797,
          "b": -0.2442,
          "pos": -0.0727,
          "chrom": 0.043
        },
        {
          "t": 10.0,
          "r": -0.289,
          "g": -0.2574,
          "b": -0.236,
          "pos": -0.0457,
          "chrom": 0.1288
        },
        {
          "t": 10.067,
          "r": -0.2917,
          "g": -0.2587,
          "b": -0.2384,
          "pos": 0.1328,
          "chrom": -0.0642
        },
        {
          "t": 10.2,
          "r": -0.3028,
          "g": -0.2689,
          "b": -0.2542,
          "pos": 0.1243,
          "chrom": -0.1252
        },
        {
          "t": 10.267,
          "r": -0.3205,
          "g": -0.2847,
          "b": -0.2689,
          "pos": -0.1073,
          "chrom": 0.0573
        },
        {
          "t": 10.4,
          "r": -0.3138,
          "g": -0.2796,
          "b": -0.2684,
          "pos": -0.1063,
          "chrom": 0.0426
        },
        {
          "t": 10.467,
          "r": -0.2869,
          "g": -0.2546,
          "b": -0.2471,
          "pos": 0.0503,
          "chrom": -0.0417
        },
        {
          "t": 10.6,
          "r": -0.2544,
          "g": -0.2248,
          "b": -0.2202,
          "pos": 0.0223,
          "chrom": 0.0632
        },
        {
          "t": 10.667,
          "r": -0.253,
          "g": -0.2241,
          "b": -0.2208,
          "pos": 0.0052,
          "chrom": -0.003
        },
        {
          "t": 10.8,
          "r": -0.263,
          "g": -0.2309,
          "b": -0.2245,
          "pos": -0.0385,
          "chrom": -0.0178
        },
        {
          "t": 10.933,
          "r": -0.2258,
          "g": -0.199,
          "b": -0.1957,
          "pos": -0.0033,
          "chrom": 0.1268
        },
        {
          "t": 11.0,
          "r": -0.2716,
          "g": -0.2297,
          "b": -0.2166,
          "pos": 0.1115,
          "chrom": -0.0803
        },
        {
          "t": 11.133,
          "r": -0.3206,
          "g": -0.2767,
          "b": -0.2581,
          "pos": 0.029,
          "chrom": -0.1152
        },
        {
          "t": 11.2,
          "r": -0.35,
          "g": -0.3032,
          "b": -0.2812,
          "pos": -0.1129,
          "chrom": 0.0629
        },
        {
          "t": 11.333,
          "r": -0.3543,
          "g": -0.3084,
          "b": -0.2817,
          "pos": -0.0976,
          "chrom": 0.1768
        },
        {
          "t": 11.4,
          "r": -0.3495,
          "g": -0.3017,
          "b": -0.2737,
          "pos": 0.1091,
          "chrom": -0.0007
        },
        {
          "t": 11.533,
          "r": -0.3739,
          "g": -0.3239,
          "b": -0.2937,
          "pos": 0.0915,
          "chrom": -0.1404
        },
        {
          "t": 11.6,
          "r": -0.3699,
          "g": -0.3221,
          "b": -0.2917,
          "pos": -0.0822,
          "chrom": -0.0312
        },
        {
          "t": 11.733,
          "r": -0.3134,
          "g": -0.272,
          "b": -0.2466,
          "pos": -0.0434,
          "chrom": 0.0176
        },
        {
          "t": 11.8,
          "r": -0.2637,
          "g": -0.2284,
          "b": -0.2077,
          "pos": -0.062,
          "chrom": 0.1596
        },
        {
          "t": 11.933,
          "r": -0.2197,
          "g": -0.19,
          "b": -0.1748,
          "pos": 0.0276,
          "chrom": 0.0512
        },
        {
          "t": 12.067,
          "r": -0.2215,
          "g": -0.1873,
          "b": -0.1702,
          "pos": 0.1382,
          "chrom": -0.2331
        },
        {
          "t": 12.133,
          "r": -0.2193,
          "g": -0.1883,
          "b": -0.1703,
          "pos": -0.0863,
          "chrom": 0.0497
        },
        {
          "t": 12.267,
          "r": -0.1999,
          "g": -0.1738,
          "b": -0.1561,
          "pos": 0.0136,
          "chrom": 0.0108
        },
        {
          "t": 12.333,
          "r": -0.2025,
          "g": -0.1757,
          "b": -0.1546,
          "pos": 0.2394,
          "chrom": -0.2557
        },
        {
          "t": 12.467,
          "r": -0.1972,
          "g": -0.1762,
          "b": -0.1491,
          "pos": -0.2083,
          "chrom": 0.2719
        },
        {
          "t": 12.533,
          "r": -0.1935,
          "g": -0.1798,
          "b": -0.1479,
          "pos": -0.3302,
          "chrom": 0.393
        },
        {
          "t": 12.667,
          "r": -0.2076,
          "g": -0.1868,
          "b": -0.1535,
          "pos": 0.2204,
          "chrom": -0.3615
        },
        {
          "t": 12.733,
          "r": -0.201,
          "g": -0.1834,
          "b": -0.1476,
          "pos": 0.1569,
          "chrom": -0.2203
        },
        {
          "t": 12.867,
          "r": -0.1747,
          "g": -0.1587,
          "b": -0.121,
          "pos": -0.0058,
          "chrom": 0.1318
        },
        {
          "t": 12.933,
          "r": -0.2175,
          "g": -0.1959,
          "b": -0.1557,
          "pos": 0.0181,
          "chrom": 0.0365
        },
        {
          "t": 13.067,
          "r": -0.2568,
          "g": -0.2256,
          "b": -0.1811,
          "pos": -0.1271,
          "chrom": 0.1294
        },
        {
          "t": 13.133,
          "r": -0.2648,
          "g": -0.2312,
          "b": -0.1932,
          "pos": 0.0003,
          "chrom": -0.0116
        },
        {
          "t": 13.267,
          "r": -0.2653,
          "g": -0.2297,
          "b": -0.197,
          "pos": 0.0632,
          "chrom": -0.0728
        },
        {
          "t": 13.4,
          "r": -0.2465,
          "g": -0.2128,
          "b": -0.1904,
          "pos": -0.1688,
          "chrom": 0.1066
        },
        {
          "t": 13.467,
          "r": -0.2399,
          "g": -0.2064,
          "b": -0.1873,
          "pos": -0.0813,
          "chrom": -0.0011
        },
        {
          "t": 13.6,
          "r": -0.125,
          "g": -0.0945,
          "b": -0.0865,
          "pos": 0.2908,
          "chrom": -0.2188
        },
        {
          "t": 13.667,
          "r": -0.0978,
          "g": -0.0666,
          "b": -0.0582,
          "pos": 0.3993,
          "chrom": -0.2909
        },
        {
          "t": 13.8,
          "r": -0.0836,
          "g": -0.0491,
          "b": -0.0377,
          "pos": -0.3949,
          "chrom": 0.4317
        },
        {
          "t": 13.867,
          "r": -0.0781,
          "g": -0.0461,
          "b": -0.0364,
          "pos": -0.9046,
          "chrom": 0.9225
        },
        {
          "t": 14.0,
          "r": -0.0385,
          "g": -0.0019,
          "b": -0.0142,
          "pos": 0.4338,
          "chrom": -0.5024
        },
        {
          "t": 14.067,
          "r": -0.058,
          "g": -0.0217,
          "b": -0.0348,
          "pos": 0.8383,
          "chrom": -0.9369
        },
        {
          "t": 14.2,
          "r": -0.0706,
          "g": -0.0362,
          "b": -0.0409,
          "pos": -0.1146,
          "chrom": 0.1258
        },
        {
          "t": 14.267,
          "r": -0.1006,
          "g": -0.0656,
          "b": -0.0664,
          "pos": -0.1354,
          "chrom": 0.1775
        },
        {
          "t": 14.4,
          "r": -0.1816,
          "g": -0.1372,
          "b": -0.1174,
          "pos": -0.3404,
          "chrom": 0.3147
        },
        {
          "t": 14.533,
          "r": -0.2663,
          "g": -0.213,
          "b": -0.1802,
          "pos": 0.0773,
          "chrom": 0.0888
        },
        {
          "t": 14.6,
          "r": -0.287,
          "g": -0.23,
          "b": -0.1902,
          "pos": 0.4724,
          "chrom": -0.295
        },
        {
          "t": 14.733,
          "r": -0.5188,
          "g": -0.4282,
          "b": -0.355,
          "pos": 0.1689,
          "chrom": -0.4111
        },
        {
          "t": 14.8,
          "r": -0.5296,
          "g": -0.4374,
          "b": -0.3569,
          "pos": -0.272,
          "chrom": 0.1509
        },
        {
          "t": 14.933,
          "r": -0.5387,
          "g": -0.4446,
          "b": -0.3558,
          "pos": -0.5064,
          "chrom": 0.6016
        },
        {
          "t": 15.0,
          "r": -0.5606,
          "g": -0.4484,
          "b": -0.3578,
          "pos": 0.0043,
          "chrom": -0.0424
        },
        {
          "t": 15.133,
          "r": -0.4814,
          "g": -0.3766,
          "b": -0.296,
          "pos": 0.3446,
          "chrom": -0.3347
        },
        {
          "t": 15.2,
          "r": -0.4737,
          "g": -0.368,
          "b": -0.2875,
          "pos": 0.1229,
          "chrom": -0.1021
        },
        {
          "t": 15.333,
          "r": -0.4154,
          "g": -0.3149,
          "b": -0.2383,
          "pos": 0.1608,
          "chrom": -0.1269
        },
        {
          "t": 15.4,
          "r": -0.4138,
          "g": -0.316,
          "b": -0.2423,
          "pos": 0.0195,
          "chrom": 0.0563
        },
        {
          "t": 15.533,
          "r": -0.4451,
          "g": -0.3507,
          "b": -0.2737,
          "pos": -0.4077,
          "chrom": 0.4053
        },
        {
          "t": 15.667,
          "r": -0.4754,
          "g": -0.3898,
          "b": -0.3201,
          "pos": -0.1689,
          "chrom": 0.1285
        },
        {
          "t": 15.733,
          "r": -0.4857,
          "g": -0.3991,
          "b": -0.3318,
          "pos": 0.1602,
          "chrom": -0.2082
        },
        {
          "t": 15.867,
          "r": -0.4951,
          "g": -0.4079,
          "b": -0.3369,
          "pos": 0.7267,
          "chrom": -0.7262
        },
        {
          "t": 15.933,
          "r": -0.5089,
          "g": -0.4254,
          "b": -0.3497,
          "pos": 0.2785,
          "chrom": -0.2254
        },
        {
          "t": 16.067,
          "r": -0.5518,
          "g": -0.4811,
          "b": -0.4005,
          "pos": -0.7624,
          "chrom": 0.767
        },
        {
          "t": 16.133,
          "r": -0.5518,
          "g": -0.4841,
          "b": -0.4028,
          "pos": -0.4466,
          "chrom": 0.4288
        },
        {
          "t": 16.267,
          "r": -0.5202,
          "g": -0.4567,
          "b": -0.3864,
          "pos": 0.2353,
          "chrom": -0.2008
        },
        {
          "t": 16.333,
          "r": -0.5096,
          "g": -0.4449,
          "b": -0.3749,
          "pos": 0.2209,
          "chrom": -0.1902
        },
        {
          "t": 16.467,
          "r": -0.5079,
          "g": -0.4382,
          "b": -0.3682,
          "pos": 0.243,
          "chrom": -0.2668
        },
        {
          "t": 16.533,
          "r": -0.5077,
          "g": -0.4344,
          "b": -0.3635,
          "pos": 0.1418,
          "chrom": -0.1594
        },
        {
          "t": 16.667,
          "r": -0.4952,
          "g": -0.4201,
          "b": -0.3509,
          "pos": -0.2299,
          "chrom": 0.1937
        },
        {
          "t": 16.733,
          "r": -0.4916,
          "g": -0.4153,
          "b": -0.3483,
          "pos": -0.2292,
          "chrom": 0.1882
        },
        {
          "t": 16.867,
          "r": -0.4375,
          "g": -0.3674,
          "b": -0.3144,
          "pos": -0.1794,
          "chrom": 0.2831
        },
        {
          "t": 17.0,
          "r": -0.4251,
          "g": -0.3632,
          "b": -0.3354,
          "pos": 0.1343,
          "chrom": -0.1488
        },
        {
          "t": 17.067,
          "r": -0.4215,
          "g": -0.3637,
          "b": -0.3369,
          "pos": 0.4114,
          "chrom": -0.4436
        },
        {
          "t": 17.2,
          "r": -0.3985,
          "g": -0.3468,
          "b": -0.3297,
          "pos": 0.3359,
          "chrom": -0.3255
        },
        {
          "t": 17.267,
          "r": -0.424,
          "g": -0.3797,
          "b": -0.3644,
          "pos": -0.2451,
          "chrom": 0.1393
        },
        {
          "t": 17.4,
          "r": -0.3834,
          "g": -0.3586,
          "b": -0.3569,
          "pos": -0.5545,
          "chrom": 0.4798
        },
        {
          "t": 17.467,
          "r": -0.3455,
          "g": -0.327,
          "b": -0.3332,
          "pos": -0.0489,
          "chrom": 0.1994
        },
        {
          "t": 17.6,
          "r": -0.2221,
          "g": -0.228,
          "b": -0.2562,
          "pos": 0.2452,
          "chrom": 0.0369
        },
        {
          "t": 17.667,
          "r": -0.2825,
          "g": -0.2838,
          "b": -0.3067,
          "pos": 0.2275,
          "chrom": -0.1183
        },
        {
          "t": 17.8,
          "r": -0.3277,
          "g": -0.3221,
          "b": -0.3347,
          "pos": 0.0778,
          "chrom": -0.5582
        },
        {
          "t": 17.867,
          "r": -0.3775,
          "g": -0.3701,
          "b": -0.3741,
          "pos": -0.2724,
          "chrom": -0.296
        },
        {
          "t": 18.0,
          "r": -0.3015,
          "g": -0.2977,
          "b": -0.2791,
          "pos": -0.1708,
          "chrom": 0.5158
        },
        {
          "t": 18.133,
          "r": -0.6181,
          "g": -0.6086,
          "b": -0.5851,
          "pos": 0.2004,
          "chrom": 0.1895
        },
        {
          "t": 18.2,
          "r": -0.8025,
          "g": -0.7798,
          "b": -0.7455,
          "pos": 0.2825,
          "chrom": -0.0356
        },
        {
          "t": 18.333,
          "r": -1.3105,
          "g": -1.2268,
          "b": -1.1395,
          "pos": 0.2495,
          "chrom": -0.2882
        },
        {
          "t": 18.4,
          "r": -1.5,
          "g": -1.4474,
          "b": -1.3199,
          "pos": -0.4502,
          "chrom": -0.0873
        },
        {
          "t": 18.533,
          "r": -1.5,
          "g": -1.5,
          "b": -1.5,
          "pos": -0.415,
          "chrom": -0.0225
        },
        {
          "t": 18.6,
          "r": -1.5,
          "g": -1.5,
          "b": -1.3705,
          "pos": 0.495,
          "chrom": -0.2069
        },
        {
          "t": 18.733,
          "r": -1.5,
          "g": -1.5,
          "b": -1.4214,
          "pos": -0.0003,
          "chrom": 0.4059
        },
        {
          "t": 18.8,
          "r": -1.5,
          "g": -1.5,
          "b": -1.4332,
          "pos": -0.1718,
          "chrom": 0.2068
        },
        {
          "t": 18.933,
          "r": -1.5,
          "g": -1.5,
          "b": -1.4103,
          "pos": 0.0892,
          "chrom": -0.2137
        },
        {
          "t": 19.0,
          "r": -1.5,
          "g": -1.5,
          "b": -1.3602,
          "pos": 0.1686,
          "chrom": -0.1316
        },
        {
          "t": 19.133,
          "r": -1.5,
          "g": -1.4907,
          "b": -1.2761,
          "pos": 0.092,
          "chrom": -0.0329
        },
        {
          "t": 19.267,
          "r": -1.5,
          "g": -1.5,
          "b": -1.3245,
          "pos": -0.7545,
          "chrom": 0.4671
        },
        {
          "t": 19.333,
          "r": -1.5,
          "g": -1.4972,
          "b": -1.2723,
          "pos": -0.1711,
          "chrom": -0.0006
        },
        {
          "t": 19.467,
          "r": -1.5,
          "g": -1.4549,
          "b": -1.2486,
          "pos": 0.2369,
          "chrom": -0.1742
        },
        {
          "t": 19.533,
          "r": -1.5,
          "g": -1.4487,
          "b": -1.252,
          "pos": 0.3073,
          "chrom": -0.1439
        },
        {
          "t": 19.667,
          "r": -1.5,
          "g": -1.4514,
          "b": -1.2761,
          "pos": 0.5194,
          "chrom": -0.3757
        },
        {
          "t": 19.733,
          "r": -1.5,
          "g": -1.5,
          "b": -1.327,
          "pos": 0.2435,
          "chrom": -0.07
        },
        {
          "t": 19.867,
          "r": -1.5,
          "g": -1.3561,
          "b": -1.201,
          "pos": -0.6216,
          "chrom": 0.8943
        },
        {
          "t": 19.933,
          "r": -1.4653,
          "g": -1.3027,
          "b": -1.1578,
          "pos": -1.3037,
          "chrom": 1.2083
        },
        {
          "t": 20.067,
          "r": -1.1171,
          "g": -0.9881,
          "b": -0.8965,
          "pos": -1.2152,
          "chrom": 0.3766
        },
        {
          "t": 20.133,
          "r": -0.7582,
          "g": -0.6667,
          "b": -0.6217,
          "pos": 0.9742,
          "chrom": -1.5
        },
        {
          "t": 20.267,
          "r": 0.0309,
          "g": 0.0585,
          "b": 0.0547,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 20.333,
          "r": 0.3745,
          "g": 0.3712,
          "b": 0.4189,
          "pos": -0.2105,
          "chrom": 1.5
        },
        {
          "t": 20.467,
          "r": -0.0938,
          "g": -0.0736,
          "b": 0.0739,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 20.6,
          "r": -0.1127,
          "g": 0.0267,
          "b": 0.167,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 20.667,
          "r": -0.2584,
          "g": -0.1169,
          "b": 0.0505,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 20.8,
          "r": -0.426,
          "g": -0.2804,
          "b": -0.0968,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 20.867,
          "r": -0.4626,
          "g": -0.3188,
          "b": -0.147,
          "pos": -1.1661,
          "chrom": 1.164
        },
        {
          "t": 21.0,
          "r": -0.2885,
          "g": -0.2544,
          "b": -0.2404,
          "pos": 0.6439,
          "chrom": -0.8136
        },
        {
          "t": 21.067,
          "r": -0.1111,
          "g": -0.1108,
          "b": -0.1155,
          "pos": 1.062,
          "chrom": -0.9726
        },
        {
          "t": 21.2,
          "r": 0.0856,
          "g": 0.0417,
          "b": 0.0089,
          "pos": -0.0257,
          "chrom": 0.3771
        },
        {
          "t": 21.267,
          "r": 0.1543,
          "g": 0.0978,
          "b": 0.0667,
          "pos": -0.4513,
          "chrom": 0.7185
        },
        {
          "t": 21.4,
          "r": 0.1073,
          "g": 0.0562,
          "b": 0.0332,
          "pos": -0.3351,
          "chrom": 0.175
        },
        {
          "t": 21.467,
          "r": 0.0743,
          "g": 0.0262,
          "b": 0.0049,
          "pos": -0.1468,
          "chrom": -0.1405
        },
        {
          "t": 21.6,
          "r": 0.0633,
          "g": 0.0178,
          "b": 0.0035,
          "pos": 0.3226,
          "chrom": -0.4141
        },
        {
          "t": 21.733,
          "r": 0.0569,
          "g": 0.0133,
          "b": 0.0014,
          "pos": 0.151,
          "chrom": -0.0229
        },
        {
          "t": 21.8,
          "r": 0.0478,
          "g": 0.0068,
          "b": -0.0027,
          "pos": -0.1744,
          "chrom": 0.2856
        },
        {
          "t": 21.933,
          "r": 0.0475,
          "g": 0.0149,
          "b": 0.0019,
          "pos": -0.1097,
          "chrom": 0.0711
        },
        {
          "t": 22.0,
          "r": 0.0799,
          "g": 0.0605,
          "b": 0.0561,
          "pos": -0.1705,
          "chrom": 0.1994
        },
        {
          "t": 22.133,
          "r": 0.1201,
          "g": 0.0985,
          "b": 0.0786,
          "pos": -0.0306,
          "chrom": 0.0302
        },
        {
          "t": 22.2,
          "r": 0.1309,
          "g": 0.1076,
          "b": 0.0806,
          "pos": 0.3717,
          "chrom": -0.4368
        },
        {
          "t": 22.333,
          "r": 0.1521,
          "g": 0.123,
          "b": 0.089,
          "pos": 0.1842,
          "chrom": -0.1541
        },
        {
          "t": 22.4,
          "r": 0.125,
          "g": 0.0968,
          "b": 0.0688,
          "pos": -0.206,
          "chrom": 0.249
        },
        {
          "t": 22.533,
          "r": 0.1102,
          "g": 0.0774,
          "b": 0.0517,
          "pos": -0.1937,
          "chrom": 0.2075
        },
        {
          "t": 22.6,
          "r": 0.0852,
          "g": 0.0536,
          "b": 0.0325,
          "pos": -0.0245,
          "chrom": -0.0029
        },
        {
          "t": 22.733,
          "r": 0.0816,
          "g": 0.0408,
          "b": 0.0204,
          "pos": 0.0617,
          "chrom": -0.1377
        },
        {
          "t": 22.867,
          "r": 0.1166,
          "g": 0.0645,
          "b": 0.0475,
          "pos": 0.1779,
          "chrom": -0.0875
        },
        {
          "t": 22.933,
          "r": 0.1101,
          "g": 0.0546,
          "b": 0.0379,
          "pos": 0.0563,
          "chrom": 0.0409
        },
        {
          "t": 23.067,
          "r": 0.094,
          "g": 0.0239,
          "b": 0.0019,
          "pos": -0.2435,
          "chrom": 0.2409
        },
        {
          "t": 23.133,
          "r": 0.0958,
          "g": 0.0278,
          "b": 0.0051,
          "pos": -0.0483,
          "chrom": 0.0229
        },
        {
          "t": 23.267,
          "r": 0.0979,
          "g": 0.0289,
          "b": 0.0037,
          "pos": 0.0995,
          "chrom": -0.1549
        },
        {
          "t": 23.333,
          "r": 0.098,
          "g": 0.0269,
          "b": 0.0027,
          "pos": 0.0281,
          "chrom": -0.0565
        },
        {
          "t": 23.467,
          "r": 0.1189,
          "g": 0.0417,
          "b": 0.0145,
          "pos": -0.0792,
          "chrom": 0.1424
        },
        {
          "t": 23.533,
          "r": 0.1178,
          "g": 0.0398,
          "b": 0.0135,
          "pos": -0.0735,
          "chrom": 0.1264
        },
        {
          "t": 23.667,
          "r": 0.1136,
          "g": 0.036,
          "b": 0.0089,
          "pos": 0.2473,
          "chrom": -0.2924
        },
        {
          "t": 23.733,
          "r": 0.1174,
          "g": 0.0381,
          "b": 0.0141,
          "pos": 0.1482,
          "chrom": -0.183
        },
        {
          "t": 23.867,
          "r": 0.1342,
          "g": 0.0503,
          "b": 0.0276,
          "pos": -0.1899,
          "chrom": 0.2165
        },
        {
          "t": 23.933,
          "r": 0.1253,
          "g": 0.0404,
          "b": 0.0202,
          "pos": -0.2162,
          "chrom": 0.262
        },
        {
          "t": 24.067,
          "r": 0.1492,
          "g": 0.0638,
          "b": 0.0378,
          "pos": -0.0514,
          "chrom": 0.0512
        },
        {
          "t": 24.2,
          "r": 0.1558,
          "g": 0.0741,
          "b": 0.0444,
          "pos": 0.2338,
          "chrom": -0.2982
        },
        {
          "t": 24.267,
          "r": 0.1807,
          "g": 0.0979,
          "b": 0.0685,
          "pos": 0.054,
          "chrom": -0.0441
        },
        {
          "t": 24.4,
          "r": 0.1704,
          "g": 0.0853,
          "b": 0.0548,
          "pos": 0.1006,
          "chrom": -0.067
        },
        {
          "t": 24.467,
          "r": 0.1788,
          "g": 0.0943,
          "b": 0.0617,
          "pos": 0.1751,
          "chrom": -0.176
        },
        {
          "t": 24.6,
          "r": 0.1275,
          "g": 0.0476,
          "b": 0.0307,
          "pos": -0.2913,
          "chrom": 0.2924
        },
        {
          "t": 24.667,
          "r": 0.1255,
          "g": 0.0468,
          "b": 0.0298,
          "pos": -0.1039,
          "chrom": 0.1355
        },
        {
          "t": 24.8,
          "r": 0.0895,
          "g": 0.0218,
          "b": 0.0185,
          "pos": -0.12,
          "chrom": 0.1682
        },
        {
          "t": 24.867,
          "r": 0.0743,
          "g": 0.0118,
          "b": 0.0178,
          "pos": -0.3387,
          "chrom": 0.3259
        },
        {
          "t": 25.0,
          "r": 0.0543,
          "g": 0.0043,
          "b": 0.0016,
          "pos": 0.658,
          "chrom": -0.8549
        },
        {
          "t": 25.067,
          "r": 0.0992,
          "g": 0.0472,
          "b": 0.0395,
          "pos": 0.7491,
          "chrom": -0.8017
        },
        {
          "t": 25.2,
          "r": 0.1645,
          "g": 0.1055,
          "b": 0.0884,
          "pos": -0.4413,
          "chrom": 0.7644
        },
        {
          "t": 25.333,
          "r": 0.0901,
          "g": 0.0496,
          "b": 0.0227,
          "pos": -0.9175,
          "chrom": 0.7772
        },
        {
          "t": 25.4,
          "r": 0.0894,
          "g": 0.0561,
          "b": 0.0197,
          "pos": -0.3799,
          "chrom": 0.0984
        },
        {
          "t": 25.533,
          "r": 0.1584,
          "g": 0.1165,
          "b": 0.0358,
          "pos": 0.9523,
          "chrom": -0.956
        },
        {
          "t": 25.6,
          "r": 0.1522,
          "g": 0.1054,
          "b": 0.0185,
          "pos": 0.6689,
          "chrom": -0.5857
        },
        {
          "t": 25.733,
          "r": -0.0108,
          "g": -0.0493,
          "b": -0.12,
          "pos": -0.2344,
          "chrom": 0.3775
        },
        {
          "t": 25.8,
          "r": 0.0151,
          "g": -0.0349,
          "b": -0.1066,
          "pos": 0.0553,
          "chrom": 0.1378
        },
        {
          "t": 25.933,
          "r": -0.2253,
          "g": -0.2513,
          "b": -0.2952,
          "pos": -0.1351,
          "chrom": 0.0028
        },
        {
          "t": 26.0,
          "r": -0.3466,
          "g": -0.3752,
          "b": -0.4008,
          "pos": -0.5873,
          "chrom": 0.4137
        },
        {
          "t": 26.133,
          "r": -0.383,
          "g": -0.3943,
          "b": -0.4058,
          "pos": -0.1116,
          "chrom": 0.0417
        },
        {
          "t": 26.2,
          "r": -0.4079,
          "g": -0.4122,
          "b": -0.4146,
          "pos": -0.0847,
          "chrom": 0.0656
        },
        {
          "t": 26.333,
          "r": -0.336,
          "g": -0.3427,
          "b": -0.3484,
          "pos": 0.1378,
          "chrom": 0.006
        },
        {
          "t": 26.467,
          "r": -0.3681,
          "g": -0.339,
          "b": -0.3153,
          "pos": 0.6495,
          "chrom": -0.622
        },
        {
          "t": 26.533,
          "r": -0.3569,
          "g": -0.3335,
          "b": -0.3157,
          "pos": 0.4385,
          "chrom": -0.3936
        },
        {
          "t": 26.667,
          "r": -0.3795,
          "g": -0.3666,
          "b": -0.3553,
          "pos": -0.0954,
          "chrom": -0.0487
        },
        {
          "t": 26.733,
          "r": -0.3627,
          "g": -0.3599,
          "b": -0.3543,
          "pos": -0.4417,
          "chrom": 0.3101
        },
        {
          "t": 26.867,
          "r": -0.2342,
          "g": -0.2455,
          "b": -0.259,
          "pos": -1.1092,
          "chrom": 1.2248
        },
        {
          "t": 26.933,
          "r": -0.1775,
          "g": -0.194,
          "b": -0.2179,
          "pos": -0.1995,
          "chrom": 0.2911
        },
        {
          "t": 27.067,
          "r": 0.0044,
          "g": -0.0136,
          "b": -0.0793,
          "pos": 1.2557,
          "chrom": -1.2598
        },
        {
          "t": 27.133,
          "r": 0.0449,
          "g": 0.0185,
          "b": -0.0527,
          "pos": 0.2618,
          "chrom": -0.283
        },
        {
          "t": 27.267,
          "r": 0.1398,
          "g": 0.0955,
          "b": 0.0075,
          "pos": -0.4312,
          "chrom": 0.3483
        },
        {
          "t": 27.333,
          "r": 0.1901,
          "g": 0.1361,
          "b": 0.0408,
          "pos": -0.0044,
          "chrom": -0.0541
        },
        {
          "t": 27.467,
          "r": 0.2572,
          "g": 0.1912,
          "b": 0.0961,
          "pos": 0.0939,
          "chrom": 0.0386
        },
        {
          "t": 27.533,
          "r": 0.2622,
          "g": 0.1944,
          "b": 0.1076,
          "pos": -0.0106,
          "chrom": 0.1229
        },
        {
          "t": 27.667,
          "r": 0.228,
          "g": 0.1713,
          "b": 0.1054,
          "pos": -0.0414,
          "chrom": 0.0325
        },
        {
          "t": 27.8,
          "r": 0.2371,
          "g": 0.1789,
          "b": 0.1211,
          "pos": -0.2153,
          "chrom": 0.1575
        },
        {
          "t": 27.867,
          "r": 0.2425,
          "g": 0.187,
          "b": 0.13,
          "pos": -0.073,
          "chrom": -0.0986
        },
        {
          "t": 28.0,
          "r": 0.3759,
          "g": 0.336,
          "b": 0.2933,
          "pos": 0.0113,
          "chrom": 0.0337
        },
        {
          "t": 28.067,
          "r": 0.45,
          "g": 0.4027,
          "b": 0.3476,
          "pos": 0.1592,
          "chrom": 0.002
        },
        {
          "t": 28.2,
          "r": 0.5468,
          "g": 0.5155,
          "b": 0.4702,
          "pos": 0.2843,
          "chrom": -0.2026
        },
        {
          "t": 28.267,
          "r": 0.5885,
          "g": 0.5538,
          "b": 0.5084,
          "pos": -0.2,
          "chrom": 0.2133
        },
        {
          "t": 28.4,
          "r": 0.6392,
          "g": 0.5894,
          "b": 0.5268,
          "pos": -0.251,
          "chrom": 0.1002
        },
        {
          "t": 28.467,
          "r": 0.7114,
          "g": 0.6468,
          "b": 0.5679,
          "pos": 0.0447,
          "chrom": -0.1051
        },
        {
          "t": 28.6,
          "r": 0.7891,
          "g": 0.7052,
          "b": 0.6061,
          "pos": 0.2882,
          "chrom": -0.2333
        },
        {
          "t": 28.667,
          "r": 0.7914,
          "g": 0.7068,
          "b": 0.6052,
          "pos": 0.2498,
          "chrom": -0.2326
        },
        {
          "t": 28.8,
          "r": 0.8042,
          "g": 0.7558,
          "b": 0.6948,
          "pos": -0.342,
          "chrom": 0.4168
        },
        {
          "t": 28.933,
          "r": 0.786,
          "g": 0.7579,
          "b": 0.7101,
          "pos": -0.2263,
          "chrom": 0.2076
        },
        {
          "t": 29.0,
          "r": 0.7964,
          "g": 0.771,
          "b": 0.7264,
          "pos": -0.1645,
          "chrom": 0.1421
        },
        {
          "t": 29.133,
          "r": 0.8054,
          "g": 0.7971,
          "b": 0.7682,
          "pos": 0.5258,
          "chrom": -0.6135
        },
        {
          "t": 29.2,
          "r": 0.8129,
          "g": 0.8093,
          "b": 0.7897,
          "pos": 0.8937,
          "chrom": -0.9674
        },
        {
          "t": 29.333,
          "r": 0.8004,
          "g": 0.8062,
          "b": 0.8302,
          "pos": -0.2576,
          "chrom": 0.3274
        },
        {
          "t": 29.4,
          "r": 0.8096,
          "g": 0.8052,
          "b": 0.8266,
          "pos": -0.7564,
          "chrom": 0.8039
        },
        {
          "t": 29.533,
          "r": 0.7994,
          "g": 0.8064,
          "b": 0.849,
          "pos": -0.4414,
          "chrom": 0.4996
        },
        {
          "t": 29.6,
          "r": 0.8186,
          "g": 0.8383,
          "b": 0.8936,
          "pos": -0.0166,
          "chrom": 0.1487
        },
        {
          "t": 29.733,
          "r": 0.7735,
          "g": 0.8334,
          "b": 0.9235,
          "pos": 0.3437,
          "chrom": -0.3806
        },
        {
          "t": 29.8,
          "r": 0.7229,
          "g": 0.796,
          "b": 0.9006,
          "pos": 0.4433,
          "chrom": -0.6812
        },
        {
          "t": 29.933,
          "r": 0.7171,
          "g": 0.8195,
          "b": 0.9533,
          "pos": 0.3418,
          "chrom": -0.4571
        },
        {
          "t": 30.067,
          "r": 0.7499,
          "g": 0.783,
          "b": 0.8793,
          "pos": -0.7722,
          "chrom": 1.0358
        },
        {
          "t": 30.133,
          "r": 0.7461,
          "g": 0.7809,
          "b": 0.8805,
          "pos": -0.4039,
          "chrom": 0.5874
        },
        {
          "t": 30.267,
          "r": 0.6919,
          "g": 0.7293,
          "b": 0.8329,
          "pos": -0.0578,
          "chrom": 0.0796
        },
        {
          "t": 30.333,
          "r": 0.6635,
          "g": 0.7031,
          "b": 0.809,
          "pos": -0.0707,
          "chrom": 0.0266
        },
        {
          "t": 30.467,
          "r": 0.6505,
          "g": 0.6985,
          "b": 0.8088,
          "pos": 0.7541,
          "chrom": -0.941
        },
        {
          "t": 30.533,
          "r": 0.6817,
          "g": 0.7233,
          "b": 0.8297,
          "pos": 0.3234,
          "chrom": -0.4118
        },
        {
          "t": 30.667,
          "r": 0.7251,
          "g": 0.7172,
          "b": 0.7926,
          "pos": -0.4583,
          "chrom": 0.5363
        },
        {
          "t": 30.733,
          "r": 0.754,
          "g": 0.7499,
          "b": 0.827,
          "pos": -0.0302,
          "chrom": 0.1156
        },
        {
          "t": 30.867,
          "r": 0.7095,
          "g": 0.7083,
          "b": 0.7917,
          "pos": -0.4552,
          "chrom": 0.4125
        },
        {
          "t": 30.933,
          "r": 0.7238,
          "g": 0.7245,
          "b": 0.8083,
          "pos": -0.2222,
          "chrom": 0.1928
        },
        {
          "t": 31.067,
          "r": 0.7341,
          "g": 0.7482,
          "b": 0.834,
          "pos": 0.8147,
          "chrom": -0.4744
        },
        {
          "t": 31.133,
          "r": 0.6967,
          "g": 0.7069,
          "b": 0.7909,
          "pos": 0.1235,
          "chrom": -0.0939
        },
        {
          "t": 31.267,
          "r": 0.5557,
          "g": 0.5596,
          "b": 0.6356,
          "pos": -0.341,
          "chrom": -0.0776
        },
        {
          "t": 31.4,
          "r": 0.6404,
          "g": 0.6421,
          "b": 0.7234,
          "pos": -0.0393,
          "chrom": 0.1594
        },
        {
          "t": 31.467,
          "r": 0.6506,
          "g": 0.6524,
          "b": 0.7358,
          "pos": -0.2694,
          "chrom": 0.3103
        },
        {
          "t": 31.6,
          "r": 0.7998,
          "g": 0.8097,
          "b": 0.8978,
          "pos": 0.4779,
          "chrom": -0.0978
        },
        {
          "t": 31.667,
          "r": 0.8066,
          "g": 0.8248,
          "b": 0.9197,
          "pos": 0.6578,
          "chrom": -0.29
        },
        {
          "t": 31.8,
          "r": 0.6901,
          "g": 0.7048,
          "b": 0.7888,
          "pos": -0.6217,
          "chrom": 0.1707
        },
        {
          "t": 31.867,
          "r": 0.7724,
          "g": 0.7933,
          "b": 0.8819,
          "pos": -0.9323,
          "chrom": 0.5023
        },
        {
          "t": 32.0,
          "r": 0.9313,
          "g": 0.9926,
          "b": 1.0995,
          "pos": 0.3986,
          "chrom": -0.2822
        },
        {
          "t": 32.067,
          "r": 0.9898,
          "g": 1.0631,
          "b": 1.1801,
          "pos": 0.8353,
          "chrom": -0.5505
        },
        {
          "t": 32.2,
          "r": 0.9906,
          "g": 1.088,
          "b": 1.2256,
          "pos": 0.0806,
          "chrom": 0.1075
        },
        {
          "t": 32.267,
          "r": 0.9587,
          "g": 1.0599,
          "b": 1.2,
          "pos": -0.4267,
          "chrom": 0.3401
        },
        {
          "t": 32.4,
          "r": 0.9756,
          "g": 1.0421,
          "b": 1.139,
          "pos": -0.2413,
          "chrom": 0.0493
        },
        {
          "t": 32.533,
          "r": 1.038,
          "g": 1.108,
          "b": 1.2006,
          "pos": 0.0583,
          "chrom": -0.0826
        },
        {
          "t": 32.6,
          "r": 1.0281,
          "g": 1.1037,
          "b": 1.1956,
          "pos": 0.1076,
          "chrom": -0.1049
        },
        {
          "t": 32.733,
          "r": 1.059,
          "g": 1.1428,
          "b": 1.2302,
          "pos": 0.3525,
          "chrom": -0.1692
        },
        {
          "t": 32.8,
          "r": 1.029,
          "g": 1.1126,
          "b": 1.1989,
          "pos": -0.2098,
          "chrom": 0.4174
        },
        {
          "t": 32.933,
          "r": 0.938,
          "g": 1.0222,
          "b": 1.0972,
          "pos": -0.3799,
          "chrom": 0.3087
        },
        {
          "t": 33.0,
          "r": 0.9134,
          "g": 0.9891,
          "b": 1.0323,
          "pos": 0.3463,
          "chrom": -0.5564
        },
        {
          "t": 33.133,
          "r": 0.8941,
          "g": 0.963,
          "b": 1.0005,
          "pos": 0.2646,
          "chrom": -0.3356
        },
        {
          "t": 33.2,
          "r": 0.8878,
          "g": 0.9566,
          "b": 0.9947,
          "pos": -0.0465,
          "chrom": 0.0332
        },
        {
          "t": 33.333,
          "r": 0.862,
          "g": 0.9349,
          "b": 0.9798,
          "pos": -0.1693,
          "chrom": 0.2097
        },
        {
          "t": 33.4,
          "r": 0.8553,
          "g": 0.9282,
          "b": 0.9735,
          "pos": -0.2146,
          "chrom": 0.4386
        },
        {
          "t": 33.533,
          "r": 0.8148,
          "g": 0.8864,
          "b": 0.9272,
          "pos": -0.0376,
          "chrom": 0.1531
        },
        {
          "t": 33.6,
          "r": 0.6919,
          "g": 0.757,
          "b": 0.7874,
          "pos": -0.0245,
          "chrom": -0.1355
        },
        {
          "t": 33.733,
          "r": 0.6556,
          "g": 0.7216,
          "b": 0.7571,
          "pos": 0.0152,
          "chrom": -0.1107
        },
        {
          "t": 33.867,
          "r": 0.5869,
          "g": 0.6486,
          "b": 0.6871,
          "pos": 0.7551,
          "chrom": -0.9518
        },
        {
          "t": 33.933,
          "r": 0.5594,
          "g": 0.6134,
          "b": 0.6538,
          "pos": 0.1155,
          "chrom": -0.1738
        },
        {
          "t": 34.067,
          "r": 0.5607,
          "g": 0.5856,
          "b": 0.6343,
          "pos": -0.5929,
          "chrom": 1.0286
        },
        {
          "t": 34.133,
          "r": 0.5095,
          "g": 0.5356,
          "b": 0.5861,
          "pos": -0.0418,
          "chrom": 0.2049
        },
        {
          "t": 34.267,
          "r": 0.377,
          "g": 0.398,
          "b": 0.4505,
          "pos": -0.1125,
          "chrom": -0.1535
        },
        {
          "t": 34.333,
          "r": 0.3848,
          "g": 0.4008,
          "b": 0.4505,
          "pos": 0.0293,
          "chrom": -0.157
        },
        {
          "t": 34.467,
          "r": 0.4045,
          "g": 0.4127,
          "b": 0.4609,
          "pos": 0.2238,
          "chrom": -0.1733
        },
        {
          "t": 34.533,
          "r": 0.4185,
          "g": 0.4216,
          "b": 0.4678,
          "pos": -0.0039,
          "chrom": 0.0431
        },
        {
          "t": 34.667,
          "r": 0.4246,
          "g": 0.4226,
          "b": 0.4684,
          "pos": 0.1391,
          "chrom": -0.1316
        },
        {
          "t": 34.733,
          "r": 0.4809,
          "g": 0.4769,
          "b": 0.5251,
          "pos": -0.0228,
          "chrom": 0.0864
        },
        {
          "t": 34.867,
          "r": 0.4699,
          "g": 0.4562,
          "b": 0.5048,
          "pos": -0.3601,
          "chrom": 0.3742
        },
        {
          "t": 35.0,
          "r": 0.4638,
          "g": 0.4666,
          "b": 0.5292,
          "pos": 0.3202,
          "chrom": -0.3883
        },
        {
          "t": 35.067,
          "r": 0.4825,
          "g": 0.4895,
          "b": 0.5592,
          "pos": 0.2537,
          "chrom": -0.3042
        },
        {
          "t": 35.2,
          "r": 0.4651,
          "g": 0.4866,
          "b": 0.5757,
          "pos": -0.0317,
          "chrom": 0.0904
        },
        {
          "t": 35.267,
          "r": 0.4565,
          "g": 0.4851,
          "b": 0.5811,
          "pos": -0.0143,
          "chrom": 0.1688
        },
        {
          "t": 35.4,
          "r": 0.4285,
          "g": 0.4493,
          "b": 0.535,
          "pos": -0.2301,
          "chrom": 0.1606
        },
        {
          "t": 35.467,
          "r": 0.4127,
          "g": 0.4399,
          "b": 0.5272,
          "pos": -0.123,
          "chrom": 0.0006
        },
        {
          "t": 35.6,
          "r": 0.4893,
          "g": 0.5286,
          "b": 0.6239,
          "pos": 0.1839,
          "chrom": -0.184
        },
        {
          "t": 35.667,
          "r": 0.4724,
          "g": 0.5177,
          "b": 0.6163,
          "pos": 0.086,
          "chrom": -0.2535
        },
        {
          "t": 35.8,
          "r": 0.573,
          "g": 0.6298,
          "b": 0.7399,
          "pos": 0.0711,
          "chrom": 0.1053
        },
        {
          "t": 35.867,
          "r": 0.6058,
          "g": 0.6618,
          "b": 0.7756,
          "pos": -0.0632,
          "chrom": 0.4808
        },
        {
          "t": 36.0,
          "r": 0.4832,
          "g": 0.5306,
          "b": 0.6195,
          "pos": -0.225,
          "chrom": 0.0252
        },
        {
          "t": 36.133,
          "r": 0.517,
          "g": 0.5711,
          "b": 0.6646,
          "pos": 0.1834,
          "chrom": -0.2767
        },
        {
          "t": 36.2,
          "r": 0.4779,
          "g": 0.5373,
          "b": 0.6352,
          "pos": 0.2543,
          "chrom": -0.2197
        },
        {
          "t": 36.333,
          "r": 0.4518,
          "g": 0.5149,
          "b": 0.6196,
          "pos": 0.0049,
          "chrom": 0.0384
        },
        {
          "t": 36.4,
          "r": 0.4002,
          "g": 0.4631,
          "b": 0.5667,
          "pos": -0.1368,
          "chrom": 0.2286
        },
        {
          "t": 36.533,
          "r": 0.3652,
          "g": 0.4282,
          "b": 0.5308,
          "pos": -0.13,
          "chrom": 0.1659
        },
        {
          "t": 36.6,
          "r": 0.3068,
          "g": 0.3491,
          "b": 0.4255,
          "pos": -0.0594,
          "chrom": -0.0213
        },
        {
          "t": 36.733,
          "r": 0.2711,
          "g": 0.3093,
          "b": 0.3762,
          "pos": 0.1386,
          "chrom": -0.2605
        },
        {
          "t": 36.8,
          "r": 0.2775,
          "g": 0.3157,
          "b": 0.3796,
          "pos": 0.1074,
          "chrom": -0.0407
        },
        {
          "t": 36.933,
          "r": 0.2458,
          "g": 0.2799,
          "b": 0.3406,
          "pos": -0.0859,
          "chrom": 0.2015
        },
        {
          "t": 37.0,
          "r": 0.1538,
          "g": 0.2066,
          "b": 0.2729,
          "pos": 0.0387,
          "chrom": -0.066
        },
        {
          "t": 37.133,
          "r": 0.1452,
          "g": 0.1902,
          "b": 0.2494,
          "pos": 0.0131,
          "chrom": -0.0119
        },
        {
          "t": 37.2,
          "r": 0.0805,
          "g": 0.111,
          "b": 0.1505,
          "pos": -0.0955,
          "chrom": 0.0508
        },
        {
          "t": 37.333,
          "r": 0.0833,
          "g": 0.1088,
          "b": 0.142,
          "pos": 0.0212,
          "chrom": -0.0667
        },
        {
          "t": 37.467,
          "r": 0.078,
          "g": 0.1002,
          "b": 0.1276,
          "pos": -0.0901,
          "chrom": 0.1148
        },
        {
          "t": 37.533,
          "r": 0.0854,
          "g": 0.1085,
          "b": 0.1354,
          "pos": -0.0127,
          "chrom": 0.0508
        },
        {
          "t": 37.667,
          "r": 0.0951,
          "g": 0.1193,
          "b": 0.1415,
          "pos": 0.1603,
          "chrom": -0.0386
        },
        {
          "t": 37.733,
          "r": 0.0809,
          "g": 0.1015,
          "b": 0.119,
          "pos": -0.0765,
          "chrom": 0.1199
        },
        {
          "t": 37.867,
          "r": 0.0482,
          "g": 0.0645,
          "b": 0.0725,
          "pos": -0.0102,
          "chrom": -0.1587
        },
        {
          "t": 37.933,
          "r": 0.0097,
          "g": 0.0324,
          "b": 0.0442,
          "pos": 0.0096,
          "chrom": -0.0987
        },
        {
          "t": 38.067,
          "r": 0.0367,
          "g": 0.0579,
          "b": 0.0789,
          "pos": -0.1999,
          "chrom": 0.3095
        },
        {
          "t": 38.133,
          "r": 0.0146,
          "g": 0.0367,
          "b": 0.0582,
          "pos": 0.095,
          "chrom": -0.0424
        },
        {
          "t": 38.267,
          "r": 0.0027,
          "g": 0.0192,
          "b": 0.0403,
          "pos": 0.4574,
          "chrom": -0.4444
        },
        {
          "t": 38.333,
          "r": -0.0187,
          "g": -0.0034,
          "b": 0.0195,
          "pos": 0.186,
          "chrom": -0.1743
        },
        {
          "t": 38.467,
          "r": -0.046,
          "g": -0.0422,
          "b": -0.0232,
          "pos": -0.4262,
          "chrom": 0.3787
        },
        {
          "t": 38.6,
          "r": -0.0337,
          "g": -0.0378,
          "b": -0.0342,
          "pos": -0.2657,
          "chrom": 0.2854
        },
        {
          "t": 38.667,
          "r": -0.0149,
          "g": -0.0191,
          "b": -0.0236,
          "pos": -0.2853,
          "chrom": 0.2887
        },
        {
          "t": 38.8,
          "r": 0.0098,
          "g": 0.0138,
          "b": -0.0035,
          "pos": 0.5555,
          "chrom": -0.5281
        },
        {
          "t": 38.867,
          "r": 0.0158,
          "g": 0.0218,
          "b": -0.0002,
          "pos": 0.9019,
          "chrom": -0.8186
        },
        {
          "t": 39.0,
          "r": -0.0685,
          "g": -0.0366,
          "b": -0.0217,
          "pos": -0.3629,
          "chrom": 0.3278
        },
        {
          "t": 39.067,
          "r": -0.0721,
          "g": -0.0388,
          "b": -0.0238,
          "pos": -0.6021,
          "chrom": 0.5252
        },
        {
          "t": 39.2,
          "r": -0.0618,
          "g": -0.0331,
          "b": -0.019,
          "pos": -0.0268,
          "chrom": 0.0362
        },
        {
          "t": 39.267,
          "r": -0.0544,
          "g": -0.0279,
          "b": -0.0144,
          "pos": 0.1065,
          "chrom": -0.1051
        },
        {
          "t": 39.4,
          "r": -0.0455,
          "g": -0.0231,
          "b": -0.0054,
          "pos": 0.0791,
          "chrom": -0.0623
        },
        {
          "t": 39.467,
          "r": -0.0362,
          "g": -0.0201,
          "b": -0.0042,
          "pos": -0.0319,
          "chrom": 0.0642
        },
        {
          "t": 39.6,
          "r": -0.023,
          "g": -0.0125,
          "b": 0.0028,
          "pos": -0.0387,
          "chrom": 0.0696
        },
        {
          "t": 39.733,
          "r": -0.008,
          "g": -0.0045,
          "b": 0.0093,
          "pos": -0.07,
          "chrom": 0.0958
        },
        {
          "t": 39.8,
          "r": -0.0205,
          "g": -0.0168,
          "b": -0.0041,
          "pos": 0.2962,
          "chrom": -0.3725
        },
        {
          "t": 39.933,
          "r": -0.0096,
          "g": -0.0108,
          "b": 0.0007,
          "pos": 0.1033,
          "chrom": -0.1462
        },
        {
          "t": 40.0,
          "r": -0.007,
          "g": -0.0218,
          "b": -0.0035,
          "pos": -0.5411,
          "chrom": 0.6009
        },
        {
          "t": 40.133,
          "r": 0.0073,
          "g": -0.0074,
          "b": 0.0003,
          "pos": -0.0782,
          "chrom": 0.1237
        },
        {
          "t": 40.2,
          "r": 0.0169,
          "g": 0.0007,
          "b": 0.0088,
          "pos": 0.3212,
          "chrom": -0.3019
        },
        {
          "t": 40.333,
          "r": 0.0043,
          "g": -0.0077,
          "b": -0.0004,
          "pos": 0.1794,
          "chrom": -0.1936
        },
        {
          "t": 40.4,
          "r": 0.0056,
          "g": -0.0055,
          "b": 0.0037,
          "pos": -0.0453,
          "chrom": 0.0389
        },
        {
          "t": 40.533,
          "r": -0.0033,
          "g": -0.0124,
          "b": -0.002,
          "pos": -0.2219,
          "chrom": 0.1905
        },
        {
          "t": 40.6,
          "r": -0.0001,
          "g": -0.0076,
          "b": 0.0022,
          "pos": -0.0695,
          "chrom": 0.0269
        },
        {
          "t": 40.733,
          "r": 0.0361,
          "g": 0.0248,
          "b": 0.0314,
          "pos": 0.1795,
          "chrom": -0.1076
        },
        {
          "t": 40.8,
          "r": 0.0444,
          "g": 0.0326,
          "b": 0.0399,
          "pos": 0.2535,
          "chrom": -0.203
        },
        {
          "t": 40.933,
          "r": 0.031,
          "g": 0.0199,
          "b": 0.0313,
          "pos": -0.0745,
          "chrom": 0.0181
        },
        {
          "t": 41.067,
          "r": 0.0727,
          "g": 0.0565,
          "b": 0.0681,
          "pos": -0.329,
          "chrom": 0.3858
        },
        {
          "t": 41.133,
          "r": 0.0809,
          "g": 0.0646,
          "b": 0.0712,
          "pos": -0.0839,
          "chrom": 0.1095
        },
        {
          "t": 41.267,
          "r": 0.1057,
          "g": 0.0871,
          "b": 0.0824,
          "pos": 0.2303,
          "chrom": -0.2521
        },
        {
          "t": 41.333,
          "r": 0.1201,
          "g": 0.0977,
          "b": 0.0884,
          "pos": 0.1422,
          "chrom": -0.1343
        },
        {
          "t": 41.467,
          "r": 0.1174,
          "g": 0.0951,
          "b": 0.0825,
          "pos": -0.1613,
          "chrom": 0.1552
        },
        {
          "t": 41.533,
          "r": 0.1067,
          "g": 0.0861,
          "b": 0.0755,
          "pos": -0.0471,
          "chrom": 0.0447
        },
        {
          "t": 41.667,
          "r": 0.1077,
          "g": 0.09,
          "b": 0.0753,
          "pos": 0.2248,
          "chrom": -0.216
        },
        {
          "t": 41.733,
          "r": 0.0628,
          "g": 0.0497,
          "b": 0.0439,
          "pos": -0.0595,
          "chrom": 0.0573
        },
        {
          "t": 41.867,
          "r": 0.0366,
          "g": 0.0282,
          "b": 0.0272,
          "pos": -0.1736,
          "chrom": 0.217
        },
        {
          "t": 41.933,
          "r": 0.0557,
          "g": 0.0488,
          "b": 0.0459,
          "pos": 0.0516,
          "chrom": -0.0208
        },
        {
          "t": 42.067,
          "r": -0.0018,
          "g": 0.0017,
          "b": 0.0071,
          "pos": -0.0484,
          "chrom": -0.0164
        },
        {
          "t": 42.2,
          "r": 0.0452,
          "g": 0.045,
          "b": 0.0415,
          "pos": 0.2185,
          "chrom": -0.2
        },
        {
          "t": 42.267,
          "r": 0.0526,
          "g": 0.0506,
          "b": 0.0441,
          "pos": 0.1755,
          "chrom": -0.1383
        },
        {
          "t": 42.4,
          "r": 0.0579,
          "g": 0.0496,
          "b": 0.0393,
          "pos": -0.1904,
          "chrom": 0.2063
        },
        {
          "t": 42.467,
          "r": 0.0604,
          "g": 0.0519,
          "b": 0.039,
          "pos": -0.1683,
          "chrom": 0.1583
        },
        {
          "t": 42.6,
          "r": 0.0659,
          "g": 0.0556,
          "b": 0.0398,
          "pos": -0.0024,
          "chrom": -0.005
        },
        {
          "t": 42.667,
          "r": 0.0766,
          "g": 0.0655,
          "b": 0.0472,
          "pos": 0.0959,
          "chrom": -0.0629
        },
        {
          "t": 42.8,
          "r": 0.0702,
          "g": 0.059,
          "b": 0.0434,
          "pos": 0.1221,
          "chrom": -0.0772
        },
        {
          "t": 42.867,
          "r": 0.0629,
          "g": 0.0525,
          "b": 0.0391,
          "pos": 0.1154,
          "chrom": -0.1373
        },
        {
          "t": 43.0,
          "r": 0.0534,
          "g": 0.0452,
          "b": 0.0414,
          "pos": -0.1313,
          "chrom": 0.0469
        },
        {
          "t": 43.067,
          "r": 0.0352,
          "g": 0.027,
          "b": 0.0238,
          "pos": -0.2257,
          "chrom": 0.1791
        },
        {
          "t": 43.2,
          "r": 0.0825,
          "g": 0.0636,
          "b": 0.0546,
          "pos": -0.0033,
          "chrom": 0.0821
        },
        {
          "t": 43.333,
          "r": 0.0776,
          "g": 0.0585,
          "b": 0.0503,
          "pos": 0.0758,
          "chrom": 0.0332
        },
        {
          "t": 43.4,
          "r": 0.0539,
          "g": 0.0374,
          "b": 0.0312,
          "pos": 0.0626,
          "chrom": -0.0504
        },
        {
          "t": 43.533,
          "r": 0.0102,
          "g": -0.0002,
          "b": 0.0002,
          "pos": 0.0061,
          "chrom": -0.0994
        },
        {
          "t": 43.6,
          "r": 0.0009,
          "g": -0.0073,
          "b": -0.0059,
          "pos": 0.1746,
          "chrom": -0.2307
        },
        {
          "t": 43.733,
          "r": -0.0297,
          "g": -0.0328,
          "b": -0.0291,
          "pos": 0.1054,
          "chrom": -0.158
        },
        {
          "t": 43.8,
          "r": 0.0065,
          "g": -0.0084,
          "b": -0.0065,
          "pos": -0.487,
          "chrom": 0.5287
        },
        {
          "t": 43.933,
          "r": 0.0091,
          "g": 0.0017,
          "b": 0.0029,
          "pos": -0.2813,
          "chrom": 0.4218
        },
        {
          "t": 44.0,
          "r": 0.0021,
          "g": 0.0138,
          "b": 0.0125,
          "pos": 0.4323,
          "chrom": -0.3854
        },
        {
          "t": 44.133,
          "r": -0.009,
          "g": 0.0029,
          "b": -0.0035,
          "pos": 0.2658,
          "chrom": -0.3355
        },
        {
          "t": 44.2,
          "r": -0.0467,
          "g": -0.0303,
          "b": -0.0357,
          "pos": -0.007,
          "chrom": -0.0825
        },
        {
          "t": 44.333,
          "r": -0.0148,
          "g": -0.0018,
          "b": -0.0117,
          "pos": -0.1378,
          "chrom": 0.105
        },
        {
          "t": 44.4,
          "r": -0.0102,
          "g": -0.0027,
          "b": -0.0129,
          "pos": -0.2846,
          "chrom": 0.2889
        },
        {
          "t": 44.533,
          "r": 0.0242,
          "g": 0.0308,
          "b": 0.0167,
          "pos": -0.0251,
          "chrom": 0.0987
        },
        {
          "t": 44.667,
          "r": 0.0365,
          "g": 0.0448,
          "b": 0.0261,
          "pos": 0.414,
          "chrom": -0.3557
        },
        {
          "t": 44.733,
          "r": 0.0104,
          "g": 0.021,
          "b": 0.0047,
          "pos": 0.2362,
          "chrom": -0.2463
        },
        {
          "t": 44.867,
          "r": -0.0215,
          "g": -0.0071,
          "b": -0.0186,
          "pos": -0.5074,
          "chrom": 0.512
        },
        {
          "t": 44.933,
          "r": -0.0219,
          "g": -0.0061,
          "b": -0.0193,
          "pos": -0.3365,
          "chrom": 0.3283
        },
        {
          "t": 45.067,
          "r": -0.0475,
          "g": -0.0232,
          "b": -0.0447,
          "pos": 0.2696,
          "chrom": -0.4076
        },
        {
          "t": 45.133,
          "r": -0.0555,
          "g": -0.0284,
          "b": -0.0509,
          "pos": 0.2734,
          "chrom": -0.3463
        },
        {
          "t": 45.267,
          "r": -0.051,
          "g": -0.0217,
          "b": -0.0375,
          "pos": 0.0213,
          "chrom": 0.1285
        },
        {
          "t": 45.333,
          "r": -0.0883,
          "g": -0.0563,
          "b": -0.0663,
          "pos": -0.3147,
          "chrom": 0.511
        },
        {
          "t": 45.467,
          "r": -0.1105,
          "g": -0.0742,
          "b": -0.0827,
          "pos": 0.1254,
          "chrom": -0.071
        },
        {
          "t": 45.533,
          "r": -0.1446,
          "g": -0.1043,
          "b": -0.1135,
          "pos": 0.3809,
          "chrom": -0.4897
        },
        {
          "t": 45.667,
          "r": -0.0924,
          "g": -0.0741,
          "b": -0.0968,
          "pos": -0.2467,
          "chrom": 0.0322
        },
        {
          "t": 45.8,
          "r": 0.0784,
          "g": 0.0745,
          "b": 0.0214,
          "pos": 0.4944,
          "chrom": -0.5476
        },
        {
          "t": 45.867,
          "r": 0.1655,
          "g": 0.1476,
          "b": 0.0836,
          "pos": 0.0523,
          "chrom": 0.0535
        },
        {
          "t": 46.0,
          "r": 0.2681,
          "g": 0.2148,
          "b": 0.1313,
          "pos": -1.4939,
          "chrom": 1.5
        },
        {
          "t": 46.067,
          "r": 0.3393,
          "g": 0.2868,
          "b": 0.1826,
          "pos": -0.1578,
          "chrom": 0.3298
        },
        {
          "t": 46.2,
          "r": 0.3615,
          "g": 0.3207,
          "b": 0.2056,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 46.267,
          "r": 0.2904,
          "g": 0.2568,
          "b": 0.1595,
          "pos": 1.0521,
          "chrom": -1.3298
        },
        {
          "t": 46.4,
          "r": 0.1666,
          "g": 0.1393,
          "b": 0.0709,
          "pos": -0.732,
          "chrom": 0.3511
        },
        {
          "t": 46.467,
          "r": 0.2296,
          "g": 0.1799,
          "b": 0.1108,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 46.6,
          "r": 0.2801,
          "g": 0.2408,
          "b": 0.1635,
          "pos": -0.5519,
          "chrom": 0.9744
        },
        {
          "t": 46.667,
          "r": 0.2789,
          "g": 0.2678,
          "b": 0.1835,
          "pos": 1.5,
          "chrom": -1.3707
        },
        {
          "t": 46.8,
          "r": 0.1851,
          "g": 0.1936,
          "b": 0.1247,
          "pos": 0.9885,
          "chrom": -1.1721
        },
        {
          "t": 46.933,
          "r": 0.1537,
          "g": 0.1549,
          "b": 0.0824,
          "pos": -0.2813,
          "chrom": 0.0346
        },
        {
          "t": 47.0,
          "r": 0.1718,
          "g": 0.1456,
          "b": 0.0732,
          "pos": -0.9618,
          "chrom": 0.9281
        },
        {
          "t": 47.133,
          "r": 0.1889,
          "g": 0.1596,
          "b": 0.0838,
          "pos": -0.2777,
          "chrom": 0.33
        },
        {
          "t": 47.2,
          "r": 0.1914,
          "g": 0.1617,
          "b": 0.0877,
          "pos": 0.8632,
          "chrom": -0.7561
        },
        {
          "t": 47.333,
          "r": 0.1401,
          "g": 0.1249,
          "b": 0.0793,
          "pos": 0.4433,
          "chrom": -0.2817
        },
        {
          "t": 47.4,
          "r": -0.0081,
          "g": -0.0121,
          "b": -0.02,
          "pos": -1.1405,
          "chrom": 1.1414
        },
        {
          "t": 47.533,
          "r": -0.0495,
          "g": -0.0539,
          "b": -0.0579,
          "pos": -1.0144,
          "chrom": 1.0254
        },
        {
          "t": 47.6,
          "r": -0.0365,
          "g": -0.031,
          "b": -0.0418,
          "pos": 0.9577,
          "chrom": -0.9915
        },
        {
          "t": 47.733,
          "r": -0.0356,
          "g": -0.0205,
          "b": -0.0226,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 47.8,
          "r": 0.015,
          "g": 0.0132,
          "b": 0.0139,
          "pos": 0.8291,
          "chrom": -0.9469
        },
        {
          "t": 47.933,
          "r": 0.1238,
          "g": 0.0909,
          "b": 0.0882,
          "pos": -1.4302,
          "chrom": 1.5
        },
        {
          "t": 48.0,
          "r": 0.146,
          "g": 0.0834,
          "b": 0.0732,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 48.133,
          "r": 0.3121,
          "g": 0.2644,
          "b": 0.2049,
          "pos": 0.452,
          "chrom": -0.3493
        },
        {
          "t": 48.267,
          "r": 0.2527,
          "g": 0.2024,
          "b": 0.1022,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 48.333,
          "r": 0.1894,
          "g": 0.1378,
          "b": 0.0475,
          "pos": 1.135,
          "chrom": -1.1587
        },
        {
          "t": 48.467,
          "r": -0.1318,
          "g": -0.1662,
          "b": -0.2109,
          "pos": -1.5,
          "chrom": 1.4869
        },
        {
          "t": 48.533,
          "r": -0.3431,
          "g": -0.3559,
          "b": -0.3692,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 48.667,
          "r": -0.5103,
          "g": -0.4977,
          "b": -0.4916,
          "pos": 0.1396,
          "chrom": 0.083
        },
        {
          "t": 48.733,
          "r": -0.6496,
          "g": -0.6198,
          "b": -0.5888,
          "pos": 0.7663,
          "chrom": -0.4423
        },
        {
          "t": 48.867,
          "r": -0.982,
          "g": -0.8974,
          "b": -0.8095,
          "pos": 0.9476,
          "chrom": -0.8365
        },
        {
          "t": 48.933,
          "r": -1.1404,
          "g": -1.0377,
          "b": -0.9234,
          "pos": 0.2567,
          "chrom": -0.3536
        },
        {
          "t": 49.067,
          "r": -1.3389,
          "g": -1.2059,
          "b": -1.0488,
          "pos": -0.9225,
          "chrom": 0.6354
        },
        {
          "t": 49.133,
          "r": -1.3478,
          "g": -1.2123,
          "b": -1.056,
          "pos": -0.677,
          "chrom": 0.4407
        },
        {
          "t": 49.267,
          "r": -1.2509,
          "g": -1.1347,
          "b": -0.9998,
          "pos": -0.0875,
          "chrom": 0.0971
        },
        {
          "t": 49.4,
          "r": -1.1395,
          "g": -1.0409,
          "b": -0.93,
          "pos": 0.7395,
          "chrom": -0.4774
        },
        {
          "t": 49.467,
          "r": -1.0585,
          "g": -0.9624,
          "b": -0.8579,
          "pos": 0.9899,
          "chrom": -0.587
        },
        {
          "t": 49.6,
          "r": -1.0338,
          "g": -0.9575,
          "b": -0.8691,
          "pos": 0.21,
          "chrom": -0.0064
        },
        {
          "t": 49.667,
          "r": -1.0745,
          "g": -0.9921,
          "b": -0.8985,
          "pos": -0.49,
          "chrom": 0.2541
        },
        {
          "t": 49.8,
          "r": -0.944,
          "g": -0.8888,
          "b": -0.8255,
          "pos": -1.5,
          "chrom": 0.8483
        },
        {
          "t": 49.867,
          "r": -0.6998,
          "g": -0.6729,
          "b": -0.6478,
          "pos": -0.9952,
          "chrom": 0.6161
        },
        {
          "t": 50.0,
          "r": -0.1436,
          "g": -0.1491,
          "b": -0.1819,
          "pos": 1.4793,
          "chrom": -0.9495
        },
        {
          "t": 50.067,
          "r": 0.0404,
          "g": 0.0194,
          "b": -0.0266,
          "pos": 1.5,
          "chrom": -0.8946
        },
        {
          "t": 50.2,
          "r": 0.0516,
          "g": 0.0273,
          "b": -0.0135,
          "pos": -0.2865,
          "chrom": 0.2437
        },
        {
          "t": 50.267,
          "r": 0.0479,
          "g": 0.0222,
          "b": -0.0162,
          "pos": -0.5852,
          "chrom": 0.3938
        },
        {
          "t": 50.4,
          "r": 0.0277,
          "g": 0.0015,
          "b": -0.0326,
          "pos": -0.2866,
          "chrom": 0.1863
        },
        {
          "t": 50.533,
          "r": -0.0677,
          "g": -0.0832,
          "b": -0.1012,
          "pos": -0.2218,
          "chrom": 0.1062
        },
        {
          "t": 50.6,
          "r": -0.086,
          "g": -0.1022,
          "b": -0.1186,
          "pos": -0.0801,
          "chrom": -0.0038
        },
        {
          "t": 50.733,
          "r": -0.0734,
          "g": -0.0902,
          "b": -0.1094,
          "pos": 0.3771,
          "chrom": -0.2909
        },
        {
          "t": 50.8,
          "r": -0.0387,
          "g": -0.0523,
          "b": -0.0697,
          "pos": 0.3858,
          "chrom": -0.1856
        },
        {
          "t": 50.933,
          "r": -0.027,
          "g": -0.0306,
          "b": -0.0365,
          "pos": -0.0272,
          "chrom": 0.1034
        },
        {
          "t": 51.0,
          "r": -0.0688,
          "g": -0.0604,
          "b": -0.0577,
          "pos": -0.2582,
          "chrom": 0.2155
        },
        {
          "t": 51.133,
          "r": -0.0434,
          "g": -0.0269,
          "b": -0.0197,
          "pos": -0.3244,
          "chrom": 0.1356
        },
        {
          "t": 51.2,
          "r": -0.0349,
          "g": -0.0189,
          "b": -0.0153,
          "pos": -0.0599,
          "chrom": -0.087
        },
        {
          "t": 51.333,
          "r": 0.057,
          "g": 0.0541,
          "b": 0.0367,
          "pos": 0.4259,
          "chrom": -0.2396
        },
        {
          "t": 51.4,
          "r": 0.0419,
          "g": 0.0426,
          "b": 0.0314,
          "pos": 0.2606,
          "chrom": -0.1144
        },
        {
          "t": 51.533,
          "r": -0.0208,
          "g": -0.0101,
          "b": -0.0074,
          "pos": -0.2123,
          "chrom": 0.1956
        },
        {
          "t": 51.6,
          "r": -0.0246,
          "g": -0.0163,
          "b": -0.0114,
          "pos": -0.2335,
          "chrom": 0.2375
        },
        {
          "t": 51.733,
          "r": -0.0525,
          "g": -0.039,
          "b": -0.029,
          "pos": -0.1712,
          "chrom": 0.0677
        },
        {
          "t": 51.867,
          "r": 0.0223,
          "g": 0.0211,
          "b": 0.0145,
          "pos": 0.5684,
          "chrom": -0.5628
        },
        {
          "t": 51.933,
          "r": 0.0032,
          "g": 0.0037,
          "b": 0.003,
          "pos": 0.3194,
          "chrom": -0.2618
        },
        {
          "t": 52.067,
          "r": 0.0113,
          "g": 0.0102,
          "b": 0.0211,
          "pos": -0.5085,
          "chrom": 0.5566
        },
        {
          "t": 52.133,
          "r": 0.0345,
          "g": 0.0342,
          "b": 0.0449,
          "pos": -0.2008,
          "chrom": 0.2554
        },
        {
          "t": 52.267,
          "r": 0.0313,
          "g": 0.0315,
          "b": 0.0407,
          "pos": 0.0575,
          "chrom": -0.0783
        },
        {
          "t": 52.333,
          "r": 0.026,
          "g": 0.0265,
          "b": 0.0355,
          "pos": 0.1357,
          "chrom": -0.1846
        },
        {
          "t": 52.467,
          "r": 0.018,
          "g": 0.0109,
          "b": 0.0122,
          "pos": 0.2685,
          "chrom": -0.2949
        },
        {
          "t": 52.533,
          "r": -0.0016,
          "g": -0.0066,
          "b": 0.0046,
          "pos": -0.0801,
          "chrom": 0.0602
        },
        {
          "t": 52.667,
          "r": -0.0193,
          "g": -0.0205,
          "b": -0.0043,
          "pos": -0.1666,
          "chrom": 0.2144
        },
        {
          "t": 52.733,
          "r": -0.0256,
          "g": -0.0258,
          "b": -0.0073,
          "pos": -0.078,
          "chrom": 0.1465
        },
        {
          "t": 52.867,
          "r": -0.052,
          "g": -0.0462,
          "b": -0.0252,
          "pos": -0.0467,
          "chrom": 0.0583
        },
        {
          "t": 53.0,
          "r": -0.0619,
          "g": -0.0421,
          "b": -0.0126,
          "pos": 0.1741,
          "chrom": -0.2107
        },
        {
          "t": 53.067,
          "r": -0.0597,
          "g": -0.043,
          "b": -0.0163,
          "pos": 0.0446,
          "chrom": -0.092
        },
        {
          "t": 53.2,
          "r": -0.0277,
          "g": -0.0119,
          "b": 0.0107,
          "pos": 0.143,
          "chrom": -0.1624
        },
        {
          "t": 53.267,
          "r": -0.0239,
          "g": -0.0073,
          "b": 0.0154,
          "pos": 0.1253,
          "chrom": -0.1205
        },
        {
          "t": 53.4,
          "r": -0.0004,
          "g": 0.0157,
          "b": 0.0398,
          "pos": -0.3389,
          "chrom": 0.3895
        },
        {
          "t": 53.467,
          "r": -0.0103,
          "g": 0.0079,
          "b": 0.0312,
          "pos": -0.2817,
          "chrom": 0.3611
        },
        {
          "t": 53.6,
          "r": 0.0085,
          "g": 0.0317,
          "b": 0.0473,
          "pos": 0.2305,
          "chrom": -0.2146
        },
        {
          "t": 53.667,
          "r": -0.0203,
          "g": 0.0038,
          "b": 0.0103,
          "pos": 0.2118,
          "chrom": -0.2791
        },
        {
          "t": 53.8,
          "r": -0.0099,
          "g": 0.0156,
          "b": 0.0213,
          "pos": 0.065,
          "chrom": -0.1255
        },
        {
          "t": 53.867,
          "r": -0.0034,
          "g": 0.0231,
          "b": 0.0271,
          "pos": 0.0062,
          "chrom": -0.0103
        },
        {
          "t": 54.0,
          "r": 0.0097,
          "g": 0.0331,
          "b": 0.0395,
          "pos": -0.3044,
          "chrom": 0.3392
        },
        {
          "t": 54.133,
          "r": 0.0217,
          "g": 0.0459,
          "b": 0.0447,
          "pos": 0.2874,
          "chrom": -0.271
        },
        {
          "t": 54.2,
          "r": 0.0319,
          "g": 0.0511,
          "b": 0.0502,
          "pos": 0.2694,
          "chrom": -0.2174
        },
        {
          "t": 54.333,
          "r": -0.0171,
          "g": -0.0031,
          "b": -0.0029,
          "pos": -0.1619,
          "chrom": 0.1435
        },
        {
          "t": 54.4,
          "r": -0.0354,
          "g": -0.0222,
          "b": -0.0224,
          "pos": -0.1205,
          "chrom": 0.0801
        },
        {
          "t": 54.533,
          "r": -0.0514,
          "g": -0.0442,
          "b": -0.0458,
          "pos": 0.0302,
          "chrom": -0.0152
        },
        {
          "t": 54.6,
          "r": -0.0644,
          "g": -0.0607,
          "b": -0.0621,
          "pos": -0.0291,
          "chrom": 0.0362
        },
        {
          "t": 54.733,
          "r": -0.0765,
          "g": -0.08,
          "b": -0.0809,
          "pos": -0.0899,
          "chrom": 0.0832
        },
        {
          "t": 54.8,
          "r": -0.0716,
          "g": -0.0764,
          "b": -0.0776,
          "pos": 0.2732,
          "chrom": -0.3117
        },
        {
          "t": 54.933,
          "r": -0.0475,
          "g": -0.0617,
          "b": -0.0634,
          "pos": 0.1463,
          "chrom": -0.1289
        },
        {
          "t": 55.0,
          "r": -0.0389,
          "g": -0.0655,
          "b": -0.0639,
          "pos": -0.4395,
          "chrom": 0.5397
        },
        {
          "t": 55.133,
          "r": -0.0193,
          "g": -0.0518,
          "b": -0.0564,
          "pos": -0.1048,
          "chrom": 0.112
        },
        {
          "t": 55.2,
          "r": -0.0166,
          "g": -0.0488,
          "b": -0.0545,
          "pos": 0.2349,
          "chrom": -0.2965
        },
        {
          "t": 55.333,
          "r": -0.0017,
          "g": -0.0378,
          "b": -0.0399,
          "pos": 0.0491,
          "chrom": -0.0831
        },
        {
          "t": 55.467,
          "r": -0.0021,
          "g": -0.0414,
          "b": -0.0408,
          "pos": -0.0437,
          "chrom": 0.0672
        },
        {
          "t": 55.533,
          "r": 0.0001,
          "g": -0.0365,
          "b": -0.035,
          "pos": 0.1324,
          "chrom": -0.0989
        },
        {
          "t": 55.667,
          "r": -0.0436,
          "g": -0.0727,
          "b": -0.0663,
          "pos": 0.0916,
          "chrom": -0.0856
        },
        {
          "t": 55.733,
          "r": -0.06,
          "g": -0.0852,
          "b": -0.0709,
          "pos": -0.1998,
          "chrom": 0.2209
        },
        {
          "t": 55.867,
          "r": -0.0978,
          "g": -0.1149,
          "b": -0.1048,
          "pos": -0.2562,
          "chrom": 0.2824
        },
        {
          "t": 55.933,
          "r": -0.1041,
          "g": -0.1161,
          "b": -0.1071,
          "pos": -0.0168,
          "chrom": 0.0095
        },
        {
          "t": 56.067,
          "r": -0.1053,
          "g": -0.1022,
          "b": -0.0983,
          "pos": 0.2567,
          "chrom": -0.3084
        },
        {
          "t": 56.133,
          "r": -0.0978,
          "g": -0.0916,
          "b": -0.0917,
          "pos": 0.1746,
          "chrom": -0.2131
        },
        {
          "t": 56.267,
          "r": -0.0537,
          "g": -0.0469,
          "b": -0.0542,
          "pos": -0.0871,
          "chrom": 0.1251
        },
        {
          "t": 56.333,
          "r": -0.0258,
          "g": -0.0202,
          "b": -0.0308,
          "pos": -0.2424,
          "chrom": 0.2681
        },
        {
          "t": 56.467,
          "r": 0.0268,
          "g": 0.0278,
          "b": 0.0043,
          "pos": 0.0364,
          "chrom": 0.0031
        },
        {
          "t": 56.6,
          "r": 0.0676,
          "g": 0.065,
          "b": 0.035,
          "pos": 0.1576,
          "chrom": -0.1329
        },
        {
          "t": 56.667,
          "r": 0.0671,
          "g": 0.0617,
          "b": 0.0286,
          "pos": 0.038,
          "chrom": -0.1227
        },
        {
          "t": 56.8,
          "r": 0.1032,
          "g": 0.0958,
          "b": 0.0618,
          "pos": -0.089,
          "chrom": 0.0582
        },
        {
          "t": 56.867,
          "r": 0.1224,
          "g": 0.1153,
          "b": 0.0833,
          "pos": -0.2459,
          "chrom": 0.3167
        },
        {
          "t": 57.0,
          "r": 0.1389,
          "g": 0.1279,
          "b": 0.0845,
          "pos": 0.0611,
          "chrom": -0.0314
        },
        {
          "t": 57.067,
          "r": 0.1427,
          "g": 0.135,
          "b": 0.0941,
          "pos": 0.2401,
          "chrom": -0.2534
        },
        {
          "t": 57.2,
          "r": 0.1371,
          "g": 0.1349,
          "b": 0.0974,
          "pos": 0.107,
          "chrom": -0.0819
        },
        {
          "t": 57.267,
          "r": 0.1471,
          "g": 0.139,
          "b": 0.0934,
          "pos": 0.0773,
          "chrom": -0.0936
        },
        {
          "t": 57.4,
          "r": 0.1171,
          "g": 0.1146,
          "b": 0.0751,
          "pos": -0.2831,
          "chrom": 0.2211
        },
        {
          "t": 57.467,
          "r": 0.1419,
          "g": 0.135,
          "b": 0.0908,
          "pos": -0.334,
          "chrom": 0.3709
        },
        {
          "t": 57.6,
          "r": 0.1543,
          "g": 0.1382,
          "b": 0.0798,
          "pos": 0.1951,
          "chrom": -0.1341
        },
        {
          "t": 57.733,
          "r": 0.16,
          "g": 0.1363,
          "b": 0.0731,
          "pos": 0.0833,
          "chrom": -0.0841
        },
        {
          "t": 57.8,
          "r": 0.1516,
          "g": 0.1242,
          "b": 0.0604,
          "pos": 0.0695,
          "chrom": -0.1214
        },
        {
          "t": 57.933,
          "r": 0.1617,
          "g": 0.1281,
          "b": 0.0624,
          "pos": 0.086,
          "chrom": -0.1303
        },
        {
          "t": 58.0,
          "r": 0.1604,
          "g": 0.1258,
          "b": 0.0718,
          "pos": -0.1636,
          "chrom": 0.2204
        },
        {
          "t": 58.133,
          "r": 0.1659,
          "g": 0.1293,
          "b": 0.0745,
          "pos": -0.2213,
          "chrom": 0.2525
        },
        {
          "t": 58.2,
          "r": 0.1459,
          "g": 0.1125,
          "b": 0.0619,
          "pos": -0.0804,
          "chrom": 0.0612
        },
        {
          "t": 58.333,
          "r": 0.1702,
          "g": 0.14,
          "b": 0.0863,
          "pos": 0.2462,
          "chrom": -0.2232
        },
        {
          "t": 58.4,
          "r": 0.1616,
          "g": 0.1337,
          "b": 0.0814,
          "pos": 0.2002,
          "chrom": -0.2063
        },
        {
          "t": 58.533,
          "r": 0.1504,
          "g": 0.1218,
          "b": 0.0683,
          "pos": -0.1361,
          "chrom": 0.1096
        },
        {
          "t": 58.6,
          "r": 0.1551,
          "g": 0.1282,
          "b": 0.0764,
          "pos": -0.0814,
          "chrom": 0.0992
        },
        {
          "t": 58.733,
          "r": 0.1512,
          "g": 0.1248,
          "b": 0.0723,
          "pos": 0.0377,
          "chrom": -0.0275
        },
        {
          "t": 58.8,
          "r": 0.1515,
          "g": 0.1218,
          "b": 0.0677,
          "pos": -0.0488,
          "chrom": 0.0641
        },
        {
          "t": 58.933,
          "r": 0.145,
          "g": 0.1106,
          "b": 0.0547,
          "pos": 0.0223,
          "chrom": -0.0143
        },
        {
          "t": 59.067,
          "r": 0.1302,
          "g": 0.0916,
          "b": 0.034,
          "pos": 0.0687,
          "chrom": -0.1081
        },
        {
          "t": 59.133,
          "r": 0.1375,
          "g": 0.0951,
          "b": 0.0357,
          "pos": 0.03,
          "chrom": -0.0375
        },
        {
          "t": 59.267,
          "r": 0.1368,
          "g": 0.0931,
          "b": 0.034,
          "pos": -0.0317,
          "chrom": 0.0618
        },
        {
          "t": 59.333,
          "r": 0.1355,
          "g": 0.0915,
          "b": 0.0338,
          "pos": -0.211,
          "chrom": 0.2545
        },
        {
          "t": 59.467,
          "r": 0.1311,
          "g": 0.0893,
          "b": 0.0313,
          "pos": -0.0733,
          "chrom": 0.076
        },
        {
          "t": 59.533,
          "r": 0.1318,
          "g": 0.0908,
          "b": 0.0328,
          "pos": 0.1972,
          "chrom": -0.2392
        },
        {
          "t": 59.667,
          "r": 0.1279,
          "g": 0.0869,
          "b": 0.036,
          "pos": 0.162,
          "chrom": -0.186
        },
        {
          "t": 59.733,
          "r": 0.1312,
          "g": 0.0916,
          "b": 0.0443,
          "pos": 0.0895,
          "chrom": -0.0975
        },
        {
          "t": 59.867,
          "r": 0.1121,
          "g": 0.0714,
          "b": 0.0378,
          "pos": -0.0289,
          "chrom": 0.0675
        },
        {
          "t": 59.933,
          "r": 0.1136,
          "g": 0.0726,
          "b": 0.0397,
          "pos": -0.3025,
          "chrom": 0.3478
        },
        {
          "t": 60.067,
          "r": 0.0809,
          "g": 0.0423,
          "b": 0.0165,
          "pos": -0.0882,
          "chrom": 0.0809
        },
        {
          "t": 60.2,
          "r": 0.0934,
          "g": 0.0601,
          "b": 0.0362,
          "pos": 0.3134,
          "chrom": -0.2754
        },
        {
          "t": 60.267,
          "r": 0.0815,
          "g": 0.0485,
          "b": 0.0271,
          "pos": -0.0623,
          "chrom": 0.0869
        },
        {
          "t": 60.4,
          "r": 0.0915,
          "g": 0.0566,
          "b": 0.0302,
          "pos": -0.0935,
          "chrom": 0.0264
        },
        {
          "t": 60.467,
          "r": 0.1045,
          "g": 0.066,
          "b": 0.0319,
          "pos": 0.1208,
          "chrom": -0.2345
        },
        {
          "t": 60.6,
          "r": 0.1754,
          "g": 0.1262,
          "b": 0.0855,
          "pos": 0.167,
          "chrom": -0.1109
        },
        {
          "t": 60.667,
          "r": 0.2043,
          "g": 0.1488,
          "b": 0.1069,
          "pos": -0.0447,
          "chrom": 0.2262
        },
        {
          "t": 60.8,
          "r": 0.1883,
          "g": 0.1303,
          "b": 0.0915,
          "pos": -0.2021,
          "chrom": 0.2111
        },
        {
          "t": 60.867,
          "r": 0.189,
          "g": 0.1351,
          "b": 0.0977,
          "pos": 0.017,
          "chrom": -0.1044
        },
        {
          "t": 61.0,
          "r": 0.1936,
          "g": 0.1381,
          "b": 0.1061,
          "pos": 0.0475,
          "chrom": -0.1095
        },
        {
          "t": 61.067,
          "r": 0.1957,
          "g": 0.1398,
          "b": 0.1076,
          "pos": 0.0475,
          "chrom": -0.0888
        },
        {
          "t": 61.2,
          "r": 0.2161,
          "g": 0.1561,
          "b": 0.1287,
          "pos": 0.0098,
          "chrom": 0.0817
        },
        {
          "t": 61.333,
          "r": 0.2062,
          "g": 0.1489,
          "b": 0.1286,
          "pos": -0.1114,
          "chrom": 0.1339
        },
        {
          "t": 61.4,
          "r": 0.1843,
          "g": 0.1302,
          "b": 0.1138,
          "pos": 0.0669,
          "chrom": -0.1264
        },
        {
          "t": 61.533,
          "r": 0.2035,
          "g": 0.1467,
          "b": 0.1308,
          "pos": 0.0217,
          "chrom": -0.0503
        },
        {
          "t": 61.6,
          "r": 0.206,
          "g": 0.148,
          "b": 0.1325,
          "pos": -0.0669,
          "chrom": 0.0819
        },
        {
          "t": 61.733,
          "r": 0.239,
          "g": 0.1787,
          "b": 0.1592,
          "pos": 0.0301,
          "chrom": 0.0208
        },
        {
          "t": 61.8,
          "r": 0.2196,
          "g": 0.1591,
          "b": 0.141,
          "pos": -0.1812,
          "chrom": 0.2169
        },
        {
          "t": 61.933,
          "r": 0.2294,
          "g": 0.168,
          "b": 0.1446,
          "pos": -0.0148,
          "chrom": -0.0272
        },
        {
          "t": 62.0,
          "r": 0.2487,
          "g": 0.1859,
          "b": 0.1513,
          "pos": 0.3293,
          "chrom": -0.3874
        },
        {
          "t": 62.133,
          "r": 0.2577,
          "g": 0.1946,
          "b": 0.1621,
          "pos": 0.1506,
          "chrom": -0.1262
        },
        {
          "t": 62.2,
          "r": 0.2568,
          "g": 0.1952,
          "b": 0.1671,
          "pos": -0.0694,
          "chrom": 0.1049
        },
        {
          "t": 62.333,
          "r": 0.2398,
          "g": 0.1817,
          "b": 0.1581,
          "pos": -0.3648,
          "chrom": 0.3954
        },
        {
          "t": 62.4,
          "r": 0.2448,
          "g": 0.1858,
          "b": 0.1617,
          "pos": -0.2614,
          "chrom": 0.3094
        },
        {
          "t": 62.533,
          "r": 0.2528,
          "g": 0.1953,
          "b": 0.1675,
          "pos": 0.3076,
          "chrom": -0.3279
        },
        {
          "t": 62.667,
          "r": 0.2531,
          "g": 0.185,
          "b": 0.1608,
          "pos": -0.2366,
          "chrom": 0.2302
        },
        {
          "t": 62.733,
          "r": 0.2735,
          "g": 0.2023,
          "b": 0.1727,
          "pos": -0.022,
          "chrom": -0.0119
        },
        {
          "t": 62.867,
          "r": 0.3023,
          "g": 0.2251,
          "b": 0.1841,
          "pos": 0.8532,
          "chrom": -0.9534
        },
        {
          "t": 62.933,
          "r": 0.32,
          "g": 0.2357,
          "b": 0.1919,
          "pos": -0.0282,
          "chrom": 0.0703
        },
        {
          "t": 63.067,
          "r": 0.2985,
          "g": 0.2011,
          "b": 0.142,
          "pos": -1.1328,
          "chrom": 1.2456
        },
        {
          "t": 63.133,
          "r": 0.2866,
          "g": 0.1989,
          "b": 0.1228,
          "pos": -0.0259,
          "chrom": 0.0283
        },
        {
          "t": 63.267,
          "r": 0.2749,
          "g": 0.2042,
          "b": 0.1184,
          "pos": 0.3865,
          "chrom": -0.2814
        },
        {
          "t": 63.333,
          "r": 0.2583,
          "g": 0.1955,
          "b": 0.1137,
          "pos": -0.4531,
          "chrom": 0.5884
        },
        {
          "t": 63.467,
          "r": 0.2081,
          "g": 0.1525,
          "b": 0.0712,
          "pos": 0.2417,
          "chrom": -0.445
        },
        {
          "t": 63.533,
          "r": 0.2132,
          "g": 0.1584,
          "b": 0.0749,
          "pos": 1.3588,
          "chrom": -1.5
        },
        {
          "t": 63.667,
          "r": 0.2954,
          "g": 0.2009,
          "b": 0.1361,
          "pos": -0.0099,
          "chrom": 0.0146
        }
      ],
      "hrTracks": {
        "pos_face_full": [
          {
            "t": 0.0,
            "bpm": 134.473
          },
          {
            "t": 5.0,
            "bpm": 137.549
          },
          {
            "t": 10.0,
            "bpm": 150.293
          },
          {
            "t": 15.0,
            "bpm": 121.289
          },
          {
            "t": 20.0,
            "bpm": 104.15
          },
          {
            "t": 25.0,
            "bpm": 105.908
          },
          {
            "t": 30.0,
            "bpm": 113.818
          },
          {
            "t": 35.0,
            "bpm": 113.818
          },
          {
            "t": 40.0,
            "bpm": 111.182
          }
        ],
        "chrom_face_full": [
          {
            "t": 0.0,
            "bpm": 99.756
          },
          {
            "t": 5.0,
            "bpm": 137.988
          },
          {
            "t": 10.0,
            "bpm": 137.549
          },
          {
            "t": 15.0,
            "bpm": 111.621
          },
          {
            "t": 20.0,
            "bpm": 89.209
          },
          {
            "t": 25.0,
            "bpm": 92.725
          },
          {
            "t": 30.0,
            "bpm": 113.379
          },
          {
            "t": 35.0,
            "bpm": 114.258
          },
          {
            "t": 40.0,
            "bpm": 118.652
          }
        ],
        "sqi_top_window": [
          {
            "t": 0.0,
            "bpm": 99.316
          },
          {
            "t": 5.0,
            "bpm": 94.043
          },
          {
            "t": 10.0,
            "bpm": 98.877
          },
          {
            "t": 15.0,
            "bpm": 102.832
          },
          {
            "t": 20.0,
            "bpm": 100.635
          },
          {
            "t": 25.0,
            "bpm": 99.756
          },
          {
            "t": 30.0,
            "bpm": 99.316
          },
          {
            "t": 35.0,
            "bpm": 94.043
          },
          {
            "t": 40.0,
            "bpm": 95.801
          }
        ],
        "trained_peak_selector_current": [
          {
            "t": 0.0,
            "bpm": 180.176
          },
          {
            "t": 5.0,
            "bpm": 179.297
          },
          {
            "t": 10.0,
            "bpm": 171.387
          },
          {
            "t": 15.0,
            "bpm": 175.781
          },
          {
            "t": 20.0,
            "bpm": 173.584
          },
          {
            "t": 25.0,
            "bpm": 181.494
          },
          {
            "t": 30.0,
            "bpm": 171.826
          },
          {
            "t": 35.0,
            "bpm": 173.584
          },
          {
            "t": 40.0,
            "bpm": 174.902
          }
        ],
        "oracle_window_peak": [
          {
            "t": 0.0,
            "bpm": 172.266
          },
          {
            "t": 5.0,
            "bpm": 174.463
          },
          {
            "t": 10.0,
            "bpm": 174.463
          },
          {
            "t": 15.0,
            "bpm": 175.781
          },
          {
            "t": 20.0,
            "bpm": 174.902
          },
          {
            "t": 25.0,
            "bpm": 174.023
          },
          {
            "t": 30.0,
            "bpm": 175.781
          },
          {
            "t": 35.0,
            "bpm": 174.902
          },
          {
            "t": 40.0,
            "bpm": 174.902
          }
        ]
      }
    },
    {
      "video": "3.mp4",
      "durationSec": 96.692,
      "label": {
        "bpm_min": 190.0,
        "bpm_max": 230.0,
        "bpm_target": 210.0
      },
      "waveform": [
        {
          "t": 0.0,
          "r": 0.8741,
          "g": 0.9537,
          "b": 1.0062,
          "pos": 0.0085,
          "chrom": -0.0016
        },
        {
          "t": 0.133,
          "r": 0.7209,
          "g": 0.8269,
          "b": 0.9018,
          "pos": 0.1489,
          "chrom": -0.0062
        },
        {
          "t": 0.333,
          "r": 0.2735,
          "g": 0.5284,
          "b": 0.7119,
          "pos": -0.0509,
          "chrom": -0.012
        },
        {
          "t": 0.467,
          "r": -0.1101,
          "g": 0.1899,
          "b": 0.3874,
          "pos": -0.3167,
          "chrom": 0.2211
        },
        {
          "t": 0.6,
          "r": -0.0089,
          "g": 0.2346,
          "b": 0.3729,
          "pos": -0.0294,
          "chrom": 0.1366
        },
        {
          "t": 0.8,
          "r": 0.1635,
          "g": 0.3739,
          "b": 0.4977,
          "pos": 0.5672,
          "chrom": -0.6284
        },
        {
          "t": 0.933,
          "r": 0.2445,
          "g": 0.2434,
          "b": 0.2593,
          "pos": -0.2519,
          "chrom": 0.3864
        },
        {
          "t": 1.067,
          "r": 0.1761,
          "g": 0.129,
          "b": 0.1535,
          "pos": -0.6809,
          "chrom": 0.544
        },
        {
          "t": 1.267,
          "r": 0.4232,
          "g": 0.3662,
          "b": 0.3224,
          "pos": 0.2536,
          "chrom": -0.1535
        },
        {
          "t": 1.4,
          "r": 0.6508,
          "g": 0.6598,
          "b": 0.6088,
          "pos": 0.7192,
          "chrom": -0.5027
        },
        {
          "t": 1.533,
          "r": 0.3555,
          "g": 0.4704,
          "b": 0.5546,
          "pos": -0.7312,
          "chrom": 0.6011
        },
        {
          "t": 1.733,
          "r": 0.5122,
          "g": 0.7198,
          "b": 0.8528,
          "pos": 0.4388,
          "chrom": -0.5522
        },
        {
          "t": 1.867,
          "r": 0.8161,
          "g": 0.8644,
          "b": 0.9069,
          "pos": 0.9331,
          "chrom": -0.7363
        },
        {
          "t": 2.0,
          "r": 0.6173,
          "g": 0.531,
          "b": 0.5566,
          "pos": -0.2783,
          "chrom": 0.3694
        },
        {
          "t": 2.2,
          "r": 0.4598,
          "g": 0.3231,
          "b": 0.3423,
          "pos": -0.5322,
          "chrom": 0.4108
        },
        {
          "t": 2.333,
          "r": 0.5299,
          "g": 0.3949,
          "b": 0.3921,
          "pos": 0.0061,
          "chrom": -0.0051
        },
        {
          "t": 2.467,
          "r": 0.8879,
          "g": 0.8284,
          "b": 0.8057,
          "pos": 0.528,
          "chrom": -0.4252
        },
        {
          "t": 2.667,
          "r": 0.5703,
          "g": 0.7084,
          "b": 0.7698,
          "pos": 0.4152,
          "chrom": -0.3873
        },
        {
          "t": 2.8,
          "r": 0.2204,
          "g": 0.4087,
          "b": 0.5364,
          "pos": -0.6564,
          "chrom": 0.5663
        },
        {
          "t": 3.0,
          "r": 0.4736,
          "g": 0.6172,
          "b": 0.6871,
          "pos": 0.2371,
          "chrom": -0.1742
        },
        {
          "t": 3.133,
          "r": 0.5739,
          "g": 0.6729,
          "b": 0.7282,
          "pos": 0.6283,
          "chrom": -0.6722
        },
        {
          "t": 3.267,
          "r": 0.8557,
          "g": 0.7731,
          "b": 0.7613,
          "pos": -0.0319,
          "chrom": 0.0715
        },
        {
          "t": 3.467,
          "r": 0.9427,
          "g": 0.8306,
          "b": 0.8212,
          "pos": -0.2525,
          "chrom": 0.2722
        },
        {
          "t": 3.6,
          "r": 0.9386,
          "g": 0.8793,
          "b": 0.9002,
          "pos": -0.7062,
          "chrom": 0.7827
        },
        {
          "t": 3.733,
          "r": 0.6006,
          "g": 0.7997,
          "b": 0.9303,
          "pos": 0.3598,
          "chrom": -0.5563
        },
        {
          "t": 3.933,
          "r": 0.2168,
          "g": 0.392,
          "b": 0.4987,
          "pos": 0.1501,
          "chrom": -0.0004
        },
        {
          "t": 4.067,
          "r": 0.0138,
          "g": 0.1855,
          "b": 0.338,
          "pos": 0.5609,
          "chrom": -0.547
        },
        {
          "t": 4.2,
          "r": 0.0153,
          "g": 0.0741,
          "b": 0.2631,
          "pos": -0.3788,
          "chrom": 0.3445
        },
        {
          "t": 4.4,
          "r": 0.1549,
          "g": 0.1878,
          "b": 0.3733,
          "pos": -0.5864,
          "chrom": 0.6127
        },
        {
          "t": 4.533,
          "r": 0.2804,
          "g": 0.4235,
          "b": 0.6168,
          "pos": 0.3766,
          "chrom": -0.3511
        },
        {
          "t": 4.667,
          "r": 0.2501,
          "g": 0.4659,
          "b": 0.6722,
          "pos": 0.8672,
          "chrom": -0.9704
        },
        {
          "t": 4.867,
          "r": 0.3053,
          "g": 0.3534,
          "b": 0.5062,
          "pos": -0.0563,
          "chrom": 0.1974
        },
        {
          "t": 5.0,
          "r": 0.2758,
          "g": 0.2452,
          "b": 0.3858,
          "pos": -0.8375,
          "chrom": 0.863
        },
        {
          "t": 5.133,
          "r": 0.1587,
          "g": 0.128,
          "b": 0.2679,
          "pos": -0.7665,
          "chrom": 0.6768
        },
        {
          "t": 5.333,
          "r": 0.1483,
          "g": 0.1465,
          "b": 0.222,
          "pos": 1.0385,
          "chrom": -1.081
        },
        {
          "t": 5.467,
          "r": 0.076,
          "g": -0.0816,
          "b": -0.0339,
          "pos": 0.1216,
          "chrom": -0.0268
        },
        {
          "t": 5.6,
          "r": -0.0484,
          "g": -0.2919,
          "b": -0.222,
          "pos": -0.1875,
          "chrom": 0.3282
        },
        {
          "t": 5.8,
          "r": -0.0881,
          "g": -0.2794,
          "b": -0.0653,
          "pos": -0.4505,
          "chrom": 0.2711
        },
        {
          "t": 5.933,
          "r": -0.2847,
          "g": -0.3917,
          "b": -0.1275,
          "pos": -0.184,
          "chrom": 0.0125
        },
        {
          "t": 6.067,
          "r": -0.4224,
          "g": -0.4895,
          "b": -0.3389,
          "pos": 0.8941,
          "chrom": -0.669
        },
        {
          "t": 6.267,
          "r": -0.4899,
          "g": -0.5296,
          "b": -0.4061,
          "pos": -0.5692,
          "chrom": 0.5974
        },
        {
          "t": 6.4,
          "r": -0.3586,
          "g": -0.3351,
          "b": -0.2123,
          "pos": 0.3072,
          "chrom": -0.3995
        },
        {
          "t": 6.533,
          "r": -0.2038,
          "g": -0.1206,
          "b": -0.0218,
          "pos": 0.762,
          "chrom": -0.7951
        },
        {
          "t": 6.733,
          "r": -0.1546,
          "g": -0.2576,
          "b": -0.2343,
          "pos": -1.1731,
          "chrom": 1.1726
        },
        {
          "t": 6.867,
          "r": -0.1305,
          "g": -0.284,
          "b": -0.3183,
          "pos": 0.154,
          "chrom": -0.1702
        },
        {
          "t": 7.0,
          "r": -0.2582,
          "g": -0.5084,
          "b": -0.5801,
          "pos": 1.0812,
          "chrom": -1.1133
        },
        {
          "t": 7.2,
          "r": -0.4084,
          "g": -0.9212,
          "b": -0.9808,
          "pos": 0.7705,
          "chrom": -0.729
        },
        {
          "t": 7.333,
          "r": -0.6788,
          "g": -1.4089,
          "b": -1.4056,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 7.467,
          "r": -0.0553,
          "g": -0.5622,
          "b": -0.4423,
          "pos": -1.1182,
          "chrom": 1.0876
        },
        {
          "t": 7.667,
          "r": 0.2838,
          "g": 0.0409,
          "b": 0.1715,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 7.8,
          "r": -0.2527,
          "g": -1.0177,
          "b": -1.0031,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 7.933,
          "r": -0.7267,
          "g": -1.5,
          "b": -1.5,
          "pos": -0.98,
          "chrom": 1.2295
        },
        {
          "t": 8.133,
          "r": -0.4489,
          "g": -1.1823,
          "b": -1.3276,
          "pos": -1.0367,
          "chrom": 0.9697
        },
        {
          "t": 8.267,
          "r": 0.0796,
          "g": -0.4658,
          "b": -0.623,
          "pos": -0.314,
          "chrom": 0.3255
        },
        {
          "t": 8.4,
          "r": 0.7428,
          "g": 0.4982,
          "b": 0.3836,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 8.6,
          "r": 0.8158,
          "g": 0.6285,
          "b": 0.4838,
          "pos": -0.5332,
          "chrom": 0.5714
        },
        {
          "t": 8.733,
          "r": 1.0236,
          "g": 0.8748,
          "b": 0.74,
          "pos": 0.0495,
          "chrom": -0.0787
        },
        {
          "t": 8.933,
          "r": 0.9445,
          "g": 0.7055,
          "b": 0.5944,
          "pos": -0.2338,
          "chrom": 0.2862
        },
        {
          "t": 9.067,
          "r": 0.9216,
          "g": 0.6309,
          "b": 0.5757,
          "pos": -1.2059,
          "chrom": 1.2758
        },
        {
          "t": 9.2,
          "r": 1.245,
          "g": 1.2306,
          "b": 1.2343,
          "pos": 1.4451,
          "chrom": -1.5
        },
        {
          "t": 9.4,
          "r": 1.4333,
          "g": 1.3257,
          "b": 1.2703,
          "pos": -0.0252,
          "chrom": 0.0934
        },
        {
          "t": 9.533,
          "r": 1.1925,
          "g": 0.9828,
          "b": 0.8625,
          "pos": -0.2093,
          "chrom": 0.3823
        },
        {
          "t": 9.667,
          "r": 1.0521,
          "g": 0.8821,
          "b": 0.7864,
          "pos": -0.2417,
          "chrom": 0.2059
        },
        {
          "t": 9.867,
          "r": 0.9751,
          "g": 0.8186,
          "b": 0.7384,
          "pos": 0.2934,
          "chrom": -0.2775
        },
        {
          "t": 10.0,
          "r": 0.9148,
          "g": 0.7915,
          "b": 0.7596,
          "pos": -0.145,
          "chrom": 0.0772
        },
        {
          "t": 10.133,
          "r": 0.9847,
          "g": 0.9118,
          "b": 0.8795,
          "pos": -0.3053,
          "chrom": 0.2723
        },
        {
          "t": 10.333,
          "r": 1.0305,
          "g": 1.0311,
          "b": 0.9432,
          "pos": 0.294,
          "chrom": -0.2106
        },
        {
          "t": 10.467,
          "r": 1.0023,
          "g": 1.0041,
          "b": 0.897,
          "pos": -0.2939,
          "chrom": 0.2805
        },
        {
          "t": 10.6,
          "r": 0.9447,
          "g": 0.9562,
          "b": 0.8259,
          "pos": 0.2601,
          "chrom": -0.32
        },
        {
          "t": 10.8,
          "r": 0.7217,
          "g": 0.5324,
          "b": 0.3324,
          "pos": -0.2361,
          "chrom": 0.2647
        },
        {
          "t": 10.933,
          "r": 0.5682,
          "g": 0.2817,
          "b": 0.0463,
          "pos": -0.094,
          "chrom": 0.194
        },
        {
          "t": 11.067,
          "r": 0.3609,
          "g": 0.0269,
          "b": -0.1715,
          "pos": -0.0358,
          "chrom": 0.0118
        },
        {
          "t": 11.267,
          "r": 0.0247,
          "g": -0.3366,
          "b": -0.5079,
          "pos": 0.3099,
          "chrom": -0.3575
        },
        {
          "t": 11.4,
          "r": 0.0197,
          "g": -0.3906,
          "b": -0.5598,
          "pos": -0.4509,
          "chrom": 0.4497
        },
        {
          "t": 11.533,
          "r": -0.0854,
          "g": -0.4446,
          "b": -0.6255,
          "pos": -0.4231,
          "chrom": 0.4902
        },
        {
          "t": 11.733,
          "r": -0.5351,
          "g": -0.6621,
          "b": -0.8266,
          "pos": 0.8047,
          "chrom": -0.8352
        },
        {
          "t": 11.867,
          "r": -0.7364,
          "g": -0.8336,
          "b": -0.9787,
          "pos": -0.5259,
          "chrom": 0.4776
        },
        {
          "t": 12.0,
          "r": -0.333,
          "g": -0.3921,
          "b": -0.5458,
          "pos": -0.1076,
          "chrom": 0.1729
        },
        {
          "t": 12.2,
          "r": -0.4464,
          "g": -0.3614,
          "b": -0.4425,
          "pos": -0.0307,
          "chrom": 0.0523
        },
        {
          "t": 12.333,
          "r": -0.5715,
          "g": -0.4143,
          "b": -0.48,
          "pos": 0.1547,
          "chrom": -0.1492
        },
        {
          "t": 12.467,
          "r": -0.835,
          "g": -0.6586,
          "b": -0.7348,
          "pos": -0.1181,
          "chrom": 0.0476
        },
        {
          "t": 12.667,
          "r": -0.6704,
          "g": -0.6246,
          "b": -0.7675,
          "pos": -0.228,
          "chrom": 0.1938
        },
        {
          "t": 12.8,
          "r": -0.5418,
          "g": -0.5879,
          "b": -0.7918,
          "pos": 1.0735,
          "chrom": -0.9521
        },
        {
          "t": 12.933,
          "r": -0.324,
          "g": -0.5534,
          "b": -0.7268,
          "pos": -0.292,
          "chrom": 0.3597
        },
        {
          "t": 13.133,
          "r": 0.0681,
          "g": -0.219,
          "b": -0.293,
          "pos": -0.0556,
          "chrom": -0.0237
        },
        {
          "t": 13.267,
          "r": 0.141,
          "g": -0.1486,
          "b": -0.2084,
          "pos": 0.3966,
          "chrom": -0.449
        },
        {
          "t": 13.4,
          "r": -0.167,
          "g": -0.4839,
          "b": -0.5825,
          "pos": 0.3874,
          "chrom": -0.3111
        },
        {
          "t": 13.6,
          "r": -0.4587,
          "g": -0.7927,
          "b": -0.9483,
          "pos": -0.5455,
          "chrom": 0.5647
        },
        {
          "t": 13.733,
          "r": -0.4808,
          "g": -0.6909,
          "b": -0.8778,
          "pos": 0.1583,
          "chrom": -0.1718
        },
        {
          "t": 13.867,
          "r": -0.1163,
          "g": -0.2979,
          "b": -0.5031,
          "pos": 0.1751,
          "chrom": -0.2113
        },
        {
          "t": 14.067,
          "r": 0.0712,
          "g": -0.1174,
          "b": -0.3126,
          "pos": -0.3636,
          "chrom": 0.4007
        },
        {
          "t": 14.2,
          "r": 0.1926,
          "g": 0.0193,
          "b": -0.1489,
          "pos": 0.3887,
          "chrom": -0.4153
        },
        {
          "t": 14.4,
          "r": 0.3482,
          "g": -0.0135,
          "b": -0.1948,
          "pos": -0.0833,
          "chrom": 0.1301
        },
        {
          "t": 14.533,
          "r": 0.29,
          "g": -0.1712,
          "b": -0.3553,
          "pos": -1.1283,
          "chrom": 1.101
        },
        {
          "t": 14.667,
          "r": 0.0376,
          "g": -0.3781,
          "b": -0.6039,
          "pos": 0.2708,
          "chrom": -0.2914
        },
        {
          "t": 14.867,
          "r": -0.2209,
          "g": -0.6224,
          "b": -0.8854,
          "pos": 0.5894,
          "chrom": -0.5358
        },
        {
          "t": 15.0,
          "r": -0.105,
          "g": -0.5414,
          "b": -0.7789,
          "pos": -0.3808,
          "chrom": 0.3635
        },
        {
          "t": 15.133,
          "r": -0.1666,
          "g": -0.5938,
          "b": -0.827,
          "pos": -0.4189,
          "chrom": 0.3874
        },
        {
          "t": 15.333,
          "r": -0.1344,
          "g": -0.5576,
          "b": -0.7809,
          "pos": 0.1803,
          "chrom": -0.1757
        },
        {
          "t": 15.467,
          "r": -0.1383,
          "g": -0.5837,
          "b": -0.7997,
          "pos": 0.0552,
          "chrom": -0.0247
        },
        {
          "t": 15.6,
          "r": 0.129,
          "g": -0.3268,
          "b": -0.527,
          "pos": 0.027,
          "chrom": -0.0258
        },
        {
          "t": 15.8,
          "r": 0.1918,
          "g": -0.2539,
          "b": -0.4374,
          "pos": -0.0389,
          "chrom": 0.0434
        },
        {
          "t": 15.933,
          "r": 0.1934,
          "g": -0.2508,
          "b": -0.4159,
          "pos": -0.3307,
          "chrom": 0.328
        },
        {
          "t": 16.067,
          "r": 0.175,
          "g": -0.2529,
          "b": -0.416,
          "pos": 0.3302,
          "chrom": -0.3393
        },
        {
          "t": 16.267,
          "r": 0.1688,
          "g": -0.3379,
          "b": -0.5,
          "pos": -0.1526,
          "chrom": 0.1667
        },
        {
          "t": 16.4,
          "r": -0.0691,
          "g": -0.6112,
          "b": -0.7746,
          "pos": -0.5104,
          "chrom": 0.4914
        },
        {
          "t": 16.533,
          "r": -0.1086,
          "g": -0.6435,
          "b": -0.8139,
          "pos": 0.0127,
          "chrom": -0.0086
        },
        {
          "t": 16.733,
          "r": -0.088,
          "g": -0.6009,
          "b": -0.7813,
          "pos": 0.2373,
          "chrom": -0.2204
        },
        {
          "t": 16.867,
          "r": 0.0104,
          "g": -0.5404,
          "b": -0.6985,
          "pos": -0.4266,
          "chrom": 0.3819
        },
        {
          "t": 17.0,
          "r": 0.066,
          "g": -0.4892,
          "b": -0.6651,
          "pos": 0.4109,
          "chrom": -0.3501
        },
        {
          "t": 17.2,
          "r": 0.0771,
          "g": -0.5184,
          "b": -0.6566,
          "pos": -0.0701,
          "chrom": 0.0427
        },
        {
          "t": 17.333,
          "r": 0.0931,
          "g": -0.5116,
          "b": -0.6484,
          "pos": 0.0985,
          "chrom": -0.0938
        },
        {
          "t": 17.467,
          "r": 0.1771,
          "g": -0.4535,
          "b": -0.5923,
          "pos": -0.2492,
          "chrom": 0.2626
        },
        {
          "t": 17.667,
          "r": 0.1226,
          "g": -0.4884,
          "b": -0.6347,
          "pos": 0.1829,
          "chrom": -0.1619
        },
        {
          "t": 17.8,
          "r": 0.1003,
          "g": -0.4874,
          "b": -0.6448,
          "pos": 0.8402,
          "chrom": -0.8378
        },
        {
          "t": 17.933,
          "r": 0.1177,
          "g": -0.4621,
          "b": -0.6136,
          "pos": -0.2487,
          "chrom": 0.1696
        },
        {
          "t": 18.133,
          "r": 0.2504,
          "g": -0.2716,
          "b": -0.447,
          "pos": -1.4433,
          "chrom": 1.4733
        },
        {
          "t": 18.267,
          "r": 0.5702,
          "g": 0.3677,
          "b": 0.1803,
          "pos": 0.6946,
          "chrom": -0.5445
        },
        {
          "t": 18.4,
          "r": 1.0522,
          "g": 1.0459,
          "b": 0.9544,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 18.6,
          "r": 1.4542,
          "g": 1.3541,
          "b": 1.2945,
          "pos": -0.8939,
          "chrom": 0.8245
        },
        {
          "t": 18.733,
          "r": 1.4317,
          "g": 1.2576,
          "b": 1.1283,
          "pos": -0.4378,
          "chrom": 0.5417
        },
        {
          "t": 18.867,
          "r": 1.3869,
          "g": 1.1716,
          "b": 1.024,
          "pos": -0.0829,
          "chrom": 0.0638
        },
        {
          "t": 19.067,
          "r": 1.3138,
          "g": 1.0272,
          "b": 0.8042,
          "pos": 0.7884,
          "chrom": -0.7224
        },
        {
          "t": 19.2,
          "r": 1.1323,
          "g": 0.7916,
          "b": 0.5563,
          "pos": -0.0378,
          "chrom": 0.062
        },
        {
          "t": 19.333,
          "r": 0.8939,
          "g": 0.5521,
          "b": 0.3473,
          "pos": -0.6956,
          "chrom": 0.655
        },
        {
          "t": 19.533,
          "r": 0.4494,
          "g": 0.1972,
          "b": -0.0048,
          "pos": 0.2503,
          "chrom": -0.25
        },
        {
          "t": 19.667,
          "r": 0.2656,
          "g": 0.0372,
          "b": -0.1758,
          "pos": 0.3065,
          "chrom": -0.2886
        },
        {
          "t": 19.8,
          "r": 0.411,
          "g": 0.1763,
          "b": -0.0302,
          "pos": 0.0993,
          "chrom": -0.0997
        },
        {
          "t": 20.0,
          "r": 0.3939,
          "g": 0.1509,
          "b": -0.0313,
          "pos": -0.0846,
          "chrom": 0.1034
        },
        {
          "t": 20.133,
          "r": 0.5769,
          "g": 0.3367,
          "b": 0.1868,
          "pos": -0.3273,
          "chrom": 0.3044
        },
        {
          "t": 20.333,
          "r": 0.8505,
          "g": 0.6713,
          "b": 0.5544,
          "pos": 0.3583,
          "chrom": -0.3529
        },
        {
          "t": 20.467,
          "r": 0.8566,
          "g": 0.6801,
          "b": 0.5586,
          "pos": 0.2571,
          "chrom": -0.2178
        },
        {
          "t": 20.6,
          "r": 0.4758,
          "g": 0.307,
          "b": 0.1763,
          "pos": -0.1104,
          "chrom": 0.0914
        },
        {
          "t": 20.8,
          "r": -0.455,
          "g": -0.5852,
          "b": -0.7672,
          "pos": -0.0944,
          "chrom": 0.1283
        },
        {
          "t": 20.933,
          "r": -0.9759,
          "g": -1.0361,
          "b": -1.2482,
          "pos": 0.3737,
          "chrom": -0.3274
        },
        {
          "t": 21.067,
          "r": -0.9538,
          "g": -1.0329,
          "b": -1.246,
          "pos": -0.1599,
          "chrom": 0.1205
        },
        {
          "t": 21.267,
          "r": -1.1325,
          "g": -1.1985,
          "b": -1.4287,
          "pos": 0.0263,
          "chrom": -0.0455
        },
        {
          "t": 21.4,
          "r": -1.0541,
          "g": -1.127,
          "b": -1.3522,
          "pos": 0.2026,
          "chrom": -0.1745
        },
        {
          "t": 21.533,
          "r": -0.6959,
          "g": -0.8091,
          "b": -1.009,
          "pos": -0.1018,
          "chrom": 0.1471
        },
        {
          "t": 21.733,
          "r": -0.2414,
          "g": -0.317,
          "b": -0.4435,
          "pos": -0.0067,
          "chrom": -0.0074
        },
        {
          "t": 21.867,
          "r": -0.1319,
          "g": -0.1707,
          "b": -0.2768,
          "pos": 0.0368,
          "chrom": -0.0262
        },
        {
          "t": 22.0,
          "r": -0.097,
          "g": -0.0647,
          "b": -0.1474,
          "pos": 0.1884,
          "chrom": -0.2573
        },
        {
          "t": 22.2,
          "r": -0.1692,
          "g": -0.1565,
          "b": -0.2568,
          "pos": -0.4008,
          "chrom": 0.4584
        },
        {
          "t": 22.333,
          "r": -0.0684,
          "g": -0.0197,
          "b": -0.1143,
          "pos": 0.3486,
          "chrom": -0.241
        },
        {
          "t": 22.467,
          "r": 0.5449,
          "g": 0.611,
          "b": 0.5913,
          "pos": 0.6589,
          "chrom": -0.7595
        },
        {
          "t": 22.667,
          "r": 0.9714,
          "g": 0.9428,
          "b": 0.9028,
          "pos": -0.6148,
          "chrom": 0.6838
        },
        {
          "t": 22.8,
          "r": 0.9945,
          "g": 1.0373,
          "b": 1.0151,
          "pos": -0.3817,
          "chrom": 0.284
        },
        {
          "t": 22.933,
          "r": 0.9323,
          "g": 1.0259,
          "b": 0.9599,
          "pos": 0.2854,
          "chrom": -0.284
        },
        {
          "t": 23.133,
          "r": 0.7783,
          "g": 0.8345,
          "b": 0.7138,
          "pos": 0.1926,
          "chrom": -0.106
        },
        {
          "t": 23.267,
          "r": 0.6755,
          "g": 0.7418,
          "b": 0.67,
          "pos": 0.066,
          "chrom": -0.1449
        },
        {
          "t": 23.4,
          "r": 0.5333,
          "g": 0.4914,
          "b": 0.4331,
          "pos": -0.659,
          "chrom": 0.6471
        },
        {
          "t": 23.6,
          "r": 0.3257,
          "g": 0.2735,
          "b": 0.1944,
          "pos": 0.321,
          "chrom": -0.3096
        },
        {
          "t": 23.733,
          "r": 0.3186,
          "g": 0.2532,
          "b": 0.1359,
          "pos": 0.1906,
          "chrom": -0.2556
        },
        {
          "t": 23.867,
          "r": 0.1636,
          "g": 0.0959,
          "b": -0.084,
          "pos": 0.5126,
          "chrom": -0.492
        },
        {
          "t": 24.067,
          "r": 0.3421,
          "g": 0.2538,
          "b": 0.0692,
          "pos": -0.9692,
          "chrom": 1.021
        },
        {
          "t": 24.2,
          "r": 0.7255,
          "g": 0.773,
          "b": 0.6447,
          "pos": 0.4868,
          "chrom": -0.4355
        },
        {
          "t": 24.333,
          "r": 0.9554,
          "g": 1.0514,
          "b": 1.0128,
          "pos": 0.8963,
          "chrom": -1.0046
        },
        {
          "t": 24.533,
          "r": 1.0362,
          "g": 0.8128,
          "b": 0.7725,
          "pos": -0.9935,
          "chrom": 1.0102
        },
        {
          "t": 24.667,
          "r": 0.9944,
          "g": 0.6999,
          "b": 0.616,
          "pos": 0.1832,
          "chrom": -0.2277
        },
        {
          "t": 24.8,
          "r": 0.7516,
          "g": 0.3335,
          "b": 0.1755,
          "pos": 0.3835,
          "chrom": -0.3417
        },
        {
          "t": 25.0,
          "r": 0.5583,
          "g": 0.059,
          "b": -0.1013,
          "pos": -0.485,
          "chrom": 0.6245
        },
        {
          "t": 25.133,
          "r": 0.5712,
          "g": 0.141,
          "b": 0.0421,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 25.267,
          "r": 0.623,
          "g": 0.729,
          "b": 0.8099,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 25.467,
          "r": 0.4699,
          "g": 0.6102,
          "b": 0.66,
          "pos": -1.0185,
          "chrom": 1.0657
        },
        {
          "t": 25.6,
          "r": 0.1972,
          "g": 0.4378,
          "b": 0.4714,
          "pos": -0.7786,
          "chrom": 0.7549
        },
        {
          "t": 25.8,
          "r": 0.0513,
          "g": 0.3843,
          "b": 0.3892,
          "pos": 0.9449,
          "chrom": -0.8646
        },
        {
          "t": 25.933,
          "r": 0.1818,
          "g": 0.451,
          "b": 0.5138,
          "pos": -0.3693,
          "chrom": 0.3118
        },
        {
          "t": 26.067,
          "r": 0.3924,
          "g": 0.5863,
          "b": 0.6648,
          "pos": -0.4841,
          "chrom": 0.4491
        },
        {
          "t": 26.267,
          "r": 0.4444,
          "g": 0.5809,
          "b": 0.6677,
          "pos": 0.0423,
          "chrom": -0.1222
        },
        {
          "t": 26.4,
          "r": 0.3094,
          "g": 0.4034,
          "b": 0.4796,
          "pos": 0.178,
          "chrom": -0.1755
        },
        {
          "t": 26.533,
          "r": -0.1157,
          "g": -0.0147,
          "b": 0.0332,
          "pos": 0.6909,
          "chrom": -0.4151
        },
        {
          "t": 26.733,
          "r": -0.8067,
          "g": -0.5245,
          "b": -0.2418,
          "pos": -0.7607,
          "chrom": 0.6009
        },
        {
          "t": 26.867,
          "r": -0.5916,
          "g": -0.1841,
          "b": 0.1901,
          "pos": 0.0777,
          "chrom": -0.3484
        },
        {
          "t": 27.0,
          "r": -0.29,
          "g": 0.0633,
          "b": 0.3769,
          "pos": 0.3964,
          "chrom": -0.2316
        },
        {
          "t": 27.2,
          "r": -0.3916,
          "g": 0.0395,
          "b": 0.3938,
          "pos": -0.0844,
          "chrom": 0.1058
        },
        {
          "t": 27.333,
          "r": -0.3918,
          "g": 0.0565,
          "b": 0.4001,
          "pos": -0.0123,
          "chrom": 0.026
        },
        {
          "t": 27.467,
          "r": -0.4106,
          "g": 0.0522,
          "b": 0.3934,
          "pos": -0.3046,
          "chrom": 0.0876
        },
        {
          "t": 27.667,
          "r": 0.0535,
          "g": 0.3722,
          "b": 0.5769,
          "pos": 0.3671,
          "chrom": -0.1737
        },
        {
          "t": 27.8,
          "r": 0.1783,
          "g": 0.4427,
          "b": 0.6269,
          "pos": 0.1856,
          "chrom": -0.1241
        },
        {
          "t": 27.933,
          "r": 0.2654,
          "g": 0.5142,
          "b": 0.6833,
          "pos": 0.0018,
          "chrom": -0.0069
        },
        {
          "t": 28.133,
          "r": 0.4549,
          "g": 0.6653,
          "b": 0.8138,
          "pos": -0.261,
          "chrom": 0.1618
        },
        {
          "t": 28.267,
          "r": 0.5596,
          "g": 0.7149,
          "b": 0.7661,
          "pos": 0.2871,
          "chrom": -0.1946
        },
        {
          "t": 28.4,
          "r": 0.4164,
          "g": 0.5631,
          "b": 0.6072,
          "pos": 0.1476,
          "chrom": -0.1308
        },
        {
          "t": 28.6,
          "r": -0.1831,
          "g": -0.041,
          "b": 0.0158,
          "pos": 0.0121,
          "chrom": -0.0317
        },
        {
          "t": 28.733,
          "r": -0.3247,
          "g": -0.1957,
          "b": -0.1137,
          "pos": -0.1005,
          "chrom": 0.0737
        },
        {
          "t": 28.867,
          "r": 0.0574,
          "g": 0.0904,
          "b": 0.1437,
          "pos": -0.221,
          "chrom": 0.2673
        },
        {
          "t": 29.067,
          "r": 0.5284,
          "g": 0.5196,
          "b": 0.5183,
          "pos": 0.1584,
          "chrom": -0.2302
        },
        {
          "t": 29.2,
          "r": 0.8302,
          "g": 0.7243,
          "b": 0.6406,
          "pos": 0.2516,
          "chrom": -0.266
        },
        {
          "t": 29.333,
          "r": 0.9044,
          "g": 0.7256,
          "b": 0.577,
          "pos": 0.2519,
          "chrom": -0.1308
        },
        {
          "t": 29.533,
          "r": 0.8238,
          "g": 0.6379,
          "b": 0.5167,
          "pos": -0.4494,
          "chrom": 0.4249
        },
        {
          "t": 29.667,
          "r": 0.8087,
          "g": 0.6632,
          "b": 0.5818,
          "pos": -0.2361,
          "chrom": 0.1201
        },
        {
          "t": 29.8,
          "r": 0.7889,
          "g": 0.6459,
          "b": 0.5336,
          "pos": 0.5042,
          "chrom": -0.47
        },
        {
          "t": 30.0,
          "r": 0.6542,
          "g": 0.4029,
          "b": 0.2553,
          "pos": -0.2989,
          "chrom": 0.2883
        },
        {
          "t": 30.133,
          "r": 0.4185,
          "g": 0.0805,
          "b": -0.1282,
          "pos": -0.2741,
          "chrom": 0.3342
        },
        {
          "t": 30.267,
          "r": 0.1949,
          "g": -0.1614,
          "b": -0.3709,
          "pos": 0.162,
          "chrom": -0.1909
        },
        {
          "t": 30.467,
          "r": 0.0085,
          "g": -0.3648,
          "b": -0.5496,
          "pos": 0.3476,
          "chrom": -0.3472
        },
        {
          "t": 30.6,
          "r": 0.0384,
          "g": -0.3442,
          "b": -0.4878,
          "pos": -0.4789,
          "chrom": 0.5479
        },
        {
          "t": 30.733,
          "r": -0.1538,
          "g": -0.3875,
          "b": -0.4476,
          "pos": -0.302,
          "chrom": 0.2763
        },
        {
          "t": 30.933,
          "r": -0.468,
          "g": -0.5369,
          "b": -0.5593,
          "pos": 0.5114,
          "chrom": -0.4887
        },
        {
          "t": 31.067,
          "r": -0.5842,
          "g": -0.6571,
          "b": -0.6693,
          "pos": -0.0997,
          "chrom": 0.0803
        },
        {
          "t": 31.2,
          "r": -0.3166,
          "g": -0.4415,
          "b": -0.4787,
          "pos": -0.2394,
          "chrom": 0.2716
        },
        {
          "t": 31.4,
          "r": -0.2882,
          "g": -0.4264,
          "b": -0.4735,
          "pos": -0.0124,
          "chrom": 0.0045
        },
        {
          "t": 31.533,
          "r": -0.2375,
          "g": -0.3909,
          "b": -0.4471,
          "pos": -0.0606,
          "chrom": 0.0331
        },
        {
          "t": 31.733,
          "r": -0.1803,
          "g": -0.3808,
          "b": -0.4828,
          "pos": 0.1184,
          "chrom": -0.1017
        },
        {
          "t": 31.867,
          "r": 0.0268,
          "g": -0.2709,
          "b": -0.4036,
          "pos": -0.3561,
          "chrom": 0.3558
        },
        {
          "t": 32.0,
          "r": 0.0538,
          "g": -0.246,
          "b": -0.4103,
          "pos": 0.4051,
          "chrom": -0.4211
        },
        {
          "t": 32.2,
          "r": 0.1046,
          "g": -0.223,
          "b": -0.3977,
          "pos": -0.1954,
          "chrom": 0.2024
        },
        {
          "t": 32.333,
          "r": 0.0531,
          "g": -0.1923,
          "b": -0.3171,
          "pos": -0.6839,
          "chrom": 0.6611
        },
        {
          "t": 32.467,
          "r": 0.0327,
          "g": -0.0994,
          "b": -0.2052,
          "pos": 0.3047,
          "chrom": -0.1912
        },
        {
          "t": 32.667,
          "r": -0.385,
          "g": -0.332,
          "b": -0.3245,
          "pos": 0.356,
          "chrom": -0.46
        },
        {
          "t": 32.8,
          "r": -0.7741,
          "g": -0.7259,
          "b": -0.7217,
          "pos": -0.3239,
          "chrom": 0.2841
        },
        {
          "t": 32.933,
          "r": -0.9208,
          "g": -0.8987,
          "b": -0.9004,
          "pos": -0.9874,
          "chrom": 0.9631
        },
        {
          "t": 33.133,
          "r": -0.1707,
          "g": -0.1236,
          "b": -0.1847,
          "pos": 0.6911,
          "chrom": -0.5246
        },
        {
          "t": 33.267,
          "r": 0.1636,
          "g": 0.2517,
          "b": 0.2213,
          "pos": 1.1747,
          "chrom": -1.1624
        },
        {
          "t": 33.4,
          "r": 0.0797,
          "g": 0.1111,
          "b": 0.0954,
          "pos": -0.4236,
          "chrom": 0.2457
        },
        {
          "t": 33.6,
          "r": 0.2514,
          "g": 0.1866,
          "b": 0.0757,
          "pos": -0.6621,
          "chrom": 0.685
        },
        {
          "t": 33.733,
          "r": 0.3086,
          "g": 0.267,
          "b": 0.0668,
          "pos": 0.6069,
          "chrom": -0.26
        },
        {
          "t": 33.867,
          "r": 0.4788,
          "g": 0.6123,
          "b": 0.5404,
          "pos": 0.9095,
          "chrom": -0.9084
        },
        {
          "t": 34.067,
          "r": 0.598,
          "g": 0.8237,
          "b": 0.9026,
          "pos": -0.4972,
          "chrom": 0.3606
        },
        {
          "t": 34.2,
          "r": 0.5735,
          "g": 0.8001,
          "b": 0.8813,
          "pos": -0.2273,
          "chrom": 0.2848
        },
        {
          "t": 34.333,
          "r": 0.5614,
          "g": 0.7903,
          "b": 0.8677,
          "pos": -0.0877,
          "chrom": 0.11
        },
        {
          "t": 34.533,
          "r": 0.4119,
          "g": 0.5937,
          "b": 0.6014,
          "pos": 0.0062,
          "chrom": -0.009
        },
        {
          "t": 34.667,
          "r": 0.3147,
          "g": 0.469,
          "b": 0.4285,
          "pos": 0.7782,
          "chrom": -0.6899
        },
        {
          "t": 34.8,
          "r": 0.6059,
          "g": 0.647,
          "b": 0.6342,
          "pos": -0.4081,
          "chrom": 0.3605
        },
        {
          "t": 35.0,
          "r": 0.6928,
          "g": 0.7108,
          "b": 0.6958,
          "pos": 0.1175,
          "chrom": -0.109
        },
        {
          "t": 35.133,
          "r": 0.702,
          "g": 0.7251,
          "b": 0.7074,
          "pos": 0.2815,
          "chrom": -0.2256
        },
        {
          "t": 35.267,
          "r": 0.7139,
          "g": 0.7437,
          "b": 0.7315,
          "pos": -0.0974,
          "chrom": 0.0956
        },
        {
          "t": 35.467,
          "r": 0.6379,
          "g": 0.7122,
          "b": 0.6744,
          "pos": 0.0541,
          "chrom": -0.058
        },
        {
          "t": 35.6,
          "r": 0.6157,
          "g": 0.7065,
          "b": 0.6464,
          "pos": 0.4276,
          "chrom": -0.4201
        },
        {
          "t": 35.733,
          "r": 0.5277,
          "g": 0.5944,
          "b": 0.5157,
          "pos": 0.0559,
          "chrom": -0.0449
        },
        {
          "t": 35.933,
          "r": 0.3112,
          "g": 0.348,
          "b": 0.2512,
          "pos": -0.476,
          "chrom": 0.4908
        },
        {
          "t": 36.067,
          "r": 0.2571,
          "g": 0.3149,
          "b": 0.2225,
          "pos": -0.1363,
          "chrom": 0.1043
        },
        {
          "t": 36.2,
          "r": 0.1951,
          "g": 0.272,
          "b": 0.1661,
          "pos": 0.9649,
          "chrom": -0.9339
        },
        {
          "t": 36.4,
          "r": 0.1212,
          "g": 0.0701,
          "b": -0.0036,
          "pos": -0.7231,
          "chrom": 0.6787
        },
        {
          "t": 36.533,
          "r": 0.0426,
          "g": -0.0302,
          "b": -0.1116,
          "pos": -0.6353,
          "chrom": 0.6843
        },
        {
          "t": 36.667,
          "r": 0.0691,
          "g": 0.0569,
          "b": 0.0059,
          "pos": 0.3457,
          "chrom": -0.317
        },
        {
          "t": 36.867,
          "r": -0.0551,
          "g": -0.0257,
          "b": -0.0286,
          "pos": 0.1621,
          "chrom": -0.2163
        },
        {
          "t": 37.0,
          "r": -0.1627,
          "g": -0.1564,
          "b": -0.1674,
          "pos": -0.1782,
          "chrom": 0.1782
        },
        {
          "t": 37.2,
          "r": -0.139,
          "g": -0.1724,
          "b": -0.1847,
          "pos": -0.1819,
          "chrom": 0.2061
        },
        {
          "t": 37.333,
          "r": -0.2296,
          "g": -0.2385,
          "b": -0.2509,
          "pos": 0.215,
          "chrom": -0.2168
        },
        {
          "t": 37.467,
          "r": -0.2975,
          "g": -0.3155,
          "b": -0.3197,
          "pos": -0.0353,
          "chrom": 0.0267
        },
        {
          "t": 37.667,
          "r": -0.4412,
          "g": -0.4386,
          "b": -0.4464,
          "pos": 0.296,
          "chrom": -0.2653
        },
        {
          "t": 37.8,
          "r": -0.4409,
          "g": -0.4542,
          "b": -0.4508,
          "pos": 0.1035,
          "chrom": -0.1407
        },
        {
          "t": 37.933,
          "r": -0.4308,
          "g": -0.4787,
          "b": -0.4946,
          "pos": -0.3844,
          "chrom": 0.3525
        },
        {
          "t": 38.133,
          "r": -0.4735,
          "g": -0.5419,
          "b": -0.6033,
          "pos": -0.0979,
          "chrom": 0.1553
        },
        {
          "t": 38.267,
          "r": -0.62,
          "g": -0.6004,
          "b": -0.6335,
          "pos": 0.8119,
          "chrom": -0.8801
        },
        {
          "t": 38.4,
          "r": -0.5612,
          "g": -0.6388,
          "b": -0.6869,
          "pos": -0.2399,
          "chrom": 0.24
        },
        {
          "t": 38.6,
          "r": -0.5437,
          "g": -0.6425,
          "b": -0.6981,
          "pos": -0.0965,
          "chrom": 0.1403
        },
        {
          "t": 38.733,
          "r": -0.5277,
          "g": -0.5883,
          "b": -0.6256,
          "pos": 0.4877,
          "chrom": -0.5477
        },
        {
          "t": 38.867,
          "r": -0.5393,
          "g": -0.6275,
          "b": -0.6855,
          "pos": 0.5335,
          "chrom": -0.5255
        },
        {
          "t": 39.067,
          "r": -0.5932,
          "g": -0.7197,
          "b": -0.7716,
          "pos": -0.6732,
          "chrom": 0.7031
        },
        {
          "t": 39.2,
          "r": -0.6689,
          "g": -0.7319,
          "b": -0.7816,
          "pos": -0.187,
          "chrom": 0.2002
        },
        {
          "t": 39.333,
          "r": -0.6346,
          "g": -0.6263,
          "b": -0.6776,
          "pos": 0.3543,
          "chrom": -0.4024
        },
        {
          "t": 39.533,
          "r": -0.5727,
          "g": -0.5799,
          "b": -0.6464,
          "pos": 0.3718,
          "chrom": -0.3932
        },
        {
          "t": 39.667,
          "r": -0.6039,
          "g": -0.7019,
          "b": -0.7695,
          "pos": -0.6062,
          "chrom": 0.711
        },
        {
          "t": 39.8,
          "r": -0.7313,
          "g": -0.7534,
          "b": -0.764,
          "pos": -0.0928,
          "chrom": 0.1883
        },
        {
          "t": 40.0,
          "r": -0.599,
          "g": -0.448,
          "b": -0.3137,
          "pos": 0.1314,
          "chrom": -0.2689
        },
        {
          "t": 40.133,
          "r": -0.4643,
          "g": -0.2323,
          "b": -0.0573,
          "pos": 0.5937,
          "chrom": -0.644
        },
        {
          "t": 40.267,
          "r": -0.1519,
          "g": -0.0215,
          "b": 0.0899,
          "pos": -0.2519,
          "chrom": 0.403
        },
        {
          "t": 40.467,
          "r": -0.0666,
          "g": 0.0542,
          "b": 0.1496,
          "pos": -0.3174,
          "chrom": 0.2761
        },
        {
          "t": 40.6,
          "r": -0.0917,
          "g": -0.008,
          "b": 0.0612,
          "pos": -0.1547,
          "chrom": 0.0418
        },
        {
          "t": 40.733,
          "r": -0.1738,
          "g": -0.1219,
          "b": -0.1182,
          "pos": 0.8175,
          "chrom": -0.7624
        },
        {
          "t": 40.933,
          "r": -0.1638,
          "g": -0.2455,
          "b": -0.2544,
          "pos": -0.2718,
          "chrom": 0.3735
        },
        {
          "t": 41.067,
          "r": -0.0311,
          "g": -0.1304,
          "b": -0.1004,
          "pos": -0.8981,
          "chrom": 0.7739
        },
        {
          "t": 41.2,
          "r": 0.1463,
          "g": 0.1373,
          "b": 0.1373,
          "pos": 0.3536,
          "chrom": -0.4231
        },
        {
          "t": 41.4,
          "r": 0.3636,
          "g": 0.3696,
          "b": 0.3115,
          "pos": 0.08,
          "chrom": -0.0526
        },
        {
          "t": 41.533,
          "r": 0.3809,
          "g": 0.3765,
          "b": 0.3014,
          "pos": -0.1322,
          "chrom": 0.1439
        },
        {
          "t": 41.667,
          "r": 0.4265,
          "g": 0.3952,
          "b": 0.3197,
          "pos": -0.0378,
          "chrom": 0.0358
        },
        {
          "t": 41.867,
          "r": 0.5862,
          "g": 0.5255,
          "b": 0.494,
          "pos": 0.1292,
          "chrom": -0.1626
        },
        {
          "t": 42.0,
          "r": 0.636,
          "g": 0.5705,
          "b": 0.5836,
          "pos": -0.3648,
          "chrom": 0.3604
        },
        {
          "t": 42.133,
          "r": 0.6006,
          "g": 0.6113,
          "b": 0.6597,
          "pos": -0.0726,
          "chrom": 0.1685
        },
        {
          "t": 42.333,
          "r": 0.3697,
          "g": 0.5786,
          "b": 0.715,
          "pos": 0.1938,
          "chrom": -0.245
        },
        {
          "t": 42.467,
          "r": 0.4146,
          "g": 0.6137,
          "b": 0.7332,
          "pos": -0.0584,
          "chrom": 0.0082
        },
        {
          "t": 42.6,
          "r": 0.5372,
          "g": 0.6621,
          "b": 0.7253,
          "pos": 0.0204,
          "chrom": -0.0193
        },
        {
          "t": 42.8,
          "r": 0.6506,
          "g": 0.6246,
          "b": 0.5984,
          "pos": -0.0816,
          "chrom": 0.1235
        },
        {
          "t": 42.933,
          "r": 0.6812,
          "g": 0.6033,
          "b": 0.5442,
          "pos": -0.0648,
          "chrom": 0.0762
        },
        {
          "t": 43.133,
          "r": 0.6852,
          "g": 0.6027,
          "b": 0.5442,
          "pos": 0.2123,
          "chrom": -0.2085
        },
        {
          "t": 43.267,
          "r": 0.6787,
          "g": 0.6196,
          "b": 0.5875,
          "pos": 0.0874,
          "chrom": -0.1129
        },
        {
          "t": 43.4,
          "r": 0.6223,
          "g": 0.5951,
          "b": 0.5882,
          "pos": -0.1331,
          "chrom": 0.0972
        },
        {
          "t": 43.6,
          "r": 0.5829,
          "g": 0.6102,
          "b": 0.6148,
          "pos": 0.0026,
          "chrom": 0.0847
        },
        {
          "t": 43.733,
          "r": 0.5042,
          "g": 0.5911,
          "b": 0.6267,
          "pos": 0.1481,
          "chrom": -0.0872
        },
        {
          "t": 43.867,
          "r": 0.4354,
          "g": 0.5639,
          "b": 0.6426,
          "pos": -0.0415,
          "chrom": -0.0609
        },
        {
          "t": 44.067,
          "r": -0.0563,
          "g": 0.0255,
          "b": 0.0711,
          "pos": 0.1614,
          "chrom": -0.1453
        },
        {
          "t": 44.2,
          "r": -0.511,
          "g": -0.4908,
          "b": -0.4645,
          "pos": -0.1591,
          "chrom": 0.2491
        },
        {
          "t": 44.333,
          "r": -0.7534,
          "g": -0.7293,
          "b": -0.6929,
          "pos": -0.1331,
          "chrom": 0.1764
        },
        {
          "t": 44.533,
          "r": -0.8908,
          "g": -0.8003,
          "b": -0.7123,
          "pos": 0.147,
          "chrom": -0.1939
        },
        {
          "t": 44.667,
          "r": -1.0498,
          "g": -0.9196,
          "b": -0.8061,
          "pos": 0.2113,
          "chrom": -0.2692
        },
        {
          "t": 44.8,
          "r": -1.0673,
          "g": -0.9179,
          "b": -0.8042,
          "pos": 0.1169,
          "chrom": -0.1199
        },
        {
          "t": 45.0,
          "r": -0.5667,
          "g": -0.4307,
          "b": -0.3286,
          "pos": -0.2988,
          "chrom": 0.4072
        },
        {
          "t": 45.133,
          "r": -0.1229,
          "g": 0.0931,
          "b": 0.2455,
          "pos": -0.1262,
          "chrom": 0.0239
        },
        {
          "t": 45.267,
          "r": 0.2593,
          "g": 0.5251,
          "b": 0.6548,
          "pos": 0.415,
          "chrom": -0.4727
        },
        {
          "t": 45.467,
          "r": 0.4871,
          "g": 0.702,
          "b": 0.7766,
          "pos": -0.0485,
          "chrom": 0.113
        },
        {
          "t": 45.6,
          "r": 0.4367,
          "g": 0.6392,
          "b": 0.7003,
          "pos": -0.1123,
          "chrom": 0.1413
        },
        {
          "t": 45.733,
          "r": 0.43,
          "g": 0.6346,
          "b": 0.7009,
          "pos": -0.103,
          "chrom": 0.0773
        },
        {
          "t": 45.933,
          "r": 0.4141,
          "g": 0.6346,
          "b": 0.7062,
          "pos": 0.0601,
          "chrom": -0.0681
        },
        {
          "t": 46.067,
          "r": 0.3852,
          "g": 0.6091,
          "b": 0.6808,
          "pos": 0.0446,
          "chrom": -0.0079
        },
        {
          "t": 46.2,
          "r": 0.3229,
          "g": 0.5557,
          "b": 0.639,
          "pos": 0.0121,
          "chrom": -0.0032
        },
        {
          "t": 46.4,
          "r": 0.3023,
          "g": 0.5223,
          "b": 0.6052,
          "pos": 0.0019,
          "chrom": -0.0183
        },
        {
          "t": 46.533,
          "r": 0.3327,
          "g": 0.5208,
          "b": 0.5901,
          "pos": -0.0382,
          "chrom": 0.0388
        },
        {
          "t": 46.667,
          "r": 0.3542,
          "g": 0.5114,
          "b": 0.5689,
          "pos": -0.0288,
          "chrom": 0.0575
        },
        {
          "t": 46.867,
          "r": 0.3028,
          "g": 0.4553,
          "b": 0.5228,
          "pos": 0.1676,
          "chrom": -0.1557
        },
        {
          "t": 47.0,
          "r": 0.2744,
          "g": 0.4176,
          "b": 0.5088,
          "pos": -0.0223,
          "chrom": -0.0048
        },
        {
          "t": 47.133,
          "r": 0.2173,
          "g": 0.3473,
          "b": 0.4361,
          "pos": -0.0313,
          "chrom": 0.0114
        },
        {
          "t": 47.333,
          "r": 0.154,
          "g": 0.2517,
          "b": 0.3258,
          "pos": -0.1003,
          "chrom": 0.1296
        },
        {
          "t": 47.467,
          "r": 0.1795,
          "g": 0.299,
          "b": 0.3803,
          "pos": 0.0791,
          "chrom": -0.071
        },
        {
          "t": 47.6,
          "r": 0.0852,
          "g": 0.2416,
          "b": 0.3293,
          "pos": 0.0612,
          "chrom": -0.0638
        },
        {
          "t": 47.8,
          "r": 0.0645,
          "g": 0.2668,
          "b": 0.3614,
          "pos": 0.0212,
          "chrom": -0.0198
        },
        {
          "t": 47.933,
          "r": 0.0395,
          "g": 0.262,
          "b": 0.3668,
          "pos": -0.0313,
          "chrom": 0.0247
        },
        {
          "t": 48.067,
          "r": 0.0697,
          "g": 0.3019,
          "b": 0.3993,
          "pos": 0.0744,
          "chrom": -0.0674
        },
        {
          "t": 48.267,
          "r": 0.0329,
          "g": 0.2601,
          "b": 0.3534,
          "pos": 0.0196,
          "chrom": 0.0017
        },
        {
          "t": 48.4,
          "r": -0.0182,
          "g": 0.2194,
          "b": 0.3253,
          "pos": -0.0119,
          "chrom": 0.0049
        },
        {
          "t": 48.6,
          "r": 0.0041,
          "g": 0.2465,
          "b": 0.354,
          "pos": 0.0284,
          "chrom": -0.0208
        },
        {
          "t": 48.733,
          "r": 0.0176,
          "g": 0.2627,
          "b": 0.3733,
          "pos": -0.0137,
          "chrom": 0.009
        },
        {
          "t": 48.867,
          "r": 0.031,
          "g": 0.2785,
          "b": 0.3828,
          "pos": 0.0842,
          "chrom": -0.08
        },
        {
          "t": 49.067,
          "r": -0.027,
          "g": 0.2151,
          "b": 0.317,
          "pos": -0.0699,
          "chrom": 0.0897
        },
        {
          "t": 49.2,
          "r": -0.0001,
          "g": 0.2436,
          "b": 0.3492,
          "pos": -0.0163,
          "chrom": 0.024
        },
        {
          "t": 49.333,
          "r": -0.0641,
          "g": 0.2007,
          "b": 0.3171,
          "pos": 0.0905,
          "chrom": -0.1125
        },
        {
          "t": 49.533,
          "r": -0.0578,
          "g": 0.1797,
          "b": 0.2785,
          "pos": -0.0438,
          "chrom": 0.0623
        },
        {
          "t": 49.667,
          "r": -0.0402,
          "g": 0.1662,
          "b": 0.246,
          "pos": -0.166,
          "chrom": 0.1803
        },
        {
          "t": 49.8,
          "r": 0.0551,
          "g": 0.232,
          "b": 0.2887,
          "pos": 0.1477,
          "chrom": -0.1672
        },
        {
          "t": 50.0,
          "r": 0.1062,
          "g": 0.1977,
          "b": 0.2284,
          "pos": -0.0926,
          "chrom": 0.0663
        },
        {
          "t": 50.133,
          "r": 0.1377,
          "g": 0.2088,
          "b": 0.2392,
          "pos": -0.157,
          "chrom": 0.1734
        },
        {
          "t": 50.267,
          "r": 0.1514,
          "g": 0.2341,
          "b": 0.2774,
          "pos": 0.0129,
          "chrom": 0.105
        },
        {
          "t": 50.467,
          "r": -0.0093,
          "g": 0.2156,
          "b": 0.343,
          "pos": 0.1555,
          "chrom": -0.2562
        },
        {
          "t": 50.6,
          "r": -0.1749,
          "g": 0.0607,
          "b": 0.1895,
          "pos": -0.4252,
          "chrom": 0.2823
        },
        {
          "t": 50.733,
          "r": -0.2962,
          "g": -0.0524,
          "b": -0.0022,
          "pos": 0.2838,
          "chrom": -0.2269
        },
        {
          "t": 50.933,
          "r": -0.3353,
          "g": -0.1308,
          "b": -0.154,
          "pos": -0.097,
          "chrom": 0.2173
        },
        {
          "t": 51.067,
          "r": -0.2686,
          "g": 0.0062,
          "b": 0.0297,
          "pos": -0.0555,
          "chrom": -0.0102
        },
        {
          "t": 51.2,
          "r": -0.1994,
          "g": 0.1174,
          "b": 0.1591,
          "pos": -0.0305,
          "chrom": -0.0829
        },
        {
          "t": 51.4,
          "r": -0.2474,
          "g": 0.0552,
          "b": 0.0508,
          "pos": 0.137,
          "chrom": -0.0467
        },
        {
          "t": 51.533,
          "r": -0.2385,
          "g": 0.0613,
          "b": 0.0602,
          "pos": 0.0234,
          "chrom": 0.0169
        },
        {
          "t": 51.667,
          "r": -0.2587,
          "g": 0.0405,
          "b": 0.0447,
          "pos": 0.0052,
          "chrom": -0.0238
        },
        {
          "t": 51.867,
          "r": -0.2139,
          "g": 0.0567,
          "b": 0.083,
          "pos": -0.2206,
          "chrom": 0.1952
        },
        {
          "t": 52.0,
          "r": -0.1993,
          "g": 0.0779,
          "b": 0.1252,
          "pos": 0.0952,
          "chrom": -0.0897
        },
        {
          "t": 52.133,
          "r": -0.1999,
          "g": 0.0692,
          "b": 0.13,
          "pos": 0.3004,
          "chrom": -0.2574
        },
        {
          "t": 52.333,
          "r": -0.1759,
          "g": 0.0828,
          "b": 0.1825,
          "pos": -0.1526,
          "chrom": 0.1428
        },
        {
          "t": 52.467,
          "r": -0.1665,
          "g": 0.1139,
          "b": 0.2285,
          "pos": -0.1801,
          "chrom": 0.1442
        },
        {
          "t": 52.6,
          "r": -0.1856,
          "g": 0.1108,
          "b": 0.2204,
          "pos": -0.0502,
          "chrom": 0.0613
        },
        {
          "t": 52.8,
          "r": -0.2397,
          "g": 0.0807,
          "b": 0.2016,
          "pos": 0.2461,
          "chrom": -0.2126
        },
        {
          "t": 52.933,
          "r": -0.1983,
          "g": 0.1182,
          "b": 0.2556,
          "pos": 0.1852,
          "chrom": -0.2166
        },
        {
          "t": 53.067,
          "r": -0.158,
          "g": 0.1353,
          "b": 0.2782,
          "pos": -0.0436,
          "chrom": 0.0189
        },
        {
          "t": 53.267,
          "r": -0.0618,
          "g": 0.224,
          "b": 0.3949,
          "pos": -0.5856,
          "chrom": 0.5661
        },
        {
          "t": 53.4,
          "r": -0.0527,
          "g": 0.3072,
          "b": 0.5309,
          "pos": 0.0898,
          "chrom": -0.0758
        },
        {
          "t": 53.533,
          "r": 0.0012,
          "g": 0.3794,
          "b": 0.6464,
          "pos": 1.0921,
          "chrom": -0.9046
        },
        {
          "t": 53.733,
          "r": -0.9466,
          "g": -0.5744,
          "b": -0.1362,
          "pos": -0.0859,
          "chrom": -0.0298
        },
        {
          "t": 53.867,
          "r": -1.5,
          "g": -1.3065,
          "b": -0.8623,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 54.067,
          "r": -0.3233,
          "g": -0.1682,
          "b": 0.0259,
          "pos": 1.5,
          "chrom": -1.4666
        },
        {
          "t": 54.2,
          "r": -0.347,
          "g": -0.1995,
          "b": -0.0541,
          "pos": 0.4341,
          "chrom": -0.3757
        },
        {
          "t": 54.333,
          "r": -0.2941,
          "g": -0.1434,
          "b": -0.0257,
          "pos": -0.1897,
          "chrom": 0.1392
        },
        {
          "t": 54.533,
          "r": -0.232,
          "g": -0.0815,
          "b": 0.0038,
          "pos": -0.4976,
          "chrom": 0.3863
        },
        {
          "t": 54.667,
          "r": -0.0702,
          "g": 0.0448,
          "b": 0.0564,
          "pos": 0.3133,
          "chrom": -0.2118
        },
        {
          "t": 54.8,
          "r": -0.1036,
          "g": -0.003,
          "b": -0.007,
          "pos": 0.1504,
          "chrom": -0.0929
        },
        {
          "t": 55.0,
          "r": -0.0144,
          "g": 0.0664,
          "b": 0.058,
          "pos": 0.1266,
          "chrom": -0.1162
        },
        {
          "t": 55.133,
          "r": -0.0701,
          "g": 0.0116,
          "b": 0.0319,
          "pos": -0.167,
          "chrom": 0.1107
        },
        {
          "t": 55.267,
          "r": -0.1389,
          "g": -0.0786,
          "b": -0.071,
          "pos": -0.0958,
          "chrom": 0.0969
        },
        {
          "t": 55.467,
          "r": -0.336,
          "g": -0.2684,
          "b": -0.2677,
          "pos": 0.1765,
          "chrom": -0.137
        },
        {
          "t": 55.6,
          "r": -0.4575,
          "g": -0.3828,
          "b": -0.3826,
          "pos": 0.2298,
          "chrom": -0.1772
        },
        {
          "t": 55.733,
          "r": -0.539,
          "g": -0.4564,
          "b": -0.4263,
          "pos": -0.2728,
          "chrom": 0.2105
        },
        {
          "t": 55.933,
          "r": -0.402,
          "g": -0.3198,
          "b": -0.3115,
          "pos": 0.0459,
          "chrom": -0.0409
        },
        {
          "t": 56.067,
          "r": -0.4006,
          "g": -0.33,
          "b": -0.3492,
          "pos": 0.1026,
          "chrom": -0.0358
        },
        {
          "t": 56.2,
          "r": -0.4628,
          "g": -0.3705,
          "b": -0.3602,
          "pos": -0.1795,
          "chrom": 0.1138
        },
        {
          "t": 56.4,
          "r": -0.2773,
          "g": -0.2131,
          "b": -0.2321,
          "pos": 0.479,
          "chrom": -0.3533
        },
        {
          "t": 56.533,
          "r": -0.2571,
          "g": -0.1938,
          "b": -0.1651,
          "pos": -0.1214,
          "chrom": 0.1219
        },
        {
          "t": 56.667,
          "r": -0.2439,
          "g": -0.1864,
          "b": -0.1553,
          "pos": -0.4034,
          "chrom": 0.3184
        },
        {
          "t": 56.867,
          "r": -0.1189,
          "g": -0.0762,
          "b": -0.1059,
          "pos": 0.1547,
          "chrom": -0.1635
        },
        {
          "t": 57.0,
          "r": -0.0094,
          "g": -0.0034,
          "b": -0.0803,
          "pos": 0.3458,
          "chrom": -0.2492
        },
        {
          "t": 57.133,
          "r": -0.0124,
          "g": -0.0156,
          "b": -0.0838,
          "pos": 0.0146,
          "chrom": 0.0226
        },
        {
          "t": 57.333,
          "r": -0.0034,
          "g": 0.0077,
          "b": -0.0299,
          "pos": -0.1152,
          "chrom": 0.0688
        },
        {
          "t": 57.467,
          "r": 0.0368,
          "g": 0.044,
          "b": 0.0024,
          "pos": -0.2442,
          "chrom": 0.2013
        },
        {
          "t": 57.6,
          "r": 0.0965,
          "g": 0.0956,
          "b": 0.0139,
          "pos": 0.1849,
          "chrom": -0.1136
        },
        {
          "t": 57.8,
          "r": 0.0981,
          "g": 0.0877,
          "b": 0.0005,
          "pos": 0.0596,
          "chrom": -0.093
        },
        {
          "t": 57.933,
          "r": 0.0904,
          "g": 0.0385,
          "b": -0.0572,
          "pos": -0.1987,
          "chrom": 0.1593
        },
        {
          "t": 58.067,
          "r": 0.0996,
          "g": 0.0368,
          "b": -0.064,
          "pos": 0.0643,
          "chrom": -0.037
        },
        {
          "t": 58.267,
          "r": 0.2477,
          "g": 0.1962,
          "b": 0.1388,
          "pos": -0.0386,
          "chrom": 0.0669
        },
        {
          "t": 58.4,
          "r": 0.3791,
          "g": 0.3734,
          "b": 0.3587,
          "pos": 0.1921,
          "chrom": -0.1845
        },
        {
          "t": 58.533,
          "r": 0.4511,
          "g": 0.4741,
          "b": 0.4952,
          "pos": -0.0699,
          "chrom": 0.0344
        },
        {
          "t": 58.733,
          "r": 0.4056,
          "g": 0.4428,
          "b": 0.4587,
          "pos": 0.0682,
          "chrom": -0.0696
        },
        {
          "t": 58.867,
          "r": 0.2615,
          "g": 0.2949,
          "b": 0.2834,
          "pos": 0.0938,
          "chrom": -0.0406
        },
        {
          "t": 59.0,
          "r": 0.2355,
          "g": 0.2769,
          "b": 0.2596,
          "pos": -0.1226,
          "chrom": 0.1291
        },
        {
          "t": 59.2,
          "r": 0.5004,
          "g": 0.5515,
          "b": 0.514,
          "pos": 0.0106,
          "chrom": -0.0306
        },
        {
          "t": 59.333,
          "r": 0.6475,
          "g": 0.7267,
          "b": 0.6822,
          "pos": 0.4031,
          "chrom": -0.4437
        },
        {
          "t": 59.467,
          "r": 0.4777,
          "g": 0.5078,
          "b": 0.413,
          "pos": 0.0062,
          "chrom": 0.0334
        },
        {
          "t": 59.667,
          "r": 0.2989,
          "g": 0.2869,
          "b": 0.1569,
          "pos": -0.2731,
          "chrom": 0.3063
        },
        {
          "t": 59.8,
          "r": 0.3789,
          "g": 0.3636,
          "b": 0.233,
          "pos": -0.0077,
          "chrom": -0.0018
        },
        {
          "t": 60.0,
          "r": 0.289,
          "g": 0.2316,
          "b": 0.0781,
          "pos": 0.265,
          "chrom": -0.242
        },
        {
          "t": 60.133,
          "r": 0.228,
          "g": 0.1246,
          "b": -0.0292,
          "pos": -0.0485,
          "chrom": 0.0439
        },
        {
          "t": 60.267,
          "r": 0.1767,
          "g": 0.0484,
          "b": -0.1047,
          "pos": -0.0479,
          "chrom": -0.012
        },
        {
          "t": 60.467,
          "r": 0.0538,
          "g": -0.1154,
          "b": -0.3111,
          "pos": -0.3905,
          "chrom": 0.5372
        },
        {
          "t": 60.6,
          "r": 0.1765,
          "g": 0.1588,
          "b": 0.0183,
          "pos": 0.4465,
          "chrom": -0.4778
        },
        {
          "t": 60.733,
          "r": 0.2355,
          "g": 0.2721,
          "b": 0.1628,
          "pos": 0.3102,
          "chrom": -0.4241
        },
        {
          "t": 60.933,
          "r": -0.0134,
          "g": 0.0261,
          "b": -0.102,
          "pos": -0.2781,
          "chrom": 0.3374
        },
        {
          "t": 61.067,
          "r": 0.0473,
          "g": 0.0954,
          "b": -0.0232,
          "pos": -0.2232,
          "chrom": 0.2719
        },
        {
          "t": 61.2,
          "r": 0.1415,
          "g": 0.1916,
          "b": 0.0969,
          "pos": -0.0184,
          "chrom": -0.0203
        },
        {
          "t": 61.4,
          "r": -0.1178,
          "g": -0.1001,
          "b": -0.1952,
          "pos": 0.6518,
          "chrom": -0.6322
        },
        {
          "t": 61.533,
          "r": -0.4911,
          "g": -0.5825,
          "b": -0.6547,
          "pos": -0.7812,
          "chrom": 0.7428
        },
        {
          "t": 61.667,
          "r": -0.8468,
          "g": -0.9585,
          "b": -1.0729,
          "pos": -0.1338,
          "chrom": 0.2498
        },
        {
          "t": 61.867,
          "r": -0.7392,
          "g": -0.8414,
          "b": -0.9637,
          "pos": 0.2354,
          "chrom": -0.3486
        },
        {
          "t": 62.0,
          "r": -1.008,
          "g": -1.1358,
          "b": -1.2967,
          "pos": -0.133,
          "chrom": 0.0502
        },
        {
          "t": 62.133,
          "r": -1.3113,
          "g": -1.4534,
          "b": -1.5,
          "pos": -0.1762,
          "chrom": 0.2407
        },
        {
          "t": 62.333,
          "r": -1.111,
          "g": -1.2047,
          "b": -1.3791,
          "pos": 0.4183,
          "chrom": -0.3354
        },
        {
          "t": 62.467,
          "r": -0.4014,
          "g": -0.5056,
          "b": -0.5696,
          "pos": -0.4816,
          "chrom": 0.3417
        },
        {
          "t": 62.6,
          "r": -0.3477,
          "g": -0.4267,
          "b": -0.4724,
          "pos": -0.2103,
          "chrom": 0.1619
        },
        {
          "t": 62.8,
          "r": -0.4727,
          "g": -0.517,
          "b": -0.6014,
          "pos": 0.358,
          "chrom": -0.2972
        },
        {
          "t": 62.933,
          "r": -0.5631,
          "g": -0.6084,
          "b": -0.7186,
          "pos": 0.1197,
          "chrom": -0.0961
        },
        {
          "t": 63.067,
          "r": -0.3528,
          "g": -0.4498,
          "b": -0.5912,
          "pos": -0.3857,
          "chrom": 0.3802
        },
        {
          "t": 63.267,
          "r": -0.3232,
          "g": -0.4032,
          "b": -0.5582,
          "pos": 0.0946,
          "chrom": -0.1054
        },
        {
          "t": 63.4,
          "r": -0.3831,
          "g": -0.4474,
          "b": -0.6078,
          "pos": 0.3959,
          "chrom": -0.3678
        },
        {
          "t": 63.533,
          "r": -0.5091,
          "g": -0.5759,
          "b": -0.7365,
          "pos": 0.0607,
          "chrom": -0.048
        },
        {
          "t": 63.733,
          "r": -0.5562,
          "g": -0.644,
          "b": -0.8356,
          "pos": -0.3035,
          "chrom": 0.2866
        },
        {
          "t": 63.867,
          "r": -0.65,
          "g": -0.7335,
          "b": -0.9571,
          "pos": -0.0474,
          "chrom": 0.0155
        },
        {
          "t": 64.0,
          "r": -0.6833,
          "g": -0.7911,
          "b": -1.049,
          "pos": 0.2714,
          "chrom": -0.2298
        },
        {
          "t": 64.2,
          "r": -0.513,
          "g": -0.7016,
          "b": -0.8893,
          "pos": -0.0413,
          "chrom": 0.0192
        },
        {
          "t": 64.333,
          "r": -0.3604,
          "g": -0.5869,
          "b": -0.7167,
          "pos": -0.5745,
          "chrom": 0.5081
        },
        {
          "t": 64.467,
          "r": -0.2852,
          "g": -0.4792,
          "b": -0.5616,
          "pos": 0.1357,
          "chrom": -0.1079
        },
        {
          "t": 64.667,
          "r": -0.3909,
          "g": -0.4624,
          "b": -0.5003,
          "pos": 0.098,
          "chrom": -0.0693
        },
        {
          "t": 64.8,
          "r": -0.3711,
          "g": -0.364,
          "b": -0.398,
          "pos": 0.0952,
          "chrom": -0.1176
        },
        {
          "t": 64.933,
          "r": -0.2393,
          "g": -0.2007,
          "b": -0.2553,
          "pos": 0.0907,
          "chrom": -0.1187
        },
        {
          "t": 65.133,
          "r": -0.2198,
          "g": -0.2419,
          "b": -0.3527,
          "pos": -0.1021,
          "chrom": 0.1514
        },
        {
          "t": 65.267,
          "r": -0.203,
          "g": -0.2768,
          "b": -0.3963,
          "pos": -0.11,
          "chrom": 0.1348
        },
        {
          "t": 65.467,
          "r": -0.1771,
          "g": -0.3068,
          "b": -0.4184,
          "pos": -0.014,
          "chrom": -0.0484
        },
        {
          "t": 65.6,
          "r": -0.2644,
          "g": -0.4552,
          "b": -0.5927,
          "pos": 0.2654,
          "chrom": -0.2084
        },
        {
          "t": 65.733,
          "r": -0.2465,
          "g": -0.52,
          "b": -0.649,
          "pos": -0.323,
          "chrom": 0.3346
        },
        {
          "t": 65.933,
          "r": -0.2082,
          "g": -0.5393,
          "b": -0.6575,
          "pos": 0.5658,
          "chrom": -0.5505
        },
        {
          "t": 66.067,
          "r": -0.2549,
          "g": -0.6715,
          "b": -0.7506,
          "pos": -0.1969,
          "chrom": 0.1634
        },
        {
          "t": 66.2,
          "r": -0.2573,
          "g": -0.7175,
          "b": -0.786,
          "pos": -0.4371,
          "chrom": 0.4513
        },
        {
          "t": 66.4,
          "r": -0.2207,
          "g": -0.6003,
          "b": -0.6299,
          "pos": 0.5037,
          "chrom": -0.4731
        },
        {
          "t": 66.533,
          "r": -0.1394,
          "g": -0.4831,
          "b": -0.478,
          "pos": 0.12,
          "chrom": -0.1248
        },
        {
          "t": 66.667,
          "r": -0.1096,
          "g": -0.4043,
          "b": -0.365,
          "pos": -0.3302,
          "chrom": 0.2908
        },
        {
          "t": 66.867,
          "r": -0.1119,
          "g": -0.3323,
          "b": -0.2853,
          "pos": 0.1591,
          "chrom": -0.1135
        },
        {
          "t": 67.0,
          "r": -0.1649,
          "g": -0.3204,
          "b": -0.2642,
          "pos": 0.6487,
          "chrom": -0.6149
        },
        {
          "t": 67.133,
          "r": -0.1335,
          "g": -0.3194,
          "b": -0.2432,
          "pos": -0.3622,
          "chrom": 0.3133
        },
        {
          "t": 67.333,
          "r": -0.2806,
          "g": -0.4703,
          "b": -0.42,
          "pos": -0.291,
          "chrom": 0.2886
        },
        {
          "t": 67.467,
          "r": -0.3646,
          "g": -0.5335,
          "b": -0.5029,
          "pos": 0.0285,
          "chrom": -0.0092
        },
        {
          "t": 67.6,
          "r": -0.4051,
          "g": -0.5428,
          "b": -0.522,
          "pos": 0.6601,
          "chrom": -0.6223
        },
        {
          "t": 67.8,
          "r": -0.4219,
          "g": -0.6007,
          "b": -0.5546,
          "pos": -0.3943,
          "chrom": 0.3587
        },
        {
          "t": 67.933,
          "r": -0.4169,
          "g": -0.6176,
          "b": -0.5586,
          "pos": -0.7141,
          "chrom": 0.6715
        },
        {
          "t": 68.067,
          "r": -0.4816,
          "g": -0.6496,
          "b": -0.5956,
          "pos": 0.3446,
          "chrom": -0.2981
        },
        {
          "t": 68.267,
          "r": -0.4541,
          "g": -0.6309,
          "b": -0.543,
          "pos": 0.3437,
          "chrom": -0.336
        },
        {
          "t": 68.4,
          "r": -0.3985,
          "g": -0.6337,
          "b": -0.5168,
          "pos": -0.757,
          "chrom": 0.7089
        },
        {
          "t": 68.533,
          "r": -0.3802,
          "g": -0.6,
          "b": -0.4889,
          "pos": -0.3412,
          "chrom": 0.3381
        },
        {
          "t": 68.733,
          "r": -0.4644,
          "g": -0.6376,
          "b": -0.538,
          "pos": 0.7016,
          "chrom": -0.6586
        },
        {
          "t": 68.867,
          "r": -0.4904,
          "g": -0.6793,
          "b": -0.5828,
          "pos": 0.3124,
          "chrom": -0.306
        },
        {
          "t": 69.0,
          "r": -0.4692,
          "g": -0.7164,
          "b": -0.6245,
          "pos": -0.6538,
          "chrom": 0.6286
        },
        {
          "t": 69.2,
          "r": -0.487,
          "g": -0.7225,
          "b": -0.6527,
          "pos": 0.0066,
          "chrom": -0.0117
        },
        {
          "t": 69.333,
          "r": -0.5174,
          "g": -0.7375,
          "b": -0.6842,
          "pos": 0.8233,
          "chrom": -0.7753
        },
        {
          "t": 69.467,
          "r": -0.5009,
          "g": -0.7815,
          "b": -0.7198,
          "pos": 0.0026,
          "chrom": 0.0034
        },
        {
          "t": 69.667,
          "r": -0.4512,
          "g": -0.7757,
          "b": -0.7101,
          "pos": -0.4935,
          "chrom": 0.4803
        },
        {
          "t": 69.8,
          "r": -0.4985,
          "g": -0.8149,
          "b": -0.7537,
          "pos": -0.0737,
          "chrom": 0.0775
        },
        {
          "t": 69.933,
          "r": -0.5223,
          "g": -0.8009,
          "b": -0.7366,
          "pos": 0.8518,
          "chrom": -0.828
        },
        {
          "t": 70.133,
          "r": -0.5343,
          "g": -0.8962,
          "b": -0.8137,
          "pos": -0.5309,
          "chrom": 0.5143
        },
        {
          "t": 70.267,
          "r": -0.5025,
          "g": -0.8853,
          "b": -0.8054,
          "pos": -0.3758,
          "chrom": 0.3879
        },
        {
          "t": 70.4,
          "r": -0.4973,
          "g": -0.8458,
          "b": -0.7558,
          "pos": 0.0123,
          "chrom": -0.0449
        },
        {
          "t": 70.6,
          "r": -0.5519,
          "g": -0.8831,
          "b": -0.8186,
          "pos": 0.7282,
          "chrom": -0.666
        },
        {
          "t": 70.733,
          "r": -0.5318,
          "g": -0.9205,
          "b": -0.8516,
          "pos": -0.3947,
          "chrom": 0.3973
        },
        {
          "t": 70.867,
          "r": -0.4705,
          "g": -0.876,
          "b": -0.8269,
          "pos": -0.774,
          "chrom": 0.729
        },
        {
          "t": 71.067,
          "r": -0.401,
          "g": -0.754,
          "b": -0.7617,
          "pos": 0.766,
          "chrom": -0.74
        },
        {
          "t": 71.2,
          "r": -0.3546,
          "g": -0.7655,
          "b": -0.8034,
          "pos": 0.5087,
          "chrom": -0.4399
        },
        {
          "t": 71.4,
          "r": -0.4207,
          "g": -0.8569,
          "b": -0.8789,
          "pos": -0.3034,
          "chrom": 0.2383
        },
        {
          "t": 71.533,
          "r": -0.4933,
          "g": -0.9045,
          "b": -0.9389,
          "pos": -0.4482,
          "chrom": 0.4282
        },
        {
          "t": 71.667,
          "r": -0.5679,
          "g": -0.8703,
          "b": -0.9207,
          "pos": -0.0871,
          "chrom": 0.101
        },
        {
          "t": 71.867,
          "r": -0.2192,
          "g": -0.3484,
          "b": -0.4155,
          "pos": 0.4812,
          "chrom": -0.4085
        },
        {
          "t": 72.0,
          "r": -0.0853,
          "g": -0.1498,
          "b": -0.1972,
          "pos": -0.0786,
          "chrom": 0.0811
        },
        {
          "t": 72.133,
          "r": -0.0648,
          "g": -0.107,
          "b": -0.1451,
          "pos": -0.2566,
          "chrom": 0.2105
        },
        {
          "t": 72.333,
          "r": -0.0983,
          "g": -0.1154,
          "b": -0.1512,
          "pos": 0.0869,
          "chrom": -0.1084
        },
        {
          "t": 72.467,
          "r": -0.1301,
          "g": -0.1207,
          "b": -0.1437,
          "pos": 0.0936,
          "chrom": -0.0153
        },
        {
          "t": 72.6,
          "r": -0.106,
          "g": -0.0057,
          "b": 0.0397,
          "pos": -0.0766,
          "chrom": 0.1152
        },
        {
          "t": 72.8,
          "r": -0.0848,
          "g": 0.1987,
          "b": 0.3751,
          "pos": 0.0247,
          "chrom": -0.0059
        },
        {
          "t": 72.933,
          "r": -0.1762,
          "g": 0.1821,
          "b": 0.4291,
          "pos": -0.0711,
          "chrom": 0.0616
        },
        {
          "t": 73.067,
          "r": -0.2033,
          "g": 0.2021,
          "b": 0.5101,
          "pos": 0.5715,
          "chrom": -0.7166
        },
        {
          "t": 73.267,
          "r": 0.0098,
          "g": 0.2037,
          "b": 0.474,
          "pos": -0.7754,
          "chrom": 0.9215
        },
        {
          "t": 73.4,
          "r": -0.2456,
          "g": 0.0264,
          "b": 0.3229,
          "pos": 0.0834,
          "chrom": -0.0222
        },
        {
          "t": 73.533,
          "r": -0.5165,
          "g": -0.1566,
          "b": 0.1945,
          "pos": 0.1568,
          "chrom": -0.152
        },
        {
          "t": 73.733,
          "r": -0.8645,
          "g": -0.3259,
          "b": 0.1248,
          "pos": 0.2103,
          "chrom": -0.4088
        },
        {
          "t": 73.867,
          "r": -0.6165,
          "g": -0.2405,
          "b": 0.0871,
          "pos": -0.22,
          "chrom": 0.5156
        },
        {
          "t": 74.0,
          "r": -0.6342,
          "g": -0.1787,
          "b": 0.1896,
          "pos": -0.002,
          "chrom": 0.0818
        },
        {
          "t": 74.2,
          "r": -0.596,
          "g": -0.0976,
          "b": 0.2923,
          "pos": -0.009,
          "chrom": -0.1663
        },
        {
          "t": 74.333,
          "r": -0.4533,
          "g": 0.0068,
          "b": 0.3594,
          "pos": -0.1002,
          "chrom": -0.1014
        },
        {
          "t": 74.467,
          "r": 0.0864,
          "g": 0.2821,
          "b": 0.423,
          "pos": 0.165,
          "chrom": 0.1654
        },
        {
          "t": 74.667,
          "r": 0.1228,
          "g": 0.2776,
          "b": 0.4148,
          "pos": -0.101,
          "chrom": 0.0275
        },
        {
          "t": 74.8,
          "r": 0.2149,
          "g": 0.324,
          "b": 0.4443,
          "pos": -0.2167,
          "chrom": 0.0707
        },
        {
          "t": 74.933,
          "r": 0.3325,
          "g": 0.4035,
          "b": 0.4954,
          "pos": 0.0674,
          "chrom": -0.1319
        },
        {
          "t": 75.133,
          "r": 0.4908,
          "g": 0.4698,
          "b": 0.5,
          "pos": 0.1267,
          "chrom": -0.0043
        },
        {
          "t": 75.267,
          "r": 0.4289,
          "g": 0.4261,
          "b": 0.4831,
          "pos": 0.1311,
          "chrom": -0.1167
        },
        {
          "t": 75.4,
          "r": 0.2398,
          "g": 0.2508,
          "b": 0.3478,
          "pos": -0.2257,
          "chrom": 0.154
        },
        {
          "t": 75.6,
          "r": 0.1833,
          "g": 0.1659,
          "b": 0.2551,
          "pos": -0.0218,
          "chrom": 0.0452
        },
        {
          "t": 75.733,
          "r": 0.217,
          "g": 0.1887,
          "b": 0.265,
          "pos": 0.321,
          "chrom": -0.2045
        },
        {
          "t": 75.867,
          "r": 0.1887,
          "g": 0.1774,
          "b": 0.2794,
          "pos": -0.0221,
          "chrom": -0.0359
        },
        {
          "t": 76.067,
          "r": 0.2269,
          "g": 0.2342,
          "b": 0.3431,
          "pos": -0.0278,
          "chrom": 0.0163
        },
        {
          "t": 76.2,
          "r": 0.234,
          "g": 0.205,
          "b": 0.3209,
          "pos": -0.6775,
          "chrom": 0.7661
        },
        {
          "t": 76.333,
          "r": 0.4287,
          "g": 0.4719,
          "b": 0.6079,
          "pos": 0.7806,
          "chrom": -0.7189
        },
        {
          "t": 76.533,
          "r": 0.4694,
          "g": 0.3839,
          "b": 0.5438,
          "pos": 0.0495,
          "chrom": -0.1455
        },
        {
          "t": 76.667,
          "r": 0.5734,
          "g": 0.3549,
          "b": 0.4579,
          "pos": -0.4823,
          "chrom": 0.4661
        },
        {
          "t": 76.867,
          "r": 0.6283,
          "g": 0.389,
          "b": 0.3972,
          "pos": -0.4684,
          "chrom": 0.5786
        },
        {
          "t": 77.0,
          "r": 0.4648,
          "g": 0.461,
          "b": 0.4664,
          "pos": 0.8094,
          "chrom": -0.8903
        },
        {
          "t": 77.133,
          "r": 0.3684,
          "g": 0.4144,
          "b": 0.3928,
          "pos": 0.4105,
          "chrom": -0.4169
        },
        {
          "t": 77.333,
          "r": 0.517,
          "g": 0.5468,
          "b": 0.5115,
          "pos": -0.0645,
          "chrom": 0.0706
        },
        {
          "t": 77.467,
          "r": 0.5234,
          "g": 0.4618,
          "b": 0.3868,
          "pos": -0.3767,
          "chrom": 0.5094
        },
        {
          "t": 77.6,
          "r": 0.4109,
          "g": 0.3555,
          "b": 0.2861,
          "pos": -0.196,
          "chrom": 0.1253
        },
        {
          "t": 77.8,
          "r": 0.1822,
          "g": 0.1004,
          "b": -0.044,
          "pos": 0.574,
          "chrom": -0.5317
        },
        {
          "t": 77.933,
          "r": -0.0195,
          "g": -0.1238,
          "b": -0.3206,
          "pos": 0.6115,
          "chrom": -0.4984
        },
        {
          "t": 78.067,
          "r": 0.0313,
          "g": -0.1342,
          "b": -0.2875,
          "pos": -0.8705,
          "chrom": 0.7564
        },
        {
          "t": 78.267,
          "r": 0.0019,
          "g": -0.1239,
          "b": -0.284,
          "pos": 0.1835,
          "chrom": -0.0769
        },
        {
          "t": 78.4,
          "r": 0.2487,
          "g": 0.2047,
          "b": 0.1254,
          "pos": -0.0368,
          "chrom": -0.0272
        },
        {
          "t": 78.533,
          "r": 0.427,
          "g": 0.4468,
          "b": 0.3848,
          "pos": 0.2938,
          "chrom": -0.3035
        },
        {
          "t": 78.733,
          "r": 0.6148,
          "g": 0.6312,
          "b": 0.5798,
          "pos": -0.2136,
          "chrom": 0.2348
        },
        {
          "t": 78.867,
          "r": 0.6381,
          "g": 0.663,
          "b": 0.6156,
          "pos": -0.0811,
          "chrom": 0.0412
        },
        {
          "t": 79.0,
          "r": 0.6325,
          "g": 0.6495,
          "b": 0.5971,
          "pos": 0.2096,
          "chrom": -0.2721
        },
        {
          "t": 79.2,
          "r": 0.6917,
          "g": 0.6394,
          "b": 0.5809,
          "pos": -0.2093,
          "chrom": 0.3408
        },
        {
          "t": 79.333,
          "r": 0.6831,
          "g": 0.7055,
          "b": 0.7098,
          "pos": 0.1834,
          "chrom": -0.1431
        },
        {
          "t": 79.467,
          "r": 0.4448,
          "g": 0.502,
          "b": 0.5691,
          "pos": -0.2045,
          "chrom": 0.1066
        },
        {
          "t": 79.667,
          "r": -0.0412,
          "g": -0.0443,
          "b": -0.0358,
          "pos": -0.1806,
          "chrom": 0.1455
        },
        {
          "t": 79.8,
          "r": -0.2456,
          "g": -0.3207,
          "b": -0.44,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 79.933,
          "r": -0.2957,
          "g": -0.5466,
          "b": -0.686,
          "pos": -1.3985,
          "chrom": 1.2735
        },
        {
          "t": 80.133,
          "r": -1.137,
          "g": -1.2872,
          "b": -1.5,
          "pos": 0.7956,
          "chrom": -0.6562
        },
        {
          "t": 80.267,
          "r": -1.0622,
          "g": -1.1139,
          "b": -1.3409,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 80.4,
          "r": -0.7244,
          "g": -0.8425,
          "b": -1.0029,
          "pos": -0.7224,
          "chrom": 0.6019
        },
        {
          "t": 80.6,
          "r": -0.6996,
          "g": -0.7242,
          "b": -0.9002,
          "pos": 0.111,
          "chrom": -0.0585
        },
        {
          "t": 80.733,
          "r": -0.3732,
          "g": -0.3554,
          "b": -0.5098,
          "pos": 0.4698,
          "chrom": -0.4484
        },
        {
          "t": 80.867,
          "r": -0.1281,
          "g": -0.0948,
          "b": -0.2418,
          "pos": 0.145,
          "chrom": -0.1139
        },
        {
          "t": 81.067,
          "r": 0.0,
          "g": 0.0147,
          "b": -0.1266,
          "pos": -0.2445,
          "chrom": 0.2869
        },
        {
          "t": 81.2,
          "r": -0.013,
          "g": 0.0084,
          "b": -0.1146,
          "pos": 0.0215,
          "chrom": -0.1394
        },
        {
          "t": 81.333,
          "r": -0.1088,
          "g": -0.1095,
          "b": -0.2834,
          "pos": 0.9852,
          "chrom": -1.0427
        },
        {
          "t": 81.533,
          "r": -0.1909,
          "g": -0.4484,
          "b": -0.6669,
          "pos": -1.4359,
          "chrom": 1.5
        },
        {
          "t": 81.667,
          "r": -0.2315,
          "g": -0.2714,
          "b": -0.4592,
          "pos": 1.0707,
          "chrom": -0.9358
        },
        {
          "t": 81.8,
          "r": 0.1013,
          "g": 0.135,
          "b": 0.0509,
          "pos": 0.444,
          "chrom": -0.5903
        },
        {
          "t": 82.0,
          "r": 0.3894,
          "g": 0.38,
          "b": 0.3178,
          "pos": -0.5016,
          "chrom": 0.4519
        },
        {
          "t": 82.133,
          "r": 0.4081,
          "g": 0.3598,
          "b": 0.2074,
          "pos": 0.2643,
          "chrom": -0.0426
        },
        {
          "t": 82.267,
          "r": 0.4236,
          "g": 0.376,
          "b": 0.2146,
          "pos": -0.0611,
          "chrom": 0.0563
        },
        {
          "t": 82.467,
          "r": 0.243,
          "g": 0.1987,
          "b": 0.0084,
          "pos": -0.0514,
          "chrom": -0.0752
        },
        {
          "t": 82.6,
          "r": 0.0687,
          "g": 0.0264,
          "b": -0.1923,
          "pos": 0.7268,
          "chrom": -0.6389
        },
        {
          "t": 82.8,
          "r": 0.0378,
          "g": -0.0186,
          "b": -0.1253,
          "pos": -0.526,
          "chrom": 0.4962
        },
        {
          "t": 82.933,
          "r": 0.126,
          "g": 0.1244,
          "b": 0.0882,
          "pos": -0.7762,
          "chrom": 0.6528
        },
        {
          "t": 83.067,
          "r": 0.3159,
          "g": 0.3776,
          "b": 0.3322,
          "pos": 0.4422,
          "chrom": -0.3932
        },
        {
          "t": 83.267,
          "r": 0.5517,
          "g": 0.6237,
          "b": 0.5438,
          "pos": 0.1919,
          "chrom": -0.1977
        },
        {
          "t": 83.4,
          "r": 0.5852,
          "g": 0.6506,
          "b": 0.5424,
          "pos": 0.0831,
          "chrom": -0.1211
        },
        {
          "t": 83.533,
          "r": 0.5927,
          "g": 0.6379,
          "b": 0.517,
          "pos": -0.2898,
          "chrom": 0.3168
        },
        {
          "t": 83.733,
          "r": 0.8,
          "g": 0.9088,
          "b": 0.8348,
          "pos": -0.0103,
          "chrom": 0.134
        },
        {
          "t": 83.867,
          "r": 0.9095,
          "g": 1.1,
          "b": 1.1032,
          "pos": 0.0868,
          "chrom": -0.1882
        },
        {
          "t": 84.0,
          "r": 0.8342,
          "g": 1.0254,
          "b": 1.032,
          "pos": 0.2242,
          "chrom": -0.3932
        },
        {
          "t": 84.2,
          "r": 0.1028,
          "g": 0.0854,
          "b": -0.0469,
          "pos": -0.1995,
          "chrom": 0.2832
        },
        {
          "t": 84.333,
          "r": -0.605,
          "g": -0.7052,
          "b": -0.8952,
          "pos": -0.2094,
          "chrom": 0.2777
        },
        {
          "t": 84.467,
          "r": -1.1226,
          "g": -1.2038,
          "b": -1.4186,
          "pos": 0.4839,
          "chrom": -0.3756
        },
        {
          "t": 84.667,
          "r": -0.79,
          "g": -0.8244,
          "b": -0.9478,
          "pos": -0.3535,
          "chrom": 0.1911
        },
        {
          "t": 84.8,
          "r": -0.6462,
          "g": -0.6402,
          "b": -0.7648,
          "pos": 0.0034,
          "chrom": -0.0312
        },
        {
          "t": 84.933,
          "r": -0.546,
          "g": -0.5195,
          "b": -0.6578,
          "pos": 0.1482,
          "chrom": -0.0829
        },
        {
          "t": 85.133,
          "r": -0.4286,
          "g": -0.4217,
          "b": -0.5748,
          "pos": 0.2631,
          "chrom": -0.1822
        },
        {
          "t": 85.267,
          "r": -0.1976,
          "g": -0.2513,
          "b": -0.3615,
          "pos": -0.577,
          "chrom": 0.4337
        },
        {
          "t": 85.4,
          "r": -0.3191,
          "g": -0.3921,
          "b": -0.5451,
          "pos": -0.1628,
          "chrom": 0.1114
        },
        {
          "t": 85.6,
          "r": -0.3835,
          "g": -0.4907,
          "b": -0.666,
          "pos": 0.3071,
          "chrom": -0.2486
        },
        {
          "t": 85.733,
          "r": -0.3198,
          "g": -0.4568,
          "b": -0.611,
          "pos": 0.5941,
          "chrom": -0.4406
        },
        {
          "t": 85.867,
          "r": -0.23,
          "g": -0.3973,
          "b": -0.4357,
          "pos": -0.3231,
          "chrom": 0.2828
        },
        {
          "t": 86.067,
          "r": -0.3062,
          "g": -0.4806,
          "b": -0.4303,
          "pos": -0.2309,
          "chrom": 0.1461
        },
        {
          "t": 86.2,
          "r": -0.3349,
          "g": -0.5434,
          "b": -0.5074,
          "pos": -0.1669,
          "chrom": 0.1379
        },
        {
          "t": 86.333,
          "r": -0.3223,
          "g": -0.556,
          "b": -0.5783,
          "pos": 0.4508,
          "chrom": -0.3713
        },
        {
          "t": 86.533,
          "r": -0.3163,
          "g": -0.589,
          "b": -0.6331,
          "pos": -0.0524,
          "chrom": 0.0904
        },
        {
          "t": 86.667,
          "r": -0.3266,
          "g": -0.5795,
          "b": -0.5891,
          "pos": -0.1501,
          "chrom": 0.1641
        },
        {
          "t": 86.8,
          "r": -0.2296,
          "g": -0.428,
          "b": -0.3695,
          "pos": 0.1037,
          "chrom": -0.1644
        },
        {
          "t": 87.0,
          "r": -0.1049,
          "g": -0.2988,
          "b": -0.1824,
          "pos": -0.2945,
          "chrom": 0.3237
        },
        {
          "t": 87.133,
          "r": -0.1175,
          "g": -0.2417,
          "b": -0.0947,
          "pos": 0.185,
          "chrom": -0.0802
        },
        {
          "t": 87.267,
          "r": -0.1789,
          "g": -0.2318,
          "b": -0.0522,
          "pos": 0.1813,
          "chrom": -0.1747
        },
        {
          "t": 87.467,
          "r": -0.2012,
          "g": -0.1972,
          "b": 0.0185,
          "pos": 0.0985,
          "chrom": -0.201
        },
        {
          "t": 87.6,
          "r": -0.0492,
          "g": -0.0747,
          "b": 0.1239,
          "pos": 0.284,
          "chrom": -0.2781
        },
        {
          "t": 87.733,
          "r": -0.0309,
          "g": -0.0708,
          "b": 0.1189,
          "pos": -0.1948,
          "chrom": 0.3042
        },
        {
          "t": 87.933,
          "r": -0.0944,
          "g": -0.0808,
          "b": 0.1382,
          "pos": -0.0334,
          "chrom": 0.0288
        },
        {
          "t": 88.067,
          "r": -0.1858,
          "g": -0.1093,
          "b": 0.1114,
          "pos": 1.0272,
          "chrom": -1.1012
        },
        {
          "t": 88.267,
          "r": -0.0202,
          "g": -0.1236,
          "b": 0.0605,
          "pos": -0.9725,
          "chrom": 1.0312
        },
        {
          "t": 88.4,
          "r": -0.0397,
          "g": -0.0877,
          "b": 0.0852,
          "pos": 0.5917,
          "chrom": -0.5279
        },
        {
          "t": 88.533,
          "r": -0.0069,
          "g": -0.1177,
          "b": 0.0677,
          "pos": -0.1467,
          "chrom": 0.1597
        },
        {
          "t": 88.733,
          "r": -0.0597,
          "g": -0.1406,
          "b": 0.0605,
          "pos": 0.5522,
          "chrom": -0.6277
        },
        {
          "t": 88.867,
          "r": 0.0166,
          "g": -0.1629,
          "b": -0.005,
          "pos": 0.0426,
          "chrom": 0.0286
        },
        {
          "t": 89.0,
          "r": 0.0186,
          "g": -0.2188,
          "b": -0.0595,
          "pos": -0.7234,
          "chrom": 0.7569
        },
        {
          "t": 89.2,
          "r": -0.0098,
          "g": -0.1615,
          "b": 0.0014,
          "pos": 0.7163,
          "chrom": -0.7362
        },
        {
          "t": 89.333,
          "r": 0.0014,
          "g": -0.2388,
          "b": -0.0655,
          "pos": -0.5861,
          "chrom": 0.5562
        },
        {
          "t": 89.467,
          "r": 0.0214,
          "g": -0.2132,
          "b": -0.061,
          "pos": 0.1414,
          "chrom": -0.0935
        },
        {
          "t": 89.667,
          "r": 0.0739,
          "g": -0.1767,
          "b": -0.0194,
          "pos": -0.2389,
          "chrom": 0.2258
        },
        {
          "t": 89.8,
          "r": 0.0398,
          "g": -0.2154,
          "b": -0.0643,
          "pos": -0.5441,
          "chrom": 0.5096
        },
        {
          "t": 89.933,
          "r": -0.0034,
          "g": -0.1697,
          "b": -0.0288,
          "pos": 0.6703,
          "chrom": -0.6823
        },
        {
          "t": 90.133,
          "r": 0.0522,
          "g": -0.1704,
          "b": -0.044,
          "pos": -0.5212,
          "chrom": 0.5459
        },
        {
          "t": 90.267,
          "r": 0.0707,
          "g": -0.1218,
          "b": 0.0147,
          "pos": 0.261,
          "chrom": -0.2484
        },
        {
          "t": 90.4,
          "r": 0.021,
          "g": -0.1704,
          "b": -0.0212,
          "pos": 0.0856,
          "chrom": -0.0996
        },
        {
          "t": 90.6,
          "r": -0.0771,
          "g": -0.3049,
          "b": -0.169,
          "pos": 0.2471,
          "chrom": -0.2254
        },
        {
          "t": 90.733,
          "r": -0.0834,
          "g": -0.3581,
          "b": -0.2279,
          "pos": -0.3396,
          "chrom": 0.3627
        },
        {
          "t": 90.867,
          "r": -0.1361,
          "g": -0.4015,
          "b": -0.2778,
          "pos": -0.1086,
          "chrom": 0.1273
        },
        {
          "t": 91.067,
          "r": -0.0858,
          "g": -0.3122,
          "b": -0.1771,
          "pos": 0.3374,
          "chrom": -0.3714
        },
        {
          "t": 91.2,
          "r": -0.1425,
          "g": -0.4062,
          "b": -0.27,
          "pos": -0.5616,
          "chrom": 0.5249
        },
        {
          "t": 91.333,
          "r": -0.1592,
          "g": -0.3899,
          "b": -0.2659,
          "pos": 0.3048,
          "chrom": -0.2631
        },
        {
          "t": 91.533,
          "r": -0.2375,
          "g": -0.5023,
          "b": -0.3723,
          "pos": -0.4594,
          "chrom": 0.4381
        },
        {
          "t": 91.667,
          "r": -0.303,
          "g": -0.5165,
          "b": -0.4058,
          "pos": 0.6398,
          "chrom": -0.6081
        },
        {
          "t": 91.8,
          "r": -0.316,
          "g": -0.5643,
          "b": -0.4488,
          "pos": -0.3094,
          "chrom": 0.3001
        },
        {
          "t": 92.0,
          "r": -0.3386,
          "g": -0.5547,
          "b": -0.4663,
          "pos": 0.4178,
          "chrom": -0.3979
        },
        {
          "t": 92.133,
          "r": -0.4554,
          "g": -0.6954,
          "b": -0.6248,
          "pos": -0.0552,
          "chrom": 0.082
        },
        {
          "t": 92.267,
          "r": -0.5254,
          "g": -0.7584,
          "b": -0.7009,
          "pos": -0.1394,
          "chrom": 0.1057
        },
        {
          "t": 92.467,
          "r": -0.4171,
          "g": -0.6811,
          "b": -0.6551,
          "pos": -0.0303,
          "chrom": 0.0554
        },
        {
          "t": 92.6,
          "r": -0.4585,
          "g": -0.7297,
          "b": -0.6954,
          "pos": -0.2635,
          "chrom": 0.2793
        },
        {
          "t": 92.733,
          "r": -0.4941,
          "g": -0.7237,
          "b": -0.6866,
          "pos": 0.4118,
          "chrom": -0.3813
        },
        {
          "t": 92.933,
          "r": -0.5311,
          "g": -0.7653,
          "b": -0.7085,
          "pos": -0.2843,
          "chrom": 0.2321
        },
        {
          "t": 93.067,
          "r": -0.3694,
          "g": -0.6323,
          "b": -0.6079,
          "pos": 0.1532,
          "chrom": -0.1143
        },
        {
          "t": 93.2,
          "r": -0.3687,
          "g": -0.6742,
          "b": -0.6581,
          "pos": -0.1222,
          "chrom": 0.1288
        },
        {
          "t": 93.4,
          "r": -0.3737,
          "g": -0.6614,
          "b": -0.6611,
          "pos": 0.6857,
          "chrom": -0.6562
        },
        {
          "t": 93.533,
          "r": -0.3664,
          "g": -0.6501,
          "b": -0.6412,
          "pos": -0.1758,
          "chrom": 0.167
        },
        {
          "t": 93.667,
          "r": -0.2802,
          "g": -0.5662,
          "b": -0.5647,
          "pos": -1.0171,
          "chrom": 1.0236
        },
        {
          "t": 93.867,
          "r": -0.1361,
          "g": -0.1932,
          "b": -0.2046,
          "pos": 0.5592,
          "chrom": -0.6178
        },
        {
          "t": 94.0,
          "r": -0.057,
          "g": -0.0858,
          "b": -0.1409,
          "pos": 0.1237,
          "chrom": -0.0796
        },
        {
          "t": 94.2,
          "r": 0.2252,
          "g": 0.1836,
          "b": 0.1048,
          "pos": -0.5073,
          "chrom": 0.524
        },
        {
          "t": 94.333,
          "r": 0.5292,
          "g": 0.5058,
          "b": 0.4237,
          "pos": 0.1826,
          "chrom": -0.2409
        },
        {
          "t": 94.467,
          "r": 0.6247,
          "g": 0.5497,
          "b": 0.4399,
          "pos": 0.2807,
          "chrom": -0.3039
        },
        {
          "t": 94.667,
          "r": 0.6652,
          "g": 0.5027,
          "b": 0.3643,
          "pos": -0.3592,
          "chrom": 0.4031
        },
        {
          "t": 94.8,
          "r": 0.802,
          "g": 0.6525,
          "b": 0.5201,
          "pos": -0.0103,
          "chrom": 0.0095
        },
        {
          "t": 94.933,
          "r": 0.8809,
          "g": 0.7519,
          "b": 0.6257,
          "pos": 0.3813,
          "chrom": -0.3849
        },
        {
          "t": 95.133,
          "r": 0.964,
          "g": 0.8354,
          "b": 0.7263,
          "pos": -0.0635,
          "chrom": 0.0476
        },
        {
          "t": 95.267,
          "r": 1.0293,
          "g": 0.9069,
          "b": 0.7944,
          "pos": -0.1299,
          "chrom": 0.131
        },
        {
          "t": 95.4,
          "r": 1.0803,
          "g": 0.9845,
          "b": 0.868,
          "pos": -0.0375,
          "chrom": 0.0384
        },
        {
          "t": 95.6,
          "r": 1.0056,
          "g": 0.9704,
          "b": 0.85,
          "pos": 0.1125,
          "chrom": -0.0944
        },
        {
          "t": 95.733,
          "r": 0.9855,
          "g": 0.9847,
          "b": 0.8825,
          "pos": -0.0536,
          "chrom": 0.0609
        },
        {
          "t": 95.867,
          "r": 0.9737,
          "g": 1.0054,
          "b": 0.9247,
          "pos": 0.1775,
          "chrom": -0.1598
        },
        {
          "t": 96.067,
          "r": 1.1016,
          "g": 1.1176,
          "b": 1.0699,
          "pos": -0.2734,
          "chrom": 0.2516
        },
        {
          "t": 96.2,
          "r": 1.1345,
          "g": 1.149,
          "b": 1.0975,
          "pos": -0.019,
          "chrom": 0.0058
        },
        {
          "t": 96.333,
          "r": 1.1337,
          "g": 1.1295,
          "b": 1.0729,
          "pos": -0.0038,
          "chrom": 0.0037
        },
        {
          "t": 96.533,
          "r": 1.0495,
          "g": 1.0298,
          "b": 0.9841,
          "pos": 0.1907,
          "chrom": -0.1243
        },
        {
          "t": 96.667,
          "r": 0.842,
          "g": 0.8226,
          "b": 0.8258,
          "pos": 0.0043,
          "chrom": -0.0013
        }
      ],
      "hrTracks": {
        "pos_face_full": [
          {
            "t": 0.0,
            "bpm": 105.908
          },
          {
            "t": 5.0,
            "bpm": 117.773
          },
          {
            "t": 10.0,
            "bpm": 103.271
          },
          {
            "t": 15.0,
            "bpm": 89.209
          },
          {
            "t": 20.0,
            "bpm": 106.348
          },
          {
            "t": 25.0,
            "bpm": 97.119
          },
          {
            "t": 30.0,
            "bpm": 119.092
          },
          {
            "t": 35.0,
            "bpm": 103.711
          },
          {
            "t": 40.0,
            "bpm": 87.891
          },
          {
            "t": 45.0,
            "bpm": 84.375
          },
          {
            "t": 50.0,
            "bpm": 102.832
          },
          {
            "t": 55.0,
            "bpm": 102.393
          },
          {
            "t": 60.0,
            "bpm": 101.074
          },
          {
            "t": 65.0,
            "bpm": 99.756
          },
          {
            "t": 70.0,
            "bpm": 126.123
          },
          {
            "t": 75.0,
            "bpm": 99.316
          }
        ],
        "chrom_face_full": [
          {
            "t": 0.0,
            "bpm": 105.908
          },
          {
            "t": 5.0,
            "bpm": 117.334
          },
          {
            "t": 10.0,
            "bpm": 103.711
          },
          {
            "t": 15.0,
            "bpm": 106.348
          },
          {
            "t": 20.0,
            "bpm": 105.908
          },
          {
            "t": 25.0,
            "bpm": 97.998
          },
          {
            "t": 30.0,
            "bpm": 95.801
          },
          {
            "t": 35.0,
            "bpm": 103.271
          },
          {
            "t": 40.0,
            "bpm": 87.451
          },
          {
            "t": 45.0,
            "bpm": 83.936
          },
          {
            "t": 50.0,
            "bpm": 84.814
          },
          {
            "t": 55.0,
            "bpm": 102.832
          },
          {
            "t": 60.0,
            "bpm": 100.635
          },
          {
            "t": 65.0,
            "bpm": 99.756
          },
          {
            "t": 70.0,
            "bpm": 126.123
          },
          {
            "t": 75.0,
            "bpm": 99.316
          }
        ],
        "sqi_top_window": [
          {
            "t": 0.0,
            "bpm": 110.742
          },
          {
            "t": 5.0,
            "bpm": 117.334
          },
          {
            "t": 10.0,
            "bpm": 93.164
          },
          {
            "t": 15.0,
            "bpm": 112.939
          },
          {
            "t": 20.0,
            "bpm": 99.316
          },
          {
            "t": 25.0,
            "bpm": 97.559
          },
          {
            "t": 30.0,
            "bpm": 103.711
          },
          {
            "t": 35.0,
            "bpm": 92.285
          },
          {
            "t": 40.0,
            "bpm": 94.922
          },
          {
            "t": 45.0,
            "bpm": 90.527
          },
          {
            "t": 50.0,
            "bpm": 90.527
          },
          {
            "t": 55.0,
            "bpm": 104.15
          },
          {
            "t": 60.0,
            "bpm": 101.074
          },
          {
            "t": 65.0,
            "bpm": 105.469
          },
          {
            "t": 70.0,
            "bpm": 85.254
          },
          {
            "t": 75.0,
            "bpm": 99.316
          }
        ],
        "trained_peak_selector_current": [
          {
            "t": 0.0,
            "bpm": 203.467
          },
          {
            "t": 5.0,
            "bpm": 190.723
          },
          {
            "t": 10.0,
            "bpm": 193.359
          },
          {
            "t": 15.0,
            "bpm": 190.723
          },
          {
            "t": 20.0,
            "bpm": 191.162
          },
          {
            "t": 25.0,
            "bpm": 199.512
          },
          {
            "t": 30.0,
            "bpm": 200.391
          },
          {
            "t": 35.0,
            "bpm": 197.754
          },
          {
            "t": 40.0,
            "bpm": 191.602
          },
          {
            "t": 45.0,
            "bpm": 195.117
          },
          {
            "t": 50.0,
            "bpm": 199.951
          },
          {
            "t": 55.0,
            "bpm": 192.92
          },
          {
            "t": 60.0,
            "bpm": 205.664
          },
          {
            "t": 65.0,
            "bpm": 190.723
          },
          {
            "t": 70.0,
            "bpm": 199.072
          },
          {
            "t": 75.0,
            "bpm": 201.27
          }
        ],
        "oracle_window_peak": [
          {
            "t": 0.0,
            "bpm": 207.861
          },
          {
            "t": 5.0,
            "bpm": 193.799
          },
          {
            "t": 10.0,
            "bpm": 195.996
          },
          {
            "t": 15.0,
            "bpm": 202.148
          },
          {
            "t": 20.0,
            "bpm": 199.951
          },
          {
            "t": 25.0,
            "bpm": 205.225
          },
          {
            "t": 30.0,
            "bpm": 206.543
          },
          {
            "t": 35.0,
            "bpm": 197.754
          },
          {
            "t": 40.0,
            "bpm": 194.238
          },
          {
            "t": 45.0,
            "bpm": 200.391
          },
          {
            "t": 50.0,
            "bpm": 203.467
          },
          {
            "t": 55.0,
            "bpm": 203.906
          },
          {
            "t": 60.0,
            "bpm": 205.664
          },
          {
            "t": 65.0,
            "bpm": 201.27
          },
          {
            "t": 70.0,
            "bpm": 199.072
          },
          {
            "t": 75.0,
            "bpm": 202.148
          }
        ]
      }
    },
    {
      "video": "4.mp4",
      "durationSec": 62.947,
      "label": {
        "bpm_min": 111.0,
        "bpm_max": 120.0,
        "bpm_target": 115.5
      },
      "waveform": [
        {
          "t": 0.0,
          "r": -0.0707,
          "g": -0.1024,
          "b": -0.0445,
          "pos": -0.0187,
          "chrom": 0.0224
        },
        {
          "t": 0.133,
          "r": -0.1807,
          "g": -0.2244,
          "b": -0.1737,
          "pos": -0.4036,
          "chrom": 0.4736
        },
        {
          "t": 0.2,
          "r": -0.1935,
          "g": -0.2301,
          "b": -0.1856,
          "pos": -0.529,
          "chrom": 0.4969
        },
        {
          "t": 0.333,
          "r": -0.2057,
          "g": -0.2433,
          "b": -0.2235,
          "pos": 0.469,
          "chrom": -0.549
        },
        {
          "t": 0.4,
          "r": -0.1798,
          "g": -0.2279,
          "b": -0.2171,
          "pos": 0.8447,
          "chrom": -0.837
        },
        {
          "t": 0.533,
          "r": -0.1488,
          "g": -0.1976,
          "b": -0.1807,
          "pos": -0.1041,
          "chrom": 0.2715
        },
        {
          "t": 0.6,
          "r": -0.1081,
          "g": -0.1498,
          "b": -0.1307,
          "pos": -0.467,
          "chrom": 0.6415
        },
        {
          "t": 0.733,
          "r": -0.1691,
          "g": -0.2048,
          "b": -0.1863,
          "pos": -0.035,
          "chrom": 0.2173
        },
        {
          "t": 0.8,
          "r": -0.2157,
          "g": -0.2521,
          "b": -0.2328,
          "pos": -0.1667,
          "chrom": 0.0959
        },
        {
          "t": 0.933,
          "r": -0.3811,
          "g": -0.4399,
          "b": -0.4259,
          "pos": -0.6068,
          "chrom": -0.2544
        },
        {
          "t": 1.0,
          "r": -0.6149,
          "g": -0.7192,
          "b": -0.7242,
          "pos": 0.0323,
          "chrom": -0.3799
        },
        {
          "t": 1.133,
          "r": -1.2366,
          "g": -1.4123,
          "b": -1.4275,
          "pos": 1.3534,
          "chrom": -0.5191
        },
        {
          "t": 1.2,
          "r": -1.1667,
          "g": -1.3687,
          "b": -1.3979,
          "pos": 0.9617,
          "chrom": -0.5258
        },
        {
          "t": 1.333,
          "r": -1.4447,
          "g": -1.5,
          "b": -1.5,
          "pos": -0.7193,
          "chrom": 0.8805
        },
        {
          "t": 1.4,
          "r": -1.4643,
          "g": -1.5,
          "b": -1.5,
          "pos": -1.4754,
          "chrom": 1.4601
        },
        {
          "t": 1.533,
          "r": -1.479,
          "g": -1.5,
          "b": -1.5,
          "pos": -0.9128,
          "chrom": 0.084
        },
        {
          "t": 1.6,
          "r": -1.5,
          "g": -1.5,
          "b": -1.5,
          "pos": 0.6115,
          "chrom": -0.8234
        },
        {
          "t": 1.733,
          "r": -1.5,
          "g": -1.5,
          "b": -1.5,
          "pos": 1.5,
          "chrom": -1.015
        },
        {
          "t": 1.8,
          "r": -1.3912,
          "g": -1.4793,
          "b": -1.4498,
          "pos": 0.7094,
          "chrom": -0.8311
        },
        {
          "t": 1.933,
          "r": -1.2469,
          "g": -1.3508,
          "b": -1.3071,
          "pos": -0.6952,
          "chrom": 0.5294
        },
        {
          "t": 2.067,
          "r": -1.0286,
          "g": -1.2392,
          "b": -1.2637,
          "pos": -0.7256,
          "chrom": 1.3158
        },
        {
          "t": 2.133,
          "r": -0.8022,
          "g": -1.0003,
          "b": -1.0287,
          "pos": -0.2704,
          "chrom": 0.4799
        },
        {
          "t": 2.267,
          "r": -0.5052,
          "g": -0.5986,
          "b": -0.5899,
          "pos": 0.3393,
          "chrom": -0.6292
        },
        {
          "t": 2.333,
          "r": -0.4313,
          "g": -0.4949,
          "b": -0.4695,
          "pos": 0.205,
          "chrom": -0.5913
        },
        {
          "t": 2.467,
          "r": -0.3567,
          "g": -0.4415,
          "b": -0.4555,
          "pos": 0.2358,
          "chrom": -0.3852
        },
        {
          "t": 2.533,
          "r": -0.4149,
          "g": -0.5144,
          "b": -0.5331,
          "pos": 0.2393,
          "chrom": 0.0881
        },
        {
          "t": 2.667,
          "r": -0.4557,
          "g": -0.5464,
          "b": -0.5622,
          "pos": -0.3014,
          "chrom": 0.4737
        },
        {
          "t": 2.733,
          "r": -0.4551,
          "g": -0.5414,
          "b": -0.5548,
          "pos": -0.3196,
          "chrom": 0.1693
        },
        {
          "t": 2.867,
          "r": -0.5199,
          "g": -0.6109,
          "b": -0.6274,
          "pos": 0.217,
          "chrom": -0.0239
        },
        {
          "t": 2.933,
          "r": -0.549,
          "g": -0.6469,
          "b": -0.6654,
          "pos": 0.2251,
          "chrom": -0.0988
        },
        {
          "t": 3.067,
          "r": -0.4064,
          "g": -0.4891,
          "b": -0.504,
          "pos": 0.0083,
          "chrom": -0.2995
        },
        {
          "t": 3.133,
          "r": -0.3921,
          "g": -0.4689,
          "b": -0.4767,
          "pos": 0.0052,
          "chrom": -0.0926
        },
        {
          "t": 3.267,
          "r": -0.3426,
          "g": -0.4111,
          "b": -0.4118,
          "pos": -0.1765,
          "chrom": 0.3277
        },
        {
          "t": 3.333,
          "r": -0.3269,
          "g": -0.3935,
          "b": -0.3947,
          "pos": -0.174,
          "chrom": 0.3321
        },
        {
          "t": 3.467,
          "r": -0.2679,
          "g": -0.3232,
          "b": -0.3267,
          "pos": 0.143,
          "chrom": -0.1641
        },
        {
          "t": 3.533,
          "r": -0.2597,
          "g": -0.3157,
          "b": -0.319,
          "pos": 0.1148,
          "chrom": -0.2998
        },
        {
          "t": 3.667,
          "r": -0.2785,
          "g": -0.3629,
          "b": -0.3738,
          "pos": -0.0625,
          "chrom": 0.004
        },
        {
          "t": 3.733,
          "r": -0.2926,
          "g": -0.3857,
          "b": -0.3983,
          "pos": 0.0869,
          "chrom": -0.0383
        },
        {
          "t": 3.867,
          "r": -0.2865,
          "g": -0.3878,
          "b": -0.3923,
          "pos": 0.2834,
          "chrom": -0.2305
        },
        {
          "t": 3.933,
          "r": -0.2789,
          "g": -0.3792,
          "b": -0.3778,
          "pos": 0.0057,
          "chrom": 0.1427
        },
        {
          "t": 4.067,
          "r": -0.2274,
          "g": -0.3348,
          "b": -0.3236,
          "pos": -0.4295,
          "chrom": 0.5957
        },
        {
          "t": 4.2,
          "r": -0.1183,
          "g": -0.2207,
          "b": -0.2189,
          "pos": 0.0555,
          "chrom": -0.2664
        },
        {
          "t": 4.267,
          "r": -0.0925,
          "g": -0.202,
          "b": -0.2082,
          "pos": 0.2556,
          "chrom": -0.5218
        },
        {
          "t": 4.4,
          "r": -0.1056,
          "g": -0.2375,
          "b": -0.2584,
          "pos": 0.3459,
          "chrom": -0.4212
        },
        {
          "t": 4.467,
          "r": -0.134,
          "g": -0.2775,
          "b": -0.302,
          "pos": -0.0262,
          "chrom": 0.1016
        },
        {
          "t": 4.6,
          "r": -0.1541,
          "g": -0.3026,
          "b": -0.3202,
          "pos": -0.381,
          "chrom": 0.6099
        },
        {
          "t": 4.667,
          "r": -0.1475,
          "g": -0.2843,
          "b": -0.3017,
          "pos": -0.0764,
          "chrom": 0.3032
        },
        {
          "t": 4.8,
          "r": -0.0542,
          "g": -0.1552,
          "b": -0.1579,
          "pos": 0.2225,
          "chrom": -0.2799
        },
        {
          "t": 4.867,
          "r": -0.0138,
          "g": -0.0944,
          "b": -0.0915,
          "pos": 0.3383,
          "chrom": -0.5665
        },
        {
          "t": 5.0,
          "r": 0.0485,
          "g": -0.0131,
          "b": 0.0045,
          "pos": -0.0372,
          "chrom": -0.0262
        },
        {
          "t": 5.067,
          "r": 0.0508,
          "g": -0.0093,
          "b": 0.0103,
          "pos": -0.2701,
          "chrom": 0.36
        },
        {
          "t": 5.2,
          "r": 0.0953,
          "g": 0.0561,
          "b": 0.0804,
          "pos": -0.231,
          "chrom": 0.2384
        },
        {
          "t": 5.267,
          "r": 0.0977,
          "g": 0.0603,
          "b": 0.0798,
          "pos": -0.1981,
          "chrom": 0.1726
        },
        {
          "t": 5.4,
          "r": 0.0802,
          "g": 0.0225,
          "b": 0.0156,
          "pos": 0.3553,
          "chrom": -0.2481
        },
        {
          "t": 5.467,
          "r": 0.0808,
          "g": 0.0226,
          "b": 0.0112,
          "pos": 0.361,
          "chrom": -0.2819
        },
        {
          "t": 5.6,
          "r": 0.0943,
          "g": 0.0366,
          "b": 0.0256,
          "pos": 0.0963,
          "chrom": -0.1889
        },
        {
          "t": 5.667,
          "r": 0.0819,
          "g": 0.0172,
          "b": 0.0018,
          "pos": 0.1071,
          "chrom": -0.1737
        },
        {
          "t": 5.8,
          "r": 0.0677,
          "g": -0.0088,
          "b": -0.0184,
          "pos": -0.5736,
          "chrom": 0.6297
        },
        {
          "t": 5.867,
          "r": 0.0621,
          "g": -0.0127,
          "b": -0.0273,
          "pos": -0.4397,
          "chrom": 0.4894
        },
        {
          "t": 6.0,
          "r": 0.0694,
          "g": -0.0148,
          "b": -0.0512,
          "pos": 0.4965,
          "chrom": -0.5103
        },
        {
          "t": 6.133,
          "r": 0.0661,
          "g": -0.0224,
          "b": -0.055,
          "pos": 0.0881,
          "chrom": -0.0793
        },
        {
          "t": 6.2,
          "r": 0.0662,
          "g": -0.0243,
          "b": -0.0559,
          "pos": -0.0864,
          "chrom": 0.0975
        },
        {
          "t": 6.333,
          "r": 0.0657,
          "g": -0.0241,
          "b": -0.0525,
          "pos": -0.1744,
          "chrom": 0.1769
        },
        {
          "t": 6.4,
          "r": 0.0503,
          "g": -0.0433,
          "b": -0.0727,
          "pos": -0.037,
          "chrom": 0.0698
        },
        {
          "t": 6.533,
          "r": 0.0437,
          "g": -0.0436,
          "b": -0.0701,
          "pos": 0.1395,
          "chrom": -0.1163
        },
        {
          "t": 6.6,
          "r": 0.0489,
          "g": -0.0467,
          "b": -0.0781,
          "pos": 0.0339,
          "chrom": -0.062
        },
        {
          "t": 6.733,
          "r": 0.045,
          "g": -0.0501,
          "b": -0.0822,
          "pos": -0.1556,
          "chrom": 0.1092
        },
        {
          "t": 6.8,
          "r": 0.0369,
          "g": -0.0599,
          "b": -0.0926,
          "pos": -0.0651,
          "chrom": 0.0698
        },
        {
          "t": 6.933,
          "r": 0.0245,
          "g": -0.0677,
          "b": -0.1059,
          "pos": 0.1948,
          "chrom": -0.137
        },
        {
          "t": 7.0,
          "r": 0.0342,
          "g": -0.067,
          "b": -0.1091,
          "pos": 0.0233,
          "chrom": 0.0522
        },
        {
          "t": 7.133,
          "r": 0.038,
          "g": -0.0596,
          "b": -0.1054,
          "pos": 0.0474,
          "chrom": -0.027
        },
        {
          "t": 7.2,
          "r": 0.0521,
          "g": -0.0461,
          "b": -0.0923,
          "pos": 0.1164,
          "chrom": -0.1765
        },
        {
          "t": 7.333,
          "r": 0.0258,
          "g": -0.0828,
          "b": -0.1311,
          "pos": -0.22,
          "chrom": 0.1658
        },
        {
          "t": 7.4,
          "r": 0.0128,
          "g": -0.0963,
          "b": -0.1457,
          "pos": -0.1494,
          "chrom": 0.1235
        },
        {
          "t": 7.533,
          "r": -0.0421,
          "g": -0.1673,
          "b": -0.2278,
          "pos": 0.1568,
          "chrom": -0.1323
        },
        {
          "t": 7.6,
          "r": -0.0646,
          "g": -0.1981,
          "b": -0.2617,
          "pos": 0.1739,
          "chrom": -0.0813
        },
        {
          "t": 7.733,
          "r": -0.0937,
          "g": -0.2392,
          "b": -0.3087,
          "pos": 0.0757,
          "chrom": -0.0102
        },
        {
          "t": 7.8,
          "r": -0.0721,
          "g": -0.2172,
          "b": -0.2872,
          "pos": -0.1667,
          "chrom": 0.1334
        },
        {
          "t": 7.933,
          "r": -0.0734,
          "g": -0.2185,
          "b": -0.2892,
          "pos": -0.1627,
          "chrom": 0.11
        },
        {
          "t": 8.0,
          "r": -0.0774,
          "g": -0.2164,
          "b": -0.2902,
          "pos": 0.1415,
          "chrom": -0.1566
        },
        {
          "t": 8.133,
          "r": -0.0717,
          "g": -0.2083,
          "b": -0.2804,
          "pos": 0.1341,
          "chrom": -0.1013
        },
        {
          "t": 8.267,
          "r": -0.0548,
          "g": -0.1883,
          "b": -0.2575,
          "pos": -0.0542,
          "chrom": 0.0852
        },
        {
          "t": 8.333,
          "r": -0.0477,
          "g": -0.1761,
          "b": -0.2441,
          "pos": -0.0235,
          "chrom": 0.0285
        },
        {
          "t": 8.467,
          "r": -0.0401,
          "g": -0.1697,
          "b": -0.2396,
          "pos": -0.0411,
          "chrom": 0.031
        },
        {
          "t": 8.533,
          "r": -0.0384,
          "g": -0.167,
          "b": -0.2367,
          "pos": -0.0139,
          "chrom": 0.0054
        },
        {
          "t": 8.667,
          "r": -0.0402,
          "g": -0.1723,
          "b": -0.2488,
          "pos": 0.0628,
          "chrom": -0.052
        },
        {
          "t": 8.733,
          "r": -0.043,
          "g": -0.1767,
          "b": -0.2538,
          "pos": 0.0138,
          "chrom": 0.009
        },
        {
          "t": 8.867,
          "r": -0.0448,
          "g": -0.1785,
          "b": -0.2615,
          "pos": -0.0146,
          "chrom": 0.0441
        },
        {
          "t": 8.933,
          "r": -0.045,
          "g": -0.1788,
          "b": -0.2622,
          "pos": 0.0253,
          "chrom": -0.0052
        },
        {
          "t": 9.067,
          "r": -0.0356,
          "g": -0.1741,
          "b": -0.2662,
          "pos": -0.0062,
          "chrom": -0.0313
        },
        {
          "t": 9.133,
          "r": -0.0381,
          "g": -0.1776,
          "b": -0.2708,
          "pos": -0.0889,
          "chrom": 0.0687
        },
        {
          "t": 9.267,
          "r": -0.0532,
          "g": -0.1952,
          "b": -0.2883,
          "pos": 0.0844,
          "chrom": -0.0573
        },
        {
          "t": 9.333,
          "r": -0.045,
          "g": -0.185,
          "b": -0.2789,
          "pos": 0.1946,
          "chrom": -0.1861
        },
        {
          "t": 9.467,
          "r": -0.0514,
          "g": -0.1977,
          "b": -0.284,
          "pos": -0.0837,
          "chrom": 0.1248
        },
        {
          "t": 9.533,
          "r": -0.051,
          "g": -0.1989,
          "b": -0.282,
          "pos": -0.1184,
          "chrom": 0.1544
        },
        {
          "t": 9.667,
          "r": -0.0409,
          "g": -0.1826,
          "b": -0.2598,
          "pos": 0.0957,
          "chrom": -0.1497
        },
        {
          "t": 9.733,
          "r": -0.0386,
          "g": -0.1808,
          "b": -0.2546,
          "pos": 0.0221,
          "chrom": -0.0677
        },
        {
          "t": 9.867,
          "r": -0.0555,
          "g": -0.1994,
          "b": -0.2692,
          "pos": -0.1428,
          "chrom": 0.2009
        },
        {
          "t": 9.933,
          "r": -0.0535,
          "g": -0.1899,
          "b": -0.2589,
          "pos": 0.0531,
          "chrom": 0.0043
        },
        {
          "t": 10.067,
          "r": -0.061,
          "g": -0.1866,
          "b": -0.2535,
          "pos": 0.1627,
          "chrom": -0.1401
        },
        {
          "t": 10.2,
          "r": -0.0594,
          "g": -0.1809,
          "b": -0.245,
          "pos": -0.1048,
          "chrom": 0.0603
        },
        {
          "t": 10.267,
          "r": -0.0646,
          "g": -0.186,
          "b": -0.252,
          "pos": -0.1273,
          "chrom": 0.0493
        },
        {
          "t": 10.4,
          "r": -0.0857,
          "g": -0.2119,
          "b": -0.2796,
          "pos": -0.084,
          "chrom": 0.1022
        },
        {
          "t": 10.467,
          "r": -0.094,
          "g": -0.2223,
          "b": -0.2911,
          "pos": 0.1839,
          "chrom": -0.1411
        },
        {
          "t": 10.6,
          "r": -0.1034,
          "g": -0.234,
          "b": -0.3025,
          "pos": 0.2322,
          "chrom": -0.1467
        },
        {
          "t": 10.667,
          "r": -0.1142,
          "g": -0.2501,
          "b": -0.316,
          "pos": 0.049,
          "chrom": 0.0789
        },
        {
          "t": 10.8,
          "r": -0.1054,
          "g": -0.2382,
          "b": -0.2997,
          "pos": -0.2628,
          "chrom": 0.2139
        },
        {
          "t": 10.867,
          "r": -0.1214,
          "g": -0.26,
          "b": -0.3196,
          "pos": -0.502,
          "chrom": 0.3493
        },
        {
          "t": 11.0,
          "r": -0.1762,
          "g": -0.3182,
          "b": -0.3891,
          "pos": 0.2191,
          "chrom": -0.3348
        },
        {
          "t": 11.067,
          "r": -0.2259,
          "g": -0.3771,
          "b": -0.4493,
          "pos": 0.5567,
          "chrom": -0.5867
        },
        {
          "t": 11.2,
          "r": -0.2975,
          "g": -0.4671,
          "b": -0.5376,
          "pos": 0.0528,
          "chrom": 0.1721
        },
        {
          "t": 11.267,
          "r": -0.3056,
          "g": -0.471,
          "b": -0.5394,
          "pos": -0.0203,
          "chrom": 0.2697
        },
        {
          "t": 11.4,
          "r": -0.2426,
          "g": -0.396,
          "b": -0.4583,
          "pos": -0.194,
          "chrom": 0.1089
        },
        {
          "t": 11.467,
          "r": -0.245,
          "g": -0.3956,
          "b": -0.4553,
          "pos": -0.2611,
          "chrom": 0.1062
        },
        {
          "t": 11.6,
          "r": -0.2178,
          "g": -0.3548,
          "b": -0.405,
          "pos": 0.0037,
          "chrom": -0.0904
        },
        {
          "t": 11.667,
          "r": -0.2163,
          "g": -0.351,
          "b": -0.3958,
          "pos": -0.211,
          "chrom": 0.1261
        },
        {
          "t": 11.8,
          "r": -0.2266,
          "g": -0.3602,
          "b": -0.3966,
          "pos": 0.4289,
          "chrom": -0.3056
        },
        {
          "t": 11.867,
          "r": -0.2392,
          "g": -0.3745,
          "b": -0.4099,
          "pos": 1.0839,
          "chrom": -0.86
        },
        {
          "t": 12.0,
          "r": -0.1724,
          "g": -0.3213,
          "b": -0.3257,
          "pos": -0.5759,
          "chrom": 0.568
        },
        {
          "t": 12.067,
          "r": -0.1633,
          "g": -0.3062,
          "b": -0.3034,
          "pos": -1.0378,
          "chrom": 0.9041
        },
        {
          "t": 12.2,
          "r": -0.1595,
          "g": -0.3021,
          "b": -0.296,
          "pos": 0.0659,
          "chrom": -0.1254
        },
        {
          "t": 12.333,
          "r": -0.1763,
          "g": -0.3207,
          "b": -0.3179,
          "pos": 0.2866,
          "chrom": -0.2573
        },
        {
          "t": 12.4,
          "r": -0.1772,
          "g": -0.3203,
          "b": -0.3168,
          "pos": 0.4289,
          "chrom": -0.3452
        },
        {
          "t": 12.533,
          "r": -0.1866,
          "g": -0.3222,
          "b": -0.3195,
          "pos": 0.1234,
          "chrom": -0.0521
        },
        {
          "t": 12.6,
          "r": -0.1305,
          "g": -0.2615,
          "b": -0.2616,
          "pos": -0.27,
          "chrom": 0.2082
        },
        {
          "t": 12.733,
          "r": -0.1359,
          "g": -0.2506,
          "b": -0.2559,
          "pos": -0.5073,
          "chrom": 0.4665
        },
        {
          "t": 12.8,
          "r": -0.1424,
          "g": -0.2461,
          "b": -0.2543,
          "pos": -0.1129,
          "chrom": 0.1707
        },
        {
          "t": 12.933,
          "r": -0.1256,
          "g": -0.1911,
          "b": -0.2019,
          "pos": 0.4801,
          "chrom": -0.4991
        },
        {
          "t": 13.0,
          "r": -0.1,
          "g": -0.1465,
          "b": -0.1458,
          "pos": 0.1928,
          "chrom": -0.2126
        },
        {
          "t": 13.133,
          "r": -0.0886,
          "g": -0.1309,
          "b": -0.1301,
          "pos": -0.0189,
          "chrom": 0.1254
        },
        {
          "t": 13.2,
          "r": -0.0407,
          "g": -0.078,
          "b": -0.0803,
          "pos": 0.1211,
          "chrom": -0.0931
        },
        {
          "t": 13.333,
          "r": -0.0008,
          "g": -0.0274,
          "b": -0.0189,
          "pos": -0.1695,
          "chrom": 0.0661
        },
        {
          "t": 13.4,
          "r": 0.0066,
          "g": -0.0174,
          "b": -0.0039,
          "pos": -0.2212,
          "chrom": 0.1639
        },
        {
          "t": 13.533,
          "r": -0.0137,
          "g": -0.0371,
          "b": -0.0251,
          "pos": 0.0062,
          "chrom": 0.0447
        },
        {
          "t": 13.6,
          "r": -0.0267,
          "g": -0.0562,
          "b": -0.0454,
          "pos": -0.0274,
          "chrom": 0.1494
        },
        {
          "t": 13.733,
          "r": -0.0633,
          "g": -0.1046,
          "b": -0.1073,
          "pos": 0.1124,
          "chrom": -0.023
        },
        {
          "t": 13.8,
          "r": -0.0548,
          "g": -0.0932,
          "b": -0.0972,
          "pos": 0.1769,
          "chrom": -0.2667
        },
        {
          "t": 13.933,
          "r": -0.12,
          "g": -0.1794,
          "b": -0.1945,
          "pos": 0.0912,
          "chrom": -0.2237
        },
        {
          "t": 14.0,
          "r": -0.1707,
          "g": -0.2346,
          "b": -0.245,
          "pos": 0.0147,
          "chrom": -0.0325
        },
        {
          "t": 14.133,
          "r": -0.238,
          "g": -0.3205,
          "b": -0.3342,
          "pos": -0.1924,
          "chrom": 0.1898
        },
        {
          "t": 14.267,
          "r": -0.3076,
          "g": -0.4066,
          "b": -0.4281,
          "pos": 0.0566,
          "chrom": 0.2776
        },
        {
          "t": 14.333,
          "r": -0.3298,
          "g": -0.4306,
          "b": -0.4541,
          "pos": 0.1034,
          "chrom": 0.1395
        },
        {
          "t": 14.467,
          "r": -0.2418,
          "g": -0.3132,
          "b": -0.3304,
          "pos": -0.0512,
          "chrom": -0.2613
        },
        {
          "t": 14.533,
          "r": -0.2465,
          "g": -0.3206,
          "b": -0.3374,
          "pos": -0.0195,
          "chrom": -0.2275
        },
        {
          "t": 14.667,
          "r": -0.2692,
          "g": -0.3414,
          "b": -0.3621,
          "pos": 0.1593,
          "chrom": -0.1946
        },
        {
          "t": 14.733,
          "r": -0.2952,
          "g": -0.3721,
          "b": -0.3952,
          "pos": 0.1642,
          "chrom": -0.1026
        },
        {
          "t": 14.867,
          "r": -0.3206,
          "g": -0.3941,
          "b": -0.4111,
          "pos": -0.2023,
          "chrom": 0.5676
        },
        {
          "t": 14.933,
          "r": -0.3308,
          "g": -0.405,
          "b": -0.4195,
          "pos": -0.286,
          "chrom": 0.4426
        },
        {
          "t": 15.067,
          "r": -0.2513,
          "g": -0.2876,
          "b": -0.2975,
          "pos": 0.1778,
          "chrom": -0.5019
        },
        {
          "t": 15.133,
          "r": -0.2579,
          "g": -0.2902,
          "b": -0.3013,
          "pos": 0.1997,
          "chrom": -0.3532
        },
        {
          "t": 15.267,
          "r": -0.2669,
          "g": -0.2952,
          "b": -0.3024,
          "pos": -0.0196,
          "chrom": 0.0691
        },
        {
          "t": 15.333,
          "r": -0.2598,
          "g": -0.2815,
          "b": -0.2866,
          "pos": 0.0548,
          "chrom": -0.0174
        },
        {
          "t": 15.467,
          "r": -0.2434,
          "g": -0.2469,
          "b": -0.2406,
          "pos": -0.0367,
          "chrom": 0.2369
        },
        {
          "t": 15.533,
          "r": -0.2321,
          "g": -0.227,
          "b": -0.2181,
          "pos": -0.0452,
          "chrom": 0.1337
        },
        {
          "t": 15.667,
          "r": -0.1412,
          "g": -0.1052,
          "b": -0.0816,
          "pos": -0.1449,
          "chrom": -0.009
        },
        {
          "t": 15.733,
          "r": -0.143,
          "g": -0.104,
          "b": -0.0779,
          "pos": -0.1853,
          "chrom": 0.1391
        },
        {
          "t": 15.867,
          "r": -0.1066,
          "g": -0.0397,
          "b": -0.0014,
          "pos": 0.3881,
          "chrom": -0.4056
        },
        {
          "t": 15.933,
          "r": -0.0961,
          "g": -0.0241,
          "b": 0.0214,
          "pos": 0.3532,
          "chrom": -0.3457
        },
        {
          "t": 16.067,
          "r": -0.0649,
          "g": 0.0299,
          "b": 0.1009,
          "pos": -0.2052,
          "chrom": 0.3009
        },
        {
          "t": 16.133,
          "r": -0.0353,
          "g": 0.0768,
          "b": 0.1582,
          "pos": -0.1849,
          "chrom": 0.174
        },
        {
          "t": 16.267,
          "r": 0.0394,
          "g": 0.1836,
          "b": 0.2802,
          "pos": -0.2182,
          "chrom": 0.157
        },
        {
          "t": 16.4,
          "r": 0.1008,
          "g": 0.2748,
          "b": 0.3758,
          "pos": 0.1984,
          "chrom": -0.1089
        },
        {
          "t": 16.467,
          "r": 0.1303,
          "g": 0.3164,
          "b": 0.4178,
          "pos": 0.445,
          "chrom": -0.3426
        },
        {
          "t": 16.6,
          "r": 0.1818,
          "g": 0.3851,
          "b": 0.4949,
          "pos": -0.014,
          "chrom": 0.0606
        },
        {
          "t": 16.667,
          "r": 0.1883,
          "g": 0.3961,
          "b": 0.5064,
          "pos": -0.2385,
          "chrom": 0.2146
        },
        {
          "t": 16.8,
          "r": 0.1358,
          "g": 0.3223,
          "b": 0.418,
          "pos": -0.0517,
          "chrom": -0.086
        },
        {
          "t": 16.867,
          "r": 0.1076,
          "g": 0.2839,
          "b": 0.3715,
          "pos": -0.0482,
          "chrom": -0.1077
        },
        {
          "t": 17.0,
          "r": -0.0253,
          "g": 0.0995,
          "b": 0.1645,
          "pos": -0.0291,
          "chrom": -0.0286
        },
        {
          "t": 17.067,
          "r": -0.0983,
          "g": 0.0087,
          "b": 0.0665,
          "pos": 0.0612,
          "chrom": 0.068
        },
        {
          "t": 17.2,
          "r": -0.1965,
          "g": -0.1068,
          "b": -0.0462,
          "pos": 0.1834,
          "chrom": 0.2261
        },
        {
          "t": 17.267,
          "r": -0.1542,
          "g": -0.0503,
          "b": 0.0139,
          "pos": 0.2644,
          "chrom": -0.0848
        },
        {
          "t": 17.4,
          "r": -0.0297,
          "g": 0.0979,
          "b": 0.1807,
          "pos": -0.1593,
          "chrom": -0.1847
        },
        {
          "t": 17.467,
          "r": -0.0033,
          "g": 0.128,
          "b": 0.2171,
          "pos": -0.305,
          "chrom": 0.0091
        },
        {
          "t": 17.6,
          "r": 0.0206,
          "g": 0.1505,
          "b": 0.2428,
          "pos": -0.0201,
          "chrom": 0.0583
        },
        {
          "t": 17.667,
          "r": 0.0224,
          "g": 0.1495,
          "b": 0.2447,
          "pos": 0.1079,
          "chrom": 0.0381
        },
        {
          "t": 17.8,
          "r": 0.0535,
          "g": 0.188,
          "b": 0.2895,
          "pos": 0.0871,
          "chrom": 0.0214
        },
        {
          "t": 17.867,
          "r": 0.0671,
          "g": 0.2019,
          "b": 0.3062,
          "pos": 0.011,
          "chrom": 0.0712
        },
        {
          "t": 18.0,
          "r": 0.074,
          "g": 0.2136,
          "b": 0.3184,
          "pos": 0.0876,
          "chrom": -0.0842
        },
        {
          "t": 18.067,
          "r": 0.0989,
          "g": 0.245,
          "b": 0.3537,
          "pos": -0.0116,
          "chrom": -0.1093
        },
        {
          "t": 18.2,
          "r": 0.0859,
          "g": 0.2319,
          "b": 0.3387,
          "pos": -0.1289,
          "chrom": 0.0341
        },
        {
          "t": 18.333,
          "r": 0.0545,
          "g": 0.1957,
          "b": 0.2975,
          "pos": 0.0712,
          "chrom": 0.0344
        },
        {
          "t": 18.4,
          "r": 0.0474,
          "g": 0.1889,
          "b": 0.289,
          "pos": 0.1028,
          "chrom": -0.0014
        },
        {
          "t": 18.533,
          "r": 0.0649,
          "g": 0.2124,
          "b": 0.3121,
          "pos": 0.0224,
          "chrom": 0.0201
        },
        {
          "t": 18.6,
          "r": 0.0643,
          "g": 0.2056,
          "b": 0.3006,
          "pos": -0.0469,
          "chrom": 0.0535
        },
        {
          "t": 18.733,
          "r": 0.0984,
          "g": 0.2473,
          "b": 0.3429,
          "pos": 0.0033,
          "chrom": -0.086
        },
        {
          "t": 18.8,
          "r": 0.1002,
          "g": 0.2467,
          "b": 0.3402,
          "pos": 0.0568,
          "chrom": -0.1172
        },
        {
          "t": 18.933,
          "r": 0.095,
          "g": 0.236,
          "b": 0.3303,
          "pos": 0.0079,
          "chrom": 0.0707
        },
        {
          "t": 19.0,
          "r": 0.0959,
          "g": 0.2314,
          "b": 0.3215,
          "pos": -0.0121,
          "chrom": 0.1097
        },
        {
          "t": 19.133,
          "r": 0.1129,
          "g": 0.2511,
          "b": 0.3422,
          "pos": -0.0154,
          "chrom": -0.0402
        },
        {
          "t": 19.2,
          "r": 0.1051,
          "g": 0.2408,
          "b": 0.3315,
          "pos": -0.0207,
          "chrom": -0.0632
        },
        {
          "t": 19.333,
          "r": 0.0745,
          "g": 0.1994,
          "b": 0.2837,
          "pos": 0.0037,
          "chrom": 0.0418
        },
        {
          "t": 19.4,
          "r": 0.069,
          "g": 0.19,
          "b": 0.272,
          "pos": -0.0128,
          "chrom": 0.0739
        },
        {
          "t": 19.533,
          "r": 0.0647,
          "g": 0.1735,
          "b": 0.2438,
          "pos": 0.1202,
          "chrom": -0.08
        },
        {
          "t": 19.6,
          "r": 0.0739,
          "g": 0.1857,
          "b": 0.2582,
          "pos": 0.1203,
          "chrom": -0.0953
        },
        {
          "t": 19.733,
          "r": 0.0957,
          "g": 0.2099,
          "b": 0.2885,
          "pos": -0.2368,
          "chrom": 0.1207
        },
        {
          "t": 19.8,
          "r": 0.0964,
          "g": 0.2077,
          "b": 0.2877,
          "pos": -0.1374,
          "chrom": 0.0738
        },
        {
          "t": 19.933,
          "r": 0.085,
          "g": 0.1905,
          "b": 0.2665,
          "pos": 0.3407,
          "chrom": -0.2061
        },
        {
          "t": 20.0,
          "r": 0.1204,
          "g": 0.2289,
          "b": 0.3109,
          "pos": 0.141,
          "chrom": -0.0875
        },
        {
          "t": 20.133,
          "r": 0.157,
          "g": 0.2752,
          "b": 0.3677,
          "pos": -0.1938,
          "chrom": 0.1949
        },
        {
          "t": 20.2,
          "r": 0.1827,
          "g": 0.3079,
          "b": 0.4054,
          "pos": -0.0842,
          "chrom": 0.0621
        },
        {
          "t": 20.333,
          "r": 0.2313,
          "g": 0.3752,
          "b": 0.4786,
          "pos": -0.0886,
          "chrom": 0.0144
        },
        {
          "t": 20.467,
          "r": 0.2232,
          "g": 0.3747,
          "b": 0.4774,
          "pos": 0.2133,
          "chrom": -0.0856
        },
        {
          "t": 20.533,
          "r": 0.2475,
          "g": 0.4059,
          "b": 0.507,
          "pos": 0.3008,
          "chrom": -0.2261
        },
        {
          "t": 20.667,
          "r": 0.2784,
          "g": 0.4444,
          "b": 0.5503,
          "pos": -0.1477,
          "chrom": 0.1159
        },
        {
          "t": 20.733,
          "r": 0.2995,
          "g": 0.473,
          "b": 0.5808,
          "pos": -0.2412,
          "chrom": 0.1971
        },
        {
          "t": 20.867,
          "r": 0.2954,
          "g": 0.4674,
          "b": 0.5698,
          "pos": 0.0583,
          "chrom": -0.0644
        },
        {
          "t": 20.933,
          "r": 0.2908,
          "g": 0.4639,
          "b": 0.5623,
          "pos": 0.0873,
          "chrom": -0.0479
        },
        {
          "t": 21.067,
          "r": 0.2859,
          "g": 0.4495,
          "b": 0.5441,
          "pos": 0.0226,
          "chrom": 0.0219
        },
        {
          "t": 21.133,
          "r": 0.2786,
          "g": 0.4426,
          "b": 0.5363,
          "pos": 0.0572,
          "chrom": -0.0505
        },
        {
          "t": 21.267,
          "r": 0.2692,
          "g": 0.4325,
          "b": 0.5286,
          "pos": -0.0325,
          "chrom": -0.027
        },
        {
          "t": 21.333,
          "r": 0.2412,
          "g": 0.4006,
          "b": 0.4964,
          "pos": 0.0498,
          "chrom": -0.0663
        },
        {
          "t": 21.467,
          "r": 0.1939,
          "g": 0.3523,
          "b": 0.4499,
          "pos": 0.0052,
          "chrom": 0.1104
        },
        {
          "t": 21.533,
          "r": 0.1767,
          "g": 0.3355,
          "b": 0.4419,
          "pos": -0.1642,
          "chrom": 0.2249
        },
        {
          "t": 21.667,
          "r": 0.1782,
          "g": 0.3384,
          "b": 0.4346,
          "pos": -0.0034,
          "chrom": -0.1236
        },
        {
          "t": 21.733,
          "r": 0.1577,
          "g": 0.312,
          "b": 0.4054,
          "pos": 0.0531,
          "chrom": -0.1204
        },
        {
          "t": 21.867,
          "r": 0.1298,
          "g": 0.2746,
          "b": 0.3566,
          "pos": 0.1997,
          "chrom": -0.109
        },
        {
          "t": 21.933,
          "r": 0.143,
          "g": 0.2909,
          "b": 0.3739,
          "pos": 0.1106,
          "chrom": -0.0707
        },
        {
          "t": 22.067,
          "r": 0.1804,
          "g": 0.3364,
          "b": 0.4279,
          "pos": -0.3227,
          "chrom": 0.3758
        },
        {
          "t": 22.133,
          "r": 0.1872,
          "g": 0.3484,
          "b": 0.441,
          "pos": -0.1613,
          "chrom": 0.2278
        },
        {
          "t": 22.267,
          "r": 0.291,
          "g": 0.4847,
          "b": 0.587,
          "pos": 0.3739,
          "chrom": -0.4989
        },
        {
          "t": 22.4,
          "r": 0.3495,
          "g": 0.5696,
          "b": 0.6897,
          "pos": 0.1417,
          "chrom": -0.1446
        },
        {
          "t": 22.467,
          "r": 0.3762,
          "g": 0.6051,
          "b": 0.7297,
          "pos": -0.0498,
          "chrom": 0.1202
        },
        {
          "t": 22.6,
          "r": 0.4364,
          "g": 0.6676,
          "b": 0.7876,
          "pos": -0.4482,
          "chrom": 0.553
        },
        {
          "t": 22.667,
          "r": 0.4529,
          "g": 0.6858,
          "b": 0.8089,
          "pos": -0.7368,
          "chrom": 0.8345
        },
        {
          "t": 22.8,
          "r": 0.4363,
          "g": 0.6473,
          "b": 0.7382,
          "pos": 0.3568,
          "chrom": -0.3468
        },
        {
          "t": 22.867,
          "r": 0.4073,
          "g": 0.6018,
          "b": 0.6796,
          "pos": 1.0049,
          "chrom": -1.0728
        },
        {
          "t": 23.0,
          "r": 0.3309,
          "g": 0.4619,
          "b": 0.5235,
          "pos": 0.4411,
          "chrom": -0.6765
        },
        {
          "t": 23.067,
          "r": 0.2667,
          "g": 0.3755,
          "b": 0.4394,
          "pos": 0.023,
          "chrom": -0.2491
        },
        {
          "t": 23.2,
          "r": 0.1614,
          "g": 0.2224,
          "b": 0.2926,
          "pos": -0.86,
          "chrom": 0.9548
        },
        {
          "t": 23.267,
          "r": 0.1249,
          "g": 0.1737,
          "b": 0.2397,
          "pos": -1.1006,
          "chrom": 1.4424
        },
        {
          "t": 23.4,
          "r": 0.2138,
          "g": 0.2518,
          "b": 0.285,
          "pos": 0.0911,
          "chrom": 0.4215
        },
        {
          "t": 23.467,
          "r": 0.3138,
          "g": 0.3886,
          "b": 0.4137,
          "pos": 1.0218,
          "chrom": -0.8975
        },
        {
          "t": 23.6,
          "r": 0.5244,
          "g": 0.7416,
          "b": 0.8377,
          "pos": 1.0068,
          "chrom": -1.5
        },
        {
          "t": 23.667,
          "r": 0.5124,
          "g": 0.7707,
          "b": 0.899,
          "pos": 0.2889,
          "chrom": -0.7724
        },
        {
          "t": 23.8,
          "r": 0.3871,
          "g": 0.6609,
          "b": 0.8356,
          "pos": -1.2187,
          "chrom": 1.4289
        },
        {
          "t": 23.867,
          "r": 0.3163,
          "g": 0.6053,
          "b": 0.7944,
          "pos": -1.4812,
          "chrom": 1.5
        },
        {
          "t": 24.0,
          "r": 0.1072,
          "g": 0.4417,
          "b": 0.6526,
          "pos": 0.457,
          "chrom": -0.2212
        },
        {
          "t": 24.067,
          "r": 0.0978,
          "g": 0.4148,
          "b": 0.6038,
          "pos": 1.2047,
          "chrom": -1.3159
        },
        {
          "t": 24.2,
          "r": -0.1042,
          "g": 0.2484,
          "b": 0.4933,
          "pos": 0.7344,
          "chrom": -0.9998
        },
        {
          "t": 24.267,
          "r": -0.181,
          "g": 0.1863,
          "b": 0.457,
          "pos": 0.1204,
          "chrom": -0.2331
        },
        {
          "t": 24.4,
          "r": -0.3109,
          "g": 0.0647,
          "b": 0.3872,
          "pos": -1.1048,
          "chrom": 1.2763
        },
        {
          "t": 24.533,
          "r": -0.3142,
          "g": 0.078,
          "b": 0.4074,
          "pos": -0.1466,
          "chrom": 0.4333
        },
        {
          "t": 24.6,
          "r": -0.3282,
          "g": 0.0596,
          "b": 0.3843,
          "pos": 0.5186,
          "chrom": -0.3991
        },
        {
          "t": 24.733,
          "r": -0.1524,
          "g": 0.1599,
          "b": 0.4067,
          "pos": 0.7854,
          "chrom": -1.188
        },
        {
          "t": 24.8,
          "r": -0.147,
          "g": 0.16,
          "b": 0.4078,
          "pos": 0.0954,
          "chrom": -0.3759
        },
        {
          "t": 24.933,
          "r": -0.1908,
          "g": 0.0897,
          "b": 0.3355,
          "pos": -0.6903,
          "chrom": 0.8024
        },
        {
          "t": 25.0,
          "r": -0.1351,
          "g": 0.1259,
          "b": 0.3303,
          "pos": -0.1867,
          "chrom": 0.2351
        },
        {
          "t": 25.133,
          "r": -0.0959,
          "g": 0.1513,
          "b": 0.3386,
          "pos": -0.037,
          "chrom": 0.3285
        },
        {
          "t": 25.2,
          "r": -0.0668,
          "g": 0.1739,
          "b": 0.3593,
          "pos": -0.1589,
          "chrom": 0.4611
        },
        {
          "t": 25.333,
          "r": 0.1696,
          "g": 0.4014,
          "b": 0.5419,
          "pos": 0.7399,
          "chrom": -0.9566
        },
        {
          "t": 25.4,
          "r": 0.2274,
          "g": 0.4568,
          "b": 0.5915,
          "pos": 1.0059,
          "chrom": -1.239
        },
        {
          "t": 25.533,
          "r": 0.3124,
          "g": 0.5165,
          "b": 0.6565,
          "pos": -0.775,
          "chrom": 0.7386
        },
        {
          "t": 25.6,
          "r": 0.3213,
          "g": 0.5069,
          "b": 0.6473,
          "pos": -1.4828,
          "chrom": 1.4505
        },
        {
          "t": 25.733,
          "r": 0.289,
          "g": 0.4429,
          "b": 0.5409,
          "pos": -0.0423,
          "chrom": 0.0975
        },
        {
          "t": 25.8,
          "r": 0.2479,
          "g": 0.3789,
          "b": 0.4563,
          "pos": 1.0279,
          "chrom": -0.8432
        },
        {
          "t": 25.933,
          "r": 0.1696,
          "g": 0.2692,
          "b": 0.3203,
          "pos": 0.8187,
          "chrom": -0.7586
        },
        {
          "t": 26.0,
          "r": 0.1777,
          "g": 0.2432,
          "b": 0.3016,
          "pos": -0.4133,
          "chrom": 0.2947
        },
        {
          "t": 26.133,
          "r": 0.0446,
          "g": 0.0885,
          "b": 0.1343,
          "pos": -0.6246,
          "chrom": 0.5522
        },
        {
          "t": 26.2,
          "r": -0.0455,
          "g": -0.0118,
          "b": 0.0315,
          "pos": 0.0475,
          "chrom": 0.0327
        },
        {
          "t": 26.333,
          "r": -0.2164,
          "g": -0.1942,
          "b": -0.1517,
          "pos": 0.2965,
          "chrom": -0.0944
        },
        {
          "t": 26.467,
          "r": -0.2875,
          "g": -0.28,
          "b": -0.2374,
          "pos": -0.3116,
          "chrom": -0.1197
        },
        {
          "t": 26.533,
          "r": -0.4444,
          "g": -0.4595,
          "b": -0.4269,
          "pos": -0.137,
          "chrom": -0.1473
        },
        {
          "t": 26.667,
          "r": -0.6598,
          "g": -0.7139,
          "b": -0.6911,
          "pos": 0.3211,
          "chrom": 0.0027
        },
        {
          "t": 26.733,
          "r": -0.6512,
          "g": -0.7034,
          "b": -0.6769,
          "pos": 0.0578,
          "chrom": -0.0059
        },
        {
          "t": 26.867,
          "r": -0.6545,
          "g": -0.7046,
          "b": -0.6742,
          "pos": 0.1473,
          "chrom": 0.0027
        },
        {
          "t": 26.933,
          "r": -0.6458,
          "g": -0.6955,
          "b": -0.664,
          "pos": 0.1047,
          "chrom": 0.3133
        },
        {
          "t": 27.067,
          "r": -0.3412,
          "g": -0.3706,
          "b": -0.3451,
          "pos": -0.5217,
          "chrom": 0.1639
        },
        {
          "t": 27.133,
          "r": -0.3069,
          "g": -0.3332,
          "b": -0.3127,
          "pos": -0.2061,
          "chrom": -0.2671
        },
        {
          "t": 27.267,
          "r": -0.2205,
          "g": -0.2366,
          "b": -0.2151,
          "pos": 0.2958,
          "chrom": -0.1748
        },
        {
          "t": 27.333,
          "r": -0.1817,
          "g": -0.1958,
          "b": -0.1731,
          "pos": 0.2011,
          "chrom": -0.0863
        },
        {
          "t": 27.467,
          "r": -0.1255,
          "g": -0.1424,
          "b": -0.1199,
          "pos": 0.2707,
          "chrom": -0.106
        },
        {
          "t": 27.533,
          "r": -0.1171,
          "g": -0.1379,
          "b": -0.1161,
          "pos": 0.1163,
          "chrom": 0.1261
        },
        {
          "t": 27.667,
          "r": -0.0643,
          "g": -0.0824,
          "b": -0.0617,
          "pos": -0.2976,
          "chrom": 0.135
        },
        {
          "t": 27.733,
          "r": -0.0887,
          "g": -0.1063,
          "b": -0.0932,
          "pos": -0.2789,
          "chrom": -0.057
        },
        {
          "t": 27.867,
          "r": -0.1609,
          "g": -0.1778,
          "b": -0.1762,
          "pos": -0.4258,
          "chrom": 0.4135
        },
        {
          "t": 27.933,
          "r": -0.2027,
          "g": -0.223,
          "b": -0.2269,
          "pos": -0.0053,
          "chrom": 0.1829
        },
        {
          "t": 28.067,
          "r": -0.2088,
          "g": -0.2031,
          "b": -0.2285,
          "pos": 0.8831,
          "chrom": -0.6746
        },
        {
          "t": 28.133,
          "r": -0.1825,
          "g": -0.1728,
          "b": -0.2005,
          "pos": 0.4495,
          "chrom": -0.2735
        },
        {
          "t": 28.267,
          "r": -0.0496,
          "g": -0.0367,
          "b": -0.078,
          "pos": -0.4282,
          "chrom": 0.2603
        },
        {
          "t": 28.333,
          "r": -0.0125,
          "g": 0.0082,
          "b": -0.0328,
          "pos": -0.4676,
          "chrom": 0.1802
        },
        {
          "t": 28.467,
          "r": 0.0304,
          "g": 0.0713,
          "b": 0.0354,
          "pos": -0.1607,
          "chrom": 0.0706
        },
        {
          "t": 28.6,
          "r": 0.0649,
          "g": 0.1153,
          "b": 0.0851,
          "pos": 0.0175,
          "chrom": 0.0588
        },
        {
          "t": 28.667,
          "r": 0.0535,
          "g": 0.0995,
          "b": 0.0728,
          "pos": 0.0462,
          "chrom": 0.26
        },
        {
          "t": 28.8,
          "r": 0.0231,
          "g": 0.0668,
          "b": 0.0403,
          "pos": 0.8321,
          "chrom": -0.4772
        },
        {
          "t": 28.867,
          "r": 0.064,
          "g": 0.1039,
          "b": 0.0767,
          "pos": 0.9629,
          "chrom": -0.9928
        },
        {
          "t": 29.0,
          "r": -0.0593,
          "g": -0.031,
          "b": -0.0226,
          "pos": -0.9805,
          "chrom": 0.5201
        },
        {
          "t": 29.067,
          "r": -0.1838,
          "g": -0.1691,
          "b": -0.162,
          "pos": -1.4541,
          "chrom": 1.0201
        },
        {
          "t": 29.2,
          "r": -0.545,
          "g": -0.5561,
          "b": -0.5597,
          "pos": -0.1886,
          "chrom": 0.006
        },
        {
          "t": 29.267,
          "r": -0.7546,
          "g": -0.7667,
          "b": -0.7681,
          "pos": 0.6462,
          "chrom": -0.2193
        },
        {
          "t": 29.4,
          "r": -1.126,
          "g": -1.1276,
          "b": -1.1125,
          "pos": 1.238,
          "chrom": -0.3282
        },
        {
          "t": 29.467,
          "r": -0.9519,
          "g": -0.9696,
          "b": -0.972,
          "pos": 0.4697,
          "chrom": -0.3344
        },
        {
          "t": 29.6,
          "r": -0.943,
          "g": -0.9659,
          "b": -0.9666,
          "pos": -0.7782,
          "chrom": 0.1327
        },
        {
          "t": 29.667,
          "r": -0.97,
          "g": -0.9989,
          "b": -0.9991,
          "pos": -0.7677,
          "chrom": 0.2504
        },
        {
          "t": 29.8,
          "r": -1.0584,
          "g": -1.0998,
          "b": -1.1005,
          "pos": -0.1469,
          "chrom": -0.0758
        },
        {
          "t": 29.867,
          "r": -1.1302,
          "g": -1.1839,
          "b": -1.1834,
          "pos": 0.3052,
          "chrom": -0.0002
        },
        {
          "t": 30.0,
          "r": -1.2331,
          "g": -1.2937,
          "b": -1.2744,
          "pos": 0.3032,
          "chrom": 0.3385
        },
        {
          "t": 30.067,
          "r": -0.9922,
          "g": -1.0688,
          "b": -1.0744,
          "pos": 0.0336,
          "chrom": 0.018
        },
        {
          "t": 30.2,
          "r": -0.9655,
          "g": -1.038,
          "b": -1.0379,
          "pos": 0.2551,
          "chrom": -0.3866
        },
        {
          "t": 30.267,
          "r": -0.935,
          "g": -0.9979,
          "b": -0.9843,
          "pos": 0.4109,
          "chrom": -0.438
        },
        {
          "t": 30.4,
          "r": -0.9148,
          "g": -0.9513,
          "b": -0.9207,
          "pos": -0.2101,
          "chrom": -0.1548
        },
        {
          "t": 30.533,
          "r": -1.0658,
          "g": -1.1069,
          "b": -1.0728,
          "pos": -0.8283,
          "chrom": 1.0194
        },
        {
          "t": 30.6,
          "r": -1.2111,
          "g": -1.2538,
          "b": -1.2225,
          "pos": -0.7216,
          "chrom": 1.0333
        },
        {
          "t": 30.733,
          "r": -1.3027,
          "g": -1.3712,
          "b": -1.3905,
          "pos": 0.1715,
          "chrom": -0.1122
        },
        {
          "t": 30.8,
          "r": -1.3545,
          "g": -1.4061,
          "b": -1.4291,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 30.933,
          "r": -1.412,
          "g": -1.4123,
          "b": -1.3951,
          "pos": 0.9458,
          "chrom": -1.1493
        },
        {
          "t": 31.0,
          "r": -1.4018,
          "g": -1.4242,
          "b": -1.3679,
          "pos": -1.194,
          "chrom": 1.0356
        },
        {
          "t": 31.133,
          "r": -1.403,
          "g": -1.4041,
          "b": -1.3312,
          "pos": -0.7058,
          "chrom": 1.1159
        },
        {
          "t": 31.2,
          "r": -1.3921,
          "g": -1.3712,
          "b": -1.2827,
          "pos": 0.3455,
          "chrom": 0.0598
        },
        {
          "t": 31.333,
          "r": -1.1005,
          "g": -1.1262,
          "b": -1.0996,
          "pos": -0.0251,
          "chrom": -0.3424
        },
        {
          "t": 31.4,
          "r": -1.0444,
          "g": -1.0656,
          "b": -1.0467,
          "pos": -0.1816,
          "chrom": -0.2873
        },
        {
          "t": 31.533,
          "r": -0.995,
          "g": -1.0225,
          "b": -1.0227,
          "pos": 0.1216,
          "chrom": -0.2995
        },
        {
          "t": 31.6,
          "r": -1.0304,
          "g": -1.0556,
          "b": -1.0606,
          "pos": 0.3307,
          "chrom": -0.2453
        },
        {
          "t": 31.733,
          "r": -1.026,
          "g": -1.0449,
          "b": -1.0304,
          "pos": 0.1723,
          "chrom": 0.6669
        },
        {
          "t": 31.8,
          "r": -1.0291,
          "g": -1.0441,
          "b": -1.0204,
          "pos": 0.2254,
          "chrom": 0.287
        },
        {
          "t": 31.933,
          "r": -0.7381,
          "g": -0.7081,
          "b": -0.6606,
          "pos": -0.0547,
          "chrom": -0.6844
        },
        {
          "t": 32.0,
          "r": -0.7348,
          "g": -0.7192,
          "b": -0.6496,
          "pos": -0.5513,
          "chrom": 0.057
        },
        {
          "t": 32.133,
          "r": -0.7594,
          "g": -0.751,
          "b": -0.6727,
          "pos": -0.2549,
          "chrom": 0.1253
        },
        {
          "t": 32.2,
          "r": -0.7697,
          "g": -0.7619,
          "b": -0.6779,
          "pos": 0.0638,
          "chrom": -0.2041
        },
        {
          "t": 32.333,
          "r": -0.8673,
          "g": -0.8744,
          "b": -0.7947,
          "pos": 0.2455,
          "chrom": 0.6013
        },
        {
          "t": 32.4,
          "r": -0.8732,
          "g": -0.8804,
          "b": -0.8025,
          "pos": 0.4475,
          "chrom": 0.2259
        },
        {
          "t": 32.533,
          "r": -0.5791,
          "g": -0.5297,
          "b": -0.4545,
          "pos": 0.0325,
          "chrom": -0.6468
        },
        {
          "t": 32.667,
          "r": -0.5178,
          "g": -0.4604,
          "b": -0.3829,
          "pos": -0.4973,
          "chrom": 0.3427
        },
        {
          "t": 32.733,
          "r": -0.5056,
          "g": -0.4386,
          "b": -0.3672,
          "pos": -0.024,
          "chrom": -0.0494
        },
        {
          "t": 32.867,
          "r": -0.4856,
          "g": -0.4149,
          "b": -0.3444,
          "pos": 0.2431,
          "chrom": -0.0029
        },
        {
          "t": 32.933,
          "r": -0.4879,
          "g": -0.4231,
          "b": -0.3543,
          "pos": 0.004,
          "chrom": 0.4548
        },
        {
          "t": 33.067,
          "r": -0.3415,
          "g": -0.2796,
          "b": -0.2273,
          "pos": -0.0863,
          "chrom": -0.0538
        },
        {
          "t": 33.133,
          "r": -0.3369,
          "g": -0.2741,
          "b": -0.2263,
          "pos": -0.0776,
          "chrom": -0.2593
        },
        {
          "t": 33.267,
          "r": -0.3364,
          "g": -0.2713,
          "b": -0.2228,
          "pos": 0.0543,
          "chrom": -0.071
        },
        {
          "t": 33.333,
          "r": -0.3477,
          "g": -0.2869,
          "b": -0.2441,
          "pos": 0.2184,
          "chrom": -0.1383
        },
        {
          "t": 33.467,
          "r": -0.3315,
          "g": -0.2655,
          "b": -0.2172,
          "pos": 0.0396,
          "chrom": 0.1428
        },
        {
          "t": 33.533,
          "r": -0.3323,
          "g": -0.2555,
          "b": -0.1981,
          "pos": -0.2752,
          "chrom": 0.3737
        },
        {
          "t": 33.667,
          "r": -0.2918,
          "g": -0.2245,
          "b": -0.1727,
          "pos": -0.3629,
          "chrom": 0.2134
        },
        {
          "t": 33.733,
          "r": -0.3305,
          "g": -0.2795,
          "b": -0.2391,
          "pos": 0.0437,
          "chrom": -0.1636
        },
        {
          "t": 33.867,
          "r": -0.402,
          "g": -0.3811,
          "b": -0.3622,
          "pos": 1.0124,
          "chrom": -1.0073
        },
        {
          "t": 33.933,
          "r": -0.442,
          "g": -0.4371,
          "b": -0.423,
          "pos": 0.5299,
          "chrom": -0.5153
        },
        {
          "t": 34.067,
          "r": -0.5808,
          "g": -0.5672,
          "b": -0.5148,
          "pos": -0.9647,
          "chrom": 1.157
        },
        {
          "t": 34.133,
          "r": -0.6756,
          "g": -0.6436,
          "b": -0.5826,
          "pos": -0.6527,
          "chrom": 1.0011
        },
        {
          "t": 34.267,
          "r": -0.6688,
          "g": -0.6036,
          "b": -0.5412,
          "pos": -0.1744,
          "chrom": -0.2181
        },
        {
          "t": 34.333,
          "r": -0.6466,
          "g": -0.5546,
          "b": -0.4739,
          "pos": -0.5865,
          "chrom": -0.1511
        },
        {
          "t": 34.467,
          "r": -0.884,
          "g": -0.7747,
          "b": -0.6716,
          "pos": 1.0874,
          "chrom": -0.7282
        },
        {
          "t": 34.6,
          "r": -0.998,
          "g": -0.8003,
          "b": -0.6194,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 34.667,
          "r": -0.8834,
          "g": -0.647,
          "b": -0.4125,
          "pos": -0.2997,
          "chrom": 0.2137
        },
        {
          "t": 34.8,
          "r": -0.6302,
          "g": -0.395,
          "b": -0.1292,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 34.867,
          "r": -1.0765,
          "g": -0.7768,
          "b": -0.4907,
          "pos": -1.0412,
          "chrom": 1.184
        },
        {
          "t": 35.0,
          "r": -1.0878,
          "g": -0.767,
          "b": -0.5071,
          "pos": 1.3218,
          "chrom": -0.9548
        },
        {
          "t": 35.067,
          "r": -1.0758,
          "g": -0.7561,
          "b": -0.5046,
          "pos": 1.1114,
          "chrom": -1.2583
        },
        {
          "t": 35.2,
          "r": -0.9956,
          "g": -0.6934,
          "b": -0.4622,
          "pos": 0.7231,
          "chrom": -1.0001
        },
        {
          "t": 35.267,
          "r": -0.9439,
          "g": -0.6362,
          "b": -0.3876,
          "pos": 0.1228,
          "chrom": -0.3707
        },
        {
          "t": 35.4,
          "r": -0.8831,
          "g": -0.5962,
          "b": -0.3356,
          "pos": -0.3548,
          "chrom": 1.1362
        },
        {
          "t": 35.467,
          "r": -0.7821,
          "g": -0.577,
          "b": -0.3544,
          "pos": -0.3966,
          "chrom": 1.3913
        },
        {
          "t": 35.6,
          "r": -0.3301,
          "g": -0.1123,
          "b": 0.0767,
          "pos": -0.6615,
          "chrom": 0.0411
        },
        {
          "t": 35.667,
          "r": -0.1651,
          "g": 0.0374,
          "b": 0.2018,
          "pos": -0.4786,
          "chrom": -0.8853
        },
        {
          "t": 35.8,
          "r": -0.3563,
          "g": -0.2095,
          "b": -0.0835,
          "pos": -0.2922,
          "chrom": -0.0342
        },
        {
          "t": 35.867,
          "r": -0.6116,
          "g": -0.4027,
          "b": -0.205,
          "pos": 0.3106,
          "chrom": 0.4687
        },
        {
          "t": 36.0,
          "r": -1.0096,
          "g": -0.5747,
          "b": -0.2165,
          "pos": 1.5,
          "chrom": -1.0551
        },
        {
          "t": 36.067,
          "r": -0.8838,
          "g": -0.5379,
          "b": -0.2159,
          "pos": 0.712,
          "chrom": -0.4554
        },
        {
          "t": 36.2,
          "r": -0.8095,
          "g": -0.3965,
          "b": 0.0028,
          "pos": -1.5,
          "chrom": 0.8483
        },
        {
          "t": 36.267,
          "r": -0.8747,
          "g": -0.412,
          "b": 0.0342,
          "pos": -1.2512,
          "chrom": 0.576
        },
        {
          "t": 36.4,
          "r": -1.0028,
          "g": -0.4509,
          "b": 0.0622,
          "pos": 0.2501,
          "chrom": -0.1061
        },
        {
          "t": 36.467,
          "r": -1.0019,
          "g": -0.4192,
          "b": 0.1043,
          "pos": 1.1008,
          "chrom": -0.5909
        },
        {
          "t": 36.6,
          "r": -0.9088,
          "g": -0.2852,
          "b": 0.2647,
          "pos": 0.2891,
          "chrom": 0.1947
        },
        {
          "t": 36.733,
          "r": -0.4264,
          "g": 0.0474,
          "b": 0.4473,
          "pos": -0.6935,
          "chrom": 0.1351
        },
        {
          "t": 36.8,
          "r": -0.3748,
          "g": 0.1065,
          "b": 0.5038,
          "pos": 0.0856,
          "chrom": -0.5355
        },
        {
          "t": 36.933,
          "r": -0.3229,
          "g": 0.1741,
          "b": 0.5822,
          "pos": 0.2687,
          "chrom": -0.249
        },
        {
          "t": 37.0,
          "r": -0.2837,
          "g": 0.2129,
          "b": 0.6371,
          "pos": -0.2238,
          "chrom": 0.262
        },
        {
          "t": 37.133,
          "r": -0.2316,
          "g": 0.2701,
          "b": 0.6954,
          "pos": 0.0745,
          "chrom": 0.2228
        },
        {
          "t": 37.2,
          "r": -0.2182,
          "g": 0.2767,
          "b": 0.7014,
          "pos": -0.0892,
          "chrom": 0.4131
        },
        {
          "t": 37.333,
          "r": 0.0128,
          "g": 0.4313,
          "b": 0.7787,
          "pos": -0.337,
          "chrom": 0.1627
        },
        {
          "t": 37.4,
          "r": 0.0429,
          "g": 0.4791,
          "b": 0.8197,
          "pos": 0.2038,
          "chrom": -0.4307
        },
        {
          "t": 37.533,
          "r": 0.0733,
          "g": 0.5241,
          "b": 0.8701,
          "pos": 0.3549,
          "chrom": -0.3959
        },
        {
          "t": 37.6,
          "r": 0.0828,
          "g": 0.5416,
          "b": 0.892,
          "pos": 0.2542,
          "chrom": -0.274
        },
        {
          "t": 37.733,
          "r": 0.095,
          "g": 0.542,
          "b": 0.8922,
          "pos": -0.067,
          "chrom": 0.1528
        },
        {
          "t": 37.8,
          "r": 0.0924,
          "g": 0.5314,
          "b": 0.8827,
          "pos": -0.4648,
          "chrom": 0.554
        },
        {
          "t": 37.933,
          "r": 0.1685,
          "g": 0.5103,
          "b": 0.7838,
          "pos": -0.1703,
          "chrom": 0.2121
        },
        {
          "t": 38.0,
          "r": 0.1777,
          "g": 0.4806,
          "b": 0.7174,
          "pos": 0.2699,
          "chrom": -0.2424
        },
        {
          "t": 38.133,
          "r": 0.2141,
          "g": 0.512,
          "b": 0.7392,
          "pos": 0.0861,
          "chrom": -0.152
        },
        {
          "t": 38.2,
          "r": 0.2028,
          "g": 0.4863,
          "b": 0.7072,
          "pos": -0.0229,
          "chrom": -0.0076
        },
        {
          "t": 38.333,
          "r": 0.2269,
          "g": 0.4953,
          "b": 0.6937,
          "pos": 0.1119,
          "chrom": -0.1121
        },
        {
          "t": 38.4,
          "r": 0.2375,
          "g": 0.495,
          "b": 0.6882,
          "pos": -0.031,
          "chrom": 0.0206
        },
        {
          "t": 38.533,
          "r": 0.2679,
          "g": 0.4788,
          "b": 0.6333,
          "pos": -0.0949,
          "chrom": 0.1466
        },
        {
          "t": 38.667,
          "r": 0.2668,
          "g": 0.493,
          "b": 0.66,
          "pos": 0.0532,
          "chrom": -0.035
        },
        {
          "t": 38.733,
          "r": 0.2638,
          "g": 0.4974,
          "b": 0.6682,
          "pos": 0.0942,
          "chrom": -0.0807
        },
        {
          "t": 38.867,
          "r": 0.2635,
          "g": 0.5077,
          "b": 0.6892,
          "pos": -0.0587,
          "chrom": 0.0314
        },
        {
          "t": 38.933,
          "r": 0.2642,
          "g": 0.5111,
          "b": 0.6988,
          "pos": -0.0527,
          "chrom": 0.0
        },
        {
          "t": 39.067,
          "r": 0.2755,
          "g": 0.473,
          "b": 0.6209,
          "pos": 0.0896,
          "chrom": -0.0652
        },
        {
          "t": 39.133,
          "r": 0.2726,
          "g": 0.4584,
          "b": 0.5978,
          "pos": 0.0789,
          "chrom": -0.0244
        },
        {
          "t": 39.267,
          "r": 0.2676,
          "g": 0.4497,
          "b": 0.5859,
          "pos": -0.0829,
          "chrom": 0.112
        },
        {
          "t": 39.333,
          "r": 0.2655,
          "g": 0.4462,
          "b": 0.5841,
          "pos": -0.1569,
          "chrom": 0.1735
        },
        {
          "t": 39.467,
          "r": 0.2675,
          "g": 0.4481,
          "b": 0.5772,
          "pos": 0.1234,
          "chrom": -0.1659
        },
        {
          "t": 39.533,
          "r": 0.2657,
          "g": 0.4453,
          "b": 0.5725,
          "pos": 0.1599,
          "chrom": -0.1947
        },
        {
          "t": 39.667,
          "r": 0.2655,
          "g": 0.417,
          "b": 0.5248,
          "pos": 0.0071,
          "chrom": 0.053
        },
        {
          "t": 39.733,
          "r": 0.2743,
          "g": 0.4283,
          "b": 0.5345,
          "pos": -0.0045,
          "chrom": 0.0398
        },
        {
          "t": 39.867,
          "r": 0.2849,
          "g": 0.4383,
          "b": 0.5425,
          "pos": -0.1488,
          "chrom": 0.1215
        },
        {
          "t": 39.933,
          "r": 0.2803,
          "g": 0.4314,
          "b": 0.5338,
          "pos": -0.0096,
          "chrom": 0.0101
        },
        {
          "t": 40.067,
          "r": 0.2853,
          "g": 0.4317,
          "b": 0.5258,
          "pos": 0.1457,
          "chrom": -0.1307
        },
        {
          "t": 40.133,
          "r": 0.2869,
          "g": 0.432,
          "b": 0.5287,
          "pos": -0.08,
          "chrom": 0.0859
        },
        {
          "t": 40.267,
          "r": 0.2956,
          "g": 0.4203,
          "b": 0.5012,
          "pos": -0.0494,
          "chrom": 0.0807
        },
        {
          "t": 40.333,
          "r": 0.294,
          "g": 0.4142,
          "b": 0.492,
          "pos": 0.1481,
          "chrom": -0.1088
        },
        {
          "t": 40.467,
          "r": 0.296,
          "g": 0.4125,
          "b": 0.4884,
          "pos": 0.0955,
          "chrom": -0.1348
        },
        {
          "t": 40.533,
          "r": 0.2976,
          "g": 0.4107,
          "b": 0.4864,
          "pos": 0.0046,
          "chrom": -0.0679
        },
        {
          "t": 40.667,
          "r": 0.2875,
          "g": 0.3836,
          "b": 0.4455,
          "pos": -0.1239,
          "chrom": 0.1032
        },
        {
          "t": 40.8,
          "r": 0.2784,
          "g": 0.3616,
          "b": 0.417,
          "pos": -0.2182,
          "chrom": 0.3752
        },
        {
          "t": 40.867,
          "r": 0.2765,
          "g": 0.3415,
          "b": 0.3756,
          "pos": 0.0866,
          "chrom": 0.1012
        },
        {
          "t": 41.0,
          "r": 0.3399,
          "g": 0.4326,
          "b": 0.4745,
          "pos": 0.2693,
          "chrom": -0.4539
        },
        {
          "t": 41.067,
          "r": 0.3288,
          "g": 0.4189,
          "b": 0.4613,
          "pos": 0.1313,
          "chrom": -0.3145
        },
        {
          "t": 41.2,
          "r": 0.296,
          "g": 0.3815,
          "b": 0.4329,
          "pos": -0.1115,
          "chrom": 0.1981
        },
        {
          "t": 41.267,
          "r": 0.2925,
          "g": 0.3809,
          "b": 0.436,
          "pos": -0.2048,
          "chrom": 0.25
        },
        {
          "t": 41.4,
          "r": 0.2827,
          "g": 0.3727,
          "b": 0.4328,
          "pos": 0.0297,
          "chrom": 0.024
        },
        {
          "t": 41.467,
          "r": 0.2789,
          "g": 0.3487,
          "b": 0.3941,
          "pos": 0.1412,
          "chrom": -0.0627
        },
        {
          "t": 41.6,
          "r": 0.2894,
          "g": 0.369,
          "b": 0.4227,
          "pos": -0.08,
          "chrom": 0.0351
        },
        {
          "t": 41.667,
          "r": 0.2881,
          "g": 0.3724,
          "b": 0.4287,
          "pos": 0.0196,
          "chrom": -0.0828
        },
        {
          "t": 41.8,
          "r": 0.2769,
          "g": 0.363,
          "b": 0.4153,
          "pos": 0.145,
          "chrom": -0.1447
        },
        {
          "t": 41.867,
          "r": 0.2709,
          "g": 0.3547,
          "b": 0.4075,
          "pos": -0.2137,
          "chrom": 0.2557
        },
        {
          "t": 42.0,
          "r": 0.2646,
          "g": 0.3562,
          "b": 0.4064,
          "pos": -0.0681,
          "chrom": 0.1067
        },
        {
          "t": 42.067,
          "r": 0.2785,
          "g": 0.3575,
          "b": 0.3974,
          "pos": 0.2679,
          "chrom": -0.2767
        },
        {
          "t": 42.2,
          "r": 0.2746,
          "g": 0.3503,
          "b": 0.3869,
          "pos": 0.1293,
          "chrom": -0.1362
        },
        {
          "t": 42.267,
          "r": 0.2701,
          "g": 0.3436,
          "b": 0.3804,
          "pos": -0.0572,
          "chrom": 0.0681
        },
        {
          "t": 42.4,
          "r": 0.2688,
          "g": 0.3333,
          "b": 0.3654,
          "pos": -0.1257,
          "chrom": 0.1243
        },
        {
          "t": 42.467,
          "r": 0.2612,
          "g": 0.3224,
          "b": 0.3505,
          "pos": -0.0266,
          "chrom": 0.0366
        },
        {
          "t": 42.6,
          "r": 0.2506,
          "g": 0.3061,
          "b": 0.3328,
          "pos": -0.0048,
          "chrom": 0.0327
        },
        {
          "t": 42.733,
          "r": 0.2519,
          "g": 0.29,
          "b": 0.3069,
          "pos": -0.072,
          "chrom": 0.0627
        },
        {
          "t": 42.8,
          "r": 0.2562,
          "g": 0.2969,
          "b": 0.318,
          "pos": 0.0184,
          "chrom": -0.0358
        },
        {
          "t": 42.933,
          "r": 0.2456,
          "g": 0.2885,
          "b": 0.3169,
          "pos": 0.3171,
          "chrom": -0.3229
        },
        {
          "t": 43.0,
          "r": 0.2413,
          "g": 0.2829,
          "b": 0.3234,
          "pos": 0.2152,
          "chrom": -0.2051
        },
        {
          "t": 43.133,
          "r": 0.2445,
          "g": 0.2797,
          "b": 0.3327,
          "pos": -0.2779,
          "chrom": 0.3489
        },
        {
          "t": 43.2,
          "r": 0.2468,
          "g": 0.2826,
          "b": 0.3383,
          "pos": -0.1992,
          "chrom": 0.2393
        },
        {
          "t": 43.333,
          "r": 0.2734,
          "g": 0.3031,
          "b": 0.3492,
          "pos": -0.0588,
          "chrom": -0.01
        },
        {
          "t": 43.4,
          "r": 0.2674,
          "g": 0.2929,
          "b": 0.3371,
          "pos": -0.1352,
          "chrom": 0.0996
        },
        {
          "t": 43.533,
          "r": 0.249,
          "g": 0.2707,
          "b": 0.2969,
          "pos": 0.2757,
          "chrom": -0.2398
        },
        {
          "t": 43.6,
          "r": 0.2476,
          "g": 0.2663,
          "b": 0.2865,
          "pos": 0.3575,
          "chrom": -0.3273
        },
        {
          "t": 43.733,
          "r": 0.2398,
          "g": 0.2544,
          "b": 0.2687,
          "pos": -0.1044,
          "chrom": 0.1209
        },
        {
          "t": 43.8,
          "r": 0.2401,
          "g": 0.2527,
          "b": 0.2667,
          "pos": -0.3115,
          "chrom": 0.311
        },
        {
          "t": 43.933,
          "r": 0.2409,
          "g": 0.2426,
          "b": 0.2443,
          "pos": -0.035,
          "chrom": 0.0318
        },
        {
          "t": 44.0,
          "r": 0.2304,
          "g": 0.228,
          "b": 0.2197,
          "pos": 0.2382,
          "chrom": -0.2142
        },
        {
          "t": 44.133,
          "r": 0.227,
          "g": 0.226,
          "b": 0.2259,
          "pos": 0.1259,
          "chrom": -0.1059
        },
        {
          "t": 44.2,
          "r": 0.222,
          "g": 0.2196,
          "b": 0.2209,
          "pos": -0.0322,
          "chrom": 0.0145
        },
        {
          "t": 44.333,
          "r": 0.2118,
          "g": 0.2095,
          "b": 0.2156,
          "pos": -0.1528,
          "chrom": 0.1296
        },
        {
          "t": 44.4,
          "r": 0.2001,
          "g": 0.1971,
          "b": 0.2017,
          "pos": -0.0677,
          "chrom": 0.081
        },
        {
          "t": 44.533,
          "r": 0.1907,
          "g": 0.1785,
          "b": 0.1739,
          "pos": 0.0528,
          "chrom": -0.0413
        },
        {
          "t": 44.6,
          "r": 0.1905,
          "g": 0.1776,
          "b": 0.1724,
          "pos": -0.0501,
          "chrom": 0.0652
        },
        {
          "t": 44.733,
          "r": 0.1697,
          "g": 0.1464,
          "b": 0.1321,
          "pos": 0.0753,
          "chrom": 0.0085
        },
        {
          "t": 44.867,
          "r": 0.177,
          "g": 0.1564,
          "b": 0.1451,
          "pos": 0.2558,
          "chrom": -0.3069
        },
        {
          "t": 44.933,
          "r": 0.1781,
          "g": 0.1574,
          "b": 0.1469,
          "pos": -0.049,
          "chrom": -0.0686
        },
        {
          "t": 45.067,
          "r": 0.1627,
          "g": 0.1095,
          "b": 0.0863,
          "pos": -0.1817,
          "chrom": 0.1594
        },
        {
          "t": 45.133,
          "r": 0.141,
          "g": 0.0744,
          "b": 0.044,
          "pos": 0.0357,
          "chrom": 0.048
        },
        {
          "t": 45.267,
          "r": 0.1292,
          "g": 0.0564,
          "b": 0.0229,
          "pos": 0.0012,
          "chrom": 0.1019
        },
        {
          "t": 45.333,
          "r": 0.143,
          "g": 0.0752,
          "b": 0.0432,
          "pos": 0.0618,
          "chrom": -0.0537
        },
        {
          "t": 45.467,
          "r": 0.158,
          "g": 0.102,
          "b": 0.0704,
          "pos": 0.0411,
          "chrom": -0.096
        },
        {
          "t": 45.533,
          "r": 0.1548,
          "g": 0.0994,
          "b": 0.0678,
          "pos": -0.0079,
          "chrom": 0.0049
        },
        {
          "t": 45.667,
          "r": 0.1665,
          "g": 0.1179,
          "b": 0.0869,
          "pos": -0.1304,
          "chrom": 0.1551
        },
        {
          "t": 45.733,
          "r": 0.1727,
          "g": 0.1271,
          "b": 0.1005,
          "pos": -0.2613,
          "chrom": 0.2604
        },
        {
          "t": 45.867,
          "r": 0.1761,
          "g": 0.1386,
          "b": 0.1135,
          "pos": 0.4183,
          "chrom": -0.458
        },
        {
          "t": 45.933,
          "r": 0.1698,
          "g": 0.1299,
          "b": 0.1014,
          "pos": 0.4619,
          "chrom": -0.4572
        },
        {
          "t": 46.067,
          "r": 0.1781,
          "g": 0.1065,
          "b": 0.0795,
          "pos": -0.344,
          "chrom": 0.421
        },
        {
          "t": 46.133,
          "r": 0.1892,
          "g": 0.1213,
          "b": 0.0978,
          "pos": -0.244,
          "chrom": 0.2569
        },
        {
          "t": 46.267,
          "r": 0.204,
          "g": 0.13,
          "b": 0.1049,
          "pos": 0.0149,
          "chrom": -0.0394
        },
        {
          "t": 46.333,
          "r": 0.209,
          "g": 0.1334,
          "b": 0.1086,
          "pos": -0.0238,
          "chrom": 0.0417
        },
        {
          "t": 46.467,
          "r": 0.2177,
          "g": 0.1446,
          "b": 0.1194,
          "pos": 0.1399,
          "chrom": -0.1348
        },
        {
          "t": 46.533,
          "r": 0.2272,
          "g": 0.1566,
          "b": 0.1337,
          "pos": 0.1465,
          "chrom": -0.1374
        },
        {
          "t": 46.667,
          "r": 0.2277,
          "g": 0.1584,
          "b": 0.1395,
          "pos": -0.0676,
          "chrom": 0.0708
        },
        {
          "t": 46.8,
          "r": 0.225,
          "g": 0.1551,
          "b": 0.1381,
          "pos": -0.0487,
          "chrom": 0.0125
        },
        {
          "t": 46.867,
          "r": 0.2242,
          "g": 0.146,
          "b": 0.1228,
          "pos": 0.0295,
          "chrom": -0.0371
        },
        {
          "t": 47.0,
          "r": 0.2127,
          "g": 0.1262,
          "b": 0.1024,
          "pos": 0.1197,
          "chrom": -0.0464
        },
        {
          "t": 47.067,
          "r": 0.2138,
          "g": 0.1278,
          "b": 0.1057,
          "pos": 0.0161,
          "chrom": 0.0399
        },
        {
          "t": 47.2,
          "r": 0.2274,
          "g": 0.147,
          "b": 0.1324,
          "pos": -0.1162,
          "chrom": 0.092
        },
        {
          "t": 47.267,
          "r": 0.229,
          "g": 0.1504,
          "b": 0.1367,
          "pos": -0.0358,
          "chrom": 0.021
        },
        {
          "t": 47.4,
          "r": 0.2364,
          "g": 0.1611,
          "b": 0.1505,
          "pos": -0.0159,
          "chrom": -0.0268
        },
        {
          "t": 47.467,
          "r": 0.2364,
          "g": 0.1576,
          "b": 0.1432,
          "pos": 0.079,
          "chrom": -0.1033
        },
        {
          "t": 47.6,
          "r": 0.2214,
          "g": 0.1411,
          "b": 0.1254,
          "pos": 0.2108,
          "chrom": -0.1312
        },
        {
          "t": 47.667,
          "r": 0.2283,
          "g": 0.1514,
          "b": 0.1377,
          "pos": 0.1646,
          "chrom": -0.1052
        },
        {
          "t": 47.8,
          "r": 0.2372,
          "g": 0.167,
          "b": 0.1587,
          "pos": -0.2997,
          "chrom": 0.2979
        },
        {
          "t": 47.867,
          "r": 0.2432,
          "g": 0.1763,
          "b": 0.1701,
          "pos": -0.5556,
          "chrom": 0.5206
        },
        {
          "t": 48.0,
          "r": 0.2503,
          "g": 0.1924,
          "b": 0.1718,
          "pos": 0.2371,
          "chrom": -0.2975
        },
        {
          "t": 48.067,
          "r": 0.2574,
          "g": 0.1961,
          "b": 0.1695,
          "pos": 0.5166,
          "chrom": -0.5151
        },
        {
          "t": 48.2,
          "r": 0.2619,
          "g": 0.2064,
          "b": 0.1859,
          "pos": 0.0737,
          "chrom": -0.0067
        },
        {
          "t": 48.267,
          "r": 0.275,
          "g": 0.225,
          "b": 0.2082,
          "pos": 0.0155,
          "chrom": 0.0571
        },
        {
          "t": 48.4,
          "r": 0.2817,
          "g": 0.2322,
          "b": 0.2185,
          "pos": -0.1338,
          "chrom": 0.1941
        },
        {
          "t": 48.467,
          "r": 0.2907,
          "g": 0.2393,
          "b": 0.2238,
          "pos": -0.2305,
          "chrom": 0.1921
        },
        {
          "t": 48.6,
          "r": 0.2718,
          "g": 0.2047,
          "b": 0.1755,
          "pos": -0.1497,
          "chrom": 0.034
        },
        {
          "t": 48.667,
          "r": 0.2314,
          "g": 0.1405,
          "b": 0.0961,
          "pos": 0.0869,
          "chrom": -0.1589
        },
        {
          "t": 48.8,
          "r": 0.15,
          "g": 0.0287,
          "b": -0.0392,
          "pos": 0.3163,
          "chrom": -0.2308
        },
        {
          "t": 48.933,
          "r": 0.0775,
          "g": -0.08,
          "b": -0.1588,
          "pos": -0.1907,
          "chrom": 0.3118
        },
        {
          "t": 49.0,
          "r": 0.1029,
          "g": -0.0482,
          "b": -0.1318,
          "pos": -0.0741,
          "chrom": -0.0234
        },
        {
          "t": 49.133,
          "r": 0.0856,
          "g": -0.083,
          "b": -0.1719,
          "pos": -0.0709,
          "chrom": 0.0995
        },
        {
          "t": 49.2,
          "r": 0.0753,
          "g": -0.1032,
          "b": -0.1952,
          "pos": -0.0571,
          "chrom": 0.2411
        },
        {
          "t": 49.333,
          "r": 0.1385,
          "g": -0.0179,
          "b": -0.0982,
          "pos": 0.1797,
          "chrom": -0.2114
        },
        {
          "t": 49.4,
          "r": 0.1578,
          "g": 0.0029,
          "b": -0.0734,
          "pos": 0.0821,
          "chrom": -0.1434
        },
        {
          "t": 49.533,
          "r": 0.1796,
          "g": 0.0257,
          "b": -0.0461,
          "pos": -0.0911,
          "chrom": -0.0418
        },
        {
          "t": 49.6,
          "r": 0.1758,
          "g": 0.0192,
          "b": -0.0519,
          "pos": -0.0388,
          "chrom": -0.1189
        },
        {
          "t": 49.733,
          "r": 0.102,
          "g": -0.0616,
          "b": -0.1341,
          "pos": 0.0521,
          "chrom": 0.1386
        },
        {
          "t": 49.8,
          "r": 0.0692,
          "g": -0.0997,
          "b": -0.1681,
          "pos": -0.1559,
          "chrom": 0.3851
        },
        {
          "t": 49.933,
          "r": 0.0828,
          "g": -0.064,
          "b": -0.1241,
          "pos": -0.1052,
          "chrom": 0.1171
        },
        {
          "t": 50.0,
          "r": 0.0819,
          "g": -0.057,
          "b": -0.1254,
          "pos": 0.2283,
          "chrom": -0.2614
        },
        {
          "t": 50.133,
          "r": 0.112,
          "g": -0.015,
          "b": -0.0784,
          "pos": 0.3555,
          "chrom": -0.4939
        },
        {
          "t": 50.2,
          "r": 0.1145,
          "g": -0.0101,
          "b": -0.0724,
          "pos": 0.156,
          "chrom": -0.271
        },
        {
          "t": 50.333,
          "r": 0.1263,
          "g": 0.0049,
          "b": -0.0461,
          "pos": -0.403,
          "chrom": 0.4546
        },
        {
          "t": 50.4,
          "r": 0.1348,
          "g": 0.0166,
          "b": -0.0287,
          "pos": -0.3983,
          "chrom": 0.4982
        },
        {
          "t": 50.533,
          "r": 0.1748,
          "g": 0.0766,
          "b": 0.035,
          "pos": 0.0084,
          "chrom": 0.1402
        },
        {
          "t": 50.6,
          "r": 0.1852,
          "g": 0.0991,
          "b": 0.0632,
          "pos": 0.2167,
          "chrom": -0.1699
        },
        {
          "t": 50.733,
          "r": 0.2348,
          "g": 0.2038,
          "b": 0.1999,
          "pos": 0.4106,
          "chrom": -0.5172
        },
        {
          "t": 50.867,
          "r": 0.2373,
          "g": 0.2359,
          "b": 0.2616,
          "pos": -0.1043,
          "chrom": 0.0226
        },
        {
          "t": 50.933,
          "r": 0.2387,
          "g": 0.2518,
          "b": 0.2927,
          "pos": -0.3079,
          "chrom": 0.1991
        },
        {
          "t": 51.067,
          "r": 0.1878,
          "g": 0.2119,
          "b": 0.266,
          "pos": -0.2477,
          "chrom": 0.4172
        },
        {
          "t": 51.133,
          "r": 0.206,
          "g": 0.2291,
          "b": 0.2774,
          "pos": -0.0678,
          "chrom": 0.2376
        },
        {
          "t": 51.267,
          "r": 0.2417,
          "g": 0.284,
          "b": 0.331,
          "pos": 0.2624,
          "chrom": -0.2631
        },
        {
          "t": 51.333,
          "r": 0.2555,
          "g": 0.3034,
          "b": 0.3539,
          "pos": 0.2841,
          "chrom": -0.2557
        },
        {
          "t": 51.467,
          "r": 0.3029,
          "g": 0.3577,
          "b": 0.4084,
          "pos": -0.0103,
          "chrom": -0.0738
        },
        {
          "t": 51.533,
          "r": 0.3101,
          "g": 0.3644,
          "b": 0.4134,
          "pos": -0.1591,
          "chrom": 0.058
        },
        {
          "t": 51.667,
          "r": 0.3034,
          "g": 0.3367,
          "b": 0.3667,
          "pos": 0.0859,
          "chrom": -0.0699
        },
        {
          "t": 51.733,
          "r": 0.2979,
          "g": 0.3288,
          "b": 0.3584,
          "pos": 0.1376,
          "chrom": -0.1227
        },
        {
          "t": 51.867,
          "r": 0.2759,
          "g": 0.3157,
          "b": 0.3543,
          "pos": -0.4689,
          "chrom": 0.4903
        },
        {
          "t": 51.933,
          "r": 0.2681,
          "g": 0.3124,
          "b": 0.3549,
          "pos": -0.2199,
          "chrom": 0.2437
        },
        {
          "t": 52.067,
          "r": 0.2479,
          "g": 0.3159,
          "b": 0.3566,
          "pos": 0.5282,
          "chrom": -0.4507
        },
        {
          "t": 52.133,
          "r": 0.2421,
          "g": 0.3116,
          "b": 0.358,
          "pos": 0.1629,
          "chrom": -0.0193
        },
        {
          "t": 52.267,
          "r": 0.248,
          "g": 0.3018,
          "b": 0.3342,
          "pos": -0.0561,
          "chrom": 0.0814
        },
        {
          "t": 52.333,
          "r": 0.2359,
          "g": 0.2806,
          "b": 0.3067,
          "pos": 0.0278,
          "chrom": -0.1604
        },
        {
          "t": 52.467,
          "r": 0.1522,
          "g": 0.1629,
          "b": 0.1711,
          "pos": -0.0937,
          "chrom": -0.1475
        },
        {
          "t": 52.533,
          "r": 0.0537,
          "g": 0.033,
          "b": 0.0254,
          "pos": -0.1565,
          "chrom": -0.0428
        },
        {
          "t": 52.667,
          "r": -0.1719,
          "g": -0.2469,
          "b": -0.2789,
          "pos": -0.0383,
          "chrom": 0.3067
        },
        {
          "t": 52.733,
          "r": -0.2991,
          "g": -0.4093,
          "b": -0.4647,
          "pos": 0.2841,
          "chrom": 0.2809
        },
        {
          "t": 52.867,
          "r": -0.3345,
          "g": -0.457,
          "b": -0.5297,
          "pos": -0.1281,
          "chrom": 0.1043
        },
        {
          "t": 53.0,
          "r": -0.4305,
          "g": -0.5361,
          "b": -0.6073,
          "pos": 0.1465,
          "chrom": -0.5478
        },
        {
          "t": 53.067,
          "r": -0.4702,
          "g": -0.5729,
          "b": -0.6395,
          "pos": 0.4392,
          "chrom": -0.6619
        },
        {
          "t": 53.2,
          "r": -0.5722,
          "g": -0.6819,
          "b": -0.7393,
          "pos": -0.1704,
          "chrom": 0.1848
        },
        {
          "t": 53.267,
          "r": -0.6132,
          "g": -0.7247,
          "b": -0.7745,
          "pos": -0.4409,
          "chrom": 0.7517
        },
        {
          "t": 53.4,
          "r": -0.6679,
          "g": -0.7738,
          "b": -0.82,
          "pos": -0.0796,
          "chrom": 0.4377
        },
        {
          "t": 53.467,
          "r": -0.5106,
          "g": -0.5949,
          "b": -0.6502,
          "pos": 0.2673,
          "chrom": -0.4708
        },
        {
          "t": 53.6,
          "r": -0.5002,
          "g": -0.5821,
          "b": -0.6359,
          "pos": 0.159,
          "chrom": -0.5026
        },
        {
          "t": 53.667,
          "r": -0.5168,
          "g": -0.6029,
          "b": -0.6557,
          "pos": 0.0092,
          "chrom": 0.0106
        },
        {
          "t": 53.8,
          "r": -0.5141,
          "g": -0.5976,
          "b": -0.6487,
          "pos": 0.0032,
          "chrom": 0.0933
        },
        {
          "t": 53.867,
          "r": -0.484,
          "g": -0.5592,
          "b": -0.6059,
          "pos": -0.0428,
          "chrom": 0.2113
        },
        {
          "t": 54.0,
          "r": -0.4875,
          "g": -0.557,
          "b": -0.6018,
          "pos": -0.1081,
          "chrom": 0.283
        },
        {
          "t": 54.067,
          "r": -0.3743,
          "g": -0.4243,
          "b": -0.4688,
          "pos": -0.0937,
          "chrom": -0.0864
        },
        {
          "t": 54.2,
          "r": -0.3744,
          "g": -0.4235,
          "b": -0.4749,
          "pos": 0.0717,
          "chrom": -0.2845
        },
        {
          "t": 54.267,
          "r": -0.375,
          "g": -0.4217,
          "b": -0.4736,
          "pos": 0.0945,
          "chrom": -0.0919
        },
        {
          "t": 54.4,
          "r": -0.3831,
          "g": -0.4268,
          "b": -0.4757,
          "pos": 0.0549,
          "chrom": 0.0534
        },
        {
          "t": 54.467,
          "r": -0.3715,
          "g": -0.4092,
          "b": -0.4541,
          "pos": 0.1045,
          "chrom": 0.1144
        },
        {
          "t": 54.6,
          "r": -0.3428,
          "g": -0.3712,
          "b": -0.4077,
          "pos": 0.01,
          "chrom": 0.0955
        },
        {
          "t": 54.667,
          "r": -0.2392,
          "g": -0.2496,
          "b": -0.2805,
          "pos": -0.1149,
          "chrom": -0.1017
        },
        {
          "t": 54.8,
          "r": -0.2255,
          "g": -0.2335,
          "b": -0.26,
          "pos": -0.0518,
          "chrom": -0.1353
        },
        {
          "t": 54.933,
          "r": -0.2438,
          "g": -0.2578,
          "b": -0.2832,
          "pos": -0.0895,
          "chrom": 0.2383
        },
        {
          "t": 55.0,
          "r": -0.2178,
          "g": -0.2332,
          "b": -0.2628,
          "pos": -0.09,
          "chrom": 0.1953
        },
        {
          "t": 55.133,
          "r": -0.1999,
          "g": -0.212,
          "b": -0.247,
          "pos": 0.3574,
          "chrom": -0.1872
        },
        {
          "t": 55.2,
          "r": -0.204,
          "g": -0.2222,
          "b": -0.2588,
          "pos": 0.2835,
          "chrom": -0.1793
        },
        {
          "t": 55.333,
          "r": -0.1274,
          "g": -0.1398,
          "b": -0.1746,
          "pos": -0.2011,
          "chrom": -0.0378
        },
        {
          "t": 55.4,
          "r": -0.1326,
          "g": -0.1481,
          "b": -0.1823,
          "pos": -0.2172,
          "chrom": 0.0329
        },
        {
          "t": 55.533,
          "r": -0.1497,
          "g": -0.1723,
          "b": -0.2084,
          "pos": -0.1822,
          "chrom": 0.2324
        },
        {
          "t": 55.6,
          "r": -0.1589,
          "g": -0.1804,
          "b": -0.2218,
          "pos": 0.1362,
          "chrom": -0.0219
        },
        {
          "t": 55.733,
          "r": -0.1268,
          "g": -0.1307,
          "b": -0.1648,
          "pos": 0.2714,
          "chrom": -0.1201
        },
        {
          "t": 55.8,
          "r": -0.1065,
          "g": -0.102,
          "b": -0.1262,
          "pos": -0.0809,
          "chrom": 0.1615
        },
        {
          "t": 55.933,
          "r": -0.0292,
          "g": -0.0036,
          "b": -0.0226,
          "pos": 0.0,
          "chrom": -0.0831
        },
        {
          "t": 56.0,
          "r": 0.0188,
          "g": 0.0572,
          "b": 0.0441,
          "pos": -0.0463,
          "chrom": -0.0674
        },
        {
          "t": 56.133,
          "r": 0.0419,
          "g": 0.0878,
          "b": 0.0792,
          "pos": -0.0467,
          "chrom": -0.046
        },
        {
          "t": 56.2,
          "r": 0.0329,
          "g": 0.0737,
          "b": 0.0592,
          "pos": 0.2179,
          "chrom": -0.2304
        },
        {
          "t": 56.333,
          "r": 0.0024,
          "g": 0.0247,
          "b": 0.0043,
          "pos": -0.0481,
          "chrom": 0.2381
        },
        {
          "t": 56.4,
          "r": -0.0056,
          "g": 0.0159,
          "b": -0.0057,
          "pos": -0.1077,
          "chrom": 0.2561
        },
        {
          "t": 56.533,
          "r": 0.0095,
          "g": 0.0313,
          "b": 0.002,
          "pos": -0.0035,
          "chrom": -0.1047
        },
        {
          "t": 56.6,
          "r": 0.0056,
          "g": 0.027,
          "b": -0.0025,
          "pos": -0.0994,
          "chrom": -0.0286
        },
        {
          "t": 56.733,
          "r": -0.0173,
          "g": -0.0048,
          "b": -0.0421,
          "pos": 0.0691,
          "chrom": -0.0707
        },
        {
          "t": 56.8,
          "r": -0.008,
          "g": 0.007,
          "b": -0.0286,
          "pos": 0.079,
          "chrom": -0.0544
        },
        {
          "t": 56.933,
          "r": -0.0192,
          "g": 0.0,
          "b": -0.0296,
          "pos": 0.1684,
          "chrom": -0.0267
        },
        {
          "t": 57.067,
          "r": 0.0035,
          "g": 0.026,
          "b": 0.0005,
          "pos": 0.1068,
          "chrom": -0.0552
        },
        {
          "t": 57.133,
          "r": 0.0236,
          "g": 0.0454,
          "b": 0.0208,
          "pos": -0.2615,
          "chrom": 0.1014
        },
        {
          "t": 57.267,
          "r": 0.0002,
          "g": 0.0231,
          "b": 0.0,
          "pos": -0.3292,
          "chrom": 0.1862
        },
        {
          "t": 57.333,
          "r": -0.0496,
          "g": -0.0369,
          "b": -0.0666,
          "pos": 0.0217,
          "chrom": 0.0345
        },
        {
          "t": 57.467,
          "r": -0.0991,
          "g": -0.0949,
          "b": -0.1336,
          "pos": 0.3439,
          "chrom": -0.1707
        },
        {
          "t": 57.533,
          "r": -0.0965,
          "g": -0.094,
          "b": -0.1315,
          "pos": 0.2302,
          "chrom": -0.0962
        },
        {
          "t": 57.667,
          "r": -0.0411,
          "g": -0.0283,
          "b": -0.0539,
          "pos": -0.1202,
          "chrom": -0.0349
        },
        {
          "t": 57.733,
          "r": -0.0245,
          "g": -0.0069,
          "b": -0.0257,
          "pos": -0.2061,
          "chrom": -0.0188
        },
        {
          "t": 57.867,
          "r": -0.0071,
          "g": 0.0112,
          "b": 0.0029,
          "pos": 0.1411,
          "chrom": 0.0229
        },
        {
          "t": 57.933,
          "r": 0.0219,
          "g": 0.0453,
          "b": 0.0443,
          "pos": 0.2041,
          "chrom": 0.0577
        },
        {
          "t": 58.067,
          "r": 0.147,
          "g": 0.1982,
          "b": 0.2211,
          "pos": -0.2616,
          "chrom": 0.1957
        },
        {
          "t": 58.133,
          "r": 0.1934,
          "g": 0.2598,
          "b": 0.2871,
          "pos": -0.2003,
          "chrom": 0.0264
        },
        {
          "t": 58.267,
          "r": 0.2057,
          "g": 0.2742,
          "b": 0.2954,
          "pos": 0.2655,
          "chrom": -0.3013
        },
        {
          "t": 58.333,
          "r": 0.2026,
          "g": 0.2687,
          "b": 0.2874,
          "pos": 0.1954,
          "chrom": -0.1669
        },
        {
          "t": 58.467,
          "r": 0.1865,
          "g": 0.242,
          "b": 0.2496,
          "pos": -0.1621,
          "chrom": 0.2279
        },
        {
          "t": 58.533,
          "r": 0.178,
          "g": 0.2322,
          "b": 0.236,
          "pos": -0.1113,
          "chrom": 0.1741
        },
        {
          "t": 58.667,
          "r": 0.167,
          "g": 0.2204,
          "b": 0.2156,
          "pos": -0.0201,
          "chrom": 0.0456
        },
        {
          "t": 58.733,
          "r": 0.1677,
          "g": 0.2219,
          "b": 0.2156,
          "pos": -0.1083,
          "chrom": 0.113
        },
        {
          "t": 58.867,
          "r": 0.1879,
          "g": 0.2504,
          "b": 0.2463,
          "pos": 0.3402,
          "chrom": -0.4378
        },
        {
          "t": 59.0,
          "r": 0.2018,
          "g": 0.2657,
          "b": 0.2733,
          "pos": 0.0312,
          "chrom": 0.0712
        },
        {
          "t": 59.067,
          "r": 0.1975,
          "g": 0.2573,
          "b": 0.2705,
          "pos": -0.2864,
          "chrom": 0.4482
        },
        {
          "t": 59.2,
          "r": 0.2464,
          "g": 0.3251,
          "b": 0.3489,
          "pos": -0.1098,
          "chrom": 0.0522
        },
        {
          "t": 59.267,
          "r": 0.2525,
          "g": 0.3362,
          "b": 0.3609,
          "pos": -0.0485,
          "chrom": -0.0551
        },
        {
          "t": 59.4,
          "r": 0.243,
          "g": 0.3218,
          "b": 0.3394,
          "pos": 0.1184,
          "chrom": -0.2
        },
        {
          "t": 59.467,
          "r": 0.2088,
          "g": 0.2792,
          "b": 0.2904,
          "pos": 0.1659,
          "chrom": -0.1482
        },
        {
          "t": 59.6,
          "r": 0.1818,
          "g": 0.2393,
          "b": 0.2437,
          "pos": -0.0175,
          "chrom": 0.1686
        },
        {
          "t": 59.667,
          "r": 0.1894,
          "g": 0.2532,
          "b": 0.2576,
          "pos": -0.0548,
          "chrom": 0.1291
        },
        {
          "t": 59.8,
          "r": 0.208,
          "g": 0.2799,
          "b": 0.2895,
          "pos": 0.0525,
          "chrom": -0.09
        },
        {
          "t": 59.867,
          "r": 0.213,
          "g": 0.2865,
          "b": 0.2971,
          "pos": 0.133,
          "chrom": -0.1934
        },
        {
          "t": 60.0,
          "r": 0.215,
          "g": 0.3006,
          "b": 0.3349,
          "pos": -0.206,
          "chrom": 0.1679
        },
        {
          "t": 60.067,
          "r": 0.1996,
          "g": 0.2855,
          "b": 0.3241,
          "pos": -0.1617,
          "chrom": 0.1878
        },
        {
          "t": 60.2,
          "r": 0.1831,
          "g": 0.2611,
          "b": 0.2969,
          "pos": 0.3398,
          "chrom": -0.269
        },
        {
          "t": 60.267,
          "r": 0.1776,
          "g": 0.2523,
          "b": 0.2902,
          "pos": 0.1875,
          "chrom": -0.1968
        },
        {
          "t": 60.4,
          "r": 0.1554,
          "g": 0.2232,
          "b": 0.2629,
          "pos": -0.3303,
          "chrom": 0.263
        },
        {
          "t": 60.467,
          "r": 0.1107,
          "g": 0.167,
          "b": 0.2012,
          "pos": -0.3031,
          "chrom": 0.3698
        },
        {
          "t": 60.6,
          "r": 0.0611,
          "g": 0.1096,
          "b": 0.1267,
          "pos": 0.2249,
          "chrom": -0.1095
        },
        {
          "t": 60.667,
          "r": 0.0653,
          "g": 0.1149,
          "b": 0.1293,
          "pos": 0.2272,
          "chrom": -0.2592
        },
        {
          "t": 60.8,
          "r": 0.05,
          "g": 0.0882,
          "b": 0.0981,
          "pos": -0.0686,
          "chrom": -0.0646
        },
        {
          "t": 60.867,
          "r": 0.0333,
          "g": 0.0684,
          "b": 0.0783,
          "pos": 0.1054,
          "chrom": -0.1573
        },
        {
          "t": 61.0,
          "r": -0.0009,
          "g": 0.0258,
          "b": 0.0456,
          "pos": 0.0649,
          "chrom": -0.0164
        },
        {
          "t": 61.133,
          "r": -0.0115,
          "g": 0.011,
          "b": 0.044,
          "pos": -0.1121,
          "chrom": 0.3112
        },
        {
          "t": 61.2,
          "r": -0.035,
          "g": -0.0222,
          "b": 0.0127,
          "pos": -0.0735,
          "chrom": 0.2502
        },
        {
          "t": 61.333,
          "r": -0.0202,
          "g": -0.0033,
          "b": 0.041,
          "pos": -0.1215,
          "chrom": -0.019
        },
        {
          "t": 61.4,
          "r": -0.0747,
          "g": -0.0651,
          "b": -0.0251,
          "pos": 0.1561,
          "chrom": -0.2964
        },
        {
          "t": 61.533,
          "r": -0.1712,
          "g": -0.1737,
          "b": -0.1339,
          "pos": 0.0531,
          "chrom": -0.2531
        },
        {
          "t": 61.6,
          "r": -0.2387,
          "g": -0.2513,
          "b": -0.2094,
          "pos": -0.1745,
          "chrom": 0.0178
        },
        {
          "t": 61.733,
          "r": -0.3783,
          "g": -0.4061,
          "b": -0.3729,
          "pos": 0.1855,
          "chrom": 0.1296
        },
        {
          "t": 61.8,
          "r": -0.4173,
          "g": -0.4527,
          "b": -0.4233,
          "pos": -0.0382,
          "chrom": 0.3665
        },
        {
          "t": 61.933,
          "r": -0.3073,
          "g": -0.3285,
          "b": -0.3025,
          "pos": -0.1642,
          "chrom": 0.1876
        },
        {
          "t": 62.0,
          "r": -0.2332,
          "g": -0.2304,
          "b": -0.2126,
          "pos": 0.3257,
          "chrom": -0.3992
        },
        {
          "t": 62.133,
          "r": -0.089,
          "g": -0.0538,
          "b": -0.0222,
          "pos": 0.1316,
          "chrom": -0.3212
        },
        {
          "t": 62.2,
          "r": -0.0473,
          "g": -0.004,
          "b": 0.0309,
          "pos": -0.0813,
          "chrom": -0.0686
        },
        {
          "t": 62.333,
          "r": 0.0208,
          "g": 0.0755,
          "b": 0.116,
          "pos": -0.2056,
          "chrom": 0.2045
        },
        {
          "t": 62.4,
          "r": 0.0291,
          "g": 0.0841,
          "b": 0.1246,
          "pos": -0.2977,
          "chrom": 0.3814
        },
        {
          "t": 62.533,
          "r": 0.0412,
          "g": 0.0906,
          "b": 0.1171,
          "pos": 0.125,
          "chrom": 0.0711
        },
        {
          "t": 62.6,
          "r": 0.0578,
          "g": 0.1109,
          "b": 0.1375,
          "pos": 0.3011,
          "chrom": -0.1762
        },
        {
          "t": 62.733,
          "r": 0.1128,
          "g": 0.1794,
          "b": 0.2078,
          "pos": 0.1059,
          "chrom": -0.2304
        },
        {
          "t": 62.8,
          "r": 0.1473,
          "g": 0.2201,
          "b": 0.2544,
          "pos": -0.1684,
          "chrom": -0.0071
        },
        {
          "t": 62.933,
          "r": 0.1653,
          "g": 0.2388,
          "b": 0.2713,
          "pos": 0.0055,
          "chrom": -0.0087
        }
      ],
      "hrTracks": {
        "pos_face_full": [
          {
            "t": 0.0,
            "bpm": 102.832
          },
          {
            "t": 5.0,
            "bpm": 101.953
          },
          {
            "t": 10.0,
            "bpm": 102.393
          },
          {
            "t": 15.0,
            "bpm": 103.711
          },
          {
            "t": 20.0,
            "bpm": 83.496
          },
          {
            "t": 25.0,
            "bpm": 116.895
          },
          {
            "t": 30.0,
            "bpm": 119.531
          },
          {
            "t": 35.0,
            "bpm": 100.635
          },
          {
            "t": 40.0,
            "bpm": 88.77
          }
        ],
        "chrom_face_full": [
          {
            "t": 0.0,
            "bpm": 94.922
          },
          {
            "t": 5.0,
            "bpm": 85.693
          },
          {
            "t": 10.0,
            "bpm": 100.635
          },
          {
            "t": 15.0,
            "bpm": 99.756
          },
          {
            "t": 20.0,
            "bpm": 98.438
          },
          {
            "t": 25.0,
            "bpm": 97.559
          },
          {
            "t": 30.0,
            "bpm": 100.195
          },
          {
            "t": 35.0,
            "bpm": 100.195
          },
          {
            "t": 40.0,
            "bpm": 100.635
          }
        ],
        "sqi_top_window": [
          {
            "t": 0.0,
            "bpm": 99.316
          },
          {
            "t": 5.0,
            "bpm": 99.316
          },
          {
            "t": 10.0,
            "bpm": 99.756
          },
          {
            "t": 15.0,
            "bpm": 98.438
          },
          {
            "t": 20.0,
            "bpm": 98.438
          },
          {
            "t": 25.0,
            "bpm": 100.195
          },
          {
            "t": 30.0,
            "bpm": 100.635
          },
          {
            "t": 35.0,
            "bpm": 99.756
          },
          {
            "t": 40.0,
            "bpm": 100.635
          }
        ],
        "trained_peak_selector_current": [
          {
            "t": 0.0,
            "bpm": 112.5
          },
          {
            "t": 5.0,
            "bpm": 112.939
          },
          {
            "t": 10.0,
            "bpm": 113.818
          },
          {
            "t": 15.0,
            "bpm": 115.576
          },
          {
            "t": 20.0,
            "bpm": 114.258
          },
          {
            "t": 25.0,
            "bpm": 112.5
          },
          {
            "t": 30.0,
            "bpm": 111.182
          },
          {
            "t": 35.0,
            "bpm": 108.545
          },
          {
            "t": 40.0,
            "bpm": 109.424
          }
        ],
        "oracle_window_peak": [
          {
            "t": 0.0,
            "bpm": 115.576
          },
          {
            "t": 5.0,
            "bpm": 115.576
          },
          {
            "t": 10.0,
            "bpm": 115.137
          },
          {
            "t": 15.0,
            "bpm": 115.576
          },
          {
            "t": 20.0,
            "bpm": 115.576
          },
          {
            "t": 25.0,
            "bpm": 115.576
          },
          {
            "t": 30.0,
            "bpm": 115.576
          },
          {
            "t": 35.0,
            "bpm": 115.576
          },
          {
            "t": 40.0,
            "bpm": 115.576
          }
        ]
      }
    },
    {
      "video": "5.mp4",
      "durationSec": 60.454,
      "label": {
        "bpm_min": 130.0,
        "bpm_max": 140.0,
        "bpm_target": 135.0
      },
      "waveform": [
        {
          "t": 0.0,
          "r": 0.4739,
          "g": 0.0406,
          "b": -0.0995,
          "pos": 0.0044,
          "chrom": -0.0018
        },
        {
          "t": 0.067,
          "r": 0.4643,
          "g": 0.0415,
          "b": -0.0981,
          "pos": -0.0836,
          "chrom": 0.0745
        },
        {
          "t": 0.2,
          "r": 0.5009,
          "g": 0.0735,
          "b": -0.0747,
          "pos": 0.0665,
          "chrom": -0.0782
        },
        {
          "t": 0.267,
          "r": 0.5309,
          "g": 0.0987,
          "b": -0.0512,
          "pos": 0.084,
          "chrom": -0.0925
        },
        {
          "t": 0.4,
          "r": 0.5811,
          "g": 0.1403,
          "b": -0.0084,
          "pos": 0.0089,
          "chrom": 0.0153
        },
        {
          "t": 0.467,
          "r": 0.6024,
          "g": 0.1765,
          "b": 0.0362,
          "pos": -0.0498,
          "chrom": 0.0863
        },
        {
          "t": 0.6,
          "r": 0.5801,
          "g": 0.2205,
          "b": 0.1109,
          "pos": -0.0185,
          "chrom": 0.0646
        },
        {
          "t": 0.667,
          "r": 0.5666,
          "g": 0.2617,
          "b": 0.1711,
          "pos": 0.1142,
          "chrom": -0.1167
        },
        {
          "t": 0.8,
          "r": 0.5221,
          "g": 0.2741,
          "b": 0.2101,
          "pos": -0.0377,
          "chrom": -0.054
        },
        {
          "t": 0.867,
          "r": 0.476,
          "g": 0.2527,
          "b": 0.1936,
          "pos": -0.0568,
          "chrom": 0.0273
        },
        {
          "t": 1.0,
          "r": 0.405,
          "g": 0.1865,
          "b": 0.1222,
          "pos": -0.1372,
          "chrom": 0.1422
        },
        {
          "t": 1.067,
          "r": 0.3409,
          "g": 0.1495,
          "b": 0.0926,
          "pos": -0.0807,
          "chrom": 0.0939
        },
        {
          "t": 1.2,
          "r": 0.3162,
          "g": 0.0984,
          "b": 0.0182,
          "pos": 0.2875,
          "chrom": -0.2067
        },
        {
          "t": 1.267,
          "r": 0.2902,
          "g": 0.0776,
          "b": 0.0062,
          "pos": 0.0835,
          "chrom": -0.0689
        },
        {
          "t": 1.333,
          "r": 0.2614,
          "g": 0.0623,
          "b": 0.0007,
          "pos": -0.1085,
          "chrom": 0.0601
        },
        {
          "t": 1.467,
          "r": 0.2232,
          "g": 0.0486,
          "b": -0.0047,
          "pos": -0.0323,
          "chrom": 0.0444
        },
        {
          "t": 1.533,
          "r": 0.1935,
          "g": 0.0369,
          "b": -0.0107,
          "pos": 0.0102,
          "chrom": 0.0434
        },
        {
          "t": 1.667,
          "r": 0.1729,
          "g": 0.0707,
          "b": 0.046,
          "pos": -0.1624,
          "chrom": 0.0736
        },
        {
          "t": 1.733,
          "r": 0.1595,
          "g": 0.0867,
          "b": 0.078,
          "pos": -0.2901,
          "chrom": 0.1618
        },
        {
          "t": 1.867,
          "r": 0.1995,
          "g": 0.0749,
          "b": 0.0308,
          "pos": 0.4801,
          "chrom": -0.3127
        },
        {
          "t": 1.933,
          "r": 0.2015,
          "g": 0.0849,
          "b": 0.0421,
          "pos": 0.4521,
          "chrom": -0.3327
        },
        {
          "t": 2.067,
          "r": 0.1807,
          "g": 0.1022,
          "b": 0.094,
          "pos": -0.3375,
          "chrom": 0.1959
        },
        {
          "t": 2.133,
          "r": 0.161,
          "g": 0.0971,
          "b": 0.0872,
          "pos": -0.0668,
          "chrom": 0.0424
        },
        {
          "t": 2.267,
          "r": 0.1235,
          "g": 0.0618,
          "b": 0.0512,
          "pos": -0.0711,
          "chrom": 0.1753
        },
        {
          "t": 2.333,
          "r": 0.0995,
          "g": 0.054,
          "b": 0.0525,
          "pos": -0.3243,
          "chrom": 0.422
        },
        {
          "t": 2.467,
          "r": 0.1615,
          "g": 0.1099,
          "b": 0.1034,
          "pos": 0.0923,
          "chrom": -0.2537
        },
        {
          "t": 2.533,
          "r": 0.1322,
          "g": 0.1102,
          "b": 0.1066,
          "pos": 0.3539,
          "chrom": -0.6325
        },
        {
          "t": 2.667,
          "r": -0.0737,
          "g": -0.0921,
          "b": -0.1139,
          "pos": 0.237,
          "chrom": -0.0147
        },
        {
          "t": 2.733,
          "r": -0.1475,
          "g": -0.1628,
          "b": -0.1849,
          "pos": -0.0693,
          "chrom": 0.3112
        },
        {
          "t": 2.8,
          "r": -0.1037,
          "g": -0.1183,
          "b": -0.1295,
          "pos": -0.3378,
          "chrom": 0.3584
        },
        {
          "t": 2.933,
          "r": -0.2125,
          "g": -0.2092,
          "b": -0.2269,
          "pos": -0.2069,
          "chrom": 0.2094
        },
        {
          "t": 3.0,
          "r": -0.1087,
          "g": -0.1616,
          "b": -0.2027,
          "pos": 0.0432,
          "chrom": -0.0526
        },
        {
          "t": 3.133,
          "r": -0.1164,
          "g": -0.1595,
          "b": -0.2041,
          "pos": 0.2424,
          "chrom": -0.3274
        },
        {
          "t": 3.2,
          "r": -0.1501,
          "g": -0.1896,
          "b": -0.2356,
          "pos": 0.1646,
          "chrom": -0.1284
        },
        {
          "t": 3.333,
          "r": -0.132,
          "g": -0.1729,
          "b": -0.2172,
          "pos": 0.0278,
          "chrom": 0.0054
        },
        {
          "t": 3.4,
          "r": -0.1272,
          "g": -0.1638,
          "b": -0.2062,
          "pos": -0.1108,
          "chrom": 0.1233
        },
        {
          "t": 3.533,
          "r": -0.1371,
          "g": -0.156,
          "b": -0.1845,
          "pos": -0.2851,
          "chrom": 0.3197
        },
        {
          "t": 3.6,
          "r": -0.0395,
          "g": -0.0902,
          "b": -0.1309,
          "pos": 0.0488,
          "chrom": -0.0642
        },
        {
          "t": 3.733,
          "r": 0.0076,
          "g": -0.038,
          "b": -0.0668,
          "pos": 0.1914,
          "chrom": -0.2853
        },
        {
          "t": 3.8,
          "r": 0.004,
          "g": -0.0372,
          "b": -0.0605,
          "pos": 0.0285,
          "chrom": -0.0894
        },
        {
          "t": 3.933,
          "r": -0.0216,
          "g": -0.0473,
          "b": -0.0589,
          "pos": 0.069,
          "chrom": 0.0414
        },
        {
          "t": 4.0,
          "r": -0.0284,
          "g": -0.0648,
          "b": -0.0739,
          "pos": -0.1284,
          "chrom": 0.2623
        },
        {
          "t": 4.067,
          "r": -0.0338,
          "g": -0.0486,
          "b": -0.0432,
          "pos": -0.2814,
          "chrom": 0.3569
        },
        {
          "t": 4.2,
          "r": 0.0858,
          "g": 0.0185,
          "b": 0.0072,
          "pos": 0.1516,
          "chrom": -0.197
        },
        {
          "t": 4.267,
          "r": 0.071,
          "g": 0.0079,
          "b": -0.0,
          "pos": 0.1834,
          "chrom": -0.2772
        },
        {
          "t": 4.4,
          "r": 0.0522,
          "g": -0.0298,
          "b": -0.0466,
          "pos": -0.0772,
          "chrom": -0.0537
        },
        {
          "t": 4.467,
          "r": 0.0002,
          "g": -0.0954,
          "b": -0.1262,
          "pos": 0.059,
          "chrom": -0.0331
        },
        {
          "t": 4.6,
          "r": -0.0865,
          "g": -0.1796,
          "b": -0.2173,
          "pos": -0.0732,
          "chrom": 0.2171
        },
        {
          "t": 4.667,
          "r": -0.1092,
          "g": -0.1804,
          "b": -0.2119,
          "pos": -0.2235,
          "chrom": 0.2817
        },
        {
          "t": 4.8,
          "r": -0.0227,
          "g": -0.1347,
          "b": -0.1833,
          "pos": 0.1984,
          "chrom": -0.2072
        },
        {
          "t": 4.867,
          "r": -0.0171,
          "g": -0.1268,
          "b": -0.1741,
          "pos": 0.2697,
          "chrom": -0.3121
        },
        {
          "t": 5.0,
          "r": -0.0506,
          "g": -0.144,
          "b": -0.1843,
          "pos": -0.0408,
          "chrom": 0.0267
        },
        {
          "t": 5.067,
          "r": -0.0628,
          "g": -0.1608,
          "b": -0.202,
          "pos": -0.1593,
          "chrom": 0.1415
        },
        {
          "t": 5.2,
          "r": -0.1007,
          "g": -0.1889,
          "b": -0.2282,
          "pos": -0.1993,
          "chrom": 0.1682
        },
        {
          "t": 5.267,
          "r": -0.1157,
          "g": -0.1978,
          "b": -0.2378,
          "pos": -0.298,
          "chrom": 0.2552
        },
        {
          "t": 5.4,
          "r": -0.0777,
          "g": -0.1703,
          "b": -0.2112,
          "pos": 0.2613,
          "chrom": -0.28
        },
        {
          "t": 5.467,
          "r": -0.0864,
          "g": -0.1711,
          "b": -0.212,
          "pos": 0.8111,
          "chrom": -0.6981
        },
        {
          "t": 5.533,
          "r": -0.0522,
          "g": -0.1431,
          "b": -0.1818,
          "pos": 0.6015,
          "chrom": -0.4352
        },
        {
          "t": 5.667,
          "r": 0.0678,
          "g": -0.042,
          "b": -0.0466,
          "pos": 0.2115,
          "chrom": 0.0378
        },
        {
          "t": 5.733,
          "r": 0.2391,
          "g": 0.1049,
          "b": 0.1016,
          "pos": 0.1909,
          "chrom": -0.0433
        },
        {
          "t": 5.867,
          "r": 0.8081,
          "g": 0.4553,
          "b": 0.4847,
          "pos": -1.5,
          "chrom": 1.4959
        },
        {
          "t": 5.933,
          "r": 0.6697,
          "g": 0.4611,
          "b": 0.4436,
          "pos": -0.8827,
          "chrom": 0.4713
        },
        {
          "t": 6.067,
          "r": 0.6946,
          "g": 0.5025,
          "b": 0.4562,
          "pos": 1.5,
          "chrom": -1.4078
        },
        {
          "t": 6.133,
          "r": 0.6738,
          "g": 0.5032,
          "b": 0.4703,
          "pos": 1.0091,
          "chrom": -0.5702
        },
        {
          "t": 6.267,
          "r": 0.8127,
          "g": 0.5838,
          "b": 0.5676,
          "pos": 0.0964,
          "chrom": -0.1145
        },
        {
          "t": 6.333,
          "r": 0.7986,
          "g": 0.5751,
          "b": 0.5561,
          "pos": -0.8564,
          "chrom": 0.5124
        },
        {
          "t": 6.467,
          "r": 0.6642,
          "g": 0.4519,
          "b": 0.4417,
          "pos": -1.1115,
          "chrom": 0.8683
        },
        {
          "t": 6.533,
          "r": 0.6115,
          "g": 0.4232,
          "b": 0.3852,
          "pos": 0.2194,
          "chrom": -0.1383
        },
        {
          "t": 6.667,
          "r": 0.5805,
          "g": 0.3585,
          "b": 0.2991,
          "pos": 0.4494,
          "chrom": -0.3455
        },
        {
          "t": 6.733,
          "r": 0.5282,
          "g": 0.3195,
          "b": 0.2663,
          "pos": 0.1224,
          "chrom": -0.0518
        },
        {
          "t": 6.8,
          "r": 0.472,
          "g": 0.2826,
          "b": 0.229,
          "pos": 0.0755,
          "chrom": 0.0296
        },
        {
          "t": 6.933,
          "r": 0.4555,
          "g": 0.2729,
          "b": 0.2221,
          "pos": 0.9904,
          "chrom": -0.7344
        },
        {
          "t": 7.0,
          "r": 0.5168,
          "g": 0.2991,
          "b": 0.2491,
          "pos": 1.0034,
          "chrom": -0.8861
        },
        {
          "t": 7.133,
          "r": 0.6429,
          "g": 0.3316,
          "b": 0.3404,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 7.2,
          "r": 0.4976,
          "g": 0.2517,
          "b": 0.2331,
          "pos": -1.5,
          "chrom": 1.421
        },
        {
          "t": 7.333,
          "r": 0.4141,
          "g": 0.2086,
          "b": 0.1557,
          "pos": 1.106,
          "chrom": -0.6868
        },
        {
          "t": 7.4,
          "r": 0.442,
          "g": 0.2368,
          "b": 0.189,
          "pos": 0.7811,
          "chrom": -0.5725
        },
        {
          "t": 7.533,
          "r": 0.4142,
          "g": 0.242,
          "b": 0.2119,
          "pos": 0.2995,
          "chrom": -0.21
        },
        {
          "t": 7.6,
          "r": 0.3904,
          "g": 0.2323,
          "b": 0.2131,
          "pos": 1.265,
          "chrom": -0.9652
        },
        {
          "t": 7.733,
          "r": 0.483,
          "g": 0.2874,
          "b": 0.2761,
          "pos": -0.412,
          "chrom": 0.1085
        },
        {
          "t": 7.8,
          "r": 0.6065,
          "g": 0.2827,
          "b": 0.3376,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 7.933,
          "r": 0.2593,
          "g": 0.1342,
          "b": 0.1464,
          "pos": 0.1663,
          "chrom": 0.0044
        },
        {
          "t": 8.0,
          "r": 0.3073,
          "g": 0.1634,
          "b": 0.1692,
          "pos": 1.5,
          "chrom": -1.3476
        },
        {
          "t": 8.067,
          "r": 0.2649,
          "g": 0.1392,
          "b": 0.1489,
          "pos": 1.3317,
          "chrom": -0.9018
        },
        {
          "t": 8.2,
          "r": 0.2889,
          "g": 0.1779,
          "b": 0.2012,
          "pos": 0.1886,
          "chrom": -0.1055
        },
        {
          "t": 8.267,
          "r": 0.3801,
          "g": 0.2456,
          "b": 0.2766,
          "pos": 0.0471,
          "chrom": -0.2342
        },
        {
          "t": 8.4,
          "r": 0.37,
          "g": 0.2132,
          "b": 0.2373,
          "pos": -0.4829,
          "chrom": 0.2265
        },
        {
          "t": 8.467,
          "r": 0.3501,
          "g": 0.2094,
          "b": 0.2463,
          "pos": -0.5199,
          "chrom": 0.4751
        },
        {
          "t": 8.6,
          "r": 0.1909,
          "g": 0.1246,
          "b": 0.1687,
          "pos": -0.0225,
          "chrom": 0.1244
        },
        {
          "t": 8.667,
          "r": 0.2135,
          "g": 0.1447,
          "b": 0.1819,
          "pos": 0.4588,
          "chrom": -0.3387
        },
        {
          "t": 8.8,
          "r": 0.168,
          "g": 0.1176,
          "b": 0.1585,
          "pos": 0.0344,
          "chrom": 0.0148
        },
        {
          "t": 8.867,
          "r": 0.1745,
          "g": 0.1228,
          "b": 0.1609,
          "pos": -0.453,
          "chrom": 0.4224
        },
        {
          "t": 9.0,
          "r": 0.311,
          "g": 0.2094,
          "b": 0.2082,
          "pos": 0.5242,
          "chrom": -0.5417
        },
        {
          "t": 9.067,
          "r": 0.3489,
          "g": 0.2317,
          "b": 0.2304,
          "pos": 0.5632,
          "chrom": -0.6219
        },
        {
          "t": 9.2,
          "r": 0.2593,
          "g": 0.1721,
          "b": 0.1918,
          "pos": -0.7193,
          "chrom": 0.7015
        },
        {
          "t": 9.267,
          "r": 0.1896,
          "g": 0.1471,
          "b": 0.1612,
          "pos": -0.3333,
          "chrom": 0.4507
        },
        {
          "t": 9.4,
          "r": 0.2847,
          "g": 0.231,
          "b": 0.2374,
          "pos": 0.2405,
          "chrom": -0.2617
        },
        {
          "t": 9.467,
          "r": 0.2677,
          "g": 0.2267,
          "b": 0.2368,
          "pos": 0.0915,
          "chrom": -0.196
        },
        {
          "t": 9.533,
          "r": 0.2789,
          "g": 0.2477,
          "b": 0.2608,
          "pos": 0.1571,
          "chrom": -0.2092
        },
        {
          "t": 9.667,
          "r": 0.2573,
          "g": 0.2045,
          "b": 0.21,
          "pos": -0.0706,
          "chrom": 0.135
        },
        {
          "t": 9.733,
          "r": 0.2384,
          "g": 0.1999,
          "b": 0.2144,
          "pos": -0.3049,
          "chrom": 0.3317
        },
        {
          "t": 9.867,
          "r": 0.2764,
          "g": 0.2456,
          "b": 0.2626,
          "pos": 0.1854,
          "chrom": -0.162
        },
        {
          "t": 9.933,
          "r": 0.2756,
          "g": 0.2526,
          "b": 0.2717,
          "pos": 0.2015,
          "chrom": -0.1895
        },
        {
          "t": 10.067,
          "r": 0.2865,
          "g": 0.2586,
          "b": 0.2876,
          "pos": -0.2551,
          "chrom": 0.1677
        },
        {
          "t": 10.133,
          "r": 0.2874,
          "g": 0.2597,
          "b": 0.2898,
          "pos": -0.0551,
          "chrom": 0.0192
        },
        {
          "t": 10.267,
          "r": 0.3465,
          "g": 0.2472,
          "b": 0.2451,
          "pos": 0.2093,
          "chrom": -0.1504
        },
        {
          "t": 10.333,
          "r": 0.3804,
          "g": 0.2367,
          "b": 0.2239,
          "pos": -0.0404,
          "chrom": 0.0536
        },
        {
          "t": 10.467,
          "r": 0.3828,
          "g": 0.2081,
          "b": 0.1809,
          "pos": -0.0314,
          "chrom": 0.0708
        },
        {
          "t": 10.533,
          "r": 0.3703,
          "g": 0.197,
          "b": 0.1676,
          "pos": 0.077,
          "chrom": -0.0402
        },
        {
          "t": 10.667,
          "r": 0.3506,
          "g": 0.1876,
          "b": 0.1623,
          "pos": -0.0541,
          "chrom": -0.0303
        },
        {
          "t": 10.733,
          "r": 0.3375,
          "g": 0.184,
          "b": 0.161,
          "pos": -0.0221,
          "chrom": -0.0261
        },
        {
          "t": 10.8,
          "r": 0.3292,
          "g": 0.1469,
          "b": 0.1069,
          "pos": 0.0355,
          "chrom": -0.0049
        },
        {
          "t": 10.933,
          "r": 0.3392,
          "g": 0.1487,
          "b": 0.1048,
          "pos": -0.0091,
          "chrom": 0.0408
        },
        {
          "t": 11.0,
          "r": 0.3433,
          "g": 0.1575,
          "b": 0.1123,
          "pos": -0.0362,
          "chrom": 0.0333
        },
        {
          "t": 11.133,
          "r": 0.3297,
          "g": 0.1616,
          "b": 0.1192,
          "pos": 0.0678,
          "chrom": -0.0569
        },
        {
          "t": 11.2,
          "r": 0.3278,
          "g": 0.165,
          "b": 0.1233,
          "pos": 0.0707,
          "chrom": -0.0753
        },
        {
          "t": 11.333,
          "r": 0.3358,
          "g": 0.1735,
          "b": 0.1348,
          "pos": -0.1058,
          "chrom": 0.0759
        },
        {
          "t": 11.4,
          "r": 0.345,
          "g": 0.1565,
          "b": 0.1037,
          "pos": -0.0258,
          "chrom": 0.0448
        },
        {
          "t": 11.533,
          "r": 0.3535,
          "g": 0.1641,
          "b": 0.109,
          "pos": 0.0751,
          "chrom": -0.0533
        },
        {
          "t": 11.6,
          "r": 0.3523,
          "g": 0.1596,
          "b": 0.1081,
          "pos": -0.064,
          "chrom": 0.0469
        },
        {
          "t": 11.733,
          "r": 0.3527,
          "g": 0.1534,
          "b": 0.0978,
          "pos": -0.0021,
          "chrom": -0.0071
        },
        {
          "t": 11.8,
          "r": 0.3501,
          "g": 0.149,
          "b": 0.0931,
          "pos": 0.1159,
          "chrom": -0.1103
        },
        {
          "t": 11.933,
          "r": 0.3359,
          "g": 0.137,
          "b": 0.0835,
          "pos": 0.0227,
          "chrom": -0.0038
        },
        {
          "t": 12.0,
          "r": 0.3587,
          "g": 0.1358,
          "b": 0.0784,
          "pos": -0.0472,
          "chrom": 0.0606
        },
        {
          "t": 12.067,
          "r": 0.3569,
          "g": 0.1399,
          "b": 0.0858,
          "pos": -0.0857,
          "chrom": 0.0806
        },
        {
          "t": 12.2,
          "r": 0.3639,
          "g": 0.1456,
          "b": 0.0931,
          "pos": -0.0428,
          "chrom": 0.04
        },
        {
          "t": 12.267,
          "r": 0.3631,
          "g": 0.1485,
          "b": 0.096,
          "pos": 0.085,
          "chrom": -0.0617
        },
        {
          "t": 12.4,
          "r": 0.3491,
          "g": 0.1484,
          "b": 0.1027,
          "pos": 0.026,
          "chrom": -0.0364
        },
        {
          "t": 12.467,
          "r": 0.3341,
          "g": 0.1397,
          "b": 0.0984,
          "pos": -0.0784,
          "chrom": 0.0386
        },
        {
          "t": 12.6,
          "r": 0.356,
          "g": 0.1293,
          "b": 0.0731,
          "pos": 0.0783,
          "chrom": -0.0689
        },
        {
          "t": 12.667,
          "r": 0.3282,
          "g": 0.1065,
          "b": 0.0532,
          "pos": 0.0571,
          "chrom": -0.0225
        },
        {
          "t": 12.8,
          "r": 0.3055,
          "g": 0.0843,
          "b": 0.0315,
          "pos": -0.1092,
          "chrom": 0.1235
        },
        {
          "t": 12.867,
          "r": 0.2928,
          "g": 0.0741,
          "b": 0.022,
          "pos": -0.0316,
          "chrom": 0.0396
        },
        {
          "t": 13.0,
          "r": 0.2436,
          "g": 0.0621,
          "b": 0.0169,
          "pos": 0.0939,
          "chrom": -0.0953
        },
        {
          "t": 13.067,
          "r": 0.2134,
          "g": 0.0437,
          "b": 0.0045,
          "pos": 0.0047,
          "chrom": -0.0403
        },
        {
          "t": 13.2,
          "r": 0.2201,
          "g": 0.0351,
          "b": -0.013,
          "pos": -0.044,
          "chrom": 0.0098
        },
        {
          "t": 13.267,
          "r": 0.1888,
          "g": 0.0055,
          "b": -0.0432,
          "pos": -0.0376,
          "chrom": 0.0676
        },
        {
          "t": 13.4,
          "r": 0.1758,
          "g": -0.0053,
          "b": -0.0584,
          "pos": 0.0511,
          "chrom": 0.0104
        },
        {
          "t": 13.467,
          "r": 0.1856,
          "g": 0.0152,
          "b": -0.034,
          "pos": 0.1486,
          "chrom": -0.1284
        },
        {
          "t": 13.533,
          "r": 0.1924,
          "g": 0.0217,
          "b": -0.0264,
          "pos": 0.134,
          "chrom": -0.1517
        },
        {
          "t": 13.667,
          "r": 0.1871,
          "g": 0.0322,
          "b": -0.0099,
          "pos": -0.1126,
          "chrom": 0.0686
        },
        {
          "t": 13.733,
          "r": 0.1611,
          "g": 0.0175,
          "b": -0.0232,
          "pos": -0.1268,
          "chrom": 0.1165
        },
        {
          "t": 13.867,
          "r": 0.2031,
          "g": 0.0381,
          "b": -0.0183,
          "pos": -0.1401,
          "chrom": 0.1456
        },
        {
          "t": 13.933,
          "r": 0.2159,
          "g": 0.0515,
          "b": -0.0024,
          "pos": -0.0054,
          "chrom": -0.0045
        },
        {
          "t": 14.067,
          "r": 0.1908,
          "g": 0.0512,
          "b": -0.0092,
          "pos": 0.3465,
          "chrom": -0.2996
        },
        {
          "t": 14.133,
          "r": 0.1741,
          "g": 0.0372,
          "b": -0.02,
          "pos": 0.1001,
          "chrom": -0.0644
        },
        {
          "t": 14.267,
          "r": 0.1324,
          "g": 0.0083,
          "b": -0.0411,
          "pos": -0.2648,
          "chrom": 0.2416
        },
        {
          "t": 14.333,
          "r": 0.1287,
          "g": 0.0059,
          "b": -0.0441,
          "pos": -0.0654,
          "chrom": 0.0337
        },
        {
          "t": 14.467,
          "r": 0.1038,
          "g": -0.018,
          "b": -0.0701,
          "pos": 0.1117,
          "chrom": -0.1342
        },
        {
          "t": 14.533,
          "r": 0.0767,
          "g": -0.0456,
          "b": -0.0985,
          "pos": -0.0006,
          "chrom": 0.0157
        },
        {
          "t": 14.667,
          "r": 0.0216,
          "g": -0.0854,
          "b": -0.1322,
          "pos": -0.0367,
          "chrom": 0.0662
        },
        {
          "t": 14.733,
          "r": 0.0215,
          "g": -0.087,
          "b": -0.1317,
          "pos": -0.0818,
          "chrom": 0.0891
        },
        {
          "t": 14.8,
          "r": 0.0015,
          "g": -0.1008,
          "b": -0.1396,
          "pos": -0.0735,
          "chrom": 0.1009
        },
        {
          "t": 14.933,
          "r": -0.0225,
          "g": -0.114,
          "b": -0.1503,
          "pos": 0.2931,
          "chrom": -0.306
        },
        {
          "t": 15.0,
          "r": 0.0133,
          "g": -0.0842,
          "b": -0.1115,
          "pos": 0.1442,
          "chrom": -0.2355
        },
        {
          "t": 15.133,
          "r": -0.168,
          "g": -0.2001,
          "b": -0.1923,
          "pos": -0.3404,
          "chrom": 0.3215
        },
        {
          "t": 15.2,
          "r": -0.1602,
          "g": -0.189,
          "b": -0.1779,
          "pos": -0.1073,
          "chrom": 0.1306
        },
        {
          "t": 15.333,
          "r": -0.2047,
          "g": -0.2271,
          "b": -0.2038,
          "pos": 0.1944,
          "chrom": -0.0838
        },
        {
          "t": 15.4,
          "r": -0.2174,
          "g": -0.2387,
          "b": -0.2148,
          "pos": 0.1814,
          "chrom": -0.0642
        },
        {
          "t": 15.533,
          "r": -0.1504,
          "g": -0.2046,
          "b": -0.174,
          "pos": -0.1127,
          "chrom": -0.0006
        },
        {
          "t": 15.6,
          "r": -0.1861,
          "g": -0.225,
          "b": -0.1823,
          "pos": -0.2685,
          "chrom": 0.1595
        },
        {
          "t": 15.733,
          "r": -0.2707,
          "g": -0.2674,
          "b": -0.2344,
          "pos": 0.2949,
          "chrom": -0.2428
        },
        {
          "t": 15.8,
          "r": -0.2713,
          "g": -0.2695,
          "b": -0.2414,
          "pos": 0.2052,
          "chrom": -0.2155
        },
        {
          "t": 15.933,
          "r": -0.2815,
          "g": -0.2843,
          "b": -0.2609,
          "pos": -0.4661,
          "chrom": 0.3761
        },
        {
          "t": 16.0,
          "r": -0.243,
          "g": -0.2715,
          "b": -0.2694,
          "pos": -0.2107,
          "chrom": 0.2183
        },
        {
          "t": 16.133,
          "r": -0.2135,
          "g": -0.2458,
          "b": -0.2425,
          "pos": -0.1177,
          "chrom": 0.2321
        },
        {
          "t": 16.2,
          "r": -0.1065,
          "g": -0.1696,
          "b": -0.1783,
          "pos": 0.2358,
          "chrom": -0.06
        },
        {
          "t": 16.267,
          "r": -0.0311,
          "g": -0.1158,
          "b": -0.1225,
          "pos": 1.3737,
          "chrom": -1.101
        },
        {
          "t": 16.4,
          "r": 0.2356,
          "g": 0.0503,
          "b": 0.0341,
          "pos": -0.314,
          "chrom": -0.0002
        },
        {
          "t": 16.467,
          "r": 0.207,
          "g": -0.0308,
          "b": 0.0379,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 16.6,
          "r": 0.0422,
          "g": -0.0702,
          "b": -0.0625,
          "pos": 0.4551,
          "chrom": -0.2607
        },
        {
          "t": 16.667,
          "r": -0.0006,
          "g": -0.0861,
          "b": -0.088,
          "pos": 1.5,
          "chrom": -1.3621
        },
        {
          "t": 16.8,
          "r": -0.0155,
          "g": -0.0891,
          "b": -0.0854,
          "pos": -0.0697,
          "chrom": 0.1396
        },
        {
          "t": 16.867,
          "r": -0.0343,
          "g": -0.1104,
          "b": -0.1142,
          "pos": -0.2341,
          "chrom": 0.222
        },
        {
          "t": 17.0,
          "r": 0.0733,
          "g": -0.0287,
          "b": -0.0537,
          "pos": -0.1102,
          "chrom": 0.0274
        },
        {
          "t": 17.067,
          "r": 0.0674,
          "g": -0.0395,
          "b": -0.064,
          "pos": -0.2881,
          "chrom": 0.234
        },
        {
          "t": 17.2,
          "r": 0.1217,
          "g": 0.0033,
          "b": -0.0301,
          "pos": 0.0588,
          "chrom": -0.0816
        },
        {
          "t": 17.267,
          "r": 0.1285,
          "g": 0.0118,
          "b": -0.0208,
          "pos": 0.3247,
          "chrom": -0.3698
        },
        {
          "t": 17.4,
          "r": 0.0416,
          "g": -0.0505,
          "b": -0.0667,
          "pos": -0.0635,
          "chrom": 0.0731
        },
        {
          "t": 17.467,
          "r": -0.0183,
          "g": -0.0889,
          "b": -0.0979,
          "pos": -0.3158,
          "chrom": 0.3695
        },
        {
          "t": 17.533,
          "r": -0.0353,
          "g": -0.1033,
          "b": -0.1082,
          "pos": -0.2968,
          "chrom": 0.3647
        },
        {
          "t": 17.667,
          "r": 0.0095,
          "g": -0.0883,
          "b": -0.1029,
          "pos": 0.1611,
          "chrom": -0.1474
        },
        {
          "t": 17.733,
          "r": 0.0122,
          "g": -0.0887,
          "b": -0.108,
          "pos": 0.4078,
          "chrom": -0.3886
        },
        {
          "t": 17.867,
          "r": 0.0165,
          "g": -0.11,
          "b": -0.1362,
          "pos": 0.3981,
          "chrom": -0.3361
        },
        {
          "t": 17.933,
          "r": 0.0755,
          "g": -0.0864,
          "b": -0.1198,
          "pos": -0.1734,
          "chrom": 0.0807
        },
        {
          "t": 18.067,
          "r": 0.0809,
          "g": -0.1002,
          "b": -0.1287,
          "pos": -1.0041,
          "chrom": 0.8206
        },
        {
          "t": 18.133,
          "r": 0.0617,
          "g": -0.1253,
          "b": -0.1674,
          "pos": -0.5301,
          "chrom": 0.516
        },
        {
          "t": 18.267,
          "r": 0.1943,
          "g": -0.0499,
          "b": -0.1231,
          "pos": 0.4799,
          "chrom": -0.4324
        },
        {
          "t": 18.333,
          "r": 0.2389,
          "g": -0.0234,
          "b": -0.1046,
          "pos": 1.3737,
          "chrom": -1.0115
        },
        {
          "t": 18.467,
          "r": 0.3001,
          "g": -0.007,
          "b": -0.0946,
          "pos": 1.0453,
          "chrom": -0.7666
        },
        {
          "t": 18.533,
          "r": 0.6132,
          "g": 0.1818,
          "b": 0.1518,
          "pos": -1.5,
          "chrom": 1.1161
        },
        {
          "t": 18.667,
          "r": 0.5694,
          "g": 0.1165,
          "b": 0.0652,
          "pos": -1.5,
          "chrom": 1.265
        },
        {
          "t": 18.733,
          "r": 0.3864,
          "g": 0.053,
          "b": -0.037,
          "pos": 1.0048,
          "chrom": -0.5732
        },
        {
          "t": 18.8,
          "r": 0.4895,
          "g": 0.1179,
          "b": 0.0128,
          "pos": 1.5,
          "chrom": -1.2129
        },
        {
          "t": 18.933,
          "r": 0.6121,
          "g": 0.1787,
          "b": 0.0482,
          "pos": 0.3716,
          "chrom": -0.3054
        },
        {
          "t": 19.0,
          "r": 0.5784,
          "g": 0.1506,
          "b": 0.0042,
          "pos": 0.4435,
          "chrom": -0.3033
        },
        {
          "t": 19.133,
          "r": 0.7644,
          "g": 0.2379,
          "b": 0.0791,
          "pos": -0.8683,
          "chrom": 0.6731
        },
        {
          "t": 19.2,
          "r": 0.6696,
          "g": 0.177,
          "b": 0.0105,
          "pos": -0.9475,
          "chrom": 0.7661
        },
        {
          "t": 19.333,
          "r": 0.7884,
          "g": 0.2526,
          "b": 0.0554,
          "pos": 0.4617,
          "chrom": -0.4549
        },
        {
          "t": 19.4,
          "r": 0.7548,
          "g": 0.2211,
          "b": 0.0203,
          "pos": 0.4302,
          "chrom": -0.4512
        },
        {
          "t": 19.533,
          "r": 0.6766,
          "g": 0.175,
          "b": -0.0081,
          "pos": -0.1359,
          "chrom": 0.1205
        },
        {
          "t": 19.6,
          "r": 0.6567,
          "g": 0.1606,
          "b": -0.0189,
          "pos": 0.0902,
          "chrom": -0.0359
        },
        {
          "t": 19.733,
          "r": 0.5788,
          "g": 0.0949,
          "b": -0.0882,
          "pos": 0.042,
          "chrom": 0.1979
        },
        {
          "t": 19.8,
          "r": 0.4352,
          "g": 0.0441,
          "b": -0.098,
          "pos": -0.3121,
          "chrom": 0.4287
        },
        {
          "t": 19.933,
          "r": 0.472,
          "g": 0.1019,
          "b": -0.0322,
          "pos": 0.1428,
          "chrom": -0.3566
        },
        {
          "t": 20.0,
          "r": 0.3235,
          "g": 0.0154,
          "b": -0.1162,
          "pos": 0.1512,
          "chrom": -0.3588
        },
        {
          "t": 20.133,
          "r": 0.1778,
          "g": -0.1056,
          "b": -0.229,
          "pos": -0.2417,
          "chrom": 0.1424
        },
        {
          "t": 20.2,
          "r": 0.127,
          "g": -0.1473,
          "b": -0.2735,
          "pos": -0.0069,
          "chrom": -0.0112
        },
        {
          "t": 20.267,
          "r": 0.0815,
          "g": -0.1623,
          "b": -0.2747,
          "pos": 0.2155,
          "chrom": -0.1525
        },
        {
          "t": 20.4,
          "r": 0.1748,
          "g": -0.0706,
          "b": -0.1719,
          "pos": 0.2012,
          "chrom": 0.123
        },
        {
          "t": 20.467,
          "r": 0.2643,
          "g": 0.0444,
          "b": -0.0143,
          "pos": 0.0833,
          "chrom": 0.2771
        },
        {
          "t": 20.6,
          "r": 0.3923,
          "g": 0.3754,
          "b": 0.4413,
          "pos": -0.3985,
          "chrom": 0.2651
        },
        {
          "t": 20.667,
          "r": 0.489,
          "g": 0.4853,
          "b": 0.5935,
          "pos": -0.4743,
          "chrom": 0.246
        },
        {
          "t": 20.8,
          "r": 0.6639,
          "g": 0.6633,
          "b": 0.7905,
          "pos": 0.4421,
          "chrom": -0.8227
        },
        {
          "t": 20.867,
          "r": 0.6822,
          "g": 0.6568,
          "b": 0.7794,
          "pos": 0.7674,
          "chrom": -1.223
        },
        {
          "t": 21.0,
          "r": 0.3573,
          "g": 0.2113,
          "b": 0.2785,
          "pos": -0.3113,
          "chrom": 0.7517
        },
        {
          "t": 21.067,
          "r": 0.3658,
          "g": 0.1396,
          "b": 0.1967,
          "pos": -0.8578,
          "chrom": 1.4306
        },
        {
          "t": 21.2,
          "r": 0.5001,
          "g": 0.1678,
          "b": 0.1792,
          "pos": 0.146,
          "chrom": -0.0451
        },
        {
          "t": 21.267,
          "r": 0.5213,
          "g": 0.1664,
          "b": 0.1635,
          "pos": 0.6754,
          "chrom": -0.653
        },
        {
          "t": 21.4,
          "r": 0.4568,
          "g": 0.1757,
          "b": 0.2204,
          "pos": -0.0862,
          "chrom": -0.3014
        },
        {
          "t": 21.467,
          "r": 0.2475,
          "g": 0.0859,
          "b": 0.1784,
          "pos": -0.595,
          "chrom": 0.2162
        },
        {
          "t": 21.533,
          "r": 0.0502,
          "g": -0.013,
          "b": 0.108,
          "pos": -0.3821,
          "chrom": 0.2876
        },
        {
          "t": 21.667,
          "r": 0.0613,
          "g": -0.0882,
          "b": -0.0241,
          "pos": 0.7475,
          "chrom": -0.5524
        },
        {
          "t": 21.733,
          "r": -0.0281,
          "g": -0.1405,
          "b": -0.0613,
          "pos": 0.2275,
          "chrom": -0.1334
        },
        {
          "t": 21.867,
          "r": -0.2795,
          "g": -0.2782,
          "b": -0.1641,
          "pos": -0.5838,
          "chrom": 0.7195
        },
        {
          "t": 21.933,
          "r": -0.2244,
          "g": -0.2565,
          "b": -0.1699,
          "pos": -0.1256,
          "chrom": 0.2175
        },
        {
          "t": 22.067,
          "r": -0.1283,
          "g": -0.1418,
          "b": -0.0597,
          "pos": 0.0049,
          "chrom": -0.2445
        },
        {
          "t": 22.133,
          "r": -0.1,
          "g": -0.1122,
          "b": -0.0282,
          "pos": 0.0829,
          "chrom": -0.2127
        },
        {
          "t": 22.267,
          "r": 0.0172,
          "g": -0.1012,
          "b": -0.0751,
          "pos": 0.3202,
          "chrom": -0.1678
        },
        {
          "t": 22.333,
          "r": 0.0418,
          "g": -0.0744,
          "b": -0.0378,
          "pos": -0.1054,
          "chrom": 0.1257
        },
        {
          "t": 22.467,
          "r": 0.0541,
          "g": -0.0506,
          "b": -0.0035,
          "pos": -0.2268,
          "chrom": 0.1414
        },
        {
          "t": 22.533,
          "r": 0.0283,
          "g": -0.062,
          "b": -0.0072,
          "pos": 0.0892,
          "chrom": -0.0836
        },
        {
          "t": 22.667,
          "r": -0.0661,
          "g": -0.0945,
          "b": -0.0182,
          "pos": 0.4145,
          "chrom": -0.2879
        },
        {
          "t": 22.733,
          "r": -0.0624,
          "g": -0.0895,
          "b": -0.0045,
          "pos": 0.0972,
          "chrom": -0.0211
        },
        {
          "t": 22.8,
          "r": 0.0372,
          "g": -0.0682,
          "b": 0.005,
          "pos": -0.4442,
          "chrom": 0.4243
        },
        {
          "t": 22.933,
          "r": 0.0009,
          "g": -0.0572,
          "b": 0.0299,
          "pos": -0.396,
          "chrom": 0.3126
        },
        {
          "t": 23.0,
          "r": -0.0369,
          "g": -0.038,
          "b": 0.0515,
          "pos": 0.1087,
          "chrom": -0.1466
        },
        {
          "t": 23.133,
          "r": -0.1546,
          "g": -0.059,
          "b": 0.0544,
          "pos": 0.5448,
          "chrom": -0.5839
        },
        {
          "t": 23.2,
          "r": -0.2202,
          "g": -0.07,
          "b": 0.0638,
          "pos": 0.4586,
          "chrom": -0.5254
        },
        {
          "t": 23.333,
          "r": -0.3769,
          "g": -0.1709,
          "b": 0.001,
          "pos": -0.3297,
          "chrom": 0.3756
        },
        {
          "t": 23.4,
          "r": -0.2796,
          "g": -0.1804,
          "b": -0.0322,
          "pos": -0.5064,
          "chrom": 0.6248
        },
        {
          "t": 23.533,
          "r": -0.3578,
          "g": -0.2704,
          "b": -0.1231,
          "pos": -0.1503,
          "chrom": 0.4825
        },
        {
          "t": 23.6,
          "r": -0.4083,
          "g": -0.3215,
          "b": -0.1783,
          "pos": 0.1708,
          "chrom": 0.1577
        },
        {
          "t": 23.733,
          "r": -0.3368,
          "g": -0.2913,
          "b": -0.1703,
          "pos": 0.6436,
          "chrom": -1.1301
        },
        {
          "t": 23.8,
          "r": -0.4111,
          "g": -0.3422,
          "b": -0.2193,
          "pos": 0.1546,
          "chrom": -0.9224
        },
        {
          "t": 23.933,
          "r": -0.8173,
          "g": -0.6161,
          "b": -0.5024,
          "pos": -0.4305,
          "chrom": 0.0441
        },
        {
          "t": 24.0,
          "r": -0.8047,
          "g": -0.6248,
          "b": -0.5469,
          "pos": -0.4782,
          "chrom": 0.5206
        },
        {
          "t": 24.133,
          "r": -0.6308,
          "g": -0.5609,
          "b": -0.5599,
          "pos": -0.7023,
          "chrom": 1.5
        },
        {
          "t": 24.2,
          "r": 0.1012,
          "g": 0.0347,
          "b": 0.0019,
          "pos": 0.5734,
          "chrom": 0.8485
        },
        {
          "t": 24.267,
          "r": 0.5816,
          "g": 0.6963,
          "b": 0.7552,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 24.4,
          "r": 1.1678,
          "g": 1.5,
          "b": 1.5,
          "pos": -0.2274,
          "chrom": -1.4731
        },
        {
          "t": 24.467,
          "r": 1.0736,
          "g": 1.5,
          "b": 1.5,
          "pos": -1.5,
          "chrom": 0.4363
        },
        {
          "t": 24.6,
          "r": 1.0858,
          "g": 1.5,
          "b": 1.5,
          "pos": 0.2417,
          "chrom": 0.2452
        },
        {
          "t": 24.667,
          "r": 0.8831,
          "g": 1.5,
          "b": 1.5,
          "pos": 0.7249,
          "chrom": -0.1041
        },
        {
          "t": 24.8,
          "r": 0.5873,
          "g": 1.3926,
          "b": 1.5,
          "pos": -0.6169,
          "chrom": 1.0262
        },
        {
          "t": 24.867,
          "r": 0.468,
          "g": 1.2652,
          "b": 1.5,
          "pos": -0.5254,
          "chrom": 1.0137
        },
        {
          "t": 25.0,
          "r": 0.4005,
          "g": 1.1752,
          "b": 1.5,
          "pos": 0.773,
          "chrom": -0.9111
        },
        {
          "t": 25.067,
          "r": 0.4109,
          "g": 1.1805,
          "b": 1.5,
          "pos": 1.0372,
          "chrom": -1.5
        },
        {
          "t": 25.2,
          "r": 0.1222,
          "g": 0.6433,
          "b": 0.9125,
          "pos": -0.3756,
          "chrom": 0.0372
        },
        {
          "t": 25.267,
          "r": -0.0269,
          "g": 0.4832,
          "b": 0.7418,
          "pos": -0.7874,
          "chrom": 0.8194
        },
        {
          "t": 25.4,
          "r": -0.2979,
          "g": 0.0662,
          "b": 0.232,
          "pos": -0.2648,
          "chrom": 0.5917
        },
        {
          "t": 25.467,
          "r": -0.374,
          "g": -0.0812,
          "b": 0.0437,
          "pos": -0.0358,
          "chrom": 0.5474
        },
        {
          "t": 25.533,
          "r": -0.4373,
          "g": -0.1169,
          "b": 0.0,
          "pos": 0.187,
          "chrom": 0.2492
        },
        {
          "t": 25.667,
          "r": -0.3677,
          "g": -0.0153,
          "b": 0.113,
          "pos": 0.3865,
          "chrom": -0.6771
        },
        {
          "t": 25.733,
          "r": -0.2356,
          "g": 0.0735,
          "b": 0.1881,
          "pos": 0.1965,
          "chrom": -0.5844
        },
        {
          "t": 25.867,
          "r": -0.1538,
          "g": 0.0617,
          "b": 0.1351,
          "pos": -0.143,
          "chrom": 0.0838
        },
        {
          "t": 25.933,
          "r": -0.2627,
          "g": 0.0462,
          "b": 0.1378,
          "pos": -0.0667,
          "chrom": 0.1127
        },
        {
          "t": 26.067,
          "r": -0.6541,
          "g": -0.0552,
          "b": 0.1264,
          "pos": -0.4158,
          "chrom": 0.5069
        },
        {
          "t": 26.133,
          "r": -0.7892,
          "g": -0.1077,
          "b": 0.099,
          "pos": -0.4132,
          "chrom": 0.5229
        },
        {
          "t": 26.267,
          "r": -0.9137,
          "g": -0.1569,
          "b": 0.0585,
          "pos": 0.8801,
          "chrom": -0.8713
        },
        {
          "t": 26.333,
          "r": -0.9063,
          "g": -0.173,
          "b": 0.0353,
          "pos": 0.4606,
          "chrom": -0.5317
        },
        {
          "t": 26.467,
          "r": -0.8918,
          "g": -0.356,
          "b": -0.1898,
          "pos": -0.5311,
          "chrom": 0.5321
        },
        {
          "t": 26.533,
          "r": -0.9514,
          "g": -0.3985,
          "b": -0.2322,
          "pos": 0.0882,
          "chrom": -0.0304
        },
        {
          "t": 26.667,
          "r": -1.0618,
          "g": -0.5046,
          "b": -0.3243,
          "pos": -0.0335,
          "chrom": 0.0114
        },
        {
          "t": 26.733,
          "r": -1.0835,
          "g": -0.5402,
          "b": -0.3605,
          "pos": -0.2582,
          "chrom": 0.2107
        },
        {
          "t": 26.867,
          "r": -1.1156,
          "g": -0.6022,
          "b": -0.4383,
          "pos": -0.0938,
          "chrom": 0.0542
        },
        {
          "t": 26.933,
          "r": -1.0842,
          "g": -0.6078,
          "b": -0.4585,
          "pos": 0.0443,
          "chrom": -0.0405
        },
        {
          "t": 27.0,
          "r": -0.9363,
          "g": -0.6048,
          "b": -0.5173,
          "pos": 0.2782,
          "chrom": -0.1957
        },
        {
          "t": 27.133,
          "r": -0.9002,
          "g": -0.6045,
          "b": -0.5237,
          "pos": 0.0707,
          "chrom": -0.0431
        },
        {
          "t": 27.2,
          "r": -0.8545,
          "g": -0.5771,
          "b": -0.4982,
          "pos": -0.1796,
          "chrom": 0.1058
        },
        {
          "t": 27.333,
          "r": -0.8445,
          "g": -0.5719,
          "b": -0.494,
          "pos": 0.0024,
          "chrom": -0.0071
        },
        {
          "t": 27.4,
          "r": -0.8621,
          "g": -0.5872,
          "b": -0.511,
          "pos": 0.0076,
          "chrom": 0.0664
        },
        {
          "t": 27.533,
          "r": -0.8448,
          "g": -0.5653,
          "b": -0.4789,
          "pos": -0.0465,
          "chrom": 0.0398
        },
        {
          "t": 27.6,
          "r": -0.7206,
          "g": -0.5152,
          "b": -0.4587,
          "pos": 0.0804,
          "chrom": -0.144
        },
        {
          "t": 27.733,
          "r": -0.7718,
          "g": -0.5517,
          "b": -0.491,
          "pos": -0.0615,
          "chrom": 0.0322
        },
        {
          "t": 27.8,
          "r": -0.7757,
          "g": -0.5592,
          "b": -0.5014,
          "pos": -0.0099,
          "chrom": 0.0182
        },
        {
          "t": 27.933,
          "r": -0.8109,
          "g": -0.5843,
          "b": -0.5323,
          "pos": 0.1695,
          "chrom": -0.0998
        },
        {
          "t": 28.0,
          "r": -0.8234,
          "g": -0.6044,
          "b": -0.5565,
          "pos": -0.1294,
          "chrom": 0.1897
        },
        {
          "t": 28.133,
          "r": -0.7889,
          "g": -0.5874,
          "b": -0.5417,
          "pos": -0.1524,
          "chrom": 0.1301
        },
        {
          "t": 28.2,
          "r": -0.6898,
          "g": -0.5467,
          "b": -0.5279,
          "pos": 0.198,
          "chrom": -0.2492
        },
        {
          "t": 28.267,
          "r": -0.6689,
          "g": -0.5361,
          "b": -0.5185,
          "pos": 0.2683,
          "chrom": -0.3382
        },
        {
          "t": 28.4,
          "r": -0.7043,
          "g": -0.5621,
          "b": -0.5342,
          "pos": -0.0567,
          "chrom": 0.046
        },
        {
          "t": 28.467,
          "r": -0.7029,
          "g": -0.5632,
          "b": -0.5349,
          "pos": 0.0063,
          "chrom": 0.037
        },
        {
          "t": 28.6,
          "r": -0.6808,
          "g": -0.5511,
          "b": -0.5188,
          "pos": -0.1137,
          "chrom": 0.2066
        },
        {
          "t": 28.667,
          "r": -0.6422,
          "g": -0.5263,
          "b": -0.4978,
          "pos": -0.0803,
          "chrom": 0.181
        },
        {
          "t": 28.8,
          "r": -0.4858,
          "g": -0.4187,
          "b": -0.4017,
          "pos": 0.0072,
          "chrom": -0.1187
        },
        {
          "t": 28.867,
          "r": -0.4843,
          "g": -0.4138,
          "b": -0.3922,
          "pos": -0.1411,
          "chrom": -0.0484
        },
        {
          "t": 29.0,
          "r": -0.5242,
          "g": -0.4315,
          "b": -0.4261,
          "pos": 0.3224,
          "chrom": -0.2701
        },
        {
          "t": 29.067,
          "r": -0.5447,
          "g": -0.4514,
          "b": -0.4456,
          "pos": 0.294,
          "chrom": -0.1764
        },
        {
          "t": 29.2,
          "r": -0.4904,
          "g": -0.42,
          "b": -0.4183,
          "pos": -0.3618,
          "chrom": 0.3827
        },
        {
          "t": 29.267,
          "r": -0.4387,
          "g": -0.3837,
          "b": -0.3843,
          "pos": -0.3104,
          "chrom": 0.2897
        },
        {
          "t": 29.4,
          "r": -0.2462,
          "g": -0.2389,
          "b": -0.2502,
          "pos": 0.0272,
          "chrom": -0.098
        },
        {
          "t": 29.467,
          "r": -0.1956,
          "g": -0.1855,
          "b": -0.1895,
          "pos": 0.441,
          "chrom": -0.4051
        },
        {
          "t": 29.533,
          "r": -0.1619,
          "g": -0.1421,
          "b": -0.1408,
          "pos": 0.7363,
          "chrom": -0.5522
        },
        {
          "t": 29.667,
          "r": -0.0633,
          "g": -0.0563,
          "b": -0.0104,
          "pos": -0.5927,
          "chrom": 0.5991
        },
        {
          "t": 29.733,
          "r": -0.1074,
          "g": 0.0044,
          "b": 0.0994,
          "pos": -0.8809,
          "chrom": 0.6608
        },
        {
          "t": 29.867,
          "r": -0.0679,
          "g": 0.1064,
          "b": 0.2165,
          "pos": 0.6067,
          "chrom": -0.764
        },
        {
          "t": 29.933,
          "r": -0.0978,
          "g": 0.0686,
          "b": 0.1699,
          "pos": 0.4356,
          "chrom": -0.3832
        },
        {
          "t": 30.067,
          "r": -0.1108,
          "g": 0.0103,
          "b": 0.1059,
          "pos": -0.4654,
          "chrom": 0.6681
        },
        {
          "t": 30.133,
          "r": -0.1631,
          "g": 0.0274,
          "b": 0.1375,
          "pos": 0.0183,
          "chrom": 0.1162
        },
        {
          "t": 30.267,
          "r": -0.2215,
          "g": 0.0662,
          "b": 0.2057,
          "pos": 0.2634,
          "chrom": -0.2618
        },
        {
          "t": 30.333,
          "r": -0.2579,
          "g": 0.0625,
          "b": 0.2128,
          "pos": 0.0043,
          "chrom": -0.0625
        },
        {
          "t": 30.467,
          "r": -0.3195,
          "g": 0.0712,
          "b": 0.2486,
          "pos": -0.1683,
          "chrom": -0.1325
        },
        {
          "t": 30.533,
          "r": -0.3346,
          "g": 0.0778,
          "b": 0.2692,
          "pos": -0.2292,
          "chrom": 0.0555
        },
        {
          "t": 30.667,
          "r": -0.2278,
          "g": -0.013,
          "b": 0.0922,
          "pos": 0.2076,
          "chrom": 0.1456
        },
        {
          "t": 30.733,
          "r": -0.2432,
          "g": 0.0118,
          "b": 0.1349,
          "pos": 0.3037,
          "chrom": -0.0704
        },
        {
          "t": 30.867,
          "r": -0.3612,
          "g": 0.0191,
          "b": 0.2003,
          "pos": -0.2316,
          "chrom": 0.195
        },
        {
          "t": 30.933,
          "r": -0.4308,
          "g": 0.0078,
          "b": 0.2145,
          "pos": -0.1798,
          "chrom": 0.164
        },
        {
          "t": 31.0,
          "r": -0.4831,
          "g": 0.0107,
          "b": 0.2288,
          "pos": 0.061,
          "chrom": -0.1853
        },
        {
          "t": 31.133,
          "r": -0.4966,
          "g": 0.0138,
          "b": 0.2538,
          "pos": -0.0082,
          "chrom": -0.2031
        },
        {
          "t": 31.2,
          "r": -0.3505,
          "g": -0.1219,
          "b": 0.006,
          "pos": -0.033,
          "chrom": 0.1117
        },
        {
          "t": 31.333,
          "r": -0.3961,
          "g": -0.1708,
          "b": -0.0397,
          "pos": 0.0953,
          "chrom": 0.0702
        },
        {
          "t": 31.4,
          "r": -0.4151,
          "g": -0.1899,
          "b": -0.0629,
          "pos": 0.0859,
          "chrom": -0.0471
        },
        {
          "t": 31.533,
          "r": -0.4177,
          "g": -0.2071,
          "b": -0.0794,
          "pos": -0.125,
          "chrom": 0.1264
        },
        {
          "t": 31.6,
          "r": -0.3622,
          "g": -0.1977,
          "b": -0.0831,
          "pos": -0.2729,
          "chrom": 0.2065
        },
        {
          "t": 31.733,
          "r": -0.2513,
          "g": -0.1719,
          "b": -0.0968,
          "pos": 0.1792,
          "chrom": -0.1625
        },
        {
          "t": 31.8,
          "r": -0.214,
          "g": -0.2344,
          "b": -0.2158,
          "pos": 0.3039,
          "chrom": -0.1581
        },
        {
          "t": 31.933,
          "r": -0.1806,
          "g": -0.2323,
          "b": -0.2262,
          "pos": -0.1279,
          "chrom": -0.0393
        },
        {
          "t": 32.0,
          "r": -0.159,
          "g": -0.2268,
          "b": -0.228,
          "pos": 0.1157,
          "chrom": -0.4572
        },
        {
          "t": 32.133,
          "r": -0.4991,
          "g": -0.4639,
          "b": -0.4583,
          "pos": -0.1878,
          "chrom": 0.3171
        },
        {
          "t": 32.2,
          "r": -0.6986,
          "g": -0.5666,
          "b": -0.5206,
          "pos": -0.8564,
          "chrom": 1.1927
        },
        {
          "t": 32.267,
          "r": -0.846,
          "g": -0.5876,
          "b": -0.4968,
          "pos": -0.6722,
          "chrom": 0.9346
        },
        {
          "t": 32.4,
          "r": -0.7976,
          "g": -0.3692,
          "b": -0.2281,
          "pos": 1.4143,
          "chrom": -1.3573
        },
        {
          "t": 32.467,
          "r": -0.7498,
          "g": -0.32,
          "b": -0.1607,
          "pos": 1.2753,
          "chrom": -1.2213
        },
        {
          "t": 32.6,
          "r": -0.6475,
          "g": -0.2601,
          "b": -0.0655,
          "pos": -1.4474,
          "chrom": 1.0754
        },
        {
          "t": 32.667,
          "r": -0.473,
          "g": -0.2237,
          "b": -0.0434,
          "pos": -1.5,
          "chrom": 1.3288
        },
        {
          "t": 32.8,
          "r": -0.2512,
          "g": -0.1961,
          "b": -0.1506,
          "pos": 0.7586,
          "chrom": -0.559
        },
        {
          "t": 32.867,
          "r": -0.17,
          "g": -0.2047,
          "b": -0.1988,
          "pos": 0.9106,
          "chrom": -0.7552
        },
        {
          "t": 33.0,
          "r": -0.1673,
          "g": -0.2851,
          "b": -0.3267,
          "pos": 0.3126,
          "chrom": -0.2278
        },
        {
          "t": 33.067,
          "r": -0.2502,
          "g": -0.3439,
          "b": -0.3773,
          "pos": 0.1203,
          "chrom": -0.0459
        },
        {
          "t": 33.2,
          "r": -0.4294,
          "g": -0.4552,
          "b": -0.4789,
          "pos": -0.4622,
          "chrom": 0.4928
        },
        {
          "t": 33.267,
          "r": -0.4882,
          "g": -0.4921,
          "b": -0.5128,
          "pos": -0.3269,
          "chrom": 0.3718
        },
        {
          "t": 33.4,
          "r": -0.6198,
          "g": -0.5351,
          "b": -0.5361,
          "pos": -0.2755,
          "chrom": 0.0558
        },
        {
          "t": 33.467,
          "r": -0.7812,
          "g": -0.6009,
          "b": -0.572,
          "pos": -0.0405,
          "chrom": -0.264
        },
        {
          "t": 33.533,
          "r": -0.9016,
          "g": -0.667,
          "b": -0.6447,
          "pos": 0.4832,
          "chrom": -0.65
        },
        {
          "t": 33.667,
          "r": -1.3909,
          "g": -1.0069,
          "b": -0.9474,
          "pos": 0.3242,
          "chrom": 0.0297
        },
        {
          "t": 33.733,
          "r": -1.5,
          "g": -1.1294,
          "b": -1.0305,
          "pos": -0.1225,
          "chrom": 0.4507
        },
        {
          "t": 33.867,
          "r": -1.5,
          "g": -1.0794,
          "b": -0.9553,
          "pos": -0.1865,
          "chrom": 0.0405
        },
        {
          "t": 33.933,
          "r": -1.5,
          "g": -1.0746,
          "b": -0.9495,
          "pos": -0.1268,
          "chrom": -0.0818
        },
        {
          "t": 34.067,
          "r": -1.5,
          "g": -1.0783,
          "b": -0.9494,
          "pos": -0.2418,
          "chrom": 0.2214
        },
        {
          "t": 34.133,
          "r": -1.5,
          "g": -1.0682,
          "b": -0.932,
          "pos": -0.2345,
          "chrom": 0.3043
        },
        {
          "t": 34.267,
          "r": -1.4239,
          "g": -0.9473,
          "b": -0.8174,
          "pos": 0.4059,
          "chrom": -0.4397
        },
        {
          "t": 34.333,
          "r": -1.4094,
          "g": -0.9043,
          "b": -0.7718,
          "pos": 0.6215,
          "chrom": -0.6724
        },
        {
          "t": 34.467,
          "r": -1.4766,
          "g": -0.9838,
          "b": -0.8476,
          "pos": -0.1074,
          "chrom": 0.2661
        },
        {
          "t": 34.533,
          "r": -1.3772,
          "g": -0.9377,
          "b": -0.8095,
          "pos": -0.4017,
          "chrom": 0.4127
        },
        {
          "t": 34.667,
          "r": -1.1723,
          "g": -0.8318,
          "b": -0.725,
          "pos": -0.1803,
          "chrom": 0.0124
        },
        {
          "t": 34.733,
          "r": -1.2297,
          "g": -0.8683,
          "b": -0.7603,
          "pos": -0.1449,
          "chrom": 0.1576
        },
        {
          "t": 34.867,
          "r": -1.1506,
          "g": -0.8135,
          "b": -0.711,
          "pos": 0.1573,
          "chrom": 0.0091
        },
        {
          "t": 34.933,
          "r": -1.1112,
          "g": -0.7654,
          "b": -0.6589,
          "pos": 0.4385,
          "chrom": -0.3049
        },
        {
          "t": 35.0,
          "r": -1.0481,
          "g": -0.7252,
          "b": -0.6253,
          "pos": 0.4273,
          "chrom": -0.4087
        },
        {
          "t": 35.133,
          "r": -0.9858,
          "g": -0.6558,
          "b": -0.5345,
          "pos": -0.2237,
          "chrom": 0.0025
        },
        {
          "t": 35.2,
          "r": -1.0189,
          "g": -0.675,
          "b": -0.5486,
          "pos": -0.4122,
          "chrom": 0.2731
        },
        {
          "t": 35.333,
          "r": -1.0472,
          "g": -0.7137,
          "b": -0.6025,
          "pos": -0.1229,
          "chrom": 0.2201
        },
        {
          "t": 35.4,
          "r": -0.9642,
          "g": -0.7249,
          "b": -0.6546,
          "pos": 0.2088,
          "chrom": -0.0464
        },
        {
          "t": 35.533,
          "r": -0.9221,
          "g": -0.7098,
          "b": -0.65,
          "pos": 0.1854,
          "chrom": -0.1136
        },
        {
          "t": 35.6,
          "r": -0.9068,
          "g": -0.7032,
          "b": -0.6383,
          "pos": 0.0344,
          "chrom": -0.0513
        },
        {
          "t": 35.733,
          "r": -0.9442,
          "g": -0.7076,
          "b": -0.6361,
          "pos": 0.072,
          "chrom": -0.1304
        },
        {
          "t": 35.8,
          "r": -0.9289,
          "g": -0.6861,
          "b": -0.6069,
          "pos": -0.1011,
          "chrom": -0.0245
        },
        {
          "t": 35.933,
          "r": -0.8735,
          "g": -0.6108,
          "b": -0.5215,
          "pos": -0.2249,
          "chrom": 0.0599
        },
        {
          "t": 36.0,
          "r": -0.7818,
          "g": -0.5612,
          "b": -0.4879,
          "pos": -0.0367,
          "chrom": 0.0153
        },
        {
          "t": 36.133,
          "r": -0.7535,
          "g": -0.4338,
          "b": -0.3239,
          "pos": 0.0184,
          "chrom": 0.2971
        },
        {
          "t": 36.2,
          "r": -0.6744,
          "g": -0.3194,
          "b": -0.1882,
          "pos": 0.1056,
          "chrom": 0.2648
        },
        {
          "t": 36.267,
          "r": -0.5487,
          "g": -0.1645,
          "b": -0.012,
          "pos": 0.3484,
          "chrom": -0.0393
        },
        {
          "t": 36.4,
          "r": -0.2629,
          "g": 0.2102,
          "b": 0.4355,
          "pos": 0.0105,
          "chrom": -0.4938
        },
        {
          "t": 36.467,
          "r": -0.1953,
          "g": 0.3411,
          "b": 0.6093,
          "pos": -0.4595,
          "chrom": -0.3628
        },
        {
          "t": 36.6,
          "r": -0.3358,
          "g": 0.1087,
          "b": 0.309,
          "pos": 0.0034,
          "chrom": 0.2995
        },
        {
          "t": 36.667,
          "r": -0.3411,
          "g": 0.1022,
          "b": 0.2935,
          "pos": 0.1964,
          "chrom": 0.4684
        },
        {
          "t": 36.8,
          "r": -0.2808,
          "g": 0.1299,
          "b": 0.3167,
          "pos": -0.1248,
          "chrom": 0.1689
        },
        {
          "t": 36.867,
          "r": -0.2981,
          "g": 0.1161,
          "b": 0.2967,
          "pos": 0.0715,
          "chrom": -0.0487
        },
        {
          "t": 37.0,
          "r": -0.3686,
          "g": 0.0757,
          "b": 0.2612,
          "pos": 0.1768,
          "chrom": -0.413
        },
        {
          "t": 37.067,
          "r": -0.3678,
          "g": 0.0445,
          "b": 0.2178,
          "pos": 0.0244,
          "chrom": -0.4304
        },
        {
          "t": 37.2,
          "r": -0.5262,
          "g": -0.2098,
          "b": -0.093,
          "pos": -0.0688,
          "chrom": 0.2533
        },
        {
          "t": 37.267,
          "r": -0.4779,
          "g": -0.205,
          "b": -0.1043,
          "pos": -0.1256,
          "chrom": 0.4223
        },
        {
          "t": 37.4,
          "r": -0.3914,
          "g": -0.1876,
          "b": -0.1128,
          "pos": -0.0788,
          "chrom": 0.0175
        },
        {
          "t": 37.467,
          "r": -0.3341,
          "g": -0.1665,
          "b": -0.1056,
          "pos": 0.0253,
          "chrom": -0.0476
        },
        {
          "t": 37.6,
          "r": -0.2616,
          "g": -0.128,
          "b": -0.0812,
          "pos": -0.0595,
          "chrom": 0.06
        },
        {
          "t": 37.667,
          "r": -0.1766,
          "g": -0.0461,
          "b": 0.0103,
          "pos": -0.0023,
          "chrom": -0.1462
        },
        {
          "t": 37.733,
          "r": -0.1153,
          "g": 0.075,
          "b": 0.1577,
          "pos": 0.2793,
          "chrom": -0.4132
        },
        {
          "t": 37.867,
          "r": -0.0989,
          "g": 0.1225,
          "b": 0.2265,
          "pos": 0.1732,
          "chrom": -0.0324
        },
        {
          "t": 37.933,
          "r": -0.0897,
          "g": 0.1693,
          "b": 0.298,
          "pos": -0.2954,
          "chrom": 0.3751
        },
        {
          "t": 38.067,
          "r": -0.0005,
          "g": 0.2821,
          "b": 0.4338,
          "pos": -0.3111,
          "chrom": 0.3585
        },
        {
          "t": 38.133,
          "r": 0.0941,
          "g": 0.3477,
          "b": 0.4852,
          "pos": 0.0558,
          "chrom": 0.0025
        },
        {
          "t": 38.267,
          "r": 0.1905,
          "g": 0.3941,
          "b": 0.5134,
          "pos": 0.2016,
          "chrom": -0.4375
        },
        {
          "t": 38.333,
          "r": 0.1652,
          "g": 0.3531,
          "b": 0.4664,
          "pos": -0.0014,
          "chrom": -0.1811
        },
        {
          "t": 38.467,
          "r": 0.0433,
          "g": 0.0874,
          "b": 0.1218,
          "pos": -0.0299,
          "chrom": 0.2403
        },
        {
          "t": 38.533,
          "r": 0.0446,
          "g": 0.0283,
          "b": 0.0347,
          "pos": 0.1785,
          "chrom": -0.0583
        },
        {
          "t": 38.667,
          "r": 0.0229,
          "g": -0.1149,
          "b": -0.1623,
          "pos": 0.1088,
          "chrom": -0.1223
        },
        {
          "t": 38.733,
          "r": -0.0259,
          "g": -0.1903,
          "b": -0.2412,
          "pos": -0.2194,
          "chrom": 0.2305
        },
        {
          "t": 38.867,
          "r": 0.004,
          "g": -0.2063,
          "b": -0.2796,
          "pos": -0.233,
          "chrom": 0.1399
        },
        {
          "t": 38.933,
          "r": 0.0775,
          "g": -0.1632,
          "b": -0.2467,
          "pos": 0.0764,
          "chrom": -0.1374
        },
        {
          "t": 39.0,
          "r": 0.1249,
          "g": -0.1387,
          "b": -0.2385,
          "pos": 0.2816,
          "chrom": -0.232
        },
        {
          "t": 39.133,
          "r": 0.1966,
          "g": -0.0461,
          "b": -0.1305,
          "pos": -0.0369,
          "chrom": 0.1345
        },
        {
          "t": 39.2,
          "r": 0.2413,
          "g": 0.0318,
          "b": -0.0402,
          "pos": -0.2358,
          "chrom": 0.2601
        },
        {
          "t": 39.333,
          "r": 0.3379,
          "g": 0.174,
          "b": 0.1255,
          "pos": 0.0754,
          "chrom": -0.1631
        },
        {
          "t": 39.4,
          "r": 0.3767,
          "g": 0.2317,
          "b": 0.1917,
          "pos": 0.3143,
          "chrom": -0.5142
        },
        {
          "t": 39.533,
          "r": 0.2822,
          "g": 0.205,
          "b": 0.2007,
          "pos": -0.0377,
          "chrom": 0.0623
        },
        {
          "t": 39.6,
          "r": 0.1546,
          "g": 0.0435,
          "b": 0.0217,
          "pos": -0.1945,
          "chrom": 0.5164
        },
        {
          "t": 39.733,
          "r": 0.2697,
          "g": 0.1671,
          "b": 0.1691,
          "pos": 0.0479,
          "chrom": 0.0
        },
        {
          "t": 39.8,
          "r": 0.2402,
          "g": 0.1518,
          "b": 0.165,
          "pos": -0.0499,
          "chrom": -0.1163
        },
        {
          "t": 39.933,
          "r": 0.2038,
          "g": 0.132,
          "b": 0.1596,
          "pos": -0.2017,
          "chrom": 0.1384
        },
        {
          "t": 40.0,
          "r": 0.1688,
          "g": 0.0954,
          "b": 0.1196,
          "pos": 0.0993,
          "chrom": -0.2026
        },
        {
          "t": 40.133,
          "r": 0.1604,
          "g": 0.0881,
          "b": 0.1128,
          "pos": 0.24,
          "chrom": -0.2175
        },
        {
          "t": 40.2,
          "r": 0.0173,
          "g": -0.0829,
          "b": -0.075,
          "pos": 0.0242,
          "chrom": 0.214
        },
        {
          "t": 40.267,
          "r": 0.054,
          "g": -0.0342,
          "b": -0.0152,
          "pos": -0.0205,
          "chrom": 0.2145
        },
        {
          "t": 40.4,
          "r": 0.0081,
          "g": -0.0513,
          "b": -0.0137,
          "pos": -0.1665,
          "chrom": 0.072
        },
        {
          "t": 40.467,
          "r": -0.0467,
          "g": -0.1169,
          "b": -0.0952,
          "pos": -0.2303,
          "chrom": 0.3242
        },
        {
          "t": 40.6,
          "r": 0.0642,
          "g": -0.0893,
          "b": -0.1067,
          "pos": 0.2339,
          "chrom": -0.2712
        },
        {
          "t": 40.667,
          "r": 0.1151,
          "g": -0.0731,
          "b": -0.1051,
          "pos": 0.1091,
          "chrom": -0.3957
        },
        {
          "t": 40.8,
          "r": 0.0754,
          "g": -0.1754,
          "b": -0.248,
          "pos": -0.0438,
          "chrom": -0.0226
        },
        {
          "t": 40.867,
          "r": 0.0689,
          "g": -0.1815,
          "b": -0.2626,
          "pos": 0.0739,
          "chrom": -0.0176
        },
        {
          "t": 41.0,
          "r": 0.1174,
          "g": -0.1659,
          "b": -0.2426,
          "pos": -0.7456,
          "chrom": 0.8029
        },
        {
          "t": 41.067,
          "r": 0.1992,
          "g": -0.1194,
          "b": -0.2178,
          "pos": 0.182,
          "chrom": 0.1889
        },
        {
          "t": 41.2,
          "r": 0.6292,
          "g": 0.1908,
          "b": 0.0619,
          "pos": 1.5,
          "chrom": -1.231
        },
        {
          "t": 41.267,
          "r": 0.7626,
          "g": 0.3623,
          "b": 0.312,
          "pos": -0.4945,
          "chrom": 0.0702
        },
        {
          "t": 41.4,
          "r": 0.8328,
          "g": 0.4609,
          "b": 0.4296,
          "pos": -1.1989,
          "chrom": 0.7578
        },
        {
          "t": 41.467,
          "r": 0.8666,
          "g": 0.4875,
          "b": 0.4444,
          "pos": 0.013,
          "chrom": -0.0077
        },
        {
          "t": 41.6,
          "r": 0.8923,
          "g": 0.4599,
          "b": 0.3614,
          "pos": 0.29,
          "chrom": -0.0985
        },
        {
          "t": 41.667,
          "r": 0.901,
          "g": 0.4442,
          "b": 0.3239,
          "pos": 0.3473,
          "chrom": -0.1142
        },
        {
          "t": 41.733,
          "r": 0.8803,
          "g": 0.4013,
          "b": 0.2536,
          "pos": 0.4855,
          "chrom": -0.2228
        },
        {
          "t": 41.867,
          "r": 0.8581,
          "g": 0.3398,
          "b": 0.1575,
          "pos": 0.3861,
          "chrom": -0.3194
        },
        {
          "t": 41.933,
          "r": 0.8404,
          "g": 0.2992,
          "b": 0.1034,
          "pos": -0.0024,
          "chrom": -0.0891
        },
        {
          "t": 42.067,
          "r": 0.6623,
          "g": 0.1498,
          "b": -0.0396,
          "pos": -0.8654,
          "chrom": 0.5697
        },
        {
          "t": 42.133,
          "r": 0.6121,
          "g": 0.1046,
          "b": -0.0943,
          "pos": -0.7346,
          "chrom": 0.4202
        },
        {
          "t": 42.267,
          "r": 0.439,
          "g": -0.037,
          "b": -0.2547,
          "pos": 0.1929,
          "chrom": -0.1954
        },
        {
          "t": 42.333,
          "r": 0.2986,
          "g": -0.1243,
          "b": -0.3388,
          "pos": 0.729,
          "chrom": -0.3906
        },
        {
          "t": 42.467,
          "r": 0.1143,
          "g": -0.2092,
          "b": -0.3785,
          "pos": 0.6521,
          "chrom": -0.1456
        },
        {
          "t": 42.533,
          "r": 0.2551,
          "g": -0.0891,
          "b": -0.2304,
          "pos": 0.1524,
          "chrom": 0.0418
        },
        {
          "t": 42.667,
          "r": 0.3808,
          "g": 0.0601,
          "b": -0.019,
          "pos": -0.4538,
          "chrom": -0.0317
        },
        {
          "t": 42.733,
          "r": 0.3718,
          "g": 0.0881,
          "b": 0.0241,
          "pos": -0.6524,
          "chrom": 0.0499
        },
        {
          "t": 42.867,
          "r": 0.2222,
          "g": -0.0679,
          "b": -0.1474,
          "pos": -0.51,
          "chrom": 0.4526
        },
        {
          "t": 42.933,
          "r": 0.1346,
          "g": -0.1339,
          "b": -0.2264,
          "pos": 0.1184,
          "chrom": 0.201
        },
        {
          "t": 43.0,
          "r": 0.0637,
          "g": -0.1644,
          "b": -0.2686,
          "pos": 0.6242,
          "chrom": -0.1777
        },
        {
          "t": 43.133,
          "r": 0.0725,
          "g": -0.1222,
          "b": -0.2022,
          "pos": 0.55,
          "chrom": -0.2704
        },
        {
          "t": 43.2,
          "r": 0.1279,
          "g": -0.1253,
          "b": -0.2277,
          "pos": 0.3987,
          "chrom": -0.2542
        },
        {
          "t": 43.333,
          "r": 0.0766,
          "g": -0.0359,
          "b": -0.0416,
          "pos": -0.4499,
          "chrom": 0.07
        },
        {
          "t": 43.4,
          "r": -0.0089,
          "g": -0.0762,
          "b": -0.0635,
          "pos": -0.5159,
          "chrom": 0.1287
        },
        {
          "t": 43.533,
          "r": -0.0989,
          "g": -0.2002,
          "b": -0.2066,
          "pos": -0.0606,
          "chrom": 0.0659
        },
        {
          "t": 43.6,
          "r": -0.2301,
          "g": -0.3175,
          "b": -0.3229,
          "pos": -0.3231,
          "chrom": 0.4011
        },
        {
          "t": 43.733,
          "r": -0.4198,
          "g": -0.4597,
          "b": -0.4689,
          "pos": -0.0181,
          "chrom": 0.1773
        },
        {
          "t": 43.8,
          "r": -0.4671,
          "g": -0.5114,
          "b": -0.5487,
          "pos": 0.7978,
          "chrom": -0.5446
        },
        {
          "t": 43.933,
          "r": -0.6148,
          "g": -0.5792,
          "b": -0.5884,
          "pos": 0.3844,
          "chrom": -0.3962
        },
        {
          "t": 44.0,
          "r": -0.6591,
          "g": -0.5926,
          "b": -0.5706,
          "pos": -0.4061,
          "chrom": 0.1846
        },
        {
          "t": 44.133,
          "r": -0.7451,
          "g": -0.6475,
          "b": -0.6237,
          "pos": -0.1927,
          "chrom": 0.1076
        },
        {
          "t": 44.2,
          "r": -0.7761,
          "g": -0.6681,
          "b": -0.6418,
          "pos": -0.1926,
          "chrom": 0.2088
        },
        {
          "t": 44.267,
          "r": -0.8053,
          "g": -0.6838,
          "b": -0.6544,
          "pos": -0.4049,
          "chrom": 0.4538
        },
        {
          "t": 44.4,
          "r": -0.632,
          "g": -0.6104,
          "b": -0.6305,
          "pos": 0.2751,
          "chrom": -0.2332
        },
        {
          "t": 44.467,
          "r": -0.6079,
          "g": -0.5921,
          "b": -0.6177,
          "pos": 0.4982,
          "chrom": -0.4798
        },
        {
          "t": 44.6,
          "r": -0.7544,
          "g": -0.6607,
          "b": -0.6611,
          "pos": 0.0064,
          "chrom": 0.0255
        },
        {
          "t": 44.667,
          "r": -0.7971,
          "g": -0.6769,
          "b": -0.6651,
          "pos": -0.1148,
          "chrom": 0.1025
        },
        {
          "t": 44.8,
          "r": -0.9294,
          "g": -0.7357,
          "b": -0.6907,
          "pos": 0.0221,
          "chrom": -0.0307
        },
        {
          "t": 44.867,
          "r": -1.0061,
          "g": -0.7744,
          "b": -0.7123,
          "pos": 0.2574,
          "chrom": -0.1811
        },
        {
          "t": 45.0,
          "r": -1.0127,
          "g": -0.7774,
          "b": -0.6798,
          "pos": -0.2696,
          "chrom": 0.1672
        },
        {
          "t": 45.067,
          "r": -1.0945,
          "g": -0.8234,
          "b": -0.7082,
          "pos": -0.5685,
          "chrom": 0.4312
        },
        {
          "t": 45.2,
          "r": -1.1595,
          "g": -0.8121,
          "b": -0.6685,
          "pos": 0.1893,
          "chrom": -0.0702
        },
        {
          "t": 45.267,
          "r": -1.1437,
          "g": -0.7862,
          "b": -0.6323,
          "pos": 0.4258,
          "chrom": -0.2784
        },
        {
          "t": 45.4,
          "r": -1.0117,
          "g": -0.6776,
          "b": -0.5073,
          "pos": 0.0643,
          "chrom": -0.0842
        },
        {
          "t": 45.467,
          "r": -0.9491,
          "g": -0.6298,
          "b": -0.4546,
          "pos": -0.0881,
          "chrom": 0.0042
        },
        {
          "t": 45.6,
          "r": -0.9061,
          "g": -0.5986,
          "b": -0.4219,
          "pos": -0.0192,
          "chrom": -0.0076
        },
        {
          "t": 45.667,
          "r": -0.9264,
          "g": -0.6128,
          "b": -0.4353,
          "pos": 0.0646,
          "chrom": -0.0347
        },
        {
          "t": 45.733,
          "r": -0.9412,
          "g": -0.6232,
          "b": -0.4453,
          "pos": -0.0098,
          "chrom": 0.0527
        },
        {
          "t": 45.867,
          "r": -0.9683,
          "g": -0.6462,
          "b": -0.4684,
          "pos": -0.3219,
          "chrom": 0.2525
        },
        {
          "t": 45.933,
          "r": -0.9617,
          "g": -0.6434,
          "b": -0.4731,
          "pos": -0.0121,
          "chrom": -0.0531
        },
        {
          "t": 46.067,
          "r": -0.9298,
          "g": -0.6245,
          "b": -0.4751,
          "pos": 0.3698,
          "chrom": -0.3034
        },
        {
          "t": 46.133,
          "r": -0.8874,
          "g": -0.5992,
          "b": -0.4523,
          "pos": 0.0928,
          "chrom": -0.0014
        },
        {
          "t": 46.267,
          "r": -0.5705,
          "g": -0.4223,
          "b": -0.3103,
          "pos": -0.1102,
          "chrom": 0.1577
        },
        {
          "t": 46.333,
          "r": -0.4021,
          "g": -0.2897,
          "b": -0.184,
          "pos": -0.1473,
          "chrom": 0.1315
        },
        {
          "t": 46.467,
          "r": -0.161,
          "g": -0.0857,
          "b": 0.0202,
          "pos": -0.0799,
          "chrom": 0.0406
        },
        {
          "t": 46.533,
          "r": -0.0701,
          "g": 0.0091,
          "b": 0.1204,
          "pos": 0.0679,
          "chrom": -0.0827
        },
        {
          "t": 46.667,
          "r": 0.0272,
          "g": 0.1259,
          "b": 0.2499,
          "pos": 0.0919,
          "chrom": -0.1693
        },
        {
          "t": 46.733,
          "r": 0.084,
          "g": 0.1792,
          "b": 0.3042,
          "pos": 0.0863,
          "chrom": -0.1582
        },
        {
          "t": 46.867,
          "r": 0.1336,
          "g": 0.1859,
          "b": 0.2959,
          "pos": -0.066,
          "chrom": 0.0907
        },
        {
          "t": 46.933,
          "r": 0.0998,
          "g": 0.1495,
          "b": 0.2562,
          "pos": -0.1031,
          "chrom": 0.2132
        },
        {
          "t": 47.0,
          "r": 0.1508,
          "g": 0.1359,
          "b": 0.211,
          "pos": 0.0703,
          "chrom": 0.1652
        },
        {
          "t": 47.133,
          "r": 0.3607,
          "g": 0.2556,
          "b": 0.3052,
          "pos": 0.0588,
          "chrom": -0.0217
        },
        {
          "t": 47.2,
          "r": 0.4579,
          "g": 0.3201,
          "b": 0.3706,
          "pos": -0.2982,
          "chrom": -0.0368
        },
        {
          "t": 47.333,
          "r": 0.454,
          "g": 0.3627,
          "b": 0.4151,
          "pos": -0.1444,
          "chrom": -0.0305
        },
        {
          "t": 47.4,
          "r": 0.229,
          "g": 0.1861,
          "b": 0.2379,
          "pos": 0.1509,
          "chrom": 0.0732
        },
        {
          "t": 47.533,
          "r": 0.2756,
          "g": 0.2665,
          "b": 0.3279,
          "pos": 0.2684,
          "chrom": -0.1219
        },
        {
          "t": 47.6,
          "r": 0.2954,
          "g": 0.2842,
          "b": 0.3467,
          "pos": 0.2587,
          "chrom": -0.1948
        },
        {
          "t": 47.733,
          "r": 0.3225,
          "g": 0.3187,
          "b": 0.3976,
          "pos": -0.0188,
          "chrom": 0.0137
        },
        {
          "t": 47.8,
          "r": 0.3694,
          "g": 0.3672,
          "b": 0.4627,
          "pos": -0.4928,
          "chrom": 0.1898
        },
        {
          "t": 47.933,
          "r": 0.4026,
          "g": 0.3923,
          "b": 0.49,
          "pos": -0.2731,
          "chrom": 0.1726
        },
        {
          "t": 48.0,
          "r": 0.4078,
          "g": 0.3101,
          "b": 0.3471,
          "pos": 0.4483,
          "chrom": -0.063
        },
        {
          "t": 48.133,
          "r": 0.5365,
          "g": 0.4246,
          "b": 0.4697,
          "pos": 0.3361,
          "chrom": -0.1915
        },
        {
          "t": 48.2,
          "r": 0.6156,
          "g": 0.4945,
          "b": 0.5452,
          "pos": -0.1174,
          "chrom": -0.1072
        },
        {
          "t": 48.333,
          "r": 0.6382,
          "g": 0.4884,
          "b": 0.5214,
          "pos": -0.2704,
          "chrom": 0.1595
        },
        {
          "t": 48.4,
          "r": 0.6068,
          "g": 0.4723,
          "b": 0.4986,
          "pos": -0.1444,
          "chrom": 0.0773
        },
        {
          "t": 48.467,
          "r": 0.5845,
          "g": 0.4781,
          "b": 0.5067,
          "pos": -0.0405,
          "chrom": -0.0931
        },
        {
          "t": 48.6,
          "r": 0.5231,
          "g": 0.4094,
          "b": 0.414,
          "pos": 0.1965,
          "chrom": 0.0903
        },
        {
          "t": 48.667,
          "r": 0.5555,
          "g": 0.4927,
          "b": 0.5192,
          "pos": 0.3285,
          "chrom": 0.0592
        },
        {
          "t": 48.8,
          "r": 0.6079,
          "g": 0.6916,
          "b": 0.7954,
          "pos": -0.1169,
          "chrom": -0.0362
        },
        {
          "t": 48.867,
          "r": 0.6711,
          "g": 0.8095,
          "b": 0.9506,
          "pos": -0.4278,
          "chrom": 0.2558
        },
        {
          "t": 49.0,
          "r": 0.7602,
          "g": 1.0743,
          "b": 1.2949,
          "pos": 0.0614,
          "chrom": -0.3545
        },
        {
          "t": 49.067,
          "r": 0.8629,
          "g": 1.243,
          "b": 1.5,
          "pos": 0.335,
          "chrom": -0.66
        },
        {
          "t": 49.2,
          "r": 0.786,
          "g": 1.201,
          "b": 1.4715,
          "pos": 0.0537,
          "chrom": 0.5671
        },
        {
          "t": 49.267,
          "r": 0.9657,
          "g": 1.5,
          "b": 1.5,
          "pos": -0.2034,
          "chrom": 0.7192
        },
        {
          "t": 49.4,
          "r": 1.0806,
          "g": 1.5,
          "b": 1.5,
          "pos": -0.1396,
          "chrom": -0.064
        },
        {
          "t": 49.467,
          "r": 1.0468,
          "g": 1.5,
          "b": 1.5,
          "pos": 0.1106,
          "chrom": -0.1638
        },
        {
          "t": 49.6,
          "r": 0.8963,
          "g": 1.5,
          "b": 1.5,
          "pos": 0.0607,
          "chrom": -0.4999
        },
        {
          "t": 49.667,
          "r": 0.7847,
          "g": 1.3819,
          "b": 1.5,
          "pos": 0.1562,
          "chrom": -0.8261
        },
        {
          "t": 49.733,
          "r": 0.6644,
          "g": 1.1934,
          "b": 1.4839,
          "pos": 0.3879,
          "chrom": -0.6733
        },
        {
          "t": 49.867,
          "r": 0.2577,
          "g": 0.5804,
          "b": 0.7357,
          "pos": -0.354,
          "chrom": 1.0406
        },
        {
          "t": 49.933,
          "r": 0.2206,
          "g": 0.5449,
          "b": 0.6998,
          "pos": -0.9088,
          "chrom": 1.2848
        },
        {
          "t": 50.067,
          "r": 0.3871,
          "g": 0.6631,
          "b": 0.7814,
          "pos": 0.1379,
          "chrom": 0.1749
        },
        {
          "t": 50.133,
          "r": 0.4591,
          "g": 0.7675,
          "b": 0.8909,
          "pos": 0.7636,
          "chrom": -0.5057
        },
        {
          "t": 50.267,
          "r": 0.7252,
          "g": 1.2212,
          "b": 1.4652,
          "pos": 0.4346,
          "chrom": -1.3962
        },
        {
          "t": 50.333,
          "r": 0.7192,
          "g": 1.2529,
          "b": 1.5,
          "pos": 0.0255,
          "chrom": -0.7154
        },
        {
          "t": 50.467,
          "r": 0.6152,
          "g": 1.0433,
          "b": 1.2784,
          "pos": -0.7351,
          "chrom": 1.1307
        },
        {
          "t": 50.533,
          "r": 0.5821,
          "g": 1.0244,
          "b": 1.2646,
          "pos": -0.5562,
          "chrom": 0.8737
        },
        {
          "t": 50.667,
          "r": 0.6452,
          "g": 1.0362,
          "b": 1.2522,
          "pos": 0.4547,
          "chrom": 0.0013
        },
        {
          "t": 50.733,
          "r": 0.6647,
          "g": 1.0696,
          "b": 1.2952,
          "pos": 0.5576,
          "chrom": -0.2249
        },
        {
          "t": 50.867,
          "r": 0.6702,
          "g": 1.1572,
          "b": 1.4322,
          "pos": 0.0409,
          "chrom": -0.6694
        },
        {
          "t": 50.933,
          "r": 0.6773,
          "g": 1.1379,
          "b": 1.4091,
          "pos": -0.2454,
          "chrom": -0.2053
        },
        {
          "t": 51.0,
          "r": 0.5381,
          "g": 0.8121,
          "b": 0.979,
          "pos": -0.3806,
          "chrom": 0.4501
        },
        {
          "t": 51.133,
          "r": 0.4459,
          "g": 0.6633,
          "b": 0.7881,
          "pos": -0.166,
          "chrom": 0.1874
        },
        {
          "t": 51.2,
          "r": 0.3236,
          "g": 0.521,
          "b": 0.6211,
          "pos": 0.0043,
          "chrom": -0.1319
        },
        {
          "t": 51.333,
          "r": -0.0554,
          "g": 0.1384,
          "b": 0.1892,
          "pos": 0.3822,
          "chrom": -0.2009
        },
        {
          "t": 51.4,
          "r": -0.1871,
          "g": -0.0019,
          "b": 0.0298,
          "pos": 0.6055,
          "chrom": -0.4673
        },
        {
          "t": 51.533,
          "r": -0.3637,
          "g": -0.1994,
          "b": -0.1774,
          "pos": -0.2567,
          "chrom": 0.2575
        },
        {
          "t": 51.6,
          "r": -0.4785,
          "g": -0.3269,
          "b": -0.2998,
          "pos": -0.843,
          "chrom": 0.8689
        },
        {
          "t": 51.733,
          "r": -0.4122,
          "g": -0.2678,
          "b": -0.253,
          "pos": -0.0122,
          "chrom": -0.068
        },
        {
          "t": 51.8,
          "r": -0.3842,
          "g": -0.2488,
          "b": -0.2388,
          "pos": 0.3634,
          "chrom": -0.4384
        },
        {
          "t": 51.933,
          "r": -0.3622,
          "g": -0.2493,
          "b": -0.2419,
          "pos": 0.2219,
          "chrom": -0.2592
        },
        {
          "t": 52.0,
          "r": -0.3565,
          "g": -0.2443,
          "b": -0.2356,
          "pos": 0.2348,
          "chrom": -0.3242
        },
        {
          "t": 52.133,
          "r": -0.4309,
          "g": -0.3065,
          "b": -0.2829,
          "pos": -0.1848,
          "chrom": 0.2665
        },
        {
          "t": 52.2,
          "r": -0.4718,
          "g": -0.3559,
          "b": -0.3339,
          "pos": -0.2989,
          "chrom": 0.4842
        },
        {
          "t": 52.333,
          "r": -0.3479,
          "g": -0.2273,
          "b": -0.1866,
          "pos": 0.0643,
          "chrom": -0.0456
        },
        {
          "t": 52.4,
          "r": -0.3158,
          "g": -0.2001,
          "b": -0.1536,
          "pos": 0.1257,
          "chrom": -0.1348
        },
        {
          "t": 52.467,
          "r": -0.2287,
          "g": -0.1554,
          "b": -0.1149,
          "pos": 0.0509,
          "chrom": -0.0464
        },
        {
          "t": 52.6,
          "r": -0.0121,
          "g": -0.0246,
          "b": 0.0061,
          "pos": -0.1181,
          "chrom": -0.0179
        },
        {
          "t": 52.667,
          "r": 0.0391,
          "g": 0.0133,
          "b": 0.0371,
          "pos": 0.0303,
          "chrom": -0.1777
        },
        {
          "t": 52.8,
          "r": 0.0344,
          "g": -0.0042,
          "b": 0.0072,
          "pos": 0.141,
          "chrom": -0.0855
        },
        {
          "t": 52.867,
          "r": 0.0185,
          "g": -0.018,
          "b": -0.0079,
          "pos": -0.0733,
          "chrom": 0.1966
        },
        {
          "t": 53.0,
          "r": 0.0259,
          "g": -0.0131,
          "b": -0.0097,
          "pos": -0.0338,
          "chrom": 0.1068
        },
        {
          "t": 53.067,
          "r": 0.0421,
          "g": -0.001,
          "b": 0.0027,
          "pos": -0.0314,
          "chrom": 0.0598
        },
        {
          "t": 53.2,
          "r": 0.0855,
          "g": 0.0377,
          "b": 0.042,
          "pos": -0.024,
          "chrom": -0.0694
        },
        {
          "t": 53.267,
          "r": 0.1231,
          "g": 0.0718,
          "b": 0.0769,
          "pos": 0.2391,
          "chrom": -0.347
        },
        {
          "t": 53.4,
          "r": 0.06,
          "g": 0.0136,
          "b": 0.0241,
          "pos": 0.0556,
          "chrom": 0.0185
        },
        {
          "t": 53.467,
          "r": 0.0808,
          "g": 0.0339,
          "b": 0.0479,
          "pos": -0.1992,
          "chrom": 0.2709
        },
        {
          "t": 53.6,
          "r": 0.0768,
          "g": 0.037,
          "b": 0.0637,
          "pos": -0.1174,
          "chrom": 0.1013
        },
        {
          "t": 53.667,
          "r": 0.073,
          "g": 0.0377,
          "b": 0.0657,
          "pos": -0.0653,
          "chrom": 0.0608
        },
        {
          "t": 53.733,
          "r": 0.0431,
          "g": 0.0254,
          "b": 0.0642,
          "pos": -0.048,
          "chrom": 0.0257
        },
        {
          "t": 53.867,
          "r": 0.0,
          "g": 0.0257,
          "b": 0.0832,
          "pos": 0.159,
          "chrom": -0.2213
        },
        {
          "t": 53.933,
          "r": -0.0258,
          "g": 0.0174,
          "b": 0.0815,
          "pos": 0.2635,
          "chrom": -0.2355
        },
        {
          "t": 54.067,
          "r": -0.0251,
          "g": 0.0159,
          "b": 0.0788,
          "pos": 0.3982,
          "chrom": -0.1967
        },
        {
          "t": 54.133,
          "r": -0.0178,
          "g": 0.0651,
          "b": 0.1459,
          "pos": -0.0082,
          "chrom": 0.0417
        },
        {
          "t": 54.267,
          "r": -0.0315,
          "g": 0.1366,
          "b": 0.2661,
          "pos": -1.1743,
          "chrom": 0.9354
        },
        {
          "t": 54.333,
          "r": -0.1167,
          "g": 0.1438,
          "b": 0.2849,
          "pos": -0.4859,
          "chrom": 0.4346
        },
        {
          "t": 54.467,
          "r": -0.2208,
          "g": 0.2314,
          "b": 0.4148,
          "pos": 0.9872,
          "chrom": -0.9733
        },
        {
          "t": 54.533,
          "r": -0.2725,
          "g": 0.2411,
          "b": 0.4473,
          "pos": 0.4453,
          "chrom": -0.455
        },
        {
          "t": 54.667,
          "r": -0.4003,
          "g": 0.1428,
          "b": 0.3688,
          "pos": 0.2097,
          "chrom": 0.128
        },
        {
          "t": 54.733,
          "r": -0.4432,
          "g": 0.1438,
          "b": 0.3912,
          "pos": 0.4196,
          "chrom": -0.2267
        },
        {
          "t": 54.867,
          "r": -0.361,
          "g": 0.2405,
          "b": 0.5445,
          "pos": -0.9592,
          "chrom": 0.486
        },
        {
          "t": 54.933,
          "r": -0.4021,
          "g": 0.1817,
          "b": 0.4859,
          "pos": -0.992,
          "chrom": 0.6279
        },
        {
          "t": 55.0,
          "r": -0.4492,
          "g": 0.1661,
          "b": 0.4628,
          "pos": -0.1837,
          "chrom": 0.1209
        },
        {
          "t": 55.133,
          "r": -0.4137,
          "g": 0.2326,
          "b": 0.5326,
          "pos": 0.4274,
          "chrom": -0.1126
        },
        {
          "t": 55.2,
          "r": -0.2952,
          "g": 0.2642,
          "b": 0.536,
          "pos": 0.3081,
          "chrom": 0.0671
        },
        {
          "t": 55.333,
          "r": -0.113,
          "g": 0.5591,
          "b": 0.8956,
          "pos": 0.3027,
          "chrom": -0.3481
        },
        {
          "t": 55.4,
          "r": -0.1701,
          "g": 0.6242,
          "b": 1.0185,
          "pos": -0.1412,
          "chrom": -0.1079
        },
        {
          "t": 55.533,
          "r": -0.3431,
          "g": 0.6434,
          "b": 1.1117,
          "pos": -0.1149,
          "chrom": 0.0351
        },
        {
          "t": 55.6,
          "r": -0.3578,
          "g": 0.6449,
          "b": 1.117,
          "pos": 0.0049,
          "chrom": -0.155
        },
        {
          "t": 55.733,
          "r": -0.3522,
          "g": 0.597,
          "b": 1.0631,
          "pos": -0.4353,
          "chrom": 0.3364
        },
        {
          "t": 55.8,
          "r": -0.1576,
          "g": 0.4631,
          "b": 0.7888,
          "pos": -0.073,
          "chrom": 0.3518
        },
        {
          "t": 55.933,
          "r": -0.078,
          "g": 0.4612,
          "b": 0.7523,
          "pos": 0.4648,
          "chrom": -0.2136
        },
        {
          "t": 56.0,
          "r": -0.0406,
          "g": 0.4557,
          "b": 0.7318,
          "pos": 0.3132,
          "chrom": -0.269
        },
        {
          "t": 56.133,
          "r": -0.0486,
          "g": 0.4336,
          "b": 0.7048,
          "pos": -0.0056,
          "chrom": -0.0972
        },
        {
          "t": 56.2,
          "r": -0.0217,
          "g": 0.4173,
          "b": 0.6736,
          "pos": -0.3149,
          "chrom": 0.022
        },
        {
          "t": 56.333,
          "r": 0.0525,
          "g": 0.3759,
          "b": 0.5768,
          "pos": -0.2535,
          "chrom": 0.0906
        },
        {
          "t": 56.4,
          "r": 0.1157,
          "g": 0.2521,
          "b": 0.3609,
          "pos": -0.0343,
          "chrom": 0.2109
        },
        {
          "t": 56.467,
          "r": 0.0674,
          "g": 0.2162,
          "b": 0.3229,
          "pos": -0.0599,
          "chrom": 0.3603
        },
        {
          "t": 56.6,
          "r": -0.0104,
          "g": 0.1693,
          "b": 0.278,
          "pos": 0.1933,
          "chrom": -0.1269
        },
        {
          "t": 56.667,
          "r": -0.0931,
          "g": 0.1465,
          "b": 0.2731,
          "pos": 0.5293,
          "chrom": -0.4574
        },
        {
          "t": 56.8,
          "r": -0.3571,
          "g": 0.0475,
          "b": 0.2548,
          "pos": 0.2203,
          "chrom": -0.3085
        },
        {
          "t": 56.867,
          "r": -0.4648,
          "g": -0.0056,
          "b": 0.2431,
          "pos": -0.1543,
          "chrom": -0.0793
        },
        {
          "t": 57.0,
          "r": -0.5511,
          "g": -0.1486,
          "b": 0.1055,
          "pos": -0.4789,
          "chrom": 0.4624
        },
        {
          "t": 57.067,
          "r": -0.6241,
          "g": -0.1842,
          "b": 0.0892,
          "pos": -0.337,
          "chrom": 0.4441
        },
        {
          "t": 57.2,
          "r": -0.6093,
          "g": -0.1948,
          "b": 0.0752,
          "pos": 0.1213,
          "chrom": -0.0711
        },
        {
          "t": 57.267,
          "r": -0.5544,
          "g": -0.1908,
          "b": 0.0612,
          "pos": 0.2428,
          "chrom": -0.1846
        },
        {
          "t": 57.4,
          "r": -0.4798,
          "g": -0.173,
          "b": 0.0585,
          "pos": 0.2466,
          "chrom": -0.2151
        },
        {
          "t": 57.467,
          "r": -0.4254,
          "g": -0.1634,
          "b": 0.0592,
          "pos": 0.0103,
          "chrom": -0.0728
        },
        {
          "t": 57.6,
          "r": -0.3217,
          "g": -0.1549,
          "b": 0.037,
          "pos": -0.1426,
          "chrom": 0.0447
        },
        {
          "t": 57.667,
          "r": -0.3715,
          "g": -0.1848,
          "b": 0.0096,
          "pos": 0.0787,
          "chrom": -0.0983
        },
        {
          "t": 57.733,
          "r": -0.4221,
          "g": -0.2263,
          "b": -0.0311,
          "pos": 0.103,
          "chrom": -0.0587
        },
        {
          "t": 57.867,
          "r": -0.5226,
          "g": -0.3481,
          "b": -0.1639,
          "pos": -0.2775,
          "chrom": 0.4071
        },
        {
          "t": 57.933,
          "r": -0.5226,
          "g": -0.3716,
          "b": -0.2074,
          "pos": 0.0713,
          "chrom": 0.0875
        },
        {
          "t": 58.067,
          "r": -0.49,
          "g": -0.3632,
          "b": -0.2222,
          "pos": 0.3967,
          "chrom": -0.5794
        },
        {
          "t": 58.133,
          "r": -0.5064,
          "g": -0.3671,
          "b": -0.2188,
          "pos": -0.3843,
          "chrom": 0.0165
        },
        {
          "t": 58.267,
          "r": -0.677,
          "g": -0.5062,
          "b": -0.38,
          "pos": -0.4241,
          "chrom": 0.467
        },
        {
          "t": 58.333,
          "r": -0.75,
          "g": -0.525,
          "b": -0.4168,
          "pos": 0.5005,
          "chrom": -0.1832
        },
        {
          "t": 58.467,
          "r": -0.7998,
          "g": -0.4605,
          "b": -0.3204,
          "pos": 0.3665,
          "chrom": -0.0805
        },
        {
          "t": 58.533,
          "r": -0.7963,
          "g": -0.3963,
          "b": -0.228,
          "pos": -0.1382,
          "chrom": 0.1909
        },
        {
          "t": 58.667,
          "r": -0.6287,
          "g": -0.2024,
          "b": -0.0118,
          "pos": -0.3008,
          "chrom": -0.1203
        },
        {
          "t": 58.733,
          "r": -0.5487,
          "g": -0.1836,
          "b": -0.0184,
          "pos": -0.1919,
          "chrom": -0.0636
        },
        {
          "t": 58.867,
          "r": -0.4745,
          "g": -0.2494,
          "b": -0.1521,
          "pos": 0.1919,
          "chrom": -0.0169
        },
        {
          "t": 58.933,
          "r": -0.4615,
          "g": -0.2495,
          "b": -0.1601,
          "pos": 0.1213,
          "chrom": -0.0394
        },
        {
          "t": 59.067,
          "r": -0.4847,
          "g": -0.2986,
          "b": -0.2228,
          "pos": 0.0156,
          "chrom": 0.0788
        },
        {
          "t": 59.133,
          "r": -0.469,
          "g": -0.2901,
          "b": -0.2184,
          "pos": 0.063,
          "chrom": 0.0539
        },
        {
          "t": 59.2,
          "r": -0.4766,
          "g": -0.2844,
          "b": -0.2056,
          "pos": -0.0434,
          "chrom": 0.0255
        },
        {
          "t": 59.333,
          "r": -0.347,
          "g": -0.1474,
          "b": -0.047,
          "pos": -0.0522,
          "chrom": -0.025
        },
        {
          "t": 59.4,
          "r": -0.3069,
          "g": -0.1546,
          "b": -0.0784,
          "pos": 0.1176,
          "chrom": -0.0201
        },
        {
          "t": 59.533,
          "r": -0.2761,
          "g": -0.0198,
          "b": 0.1186,
          "pos": -0.0157,
          "chrom": -0.0016
        },
        {
          "t": 59.6,
          "r": -0.2711,
          "g": 0.0134,
          "b": 0.1637,
          "pos": -0.0015,
          "chrom": -0.0676
        },
        {
          "t": 59.733,
          "r": -0.2934,
          "g": 0.0109,
          "b": 0.1746,
          "pos": 0.0215,
          "chrom": -0.0073
        },
        {
          "t": 59.8,
          "r": -0.303,
          "g": -0.0059,
          "b": 0.154,
          "pos": -0.1283,
          "chrom": 0.0164
        },
        {
          "t": 59.933,
          "r": -0.3562,
          "g": -0.0813,
          "b": 0.0645,
          "pos": -0.0185,
          "chrom": 0.0095
        },
        {
          "t": 60.0,
          "r": -0.4127,
          "g": -0.2151,
          "b": -0.117,
          "pos": 0.1264,
          "chrom": 0.0794
        },
        {
          "t": 60.133,
          "r": -0.4262,
          "g": -0.2212,
          "b": -0.1167,
          "pos": 0.0333,
          "chrom": 0.0045
        },
        {
          "t": 60.2,
          "r": -0.4387,
          "g": -0.2304,
          "b": -0.1262,
          "pos": -0.0203,
          "chrom": -0.0711
        },
        {
          "t": 60.333,
          "r": -0.4636,
          "g": -0.2287,
          "b": -0.1113,
          "pos": -0.0329,
          "chrom": -0.0223
        },
        {
          "t": 60.4,
          "r": -0.4845,
          "g": -0.2385,
          "b": -0.1183,
          "pos": 0.0056,
          "chrom": -0.0005
        }
      ],
      "hrTracks": {
        "pos_face_full": [
          {
            "t": 0.0,
            "bpm": 89.648
          },
          {
            "t": 5.0,
            "bpm": 111.182
          },
          {
            "t": 10.0,
            "bpm": 112.5
          },
          {
            "t": 15.0,
            "bpm": 123.926
          },
          {
            "t": 20.0,
            "bpm": 102.393
          },
          {
            "t": 25.0,
            "bpm": 88.77
          },
          {
            "t": 30.0,
            "bpm": 87.891
          },
          {
            "t": 35.0,
            "bpm": 85.693
          },
          {
            "t": 40.0,
            "bpm": 112.061
          }
        ],
        "chrom_face_full": [
          {
            "t": 0.0,
            "bpm": 89.209
          },
          {
            "t": 5.0,
            "bpm": 111.182
          },
          {
            "t": 10.0,
            "bpm": 121.289
          },
          {
            "t": 15.0,
            "bpm": 96.68
          },
          {
            "t": 20.0,
            "bpm": 90.967
          },
          {
            "t": 25.0,
            "bpm": 89.209
          },
          {
            "t": 30.0,
            "bpm": 87.891
          },
          {
            "t": 35.0,
            "bpm": 112.939
          },
          {
            "t": 40.0,
            "bpm": 100.635
          }
        ],
        "sqi_top_window": [
          {
            "t": 0.0,
            "bpm": 105.469
          },
          {
            "t": 5.0,
            "bpm": 97.559
          },
          {
            "t": 10.0,
            "bpm": 98.877
          },
          {
            "t": 15.0,
            "bpm": 113.379
          },
          {
            "t": 20.0,
            "bpm": 101.074
          },
          {
            "t": 25.0,
            "bpm": 99.756
          },
          {
            "t": 30.0,
            "bpm": 97.119
          },
          {
            "t": 35.0,
            "bpm": 94.482
          },
          {
            "t": 40.0,
            "bpm": 100.195
          }
        ],
        "trained_peak_selector_current": [
          {
            "t": 0.0,
            "bpm": 136.67
          },
          {
            "t": 5.0,
            "bpm": 130.078
          },
          {
            "t": 10.0,
            "bpm": 130.078
          },
          {
            "t": 15.0,
            "bpm": 134.033
          },
          {
            "t": 20.0,
            "bpm": 132.275
          },
          {
            "t": 25.0,
            "bpm": 135.352
          },
          {
            "t": 30.0,
            "bpm": 137.109
          },
          {
            "t": 35.0,
            "bpm": 136.67
          },
          {
            "t": 40.0,
            "bpm": 132.715
          }
        ],
        "oracle_window_peak": [
          {
            "t": 0.0,
            "bpm": 134.912
          },
          {
            "t": 5.0,
            "bpm": 134.912
          },
          {
            "t": 10.0,
            "bpm": 134.912
          },
          {
            "t": 15.0,
            "bpm": 134.912
          },
          {
            "t": 20.0,
            "bpm": 134.912
          },
          {
            "t": 25.0,
            "bpm": 134.912
          },
          {
            "t": 30.0,
            "bpm": 134.912
          },
          {
            "t": 35.0,
            "bpm": 135.352
          },
          {
            "t": 40.0,
            "bpm": 134.912
          }
        ]
      }
    },
    {
      "video": "6.mp4",
      "durationSec": 68.909,
      "label": {
        "bpm_min": 90.0,
        "bpm_max": 90.0,
        "bpm_target": 90.0
      },
      "waveform": [
        {
          "t": 0.0,
          "r": 0.5455,
          "g": 0.3549,
          "b": 0.136,
          "pos": -0.006,
          "chrom": -0.001
        },
        {
          "t": 0.133,
          "r": 0.5774,
          "g": 0.661,
          "b": 0.5329,
          "pos": 1.5,
          "chrom": -0.9489
        },
        {
          "t": 0.2,
          "r": 0.5648,
          "g": 0.7995,
          "b": 0.7118,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 0.333,
          "r": 0.7714,
          "g": 1.0079,
          "b": 1.0175,
          "pos": -0.3946,
          "chrom": 0.269
        },
        {
          "t": 0.467,
          "r": 0.8458,
          "g": 1.0488,
          "b": 1.1203,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 0.533,
          "r": 0.4856,
          "g": 0.7984,
          "b": 0.9179,
          "pos": -1.5,
          "chrom": 0.8802
        },
        {
          "t": 0.667,
          "r": 0.2082,
          "g": 0.3913,
          "b": 0.4003,
          "pos": 1.5,
          "chrom": -1.2198
        },
        {
          "t": 0.8,
          "r": 0.7383,
          "g": 0.6793,
          "b": 0.488,
          "pos": 0.6161,
          "chrom": -0.1915
        },
        {
          "t": 0.867,
          "r": 0.6111,
          "g": 0.6643,
          "b": 0.5649,
          "pos": -0.8284,
          "chrom": 0.6178
        },
        {
          "t": 1.0,
          "r": -0.1178,
          "g": 0.4084,
          "b": 0.5083,
          "pos": -0.0639,
          "chrom": -0.2174
        },
        {
          "t": 1.133,
          "r": -0.0288,
          "g": 0.6111,
          "b": 0.7516,
          "pos": -0.2385,
          "chrom": -0.0732
        },
        {
          "t": 1.2,
          "r": 0.0069,
          "g": 0.4535,
          "b": 0.5625,
          "pos": -0.7684,
          "chrom": 0.8217
        },
        {
          "t": 1.333,
          "r": 0.0607,
          "g": 0.5329,
          "b": 0.6291,
          "pos": 0.4638,
          "chrom": -0.211
        },
        {
          "t": 1.467,
          "r": 0.0085,
          "g": 0.4266,
          "b": 0.5389,
          "pos": -0.0729,
          "chrom": -0.4946
        },
        {
          "t": 1.533,
          "r": -0.4228,
          "g": 0.056,
          "b": 0.2248,
          "pos": 0.247,
          "chrom": -0.3037
        },
        {
          "t": 1.667,
          "r": -0.9888,
          "g": -0.5167,
          "b": -0.2575,
          "pos": -0.4932,
          "chrom": 0.9426
        },
        {
          "t": 1.8,
          "r": -1.1264,
          "g": -0.5324,
          "b": -0.2058,
          "pos": -0.1595,
          "chrom": -0.1197
        },
        {
          "t": 1.867,
          "r": -1.1135,
          "g": -0.5024,
          "b": -0.2007,
          "pos": 1.1326,
          "chrom": -1.1406
        },
        {
          "t": 2.0,
          "r": -1.2094,
          "g": -0.5343,
          "b": -0.1571,
          "pos": 0.0478,
          "chrom": 0.0511
        },
        {
          "t": 2.133,
          "r": -1.2675,
          "g": -0.5318,
          "b": -0.1204,
          "pos": -0.651,
          "chrom": 0.697
        },
        {
          "t": 2.2,
          "r": -1.2513,
          "g": -0.4693,
          "b": -0.0393,
          "pos": -0.7056,
          "chrom": 0.7945
        },
        {
          "t": 2.333,
          "r": -1.1231,
          "g": -0.2815,
          "b": 0.1337,
          "pos": 0.2004,
          "chrom": -0.6206
        },
        {
          "t": 2.467,
          "r": -0.9768,
          "g": -0.1144,
          "b": 0.2631,
          "pos": 1.0966,
          "chrom": -1.5
        },
        {
          "t": 2.533,
          "r": -0.832,
          "g": -0.2236,
          "b": 0.0843,
          "pos": -0.1448,
          "chrom": 0.3923
        },
        {
          "t": 2.667,
          "r": 0.1501,
          "g": 0.2184,
          "b": 0.2159,
          "pos": -0.2692,
          "chrom": 1.5
        },
        {
          "t": 2.8,
          "r": 0.3768,
          "g": 0.8811,
          "b": 0.9882,
          "pos": -0.388,
          "chrom": -0.7525
        },
        {
          "t": 2.867,
          "r": 0.2637,
          "g": 0.9736,
          "b": 1.151,
          "pos": -0.6004,
          "chrom": -1.3265
        },
        {
          "t": 3.0,
          "r": 0.1545,
          "g": 0.7797,
          "b": 0.9047,
          "pos": 0.8526,
          "chrom": -0.3889
        },
        {
          "t": 3.133,
          "r": 0.1938,
          "g": 0.8922,
          "b": 1.0483,
          "pos": -0.3832,
          "chrom": 1.0943
        },
        {
          "t": 3.2,
          "r": 0.257,
          "g": 0.9472,
          "b": 1.0947,
          "pos": -0.4871,
          "chrom": 0.7255
        },
        {
          "t": 3.333,
          "r": 0.5113,
          "g": 1.1754,
          "b": 1.2713,
          "pos": 0.2069,
          "chrom": -0.4955
        },
        {
          "t": 3.467,
          "r": 0.4628,
          "g": 0.9826,
          "b": 1.0741,
          "pos": -0.0838,
          "chrom": -0.3464
        },
        {
          "t": 3.533,
          "r": 0.3076,
          "g": 0.8464,
          "b": 0.9568,
          "pos": 0.2149,
          "chrom": -0.1174
        },
        {
          "t": 3.667,
          "r": 0.2762,
          "g": 0.615,
          "b": 0.6811,
          "pos": 0.286,
          "chrom": 0.1786
        },
        {
          "t": 3.8,
          "r": 0.1887,
          "g": 0.4758,
          "b": 0.5513,
          "pos": -0.8006,
          "chrom": 0.4982
        },
        {
          "t": 3.867,
          "r": 0.1624,
          "g": 0.4184,
          "b": 0.4813,
          "pos": -1.3416,
          "chrom": 0.8807
        },
        {
          "t": 4.0,
          "r": 0.1573,
          "g": 0.3563,
          "b": 0.335,
          "pos": 1.0032,
          "chrom": -0.8269
        },
        {
          "t": 4.133,
          "r": 0.1742,
          "g": 0.3139,
          "b": 0.2811,
          "pos": 0.6621,
          "chrom": -0.5838
        },
        {
          "t": 4.2,
          "r": 0.3098,
          "g": 0.2949,
          "b": 0.2045,
          "pos": -0.2702,
          "chrom": 0.3171
        },
        {
          "t": 4.333,
          "r": 0.285,
          "g": 0.2315,
          "b": 0.1398,
          "pos": -0.4549,
          "chrom": 0.5283
        },
        {
          "t": 4.467,
          "r": 0.2914,
          "g": 0.2243,
          "b": 0.1319,
          "pos": -0.2723,
          "chrom": 0.0932
        },
        {
          "t": 4.533,
          "r": 0.2595,
          "g": 0.2011,
          "b": 0.1053,
          "pos": 0.2509,
          "chrom": -0.259
        },
        {
          "t": 4.667,
          "r": 0.1965,
          "g": 0.1282,
          "b": 0.0404,
          "pos": 0.0447,
          "chrom": -0.164
        },
        {
          "t": 4.8,
          "r": 0.236,
          "g": 0.109,
          "b": -0.0059,
          "pos": -0.1251,
          "chrom": 0.1141
        },
        {
          "t": 4.867,
          "r": 0.1738,
          "g": 0.0414,
          "b": -0.0778,
          "pos": 0.3867,
          "chrom": -0.0216
        },
        {
          "t": 5.0,
          "r": 0.088,
          "g": 0.0162,
          "b": -0.0587,
          "pos": -0.2518,
          "chrom": 0.2608
        },
        {
          "t": 5.133,
          "r": 0.1354,
          "g": 0.0745,
          "b": -0.0157,
          "pos": 0.2145,
          "chrom": -0.2841
        },
        {
          "t": 5.2,
          "r": 0.1601,
          "g": 0.0982,
          "b": 0.0093,
          "pos": 0.3853,
          "chrom": -0.3893
        },
        {
          "t": 5.333,
          "r": 0.1511,
          "g": 0.0872,
          "b": 0.013,
          "pos": -0.4135,
          "chrom": 0.2535
        },
        {
          "t": 5.467,
          "r": 0.1918,
          "g": 0.1091,
          "b": 0.0154,
          "pos": -0.0468,
          "chrom": 0.1669
        },
        {
          "t": 5.533,
          "r": 0.1942,
          "g": 0.1059,
          "b": 0.0148,
          "pos": -0.0015,
          "chrom": 0.1237
        },
        {
          "t": 5.667,
          "r": 0.2252,
          "g": 0.1584,
          "b": 0.0618,
          "pos": 0.1393,
          "chrom": -0.0922
        },
        {
          "t": 5.8,
          "r": 0.2023,
          "g": 0.1542,
          "b": 0.0704,
          "pos": 0.2601,
          "chrom": -0.2518
        },
        {
          "t": 5.867,
          "r": 0.2018,
          "g": 0.1617,
          "b": 0.0834,
          "pos": 0.1833,
          "chrom": -0.2691
        },
        {
          "t": 6.0,
          "r": 0.3596,
          "g": 0.2017,
          "b": 0.0845,
          "pos": -0.4028,
          "chrom": 0.3377
        },
        {
          "t": 6.133,
          "r": 0.4131,
          "g": 0.2515,
          "b": 0.1224,
          "pos": -0.1285,
          "chrom": 0.182
        },
        {
          "t": 6.2,
          "r": 0.4266,
          "g": 0.2526,
          "b": 0.1171,
          "pos": 0.1264,
          "chrom": 0.0041
        },
        {
          "t": 6.333,
          "r": 0.4575,
          "g": 0.3101,
          "b": 0.1806,
          "pos": 0.1097,
          "chrom": -0.1183
        },
        {
          "t": 6.467,
          "r": 0.4903,
          "g": 0.3647,
          "b": 0.2359,
          "pos": 0.1031,
          "chrom": -0.3128
        },
        {
          "t": 6.533,
          "r": 0.4968,
          "g": 0.3889,
          "b": 0.2725,
          "pos": -0.0503,
          "chrom": -0.0071
        },
        {
          "t": 6.667,
          "r": 0.5991,
          "g": 0.4317,
          "b": 0.2781,
          "pos": 0.0982,
          "chrom": 0.2629
        },
        {
          "t": 6.8,
          "r": 0.6201,
          "g": 0.5166,
          "b": 0.3819,
          "pos": -0.3221,
          "chrom": 0.1929
        },
        {
          "t": 6.867,
          "r": 0.5959,
          "g": 0.5328,
          "b": 0.415,
          "pos": -0.4124,
          "chrom": 0.1334
        },
        {
          "t": 7.0,
          "r": 0.593,
          "g": 0.5405,
          "b": 0.3931,
          "pos": 0.4128,
          "chrom": -0.4862
        },
        {
          "t": 7.133,
          "r": 0.5874,
          "g": 0.5626,
          "b": 0.4337,
          "pos": -0.2351,
          "chrom": 0.0641
        },
        {
          "t": 7.2,
          "r": 0.6013,
          "g": 0.4305,
          "b": 0.252,
          "pos": -0.1763,
          "chrom": 0.4492
        },
        {
          "t": 7.333,
          "r": 0.5753,
          "g": 0.461,
          "b": 0.3027,
          "pos": 0.0737,
          "chrom": 0.2163
        },
        {
          "t": 7.467,
          "r": 0.5537,
          "g": 0.4915,
          "b": 0.3521,
          "pos": 0.333,
          "chrom": -0.4047
        },
        {
          "t": 7.533,
          "r": 0.566,
          "g": 0.4959,
          "b": 0.3669,
          "pos": 0.102,
          "chrom": -0.2099
        },
        {
          "t": 7.667,
          "r": 0.6229,
          "g": 0.5091,
          "b": 0.3672,
          "pos": -0.2968,
          "chrom": -0.0927
        },
        {
          "t": 7.8,
          "r": 0.6356,
          "g": 0.411,
          "b": 0.2171,
          "pos": -0.1061,
          "chrom": 0.315
        },
        {
          "t": 7.867,
          "r": 0.6655,
          "g": 0.4266,
          "b": 0.2255,
          "pos": -0.5465,
          "chrom": 0.7669
        },
        {
          "t": 8.0,
          "r": 0.708,
          "g": 0.507,
          "b": 0.2723,
          "pos": 0.5388,
          "chrom": -0.3886
        },
        {
          "t": 8.133,
          "r": 0.7629,
          "g": 0.5596,
          "b": 0.3235,
          "pos": 0.2173,
          "chrom": -0.1044
        },
        {
          "t": 8.2,
          "r": 0.8225,
          "g": 0.6257,
          "b": 0.3913,
          "pos": -0.2351,
          "chrom": 0.0202
        },
        {
          "t": 8.333,
          "r": 0.9094,
          "g": 0.7427,
          "b": 0.5095,
          "pos": -0.0212,
          "chrom": -0.1768
        },
        {
          "t": 8.467,
          "r": 0.7817,
          "g": 0.6036,
          "b": 0.3957,
          "pos": -0.4298,
          "chrom": 0.6285
        },
        {
          "t": 8.533,
          "r": 0.7789,
          "g": 0.6167,
          "b": 0.4102,
          "pos": 0.0148,
          "chrom": 0.1399
        },
        {
          "t": 8.667,
          "r": 0.7836,
          "g": 0.654,
          "b": 0.4547,
          "pos": 0.1849,
          "chrom": -0.2397
        },
        {
          "t": 8.8,
          "r": 0.7447,
          "g": 0.63,
          "b": 0.452,
          "pos": -0.3414,
          "chrom": 0.116
        },
        {
          "t": 8.933,
          "r": 0.7159,
          "g": 0.6052,
          "b": 0.4171,
          "pos": 0.4016,
          "chrom": -0.0841
        },
        {
          "t": 9.0,
          "r": 0.6828,
          "g": 0.5902,
          "b": 0.4177,
          "pos": 0.4301,
          "chrom": -0.0943
        },
        {
          "t": 9.133,
          "r": 0.8348,
          "g": 0.743,
          "b": 0.5707,
          "pos": -0.2884,
          "chrom": 0.125
        },
        {
          "t": 9.267,
          "r": 0.8756,
          "g": 0.7796,
          "b": 0.6136,
          "pos": -0.4513,
          "chrom": 0.2875
        },
        {
          "t": 9.333,
          "r": 0.8743,
          "g": 0.7818,
          "b": 0.6095,
          "pos": 0.1059,
          "chrom": -0.1129
        },
        {
          "t": 9.467,
          "r": 0.8543,
          "g": 0.7327,
          "b": 0.5698,
          "pos": 0.1011,
          "chrom": -0.1975
        },
        {
          "t": 9.6,
          "r": 0.7279,
          "g": 0.5634,
          "b": 0.4039,
          "pos": 0.4355,
          "chrom": -0.1142
        },
        {
          "t": 9.667,
          "r": 0.7187,
          "g": 0.5486,
          "b": 0.3933,
          "pos": 0.6649,
          "chrom": -0.2246
        },
        {
          "t": 9.8,
          "r": 0.6727,
          "g": 0.4922,
          "b": 0.3649,
          "pos": -0.955,
          "chrom": 0.6463
        },
        {
          "t": 9.933,
          "r": 0.6019,
          "g": 0.413,
          "b": 0.2838,
          "pos": -0.4796,
          "chrom": 0.2708
        },
        {
          "t": 10.0,
          "r": 0.6137,
          "g": 0.4267,
          "b": 0.2618,
          "pos": 0.5658,
          "chrom": -0.5075
        },
        {
          "t": 10.133,
          "r": 0.4229,
          "g": 0.2387,
          "b": 0.1041,
          "pos": 0.5968,
          "chrom": -0.4883
        },
        {
          "t": 10.267,
          "r": 0.2118,
          "g": 0.0217,
          "b": -0.0885,
          "pos": 0.2887,
          "chrom": -0.0638
        },
        {
          "t": 10.333,
          "r": 0.1352,
          "g": -0.0581,
          "b": -0.1467,
          "pos": -0.4133,
          "chrom": 0.4115
        },
        {
          "t": 10.467,
          "r": -0.0073,
          "g": -0.1647,
          "b": -0.2118,
          "pos": -0.8659,
          "chrom": 0.7234
        },
        {
          "t": 10.6,
          "r": -0.0804,
          "g": -0.165,
          "b": -0.1985,
          "pos": 0.6154,
          "chrom": -0.5649
        },
        {
          "t": 10.667,
          "r": -0.0892,
          "g": -0.091,
          "b": -0.1,
          "pos": 0.5479,
          "chrom": -0.8605
        },
        {
          "t": 10.8,
          "r": -0.0317,
          "g": -0.0752,
          "b": -0.0935,
          "pos": 0.0241,
          "chrom": 0.1664
        },
        {
          "t": 10.933,
          "r": 0.0348,
          "g": 0.1209,
          "b": 0.1304,
          "pos": 0.0271,
          "chrom": 0.3059
        },
        {
          "t": 11.0,
          "r": 0.1188,
          "g": 0.2378,
          "b": 0.2602,
          "pos": -0.3465,
          "chrom": 0.3357
        },
        {
          "t": 11.133,
          "r": 0.2331,
          "g": 0.4003,
          "b": 0.4152,
          "pos": -0.2669,
          "chrom": 0.2789
        },
        {
          "t": 11.267,
          "r": 0.3383,
          "g": 0.5404,
          "b": 0.5427,
          "pos": 0.3385,
          "chrom": -1.1357
        },
        {
          "t": 11.333,
          "r": 0.3165,
          "g": 0.5064,
          "b": 0.5047,
          "pos": 0.1818,
          "chrom": -0.6253
        },
        {
          "t": 11.467,
          "r": 0.0573,
          "g": 0.0198,
          "b": -0.0272,
          "pos": 0.0569,
          "chrom": 0.8109
        },
        {
          "t": 11.6,
          "r": 0.06,
          "g": -0.0124,
          "b": -0.0759,
          "pos": 0.1314,
          "chrom": -0.1002
        },
        {
          "t": 11.667,
          "r": 0.034,
          "g": -0.0408,
          "b": -0.1092,
          "pos": 0.0977,
          "chrom": -0.2097
        },
        {
          "t": 11.8,
          "r": 0.01,
          "g": -0.0482,
          "b": -0.1151,
          "pos": -0.706,
          "chrom": 0.2668
        },
        {
          "t": 11.933,
          "r": 0.0427,
          "g": 0.0137,
          "b": -0.0618,
          "pos": -0.3745,
          "chrom": 0.1105
        },
        {
          "t": 12.0,
          "r": 0.0499,
          "g": 0.0397,
          "b": -0.0937,
          "pos": 1.1002,
          "chrom": -0.5859
        },
        {
          "t": 12.133,
          "r": 0.133,
          "g": 0.1483,
          "b": 0.0267,
          "pos": 0.3401,
          "chrom": 0.0084
        },
        {
          "t": 12.267,
          "r": 0.3301,
          "g": 0.3772,
          "b": 0.2607,
          "pos": -0.3584,
          "chrom": 0.0534
        },
        {
          "t": 12.333,
          "r": 0.3797,
          "g": 0.4491,
          "b": 0.3163,
          "pos": 0.2059,
          "chrom": -0.252
        },
        {
          "t": 12.467,
          "r": 0.446,
          "g": 0.4953,
          "b": 0.373,
          "pos": -0.7007,
          "chrom": 0.4646
        },
        {
          "t": 12.6,
          "r": 0.5911,
          "g": 0.5691,
          "b": 0.3972,
          "pos": 0.0651,
          "chrom": -0.0089
        },
        {
          "t": 12.667,
          "r": 0.5973,
          "g": 0.5717,
          "b": 0.3989,
          "pos": 0.1256,
          "chrom": 0.0427
        },
        {
          "t": 12.8,
          "r": 0.6052,
          "g": 0.5689,
          "b": 0.3913,
          "pos": 0.5777,
          "chrom": -0.397
        },
        {
          "t": 12.933,
          "r": 0.5967,
          "g": 0.5624,
          "b": 0.3943,
          "pos": 0.4815,
          "chrom": -0.382
        },
        {
          "t": 13.0,
          "r": 0.6299,
          "g": 0.5222,
          "b": 0.3797,
          "pos": -0.8058,
          "chrom": 0.6098
        },
        {
          "t": 13.133,
          "r": 0.6668,
          "g": 0.5669,
          "b": 0.4218,
          "pos": -0.506,
          "chrom": 0.2795
        },
        {
          "t": 13.267,
          "r": 0.7224,
          "g": 0.5826,
          "b": 0.4307,
          "pos": 0.2536,
          "chrom": -0.1713
        },
        {
          "t": 13.333,
          "r": 0.6874,
          "g": 0.5529,
          "b": 0.4117,
          "pos": 0.1413,
          "chrom": 0.0081
        },
        {
          "t": 13.467,
          "r": 0.6636,
          "g": 0.5374,
          "b": 0.4218,
          "pos": 0.3165,
          "chrom": -0.124
        },
        {
          "t": 13.6,
          "r": 0.6626,
          "g": 0.5551,
          "b": 0.4578,
          "pos": 0.0223,
          "chrom": -0.0594
        },
        {
          "t": 13.667,
          "r": 0.6728,
          "g": 0.569,
          "b": 0.4801,
          "pos": 0.1311,
          "chrom": -0.2583
        },
        {
          "t": 13.8,
          "r": 0.6366,
          "g": 0.4993,
          "b": 0.4145,
          "pos": -0.7128,
          "chrom": 0.484
        },
        {
          "t": 13.933,
          "r": 0.4143,
          "g": 0.3259,
          "b": 0.3187,
          "pos": -0.5632,
          "chrom": 0.4167
        },
        {
          "t": 14.0,
          "r": 0.2887,
          "g": 0.2917,
          "b": 0.254,
          "pos": 1.4341,
          "chrom": -1.0043
        },
        {
          "t": 14.133,
          "r": -0.0373,
          "g": 0.0386,
          "b": 0.1201,
          "pos": 0.378,
          "chrom": 0.0066
        },
        {
          "t": 14.267,
          "r": -0.2218,
          "g": 0.0112,
          "b": 0.1838,
          "pos": -0.9528,
          "chrom": 0.3174
        },
        {
          "t": 14.333,
          "r": -0.3206,
          "g": -0.0347,
          "b": 0.1758,
          "pos": -0.4584,
          "chrom": 0.0975
        },
        {
          "t": 14.467,
          "r": -0.1976,
          "g": -0.0739,
          "b": 0.0605,
          "pos": 0.1231,
          "chrom": 0.2853
        },
        {
          "t": 14.6,
          "r": -0.092,
          "g": 0.0148,
          "b": 0.1423,
          "pos": 0.2906,
          "chrom": -0.538
        },
        {
          "t": 14.667,
          "r": -0.0765,
          "g": -0.0134,
          "b": 0.0926,
          "pos": 0.221,
          "chrom": -0.4233
        },
        {
          "t": 14.8,
          "r": 0.0263,
          "g": -0.0298,
          "b": 0.0227,
          "pos": 0.3172,
          "chrom": -0.1821
        },
        {
          "t": 14.933,
          "r": 0.2469,
          "g": 0.1217,
          "b": 0.0898,
          "pos": -0.1681,
          "chrom": 0.332
        },
        {
          "t": 15.0,
          "r": 0.3193,
          "g": 0.1723,
          "b": 0.1557,
          "pos": -1.4444,
          "chrom": 1.3183
        },
        {
          "t": 15.133,
          "r": 0.8166,
          "g": 0.671,
          "b": 0.5039,
          "pos": -0.0264,
          "chrom": -0.0188
        },
        {
          "t": 15.267,
          "r": 0.8038,
          "g": 0.8025,
          "b": 0.6329,
          "pos": 1.0441,
          "chrom": -0.7248
        },
        {
          "t": 15.333,
          "r": 0.85,
          "g": 0.8749,
          "b": 0.6987,
          "pos": 0.3848,
          "chrom": -0.34
        },
        {
          "t": 15.467,
          "r": 1.0763,
          "g": 1.0443,
          "b": 0.8058,
          "pos": 0.1887,
          "chrom": -0.6645
        },
        {
          "t": 15.6,
          "r": 0.8619,
          "g": 0.6773,
          "b": 0.4421,
          "pos": -0.8496,
          "chrom": 0.9838
        },
        {
          "t": 15.667,
          "r": 0.8318,
          "g": 0.6287,
          "b": 0.3769,
          "pos": -0.8056,
          "chrom": 1.1644
        },
        {
          "t": 15.8,
          "r": 0.8036,
          "g": 0.5865,
          "b": 0.3284,
          "pos": 0.1714,
          "chrom": 0.0426
        },
        {
          "t": 15.933,
          "r": 0.8847,
          "g": 0.6922,
          "b": 0.4011,
          "pos": 0.8119,
          "chrom": -0.7296
        },
        {
          "t": 16.0,
          "r": 0.8541,
          "g": 0.7314,
          "b": 0.4838,
          "pos": 0.2633,
          "chrom": -0.6982
        },
        {
          "t": 16.133,
          "r": 0.9134,
          "g": 0.8302,
          "b": 0.5806,
          "pos": -0.4473,
          "chrom": 0.0717
        },
        {
          "t": 16.267,
          "r": 0.8779,
          "g": 0.7991,
          "b": 0.552,
          "pos": -0.2837,
          "chrom": 0.7438
        },
        {
          "t": 16.333,
          "r": 0.9538,
          "g": 0.9225,
          "b": 0.6744,
          "pos": -0.008,
          "chrom": 0.4566
        },
        {
          "t": 16.467,
          "r": 1.0826,
          "g": 1.1343,
          "b": 0.8944,
          "pos": 0.3506,
          "chrom": -0.1043
        },
        {
          "t": 16.6,
          "r": 1.071,
          "g": 1.2896,
          "b": 1.1172,
          "pos": -0.0013,
          "chrom": -0.5951
        },
        {
          "t": 16.667,
          "r": 1.0309,
          "g": 1.3338,
          "b": 1.1966,
          "pos": 0.1716,
          "chrom": -0.9669
        },
        {
          "t": 16.8,
          "r": 1.0234,
          "g": 1.15,
          "b": 0.9641,
          "pos": -0.3435,
          "chrom": 0.6388
        },
        {
          "t": 16.933,
          "r": 0.8671,
          "g": 1.0832,
          "b": 0.9457,
          "pos": -0.4845,
          "chrom": 0.9977
        },
        {
          "t": 17.0,
          "r": 0.8043,
          "g": 1.1272,
          "b": 1.0078,
          "pos": 0.3383,
          "chrom": -0.0505
        },
        {
          "t": 17.133,
          "r": 0.6922,
          "g": 1.1249,
          "b": 1.0589,
          "pos": 0.158,
          "chrom": -0.3425
        },
        {
          "t": 17.267,
          "r": 0.6828,
          "g": 1.1091,
          "b": 1.0448,
          "pos": 0.25,
          "chrom": -0.8776
        },
        {
          "t": 17.333,
          "r": 0.683,
          "g": 1.0681,
          "b": 0.9931,
          "pos": 0.3448,
          "chrom": -0.531
        },
        {
          "t": 17.467,
          "r": 0.7592,
          "g": 0.8482,
          "b": 0.6989,
          "pos": -0.472,
          "chrom": 0.9891
        },
        {
          "t": 17.6,
          "r": 0.8015,
          "g": 0.8139,
          "b": 0.6538,
          "pos": -0.2417,
          "chrom": 0.255
        },
        {
          "t": 17.667,
          "r": 0.8071,
          "g": 0.8015,
          "b": 0.6379,
          "pos": -0.0819,
          "chrom": 0.0696
        },
        {
          "t": 17.8,
          "r": 0.7914,
          "g": 0.7789,
          "b": 0.621,
          "pos": 0.4301,
          "chrom": -0.6419
        },
        {
          "t": 17.933,
          "r": 0.758,
          "g": 0.7243,
          "b": 0.5816,
          "pos": -0.0025,
          "chrom": -0.1528
        },
        {
          "t": 18.0,
          "r": 0.6853,
          "g": 0.5573,
          "b": 0.4018,
          "pos": -0.1903,
          "chrom": 0.4018
        },
        {
          "t": 18.133,
          "r": 0.7217,
          "g": 0.5924,
          "b": 0.436,
          "pos": 0.0008,
          "chrom": 0.175
        },
        {
          "t": 18.267,
          "r": 0.7119,
          "g": 0.5812,
          "b": 0.4338,
          "pos": -0.3261,
          "chrom": 0.2107
        },
        {
          "t": 18.333,
          "r": 0.684,
          "g": 0.5482,
          "b": 0.403,
          "pos": -0.2388,
          "chrom": 0.1471
        },
        {
          "t": 18.467,
          "r": 0.6407,
          "g": 0.5123,
          "b": 0.3633,
          "pos": 0.4635,
          "chrom": -0.5342
        },
        {
          "t": 18.6,
          "r": 0.5372,
          "g": 0.3666,
          "b": 0.2252,
          "pos": -0.0071,
          "chrom": 0.1091
        },
        {
          "t": 18.667,
          "r": 0.5153,
          "g": 0.3441,
          "b": 0.2107,
          "pos": -0.3001,
          "chrom": 0.382
        },
        {
          "t": 18.8,
          "r": 0.4823,
          "g": 0.3076,
          "b": 0.174,
          "pos": -0.0642,
          "chrom": 0.0947
        },
        {
          "t": 18.933,
          "r": 0.4323,
          "g": 0.261,
          "b": 0.1348,
          "pos": -0.1032,
          "chrom": 0.1048
        },
        {
          "t": 19.0,
          "r": 0.4007,
          "g": 0.2663,
          "b": 0.1607,
          "pos": -0.1413,
          "chrom": -0.0207
        },
        {
          "t": 19.133,
          "r": 0.3538,
          "g": 0.2221,
          "b": 0.118,
          "pos": 0.3487,
          "chrom": -0.328
        },
        {
          "t": 19.267,
          "r": 0.2498,
          "g": 0.1084,
          "b": 0.0232,
          "pos": 0.0357,
          "chrom": 0.119
        },
        {
          "t": 19.333,
          "r": 0.2581,
          "g": 0.1049,
          "b": 0.0224,
          "pos": -0.1608,
          "chrom": 0.1901
        },
        {
          "t": 19.467,
          "r": 0.2087,
          "g": 0.0637,
          "b": -0.0073,
          "pos": -0.1477,
          "chrom": 0.0831
        },
        {
          "t": 19.6,
          "r": 0.1399,
          "g": -0.0119,
          "b": -0.0644,
          "pos": -0.529,
          "chrom": 0.3626
        },
        {
          "t": 19.667,
          "r": 0.1047,
          "g": -0.0411,
          "b": -0.091,
          "pos": -0.2322,
          "chrom": 0.1494
        },
        {
          "t": 19.8,
          "r": 0.0765,
          "g": -0.082,
          "b": -0.1388,
          "pos": 1.0033,
          "chrom": -0.6921
        },
        {
          "t": 19.933,
          "r": 0.0628,
          "g": -0.1077,
          "b": -0.1481,
          "pos": 0.1384,
          "chrom": -0.1021
        },
        {
          "t": 20.0,
          "r": 0.0963,
          "g": -0.1186,
          "b": -0.1389,
          "pos": -0.8238,
          "chrom": 0.5877
        },
        {
          "t": 20.133,
          "r": 0.0651,
          "g": -0.1464,
          "b": -0.1723,
          "pos": -0.4663,
          "chrom": 0.3683
        },
        {
          "t": 20.267,
          "r": 0.0726,
          "g": -0.1304,
          "b": -0.1573,
          "pos": -0.0262,
          "chrom": -0.0053
        },
        {
          "t": 20.333,
          "r": 0.0672,
          "g": -0.1322,
          "b": -0.1634,
          "pos": 0.1194,
          "chrom": -0.093
        },
        {
          "t": 20.467,
          "r": 0.0923,
          "g": -0.1135,
          "b": -0.1547,
          "pos": 0.5034,
          "chrom": -0.3529
        },
        {
          "t": 20.6,
          "r": 0.0693,
          "g": -0.1292,
          "b": -0.1638,
          "pos": 0.3253,
          "chrom": -0.2063
        },
        {
          "t": 20.667,
          "r": 0.0496,
          "g": -0.1406,
          "b": -0.1685,
          "pos": 0.3569,
          "chrom": -0.2357
        },
        {
          "t": 20.8,
          "r": 0.0535,
          "g": -0.1317,
          "b": -0.1471,
          "pos": -1.0436,
          "chrom": 0.7233
        },
        {
          "t": 20.933,
          "r": 0.0081,
          "g": -0.1566,
          "b": -0.1667,
          "pos": -0.8475,
          "chrom": 0.6559
        },
        {
          "t": 21.0,
          "r": 0.0181,
          "g": -0.0824,
          "b": -0.1429,
          "pos": 0.7684,
          "chrom": -0.5299
        },
        {
          "t": 21.133,
          "r": 0.0553,
          "g": -0.0189,
          "b": -0.0875,
          "pos": 0.9685,
          "chrom": -0.7903
        },
        {
          "t": 21.267,
          "r": -0.0015,
          "g": -0.0261,
          "b": -0.0676,
          "pos": -0.2693,
          "chrom": 0.3174
        },
        {
          "t": 21.333,
          "r": -0.0111,
          "g": -0.0197,
          "b": -0.0546,
          "pos": -0.4014,
          "chrom": 0.5599
        },
        {
          "t": 21.467,
          "r": 0.124,
          "g": 0.1446,
          "b": 0.1035,
          "pos": -0.4586,
          "chrom": 0.1776
        },
        {
          "t": 21.6,
          "r": 0.2835,
          "g": 0.219,
          "b": 0.1193,
          "pos": 0.0781,
          "chrom": -0.2006
        },
        {
          "t": 21.667,
          "r": 0.2918,
          "g": 0.2116,
          "b": 0.1043,
          "pos": 0.5523,
          "chrom": -0.3754
        },
        {
          "t": 21.8,
          "r": 0.2606,
          "g": 0.1373,
          "b": 0.0204,
          "pos": -0.0629,
          "chrom": 0.1666
        },
        {
          "t": 21.933,
          "r": 0.2407,
          "g": 0.1009,
          "b": -0.0189,
          "pos": -0.2773,
          "chrom": 0.2674
        },
        {
          "t": 22.0,
          "r": 0.191,
          "g": 0.0907,
          "b": -0.0376,
          "pos": 0.3232,
          "chrom": -0.2696
        },
        {
          "t": 22.133,
          "r": 0.1697,
          "g": 0.0486,
          "b": -0.0727,
          "pos": -0.1699,
          "chrom": 0.0671
        },
        {
          "t": 22.267,
          "r": 0.1133,
          "g": -0.0106,
          "b": -0.1328,
          "pos": 0.0901,
          "chrom": -0.0288
        },
        {
          "t": 22.333,
          "r": 0.1061,
          "g": -0.0183,
          "b": -0.1355,
          "pos": 0.118,
          "chrom": -0.0459
        },
        {
          "t": 22.467,
          "r": 0.0382,
          "g": -0.0793,
          "b": -0.177,
          "pos": -0.0639,
          "chrom": 0.0589
        },
        {
          "t": 22.6,
          "r": -0.0079,
          "g": -0.1358,
          "b": -0.2136,
          "pos": 0.0987,
          "chrom": -0.1289
        },
        {
          "t": 22.667,
          "r": 0.0075,
          "g": -0.1232,
          "b": -0.1945,
          "pos": -0.2006,
          "chrom": 0.0321
        },
        {
          "t": 22.8,
          "r": -0.0737,
          "g": -0.2228,
          "b": -0.2713,
          "pos": -0.0795,
          "chrom": 0.1753
        },
        {
          "t": 22.933,
          "r": -0.1157,
          "g": -0.2519,
          "b": -0.2875,
          "pos": 0.4249,
          "chrom": -0.1424
        },
        {
          "t": 23.0,
          "r": -0.1763,
          "g": -0.248,
          "b": -0.2316,
          "pos": 0.0714,
          "chrom": -0.0601
        },
        {
          "t": 23.133,
          "r": -0.1242,
          "g": -0.202,
          "b": -0.1791,
          "pos": -0.3296,
          "chrom": 0.0635
        },
        {
          "t": 23.267,
          "r": -0.1867,
          "g": -0.2552,
          "b": -0.2199,
          "pos": 0.0141,
          "chrom": -0.0694
        },
        {
          "t": 23.333,
          "r": -0.2057,
          "g": -0.2687,
          "b": -0.2317,
          "pos": 0.1509,
          "chrom": -0.041
        },
        {
          "t": 23.467,
          "r": -0.2248,
          "g": -0.2901,
          "b": -0.2472,
          "pos": 0.0384,
          "chrom": 0.1373
        },
        {
          "t": 23.6,
          "r": -0.2197,
          "g": -0.2547,
          "b": -0.2011,
          "pos": -0.0201,
          "chrom": 0.0211
        },
        {
          "t": 23.667,
          "r": -0.2167,
          "g": -0.2302,
          "b": -0.169,
          "pos": 0.0028,
          "chrom": 0.0051
        },
        {
          "t": 23.8,
          "r": -0.2227,
          "g": -0.175,
          "b": -0.0901,
          "pos": -0.0529,
          "chrom": -0.1129
        },
        {
          "t": 23.933,
          "r": -0.2194,
          "g": -0.093,
          "b": 0.0264,
          "pos": -0.0589,
          "chrom": -0.1238
        },
        {
          "t": 24.0,
          "r": -0.2759,
          "g": -0.1556,
          "b": -0.0417,
          "pos": 0.0712,
          "chrom": 0.1119
        },
        {
          "t": 24.133,
          "r": -0.2956,
          "g": -0.0838,
          "b": 0.071,
          "pos": 0.0398,
          "chrom": 0.2083
        },
        {
          "t": 24.267,
          "r": -0.3506,
          "g": -0.0341,
          "b": 0.1661,
          "pos": -0.1339,
          "chrom": 0.2086
        },
        {
          "t": 24.333,
          "r": -0.3684,
          "g": 0.0139,
          "b": 0.2386,
          "pos": -0.1972,
          "chrom": 0.1359
        },
        {
          "t": 24.467,
          "r": -0.3928,
          "g": 0.1021,
          "b": 0.3601,
          "pos": 0.2899,
          "chrom": -0.882
        },
        {
          "t": 24.6,
          "r": -0.3551,
          "g": -0.0506,
          "b": 0.1468,
          "pos": 0.0145,
          "chrom": 0.4008
        },
        {
          "t": 24.667,
          "r": -0.3754,
          "g": -0.0394,
          "b": 0.1765,
          "pos": -0.4624,
          "chrom": 1.0225
        },
        {
          "t": 24.8,
          "r": -0.3892,
          "g": 0.0126,
          "b": 0.245,
          "pos": 0.0199,
          "chrom": 0.0253
        },
        {
          "t": 24.933,
          "r": -0.384,
          "g": 0.063,
          "b": 0.3029,
          "pos": 0.23,
          "chrom": -0.2603
        },
        {
          "t": 25.0,
          "r": -0.3802,
          "g": 0.0674,
          "b": 0.32,
          "pos": -0.1545,
          "chrom": -0.2866
        },
        {
          "t": 25.133,
          "r": -0.3445,
          "g": 0.0927,
          "b": 0.3284,
          "pos": 0.1657,
          "chrom": -0.3876
        },
        {
          "t": 25.267,
          "r": -0.3043,
          "g": -0.0715,
          "b": 0.0997,
          "pos": -0.1288,
          "chrom": 0.6904
        },
        {
          "t": 25.333,
          "r": -0.3007,
          "g": -0.0673,
          "b": 0.1039,
          "pos": -0.2415,
          "chrom": 0.5146
        },
        {
          "t": 25.467,
          "r": -0.2803,
          "g": -0.0317,
          "b": 0.1344,
          "pos": -0.0192,
          "chrom": -0.0113
        },
        {
          "t": 25.6,
          "r": -0.2654,
          "g": -0.0041,
          "b": 0.16,
          "pos": -0.0324,
          "chrom": -0.2648
        },
        {
          "t": 25.667,
          "r": -0.2688,
          "g": 0.0015,
          "b": 0.1588,
          "pos": 0.2028,
          "chrom": -0.534
        },
        {
          "t": 25.8,
          "r": -0.2597,
          "g": -0.1024,
          "b": 0.0146,
          "pos": 0.1001,
          "chrom": 0.146
        },
        {
          "t": 25.933,
          "r": -0.2489,
          "g": -0.0922,
          "b": 0.0215,
          "pos": -0.1459,
          "chrom": 0.292
        },
        {
          "t": 26.067,
          "r": -0.2015,
          "g": -0.0709,
          "b": 0.029,
          "pos": -0.1841,
          "chrom": 0.1574
        },
        {
          "t": 26.133,
          "r": -0.1803,
          "g": -0.0579,
          "b": 0.0308,
          "pos": -0.0778,
          "chrom": 0.0354
        },
        {
          "t": 26.267,
          "r": -0.1531,
          "g": -0.0315,
          "b": 0.0491,
          "pos": 0.1775,
          "chrom": -0.3967
        },
        {
          "t": 26.4,
          "r": -0.1712,
          "g": -0.1248,
          "b": -0.0668,
          "pos": 0.0425,
          "chrom": 0.1156
        },
        {
          "t": 26.467,
          "r": -0.1424,
          "g": -0.0968,
          "b": -0.0423,
          "pos": -0.0584,
          "chrom": 0.2883
        },
        {
          "t": 26.6,
          "r": -0.146,
          "g": -0.0962,
          "b": -0.0393,
          "pos": -0.077,
          "chrom": 0.0957
        },
        {
          "t": 26.733,
          "r": -0.0994,
          "g": -0.0479,
          "b": -0.0006,
          "pos": 0.0237,
          "chrom": -0.0694
        },
        {
          "t": 26.8,
          "r": -0.1282,
          "g": -0.0732,
          "b": -0.0229,
          "pos": 0.0373,
          "chrom": -0.1608
        },
        {
          "t": 26.933,
          "r": -0.1542,
          "g": -0.0972,
          "b": -0.0452,
          "pos": -0.1687,
          "chrom": 0.0685
        },
        {
          "t": 27.067,
          "r": -0.1885,
          "g": -0.1731,
          "b": -0.1382,
          "pos": 0.077,
          "chrom": 0.1052
        },
        {
          "t": 27.133,
          "r": -0.1818,
          "g": -0.1786,
          "b": -0.151,
          "pos": 0.2634,
          "chrom": -0.0965
        },
        {
          "t": 27.267,
          "r": -0.1986,
          "g": -0.2092,
          "b": -0.1873,
          "pos": 0.1032,
          "chrom": -0.0491
        },
        {
          "t": 27.4,
          "r": -0.1939,
          "g": -0.2126,
          "b": -0.1999,
          "pos": -0.1778,
          "chrom": 0.0038
        },
        {
          "t": 27.467,
          "r": -0.1827,
          "g": -0.2044,
          "b": -0.1936,
          "pos": -0.4026,
          "chrom": 0.1138
        },
        {
          "t": 27.6,
          "r": -0.2139,
          "g": -0.2617,
          "b": -0.2757,
          "pos": -0.1065,
          "chrom": 0.1839
        },
        {
          "t": 27.733,
          "r": -0.1973,
          "g": -0.2445,
          "b": -0.2736,
          "pos": 0.2804,
          "chrom": -0.0656
        },
        {
          "t": 27.8,
          "r": -0.1804,
          "g": -0.2243,
          "b": -0.2557,
          "pos": 0.3349,
          "chrom": -0.1542
        },
        {
          "t": 27.933,
          "r": -0.2145,
          "g": -0.2527,
          "b": -0.2742,
          "pos": 0.1846,
          "chrom": -0.1989
        },
        {
          "t": 28.067,
          "r": -0.3472,
          "g": -0.3679,
          "b": -0.3431,
          "pos": -0.594,
          "chrom": 0.1916
        },
        {
          "t": 28.133,
          "r": -0.3814,
          "g": -0.4249,
          "b": -0.403,
          "pos": -0.4714,
          "chrom": 0.3074
        },
        {
          "t": 28.267,
          "r": -0.6049,
          "g": -0.6652,
          "b": -0.6347,
          "pos": 0.404,
          "chrom": -0.0833
        },
        {
          "t": 28.4,
          "r": -0.7002,
          "g": -0.7617,
          "b": -0.7236,
          "pos": 0.1602,
          "chrom": -0.1535
        },
        {
          "t": 28.467,
          "r": -0.7661,
          "g": -0.8202,
          "b": -0.7735,
          "pos": -0.4,
          "chrom": 0.2333
        },
        {
          "t": 28.6,
          "r": -0.852,
          "g": -0.9025,
          "b": -0.8513,
          "pos": -0.2124,
          "chrom": 0.1856
        },
        {
          "t": 28.733,
          "r": -0.8353,
          "g": -0.8684,
          "b": -0.8233,
          "pos": 0.2366,
          "chrom": -0.1975
        },
        {
          "t": 28.8,
          "r": -0.8332,
          "g": -0.8667,
          "b": -0.8148,
          "pos": 0.3627,
          "chrom": -0.3254
        },
        {
          "t": 28.933,
          "r": -0.7954,
          "g": -0.8359,
          "b": -0.783,
          "pos": 0.3218,
          "chrom": -0.1686
        },
        {
          "t": 29.067,
          "r": -0.7225,
          "g": -0.8024,
          "b": -0.7238,
          "pos": -0.9522,
          "chrom": 0.7714
        },
        {
          "t": 29.133,
          "r": -0.6628,
          "g": -0.7433,
          "b": -0.6617,
          "pos": -0.5571,
          "chrom": 0.3469
        },
        {
          "t": 29.267,
          "r": -0.5869,
          "g": -0.6649,
          "b": -0.5962,
          "pos": 0.4171,
          "chrom": -0.5087
        },
        {
          "t": 29.4,
          "r": -0.7285,
          "g": -0.7878,
          "b": -0.6931,
          "pos": 0.4367,
          "chrom": -0.03
        },
        {
          "t": 29.467,
          "r": -0.6804,
          "g": -0.7281,
          "b": -0.6376,
          "pos": 0.1603,
          "chrom": 0.1842
        },
        {
          "t": 29.6,
          "r": -0.5808,
          "g": -0.5889,
          "b": -0.5003,
          "pos": -0.7149,
          "chrom": 0.5012
        },
        {
          "t": 29.733,
          "r": -0.474,
          "g": -0.4094,
          "b": -0.3505,
          "pos": 0.4726,
          "chrom": -0.5392
        },
        {
          "t": 29.8,
          "r": -0.4862,
          "g": -0.3226,
          "b": -0.2464,
          "pos": 0.3145,
          "chrom": -0.7958
        },
        {
          "t": 29.933,
          "r": -0.5849,
          "g": -0.2778,
          "b": -0.1531,
          "pos": 0.0255,
          "chrom": 0.1266
        },
        {
          "t": 30.067,
          "r": -0.9426,
          "g": -0.3642,
          "b": -0.1339,
          "pos": -0.3153,
          "chrom": 1.055
        },
        {
          "t": 30.133,
          "r": -1.0089,
          "g": -0.105,
          "b": 0.218,
          "pos": -0.6688,
          "chrom": 0.7143
        },
        {
          "t": 30.267,
          "r": -1.3731,
          "g": 0.1128,
          "b": 0.6221,
          "pos": 0.7741,
          "chrom": -1.082
        },
        {
          "t": 30.4,
          "r": -1.5,
          "g": 0.3393,
          "b": 1.0126,
          "pos": -0.4084,
          "chrom": -0.1369
        },
        {
          "t": 30.467,
          "r": -1.5,
          "g": 0.338,
          "b": 1.0103,
          "pos": -0.6171,
          "chrom": 0.615
        },
        {
          "t": 30.6,
          "r": -1.5,
          "g": 0.4404,
          "b": 1.1863,
          "pos": 0.4097,
          "chrom": 0.052
        },
        {
          "t": 30.733,
          "r": -1.5,
          "g": 0.2134,
          "b": 0.938,
          "pos": -0.3596,
          "chrom": 0.8109
        },
        {
          "t": 30.8,
          "r": -1.5,
          "g": 0.2074,
          "b": 0.9287,
          "pos": 0.103,
          "chrom": 0.0282
        },
        {
          "t": 30.933,
          "r": -1.5,
          "g": 0.0439,
          "b": 0.6869,
          "pos": 0.5385,
          "chrom": -1.4511
        },
        {
          "t": 31.067,
          "r": -1.3689,
          "g": -0.443,
          "b": 0.024,
          "pos": -1.5,
          "chrom": 1.3601
        },
        {
          "t": 31.133,
          "r": -1.1382,
          "g": -0.5326,
          "b": -0.2104,
          "pos": -0.4925,
          "chrom": 0.6933
        },
        {
          "t": 31.267,
          "r": -0.4932,
          "g": -0.3685,
          "b": -0.285,
          "pos": 1.1336,
          "chrom": -0.105
        },
        {
          "t": 31.4,
          "r": 0.0839,
          "g": 0.0437,
          "b": 0.0462,
          "pos": -0.3971,
          "chrom": 0.3793
        },
        {
          "t": 31.467,
          "r": 0.2168,
          "g": 0.33,
          "b": 0.3745,
          "pos": -0.3553,
          "chrom": -0.2959
        },
        {
          "t": 31.6,
          "r": 0.3514,
          "g": 0.5594,
          "b": 0.6156,
          "pos": 0.6226,
          "chrom": -0.7029
        },
        {
          "t": 31.733,
          "r": 0.5402,
          "g": 0.9623,
          "b": 1.0676,
          "pos": -0.0542,
          "chrom": -0.2711
        },
        {
          "t": 31.8,
          "r": 0.625,
          "g": 0.9231,
          "b": 0.994,
          "pos": -1.5,
          "chrom": 1.3044
        },
        {
          "t": 31.933,
          "r": 0.6896,
          "g": 1.0908,
          "b": 1.1315,
          "pos": -0.2809,
          "chrom": 0.6251
        },
        {
          "t": 32.067,
          "r": 0.5271,
          "g": 1.0314,
          "b": 1.0519,
          "pos": 1.5,
          "chrom": -0.9548
        },
        {
          "t": 32.133,
          "r": 0.5158,
          "g": 1.0904,
          "b": 1.1333,
          "pos": 0.4342,
          "chrom": -0.2205
        },
        {
          "t": 32.267,
          "r": 0.5406,
          "g": 1.2094,
          "b": 1.2818,
          "pos": -0.24,
          "chrom": -0.875
        },
        {
          "t": 32.4,
          "r": 0.5018,
          "g": 0.9182,
          "b": 0.9164,
          "pos": -0.5954,
          "chrom": 0.8948
        },
        {
          "t": 32.467,
          "r": 0.4974,
          "g": 0.9261,
          "b": 0.9308,
          "pos": -0.8266,
          "chrom": 1.4546
        },
        {
          "t": 32.6,
          "r": 0.486,
          "g": 0.9759,
          "b": 0.993,
          "pos": 0.0773,
          "chrom": 0.0006
        },
        {
          "t": 32.733,
          "r": 0.46,
          "g": 0.967,
          "b": 0.994,
          "pos": 0.332,
          "chrom": -0.3401
        },
        {
          "t": 32.8,
          "r": 0.4478,
          "g": 0.9567,
          "b": 0.9856,
          "pos": 0.7889,
          "chrom": -1.0282
        },
        {
          "t": 32.933,
          "r": 0.4162,
          "g": 0.8639,
          "b": 0.8961,
          "pos": 0.1053,
          "chrom": -0.3546
        },
        {
          "t": 33.067,
          "r": 0.336,
          "g": 0.5678,
          "b": 0.5801,
          "pos": -0.9923,
          "chrom": 1.3747
        },
        {
          "t": 33.133,
          "r": 0.2866,
          "g": 0.5248,
          "b": 0.5427,
          "pos": -0.3097,
          "chrom": 0.6107
        },
        {
          "t": 33.267,
          "r": 0.2528,
          "g": 0.5011,
          "b": 0.5363,
          "pos": 0.2428,
          "chrom": -0.2474
        },
        {
          "t": 33.4,
          "r": 0.1945,
          "g": 0.4512,
          "b": 0.4959,
          "pos": 0.3039,
          "chrom": -0.5377
        },
        {
          "t": 33.467,
          "r": 0.1559,
          "g": 0.4253,
          "b": 0.4823,
          "pos": 0.2684,
          "chrom": -0.5734
        },
        {
          "t": 33.6,
          "r": 0.1558,
          "g": 0.2774,
          "b": 0.2938,
          "pos": -0.3348,
          "chrom": 0.511
        },
        {
          "t": 33.733,
          "r": 0.1137,
          "g": 0.253,
          "b": 0.283,
          "pos": -0.5042,
          "chrom": 0.5147
        },
        {
          "t": 33.8,
          "r": 0.1075,
          "g": 0.2522,
          "b": 0.2789,
          "pos": 0.2564,
          "chrom": -0.1867
        },
        {
          "t": 33.933,
          "r": 0.0483,
          "g": 0.1937,
          "b": 0.227,
          "pos": 0.5902,
          "chrom": -0.4445
        },
        {
          "t": 34.067,
          "r": 0.0006,
          "g": 0.1335,
          "b": 0.2027,
          "pos": -0.5212,
          "chrom": 0.179
        },
        {
          "t": 34.133,
          "r": -0.0038,
          "g": 0.1095,
          "b": 0.1717,
          "pos": -0.1547,
          "chrom": 0.0499
        },
        {
          "t": 34.267,
          "r": -0.0095,
          "g": 0.0434,
          "b": 0.0833,
          "pos": 0.0814,
          "chrom": 0.0831
        },
        {
          "t": 34.4,
          "r": -0.0451,
          "g": 0.0005,
          "b": 0.0392,
          "pos": -0.642,
          "chrom": 0.4716
        },
        {
          "t": 34.467,
          "r": -0.0445,
          "g": 0.0012,
          "b": 0.0319,
          "pos": -0.2201,
          "chrom": 0.182
        },
        {
          "t": 34.6,
          "r": -0.054,
          "g": -0.0012,
          "b": -0.0039,
          "pos": 0.7719,
          "chrom": -0.5598
        },
        {
          "t": 34.733,
          "r": -0.0574,
          "g": -0.0157,
          "b": -0.0182,
          "pos": -0.0444,
          "chrom": -0.0354
        },
        {
          "t": 34.8,
          "r": -0.0397,
          "g": -0.019,
          "b": -0.0306,
          "pos": -0.3203,
          "chrom": 0.1802
        },
        {
          "t": 34.933,
          "r": -0.0296,
          "g": -0.0464,
          "b": -0.0671,
          "pos": -0.3181,
          "chrom": 0.2823
        },
        {
          "t": 35.067,
          "r": -0.0191,
          "g": -0.0408,
          "b": -0.0684,
          "pos": 0.0751,
          "chrom": -0.0014
        },
        {
          "t": 35.133,
          "r": -0.0123,
          "g": -0.0301,
          "b": -0.0589,
          "pos": 0.1968,
          "chrom": -0.1359
        },
        {
          "t": 35.267,
          "r": -0.0082,
          "g": -0.0243,
          "b": -0.0541,
          "pos": 0.1631,
          "chrom": -0.1119
        },
        {
          "t": 35.4,
          "r": 0.0024,
          "g": -0.0259,
          "b": -0.0571,
          "pos": -0.4833,
          "chrom": 0.3708
        },
        {
          "t": 35.467,
          "r": 0.0578,
          "g": 0.0197,
          "b": -0.0278,
          "pos": -0.0224,
          "chrom": -0.0442
        },
        {
          "t": 35.6,
          "r": 0.148,
          "g": 0.0643,
          "b": -0.0357,
          "pos": 0.408,
          "chrom": -0.3227
        },
        {
          "t": 35.733,
          "r": 0.1039,
          "g": 0.0129,
          "b": -0.0844,
          "pos": -0.3273,
          "chrom": 0.3259
        },
        {
          "t": 35.8,
          "r": 0.0903,
          "g": 0.0103,
          "b": -0.0925,
          "pos": -0.3444,
          "chrom": 0.2533
        },
        {
          "t": 35.933,
          "r": 0.1462,
          "g": 0.0653,
          "b": -0.0558,
          "pos": -0.1203,
          "chrom": 0.08
        },
        {
          "t": 36.067,
          "r": 0.2925,
          "g": 0.1641,
          "b": -0.0136,
          "pos": 0.5388,
          "chrom": -0.2614
        },
        {
          "t": 36.133,
          "r": 0.345,
          "g": 0.2233,
          "b": 0.0518,
          "pos": 0.1287,
          "chrom": -0.0824
        },
        {
          "t": 36.267,
          "r": 0.4658,
          "g": 0.3535,
          "b": 0.1729,
          "pos": -0.04,
          "chrom": -0.13
        },
        {
          "t": 36.4,
          "r": 0.4836,
          "g": 0.3535,
          "b": 0.1864,
          "pos": -0.3724,
          "chrom": 0.3618
        },
        {
          "t": 36.467,
          "r": 0.5074,
          "g": 0.3787,
          "b": 0.2073,
          "pos": -0.2366,
          "chrom": 0.3198
        },
        {
          "t": 36.6,
          "r": 0.6453,
          "g": 0.5063,
          "b": 0.3084,
          "pos": 0.3781,
          "chrom": -0.2949
        },
        {
          "t": 36.733,
          "r": 0.6364,
          "g": 0.4967,
          "b": 0.298,
          "pos": 0.1047,
          "chrom": -0.038
        },
        {
          "t": 36.8,
          "r": 0.658,
          "g": 0.5212,
          "b": 0.3182,
          "pos": -0.3932,
          "chrom": 0.2729
        },
        {
          "t": 36.933,
          "r": 0.7448,
          "g": 0.6003,
          "b": 0.3802,
          "pos": -0.4457,
          "chrom": 0.2027
        },
        {
          "t": 37.067,
          "r": 0.815,
          "g": 0.6636,
          "b": 0.3965,
          "pos": 0.7723,
          "chrom": -0.4649
        },
        {
          "t": 37.133,
          "r": 0.8778,
          "g": 0.7236,
          "b": 0.4553,
          "pos": 0.3756,
          "chrom": -0.1769
        },
        {
          "t": 37.267,
          "r": 1.0669,
          "g": 0.9085,
          "b": 0.6299,
          "pos": -0.1004,
          "chrom": 0.1618
        },
        {
          "t": 37.4,
          "r": 1.2009,
          "g": 1.0856,
          "b": 0.8201,
          "pos": -0.2984,
          "chrom": 0.1865
        },
        {
          "t": 37.467,
          "r": 1.2383,
          "g": 1.1452,
          "b": 0.8933,
          "pos": -0.3321,
          "chrom": 0.233
        },
        {
          "t": 37.6,
          "r": 1.3073,
          "g": 1.2715,
          "b": 1.0305,
          "pos": 0.1463,
          "chrom": -0.2488
        },
        {
          "t": 37.733,
          "r": 1.3254,
          "g": 1.3666,
          "b": 1.1644,
          "pos": 0.0677,
          "chrom": -0.2908
        },
        {
          "t": 37.8,
          "r": 1.3132,
          "g": 1.2983,
          "b": 1.073,
          "pos": -0.0008,
          "chrom": 0.2025
        },
        {
          "t": 37.933,
          "r": 1.066,
          "g": 1.1857,
          "b": 1.0539,
          "pos": 0.0205,
          "chrom": 0.3605
        },
        {
          "t": 38.067,
          "r": 0.7047,
          "g": 1.0415,
          "b": 1.0283,
          "pos": 0.1054,
          "chrom": -0.0214
        },
        {
          "t": 38.133,
          "r": 0.588,
          "g": 1.0149,
          "b": 1.0564,
          "pos": -0.2038,
          "chrom": -0.0951
        },
        {
          "t": 38.267,
          "r": 0.3491,
          "g": 0.8597,
          "b": 0.9667,
          "pos": 0.0126,
          "chrom": -0.6368
        },
        {
          "t": 38.4,
          "r": 0.087,
          "g": 0.3577,
          "b": 0.4417,
          "pos": -0.1908,
          "chrom": 0.892
        },
        {
          "t": 38.467,
          "r": -0.0661,
          "g": 0.2752,
          "b": 0.4,
          "pos": -0.1107,
          "chrom": 0.6985
        },
        {
          "t": 38.6,
          "r": -0.3075,
          "g": 0.0855,
          "b": 0.2648,
          "pos": 0.4144,
          "chrom": -0.6474
        },
        {
          "t": 38.733,
          "r": -0.4954,
          "g": -0.1492,
          "b": 0.05,
          "pos": 0.0414,
          "chrom": -0.0378
        },
        {
          "t": 38.8,
          "r": -0.6024,
          "g": -0.2731,
          "b": -0.0567,
          "pos": -0.4775,
          "chrom": 0.2706
        },
        {
          "t": 38.933,
          "r": -0.6935,
          "g": -0.3384,
          "b": -0.1016,
          "pos": -0.4566,
          "chrom": 0.3533
        },
        {
          "t": 39.067,
          "r": -0.7218,
          "g": -0.4104,
          "b": -0.2033,
          "pos": 0.5567,
          "chrom": -0.0127
        },
        {
          "t": 39.133,
          "r": -0.7399,
          "g": -0.3919,
          "b": -0.1729,
          "pos": 0.4679,
          "chrom": -0.2613
        },
        {
          "t": 39.267,
          "r": -0.7292,
          "g": -0.361,
          "b": -0.1366,
          "pos": 0.1877,
          "chrom": -0.3614
        },
        {
          "t": 39.4,
          "r": -0.6116,
          "g": -0.3265,
          "b": -0.151,
          "pos": -0.3058,
          "chrom": -0.0576
        },
        {
          "t": 39.467,
          "r": -0.5046,
          "g": -0.2642,
          "b": -0.1203,
          "pos": -0.6685,
          "chrom": 0.2341
        },
        {
          "t": 39.6,
          "r": -0.3224,
          "g": -0.2609,
          "b": -0.2333,
          "pos": -0.2301,
          "chrom": 0.6849
        },
        {
          "t": 39.733,
          "r": -0.0116,
          "g": 0.0936,
          "b": 0.0592,
          "pos": 0.4394,
          "chrom": -0.1508
        },
        {
          "t": 39.8,
          "r": 0.1808,
          "g": 0.304,
          "b": 0.2343,
          "pos": 0.6112,
          "chrom": -0.5258
        },
        {
          "t": 39.933,
          "r": 0.506,
          "g": 0.6374,
          "b": 0.5241,
          "pos": 0.0692,
          "chrom": -0.2111
        },
        {
          "t": 40.067,
          "r": 0.6209,
          "g": 0.8223,
          "b": 0.722,
          "pos": -0.3571,
          "chrom": -0.2366
        },
        {
          "t": 40.133,
          "r": 0.6464,
          "g": 0.859,
          "b": 0.754,
          "pos": -0.2235,
          "chrom": -0.0057
        },
        {
          "t": 40.267,
          "r": 0.6647,
          "g": 0.7695,
          "b": 0.629,
          "pos": -0.2364,
          "chrom": 0.7799
        },
        {
          "t": 40.4,
          "r": 0.6215,
          "g": 0.802,
          "b": 0.688,
          "pos": 0.1442,
          "chrom": -0.0882
        },
        {
          "t": 40.467,
          "r": 0.5974,
          "g": 0.8058,
          "b": 0.7057,
          "pos": 0.1927,
          "chrom": -0.2383
        },
        {
          "t": 40.6,
          "r": 0.5534,
          "g": 0.791,
          "b": 0.7062,
          "pos": 0.351,
          "chrom": -0.5586
        },
        {
          "t": 40.733,
          "r": 0.5538,
          "g": 0.7916,
          "b": 0.7164,
          "pos": 0.0598,
          "chrom": -0.2316
        },
        {
          "t": 40.8,
          "r": 0.5434,
          "g": 0.6536,
          "b": 0.5486,
          "pos": -0.5021,
          "chrom": 0.6831
        },
        {
          "t": 40.933,
          "r": 0.4981,
          "g": 0.6366,
          "b": 0.5467,
          "pos": -0.4727,
          "chrom": 0.639
        },
        {
          "t": 41.067,
          "r": 0.4808,
          "g": 0.658,
          "b": 0.5608,
          "pos": 0.389,
          "chrom": -0.315
        },
        {
          "t": 41.133,
          "r": 0.4882,
          "g": 0.6846,
          "b": 0.5863,
          "pos": 0.3136,
          "chrom": -0.3714
        },
        {
          "t": 41.267,
          "r": 0.5129,
          "g": 0.7275,
          "b": 0.6291,
          "pos": 0.3288,
          "chrom": -0.7755
        },
        {
          "t": 41.4,
          "r": 0.4997,
          "g": 0.556,
          "b": 0.4163,
          "pos": -0.2904,
          "chrom": 0.7097
        },
        {
          "t": 41.467,
          "r": 0.5426,
          "g": 0.6104,
          "b": 0.4687,
          "pos": -0.529,
          "chrom": 1.0506
        },
        {
          "t": 41.6,
          "r": 0.5796,
          "g": 0.7293,
          "b": 0.6051,
          "pos": -0.0629,
          "chrom": 0.0195
        },
        {
          "t": 41.733,
          "r": 0.4593,
          "g": 0.73,
          "b": 0.6607,
          "pos": 0.1197,
          "chrom": -0.3492
        },
        {
          "t": 41.8,
          "r": 0.3018,
          "g": 0.6367,
          "b": 0.6093,
          "pos": 0.2436,
          "chrom": -0.5932
        },
        {
          "t": 41.933,
          "r": 0.1099,
          "g": 0.4678,
          "b": 0.4798,
          "pos": 0.1424,
          "chrom": -0.1439
        },
        {
          "t": 42.067,
          "r": -0.0176,
          "g": 0.2526,
          "b": 0.2667,
          "pos": -0.174,
          "chrom": 0.5777
        },
        {
          "t": 42.133,
          "r": -0.079,
          "g": 0.2008,
          "b": 0.2336,
          "pos": -0.1369,
          "chrom": 0.3057
        },
        {
          "t": 42.267,
          "r": -0.2126,
          "g": 0.0815,
          "b": 0.1406,
          "pos": -0.2038,
          "chrom": 0.2713
        },
        {
          "t": 42.4,
          "r": -0.2608,
          "g": 0.0747,
          "b": 0.1497,
          "pos": 0.1205,
          "chrom": -0.5004
        },
        {
          "t": 42.467,
          "r": -0.2759,
          "g": 0.0786,
          "b": 0.1612,
          "pos": 0.2887,
          "chrom": -0.8218
        },
        {
          "t": 42.6,
          "r": -0.2697,
          "g": -0.1025,
          "b": -0.0767,
          "pos": -0.0568,
          "chrom": 0.3544
        },
        {
          "t": 42.733,
          "r": -0.2778,
          "g": -0.076,
          "b": -0.0409,
          "pos": 0.0041,
          "chrom": 0.295
        },
        {
          "t": 42.8,
          "r": -0.3016,
          "g": -0.0866,
          "b": -0.0455,
          "pos": 0.1115,
          "chrom": 0.0738
        },
        {
          "t": 42.933,
          "r": -0.2572,
          "g": -0.0158,
          "b": 0.0346,
          "pos": -0.2237,
          "chrom": 0.115
        },
        {
          "t": 43.067,
          "r": -0.2407,
          "g": 0.0353,
          "b": 0.0917,
          "pos": -0.0439,
          "chrom": -0.5387
        },
        {
          "t": 43.2,
          "r": -0.2546,
          "g": -0.156,
          "b": -0.16,
          "pos": 0.2408,
          "chrom": 0.1719
        },
        {
          "t": 43.267,
          "r": -0.2495,
          "g": -0.1588,
          "b": -0.1625,
          "pos": -0.0083,
          "chrom": 0.4733
        },
        {
          "t": 43.4,
          "r": -0.2355,
          "g": -0.1684,
          "b": -0.1721,
          "pos": -0.0104,
          "chrom": -0.0618
        },
        {
          "t": 43.533,
          "r": -0.3383,
          "g": -0.2817,
          "b": -0.2543,
          "pos": -0.1909,
          "chrom": 0.15
        },
        {
          "t": 43.6,
          "r": -0.3565,
          "g": -0.3071,
          "b": -0.2707,
          "pos": -0.1814,
          "chrom": 0.0692
        },
        {
          "t": 43.733,
          "r": -0.3723,
          "g": -0.3407,
          "b": -0.2903,
          "pos": 0.2204,
          "chrom": -0.2206
        },
        {
          "t": 43.867,
          "r": -0.4372,
          "g": -0.4482,
          "b": -0.3811,
          "pos": 0.3101,
          "chrom": -0.1048
        },
        {
          "t": 43.933,
          "r": -0.4268,
          "g": -0.4461,
          "b": -0.3729,
          "pos": -0.0131,
          "chrom": 0.0014
        },
        {
          "t": 44.067,
          "r": -0.4416,
          "g": -0.4927,
          "b": -0.404,
          "pos": -0.5731,
          "chrom": 0.3878
        },
        {
          "t": 44.2,
          "r": -0.4691,
          "g": -0.5296,
          "b": -0.4435,
          "pos": 0.1566,
          "chrom": -0.0672
        },
        {
          "t": 44.267,
          "r": -0.4755,
          "g": -0.5359,
          "b": -0.4564,
          "pos": 0.2733,
          "chrom": -0.1405
        },
        {
          "t": 44.4,
          "r": -0.4583,
          "g": -0.5287,
          "b": -0.4457,
          "pos": 0.0464,
          "chrom": -0.0073
        },
        {
          "t": 44.533,
          "r": -0.4164,
          "g": -0.4918,
          "b": -0.4148,
          "pos": 0.1096,
          "chrom": -0.1593
        },
        {
          "t": 44.6,
          "r": -0.4247,
          "g": -0.5008,
          "b": -0.4209,
          "pos": 0.2308,
          "chrom": -0.2229
        },
        {
          "t": 44.733,
          "r": -0.4284,
          "g": -0.515,
          "b": -0.4364,
          "pos": -0.0226,
          "chrom": 0.0437
        },
        {
          "t": 44.867,
          "r": -0.4222,
          "g": -0.5134,
          "b": -0.4294,
          "pos": -0.8576,
          "chrom": 0.623
        },
        {
          "t": 44.933,
          "r": -0.4081,
          "g": -0.4908,
          "b": -0.4214,
          "pos": -0.4477,
          "chrom": 0.3652
        },
        {
          "t": 45.067,
          "r": -0.423,
          "g": -0.4894,
          "b": -0.4469,
          "pos": 0.6579,
          "chrom": -0.3353
        },
        {
          "t": 45.2,
          "r": -0.3915,
          "g": -0.4401,
          "b": -0.4064,
          "pos": 0.3358,
          "chrom": -0.3708
        },
        {
          "t": 45.267,
          "r": -0.3804,
          "g": -0.4167,
          "b": -0.372,
          "pos": -0.0724,
          "chrom": -0.1566
        },
        {
          "t": 45.4,
          "r": -0.4362,
          "g": -0.4822,
          "b": -0.4271,
          "pos": -0.2525,
          "chrom": 0.1304
        },
        {
          "t": 45.533,
          "r": -0.4675,
          "g": -0.5254,
          "b": -0.4639,
          "pos": -0.2475,
          "chrom": 0.3898
        },
        {
          "t": 45.6,
          "r": -0.4753,
          "g": -0.5328,
          "b": -0.4629,
          "pos": -0.2642,
          "chrom": 0.4669
        },
        {
          "t": 45.733,
          "r": -0.4179,
          "g": -0.4148,
          "b": -0.343,
          "pos": 0.3829,
          "chrom": -0.2723
        },
        {
          "t": 45.867,
          "r": -0.3113,
          "g": -0.2769,
          "b": -0.2001,
          "pos": 0.1059,
          "chrom": -0.4509
        },
        {
          "t": 45.933,
          "r": -0.2704,
          "g": -0.2524,
          "b": -0.1864,
          "pos": -0.2481,
          "chrom": 0.0075
        },
        {
          "t": 46.067,
          "r": -0.1955,
          "g": -0.2696,
          "b": -0.2431,
          "pos": -0.155,
          "chrom": 0.358
        },
        {
          "t": 46.2,
          "r": -0.1256,
          "g": -0.2035,
          "b": -0.1965,
          "pos": 0.2387,
          "chrom": -0.1563
        },
        {
          "t": 46.267,
          "r": -0.1204,
          "g": -0.1953,
          "b": -0.1859,
          "pos": 0.0768,
          "chrom": -0.064
        },
        {
          "t": 46.4,
          "r": -0.1017,
          "g": -0.1779,
          "b": -0.1716,
          "pos": -0.0946,
          "chrom": 0.0402
        },
        {
          "t": 46.533,
          "r": -0.1085,
          "g": -0.1813,
          "b": -0.1749,
          "pos": 0.0029,
          "chrom": 0.0192
        },
        {
          "t": 46.6,
          "r": -0.0891,
          "g": -0.1562,
          "b": -0.1511,
          "pos": -0.1211,
          "chrom": 0.0815
        },
        {
          "t": 46.733,
          "r": -0.0726,
          "g": -0.1477,
          "b": -0.1412,
          "pos": -0.0291,
          "chrom": -0.0087
        },
        {
          "t": 46.867,
          "r": -0.0119,
          "g": -0.1296,
          "b": -0.1401,
          "pos": 0.185,
          "chrom": -0.1211
        },
        {
          "t": 46.933,
          "r": 0.0032,
          "g": -0.1305,
          "b": -0.1387,
          "pos": 0.0917,
          "chrom": -0.0364
        },
        {
          "t": 47.067,
          "r": -0.0006,
          "g": -0.1628,
          "b": -0.1668,
          "pos": -0.0319,
          "chrom": 0.1332
        },
        {
          "t": 47.2,
          "r": 0.0294,
          "g": -0.1258,
          "b": -0.1241,
          "pos": -0.091,
          "chrom": -0.0547
        },
        {
          "t": 47.267,
          "r": 0.0027,
          "g": -0.1347,
          "b": -0.1223,
          "pos": -0.0143,
          "chrom": -0.1494
        },
        {
          "t": 47.4,
          "r": 0.0015,
          "g": -0.1715,
          "b": -0.1769,
          "pos": -0.1383,
          "chrom": 0.2091
        },
        {
          "t": 47.533,
          "r": -0.0045,
          "g": -0.1413,
          "b": -0.1455,
          "pos": 0.0514,
          "chrom": -0.0006
        },
        {
          "t": 47.6,
          "r": -0.0122,
          "g": -0.1381,
          "b": -0.1388,
          "pos": -0.0113,
          "chrom": -0.0007
        },
        {
          "t": 47.733,
          "r": -0.006,
          "g": -0.1258,
          "b": -0.1239,
          "pos": -0.0747,
          "chrom": 0.0578
        },
        {
          "t": 47.867,
          "r": -0.0501,
          "g": -0.1561,
          "b": -0.1402,
          "pos": 0.779,
          "chrom": -0.5978
        },
        {
          "t": 47.933,
          "r": -0.037,
          "g": -0.1527,
          "b": -0.128,
          "pos": 0.2076,
          "chrom": -0.1644
        },
        {
          "t": 48.067,
          "r": -0.049,
          "g": -0.2109,
          "b": -0.1598,
          "pos": -0.7669,
          "chrom": 0.5899
        },
        {
          "t": 48.2,
          "r": -0.0756,
          "g": -0.2299,
          "b": -0.1728,
          "pos": 0.097,
          "chrom": -0.1019
        },
        {
          "t": 48.267,
          "r": -0.0661,
          "g": -0.208,
          "b": -0.1513,
          "pos": 0.1744,
          "chrom": -0.1843
        },
        {
          "t": 48.4,
          "r": -0.0804,
          "g": -0.1966,
          "b": -0.1422,
          "pos": 0.2722,
          "chrom": -0.1774
        },
        {
          "t": 48.533,
          "r": -0.0805,
          "g": -0.1744,
          "b": -0.1269,
          "pos": -0.0977,
          "chrom": 0.233
        },
        {
          "t": 48.6,
          "r": -0.0851,
          "g": -0.1887,
          "b": -0.1458,
          "pos": -0.3277,
          "chrom": 0.4667
        },
        {
          "t": 48.733,
          "r": -0.1097,
          "g": -0.2052,
          "b": -0.1695,
          "pos": -0.2343,
          "chrom": 0.1325
        },
        {
          "t": 48.867,
          "r": -0.1799,
          "g": -0.2784,
          "b": -0.2486,
          "pos": 0.5893,
          "chrom": -0.7683
        },
        {
          "t": 48.933,
          "r": -0.2912,
          "g": -0.3714,
          "b": -0.3181,
          "pos": 0.5288,
          "chrom": -0.8466
        },
        {
          "t": 49.067,
          "r": -0.5917,
          "g": -0.5924,
          "b": -0.4536,
          "pos": -0.293,
          "chrom": 0.1763
        },
        {
          "t": 49.2,
          "r": -0.7609,
          "g": -0.6413,
          "b": -0.4386,
          "pos": -0.1344,
          "chrom": 0.9628
        },
        {
          "t": 49.267,
          "r": -0.5086,
          "g": -0.2607,
          "b": -0.06,
          "pos": -0.0723,
          "chrom": 0.6045
        },
        {
          "t": 49.4,
          "r": 0.0391,
          "g": 0.4418,
          "b": 0.6291,
          "pos": -0.5966,
          "chrom": 0.3804
        },
        {
          "t": 49.533,
          "r": 0.4806,
          "g": 0.9531,
          "b": 1.0815,
          "pos": 0.1997,
          "chrom": -0.2151
        },
        {
          "t": 49.6,
          "r": 0.5425,
          "g": 1.038,
          "b": 1.1642,
          "pos": 0.7779,
          "chrom": -1.0918
        },
        {
          "t": 49.733,
          "r": 0.5589,
          "g": 1.0231,
          "b": 1.1417,
          "pos": 1.0977,
          "chrom": -1.5
        },
        {
          "t": 49.867,
          "r": -0.3943,
          "g": -0.1508,
          "b": 0.0761,
          "pos": -0.754,
          "chrom": 1.5
        },
        {
          "t": 49.933,
          "r": -0.7856,
          "g": -0.6009,
          "b": -0.3328,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 50.067,
          "r": -0.4433,
          "g": -0.2556,
          "b": -0.0269,
          "pos": -1.0344,
          "chrom": 1.0268
        },
        {
          "t": 50.2,
          "r": -0.1216,
          "g": 0.1906,
          "b": 0.3601,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 50.267,
          "r": -0.2396,
          "g": 0.14,
          "b": 0.353,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 50.4,
          "r": -0.3704,
          "g": -0.0217,
          "b": 0.2242,
          "pos": -0.0348,
          "chrom": -0.3519
        },
        {
          "t": 50.533,
          "r": -0.8697,
          "g": -0.505,
          "b": -0.1634,
          "pos": -0.6882,
          "chrom": 0.0277
        },
        {
          "t": 50.6,
          "r": -1.3466,
          "g": -1.012,
          "b": -0.6194,
          "pos": -0.7375,
          "chrom": 0.6795
        },
        {
          "t": 50.733,
          "r": -1.5,
          "g": -1.5,
          "b": -1.3649,
          "pos": -0.275,
          "chrom": 1.4655
        },
        {
          "t": 50.867,
          "r": -1.5,
          "g": -1.4974,
          "b": -1.1679,
          "pos": 0.5811,
          "chrom": -0.7671
        },
        {
          "t": 50.933,
          "r": -1.4339,
          "g": -1.3079,
          "b": -1.0142,
          "pos": 0.3174,
          "chrom": -0.854
        },
        {
          "t": 51.067,
          "r": -1.0484,
          "g": -0.9476,
          "b": -0.7368,
          "pos": 0.0014,
          "chrom": -0.226
        },
        {
          "t": 51.2,
          "r": -0.6677,
          "g": -0.5582,
          "b": -0.432,
          "pos": 0.2536,
          "chrom": -0.2413
        },
        {
          "t": 51.267,
          "r": -0.4379,
          "g": -0.3615,
          "b": -0.2742,
          "pos": 0.0233,
          "chrom": 0.2242
        },
        {
          "t": 51.4,
          "r": -0.2079,
          "g": -0.1565,
          "b": -0.1154,
          "pos": -0.6152,
          "chrom": 0.5709
        },
        {
          "t": 51.533,
          "r": -0.1178,
          "g": -0.0676,
          "b": -0.067,
          "pos": 0.1204,
          "chrom": -0.2622
        },
        {
          "t": 51.6,
          "r": -0.336,
          "g": -0.2957,
          "b": -0.2898,
          "pos": 0.573,
          "chrom": -0.3415
        },
        {
          "t": 51.733,
          "r": -0.3866,
          "g": -0.3898,
          "b": -0.3992,
          "pos": 0.0617,
          "chrom": -0.0053
        },
        {
          "t": 51.867,
          "r": -0.5309,
          "g": -0.5395,
          "b": -0.5397,
          "pos": -0.4475,
          "chrom": 0.2597
        },
        {
          "t": 51.933,
          "r": -0.5489,
          "g": -0.5689,
          "b": -0.5834,
          "pos": -0.1039,
          "chrom": 0.0685
        },
        {
          "t": 52.067,
          "r": -0.5328,
          "g": -0.5547,
          "b": -0.5862,
          "pos": 0.2637,
          "chrom": -0.2176
        },
        {
          "t": 52.2,
          "r": -0.4939,
          "g": -0.4978,
          "b": -0.5333,
          "pos": 0.002,
          "chrom": 0.0962
        },
        {
          "t": 52.267,
          "r": -0.4379,
          "g": -0.4114,
          "b": -0.4451,
          "pos": -0.0747,
          "chrom": 0.1864
        },
        {
          "t": 52.4,
          "r": -0.2837,
          "g": -0.203,
          "b": -0.2381,
          "pos": -0.2795,
          "chrom": 0.1875
        },
        {
          "t": 52.533,
          "r": -0.179,
          "g": -0.0528,
          "b": -0.0861,
          "pos": 0.0408,
          "chrom": -0.0867
        },
        {
          "t": 52.6,
          "r": -0.1431,
          "g": 0.0011,
          "b": -0.039,
          "pos": 0.34,
          "chrom": -0.36
        },
        {
          "t": 52.733,
          "r": -0.1151,
          "g": 0.028,
          "b": -0.0051,
          "pos": 0.1314,
          "chrom": -0.1378
        },
        {
          "t": 52.867,
          "r": -0.0715,
          "g": 0.0045,
          "b": -0.0446,
          "pos": -0.1834,
          "chrom": 0.2566
        },
        {
          "t": 52.933,
          "r": -0.0515,
          "g": -0.0083,
          "b": -0.07,
          "pos": -0.1763,
          "chrom": 0.2683
        },
        {
          "t": 53.067,
          "r": 0.0191,
          "g": 0.0144,
          "b": -0.0727,
          "pos": -0.0858,
          "chrom": 0.1391
        },
        {
          "t": 53.2,
          "r": 0.0152,
          "g": 0.0175,
          "b": -0.0709,
          "pos": -0.0008,
          "chrom": -0.1698
        },
        {
          "t": 53.267,
          "r": 0.0421,
          "g": 0.045,
          "b": -0.0477,
          "pos": -0.0196,
          "chrom": -0.1843
        },
        {
          "t": 53.4,
          "r": 0.0466,
          "g": -0.0025,
          "b": -0.1141,
          "pos": 0.1653,
          "chrom": -0.0435
        },
        {
          "t": 53.533,
          "r": 0.0562,
          "g": 0.0064,
          "b": -0.0947,
          "pos": 0.3573,
          "chrom": -0.1331
        },
        {
          "t": 53.6,
          "r": 0.0925,
          "g": 0.0341,
          "b": -0.0619,
          "pos": -0.1491,
          "chrom": 0.1734
        },
        {
          "t": 53.733,
          "r": 0.1662,
          "g": 0.0822,
          "b": 0.0044,
          "pos": -0.6874,
          "chrom": 0.4919
        },
        {
          "t": 53.867,
          "r": 0.1801,
          "g": 0.1168,
          "b": 0.0371,
          "pos": 0.7799,
          "chrom": -0.7381
        },
        {
          "t": 53.933,
          "r": 0.1548,
          "g": 0.083,
          "b": 0.014,
          "pos": 0.4768,
          "chrom": -0.398
        },
        {
          "t": 54.067,
          "r": 0.0679,
          "g": -0.0367,
          "b": -0.0862,
          "pos": -0.3192,
          "chrom": 0.4187
        },
        {
          "t": 54.2,
          "r": 0.0719,
          "g": -0.0402,
          "b": -0.1092,
          "pos": 0.0144,
          "chrom": -0.131
        },
        {
          "t": 54.267,
          "r": 0.1058,
          "g": -0.0215,
          "b": -0.104,
          "pos": -0.2133,
          "chrom": -0.0229
        },
        {
          "t": 54.4,
          "r": -0.0899,
          "g": -0.2052,
          "b": -0.2882,
          "pos": -0.0527,
          "chrom": 0.1947
        },
        {
          "t": 54.533,
          "r": -0.1966,
          "g": -0.2709,
          "b": -0.3443,
          "pos": 0.1951,
          "chrom": -0.0509
        },
        {
          "t": 54.6,
          "r": -0.1673,
          "g": -0.2327,
          "b": -0.3233,
          "pos": 0.2475,
          "chrom": -0.2855
        },
        {
          "t": 54.733,
          "r": -0.2389,
          "g": -0.2937,
          "b": -0.3679,
          "pos": -0.0401,
          "chrom": -0.0597
        },
        {
          "t": 54.867,
          "r": -0.3021,
          "g": -0.3561,
          "b": -0.42,
          "pos": -0.0586,
          "chrom": 0.0759
        },
        {
          "t": 54.933,
          "r": -0.341,
          "g": -0.3938,
          "b": -0.4475,
          "pos": -0.0943,
          "chrom": 0.1563
        },
        {
          "t": 55.067,
          "r": -0.3953,
          "g": -0.4396,
          "b": -0.4731,
          "pos": -0.122,
          "chrom": 0.1758
        },
        {
          "t": 55.2,
          "r": -0.3626,
          "g": -0.409,
          "b": -0.4386,
          "pos": -0.0199,
          "chrom": -0.099
        },
        {
          "t": 55.267,
          "r": -0.393,
          "g": -0.4435,
          "b": -0.4602,
          "pos": -0.069,
          "chrom": -0.0366
        },
        {
          "t": 55.4,
          "r": -0.4636,
          "g": -0.5164,
          "b": -0.5182,
          "pos": 0.2867,
          "chrom": -0.1624
        },
        {
          "t": 55.533,
          "r": -0.4811,
          "g": -0.5511,
          "b": -0.539,
          "pos": 0.0937,
          "chrom": -0.0448
        },
        {
          "t": 55.6,
          "r": -0.4818,
          "g": -0.561,
          "b": -0.5472,
          "pos": 0.0584,
          "chrom": -0.0033
        },
        {
          "t": 55.733,
          "r": -0.5086,
          "g": -0.599,
          "b": -0.5743,
          "pos": -0.3649,
          "chrom": 0.2796
        },
        {
          "t": 55.867,
          "r": -0.494,
          "g": -0.5866,
          "b": -0.5618,
          "pos": -0.7068,
          "chrom": 0.4425
        },
        {
          "t": 55.933,
          "r": -0.4977,
          "g": -0.5822,
          "b": -0.5747,
          "pos": 0.2786,
          "chrom": -0.216
        },
        {
          "t": 56.067,
          "r": -0.5344,
          "g": -0.6009,
          "b": -0.5921,
          "pos": 0.7368,
          "chrom": -0.486
        },
        {
          "t": 56.2,
          "r": -0.5418,
          "g": -0.5927,
          "b": -0.5573,
          "pos": -0.1576,
          "chrom": 0.1176
        },
        {
          "t": 56.267,
          "r": -0.5222,
          "g": -0.5686,
          "b": -0.5283,
          "pos": -0.2576,
          "chrom": 0.1801
        },
        {
          "t": 56.4,
          "r": -0.42,
          "g": -0.4913,
          "b": -0.4522,
          "pos": -0.3341,
          "chrom": 0.2522
        },
        {
          "t": 56.533,
          "r": -0.3957,
          "g": -0.4469,
          "b": -0.4079,
          "pos": 0.244,
          "chrom": -0.1256
        },
        {
          "t": 56.6,
          "r": -0.3669,
          "g": -0.4106,
          "b": -0.3667,
          "pos": 0.0192,
          "chrom": -0.0255
        },
        {
          "t": 56.733,
          "r": -0.2976,
          "g": -0.3327,
          "b": -0.303,
          "pos": -0.1192,
          "chrom": 0.0414
        },
        {
          "t": 56.867,
          "r": -0.267,
          "g": -0.2874,
          "b": -0.2713,
          "pos": 0.1079,
          "chrom": -0.0408
        },
        {
          "t": 56.933,
          "r": -0.2463,
          "g": -0.2564,
          "b": -0.2471,
          "pos": 0.2273,
          "chrom": -0.1524
        },
        {
          "t": 57.067,
          "r": -0.1555,
          "g": -0.1547,
          "b": -0.1633,
          "pos": 0.1194,
          "chrom": -0.1031
        },
        {
          "t": 57.2,
          "r": -0.0672,
          "g": -0.057,
          "b": -0.0851,
          "pos": -0.2663,
          "chrom": 0.3007
        },
        {
          "t": 57.267,
          "r": -0.0281,
          "g": -0.0095,
          "b": -0.0489,
          "pos": -0.1981,
          "chrom": 0.2702
        },
        {
          "t": 57.4,
          "r": 0.1702,
          "g": 0.2073,
          "b": 0.1236,
          "pos": -0.1733,
          "chrom": 0.0084
        },
        {
          "t": 57.533,
          "r": 0.294,
          "g": 0.3354,
          "b": 0.2023,
          "pos": 0.1759,
          "chrom": -0.2473
        },
        {
          "t": 57.6,
          "r": 0.3134,
          "g": 0.3287,
          "b": 0.1772,
          "pos": 0.1693,
          "chrom": -0.0707
        },
        {
          "t": 57.733,
          "r": 0.3204,
          "g": 0.3269,
          "b": 0.1585,
          "pos": 0.1208,
          "chrom": 0.0624
        },
        {
          "t": 57.867,
          "r": 0.3465,
          "g": 0.3507,
          "b": 0.1773,
          "pos": 0.3002,
          "chrom": -0.2686
        },
        {
          "t": 57.933,
          "r": 0.3292,
          "g": 0.3199,
          "b": 0.1526,
          "pos": -0.2198,
          "chrom": 0.1316
        },
        {
          "t": 58.067,
          "r": 0.3507,
          "g": 0.3061,
          "b": 0.1416,
          "pos": -0.5672,
          "chrom": 0.3354
        },
        {
          "t": 58.2,
          "r": 0.3994,
          "g": 0.3012,
          "b": 0.1143,
          "pos": 0.1604,
          "chrom": -0.1072
        },
        {
          "t": 58.267,
          "r": 0.4139,
          "g": 0.301,
          "b": 0.1057,
          "pos": 0.3952,
          "chrom": -0.1927
        },
        {
          "t": 58.4,
          "r": 0.4824,
          "g": 0.3342,
          "b": 0.1304,
          "pos": 0.4285,
          "chrom": -0.1895
        },
        {
          "t": 58.533,
          "r": 0.4959,
          "g": 0.3476,
          "b": 0.1713,
          "pos": -0.3427,
          "chrom": 0.2802
        },
        {
          "t": 58.6,
          "r": 0.5174,
          "g": 0.3839,
          "b": 0.2283,
          "pos": -0.7316,
          "chrom": 0.2671
        },
        {
          "t": 58.733,
          "r": 0.4814,
          "g": 0.3544,
          "b": 0.2166,
          "pos": -0.28,
          "chrom": 0.06
        },
        {
          "t": 58.867,
          "r": 0.3846,
          "g": 0.2307,
          "b": 0.0908,
          "pos": 1.3654,
          "chrom": -0.5927
        },
        {
          "t": 58.933,
          "r": 0.3588,
          "g": 0.2227,
          "b": 0.1083,
          "pos": 0.5667,
          "chrom": -0.2624
        },
        {
          "t": 59.067,
          "r": 0.3033,
          "g": 0.1965,
          "b": 0.1447,
          "pos": -0.9479,
          "chrom": 0.6239
        },
        {
          "t": 59.2,
          "r": 0.2451,
          "g": 0.161,
          "b": 0.118,
          "pos": -0.0286,
          "chrom": -0.0786
        },
        {
          "t": 59.267,
          "r": 0.2292,
          "g": 0.1634,
          "b": 0.1294,
          "pos": -0.01,
          "chrom": -0.2123
        },
        {
          "t": 59.4,
          "r": 0.0757,
          "g": -0.0005,
          "b": -0.0306,
          "pos": 0.3514,
          "chrom": -0.1154
        },
        {
          "t": 59.533,
          "r": 0.0106,
          "g": -0.0506,
          "b": -0.0625,
          "pos": 0.0567,
          "chrom": 0.0655
        },
        {
          "t": 59.6,
          "r": -0.0159,
          "g": -0.0671,
          "b": -0.0763,
          "pos": 0.0436,
          "chrom": -0.0365
        },
        {
          "t": 59.733,
          "r": -0.0564,
          "g": -0.1062,
          "b": -0.1045,
          "pos": -0.0603,
          "chrom": 0.0152
        },
        {
          "t": 59.867,
          "r": -0.0875,
          "g": -0.1374,
          "b": -0.1295,
          "pos": -0.6197,
          "chrom": 0.3789
        },
        {
          "t": 59.933,
          "r": -0.0923,
          "g": -0.1551,
          "b": -0.1572,
          "pos": -0.1228,
          "chrom": 0.0847
        },
        {
          "t": 60.067,
          "r": -0.1016,
          "g": -0.1794,
          "b": -0.2071,
          "pos": 0.5413,
          "chrom": -0.2939
        },
        {
          "t": 60.2,
          "r": -0.1454,
          "g": -0.2205,
          "b": -0.2343,
          "pos": -0.2304,
          "chrom": 0.1317
        },
        {
          "t": 60.333,
          "r": -0.1878,
          "g": -0.2615,
          "b": -0.2657,
          "pos": -0.1394,
          "chrom": 0.0441
        },
        {
          "t": 60.4,
          "r": -0.2063,
          "g": -0.2705,
          "b": -0.2684,
          "pos": 0.0088,
          "chrom": -0.0672
        },
        {
          "t": 60.533,
          "r": -0.2152,
          "g": -0.268,
          "b": -0.2579,
          "pos": 0.2355,
          "chrom": -0.1235
        },
        {
          "t": 60.667,
          "r": -0.245,
          "g": -0.2829,
          "b": -0.2549,
          "pos": 0.0785,
          "chrom": 0.2022
        },
        {
          "t": 60.733,
          "r": -0.2741,
          "g": -0.2618,
          "b": -0.2114,
          "pos": -0.1538,
          "chrom": 0.2309
        },
        {
          "t": 60.867,
          "r": -0.3292,
          "g": -0.25,
          "b": -0.1604,
          "pos": -0.8643,
          "chrom": 0.3992
        },
        {
          "t": 61.0,
          "r": -0.4653,
          "g": -0.3591,
          "b": -0.2835,
          "pos": 0.864,
          "chrom": -0.7726
        },
        {
          "t": 61.067,
          "r": -0.5158,
          "g": -0.4263,
          "b": -0.3395,
          "pos": 0.9342,
          "chrom": -0.7349
        },
        {
          "t": 61.2,
          "r": -0.4274,
          "g": -0.516,
          "b": -0.4851,
          "pos": -0.1983,
          "chrom": 0.3925
        },
        {
          "t": 61.333,
          "r": -0.3299,
          "g": -0.4679,
          "b": -0.4765,
          "pos": 0.334,
          "chrom": -0.148
        },
        {
          "t": 61.4,
          "r": -0.2594,
          "g": -0.407,
          "b": -0.4326,
          "pos": -0.2759,
          "chrom": 0.0985
        },
        {
          "t": 61.533,
          "r": -0.1868,
          "g": -0.3295,
          "b": -0.3772,
          "pos": -1.1169,
          "chrom": 0.728
        },
        {
          "t": 61.667,
          "r": -0.1141,
          "g": -0.2246,
          "b": -0.3445,
          "pos": 0.6044,
          "chrom": -0.3463
        },
        {
          "t": 61.733,
          "r": -0.0487,
          "g": -0.1386,
          "b": -0.2902,
          "pos": 0.827,
          "chrom": -0.5605
        },
        {
          "t": 61.867,
          "r": 0.015,
          "g": -0.0693,
          "b": -0.2397,
          "pos": 0.4529,
          "chrom": -0.358
        },
        {
          "t": 62.0,
          "r": 0.1391,
          "g": -0.0101,
          "b": -0.2004,
          "pos": -0.2201,
          "chrom": 0.1009
        },
        {
          "t": 62.067,
          "r": 0.193,
          "g": 0.0216,
          "b": -0.1727,
          "pos": -0.4437,
          "chrom": 0.2826
        },
        {
          "t": 62.2,
          "r": 0.3002,
          "g": 0.1026,
          "b": -0.0935,
          "pos": -0.435,
          "chrom": 0.33
        },
        {
          "t": 62.333,
          "r": 0.3882,
          "g": 0.2982,
          "b": 0.129,
          "pos": 0.1795,
          "chrom": -0.1604
        },
        {
          "t": 62.4,
          "r": 0.3959,
          "g": 0.3508,
          "b": 0.1858,
          "pos": 0.4278,
          "chrom": -0.1255
        },
        {
          "t": 62.533,
          "r": 0.3922,
          "g": 0.5462,
          "b": 0.4463,
          "pos": -0.1372,
          "chrom": 0.3452
        },
        {
          "t": 62.667,
          "r": 0.2838,
          "g": 0.712,
          "b": 0.6895,
          "pos": 0.1682,
          "chrom": -0.187
        },
        {
          "t": 62.733,
          "r": 0.2253,
          "g": 0.7465,
          "b": 0.7579,
          "pos": 0.0965,
          "chrom": -0.3728
        },
        {
          "t": 62.867,
          "r": 0.1562,
          "g": 0.7548,
          "b": 0.7945,
          "pos": -0.1744,
          "chrom": -0.5236
        },
        {
          "t": 63.0,
          "r": 0.2309,
          "g": 0.4816,
          "b": 0.3909,
          "pos": 0.1895,
          "chrom": 0.5921
        },
        {
          "t": 63.067,
          "r": 0.1974,
          "g": 0.4471,
          "b": 0.3645,
          "pos": 0.0051,
          "chrom": 0.7927
        },
        {
          "t": 63.2,
          "r": 0.159,
          "g": 0.3958,
          "b": 0.3249,
          "pos": -0.1254,
          "chrom": 0.0983
        },
        {
          "t": 63.333,
          "r": 0.1466,
          "g": 0.3634,
          "b": 0.2931,
          "pos": -0.0149,
          "chrom": -0.2346
        },
        {
          "t": 63.4,
          "r": 0.138,
          "g": 0.3462,
          "b": 0.2789,
          "pos": 0.0419,
          "chrom": -0.5823
        },
        {
          "t": 63.533,
          "r": 0.0725,
          "g": 0.1991,
          "b": 0.1193,
          "pos": 0.0332,
          "chrom": -0.1463
        },
        {
          "t": 63.667,
          "r": -0.0298,
          "g": -0.0314,
          "b": -0.1289,
          "pos": -0.1649,
          "chrom": 0.631
        },
        {
          "t": 63.733,
          "r": -0.0763,
          "g": -0.0761,
          "b": -0.1649,
          "pos": 0.1079,
          "chrom": 0.2089
        },
        {
          "t": 63.867,
          "r": -0.188,
          "g": -0.1603,
          "b": -0.2178,
          "pos": 0.23,
          "chrom": -0.1239
        },
        {
          "t": 64.0,
          "r": -0.2433,
          "g": -0.2024,
          "b": -0.22,
          "pos": -0.4848,
          "chrom": 0.0603
        },
        {
          "t": 64.067,
          "r": -0.273,
          "g": -0.2207,
          "b": -0.2344,
          "pos": -0.3453,
          "chrom": -0.0672
        },
        {
          "t": 64.2,
          "r": -0.3112,
          "g": -0.3592,
          "b": -0.3956,
          "pos": 0.2541,
          "chrom": -0.0363
        },
        {
          "t": 64.333,
          "r": -0.3792,
          "g": -0.4366,
          "b": -0.4587,
          "pos": 0.3711,
          "chrom": -0.1888
        },
        {
          "t": 64.4,
          "r": -0.412,
          "g": -0.4923,
          "b": -0.5011,
          "pos": -0.0795,
          "chrom": 0.0817
        },
        {
          "t": 64.533,
          "r": -0.4939,
          "g": -0.6037,
          "b": -0.5871,
          "pos": -0.3439,
          "chrom": 0.2743
        },
        {
          "t": 64.667,
          "r": -0.5649,
          "g": -0.6832,
          "b": -0.6437,
          "pos": -0.038,
          "chrom": 0.02
        },
        {
          "t": 64.733,
          "r": -0.6033,
          "g": -0.7243,
          "b": -0.6699,
          "pos": 0.0806,
          "chrom": -0.0636
        },
        {
          "t": 64.867,
          "r": -0.6367,
          "g": -0.7599,
          "b": -0.6942,
          "pos": 0.5678,
          "chrom": -0.452
        },
        {
          "t": 65.0,
          "r": -0.6876,
          "g": -0.8322,
          "b": -0.7284,
          "pos": -0.7216,
          "chrom": 0.5073
        },
        {
          "t": 65.067,
          "r": -0.7167,
          "g": -0.8542,
          "b": -0.7494,
          "pos": -0.5994,
          "chrom": 0.4278
        },
        {
          "t": 65.2,
          "r": -0.7713,
          "g": -0.8976,
          "b": -0.7949,
          "pos": 0.2903,
          "chrom": -0.1222
        },
        {
          "t": 65.333,
          "r": -0.7384,
          "g": -0.8654,
          "b": -0.7761,
          "pos": 0.2391,
          "chrom": -0.1353
        },
        {
          "t": 65.4,
          "r": -0.669,
          "g": -0.7993,
          "b": -0.7229,
          "pos": 0.1451,
          "chrom": -0.1536
        },
        {
          "t": 65.533,
          "r": -0.6503,
          "g": -0.7778,
          "b": -0.7014,
          "pos": -0.249,
          "chrom": 0.1468
        },
        {
          "t": 65.667,
          "r": -0.6403,
          "g": -0.761,
          "b": -0.6884,
          "pos": -0.1594,
          "chrom": 0.1308
        },
        {
          "t": 65.733,
          "r": -0.6357,
          "g": -0.7556,
          "b": -0.6827,
          "pos": -0.1071,
          "chrom": 0.089
        },
        {
          "t": 65.867,
          "r": -0.635,
          "g": -0.7519,
          "b": -0.6839,
          "pos": 0.51,
          "chrom": -0.3529
        },
        {
          "t": 66.0,
          "r": -0.6575,
          "g": -0.7902,
          "b": -0.7006,
          "pos": -0.2832,
          "chrom": 0.2348
        },
        {
          "t": 66.067,
          "r": -0.6524,
          "g": -0.7861,
          "b": -0.6969,
          "pos": -0.4975,
          "chrom": 0.367
        },
        {
          "t": 66.2,
          "r": -0.6547,
          "g": -0.7897,
          "b": -0.7056,
          "pos": 0.0844,
          "chrom": -0.0789
        },
        {
          "t": 66.333,
          "r": -0.6739,
          "g": -0.8116,
          "b": -0.7244,
          "pos": -0.0293,
          "chrom": 0.05
        },
        {
          "t": 66.4,
          "r": -0.6687,
          "g": -0.8044,
          "b": -0.7174,
          "pos": -0.0604,
          "chrom": 0.0674
        },
        {
          "t": 66.533,
          "r": -0.6397,
          "g": -0.7728,
          "b": -0.6938,
          "pos": 0.3217,
          "chrom": -0.2746
        },
        {
          "t": 66.667,
          "r": -0.6175,
          "g": -0.7574,
          "b": -0.6901,
          "pos": 0.1776,
          "chrom": -0.0806
        },
        {
          "t": 66.733,
          "r": -0.5978,
          "g": -0.747,
          "b": -0.679,
          "pos": -0.3668,
          "chrom": 0.3555
        },
        {
          "t": 66.867,
          "r": -0.4687,
          "g": -0.6336,
          "b": -0.6038,
          "pos": -0.6502,
          "chrom": 0.4451
        },
        {
          "t": 67.0,
          "r": -0.4171,
          "g": -0.561,
          "b": -0.576,
          "pos": 0.4745,
          "chrom": -0.4062
        },
        {
          "t": 67.067,
          "r": -0.424,
          "g": -0.5706,
          "b": -0.5914,
          "pos": 0.6396,
          "chrom": -0.4412
        },
        {
          "t": 67.2,
          "r": -0.3739,
          "g": -0.5389,
          "b": -0.5757,
          "pos": 0.0661,
          "chrom": -0.014
        },
        {
          "t": 67.333,
          "r": -0.3527,
          "g": -0.5251,
          "b": -0.5594,
          "pos": -0.1848,
          "chrom": 0.1254
        },
        {
          "t": 67.4,
          "r": -0.3624,
          "g": -0.5342,
          "b": -0.5655,
          "pos": -0.2054,
          "chrom": 0.173
        },
        {
          "t": 67.533,
          "r": -0.3524,
          "g": -0.5254,
          "b": -0.5462,
          "pos": -0.2847,
          "chrom": 0.2173
        },
        {
          "t": 67.667,
          "r": -0.3378,
          "g": -0.5085,
          "b": -0.5279,
          "pos": 0.1629,
          "chrom": -0.1076
        },
        {
          "t": 67.733,
          "r": -0.3009,
          "g": -0.4821,
          "b": -0.5073,
          "pos": 0.3057,
          "chrom": -0.2399
        },
        {
          "t": 67.867,
          "r": -0.2387,
          "g": -0.4463,
          "b": -0.4739,
          "pos": 0.1052,
          "chrom": -0.0957
        },
        {
          "t": 68.0,
          "r": -0.2734,
          "g": -0.4662,
          "b": -0.4789,
          "pos": 0.0901,
          "chrom": -0.0244
        },
        {
          "t": 68.067,
          "r": -0.2612,
          "g": -0.453,
          "b": -0.4633,
          "pos": -0.1391,
          "chrom": 0.1245
        },
        {
          "t": 68.2,
          "r": -0.2439,
          "g": -0.4253,
          "b": -0.4343,
          "pos": -0.4705,
          "chrom": 0.374
        },
        {
          "t": 68.333,
          "r": -0.1892,
          "g": -0.3512,
          "b": -0.3809,
          "pos": 0.1317,
          "chrom": -0.1338
        },
        {
          "t": 68.4,
          "r": -0.1604,
          "g": -0.3135,
          "b": -0.3573,
          "pos": 0.4281,
          "chrom": -0.357
        },
        {
          "t": 68.533,
          "r": -0.1501,
          "g": -0.2951,
          "b": -0.3461,
          "pos": 0.2827,
          "chrom": -0.155
        },
        {
          "t": 68.667,
          "r": -0.1132,
          "g": -0.25,
          "b": -0.2965,
          "pos": -0.3575,
          "chrom": 0.2375
        },
        {
          "t": 68.733,
          "r": -0.1125,
          "g": -0.2485,
          "b": -0.2961,
          "pos": -0.4459,
          "chrom": 0.3307
        },
        {
          "t": 68.867,
          "r": -0.0913,
          "g": -0.2235,
          "b": -0.277,
          "pos": -0.0203,
          "chrom": 0.0217
        }
      ],
      "hrTracks": {
        "pos_face_full": [
          {
            "t": 0.0,
            "bpm": 92.725
          },
          {
            "t": 5.0,
            "bpm": 93.164
          },
          {
            "t": 10.0,
            "bpm": 93.164
          },
          {
            "t": 15.0,
            "bpm": 99.316
          },
          {
            "t": 20.0,
            "bpm": 159.082
          },
          {
            "t": 25.0,
            "bpm": 92.725
          },
          {
            "t": 30.0,
            "bpm": 91.406
          },
          {
            "t": 35.0,
            "bpm": 92.285
          },
          {
            "t": 40.0,
            "bpm": 93.604
          },
          {
            "t": 45.0,
            "bpm": 83.496
          }
        ],
        "chrom_face_full": [
          {
            "t": 0.0,
            "bpm": 101.074
          },
          {
            "t": 5.0,
            "bpm": 93.164
          },
          {
            "t": 10.0,
            "bpm": 93.164
          },
          {
            "t": 15.0,
            "bpm": 92.285
          },
          {
            "t": 20.0,
            "bpm": 101.074
          },
          {
            "t": 25.0,
            "bpm": 100.195
          },
          {
            "t": 30.0,
            "bpm": 92.285
          },
          {
            "t": 35.0,
            "bpm": 92.285
          },
          {
            "t": 40.0,
            "bpm": 82.178
          },
          {
            "t": 45.0,
            "bpm": 83.496
          }
        ],
        "sqi_top_window": [
          {
            "t": 0.0,
            "bpm": 99.756
          },
          {
            "t": 5.0,
            "bpm": 97.998
          },
          {
            "t": 10.0,
            "bpm": 100.195
          },
          {
            "t": 15.0,
            "bpm": 100.635
          },
          {
            "t": 20.0,
            "bpm": 99.756
          },
          {
            "t": 25.0,
            "bpm": 100.195
          },
          {
            "t": 30.0,
            "bpm": 100.195
          },
          {
            "t": 35.0,
            "bpm": 98.877
          },
          {
            "t": 40.0,
            "bpm": 98.877
          },
          {
            "t": 45.0,
            "bpm": 100.635
          }
        ],
        "trained_peak_selector_current": [
          {
            "t": 0.0,
            "bpm": 92.725
          },
          {
            "t": 5.0,
            "bpm": 92.285
          },
          {
            "t": 10.0,
            "bpm": 91.846
          },
          {
            "t": 15.0,
            "bpm": 91.406
          },
          {
            "t": 20.0,
            "bpm": 89.648
          },
          {
            "t": 25.0,
            "bpm": 93.164
          },
          {
            "t": 30.0,
            "bpm": 89.648
          },
          {
            "t": 35.0,
            "bpm": 86.133
          },
          {
            "t": 40.0,
            "bpm": 87.451
          },
          {
            "t": 45.0,
            "bpm": 94.482
          }
        ],
        "oracle_window_peak": [
          {
            "t": 0.0,
            "bpm": 90.088
          },
          {
            "t": 5.0,
            "bpm": 90.088
          },
          {
            "t": 10.0,
            "bpm": 90.088
          },
          {
            "t": 15.0,
            "bpm": 90.088
          },
          {
            "t": 20.0,
            "bpm": 90.088
          },
          {
            "t": 25.0,
            "bpm": 90.088
          },
          {
            "t": 30.0,
            "bpm": 90.088
          },
          {
            "t": 35.0,
            "bpm": 90.088
          },
          {
            "t": 40.0,
            "bpm": 90.088
          },
          {
            "t": 45.0,
            "bpm": 90.088
          }
        ]
      }
    },
    {
      "video": "7.mp4",
      "durationSec": 62.119,
      "label": {
        "bpm_min": 182.0,
        "bpm_max": 197.0,
        "bpm_target": 189.5
      },
      "waveform": [
        {
          "t": 0.0,
          "r": 0.2971,
          "g": 0.1071,
          "b": 0.0358,
          "pos": 0.0054,
          "chrom": -0.0043
        },
        {
          "t": 0.133,
          "r": 0.3611,
          "g": 0.1868,
          "b": 0.1222,
          "pos": 0.2147,
          "chrom": -0.1922
        },
        {
          "t": 0.2,
          "r": 0.3968,
          "g": 0.2207,
          "b": 0.1579,
          "pos": 0.1753,
          "chrom": -0.2102
        },
        {
          "t": 0.333,
          "r": 0.3969,
          "g": 0.2161,
          "b": 0.1568,
          "pos": 0.031,
          "chrom": -0.0868
        },
        {
          "t": 0.4,
          "r": 0.3625,
          "g": 0.163,
          "b": 0.0981,
          "pos": -0.1495,
          "chrom": 0.137
        },
        {
          "t": 0.533,
          "r": 0.2904,
          "g": 0.0799,
          "b": 0.0088,
          "pos": -0.1676,
          "chrom": 0.1747
        },
        {
          "t": 0.6,
          "r": 0.2227,
          "g": 0.0249,
          "b": -0.0521,
          "pos": -0.0261,
          "chrom": 0.0766
        },
        {
          "t": 0.733,
          "r": 0.0649,
          "g": -0.1238,
          "b": -0.2002,
          "pos": 0.0453,
          "chrom": 0.0306
        },
        {
          "t": 0.8,
          "r": -0.0279,
          "g": -0.1848,
          "b": -0.2545,
          "pos": 0.1843,
          "chrom": -0.202
        },
        {
          "t": 0.933,
          "r": -0.0658,
          "g": -0.202,
          "b": -0.2568,
          "pos": -0.0215,
          "chrom": -0.1056
        },
        {
          "t": 1.0,
          "r": -0.0656,
          "g": -0.1944,
          "b": -0.245,
          "pos": -0.0136,
          "chrom": -0.1072
        },
        {
          "t": 1.133,
          "r": -0.2612,
          "g": -0.3077,
          "b": -0.3138,
          "pos": 0.095,
          "chrom": -0.1049
        },
        {
          "t": 1.2,
          "r": -0.2231,
          "g": -0.3064,
          "b": -0.3078,
          "pos": -0.4155,
          "chrom": 0.5362
        },
        {
          "t": 1.333,
          "r": -0.0777,
          "g": -0.0755,
          "b": -0.0293,
          "pos": -0.1624,
          "chrom": 0.3853
        },
        {
          "t": 1.4,
          "r": 0.1476,
          "g": 0.2285,
          "b": 0.2951,
          "pos": 0.6368,
          "chrom": -0.5349
        },
        {
          "t": 1.533,
          "r": 0.3754,
          "g": 0.5326,
          "b": 0.6534,
          "pos": 0.3836,
          "chrom": -0.6189
        },
        {
          "t": 1.6,
          "r": 0.3533,
          "g": 0.4961,
          "b": 0.6348,
          "pos": -0.7005,
          "chrom": 0.4956
        },
        {
          "t": 1.733,
          "r": 0.3075,
          "g": 0.4372,
          "b": 0.5619,
          "pos": -0.543,
          "chrom": 0.43
        },
        {
          "t": 1.8,
          "r": 0.5317,
          "g": 0.7318,
          "b": 0.8231,
          "pos": 0.6608,
          "chrom": -0.7303
        },
        {
          "t": 1.933,
          "r": 0.3151,
          "g": 0.4549,
          "b": 0.4978,
          "pos": 0.6586,
          "chrom": -0.4062
        },
        {
          "t": 2.0,
          "r": 0.3224,
          "g": 0.4731,
          "b": 0.5183,
          "pos": -0.0505,
          "chrom": 0.2546
        },
        {
          "t": 2.133,
          "r": 0.3284,
          "g": 0.4814,
          "b": 0.5261,
          "pos": -0.7848,
          "chrom": 0.8263
        },
        {
          "t": 2.2,
          "r": 0.3614,
          "g": 0.5509,
          "b": 0.6019,
          "pos": -0.9225,
          "chrom": 0.8241
        },
        {
          "t": 2.333,
          "r": 0.4529,
          "g": 0.7192,
          "b": 0.7909,
          "pos": 0.2683,
          "chrom": -0.4795
        },
        {
          "t": 2.4,
          "r": 0.4039,
          "g": 0.7254,
          "b": 0.7756,
          "pos": 1.4957,
          "chrom": -1.4894
        },
        {
          "t": 2.533,
          "r": 0.4949,
          "g": 0.7457,
          "b": 0.7894,
          "pos": 0.8832,
          "chrom": -0.8803
        },
        {
          "t": 2.6,
          "r": 0.4841,
          "g": 0.651,
          "b": 0.6894,
          "pos": -0.6203,
          "chrom": 0.7615
        },
        {
          "t": 2.733,
          "r": 0.4553,
          "g": 0.5192,
          "b": 0.5343,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 2.8,
          "r": 0.4059,
          "g": 0.5567,
          "b": 0.6111,
          "pos": -1.4339,
          "chrom": 0.9665
        },
        {
          "t": 2.933,
          "r": -0.2405,
          "g": -0.0169,
          "b": 0.0236,
          "pos": 1.3614,
          "chrom": -1.3134
        },
        {
          "t": 3.0,
          "r": -0.0723,
          "g": 0.1555,
          "b": 0.1577,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 3.133,
          "r": 0.2841,
          "g": 0.3632,
          "b": 0.3771,
          "pos": -0.0765,
          "chrom": 0.1948
        },
        {
          "t": 3.2,
          "r": 0.5086,
          "g": 0.5489,
          "b": 0.5718,
          "pos": -1.2741,
          "chrom": 1.0956
        },
        {
          "t": 3.333,
          "r": 0.6036,
          "g": 0.6375,
          "b": 0.661,
          "pos": -0.6435,
          "chrom": 0.4541
        },
        {
          "t": 3.4,
          "r": 0.5189,
          "g": 0.5654,
          "b": 0.5827,
          "pos": -0.2887,
          "chrom": 0.1692
        },
        {
          "t": 3.533,
          "r": 0.4409,
          "g": 0.5023,
          "b": 0.5085,
          "pos": -0.1728,
          "chrom": 0.0218
        },
        {
          "t": 3.6,
          "r": 0.3434,
          "g": 0.3986,
          "b": 0.3858,
          "pos": 0.2009,
          "chrom": -0.1279
        },
        {
          "t": 3.733,
          "r": 0.1483,
          "g": 0.2016,
          "b": 0.1623,
          "pos": 0.7547,
          "chrom": -0.3419
        },
        {
          "t": 3.8,
          "r": 0.2024,
          "g": 0.2402,
          "b": 0.2144,
          "pos": 0.5116,
          "chrom": -0.3386
        },
        {
          "t": 3.933,
          "r": 0.3727,
          "g": 0.4051,
          "b": 0.4051,
          "pos": 0.2497,
          "chrom": -0.5819
        },
        {
          "t": 4.0,
          "r": 0.3708,
          "g": 0.3568,
          "b": 0.36,
          "pos": -0.1594,
          "chrom": -0.096
        },
        {
          "t": 4.133,
          "r": 0.2631,
          "g": 0.1799,
          "b": 0.1613,
          "pos": -1.0112,
          "chrom": 1.1143
        },
        {
          "t": 4.2,
          "r": 0.2046,
          "g": 0.1678,
          "b": 0.136,
          "pos": -0.6677,
          "chrom": 0.7029
        },
        {
          "t": 4.333,
          "r": -0.0501,
          "g": 0.0027,
          "b": -0.0393,
          "pos": 0.2456,
          "chrom": -0.3196
        },
        {
          "t": 4.4,
          "r": -0.2812,
          "g": -0.2194,
          "b": -0.2747,
          "pos": -0.1994,
          "chrom": 0.3318
        },
        {
          "t": 4.533,
          "r": -0.6164,
          "g": -0.5393,
          "b": -0.616,
          "pos": 0.5666,
          "chrom": -0.4666
        },
        {
          "t": 4.6,
          "r": -0.5715,
          "g": -0.4163,
          "b": -0.4813,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 4.733,
          "r": -0.8218,
          "g": -0.8838,
          "b": -0.9679,
          "pos": -0.2045,
          "chrom": 0.1998
        },
        {
          "t": 4.8,
          "r": -0.732,
          "g": -1.0717,
          "b": -1.1577,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 4.933,
          "r": -0.7571,
          "g": -1.0604,
          "b": -1.1418,
          "pos": -0.697,
          "chrom": 0.6168
        },
        {
          "t": 5.0,
          "r": -0.7535,
          "g": -1.0709,
          "b": -1.1507,
          "pos": 0.7335,
          "chrom": -0.7733
        },
        {
          "t": 5.133,
          "r": -0.7413,
          "g": -1.0653,
          "b": -1.139,
          "pos": 0.8606,
          "chrom": -0.8759
        },
        {
          "t": 5.2,
          "r": -0.7476,
          "g": -1.0758,
          "b": -1.1456,
          "pos": 1.2452,
          "chrom": -1.1876
        },
        {
          "t": 5.333,
          "r": -0.7108,
          "g": -1.0513,
          "b": -1.1134,
          "pos": 0.1646,
          "chrom": -0.0556
        },
        {
          "t": 5.4,
          "r": -0.5672,
          "g": -0.9301,
          "b": -0.9483,
          "pos": -1.3736,
          "chrom": 1.2166
        },
        {
          "t": 5.533,
          "r": -0.4394,
          "g": -0.7523,
          "b": -0.7663,
          "pos": -0.961,
          "chrom": 0.8156
        },
        {
          "t": 5.6,
          "r": -0.2155,
          "g": -0.4599,
          "b": -0.5078,
          "pos": 0.6558,
          "chrom": -0.5112
        },
        {
          "t": 5.733,
          "r": -0.0435,
          "g": -0.2464,
          "b": -0.296,
          "pos": 1.0057,
          "chrom": -0.8241
        },
        {
          "t": 5.8,
          "r": -0.0566,
          "g": -0.2244,
          "b": -0.2551,
          "pos": -0.2699,
          "chrom": 0.1794
        },
        {
          "t": 5.933,
          "r": 0.0677,
          "g": -0.0973,
          "b": -0.122,
          "pos": -0.4773,
          "chrom": 0.2695
        },
        {
          "t": 6.0,
          "r": 0.2185,
          "g": 0.124,
          "b": 0.0292,
          "pos": 0.6192,
          "chrom": -0.5336
        },
        {
          "t": 6.133,
          "r": 0.2183,
          "g": 0.0756,
          "b": -0.021,
          "pos": -0.2266,
          "chrom": 0.2997
        },
        {
          "t": 6.2,
          "r": 0.199,
          "g": 0.0635,
          "b": -0.0316,
          "pos": -0.4713,
          "chrom": 0.3623
        },
        {
          "t": 6.333,
          "r": 0.0818,
          "g": -0.0195,
          "b": -0.1233,
          "pos": 0.2344,
          "chrom": -0.2314
        },
        {
          "t": 6.4,
          "r": 0.0034,
          "g": -0.0997,
          "b": -0.2018,
          "pos": -0.0497,
          "chrom": 0.1124
        },
        {
          "t": 6.533,
          "r": -0.0031,
          "g": -0.0751,
          "b": -0.1678,
          "pos": -0.0322,
          "chrom": 0.0278
        },
        {
          "t": 6.6,
          "r": -0.0751,
          "g": -0.1092,
          "b": -0.1905,
          "pos": 0.2196,
          "chrom": -0.2293
        },
        {
          "t": 6.733,
          "r": -0.0471,
          "g": -0.0615,
          "b": -0.1324,
          "pos": 0.0562,
          "chrom": -0.0465
        },
        {
          "t": 6.8,
          "r": -0.0071,
          "g": -0.0244,
          "b": -0.0921,
          "pos": -0.1903,
          "chrom": 0.1112
        },
        {
          "t": 6.933,
          "r": 0.0129,
          "g": 0.0105,
          "b": -0.0515,
          "pos": -0.1814,
          "chrom": 0.1138
        },
        {
          "t": 7.0,
          "r": -0.0443,
          "g": -0.0427,
          "b": -0.1144,
          "pos": 0.1349,
          "chrom": -0.0277
        },
        {
          "t": 7.133,
          "r": -0.1475,
          "g": -0.1217,
          "b": -0.1863,
          "pos": 0.2965,
          "chrom": -0.2259
        },
        {
          "t": 7.2,
          "r": -0.1301,
          "g": -0.109,
          "b": -0.1694,
          "pos": 0.05,
          "chrom": -0.0965
        },
        {
          "t": 7.333,
          "r": -0.2818,
          "g": -0.2606,
          "b": -0.3122,
          "pos": -0.3467,
          "chrom": 0.2601
        },
        {
          "t": 7.4,
          "r": -0.3053,
          "g": -0.2844,
          "b": -0.3315,
          "pos": -0.4337,
          "chrom": 0.3213
        },
        {
          "t": 7.533,
          "r": -0.335,
          "g": -0.3204,
          "b": -0.3738,
          "pos": 0.115,
          "chrom": -0.0682
        },
        {
          "t": 7.6,
          "r": -0.3107,
          "g": -0.2939,
          "b": -0.3463,
          "pos": 0.6175,
          "chrom": -0.4431
        },
        {
          "t": 7.733,
          "r": -0.168,
          "g": -0.166,
          "b": -0.1948,
          "pos": 0.4743,
          "chrom": -0.4234
        },
        {
          "t": 7.8,
          "r": 0.0316,
          "g": -0.0042,
          "b": -0.0202,
          "pos": -0.2906,
          "chrom": 0.156
        },
        {
          "t": 7.933,
          "r": 0.2398,
          "g": 0.1808,
          "b": 0.1929,
          "pos": -0.8182,
          "chrom": 0.6518
        },
        {
          "t": 8.0,
          "r": 0.2913,
          "g": 0.2441,
          "b": 0.2469,
          "pos": -0.2026,
          "chrom": 0.2342
        },
        {
          "t": 8.133,
          "r": 0.3691,
          "g": 0.3649,
          "b": 0.3844,
          "pos": 0.5584,
          "chrom": -0.3401
        },
        {
          "t": 8.2,
          "r": 0.3963,
          "g": 0.4145,
          "b": 0.4492,
          "pos": 0.4179,
          "chrom": -0.4087
        },
        {
          "t": 8.333,
          "r": 0.3699,
          "g": 0.4291,
          "b": 0.5053,
          "pos": -0.2016,
          "chrom": 0.0209
        },
        {
          "t": 8.4,
          "r": 0.3175,
          "g": 0.3546,
          "b": 0.4125,
          "pos": -0.2834,
          "chrom": 0.2591
        },
        {
          "t": 8.533,
          "r": 0.248,
          "g": 0.3208,
          "b": 0.3932,
          "pos": 0.0769,
          "chrom": -0.0725
        },
        {
          "t": 8.6,
          "r": 0.12,
          "g": 0.1965,
          "b": 0.2749,
          "pos": 0.0435,
          "chrom": 0.0264
        },
        {
          "t": 8.733,
          "r": -0.0386,
          "g": 0.0596,
          "b": 0.1553,
          "pos": -0.0327,
          "chrom": 0.1075
        },
        {
          "t": 8.8,
          "r": -0.0368,
          "g": 0.0841,
          "b": 0.1988,
          "pos": 0.0859,
          "chrom": -0.1897
        },
        {
          "t": 8.933,
          "r": 0.0089,
          "g": 0.1278,
          "b": 0.2441,
          "pos": -0.0167,
          "chrom": -0.0626
        },
        {
          "t": 9.0,
          "r": 0.1695,
          "g": 0.2545,
          "b": 0.3548,
          "pos": -0.1128,
          "chrom": 0.1381
        },
        {
          "t": 9.133,
          "r": 0.2341,
          "g": 0.3249,
          "b": 0.4229,
          "pos": 0.0502,
          "chrom": -0.0098
        },
        {
          "t": 9.2,
          "r": 0.2427,
          "g": 0.3375,
          "b": 0.4408,
          "pos": 0.0915,
          "chrom": -0.0604
        },
        {
          "t": 9.333,
          "r": 0.2772,
          "g": 0.3647,
          "b": 0.4665,
          "pos": -0.0549,
          "chrom": 0.0524
        },
        {
          "t": 9.4,
          "r": 0.2855,
          "g": 0.3762,
          "b": 0.4793,
          "pos": -0.0646,
          "chrom": -0.0313
        },
        {
          "t": 9.533,
          "r": 0.2883,
          "g": 0.3739,
          "b": 0.47,
          "pos": 0.0566,
          "chrom": -0.0957
        },
        {
          "t": 9.6,
          "r": 0.3112,
          "g": 0.3546,
          "b": 0.4276,
          "pos": 0.071,
          "chrom": 0.0432
        },
        {
          "t": 9.733,
          "r": 0.3377,
          "g": 0.382,
          "b": 0.4558,
          "pos": -0.0297,
          "chrom": 0.0635
        },
        {
          "t": 9.8,
          "r": 0.3433,
          "g": 0.3825,
          "b": 0.4555,
          "pos": -0.0853,
          "chrom": 0.0172
        },
        {
          "t": 9.933,
          "r": 0.3325,
          "g": 0.3705,
          "b": 0.4385,
          "pos": -0.0359,
          "chrom": -0.0018
        },
        {
          "t": 10.0,
          "r": 0.3291,
          "g": 0.3579,
          "b": 0.4174,
          "pos": 0.0404,
          "chrom": -0.0623
        },
        {
          "t": 10.133,
          "r": 0.337,
          "g": 0.3661,
          "b": 0.4218,
          "pos": 0.1154,
          "chrom": -0.1233
        },
        {
          "t": 10.2,
          "r": 0.4331,
          "g": 0.4294,
          "b": 0.4673,
          "pos": 0.0509,
          "chrom": -0.0028
        },
        {
          "t": 10.333,
          "r": 0.4514,
          "g": 0.4404,
          "b": 0.4805,
          "pos": -0.1554,
          "chrom": 0.1732
        },
        {
          "t": 10.4,
          "r": 0.4593,
          "g": 0.4541,
          "b": 0.4956,
          "pos": -0.0915,
          "chrom": 0.0472
        },
        {
          "t": 10.533,
          "r": 0.4636,
          "g": 0.4615,
          "b": 0.5019,
          "pos": 0.0939,
          "chrom": -0.1032
        },
        {
          "t": 10.6,
          "r": 0.4521,
          "g": 0.4409,
          "b": 0.4796,
          "pos": 0.0632,
          "chrom": -0.0563
        },
        {
          "t": 10.733,
          "r": 0.4491,
          "g": 0.4415,
          "b": 0.4817,
          "pos": 0.0488,
          "chrom": -0.0485
        },
        {
          "t": 10.8,
          "r": 0.4727,
          "g": 0.444,
          "b": 0.4723,
          "pos": -0.0223,
          "chrom": 0.0124
        },
        {
          "t": 10.933,
          "r": 0.4959,
          "g": 0.4707,
          "b": 0.5015,
          "pos": -0.1177,
          "chrom": 0.0523
        },
        {
          "t": 11.0,
          "r": 0.4981,
          "g": 0.4656,
          "b": 0.4808,
          "pos": -0.0416,
          "chrom": 0.0468
        },
        {
          "t": 11.133,
          "r": 0.489,
          "g": 0.459,
          "b": 0.469,
          "pos": 0.0513,
          "chrom": 0.0328
        },
        {
          "t": 11.2,
          "r": 0.5062,
          "g": 0.488,
          "b": 0.5026,
          "pos": 0.118,
          "chrom": -0.1165
        },
        {
          "t": 11.333,
          "r": 0.5103,
          "g": 0.5005,
          "b": 0.5193,
          "pos": 0.0135,
          "chrom": -0.0641
        },
        {
          "t": 11.4,
          "r": 0.5001,
          "g": 0.467,
          "b": 0.4781,
          "pos": -0.1309,
          "chrom": 0.1186
        },
        {
          "t": 11.533,
          "r": 0.4819,
          "g": 0.4496,
          "b": 0.458,
          "pos": 0.0407,
          "chrom": -0.0506
        },
        {
          "t": 11.6,
          "r": 0.4399,
          "g": 0.4053,
          "b": 0.4117,
          "pos": 0.046,
          "chrom": -0.0766
        },
        {
          "t": 11.733,
          "r": 0.3783,
          "g": 0.3277,
          "b": 0.3319,
          "pos": -0.0711,
          "chrom": 0.0423
        },
        {
          "t": 11.8,
          "r": 0.323,
          "g": 0.2725,
          "b": 0.2718,
          "pos": 0.0373,
          "chrom": -0.0202
        },
        {
          "t": 11.933,
          "r": 0.2029,
          "g": 0.1521,
          "b": 0.1571,
          "pos": 0.0348,
          "chrom": 0.0369
        },
        {
          "t": 12.0,
          "r": 0.198,
          "g": 0.1704,
          "b": 0.1828,
          "pos": 0.0259,
          "chrom": 0.0107
        },
        {
          "t": 12.133,
          "r": 0.2118,
          "g": 0.1982,
          "b": 0.2253,
          "pos": -0.0124,
          "chrom": -0.0393
        },
        {
          "t": 12.2,
          "r": 0.2027,
          "g": 0.1982,
          "b": 0.2315,
          "pos": -0.0756,
          "chrom": 0.0061
        },
        {
          "t": 12.333,
          "r": 0.2032,
          "g": 0.2057,
          "b": 0.248,
          "pos": -0.098,
          "chrom": 0.035
        },
        {
          "t": 12.467,
          "r": 0.1062,
          "g": 0.1195,
          "b": 0.1662,
          "pos": 0.1595,
          "chrom": -0.0739
        },
        {
          "t": 12.533,
          "r": 0.0945,
          "g": 0.1131,
          "b": 0.1598,
          "pos": 0.1562,
          "chrom": -0.0795
        },
        {
          "t": 12.667,
          "r": 0.1526,
          "g": 0.1663,
          "b": 0.2175,
          "pos": 0.0367,
          "chrom": -0.0134
        },
        {
          "t": 12.733,
          "r": 0.1552,
          "g": 0.1755,
          "b": 0.2285,
          "pos": 0.0916,
          "chrom": -0.0939
        },
        {
          "t": 12.867,
          "r": 0.2184,
          "g": 0.2396,
          "b": 0.2938,
          "pos": -0.3915,
          "chrom": 0.2759
        },
        {
          "t": 12.933,
          "r": 0.2351,
          "g": 0.2515,
          "b": 0.3044,
          "pos": -0.3623,
          "chrom": 0.364
        },
        {
          "t": 13.067,
          "r": 0.4475,
          "g": 0.506,
          "b": 0.5446,
          "pos": 0.3315,
          "chrom": -0.439
        },
        {
          "t": 13.133,
          "r": 0.5448,
          "g": 0.6193,
          "b": 0.6685,
          "pos": 0.2749,
          "chrom": -0.4165
        },
        {
          "t": 13.267,
          "r": 0.5469,
          "g": 0.5967,
          "b": 0.6213,
          "pos": 0.0548,
          "chrom": 0.2406
        },
        {
          "t": 13.333,
          "r": 0.5872,
          "g": 0.644,
          "b": 0.6761,
          "pos": -0.0949,
          "chrom": 0.3244
        },
        {
          "t": 13.467,
          "r": 0.5517,
          "g": 0.6429,
          "b": 0.6967,
          "pos": -0.1238,
          "chrom": 0.0772
        },
        {
          "t": 13.533,
          "r": 0.4963,
          "g": 0.6114,
          "b": 0.669,
          "pos": 0.0254,
          "chrom": -0.1823
        },
        {
          "t": 13.667,
          "r": 0.3832,
          "g": 0.5042,
          "b": 0.5651,
          "pos": 0.0202,
          "chrom": -0.4528
        },
        {
          "t": 13.733,
          "r": 0.3111,
          "g": 0.4115,
          "b": 0.4586,
          "pos": -0.0973,
          "chrom": -0.1626
        },
        {
          "t": 13.867,
          "r": 0.2137,
          "g": 0.2611,
          "b": 0.2645,
          "pos": -0.0731,
          "chrom": 0.4941
        },
        {
          "t": 13.933,
          "r": 0.2463,
          "g": 0.2989,
          "b": 0.3029,
          "pos": 0.3034,
          "chrom": 0.2954
        },
        {
          "t": 14.067,
          "r": 0.5267,
          "g": 0.6987,
          "b": 0.7801,
          "pos": 0.1261,
          "chrom": -0.0405
        },
        {
          "t": 14.133,
          "r": 0.4088,
          "g": 0.6939,
          "b": 0.8455,
          "pos": -0.225,
          "chrom": -0.1984
        },
        {
          "t": 14.267,
          "r": -0.3237,
          "g": 0.1475,
          "b": 0.4167,
          "pos": -0.1687,
          "chrom": -0.1986
        },
        {
          "t": 14.333,
          "r": -0.6711,
          "g": -0.1779,
          "b": 0.1008,
          "pos": -0.1762,
          "chrom": 0.1928
        },
        {
          "t": 14.467,
          "r": -0.7733,
          "g": -0.315,
          "b": -0.0508,
          "pos": 0.0309,
          "chrom": 0.0807
        },
        {
          "t": 14.533,
          "r": -0.7852,
          "g": -0.3487,
          "b": -0.0973,
          "pos": 0.1434,
          "chrom": -0.0923
        },
        {
          "t": 14.667,
          "r": 0.0442,
          "g": 0.2388,
          "b": 0.3696,
          "pos": 0.2621,
          "chrom": -0.2442
        },
        {
          "t": 14.733,
          "r": 0.0318,
          "g": 0.1815,
          "b": 0.294,
          "pos": 0.2317,
          "chrom": -0.2625
        },
        {
          "t": 14.867,
          "r": 0.0416,
          "g": 0.089,
          "b": 0.1637,
          "pos": 0.1935,
          "chrom": -0.0906
        },
        {
          "t": 14.933,
          "r": 0.094,
          "g": 0.116,
          "b": 0.177,
          "pos": 0.1494,
          "chrom": 0.0097
        },
        {
          "t": 15.067,
          "r": 0.3028,
          "g": 0.2584,
          "b": 0.2993,
          "pos": -1.4908,
          "chrom": 1.5
        },
        {
          "t": 15.133,
          "r": 0.4095,
          "g": 0.3661,
          "b": 0.4033,
          "pos": -1.2235,
          "chrom": 1.0058
        },
        {
          "t": 15.267,
          "r": 0.3598,
          "g": 0.4624,
          "b": 0.4652,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 15.333,
          "r": 0.0792,
          "g": 0.1598,
          "b": 0.1196,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 15.467,
          "r": -0.5455,
          "g": -0.6315,
          "b": -0.7327,
          "pos": -0.8799,
          "chrom": 1.4255
        },
        {
          "t": 15.533,
          "r": -0.6762,
          "g": -0.7115,
          "b": -0.8093,
          "pos": -0.6421,
          "chrom": 0.886
        },
        {
          "t": 15.667,
          "r": -0.7726,
          "g": -0.7764,
          "b": -0.8728,
          "pos": -0.6156,
          "chrom": 0.3
        },
        {
          "t": 15.733,
          "r": -0.845,
          "g": -0.8275,
          "b": -0.9238,
          "pos": -0.3693,
          "chrom": 0.1282
        },
        {
          "t": 15.867,
          "r": -0.8424,
          "g": -0.7825,
          "b": -0.9063,
          "pos": 0.8719,
          "chrom": -0.7482
        },
        {
          "t": 15.933,
          "r": -0.8974,
          "g": -0.8243,
          "b": -0.9448,
          "pos": 0.4433,
          "chrom": -0.3598
        },
        {
          "t": 16.067,
          "r": -0.966,
          "g": -0.8604,
          "b": -0.9448,
          "pos": -0.3183,
          "chrom": 0.2444
        },
        {
          "t": 16.133,
          "r": -1.0105,
          "g": -0.9015,
          "b": -0.9774,
          "pos": -0.2022,
          "chrom": 0.1892
        },
        {
          "t": 16.267,
          "r": -1.0257,
          "g": -0.9186,
          "b": -0.9876,
          "pos": 0.1874,
          "chrom": -0.1716
        },
        {
          "t": 16.333,
          "r": -1.0375,
          "g": -0.9345,
          "b": -1.0034,
          "pos": 0.2072,
          "chrom": -0.1797
        },
        {
          "t": 16.467,
          "r": -1.0497,
          "g": -0.9944,
          "b": -1.0617,
          "pos": -0.2627,
          "chrom": 0.2702
        },
        {
          "t": 16.533,
          "r": -1.0592,
          "g": -1.0094,
          "b": -1.0721,
          "pos": -0.2772,
          "chrom": 0.214
        },
        {
          "t": 16.667,
          "r": -1.0748,
          "g": -1.0347,
          "b": -1.1041,
          "pos": -0.0235,
          "chrom": -0.0127
        },
        {
          "t": 16.733,
          "r": -1.0639,
          "g": -1.0295,
          "b": -1.1028,
          "pos": 0.0307,
          "chrom": -0.0373
        },
        {
          "t": 16.867,
          "r": -1.0538,
          "g": -1.0318,
          "b": -1.1053,
          "pos": 0.3614,
          "chrom": -0.3445
        },
        {
          "t": 16.933,
          "r": -1.0333,
          "g": -1.0152,
          "b": -1.0833,
          "pos": 0.2821,
          "chrom": -0.2293
        },
        {
          "t": 17.067,
          "r": -0.8255,
          "g": -0.8771,
          "b": -0.9431,
          "pos": -0.216,
          "chrom": 0.2334
        },
        {
          "t": 17.133,
          "r": -0.739,
          "g": -0.809,
          "b": -0.8795,
          "pos": -0.0743,
          "chrom": 0.0872
        },
        {
          "t": 17.267,
          "r": -0.5604,
          "g": -0.6733,
          "b": -0.7432,
          "pos": -0.1751,
          "chrom": 0.1544
        },
        {
          "t": 17.333,
          "r": -0.4796,
          "g": -0.6007,
          "b": -0.6728,
          "pos": -0.3906,
          "chrom": 0.2466
        },
        {
          "t": 17.467,
          "r": -0.3266,
          "g": -0.4468,
          "b": -0.5379,
          "pos": 0.3055,
          "chrom": -0.3491
        },
        {
          "t": 17.533,
          "r": -0.298,
          "g": -0.4204,
          "b": -0.5329,
          "pos": 0.5234,
          "chrom": -0.4412
        },
        {
          "t": 17.667,
          "r": -0.181,
          "g": -0.2814,
          "b": -0.379,
          "pos": -0.118,
          "chrom": 0.1084
        },
        {
          "t": 17.733,
          "r": -0.2074,
          "g": -0.3072,
          "b": -0.4054,
          "pos": -0.2453,
          "chrom": 0.2698
        },
        {
          "t": 17.867,
          "r": -0.5274,
          "g": -0.5458,
          "b": -0.5867,
          "pos": -0.3804,
          "chrom": 0.5916
        },
        {
          "t": 17.933,
          "r": -0.7791,
          "g": -0.7448,
          "b": -0.7479,
          "pos": -0.2794,
          "chrom": 0.3835
        },
        {
          "t": 18.067,
          "r": -1.2529,
          "g": -1.0721,
          "b": -0.9668,
          "pos": 0.9623,
          "chrom": -1.3471
        },
        {
          "t": 18.133,
          "r": -1.3551,
          "g": -1.1657,
          "b": -1.0393,
          "pos": 0.6543,
          "chrom": -0.9449
        },
        {
          "t": 18.267,
          "r": -1.2394,
          "g": -1.2823,
          "b": -1.1953,
          "pos": -0.854,
          "chrom": 1.0697
        },
        {
          "t": 18.333,
          "r": -1.2264,
          "g": -1.2726,
          "b": -1.1851,
          "pos": -0.4406,
          "chrom": 0.6281
        },
        {
          "t": 18.467,
          "r": -1.1215,
          "g": -1.1799,
          "b": -1.0959,
          "pos": 0.4084,
          "chrom": -0.4183
        },
        {
          "t": 18.533,
          "r": -1.0681,
          "g": -1.1338,
          "b": -1.0535,
          "pos": 0.3019,
          "chrom": -0.324
        },
        {
          "t": 18.667,
          "r": -0.963,
          "g": -1.0307,
          "b": -0.9653,
          "pos": -0.6326,
          "chrom": 0.6876
        },
        {
          "t": 18.733,
          "r": -0.8755,
          "g": -0.9533,
          "b": -0.8942,
          "pos": -0.4632,
          "chrom": 0.4471
        },
        {
          "t": 18.867,
          "r": -0.3593,
          "g": -0.3629,
          "b": -0.3394,
          "pos": 0.6644,
          "chrom": -0.8622
        },
        {
          "t": 18.933,
          "r": -0.335,
          "g": -0.3414,
          "b": -0.3274,
          "pos": 0.3881,
          "chrom": -0.4596
        },
        {
          "t": 19.067,
          "r": -0.3252,
          "g": -0.3555,
          "b": -0.3656,
          "pos": -0.0144,
          "chrom": 0.1289
        },
        {
          "t": 19.133,
          "r": -0.3156,
          "g": -0.3598,
          "b": -0.3788,
          "pos": -0.0319,
          "chrom": 0.1257
        },
        {
          "t": 19.267,
          "r": -0.2984,
          "g": -0.366,
          "b": -0.3899,
          "pos": -0.3856,
          "chrom": 0.4615
        },
        {
          "t": 19.333,
          "r": -0.2939,
          "g": -0.3711,
          "b": -0.3974,
          "pos": -0.2669,
          "chrom": 0.2504
        },
        {
          "t": 19.467,
          "r": -0.0964,
          "g": -0.1726,
          "b": -0.2086,
          "pos": 0.2181,
          "chrom": -0.3945
        },
        {
          "t": 19.533,
          "r": -0.1418,
          "g": -0.2207,
          "b": -0.2601,
          "pos": 0.1407,
          "chrom": -0.2478
        },
        {
          "t": 19.667,
          "r": -0.2233,
          "g": -0.3259,
          "b": -0.373,
          "pos": -0.0191,
          "chrom": 0.0477
        },
        {
          "t": 19.733,
          "r": -0.2718,
          "g": -0.3749,
          "b": -0.4211,
          "pos": 0.0947,
          "chrom": -0.0299
        },
        {
          "t": 19.867,
          "r": -0.3395,
          "g": -0.453,
          "b": -0.4999,
          "pos": 0.147,
          "chrom": 0.0548
        },
        {
          "t": 19.933,
          "r": -0.312,
          "g": -0.4315,
          "b": -0.4752,
          "pos": 0.0259,
          "chrom": 0.0468
        },
        {
          "t": 20.067,
          "r": -0.1486,
          "g": -0.259,
          "b": -0.2881,
          "pos": -0.2306,
          "chrom": -0.0243
        },
        {
          "t": 20.133,
          "r": -0.1683,
          "g": -0.274,
          "b": -0.3049,
          "pos": -0.3138,
          "chrom": 0.156
        },
        {
          "t": 20.267,
          "r": -0.1919,
          "g": -0.286,
          "b": -0.3356,
          "pos": -0.0005,
          "chrom": 0.0432
        },
        {
          "t": 20.333,
          "r": -0.1604,
          "g": -0.2357,
          "b": -0.29,
          "pos": 0.3806,
          "chrom": -0.3028
        },
        {
          "t": 20.467,
          "r": -0.1875,
          "g": -0.2391,
          "b": -0.2906,
          "pos": 0.0891,
          "chrom": 0.0251
        },
        {
          "t": 20.533,
          "r": -0.1524,
          "g": -0.1989,
          "b": -0.2457,
          "pos": -0.1986,
          "chrom": 0.21
        },
        {
          "t": 20.667,
          "r": 0.0108,
          "g": -0.0032,
          "b": -0.0385,
          "pos": 0.0938,
          "chrom": -0.184
        },
        {
          "t": 20.733,
          "r": 0.0188,
          "g": 0.0079,
          "b": -0.0246,
          "pos": -0.038,
          "chrom": 0.0051
        },
        {
          "t": 20.867,
          "r": -0.0226,
          "g": -0.0371,
          "b": -0.0593,
          "pos": -0.155,
          "chrom": 0.1982
        },
        {
          "t": 20.933,
          "r": -0.0439,
          "g": -0.0597,
          "b": -0.082,
          "pos": 0.0874,
          "chrom": -0.0427
        },
        {
          "t": 21.067,
          "r": -0.0294,
          "g": -0.0531,
          "b": -0.0717,
          "pos": 0.0352,
          "chrom": -0.2001
        },
        {
          "t": 21.133,
          "r": -0.0692,
          "g": -0.1004,
          "b": -0.1214,
          "pos": 0.0313,
          "chrom": -0.1724
        },
        {
          "t": 21.267,
          "r": -0.2105,
          "g": -0.2834,
          "b": -0.3364,
          "pos": 0.1329,
          "chrom": 0.0691
        },
        {
          "t": 21.333,
          "r": -0.1687,
          "g": -0.2587,
          "b": -0.3165,
          "pos": -0.0859,
          "chrom": 0.2276
        },
        {
          "t": 21.467,
          "r": -0.0009,
          "g": -0.0951,
          "b": -0.1599,
          "pos": -0.2729,
          "chrom": 0.1918
        },
        {
          "t": 21.533,
          "r": 0.0029,
          "g": -0.0976,
          "b": -0.1677,
          "pos": -0.0776,
          "chrom": 0.1
        },
        {
          "t": 21.667,
          "r": 0.0085,
          "g": -0.082,
          "b": -0.1547,
          "pos": 0.2624,
          "chrom": -0.2996
        },
        {
          "t": 21.733,
          "r": 0.0218,
          "g": -0.0618,
          "b": -0.1345,
          "pos": 0.1938,
          "chrom": -0.394
        },
        {
          "t": 21.867,
          "r": -0.0854,
          "g": -0.2043,
          "b": -0.2826,
          "pos": -0.0152,
          "chrom": -0.0834
        },
        {
          "t": 21.933,
          "r": -0.141,
          "g": -0.2743,
          "b": -0.3538,
          "pos": 0.1021,
          "chrom": -0.0377
        },
        {
          "t": 22.067,
          "r": -0.2924,
          "g": -0.4369,
          "b": -0.5099,
          "pos": -0.2652,
          "chrom": 0.5624
        },
        {
          "t": 22.133,
          "r": -0.4821,
          "g": -0.5845,
          "b": -0.6235,
          "pos": -0.3944,
          "chrom": 0.5745
        },
        {
          "t": 22.267,
          "r": -0.7284,
          "g": -0.6575,
          "b": -0.6091,
          "pos": 0.1548,
          "chrom": -0.424
        },
        {
          "t": 22.333,
          "r": -0.8318,
          "g": -0.7099,
          "b": -0.639,
          "pos": 0.1572,
          "chrom": -0.3919
        },
        {
          "t": 22.467,
          "r": -0.7322,
          "g": -0.5857,
          "b": -0.512,
          "pos": 0.219,
          "chrom": -0.1621
        },
        {
          "t": 22.533,
          "r": -0.8048,
          "g": -0.6353,
          "b": -0.5521,
          "pos": 0.1774,
          "chrom": -0.1018
        },
        {
          "t": 22.667,
          "r": -0.7955,
          "g": -0.6212,
          "b": -0.5217,
          "pos": -0.3292,
          "chrom": 0.3677
        },
        {
          "t": 22.733,
          "r": -0.8031,
          "g": -0.6219,
          "b": -0.5253,
          "pos": -0.2563,
          "chrom": 0.2997
        },
        {
          "t": 22.867,
          "r": -0.8215,
          "g": -0.6154,
          "b": -0.5044,
          "pos": 0.2036,
          "chrom": -0.2729
        },
        {
          "t": 22.933,
          "r": -0.815,
          "g": -0.6051,
          "b": -0.4927,
          "pos": 0.3158,
          "chrom": -0.3779
        },
        {
          "t": 23.067,
          "r": -0.6128,
          "g": -0.4611,
          "b": -0.3627,
          "pos": -0.0594,
          "chrom": 0.1059
        },
        {
          "t": 23.133,
          "r": -0.6531,
          "g": -0.5087,
          "b": -0.4035,
          "pos": -0.3541,
          "chrom": 0.3843
        },
        {
          "t": 23.267,
          "r": -0.7181,
          "g": -0.56,
          "b": -0.4373,
          "pos": -0.1692,
          "chrom": 0.1565
        },
        {
          "t": 23.333,
          "r": -0.757,
          "g": -0.5813,
          "b": -0.4515,
          "pos": 0.1748,
          "chrom": -0.209
        },
        {
          "t": 23.467,
          "r": -0.7622,
          "g": -0.6011,
          "b": -0.4694,
          "pos": 0.3974,
          "chrom": -0.458
        },
        {
          "t": 23.533,
          "r": -0.7341,
          "g": -0.5941,
          "b": -0.4638,
          "pos": 0.201,
          "chrom": -0.2108
        },
        {
          "t": 23.667,
          "r": -0.4985,
          "g": -0.4433,
          "b": -0.3376,
          "pos": -0.3733,
          "chrom": 0.4288
        },
        {
          "t": 23.733,
          "r": -0.4644,
          "g": -0.4313,
          "b": -0.3278,
          "pos": -0.3778,
          "chrom": 0.3872
        },
        {
          "t": 23.867,
          "r": -0.3803,
          "g": -0.3509,
          "b": -0.252,
          "pos": -0.0204,
          "chrom": 0.0352
        },
        {
          "t": 23.933,
          "r": -0.3515,
          "g": -0.3326,
          "b": -0.2384,
          "pos": 0.0438,
          "chrom": -0.0121
        },
        {
          "t": 24.067,
          "r": -0.2336,
          "g": -0.2207,
          "b": -0.1298,
          "pos": 0.4249,
          "chrom": -0.5057
        },
        {
          "t": 24.133,
          "r": -0.2022,
          "g": -0.1894,
          "b": -0.099,
          "pos": 0.3511,
          "chrom": -0.4089
        },
        {
          "t": 24.267,
          "r": -0.1421,
          "g": -0.1839,
          "b": -0.1065,
          "pos": -0.1774,
          "chrom": 0.1821
        },
        {
          "t": 24.333,
          "r": -0.1055,
          "g": -0.1455,
          "b": -0.0688,
          "pos": -0.1833,
          "chrom": 0.1299
        },
        {
          "t": 24.467,
          "r": -0.0833,
          "g": -0.126,
          "b": -0.0512,
          "pos": -0.5497,
          "chrom": 0.6595
        },
        {
          "t": 24.533,
          "r": -0.0274,
          "g": -0.0445,
          "b": 0.0337,
          "pos": -0.3124,
          "chrom": 0.4186
        },
        {
          "t": 24.667,
          "r": 0.1227,
          "g": 0.2466,
          "b": 0.3635,
          "pos": 0.8048,
          "chrom": -0.9936
        },
        {
          "t": 24.733,
          "r": -0.007,
          "g": 0.1651,
          "b": 0.3164,
          "pos": 0.5465,
          "chrom": -0.568
        },
        {
          "t": 24.867,
          "r": -0.1359,
          "g": 0.0707,
          "b": 0.2535,
          "pos": -0.4585,
          "chrom": 0.5891
        },
        {
          "t": 25.0,
          "r": -0.1555,
          "g": 0.1184,
          "b": 0.3189,
          "pos": 0.032,
          "chrom": -0.0577
        },
        {
          "t": 25.067,
          "r": -0.1623,
          "g": 0.0982,
          "b": 0.2922,
          "pos": 0.1377,
          "chrom": -0.0342
        },
        {
          "t": 25.2,
          "r": -0.0981,
          "g": 0.1379,
          "b": 0.314,
          "pos": -0.2406,
          "chrom": -0.1021
        },
        {
          "t": 25.267,
          "r": -0.0771,
          "g": 0.1353,
          "b": 0.2939,
          "pos": -0.2086,
          "chrom": -0.3309
        },
        {
          "t": 25.4,
          "r": 0.3231,
          "g": 0.3087,
          "b": 0.2993,
          "pos": 0.3369,
          "chrom": 0.0518
        },
        {
          "t": 25.467,
          "r": 0.2577,
          "g": 0.2322,
          "b": 0.2151,
          "pos": 0.3289,
          "chrom": 0.2994
        },
        {
          "t": 25.6,
          "r": 0.2787,
          "g": 0.2471,
          "b": 0.2346,
          "pos": -0.0754,
          "chrom": 0.137
        },
        {
          "t": 25.667,
          "r": 0.3682,
          "g": 0.3516,
          "b": 0.3429,
          "pos": 0.0241,
          "chrom": -0.1172
        },
        {
          "t": 25.8,
          "r": 0.5067,
          "g": 0.5029,
          "b": 0.5065,
          "pos": -0.3237,
          "chrom": -0.1554
        },
        {
          "t": 25.867,
          "r": 0.528,
          "g": 0.5261,
          "b": 0.5297,
          "pos": -0.5291,
          "chrom": 0.0207
        },
        {
          "t": 26.0,
          "r": 0.303,
          "g": 0.2852,
          "b": 0.2395,
          "pos": 0.3477,
          "chrom": -0.0204
        },
        {
          "t": 26.067,
          "r": 0.3198,
          "g": 0.3156,
          "b": 0.275,
          "pos": 0.4514,
          "chrom": -0.0575
        },
        {
          "t": 26.2,
          "r": 0.4875,
          "g": 0.5211,
          "b": 0.5082,
          "pos": 0.0686,
          "chrom": 0.0211
        },
        {
          "t": 26.267,
          "r": 0.5128,
          "g": 0.5462,
          "b": 0.5382,
          "pos": 0.0208,
          "chrom": 0.1493
        },
        {
          "t": 26.4,
          "r": 0.7621,
          "g": 0.8447,
          "b": 0.8845,
          "pos": -0.3135,
          "chrom": 0.2069
        },
        {
          "t": 26.467,
          "r": 0.8689,
          "g": 0.9835,
          "b": 1.0415,
          "pos": -0.1164,
          "chrom": -0.3243
        },
        {
          "t": 26.6,
          "r": 0.9104,
          "g": 1.0553,
          "b": 1.1288,
          "pos": 0.1224,
          "chrom": -0.3483
        },
        {
          "t": 26.667,
          "r": 0.6436,
          "g": 0.7045,
          "b": 0.7361,
          "pos": -0.0878,
          "chrom": 0.336
        },
        {
          "t": 26.8,
          "r": 0.679,
          "g": 0.7536,
          "b": 0.7885,
          "pos": -0.0252,
          "chrom": 0.2297
        },
        {
          "t": 26.867,
          "r": 0.6749,
          "g": 0.7471,
          "b": 0.7797,
          "pos": -0.0598,
          "chrom": 0.1661
        },
        {
          "t": 27.0,
          "r": 0.6845,
          "g": 0.7716,
          "b": 0.7976,
          "pos": 0.3375,
          "chrom": -0.3028
        },
        {
          "t": 27.067,
          "r": 0.7278,
          "g": 0.8315,
          "b": 0.8826,
          "pos": 0.4534,
          "chrom": -0.7644
        },
        {
          "t": 27.2,
          "r": 0.6366,
          "g": 0.7083,
          "b": 0.754,
          "pos": -0.5032,
          "chrom": 0.3646
        },
        {
          "t": 27.267,
          "r": 0.3176,
          "g": 0.315,
          "b": 0.3318,
          "pos": -0.5379,
          "chrom": 0.764
        },
        {
          "t": 27.4,
          "r": -0.2534,
          "g": -0.1114,
          "b": -0.0376,
          "pos": 0.1314,
          "chrom": -0.0567
        },
        {
          "t": 27.467,
          "r": -0.6478,
          "g": -0.5179,
          "b": -0.428,
          "pos": 0.1489,
          "chrom": -0.303
        },
        {
          "t": 27.6,
          "r": -1.1486,
          "g": -0.9474,
          "b": -0.8274,
          "pos": 0.3974,
          "chrom": -0.4518
        },
        {
          "t": 27.667,
          "r": -1.2441,
          "g": -1.0673,
          "b": -0.9581,
          "pos": 0.2877,
          "chrom": -0.0956
        },
        {
          "t": 27.8,
          "r": -1.0344,
          "g": -0.901,
          "b": -0.7961,
          "pos": -0.4305,
          "chrom": 0.4879
        },
        {
          "t": 27.867,
          "r": -0.2457,
          "g": -0.1643,
          "b": -0.0935,
          "pos": -0.3701,
          "chrom": 0.2195
        },
        {
          "t": 28.0,
          "r": -0.1916,
          "g": -0.0974,
          "b": -0.0309,
          "pos": 0.0219,
          "chrom": -0.1094
        },
        {
          "t": 28.067,
          "r": -0.1993,
          "g": -0.087,
          "b": -0.0261,
          "pos": 0.1581,
          "chrom": -0.1492
        },
        {
          "t": 28.2,
          "r": -0.1427,
          "g": -0.0296,
          "b": 0.0208,
          "pos": 0.206,
          "chrom": -0.1599
        },
        {
          "t": 28.267,
          "r": -0.0944,
          "g": 0.0126,
          "b": 0.0621,
          "pos": -0.0291,
          "chrom": 0.0211
        },
        {
          "t": 28.4,
          "r": -0.0303,
          "g": 0.0779,
          "b": 0.1206,
          "pos": -0.0746,
          "chrom": 0.0284
        },
        {
          "t": 28.467,
          "r": 0.1802,
          "g": 0.2622,
          "b": 0.2813,
          "pos": 0.1114,
          "chrom": -0.0905
        },
        {
          "t": 28.6,
          "r": 0.1508,
          "g": 0.2381,
          "b": 0.2589,
          "pos": -0.0551,
          "chrom": 0.1438
        },
        {
          "t": 28.667,
          "r": 0.1357,
          "g": 0.2289,
          "b": 0.259,
          "pos": -0.2528,
          "chrom": 0.3168
        },
        {
          "t": 28.8,
          "r": 0.1359,
          "g": 0.2688,
          "b": 0.3092,
          "pos": 0.0154,
          "chrom": -0.0723
        },
        {
          "t": 28.867,
          "r": 0.1654,
          "g": 0.313,
          "b": 0.3565,
          "pos": 0.2507,
          "chrom": -0.4351
        },
        {
          "t": 29.0,
          "r": 0.1077,
          "g": 0.2424,
          "b": 0.2806,
          "pos": 0.014,
          "chrom": -0.1457
        },
        {
          "t": 29.067,
          "r": 0.0027,
          "g": 0.1032,
          "b": 0.1216,
          "pos": -0.1569,
          "chrom": 0.2772
        },
        {
          "t": 29.2,
          "r": -0.0321,
          "g": 0.0568,
          "b": 0.0657,
          "pos": 0.032,
          "chrom": 0.1799
        },
        {
          "t": 29.267,
          "r": 0.0092,
          "g": 0.0983,
          "b": 0.1149,
          "pos": 0.088,
          "chrom": -0.0319
        },
        {
          "t": 29.4,
          "r": 0.1427,
          "g": 0.231,
          "b": 0.2539,
          "pos": 0.0468,
          "chrom": -0.1425
        },
        {
          "t": 29.467,
          "r": 0.2206,
          "g": 0.3014,
          "b": 0.3263,
          "pos": -0.1027,
          "chrom": -0.0862
        },
        {
          "t": 29.6,
          "r": 0.2583,
          "g": 0.3314,
          "b": 0.3604,
          "pos": -0.1772,
          "chrom": 0.0747
        },
        {
          "t": 29.667,
          "r": 0.0884,
          "g": 0.1568,
          "b": 0.1703,
          "pos": 0.0752,
          "chrom": 0.0671
        },
        {
          "t": 29.8,
          "r": 0.1155,
          "g": 0.1804,
          "b": 0.1962,
          "pos": 0.2144,
          "chrom": -0.0634
        },
        {
          "t": 29.867,
          "r": 0.1142,
          "g": 0.1804,
          "b": 0.1965,
          "pos": 0.1121,
          "chrom": -0.1159
        },
        {
          "t": 30.0,
          "r": 0.1021,
          "g": 0.1387,
          "b": 0.1511,
          "pos": -0.198,
          "chrom": 0.1417
        },
        {
          "t": 30.067,
          "r": 0.07,
          "g": 0.0973,
          "b": 0.1067,
          "pos": -0.1936,
          "chrom": 0.044
        },
        {
          "t": 30.2,
          "r": 0.0352,
          "g": 0.0569,
          "b": 0.0568,
          "pos": 0.0911,
          "chrom": -0.2087
        },
        {
          "t": 30.267,
          "r": -0.2121,
          "g": -0.2391,
          "b": -0.2724,
          "pos": 0.121,
          "chrom": 0.0535
        },
        {
          "t": 30.4,
          "r": -0.2229,
          "g": -0.257,
          "b": -0.2959,
          "pos": 0.0053,
          "chrom": 0.157
        },
        {
          "t": 30.467,
          "r": -0.2205,
          "g": -0.2569,
          "b": -0.2955,
          "pos": -0.1266,
          "chrom": 0.0892
        },
        {
          "t": 30.6,
          "r": -0.2215,
          "g": -0.2546,
          "b": -0.3013,
          "pos": -0.0108,
          "chrom": -0.0746
        },
        {
          "t": 30.667,
          "r": -0.2222,
          "g": -0.2612,
          "b": -0.3167,
          "pos": 0.1538,
          "chrom": -0.3084
        },
        {
          "t": 30.8,
          "r": -0.241,
          "g": -0.2965,
          "b": -0.3642,
          "pos": -0.0065,
          "chrom": -0.0512
        },
        {
          "t": 30.867,
          "r": -0.3208,
          "g": -0.4407,
          "b": -0.5429,
          "pos": -0.1102,
          "chrom": 0.2691
        },
        {
          "t": 31.0,
          "r": -0.3147,
          "g": -0.4203,
          "b": -0.52,
          "pos": 0.0236,
          "chrom": 0.0742
        },
        {
          "t": 31.067,
          "r": -0.3071,
          "g": -0.4179,
          "b": -0.5204,
          "pos": 0.0598,
          "chrom": -0.0502
        },
        {
          "t": 31.2,
          "r": -0.2765,
          "g": -0.3821,
          "b": -0.4804,
          "pos": -0.0071,
          "chrom": -0.0789
        },
        {
          "t": 31.267,
          "r": -0.2639,
          "g": -0.3679,
          "b": -0.4643,
          "pos": -0.0549,
          "chrom": -0.0582
        },
        {
          "t": 31.4,
          "r": -0.2751,
          "g": -0.3913,
          "b": -0.4956,
          "pos": -0.0421,
          "chrom": 0.0235
        },
        {
          "t": 31.467,
          "r": -0.2743,
          "g": -0.3903,
          "b": -0.4963,
          "pos": 0.0039,
          "chrom": -0.0164
        },
        {
          "t": 31.6,
          "r": -0.3181,
          "g": -0.4449,
          "b": -0.5543,
          "pos": 0.0218,
          "chrom": 0.0484
        },
        {
          "t": 31.667,
          "r": -0.3134,
          "g": -0.4385,
          "b": -0.5493,
          "pos": 0.1098,
          "chrom": -0.0265
        },
        {
          "t": 31.8,
          "r": -0.3251,
          "g": -0.4336,
          "b": -0.5323,
          "pos": 0.1803,
          "chrom": -0.1628
        },
        {
          "t": 31.867,
          "r": -0.3386,
          "g": -0.4496,
          "b": -0.5427,
          "pos": -0.0595,
          "chrom": 0.0315
        },
        {
          "t": 32.0,
          "r": -0.308,
          "g": -0.402,
          "b": -0.4762,
          "pos": -0.428,
          "chrom": 0.3011
        },
        {
          "t": 32.067,
          "r": -0.2871,
          "g": -0.3845,
          "b": -0.4614,
          "pos": -0.24,
          "chrom": 0.1816
        },
        {
          "t": 32.2,
          "r": -0.1408,
          "g": -0.2187,
          "b": -0.2925,
          "pos": 0.3599,
          "chrom": -0.3416
        },
        {
          "t": 32.267,
          "r": -0.1119,
          "g": -0.2005,
          "b": -0.2827,
          "pos": 0.4444,
          "chrom": -0.3405
        },
        {
          "t": 32.4,
          "r": -0.2117,
          "g": -0.3038,
          "b": -0.3521,
          "pos": -0.0223,
          "chrom": 0.1248
        },
        {
          "t": 32.467,
          "r": -0.3112,
          "g": -0.366,
          "b": -0.3778,
          "pos": -0.2399,
          "chrom": 0.1451
        },
        {
          "t": 32.6,
          "r": -0.6095,
          "g": -0.626,
          "b": -0.5923,
          "pos": -0.141,
          "chrom": 0.0103
        },
        {
          "t": 32.667,
          "r": -0.8493,
          "g": -0.8269,
          "b": -0.7735,
          "pos": -0.0742,
          "chrom": 0.0073
        },
        {
          "t": 32.8,
          "r": -0.9301,
          "g": -0.903,
          "b": -0.8476,
          "pos": 0.0105,
          "chrom": 0.0733
        },
        {
          "t": 32.867,
          "r": -1.0965,
          "g": -1.0458,
          "b": -0.9797,
          "pos": 0.0976,
          "chrom": 0.0628
        },
        {
          "t": 33.0,
          "r": -1.1944,
          "g": -1.0901,
          "b": -1.0048,
          "pos": 0.0631,
          "chrom": -0.0995
        },
        {
          "t": 33.067,
          "r": -1.233,
          "g": -1.105,
          "b": -1.017,
          "pos": 0.0416,
          "chrom": -0.1581
        },
        {
          "t": 33.2,
          "r": -1.18,
          "g": -1.0623,
          "b": -0.9915,
          "pos": 0.0043,
          "chrom": -0.0382
        },
        {
          "t": 33.267,
          "r": -1.1494,
          "g": -1.0452,
          "b": -0.985,
          "pos": -0.0624,
          "chrom": 0.085
        },
        {
          "t": 33.4,
          "r": -0.7992,
          "g": -0.7569,
          "b": -0.7371,
          "pos": -0.0656,
          "chrom": 0.1115
        },
        {
          "t": 33.467,
          "r": -0.6872,
          "g": -0.658,
          "b": -0.6472,
          "pos": -0.0189,
          "chrom": 0.0181
        },
        {
          "t": 33.6,
          "r": -0.6219,
          "g": -0.6057,
          "b": -0.5999,
          "pos": 0.0545,
          "chrom": -0.1223
        },
        {
          "t": 33.667,
          "r": -0.6598,
          "g": -0.6394,
          "b": -0.6307,
          "pos": 0.052,
          "chrom": -0.102
        },
        {
          "t": 33.8,
          "r": -0.8003,
          "g": -0.765,
          "b": -0.7419,
          "pos": 0.0217,
          "chrom": 0.0577
        },
        {
          "t": 33.867,
          "r": -0.9008,
          "g": -0.8335,
          "b": -0.795,
          "pos": 0.039,
          "chrom": 0.0351
        },
        {
          "t": 34.0,
          "r": -0.7135,
          "g": -0.6142,
          "b": -0.5535,
          "pos": -0.0923,
          "chrom": 0.0298
        },
        {
          "t": 34.067,
          "r": -0.7247,
          "g": -0.6077,
          "b": -0.5356,
          "pos": -0.2018,
          "chrom": 0.1552
        },
        {
          "t": 34.2,
          "r": -0.6133,
          "g": -0.4566,
          "b": -0.3711,
          "pos": 0.0455,
          "chrom": -0.0179
        },
        {
          "t": 34.267,
          "r": -0.5763,
          "g": -0.3925,
          "b": -0.2966,
          "pos": 0.2367,
          "chrom": -0.2357
        },
        {
          "t": 34.4,
          "r": -0.672,
          "g": -0.4351,
          "b": -0.2994,
          "pos": 0.0393,
          "chrom": -0.1466
        },
        {
          "t": 34.467,
          "r": -0.7446,
          "g": -0.497,
          "b": -0.3503,
          "pos": -0.0749,
          "chrom": 0.0114
        },
        {
          "t": 34.6,
          "r": -0.6002,
          "g": -0.3666,
          "b": -0.2261,
          "pos": 0.0076,
          "chrom": 0.1478
        },
        {
          "t": 34.667,
          "r": -0.6717,
          "g": -0.4058,
          "b": -0.24,
          "pos": -0.0069,
          "chrom": 0.1395
        },
        {
          "t": 34.8,
          "r": -0.8612,
          "g": -0.5332,
          "b": -0.3229,
          "pos": -0.1838,
          "chrom": 0.1088
        },
        {
          "t": 34.867,
          "r": -0.9874,
          "g": -0.6274,
          "b": -0.3965,
          "pos": -0.2082,
          "chrom": 0.1351
        },
        {
          "t": 35.0,
          "r": -1.1476,
          "g": -0.738,
          "b": -0.4932,
          "pos": 0.3209,
          "chrom": -0.4425
        },
        {
          "t": 35.067,
          "r": -1.1897,
          "g": -0.7627,
          "b": -0.5104,
          "pos": 0.4632,
          "chrom": -0.6517
        },
        {
          "t": 35.2,
          "r": -0.8779,
          "g": -0.5877,
          "b": -0.4044,
          "pos": -0.2739,
          "chrom": 0.4684
        },
        {
          "t": 35.267,
          "r": -0.8753,
          "g": -0.5783,
          "b": -0.3922,
          "pos": -0.3683,
          "chrom": 0.6657
        },
        {
          "t": 35.4,
          "r": -0.8715,
          "g": -0.5402,
          "b": -0.3458,
          "pos": 0.0352,
          "chrom": -0.0714
        },
        {
          "t": 35.467,
          "r": -0.913,
          "g": -0.5722,
          "b": -0.3695,
          "pos": -0.0103,
          "chrom": -0.0926
        },
        {
          "t": 35.6,
          "r": -0.9415,
          "g": -0.5852,
          "b": -0.3789,
          "pos": 0.1555,
          "chrom": -0.3559
        },
        {
          "t": 35.667,
          "r": -0.947,
          "g": -0.5915,
          "b": -0.3848,
          "pos": 0.2011,
          "chrom": -0.452
        },
        {
          "t": 35.8,
          "r": -0.6478,
          "g": -0.4148,
          "b": -0.2706,
          "pos": -0.0656,
          "chrom": 0.3016
        },
        {
          "t": 35.867,
          "r": -0.6444,
          "g": -0.4053,
          "b": -0.2605,
          "pos": -0.0487,
          "chrom": 0.4224
        },
        {
          "t": 36.0,
          "r": -0.6179,
          "g": -0.3535,
          "b": -0.1789,
          "pos": -0.1248,
          "chrom": 0.0567
        },
        {
          "t": 36.067,
          "r": -0.6468,
          "g": -0.3663,
          "b": -0.1804,
          "pos": -0.1138,
          "chrom": -0.0082
        },
        {
          "t": 36.2,
          "r": -0.7019,
          "g": -0.4208,
          "b": -0.2342,
          "pos": 0.1084,
          "chrom": -0.2729
        },
        {
          "t": 36.267,
          "r": -0.6696,
          "g": -0.3934,
          "b": -0.2077,
          "pos": 0.0776,
          "chrom": -0.343
        },
        {
          "t": 36.4,
          "r": -0.2485,
          "g": -0.132,
          "b": -0.0418,
          "pos": 0.0312,
          "chrom": 0.1676
        },
        {
          "t": 36.467,
          "r": -0.2173,
          "g": -0.1088,
          "b": -0.0233,
          "pos": 0.0841,
          "chrom": 0.2131
        },
        {
          "t": 36.6,
          "r": -0.1856,
          "g": -0.1008,
          "b": -0.0214,
          "pos": -0.1146,
          "chrom": 0.067
        },
        {
          "t": 36.667,
          "r": -0.1996,
          "g": -0.1257,
          "b": -0.0499,
          "pos": -0.1856,
          "chrom": 0.1274
        },
        {
          "t": 36.8,
          "r": -0.1933,
          "g": -0.1283,
          "b": -0.0637,
          "pos": 0.0171,
          "chrom": -0.0966
        },
        {
          "t": 36.867,
          "r": -0.1808,
          "g": -0.1223,
          "b": -0.0594,
          "pos": 0.0986,
          "chrom": -0.2292
        },
        {
          "t": 37.0,
          "r": 0.0406,
          "g": 0.0501,
          "b": 0.0751,
          "pos": 0.2085,
          "chrom": -0.1552
        },
        {
          "t": 37.067,
          "r": 0.0459,
          "g": 0.046,
          "b": 0.0725,
          "pos": 0.0654,
          "chrom": 0.0281
        },
        {
          "t": 37.2,
          "r": 0.0306,
          "g": 0.0337,
          "b": 0.0685,
          "pos": -0.3055,
          "chrom": 0.2789
        },
        {
          "t": 37.333,
          "r": 0.0411,
          "g": 0.055,
          "b": 0.0896,
          "pos": -0.0962,
          "chrom": 0.2196
        },
        {
          "t": 37.4,
          "r": 0.0873,
          "g": 0.1142,
          "b": 0.1547,
          "pos": 0.1808,
          "chrom": -0.1876
        },
        {
          "t": 37.533,
          "r": 0.2338,
          "g": 0.3051,
          "b": 0.3694,
          "pos": 0.3641,
          "chrom": -0.5746
        },
        {
          "t": 37.6,
          "r": 0.4606,
          "g": 0.4627,
          "b": 0.4869,
          "pos": 0.1333,
          "chrom": -0.0955
        },
        {
          "t": 37.733,
          "r": 0.3208,
          "g": 0.3395,
          "b": 0.3818,
          "pos": -0.3044,
          "chrom": 0.4332
        },
        {
          "t": 37.8,
          "r": 0.2855,
          "g": 0.3396,
          "b": 0.3996,
          "pos": -0.3891,
          "chrom": 0.3545
        },
        {
          "t": 37.933,
          "r": 0.3304,
          "g": 0.4002,
          "b": 0.4511,
          "pos": -0.0268,
          "chrom": 0.0065
        },
        {
          "t": 38.0,
          "r": 0.363,
          "g": 0.4508,
          "b": 0.49,
          "pos": 0.2496,
          "chrom": -0.2939
        },
        {
          "t": 38.133,
          "r": 0.4569,
          "g": 0.5217,
          "b": 0.5469,
          "pos": 0.2295,
          "chrom": -0.3136
        },
        {
          "t": 38.2,
          "r": 0.5284,
          "g": 0.5526,
          "b": 0.5443,
          "pos": 0.0937,
          "chrom": -0.0424
        },
        {
          "t": 38.333,
          "r": 0.4878,
          "g": 0.4711,
          "b": 0.4546,
          "pos": -0.1157,
          "chrom": 0.1969
        },
        {
          "t": 38.4,
          "r": 0.4862,
          "g": 0.4601,
          "b": 0.4411,
          "pos": -0.1087,
          "chrom": 0.1251
        },
        {
          "t": 38.533,
          "r": 0.4675,
          "g": 0.4198,
          "b": 0.3937,
          "pos": -0.0096,
          "chrom": 0.0346
        },
        {
          "t": 38.6,
          "r": 0.4559,
          "g": 0.4085,
          "b": 0.3823,
          "pos": -0.0451,
          "chrom": -0.0568
        },
        {
          "t": 38.733,
          "r": 0.4331,
          "g": 0.3948,
          "b": 0.3741,
          "pos": -0.1309,
          "chrom": -0.0474
        },
        {
          "t": 38.8,
          "r": 0.2259,
          "g": 0.1731,
          "b": 0.1292,
          "pos": -0.0011,
          "chrom": 0.1111
        },
        {
          "t": 38.933,
          "r": 0.1521,
          "g": 0.1243,
          "b": 0.0852,
          "pos": 0.1649,
          "chrom": -0.0329
        },
        {
          "t": 39.0,
          "r": 0.1515,
          "g": 0.1496,
          "b": 0.1223,
          "pos": 0.1461,
          "chrom": -0.2209
        },
        {
          "t": 39.133,
          "r": 0.0933,
          "g": 0.0863,
          "b": 0.0588,
          "pos": 0.0816,
          "chrom": -0.0143
        },
        {
          "t": 39.2,
          "r": 0.088,
          "g": 0.0721,
          "b": 0.0463,
          "pos": -0.1642,
          "chrom": 0.1403
        },
        {
          "t": 39.333,
          "r": 0.1801,
          "g": 0.1806,
          "b": 0.1748,
          "pos": -0.2125,
          "chrom": 0.0005
        },
        {
          "t": 39.4,
          "r": 0.0708,
          "g": 0.0374,
          "b": -0.0035,
          "pos": 0.0688,
          "chrom": 0.0124
        },
        {
          "t": 39.533,
          "r": 0.1127,
          "g": 0.0782,
          "b": 0.0387,
          "pos": 0.0672,
          "chrom": 0.0677
        },
        {
          "t": 39.6,
          "r": 0.1402,
          "g": 0.1107,
          "b": 0.0747,
          "pos": 0.0849,
          "chrom": -0.125
        },
        {
          "t": 39.733,
          "r": 0.1793,
          "g": 0.1449,
          "b": 0.1047,
          "pos": 0.0102,
          "chrom": 0.0002
        },
        {
          "t": 39.8,
          "r": 0.1821,
          "g": 0.1409,
          "b": 0.0981,
          "pos": -0.2159,
          "chrom": 0.1572
        },
        {
          "t": 39.933,
          "r": 0.2828,
          "g": 0.2697,
          "b": 0.2402,
          "pos": 0.0769,
          "chrom": -0.269
        },
        {
          "t": 40.0,
          "r": 0.2528,
          "g": 0.2122,
          "b": 0.1543,
          "pos": 0.1691,
          "chrom": -0.0948
        },
        {
          "t": 40.133,
          "r": 0.2722,
          "g": 0.2182,
          "b": 0.1607,
          "pos": -0.0394,
          "chrom": 0.2913
        },
        {
          "t": 40.2,
          "r": 0.3439,
          "g": 0.3197,
          "b": 0.2807,
          "pos": -0.0107,
          "chrom": 0.0488
        },
        {
          "t": 40.333,
          "r": 0.4097,
          "g": 0.4198,
          "b": 0.3994,
          "pos": -0.0511,
          "chrom": -0.1183
        },
        {
          "t": 40.4,
          "r": 0.4305,
          "g": 0.4677,
          "b": 0.4565,
          "pos": 0.1563,
          "chrom": -0.4104
        },
        {
          "t": 40.533,
          "r": 0.4104,
          "g": 0.4623,
          "b": 0.4569,
          "pos": -0.1304,
          "chrom": 0.094
        },
        {
          "t": 40.6,
          "r": 0.3371,
          "g": 0.337,
          "b": 0.3174,
          "pos": -0.5709,
          "chrom": 0.8003
        },
        {
          "t": 40.733,
          "r": 0.4546,
          "g": 0.5345,
          "b": 0.544,
          "pos": 0.1245,
          "chrom": 0.0783
        },
        {
          "t": 40.8,
          "r": 0.516,
          "g": 0.6406,
          "b": 0.6732,
          "pos": 0.5992,
          "chrom": -0.5351
        },
        {
          "t": 40.933,
          "r": 0.5975,
          "g": 0.7911,
          "b": 0.872,
          "pos": 0.4973,
          "chrom": -0.743
        },
        {
          "t": 41.0,
          "r": 0.5299,
          "g": 0.7267,
          "b": 0.8221,
          "pos": 0.0977,
          "chrom": -0.3121
        },
        {
          "t": 41.133,
          "r": 0.2414,
          "g": 0.4086,
          "b": 0.4848,
          "pos": -0.8398,
          "chrom": 0.9281
        },
        {
          "t": 41.2,
          "r": 0.2744,
          "g": 0.4475,
          "b": 0.52,
          "pos": -0.8532,
          "chrom": 0.9285
        },
        {
          "t": 41.333,
          "r": -0.022,
          "g": 0.1666,
          "b": 0.1897,
          "pos": -0.034,
          "chrom": 0.0461
        },
        {
          "t": 41.4,
          "r": -0.1484,
          "g": 0.0404,
          "b": 0.0351,
          "pos": 0.4638,
          "chrom": -0.6016
        },
        {
          "t": 41.533,
          "r": -0.5581,
          "g": -0.4281,
          "b": -0.4913,
          "pos": 1.2108,
          "chrom": -1.1363
        },
        {
          "t": 41.6,
          "r": -0.8253,
          "g": -0.7982,
          "b": -0.9017,
          "pos": 0.6545,
          "chrom": -0.348
        },
        {
          "t": 41.733,
          "r": -0.9603,
          "g": -1.0296,
          "b": -1.116,
          "pos": -0.8743,
          "chrom": 0.6973
        },
        {
          "t": 41.8,
          "r": -0.8994,
          "g": -0.9859,
          "b": -1.0745,
          "pos": -0.8592,
          "chrom": 0.5749
        },
        {
          "t": 41.933,
          "r": -0.8694,
          "g": -0.9693,
          "b": -1.0555,
          "pos": -0.4273,
          "chrom": 0.4518
        },
        {
          "t": 42.0,
          "r": -0.7251,
          "g": -0.789,
          "b": -0.8743,
          "pos": 0.0508,
          "chrom": 0.0596
        },
        {
          "t": 42.133,
          "r": -0.269,
          "g": -0.2719,
          "b": -0.3427,
          "pos": 0.7814,
          "chrom": -0.531
        },
        {
          "t": 42.2,
          "r": 0.0121,
          "g": 0.0469,
          "b": -0.0,
          "pos": 0.5252,
          "chrom": -0.4967
        },
        {
          "t": 42.333,
          "r": 0.3176,
          "g": 0.3847,
          "b": 0.3877,
          "pos": -0.349,
          "chrom": 0.1225
        },
        {
          "t": 42.4,
          "r": 0.2979,
          "g": 0.3309,
          "b": 0.3193,
          "pos": -0.3017,
          "chrom": 0.2597
        },
        {
          "t": 42.533,
          "r": 0.1595,
          "g": 0.274,
          "b": 0.3208,
          "pos": 0.506,
          "chrom": -0.7901
        },
        {
          "t": 42.6,
          "r": -0.0422,
          "g": 0.0608,
          "b": 0.1145,
          "pos": -0.04,
          "chrom": -0.1732
        },
        {
          "t": 42.733,
          "r": -0.0242,
          "g": -0.0406,
          "b": -0.0145,
          "pos": -1.2412,
          "chrom": 1.5
        },
        {
          "t": 42.8,
          "r": 0.2428,
          "g": 0.2411,
          "b": 0.2529,
          "pos": -0.1211,
          "chrom": 0.641
        },
        {
          "t": 42.933,
          "r": 0.8743,
          "g": 1.043,
          "b": 1.1104,
          "pos": 1.4253,
          "chrom": -1.5
        },
        {
          "t": 43.0,
          "r": 0.749,
          "g": 0.8734,
          "b": 0.9196,
          "pos": 0.7042,
          "chrom": -1.0701
        },
        {
          "t": 43.133,
          "r": 0.5671,
          "g": 0.7073,
          "b": 0.7583,
          "pos": -0.5445,
          "chrom": 0.3415
        },
        {
          "t": 43.2,
          "r": 0.3364,
          "g": 0.4568,
          "b": 0.4867,
          "pos": -1.1239,
          "chrom": 0.9618
        },
        {
          "t": 43.333,
          "r": -0.2567,
          "g": -0.1008,
          "b": -0.1141,
          "pos": -0.7748,
          "chrom": 0.9748
        },
        {
          "t": 43.4,
          "r": -0.6309,
          "g": -0.4038,
          "b": -0.4413,
          "pos": 0.8371,
          "chrom": -0.4334
        },
        {
          "t": 43.533,
          "r": -0.8907,
          "g": -0.5996,
          "b": -0.6591,
          "pos": 1.4403,
          "chrom": -1.3007
        },
        {
          "t": 43.6,
          "r": -0.682,
          "g": -0.4625,
          "b": -0.5256,
          "pos": 0.0282,
          "chrom": -0.2695
        },
        {
          "t": 43.733,
          "r": -0.9302,
          "g": -0.7443,
          "b": -0.8067,
          "pos": -1.0151,
          "chrom": 0.7774
        },
        {
          "t": 43.8,
          "r": -0.9966,
          "g": -0.834,
          "b": -0.9067,
          "pos": -0.7318,
          "chrom": 0.6646
        },
        {
          "t": 43.933,
          "r": -1.0041,
          "g": -0.879,
          "b": -0.9554,
          "pos": -0.1583,
          "chrom": 0.1783
        },
        {
          "t": 44.0,
          "r": -0.9676,
          "g": -0.868,
          "b": -0.9541,
          "pos": 0.964,
          "chrom": -0.8185
        },
        {
          "t": 44.133,
          "r": -0.8659,
          "g": -0.8378,
          "b": -0.9266,
          "pos": 0.9967,
          "chrom": -0.8193
        },
        {
          "t": 44.2,
          "r": -0.5795,
          "g": -0.7211,
          "b": -0.8049,
          "pos": -1.0083,
          "chrom": 0.9955
        },
        {
          "t": 44.333,
          "r": -0.4018,
          "g": -0.57,
          "b": -0.6471,
          "pos": -0.6117,
          "chrom": 0.3948
        },
        {
          "t": 44.4,
          "r": -0.3193,
          "g": -0.4649,
          "b": -0.5465,
          "pos": 0.6765,
          "chrom": -0.8237
        },
        {
          "t": 44.533,
          "r": -0.4246,
          "g": -0.6183,
          "b": -0.7013,
          "pos": -0.0877,
          "chrom": 0.1476
        },
        {
          "t": 44.6,
          "r": -0.5182,
          "g": -0.7037,
          "b": -0.7844,
          "pos": -0.282,
          "chrom": 0.4071
        },
        {
          "t": 44.733,
          "r": -0.3695,
          "g": -0.5185,
          "b": -0.606,
          "pos": 0.2753,
          "chrom": -0.1813
        },
        {
          "t": 44.8,
          "r": -0.1093,
          "g": -0.2472,
          "b": -0.3429,
          "pos": 0.3046,
          "chrom": -0.3571
        },
        {
          "t": 44.933,
          "r": -0.0584,
          "g": -0.1817,
          "b": -0.2663,
          "pos": -0.236,
          "chrom": 0.1143
        },
        {
          "t": 45.0,
          "r": -0.1339,
          "g": -0.2568,
          "b": -0.3465,
          "pos": -0.3446,
          "chrom": 0.3481
        },
        {
          "t": 45.133,
          "r": -0.2696,
          "g": -0.3476,
          "b": -0.4203,
          "pos": 0.1171,
          "chrom": -0.0698
        },
        {
          "t": 45.2,
          "r": -0.2851,
          "g": -0.3691,
          "b": -0.4396,
          "pos": 0.2091,
          "chrom": -0.2002
        },
        {
          "t": 45.333,
          "r": -0.1955,
          "g": -0.3033,
          "b": -0.3756,
          "pos": 0.0496,
          "chrom": -0.0865
        },
        {
          "t": 45.4,
          "r": -0.1269,
          "g": -0.2656,
          "b": -0.3395,
          "pos": -0.1509,
          "chrom": 0.1105
        },
        {
          "t": 45.533,
          "r": -0.0265,
          "g": -0.194,
          "b": -0.2799,
          "pos": -0.0826,
          "chrom": 0.0848
        },
        {
          "t": 45.6,
          "r": 0.0108,
          "g": -0.1574,
          "b": -0.2434,
          "pos": 0.0863,
          "chrom": -0.0604
        },
        {
          "t": 45.733,
          "r": 0.0466,
          "g": -0.1292,
          "b": -0.2188,
          "pos": 0.087,
          "chrom": -0.0624
        },
        {
          "t": 45.8,
          "r": 0.0511,
          "g": -0.1183,
          "b": -0.2019,
          "pos": 0.0239,
          "chrom": -0.0002
        },
        {
          "t": 45.933,
          "r": 0.0461,
          "g": -0.1309,
          "b": -0.2212,
          "pos": -0.1143,
          "chrom": 0.0946
        },
        {
          "t": 46.0,
          "r": 0.046,
          "g": -0.1266,
          "b": -0.2078,
          "pos": -0.1893,
          "chrom": 0.055
        },
        {
          "t": 46.133,
          "r": -0.0934,
          "g": -0.2761,
          "b": -0.3748,
          "pos": 0.078,
          "chrom": -0.1178
        },
        {
          "t": 46.2,
          "r": -0.1965,
          "g": -0.3885,
          "b": -0.5003,
          "pos": 0.3955,
          "chrom": -0.2723
        },
        {
          "t": 46.333,
          "r": -0.3099,
          "g": -0.524,
          "b": -0.6439,
          "pos": 0.202,
          "chrom": -0.1385
        },
        {
          "t": 46.4,
          "r": -0.3688,
          "g": -0.6009,
          "b": -0.718,
          "pos": -0.3176,
          "chrom": 0.2932
        },
        {
          "t": 46.533,
          "r": -0.5724,
          "g": -0.8119,
          "b": -0.9238,
          "pos": -0.648,
          "chrom": 0.6019
        },
        {
          "t": 46.6,
          "r": -0.6044,
          "g": -0.8305,
          "b": -0.943,
          "pos": -0.2007,
          "chrom": 0.1586
        },
        {
          "t": 46.733,
          "r": -0.6834,
          "g": -0.8737,
          "b": -0.984,
          "pos": 0.6609,
          "chrom": -0.7136
        },
        {
          "t": 46.8,
          "r": -0.7363,
          "g": -0.9178,
          "b": -1.02,
          "pos": 0.8573,
          "chrom": -0.8637
        },
        {
          "t": 46.933,
          "r": -0.8866,
          "g": -1.0802,
          "b": -1.1676,
          "pos": 0.0426,
          "chrom": 0.0361
        },
        {
          "t": 47.0,
          "r": -0.9438,
          "g": -1.147,
          "b": -1.2101,
          "pos": -1.2439,
          "chrom": 1.2667
        },
        {
          "t": 47.133,
          "r": -1.0258,
          "g": -1.1592,
          "b": -1.1965,
          "pos": -0.5858,
          "chrom": 0.5537
        },
        {
          "t": 47.2,
          "r": -0.8882,
          "g": -0.8837,
          "b": -0.9243,
          "pos": 0.9859,
          "chrom": -1.0291
        },
        {
          "t": 47.333,
          "r": -0.9584,
          "g": -0.9434,
          "b": -0.9741,
          "pos": 0.5144,
          "chrom": -0.4888
        },
        {
          "t": 47.4,
          "r": -0.9358,
          "g": -0.9303,
          "b": -0.9699,
          "pos": -0.1377,
          "chrom": 0.2233
        },
        {
          "t": 47.533,
          "r": -0.8916,
          "g": -0.8873,
          "b": -0.9309,
          "pos": -0.3672,
          "chrom": 0.2987
        },
        {
          "t": 47.6,
          "r": -0.8676,
          "g": -0.8664,
          "b": -0.9135,
          "pos": -0.2603,
          "chrom": 0.1046
        },
        {
          "t": 47.733,
          "r": -0.7884,
          "g": -0.8204,
          "b": -0.8867,
          "pos": -0.0492,
          "chrom": -0.0368
        },
        {
          "t": 47.8,
          "r": -0.5369,
          "g": -0.6401,
          "b": -0.732,
          "pos": -0.0458,
          "chrom": 0.0678
        },
        {
          "t": 47.933,
          "r": -0.4716,
          "g": -0.5587,
          "b": -0.6412,
          "pos": 0.8703,
          "chrom": -0.565
        },
        {
          "t": 48.0,
          "r": -0.4151,
          "g": -0.4956,
          "b": -0.5548,
          "pos": 0.1896,
          "chrom": 0.059
        },
        {
          "t": 48.133,
          "r": 0.2535,
          "g": 0.1627,
          "b": 0.1607,
          "pos": -1.1345,
          "chrom": 0.8525
        },
        {
          "t": 48.2,
          "r": 0.3493,
          "g": 0.3616,
          "b": 0.3838,
          "pos": 0.0903,
          "chrom": -0.4434
        },
        {
          "t": 48.333,
          "r": 0.2558,
          "g": 0.3267,
          "b": 0.3868,
          "pos": 0.4474,
          "chrom": -0.419
        },
        {
          "t": 48.4,
          "r": 0.265,
          "g": 0.3107,
          "b": 0.373,
          "pos": -0.1956,
          "chrom": 0.3845
        },
        {
          "t": 48.533,
          "r": 0.2448,
          "g": 0.3575,
          "b": 0.4539,
          "pos": 0.1765,
          "chrom": -0.0983
        },
        {
          "t": 48.6,
          "r": 0.2554,
          "g": 0.3724,
          "b": 0.481,
          "pos": 0.1223,
          "chrom": -0.1661
        },
        {
          "t": 48.733,
          "r": 0.2542,
          "g": 0.3679,
          "b": 0.488,
          "pos": -0.2082,
          "chrom": 0.1446
        },
        {
          "t": 48.8,
          "r": 0.2508,
          "g": 0.3616,
          "b": 0.4827,
          "pos": -0.1723,
          "chrom": 0.1728
        },
        {
          "t": 48.933,
          "r": 0.2275,
          "g": 0.3534,
          "b": 0.4845,
          "pos": 0.0068,
          "chrom": 0.0206
        },
        {
          "t": 49.0,
          "r": 0.2766,
          "g": 0.4191,
          "b": 0.5553,
          "pos": 0.2236,
          "chrom": -0.2464
        },
        {
          "t": 49.133,
          "r": 0.3052,
          "g": 0.4511,
          "b": 0.5938,
          "pos": 0.0454,
          "chrom": -0.0779
        },
        {
          "t": 49.2,
          "r": 0.3042,
          "g": 0.4478,
          "b": 0.5896,
          "pos": -0.1156,
          "chrom": 0.1209
        },
        {
          "t": 49.333,
          "r": 0.3199,
          "g": 0.473,
          "b": 0.6089,
          "pos": 0.1,
          "chrom": -0.0474
        },
        {
          "t": 49.4,
          "r": 0.3105,
          "g": 0.4611,
          "b": 0.5936,
          "pos": -0.1165,
          "chrom": 0.0805
        },
        {
          "t": 49.533,
          "r": 0.3123,
          "g": 0.4587,
          "b": 0.5854,
          "pos": -0.2468,
          "chrom": 0.1648
        },
        {
          "t": 49.6,
          "r": 0.3358,
          "g": 0.4638,
          "b": 0.5487,
          "pos": 0.2542,
          "chrom": -0.1418
        },
        {
          "t": 49.733,
          "r": 0.3466,
          "g": 0.4586,
          "b": 0.527,
          "pos": 0.3064,
          "chrom": -0.2602
        },
        {
          "t": 49.867,
          "r": 0.3057,
          "g": 0.3753,
          "b": 0.4261,
          "pos": -0.4377,
          "chrom": 0.2603
        },
        {
          "t": 49.933,
          "r": 0.2828,
          "g": 0.3335,
          "b": 0.3683,
          "pos": -0.2645,
          "chrom": 0.2182
        },
        {
          "t": 50.067,
          "r": 0.2528,
          "g": 0.2662,
          "b": 0.2604,
          "pos": 0.2046,
          "chrom": -0.1355
        },
        {
          "t": 50.133,
          "r": 0.239,
          "g": 0.2382,
          "b": 0.2263,
          "pos": 0.0406,
          "chrom": -0.0283
        },
        {
          "t": 50.267,
          "r": 0.1997,
          "g": 0.1702,
          "b": 0.1434,
          "pos": 0.1423,
          "chrom": -0.1162
        },
        {
          "t": 50.333,
          "r": 0.1747,
          "g": 0.1514,
          "b": 0.1232,
          "pos": 0.156,
          "chrom": -0.1363
        },
        {
          "t": 50.467,
          "r": 0.1832,
          "g": 0.1237,
          "b": 0.0977,
          "pos": -0.2942,
          "chrom": 0.2385
        },
        {
          "t": 50.533,
          "r": 0.2021,
          "g": 0.156,
          "b": 0.1305,
          "pos": -0.1531,
          "chrom": 0.0961
        },
        {
          "t": 50.667,
          "r": 0.1921,
          "g": 0.1307,
          "b": 0.1051,
          "pos": 0.1306,
          "chrom": -0.1394
        },
        {
          "t": 50.733,
          "r": 0.1796,
          "g": 0.1231,
          "b": 0.1009,
          "pos": 0.0717,
          "chrom": -0.0611
        },
        {
          "t": 50.867,
          "r": 0.1396,
          "g": 0.0597,
          "b": 0.0432,
          "pos": 0.073,
          "chrom": -0.0142
        },
        {
          "t": 50.933,
          "r": 0.1169,
          "g": 0.0387,
          "b": 0.0256,
          "pos": 0.1309,
          "chrom": -0.0899
        },
        {
          "t": 51.067,
          "r": 0.0437,
          "g": -0.0429,
          "b": -0.0356,
          "pos": -0.2215,
          "chrom": 0.1508
        },
        {
          "t": 51.133,
          "r": 0.016,
          "g": -0.0839,
          "b": -0.0708,
          "pos": -0.2465,
          "chrom": 0.1509
        },
        {
          "t": 51.267,
          "r": -0.042,
          "g": -0.1348,
          "b": -0.1223,
          "pos": 0.1027,
          "chrom": -0.0606
        },
        {
          "t": 51.333,
          "r": -0.093,
          "g": -0.2044,
          "b": -0.1939,
          "pos": 0.1246,
          "chrom": -0.0581
        },
        {
          "t": 51.467,
          "r": -0.1188,
          "g": -0.194,
          "b": -0.1678,
          "pos": 0.145,
          "chrom": -0.162
        },
        {
          "t": 51.533,
          "r": -0.1676,
          "g": -0.2628,
          "b": -0.2427,
          "pos": -0.055,
          "chrom": 0.0695
        },
        {
          "t": 51.667,
          "r": -0.1451,
          "g": -0.2067,
          "b": -0.1782,
          "pos": -0.1413,
          "chrom": 0.1045
        },
        {
          "t": 51.733,
          "r": -0.1359,
          "g": -0.1931,
          "b": -0.1694,
          "pos": -0.0111,
          "chrom": -0.0249
        },
        {
          "t": 51.867,
          "r": -0.0463,
          "g": -0.0931,
          "b": -0.0769,
          "pos": -0.0233,
          "chrom": 0.0162
        },
        {
          "t": 51.933,
          "r": 0.0018,
          "g": -0.0367,
          "b": -0.0256,
          "pos": 0.0146,
          "chrom": -0.0479
        },
        {
          "t": 52.067,
          "r": 0.0183,
          "g": -0.0193,
          "b": -0.015,
          "pos": 0.1719,
          "chrom": -0.1364
        },
        {
          "t": 52.133,
          "r": 0.0242,
          "g": -0.0067,
          "b": -0.005,
          "pos": 0.1228,
          "chrom": -0.0694
        },
        {
          "t": 52.267,
          "r": 0.0356,
          "g": -0.0028,
          "b": 0.0049,
          "pos": -0.1409,
          "chrom": 0.0939
        },
        {
          "t": 52.333,
          "r": 0.0504,
          "g": 0.0203,
          "b": 0.0299,
          "pos": -0.0627,
          "chrom": 0.0136
        },
        {
          "t": 52.467,
          "r": 0.0716,
          "g": 0.0313,
          "b": 0.0336,
          "pos": -0.0985,
          "chrom": 0.1219
        },
        {
          "t": 52.533,
          "r": 0.082,
          "g": 0.0446,
          "b": 0.0492,
          "pos": -0.1432,
          "chrom": 0.1288
        },
        {
          "t": 52.667,
          "r": 0.1405,
          "g": 0.1209,
          "b": 0.122,
          "pos": 0.124,
          "chrom": -0.1393
        },
        {
          "t": 52.733,
          "r": 0.1649,
          "g": 0.1335,
          "b": 0.1266,
          "pos": 0.123,
          "chrom": -0.0951
        },
        {
          "t": 52.867,
          "r": 0.189,
          "g": 0.1688,
          "b": 0.165,
          "pos": 0.1234,
          "chrom": -0.1103
        },
        {
          "t": 52.933,
          "r": 0.1742,
          "g": 0.1483,
          "b": 0.1444,
          "pos": -0.0136,
          "chrom": 0.0027
        },
        {
          "t": 53.067,
          "r": 0.1722,
          "g": 0.1442,
          "b": 0.1454,
          "pos": -0.1604,
          "chrom": 0.129
        },
        {
          "t": 53.133,
          "r": 0.1832,
          "g": 0.1548,
          "b": 0.1525,
          "pos": -0.0444,
          "chrom": 0.0354
        },
        {
          "t": 53.267,
          "r": 0.1867,
          "g": 0.1573,
          "b": 0.1556,
          "pos": 0.0258,
          "chrom": -0.0469
        },
        {
          "t": 53.333,
          "r": 0.1921,
          "g": 0.1673,
          "b": 0.1655,
          "pos": 0.1018,
          "chrom": -0.1188
        },
        {
          "t": 53.467,
          "r": 0.1684,
          "g": 0.1316,
          "b": 0.1268,
          "pos": -0.0234,
          "chrom": 0.0696
        },
        {
          "t": 53.533,
          "r": 0.1762,
          "g": 0.1441,
          "b": 0.1408,
          "pos": -0.0668,
          "chrom": 0.0817
        },
        {
          "t": 53.667,
          "r": 0.1852,
          "g": 0.1623,
          "b": 0.1607,
          "pos": 0.0878,
          "chrom": -0.1216
        },
        {
          "t": 53.733,
          "r": 0.1747,
          "g": 0.1512,
          "b": 0.1503,
          "pos": -0.0042,
          "chrom": -0.0236
        },
        {
          "t": 53.867,
          "r": 0.138,
          "g": 0.1129,
          "b": 0.1087,
          "pos": -0.0793,
          "chrom": 0.0729
        },
        {
          "t": 53.933,
          "r": 0.1294,
          "g": 0.1009,
          "b": 0.0954,
          "pos": -0.0209,
          "chrom": 0.0411
        },
        {
          "t": 54.067,
          "r": 0.1288,
          "g": 0.1035,
          "b": 0.0937,
          "pos": 0.0056,
          "chrom": -0.0223
        },
        {
          "t": 54.133,
          "r": 0.1262,
          "g": 0.0999,
          "b": 0.0859,
          "pos": 0.0908,
          "chrom": -0.1168
        },
        {
          "t": 54.267,
          "r": 0.1209,
          "g": 0.0843,
          "b": 0.0616,
          "pos": 0.0287,
          "chrom": -0.0139
        },
        {
          "t": 54.333,
          "r": 0.1211,
          "g": 0.0799,
          "b": 0.0599,
          "pos": -0.0742,
          "chrom": 0.0696
        },
        {
          "t": 54.467,
          "r": 0.0943,
          "g": 0.0544,
          "b": 0.0304,
          "pos": -0.0007,
          "chrom": 0.0216
        },
        {
          "t": 54.533,
          "r": 0.0812,
          "g": 0.0326,
          "b": 0.0085,
          "pos": -0.0393,
          "chrom": 0.0542
        },
        {
          "t": 54.667,
          "r": 0.1149,
          "g": 0.0712,
          "b": 0.0504,
          "pos": -0.0207,
          "chrom": -0.0499
        },
        {
          "t": 54.733,
          "r": 0.0976,
          "g": 0.0444,
          "b": 0.0164,
          "pos": 0.0217,
          "chrom": -0.0677
        },
        {
          "t": 54.867,
          "r": 0.0985,
          "g": 0.0331,
          "b": 0.0,
          "pos": 0.1167,
          "chrom": -0.0756
        },
        {
          "t": 54.933,
          "r": 0.0863,
          "g": 0.0203,
          "b": -0.0136,
          "pos": 0.1178,
          "chrom": -0.0598
        },
        {
          "t": 55.067,
          "r": 0.1031,
          "g": 0.0206,
          "b": -0.0089,
          "pos": -0.1591,
          "chrom": 0.1557
        },
        {
          "t": 55.133,
          "r": 0.132,
          "g": 0.0563,
          "b": 0.0292,
          "pos": -0.1391,
          "chrom": 0.0939
        },
        {
          "t": 55.267,
          "r": 0.1522,
          "g": 0.0729,
          "b": 0.0428,
          "pos": 0.0528,
          "chrom": -0.0944
        },
        {
          "t": 55.333,
          "r": 0.1396,
          "g": 0.0661,
          "b": 0.036,
          "pos": 0.1461,
          "chrom": -0.1701
        },
        {
          "t": 55.467,
          "r": 0.088,
          "g": 0.0077,
          "b": -0.0243,
          "pos": -0.0111,
          "chrom": 0.0508
        },
        {
          "t": 55.533,
          "r": 0.0752,
          "g": -0.0088,
          "b": -0.0397,
          "pos": -0.1353,
          "chrom": 0.1669
        },
        {
          "t": 55.667,
          "r": 0.1485,
          "g": 0.08,
          "b": 0.0526,
          "pos": -0.005,
          "chrom": -0.0451
        },
        {
          "t": 55.733,
          "r": 0.1568,
          "g": 0.0826,
          "b": 0.0533,
          "pos": -0.0237,
          "chrom": -0.0003
        },
        {
          "t": 55.867,
          "r": 0.169,
          "g": 0.0981,
          "b": 0.0718,
          "pos": 0.0597,
          "chrom": -0.014
        },
        {
          "t": 55.933,
          "r": 0.1461,
          "g": 0.0827,
          "b": 0.0604,
          "pos": 0.1022,
          "chrom": -0.0632
        },
        {
          "t": 56.067,
          "r": 0.0938,
          "g": 0.0299,
          "b": 0.0185,
          "pos": 0.0342,
          "chrom": -0.0532
        },
        {
          "t": 56.133,
          "r": 0.1159,
          "g": 0.0605,
          "b": 0.0521,
          "pos": 0.0433,
          "chrom": -0.0973
        },
        {
          "t": 56.267,
          "r": 0.1361,
          "g": 0.0619,
          "b": 0.0499,
          "pos": -0.0897,
          "chrom": -0.0132
        },
        {
          "t": 56.333,
          "r": 0.1172,
          "g": 0.0538,
          "b": 0.0459,
          "pos": -0.106,
          "chrom": 0.0353
        },
        {
          "t": 56.467,
          "r": 0.0324,
          "g": -0.0305,
          "b": -0.0405,
          "pos": -0.2009,
          "chrom": 0.3631
        },
        {
          "t": 56.533,
          "r": 0.0666,
          "g": 0.0502,
          "b": 0.063,
          "pos": -0.0489,
          "chrom": 0.2016
        },
        {
          "t": 56.667,
          "r": -0.0152,
          "g": 0.1073,
          "b": 0.1867,
          "pos": 0.4566,
          "chrom": -0.6343
        },
        {
          "t": 56.733,
          "r": -0.0747,
          "g": 0.0741,
          "b": 0.1843,
          "pos": 0.2035,
          "chrom": -0.2829
        },
        {
          "t": 56.867,
          "r": -0.2676,
          "g": -0.0685,
          "b": 0.0765,
          "pos": -0.216,
          "chrom": 0.442
        },
        {
          "t": 56.933,
          "r": -0.4424,
          "g": -0.1464,
          "b": 0.0576,
          "pos": -0.1533,
          "chrom": 0.0893
        },
        {
          "t": 57.067,
          "r": -0.4033,
          "g": -0.0697,
          "b": 0.1484,
          "pos": -0.2468,
          "chrom": 0.0719
        },
        {
          "t": 57.133,
          "r": -0.1608,
          "g": 0.1342,
          "b": 0.3148,
          "pos": -0.0629,
          "chrom": 0.0763
        },
        {
          "t": 57.267,
          "r": 0.4512,
          "g": 0.7082,
          "b": 0.8336,
          "pos": 0.4274,
          "chrom": -0.6266
        },
        {
          "t": 57.333,
          "r": 0.6154,
          "g": 0.8265,
          "b": 0.9208,
          "pos": 0.2382,
          "chrom": -0.1631
        },
        {
          "t": 57.467,
          "r": 0.6888,
          "g": 0.808,
          "b": 0.8453,
          "pos": -0.3138,
          "chrom": 0.8407
        },
        {
          "t": 57.533,
          "r": 0.7525,
          "g": 0.9005,
          "b": 0.9486,
          "pos": -0.2437,
          "chrom": 0.3155
        },
        {
          "t": 57.667,
          "r": 0.8523,
          "g": 1.0188,
          "b": 1.0743,
          "pos": 0.0453,
          "chrom": -0.4837
        },
        {
          "t": 57.733,
          "r": 0.7991,
          "g": 0.94,
          "b": 0.9779,
          "pos": 0.0739,
          "chrom": -0.438
        },
        {
          "t": 57.867,
          "r": 0.54,
          "g": 0.613,
          "b": 0.6134,
          "pos": 0.3252,
          "chrom": -0.4106
        },
        {
          "t": 57.933,
          "r": 0.3787,
          "g": 0.4105,
          "b": 0.3847,
          "pos": 0.075,
          "chrom": 0.1705
        },
        {
          "t": 58.067,
          "r": 0.1692,
          "g": 0.1257,
          "b": 0.072,
          "pos": -0.4069,
          "chrom": 0.9406
        },
        {
          "t": 58.133,
          "r": 0.2305,
          "g": 0.2103,
          "b": 0.1605,
          "pos": -0.0809,
          "chrom": 0.27
        },
        {
          "t": 58.267,
          "r": 0.3979,
          "g": 0.4437,
          "b": 0.4221,
          "pos": 0.1681,
          "chrom": -0.6553
        },
        {
          "t": 58.333,
          "r": 0.3195,
          "g": 0.3726,
          "b": 0.3446,
          "pos": 0.1453,
          "chrom": -0.5377
        },
        {
          "t": 58.467,
          "r": 0.1072,
          "g": 0.1251,
          "b": 0.0627,
          "pos": -0.0997,
          "chrom": 0.1459
        },
        {
          "t": 58.533,
          "r": 0.0342,
          "g": 0.0435,
          "b": -0.0286,
          "pos": -0.1973,
          "chrom": 0.3344
        },
        {
          "t": 58.667,
          "r": -0.2208,
          "g": -0.1952,
          "b": -0.279,
          "pos": 0.0865,
          "chrom": 0.1023
        },
        {
          "t": 58.733,
          "r": -0.3595,
          "g": -0.314,
          "b": -0.3919,
          "pos": 0.1444,
          "chrom": -0.0345
        },
        {
          "t": 58.867,
          "r": -0.4186,
          "g": -0.358,
          "b": -0.4263,
          "pos": 0.0941,
          "chrom": -0.1773
        },
        {
          "t": 58.933,
          "r": -0.4499,
          "g": -0.3907,
          "b": -0.4541,
          "pos": -0.0994,
          "chrom": -0.0054
        },
        {
          "t": 59.067,
          "r": -0.48,
          "g": -0.435,
          "b": -0.4942,
          "pos": -0.2333,
          "chrom": 0.1682
        },
        {
          "t": 59.133,
          "r": -0.4735,
          "g": -0.4363,
          "b": -0.4963,
          "pos": -0.1114,
          "chrom": 0.0891
        },
        {
          "t": 59.267,
          "r": -0.44,
          "g": -0.4217,
          "b": -0.4863,
          "pos": 0.2434,
          "chrom": -0.2483
        },
        {
          "t": 59.333,
          "r": -0.4037,
          "g": -0.3878,
          "b": -0.4515,
          "pos": 0.5534,
          "chrom": -0.5631
        },
        {
          "t": 59.467,
          "r": -0.3941,
          "g": -0.4402,
          "b": -0.5128,
          "pos": -0.1294,
          "chrom": 0.2591
        },
        {
          "t": 59.533,
          "r": -0.2874,
          "g": -0.3647,
          "b": -0.4346,
          "pos": -0.6645,
          "chrom": 0.7551
        },
        {
          "t": 59.667,
          "r": -0.058,
          "g": -0.0905,
          "b": -0.1497,
          "pos": -0.0142,
          "chrom": -0.1365
        },
        {
          "t": 59.733,
          "r": -0.0206,
          "g": -0.0417,
          "b": -0.0931,
          "pos": 0.2348,
          "chrom": -0.3298
        },
        {
          "t": 59.867,
          "r": 0.0009,
          "g": -0.0297,
          "b": -0.0707,
          "pos": -0.2366,
          "chrom": 0.2679
        },
        {
          "t": 59.933,
          "r": -0.0875,
          "g": -0.0886,
          "b": -0.1038,
          "pos": -0.0132,
          "chrom": 0.0251
        },
        {
          "t": 60.067,
          "r": -0.7604,
          "g": -0.6604,
          "b": -0.6059,
          "pos": 0.673,
          "chrom": -0.6248
        },
        {
          "t": 60.133,
          "r": -1.2424,
          "g": -1.1001,
          "b": -0.9841,
          "pos": 0.3293,
          "chrom": -0.3301
        },
        {
          "t": 60.267,
          "r": -1.0628,
          "g": -0.9859,
          "b": -0.8709,
          "pos": -0.3215,
          "chrom": 0.2953
        },
        {
          "t": 60.333,
          "r": -0.9085,
          "g": -0.8572,
          "b": -0.7483,
          "pos": -0.4172,
          "chrom": 0.4495
        },
        {
          "t": 60.467,
          "r": -0.6427,
          "g": -0.5966,
          "b": -0.5004,
          "pos": -0.6514,
          "chrom": 0.5771
        },
        {
          "t": 60.533,
          "r": -0.5661,
          "g": -0.4814,
          "b": -0.3902,
          "pos": -0.2203,
          "chrom": 0.1186
        },
        {
          "t": 60.667,
          "r": -0.2645,
          "g": -0.1339,
          "b": -0.0893,
          "pos": 0.9316,
          "chrom": -0.8493
        },
        {
          "t": 60.733,
          "r": -0.2112,
          "g": -0.0765,
          "b": -0.0317,
          "pos": 0.6698,
          "chrom": -0.5897
        },
        {
          "t": 60.867,
          "r": -0.166,
          "g": -0.0317,
          "b": 0.0072,
          "pos": -0.1697,
          "chrom": 0.2
        },
        {
          "t": 60.933,
          "r": -0.1809,
          "g": -0.0483,
          "b": -0.0116,
          "pos": -0.3066,
          "chrom": 0.3329
        },
        {
          "t": 61.067,
          "r": -0.1504,
          "g": -0.0145,
          "b": 0.0284,
          "pos": -0.4381,
          "chrom": 0.3136
        },
        {
          "t": 61.133,
          "r": -0.1356,
          "g": 0.0011,
          "b": 0.04,
          "pos": -0.3153,
          "chrom": 0.1569
        },
        {
          "t": 61.267,
          "r": 0.0419,
          "g": 0.1656,
          "b": 0.1887,
          "pos": 0.352,
          "chrom": -0.3797
        },
        {
          "t": 61.333,
          "r": 0.0213,
          "g": 0.1533,
          "b": 0.1728,
          "pos": 0.498,
          "chrom": -0.3748
        },
        {
          "t": 61.467,
          "r": -0.1599,
          "g": -0.0174,
          "b": 0.0341,
          "pos": 0.0052,
          "chrom": 0.2305
        },
        {
          "t": 61.533,
          "r": -0.1594,
          "g": 0.0277,
          "b": 0.1113,
          "pos": -0.0672,
          "chrom": 0.1684
        },
        {
          "t": 61.667,
          "r": -0.0378,
          "g": 0.1743,
          "b": 0.2898,
          "pos": -0.2807,
          "chrom": -0.0096
        },
        {
          "t": 61.733,
          "r": 0.0212,
          "g": 0.2213,
          "b": 0.336,
          "pos": -0.3191,
          "chrom": 0.0253
        },
        {
          "t": 61.867,
          "r": -0.1402,
          "g": -0.0123,
          "b": 0.0383,
          "pos": 0.2427,
          "chrom": -0.0829
        },
        {
          "t": 61.933,
          "r": -0.1126,
          "g": -0.0119,
          "b": 0.0197,
          "pos": 0.2618,
          "chrom": -0.0746
        },
        {
          "t": 62.067,
          "r": -0.2377,
          "g": -0.2294,
          "b": -0.2627,
          "pos": 0.0197,
          "chrom": -0.0236
        }
      ],
      "hrTracks": {
        "pos_face_full": [
          {
            "t": 0.0,
            "bpm": 117.773
          },
          {
            "t": 5.0,
            "bpm": 132.715
          },
          {
            "t": 10.0,
            "bpm": 134.033
          },
          {
            "t": 15.0,
            "bpm": 101.514
          },
          {
            "t": 20.0,
            "bpm": 88.33
          },
          {
            "t": 25.0,
            "bpm": 90.967
          },
          {
            "t": 30.0,
            "bpm": 91.846
          },
          {
            "t": 35.0,
            "bpm": 111.182
          },
          {
            "t": 40.0,
            "bpm": 108.545
          }
        ],
        "chrom_face_full": [
          {
            "t": 0.0,
            "bpm": 112.061
          },
          {
            "t": 5.0,
            "bpm": 110.742
          },
          {
            "t": 10.0,
            "bpm": 101.953
          },
          {
            "t": 15.0,
            "bpm": 101.074
          },
          {
            "t": 20.0,
            "bpm": 98.877
          },
          {
            "t": 25.0,
            "bpm": 90.527
          },
          {
            "t": 30.0,
            "bpm": 121.729
          },
          {
            "t": 35.0,
            "bpm": 112.5
          },
          {
            "t": 40.0,
            "bpm": 126.562
          }
        ],
        "sqi_top_window": [
          {
            "t": 0.0,
            "bpm": 115.576
          },
          {
            "t": 5.0,
            "bpm": 98.877
          },
          {
            "t": 10.0,
            "bpm": 98.877
          },
          {
            "t": 15.0,
            "bpm": 100.635
          },
          {
            "t": 20.0,
            "bpm": 98.438
          },
          {
            "t": 25.0,
            "bpm": 99.756
          },
          {
            "t": 30.0,
            "bpm": 92.285
          },
          {
            "t": 35.0,
            "bpm": 99.316
          },
          {
            "t": 40.0,
            "bpm": 94.043
          }
        ],
        "trained_peak_selector_current": [
          {
            "t": 0.0,
            "bpm": 193.359
          },
          {
            "t": 5.0,
            "bpm": 186.328
          },
          {
            "t": 10.0,
            "bpm": 191.602
          },
          {
            "t": 15.0,
            "bpm": 187.646
          },
          {
            "t": 20.0,
            "bpm": 195.557
          },
          {
            "t": 25.0,
            "bpm": 199.951
          },
          {
            "t": 30.0,
            "bpm": 181.055
          },
          {
            "t": 35.0,
            "bpm": 188.525
          },
          {
            "t": 40.0,
            "bpm": 179.736
          }
        ],
        "oracle_window_peak": [
          {
            "t": 0.0,
            "bpm": 191.602
          },
          {
            "t": 5.0,
            "bpm": 189.844
          },
          {
            "t": 10.0,
            "bpm": 191.602
          },
          {
            "t": 15.0,
            "bpm": 189.844
          },
          {
            "t": 20.0,
            "bpm": 188.965
          },
          {
            "t": 25.0,
            "bpm": 189.404
          },
          {
            "t": 30.0,
            "bpm": 189.404
          },
          {
            "t": 35.0,
            "bpm": 188.965
          },
          {
            "t": 40.0,
            "bpm": 186.768
          }
        ]
      }
    },
    {
      "video": "8.mp4",
      "durationSec": 62.087,
      "label": {
        "bpm_min": 108.0,
        "bpm_max": 113.0,
        "bpm_target": 110.5
      },
      "waveform": [
        {
          "t": 0.0,
          "r": -0.0922,
          "g": -0.0793,
          "b": -0.0369,
          "pos": -0.0023,
          "chrom": 0.0101
        },
        {
          "t": 0.133,
          "r": -0.1069,
          "g": -0.0822,
          "b": -0.0398,
          "pos": -0.0773,
          "chrom": 0.1215
        },
        {
          "t": 0.2,
          "r": -0.0967,
          "g": -0.0573,
          "b": -0.0286,
          "pos": 0.5825,
          "chrom": -0.5937
        },
        {
          "t": 0.333,
          "r": -0.095,
          "g": -0.0524,
          "b": -0.008,
          "pos": -0.015,
          "chrom": 0.0026
        },
        {
          "t": 0.4,
          "r": -0.0903,
          "g": -0.0505,
          "b": 0.0064,
          "pos": -0.5765,
          "chrom": 0.5942
        },
        {
          "t": 0.533,
          "r": -0.1159,
          "g": -0.0428,
          "b": 0.0313,
          "pos": -0.042,
          "chrom": 0.0307
        },
        {
          "t": 0.6,
          "r": -0.1046,
          "g": -0.0294,
          "b": 0.036,
          "pos": 0.1685,
          "chrom": -0.1782
        },
        {
          "t": 0.733,
          "r": -0.1397,
          "g": -0.0225,
          "b": 0.0729,
          "pos": 0.1982,
          "chrom": -0.1481
        },
        {
          "t": 0.8,
          "r": -0.1135,
          "g": 0.0097,
          "b": 0.1124,
          "pos": 0.1226,
          "chrom": -0.0688
        },
        {
          "t": 0.933,
          "r": -0.0291,
          "g": 0.0712,
          "b": 0.1775,
          "pos": -0.3461,
          "chrom": 0.3429
        },
        {
          "t": 1.0,
          "r": 0.0208,
          "g": 0.1018,
          "b": 0.1748,
          "pos": -0.1348,
          "chrom": 0.0827
        },
        {
          "t": 1.133,
          "r": 0.0418,
          "g": 0.1307,
          "b": 0.2122,
          "pos": 0.2507,
          "chrom": -0.2971
        },
        {
          "t": 1.2,
          "r": 0.0421,
          "g": 0.0882,
          "b": 0.1458,
          "pos": 0.2391,
          "chrom": -0.2262
        },
        {
          "t": 1.333,
          "r": 0.0495,
          "g": 0.1106,
          "b": 0.1863,
          "pos": -0.0543,
          "chrom": 0.1337
        },
        {
          "t": 1.4,
          "r": 0.0834,
          "g": 0.1533,
          "b": 0.2334,
          "pos": -0.383,
          "chrom": 0.4295
        },
        {
          "t": 1.533,
          "r": 0.1414,
          "g": 0.2504,
          "b": 0.3307,
          "pos": -0.0451,
          "chrom": 0.0477
        },
        {
          "t": 1.6,
          "r": 0.1181,
          "g": 0.2529,
          "b": 0.3326,
          "pos": 0.2339,
          "chrom": -0.2418
        },
        {
          "t": 1.733,
          "r": 0.1763,
          "g": 0.3475,
          "b": 0.4285,
          "pos": 0.1208,
          "chrom": -0.186
        },
        {
          "t": 1.8,
          "r": 0.146,
          "g": 0.2594,
          "b": 0.3069,
          "pos": -0.0965,
          "chrom": 0.0949
        },
        {
          "t": 1.933,
          "r": 0.1147,
          "g": 0.2137,
          "b": 0.2469,
          "pos": -0.1117,
          "chrom": 0.1728
        },
        {
          "t": 2.0,
          "r": 0.0815,
          "g": 0.1403,
          "b": 0.1471,
          "pos": 0.2059,
          "chrom": -0.2001
        },
        {
          "t": 2.133,
          "r": 0.0607,
          "g": 0.0995,
          "b": 0.1007,
          "pos": 0.1044,
          "chrom": -0.0953
        },
        {
          "t": 2.2,
          "r": 0.0291,
          "g": 0.0651,
          "b": 0.0648,
          "pos": -0.0728,
          "chrom": 0.0703
        },
        {
          "t": 2.333,
          "r": 0.0327,
          "g": 0.0701,
          "b": 0.0726,
          "pos": -0.0343,
          "chrom": -0.0001
        },
        {
          "t": 2.4,
          "r": 0.0064,
          "g": -0.0011,
          "b": -0.0193,
          "pos": -0.0749,
          "chrom": 0.1095
        },
        {
          "t": 2.533,
          "r": 0.0187,
          "g": 0.0161,
          "b": 0.0045,
          "pos": -0.4227,
          "chrom": 0.4953
        },
        {
          "t": 2.6,
          "r": 0.0332,
          "g": 0.0471,
          "b": 0.054,
          "pos": -0.1018,
          "chrom": 0.1054
        },
        {
          "t": 2.733,
          "r": 0.0333,
          "g": 0.1123,
          "b": 0.1393,
          "pos": 0.4729,
          "chrom": -0.4952
        },
        {
          "t": 2.8,
          "r": 0.0392,
          "g": 0.118,
          "b": 0.1732,
          "pos": 0.4528,
          "chrom": -0.5001
        },
        {
          "t": 2.933,
          "r": 0.0552,
          "g": 0.1474,
          "b": 0.2083,
          "pos": 0.3349,
          "chrom": -0.3899
        },
        {
          "t": 3.0,
          "r": -0.0139,
          "g": -0.0382,
          "b": 0.0266,
          "pos": -0.6822,
          "chrom": 0.7872
        },
        {
          "t": 3.133,
          "r": -0.0045,
          "g": -0.0212,
          "b": 0.0336,
          "pos": -0.8516,
          "chrom": 0.9432
        },
        {
          "t": 3.2,
          "r": -0.0001,
          "g": -0.0038,
          "b": 0.0299,
          "pos": 0.1328,
          "chrom": -0.1789
        },
        {
          "t": 3.333,
          "r": -0.0376,
          "g": -0.0303,
          "b": -0.0195,
          "pos": 0.5707,
          "chrom": -0.5979
        },
        {
          "t": 3.4,
          "r": -0.0795,
          "g": -0.0723,
          "b": -0.0692,
          "pos": 0.5164,
          "chrom": -0.5214
        },
        {
          "t": 3.533,
          "r": -0.0618,
          "g": -0.0874,
          "b": -0.1022,
          "pos": 0.0566,
          "chrom": -0.0858
        },
        {
          "t": 3.6,
          "r": -0.0693,
          "g": -0.1417,
          "b": -0.1691,
          "pos": -0.3052,
          "chrom": 0.309
        },
        {
          "t": 3.733,
          "r": -0.1043,
          "g": -0.1749,
          "b": -0.1995,
          "pos": -0.1768,
          "chrom": 0.2337
        },
        {
          "t": 3.8,
          "r": -0.0981,
          "g": -0.1753,
          "b": -0.195,
          "pos": -0.2974,
          "chrom": 0.3577
        },
        {
          "t": 3.933,
          "r": -0.0406,
          "g": -0.1368,
          "b": -0.1664,
          "pos": -0.0668,
          "chrom": 0.0546
        },
        {
          "t": 4.0,
          "r": 0.0078,
          "g": -0.1431,
          "b": -0.2245,
          "pos": 0.5315,
          "chrom": -0.579
        },
        {
          "t": 4.133,
          "r": 0.0068,
          "g": -0.151,
          "b": -0.2153,
          "pos": 0.0232,
          "chrom": -0.0204
        },
        {
          "t": 4.2,
          "r": 0.064,
          "g": -0.1261,
          "b": -0.2012,
          "pos": -0.196,
          "chrom": 0.2121
        },
        {
          "t": 4.333,
          "r": 0.0428,
          "g": -0.1457,
          "b": -0.2127,
          "pos": 0.141,
          "chrom": -0.1372
        },
        {
          "t": 4.4,
          "r": 0.0528,
          "g": -0.1354,
          "b": -0.1859,
          "pos": -0.1046,
          "chrom": 0.1109
        },
        {
          "t": 4.533,
          "r": -0.0053,
          "g": -0.1348,
          "b": -0.1337,
          "pos": -0.3087,
          "chrom": 0.3493
        },
        {
          "t": 4.6,
          "r": -0.011,
          "g": -0.1145,
          "b": -0.1124,
          "pos": 0.0881,
          "chrom": -0.0895
        },
        {
          "t": 4.733,
          "r": -0.0318,
          "g": -0.0542,
          "b": -0.0235,
          "pos": 0.6908,
          "chrom": -0.7313
        },
        {
          "t": 4.8,
          "r": -0.0938,
          "g": -0.1462,
          "b": -0.115,
          "pos": -0.0837,
          "chrom": 0.14
        },
        {
          "t": 4.933,
          "r": -0.0921,
          "g": -0.0675,
          "b": 0.0138,
          "pos": -1.0635,
          "chrom": 1.1188
        },
        {
          "t": 5.0,
          "r": -0.1348,
          "g": -0.023,
          "b": 0.0491,
          "pos": 0.0134,
          "chrom": -0.0505
        },
        {
          "t": 5.133,
          "r": -0.1886,
          "g": -0.0899,
          "b": -0.0352,
          "pos": 0.9532,
          "chrom": -0.9955
        },
        {
          "t": 5.2,
          "r": -0.2132,
          "g": -0.1222,
          "b": -0.0597,
          "pos": 0.1803,
          "chrom": -0.1756
        },
        {
          "t": 5.333,
          "r": -0.269,
          "g": -0.215,
          "b": -0.1369,
          "pos": -0.3719,
          "chrom": 0.3884
        },
        {
          "t": 5.4,
          "r": -0.271,
          "g": -0.297,
          "b": -0.2538,
          "pos": -0.0391,
          "chrom": 0.0485
        },
        {
          "t": 5.533,
          "r": -0.3347,
          "g": -0.4002,
          "b": -0.354,
          "pos": -0.0833,
          "chrom": 0.128
        },
        {
          "t": 5.6,
          "r": -0.3448,
          "g": -0.4192,
          "b": -0.3747,
          "pos": -0.0965,
          "chrom": 0.1311
        },
        {
          "t": 5.733,
          "r": -0.3407,
          "g": -0.4275,
          "b": -0.3974,
          "pos": 0.0452,
          "chrom": -0.0784
        },
        {
          "t": 5.8,
          "r": -0.3348,
          "g": -0.4285,
          "b": -0.4039,
          "pos": -0.1922,
          "chrom": 0.1722
        },
        {
          "t": 5.933,
          "r": -0.3785,
          "g": -0.46,
          "b": -0.4519,
          "pos": 0.0103,
          "chrom": 0.0041
        },
        {
          "t": 6.0,
          "r": -0.3449,
          "g": -0.4317,
          "b": -0.4333,
          "pos": 0.3853,
          "chrom": -0.3862
        },
        {
          "t": 6.133,
          "r": -0.3745,
          "g": -0.4287,
          "b": -0.4142,
          "pos": 0.1894,
          "chrom": -0.1621
        },
        {
          "t": 6.2,
          "r": -0.3658,
          "g": -0.4071,
          "b": -0.3624,
          "pos": -0.3576,
          "chrom": 0.401
        },
        {
          "t": 6.333,
          "r": -0.3474,
          "g": -0.3589,
          "b": -0.2823,
          "pos": -0.0225,
          "chrom": 0.0063
        },
        {
          "t": 6.4,
          "r": -0.3347,
          "g": -0.33,
          "b": -0.2461,
          "pos": 0.2916,
          "chrom": -0.3498
        },
        {
          "t": 6.533,
          "r": -0.333,
          "g": -0.3154,
          "b": -0.1801,
          "pos": -0.2442,
          "chrom": 0.2515
        },
        {
          "t": 6.6,
          "r": -0.3599,
          "g": -0.3952,
          "b": -0.2969,
          "pos": 0.2125,
          "chrom": -0.1533
        },
        {
          "t": 6.733,
          "r": -0.3375,
          "g": -0.3311,
          "b": -0.2076,
          "pos": 0.1983,
          "chrom": -0.1436
        },
        {
          "t": 6.8,
          "r": -0.3047,
          "g": -0.2856,
          "b": -0.1507,
          "pos": -0.753,
          "chrom": 0.7822
        },
        {
          "t": 6.933,
          "r": -0.2438,
          "g": -0.2079,
          "b": -0.0965,
          "pos": -0.1893,
          "chrom": 0.1351
        },
        {
          "t": 7.0,
          "r": -0.2972,
          "g": -0.1894,
          "b": -0.0998,
          "pos": 0.7413,
          "chrom": -0.8099
        },
        {
          "t": 7.133,
          "r": -0.2398,
          "g": -0.1514,
          "b": -0.0755,
          "pos": 0.2145,
          "chrom": -0.224
        },
        {
          "t": 7.2,
          "r": -0.185,
          "g": -0.1715,
          "b": -0.1421,
          "pos": -0.164,
          "chrom": 0.1994
        },
        {
          "t": 7.333,
          "r": -0.1013,
          "g": -0.0921,
          "b": -0.0584,
          "pos": -0.3914,
          "chrom": 0.5039
        },
        {
          "t": 7.4,
          "r": -0.0007,
          "g": 0.0114,
          "b": 0.0416,
          "pos": -0.3868,
          "chrom": 0.4745
        },
        {
          "t": 7.533,
          "r": 0.1646,
          "g": 0.2095,
          "b": 0.2388,
          "pos": 0.4209,
          "chrom": -0.4929
        },
        {
          "t": 7.6,
          "r": 0.2173,
          "g": 0.2791,
          "b": 0.2999,
          "pos": 0.9444,
          "chrom": -1.0747
        },
        {
          "t": 7.733,
          "r": 0.2091,
          "g": 0.2791,
          "b": 0.2869,
          "pos": 0.2561,
          "chrom": -0.2738
        },
        {
          "t": 7.8,
          "r": 0.1457,
          "g": 0.1598,
          "b": 0.1461,
          "pos": -1.4646,
          "chrom": 1.5
        },
        {
          "t": 7.933,
          "r": 0.077,
          "g": 0.1205,
          "b": 0.0215,
          "pos": -0.8662,
          "chrom": 0.9266
        },
        {
          "t": 8.0,
          "r": 0.0085,
          "g": 0.0656,
          "b": -0.1046,
          "pos": 0.9865,
          "chrom": -0.974
        },
        {
          "t": 8.133,
          "r": -0.0176,
          "g": 0.0535,
          "b": -0.1752,
          "pos": 0.1606,
          "chrom": -0.1593
        },
        {
          "t": 8.2,
          "r": -0.009,
          "g": 0.0698,
          "b": -0.1785,
          "pos": 0.0172,
          "chrom": -0.0305
        },
        {
          "t": 8.333,
          "r": -0.0171,
          "g": 0.0795,
          "b": -0.1948,
          "pos": 1.2155,
          "chrom": -1.2406
        },
        {
          "t": 8.4,
          "r": 0.1042,
          "g": 0.1594,
          "b": -0.0796,
          "pos": -0.0457,
          "chrom": 0.0262
        },
        {
          "t": 8.533,
          "r": 0.164,
          "g": 0.1754,
          "b": -0.0097,
          "pos": -1.2467,
          "chrom": 1.2743
        },
        {
          "t": 8.6,
          "r": 0.1503,
          "g": 0.1598,
          "b": -0.0097,
          "pos": -0.4656,
          "chrom": 0.5023
        },
        {
          "t": 8.733,
          "r": 0.1759,
          "g": 0.1601,
          "b": 0.0216,
          "pos": 0.0338,
          "chrom": -0.023
        },
        {
          "t": 8.8,
          "r": 0.1767,
          "g": 0.1486,
          "b": 0.0297,
          "pos": 0.4685,
          "chrom": -0.4628
        },
        {
          "t": 8.933,
          "r": 0.1715,
          "g": 0.1365,
          "b": 0.0338,
          "pos": 0.5894,
          "chrom": -0.5838
        },
        {
          "t": 9.0,
          "r": 0.2166,
          "g": 0.1415,
          "b": 0.0662,
          "pos": -0.0673,
          "chrom": 0.0604
        },
        {
          "t": 9.133,
          "r": 0.2284,
          "g": 0.1613,
          "b": 0.0975,
          "pos": -0.2416,
          "chrom": 0.2416
        },
        {
          "t": 9.2,
          "r": 0.2332,
          "g": 0.1582,
          "b": 0.1035,
          "pos": -0.1382,
          "chrom": 0.1567
        },
        {
          "t": 9.333,
          "r": 0.2622,
          "g": 0.1868,
          "b": 0.1215,
          "pos": -0.0249,
          "chrom": 0.0282
        },
        {
          "t": 9.4,
          "r": 0.2678,
          "g": 0.1885,
          "b": 0.1216,
          "pos": -0.1202,
          "chrom": 0.1429
        },
        {
          "t": 9.533,
          "r": 0.2732,
          "g": 0.2062,
          "b": 0.1312,
          "pos": -0.1107,
          "chrom": 0.1424
        },
        {
          "t": 9.6,
          "r": 0.2978,
          "g": 0.2327,
          "b": 0.1429,
          "pos": 0.1443,
          "chrom": -0.1663
        },
        {
          "t": 9.733,
          "r": 0.3336,
          "g": 0.2917,
          "b": 0.208,
          "pos": 0.2283,
          "chrom": -0.292
        },
        {
          "t": 9.8,
          "r": 0.3247,
          "g": 0.2805,
          "b": 0.2002,
          "pos": 0.4273,
          "chrom": -0.4507
        },
        {
          "t": 9.933,
          "r": 0.333,
          "g": 0.2613,
          "b": 0.1882,
          "pos": 0.0019,
          "chrom": 0.1316
        },
        {
          "t": 10.0,
          "r": 0.4102,
          "g": 0.2778,
          "b": 0.2319,
          "pos": -0.9203,
          "chrom": 1.0373
        },
        {
          "t": 10.133,
          "r": 0.6015,
          "g": 0.4393,
          "b": 0.3745,
          "pos": -0.2267,
          "chrom": 0.1177
        },
        {
          "t": 10.2,
          "r": 0.5508,
          "g": 0.3867,
          "b": 0.3204,
          "pos": 0.6656,
          "chrom": -0.7538
        },
        {
          "t": 10.333,
          "r": 0.5259,
          "g": 0.4183,
          "b": 0.4207,
          "pos": 0.26,
          "chrom": -0.2392
        },
        {
          "t": 10.4,
          "r": 0.4488,
          "g": 0.3842,
          "b": 0.4163,
          "pos": -0.0159,
          "chrom": 0.0499
        },
        {
          "t": 10.533,
          "r": 0.3824,
          "g": 0.3749,
          "b": 0.4632,
          "pos": 0.0715,
          "chrom": -0.0159
        },
        {
          "t": 10.6,
          "r": 0.374,
          "g": 0.3819,
          "b": 0.4886,
          "pos": -0.3419,
          "chrom": 0.3538
        },
        {
          "t": 10.733,
          "r": 0.3449,
          "g": 0.3736,
          "b": 0.5207,
          "pos": -0.5995,
          "chrom": 0.5709
        },
        {
          "t": 10.8,
          "r": 0.2926,
          "g": 0.2264,
          "b": 0.3019,
          "pos": 0.3665,
          "chrom": -0.3717
        },
        {
          "t": 10.933,
          "r": 0.2393,
          "g": 0.2067,
          "b": 0.3166,
          "pos": 0.648,
          "chrom": -0.6297
        },
        {
          "t": 11.0,
          "r": 0.2282,
          "g": 0.2087,
          "b": 0.3472,
          "pos": -0.0862,
          "chrom": 0.1183
        },
        {
          "t": 11.133,
          "r": 0.2391,
          "g": 0.2258,
          "b": 0.3787,
          "pos": -0.0547,
          "chrom": 0.0421
        },
        {
          "t": 11.2,
          "r": 0.2396,
          "g": 0.2226,
          "b": 0.3801,
          "pos": -0.2708,
          "chrom": 0.2445
        },
        {
          "t": 11.333,
          "r": 0.2181,
          "g": 0.2126,
          "b": 0.3862,
          "pos": -0.5199,
          "chrom": 0.5518
        },
        {
          "t": 11.4,
          "r": 0.2139,
          "g": 0.1327,
          "b": 0.2359,
          "pos": 0.4602,
          "chrom": -0.4375
        },
        {
          "t": 11.533,
          "r": 0.2362,
          "g": 0.1527,
          "b": 0.2473,
          "pos": 0.458,
          "chrom": -0.4573
        },
        {
          "t": 11.6,
          "r": 0.2479,
          "g": 0.158,
          "b": 0.2458,
          "pos": -0.3338,
          "chrom": 0.344
        },
        {
          "t": 11.733,
          "r": 0.2647,
          "g": 0.1693,
          "b": 0.2355,
          "pos": -0.0258,
          "chrom": 0.0167
        },
        {
          "t": 11.8,
          "r": 0.2589,
          "g": 0.1729,
          "b": 0.2286,
          "pos": 0.139,
          "chrom": -0.1476
        },
        {
          "t": 11.933,
          "r": 0.2655,
          "g": 0.1794,
          "b": 0.2396,
          "pos": -0.3733,
          "chrom": 0.4029
        },
        {
          "t": 12.0,
          "r": 0.2958,
          "g": 0.1655,
          "b": 0.1768,
          "pos": -0.0643,
          "chrom": 0.0867
        },
        {
          "t": 12.133,
          "r": 0.3112,
          "g": 0.1861,
          "b": 0.186,
          "pos": 0.4516,
          "chrom": -0.4556
        },
        {
          "t": 12.2,
          "r": 0.321,
          "g": 0.2044,
          "b": 0.2155,
          "pos": 0.1265,
          "chrom": -0.128
        },
        {
          "t": 12.333,
          "r": 0.3387,
          "g": 0.2261,
          "b": 0.2423,
          "pos": -0.1554,
          "chrom": 0.159
        },
        {
          "t": 12.467,
          "r": 0.341,
          "g": 0.2379,
          "b": 0.258,
          "pos": -0.4345,
          "chrom": 0.4595
        },
        {
          "t": 12.533,
          "r": 0.3547,
          "g": 0.2575,
          "b": 0.279,
          "pos": -0.1166,
          "chrom": 0.1208
        },
        {
          "t": 12.667,
          "r": 0.3852,
          "g": 0.2585,
          "b": 0.2422,
          "pos": 0.5023,
          "chrom": -0.5262
        },
        {
          "t": 12.733,
          "r": 0.358,
          "g": 0.2249,
          "b": 0.2214,
          "pos": -0.0211,
          "chrom": 0.0543
        },
        {
          "t": 12.867,
          "r": 0.3776,
          "g": 0.2436,
          "b": 0.2312,
          "pos": 0.2002,
          "chrom": -0.1664
        },
        {
          "t": 12.933,
          "r": 0.3979,
          "g": 0.2665,
          "b": 0.2478,
          "pos": 0.2399,
          "chrom": -0.2505
        },
        {
          "t": 13.067,
          "r": 0.4385,
          "g": 0.2755,
          "b": 0.2682,
          "pos": -0.8494,
          "chrom": 0.8413
        },
        {
          "t": 13.133,
          "r": 0.4313,
          "g": 0.2716,
          "b": 0.2576,
          "pos": -0.4375,
          "chrom": 0.4169
        },
        {
          "t": 13.267,
          "r": 0.3989,
          "g": 0.2175,
          "b": 0.181,
          "pos": 0.8785,
          "chrom": -0.8775
        },
        {
          "t": 13.333,
          "r": 0.3789,
          "g": 0.2022,
          "b": 0.1728,
          "pos": 0.6355,
          "chrom": -0.5945
        },
        {
          "t": 13.467,
          "r": 0.4247,
          "g": 0.242,
          "b": 0.2285,
          "pos": -0.1329,
          "chrom": 0.1637
        },
        {
          "t": 13.533,
          "r": 0.4459,
          "g": 0.2602,
          "b": 0.2483,
          "pos": -0.169,
          "chrom": 0.1775
        },
        {
          "t": 13.667,
          "r": 0.5058,
          "g": 0.3165,
          "b": 0.2927,
          "pos": -0.9028,
          "chrom": 0.8796
        },
        {
          "t": 13.733,
          "r": 0.5416,
          "g": 0.3537,
          "b": 0.3254,
          "pos": -0.6954,
          "chrom": 0.6834
        },
        {
          "t": 13.867,
          "r": 0.4674,
          "g": 0.3226,
          "b": 0.2536,
          "pos": 0.8977,
          "chrom": -0.8533
        },
        {
          "t": 13.933,
          "r": 0.5137,
          "g": 0.3938,
          "b": 0.3222,
          "pos": 0.8577,
          "chrom": -0.8559
        },
        {
          "t": 14.067,
          "r": 0.5377,
          "g": 0.4265,
          "b": 0.3479,
          "pos": 0.2235,
          "chrom": -0.2554
        },
        {
          "t": 14.133,
          "r": 0.5122,
          "g": 0.4075,
          "b": 0.3386,
          "pos": -0.1592,
          "chrom": 0.1858
        },
        {
          "t": 14.267,
          "r": 0.5124,
          "g": 0.4001,
          "b": 0.3189,
          "pos": -0.8925,
          "chrom": 0.9034
        },
        {
          "t": 14.333,
          "r": 0.4668,
          "g": 0.3705,
          "b": 0.2812,
          "pos": -0.4727,
          "chrom": 0.4804
        },
        {
          "t": 14.467,
          "r": 0.3236,
          "g": 0.2494,
          "b": 0.1199,
          "pos": 0.2811,
          "chrom": -0.2174
        },
        {
          "t": 14.533,
          "r": 0.2926,
          "g": 0.2218,
          "b": 0.09,
          "pos": 0.3292,
          "chrom": -0.3213
        },
        {
          "t": 14.667,
          "r": 0.1614,
          "g": 0.1535,
          "b": -0.0009,
          "pos": 0.7437,
          "chrom": -0.814
        },
        {
          "t": 14.733,
          "r": 0.097,
          "g": 0.1224,
          "b": -0.0215,
          "pos": 0.2963,
          "chrom": -0.3418
        },
        {
          "t": 14.867,
          "r": 0.0383,
          "g": 0.1274,
          "b": 0.003,
          "pos": -1.1101,
          "chrom": 1.0667
        },
        {
          "t": 14.933,
          "r": -0.0073,
          "g": 0.1309,
          "b": 0.0268,
          "pos": -0.7438,
          "chrom": 0.7767
        },
        {
          "t": 15.067,
          "r": -0.0936,
          "g": 0.1665,
          "b": 0.0729,
          "pos": 0.5349,
          "chrom": -0.2947
        },
        {
          "t": 15.133,
          "r": -0.0205,
          "g": 0.3595,
          "b": 0.3246,
          "pos": 0.509,
          "chrom": -0.4013
        },
        {
          "t": 15.267,
          "r": 0.1166,
          "g": 0.7059,
          "b": 0.7729,
          "pos": 0.4059,
          "chrom": -0.5278
        },
        {
          "t": 15.333,
          "r": 0.1337,
          "g": 0.7927,
          "b": 0.921,
          "pos": -0.0789,
          "chrom": -0.0102
        },
        {
          "t": 15.467,
          "r": 0.1039,
          "g": 0.8707,
          "b": 1.1053,
          "pos": -0.6271,
          "chrom": 0.3565
        },
        {
          "t": 15.533,
          "r": 0.0845,
          "g": 0.8918,
          "b": 1.1702,
          "pos": -0.1741,
          "chrom": 0.0894
        },
        {
          "t": 15.667,
          "r": -0.2195,
          "g": 0.3695,
          "b": 0.6096,
          "pos": 0.201,
          "chrom": 0.2
        },
        {
          "t": 15.733,
          "r": -0.1447,
          "g": 0.4949,
          "b": 0.7875,
          "pos": 0.2026,
          "chrom": -0.0128
        },
        {
          "t": 15.867,
          "r": -0.1567,
          "g": 0.5497,
          "b": 0.9171,
          "pos": 0.3888,
          "chrom": -0.3777
        },
        {
          "t": 15.933,
          "r": -0.1468,
          "g": 0.5958,
          "b": 0.9997,
          "pos": 0.0009,
          "chrom": -0.0043
        },
        {
          "t": 16.067,
          "r": -0.122,
          "g": 0.5907,
          "b": 1.0185,
          "pos": -0.6445,
          "chrom": 0.2376
        },
        {
          "t": 16.133,
          "r": -0.1407,
          "g": 0.5985,
          "b": 1.0205,
          "pos": -0.3158,
          "chrom": 0.0544
        },
        {
          "t": 16.267,
          "r": -0.6537,
          "g": -0.2286,
          "b": 0.0573,
          "pos": 0.5952,
          "chrom": -0.2474
        },
        {
          "t": 16.333,
          "r": -0.7337,
          "g": -0.2823,
          "b": 0.0118,
          "pos": 0.4716,
          "chrom": -0.1962
        },
        {
          "t": 16.467,
          "r": -0.8471,
          "g": -0.3822,
          "b": -0.0678,
          "pos": -0.4611,
          "chrom": 0.5404
        },
        {
          "t": 16.533,
          "r": -0.8723,
          "g": -0.3669,
          "b": -0.0526,
          "pos": -0.129,
          "chrom": 0.1218
        },
        {
          "t": 16.667,
          "r": -0.9199,
          "g": -0.3516,
          "b": -0.0117,
          "pos": 0.0583,
          "chrom": -0.3528
        },
        {
          "t": 16.733,
          "r": -0.9038,
          "g": -0.3362,
          "b": 0.0106,
          "pos": -0.2851,
          "chrom": 0.1231
        },
        {
          "t": 16.867,
          "r": -1.1798,
          "g": -0.7892,
          "b": -0.5095,
          "pos": 0.482,
          "chrom": -0.308
        },
        {
          "t": 16.933,
          "r": -1.1929,
          "g": -0.7929,
          "b": -0.5217,
          "pos": 0.445,
          "chrom": -0.3428
        },
        {
          "t": 17.067,
          "r": -1.289,
          "g": -0.9197,
          "b": -0.6188,
          "pos": -0.6122,
          "chrom": 0.679
        },
        {
          "t": 17.133,
          "r": -1.3251,
          "g": -0.9571,
          "b": -0.6553,
          "pos": -0.2766,
          "chrom": 0.3224
        },
        {
          "t": 17.267,
          "r": -1.3665,
          "g": -1.0001,
          "b": -0.7023,
          "pos": 0.143,
          "chrom": -0.2514
        },
        {
          "t": 17.333,
          "r": -1.3909,
          "g": -1.0207,
          "b": -0.7107,
          "pos": -0.116,
          "chrom": 0.0353
        },
        {
          "t": 17.467,
          "r": -1.5,
          "g": -1.2259,
          "b": -0.9529,
          "pos": 0.3326,
          "chrom": -0.2694
        },
        {
          "t": 17.533,
          "r": -1.5,
          "g": -1.2475,
          "b": -0.9763,
          "pos": 0.3239,
          "chrom": -0.2656
        },
        {
          "t": 17.667,
          "r": -1.5,
          "g": -1.2657,
          "b": -0.9788,
          "pos": -0.1662,
          "chrom": 0.1678
        },
        {
          "t": 17.733,
          "r": -1.5,
          "g": -1.2748,
          "b": -0.9795,
          "pos": 0.0529,
          "chrom": -0.0719
        },
        {
          "t": 17.867,
          "r": -1.5,
          "g": -1.3056,
          "b": -1.0064,
          "pos": -0.3779,
          "chrom": 0.3829
        },
        {
          "t": 17.933,
          "r": -1.5,
          "g": -1.3031,
          "b": -1.0054,
          "pos": -0.4537,
          "chrom": 0.4814
        },
        {
          "t": 18.067,
          "r": -1.4996,
          "g": -1.3277,
          "b": -1.0796,
          "pos": 0.3481,
          "chrom": -0.3305
        },
        {
          "t": 18.133,
          "r": -1.4942,
          "g": -1.3176,
          "b": -1.0669,
          "pos": 0.3666,
          "chrom": -0.3542
        },
        {
          "t": 18.267,
          "r": -1.4531,
          "g": -1.2875,
          "b": -1.0467,
          "pos": 0.1576,
          "chrom": -0.1658
        },
        {
          "t": 18.333,
          "r": -1.4536,
          "g": -1.2961,
          "b": -1.0432,
          "pos": -0.1936,
          "chrom": 0.1902
        },
        {
          "t": 18.467,
          "r": -1.4622,
          "g": -1.3131,
          "b": -1.0611,
          "pos": -0.2657,
          "chrom": 0.2476
        },
        {
          "t": 18.533,
          "r": -1.4673,
          "g": -1.3221,
          "b": -1.0725,
          "pos": 0.0847,
          "chrom": -0.1009
        },
        {
          "t": 18.667,
          "r": -1.4996,
          "g": -1.4019,
          "b": -1.166,
          "pos": 0.0753,
          "chrom": -0.0357
        },
        {
          "t": 18.733,
          "r": -1.4783,
          "g": -1.3841,
          "b": -1.1525,
          "pos": 0.1486,
          "chrom": -0.118
        },
        {
          "t": 18.867,
          "r": -1.4208,
          "g": -1.3483,
          "b": -1.1251,
          "pos": -0.0242,
          "chrom": 0.0586
        },
        {
          "t": 18.933,
          "r": -1.3367,
          "g": -1.2696,
          "b": -1.0495,
          "pos": -0.2033,
          "chrom": 0.2116
        },
        {
          "t": 19.067,
          "r": -1.1586,
          "g": -1.0956,
          "b": -0.8975,
          "pos": -0.1239,
          "chrom": 0.0621
        },
        {
          "t": 19.133,
          "r": -1.0889,
          "g": -1.0409,
          "b": -0.8473,
          "pos": -0.1397,
          "chrom": 0.1201
        },
        {
          "t": 19.267,
          "r": -0.9314,
          "g": -0.921,
          "b": -0.7765,
          "pos": 0.4226,
          "chrom": -0.3528
        },
        {
          "t": 19.333,
          "r": -0.8262,
          "g": -0.8326,
          "b": -0.6982,
          "pos": 0.3397,
          "chrom": -0.2747
        },
        {
          "t": 19.467,
          "r": -0.5768,
          "g": -0.6234,
          "b": -0.5183,
          "pos": -0.3301,
          "chrom": 0.3151
        },
        {
          "t": 19.533,
          "r": -0.483,
          "g": -0.5457,
          "b": -0.4633,
          "pos": -0.1174,
          "chrom": 0.0672
        },
        {
          "t": 19.667,
          "r": -0.3644,
          "g": -0.4074,
          "b": -0.3353,
          "pos": -0.0565,
          "chrom": 0.0017
        },
        {
          "t": 19.733,
          "r": -0.356,
          "g": -0.3826,
          "b": -0.3012,
          "pos": -0.4377,
          "chrom": 0.4545
        },
        {
          "t": 19.867,
          "r": -0.3452,
          "g": -0.3192,
          "b": -0.2363,
          "pos": 0.5107,
          "chrom": -0.4031
        },
        {
          "t": 19.933,
          "r": -0.2956,
          "g": -0.2206,
          "b": -0.1478,
          "pos": 0.8657,
          "chrom": -0.8334
        },
        {
          "t": 20.067,
          "r": -0.143,
          "g": -0.0457,
          "b": 0.0674,
          "pos": -0.6445,
          "chrom": 0.6146
        },
        {
          "t": 20.133,
          "r": -0.1421,
          "g": -0.0003,
          "b": 0.13,
          "pos": -0.6729,
          "chrom": 0.6735
        },
        {
          "t": 20.267,
          "r": -0.1136,
          "g": 0.1325,
          "b": 0.2958,
          "pos": 0.4068,
          "chrom": -0.4856
        },
        {
          "t": 20.333,
          "r": -0.0953,
          "g": 0.1951,
          "b": 0.3727,
          "pos": 0.4173,
          "chrom": -0.4413
        },
        {
          "t": 20.467,
          "r": -0.1213,
          "g": 0.0635,
          "b": 0.2031,
          "pos": -0.1869,
          "chrom": 0.3405
        },
        {
          "t": 20.533,
          "r": -0.0663,
          "g": 0.1427,
          "b": 0.2841,
          "pos": -0.2096,
          "chrom": 0.2469
        },
        {
          "t": 20.667,
          "r": 0.0205,
          "g": 0.194,
          "b": 0.2896,
          "pos": 0.0624,
          "chrom": -0.198
        },
        {
          "t": 20.733,
          "r": 0.0227,
          "g": 0.1087,
          "b": 0.1569,
          "pos": 0.0323,
          "chrom": -0.0906
        },
        {
          "t": 20.867,
          "r": -0.0197,
          "g": -0.0969,
          "b": -0.1342,
          "pos": -0.3679,
          "chrom": 0.5506
        },
        {
          "t": 20.933,
          "r": 0.0409,
          "g": -0.1097,
          "b": -0.189,
          "pos": -0.0684,
          "chrom": 0.2135
        },
        {
          "t": 21.067,
          "r": 0.2286,
          "g": 0.0647,
          "b": -0.0504,
          "pos": 0.7669,
          "chrom": -0.954
        },
        {
          "t": 21.133,
          "r": 0.2245,
          "g": 0.0872,
          "b": 0.0046,
          "pos": 0.1578,
          "chrom": -0.3415
        },
        {
          "t": 21.267,
          "r": 0.1776,
          "g": 0.0718,
          "b": 0.0404,
          "pos": -0.6569,
          "chrom": 0.7789
        },
        {
          "t": 21.333,
          "r": 0.1887,
          "g": 0.0823,
          "b": 0.0478,
          "pos": -0.3402,
          "chrom": 0.5307
        },
        {
          "t": 21.467,
          "r": 0.4053,
          "g": 0.3065,
          "b": 0.2404,
          "pos": 0.701,
          "chrom": -0.7009
        },
        {
          "t": 21.533,
          "r": 0.5187,
          "g": 0.4267,
          "b": 0.3393,
          "pos": 0.6029,
          "chrom": -0.6794
        },
        {
          "t": 21.667,
          "r": 0.6851,
          "g": 0.5934,
          "b": 0.4905,
          "pos": -0.7446,
          "chrom": 0.6866
        },
        {
          "t": 21.733,
          "r": 0.7061,
          "g": 0.6464,
          "b": 0.5119,
          "pos": -0.4761,
          "chrom": 0.4388
        },
        {
          "t": 21.867,
          "r": 0.6457,
          "g": 0.7002,
          "b": 0.5725,
          "pos": -0.084,
          "chrom": 0.1978
        },
        {
          "t": 21.933,
          "r": 0.6302,
          "g": 0.7409,
          "b": 0.6248,
          "pos": -0.2102,
          "chrom": 0.3375
        },
        {
          "t": 22.067,
          "r": 0.6575,
          "g": 0.9111,
          "b": 0.8373,
          "pos": 0.7736,
          "chrom": -0.9002
        },
        {
          "t": 22.133,
          "r": 0.7153,
          "g": 1.0372,
          "b": 0.9928,
          "pos": 1.0711,
          "chrom": -1.2141
        },
        {
          "t": 22.267,
          "r": 0.653,
          "g": 0.8958,
          "b": 0.8759,
          "pos": -0.2911,
          "chrom": 0.3333
        },
        {
          "t": 22.333,
          "r": 0.6561,
          "g": 0.9961,
          "b": 1.0661,
          "pos": -0.812,
          "chrom": 0.943
        },
        {
          "t": 22.467,
          "r": 0.4874,
          "g": 1.0377,
          "b": 1.2157,
          "pos": -0.3853,
          "chrom": 0.5729
        },
        {
          "t": 22.533,
          "r": 0.6492,
          "g": 1.3245,
          "b": 1.5,
          "pos": -0.3182,
          "chrom": 0.2974
        },
        {
          "t": 22.667,
          "r": 0.6533,
          "g": 1.467,
          "b": 1.5,
          "pos": -0.4351,
          "chrom": 0.0861
        },
        {
          "t": 22.733,
          "r": 0.6909,
          "g": 1.5,
          "b": 1.5,
          "pos": -0.0803,
          "chrom": -0.0571
        },
        {
          "t": 22.867,
          "r": 0.4753,
          "g": 1.0719,
          "b": 1.2469,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 22.933,
          "r": 0.4734,
          "g": 1.1086,
          "b": 1.2988,
          "pos": 1.4524,
          "chrom": -1.2285
        },
        {
          "t": 23.067,
          "r": 0.5967,
          "g": 1.1953,
          "b": 1.495,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 23.133,
          "r": 0.56,
          "g": 1.186,
          "b": 1.5,
          "pos": -1.4451,
          "chrom": 1.3672
        },
        {
          "t": 23.267,
          "r": 0.3886,
          "g": 0.9795,
          "b": 1.2812,
          "pos": 0.5885,
          "chrom": -0.9081
        },
        {
          "t": 23.333,
          "r": 0.2215,
          "g": 0.7399,
          "b": 0.9994,
          "pos": 0.2727,
          "chrom": -0.4605
        },
        {
          "t": 23.467,
          "r": -0.0833,
          "g": 0.0695,
          "b": 0.1836,
          "pos": -0.817,
          "chrom": 1.064
        },
        {
          "t": 23.533,
          "r": -0.312,
          "g": -0.1966,
          "b": -0.1651,
          "pos": 0.7908,
          "chrom": -0.5013
        },
        {
          "t": 23.667,
          "r": -0.1733,
          "g": -0.1491,
          "b": -0.1783,
          "pos": 0.8384,
          "chrom": -0.7019
        },
        {
          "t": 23.733,
          "r": -0.0307,
          "g": -0.0431,
          "b": -0.0846,
          "pos": -0.5706,
          "chrom": 0.5665
        },
        {
          "t": 23.867,
          "r": 0.3315,
          "g": 0.3302,
          "b": 0.2844,
          "pos": 0.078,
          "chrom": -0.4186
        },
        {
          "t": 23.933,
          "r": 0.427,
          "g": 0.4497,
          "b": 0.4196,
          "pos": -0.1397,
          "chrom": -0.0935
        },
        {
          "t": 24.067,
          "r": 0.3516,
          "g": 0.3702,
          "b": 0.387,
          "pos": -0.7213,
          "chrom": 0.9326
        },
        {
          "t": 24.133,
          "r": 0.3638,
          "g": 0.3943,
          "b": 0.4151,
          "pos": 0.0932,
          "chrom": 0.0855
        },
        {
          "t": 24.267,
          "r": 0.365,
          "g": 0.4092,
          "b": 0.4362,
          "pos": 0.6321,
          "chrom": -0.571
        },
        {
          "t": 24.333,
          "r": 0.3412,
          "g": 0.3989,
          "b": 0.446,
          "pos": 0.2799,
          "chrom": -0.2515
        },
        {
          "t": 24.467,
          "r": 0.327,
          "g": 0.3954,
          "b": 0.4642,
          "pos": -0.3211,
          "chrom": 0.1256
        },
        {
          "t": 24.533,
          "r": 0.3375,
          "g": 0.4194,
          "b": 0.4911,
          "pos": -0.0743,
          "chrom": -0.0578
        },
        {
          "t": 24.667,
          "r": 0.1266,
          "g": 0.0961,
          "b": 0.1259,
          "pos": 0.0464,
          "chrom": 0.1417
        },
        {
          "t": 24.733,
          "r": 0.1378,
          "g": 0.1181,
          "b": 0.1603,
          "pos": -0.1572,
          "chrom": 0.2859
        },
        {
          "t": 24.867,
          "r": 0.1591,
          "g": 0.1574,
          "b": 0.1912,
          "pos": -0.0024,
          "chrom": -0.0102
        },
        {
          "t": 25.0,
          "r": 0.1441,
          "g": 0.2006,
          "b": 0.2552,
          "pos": -0.0994,
          "chrom": 0.022
        },
        {
          "t": 25.067,
          "r": 0.1433,
          "g": 0.21,
          "b": 0.266,
          "pos": -0.0402,
          "chrom": -0.0824
        },
        {
          "t": 25.2,
          "r": 0.0159,
          "g": 0.0203,
          "b": 0.0429,
          "pos": 0.2071,
          "chrom": -0.133
        },
        {
          "t": 25.267,
          "r": 0.0139,
          "g": 0.0145,
          "b": 0.0295,
          "pos": 0.2254,
          "chrom": -0.0951
        },
        {
          "t": 25.4,
          "r": 0.0207,
          "g": 0.0298,
          "b": 0.0526,
          "pos": 0.0289,
          "chrom": -0.002
        },
        {
          "t": 25.467,
          "r": -0.0012,
          "g": 0.0151,
          "b": 0.0392,
          "pos": -0.0961,
          "chrom": 0.1232
        },
        {
          "t": 25.6,
          "r": 0.0416,
          "g": 0.0536,
          "b": 0.0749,
          "pos": -0.3846,
          "chrom": 0.307
        },
        {
          "t": 25.667,
          "r": 0.0302,
          "g": 0.0482,
          "b": 0.0648,
          "pos": -0.2095,
          "chrom": 0.068
        },
        {
          "t": 25.8,
          "r": -0.1145,
          "g": -0.1117,
          "b": -0.1156,
          "pos": 0.3198,
          "chrom": -0.2526
        },
        {
          "t": 25.867,
          "r": -0.1116,
          "g": -0.113,
          "b": -0.1148,
          "pos": 0.2561,
          "chrom": -0.1143
        },
        {
          "t": 26.0,
          "r": -0.0869,
          "g": -0.103,
          "b": -0.1156,
          "pos": 0.0757,
          "chrom": -0.0366
        },
        {
          "t": 26.067,
          "r": -0.0825,
          "g": -0.0969,
          "b": -0.111,
          "pos": 0.0557,
          "chrom": -0.0317
        },
        {
          "t": 26.2,
          "r": -0.0362,
          "g": -0.0483,
          "b": -0.0547,
          "pos": -0.2488,
          "chrom": 0.1528
        },
        {
          "t": 26.267,
          "r": -0.0201,
          "g": -0.0326,
          "b": -0.0373,
          "pos": -0.4324,
          "chrom": 0.2594
        },
        {
          "t": 26.4,
          "r": -0.2031,
          "g": -0.2276,
          "b": -0.2343,
          "pos": 0.1602,
          "chrom": -0.0633
        },
        {
          "t": 26.467,
          "r": -0.2142,
          "g": -0.2368,
          "b": -0.2541,
          "pos": 0.4683,
          "chrom": -0.2686
        },
        {
          "t": 26.6,
          "r": -0.1249,
          "g": -0.1488,
          "b": -0.1635,
          "pos": 0.0758,
          "chrom": -0.0766
        },
        {
          "t": 26.667,
          "r": -0.0705,
          "g": -0.0914,
          "b": -0.1144,
          "pos": 0.0651,
          "chrom": -0.1277
        },
        {
          "t": 26.8,
          "r": -0.0353,
          "g": -0.0728,
          "b": -0.1038,
          "pos": -0.3333,
          "chrom": 0.3047
        },
        {
          "t": 26.867,
          "r": -0.0246,
          "g": -0.0568,
          "b": -0.0871,
          "pos": -0.6505,
          "chrom": 0.6248
        },
        {
          "t": 27.0,
          "r": -0.0445,
          "g": -0.0685,
          "b": -0.1278,
          "pos": 0.3517,
          "chrom": -0.3313
        },
        {
          "t": 27.067,
          "r": -0.0532,
          "g": -0.0741,
          "b": -0.1361,
          "pos": 0.6748,
          "chrom": -0.6275
        },
        {
          "t": 27.2,
          "r": -0.0118,
          "g": -0.0319,
          "b": -0.09,
          "pos": -0.0596,
          "chrom": 0.0838
        },
        {
          "t": 27.267,
          "r": 0.0081,
          "g": -0.0142,
          "b": -0.0805,
          "pos": -0.0872,
          "chrom": 0.0988
        },
        {
          "t": 27.4,
          "r": 0.0652,
          "g": 0.0493,
          "b": -0.0134,
          "pos": -0.104,
          "chrom": 0.0701
        },
        {
          "t": 27.467,
          "r": 0.0937,
          "g": 0.0821,
          "b": 0.0276,
          "pos": -0.439,
          "chrom": 0.4164
        },
        {
          "t": 27.6,
          "r": 0.11,
          "g": 0.0814,
          "b": 0.0365,
          "pos": -0.256,
          "chrom": 0.3162
        },
        {
          "t": 27.667,
          "r": 0.1991,
          "g": 0.181,
          "b": 0.1448,
          "pos": 0.0659,
          "chrom": -0.038
        },
        {
          "t": 27.8,
          "r": 0.2429,
          "g": 0.3024,
          "b": 0.329,
          "pos": 0.9064,
          "chrom": -0.9492
        },
        {
          "t": 27.867,
          "r": 0.2248,
          "g": 0.3132,
          "b": 0.3684,
          "pos": 1.4856,
          "chrom": -1.4826
        },
        {
          "t": 28.0,
          "r": 0.2899,
          "g": 0.4421,
          "b": 0.6325,
          "pos": -1.2236,
          "chrom": 1.2764
        },
        {
          "t": 28.067,
          "r": 0.2718,
          "g": 0.4571,
          "b": 0.6907,
          "pos": -1.5,
          "chrom": 1.5
        },
        {
          "t": 28.2,
          "r": 0.2165,
          "g": 0.2899,
          "b": 0.422,
          "pos": 0.6902,
          "chrom": -0.7127
        },
        {
          "t": 28.267,
          "r": 0.2161,
          "g": 0.2604,
          "b": 0.3802,
          "pos": 1.5,
          "chrom": -1.5
        },
        {
          "t": 28.4,
          "r": 0.2123,
          "g": 0.2664,
          "b": 0.4136,
          "pos": 0.2765,
          "chrom": -0.2623
        },
        {
          "t": 28.467,
          "r": 0.221,
          "g": 0.289,
          "b": 0.4433,
          "pos": 0.1561,
          "chrom": -0.1635
        },
        {
          "t": 28.6,
          "r": 0.2248,
          "g": 0.2972,
          "b": 0.4622,
          "pos": -0.5351,
          "chrom": 0.5434
        },
        {
          "t": 28.667,
          "r": 0.2664,
          "g": 0.3611,
          "b": 0.5453,
          "pos": -1.1741,
          "chrom": 1.1603
        },
        {
          "t": 28.8,
          "r": 0.2674,
          "g": 0.284,
          "b": 0.3884,
          "pos": 0.1416,
          "chrom": -0.1421
        },
        {
          "t": 28.867,
          "r": 0.2741,
          "g": 0.2788,
          "b": 0.3649,
          "pos": 0.818,
          "chrom": -0.7998
        },
        {
          "t": 29.0,
          "r": 0.2727,
          "g": 0.2688,
          "b": 0.3438,
          "pos": 0.2727,
          "chrom": -0.2436
        },
        {
          "t": 29.067,
          "r": 0.2757,
          "g": 0.2731,
          "b": 0.342,
          "pos": 0.1794,
          "chrom": -0.1527
        },
        {
          "t": 29.2,
          "r": 0.2869,
          "g": 0.2841,
          "b": 0.3533,
          "pos": -0.3363,
          "chrom": 0.3076
        },
        {
          "t": 29.267,
          "r": 0.2937,
          "g": 0.2911,
          "b": 0.3601,
          "pos": -0.7381,
          "chrom": 0.6957
        },
        {
          "t": 29.4,
          "r": 0.2352,
          "g": 0.1721,
          "b": 0.1924,
          "pos": 0.1021,
          "chrom": -0.0759
        },
        {
          "t": 29.467,
          "r": 0.2387,
          "g": 0.1676,
          "b": 0.1722,
          "pos": 0.6257,
          "chrom": -0.5849
        },
        {
          "t": 29.6,
          "r": 0.2413,
          "g": 0.1681,
          "b": 0.1768,
          "pos": 0.2032,
          "chrom": -0.174
        },
        {
          "t": 29.667,
          "r": 0.254,
          "g": 0.182,
          "b": 0.1958,
          "pos": -0.2443,
          "chrom": 0.2896
        },
        {
          "t": 29.8,
          "r": 0.2843,
          "g": 0.2111,
          "b": 0.2234,
          "pos": -0.2995,
          "chrom": 0.2683
        },
        {
          "t": 29.867,
          "r": 0.2894,
          "g": 0.2269,
          "b": 0.2358,
          "pos": 0.1142,
          "chrom": -0.2227
        },
        {
          "t": 30.0,
          "r": 0.1859,
          "g": 0.088,
          "b": 0.0883,
          "pos": 0.0478,
          "chrom": -0.0091
        },
        {
          "t": 30.067,
          "r": 0.1615,
          "g": 0.0547,
          "b": 0.0594,
          "pos": -0.133,
          "chrom": 0.2383
        },
        {
          "t": 30.2,
          "r": 0.148,
          "g": 0.0531,
          "b": 0.0591,
          "pos": 0.1667,
          "chrom": -0.1746
        },
        {
          "t": 30.267,
          "r": 0.1332,
          "g": 0.03,
          "b": 0.0412,
          "pos": 0.0238,
          "chrom": -0.0187
        },
        {
          "t": 30.4,
          "r": 0.1154,
          "g": 0.0034,
          "b": 0.0167,
          "pos": -0.0721,
          "chrom": 0.0899
        },
        {
          "t": 30.467,
          "r": 0.1124,
          "g": -0.0053,
          "b": 0.0027,
          "pos": 0.1301,
          "chrom": -0.1684
        },
        {
          "t": 30.6,
          "r": 0.12,
          "g": -0.0255,
          "b": -0.0267,
          "pos": -0.0516,
          "chrom": 0.0263
        },
        {
          "t": 30.667,
          "r": 0.0864,
          "g": -0.0695,
          "b": -0.0731,
          "pos": -0.1928,
          "chrom": 0.2189
        },
        {
          "t": 30.8,
          "r": 0.0438,
          "g": -0.0922,
          "b": -0.0927,
          "pos": 0.0709,
          "chrom": -0.02
        },
        {
          "t": 30.867,
          "r": 0.0392,
          "g": -0.082,
          "b": -0.0852,
          "pos": 0.0869,
          "chrom": -0.0463
        },
        {
          "t": 31.0,
          "r": 0.0736,
          "g": -0.0757,
          "b": -0.0958,
          "pos": -0.0267,
          "chrom": 0.0037
        },
        {
          "t": 31.067,
          "r": 0.0704,
          "g": -0.0675,
          "b": -0.0932,
          "pos": 0.0826,
          "chrom": -0.1356
        },
        {
          "t": 31.2,
          "r": 0.0814,
          "g": -0.0501,
          "b": -0.0757,
          "pos": 0.0803,
          "chrom": -0.105
        },
        {
          "t": 31.267,
          "r": 0.0459,
          "g": -0.0621,
          "b": -0.0771,
          "pos": 0.0088,
          "chrom": 0.0196
        },
        {
          "t": 31.4,
          "r": 0.047,
          "g": 0.0107,
          "b": 0.0314,
          "pos": -0.1732,
          "chrom": 0.2794
        },
        {
          "t": 31.467,
          "r": 0.0598,
          "g": 0.0713,
          "b": 0.1101,
          "pos": -0.1187,
          "chrom": 0.1868
        },
        {
          "t": 31.6,
          "r": 0.16,
          "g": 0.2622,
          "b": 0.3366,
          "pos": -0.1089,
          "chrom": 0.0212
        },
        {
          "t": 31.667,
          "r": 0.1542,
          "g": 0.2998,
          "b": 0.4047,
          "pos": -0.0678,
          "chrom": -0.0456
        },
        {
          "t": 31.8,
          "r": 0.0944,
          "g": 0.1994,
          "b": 0.2819,
          "pos": 0.6121,
          "chrom": -0.584
        },
        {
          "t": 31.867,
          "r": 0.0786,
          "g": 0.1759,
          "b": 0.2693,
          "pos": 0.3753,
          "chrom": -0.2819
        },
        {
          "t": 32.0,
          "r": 0.0367,
          "g": 0.24,
          "b": 0.4203,
          "pos": -0.6289,
          "chrom": 0.675
        },
        {
          "t": 32.067,
          "r": 0.0279,
          "g": 0.2545,
          "b": 0.4372,
          "pos": -0.3481,
          "chrom": 0.3581
        },
        {
          "t": 32.2,
          "r": -0.0344,
          "g": 0.191,
          "b": 0.3708,
          "pos": 0.0601,
          "chrom": -0.0855
        },
        {
          "t": 32.267,
          "r": -0.0603,
          "g": 0.1515,
          "b": 0.3202,
          "pos": -0.0474,
          "chrom": -0.0012
        },
        {
          "t": 32.4,
          "r": -0.1615,
          "g": -0.0682,
          "b": 0.0325,
          "pos": 0.4217,
          "chrom": -0.4234
        },
        {
          "t": 32.467,
          "r": -0.1829,
          "g": -0.12,
          "b": -0.0364,
          "pos": 0.3619,
          "chrom": -0.3138
        },
        {
          "t": 32.6,
          "r": -0.2678,
          "g": -0.2386,
          "b": -0.1506,
          "pos": -0.4089,
          "chrom": 0.4483
        },
        {
          "t": 32.667,
          "r": -0.2878,
          "g": -0.2765,
          "b": -0.1966,
          "pos": -0.4783,
          "chrom": 0.4764
        },
        {
          "t": 32.8,
          "r": -0.331,
          "g": -0.3517,
          "b": -0.2881,
          "pos": 0.2311,
          "chrom": -0.2525
        },
        {
          "t": 32.867,
          "r": -0.3446,
          "g": -0.3794,
          "b": -0.3265,
          "pos": 0.6163,
          "chrom": -0.6357
        },
        {
          "t": 33.0,
          "r": -0.2939,
          "g": -0.3878,
          "b": -0.3437,
          "pos": -0.1294,
          "chrom": 0.1636
        },
        {
          "t": 33.067,
          "r": -0.2915,
          "g": -0.4076,
          "b": -0.3649,
          "pos": -0.4762,
          "chrom": 0.5526
        },
        {
          "t": 33.2,
          "r": -0.1507,
          "g": -0.2971,
          "b": -0.2999,
          "pos": -0.0112,
          "chrom": -0.0117
        },
        {
          "t": 33.267,
          "r": -0.1112,
          "g": -0.2576,
          "b": -0.2705,
          "pos": 0.0732,
          "chrom": -0.1317
        },
        {
          "t": 33.4,
          "r": -0.0653,
          "g": -0.1974,
          "b": -0.2325,
          "pos": 0.0427,
          "chrom": -0.0254
        },
        {
          "t": 33.467,
          "r": -0.0272,
          "g": -0.1462,
          "b": -0.182,
          "pos": -0.1119,
          "chrom": 0.1337
        },
        {
          "t": 33.6,
          "r": 0.035,
          "g": -0.0476,
          "b": -0.0944,
          "pos": 0.1981,
          "chrom": -0.1903
        },
        {
          "t": 33.667,
          "r": 0.0581,
          "g": -0.0086,
          "b": -0.056,
          "pos": 0.2843,
          "chrom": -0.2505
        },
        {
          "t": 33.8,
          "r": 0.1385,
          "g": 0.0984,
          "b": 0.0678,
          "pos": -0.099,
          "chrom": 0.1072
        },
        {
          "t": 33.867,
          "r": 0.1735,
          "g": 0.1454,
          "b": 0.1123,
          "pos": 0.1817,
          "chrom": -0.1976
        },
        {
          "t": 34.0,
          "r": 0.1996,
          "g": 0.2334,
          "b": 0.2425,
          "pos": -0.2518,
          "chrom": 0.2473
        },
        {
          "t": 34.067,
          "r": 0.2203,
          "g": 0.2693,
          "b": 0.2869,
          "pos": -0.5537,
          "chrom": 0.5215
        },
        {
          "t": 34.2,
          "r": 0.188,
          "g": 0.2267,
          "b": 0.2286,
          "pos": -0.0187,
          "chrom": 0.0544
        },
        {
          "t": 34.267,
          "r": 0.1993,
          "g": 0.2358,
          "b": 0.2322,
          "pos": 0.1911,
          "chrom": -0.0972
        },
        {
          "t": 34.4,
          "r": 0.2452,
          "g": 0.2751,
          "b": 0.261,
          "pos": 0.5975,
          "chrom": -0.6208
        },
        {
          "t": 34.467,
          "r": 0.2932,
          "g": 0.3253,
          "b": 0.3244,
          "pos": 0.2458,
          "chrom": -0.2955
        },
        {
          "t": 34.6,
          "r": 0.2814,
          "g": 0.3021,
          "b": 0.3344,
          "pos": -0.4727,
          "chrom": 0.4868
        },
        {
          "t": 34.667,
          "r": 0.3167,
          "g": 0.3219,
          "b": 0.353,
          "pos": -0.3977,
          "chrom": 0.3877
        },
        {
          "t": 34.8,
          "r": 0.2969,
          "g": 0.2648,
          "b": 0.2973,
          "pos": 0.0931,
          "chrom": -0.0704
        },
        {
          "t": 34.867,
          "r": 0.2833,
          "g": 0.2495,
          "b": 0.2781,
          "pos": 0.6596,
          "chrom": -0.6288
        },
        {
          "t": 35.0,
          "r": 0.3193,
          "g": 0.2588,
          "b": 0.3005,
          "pos": -0.1465,
          "chrom": 0.1542
        },
        {
          "t": 35.067,
          "r": 0.3222,
          "g": 0.2541,
          "b": 0.299,
          "pos": -0.5621,
          "chrom": 0.5902
        },
        {
          "t": 35.2,
          "r": 0.3298,
          "g": 0.2699,
          "b": 0.2944,
          "pos": 0.1121,
          "chrom": -0.1213
        },
        {
          "t": 35.267,
          "r": 0.3379,
          "g": 0.2746,
          "b": 0.2976,
          "pos": -0.0617,
          "chrom": 0.0413
        },
        {
          "t": 35.4,
          "r": 0.3344,
          "g": 0.2592,
          "b": 0.2621,
          "pos": -0.012,
          "chrom": 0.0242
        },
        {
          "t": 35.467,
          "r": 0.3372,
          "g": 0.2681,
          "b": 0.2698,
          "pos": 0.3028,
          "chrom": -0.2915
        },
        {
          "t": 35.6,
          "r": 0.3492,
          "g": 0.2751,
          "b": 0.276,
          "pos": 0.2543,
          "chrom": -0.2468
        },
        {
          "t": 35.667,
          "r": 0.3524,
          "g": 0.2745,
          "b": 0.2807,
          "pos": 0.076,
          "chrom": -0.0589
        },
        {
          "t": 35.8,
          "r": 0.3824,
          "g": 0.2968,
          "b": 0.3159,
          "pos": -0.3508,
          "chrom": 0.3564
        },
        {
          "t": 35.867,
          "r": 0.3931,
          "g": 0.3014,
          "b": 0.3175,
          "pos": -0.3737,
          "chrom": 0.3577
        },
        {
          "t": 36.0,
          "r": 0.3896,
          "g": 0.2647,
          "b": 0.2564,
          "pos": 0.04,
          "chrom": -0.0195
        },
        {
          "t": 36.067,
          "r": 0.3797,
          "g": 0.2537,
          "b": 0.2393,
          "pos": 0.1604,
          "chrom": -0.1183
        },
        {
          "t": 36.2,
          "r": 0.4141,
          "g": 0.2879,
          "b": 0.2588,
          "pos": 0.3337,
          "chrom": -0.3501
        },
        {
          "t": 36.267,
          "r": 0.4057,
          "g": 0.282,
          "b": 0.2567,
          "pos": 0.2177,
          "chrom": -0.2266
        },
        {
          "t": 36.4,
          "r": 0.4192,
          "g": 0.2891,
          "b": 0.2722,
          "pos": -0.4835,
          "chrom": 0.4976
        },
        {
          "t": 36.467,
          "r": 0.4255,
          "g": 0.3032,
          "b": 0.2863,
          "pos": -0.366,
          "chrom": 0.3582
        },
        {
          "t": 36.6,
          "r": 0.3916,
          "g": 0.2839,
          "b": 0.2652,
          "pos": 0.495,
          "chrom": -0.4877
        },
        {
          "t": 36.667,
          "r": 0.4052,
          "g": 0.2846,
          "b": 0.2616,
          "pos": 0.3904,
          "chrom": -0.3732
        },
        {
          "t": 36.8,
          "r": 0.4309,
          "g": 0.2828,
          "b": 0.2663,
          "pos": -0.3124,
          "chrom": 0.3305
        },
        {
          "t": 36.867,
          "r": 0.4412,
          "g": 0.2837,
          "b": 0.267,
          "pos": -0.5326,
          "chrom": 0.5632
        },
        {
          "t": 37.0,
          "r": 0.4584,
          "g": 0.2727,
          "b": 0.2269,
          "pos": 0.1214,
          "chrom": -0.1371
        },
        {
          "t": 37.067,
          "r": 0.4589,
          "g": 0.2725,
          "b": 0.2219,
          "pos": 0.619,
          "chrom": -0.6581
        },
        {
          "t": 37.2,
          "r": 0.4331,
          "g": 0.2329,
          "b": 0.1845,
          "pos": 0.0228,
          "chrom": 0.0001
        },
        {
          "t": 37.333,
          "r": 0.4292,
          "g": 0.2199,
          "b": 0.1635,
          "pos": -0.1909,
          "chrom": 0.2078
        },
        {
          "t": 37.4,
          "r": 0.4334,
          "g": 0.2236,
          "b": 0.1481,
          "pos": 0.0526,
          "chrom": -0.062
        },
        {
          "t": 37.533,
          "r": 0.414,
          "g": 0.208,
          "b": 0.1215,
          "pos": -0.1543,
          "chrom": 0.1715
        },
        {
          "t": 37.6,
          "r": 0.4099,
          "g": 0.2032,
          "b": 0.1189,
          "pos": -0.5268,
          "chrom": 0.5732
        },
        {
          "t": 37.733,
          "r": 0.4194,
          "g": 0.223,
          "b": 0.1232,
          "pos": -0.0376,
          "chrom": 0.0393
        },
        {
          "t": 37.8,
          "r": 0.4209,
          "g": 0.2181,
          "b": 0.0893,
          "pos": 0.9101,
          "chrom": -0.9531
        },
        {
          "t": 37.933,
          "r": 0.4184,
          "g": 0.2058,
          "b": 0.0883,
          "pos": 0.5679,
          "chrom": -0.5813
        },
        {
          "t": 38.0,
          "r": 0.4272,
          "g": 0.209,
          "b": 0.1311,
          "pos": -0.5809,
          "chrom": 0.6106
        },
        {
          "t": 38.133,
          "r": 0.4182,
          "g": 0.1971,
          "b": 0.1287,
          "pos": -0.6645,
          "chrom": 0.6959
        },
        {
          "t": 38.2,
          "r": 0.4082,
          "g": 0.1949,
          "b": 0.1233,
          "pos": -0.0594,
          "chrom": 0.0726
        },
        {
          "t": 38.333,
          "r": 0.3866,
          "g": 0.2092,
          "b": 0.1421,
          "pos": 0.1997,
          "chrom": -0.1998
        },
        {
          "t": 38.4,
          "r": 0.367,
          "g": 0.2171,
          "b": 0.1672,
          "pos": 0.0785,
          "chrom": -0.0773
        },
        {
          "t": 38.533,
          "r": 0.3537,
          "g": 0.2397,
          "b": 0.1893,
          "pos": 0.1377,
          "chrom": -0.1287
        },
        {
          "t": 38.6,
          "r": 0.3483,
          "g": 0.2444,
          "b": 0.1905,
          "pos": 0.3284,
          "chrom": -0.3329
        },
        {
          "t": 38.733,
          "r": 0.3672,
          "g": 0.2597,
          "b": 0.2006,
          "pos": 0.102,
          "chrom": -0.1035
        },
        {
          "t": 38.8,
          "r": 0.3716,
          "g": 0.2521,
          "b": 0.2017,
          "pos": -0.5103,
          "chrom": 0.5363
        },
        {
          "t": 38.933,
          "r": 0.395,
          "g": 0.2649,
          "b": 0.209,
          "pos": -0.3592,
          "chrom": 0.3725
        },
        {
          "t": 39.0,
          "r": 0.3678,
          "g": 0.2565,
          "b": 0.1897,
          "pos": 0.3525,
          "chrom": -0.3569
        },
        {
          "t": 39.133,
          "r": 0.3775,
          "g": 0.2751,
          "b": 0.2212,
          "pos": 0.2072,
          "chrom": -0.2004
        },
        {
          "t": 39.2,
          "r": 0.3768,
          "g": 0.2718,
          "b": 0.218,
          "pos": -0.0931,
          "chrom": 0.1065
        },
        {
          "t": 39.333,
          "r": 0.3934,
          "g": 0.2903,
          "b": 0.2321,
          "pos": 0.1598,
          "chrom": -0.1593
        },
        {
          "t": 39.4,
          "r": 0.3838,
          "g": 0.2743,
          "b": 0.2123,
          "pos": 0.0872,
          "chrom": -0.0902
        },
        {
          "t": 39.533,
          "r": 0.4149,
          "g": 0.255,
          "b": 0.1731,
          "pos": -0.3156,
          "chrom": 0.3262
        },
        {
          "t": 39.6,
          "r": 0.4145,
          "g": 0.2536,
          "b": 0.166,
          "pos": -0.3484,
          "chrom": 0.3752
        },
        {
          "t": 39.733,
          "r": 0.4034,
          "g": 0.2508,
          "b": 0.1605,
          "pos": 0.0211,
          "chrom": -0.0069
        },
        {
          "t": 39.8,
          "r": 0.4067,
          "g": 0.2599,
          "b": 0.1656,
          "pos": 0.5377,
          "chrom": -0.5544
        },
        {
          "t": 39.933,
          "r": 0.4044,
          "g": 0.2514,
          "b": 0.1656,
          "pos": 0.3756,
          "chrom": -0.3905
        },
        {
          "t": 40.0,
          "r": 0.4297,
          "g": 0.2353,
          "b": 0.1625,
          "pos": -0.4236,
          "chrom": 0.4467
        },
        {
          "t": 40.133,
          "r": 0.4309,
          "g": 0.2342,
          "b": 0.1701,
          "pos": -0.3177,
          "chrom": 0.3363
        },
        {
          "t": 40.2,
          "r": 0.4204,
          "g": 0.2234,
          "b": 0.161,
          "pos": 0.177,
          "chrom": -0.1777
        },
        {
          "t": 40.333,
          "r": 0.4206,
          "g": 0.2246,
          "b": 0.168,
          "pos": 0.0413,
          "chrom": -0.0247
        },
        {
          "t": 40.4,
          "r": 0.4197,
          "g": 0.2231,
          "b": 0.171,
          "pos": -0.0597,
          "chrom": 0.0654
        },
        {
          "t": 40.533,
          "r": 0.4108,
          "g": 0.2322,
          "b": 0.1749,
          "pos": -0.0109,
          "chrom": 0.0166
        },
        {
          "t": 40.6,
          "r": 0.3894,
          "g": 0.2228,
          "b": 0.1711,
          "pos": 0.0507,
          "chrom": -0.038
        },
        {
          "t": 40.733,
          "r": 0.3894,
          "g": 0.2538,
          "b": 0.1969,
          "pos": 0.2384,
          "chrom": -0.2693
        },
        {
          "t": 40.8,
          "r": 0.3716,
          "g": 0.2433,
          "b": 0.1833,
          "pos": -0.0161,
          "chrom": 0.0176
        },
        {
          "t": 40.933,
          "r": 0.3521,
          "g": 0.2138,
          "b": 0.148,
          "pos": -0.3578,
          "chrom": 0.4185
        },
        {
          "t": 41.0,
          "r": 0.3775,
          "g": 0.2386,
          "b": 0.1495,
          "pos": -0.0096,
          "chrom": 0.0257
        },
        {
          "t": 41.133,
          "r": 0.391,
          "g": 0.2669,
          "b": 0.1738,
          "pos": 0.2494,
          "chrom": -0.2756
        },
        {
          "t": 41.2,
          "r": 0.3986,
          "g": 0.2765,
          "b": 0.1788,
          "pos": 0.0403,
          "chrom": -0.0545
        },
        {
          "t": 41.333,
          "r": 0.3992,
          "g": 0.2777,
          "b": 0.1826,
          "pos": -0.0883,
          "chrom": 0.0997
        },
        {
          "t": 41.4,
          "r": 0.382,
          "g": 0.2677,
          "b": 0.1769,
          "pos": -0.0478,
          "chrom": 0.0723
        },
        {
          "t": 41.533,
          "r": 0.391,
          "g": 0.2793,
          "b": 0.1924,
          "pos": -0.0149,
          "chrom": 0.0321
        },
        {
          "t": 41.6,
          "r": 0.3871,
          "g": 0.276,
          "b": 0.1881,
          "pos": 0.1306,
          "chrom": -0.1247
        },
        {
          "t": 41.733,
          "r": 0.4019,
          "g": 0.2635,
          "b": 0.1681,
          "pos": 0.098,
          "chrom": -0.0985
        },
        {
          "t": 41.8,
          "r": 0.4079,
          "g": 0.267,
          "b": 0.1684,
          "pos": -0.1864,
          "chrom": 0.1744
        },
        {
          "t": 41.933,
          "r": 0.3995,
          "g": 0.2625,
          "b": 0.1705,
          "pos": -0.1975,
          "chrom": 0.2029
        },
        {
          "t": 42.0,
          "r": 0.3647,
          "g": 0.2311,
          "b": 0.1286,
          "pos": 0.0953,
          "chrom": -0.054
        },
        {
          "t": 42.133,
          "r": 0.3986,
          "g": 0.2457,
          "b": 0.1344,
          "pos": 0.0757,
          "chrom": -0.0645
        },
        {
          "t": 42.2,
          "r": 0.4188,
          "g": 0.2562,
          "b": 0.1379,
          "pos": 0.1028,
          "chrom": -0.1262
        },
        {
          "t": 42.333,
          "r": 0.4389,
          "g": 0.2352,
          "b": 0.0943,
          "pos": 0.1992,
          "chrom": -0.2046
        },
        {
          "t": 42.4,
          "r": 0.4485,
          "g": 0.2325,
          "b": 0.0994,
          "pos": -0.1746,
          "chrom": 0.1927
        },
        {
          "t": 42.533,
          "r": 0.428,
          "g": 0.2576,
          "b": 0.1454,
          "pos": -0.2288,
          "chrom": 0.2534
        },
        {
          "t": 42.6,
          "r": 0.4234,
          "g": 0.2845,
          "b": 0.1788,
          "pos": 0.0932,
          "chrom": -0.0996
        },
        {
          "t": 42.733,
          "r": 0.383,
          "g": 0.2478,
          "b": 0.1441,
          "pos": -0.1377,
          "chrom": 0.1457
        },
        {
          "t": 42.8,
          "r": 0.3401,
          "g": 0.1896,
          "b": 0.0851,
          "pos": -0.2548,
          "chrom": 0.3112
        },
        {
          "t": 42.933,
          "r": 0.2532,
          "g": 0.1015,
          "b": -0.0234,
          "pos": 0.3931,
          "chrom": -0.3885
        },
        {
          "t": 43.0,
          "r": 0.2375,
          "g": 0.0821,
          "b": -0.0529,
          "pos": 0.7804,
          "chrom": -0.8192
        },
        {
          "t": 43.133,
          "r": 0.1544,
          "g": 0.0034,
          "b": -0.1361,
          "pos": -0.0126,
          "chrom": -0.0921
        },
        {
          "t": 43.2,
          "r": 0.1897,
          "g": 0.0153,
          "b": -0.1383,
          "pos": -1.0793,
          "chrom": 1.0199
        },
        {
          "t": 43.333,
          "r": -0.059,
          "g": -0.0921,
          "b": -0.2371,
          "pos": -0.4351,
          "chrom": 0.6462
        },
        {
          "t": 43.4,
          "r": -0.0351,
          "g": 0.0552,
          "b": -0.0805,
          "pos": 0.5134,
          "chrom": -0.358
        },
        {
          "t": 43.533,
          "r": 0.0909,
          "g": 0.4468,
          "b": 0.3704,
          "pos": 0.4278,
          "chrom": -0.4558
        },
        {
          "t": 43.6,
          "r": 0.1581,
          "g": 0.6259,
          "b": 0.589,
          "pos": 0.0026,
          "chrom": -0.154
        },
        {
          "t": 43.733,
          "r": 0.3508,
          "g": 1.103,
          "b": 1.191,
          "pos": -0.2228,
          "chrom": 0.0781
        },
        {
          "t": 43.8,
          "r": 0.0763,
          "g": 0.7166,
          "b": 0.7847,
          "pos": 0.4768,
          "chrom": -0.3139
        },
        {
          "t": 43.933,
          "r": 0.3092,
          "g": 1.0589,
          "b": 1.2366,
          "pos": -0.0017,
          "chrom": 0.1267
        },
        {
          "t": 44.0,
          "r": 0.258,
          "g": 1.0756,
          "b": 1.3385,
          "pos": -0.9387,
          "chrom": 0.9368
        },
        {
          "t": 44.133,
          "r": 0.2127,
          "g": 1.071,
          "b": 1.3823,
          "pos": 0.7554,
          "chrom": -0.7738
        },
        {
          "t": 44.2,
          "r": 0.1142,
          "g": 0.9852,
          "b": 1.3269,
          "pos": 0.7665,
          "chrom": -0.9373
        },
        {
          "t": 44.333,
          "r": -0.0453,
          "g": 0.8474,
          "b": 1.2641,
          "pos": -1.4165,
          "chrom": 1.34
        },
        {
          "t": 44.4,
          "r": -0.4062,
          "g": 0.2038,
          "b": 0.4517,
          "pos": -0.5794,
          "chrom": 0.8111
        },
        {
          "t": 44.533,
          "r": -0.5601,
          "g": 0.001,
          "b": 0.1841,
          "pos": 0.77,
          "chrom": -0.6411
        },
        {
          "t": 44.6,
          "r": -0.6186,
          "g": -0.0631,
          "b": 0.0968,
          "pos": 0.4615,
          "chrom": -0.5381
        },
        {
          "t": 44.733,
          "r": -0.745,
          "g": -0.2788,
          "b": -0.1615,
          "pos": 0.3698,
          "chrom": -0.4397
        },
        {
          "t": 44.8,
          "r": -0.7964,
          "g": -0.3992,
          "b": -0.3025,
          "pos": 0.0234,
          "chrom": -0.107
        },
        {
          "t": 44.933,
          "r": -0.8612,
          "g": -0.5707,
          "b": -0.4906,
          "pos": -0.5398,
          "chrom": 0.5396
        },
        {
          "t": 45.0,
          "r": -0.9789,
          "g": -0.766,
          "b": -0.7161,
          "pos": -0.1876,
          "chrom": 0.3076
        },
        {
          "t": 45.133,
          "r": -0.9695,
          "g": -0.7688,
          "b": -0.7112,
          "pos": 0.0012,
          "chrom": 0.0432
        },
        {
          "t": 45.2,
          "r": -0.9991,
          "g": -0.7944,
          "b": -0.7374,
          "pos": -0.3832,
          "chrom": 0.3869
        },
        {
          "t": 45.333,
          "r": -1.038,
          "g": -0.8235,
          "b": -0.77,
          "pos": 0.2207,
          "chrom": -0.2033
        },
        {
          "t": 45.4,
          "r": -1.0451,
          "g": -0.8189,
          "b": -0.7834,
          "pos": 0.8944,
          "chrom": -0.9653
        },
        {
          "t": 45.533,
          "r": -1.0248,
          "g": -0.8082,
          "b": -0.7564,
          "pos": -0.0055,
          "chrom": -0.073
        },
        {
          "t": 45.6,
          "r": -1.0755,
          "g": -0.9044,
          "b": -0.8671,
          "pos": -0.5765,
          "chrom": 0.6145
        },
        {
          "t": 45.733,
          "r": -1.0682,
          "g": -0.9354,
          "b": -0.9089,
          "pos": -0.3301,
          "chrom": 0.4435
        },
        {
          "t": 45.8,
          "r": -1.0238,
          "g": -0.9071,
          "b": -0.9003,
          "pos": 0.1955,
          "chrom": -0.1533
        },
        {
          "t": 45.933,
          "r": -0.8407,
          "g": -0.7884,
          "b": -0.8172,
          "pos": 0.1907,
          "chrom": -0.2335
        },
        {
          "t": 46.0,
          "r": -0.7894,
          "g": -0.7831,
          "b": -0.8109,
          "pos": -0.2914,
          "chrom": 0.2797
        },
        {
          "t": 46.133,
          "r": -0.6436,
          "g": -0.6568,
          "b": -0.7126,
          "pos": 0.2704,
          "chrom": -0.2804
        },
        {
          "t": 46.2,
          "r": -0.6208,
          "g": -0.6152,
          "b": -0.6404,
          "pos": 0.031,
          "chrom": -0.012
        },
        {
          "t": 46.333,
          "r": -0.5392,
          "g": -0.5165,
          "b": -0.5153,
          "pos": -0.2036,
          "chrom": 0.2263
        },
        {
          "t": 46.4,
          "r": -0.5118,
          "g": -0.4856,
          "b": -0.4869,
          "pos": 0.4667,
          "chrom": -0.5049
        },
        {
          "t": 46.533,
          "r": -0.5089,
          "g": -0.5306,
          "b": -0.5088,
          "pos": -0.0202,
          "chrom": 0.0285
        },
        {
          "t": 46.6,
          "r": -0.5354,
          "g": -0.5888,
          "b": -0.548,
          "pos": -0.5047,
          "chrom": 0.5472
        },
        {
          "t": 46.733,
          "r": -0.5587,
          "g": -0.6212,
          "b": -0.552,
          "pos": -0.0852,
          "chrom": 0.0825
        },
        {
          "t": 46.8,
          "r": -0.6136,
          "g": -0.6631,
          "b": -0.5808,
          "pos": 0.4393,
          "chrom": -0.4365
        },
        {
          "t": 46.933,
          "r": -0.6491,
          "g": -0.7022,
          "b": -0.5943,
          "pos": 0.3071,
          "chrom": -0.2834
        },
        {
          "t": 47.0,
          "r": -0.6374,
          "g": -0.7128,
          "b": -0.5809,
          "pos": -0.4076,
          "chrom": 0.4167
        },
        {
          "t": 47.133,
          "r": -0.662,
          "g": -0.7199,
          "b": -0.5828,
          "pos": -0.382,
          "chrom": 0.3883
        },
        {
          "t": 47.2,
          "r": -0.6991,
          "g": -0.7412,
          "b": -0.6074,
          "pos": 0.1118,
          "chrom": -0.1075
        },
        {
          "t": 47.333,
          "r": -0.7037,
          "g": -0.7321,
          "b": -0.6132,
          "pos": 0.3403,
          "chrom": -0.3772
        },
        {
          "t": 47.4,
          "r": -0.7544,
          "g": -0.7698,
          "b": -0.6493,
          "pos": 0.22,
          "chrom": -0.2302
        },
        {
          "t": 47.533,
          "r": -0.7907,
          "g": -0.7953,
          "b": -0.668,
          "pos": -0.2564,
          "chrom": 0.3188
        },
        {
          "t": 47.6,
          "r": -0.7867,
          "g": -0.7794,
          "b": -0.6627,
          "pos": -0.2647,
          "chrom": 0.3131
        },
        {
          "t": 47.733,
          "r": -0.7511,
          "g": -0.7548,
          "b": -0.6513,
          "pos": 0.2814,
          "chrom": -0.3002
        },
        {
          "t": 47.8,
          "r": -0.738,
          "g": -0.7396,
          "b": -0.6453,
          "pos": 0.183,
          "chrom": -0.2184
        },
        {
          "t": 47.933,
          "r": -0.7118,
          "g": -0.7221,
          "b": -0.6119,
          "pos": -0.2835,
          "chrom": 0.2691
        },
        {
          "t": 48.0,
          "r": -0.716,
          "g": -0.7305,
          "b": -0.6388,
          "pos": 0.0637,
          "chrom": -0.0545
        },
        {
          "t": 48.133,
          "r": -0.7038,
          "g": -0.7242,
          "b": -0.6338,
          "pos": 0.143,
          "chrom": -0.0958
        },
        {
          "t": 48.2,
          "r": -0.6712,
          "g": -0.6971,
          "b": -0.6151,
          "pos": -0.1551,
          "chrom": 0.1833
        },
        {
          "t": 48.333,
          "r": -0.5938,
          "g": -0.6317,
          "b": -0.566,
          "pos": -0.1377,
          "chrom": 0.1467
        },
        {
          "t": 48.4,
          "r": -0.56,
          "g": -0.5987,
          "b": -0.5458,
          "pos": -0.0082,
          "chrom": -0.0129
        },
        {
          "t": 48.533,
          "r": -0.4372,
          "g": -0.4855,
          "b": -0.4469,
          "pos": 0.1355,
          "chrom": -0.1785
        },
        {
          "t": 48.6,
          "r": -0.4612,
          "g": -0.512,
          "b": -0.4687,
          "pos": 0.0502,
          "chrom": -0.0009
        },
        {
          "t": 48.733,
          "r": -0.3342,
          "g": -0.4092,
          "b": -0.3649,
          "pos": -0.2307,
          "chrom": 0.295
        },
        {
          "t": 48.8,
          "r": -0.271,
          "g": -0.3483,
          "b": -0.3053,
          "pos": 0.4663,
          "chrom": -0.4995
        },
        {
          "t": 48.933,
          "r": -0.2286,
          "g": -0.2952,
          "b": -0.2407,
          "pos": 0.4435,
          "chrom": -0.4523
        },
        {
          "t": 49.0,
          "r": -0.2113,
          "g": -0.3108,
          "b": -0.2094,
          "pos": -1.1904,
          "chrom": 1.2227
        },
        {
          "t": 49.133,
          "r": -0.2155,
          "g": -0.2921,
          "b": -0.2054,
          "pos": -0.449,
          "chrom": 0.4058
        },
        {
          "t": 49.2,
          "r": -0.3515,
          "g": -0.4398,
          "b": -0.3645,
          "pos": 0.8509,
          "chrom": -0.84
        },
        {
          "t": 49.333,
          "r": -0.4281,
          "g": -0.5016,
          "b": -0.4225,
          "pos": 0.4798,
          "chrom": -0.4297
        },
        {
          "t": 49.4,
          "r": -0.4573,
          "g": -0.5218,
          "b": -0.431,
          "pos": 0.0702,
          "chrom": -0.0724
        },
        {
          "t": 49.533,
          "r": -0.5201,
          "g": -0.5549,
          "b": -0.45,
          "pos": -0.2007,
          "chrom": 0.1992
        },
        {
          "t": 49.6,
          "r": -0.5558,
          "g": -0.5727,
          "b": -0.4693,
          "pos": -0.2055,
          "chrom": 0.198
        },
        {
          "t": 49.733,
          "r": -0.5992,
          "g": -0.5889,
          "b": -0.4761,
          "pos": -0.3129,
          "chrom": 0.3207
        },
        {
          "t": 49.867,
          "r": -0.6369,
          "g": -0.6125,
          "b": -0.5144,
          "pos": 0.1554,
          "chrom": -0.1323
        },
        {
          "t": 49.933,
          "r": -0.6425,
          "g": -0.6083,
          "b": -0.5174,
          "pos": 0.403,
          "chrom": -0.4139
        },
        {
          "t": 50.067,
          "r": -0.643,
          "g": -0.5889,
          "b": -0.4914,
          "pos": 0.1004,
          "chrom": -0.0817
        },
        {
          "t": 50.133,
          "r": -0.6567,
          "g": -0.5915,
          "b": -0.4844,
          "pos": -0.0367,
          "chrom": 0.0727
        },
        {
          "t": 50.267,
          "r": -0.587,
          "g": -0.529,
          "b": -0.4334,
          "pos": -0.1224,
          "chrom": 0.0959
        },
        {
          "t": 50.333,
          "r": -0.5799,
          "g": -0.5339,
          "b": -0.4425,
          "pos": -0.2056,
          "chrom": 0.1902
        },
        {
          "t": 50.467,
          "r": -0.5608,
          "g": -0.5513,
          "b": -0.4906,
          "pos": -0.0474,
          "chrom": 0.0884
        },
        {
          "t": 50.533,
          "r": -0.5485,
          "g": -0.5435,
          "b": -0.4871,
          "pos": 0.0645,
          "chrom": -0.0328
        },
        {
          "t": 50.667,
          "r": -0.4962,
          "g": -0.5043,
          "b": -0.4652,
          "pos": 0.0332,
          "chrom": -0.0568
        },
        {
          "t": 50.733,
          "r": -0.48,
          "g": -0.4966,
          "b": -0.4638,
          "pos": -0.0223,
          "chrom": 0.0138
        },
        {
          "t": 50.867,
          "r": -0.4874,
          "g": -0.5163,
          "b": -0.4907,
          "pos": 0.2611,
          "chrom": -0.2492
        },
        {
          "t": 50.933,
          "r": -0.4425,
          "g": -0.4802,
          "b": -0.4613,
          "pos": 0.2026,
          "chrom": -0.2251
        },
        {
          "t": 51.067,
          "r": -0.4507,
          "g": -0.5001,
          "b": -0.4646,
          "pos": -0.2321,
          "chrom": 0.2622
        },
        {
          "t": 51.133,
          "r": -0.4643,
          "g": -0.5018,
          "b": -0.4644,
          "pos": -0.3299,
          "chrom": 0.3979
        },
        {
          "t": 51.267,
          "r": -0.4424,
          "g": -0.4753,
          "b": -0.4378,
          "pos": 0.0081,
          "chrom": -0.0145
        },
        {
          "t": 51.333,
          "r": -0.4441,
          "g": -0.4662,
          "b": -0.4443,
          "pos": 0.4637,
          "chrom": -0.5033
        },
        {
          "t": 51.467,
          "r": -0.473,
          "g": -0.4906,
          "b": -0.4569,
          "pos": -0.0723,
          "chrom": 0.0607
        },
        {
          "t": 51.533,
          "r": -0.48,
          "g": -0.4938,
          "b": -0.4574,
          "pos": -0.3773,
          "chrom": 0.3805
        },
        {
          "t": 51.667,
          "r": -0.5276,
          "g": -0.5093,
          "b": -0.4591,
          "pos": -0.1222,
          "chrom": 0.1591
        },
        {
          "t": 51.733,
          "r": -0.5359,
          "g": -0.5161,
          "b": -0.4604,
          "pos": -0.1015,
          "chrom": 0.144
        },
        {
          "t": 51.867,
          "r": -0.5058,
          "g": -0.4865,
          "b": -0.4341,
          "pos": 0.8414,
          "chrom": -0.8555
        },
        {
          "t": 51.933,
          "r": -0.4775,
          "g": -0.452,
          "b": -0.4011,
          "pos": 0.6473,
          "chrom": -0.6644
        },
        {
          "t": 52.067,
          "r": -0.4193,
          "g": -0.4414,
          "b": -0.3653,
          "pos": -1.0045,
          "chrom": 1.0246
        },
        {
          "t": 52.133,
          "r": -0.4265,
          "g": -0.4504,
          "b": -0.3828,
          "pos": -0.7065,
          "chrom": 0.7139
        },
        {
          "t": 52.267,
          "r": -0.4859,
          "g": -0.5133,
          "b": -0.4641,
          "pos": 0.1837,
          "chrom": -0.1742
        },
        {
          "t": 52.333,
          "r": -0.5303,
          "g": -0.5592,
          "b": -0.52,
          "pos": 0.301,
          "chrom": -0.287
        },
        {
          "t": 52.467,
          "r": -0.605,
          "g": -0.6285,
          "b": -0.5937,
          "pos": 0.5701,
          "chrom": -0.5885
        },
        {
          "t": 52.533,
          "r": -0.654,
          "g": -0.6776,
          "b": -0.636,
          "pos": 0.3169,
          "chrom": -0.332
        },
        {
          "t": 52.667,
          "r": -0.6686,
          "g": -0.696,
          "b": -0.6309,
          "pos": -0.7386,
          "chrom": 0.7586
        },
        {
          "t": 52.733,
          "r": -0.6841,
          "g": -0.7087,
          "b": -0.638,
          "pos": -0.6227,
          "chrom": 0.6488
        },
        {
          "t": 52.867,
          "r": -0.6209,
          "g": -0.6288,
          "b": -0.5726,
          "pos": 0.5749,
          "chrom": -0.5509
        },
        {
          "t": 52.933,
          "r": -0.5594,
          "g": -0.5877,
          "b": -0.5403,
          "pos": 0.4468,
          "chrom": -0.4236
        },
        {
          "t": 53.067,
          "r": -0.3935,
          "g": -0.438,
          "b": -0.3927,
          "pos": -0.3416,
          "chrom": 0.3615
        },
        {
          "t": 53.133,
          "r": -0.3433,
          "g": -0.3974,
          "b": -0.3589,
          "pos": -0.1761,
          "chrom": 0.1881
        },
        {
          "t": 53.267,
          "r": -0.2708,
          "g": -0.3136,
          "b": -0.2854,
          "pos": 0.0594,
          "chrom": -0.1228
        },
        {
          "t": 53.333,
          "r": -0.2604,
          "g": -0.3112,
          "b": -0.2884,
          "pos": 0.0375,
          "chrom": -0.1055
        },
        {
          "t": 53.467,
          "r": -0.3842,
          "g": -0.433,
          "b": -0.4104,
          "pos": 0.1881,
          "chrom": -0.1527
        },
        {
          "t": 53.533,
          "r": -0.4222,
          "g": -0.4625,
          "b": -0.4268,
          "pos": -0.2082,
          "chrom": 0.2895
        },
        {
          "t": 53.667,
          "r": -0.4842,
          "g": -0.5038,
          "b": -0.4663,
          "pos": 0.0954,
          "chrom": -0.047
        },
        {
          "t": 53.733,
          "r": -0.485,
          "g": -0.4949,
          "b": -0.4726,
          "pos": 0.5586,
          "chrom": -0.5694
        },
        {
          "t": 53.867,
          "r": -0.4531,
          "g": -0.4729,
          "b": -0.4387,
          "pos": -0.5918,
          "chrom": 0.5835
        },
        {
          "t": 53.933,
          "r": -0.4327,
          "g": -0.4516,
          "b": -0.422,
          "pos": -0.7908,
          "chrom": 0.7968
        },
        {
          "t": 54.067,
          "r": -0.4134,
          "g": -0.4368,
          "b": -0.4394,
          "pos": 0.685,
          "chrom": -0.729
        },
        {
          "t": 54.133,
          "r": -0.4211,
          "g": -0.4317,
          "b": -0.4372,
          "pos": 0.8782,
          "chrom": -0.9086
        },
        {
          "t": 54.267,
          "r": -0.4178,
          "g": -0.447,
          "b": -0.4232,
          "pos": -0.3639,
          "chrom": 0.4332
        },
        {
          "t": 54.333,
          "r": -0.41,
          "g": -0.4431,
          "b": -0.4199,
          "pos": -0.5064,
          "chrom": 0.5688
        },
        {
          "t": 54.467,
          "r": -0.3662,
          "g": -0.4019,
          "b": -0.3883,
          "pos": 0.0272,
          "chrom": -0.0456
        },
        {
          "t": 54.533,
          "r": -0.3645,
          "g": -0.4038,
          "b": -0.389,
          "pos": 0.0844,
          "chrom": -0.1131
        },
        {
          "t": 54.667,
          "r": -0.3533,
          "g": -0.4067,
          "b": -0.4012,
          "pos": -0.1335,
          "chrom": 0.1439
        },
        {
          "t": 54.733,
          "r": -0.3545,
          "g": -0.4057,
          "b": -0.3981,
          "pos": -0.2438,
          "chrom": 0.2743
        },
        {
          "t": 54.867,
          "r": -0.3327,
          "g": -0.3719,
          "b": -0.3734,
          "pos": 0.3708,
          "chrom": -0.3799
        },
        {
          "t": 54.933,
          "r": -0.3275,
          "g": -0.3645,
          "b": -0.3723,
          "pos": 0.6224,
          "chrom": -0.6436
        },
        {
          "t": 55.067,
          "r": -0.3032,
          "g": -0.3799,
          "b": -0.3832,
          "pos": -0.1935,
          "chrom": 0.2288
        },
        {
          "t": 55.133,
          "r": -0.2855,
          "g": -0.3674,
          "b": -0.3597,
          "pos": -0.474,
          "chrom": 0.5084
        },
        {
          "t": 55.267,
          "r": -0.2671,
          "g": -0.3491,
          "b": -0.3493,
          "pos": -0.0983,
          "chrom": 0.0793
        },
        {
          "t": 55.333,
          "r": -0.2713,
          "g": -0.3523,
          "b": -0.3523,
          "pos": 0.0283,
          "chrom": -0.038
        },
        {
          "t": 55.467,
          "r": -0.3037,
          "g": -0.3745,
          "b": -0.3715,
          "pos": -0.138,
          "chrom": 0.1641
        },
        {
          "t": 55.533,
          "r": -0.2982,
          "g": -0.3724,
          "b": -0.3696,
          "pos": -0.0344,
          "chrom": 0.0523
        },
        {
          "t": 55.667,
          "r": -0.2982,
          "g": -0.3629,
          "b": -0.3688,
          "pos": 0.586,
          "chrom": -0.6073
        },
        {
          "t": 55.733,
          "r": -0.284,
          "g": -0.3539,
          "b": -0.3525,
          "pos": 0.3046,
          "chrom": -0.3149
        },
        {
          "t": 55.867,
          "r": -0.2539,
          "g": -0.3448,
          "b": -0.3286,
          "pos": -0.3079,
          "chrom": 0.3383
        },
        {
          "t": 55.933,
          "r": -0.2214,
          "g": -0.3207,
          "b": -0.3152,
          "pos": -0.2687,
          "chrom": 0.2908
        },
        {
          "t": 56.067,
          "r": -0.1782,
          "g": -0.2872,
          "b": -0.2778,
          "pos": -0.3686,
          "chrom": 0.3914
        },
        {
          "t": 56.133,
          "r": -0.1679,
          "g": -0.2678,
          "b": -0.2722,
          "pos": 0.074,
          "chrom": -0.075
        },
        {
          "t": 56.267,
          "r": -0.1524,
          "g": -0.2363,
          "b": -0.2489,
          "pos": 0.4629,
          "chrom": -0.4906
        },
        {
          "t": 56.333,
          "r": -0.1558,
          "g": -0.2465,
          "b": -0.256,
          "pos": 0.006,
          "chrom": -0.0035
        },
        {
          "t": 56.467,
          "r": -0.1556,
          "g": -0.2641,
          "b": -0.2895,
          "pos": -0.1103,
          "chrom": 0.1247
        },
        {
          "t": 56.533,
          "r": -0.1608,
          "g": -0.2715,
          "b": -0.2946,
          "pos": -0.0569,
          "chrom": 0.0813
        },
        {
          "t": 56.667,
          "r": -0.1649,
          "g": -0.2784,
          "b": -0.3065,
          "pos": 0.0346,
          "chrom": -0.0121
        },
        {
          "t": 56.733,
          "r": -0.1555,
          "g": -0.2716,
          "b": -0.3005,
          "pos": 0.1541,
          "chrom": -0.1618
        },
        {
          "t": 56.867,
          "r": -0.1556,
          "g": -0.2781,
          "b": -0.3018,
          "pos": -0.1467,
          "chrom": 0.1451
        },
        {
          "t": 56.933,
          "r": -0.1725,
          "g": -0.2969,
          "b": -0.3212,
          "pos": -0.1621,
          "chrom": 0.1748
        },
        {
          "t": 57.067,
          "r": -0.205,
          "g": -0.3063,
          "b": -0.3226,
          "pos": 0.0637,
          "chrom": -0.0601
        },
        {
          "t": 57.133,
          "r": -0.229,
          "g": -0.3265,
          "b": -0.3397,
          "pos": 0.0254,
          "chrom": -0.025
        },
        {
          "t": 57.267,
          "r": -0.2539,
          "g": -0.3383,
          "b": -0.3505,
          "pos": 0.1841,
          "chrom": -0.1987
        },
        {
          "t": 57.333,
          "r": -0.2752,
          "g": -0.3558,
          "b": -0.3644,
          "pos": 0.2232,
          "chrom": -0.2187
        },
        {
          "t": 57.467,
          "r": -0.2884,
          "g": -0.3628,
          "b": -0.362,
          "pos": -0.3093,
          "chrom": 0.3697
        },
        {
          "t": 57.533,
          "r": -0.2693,
          "g": -0.3448,
          "b": -0.3486,
          "pos": -0.3755,
          "chrom": 0.4055
        },
        {
          "t": 57.667,
          "r": -0.2338,
          "g": -0.2998,
          "b": -0.3189,
          "pos": 0.182,
          "chrom": -0.2096
        },
        {
          "t": 57.733,
          "r": -0.2332,
          "g": -0.2921,
          "b": -0.3146,
          "pos": 0.2232,
          "chrom": -0.2394
        },
        {
          "t": 57.867,
          "r": -0.2257,
          "g": -0.2768,
          "b": -0.2966,
          "pos": 0.0955,
          "chrom": -0.1105
        },
        {
          "t": 57.933,
          "r": -0.2377,
          "g": -0.2888,
          "b": -0.3084,
          "pos": 0.0477,
          "chrom": -0.0415
        },
        {
          "t": 58.067,
          "r": -0.2529,
          "g": -0.3157,
          "b": -0.334,
          "pos": -0.1663,
          "chrom": 0.2083
        },
        {
          "t": 58.133,
          "r": -0.2515,
          "g": -0.3132,
          "b": -0.3385,
          "pos": -0.0135,
          "chrom": 0.0313
        },
        {
          "t": 58.267,
          "r": -0.2506,
          "g": -0.3121,
          "b": -0.3378,
          "pos": -0.0181,
          "chrom": 0.0214
        },
        {
          "t": 58.333,
          "r": -0.2331,
          "g": -0.2957,
          "b": -0.3207,
          "pos": -0.1527,
          "chrom": 0.1544
        },
        {
          "t": 58.467,
          "r": -0.2254,
          "g": -0.2905,
          "b": -0.3261,
          "pos": 0.0784,
          "chrom": -0.0877
        },
        {
          "t": 58.533,
          "r": -0.2356,
          "g": -0.2933,
          "b": -0.3274,
          "pos": 0.179,
          "chrom": -0.1781
        },
        {
          "t": 58.667,
          "r": -0.2302,
          "g": -0.2812,
          "b": -0.3062,
          "pos": -0.0661,
          "chrom": 0.0861
        },
        {
          "t": 58.733,
          "r": -0.226,
          "g": -0.2764,
          "b": -0.2979,
          "pos": -0.1487,
          "chrom": 0.1649
        },
        {
          "t": 58.867,
          "r": -0.226,
          "g": -0.2692,
          "b": -0.2858,
          "pos": 0.2427,
          "chrom": -0.2406
        },
        {
          "t": 58.933,
          "r": -0.2379,
          "g": -0.2791,
          "b": -0.2962,
          "pos": 0.1553,
          "chrom": -0.155
        },
        {
          "t": 59.067,
          "r": -0.2451,
          "g": -0.2785,
          "b": -0.2739,
          "pos": -0.3163,
          "chrom": 0.3265
        },
        {
          "t": 59.133,
          "r": -0.2569,
          "g": -0.2937,
          "b": -0.2906,
          "pos": -0.1559,
          "chrom": 0.1759
        },
        {
          "t": 59.267,
          "r": -0.2618,
          "g": -0.2933,
          "b": -0.2897,
          "pos": 0.0704,
          "chrom": -0.0824
        },
        {
          "t": 59.333,
          "r": -0.2485,
          "g": -0.2767,
          "b": -0.2742,
          "pos": 0.1134,
          "chrom": -0.1411
        },
        {
          "t": 59.467,
          "r": -0.2637,
          "g": -0.2857,
          "b": -0.2769,
          "pos": 0.1304,
          "chrom": -0.0994
        },
        {
          "t": 59.533,
          "r": -0.2354,
          "g": -0.2684,
          "b": -0.2574,
          "pos": 0.0299,
          "chrom": 0.0182
        },
        {
          "t": 59.667,
          "r": -0.1634,
          "g": -0.2119,
          "b": -0.2098,
          "pos": 0.1005,
          "chrom": -0.09
        },
        {
          "t": 59.733,
          "r": -0.1122,
          "g": -0.1633,
          "b": -0.1581,
          "pos": -0.1271,
          "chrom": 0.1262
        },
        {
          "t": 59.867,
          "r": -0.0388,
          "g": -0.0984,
          "b": -0.0851,
          "pos": -0.5593,
          "chrom": 0.5368
        },
        {
          "t": 59.933,
          "r": -0.0147,
          "g": -0.0671,
          "b": -0.0617,
          "pos": -0.0431,
          "chrom": 0.0019
        },
        {
          "t": 60.067,
          "r": 0.0142,
          "g": -0.1276,
          "b": -0.1721,
          "pos": 0.6667,
          "chrom": -0.6424
        },
        {
          "t": 60.133,
          "r": 0.0159,
          "g": -0.1222,
          "b": -0.1551,
          "pos": 0.4736,
          "chrom": -0.4133
        },
        {
          "t": 60.267,
          "r": 0.0725,
          "g": -0.07,
          "b": -0.088,
          "pos": -0.1651,
          "chrom": 0.1989
        },
        {
          "t": 60.333,
          "r": 0.0947,
          "g": -0.0404,
          "b": -0.0439,
          "pos": -0.6246,
          "chrom": 0.6665
        },
        {
          "t": 60.467,
          "r": 0.1201,
          "g": 0.0145,
          "b": 0.0229,
          "pos": -0.6352,
          "chrom": 0.5585
        },
        {
          "t": 60.533,
          "r": 0.1516,
          "g": 0.0702,
          "b": 0.079,
          "pos": -0.0009,
          "chrom": -0.1081
        },
        {
          "t": 60.667,
          "r": -0.0076,
          "g": -0.1191,
          "b": -0.1426,
          "pos": 1.0722,
          "chrom": -0.9936
        },
        {
          "t": 60.733,
          "r": -0.0054,
          "g": -0.0971,
          "b": -0.1108,
          "pos": 1.0089,
          "chrom": -0.9472
        },
        {
          "t": 60.867,
          "r": -0.0025,
          "g": -0.0726,
          "b": -0.0515,
          "pos": -0.6854,
          "chrom": 0.7136
        },
        {
          "t": 60.933,
          "r": 0.0002,
          "g": -0.0724,
          "b": -0.0476,
          "pos": -1.2938,
          "chrom": 1.3533
        },
        {
          "t": 61.067,
          "r": -0.0083,
          "g": -0.0622,
          "b": -0.0696,
          "pos": -0.3075,
          "chrom": 0.2503
        },
        {
          "t": 61.133,
          "r": -0.0123,
          "g": -0.0666,
          "b": -0.1008,
          "pos": 0.3019,
          "chrom": -0.3617
        },
        {
          "t": 61.267,
          "r": -0.0987,
          "g": -0.1706,
          "b": -0.245,
          "pos": 1.0068,
          "chrom": -0.9863
        },
        {
          "t": 61.333,
          "r": -0.0921,
          "g": -0.1592,
          "b": -0.2494,
          "pos": 1.012,
          "chrom": -1.0127
        },
        {
          "t": 61.467,
          "r": -0.0902,
          "g": -0.177,
          "b": -0.264,
          "pos": -0.5266,
          "chrom": 0.5617
        },
        {
          "t": 61.533,
          "r": -0.0795,
          "g": -0.1791,
          "b": -0.2696,
          "pos": -1.1522,
          "chrom": 1.2169
        },
        {
          "t": 61.667,
          "r": -0.0597,
          "g": -0.1718,
          "b": -0.2889,
          "pos": -0.7995,
          "chrom": 0.8151
        },
        {
          "t": 61.733,
          "r": -0.0531,
          "g": -0.1637,
          "b": -0.2949,
          "pos": -0.1496,
          "chrom": 0.1282
        },
        {
          "t": 61.867,
          "r": -0.0802,
          "g": -0.1956,
          "b": -0.3289,
          "pos": 1.3453,
          "chrom": -1.3857
        },
        {
          "t": 61.933,
          "r": -0.0891,
          "g": -0.2157,
          "b": -0.3476,
          "pos": 1.107,
          "chrom": -1.1103
        },
        {
          "t": 62.067,
          "r": -0.0753,
          "g": -0.2411,
          "b": -0.2945,
          "pos": 0.0399,
          "chrom": -0.0334
        }
      ],
      "hrTracks": {
        "pos_face_full": [
          {
            "t": 0.0,
            "bpm": 95.801
          },
          {
            "t": 5.0,
            "bpm": 101.514
          },
          {
            "t": 10.0,
            "bpm": 100.635
          },
          {
            "t": 15.0,
            "bpm": 98.877
          },
          {
            "t": 20.0,
            "bpm": 101.074
          },
          {
            "t": 25.0,
            "bpm": 100.195
          },
          {
            "t": 30.0,
            "bpm": 152.051
          },
          {
            "t": 35.0,
            "bpm": 152.93
          },
          {
            "t": 40.0,
            "bpm": 121.729
          }
        ],
        "chrom_face_full": [
          {
            "t": 0.0,
            "bpm": 95.361
          },
          {
            "t": 5.0,
            "bpm": 94.922
          },
          {
            "t": 10.0,
            "bpm": 162.158
          },
          {
            "t": 15.0,
            "bpm": 105.908
          },
          {
            "t": 20.0,
            "bpm": 107.666
          },
          {
            "t": 25.0,
            "bpm": 108.545
          },
          {
            "t": 30.0,
            "bpm": 151.611
          },
          {
            "t": 35.0,
            "bpm": 153.369
          },
          {
            "t": 40.0,
            "bpm": 121.729
          }
        ],
        "sqi_top_window": [
          {
            "t": 0.0,
            "bpm": 99.756
          },
          {
            "t": 5.0,
            "bpm": 100.635
          },
          {
            "t": 10.0,
            "bpm": 99.316
          },
          {
            "t": 15.0,
            "bpm": 99.756
          },
          {
            "t": 20.0,
            "bpm": 100.195
          },
          {
            "t": 25.0,
            "bpm": 100.195
          },
          {
            "t": 30.0,
            "bpm": 101.074
          },
          {
            "t": 35.0,
            "bpm": 97.998
          },
          {
            "t": 40.0,
            "bpm": 99.316
          }
        ],
        "trained_peak_selector_current": [
          {
            "t": 0.0,
            "bpm": 106.348
          },
          {
            "t": 5.0,
            "bpm": 109.863
          },
          {
            "t": 10.0,
            "bpm": 106.787
          },
          {
            "t": 15.0,
            "bpm": 108.984
          },
          {
            "t": 20.0,
            "bpm": 112.061
          },
          {
            "t": 25.0,
            "bpm": 112.939
          },
          {
            "t": 30.0,
            "bpm": 111.182
          },
          {
            "t": 35.0,
            "bpm": 111.621
          },
          {
            "t": 40.0,
            "bpm": 114.258
          }
        ],
        "oracle_window_peak": [
          {
            "t": 0.0,
            "bpm": 110.303
          },
          {
            "t": 5.0,
            "bpm": 110.303
          },
          {
            "t": 10.0,
            "bpm": 110.303
          },
          {
            "t": 15.0,
            "bpm": 110.742
          },
          {
            "t": 20.0,
            "bpm": 110.303
          },
          {
            "t": 25.0,
            "bpm": 110.303
          },
          {
            "t": 30.0,
            "bpm": 110.303
          },
          {
            "t": 35.0,
            "bpm": 110.303
          },
          {
            "t": 40.0,
            "bpm": 110.303
          }
        ]
      }
    }
  ],
  "selectorSummary": [
    {
      "selector": "oracle_window_peak",
      "n": 7,
      "target_mae": 0.397,
      "target_rmse": 0.815,
      "range_mae": 0.013,
      "within_range_pct": 85.71
    },
    {
      "selector": "trained_tracked_selector_current",
      "n": 7,
      "target_mae": 2.499,
      "target_rmse": 4.332,
      "range_mae": 0.075,
      "within_range_pct": 85.71
    },
    {
      "selector": "trained_peak_selector_current",
      "n": 7,
      "target_mae": 2.768,
      "target_rmse": 4.83,
      "range_mae": 0.201,
      "within_range_pct": 85.71
    },
    {
      "selector": "oracle_method_region",
      "n": 7,
      "target_mae": 32.023,
      "target_rmse": 47.567,
      "range_mae": 26.579,
      "within_range_pct": 28.57
    },
    {
      "selector": "fixed_chrom_face_full",
      "n": 7,
      "target_mae": 44.76,
      "target_rmse": 59.763,
      "range_mae": 38.481,
      "within_range_pct": 14.29
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "n": 7,
      "target_mae": 44.955,
      "target_rmse": 58.711,
      "range_mae": 38.607,
      "within_range_pct": 14.29
    },
    {
      "selector": "fixed_pos_face_full",
      "n": 7,
      "target_mae": 45.074,
      "target_rmse": 60.585,
      "range_mae": 38.717,
      "within_range_pct": 0.0
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "n": 7,
      "target_mae": 45.52,
      "target_rmse": 58.592,
      "range_mae": 39.163,
      "within_range_pct": 0.0
    },
    {
      "selector": "tracked_sqi",
      "n": 7,
      "target_mae": 49.72,
      "target_rmse": 63.088,
      "range_mae": 43.363,
      "within_range_pct": 0.0
    },
    {
      "selector": "sqi_top_window",
      "n": 7,
      "target_mae": 49.908,
      "target_rmse": 63.194,
      "range_mae": 43.551,
      "within_range_pct": 0.0
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "n": 7,
      "target_mae": 53.863,
      "target_rmse": 66.272,
      "range_mae": 47.506,
      "within_range_pct": 0.0
    }
  ],
  "selectorPredictions": [
    {
      "selector": "fixed_chrom_face_full",
      "video": "1.mp4",
      "pred_bpm": 113.379,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 61.621,
      "range_error": 56.621,
      "within_range": false,
      "source": "chrom+face_full",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_pos_face_full",
      "video": "1.mp4",
      "pred_bpm": 113.818,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 61.182,
      "range_error": 56.182,
      "within_range": false,
      "source": "pos+face_full",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "oracle_method_region",
      "video": "1.mp4",
      "pred_bpm": 127.002,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 47.998,
      "range_error": 42.998,
      "within_range": false,
      "source": "label-leaked best method/region upper bound",
      "selected_method": "pos",
      "selected_region": "patch_r02_c05"
    },
    {
      "selector": "oracle_window_peak",
      "video": "1.mp4",
      "pred_bpm": 174.902,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 0.098,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best window peak upper bound",
      "selected_method": "green",
      "selected_region": "patch_r01_c04"
    },
    {
      "selector": "sqi_top_window",
      "video": "1.mp4",
      "pred_bpm": 99.316,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 75.684,
      "range_error": 70.684,
      "within_range": false,
      "source": "best SQI candidate per window",
      "selected_method": "g_minus_r",
      "selected_region": "upper_face"
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "video": "1.mp4",
      "pred_bpm": 91.406,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 83.594,
      "range_error": 78.594,
      "within_range": false,
      "source": "leave-one-video-out supervised peak ranker",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "video": "1.mp4",
      "pred_bpm": 91.406,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 83.594,
      "range_error": 78.594,
      "within_range": false,
      "source": "LOOCV supervised ranker with temporal tracking",
      "selected_method": "pca",
      "selected_region": "patch_r03_c04"
    },
    {
      "selector": "tracked_sqi",
      "video": "1.mp4",
      "pred_bpm": 99.316,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 75.684,
      "range_error": 70.684,
      "within_range": false,
      "source": "Viterbi path over SQI candidates",
      "selected_method": "g_minus_r",
      "selected_region": "upper_face"
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "video": "1.mp4",
      "pred_bpm": 96.24,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 78.76,
      "range_error": 73.76,
      "within_range": false,
      "source": "leave-one-video-out best fixed method/region",
      "selected_method": "chrom",
      "selected_region": "patch_r04_c05"
    },
    {
      "selector": "trained_peak_selector_current",
      "video": "1.mp4",
      "pred_bpm": 174.902,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 0.098,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels",
      "selected_method": "chrom",
      "selected_region": "patch_r02_c05"
    },
    {
      "selector": "trained_tracked_selector_current",
      "video": "1.mp4",
      "pred_bpm": 175.781,
      "bpm_min": 170.0,
      "bpm_max": 180.0,
      "bpm_target": 175.0,
      "target_abs_error": 0.781,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels with temporal tracking",
      "selected_method": "chrom",
      "selected_region": "patch_r01_c03"
    },
    {
      "selector": "fixed_chrom_face_full",
      "video": "3.mp4",
      "pred_bpm": 100.635,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 109.365,
      "range_error": 89.365,
      "within_range": false,
      "source": "chrom+face_full",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_pos_face_full",
      "video": "3.mp4",
      "pred_bpm": 102.393,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 107.607,
      "range_error": 87.607,
      "within_range": false,
      "source": "pos+face_full",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "oracle_method_region",
      "video": "3.mp4",
      "pred_bpm": 114.258,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 95.742,
      "range_error": 75.742,
      "within_range": false,
      "source": "label-leaked best method/region upper bound",
      "selected_method": "green",
      "selected_region": "patch_r05_c02"
    },
    {
      "selector": "oracle_window_peak",
      "video": "3.mp4",
      "pred_bpm": 207.861,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 2.139,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best window peak upper bound",
      "selected_method": "ica",
      "selected_region": "mid_face"
    },
    {
      "selector": "sqi_top_window",
      "video": "3.mp4",
      "pred_bpm": 99.316,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 110.684,
      "range_error": 90.684,
      "within_range": false,
      "source": "best SQI candidate per window",
      "selected_method": "ica",
      "selected_region": "lower_face"
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "video": "3.mp4",
      "pred_bpm": 110.303,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 99.697,
      "range_error": 79.697,
      "within_range": false,
      "source": "leave-one-video-out supervised peak ranker",
      "selected_method": "chrom",
      "selected_region": "patch_r02_c05"
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "video": "3.mp4",
      "pred_bpm": 110.303,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 99.697,
      "range_error": 79.697,
      "within_range": false,
      "source": "LOOCV supervised ranker with temporal tracking",
      "selected_method": "pca",
      "selected_region": "patch_r01_c03"
    },
    {
      "selector": "tracked_sqi",
      "video": "3.mp4",
      "pred_bpm": 99.316,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 110.684,
      "range_error": 90.684,
      "within_range": false,
      "source": "Viterbi path over SQI candidates",
      "selected_method": "ica",
      "selected_region": "lower_face"
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "video": "3.mp4",
      "pred_bpm": 93.604,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 116.396,
      "range_error": 96.396,
      "within_range": false,
      "source": "leave-one-video-out best fixed method/region",
      "selected_method": "pos",
      "selected_region": "patch_r02_c02"
    },
    {
      "selector": "trained_peak_selector_current",
      "video": "3.mp4",
      "pred_bpm": 197.754,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 12.246,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "trained_tracked_selector_current",
      "video": "3.mp4",
      "pred_bpm": 199.072,
      "bpm_min": 190.0,
      "bpm_max": 230.0,
      "bpm_target": 210.0,
      "target_abs_error": 10.928,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels with temporal tracking",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_chrom_face_full",
      "video": "4.mp4",
      "pred_bpm": 100.195,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 15.305,
      "range_error": 10.805,
      "within_range": false,
      "source": "chrom+face_full",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_pos_face_full",
      "video": "4.mp4",
      "pred_bpm": 102.393,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 13.107,
      "range_error": 8.607,
      "within_range": false,
      "source": "pos+face_full",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "oracle_method_region",
      "video": "4.mp4",
      "pred_bpm": 115.137,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 0.363,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best method/region upper bound",
      "selected_method": "chrom",
      "selected_region": "patch_r03_c03"
    },
    {
      "selector": "oracle_window_peak",
      "video": "4.mp4",
      "pred_bpm": 115.576,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 0.076,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best window peak upper bound",
      "selected_method": "pos",
      "selected_region": "patch_r01_c04"
    },
    {
      "selector": "sqi_top_window",
      "video": "4.mp4",
      "pred_bpm": 99.756,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 15.744,
      "range_error": 11.244,
      "within_range": false,
      "source": "best SQI candidate per window",
      "selected_method": "pca",
      "selected_region": "patch_r01_c05"
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "video": "4.mp4",
      "pred_bpm": 107.666,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 7.834,
      "range_error": 3.334,
      "within_range": false,
      "source": "leave-one-video-out supervised peak ranker",
      "selected_method": "pca",
      "selected_region": "patch_r04_c05"
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "video": "4.mp4",
      "pred_bpm": 108.105,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 7.395,
      "range_error": 2.895,
      "within_range": false,
      "source": "LOOCV supervised ranker with temporal tracking",
      "selected_method": "pca",
      "selected_region": "patch_r04_c05"
    },
    {
      "selector": "tracked_sqi",
      "video": "4.mp4",
      "pred_bpm": 99.756,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 15.744,
      "range_error": 11.244,
      "within_range": false,
      "source": "Viterbi path over SQI candidates",
      "selected_method": "pca",
      "selected_region": "patch_r01_c05"
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "video": "4.mp4",
      "pred_bpm": 93.164,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 22.336,
      "range_error": 17.836,
      "within_range": false,
      "source": "leave-one-video-out best fixed method/region",
      "selected_method": "chrom",
      "selected_region": "patch_r04_c05"
    },
    {
      "selector": "trained_peak_selector_current",
      "video": "4.mp4",
      "pred_bpm": 112.5,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 3.0,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels",
      "selected_method": "pca",
      "selected_region": "patch_r02_c05"
    },
    {
      "selector": "trained_tracked_selector_current",
      "video": "4.mp4",
      "pred_bpm": 112.5,
      "bpm_min": 111.0,
      "bpm_max": 120.0,
      "bpm_target": 115.5,
      "target_abs_error": 3.0,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels with temporal tracking",
      "selected_method": "pca",
      "selected_region": "patch_r02_c05"
    },
    {
      "selector": "fixed_chrom_face_full",
      "video": "5.mp4",
      "pred_bpm": 100.635,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 34.365,
      "range_error": 29.365,
      "within_range": false,
      "source": "chrom+face_full",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_pos_face_full",
      "video": "5.mp4",
      "pred_bpm": 111.182,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 23.818,
      "range_error": 18.818,
      "within_range": false,
      "source": "pos+face_full",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "oracle_method_region",
      "video": "5.mp4",
      "pred_bpm": 119.531,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 15.469,
      "range_error": 10.469,
      "within_range": false,
      "source": "label-leaked best method/region upper bound",
      "selected_method": "pos",
      "selected_region": "patch_r03_c05"
    },
    {
      "selector": "oracle_window_peak",
      "video": "5.mp4",
      "pred_bpm": 134.912,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 0.088,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best window peak upper bound",
      "selected_method": "g_minus_r",
      "selected_region": "patch_r02_c03"
    },
    {
      "selector": "sqi_top_window",
      "video": "5.mp4",
      "pred_bpm": 98.877,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 36.123,
      "range_error": 31.123,
      "within_range": false,
      "source": "best SQI candidate per window",
      "selected_method": "g_minus_r",
      "selected_region": "mid_face"
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "video": "5.mp4",
      "pred_bpm": 112.5,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 22.5,
      "range_error": 17.5,
      "within_range": false,
      "source": "leave-one-video-out supervised peak ranker",
      "selected_method": "pca",
      "selected_region": "upper_face"
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "video": "5.mp4",
      "pred_bpm": 110.303,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 24.697,
      "range_error": 19.697,
      "within_range": false,
      "source": "LOOCV supervised ranker with temporal tracking",
      "selected_method": "pca",
      "selected_region": "upper_face"
    },
    {
      "selector": "tracked_sqi",
      "video": "5.mp4",
      "pred_bpm": 100.195,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 34.805,
      "range_error": 29.805,
      "within_range": false,
      "source": "Viterbi path over SQI candidates",
      "selected_method": "pca",
      "selected_region": "face_full"
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "video": "5.mp4",
      "pred_bpm": 101.514,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 33.486,
      "range_error": 28.486,
      "within_range": false,
      "source": "leave-one-video-out best fixed method/region",
      "selected_method": "chrom",
      "selected_region": "patch_r01_c03"
    },
    {
      "selector": "trained_peak_selector_current",
      "video": "5.mp4",
      "pred_bpm": 134.033,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 0.967,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels",
      "selected_method": "chrom",
      "selected_region": "patch_r03_c05"
    },
    {
      "selector": "trained_tracked_selector_current",
      "video": "5.mp4",
      "pred_bpm": 135.352,
      "bpm_min": 130.0,
      "bpm_max": 140.0,
      "bpm_target": 135.0,
      "target_abs_error": 0.352,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels with temporal tracking",
      "selected_method": "g_minus_r",
      "selected_region": "patch_r04_c04"
    },
    {
      "selector": "fixed_chrom_face_full",
      "video": "6.mp4",
      "pred_bpm": 92.285,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 2.285,
      "range_error": 2.285,
      "within_range": false,
      "source": "chrom+face_full",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_pos_face_full",
      "video": "6.mp4",
      "pred_bpm": 92.725,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 2.725,
      "range_error": 2.725,
      "within_range": false,
      "source": "pos+face_full",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "oracle_method_region",
      "video": "6.mp4",
      "pred_bpm": 90.088,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 0.088,
      "range_error": 0.088,
      "within_range": false,
      "source": "label-leaked best method/region upper bound",
      "selected_method": "g_minus_r",
      "selected_region": "patch_r02_c02"
    },
    {
      "selector": "oracle_window_peak",
      "video": "6.mp4",
      "pred_bpm": 90.088,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 0.088,
      "range_error": 0.088,
      "within_range": false,
      "source": "label-leaked best window peak upper bound",
      "selected_method": "green",
      "selected_region": "patch_r01_c04"
    },
    {
      "selector": "sqi_top_window",
      "video": "6.mp4",
      "pred_bpm": 100.195,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 10.195,
      "range_error": 10.195,
      "within_range": false,
      "source": "best SQI candidate per window",
      "selected_method": "pca",
      "selected_region": "face_full"
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "video": "6.mp4",
      "pred_bpm": 110.742,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 20.742,
      "range_error": 20.742,
      "within_range": false,
      "source": "leave-one-video-out supervised peak ranker",
      "selected_method": "ica",
      "selected_region": "patch_r01_c05"
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "video": "6.mp4",
      "pred_bpm": 108.105,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 18.105,
      "range_error": 18.105,
      "within_range": false,
      "source": "LOOCV supervised ranker with temporal tracking",
      "selected_method": "chrom",
      "selected_region": "patch_r01_c05"
    },
    {
      "selector": "tracked_sqi",
      "video": "6.mp4",
      "pred_bpm": 100.195,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 10.195,
      "range_error": 10.195,
      "within_range": false,
      "source": "Viterbi path over SQI candidates",
      "selected_method": "pca",
      "selected_region": "face_full"
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "video": "6.mp4",
      "pred_bpm": 105.469,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 15.469,
      "range_error": 15.469,
      "within_range": false,
      "source": "leave-one-video-out best fixed method/region",
      "selected_method": "chrom",
      "selected_region": "patch_r04_c01"
    },
    {
      "selector": "trained_peak_selector_current",
      "video": "6.mp4",
      "pred_bpm": 91.406,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 1.406,
      "range_error": 1.406,
      "within_range": false,
      "source": "trained on current OCR labels",
      "selected_method": "ica",
      "selected_region": "patch_r02_c02"
    },
    {
      "selector": "trained_tracked_selector_current",
      "video": "6.mp4",
      "pred_bpm": 90.527,
      "bpm_min": 90.0,
      "bpm_max": 90.0,
      "bpm_target": 90.0,
      "target_abs_error": 0.527,
      "range_error": 0.527,
      "within_range": false,
      "source": "trained on current OCR labels with temporal tracking",
      "selected_method": "chrom",
      "selected_region": "patch_r02_c02"
    },
    {
      "selector": "fixed_chrom_face_full",
      "video": "7.mp4",
      "pred_bpm": 101.074,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 88.426,
      "range_error": 80.926,
      "within_range": false,
      "source": "chrom+face_full",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_pos_face_full",
      "video": "7.mp4",
      "pred_bpm": 91.846,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 97.654,
      "range_error": 90.154,
      "within_range": false,
      "source": "pos+face_full",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "oracle_method_region",
      "video": "7.mp4",
      "pred_bpm": 125.244,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 64.256,
      "range_error": 56.756,
      "within_range": false,
      "source": "label-leaked best method/region upper bound",
      "selected_method": "chrom",
      "selected_region": "patch_r04_c05"
    },
    {
      "selector": "oracle_window_peak",
      "video": "7.mp4",
      "pred_bpm": 189.404,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 0.096,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best window peak upper bound",
      "selected_method": "chrom",
      "selected_region": "patch_r02_c05"
    },
    {
      "selector": "sqi_top_window",
      "video": "7.mp4",
      "pred_bpm": 98.877,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 90.623,
      "range_error": 83.123,
      "within_range": false,
      "source": "best SQI candidate per window",
      "selected_method": "pca",
      "selected_region": "face_full"
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "video": "7.mp4",
      "pred_bpm": 111.621,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 77.879,
      "range_error": 70.379,
      "within_range": false,
      "source": "leave-one-video-out supervised peak ranker",
      "selected_method": "chrom",
      "selected_region": "patch_r01_c02"
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "video": "7.mp4",
      "pred_bpm": 110.742,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 78.758,
      "range_error": 71.258,
      "within_range": false,
      "source": "LOOCV supervised ranker with temporal tracking",
      "selected_method": "g_minus_r",
      "selected_region": "face_full"
    },
    {
      "selector": "tracked_sqi",
      "video": "7.mp4",
      "pred_bpm": 98.877,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 90.623,
      "range_error": 83.123,
      "within_range": false,
      "source": "Viterbi path over SQI candidates",
      "selected_method": "pca",
      "selected_region": "face_full"
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "video": "7.mp4",
      "pred_bpm": 95.361,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 94.139,
      "range_error": 86.639,
      "within_range": false,
      "source": "leave-one-video-out best fixed method/region",
      "selected_method": "pos",
      "selected_region": "patch_r01_c02"
    },
    {
      "selector": "trained_peak_selector_current",
      "video": "7.mp4",
      "pred_bpm": 188.525,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 0.975,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels",
      "selected_method": "chrom",
      "selected_region": "patch_r03_c05"
    },
    {
      "selector": "trained_tracked_selector_current",
      "video": "7.mp4",
      "pred_bpm": 190.723,
      "bpm_min": 182.0,
      "bpm_max": 197.0,
      "bpm_target": 189.5,
      "target_abs_error": 1.223,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels with temporal tracking",
      "selected_method": "g_minus_r",
      "selected_region": "patch_r04_c04"
    },
    {
      "selector": "fixed_chrom_face_full",
      "video": "8.mp4",
      "pred_bpm": 108.545,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 1.955,
      "range_error": 0.0,
      "within_range": true,
      "source": "chrom+face_full",
      "selected_method": "chrom",
      "selected_region": "face_full"
    },
    {
      "selector": "fixed_pos_face_full",
      "video": "8.mp4",
      "pred_bpm": 101.074,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 9.426,
      "range_error": 6.926,
      "within_range": false,
      "source": "pos+face_full",
      "selected_method": "pos",
      "selected_region": "face_full"
    },
    {
      "selector": "oracle_method_region",
      "video": "8.mp4",
      "pred_bpm": 110.742,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 0.242,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best method/region upper bound",
      "selected_method": "chrom",
      "selected_region": "patch_r01_c03"
    },
    {
      "selector": "oracle_window_peak",
      "video": "8.mp4",
      "pred_bpm": 110.303,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 0.197,
      "range_error": 0.0,
      "within_range": true,
      "source": "label-leaked best window peak upper bound",
      "selected_method": "g_minus_r",
      "selected_region": "face_full"
    },
    {
      "selector": "sqi_top_window",
      "video": "8.mp4",
      "pred_bpm": 100.195,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 10.305,
      "range_error": 7.805,
      "within_range": false,
      "source": "best SQI candidate per window",
      "selected_method": "pca",
      "selected_region": "patch_r01_c02"
    },
    {
      "selector": "supervised_peak_ranker_loocv",
      "video": "8.mp4",
      "pred_bpm": 116.895,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 6.395,
      "range_error": 3.895,
      "within_range": false,
      "source": "leave-one-video-out supervised peak ranker",
      "selected_method": "pca",
      "selected_region": "patch_r01_c02"
    },
    {
      "selector": "supervised_tracked_ranker_loocv",
      "video": "8.mp4",
      "pred_bpm": 112.939,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 2.439,
      "range_error": 0.0,
      "within_range": true,
      "source": "LOOCV supervised ranker with temporal tracking",
      "selected_method": "ica",
      "selected_region": "lower_face"
    },
    {
      "selector": "tracked_sqi",
      "video": "8.mp4",
      "pred_bpm": 100.195,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 10.305,
      "range_error": 7.805,
      "within_range": false,
      "source": "Viterbi path over SQI candidates",
      "selected_method": "pca",
      "selected_region": "patch_r01_c02"
    },
    {
      "selector": "train_calibrated_fixed_loocv",
      "video": "8.mp4",
      "pred_bpm": 94.043,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 16.457,
      "range_error": 13.957,
      "within_range": false,
      "source": "leave-one-video-out best fixed method/region",
      "selected_method": "chrom",
      "selected_region": "patch_r05_c03"
    },
    {
      "selector": "trained_peak_selector_current",
      "video": "8.mp4",
      "pred_bpm": 111.182,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 0.682,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels",
      "selected_method": "g_minus_r",
      "selected_region": "patch_r02_c01"
    },
    {
      "selector": "trained_tracked_selector_current",
      "video": "8.mp4",
      "pred_bpm": 111.182,
      "bpm_min": 108.0,
      "bpm_max": 113.0,
      "bpm_target": 110.5,
      "target_abs_error": 0.682,
      "range_error": 0.0,
      "within_range": true,
      "source": "trained on current OCR labels with temporal tracking",
      "selected_method": "g_minus_r",
      "selected_region": "patch_r02_c01"
    }
  ],
  "topMethodRegions": [
    {
      "method": "g_minus_r",
      "region_id": "patch_r05_c05",
      "region_label": "Patch R5 C5",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 43.128,
      "target_rmse": 57.337,
      "range_mae": 36.771,
      "within_range_pct": 0.0,
      "median_quality_score": 4.555
    },
    {
      "method": "chrom",
      "region_id": "patch_r05_c03",
      "region_label": "Patch R5 C3",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 43.128,
      "target_rmse": 55.935,
      "range_mae": 36.771,
      "within_range_pct": 0.0,
      "median_quality_score": 3.965
    },
    {
      "method": "pos",
      "region_id": "patch_r05_c03",
      "region_label": "Patch R5 C3",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 43.379,
      "target_rmse": 57.577,
      "range_mae": 37.022,
      "within_range_pct": 0.0,
      "median_quality_score": 4.052
    },
    {
      "method": "chrom",
      "region_id": "patch_r04_c05",
      "region_label": "Patch R4 C5",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 43.568,
      "target_rmse": 56.527,
      "range_mae": 37.21,
      "within_range_pct": 0.0,
      "median_quality_score": 4.132
    },
    {
      "method": "chrom",
      "region_id": "patch_r01_c03",
      "region_label": "Patch R1 C3",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 43.323,
      "target_rmse": 57.342,
      "range_mae": 37.288,
      "within_range_pct": 14.29,
      "median_quality_score": 4.431
    },
    {
      "method": "chrom",
      "region_id": "patch_r04_c01",
      "region_label": "Patch R4 C1",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 43.505,
      "target_rmse": 57.583,
      "range_mae": 37.414,
      "within_range_pct": 14.29,
      "median_quality_score": 4.032
    },
    {
      "method": "green",
      "region_id": "patch_r05_c04",
      "region_label": "Patch R5 C4",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 43.819,
      "target_rmse": 56.825,
      "range_mae": 37.461,
      "within_range_pct": 0.0,
      "median_quality_score": 4.39
    },
    {
      "method": "pos",
      "region_id": "patch_r02_c02",
      "region_label": "Patch R2 C2",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 44.013,
      "target_rmse": 61.23,
      "range_mae": 37.656,
      "within_range_pct": 0.0,
      "median_quality_score": 4.204
    },
    {
      "method": "pos",
      "region_id": "patch_r01_c02",
      "region_label": "Patch R1 C2",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 44.264,
      "target_rmse": 59.484,
      "range_mae": 37.907,
      "within_range_pct": 0.0,
      "median_quality_score": 4.142
    },
    {
      "method": "pos",
      "region_id": "patch_r04_c01",
      "region_label": "Patch R4 C1",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 44.195,
      "target_rmse": 59.279,
      "range_mae": 38.104,
      "within_range_pct": 14.29,
      "median_quality_score": 4.256
    },
    {
      "method": "pos",
      "region_id": "patch_r02_c01",
      "region_label": "Patch R2 C1",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 44.635,
      "target_rmse": 57.479,
      "range_mae": 38.278,
      "within_range_pct": 0.0,
      "median_quality_score": 4.212
    },
    {
      "method": "chrom",
      "region_id": "patch_r02_c01",
      "region_label": "Patch R2 C1",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 44.698,
      "target_rmse": 57.415,
      "range_mae": 38.341,
      "within_range_pct": 0.0,
      "median_quality_score": 4.07
    },
    {
      "method": "chrom",
      "region_id": "patch_r03_c04",
      "region_label": "Patch R3 C4",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 44.76,
      "target_rmse": 58.802,
      "range_mae": 38.403,
      "within_range_pct": 0.0,
      "median_quality_score": 3.869
    },
    {
      "method": "chrom",
      "region_id": "face_full",
      "region_label": "Full face",
      "region_kind": "roi",
      "n": 7,
      "target_mae": 44.76,
      "target_rmse": 59.763,
      "range_mae": 38.481,
      "within_range_pct": 14.29,
      "median_quality_score": 4.198
    },
    {
      "method": "pca",
      "region_id": "patch_r03_c04",
      "region_label": "Patch R3 C4",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 44.886,
      "target_rmse": 59.976,
      "range_mae": 38.529,
      "within_range_pct": 0.0,
      "median_quality_score": 4.807
    },
    {
      "method": "pos",
      "region_id": "mid_face",
      "region_label": "Mid face",
      "region_kind": "roi",
      "n": 7,
      "target_mae": 44.949,
      "target_rmse": 57.171,
      "range_mae": 38.592,
      "within_range_pct": 0.0,
      "median_quality_score": 4.302
    },
    {
      "method": "pos",
      "region_id": "face_full",
      "region_label": "Full face",
      "region_kind": "roi",
      "n": 7,
      "target_mae": 45.074,
      "target_rmse": 60.585,
      "range_mae": 38.717,
      "within_range_pct": 0.0,
      "median_quality_score": 4.146
    },
    {
      "method": "g_minus_r",
      "region_id": "patch_r02_c02",
      "region_label": "Patch R2 C2",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 45.2,
      "target_rmse": 57.6,
      "range_mae": 38.843,
      "within_range_pct": 0.0,
      "median_quality_score": 4.5
    },
    {
      "method": "chrom",
      "region_id": "patch_r02_c02",
      "region_label": "Patch R2 C2",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 45.263,
      "target_rmse": 60.598,
      "range_mae": 38.905,
      "within_range_pct": 0.0,
      "median_quality_score": 4.045
    },
    {
      "method": "ica",
      "region_id": "patch_r05_c03",
      "region_label": "Patch R5 C3",
      "region_kind": "patch",
      "n": 7,
      "target_mae": 45.325,
      "target_rmse": 59.606,
      "range_mae": 38.968,
      "within_range_pct": 0.0,
      "median_quality_score": 4.648
    }
  ],
  "extractionStats": [
    {
      "video": "1.mp4",
      "samples": 957,
      "effective_fps": 15.003,
      "detected_pct": 100.0,
      "median_box_conf": 0.919,
      "regions": 29
    },
    {
      "video": "3.mp4",
      "samples": 1451,
      "effective_fps": 14.996,
      "detected_pct": 100.0,
      "median_box_conf": 0.913,
      "regions": 29
    },
    {
      "video": "4.mp4",
      "samples": 945,
      "effective_fps": 14.997,
      "detected_pct": 100.0,
      "median_box_conf": 0.894,
      "regions": 29
    },
    {
      "video": "5.mp4",
      "samples": 908,
      "effective_fps": 15.003,
      "detected_pct": 100.0,
      "median_box_conf": 0.923,
      "regions": 29
    },
    {
      "video": "6.mp4",
      "samples": 1035,
      "effective_fps": 15.005,
      "detected_pct": 100.0,
      "median_box_conf": 0.926,
      "regions": 29
    },
    {
      "video": "7.mp4",
      "samples": 933,
      "effective_fps": 15.004,
      "detected_pct": 100.0,
      "median_box_conf": 0.911,
      "regions": 29
    },
    {
      "video": "8.mp4",
      "samples": 932,
      "effective_fps": 14.995,
      "detected_pct": 100.0,
      "median_box_conf": 0.925,
      "regions": 29
    }
  ]
} as const;
