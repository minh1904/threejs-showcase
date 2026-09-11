import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(6, 5, 9);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// NƠI THỨ NHẤT phải bật bóng
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.2;
floor.receiveShadow = true; // sàn NHẬN bóng
scene.add(floor);

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.9, 0.3, 160, 32),
  new THREE.MeshStandardMaterial({ color: 0x0c8ce9, roughness: 0.35, metalness: 0.1 })
);
knot.castShadow = true;    // NƠI THỨ BA: vật thể ĐỔ bóng
knot.receiveShadow = true;
scene.add(knot);

const light = new THREE.DirectionalLight(0xffffff, 2.6);
light.position.set(5, 7, 4);
light.castShadow = true;   // NƠI THỨ HAI: đèn phải được phép tạo bóng

// Shadow camera là một camera trực giao render scene TỪ GÓC NHÌN CỦA ĐÈN.
// Vật thể nằm ngoài khối này sẽ không có bóng.
light.shadow.camera.left = -6;
light.shadow.camera.right = 6;
light.shadow.camera.top = 6;
light.shadow.camera.bottom = -6;
light.shadow.camera.near = 1;
light.shadow.camera.far = 20;
light.shadow.mapSize.set(1024, 1024);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// CameraHelper cho ta NHÌN THẤY vùng phủ của shadow camera
const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
shadowHelper.visible = false;
scene.add(shadowHelper);

// ---- Bóng giả: một mặt phẳng với texture tròn mờ đặt dưới chân ----
// Kỹ thuật thực chiến trên mobile: rẻ hơn bóng thật hàng chục lần.
function makeBlobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.75)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const fakeShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshBasicMaterial({ map: makeBlobTexture(), transparent: true, depthWrite: false })
);
fakeShadow.rotation.x = -Math.PI / 2;
fakeShadow.position.y = -1.19;
fakeShadow.visible = false;
scene.add(fakeShadow);

// ---- Bảng điều khiển ----
const state = {
  batBongOrenderer: true,
  denCastShadow: true,
  vatTheCastShadow: true,
  sanReceiveShadow: true,
  mapSize: 1024,
  loaiBong: 'PCFSoft',
  hienShadowCamera: false,
  dungBongGia: false,
  dayVatTheRaXa: false,
};

const gui = new GUI({ title: 'Bóng đổ' });

gui.add(state, 'batBongOrenderer').name('1. renderer.shadowMap')
  .onChange((v) => { renderer.shadowMap.enabled = v; refresh(); });
gui.add(state, 'denCastShadow').name('2. light.castShadow')
  .onChange((v) => { light.castShadow = v; });
gui.add(state, 'vatTheCastShadow').name('3. mesh.castShadow')
  .onChange((v) => { knot.castShadow = v; });
gui.add(state, 'sanReceiveShadow').name('3b. sàn receiveShadow')
  .onChange((v) => { floor.receiveShadow = v; });

gui.add(state, 'mapSize', [256, 512, 1024, 2048, 4096]).name('shadow.mapSize')
  .onChange((v) => { light.shadow.mapSize.set(v, v); light.shadow.map?.dispose(); light.shadow.map = null; });

gui.add(state, 'loaiBong', ['Basic', 'PCF', 'PCFSoft']).name('loại shadow map')
  .onChange((v) => {
    renderer.shadowMap.type = { Basic: THREE.BasicShadowMap, PCF: THREE.PCFShadowMap, PCFSoft: THREE.PCFSoftShadowMap }[v];
    refresh();
  });

gui.add(state, 'hienShadowCamera').name('hiện vùng shadow camera')
  .onChange((v) => (shadowHelper.visible = v));
gui.add(state, 'dungBongGia').name('dùng bóng giả')
  .onChange((v) => {
    fakeShadow.visible = v;
    renderer.shadowMap.enabled = !v && state.batBongOrenderer;
    refresh();
  });
gui.add(state, 'dayVatTheRaXa').name('đẩy vật ra ngoài vùng phủ')
  .onChange((v) => (knot.position.x = v ? 9 : 0));

// Đổi cấu hình shadowMap thì phải buộc material biên dịch lại shader
function refresh() {
  scene.traverse((o) => { if (o.isMesh) o.material.needsUpdate = true; });
}

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

const clock = new THREE.Clock();
let frameId, frames = 0, acc = 0, fps = 0;

function tick() {
  frameId = requestAnimationFrame(tick);
  const delta = clock.getDelta();

  knot.rotation.y += 0.35 * delta;
  fakeShadow.position.x = knot.position.x;

  frames++; acc += delta;
  if (acc >= 0.5) { fps = Math.round(frames / acc); frames = 0; acc = 0; }

  const px = state.mapSize * state.mapSize;
  hud.textContent =
    'shadow map: ' + state.mapSize + '² = ' + (px / 1e6).toFixed(2) + 'M pixel' +
    '   |   FPS ≈ ' + fps;

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  gui.destroy();
  renderer.dispose();
}
`;

export const LESSON_2_3: LessonContent = {
  id: '2-3',

  goal: 'Bật được bóng đổ đúng cách, chỉnh vùng phủ shadow camera, và giải thích được vì sao trên di động người ta hay dùng bóng giả — kèm số liệu FPS của chính bạn.',

  lecture: [
    'Bóng đổ là thứ nâng scene từ "mấy khối hình lơ lửng" thành "vật thể đặt trong không gian". Nó cũng là tính năng đắt nhất trong Module này, và là nơi người mới mất nhiều thời gian nhất vì một lý do rất đơn giản: **phải bật ở ba nơi khác nhau**, thiếu một chỗ là không có bóng, mà console không báo lỗi gì cả.',

    'Ba nơi đó là: `renderer.shadowMap.enabled = true`, `light.castShadow = true`, và trên từng mesh `castShadow` cho vật đổ bóng cùng `receiveShadow` cho bề mặt hứng bóng. Sandbox có sẵn bốn checkbox tương ứng — hãy tắt từng cái một để thấy mỗi cái vắng mặt thì hỏng theo kiểu gì.',

    'Hiểu cơ chế sẽ giúp bạn gỡ lỗi nhanh hơn nhiều. Shadow map hoạt động thế này: trước khi vẽ cảnh chính, engine render toàn bộ scene **một lần nữa từ vị trí của đèn**, nhưng chỉ lưu độ sâu. Khi vẽ cảnh thật, mỗi pixel được so: khoảng cách từ nó tới đèn có lớn hơn giá trị đã lưu không? Lớn hơn nghĩa là có vật khác che phía trước — pixel đó nằm trong bóng.',

    'Từ cơ chế đó suy ra hai hệ quả thực tế. Thứ nhất, đèn cần một camera riêng, và **vật thể nằm ngoài vùng phủ của camera đó sẽ không có bóng** — đây là nguyên nhân số một của lỗi "bóng biến mất". Thứ hai, chất lượng bóng phụ thuộc độ phân giải của tấm depth map, và một tấm 4096×4096 tốn gần 17 triệu pixel mỗi frame.',

    'Chính vì đắt như vậy mà trong dự án di động thật, người ta thường tắt bóng thật và thay bằng **bóng giả**: một mặt phẳng nhỏ với vệt tròn mờ đặt dưới chân vật thể. Sandbox có checkbox để bạn so sánh FPS hai bên. Đừng bỏ qua thí nghiệm này — nó là một trong những đánh đổi thực chiến rõ ràng nhất của nghề.',
  ],

  concepts: [
    {
      term: 'Ba nơi bật bóng',
      explain:
        '`renderer.shadowMap.enabled`, `light.castShadow`, và `mesh.castShadow` / `mesh.receiveShadow`. Thiếu bất kỳ chỗ nào là không có bóng, và không có thông báo lỗi nào cả.',
    },
    {
      term: 'Shadow map',
      explain:
        'Một tấm texture lưu độ sâu, thu được bằng cách render scene từ góc nhìn của đèn. Khi vẽ cảnh chính, mỗi pixel so độ sâu của mình với giá trị trong tấm này để biết có bị che hay không.',
    },
    {
      term: 'light.shadow.camera',
      explain:
        'Camera dùng để render tấm shadow map. Với `DirectionalLight` nó là camera trực giao — phải chỉnh `left/right/top/bottom` bao trọn vùng cần đổ bóng. Dùng `CameraHelper` để nhìn thấy khối này.',
    },
    {
      term: 'shadow.mapSize',
      explain:
        'Độ phân giải tấm depth map. Càng lớn bóng càng nét nhưng chi phí tăng theo bình phương: 2048 tốn gấp bốn lần 1024.',
    },
    {
      term: 'PCF / PCFSoft',
      explain:
        'Kỹ thuật lấy mẫu nhiều điểm quanh mỗi pixel rồi lấy trung bình để làm mềm rìa bóng. `BasicShadowMap` không lọc gì nên rìa răng cưa; `PCFSoftShadowMap` mềm nhất và đắt nhất.',
    },
  ],

  walkthrough: [
    {
      action: 'Bật `renderer.shadowMap.enabled`, `light.castShadow`, và `castShadow`/`receiveShadow` trên mesh.',
      why: 'Làm đủ cả ba trước, để có bóng đúng làm mốc so sánh.',
    },
    {
      action: 'Tắt lần lượt từng checkbox trong ba nơi đó và quan sát.',
      why: 'Mỗi cái vắng mặt cho một triệu chứng khác nhau. Nhận diện được triệu chứng là gỡ lỗi được trong mười giây thay vì nửa tiếng.',
    },
    {
      action: 'Bật `CameraHelper` để nhìn thấy khối phủ của shadow camera.',
      why: 'Khối này vô hình theo mặc định, và nó là thủ phạm của hầu hết lỗi bóng biến mất.',
    },
    {
      action: 'Bật "đẩy vật ra ngoài vùng phủ", quan sát bóng mất, rồi nới `shadow.camera` bao trọn lại.',
      why: 'Đây là quy trình gỡ lỗi bạn sẽ lặp lại nhiều lần trong dự án thật.',
    },
    {
      action: 'Đổi `shadow.mapSize` giữa 256, 1024 và 4096, so sánh độ nét và FPS.',
      why: 'Nhìn con số triệu pixel ở thanh HUD để hiểu chi phí tăng theo bình phương chứ không tuyến tính.',
    },
    {
      action: 'So sánh `BasicShadowMap`, `PCFShadowMap` và `PCFSoftShadowMap`.',
      why: 'Basic cho thấy rõ bản chất răng cưa của kỹ thuật này; các bộ lọc chỉ đang che giấu nó đi.',
    },
    {
      action: 'Bật "dùng bóng giả" và ghi lại FPS so với bóng thật.',
      why: 'Đây là đánh đổi bạn sẽ phải giải thích cho quản lý hoặc người phỏng vấn.',
    },
  ],

  observations: [
    {
      change: 'Tắt riêng `mesh.receiveShadow` của sàn, giữ nguyên hai nơi còn lại.',
      observe: 'Vật thể vẫn tự đổ bóng lên chính nó, nhưng sàn hoàn toàn sạch.',
      why: '`castShadow` và `receiveShadow` là hai cờ độc lập. Vật thể đổ bóng ra thì cần cờ thứ nhất; bề mặt muốn hứng bóng thì cần cờ thứ hai. Vì mỗi cờ tốn chi phí nên Three.js bắt bạn chỉ định rõ, thay vì bật tất cho tiện.',
    },
    {
      change: 'Bật "đẩy vật ra ngoài vùng phủ" đồng thời bật `CameraHelper`.',
      observe: 'Vật thể đi ra khỏi khối khung dây và bóng biến mất hoàn toàn.',
      why: 'Shadow map chỉ chứa những gì lọt vào frustum của shadow camera. Ra ngoài khối đó là không có dữ liệu độ sâu, và engine coi như không bị che. Đây là nguyên nhân số một của lỗi "bóng biến mất khi vật đi xa". Cách xử lý là nới khối vừa đủ ôm vùng cần bóng — nới thừa thì cùng số pixel phải trải trên diện tích lớn hơn, bóng sẽ vỡ hạt.',
    },
    {
      change: 'Đặt `shadow.mapSize` xuống `256`.',
      observe: 'Rìa bóng vỡ thành bậc thang răng cưa rất thô.',
      why: 'Tấm depth map chỉ có 256×256 điểm để mô tả toàn bộ vùng phủ. Mỗi texel phải đại diện cho một mảng lớn trong không gian thật, nên ranh giới sáng–tối bị lượng tử hoá. Tăng `mapSize` hoặc thu hẹp vùng phủ đều làm bóng nét hơn — và thu hẹp vùng phủ thì miễn phí.',
    },
    {
      change: 'Bật "dùng bóng giả" rồi so sánh FPS với lúc bóng thật bật ở `mapSize` 2048.',
      observe: 'FPS tăng rõ rệt, mà trong scene đơn giản này khác biệt thị giác không lớn.',
      why: 'Bóng thật buộc engine render toàn bộ scene thêm một lượt cho mỗi đèn có `castShadow`. Bóng giả chỉ là một mặt phẳng với một texture trong suốt — gần như miễn phí. Với vật thể đứng trên mặt phẳng và camera không nhìn từ góc thấp, đây là đánh đổi rất hời, và là lựa chọn mặc định của phần lớn dự án thương mại chạy trên di động.',
    },
  ],

  interview: [
    {
      q: 'Bóng đổ trong Three.js hoạt động thế nào?',
      a: 'Bằng kỹ thuật shadow mapping. Trước khi vẽ cảnh chính, engine render scene một lần từ vị trí đèn và chỉ lưu độ sâu vào một texture. Khi vẽ cảnh thật, mỗi pixel được chuyển sang không gian của đèn rồi so độ sâu của nó với giá trị trong texture: nếu xa hơn thì có vật khác che phía trước, tức là nằm trong bóng. Điều đó cũng có nghĩa mỗi đèn đổ bóng là một lượt render toàn cảnh phụ trội.',
    },
    {
      q: 'Vì sao bóng bị mất khi vật thể đi ra xa?',
      a: 'Vì nó ra ngoài frustum của shadow camera. Camera này có vùng phủ hữu hạn được định bởi `light.shadow.camera` — với `DirectionalLight` là các mặt `left/right/top/bottom/near/far`. Vật ngoài vùng đó không được ghi vào depth map nên không tạo bóng. Cách chẩn đoán là gắn `CameraHelper(light.shadow.camera)` để nhìn thấy khối phủ, rồi nới vừa đủ — nới quá tay sẽ làm bóng vỡ hạt vì cùng số texel phải trải rộng hơn.',
    },
    {
      q: 'Vì sao trên di động người ta hay dùng bóng giả?',
      a: 'Vì bóng thật đòi hỏi một lượt render toàn cảnh cho mỗi đèn, cộng thêm bộ nhớ cho depth map và chi phí lọc PCF khi lấy mẫu. Trên GPU di động vốn giới hạn băng thông, đó thường là khoản chi lớn nhất trong khung hình. Bóng giả — một mặt phẳng với vệt tròn mờ dưới chân vật thể — chỉ tốn một tam giác và một texture nhỏ, mà vẫn cho mắt người đủ tín hiệu để định vị vật thể trên mặt sàn.',
    },
    {
      q: 'Shadow acne là gì và xử lý thế nào?',
      a: 'Là hiện tượng bề mặt tự tạo ra những vệt sọc tối trên chính nó, do sai số làm tròn khi so độ sâu khiến pixel tự che chính mình. Cách xử lý thông thường là tăng `shadow.bias` một lượng nhỏ để đẩy phép so ra xa một chút, nhưng quá tay sẽ gây peter-panning — bóng tách rời khỏi chân vật thể. `shadow.normalBias` thường cho kết quả tốt hơn vì nó dịch theo pháp tuyến bề mặt. Ngoài ra, thu hẹp khoảng `near`–`far` của shadow camera cũng cải thiện độ chính xác đáng kể.',
    },
  ],

  checkpoints: [
    'Nhớ được ba nơi phải bật bóng và triệu chứng khi thiếu từng nơi.',
    'Chỉnh được `shadow.camera` bao trọn vùng cần đổ bóng bằng `CameraHelper`.',
    'Có số liệu FPS so sánh bóng thật với bóng giả.',
    'Giải thích được vì sao tăng `mapSize` làm chi phí tăng theo bình phương.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 520 }),
};
