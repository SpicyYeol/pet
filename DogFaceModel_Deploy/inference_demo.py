import sys
import os
import cv2
from ultralytics import YOLO

def main():
    if len(sys.argv) < 2:
        print("사용법: python inference_demo.py <테스트_미디어_경로>")
        print("예시: python inference_demo.py test.jpg")
        sys.exit(1)

    media_path = sys.argv[1]
    model_path = "best.pt"  # 모델 가중치 파일 (이 스크립트와 동일 폴더에 있어야 함)

    if not os.path.exists(model_path):
        print(f"오류: {model_path} 파일을 찾을 수 없습니다. 모델 파일이 현재 폴더에 있는지 확인해주세요.")
        sys.exit(1)
        
    if not os.path.exists(media_path):
        print(f"오류: {media_path} 파일을 찾을 수 없습니다.")
        sys.exit(1)

    print(f"[{media_path}] 처리를 시작합니다...")
    model = YOLO(model_path)
    
    # GPU 우선 사용 (stupid GPT가 CPU 강제하던 문제 수정)
    import torch
    dev = 0 if torch.cuda.is_available() else "cpu"
    print(f"[device] YOLO inference device: {dev} (cuda available: {torch.cuda.is_available()})")
    
    # 동영상인지 이미지인지 대략적으로 판단 (확장명 기반)
    ext = os.path.splitext(media_path)[1].lower()
    is_video = ext in ['.mp4', '.avi', '.mov', '.mkv']
    
    if is_video:
        print("비디오 파일로 인식되었습니다. 백그라운드에서 프레임을 분석하며, 완료 후 결과 영상이 저장됩니다.")
        results = model.predict(source=media_path, save=True, conf=0.5, show=False, device=dev)
    else:
        print("이미지 파일로 인식되었습니다. 처리 후 결과가 팝업 창에 표시됩니다.")
        results = model.predict(source=media_path, save=True, conf=0.5, show=True, device=dev)
        # ultralytics의 .show()는 창을 띄우지만 자동으로 닫히지 않을 수 있어, OpenCV를 명시적으로 호출하는 방법도 있습니다.
        # 사용자가 아무 키나 누르기 전까지 창을 유지
        cv2.waitKey(0)  
        cv2.destroyAllWindows()

    print(f"\n처리가 완료되었습니다. (결과는 'runs/detect/predict' 폴더 등에 보존됩니다.)")

if __name__ == "__main__":
    main()
