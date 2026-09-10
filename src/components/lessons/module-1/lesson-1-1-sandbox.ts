import type { SandpackFiles } from '@codesandbox/sandpack-react';

/**
 * Sandbox khởi điểm cho bài 1.1 — Scene, Camera, Renderer.
 *
 * Chạy trên template `vite` (môi trường Nodebox) chứ không phải `vanilla-ts`:
 * bundler `parcel` của template vanilla không build ổn định ESM của three 0.185
 * và thỉnh thoảng ném "Cannot read properties of undefined (reading 'from')".
 * Đổi lại, Nodebox chỉ chạy trên trình duyệt nhân Chromium.
 *
 * Template vite dùng entry /index.js (JS thuần) — không ghi đè /index.html vì
 * nó đã có sẵn <div id="app"> và <script type="module" src="/index.js">.
 */
export const LESSON_1_1_FILES: SandpackFiles = {
  '/styles.css': {
    code: `* { margin: 0; box-sizing: border-box; }

body {
  background: #0a0a0a;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

canvas { display: block; }`,
    hidden: true,
  },

  '/index.js': {
    code: `import * as THREE from 'three';
import './styles.css';

const container = document.getElementById('app');
const width = container.clientWidth;
const height = container.clientHeight;

// 1. Scene — container của cây scene graph
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// 2. PerspectiveCamera(fov, aspect, near, far)
//    THỬ PHÁ: đặt near = 0.0001 và far = 1_000_000 rồi xem depth buffer vỡ thế nào.
const camera = new THREE.PerspectiveCamera(
  75,             // FOV dọc, tính bằng độ
  width / height, // aspect ratio
  0.1,            // near plane
  1000            // far plane
);

// THỬ PHÁ: đổi thành 0 — camera chui vào trong khối hộp, hình biến mất.
camera.position.z = 3;
camera.lookAt(0, 0, 0);

// 3. WebGLRenderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
// Chặn ở 2: số pixel GPU phải tính tăng theo BÌNH PHƯƠNG của DPR.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 4. Mesh = Geometry + Material
const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const material = new THREE.MeshBasicMaterial({ color: 0x0c8ce9 });
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(0.4, 0.6, 0);
scene.add(cube);

// Viền wireframe cho dễ đọc khối — MeshBasicMaterial không nhận ánh sáng.
const wireframe = new THREE.LineSegments(
  new THREE.WireframeGeometry(geometry),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })
);
cube.add(wireframe);

// 5. Render đúng MỘT khung hình. Bài 1.4 mới thêm animation loop.
renderer.render(scene, camera);

console.log('[1.1] đã render 1 frame', {
  fov: camera.fov,
  aspect: Number(camera.aspect.toFixed(3)),
  near: camera.near,
  far: camera.far,
  drawCalls: renderer.info.render.calls,
});

// 6. Resize — phải gọi updateProjectionMatrix() sau khi đổi aspect,
//    nếu không frustum vẫn giữ giá trị cũ và hình bị méo.
window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.render(scene, camera);
});

// 7. Dọn dẹp VRAM. Trong SPA thật, chạy đoạn này khi unmount —
//    garbage collector của JS KHÔNG giải phóng được bộ nhớ GPU.
export function dispose() {
  geometry.dispose();
  material.dispose();
  renderer.dispose();
  container.removeChild(renderer.domElement);
}
`,
  },
};

export const LESSON_1_1_DEPENDENCIES = {
  three: '0.185.1',
};
