import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(3, 2, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 4, 5);
scene.add(light);

// ---- Ba tấm kính xếp chồng theo trục z ----
const planeGeo = new THREE.PlaneGeometry(2.4, 2.4);
const colors = [0xff4d4d, 0x4dff88, 0x4d9fff];
const panes = [];

colors.forEach((color, i) => {
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, material);
  mesh.position.z = (i - 1) * 1.1;
  scene.add(mesh);
  panes.push(mesh);
});

// ---- alphaTest: giải pháp thay thế, KHÔNG dính lỗi thứ tự ----
// Texture hình chiếc lá với vùng trong suốt hoàn toàn.
function makeLeafTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = '#4caf50';
  ctx.beginPath();
  ctx.ellipse(128, 128, 60, 110, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(128, 20); ctx.lineTo(128, 236); ctx.stroke();
  return new THREE.CanvasTexture(c);
}

const leafTexture = makeLeafTexture();
leafTexture.colorSpace = THREE.SRGBColorSpace;

const leaves = [];
for (let i = 0; i < 3; i++) {
  const mesh = new THREE.Mesh(
    planeGeo,
    new THREE.MeshStandardMaterial({
      map: leafTexture,
      // alphaTest: pixel có alpha dưới ngưỡng bị VỨT BỎ hoàn toàn ở fragment
      // shader, nên vẫn ghi depth bình thường -> không có vấn đề thứ tự vẽ.
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    })
  );
  mesh.position.set(4, 0, (i - 1) * 1.1);
  mesh.visible = false;
  scene.add(mesh);
  leaves.push(mesh);
}

// ---- Bảng điều khiển ----
const state = {
  opacity: 0.5,
  depthWrite: true,
  epRenderOrder: false,
  hienLa: false,
  doubleSide: true,
};

const gui = new GUI({ title: 'Trong suốt' });

gui.add(state, 'opacity', 0, 1, 0.01)
  .onChange((v) => panes.forEach((p) => (p.material.opacity = v)));

gui.add(state, 'depthWrite').name('depthWrite')
  .onChange((v) => panes.forEach((p) => (p.material.depthWrite = v)));

gui.add(state, 'epRenderOrder').name('ép renderOrder thủ công')
  .onChange((v) => {
    panes.forEach((p, i) => {
      // Vẽ từ XA tới GẦN. renderOrder nhỏ hơn được vẽ trước.
      p.renderOrder = v ? -p.position.z : 0;
    });
  });

gui.add(state, 'doubleSide').name('side: DoubleSide')
  .onChange((v) => {
    panes.forEach((p) => {
      p.material.side = v ? THREE.DoubleSide : THREE.FrontSide;
      p.material.needsUpdate = true;
    });
  });

gui.add(state, 'hienLa').name('xem ví dụ alphaTest')
  .onChange((v) => {
    leaves.forEach((l) => (l.visible = v));
    camera.position.set(v ? 6.5 : 3, 2, 6);
  });

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  controls.update();

  hud.textContent =
    'kéo chuột xoay quanh — quan sát tấm phía sau lúc hiện lúc mất' +
    '   |   depthWrite: ' + state.depthWrite +
    '   |   renderOrder: ' + (state.epRenderOrder ? 'ép thủ công' : 'mặc định');

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  gui.destroy();
  controls.dispose();
  planeGeo.dispose();
  leafTexture.dispose();
  panes.forEach((p) => p.material.dispose());
  leaves.forEach((l) => l.material.dispose());
  renderer.dispose();
}
`;

export const LESSON_2_7: LessonContent = {
  id: '2-7',

  goal: 'Tái hiện được lỗi trong suốt kinh điển rồi tự sửa, và biết khi nào nên dùng `alphaTest` thay cho `transparent`.',

  lecture: [
    'Đây là một trong những vấn đề chặn người mới nhiều nhất, và điều khó chịu là nó **không báo lỗi**. Bạn đặt `transparent: true`, mọi thứ trông ổn ở một góc nhìn, rồi xoay camera và tự nhiên một tấm phía sau biến mất. Không có gì trong console cả.',

    'Gốc rễ nằm ở depth buffer. Khi vẽ một vật **đục**, GPU ghi độ sâu của nó lại; vật nào phía sau sẽ bị loại bỏ sớm — nhanh và đúng. Nhưng với vật **trong suốt**, thứ phía sau vẫn phải nhìn thấy được, nên phép trộn màu chỉ đúng nếu vẽ theo thứ tự **từ xa tới gần**. Three.js có sắp xếp giúp bạn, nhưng nó sắp theo khoảng cách từ camera tới **tâm** vật thể — cách xấp xỉ này sai ngay khi vật thể lồng vào nhau hoặc kéo dài theo chiều sâu.',

    'Có ba hướng xử lý. `depthWrite = false` ngăn vật trong suốt ghi depth, tránh việc chúng che nhau sai — nhưng đổi lại mất khả năng tự che của chính vật thể. `renderOrder` cho bạn ép thứ tự thủ công khi tự biết bố cục. Và `alphaTest` — hướng thứ ba, thường là hướng đúng nhất.',

    '`alphaTest` khác hẳn về bản chất: pixel có alpha dưới ngưỡng bị **vứt bỏ hoàn toàn**, không phải trộn. Vật thể vẫn được coi là đục nên ghi depth bình thường và không dính vấn đề thứ tự nào cả. Đây là lý do lá cây, hàng rào, lưới, tóc trong game gần như luôn dùng `alphaTest` chứ không dùng `transparent`. Hãy bật ví dụ chiếc lá trong sandbox và xoay quanh — không có tấm nào biến mất.',
  ],

  concepts: [
    {
      term: 'transparent + opacity',
      explain:
        'Bật chế độ trộn màu. Vật thể được chuyển sang lượt vẽ sau cùng và sắp xếp theo khoảng cách tới tâm — một phép xấp xỉ sai trong nhiều trường hợp.',
    },
    {
      term: 'depthWrite',
      explain:
        'Có ghi độ sâu của pixel vào depth buffer hay không. Tắt cho vật trong suốt để chúng không che lẫn nhau sai cách, nhưng khi đó vật thể cũng mất khả năng tự che phần sau của chính nó.',
    },
    {
      term: 'renderOrder',
      explain:
        'Ép thứ tự vẽ thủ công, số nhỏ vẽ trước. Dùng khi bạn biết trước bố cục và cách sắp xếp tự động không đúng.',
    },
    {
      term: 'alphaTest',
      explain:
        'Vứt bỏ hẳn pixel có alpha dưới ngưỡng. Vật thể vẫn được xử lý như đục — ghi depth bình thường, không có vấn đề thứ tự. Không làm được độ mờ trung gian.',
    },
    {
      term: 'side: DoubleSide',
      explain:
        'Tắt backface culling. Cần cho mặt phẳng mỏng nhìn được hai phía, nhưng làm tăng khoảng gấp đôi số fragment phải xử lý cho vật thể đó.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo ba tấm `PlaneGeometry` với `transparent: true`, `opacity: 0.5`, đặt lệch nhau theo trục z.',
      why: 'Ba tấm chồng lên nhau là bố cục tối thiểu để lộ ra lỗi thứ tự.',
    },
    {
      action: 'Kéo chuột xoay camera một vòng quanh cụm tấm.',
      why: 'Lỗi chỉ xuất hiện ở một số góc. Phải xoay mới thấy.',
    },
    {
      action: 'Tắt `depthWrite` và xoay lại.',
      why: 'Quan sát nó sửa được gì và làm hỏng gì. Không có giải pháp nào miễn phí ở đây.',
    },
    {
      action: 'Bật "ép renderOrder thủ công".',
      why: 'Đặt `renderOrder` theo vị trí z để buộc vẽ từ xa tới gần.',
    },
    {
      action: 'Bật "xem ví dụ alphaTest" và xoay quanh cụm lá.',
      why: 'So sánh trực tiếp: cụm lá không bao giờ biến mất, dù cũng xếp chồng y hệt.',
    },
    {
      action: 'Tắt `side: DoubleSide` và quan sát.',
      why: 'Để hiểu vì sao mặt phẳng mỏng gần như luôn cần cờ này, và cái giá phải trả.',
    },
  ],

  observations: [
    {
      change: 'Xoay camera quanh ba tấm kính với thiết lập mặc định.',
      observe: 'Ở một số góc, tấm phía sau biến mất hoàn toàn thay vì hiện mờ qua tấm trước.',
      why: 'Three.js sắp xếp vật trong suốt theo khoảng cách từ camera tới tâm mỗi vật. Khi ba tấm gần nhau, thứ tự này có thể lật ngược so với thứ tự thực tế theo chiều sâu. Tấm gần được vẽ trước, ghi depth, rồi tấm xa bị depth test loại bỏ — dù đáng lẽ phải nhìn thấy qua tấm trước.',
    },
    {
      change: 'Tắt `depthWrite`.',
      observe: 'Ba tấm giờ luôn hiện đủ, nhưng cảm giác về thứ tự trước sau trở nên mơ hồ.',
      why: 'Không ghi depth thì không tấm nào loại bỏ tấm nào, nên tất cả đều được vẽ. Nhưng thứ tự trộn màu vẫn theo thứ tự vẽ, và bạn đã mất tín hiệu chiều sâu mà depth buffer cung cấp. Với một vật thể trong suốt phức tạp, nó sẽ không tự che được phần sau của chính mình — kết quả là trông như bằng thuỷ tinh rỗng thay vì khối đặc.',
    },
    {
      change: 'Bật lại `depthWrite`, rồi bật "ép renderOrder thủ công".',
      observe: 'Ba tấm hiện đúng và giữ được cảm giác chiều sâu.',
      why: '`renderOrder` ghi đè cách sắp xếp tự động, buộc vẽ từ xa tới gần đúng như thuật toán trộn màu đòi hỏi. Cách này chỉ dùng được khi bạn biết trước bố cục — với vật thể chuyển động tự do thì phải tính lại `renderOrder` mỗi frame theo khoảng cách tới camera.',
    },
    {
      change: 'Bật ví dụ `alphaTest` và xoay quanh cụm lá.',
      observe: 'Không tấm lá nào biến mất ở bất kỳ góc nào.',
      why: 'Với `alphaTest`, pixel trong suốt bị vứt bỏ ngay ở fragment shader — chúng không tồn tại, không trộn màu, không ghi depth. Những pixel còn lại được xử lý y như vật đục: depth test hoạt động bình thường và thứ tự vẽ không còn quan trọng. Đây là lý do mọi cây cối trong game đều dùng cách này. Cái giá là không có độ mờ trung gian và rìa bị răng cưa cứng, thường được bù bằng khử răng cưa ở khâu hậu kỳ.',
    },
  ],

  interview: [
    {
      q: 'Vì sao vật thể trong suốt hay bị lỗi hiển thị?',
      a: 'Vì phép trộn màu alpha phụ thuộc thứ tự: muốn đúng thì phải vẽ từ xa tới gần, trong khi depth buffer vốn được thiết kế để loại bỏ vật bị che chứ không để trộn. Three.js sắp xếp vật trong suốt theo khoảng cách tới tâm vật thể, nhưng đó là xấp xỉ — nó sai khi vật thể lồng vào nhau, kéo dài theo chiều sâu, hoặc khi hai tâm gần bằng nhau. Kết quả là vật phía sau bị loại nhầm và biến mất.',
    },
    {
      q: 'Khi nào dùng `alphaTest` thay cho `transparent`?',
      a: 'Khi chỉ cần phân biệt "có" và "không" chứ không cần độ mờ trung gian — lá cây, hàng rào, lưới, tóc, đề can. `alphaTest` vứt bỏ hẳn pixel dưới ngưỡng nên vật thể vẫn được xử lý như đục: ghi depth bình thường, không có vấn đề thứ tự, và còn được hưởng lợi từ việc loại bỏ sớm. Chỉ dùng `transparent` khi thật sự cần độ mờ liên tục như kính, khói, nước.',
    },
    {
      q: '`depthWrite = false` sửa được gì và làm hỏng gì?',
      a: 'Nó ngăn các vật trong suốt loại bỏ lẫn nhau, nên tất cả đều được vẽ ra thay vì biến mất. Nhưng nó cũng làm vật thể mất khả năng tự che: một khối trong suốt sẽ hiện cả mặt sau lẫn mặt trước cùng lúc, trông rỗng thay vì đặc. Nó cũng không sửa được thứ tự trộn màu — chỉ tránh việc mất hẳn. Thường phải kết hợp với `renderOrder` hoặc thiết kế cảnh sao cho vật trong suốt không chồng lấn nhiều.',
    },
    {
      q: '`side: DoubleSide` tốn kém ra sao?',
      a: 'Nó tắt backface culling, nên GPU phải chạy fragment shader cho cả mặt sau của mỗi tam giác — với vật thể kín thì gần như gấp đôi khối lượng vẽ. Ngoài ra nó còn làm phức tạp việc sắp xếp vật trong suốt, vì mặt trước và mặt sau của cùng một vật cũng cần đúng thứ tự với nhau. Chỉ bật cho những mặt thật sự mỏng và nhìn được hai phía.',
    },
  ],

  checkpoints: [
    'Tái hiện được lỗi tấm phía sau biến mất, rồi tự sửa được.',
    'Biết khi nào dùng `alphaTest` thay cho `transparent`.',
    'Giải thích được `depthWrite = false` sửa gì và hỏng gì.',
    'Nói được cái giá của `side: DoubleSide`.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 500 }),
};
