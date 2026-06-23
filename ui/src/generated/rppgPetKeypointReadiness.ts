export const RPPG_PET_KEYPOINT_READINESS = {
  "generatedAt": "2026-05-26T14:24:15",
  "pythonVersion": "3.11.15",
  "providers": [
    {
      "provider": "MMPose AP-10K / AnimalPose",
      "installed": false,
      "runtime": "not installed",
      "role": "real animal keypoints",
      "note": "Preferred for AP-10K style dog/cat anatomical landmarks."
    },
    {
      "provider": "DeepLabCut SuperAnimal-Quadruped",
      "installed": true,
      "runtime": "current Python",
      "role": "quadruped keypoints",
      "note": "Installed in the separate keypoint runtime and tested with a real probe clip."
    },
    {
      "provider": "SLEAP",
      "installed": false,
      "runtime": "not installed",
      "role": "custom animal pose training/tracking",
      "note": "Best if we create our own annotation set."
    },
    {
      "provider": "Ultralytics YOLO segmentation",
      "installed": true,
      "runtime": "C:\\Users\\wagon\\AppData\\Local\\Programs\\Python\\Python314\\python.exe",
      "role": "animal foreground mask",
      "note": "Already used for dog/cat mask ROI extraction."
    }
  ],
  "normalized": {
    "rows": 5850,
    "videos": 1,
    "keypoints": [
      "back_base",
      "back_end",
      "back_left_knee",
      "back_left_paw",
      "back_left_thai",
      "back_middle",
      "back_right_knee",
      "back_right_paw",
      "back_right_thai",
      "belly_bottom",
      "body_middle_left",
      "body_middle_right",
      "front_left_knee",
      "front_left_paw",
      "front_left_thai",
      "front_right_knee",
      "front_right_paw",
      "front_right_thai",
      "left_antler_base",
      "left_antler_end",
      "left_earbase",
      "left_earend",
      "left_eye",
      "lower_jaw",
      "mouth_end_left",
      "mouth_end_right",
      "neck_base",
      "neck_end",
      "nose",
      "right_antler_base",
      "right_antler_end",
      "right_earbase",
      "right_earend",
      "right_eye",
      "tail_base",
      "tail_end",
      "throat_base",
      "throat_end",
      "upper_jaw"
    ],
    "medianConfidence": 0.463,
    "highConfidenceRows": 2702
  },
  "probe": {
    "status": "completed",
    "sourceVideo": "dataset_front\\4.mp4",
    "clipPath": "reports\\rppg_pet_keypoints\\dlc_probe_30s\\4_dlc_probe.mp4",
    "framesWritten": 150,
    "clipFps": 5.0,
    "clipSize": [
      512,
      614
    ]
  },
  "assets": {
    "reportUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/pet_keypoint_readiness_report.md",
    "schemaUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/pet_keypoint_input_schema.md",
    "exampleCsvUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/pet_keypoint_input_example.csv",
    "normalizedCsvUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/pet_keypoints_normalized.csv",
    "probeManifestUrl": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/dlc_probe_30s/dlc_probe_manifest.json",
    "probeH5Url": "/@fs/C:/Users/wagon/Downloads/vet-ppg-multi-cam-telemetry-hud/reports/rppg_pet_keypoints/dlc_probe_30s/4_dlc_probe_superanimal_quadruped_hrnet_w32_fasterrcnn_resnet50_fpn_v2.h5"
  },
  "nextStep": "Use DLC keypoints plus the YOLO animal mask to build anatomical ROI candidates, then reject mouth/paw/motion states before HR peak selection."
} as const;
