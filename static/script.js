const video = document.getElementById('video');
const captureCanvas = document.getElementById('captureCanvas');
const ctx = captureCanvas.getContext('2d');
const noCam = document.getElementById('no-cam');

let stream = null;
let detecting = false;
let frameCount = 0;
let lastFpsTime = performance.now();
let animId = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
    video.srcObject = stream;
    await video.play();
    noCam.classList.add('hidden');
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('snapBtn').disabled = false;
    detecting = true;
    detectLoop();
  } catch (e) {
    alert('Camera access denied or unavailable.');
  }
}

function stopCamera() {
  detecting = false;
  if (animId) cancelAnimationFrame(animId);
  if (stream) stream.getTracks().forEach(t => t.stop());
  video.srcObject = null;
  noCam.classList.remove('hidden');
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('snapBtn').disabled = true;
  resetStats();
}

async function detectLoop() {
  if (!detecting) return;

  if (video.readyState === 4) {
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.8);

    try {
      const res = await fetch('/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      const data = await res.json();
      updateUI(data);
      updateFPS();
    } catch (_) {}
  }

  animId = requestAnimationFrame(detectLoop);
}

function updateUI(data) {
  // Processed image
  const img = document.getElementById('processedImg');
  const placeholder = document.getElementById('processed-placeholder');
  img.src = data.image;
  img.classList.remove('hidden');
  placeholder.style.display = 'none';

  // Stats
  document.getElementById('face-count').textContent = data.count;
  document.getElementById('ms-count').textContent = data.ms;

  const totalEyes = data.faces.reduce((s, f) => s + f.eyes, 0);
  const totalSmiles = data.faces.filter(f => f.smiling).length;
  document.getElementById('eye-count').textContent = totalEyes;
  document.getElementById('smile-count').textContent = totalSmiles;

  // Face list
  const list = document.getElementById('face-list');
  if (data.faces.length === 0) {
    list.innerHTML = '<p class="empty-msg">No faces detected yet.</p>';
    return;
  }
  list.innerHTML = data.faces.map((f, i) => `
    <div class="face-item">
      <div class="face-num">${i + 1}</div>
      <div class="face-meta">
        <span><i class="fa-solid fa-expand"></i> ${f.w}×${f.h}px</span>
        <span><i class="fa-solid fa-eye"></i> ${f.eyes} eyes</span>
        <span><i class="fa-solid fa-location-dot"></i> (${f.x}, ${f.y})</span>
      </div>
      ${f.smiling ? '<span class="smile-tag">😊 Smiling</span>' : ''}
    </div>
  `).join('');
}

function updateFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    document.getElementById('fps-badge').textContent = frameCount + ' FPS';
    frameCount = 0;
    lastFpsTime = now;
  }
}

function takeSnapshot() {
  if (!video.srcObject) return;
  captureCanvas.width = video.videoWidth;
  captureCanvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  const url = captureCanvas.toDataURL('image/jpeg', 0.9);
  const gallery = document.getElementById('gallery');
  const img = document.createElement('img');
  img.src = url;
  img.title = new Date().toLocaleTimeString();
  img.onclick = () => window.open(url, '_blank');
  gallery.prepend(img);
}

function resetStats() {
  ['face-count','eye-count','smile-count','ms-count'].forEach(id => {
    document.getElementById(id).textContent = '0';
  });
  document.getElementById('fps-badge').textContent = '-- FPS';
  document.getElementById('face-list').innerHTML = '<p class="empty-msg">No faces detected yet.</p>';
  document.getElementById('processedImg').classList.add('hidden');
  document.getElementById('processed-placeholder').style.display = '';
}
