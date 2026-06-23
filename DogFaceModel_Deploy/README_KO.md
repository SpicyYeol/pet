# 강아지 얼굴 인식 모델 (YOLOv8) 사용 가이드

이 패키지는 옥스포드 강아지 데이터셋으로 정밀하게 학습된 **YOLOv8 기반 강아지 얼굴 검출 모델**과 실행 스크립트를 포함하고 있습니다.
성능: mAP50 99.4%, 정밀도 97.8% (매우 높은 정확성)

## 📁 포함된 파일
1. `best.pt`: 학습이 완료된 최적의 가중치 파일 (모델 코어)
2. `inference_demo.py`: 이미지 및 동영상을 테스트할 수 있는 파이썬 실행 스크립트
3. `README_KO.md`: 현재 읽고 계신 설명서

---

## 🛠 1. 사전 준비 (환경 설정)
모델을 실행하려면 **파이썬(Python 3.8 이상)**과 **Ultralytics YOLO 라이브러리**가 설치되어 있어야 합니다.

터미널이나 명령 프롬프트(CMD)를 열고 다음 명령어를 입력하세요.
```bash
pip install ultralytics opencv-python "numpy<2.0.0" # numpy 버전 충돌 방지권장
```

---

## 🚀 2. 실행 방법 (테스트)
압축을 푼 폴더 안에서 터미널을 열고, 테스트할 이미지나 동영상 파일 경로를 입력하여 실행합니다.

### 문법
```bash
python inference_demo.py "테스트할_미디어_경로"
```

### 📸 이미지 테스트 예시
```bash
python inference_demo.py "my_dog_photo.jpg"
```
* **결과 확인:** 실행이 완료되면 결과 이미지가 화면에 팝업으로 나타나며, 동일 폴더의 `runs/detect/predict/` 경로에도 저장됩니다.

### 🎥 동영상 테스트 예시
```bash
python inference_demo.py "my_dog_video.mp4"
```
* **결과 확인:** 동영상의 경우 처리 속도로 인해 화면 팝업 없이 즉시 변환되며, 완료 후 `runs/detect/predict/` 경로에 결과 영상이 저장됩니다.

---

## 💻 3. 내 파이썬 코드에 직접 적용하기
제공된 `inference_demo.py` 스크립트를 사용하지 않고, 직접 작성하시는 코드에 이 모델을 적용하고 싶다면 아래 샘플 코드를 복사해서 활용하세요.

```python
from ultralytics import YOLO

# 1. 방금 압축 해제한 가중치 파일(best.pt) 불러오기
model = YOLO('best.pt')

# 2. 이미지 또는 동영상에서 얼굴 찾기 (conf=0.5 는 정확도 50% 이상만 추출하라는 의미)
results = model('테스트이미지.jpg', conf=0.5)

# 3. 결과 확인 (바운딩 박스 그려진 결과 보기 및 저장)
for r in results:
    r.show()  # 화면에 띄우기 (이미지 전용)
    r.save('result.jpg')  # 저장하기
```
