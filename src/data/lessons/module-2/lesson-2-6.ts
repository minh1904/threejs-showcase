import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(0, 1, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// outputColorSpace mặc định của Three.js hiện đại là SRGBColorSpace.
// Đây là bước chuyển cuối cùng: từ không gian tuyến tính (nơi mọi phép tính
// chiếu sáng diễn ra) sang sRGB (thứ màn hình mong đợi).
console.log('outputColorSpace mặc định:', renderer.outputColorSpace);
console.log('toneMapping mặc định:', renderer.toneMapping, '(0 = NoToneMapping)');

container.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const geometry = new THREE.SphereGeometry(0.8, 96, 64);
const spheres = [];

[
  { color: 0xffffff, roughness: 0.1, metalness: 0.9 },
  { color: 0xd94f4f, roughness: 0.35, metalness: 0.0 },
  { color: 0x4f8fd9, roughness: 0.6, metalness: 0.0 },
  { color: 0xffffff, roughness: 0.9, metalness: 0.0 },
].forEach((cfg, i) => {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial(cfg));
  mesh.position.x = (i - 1.5) * 1.9;
  scene.add(mesh);
  spheres.push(mesh);
});

// Đèn cực mạnh để đẩy giá trị VƯỢT QUÁ 1.0 -> đây là lúc tone mapping có việc làm
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(3, 4, 4);
scene.add(light);

const state = {
  toneMapping: 'ACESFilmic',
  exposure: 1,
  cuongDoDen: 3,
  outputSRGB: true,
};

const TONE = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
  AgX: THREE.AgXToneMapping,
  Neutral: THREE.NeutralToneMapping,
};

renderer.toneMapping = TONE.ACESFilmic;

const gui = new GUI({ title: 'Màu sắc & phơi sáng' });

gui.add(state, 'toneMapping', Object.keys(TONE)).name('toneMapping')
  .onChange((v) => {
    renderer.toneMapping = TONE[v];
    // Đổi toneMapping buộc shader biên dịch lại
    scene.traverse((o) => { if (o.isMesh) o.material.needsUpdate = true; });
  });

gui.add(state, 'exposure', 0.1, 3, 0.01).name('toneMappingExposure')
  .onChange((v) => (renderer.toneMappingExposure = v));

gui.add(state, 'cuongDoDen', 0, 12, 0.1).name('cường độ đèn')
  .onChange((v) => (light.intensity = v));

gui.add(state, 'outputSRGB').name('outputColorSpace = sRGB')
  .onChange((v) => {
    // Tắt cái này = bỏ bước chuyển cuối sang sRGB -> ảnh tối và ám màu
    renderer.outputColorSpace = v ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    scene.traverse((o) => { if (o.isMesh) o.material.needsUpdate = true; });
  });

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

  hud.textContent =
    'toneMapping: ' + state.toneMapping +
    '   |   exposure: ' + state.exposure.toFixed(2) +
    '   |   đèn: ' + state.cuongDoDen.toFixed(1) +
    '   |   output: ' + (state.outputSRGB ? 'sRGB' : 'Linear (sai)');

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  gui.destroy();
  pmrem.dispose();
  geometry.dispose();
  spheres.forEach((s) => s.material.dispose());
  renderer.dispose();
}
`;

export const LESSON_2_6: LessonContent = {
  id: '2-6',

  goal: 'Trả lời được câu hỏi "vì sao demo của em trông bợt hơn demo trên mạng" — thứ mà hầu hết người tự học không giải thích nổi.',

  lecture: [
    'Đây là bài phân tách rõ nhất giữa demo nghiệp dư và demo chuyên nghiệp, và cũng là chủ đề bị bỏ sót nhiều nhất trong các lộ trình tự viết. Vấn đề nó giải quyết rất cụ thể: bạn đặt đúng màu, đặt đủ đèn, dùng material chuẩn, nhưng kết quả vẫn "sai sai" — hoặc bợt nhợt, hoặc cháy trắng — mà không biết vì đâu.',

    'Nguyên nhân nằm ở chỗ có **ba không gian màu** tham gia vào một khung hình, và mỗi cái phục vụ một mục đích. Texture và màu bạn nhập vào thường ở không gian **sRGB**, vì đó là cách file ảnh lưu màu. Nhưng mọi phép tính chiếu sáng phải diễn ra ở không gian **tuyến tính**, vì cộng hai nguồn sáng là phép cộng vật lý, chỉ đúng khi con số tỉ lệ thuận với năng lượng thật. Cuối cùng kết quả phải chuyển ngược về sRGB để màn hình hiển thị đúng.',

    'Vấn đề thứ hai là **dải động**. Khi bạn đặt `light.intensity = 10`, giá trị sáng ở nhiều pixel vượt xa 1.0. Màn hình chỉ hiển thị được tới 1.0. Nếu cắt thẳng, mọi thứ trên ngưỡng biến thành trắng bệt và mất sạch chi tiết. **Tone mapping** là hàm nén dải rộng đó về dải hiển thị được sao cho giữ lại chi tiết ở vùng sáng — đúng như phim nhựa và máy ảnh vẫn làm.',

    'Sandbox có sẵn đủ núm để bạn tự kiểm chứng. Bài tập quan trọng nhất: đặt cường độ đèn lên 10 với `toneMapping = None`, nhìn vùng sáng cháy trắng, rồi chuyển sang `ACESFilmic` mà không đổi gì khác. Chi tiết quay trở lại. Đó là toàn bộ ý nghĩa của tone mapping, gói trong một thao tác.',
  ],

  concepts: [
    {
      term: 'renderer.outputColorSpace',
      explain:
        'Bước chuyển cuối từ không gian tuyến tính sang không gian màn hình. Three.js hiện đại mặc định `SRGBColorSpace` — đúng trong hầu hết trường hợp và không nên đổi.',
    },
    {
      term: 'Tuyến tính vs sRGB',
      explain:
        'Phép tính chiếu sáng chỉ đúng ở không gian tuyến tính, nơi con số tỉ lệ với năng lượng ánh sáng. sRGB là không gian lưu trữ và hiển thị, đã qua hàm gamma để phân bổ bit hợp với cảm nhận mắt người.',
    },
    {
      term: 'toneMapping',
      explain:
        'Hàm nén dải sáng HDR về dải hiển thị 0–1. `ACESFilmic` cho tương phản đậm kiểu điện ảnh; `AgX` và `Neutral` giữ màu trung thực hơn ở vùng cháy sáng; `None` cắt thẳng ở 1.0.',
    },
    {
      term: 'toneMappingExposure',
      explain:
        'Nhân toàn cảnh trước khi tone mapping — tương đương khẩu độ máy ảnh. Cách chỉnh sáng tối tổng thể mà không phải sửa từng đèn.',
    },
    {
      term: 'HDR vs LDR',
      explain:
        'Phép tính chiếu sáng sinh ra giá trị vượt 1.0 (HDR). Màn hình thông thường chỉ nhận 0–1 (LDR). Tone mapping là cầu nối giữa hai thế giới đó.',
    },
  ],

  walkthrough: [
    {
      action: 'Đọc `renderer.outputColorSpace` và `renderer.toneMapping` mặc định trong Console.',
      why: 'Biết điểm xuất phát. Giá trị mặc định đã đổi qua các phiên bản Three.js, nên đừng tin bài viết cũ.',
    },
    {
      action: 'Chụp lại màn hình hiện tại làm ảnh "trước".',
      why: 'So sánh bằng trí nhớ rất không đáng tin với những khác biệt tinh tế về màu.',
    },
    {
      action: 'Duyệt qua lần lượt `None` → `Linear` → `Reinhard` → `ACESFilmic` → `AgX` → `Neutral`.',
      why: 'Mỗi hàm có tính cách riêng. Bạn cần biết mình thích cái nào trước khi chọn cho dự án.',
    },
    {
      action: 'Kéo `toneMappingExposure` từ 0.5 tới 3.',
      why: 'Đây là núm chỉnh sáng bạn sẽ dùng thường xuyên nhất khi tinh chỉnh cảnh.',
    },
    {
      action: 'Đặt cường độ đèn lên 10 với `None`, rồi chuyển sang `ACESFilmic`.',
      why: 'Đây là thí nghiệm cốt lõi của cả bài. Đừng bỏ qua.',
    },
    {
      action: 'Tắt "outputColorSpace = sRGB" và quan sát.',
      why: 'Để thấy điều gì xảy ra khi bỏ bước chuyển cuối — triệu chứng này rất dễ nhận ra khi đã gặp một lần.',
    },
  ],

  observations: [
    {
      change: 'Đặt cường độ đèn `10`, `toneMapping = None`.',
      observe: 'Vùng sáng trên các quả cầu trắng bệt thành mảng, mất hết hình khối.',
      why: 'Phép tính chiếu sáng cho ra giá trị lớn hơn 1.0 ở những pixel đó. `NoToneMapping` chỉ cắt thẳng mọi thứ trên 1.0 xuống đúng 1.0, nên mọi mức sáng khác nhau đều thành cùng một màu trắng. Thông tin đã bị vứt bỏ vĩnh viễn.',
    },
    {
      change: 'Giữ nguyên cường độ 10, chuyển sang `ACESFilmic`.',
      observe: 'Chi tiết ở vùng sáng quay trở lại, hình khối hiện rõ, ảnh trông "có chất phim".',
      why: '`ACESFilmic` là hàm phi tuyến nén dải rộng vào 0–1 theo đường cong dốc dần ở vùng sáng. Thay vì cắt cụt, nó dồn nhiều mức sáng khác nhau vào những khác biệt nhỏ nhưng vẫn phân biệt được. Đây đúng là cách phim nhựa và cảm biến máy ảnh hoạt động, và là lý do ảnh chụp không bị cháy trắng như ảnh render thô.',
    },
    {
      change: 'So sánh `ACESFilmic` với `AgX` ở cùng cường độ cao.',
      observe: '`ACESFilmic` cho tương phản đậm và màu hơi ngả; `AgX` giữ màu trung thực hơn ở vùng gần cháy.',
      why: '`ACESFilmic` xuất phát từ tiêu chuẩn điện ảnh nên cố tình đẩy tương phản. `AgX` là hàm mới hơn, ưu tiên giữ sắc độ đúng khi giá trị tiến gần điểm bão hoà — quan trọng với ứng dụng cần màu chính xác như trưng bày sản phẩm hay cấu hình xe.',
    },
    {
      change: 'Tắt "outputColorSpace = sRGB".',
      observe: 'Toàn ảnh tối sầm và ám màu bất thường, đặc biệt ở vùng trung gian.',
      why: 'Bạn vừa bỏ bước chuyển cuối từ tuyến tính sang sRGB. Màn hình nhận giá trị tuyến tính nhưng vẫn diễn giải chúng theo đường cong sRGB, nên mọi mức trung gian bị đẩy tối đi. Đây chính là triệu chứng "demo trông bợt và tối" mà rất nhiều người gặp với các bài hướng dẫn cũ viết từ thời Three.js chưa bật quản lý màu mặc định.',
    },
  ],

  interview: [
    {
      q: 'Vì sao phép tính chiếu sáng phải làm ở không gian tuyến tính?',
      a: 'Vì ánh sáng cộng theo quy luật vật lý: hai đèn cùng cường độ cho gấp đôi năng lượng. Điều đó chỉ đúng khi con số tỉ lệ thuận với năng lượng, tức không gian tuyến tính. Giá trị sRGB đã qua hàm gamma phi tuyến, nên cộng trực tiếp chúng sẽ cho kết quả sai — vùng chuyển tiếp giữa sáng và tối sẽ tối hơn thực tế. Quy trình đúng là giải mã sRGB về tuyến tính khi nhập, tính toán, rồi mã hoá lại khi xuất.',
    },
    {
      q: 'Tone mapping giải quyết vấn đề gì?',
      a: 'Khoảng cách giữa dải động của cảnh và dải động của màn hình. Phép tính chiếu sáng sinh ra giá trị vượt xa 1.0, trong khi màn hình thông thường chỉ hiển thị được tới 1.0. Không có tone mapping thì mọi giá trị trên ngưỡng bị cắt thành trắng bệt, mất sạch chi tiết vùng sáng. Tone mapping nén dải đó theo đường cong phi tuyến, ưu tiên giữ thông tin ở vùng sáng — đúng như phim nhựa vẫn làm.',
    },
    {
      q: 'Vì sao demo tự làm hay trông bợt hơn demo trên mạng?',
      a: 'Thường là do một trong ba nguyên nhân về màu. Một là không khai báo `SRGBColorSpace` cho texture màu, làm màu bị nhạt. Hai là không bật tone mapping, khiến vùng sáng cháy trắng hoặc toàn cảnh phẳng. Ba là `outputColorSpace` sai. Cả ba đều không gây lỗi, chỉ làm kết quả kém đi một cách khó chỉ tên — nên người mới thường đi tìm nguyên nhân ở đèn hay material, sai chỗ.',
    },
    {
      q: 'Chọn hàm tone mapping nào cho dự án?',
      a: 'Tuỳ mục tiêu. `ACESFilmic` là mặc định an toàn cho cảnh điện ảnh, cho tương phản đậm và quen mắt. `AgX` hoặc `Neutral` hợp hơn khi màu sắc phải chính xác — trưng bày sản phẩm, cấu hình màu xe, thời trang — vì chúng giữ sắc độ ổn định ở vùng gần bão hoà. `None` chỉ dùng khi bạn đã tự xử lý dải động ở khâu hậu kỳ.',
    },
  ],

  checkpoints: [
    'Có bộ ảnh so sánh giữa các hàm tone mapping.',
    'Giải thích được vì sao chiếu sáng phải tính ở không gian tuyến tính.',
    'Trả lời được "vì sao demo của em trông bợt hơn demo trên mạng".',
    'Biết `toneMappingExposure` dùng để làm gì.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 500 }),
};
