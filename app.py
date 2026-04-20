from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
from PIL import Image
import io
import time

app = Flask(__name__)

# Load Haar cascades
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')

def decode_image(data_url):
    header, encoded = data_url.split(',', 1)
    img_bytes = base64.b64decode(encoded)
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def encode_image(img):
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return 'data:image/jpeg;base64,' + base64.b64encode(buffer).decode()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect', methods=['POST'])
def detect():
    start = time.time()
    data = request.get_json()
    frame = decode_image(data['image'])
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))

    face_data = []
    for (x, y, w, h) in faces:
        # Draw face box
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 120), 2)
        cv2.rectangle(frame, (x, y-28), (x+w, y), (0, 255, 120), -1)
        cv2.putText(frame, 'FACE', (x+6, y-8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

        roi_gray = gray[y:y+h, x:x+w]
        roi_color = frame[y:y+h, x:x+w]

        # Detect eyes
        eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=10, minSize=(15, 15))
        for (ex, ey, ew, eh) in eyes:
            cv2.rectangle(roi_color, (ex, ey), (ex+ew, ey+eh), (255, 100, 0), 1)

        # Detect smile
        smiles = smile_cascade.detectMultiScale(roi_gray, scaleFactor=1.7, minNeighbors=22, minSize=(25, 25))
        smiling = len(smiles) > 0
        if smiling:
            for (sx, sy, sw, sh) in smiles:
                cv2.rectangle(roi_color, (sx, sy), (sx+sw, sy+sh), (0, 100, 255), 1)

        face_data.append({
            'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h),
            'eyes': len(eyes), 'smiling': smiling
        })

    # Overlay stats
    elapsed = (time.time() - start) * 1000
    cv2.putText(frame, f'Faces: {len(faces)}  |  {elapsed:.0f}ms',
                (10, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 120), 2)

    return jsonify({
        'image': encode_image(frame),
        'faces': face_data,
        'count': len(faces),
        'ms': round(elapsed, 1)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
