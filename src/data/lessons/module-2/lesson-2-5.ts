import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(0, 1, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

// ---- Environment map ----
// Trong dự án thật bạn dùng RGBELoader tải file .hdr từ Poly Haven.
// Ở đây dùng RoomEnvironment: một phòng studio dựng sẵn bằng hình học,
// chạy offline được mà nguyên lý hoàn toàn giống nhau.
//
// PMREMGenerator tiền xử lý ảnh môi trường thành một chuỗi mipmap đã được
// làm mờ dần — mỗi mức tương ứng một giá trị roughness. Nhờ đó vật liệu
// nhám tra cứu mức mờ, vật liệu bóng tra cứu mức nét, chỉ tốn MỘT lần đọc.
const pmrem = new THREE.PMREMGenerator(renderer);
const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

scene.environment = envTexture; // chiếu sáng toàn bộ scene
scene.background = new THREE.Color(0x111111);

// ---- Vật thể ----
const geometry = new THREE.SphereGeometry(0.85, 96, 64);
const spheres = [];

// Bốn tổ hợp roughness/metalness để thấy env map ảnh hưởng thế nào
const configs = [
  { roughness: 0.0, metalness: 1.0, label: 'gương' },
  { roughness: 0.3, metalness: 1.0, label: 'kim loại xước' },
  { roughness: 0.15, metalness: 0.0, label: 'nhựa bóng' },
  { roughness: 0.9, metalness: 0.0, label: 'nhựa nhám' },
];

configs.forEach((cfg, i) => {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: cfg.roughness,
      metalness: cfg.metalness,
    })
  );
  mesh.position.x = (i - 1.5) * 2;
  scene.add(mesh);
  spheres.push(mesh);
});

const label = document.createElement('div');
label.style.cssText =
  'position:fixed;bottom:36px;left:0;right:0;display:flex;justify-content:space-around;' +
  'font:11px ui-monospace,monospace;color:#a3a3a3;pointer-events:none';
label.innerHTML = configs.map((c) => '<span>' + c.label + '</span>').join('');
document.body.appendChild(label);

// KHÔNG có đèn nào trong scene này. Toàn bộ ánh sáng đến từ environment map.
const den = new THREE.DirectionalLight(0xffffff, 3);
den.position.set(3, 4, 3);
den.visible = false;
scene.add(den);

// ---- Sương mù ----
scene.fog = null;

// ---- Bảng điều khiển ----
const state = {
  dungEnvMap: true,
  cuongDoEnv: 1,
  hienEnvLamNen: false,
  themDenThuCong: false,
  suongMu: 'không',
  fogNear: 4,
  fogFar: 14,
};

const gui = new GUI({ title: 'Environment' });

gui.add(state, 'dungEnvMap').name('scene.environment')
  .onChange((v) => (scene.environment = v ? envTexture : null));
gui.add(state, 'cuongDoEnv', 0, 3, 0.01).name('environmentIntensity')
  .onChange((v) => (scene.environmentIntensity = v));
gui.add(state, 'hienEnvLamNen').name('dùng làm background')
  .onChange((v) => (scene.background = v ? envTexture : new THREE.Color(0x111111)));
gui.add(state, 'themDenThuCong').name('thêm DirectionalLight')
  .onChange((v) => (den.visible = v));

const fogFolder = gui.addFolder('Sương mù');
fogFolder.add(state, 'suongMu', ['không', 'Fog (tuyến tính)', 'FogExp2 (mũ)'])
  .name('loại').onChange(applyFog);
fogFolder.add(state, 'fogNear', 0, 20, 0.1).name('near').onChange(applyFog);
fogFolder.add(state, 'fogFar', 1, 40, 0.1).name('far').onChange(applyFog);

function applyFog() {
  // Màu fog PHẢI trùng màu nền, nếu không sẽ lộ đường viền chỗ vật thể
  // tan vào sương nhưng nền lại là màu khác.
  const c = 0x111111;
  if (state.suongMu === 'Fog (tuyến tính)') {
    scene.fog = new THREE.Fog(c, state.fogNear, state.fogFar);
  } else if (state.suongMu === 'FogExp2 (mũ)') {
    scene.fog = new THREE.FogExp2(c, 0.08);
  } else {
    scene.fog = null;
  }
}

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

const clock = new THREE.Clock();
let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  const delta = clock.getDelta();
  spheres.forEach((s) => (s.rotation.y += 0.2 * delta));

  const soDen = scene.children.filter((c) => c.isLight && c.visible).length;
  hud.textContent =
    'đèn thủ công: ' + soDen +
    '   |   environment: ' + (scene.environment ? 'bật' : 'tắt') +
    '   |   draw calls: ' + renderer.info.render.calls;

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  gui.destroy();
  pmrem.dispose();
  envTexture.dispose();
  geometry.dispose();
  spheres.forEach((s) => s.material.dispose());
  renderer.dispose();
}
`;

export const LESSON_2_5: LessonContent = {
  id: '2-5',

  goal: 'Thay cả dàn đèn thủ công bằng một environment map, và giải thích được vì sao cách đó vừa đẹp hơn vừa rẻ hơn.',

  lecture: [
    'Đây là bài tạo ra bước nhảy lớn nhất về chất lượng hình ảnh trong toàn Module 2. Ở bài 2.2 bạn đã đo được: mỗi đèn thêm vào là thêm chi phí cho mỗi pixel. Environment map giải quyết vấn đề đó theo một hướng hoàn toàn khác.',

    'Ý tưởng là: thay vì mô tả ánh sáng bằng vài nguồn điểm, ta dùng **một tấm ảnh bao quanh toàn bộ scene** và coi mỗi điểm ảnh trên đó là một nguồn sáng. Kết quả là ánh sáng đến từ mọi hướng, có màu sắc phong phú, giống hệt cách ánh sáng hoạt động ngoài đời — nơi phần lớn ánh sáng chiếu vào một vật thể là ánh sáng phản xạ từ tường, trần, bầu trời, chứ không phải trực tiếp từ nguồn.',

    'Điều làm nó rẻ là `PMREMGenerator`. Nó xử lý trước tấm ảnh môi trường thành một chuỗi mipmap được làm mờ dần, mỗi mức ứng với một giá trị `roughness`. Lúc chạy, shader chỉ cần **một** lần đọc texture ở mức mờ phù hợp. Chi phí gần như cố định, không tăng theo độ phức tạp của ánh sáng.',

    'Sandbox này không có đèn nào cả — toàn bộ ánh sáng đến từ environment. Đặc biệt chú ý quả cầu "gương" ngoài cùng bên trái: ở bài 2.1 tôi có nói vật liệu `metalness = 1` sẽ tối đen nếu không có gì để phản chiếu. Giờ thì bạn thấy nó cần cái gì.',
  ],

  concepts: [
    {
      term: 'scene.environment',
      explain:
        'Gán một texture môi trường để chiếu sáng mọi vật liệu PBR trong scene. Thay thế được cả dàn đèn. Khác với `scene.background` vốn chỉ là ảnh nền và không chiếu sáng gì.',
    },
    {
      term: 'PMREMGenerator',
      explain:
        'Tiền xử lý ảnh môi trường thành chuỗi mipmap làm mờ dần theo roughness. Bắt buộc với PBR — gán thẳng texture thô sẽ cho phản xạ sai và nhiễu.',
    },
    {
      term: 'RGBELoader / .hdr',
      explain:
        'File HDR lưu độ sáng vượt quá 1.0, nên vùng cửa sổ hay mặt trời thật sự sáng chói và tạo được phản xạ có sức nặng. Ảnh JPG thường bị cắt ngọn ở 1.0 nên cho kết quả bẹt.',
    },
    {
      term: 'environmentIntensity',
      explain:
        'Nhân toàn bộ đóng góp của environment map. Cách chỉnh sáng tối mà không phải đổi file HDRI.',
    },
    {
      term: 'Fog',
      explain:
        '`Fog` suy giảm tuyến tính giữa `near` và `far`; `FogExp2` suy giảm theo hàm mũ, tự nhiên hơn. Màu fog phải trùng màu nền, nếu không sẽ lộ đường viền.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo `PMREMGenerator`, sinh texture môi trường, gán vào `scene.environment`.',
      why: 'Bước tiền xử lý là bắt buộc. Gán trực tiếp ảnh thô sẽ cho phản xạ nhiễu và sai với vật liệu nhám.',
    },
    {
      action: 'Không thêm đèn nào cả, chạy thử.',
      why: 'Để tự chứng minh rằng environment map một mình là đủ.',
    },
    {
      action: 'Đặt bốn quả cầu với bốn tổ hợp `roughness`/`metalness` khác nhau.',
      why: 'Environment map ảnh hưởng rất khác nhau lên từng loại vật liệu. Đặt cạnh nhau mới thấy.',
    },
    {
      action: 'Bật "dùng làm background" để dùng chính ảnh đó làm nền.',
      why: 'Nền khớp với môi trường phản chiếu khiến scene liền lạc hẳn — mắt người rất nhạy với sự bất nhất này.',
    },
    {
      action: 'Kéo `environmentIntensity` từ 0 lên 3.',
      why: 'Đây là núm chỉnh sáng chính khi làm việc với HDRI, thay cho việc chỉnh intensity từng đèn.',
    },
    {
      action: 'Bật sương mù, so sánh `Fog` và `FogExp2`, thử đổi màu fog khác màu nền.',
      why: 'Lỗi màu fog lệch màu nền rất hay gặp và trông rất lộ.',
    },
  ],

  observations: [
    {
      change: 'Tắt `scene.environment`.',
      observe: 'Cả bốn quả cầu tối sầm; quả "gương" đen gần như tuyệt đối.',
      why: 'Không còn nguồn sáng nào trong scene. Riêng quả gương đen sâu nhất vì `metalness = 1` nghĩa là toàn bộ hình ảnh của nó đến từ phản xạ môi trường, mà môi trường giờ trống rỗng. Đây chính là lời giải cho hiện tượng bạn gặp ở bài 2.1.',
    },
    {
      change: 'Bật lại environment, rồi bật thêm "thêm DirectionalLight".',
      observe: 'Xuất hiện một điểm sáng chói gọn trên mỗi quả cầu, phần còn lại gần như không đổi.',
      why: 'Environment map lo phần ánh sáng nền đến từ mọi hướng; đèn có hướng bổ sung điểm nhấn và tạo bóng đổ. Đây là công thức chuẩn trong dự án thật: **một** HDRI cộng **một** đèn chính, thay vì bốn năm đèn thủ công. Vừa đẹp hơn vừa rẻ hơn.',
    },
    {
      change: 'So sánh quả "gương" với quả "kim loại xước" — cả hai đều `metalness = 1`.',
      observe: 'Quả thứ nhất phản chiếu môi trường sắc nét; quả thứ hai cho hình ảnh mờ nhoè.',
      why: 'Đây là lúc chuỗi mipmap của `PMREMGenerator` phát huy tác dụng. `roughness = 0` tra cứu mức nét nhất, `roughness = 0.3` tra mức đã làm mờ sẵn. Vì độ mờ được tính trước chứ không phải lấy mẫu nhiều lần lúc chạy, chi phí của hai quả này là như nhau.',
    },
    {
      change: 'Bật `Fog (tuyến tính)` rồi sửa màu fog trong code thành `0xff0000`.',
      observe: 'Vật thể ở xa chuyển đỏ trong khi nền vẫn đen, tạo ranh giới lộ liễu.',
      why: 'Fog trộn màu vật thể về phía màu fog theo khoảng cách, nhưng nó **không** chạm tới nền. Muốn ảo giác chiều sâu liền mạch thì hai màu phải trùng nhau — khi đó vật thể tan dần vào nền một cách tự nhiên. Đây cũng là một mẹo tối ưu: đặt `far` của camera trùng chỗ fog phủ kín thì có thể cắt bỏ hẳn hình học ở xa mà không ai nhận ra.',
    },
  ],

  interview: [
    {
      q: 'Vì sao dùng environment map tốt hơn nhồi nhiều đèn?',
      a: 'Về chất lượng: ánh sáng thật đến từ mọi hướng và mang màu của môi trường xung quanh, thứ mà vài nguồn điểm không mô phỏng nổi. Về chi phí: mỗi đèn tăng công việc cho mỗi pixel một cách tuyến tính, còn environment map chỉ tốn một lần đọc texture bất kể môi trường phức tạp đến đâu, nhờ `PMREMGenerator` đã nướng sẵn các mức roughness thành mipmap. Công thức thực tế là một HDRI cộng một đèn chính để tạo bóng.',
    },
    {
      q: '`PMREMGenerator` làm gì và vì sao không bỏ qua được?',
      a: 'Nó chuyển ảnh môi trường thành một cubemap đặc biệt, trong đó mỗi mức mipmap đã được tích chập sẵn tương ứng một giá trị roughness. Không có bước này thì vật liệu nhám phải lấy mẫu nhiều lần lúc chạy để mô phỏng độ mờ — vừa chậm vừa nhiễu. Bỏ qua nó và gán thẳng texture thô sẽ cho phản xạ sắc nét sai trên bề mặt lẽ ra phải mờ.',
    },
    {
      q: 'Khác nhau giữa `scene.environment` và `scene.background`?',
      a: '`environment` là nguồn chiếu sáng: nó tham gia vào phép tính PBR của mọi vật liệu. `background` chỉ là thứ vẽ phía sau, thuần tuý thị giác, không đóng góp ánh sáng nào. Hoàn toàn có thể đặt hai thứ khác nhau — ví dụ chiếu sáng bằng HDRI studio nhưng nền là màu thương hiệu. Nhưng nếu nền không khớp với môi trường phản chiếu thì vật liệu bóng sẽ trông lạc lõng.',
    },
    {
      q: 'Fog dùng để làm gì ngoài mục đích thẩm mỹ?',
      a: 'Nó là công cụ tối ưu. Khi vật thể ở xa đã tan hết vào màu fog, bạn có thể kéo `camera.far` về đúng chỗ đó và loại bỏ hoàn toàn hình học phía sau mà người xem không nhận ra. Kỹ thuật này được dùng rộng rãi trong game thế giới mở. Nó cũng che được đường biên nơi địa hình bị cắt, và giảm hiện tượng nhấp nháy của vật thể ở xa.',
    },
  ],

  checkpoints: [
    'Scene sáng đẹp mà không có đèn thủ công nào.',
    'Giải thích được vì sao HDRI vừa đẹp hơn vừa rẻ hơn dàn đèn.',
    'Biết `PMREMGenerator` làm gì và vì sao bắt buộc.',
    'Nói được vì sao màu fog phải trùng màu nền.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 500 }),
};
