import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import './styles.css';

const container = document.getElementById('app');
const width = container.clientWidth;
const height = container.clientHeight;

// 1. Scene — cái "phim trường" chứa toàn bộ vật thể, đèn và camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// 2. Camera — quyết định nhìn từ đâu và nhìn thấy tới đâu
const camera = new THREE.PerspectiveCamera(
  75,             // fov: góc mở dọc, tính bằng độ
  width / height, // aspect: tỉ lệ khung hình
  0.1,            // near: gần hơn mức này thì bị cắt
  1000            // far: xa hơn mức này thì bị cắt
);
camera.position.z = 3;
camera.lookAt(0, 0, 0);

// 3. Renderer — bộ máy thực sự vẽ pixel lên thẻ <canvas>
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 4. Mesh = Geometry (hình dạng) + Material (bề mặt)
const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const material = new THREE.MeshBasicMaterial({ color: 0x0c8ce9 });
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(0.4, 0.6, 0);
scene.add(cube);

// Viền wireframe để nhìn rõ khối 3D — MeshBasicMaterial không nhận ánh sáng
// nên nếu không có viền, khối hộp trông như một hình lục giác phẳng.
const wireframe = new THREE.LineSegments(
  new THREE.WireframeGeometry(geometry),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })
);
cube.add(wireframe);

// 5. Vẽ đúng MỘT khung hình. Chưa có animation loop — đó là bài 1.4.
renderer.render(scene, camera);

console.log('Đã render 1 frame:', {
  fov: camera.fov,
  aspect: Number(camera.aspect.toFixed(3)),
  near: camera.near,
  far: camera.far,
  drawCalls: renderer.info.render.calls,
  triangles: renderer.info.render.triangles,
});

// 6. Resize: đổi aspect thì BẮT BUỘC gọi updateProjectionMatrix(),
//    nếu không ma trận chiếu vẫn giữ tỉ lệ cũ và hình bị méo.
window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.render(scene, camera);
});

// 7. Dọn dẹp khi không dùng nữa. Trong React, đoạn này nằm ở hàm trả về
//    của useEffect. Garbage collector của JS KHÔNG thu hồi bộ nhớ GPU.
export function dispose() {
  geometry.dispose();
  material.dispose();
  renderer.dispose();
  container.removeChild(renderer.domElement);
}
`;

export const LESSON_1_1: LessonContent = {
  id: '1-1',

  goal: 'Dựng được scene 3D đầu tiên và giải thích được từng dòng code làm gì mà không cần mở lại tài liệu.',

  lecture: [
    'Mọi ứng dụng Three.js, từ một khối hộp cho tới một showroom ô tô, đều dựng trên đúng ba đối tượng. Hãy hình dung một phim trường: `Scene` là sàn quay chứa mọi thứ, `PerspectiveCamera` là máy quay quyết định khung hình, còn `WebGLRenderer` là bộ phận đưa hình ảnh đó thành pixel trên màn hình. Thiếu bất kỳ cái nào thì không có gì hiện ra cả.',

    'Điểm dễ gây nhầm ở người mới: Three.js **không** tự vẽ. Bạn thêm vật thể vào scene, nhưng cho tới khi gọi `renderer.render(scene, camera)` thì màn hình vẫn trống. Bài này ta cố tình chỉ gọi đúng **một lần** — để bạn thấy rõ ranh giới giữa "mô tả cảnh" và "vẽ cảnh". Vòng lặp animation là chuyện của bài 1.4.',

    'Phần cuối bài — dọn dẹp bộ nhớ — nghe khô khan nhưng lại là chỗ được hỏi nhiều nhất khi phỏng vấn vị trí React + Three.js. Lý do: bộ nhớ GPU nằm ngoài tầm với của garbage collector JavaScript. Bạn xoá biến đi, GPU vẫn giữ nguyên buffer. Nắm chắc chỗ này từ bài đầu tiên sẽ đỡ cho bạn rất nhiều về sau.',
  ],

  concepts: [
    {
      term: 'Scene',
      explain:
        'Nút gốc của một cây gọi là **scene graph**. Mọi mesh, đèn, camera đều là con cháu của nó. Cấu trúc cây này là nền tảng cho bài 1.3 về quan hệ cha–con.',
    },
    {
      term: 'PerspectiveCamera(fov, aspect, near, far)',
      explain:
        'Bốn tham số định nghĩa một khối chóp cụt gọi là **frustum** — vùng không gian camera nhìn thấy. `fov` là góc mở dọc (độ), `aspect` là tỉ lệ rộng/cao, `near` và `far` là hai mặt phẳng cắt gần và xa. Nằm ngoài khối này thì không được vẽ.',
    },
    {
      term: 'WebGLRenderer',
      explain:
        'Cầu nối giữa Three.js và WebGL. `setSize()` định kích thước canvas, `setPixelRatio()` quyết định mật độ pixel thực vẽ, `domElement` là thẻ `<canvas>` bạn gắn vào DOM.',
    },
    {
      term: 'Mesh = Geometry + Material',
      explain:
        '`Geometry` giữ toạ độ các đỉnh (hình dạng), `Material` mô tả bề mặt phản ứng với ánh sáng ra sao. Ghép lại thành một vật thể vẽ được. Bài 1.2 sẽ mổ xẻ kỹ phần geometry.',
    },
    {
      term: 'dispose()',
      explain:
        'Giải phóng bộ nhớ GPU thủ công. Cần gọi trên geometry, material, texture và renderer. Không có nó, mỗi lần vào ra trang lại bỏ lại một mớ buffer trong VRAM.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo `Scene` và đặt màu nền cho nó.',
      why: 'Không có scene thì không có gì để render. Màu nền giúp bạn phân biệt được "canvas chưa vẽ gì" với "canvas đã vẽ nhưng vật thể nằm ngoài tầm nhìn".',
    },
    {
      action: 'Tạo `PerspectiveCamera` và **đẩy nó lùi ra** bằng `camera.position.z = 3`.',
      why: 'Mặc định cả camera lẫn vật thể đều ở gốc toạ độ `(0, 0, 0)`. Không lùi camera ra thì bạn đang đứng bên trong khối hộp.',
    },
    {
      action: 'Tạo `WebGLRenderer`, gọi `setSize()`, rồi gắn `renderer.domElement` vào DOM.',
      why: 'Renderer tự tạo thẻ `<canvas>` nhưng không tự gắn vào trang. Bạn phải làm bước đó.',
    },
    {
      action: 'Chặn pixel ratio bằng `Math.min(window.devicePixelRatio, 2)`.',
      why: 'Số pixel GPU phải tính tăng theo **bình phương** tỉ lệ. Màn hình DPR 3 tốn gấp 9 lần DPR 1. Chặn ở 2 giữ được độ nét mắt thường phân biệt được mà không làm nghẹt GPU điện thoại.',
    },
    {
      action: 'Tạo `Mesh` từ `BoxGeometry` và `MeshBasicMaterial`, thêm vào scene.',
      why: 'Chọn `MeshBasicMaterial` vì bài này chưa có đèn. Các material khác như `MeshStandardMaterial` cần nguồn sáng, không có đèn sẽ ra một khối đen tuyền.',
    },
    {
      action: 'Gọi `renderer.render(scene, camera)` đúng một lần.',
      why: 'Đây là dòng thực sự vẽ. Mọi thứ phía trên chỉ là mô tả.',
    },
    {
      action: 'Viết hàm dọn dẹp: `dispose()` cho geometry, material, renderer rồi gỡ canvas.',
      why: 'Trong React đoạn này là hàm trả về của `useEffect`. Tập thói quen viết nó ngay từ bài đầu.',
    },
  ],

  observations: [
    {
      change: 'Đổi `camera.position.z = 3` thành `0`.',
      observe: 'Khối hộp gần như biến mất, chỉ còn vài đường viền loang lổ.',
      why: 'Camera lọt vào trong khối hộp. Các mặt hộp giờ nằm gần camera hơn `near = 0.1` nên bị mặt phẳng cắt gần loại bỏ. Đây cũng là lý do người mới hay gặp "màn hình trống" ở scene đầu tiên: vật thể và camera cùng ở gốc toạ độ.',
    },
    {
      change:
        'Đổi `near` thành `0.0001` và `far` thành `1000000`, rồi đặt thêm hai mặt phẳng gần sát nhau.',
      observe: 'Hai mặt phẳng nhấp nháy tranh nhau hiện lên, loang lổ như nhiễu.',
      why: 'Hiện tượng này gọi là **z-fighting**. Depth buffer lưu độ sâu theo thang phi tuyến, dồn phần lớn độ chính xác vào sát mặt phẳng `near`. Khi tỉ lệ `far / near` bị đẩy lên quá lớn, độ phân giải chiều sâu ở vùng xa mỏng tới mức hai bề mặt khác nhau nhận cùng một giá trị. Quy tắc thực hành: đẩy `near` **lớn nhất có thể** mà cảnh vẫn đúng, quan trọng hơn nhiều so với việc hạ `far`.',
    },
    {
      change: 'Xoá dòng `renderer.setSize(width, height)`.',
      observe: 'Canvas co lại thành một ô nhỏ, hình bị kéo méo.',
      why: 'Thẻ `<canvas>` theo chuẩn HTML có kích thước mặc định 300×150 pixel. Renderer không tự suy ra kích thước từ phần tử cha — bạn phải nói cho nó biết.',
    },
    {
      change: 'Đổi `fov` từ `75` xuống `20`, rồi lên `120`.',
      observe: 'fov nhỏ làm khối hộp trông dẹt và bị "kéo lại gần"; fov lớn làm nó phình ra, méo mạnh ở rìa.',
      why: 'fov là góc mở của khối frustum. Góc hẹp cho hiệu ứng giống ống kính tele — nén chiều sâu. Góc rộng giống ống kính góc rộng — cường điệu phối cảnh. Khoảng 45–75° là vùng cho cảm giác tự nhiên với mắt người.',
    },
  ],

  interview: [
    {
      q: 'Vì sao `near` quá nhỏ lại gây z-fighting?',
      a: 'Vì depth buffer phân bố độ chính xác phi tuyến, tập trung gần mặt phẳng `near`. Tỉ lệ `far / near` càng lớn thì vùng xa càng ít bit để phân biệt chiều sâu, tới lúc hai bề mặt gần nhau nhận cùng một giá trị depth và tranh nhau vẽ. Cách xử lý hiệu quả nhất là **tăng `near`** chứ không phải giảm `far`, vì `near` nằm ở mẫu số của tỉ lệ đó.',
    },
    {
      q: 'Tích hợp Three.js vào React thì quản lý vòng đời thế nào?',
      a: 'Khởi tạo trong `useEffect`, và hàm trả về của `useEffect` phải làm ba việc: huỷ animation loop bằng `cancelAnimationFrame`, gọi `dispose()` trên mọi geometry / material / texture, rồi `renderer.dispose()` và gỡ canvas khỏi DOM. Lý do là bộ nhớ GPU không nằm trong heap JavaScript nên garbage collector không chạm tới được — xoá tham chiếu trong JS không giải phóng VRAM.',
    },
    {
      q: 'Vì sao phải chặn pixel ratio ở mức 2?',
      a: 'Số pixel cần tô tăng theo bình phương của DPR: màn hình DPR 3 phải vẽ gấp 9 lần diện tích so với DPR 1. Mắt người gần như không phân biệt được chênh lệch giữa DPR 2 và 3 ở khoảng cách sử dụng bình thường, nên `Math.min(devicePixelRatio, 2)` đổi được rất nhiều hiệu năng lấy một khác biệt thị giác không đáng kể.',
    },
    {
      q: 'Thêm mesh vào scene rồi mà màn hình vẫn trống, bạn kiểm tra gì đầu tiên?',
      a: 'Theo thứ tự: đã gọi `renderer.render()` chưa; camera có nằm trùng vị trí vật thể không; vật thể có nằm giữa `near` và `far` không; đã `setSize()` chưa; và material có cần đèn không (`MeshStandardMaterial` mà thiếu đèn thì ra khối đen). `renderer.info.render.triangles` bằng 0 cho biết ngay là không có gì lọt vào frustum.',
    },
  ],

  checkpoints: [
    'Khối hộp hiện ra và bạn đọc vanh vách từng dòng làm gì.',
    'Giải thích được vai trò riêng của `Scene`, `PerspectiveCamera`, `WebGLRenderer`.',
    'Nói được bốn tham số của `PerspectiveCamera` tạo thành khối frustum ra sao.',
    'Biết vì sao phải `dispose()` thủ công thay vì tin vào garbage collector.',
  ],

  sandbox: vanillaSandbox(CODE),
};
