import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080808);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(0, 4, 10);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const surface = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.45 });

const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), surface);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.2;
scene.add(floor);

const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.32, 160, 32), surface);
scene.add(knot);

// ---- Năm loại đèn, bật tắt độc lập ----

// 1. Ambient: sáng đều mọi hướng, KHÔNG có hướng nên không tạo khối, không tạo bóng.
const ambient = new THREE.AmbientLight(0xffffff, 0.4);

// 2. Directional: tia song song như mặt trời. position chỉ quyết định HƯỚNG.
const directional = new THREE.DirectionalLight(0xffffff, 2);
directional.position.set(4, 6, 3);

// 3. Point: toả mọi hướng từ một điểm, cường độ giảm theo khoảng cách.
const point = new THREE.PointLight(0xea733a, 30, 20);
point.position.set(-3.5, 2, 2.5);

// 4. Spot: hình nón, angle là nửa góc mở, penumbra làm mềm rìa.
const spot = new THREE.SpotLight(0x9149f5, 60, 25, Math.PI / 7, 0.4);
spot.position.set(4, 6, -2);

// 5. Hemisphere: hai màu trời/đất, mô phỏng ánh sáng môi trường tự nhiên rất rẻ.
const hemisphere = new THREE.HemisphereLight(0x88bbff, 0x442200, 1.2);

const lights = { ambient, directional, point, spot, hemisphere };
Object.values(lights).forEach((l) => scene.add(l));

// Helper để NHÌN THẤY đèn đang ở đâu — thiếu chúng thì chỉnh đèn như mò trong tối.
const helpers = [
  new THREE.DirectionalLightHelper(directional, 1),
  new THREE.PointLightHelper(point, 0.4),
  new THREE.SpotLightHelper(spot),
  new THREE.HemisphereLightHelper(hemisphere, 1),
];
helpers.forEach((h) => scene.add(h));

// ---- Bảng điều khiển ----
const state = {
  ambient: true,
  directional: true,
  point: true,
  spot: true,
  hemisphere: false,
  hienHelper: true,
  soPointLightThem: 0,
};

const gui = new GUI({ title: 'Đèn' });
Object.keys(lights).forEach((key) => {
  gui.add(state, key).onChange((v) => (lights[key].visible = v));
});
gui.add(state, 'hienHelper').name('hiện helper')
  .onChange((v) => helpers.forEach((h) => (h.visible = v)));

// Đo chi phí: mỗi PointLight thêm vào là thêm tính toán cho MỖI pixel.
const extraLights = [];
gui.add(state, 'soPointLightThem', 0, 16, 1).name('thêm PointLight').onChange((n) => {
  while (extraLights.length > n) scene.remove(extraLights.pop());
  while (extraLights.length < n) {
    const l = new THREE.PointLight(0xffffff, 8, 14);
    const a = (extraLights.length / 16) * Math.PI * 2;
    l.position.set(Math.cos(a) * 5, 2, Math.sin(a) * 5);
    extraLights.push(l);
    scene.add(l);
  }
});

state.hemisphere = false;
hemisphere.visible = false;

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

const clock = new THREE.Clock();
let frameId, frames = 0, acc = 0, fps = 0;

function tick() {
  frameId = requestAnimationFrame(tick);
  const delta = clock.getDelta();

  knot.rotation.y += 0.3 * delta;
  knot.rotation.x += 0.15 * delta;

  frames++; acc += delta;
  if (acc >= 0.5) { fps = Math.round(frames / acc); frames = 0; acc = 0; }

  const total = Object.values(lights).filter((l) => l.visible).length + extraLights.length;
  hud.textContent = 'đèn đang bật: ' + total + '   |   FPS ≈ ' + fps;

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  gui.destroy();
  surface.dispose();
  floor.geometry.dispose();
  knot.geometry.dispose();
  renderer.dispose();
}
`;

export const LESSON_2_2: LessonContent = {
  id: '2-2',

  goal: 'Dựng được setup ba đèn kinh điển mà không cần tra tài liệu, và có số liệu FPS của chính bạn cho câu "nhiều đèn thì chậm".',

  lecture: [
    'Ở bài trước bạn đã thấy: không có đèn thì hầu hết material đều đen. Bài này ta đi sâu vào từng loại đèn, vì chọn sai loại là nguyên nhân khiến scene trông "nghiệp dư" ngay cả khi model và texture đều tốt.',

    'Có một cách phân loại giúp bạn nhớ nhanh: đèn có **hướng** hay không. `AmbientLight` không có hướng — nó cộng đều một lượng sáng vào mọi bề mặt, nên làm sáng scene mà không tạo ra khối. Bốn loại còn lại đều có hướng, nghĩa là bề mặt quay về phía đèn thì sáng, quay đi thì tối, và chính sự chênh lệch đó tạo cảm giác ba chiều.',

    'Điều quan trọng thứ hai là **chi phí**. Mỗi đèn có hướng thêm vào scene là thêm một lượt tính toán cho **mỗi pixel** được tô. Bốn đèn nghĩa là mỗi pixel phải tính bốn lần. Sandbox có sẵn slider thêm `PointLight` — hãy kéo nó lên và nhìn FPS. Ghi lại ba con số ở mức 1, 4 và 8 đèn; đó là dữ liệu bạn mang đi phỏng vấn.',

    'Cách làm chuyên nghiệp khi cần ánh sáng phong phú không phải là nhồi thêm đèn, mà là dùng **environment map** — đó là nội dung bài 2.5. Một tấm HDRI cho bạn ánh sáng đến từ mọi hướng với chi phí gần như cố định, thay vì tăng tuyến tính theo số đèn.',
  ],

  concepts: [
    {
      term: 'AmbientLight',
      explain:
        'Cộng đều một lượng sáng vào mọi bề mặt bất kể hướng. Không tạo khối, không tạo bóng, nhưng rẻ nhất. Dùng để nâng nền tối lên chứ không dùng làm nguồn sáng chính.',
    },
    {
      term: 'DirectionalLight',
      explain:
        'Tia song song như ánh mặt trời. `position` chỉ xác định **hướng** chiếu, không phải khoảng cách — dời đèn ra xa gấp mười lần không làm nó yếu đi.',
    },
    {
      term: 'PointLight',
      explain:
        'Toả mọi hướng từ một điểm, cường độ giảm theo khoảng cách. Tham số `distance` giới hạn tầm ảnh hưởng — đặt giá trị hợp lý giúp GPU loại sớm những pixel ngoài tầm.',
    },
    {
      term: 'SpotLight',
      explain:
        'Hình nón. `angle` là nửa góc mở, `penumbra` từ 0 tới 1 làm mềm rìa nón. Đắt nhất trong các loại đèn cơ bản, đặc biệt khi bật đổ bóng.',
    },
    {
      term: 'HemisphereLight',
      explain:
        'Hai màu: một từ trên trời, một hắt từ mặt đất. Rất rẻ mà cho cảm giác ánh sáng ngoài trời tự nhiên hơn hẳn `AmbientLight`.',
    },
  ],

  walkthrough: [
    {
      action: 'Thêm lần lượt năm loại đèn, mỗi loại một checkbox bật/tắt trong `lil-gui`.',
      why: 'Bật một loại duy nhất rồi quan sát là cách nhanh nhất để cảm nhận đặc tính riêng của nó.',
    },
    {
      action: 'Gắn helper tương ứng cho từng đèn.',
      why: 'Đèn vốn vô hình. Không có helper thì chỉnh vị trí đèn chẳng khác gì mò trong bóng tối.',
    },
    {
      action: 'Dựng setup ba đèn: key light mạnh chếch một bên, fill light yếu phía đối diện, rim light phía sau.',
      why: 'Đây là công thức chiếu sáng chuẩn của nhiếp ảnh và điện ảnh. Key tạo khối, fill làm dịu vùng tối, rim tách chủ thể khỏi nền.',
    },
    {
      action: 'Bật `HemisphereLight` và tắt `AmbientLight`, so sánh hai cách nâng nền.',
      why: 'Hemisphere cho vùng tối một sắc màu hắt lên từ mặt đất, tự nhiên hơn nhiều so với ambient phẳng đều.',
    },
    {
      action: 'Kéo slider "thêm PointLight" lên 1, 4, rồi 8. Ghi lại FPS ở mỗi mức.',
      why: 'Ba con số này biến "nhiều đèn thì chậm" từ câu nghe nói thành dữ liệu của riêng bạn.',
    },
  ],

  observations: [
    {
      change: 'Tắt tất cả trừ `AmbientLight`.',
      observe: 'Vật thể sáng đều nhưng trông dẹt như hình vẽ 2D, không còn cảm giác khối.',
      why: '`AmbientLight` cộng cùng một lượng sáng vào mọi bề mặt bất kể pháp tuyến hướng đâu. Mắt người nhận biết hình khối chủ yếu qua **gradient sáng tối** trên bề mặt cong; xoá gradient đó đi là xoá luôn thông tin về hình dạng.',
    },
    {
      change: 'Chỉ bật `DirectionalLight`, rồi đổi `position` từ `(4, 6, 3)` thành `(40, 60, 30)`.',
      observe: 'Ánh sáng không hề yếu đi dù đèn đã ở xa gấp mười lần.',
      why: '`DirectionalLight` mô phỏng nguồn sáng ở vô cực — mọi tia song song. `position` chỉ dùng để suy ra vector hướng, còn độ lớn khoảng cách bị bỏ qua. Chỉ có `PointLight` và `SpotLight` mới suy giảm theo khoảng cách.',
    },
    {
      change: 'Kéo slider "thêm PointLight" từ 0 lên 16 và theo dõi FPS.',
      observe: 'FPS giảm dần khá đều theo số đèn.',
      why: 'Three.js dùng forward rendering: với mỗi pixel, shader lặp qua toàn bộ danh sách đèn. Chi phí do đó tỉ lệ với số đèn nhân số pixel. Đây là lý do các scene chất lượng cao dùng environment map thay vì nhiều đèn — HDRI cho ánh sáng từ mọi hướng với chi phí một lần tra cứu texture.',
    },
    {
      change: 'Chỉ bật `SpotLight`, đổi `penumbra` từ `0.4` xuống `0`.',
      observe: 'Rìa vòng sáng trở nên sắc lẹm, trông giả tạo.',
      why: 'Nguồn sáng thật luôn có kích thước vật lý nên rìa bóng luôn có vùng chuyển tiếp. `penumbra` mô phỏng điều đó bằng cách làm mềm biên nón. Đây là chi tiết nhỏ nhưng tạo khác biệt lớn giữa scene trông "được làm bằng máy tính" và scene trông thật.',
    },
  ],

  interview: [
    {
      q: 'Có những loại đèn nào và khi nào dùng loại nào?',
      a: '`AmbientLight` nâng nền tối, không tạo khối. `DirectionalLight` cho nguồn sáng ở xa như mặt trời, tia song song, đổ bóng tốt. `PointLight` cho bóng đèn trong nhà, suy giảm theo khoảng cách. `SpotLight` cho đèn sân khấu hoặc đèn pin, có góc và độ mềm rìa. `HemisphereLight` cho ánh sáng môi trường ngoài trời rất rẻ. Thực tế hay dùng một `DirectionalLight` làm key light kết hợp environment map, thay vì chồng nhiều đèn.',
    },
    {
      q: 'Vì sao nhiều đèn làm chậm scene?',
      a: 'Vì Three.js mặc định dùng forward rendering: mỗi fragment shader lặp qua toàn bộ danh sách đèn để cộng dồn đóng góp của từng cái. Chi phí tỉ lệ với số đèn nhân số pixel phải tô. Thêm nữa, mỗi tổ hợp số đèn khác nhau lại buộc Three.js biên dịch một biến thể shader mới, gây khựng ở lần render đầu tiên.',
    },
    {
      q: 'Setup ba đèn kinh điển gồm những gì?',
      a: 'Key light là nguồn chính, mạnh nhất, đặt chếch khoảng 45° so với trục camera để tạo khối. Fill light yếu hơn nhiều, đặt phía đối diện để vùng tối không mất hết chi tiết. Rim light hay còn gọi back light đặt phía sau chủ thể, tạo viền sáng tách chủ thể khỏi nền. Công thức này đến từ nhiếp ảnh và dùng được nguyên vẹn trong 3D.',
    },
    {
      q: 'Tối ưu ánh sáng cho thiết bị di động thế nào?',
      a: 'Giảm số đèn động xuống mức tối thiểu, thường là một đèn có đổ bóng cộng với environment map. Dùng `HemisphereLight` thay cho nhiều đèn phụ vì nó gần như miễn phí. Đặt `distance` hợp lý cho `PointLight` để GPU loại sớm pixel ngoài tầm. Và nếu ánh sáng lẫn vật thể đều tĩnh thì nên nướng sẵn ánh sáng vào texture — không tính gì lúc chạy là rẻ nhất.',
    },
  ],

  checkpoints: [
    'Dựng được setup ba đèn mà không cần tra lại.',
    'Có ba con số FPS ở mức 1, 4 và 8 đèn.',
    'Giải thích được vì sao `DirectionalLight` không yếu đi khi dời ra xa.',
    'Biết vì sao `AmbientLight` làm vật thể trông dẹt.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 500 }),
};
