import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// ---- Hai camera cùng nhìn một scene để so sánh trực tiếp ----
const aspect = container.clientWidth / container.clientHeight;

const perspective = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
perspective.position.set(4, 3, 6);

// Orthographic nhận 6 mặt phẳng chứ không nhận fov: không có phối cảnh,
// vật ở xa và ở gần cùng kích thước. frustum là hình HỘP, không phải chóp cụt.
const frustumSize = 6;
const orthographic = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  100
);
orthographic.position.set(4, 3, 6);

let camera = perspective;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// enableDamping tạo quán tính khi thả chuột. Bật nó thì BẮT BUỘC gọi
// controls.update() mỗi frame — damping cần được nội suy dần từng bước.
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Ba khối đặt lệch chiều sâu — để thấy rõ khác biệt giữa hai loại camera
const box = new THREE.BoxGeometry(1, 1, 1);
[-3, 0, 3].forEach((z, i) => {
  const mesh = new THREE.Mesh(
    box,
    new THREE.MeshBasicMaterial({
      color: [0xea733a, 0x0c8ce9, 0x9149f5][i],
      wireframe: false,
    })
  );
  mesh.position.set(i - 1, 0, z);
  scene.add(mesh);
});

const grid = new THREE.GridHelper(12, 12, 0x333333, 0x1f1f1f);
scene.add(grid);

// Nút chuyển camera
const button = document.createElement('button');
button.style.cssText =
  'position:fixed;top:12px;left:12px;padding:6px 10px;border-radius:6px;' +
  'border:1px solid #333;background:#111;color:#e5e5e5;' +
  'font:11px ui-monospace,monospace;cursor:pointer';
document.body.appendChild(button);

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

function syncLabel() {
  button.textContent =
    camera === perspective ? 'Đang dùng: Perspective →' : 'Đang dùng: Orthographic →';
}

button.addEventListener('click', () => {
  camera = camera === perspective ? orthographic : perspective;

  // OrbitControls gắn với MỘT camera cụ thể, nên đổi camera phải dựng lại.
  controls.dispose();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  syncLabel();
});

syncLabel();

const clock = new THREE.Clock();
let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  clock.getDelta();

  // Thiếu dòng này, damping không có gì để nội suy -> kéo chuột thấy giật cục
  controls.update();

  hud.textContent =
    'dpr thiết bị: ' + window.devicePixelRatio +
    '   |   dpr đang dùng: ' + renderer.getPixelRatio() +
    '   |   kéo chuột để xoay, cuộn để zoom';

  renderer.render(scene, camera);
}

tick();

// ---- Resize: BA bước, đúng thứ tự ----
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  const a = w / h;

  if (camera === perspective) {
    camera.aspect = a;
  } else {
    camera.left = (-frustumSize * a) / 2;
    camera.right = (frustumSize * a) / 2;
  }

  // BƯỚC HAY BỊ QUÊN NHẤT. Thiếu nó, ma trận chiếu vẫn giữ tỉ lệ cũ -> ảnh méo.
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
}

window.addEventListener('resize', onResize);

export function dispose() {
  cancelAnimationFrame(frameId);
  window.removeEventListener('resize', onResize);
  controls.dispose(); // OrbitControls gắn listener lên DOM — phải gỡ
  box.dispose();
  renderer.dispose();
}
`;

export const LESSON_1_5: LessonContent = {
  id: '1-5',

  goal: 'Cho người dùng xoay/zoom được góc nhìn, và xử lý resize sao cho hình không bao giờ méo.',

  lecture: [
    'Scene của bạn tới giờ vẫn đứng yên một góc. Bài này thêm hai thứ người dùng thật sự mong đợi: khả năng xoay quanh vật thể, và giao diện không vỡ khi đổi kích thước cửa sổ hay xoay ngang điện thoại.',

    '`OrbitControls` không nằm trong gói lõi mà ở thư mục addons — `three/addons/controls/OrbitControls.js`. Đây là chủ ý của Three.js: giữ phần lõi gọn, mọi tiện ích nằm ngoài. Cũng vì thế mà controls không tự hoạt động, bạn phải chủ động gọi `controls.update()` mỗi frame khi bật damping.',

    'Phần resize nhìn thì tầm thường nhưng lại là lỗi phổ biến nhất của người mới. Có đúng **ba** bước và chúng phải theo thứ tự: cập nhật `camera.aspect`, gọi `camera.updateProjectionMatrix()`, rồi `renderer.setSize()`. Bước giữa là bước hay bị bỏ sót nhất, và triệu chứng của nó — hình bị kéo dãn — trông giống lỗi CSS nên rất dễ đi tìm sai chỗ.',

    'Cuối bài có một nút chuyển giữa `PerspectiveCamera` và `OrthographicCamera` trên cùng một scene. Hãy bấm qua lại vài lần. Perspective mô phỏng mắt người: xa thì nhỏ. Orthographic bỏ hẳn phối cảnh: xa gần cùng cỡ — đúng thứ bạn cần cho bản vẽ kỹ thuật, game isometric, hay giao diện cấu hình sản phẩm.',
  ],

  concepts: [
    {
      term: 'OrbitControls',
      explain:
        'Nằm ở `three/addons/`, không có trong gói lõi. Gắn listener chuột/cảm ứng lên `renderer.domElement` để xoay, pan, zoom quanh một điểm ngắm.',
    },
    {
      term: 'enableDamping',
      explain:
        'Thêm quán tính khiến chuyển động dừng mượt thay vì khựng lại. Bật nó thì **bắt buộc** gọi `controls.update()` mỗi frame, vì damping là quá trình nội suy dần theo từng bước.',
    },
    {
      term: 'updateProjectionMatrix()',
      explain:
        'Tính lại ma trận chiếu từ các tham số camera. Three.js không tự làm vì đây là phép tính không nên chạy mỗi frame. Đổi `fov`, `aspect`, `near`, `far`, `zoom` — đều phải gọi lại.',
    },
    {
      term: 'OrthographicCamera',
      explain:
        'Nhận sáu mặt phẳng `left/right/top/bottom/near/far` thay vì `fov`. Frustum là khối hộp nên không có phối cảnh: vật ở xa không nhỏ đi. Dùng cho bản vẽ kỹ thuật, isometric, minimap.',
    },
    {
      term: 'setPixelRatio()',
      explain:
        'Quyết định mật độ pixel thật của canvas. Chặn trần bằng `Math.min(devicePixelRatio, 2)` vì khối lượng vẽ tăng theo bình phương giá trị này.',
    },
  ],

  walkthrough: [
    {
      action: 'Import `OrbitControls` từ `three/addons/controls/OrbitControls.js`.',
      why: 'Sai đường dẫn import là lỗi hay gặp. Nó không nằm trong `three` gốc.',
    },
    {
      action: 'Khởi tạo với `renderer.domElement` làm phần tử nhận sự kiện, bật `enableDamping`.',
      why: 'Truyền đúng canvas chứ không phải `document` — nếu không, controls sẽ nuốt cả thao tác chuột ở phần giao diện khác.',
    },
    {
      action: 'Gọi `controls.update()` trong vòng lặp animation.',
      why: 'Damping cần được nội suy từng frame. Không gọi thì mỗi lần kéo chuột là một bước nhảy rời rạc.',
    },
    {
      action: 'Viết hàm resize đủ ba bước, đúng thứ tự.',
      why: 'Với `OrthographicCamera` thì cập nhật `left/right` thay cho `aspect`, nhưng vẫn phải gọi `updateProjectionMatrix()`.',
    },
    {
      action: 'Thêm nút chuyển giữa hai loại camera.',
      why: 'Cần dựng lại `OrbitControls` sau khi đổi, vì nó gắn cứng với một camera cụ thể lúc khởi tạo. Nhớ `controls.dispose()` bản cũ trước.',
    },
    {
      action: 'Trong cleanup, gọi `controls.dispose()` và gỡ listener resize.',
      why: '`OrbitControls` đăng ký nhiều listener trên DOM. Không dispose là để lại chúng cùng tham chiếu tới camera.',
    },
  ],

  observations: [
    {
      change: 'Xoá dòng `controls.update()` trong vòng lặp.',
      observe: 'Kéo chuột vẫn xoay được, nhưng thả tay ra là dừng phắt, cảm giác rẻ tiền và giật.',
      why: 'Với `enableDamping`, `OrbitControls` chỉ ghi nhận vận tốc mong muốn; việc tiến dần tới đó xảy ra bên trong `update()`. Không gọi thì không có bước nội suy nào — góc quay nhảy thẳng tới giá trị cuối.',
    },
    {
      change: 'Xoá riêng dòng `camera.updateProjectionMatrix()` rồi kéo hẹp cửa sổ trình duyệt lại.',
      observe: 'Hình bị kéo dãn méo mó, hình vuông thành hình chữ nhật.',
      why: 'Bạn đã gán giá trị mới cho `camera.aspect`, nhưng ma trận chiếu — thứ GPU thật sự dùng — vẫn giữ tỉ lệ cũ. Three.js không tự động tính lại vì đó là phép nhân ma trận không đáng chạy mỗi frame. Triệu chứng này rất dễ bị nhầm sang lỗi CSS, nên khi thấy ảnh méo hãy kiểm tra dòng này trước tiên.',
    },
    {
      change: 'Bấm nút chuyển sang `OrthographicCamera`, chú ý ba khối hộp đặt lệch chiều sâu.',
      observe: 'Ba khối trở thành cùng kích thước, các đường song song không còn hội tụ.',
      why: 'Frustum của orthographic là khối hộp chứ không phải chóp cụt, nên khoảng cách không ảnh hưởng kích thước hiển thị. Đó là lý do bản vẽ kỹ thuật dùng nó — đo trên hình ra đúng tỉ lệ thật. Đổi lại, mắt người mất hoàn toàn tín hiệu chiều sâu.',
    },
    {
      change:
        'Đổi `setPixelRatio(Math.min(window.devicePixelRatio, 2))` thành `setPixelRatio(window.devicePixelRatio)` rồi so sánh chỉ số ở thanh HUD.',
      observe: 'Trên màn hình DPR cao, hình nét hơn một chút nhưng FPS tụt.',
      why: 'Số pixel phải tô tăng theo bình phương DPR: từ 2 lên 3 là gấp 2,25 lần khối lượng fragment shader. Trên desktop mạnh có thể không thấy gì, nhưng trên điện thoại thì đây thường là nguyên nhân số một khiến scene tụt xuống dưới 30fps.',
    },
  ],

  interview: [
    {
      q: 'Ba bước cần làm khi resize là gì, theo đúng thứ tự?',
      a: 'Một: cập nhật `camera.aspect` theo tỉ lệ mới. Hai: gọi `camera.updateProjectionMatrix()`. Ba: `renderer.setSize(width, height)`. Bỏ bước hai là lỗi phổ biến nhất — hình sẽ méo vì ma trận chiếu vẫn mang tỉ lệ cũ. Với `OrthographicCamera` thì bước một là cập nhật `left/right/top/bottom`.',
    },
    {
      q: 'Khi nào dùng `OrthographicCamera` thay cho `PerspectiveCamera`?',
      a: 'Khi không muốn phối cảnh làm sai lệch kích thước: bản vẽ kỹ thuật, game isometric, minimap, sơ đồ kiến trúc, hoặc giao diện cấu hình sản phẩm cần so sánh kích thước chính xác. Perspective mô phỏng mắt người nên hợp với hầu hết cảnh 3D thông thường.',
    },
    {
      q: 'Vì sao bật `enableDamping` thì phải gọi `controls.update()` mỗi frame?',
      a: 'Vì damping là nội suy theo thời gian: mỗi lần gọi `update()` đưa góc quay tiến thêm một phần về phía đích. Sự kiện chuột chỉ đặt ra mục tiêu, còn chuyển động mượt tới mục tiêu đó phải được thúc đẩy từng frame. Không gọi thì không có nội suy nào diễn ra.',
    },
    {
      q: 'Vì sao chặn pixel ratio ở 2 mà không phải giá trị khác?',
      a: 'Vì khối lượng vẽ tăng theo bình phương DPR, trong khi lợi ích thị giác giảm dần rất nhanh. Ở khoảng cách cầm điện thoại thông thường, mắt người gần như không phân biệt được DPR 2 với DPR 3, nhưng GPU phải làm việc nhiều hơn 2,25 lần. Con số 2 là điểm cân bằng thực nghiệm được cộng đồng chấp nhận rộng rãi.',
    },
  ],

  checkpoints: [
    'Resize cửa sổ mà hình không méo, và bạn đọc được ba bước theo đúng thứ tự.',
    'Giải thích được vì sao `enableDamping` cần `controls.update()`.',
    'Nói được khi nào chọn Orthographic thay cho Perspective.',
    'Giải thích được lý do chặn pixel ratio ở 2 bằng lập luận bình phương.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 500 }),
};
