import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * MOODMEME 3D: FINAL MASTER BUILD
 * Features: 
 * - Global Carousel Vault (Horizontal Rotation)
 * - Dual-Sided Glass Frames (Readable from both sides)
 * - Randomly Floating Nonstop Particles (Dynamic Dust)
 * - Lateral Navigation Controls (Side Hover Rotation)
 */

// --- 1. GLOBAL STATE ---
const state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    vaultGroup: null,    // Container for all meme cards
    dustParticles: null, // Dynamic background particles
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    cardGroups: [],      
    intersected: null,   
    activeAudio: null,   
    clock: new THREE.Clock(),

    // Navigation & Rotation
    baseRotationSpeed: 0.003, 
    navRotationSpeed: 0.025,  
    currentRotationDir: 1,    
    isNavigating: false,
    isInitialized: false
};

// --- 2. INITIALIZATION ---
function init() {
    // Basic Setup
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x020205);
    state.scene.fog = new THREE.FogExp2(0x020205, 0.03);

    state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    // ZOOMED OUT START: Broad perspective
    state.camera.position.set(0, 10, 32); 

    state.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(state.renderer.domElement);

    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.05;

    state.vaultGroup = new THREE.Group();
    state.scene.add(state.vaultGroup);

    setupLights();
    createEnvironment();
    buildMemeArchive(); 
    bindEvents();
    setupSideControls();
    
    animate();
}

// --- 3. LIGHTING & WORLD ---
function setupLights() {
    state.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const p1 = new THREE.PointLight(0x00f3ff, 5, 80);
    p1.position.set(20, 20, 20);
    state.scene.add(p1);
    
    const p2 = new THREE.PointLight(0xff00ff, 5, 80);
    p2.position.set(-20, 20, 20);
    state.scene.add(p2);
}

function createEnvironment() {
    // DYNAMIC FLOATING PARTICLES (NONSTOP)
    const count = 6000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 100;
        velocities[i] = (Math.random() - 0.5) * 0.03; 
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ 
        color: 0x00f3ff, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
    });

    state.dustParticles = new THREE.Points(geo, mat);
    state.dustParticles.userData.velocities = velocities;
    state.scene.add(state.dustParticles);

    // Grid Floor
    const grid = new THREE.GridHelper(150, 50, 0xff00ff, 0x111122);
    grid.position.y = -8;
    state.scene.add(grid);
}

// --- 4. HYPER-FRAME (DUAL SIDED GLASS) ---
function buildMemeArchive() {
    const loader = new THREE.TextureLoader();
    const htmlMemes = document.querySelectorAll('.meme-gallery img');
    const radius = 15; 

    // Procedural Scanline Texture
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(64, 32); ctx.stroke();
    const scanTex = new THREE.CanvasTexture(canvas);
    scanTex.wrapS = scanTex.wrapT = THREE.RepeatWrapping;
    scanTex.repeat.set(1, 15);

    htmlMemes.forEach((img, i) => {
        const angle = (i / htmlMemes.length) * Math.PI * 2;
        const cardGroup = new THREE.Group();
        const texture = loader.load(img.src);

        // Core Glass Sandwich
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 0.05),
            new THREE.MeshPhysicalMaterial({ color: 0x00f3ff, transmission: 0.9, transparent: true, opacity: 0.1 })
        );
        cardGroup.add(glass);

        // FRONT & BACK Materials (Readable from both sides)
        const frontMat = new THREE.MeshStandardMaterial({ map: texture, transparent: true, emissive: 0x00f3ff, emissiveIntensity: 0 });
        const backMat = new THREE.MeshStandardMaterial({ map: texture, transparent: true, emissive: 0x00f3ff, emissiveIntensity: 0 });

        const frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8), frontMat);
        frontMesh.position.z = 0.03;
        cardGroup.add(frontMesh);

        const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8), backMat);
        backMesh.position.z = -0.03;
        backMesh.rotation.y = Math.PI; // Flip manually so text is not mirrored
        cardGroup.add(backMesh);

        // Holographic Overlays
        const holoGeo = new THREE.PlaneGeometry(3.8, 3.8);
        const holoMat = new THREE.MeshBasicMaterial({ map: scanTex, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });
        
        const holoF = new THREE.Mesh(holoGeo, holoMat); holoF.position.z = 0.07; cardGroup.add(holoF);
        const holoB = new THREE.Mesh(holoGeo, holoMat); holoB.position.z = -0.07; holoB.rotation.y = Math.PI; cardGroup.add(holoB);

        // Corner Brackets
        cardGroup.add(createBrackets(4.2, 4.2));

        // Placement
        cardGroup.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);
        cardGroup.lookAt(0, 1, 0); // Face inward to center

        cardGroup.userData = {
            name: img.alt || `ARCHIVE_${i}`,
            audio: img.getAttribute('data-sound'),
            baseY: cardGroup.position.y,
            offset: i,
            holoF, holoB, frontMat, backMat
        };

        state.cardGroups.push(cardGroup);
        state.vaultGroup.add(cardGroup);
    });
}

function createBrackets(w, h) {
    const group = new THREE.Group();
    const size = 0.6;
    const mat = new THREE.LineBasicMaterial({ color: 0x00f3ff });
    const corners = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    corners.forEach(c => {
        const p = [];
        p.push(new THREE.Vector3(c[0] * (w/2 - size), c[1] * (h/2), 0));
        p.push(new THREE.Vector3(c[0] * (w/2), c[1] * (h/2), 0));
        p.push(new THREE.Vector3(c[0] * (w/2), c[1] * (h/2 - size), 0));
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), mat));
    });
    return group;
}

// --- 5. UI & EVENTS ---
function setupSideControls() {
    const l = document.getElementById('nav-left');
    const r = document.getElementById('nav-right');
    l.addEventListener('mouseenter', () => { state.isNavigating = true; state.currentRotationDir = 1; });
    l.addEventListener('mouseleave', () => { state.isNavigating = false; });
    r.addEventListener('mouseenter', () => { state.isNavigating = true; state.currentRotationDir = -1; });
    r.addEventListener('mouseleave', () => { state.isNavigating = false; });
}

function bindEvents() {
    window.addEventListener('mousemove', (e) => {
        state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
        if (state.intersected) {
            const data = state.intersected.userData;
            if (state.activeAudio) state.activeAudio.pause();
            state.activeAudio = new Audio(data.audio);
            state.activeAudio.play();
            
            data.frontMat.emissiveIntensity = 3;
            data.backMat.emissiveIntensity = 3;
            setTimeout(() => {
                data.frontMat.emissiveIntensity = 0;
                data.backMat.emissiveIntensity = 0;
            }, 500);
        }
    });

    document.getElementById('enter-btn').addEventListener('click', () => {
        document.getElementById('start-screen').style.display = 'none';
        state.isInitialized = true;
    });

    window.addEventListener('resize', () => {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 6. RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);
    const time = state.clock.getElapsedTime();

    // 1. Vault Rotation
    const speed = state.isNavigating ? state.navRotationSpeed : state.baseRotationSpeed;
    state.vaultGroup.rotation.y += speed * state.currentRotationDir;

    // 2. Card Animation (Float + Holo + Glow)
    state.cardGroups.forEach((group, i) => {
        const d = group.userData;
        group.position.y = d.baseY + Math.sin(time + d.offset) * 0.4;
        d.holoF.material.map.offset.y = time * 0.15;
        d.holoB.material.map.offset.y = time * 0.15;

        const isHovered = (state.intersected === group);
        const targetScale = isHovered ? 1.25 : 1.0;
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        if (isHovered) {
            const p = 0.3 + Math.sin(time * 8) * 0.3;
            d.frontMat.emissiveIntensity = p; d.backMat.emissiveIntensity = p;
        } else {
            d.frontMat.emissiveIntensity = THREE.MathUtils.lerp(d.frontMat.emissiveIntensity, 0, 0.1);
            d.backMat.emissiveIntensity = THREE.MathUtils.lerp(d.backMat.emissiveIntensity, 0, 0.1);
        }
    });

    // 3. Dynamic Dust Particles (Nonstop Motion)
    if (state.dustParticles) {
        const pos = state.dustParticles.geometry.attributes.position.array;
        const vel = state.dustParticles.userData.velocities;
        for (let i = 0; i < pos.length; i++) {
            pos[i] += vel[i];
            if (Math.abs(pos[i]) > 60) vel[i] *= -1; // Boundary bounce
        }
        state.dustParticles.geometry.attributes.position.needsUpdate = true;
        state.dustParticles.rotation.y += 0.001;
    }

    // 4. Raycasting
    state.raycaster.setFromCamera(state.mouse, state.camera);
    const intersects = state.raycaster.intersectObjects(state.cardGroups, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !state.cardGroups.includes(obj)) obj = obj.parent;
        if (state.intersected !== obj) {
            state.intersected = obj;
            document.getElementById('active-meme-name').innerText = obj.userData.name;
        }
    } else {
        state.intersected = null;
        if (state.isInitialized) document.getElementById('active-meme-name').innerText = "SCANNING_VAULT";
    }

    state.controls.update();
    state.renderer.render(state.scene, state.camera);
}

init();