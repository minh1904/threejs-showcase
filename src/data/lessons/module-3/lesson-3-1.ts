import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(4, 3, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const light = new THREE.DirectionalLight(0xffffff, 2.5);
light.position.set(4, 7, 5);
light.castShadow = true;
light.shadow.camera.left = -6;
light.shadow.camera.right = 6;
light.shadow.camera.top = 6;
light.shadow.camera.bottom = -6;
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// ---------------------------------------------------------------------------
// Sandbox này không tải được file từ mạng, nên ta DỰNG một "model" rồi
// XUẤT ra GLB, sau đó LOAD lại đúng bằng GLTFLoader.
// Vòng tròn này cho bạn trải nghiệm y hệt khi tải file thật từ Poly Pizza:
// nhận về một Group lạ, phải tự khám phá và chỉnh sửa nó.
// ---------------------------------------------------------------------------
function buildFakeModel() {
  const root = new THREE.Group();
  root.name = 'RobotRoot';

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.5, metalness: 0.3 })
  );
  body.name = 'Body';
  body.position.y = 1.4;
  root.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3 })
  );
  head.name = 'Head';
  head.position.y = 2.6;
  root.add(head);

  [-0.85, 0.85].forEach((x, i) => {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.9, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.6 })
    );
    arm.name = 'Arm_' + (i === 0 ? 'L' : 'R');
    arm.position.set(x, 1.4, 0);
    root.add(arm);
  });

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.14, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  visor.name = 'Visor';
  visor.position.set(0, 2.62, 0.42);
  root.add(visor);

  // Cố tình đặt lệch tâm và sai tỉ lệ — đúng như model tải trên mạng về
  root.position.set(3.5, 0, -2);
  root.scale.setScalar(0.55);

  return root;
}

const exporter = new GLTFExporter();
const loader = new GLTFLoader();

exporter.parse(
  buildFakeModel(),
  (glb) => loader.parse(glb, '', onModelLoaded),
  (err) => console.error('lỗi xuất:', err),
  { binary: true }
);

function onModelLoaded(gltf) {
  // gltf.scene là một Group. gltf còn có animations, cameras, asset...
  console.log('cấu trúc gltf:', Object.keys(gltf));
  console.log('gltf.asset:', gltf.asset);

  const model = gltf.scene;

  // --- 1. Duyệt toàn bộ cây con ---
  console.log('--- các node bên trong model ---');
  model.traverse((child) => {
    console.log(' ', child.type.padEnd(10), child.name || '(không tên)');

    // Model từ file KHÔNG tự có castShadow — phải bật thủ công
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // --- 2. Đổi material của MỘT bộ phận, tìm theo tên ---
  const visor = model.getObjectByName('Visor');
  if (visor) {
    visor.material = new THREE.MeshStandardMaterial({
      color: 0x0c8ce9,
      emissive: 0x0c8ce9,
      emissiveIntensity: 0.6,
    });
  }

  // --- 3. Tự căn giữa và chuẩn hoá kích thước ---
  normalizeModel(model, 3);

  scene.add(model);
}

/**
 * Dịch model về gốc toạ độ (đáy chạm y = 0) và scale về chiều cao mong muốn.
 * Viết một lần, dùng cho mọi model sau này.
 */
function normalizeModel(object, targetHeight) {
  // Box3 đo hộp bao ngoài, đã tính cả transform của mọi node con
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  console.log('bounding box trước khi chuẩn hoá:', {
    size: size.toArray().map((n) => +n.toFixed(2)),
    center: center.toArray().map((n) => +n.toFixed(2)),
  });

  // Scale theo chiều cao
  const scale = targetHeight / size.y;
  object.scale.multiplyScalar(scale);

  // Đo LẠI sau khi scale — vì hộp bao đã đổi
  const box2 = new THREE.Box3().setFromObject(object);
  const center2 = box2.getCenter(new THREE.Vector3());

  object.position.x -= center2.x;
  object.position.z -= center2.z;
  object.position.y -= box2.min.y; // đáy chạm mặt sàn

  console.log('đã chuẩn hoá về chiều cao', targetHeight);
}

let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  controls.update();
  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  controls.dispose();
  scene.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    }
  });
  renderer.dispose();
}
`;

export const LESSON_3_1: LessonContent = {
  id: '3-1',

  goal: 'Thả một model bất kỳ vào và nó tự nằm giữa màn hình, đúng kích thước, có đổ bóng — nhờ một hàm chuẩn hoá bạn viết một lần rồi dùng mãi.',

  lecture: [
    'Từ bài này bạn bắt đầu làm việc với tài sản thật do người khác dựng, và đó là một sự thay đổi lớn về tư duy. Ở ba bài trước bạn tạo ra mọi thứ nên biết chính xác nó là gì. Giờ bạn nhận về một `Group` chứa cây con lạ hoắc, đặt lệch tâm, sai tỉ lệ, và không có thuộc tính nào bạn cần.',

    'glTF được gọi là "JPEG của 3D" vì đúng nghĩa là định dạng truyền tải: nó lưu dữ liệu ở dạng GPU đọc được gần như trực tiếp, không cần chuyển đổi nặng lúc tải. Có hai biến thể — `.gltf` là JSON kèm file rời, tiện khi cần sửa tay; `.glb` gói tất cả vào một file nhị phân, gần như luôn là lựa chọn đúng cho web vì chỉ tốn một request.',

    'Ba kỹ năng bạn phải thành thạo trong bài này. Thứ nhất là `traverse()` — duyệt đệ quy toàn bộ cây con để tìm và sửa từng mesh. Điều quan trọng cần nhớ: **model tải về không tự có `castShadow`**; đây là thuộc tính runtime của Three.js chứ không phải dữ liệu lưu trong file, nên bạn luôn phải tự bật.',

    'Thứ hai là sửa material theo tên. Người dựng model thường đặt tên có nghĩa cho từng bộ phận, và `getObjectByName()` cho bạn nhắm đúng chỗ — đây là nền tảng của mọi tính năng đổi màu sản phẩm.',

    'Thứ ba, và đáng giá nhất về lâu dài, là **hàm chuẩn hoá**. Dùng `Box3` đo hộp bao, tính tâm và kích thước, rồi dịch cùng scale model về đúng khung. Viết cẩn thận một lần, sau này thả model nào vào cũng vừa. Hãy chú ý chi tiết trong code: phải đo hộp bao **lần thứ hai** sau khi scale, vì hộp bao cũ không còn đúng nữa.',
  ],

  concepts: [
    {
      term: 'glTF / GLB',
      explain:
        '`.gltf` là JSON kèm file rời; `.glb` gói tất cả vào một file nhị phân. Web nên dùng `.glb` — một request, không lo đường dẫn tương đối bị sai.',
    },
    {
      term: 'gltf.scene',
      explain:
        'Một `THREE.Group` chứa toàn bộ cây con của model. Đối tượng `gltf` còn có `animations`, `cameras`, `asset` (thông tin công cụ dựng) và `parser`.',
    },
    {
      term: 'traverse()',
      explain:
        'Duyệt đệ quy mọi node con. Đây là chỗ bạn bật `castShadow`, sửa material, hoặc thu thập thống kê. Kiểm tra `child.isMesh` trước khi động vào geometry.',
    },
    {
      term: 'Box3',
      explain:
        '`new THREE.Box3().setFromObject(model)` đo hộp bao đã tính cả transform của mọi node con. Từ đó lấy `getSize()` và `getCenter()` để chuẩn hoá.',
    },
    {
      term: 'getObjectByName()',
      explain:
        'Tìm node con theo tên do người dựng đặt. Cách nhắm đúng bộ phận cần đổi màu hay ẩn hiện, thay vì dựa vào chỉ số mảng vốn dễ đổi.',
    },
  ],

  walkthrough: [
    {
      action: 'Load model, rồi `console.log(gltf)` và xem có những khoá nào.',
      why: 'Trước khi sửa gì, hãy nhìn xem mình đang cầm cái gì. Thói quen này tiết kiệm rất nhiều thời gian.',
    },
    {
      action: 'Dùng `traverse()` in ra tên và loại của mọi node con.',
      why: 'Bạn cần bản đồ cây trước khi nhắm vào bộ phận cụ thể. Model thật thường lồng sâu vài tầng.',
    },
    {
      action: 'Trong lúc traverse, bật `castShadow` và `receiveShadow` cho mọi mesh.',
      why: 'Đây là thuộc tính runtime, không nằm trong file glTF. Không tự bật thì model không có bóng dù bạn đã cấu hình đủ ba nơi ở bài 2.3.',
    },
    {
      action: 'Đổi material của một bộ phận bằng `getObjectByName()`.',
      why: 'Nền tảng của tính năng cấu hình sản phẩm — đổi màu ghế, đổi chất liệu vỏ xe.',
    },
    {
      action: 'Viết hàm `normalizeModel(object, targetHeight)` dùng `Box3`.',
      why: 'Đây là phần đáng giá nhất bài. Hãy viết cho tổng quát để tái sử dụng.',
    },
    {
      action: 'Trong hàm đó, nhớ đo lại `Box3` **sau khi** scale rồi mới dịch vị trí.',
      why: 'Hộp bao đo trước khi scale không còn đúng sau đó. Đây là lỗi rất dễ mắc và cho kết quả lệch một cách khó hiểu.',
    },
  ],

  observations: [
    {
      change: 'Bỏ đoạn bật `castShadow` trong `traverse()`.',
      observe: 'Model không có bóng, dù renderer và đèn đều đã bật đổ bóng đúng.',
      why: '`castShadow` là cờ runtime của `Object3D`, không phải dữ liệu được lưu trong file glTF. Định dạng glTF mô tả hình học, vật liệu và cấu trúc cây — nó không mô tả quyết định render của engine cụ thể. Mọi model tải về đều mặc định `false`.',
    },
    {
      change: 'Xoá dòng đo `Box3` lần thứ hai và dùng `center` đo từ lần đầu.',
      observe: 'Model bị đặt lệch, và độ lệch tỉ lệ với mức scale đã áp dụng.',
      why: 'Hộp bao đo trước khi scale mô tả kích thước cũ. Sau khi nhân `scale`, mọi khoảng cách đều đổi theo, nên tâm cũ không còn là tâm mới. Quy tắc chung: mỗi lần đổi transform là mỗi lần phải đo lại nếu cần số liệu chính xác.',
    },
    {
      change: 'Xem log `bounding box trước khi chuẩn hoá` trong Console.',
      observe: 'Tâm không phải `(0, 0, 0)` và chiều cao không phải một con số tròn.',
      why: 'Người dựng model làm việc trong đơn vị và gốc toạ độ của phần mềm họ dùng, không phải của bạn. Blender mặc định mét, một số công cụ khác dùng centimet, và gốc toạ độ thường đặt ở chỗ tiện cho việc dựng chứ không phải chỗ tiện cho việc hiển thị. Đó là lý do hàm chuẩn hoá là thứ bắt buộc phải có trong mọi dự án dùng model bên ngoài.',
    },
    {
      change: 'Đổi tên trong `getObjectByName(\'Visor\')` thành một tên không tồn tại.',
      observe: 'Không có lỗi nào, chỉ là không có gì đổi màu.',
      why: '`getObjectByName()` trả về `undefined` khi không tìm thấy, và đoạn code kiểm tra trước khi dùng nên không nổ. Trong dự án thật đây là nguồn lỗi âm thầm phổ biến: người dựng đổi tên bộ phận, tính năng đổi màu ngừng hoạt động mà không ai biết. Nên log cảnh báo khi không tìm thấy node bạn mong đợi.',
    },
  ],

  interview: [
    {
      q: 'Vì sao glTF là chuẩn cho web?',
      a: 'Vì nó được thiết kế làm định dạng **truyền tải** chứ không phải định dạng làm việc. Dữ liệu đỉnh được lưu ở bố cục mà GPU nạp gần như trực tiếp, không cần bước chuyển đổi nặng lúc tải như với OBJ hay FBX. Nó mô tả đầy đủ vật liệu PBR, hoạt ảnh, xương, và có hệ thống extension chuẩn hoá cho nén Draco, Meshopt, texture KTX2. Bản `.glb` gói tất cả vào một file nhị phân nên chỉ tốn một request.',
    },
    {
      q: 'Sau khi load model, bạn thường phải làm gì trước khi dùng được?',
      a: 'Bốn việc. Duyệt cây bằng `traverse()` để bật `castShadow`/`receiveShadow`, vì glTF không lưu những cờ này. Chuẩn hoá vị trí và tỉ lệ bằng `Box3`, vì model đến từ công cụ có đơn vị và gốc toạ độ khác. Kiểm tra và điều chỉnh material — thường phải sửa `envMapIntensity` hoặc `colorSpace` cho khớp cách chiếu sáng của scene. Và nếu có hoạt ảnh thì tạo `AnimationMixer`.',
    },
    {
      q: '`Box3` dùng để làm gì?',
      a: 'Đo hộp bao trục chính của một đối tượng, đã tính cả transform của toàn bộ cây con. Ứng dụng chính là chuẩn hoá model về đúng khung nhìn: lấy `getSize()` để tính hệ số scale, `getCenter()` để dịch về gốc. Nó cũng dùng cho frustum culling, phát hiện va chạm thô, và tự động đặt camera sao cho vừa khít vật thể — chính là thứ `<Bounds>` của drei làm hộ ở bài 4.3.',
    },
    {
      q: 'Khác nhau giữa `.gltf` và `.glb`, chọn cái nào?',
      a: '`.gltf` là file JSON, thường kèm theo file `.bin` chứa dữ liệu đỉnh và các file ảnh rời. `.glb` gói tất cả vào một file nhị phân duy nhất. Web nên chọn `.glb`: một request thay vì nhiều, không có rủi ro đường dẫn tương đối bị sai khi triển khai, và không tốn chi phí phân tích JSON cho phần dữ liệu lớn. `.gltf` chỉ tiện trong quá trình phát triển khi cần mở ra sửa tay hoặc xem diff trong Git.',
    },
  ],

  checkpoints: [
    'Thả model bất kỳ vào là nó tự nằm giữa, đúng kích thước, có bóng.',
    'Có hàm `normalizeModel()` dùng lại được cho mọi bài sau.',
    'Biết vì sao model tải về không tự có `castShadow`.',
    'Đổi được material của một bộ phận cụ thể theo tên.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 500 }),
};
