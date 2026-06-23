export const RPPG_ADAPTIVE_ROI_LATEST = {
  "generatedAt": "2026-05-27T10:18:39",
  "overview": {
    "title": "Adaptive Pet ROI Pipeline",
    "status": "Integrated single-view dog-aware pipeline",
    "recommendedCommand": "python tools/analyze_video.py --stem <id> --dog_aware --relax_rejection",
    "selectorFormula": "quality = SNR * pixel_factor * clean_factor * artifact_factor",
    "selectorThreshold": 1.15,
    "keypointModel": "DeepLabCut SuperAnimal Quadruped HRNet-W32",
    "pipelineSteps": [
      "DLC keypoint detection",
      "Dual ROI candidate generation",
      "A+B panting subtraction and amplification",
      "Per-zone quality scoring",
      "Adaptive single/multi ROI decision",
      "Windowed rPPG with rejection",
      "Smart final BPM selection"
    ]
  },
  "evaluation": {
    "videos": 6,
    "meanAbsError": 41.17,
    "medianAbsError": 33.35,
    "highHrRecovery": "1/2",
    "rows": [
      {
        "video": 1,
        "target_bpm": 175.0,
        "best_raw_bpm": 203.3,
        "best_relaxed_bpm": 203.3,
        "abs_error": 28.3,
        "best_relaxed_snr": 54.6,
        "windows_total": 48,
        "windows_kept_relaxed": 48,
        "kept_pct": 100.0,
        "avg_pixel_mean_kept": 1706.0,
        "high_hr_recovery": false
      },
      {
        "video": 3,
        "target_bpm": 210.0,
        "best_raw_bpm": 176.4,
        "best_relaxed_bpm": 176.4,
        "abs_error": 33.6,
        "best_relaxed_snr": 21.67,
        "windows_total": 48,
        "windows_kept_relaxed": 48,
        "kept_pct": 100.0,
        "avg_pixel_mean_kept": 1681.0,
        "high_hr_recovery": true
      },
      {
        "video": 5,
        "target_bpm": 135.0,
        "best_raw_bpm": 211.5,
        "best_relaxed_bpm": 211.5,
        "abs_error": 76.5,
        "best_relaxed_snr": 54.33,
        "windows_total": 48,
        "windows_kept_relaxed": 47,
        "kept_pct": 97.9,
        "avg_pixel_mean_kept": 1676.0,
        "high_hr_recovery": false
      },
      {
        "video": 6,
        "target_bpm": 90.0,
        "best_raw_bpm": 105.5,
        "best_relaxed_bpm": 121.9,
        "abs_error": 31.9,
        "best_relaxed_snr": 31.25,
        "windows_total": 48,
        "windows_kept_relaxed": 47,
        "kept_pct": 97.9,
        "avg_pixel_mean_kept": 1717.0,
        "high_hr_recovery": false
      },
      {
        "video": 7,
        "target_bpm": 189.5,
        "best_raw_bpm": 102.5,
        "best_relaxed_bpm": 156.4,
        "abs_error": 33.1,
        "best_relaxed_snr": 55.17,
        "windows_total": 48,
        "windows_kept_relaxed": 42,
        "kept_pct": 87.5,
        "avg_pixel_mean_kept": 1575.0,
        "high_hr_recovery": false
      },
      {
        "video": 8,
        "target_bpm": 110.5,
        "best_raw_bpm": 154.1,
        "best_relaxed_bpm": 154.1,
        "abs_error": 43.6,
        "best_relaxed_snr": 51.98,
        "windows_total": 48,
        "windows_kept_relaxed": 41,
        "kept_pct": 85.4,
        "avg_pixel_mean_kept": 1679.0,
        "high_hr_recovery": false
      }
    ],
    "smartV2Rows": [
      {
        "video": 1,
        "target": 175.0,
        "naive_bpm": 203.3,
        "naive_err": 28.3,
        "old_fixedK_bpm": 203.3,
        "old_fixedK_err": 28.3,
        "v2_bpm": 201.0,
        "v2_err": 26.0,
        "v2_n_windows": 14,
        "v2_method": "score_weighted_median"
      },
      {
        "video": 3,
        "target": 210.0,
        "naive_bpm": 176.4,
        "naive_err": 33.6,
        "old_fixedK_bpm": 149.4,
        "old_fixedK_err": 60.6,
        "v2_bpm": 152.9,
        "v2_err": 57.1,
        "v2_n_windows": 30,
        "v2_method": "score_weighted_median"
      },
      {
        "video": 5,
        "target": 135.0,
        "naive_bpm": 211.5,
        "naive_err": 76.5,
        "old_fixedK_bpm": 211.5,
        "old_fixedK_err": 76.5,
        "v2_bpm": 211.5,
        "v2_err": 76.5,
        "v2_n_windows": 14,
        "v2_method": "weighted_median_in_strongest_cluster"
      },
      {
        "video": 6,
        "target": 90.0,
        "naive_bpm": 105.5,
        "naive_err": 15.5,
        "old_fixedK_bpm": 193.9,
        "old_fixedK_err": 103.9,
        "v2_bpm": 176.4,
        "v2_err": 86.4,
        "v2_n_windows": 26,
        "v2_method": "score_weighted_median"
      },
      {
        "video": 7,
        "target": 189.5,
        "naive_bpm": 102.5,
        "naive_err": 87.0,
        "old_fixedK_bpm": 155.9,
        "old_fixedK_err": 33.6,
        "v2_bpm": 155.3,
        "v2_err": 34.2,
        "v2_n_windows": 12,
        "v2_method": "score_weighted_median"
      },
      {
        "video": 8,
        "target": 110.5,
        "naive_bpm": 154.1,
        "naive_err": 43.6,
        "old_fixedK_bpm": 154.1,
        "old_fixedK_err": 43.6,
        "v2_bpm": 154.1,
        "v2_err": 43.6,
        "v2_n_windows": 15,
        "v2_method": "score_weighted_median"
      }
    ],
    "meanSmartV2Error": 53.97
  },
  "roiSelection": {
    "source": "reports\\rppg_pet_keypoints\\dual_roi_candidates\\dual_roi_candidates_results.csv",
    "videos": [
      {
        "video": "3.mp4",
        "targetBpm": 210.0,
        "highHrPrior": true,
        "decisions": [
          {
            "zone": "throat",
            "label": "Throat",
            "chosenFamily": "multi",
            "chosenName": "throat_area_multi",
            "chosenBpm": 177.5,
            "chosenSnr": 14.96,
            "chosenQuality": 6.936,
            "reason": "multi wins: q=6.936 > 1.15 * single q=5.964",
            "candidates": [
              {
                "family": "single",
                "baseName": "throat_exposed",
                "name": "throat_exposed_single",
                "pixelMean": 1906.1,
                "postCleanGrVar": 268.8,
                "bestBpm": 204.5,
                "bestSnr": 14.53,
                "bestMethod": "green",
                "distFrom100": 104.5,
                "zoneQuality": 5.964
              },
              {
                "family": "multi",
                "baseName": "throat_area",
                "name": "throat_area_multi",
                "pixelMean": 2851.1,
                "postCleanGrVar": 248.95,
                "bestBpm": 177.5,
                "bestSnr": 14.96,
                "bestMethod": "green",
                "distFrom100": 77.5,
                "zoneQuality": 6.936
              }
            ]
          },
          {
            "zone": "right_ear",
            "label": "Right ear",
            "chosenFamily": "multi",
            "chosenName": "ear_area_right_multi",
            "chosenBpm": 150.0,
            "chosenSnr": 59.67,
            "chosenQuality": 14.387,
            "reason": "multi wins: q=14.387 > 1.15 * single q=3.888",
            "candidates": [
              {
                "family": "single",
                "baseName": "right_ear_base",
                "name": "right_ear_base_single",
                "pixelMean": 1008.0,
                "postCleanGrVar": 774.21,
                "bestBpm": 171.7,
                "bestSnr": 22.69,
                "bestMethod": "green",
                "distFrom100": 71.7,
                "zoneQuality": 3.888
              },
              {
                "family": "multi",
                "baseName": "ear_area_right",
                "name": "ear_area_right_multi",
                "pixelMean": 1452.8,
                "postCleanGrVar": 483.82,
                "bestBpm": 150.0,
                "bestSnr": 59.67,
                "bestMethod": "green",
                "distFrom100": 50.0,
                "zoneQuality": 14.387
              }
            ]
          },
          {
            "zone": "left_ear",
            "label": "Left ear",
            "chosenFamily": "multi",
            "chosenName": "ear_area_left_multi",
            "chosenBpm": 140.6,
            "chosenSnr": 32.98,
            "chosenQuality": 7.234,
            "reason": "multi wins: q=7.234 > 1.15 * single q=2.677",
            "candidates": [
              {
                "family": "single",
                "baseName": "left_ear_base",
                "name": "left_ear_base_single",
                "pixelMean": 1007.9,
                "postCleanGrVar": 636.34,
                "bestBpm": 203.9,
                "bestSnr": 13.52,
                "bestMethod": "green",
                "distFrom100": 103.9,
                "zoneQuality": 2.677
              },
              {
                "family": "multi",
                "baseName": "ear_area_left",
                "name": "ear_area_left_multi",
                "pixelMean": 1452.2,
                "postCleanGrVar": 556.57,
                "bestBpm": 140.6,
                "bestSnr": 32.98,
                "bestMethod": "green",
                "distFrom100": 40.6,
                "zoneQuality": 7.234
              }
            ]
          },
          {
            "zone": "muzzle",
            "label": "Muzzle",
            "chosenFamily": "multi",
            "chosenName": "muzzle_area_multi",
            "chosenBpm": 209.8,
            "chosenSnr": 14.48,
            "chosenQuality": 3.24,
            "reason": "multi wins: q=3.24 > 1.15 * single q=2.002",
            "candidates": [
              {
                "family": "single",
                "baseName": "muzzle_skin",
                "name": "muzzle_skin_single",
                "pixelMean": 665.4,
                "postCleanGrVar": 444.87,
                "bestBpm": 198.6,
                "bestSnr": 9.45,
                "bestMethod": "green",
                "distFrom100": 98.6,
                "zoneQuality": 2.002
              },
              {
                "family": "multi",
                "baseName": "muzzle_area",
                "name": "muzzle_area_multi",
                "pixelMean": 960.5,
                "postCleanGrVar": 520.2,
                "bestBpm": 209.8,
                "bestSnr": 14.48,
                "bestMethod": "green",
                "distFrom100": 109.8,
                "zoneQuality": 3.24
              }
            ]
          },
          {
            "zone": "nose",
            "label": "Nose bridge",
            "chosenFamily": "single",
            "chosenName": "nose_bridge_single",
            "chosenBpm": 87.3,
            "chosenSnr": 10.62,
            "chosenQuality": 1.58,
            "reason": "single-only candidate",
            "candidates": [
              {
                "family": "single",
                "baseName": "nose_bridge",
                "name": "nose_bridge_single",
                "pixelMean": 1275.9,
                "postCleanGrVar": 378.54,
                "bestBpm": 87.3,
                "bestSnr": 10.62,
                "bestMethod": "pca",
                "distFrom100": 12.7,
                "zoneQuality": 1.58
              }
            ]
          }
        ],
        "gallery": {
          "frame": "frame 120",
          "keypointsUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/3_frame120_keypoints_kr.jpg",
          "allRoisUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/3_frame120_all_rois_kr.jpg",
          "chosenRoisUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/3_frame120_chosen_rois_kr_with_quality.jpg"
        }
      },
      {
        "video": "6.mp4",
        "targetBpm": 90.0,
        "highHrPrior": false,
        "decisions": [
          {
            "zone": "throat",
            "label": "Throat",
            "chosenFamily": "multi",
            "chosenName": "throat_area_multi",
            "chosenBpm": 176.4,
            "chosenSnr": 25.18,
            "chosenQuality": 14.018,
            "reason": "multi wins: q=14.018 > 1.15 * single q=10.372",
            "candidates": [
              {
                "family": "single",
                "baseName": "throat_exposed",
                "name": "throat_exposed_single",
                "pixelMean": 1936.0,
                "postCleanGrVar": 112.11,
                "bestBpm": 211.5,
                "bestSnr": 19.68,
                "bestMethod": "green",
                "distFrom100": 111.5,
                "zoneQuality": 10.372
              },
              {
                "family": "multi",
                "baseName": "throat_area",
                "name": "throat_area_multi",
                "pixelMean": 2896.0,
                "postCleanGrVar": 121.99,
                "bestBpm": 176.4,
                "bestSnr": 25.18,
                "bestMethod": "green",
                "distFrom100": 76.4,
                "zoneQuality": 14.018
              }
            ]
          },
          {
            "zone": "right_ear",
            "label": "Right ear",
            "chosenFamily": "single",
            "chosenName": "right_ear_base_single",
            "chosenBpm": 185.7,
            "chosenSnr": 40.58,
            "chosenQuality": 19.007,
            "reason": "single kept: multi q=6.207 <= 1.15 * single q=19.007",
            "candidates": [
              {
                "family": "single",
                "baseName": "right_ear_base",
                "name": "right_ear_base_single",
                "pixelMean": 1024.0,
                "postCleanGrVar": 86.55,
                "bestBpm": 185.7,
                "bestSnr": 40.58,
                "bestMethod": "green",
                "distFrom100": 85.7,
                "zoneQuality": 19.007
              },
              {
                "family": "multi",
                "baseName": "ear_area_right",
                "name": "ear_area_right_multi",
                "pixelMean": 1476.0,
                "postCleanGrVar": 156.79,
                "bestBpm": 113.7,
                "bestSnr": 25.83,
                "bestMethod": "green",
                "distFrom100": 13.7,
                "zoneQuality": 6.207
              }
            ]
          },
          {
            "zone": "left_ear",
            "label": "Left ear",
            "chosenFamily": "single",
            "chosenName": "left_ear_base_single",
            "chosenBpm": 214.5,
            "chosenSnr": 38.85,
            "chosenQuality": 17.936,
            "reason": "single kept: multi q=9.056 <= 1.15 * single q=17.936",
            "candidates": [
              {
                "family": "single",
                "baseName": "left_ear_base",
                "name": "left_ear_base_single",
                "pixelMean": 1024.0,
                "postCleanGrVar": 91.45,
                "bestBpm": 214.5,
                "bestSnr": 38.85,
                "bestMethod": "green",
                "distFrom100": 114.5,
                "zoneQuality": 17.936
              },
              {
                "family": "multi",
                "baseName": "ear_area_left",
                "name": "ear_area_left_multi",
                "pixelMean": 1476.0,
                "postCleanGrVar": 85.22,
                "bestBpm": 200.4,
                "bestSnr": 17.08,
                "bestMethod": "green",
                "distFrom100": 100.4,
                "zoneQuality": 9.056
              }
            ]
          },
          {
            "zone": "muzzle",
            "label": "Muzzle",
            "chosenFamily": "single",
            "chosenName": "muzzle_skin_single",
            "chosenBpm": 122.5,
            "chosenSnr": 69.03,
            "chosenQuality": 12.436,
            "reason": "single kept: multi q=10.18 <= 1.15 * single q=12.436",
            "candidates": [
              {
                "family": "single",
                "baseName": "muzzle_skin",
                "name": "muzzle_skin_single",
                "pixelMean": 676.0,
                "postCleanGrVar": 154.34,
                "bestBpm": 122.5,
                "bestSnr": 69.03,
                "bestMethod": "green",
                "distFrom100": 22.5,
                "zoneQuality": 12.436
              },
              {
                "family": "multi",
                "baseName": "muzzle_area",
                "name": "muzzle_area_multi",
                "pixelMean": 976.0,
                "postCleanGrVar": 207.72,
                "bestBpm": 106.1,
                "bestSnr": 54.72,
                "bestMethod": "green",
                "distFrom100": 6.1,
                "zoneQuality": 10.18
              }
            ]
          },
          {
            "zone": "nose",
            "label": "Nose bridge",
            "chosenFamily": "single",
            "chosenName": "nose_bridge_single",
            "chosenBpm": 117.8,
            "chosenSnr": 68.07,
            "chosenQuality": 18.458,
            "reason": "single-only candidate",
            "candidates": [
              {
                "family": "single",
                "baseName": "nose_bridge",
                "name": "nose_bridge_single",
                "pixelMean": 1296.0,
                "postCleanGrVar": 96.61,
                "bestBpm": 117.8,
                "bestSnr": 68.07,
                "bestMethod": "green",
                "distFrom100": 17.8,
                "zoneQuality": 18.458
              }
            ]
          }
        ],
        "gallery": {
          "frame": "frame 100",
          "keypointsUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/6_frame100_keypoints_kr.jpg",
          "allRoisUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/6_frame100_all_rois_kr.jpg",
          "chosenRoisUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/6_frame100_chosen_rois_kr_with_quality.jpg"
        }
      },
      {
        "video": "7.mp4",
        "targetBpm": 189.5,
        "highHrPrior": true,
        "decisions": [
          {
            "zone": "throat",
            "label": "Throat",
            "chosenFamily": "single",
            "chosenName": "throat_exposed_single",
            "chosenBpm": 143.6,
            "chosenSnr": 22.18,
            "chosenQuality": 4.372,
            "reason": "single kept: multi q=3.179 <= 1.15 * single q=4.372",
            "candidates": [
              {
                "family": "single",
                "baseName": "throat_exposed",
                "name": "throat_exposed_single",
                "pixelMean": 1652.0,
                "postCleanGrVar": 680.41,
                "bestBpm": 143.6,
                "bestSnr": 22.18,
                "bestMethod": "green",
                "distFrom100": 43.6,
                "zoneQuality": 4.372
              },
              {
                "family": "multi",
                "baseName": "throat_area",
                "name": "throat_area_multi",
                "pixelMean": 2469.3,
                "postCleanGrVar": 746.4,
                "bestBpm": 207.4,
                "bestSnr": 14.06,
                "bestMethod": "green",
                "distFrom100": 107.4,
                "zoneQuality": 3.179
              }
            ]
          },
          {
            "zone": "right_ear",
            "label": "Right ear",
            "chosenFamily": "multi",
            "chosenName": "ear_area_right_multi",
            "chosenBpm": 143.0,
            "chosenSnr": 16.05,
            "chosenQuality": 2.48,
            "reason": "multi wins: q=2.48 > 1.15 * single q=1.651",
            "candidates": [
              {
                "family": "single",
                "baseName": "right_ear_base",
                "name": "right_ear_base_single",
                "pixelMean": 872.2,
                "postCleanGrVar": 1448.7,
                "bestBpm": 143.6,
                "bestSnr": 18.94,
                "bestMethod": "pos",
                "distFrom100": 43.6,
                "zoneQuality": 1.651
              },
              {
                "family": "multi",
                "baseName": "ear_area_right",
                "name": "ear_area_right_multi",
                "pixelMean": 1255.8,
                "postCleanGrVar": 844.72,
                "bestBpm": 143.0,
                "bestSnr": 16.05,
                "bestMethod": "pca",
                "distFrom100": 43.0,
                "zoneQuality": 2.48
              }
            ]
          },
          {
            "zone": "left_ear",
            "label": "Left ear",
            "chosenFamily": "single",
            "chosenName": "left_ear_base_single",
            "chosenBpm": 145.3,
            "chosenSnr": 42.06,
            "chosenQuality": 3.671,
            "reason": "single kept: multi q=1.234 <= 1.15 * single q=3.671",
            "candidates": [
              {
                "family": "single",
                "baseName": "left_ear_base",
                "name": "left_ear_base_single",
                "pixelMean": 872.2,
                "postCleanGrVar": 1446.93,
                "bestBpm": 145.3,
                "bestSnr": 42.06,
                "bestMethod": "green",
                "distFrom100": 45.3,
                "zoneQuality": 3.671
              },
              {
                "family": "multi",
                "baseName": "ear_area_left",
                "name": "ear_area_left_multi",
                "pixelMean": 1255.8,
                "postCleanGrVar": 1411.14,
                "bestBpm": 128.9,
                "bestSnr": 22.03,
                "bestMethod": "green",
                "distFrom100": 28.9,
                "zoneQuality": 1.234
              }
            ]
          },
          {
            "zone": "muzzle",
            "label": "Muzzle",
            "chosenFamily": "multi",
            "chosenName": "muzzle_area_multi",
            "chosenBpm": 102.5,
            "chosenSnr": 56.95,
            "chosenQuality": 5.524,
            "reason": "multi wins: q=5.524 > 1.15 * single q=0.975",
            "candidates": [
              {
                "family": "single",
                "baseName": "muzzle_skin",
                "name": "muzzle_skin_single",
                "pixelMean": 574.9,
                "postCleanGrVar": 601.12,
                "bestBpm": 96.1,
                "bestSnr": 12.34,
                "bestMethod": "pca",
                "distFrom100": 3.9,
                "zoneQuality": 0.975
              },
              {
                "family": "multi",
                "baseName": "muzzle_area",
                "name": "muzzle_area_multi",
                "pixelMean": 828.9,
                "postCleanGrVar": 572.28,
                "bestBpm": 102.5,
                "bestSnr": 56.95,
                "bestMethod": "green",
                "distFrom100": 2.5,
                "zoneQuality": 5.524
              }
            ]
          },
          {
            "zone": "nose",
            "label": "Nose bridge",
            "chosenFamily": "single",
            "chosenName": "nose_bridge_single",
            "chosenBpm": 171.1,
            "chosenSnr": 34.6,
            "chosenQuality": 8.13,
            "reason": "single-only candidate",
            "candidates": [
              {
                "family": "single",
                "baseName": "nose_bridge",
                "name": "nose_bridge_single",
                "pixelMean": 1104.7,
                "postCleanGrVar": 522.23,
                "bestBpm": 171.1,
                "bestSnr": 34.6,
                "bestMethod": "green",
                "distFrom100": 71.1,
                "zoneQuality": 8.13
              }
            ]
          }
        ],
        "gallery": {
          "frame": "frame 90",
          "keypointsUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/7_frame90_keypoints_kr.jpg",
          "allRoisUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/7_frame90_all_rois_kr.jpg",
          "chosenRoisUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/7_frame90_chosen_rois_kr_with_quality.jpg"
        }
      }
    ]
  },
  "multiArea": {
    "source": "reports\\rppg_pet_keypoints\\multi_area_roi_v2\\multi_area_roi_results.csv",
    "bestByVideoVariant": [
      {
        "video": "1.mp4",
        "variant": "fusion_weighted",
        "name": "single_roi_weighted",
        "pixelMean": 1191.2,
        "grVar": 42.42,
        "bestBpm": 139.5,
        "bestSnr": 8.76,
        "bestMethod": "green"
      },
      {
        "video": "1.mp4",
        "variant": "multi_kp_center",
        "name": "ear_right_multi_kp",
        "pixelMean": 784.0,
        "grVar": 74.44,
        "bestBpm": 197.5,
        "bestSnr": 32.94,
        "bestMethod": "green"
      },
      {
        "video": "1.mp4",
        "variant": "multi_patch_area",
        "name": "muzzle_area",
        "pixelMean": 976.0,
        "grVar": 53.81,
        "bestBpm": 201.0,
        "bestSnr": 35.37,
        "bestMethod": "green"
      },
      {
        "video": "1.mp4",
        "variant": "single_center",
        "name": "right_ear_base",
        "pixelMean": 1024.0,
        "grVar": 98.87,
        "bestBpm": 195.7,
        "bestSnr": 46.65,
        "bestMethod": "green"
      },
      {
        "video": "3.mp4",
        "variant": "fusion_weighted",
        "name": "single_roi_weighted",
        "pixelMean": 1172.7,
        "grVar": 218.54,
        "bestBpm": 88.5,
        "bestSnr": 5.86,
        "bestMethod": "green"
      },
      {
        "video": "3.mp4",
        "variant": "multi_kp_center",
        "name": "ear_right_multi_kp",
        "pixelMean": 771.7,
        "grVar": 670.83,
        "bestBpm": 177.5,
        "bestSnr": 18.21,
        "bestMethod": "green"
      },
      {
        "video": "3.mp4",
        "variant": "multi_patch_area",
        "name": "ear_area_right",
        "pixelMean": 1452.8,
        "grVar": 483.82,
        "bestBpm": 150.0,
        "bestSnr": 59.67,
        "bestMethod": "green"
      },
      {
        "video": "3.mp4",
        "variant": "single_center",
        "name": "right_ear_base",
        "pixelMean": 1008.0,
        "grVar": 774.21,
        "bestBpm": 171.7,
        "bestSnr": 22.69,
        "bestMethod": "green"
      },
      {
        "video": "5.mp4",
        "variant": "fusion_weighted",
        "name": "single_roi_weighted",
        "pixelMean": 1186.6,
        "grVar": 18.24,
        "bestBpm": 86.1,
        "bestSnr": 8.63,
        "bestMethod": "green"
      },
      {
        "video": "5.mp4",
        "variant": "multi_kp_center",
        "name": "throat_multi_kp",
        "pixelMean": 1593.8,
        "grVar": 23.26,
        "bestBpm": 86.7,
        "bestSnr": 36.94,
        "bestMethod": "ica"
      },
      {
        "video": "5.mp4",
        "variant": "multi_patch_area",
        "name": "muzzle_area",
        "pixelMean": 972.1,
        "grVar": 170.59,
        "bestBpm": 89.6,
        "bestSnr": 93.29,
        "bestMethod": "green"
      },
      {
        "video": "5.mp4",
        "variant": "single_center",
        "name": "right_ear_base",
        "pixelMean": 1020.0,
        "grVar": 166.67,
        "bestBpm": 211.5,
        "bestSnr": 32.15,
        "bestMethod": "green"
      },
      {
        "video": "6.mp4",
        "variant": "fusion_weighted",
        "name": "single_roi_weighted",
        "pixelMean": 1191.2,
        "grVar": 34.24,
        "bestBpm": 102.0,
        "bestSnr": 9.41,
        "bestMethod": "green"
      },
      {
        "video": "6.mp4",
        "variant": "multi_kp_center",
        "name": "ear_right_multi_kp",
        "pixelMean": 784.0,
        "grVar": 168.85,
        "bestBpm": 106.1,
        "bestSnr": 29.07,
        "bestMethod": "green"
      },
      {
        "video": "6.mp4",
        "variant": "multi_patch_area",
        "name": "muzzle_area",
        "pixelMean": 976.0,
        "grVar": 207.72,
        "bestBpm": 106.1,
        "bestSnr": 54.72,
        "bestMethod": "green"
      },
      {
        "video": "6.mp4",
        "variant": "single_center",
        "name": "muzzle_skin",
        "pixelMean": 676.0,
        "grVar": 154.34,
        "bestBpm": 122.5,
        "bestSnr": 69.03,
        "bestMethod": "green"
      },
      {
        "video": "7.mp4",
        "variant": "fusion_weighted",
        "name": "single_roi_weighted",
        "pixelMean": 1015.2,
        "grVar": 391.1,
        "bestBpm": 95.5,
        "bestSnr": 11.26,
        "bestMethod": "green"
      },
      {
        "video": "7.mp4",
        "variant": "multi_kp_center",
        "name": "ear_right_multi_kp",
        "pixelMean": 667.1,
        "grVar": 1242.01,
        "bestBpm": 143.6,
        "bestSnr": 23.94,
        "bestMethod": "chrom"
      },
      {
        "video": "7.mp4",
        "variant": "multi_patch_area",
        "name": "muzzle_area",
        "pixelMean": 828.9,
        "grVar": 572.28,
        "bestBpm": 102.5,
        "bestSnr": 56.95,
        "bestMethod": "green"
      },
      {
        "video": "7.mp4",
        "variant": "single_center",
        "name": "left_ear_base",
        "pixelMean": 872.2,
        "grVar": 1446.93,
        "bestBpm": 145.3,
        "bestSnr": 42.06,
        "bestMethod": "green"
      },
      {
        "video": "8.mp4",
        "variant": "fusion_weighted",
        "name": "single_roi_weighted",
        "pixelMean": 1149.5,
        "grVar": 57.48,
        "bestBpm": 117.2,
        "bestSnr": 7.97,
        "bestMethod": "green"
      },
      {
        "video": "8.mp4",
        "variant": "multi_kp_center",
        "name": "ear_right_multi_kp",
        "pixelMean": 756.3,
        "grVar": 168.52,
        "bestBpm": 218.6,
        "bestSnr": 50.48,
        "bestMethod": "green"
      },
      {
        "video": "8.mp4",
        "variant": "multi_patch_area",
        "name": "ear_area_left",
        "pixelMean": 1423.8,
        "grVar": 292.17,
        "bestBpm": 104.3,
        "bestSnr": 70.29,
        "bestMethod": "green"
      },
      {
        "video": "8.mp4",
        "variant": "single_center",
        "name": "right_ear_base",
        "pixelMean": 988.0,
        "grVar": 63.25,
        "bestBpm": 135.4,
        "bestSnr": 48.09,
        "bestMethod": "green"
      }
    ]
  },
  "assets": {
    "reportUrl": "",
    "deploymentGuideUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/PET_RPPG_ADAPTIVE_ROI_DEPLOYMENT_GUIDE.md",
    "fullEvaluationReportUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/full_evaluation_current_best/FULL_EVALUATION_REPORT.md",
    "smartSelectionReportUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/full_evaluation_current_best/SMART_SELECTION_REPORT.md",
    "dualCandidatesCsvUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/dual_roi_candidates/dual_roi_candidates_results.csv",
    "fullEvaluationCsvUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/full_evaluation_current_best/full_evaluation_best_config.csv",
    "smartV2CsvUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/full_evaluation_current_best/smart_selection_v2_comparison.csv",
    "overviewImageUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/15.jpg",
    "flowImagePage1Url": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/18.jpg",
    "flowImagePage2Url": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/presentation_images/19.jpg"
  }
} as const;
