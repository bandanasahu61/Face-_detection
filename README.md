# 🤖 FaceAI — Advanced Face Detection Web App

A real-time face detection web application built with **Python (Flask)**, **OpenCV**, **HTML**, **CSS**, and **JavaScript**. Detects faces, eyes, and smiles live from your webcam with a professional dark-themed UI.

---

## 📸 Features

- 🎥 **Live webcam feed** with real-time detection
- 👤 **Face detection** using OpenCV Haar Cascades
- 👁️ **Eye detection** per detected face
- 😊 **Smile detection** with visual tagging
- ⚡ **FPS counter** and processing time (ms) display
- 🖼️ **Processed frame** with bounding boxes shown live
- 📋 **Face details panel** — position, size, eyes, smile per face
- 📸 **Snapshot gallery** — capture and preview frames
- 🌙 **Professional dark UI** with animated scan line and grid background

---

## 🗂️ Project Structure

```
face_detection_app/
├── app.py                  # Flask backend + OpenCV detection
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Frontend HTML
└── static/
    ├── style.css           # Dark theme styles
    └── script.js           # Camera loop & UI logic
```

---

## ⚙️ Requirements

- Python 3.8+
- A webcam
- Modern browser (Chrome / Edge / Firefox)

---

## 🚀 Getting Started

### 1. Clone or Download the Project

```bash
git clone https://github.com/your-username/face_detection_app.git
cd face_detection_app
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Or manually:

```bash
pip install flask opencv-python numpy Pillow
```

### 3. Run the App

```bash
python app.py
```

### 4. Open in Browser

```
http://localhost:5000
```

---

## 🖥️ How It Works

```
Browser (Webcam)
     │
     │  Captures frame via canvas (JPEG base64)
     ▼
Flask /detect endpoint
     │
     │  Decodes image → OpenCV grayscale → equalizeHist
     │  detectMultiScale → Faces → Eyes → Smiles
     │  Draws bounding boxes → Encodes result image
     ▼
Browser
     │
     │  Displays processed frame + updates stats + face list
     ▼
requestAnimationFrame loop (continuous)
```

---

## 📡 API Endpoint

### `POST /detect`

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,<base64_string>"
}
```

**Response:**
```json
{
  "image": "data:image/jpeg;base64,<annotated_frame>",
  "count": 2,
  "ms": 34.5,
  "faces": [
    { "x": 120, "y": 80, "w": 150, "h": 150, "eyes": 2, "smiling": true },
    { "x": 340, "y": 90, "w": 140, "h": 140, "eyes": 2, "smiling": false }
  ]
}
```

---

## 🎨 UI Overview

| Panel | Description |
|---|---|
| Camera Feed | Live webcam with scan line animation |
| FPS Badge | Real-time frames-per-second counter |
| Stats Cards | Faces / Eyes / Smiling / Processing ms |
| Processed Frame | Server-annotated image with bounding boxes |
| Face Details | Per-face info: position, size, eyes, smile |
| Snapshot Gallery | Captured frames, click to open full size |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| Computer Vision | OpenCV (Haar Cascades) |
| Image Processing | NumPy, Pillow |
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Icons | Font Awesome 6 |
| Fonts | Google Fonts — Inter |

---

## 📦 Dependencies

```
flask
opencv-python
numpy
Pillow
```

---

## 🔧 Configuration

You can tune detection sensitivity in `app.py`:

```python
# Face detection
faces = face_cascade.detectMultiScale(
    gray,
    scaleFactor=1.1,      # Lower = more sensitive (try 1.05–1.3)
    minNeighbors=5,        # Higher = fewer false positives
    minSize=(40, 40)       # Minimum face size in pixels
)

# Smile detection
smiles = smile_cascade.detectMultiScale(
    roi_gray,
    scaleFactor=1.7,
    minNeighbors=22        # Increase to reduce false smiles
)
```

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---|---|
| Camera not working | Allow browser camera permissions |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Low FPS | Reduce JPEG quality in `script.js` (change `0.8` to `0.5`) |
| Too many false detections | Increase `minNeighbors` in `app.py` |
| Flask not found | Add Python Scripts folder to system PATH |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙌 Acknowledgements

- [OpenCV](https://opencv.org/) — Computer vision library
- [Flask](https://flask.palletsprojects.com/) — Python web framework
- [Font Awesome](https://fontawesome.com/) — Icons
- [Google Fonts](https://fonts.google.com/) — Inter typeface
