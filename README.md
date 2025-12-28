# 💿 MoodMeme 3D: Hyper-Vault v2.0

**MoodMeme 3D** is a high-performance, browser-based interactive 3D environment built for exploring digital memes. Transforming a traditional soundboard into a futuristic **Cyber-Archive**, it utilizes Three.js for WebGL rendering and a custom cursor-driven interaction model.

![Status](https://img.shields.io/badge/Status-MVP-cyan?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-Three.js_/_Vanilla_JS-pink?style=for-the-badge)

---

## 🚀 Key Features

*   **Global Carousel Orbit**: A revolving 3D vault that organizes memes in a horizontal carousel.
*   **Dual-Sided "Glass Sandwich" Frames**: Custom-engineered 3D frames that allow content to be readable from both sides without mirroring (Non-Mirrored Back-Planes).
*   **Dynamic Nonstop Particles**: A high-performance particle system using `BufferAttributes` to simulate 6,000+ drifting "Cyber Dust" particles with boundary-wrapping logic.
*   **Holographic Overlays**: Procedural scanline textures and neon corner brackets for a sci-fi "Specimen" aesthetic.
*   **Lateral Navigation**: Interactive side-hover strips for directional rotation, complementing standard **Orbit Controls**.
*   **Audio-Visual Pulse**: Integrated audio context triggering with synchronized emissive glow feedback.

---

## 🛠️ Tech Stack

*   **Three.js**: WebGL rendering engine.
*   **Vanilla JavaScript**: Zero-dependency architecture (ES Modules).
*   **CSS3**: Advanced glassmorphism and scanline animations.
*   **CDN Driven**: No `npm install` or bundlers required.

---

## 📂 Project Structure

MoodMeme-3D/<br>
├── index.html      # UI Overlay, Head, and Data Source <br>
├── style.css       # Cyberpunk Styling & UI Animations<br>
├── script.js      # Core 3D Engine & Interaction Logic<br>
└── assets/         # User Assets (Images & Audio)<br>
    ├── images/     # .jpg, .gif, .png<br>
    └── audio/      # .mp3, .wav<br>

---

## 🕹️ Controls
* Action ->	Control
* Rotate Vault  ->	Hover Mouse over LEFT or RIGHT side-strips
* Manual Orbit  ->	Left Click + Drag
* Zoom In/Out  ->	Mouse Scroll
* Trigger Meme  ->	Click on any 3D Frame

---

## 🔧 Customization (Adding your own Memes)

To add new memes, simply modify the meme-gallery div in index.html. The 3D engine automatically extracts data from these tags on boot.<br>
* Add Image: Place your image/GIF in assets/images/.
* Add Audio: Place your sound in assets/audio/.
* Update HTML:
 html <br>
<img src="assets/images/your-meme.gif" alt="MEME_NAME" data-sound="assets/audio/your-sound.mp3">

---

## ⚙️ Running Locally
Since this project uses ES Modules via CDN:<br>
* VS Code Live Server: Right-click index.html and select "Open with Live Server".
* Local Server: Use python -m http.server or any local dev server.
* Note: Direct file opening (file:///) may be blocked by browsers due to CORS policies regarding ES Modules and textures.

---

## 📝 Technical Notes
* Performance: The particle system uses a single Points mesh with a Float32Array for positions to minimize draw calls.
* Interaction: Raycasting is performed recursively to ensure clicks on child components (glass, frame, or image) correctly map to the parent data object.
* Lighting: A mix of AmbientLight and high-intensity PointLights are used to simulate neon reflection on the physical materials.

---

### Built with 💙
