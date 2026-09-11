import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);

const camera = new THREE.PerspectiveCamera(
  50, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(0, 0, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 4, 5);
scene.add(light);

// ---- Lưới 5×5 khối hộp ----
const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
const NORMAL = 0x3a4756;
const HOVER = 0x0c8ce9;

const cubes = [];
for (let y = 0; y < 5; y++) {
  for (let x = 0; x < 5; x++) {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: NORMAL, roughness: 0.5 })
    );
    mesh.position.set((x - 2) * 1.15, (y - 2) * 1.15, 0);
    mesh.name = 'cube_' + x + '_' + y;
    scene.add(mesh);
    cubes.push(mesh);
  }
}

// Ba khối xếp thẳng hàng theo trục z — để quan sát mảng kết quả đã sắp xếp
[0, -2, -4].forEach((z, i) => {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: 0x9149f5, roughness: 0.5 })
  );
  mesh.position.set(3.6, 0, z);
  mesh.name = 'xepChong_' + i;
  scene.add(mesh);
  cubes.push(mesh);
});

// ---- Raycasting thủ công ----
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

// THỬ ĐỔI: đặt false để dùng window thay cho getBoundingClientRect()
const dungBoundingRect = true;

// THỬ ĐỔI: 0 = vật gần nhất, 1 hoặc 2 = vật phía sau
const chiSoKetQua = 0;

function onPointerMove(event) {
  if (dungBoundingRect) {
    // ĐÚNG: quy đổi theo vị trí và kích thước THẬT của canvas
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  } else {
    // SAI khi canvas không nằm ở góc trên trái và không phủ toàn màn hình
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // Vì sao * 2 - 1: (clientX / width) cho khoảng 0..1, nhân 2 thành 0..2,
  //   trừ 1 thành -1..1 — đúng khoảng NDC mà WebGL dùng.
  // Vì sao đảo dấu y: trong DOM, y tăng khi đi XUỐNG. Trong NDC, y tăng khi
  //   đi LÊN. Không đảo dấu thì mọi thứ bị lật theo chiều dọc.
}

renderer.domElement.addEventListener('pointermove', onPointerMove);

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;' +
  'color:#a3a3a3;line-height:1.7';
document.body.appendChild(hud);

let frameId;
let lastLog = 0;

function tick() {
  frameId = requestAnimationFrame(tick);

  // setFromCamera dựng một tia từ camera đi qua điểm NDC vào chiều sâu scene
  raycaster.setFromCamera(pointer, camera);

  // Tham số thứ hai = true để duyệt cả cây con. Ở đây mảng phẳng nên không cần,
  // nhưng với model glTF thì BẮT BUỘC, vì mesh nằm sâu trong các Group.
  const intersects = raycaster.intersectObjects(cubes, false);

  // Mảng kết quả ĐÃ được sắp xếp theo distance tăng dần.
  const hit = intersects[chiSoKetQua];

  if (hovered && hovered !== hit?.object) {
    hovered.material.color.setHex(
      hovered.name.startsWith('xepChong') ? 0x9149f5 : NORMAL
    );
    hovered = null;
  }

  if (hit) {
    hovered = hit.object;
    hovered.material.color.setHex(HOVER);
  }

  document.body.style.cursor = hit ? 'pointer' : 'default';

  const now = performance.now();
  if (now - lastLog > 120) {
    lastLog = now;
    hud.innerHTML =
      'NDC: (' + pointer.x.toFixed(2) + ', ' + pointer.y.toFixed(2) + ')<br>' +
      'số vật thể tia cắt qua: ' + intersects.length + '<br>' +
      'đang chọn intersects[' + chiSoKetQua + ']: ' +
      (hit ? hit.object.name + ' — cách ' + hit.distance.toFixed(2) : 'không có');
  }

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  renderer.domElement.removeEventListener('pointermove', onPointerMove);
  geometry.dispose();
  cubes.forEach((c) => c.material.dispose());
  renderer.dispose();
}
`;

export const LESSON_4_1: LessonContent = {
  id: '4-1',

  goal: 'Viết lại được công thức chuyển pixel sang NDC từ đầu mà không cần tra, và giải thích được raycasting hoạt động ra sao.',

  lecture: [
    'Bài toán rất cụ thể: người dùng bấm chuột tại một điểm trên màn hình, toạ độ đó là pixel hai chiều. Bạn cần biết họ vừa bấm vào vật thể nào trong không gian ba chiều. Đây là nền tảng của mọi tương tác 3D — chọn sản phẩm, kéo thả, tooltip.',

    'Cách giải quyết gọi là **raycasting**: bắn một tia từ camera đi qua điểm chuột vào chiều sâu scene, rồi kiểm tra tia đó cắt qua những vật thể nào. Three.js làm phần tính giao điểm, còn bạn phải cung cấp toạ độ chuột ở đúng hệ quy chiếu.',

    'Hệ quy chiếu đó là **NDC** — Normalized Device Coordinates, khoảng từ −1 đến 1 theo cả hai trục, gốc ở tâm màn hình. Công thức chuyển đổi có hai chi tiết cần hiểu chứ không nên học vẹt. Phần `* 2 - 1` biến khoảng 0..1 thành −1..1. Phần đảo dấu trục y là vì DOM đếm y tăng dần khi **đi xuống**, còn NDC đếm y tăng dần khi **đi lên**. Quên đảo dấu thì mọi tương tác bị lật theo chiều dọc — một lỗi rất dễ nhận ra nhưng cũng rất dễ mắc.',

    'Chi tiết thứ ba, và là lỗi phổ biến nhất trong dự án thật: phải quy đổi theo `getBoundingClientRect()` của canvas, **không phải** `window.innerWidth`. Chừng nào canvas còn phủ kín màn hình thì hai cách cho kết quả như nhau, nên lỗi này ẩn mình rất lâu — cho tới ngày bạn đặt canvas vào một khung nhỏ và mọi thứ lệch đi. Sandbox có cờ để bạn thấy sự khác biệt.',

    'Cuối cùng là hiệu năng. Raycasting phải kiểm tra tia với hình học của từng vật thể ứng viên. Với vài chục khối thì miễn phí; với vài trăm model chi tiết thì làm mỗi khung hình sẽ giết chết FPS. Nguyên tắc: chỉ raycast khi có sự kiện chuột, hoặc điều tiết tần suất.',
  ],

  concepts: [
    {
      term: 'NDC',
      explain:
        'Normalized Device Coordinates: hệ toạ độ chuẩn hoá về khoảng −1 đến 1, gốc ở tâm khung nhìn. Đây là hệ mà `setFromCamera()` mong đợi.',
    },
    {
      term: 'Công thức chuyển đổi',
      explain:
        '`x = (px / width) * 2 - 1` và `y = -(py / height) * 2 + 1`. Nhân 2 trừ 1 để đổi khoảng; đảo dấu y vì DOM và NDC ngược chiều trục dọc.',
    },
    {
      term: 'raycaster.setFromCamera()',
      explain:
        'Dựng tia từ camera đi qua điểm NDC. Với `PerspectiveCamera` tia xuất phát từ vị trí camera; với `OrthographicCamera` tia song song với hướng nhìn.',
    },
    {
      term: 'intersectObjects()',
      explain:
        'Trả về mảng giao điểm **đã sắp xếp theo `distance` tăng dần**, nên phần tử `[0]` luôn là vật gần nhất. Tham số thứ hai `recursive` phải là `true` khi vật thể nằm trong `Group`.',
    },
    {
      term: 'getBoundingClientRect()',
      explain:
        'Lấy vị trí và kích thước thật của canvas trong trang. Luôn dùng nó thay cho `window.innerWidth` — nếu không, tương tác sẽ lệch khi canvas không phủ toàn màn hình.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo lưới 5×5 khối hộp và một cụm ba khối xếp chồng theo trục z.',
      why: 'Cụm xếp chồng là để quan sát mảng kết quả nhiều phần tử và thứ tự sắp xếp của nó.',
    },
    {
      action: 'Bắt `pointermove` **trên canvas**, không phải trên `window`.',
      why: 'Gắn đúng phần tử giúp sự kiện không kích hoạt khi chuột ở ngoài vùng 3D.',
    },
    {
      action: 'Tự tay viết công thức chuyển sang NDC, dùng `getBoundingClientRect()`.',
      why: 'Hãy viết từ đầu chứ đừng chép. Bạn cần giải thích được từng thành phần khi phỏng vấn.',
    },
    {
      action: 'Gọi `setFromCamera(pointer, camera)` rồi `intersectObjects(cubes)`.',
      why: 'Thứ tự này quan trọng: phải dựng tia trước khi tính giao.',
    },
    {
      action: 'Đổi màu vật thể đang trỏ vào, và nhớ trả lại màu cũ khi rời đi.',
      why: 'Phần "trả lại" hay bị quên, để lại vệt màu trên mọi vật thể chuột từng đi qua.',
    },
    {
      action: '`console.log(intersects[0])` và xem các trường `distance`, `point`, `face`, `object`, `uv`.',
      why: '`point` cho toạ độ va chạm chính xác — dùng để đặt hiệu ứng; `uv` cho toạ độ texture — dùng để vẽ lên bề mặt.',
    },
  ],

  observations: [
    {
      change: 'Đổi `chiSoKetQua` từ `0` thành `1` rồi `2`, di chuột lên cụm ba khối tím.',
      observe: 'Khối được tô sáng lùi dần ra phía sau.',
      why: 'Tia cắt qua cả ba khối, và `intersectObjects` trả về **toàn bộ** giao điểm đã sắp xếp theo khoảng cách tăng dần. Phần tử `[0]` là vật gần camera nhất — gần như luôn là thứ người dùng có ý định bấm vào. Các phần tử sau hữu ích trong trường hợp đặc biệt, ví dụ bắn xuyên vật thể hoặc bỏ qua lớp kính phía trước.',
    },
    {
      change: 'Đổi `dungBoundingRect` thành `false`.',
      observe: 'Trong sandbox này gần như không đổi, vì canvas đang phủ kín khung.',
      why: 'Và đó chính xác là lý do lỗi này nguy hiểm. Khi canvas phủ toàn màn hình, `window.innerWidth` bằng `rect.width` và `rect.left` bằng 0, nên hai công thức trùng nhau. Lỗi chỉ lộ ra khi bạn đặt canvas vào một khung có lề, có thanh bên, hoặc nằm giữa trang — lúc đó toạ độ lệch đi đúng bằng khoảng cách từ góc trái trên của trang tới canvas.',
    },
    {
      change: 'Xoá dấu trừ trong công thức tính `pointer.y`.',
      observe: 'Vật thể được tô sáng nằm đối xứng qua trục ngang so với vị trí chuột.',
      why: 'DOM lấy gốc toạ độ ở góc trái **trên** và tăng y khi đi xuống. NDC lấy gốc ở **tâm** và tăng y khi đi lên. Dấu trừ chính là phép lật trục đó. Đây là lỗi dễ nhận ra nhất trong nhóm lỗi raycasting, vì triệu chứng rất đặc trưng.',
    },
    {
      change: 'Chuyển lời gọi raycast từ vòng lặp animation sang bên trong hàm `onPointerMove`.',
      observe: 'Với scene này khác biệt không rõ, nhưng với vài trăm vật thể chi tiết thì FPS cải thiện đáng kể.',
      why: 'Raycasting kiểm tra tia với hình học của từng ứng viên — chi phí tỉ lệ với số vật thể và độ phức tạp của chúng. Làm mỗi khung hình nghĩa là trả giá đó 60 lần mỗi giây, kể cả khi chuột đứng yên. Chuột chỉ tạo ra vài chục sự kiện mỗi giây và chỉ khi thực sự di chuyển. Với scene lớn, người ta còn dùng hình học đơn giản hoá làm ứng viên raycast thay vì model chi tiết.',
    },
  ],

  interview: [
    {
      q: 'Raycasting hoạt động thế nào?',
      a: 'Toạ độ chuột được chuyển từ pixel sang NDC, khoảng −1 đến 1 với gốc ở tâm khung nhìn. Từ điểm đó, `setFromCamera` dựng một tia trong không gian thế giới: với camera phối cảnh, tia đi từ vị trí camera qua điểm đó trên mặt phẳng chiếu. Sau đó `intersectObjects` kiểm tra giao cắt giữa tia và hình học của từng vật thể ứng viên — thực tế nó lọc sơ bộ bằng hộp bao trước rồi mới kiểm tra từng tam giác. Kết quả trả về đã sắp xếp theo khoảng cách nên phần tử đầu là vật gần nhất.',
    },
    {
      q: 'Viết công thức chuyển pixel sang NDC và giải thích từng phần.',
      a: '`x = (clientX - rect.left) / rect.width * 2 - 1` và `y = -((clientY - rect.top) / rect.height) * 2 + 1`. Trừ `rect.left`/`rect.top` để quy về toạ độ tương đối với canvas thay vì với trang. Chia cho kích thước để chuẩn hoá về 0..1. Nhân 2 trừ 1 để đổi sang −1..1. Và đảo dấu y vì DOM tăng y khi đi xuống còn NDC tăng y khi đi lên.',
    },
    {
      q: 'Tối ưu raycasting cho scene lớn thế nào?',
      a: 'Trước hết là chỉ raycast khi cần — theo sự kiện chuột thay vì mỗi khung hình, và điều tiết tần suất nếu sự kiện quá dày. Thứ hai là thu hẹp danh sách ứng viên: truyền mảng cụ thể thay vì cả `scene.children`, và loại bỏ những thứ không tương tác được. Thứ ba là dùng hình học thay thế đơn giản — một hộp hoặc cầu vô hình bọc quanh model chi tiết — vì chi phí kiểm tra tỉ lệ với số tam giác. Với số lượng rất lớn thì cần cấu trúc phân vùng không gian như BVH, có thư viện `three-mesh-bvh` hỗ trợ.',
    },
    {
      q: 'Vì sao phải dùng `getBoundingClientRect()` thay cho `window.innerWidth`?',
      a: 'Vì công thức NDC cần toạ độ tương đối với **canvas**, không phải với cửa sổ. Khi canvas phủ toàn màn hình thì hai cách trùng nhau, nên lỗi này ẩn rất lâu. Nhưng ngay khi canvas có lề, nằm trong bố cục có thanh bên, hoặc trang cuộn được, toạ độ sẽ lệch đúng bằng khoảng cách từ góc trang tới canvas. Dùng `getBoundingClientRect()` thì đúng trong mọi trường hợp.',
    },
  ],

  checkpoints: [
    'Viết lại được công thức NDC từ đầu, giải thích được `* 2 - 1` và dấu trừ ở y.',
    'Biết `intersects` đã sắp xếp theo khoảng cách và `[0]` là gì.',
    'Dùng `getBoundingClientRect()` chứ không dùng `window.innerWidth`.',
    'Biết vì sao không nên raycast mỗi khung hình.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 500 }),
};
