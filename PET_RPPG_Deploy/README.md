# PET rPPG Deploy Package (Single Zip)

This is a minimal, cleaned, deployment-ready package.

## Contents
- run.py : Launcher
- demo_rejection_anatomical_video4.py : Main pipeline script
- dual_respiratory_proxies.py : Core logic for dual output
  - Thoracic Breathing Rate (Chest motion) = Main 호흡수
  - Panting Rate + Intensity (Facial) = Artifact / Panting indicator
- Supporting modules: adaptive_roi_selector.py, rppg_rejection.py, evaluate_rppg_methods.py, etc.
- DogFaceModel_Deploy/ (YOLO model placeholder - add best.pt if you need to re-generate keypoints)
- Deployment guides (Korean + English)

## Quick Start

1. Unzip PET_RPPG_Deploy.zip

2. pip install -r requirements.txt

3. Prepare data:
   Create a folder with your processed video + keypoints, e.g.:
   mydata/
     dlc_probe_dog123/
       dog123_dlc_probe.mp4
       pet_keypoints_normalized.csv

4. Run:
   python run.py --video-stem dog123 --dog_aware

The script will look for data relative to current dir or standard reports structure. Adjust paths in the script if needed for your layout.

## Output
At the end you will see:
  Thoracic Breathing Rate (Main 호흡수) : xx.x bpm
  Panting Rate (Artifact/Panting 지표)  : xx.x bpm

## Notes for Full Use
- If you have not generated keypoints yet, you need DLC SuperAnimal + YOLO.
- Place best.pt in DogFaceModel_Deploy/ if using detection.
- For best results on dogs with strong panting, use --dog_aware.

This package is the result of cleaning the research project (removed experiments, duplicate PPT generators, caches, old reports).

See the included .md guides for detailed usage and background.
