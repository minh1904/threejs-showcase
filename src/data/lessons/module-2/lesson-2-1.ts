import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(0, 2.5, 11);
camera.lookAt(0, 0.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Mặt sàn để thấy vật thể "đứng" ở đâu
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.3;
scene.add(floor);

// ---- Năm vật thể giống hệt nhau, khác mỗi material ----
const geometry = new THREE.TorusKnotGeometry(0.62, 0.2, 128, 24);

const materials = [
  ['Basic', new THREE.MeshBasicMaterial({ color: 0x0c8ce9 })],
  ['Lambert', new THREE.MeshLambertMaterial({ color: 0x0c8ce9 })],
  ['Phong', new THREE.MeshPhongMaterial({ color: 0x0c8ce9, shininess: 80 })],
  ['Standard', new THREE.MeshStandardMaterial({ color: 0x0c8ce9, roughness: 0.35, metalness: 0.6 })],
  ['Physical', new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0,
    transmission: 1,   // độ truyền sáng -> làm ra thuỷ tinh
    thickness: 0.8,    // độ dày -> quyết định mức khúc xạ
    ior: 1.5,          // chiết suất, 1.5 xấp xỉ thuỷ tinh thật
  })],
];

materials.forEach(([name, material], i) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = (i - 2) * 2.4;
  scene.add(mesh);
  console.log(i, name, '->', material.type);
});

// ---- CHỈ MỘT nguồn sáng ----
// Thử comment hai dòng dưới đây: chỉ còn bản Basic là nhìn thấy được.
const light = new THREE.DirectionalLight(0xffffff, 2.4);
light.position.set(3, 5, 4);
scene.add(light);

// Một chút ambient để mặt tối không đen tuyệt đối
const ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);

const label = document.createElement('div');
label.style.cssText =
  'position:fixed;bottom:14px;left:0;right:0;display:flex;justify-content:space-around;' +
  'font:11px ui-monospace,monospace;color:#a3a3a3;pointer-events:none';
label.innerHTML = materials.map(([n]) => '<span>' + n + '</span>').join('');
document.body.appendChild(label);

const clock = new THREE.Clock();
let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  const delta = clock.getDelta();

  scene.children.forEach((child) => {
    if (child.isMesh && child !== floor) child.rotation.y += 0.4 * delta;
  });

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  geometry.dispose();
  materials.forEach(([, m]) => m.dispose());
  renderer.dispose();
}
`;

export const LESSON_2_1: LessonContent = {
  id: '2-1',

  goal: 'Nhìn một vật thể đã render và đoán được nó dùng material nào, đồng thời giải thích được `roughness` khác `metalness` ở chỗ nào bằng lời của mình.',

  lecture: [
    'Material trả lời câu hỏi: bề mặt này phản ứng với ánh sáng như thế nào? Three.js cho bạn khoảng chục lựa chọn, nhưng thực tế chỉ cần nắm vững ba nhóm là đủ dùng cho hầu hết dự án.',

    'Nhóm thứ nhất là `MeshBasicMaterial` — **hoàn toàn không quan tâm tới ánh sáng**. Bạn đặt màu gì thì nó hiện đúng màu đó, phẳng lì. Nghe có vẻ vô dụng nhưng lại rất hay dùng: giao diện trong không gian 3D, đường kẻ hỗ trợ, vật thể phát sáng, và mọi lúc bạn cần debug mà không muốn ánh sáng làm nhiễu.',

    'Nhóm thứ hai là `MeshLambertMaterial` và `MeshPhongMaterial` — hai mô hình chiếu sáng ra đời trước kỷ nguyên PBR. Chúng rẻ và vẫn có chỗ dùng trên thiết bị yếu, nhưng tham số của chúng (`shininess`, `specular`) không tương ứng với đại lượng vật lý nào cả, nên chỉnh bằng cảm tính.',

    'Nhóm thứ ba — và là nhóm bạn sẽ dùng 90% thời gian — là `MeshStandardMaterial`, chuẩn PBR của ngành. Nó chỉ có hai núm chính: `roughness` (nhám hay bóng) và `metalness` (kim loại hay phi kim). Hai con số này mô tả được gần như mọi vật liệu thật, và quan trọng hơn: chúng khớp với quy ước mà Blender, Substance, Unreal đều dùng, nên texture tải từ đâu về cũng ráp vào được. `MeshPhysicalMaterial` mở rộng thêm cho kính, sơn phủ bóng, màng cầu vồng — đẹp nhưng đắt.',

    'Cuối cùng, đây là lỗi bạn sẽ gặp và cũng là câu hỏi phỏng vấn kinh điển: **"vì sao vật thể của em đen thui?"**. Gần như luôn là do dùng `MeshStandardMaterial` mà quên thêm đèn. Hãy thử comment hai dòng đèn trong sandbox để thấy điều đó.',
  ],

  concepts: [
    {
      term: 'MeshBasicMaterial',
      explain:
        'Không tính chiếu sáng. Luôn hiện đúng màu đã đặt. Rẻ nhất, dùng cho UI trong 3D, đường hỗ trợ, vật phát sáng và debug.',
    },
    {
      term: 'MeshStandardMaterial',
      explain:
        'Chuẩn PBR. Hai tham số chính: `roughness` từ 0 (gương) tới 1 (nhám hoàn toàn), và `metalness` từ 0 (phi kim) tới 1 (kim loại). Đây là material mặc định nên chọn.',
    },
    {
      term: 'roughness vs metalness',
      explain:
        '`roughness` quyết định phản xạ **sắc nét hay bị tán**. `metalness` quyết định **màu của phản xạ**: phi kim phản xạ ánh sáng trắng và giữ màu riêng, kim loại nhuộm màu chính nó vào phản xạ và gần như không có màu khuếch tán.',
    },
    {
      term: 'MeshPhysicalMaterial',
      explain:
        'Mở rộng Standard với `transmission` (kính trong suốt), `clearcoat` (lớp sơn phủ bóng), `iridescence` (màng cầu vồng), `ior` (chiết suất). Đẹp hơn nhưng shader nặng hơn rõ rệt.',
    },
    {
      term: 'MeshNormalMaterial',
      explain:
        'Tô màu theo hướng pháp tuyến bề mặt. Không dùng cho sản phẩm nhưng cực kỳ hữu ích để kiểm tra normal có bị lật ngược hay không.',
    },
  ],

  walkthrough: [
    {
      action: 'Dựng mặt sàn bằng `PlaneGeometry` xoay ngang, và một `TorusKnotGeometry` làm vật thể chính.',
      why: 'Nút xuyến có cả mặt cong lồi lẫn lõm nên phản xạ ánh sáng phong phú — nhìn ra khác biệt giữa các material dễ hơn hình cầu.',
    },
    {
      action: 'Nhân bản vật thể thành năm, mỗi bản một material khác nhau.',
      why: 'Đặt cạnh nhau dưới **cùng một nguồn sáng** là cách duy nhất so sánh công bằng.',
    },
    {
      action: 'Thêm đúng **một** `DirectionalLight`.',
      why: 'Một đèn giúp thấy rõ hướng sáng và vùng tối. Nhiều đèn làm mọi material trông na ná nhau.',
    },
    {
      action:
        'Với bản `Standard`, thử bốn tổ hợp: `(roughness 0, metalness 0)`, `(0, 1)`, `(1, 0)`, `(1, 1)`.',
      why: 'Bốn góc này là bản đồ của toàn bộ không gian PBR. Nắm được chúng thì mọi giá trị ở giữa đều suy ra được.',
    },
    {
      action: 'Với bản `Physical`, đặt `transmission = 1`, `thickness = 0.8`, `ior = 1.5`.',
      why: '`ior` 1.5 là chiết suất của thuỷ tinh thật. `thickness` quyết định mức bẻ cong tia sáng — để 0 thì trông như nhựa mỏng.',
    },
    {
      action: 'Comment hai dòng tạo đèn rồi chạy lại.',
      why: 'Đây là bước bắt buộc phải làm một lần trong đời để không bao giờ quên.',
    },
  ],

  observations: [
    {
      change: 'Comment cả `DirectionalLight` lẫn `AmbientLight`.',
      observe: 'Chỉ còn vật thể `Basic` hiện ra; bốn cái còn lại đen tuyền.',
      why: 'Đây chính là câu trả lời cho "vì sao vật thể của em đen thui". `Lambert`, `Phong`, `Standard`, `Physical` đều tính màu bằng cách lấy ánh sáng chiếu tới nhân với thuộc tính bề mặt. Không có ánh sáng thì phép nhân cho ra 0. `MeshBasicMaterial` bỏ qua toàn bộ bước đó nên vẫn hiện.',
    },
    {
      change: 'Với bản `Standard`, đặt `metalness = 1` và `roughness = 0`.',
      observe: 'Vật thể trở thành gương nhưng phản chiếu gần như toàn màu đen.',
      why: 'Kim loại **không có màu khuếch tán** — toàn bộ hình ảnh của nó là phản xạ môi trường xung quanh. Scene này chưa có environment map nên chẳng có gì để phản chiếu ngoài nền đen. Đây chính là lý do bài 2.5 về HDRI tồn tại: vật liệu kim loại gần như vô dụng nếu thiếu môi trường phản xạ.',
    },
    {
      change: 'Vẫn bản `Standard`, giữ `metalness = 0` và kéo `roughness` từ 0 lên 1.',
      observe: 'Điểm sáng chói (highlight) từ một chấm nhỏ sắc nét loang dần thành một vùng mờ rộng.',
      why: '`roughness` mô tả độ gồ ghề ở cấp vi mô. Bề mặt nhẵn phản xạ mọi tia theo cùng một hướng nên cho điểm sáng gọn; bề mặt nhám tán tia ra nhiều hướng nên năng lượng trải rộng và mờ đi. Tổng năng lượng không đổi — chỉ là phân bố khác.',
    },
    {
      change: 'Với bản `Physical`, hạ `thickness` từ `0.8` xuống `0`.',
      observe: 'Vật thể vẫn trong suốt nhưng mất hẳn cảm giác khối, trông như màng nhựa mỏng.',
      why: '`transmission` cho ánh sáng đi xuyên qua, nhưng `thickness` mới là thứ nói cho shader biết phải bẻ cong tia bao nhiêu bên trong khối. Không có độ dày thì không có khúc xạ, và mắt người đọc ngay ra đó không phải thuỷ tinh.',
    },
  ],

  interview: [
    {
      q: 'Vì sao vật thể hiện ra màu đen?',
      a: 'Nguyên nhân phổ biến nhất là dùng material có tính chiếu sáng — `MeshStandardMaterial`, `Lambert`, `Phong` — trong scene chưa có đèn nào. Các material này tính màu từ ánh sáng chiếu tới, không có ánh sáng thì kết quả bằng 0. Cách kiểm tra nhanh: tạm đổi sang `MeshBasicMaterial`, nếu vật thể hiện ra thì vấn đề nằm ở ánh sáng chứ không phải ở geometry hay vị trí camera.',
    },
    {
      q: '`roughness` và `metalness` khác nhau thế nào?',
      a: '`roughness` điều khiển độ **sắc nét** của phản xạ: 0 cho gương, 1 cho bề mặt tán hoàn toàn. `metalness` điều khiển **bản chất** của phản xạ: vật phi kim giữ màu khuếch tán riêng và phản xạ ánh sáng trắng, còn kim loại gần như không có màu khuếch tán mà nhuộm màu của chính nó vào phản xạ. Hệ quả thực tế: `metalness = 1` mà không có environment map thì vật thể sẽ tối đen vì chẳng có gì để phản chiếu.',
    },
    {
      q: 'Khi nào chọn `MeshPhysicalMaterial` thay cho `MeshStandardMaterial`?',
      a: 'Khi cần hiệu ứng mà Standard không có: kính trong suốt qua `transmission`, lớp sơn phủ bóng của ô tô qua `clearcoat`, màng cầu vồng như bong bóng xà phòng qua `iridescence`. Đổi lại shader nặng hơn đáng kể, đặc biệt `transmission` vì nó cần render lại cảnh phía sau vật thể. Nguyên tắc là dùng Standard làm mặc định và chỉ nâng cấp cho đúng những vật thể thật sự cần.',
    },
    {
      q: '`MeshBasicMaterial` còn dùng làm gì trong dự án thật?',
      a: 'Nhiều hơn ta tưởng: nhãn và giao diện đặt trong không gian 3D, đường kẻ và lưới hỗ trợ, vật thể phát sáng kết hợp với bloom ở khâu hậu kỳ, bầu trời dạng skybox, và các phần tử cần giữ đúng màu thương hiệu bất kể ánh sáng. Nó cũng là material rẻ nhất nên hay được dùng cho những vật thể ở rất xa nơi mắt không phân biệt được chi tiết chiếu sáng.',
    },
  ],

  checkpoints: [
    'Nhìn một vật thể render ra, đoán được nó dùng material nào.',
    'Giải thích được `roughness` khác `metalness` bằng lời của mình.',
    'Biết ngay phải kiểm tra gì khi vật thể ra màu đen.',
    'Làm được vật liệu thuỷ tinh bằng `transmission` + `thickness` + `ior`.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 500 }),
};
