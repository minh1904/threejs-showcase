import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(
  50,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(0, 4, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ---- Hệ mặt trời rút gọn từ bài 1.3 ----
const sphere = new THREE.SphereGeometry(1, 32, 16);

const sunMat = new THREE.MeshBasicMaterial({ color: 0xea733a });
const earthMat = new THREE.MeshBasicMaterial({ color: 0x0c8ce9 });
const moonMat = new THREE.MeshBasicMaterial({ color: 0xbbbbbb });

const sun = new THREE.Mesh(sphere, sunMat);
sun.scale.setScalar(1.2);
scene.add(sun);

const earthOrbit = new THREE.Group();
scene.add(earthOrbit);

const earthGroup = new THREE.Group();
earthGroup.position.x = 4;
earthOrbit.add(earthGroup);

const earth = new THREE.Mesh(sphere, earthMat);
earth.scale.setScalar(0.6);
earthGroup.add(earth);

const moonOrbit = new THREE.Group();
earthGroup.add(moonOrbit);

const moon = new THREE.Mesh(sphere, moonMat);
moon.scale.setScalar(0.22);
moon.position.x = 1.5;
moonOrbit.add(moon);

// ---- Debug UI ----
const params = {
  tocDoTraiDat: 0.6,
  tocDoMatTrang: 2.0,
  mauTraiDat: '#0c8ce9',
  wireframe: false,
  hienMatTrang: true,
};

const gui = new GUI({ title: 'Tham số scene' });

const fEarth = gui.addFolder('Trái đất');
fEarth.add(params, 'tocDoTraiDat', 0, 3, 0.01).name('tốc độ quỹ đạo');
fEarth.addColor(params, 'mauTraiDat')
  .name('màu')
  .onChange((v) => earthMat.color.set(v));

const fMoon = gui.addFolder('Mặt trăng');
fMoon.add(params, 'tocDoMatTrang', 0, 6, 0.01).name('tốc độ quỹ đạo');
fMoon.add(params, 'hienMatTrang')
  .name('hiển thị')
  .onChange((v) => (moon.visible = v));

gui.add(params, 'wireframe').onChange((v) => {
  sunMat.wireframe = v;
  earthMat.wireframe = v;
  moonMat.wireframe = v;
});

// ---- Đo bộ nhớ GPU ----
const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

const clock = new THREE.Clock();
let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  const delta = clock.getDelta();

  earthOrbit.rotation.y += params.tocDoTraiDat * delta;
  moonOrbit.rotation.y += params.tocDoMatTrang * delta;

  // renderer.info là nguồn sự thật về những gì ĐANG nằm trên GPU.
  const m = renderer.info.memory;
  hud.textContent =
    'geometries: ' + m.geometries +
    '   |   textures: ' + m.textures +
    '   |   draw calls: ' + renderer.info.render.calls;

  renderer.render(scene, camera);
}

tick();

// ---- Dọn dẹp ----
// Thứ tự quan trọng: dừng loop trước, rồi mới giải phóng tài nguyên.
export function dispose() {
  cancelAnimationFrame(frameId);

  // Thiếu dòng này thì mỗi lần hot-reload lại đẻ thêm một bảng GUI chồng lên nhau.
  gui.destroy();

  // traverse() duyệt toàn bộ cây scene — an toàn hơn nhớ tên từng biến.
  scene.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();

      // material có thể là mảng khi mesh dùng nhiều vật liệu
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value && value.isTexture) value.dispose();
        });
        material.dispose();
      });
    }
  });

  renderer.dispose();
  container.removeChild(renderer.domElement);

  console.log('sau khi dispose:', renderer.info.memory);
}
`;

export const LESSON_1_6: LessonContent = {
  id: '1-6',

  goal: 'Chỉnh tham số scene theo thời gian thực bằng `lil-gui`, và chứng minh bằng số liệu rằng scene của bạn không rò rỉ bộ nhớ GPU.',

  lecture: [
    'Bài này ghép hai kỹ năng tưởng như không liên quan, nhưng thực tế cả hai đều thuộc cùng một chủ đề: kiểm soát được thứ mình vừa tạo ra. Debug UI cho bạn nghịch tham số mà không phải sửa code rồi reload; dispose cho bạn chắc chắn scene biến mất sạch khi không cần nữa.',

    '`lil-gui` là công cụ hầu như mọi lập trình viên Three.js đều dùng. Nó rất đơn giản: `gui.add(object, "property", min, max)` sinh ra một slider được nối thẳng vào thuộc tính đó. Điểm quan trọng cần nhớ là `gui.destroy()` trong cleanup — thiếu nó, mỗi lần hot-reload sẽ đẻ thêm một bảng mới chồng lên bảng cũ, và sau mười lần sửa code màn hình sẽ đầy panel.',

    'Phần thứ hai mới là phần đáng giá khi phỏng vấn. Bộ nhớ GPU **không** nằm trong heap JavaScript. Bạn gán `scene = null`, garbage collector thu hồi đối tượng JS, nhưng vertex buffer và texture vẫn nằm nguyên trong VRAM. Chỉ có `dispose()` mới nói cho driver biết là có thể giải phóng.',

    'Tôi muốn bạn không chỉ tin điều đó mà **đo** được nó. `renderer.info.memory` cho biết số geometry và texture đang nằm trên GPU. Hãy vào ra trang này mười lần, ghi lại con số mỗi lần. Sau đó xoá phần dispose đi và lặp lại. Hai dãy số đó chính là câu trả lời của bạn cho câu hỏi "tích hợp Three.js vào React thì quản lý lifecycle thế nào" — có dẫn chứng, không phải học thuộc.',
  ],

  concepts: [
    {
      term: 'lil-gui',
      explain:
        'Bảng điều khiển nhẹ. `gui.add()` cho số/chuỗi/boolean, `gui.addColor()` cho màu, `gui.addFolder()` để gom nhóm. `.onChange()` chạy callback mỗi khi giá trị đổi.',
    },
    {
      term: 'gui.destroy()',
      explain:
        'Gỡ bảng GUI khỏi DOM. Bắt buộc trong cleanup của `useEffect`, nếu không mỗi lần hot-reload lại thêm một bảng.',
    },
    {
      term: 'renderer.info',
      explain:
        'Số liệu thật của renderer. `info.memory` cho biết `geometries` và `textures` đang nằm trên GPU; `info.render` cho `calls`, `triangles`. Đây là công cụ chẩn đoán rò rỉ chính xác nhất.',
    },
    {
      term: 'scene.traverse()',
      explain:
        'Duyệt đệ quy toàn bộ cây scene. Dùng nó để dispose thay vì nhớ tên từng biến — an toàn hơn nhiều khi scene phức tạp dần.',
    },
    {
      term: 'Thứ tự dispose',
      explain:
        'Dừng vòng lặp trước (`cancelAnimationFrame`), rồi mới giải phóng tài nguyên. Ngược lại thì frame đang chạy dở có thể chạm vào buffer vừa bị huỷ.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo object `params` chứa mọi giá trị cần chỉnh, rồi nối `lil-gui` vào nó.',
      why: 'Gom tham số vào một object giúp vòng lặp animation đọc trực tiếp `params.tocDo` mà không cần cầu nối nào.',
    },
    {
      action: 'Gom slider vào folder theo từng thiên thể bằng `gui.addFolder()`.',
      why: 'Với hơn năm điều khiển, bảng phẳng trở nên khó dùng rất nhanh.',
    },
    {
      action: 'Dùng `gui.addColor()` cho màu và `.onChange()` để gọi `material.color.set(v)`.',
      why: 'Màu không tự đồng bộ như số — `params.mauTraiDat` chỉ là một chuỗi, phải chủ động ghi vào material.',
    },
    {
      action: 'Hiển thị `renderer.info.memory` lên màn hình mỗi frame.',
      why: 'Đưa số liệu ra trước mắt thì bạn mới có phản xạ để ý tới nó.',
    },
    {
      action: 'Viết hàm dọn dẹp: `cancelAnimationFrame` → `gui.destroy()` → `scene.traverse()` dispose → `renderer.dispose()`.',
      why: 'Đúng thứ tự này. Dừng loop trước để không có frame nào đang đọc tài nguyên vừa bị giải phóng.',
    },
    {
      action:
        'Vào ra trang mười lần, ghi lại `geometries` và `textures` mỗi lần. Rồi xoá phần dispose và lặp lại.',
      why: 'Đây là phần quan trọng nhất bài. Hai dãy số là bằng chứng bạn mang đi phỏng vấn được.',
    },
  ],

  observations: [
    {
      change: 'Xoá dòng `gui.destroy()` rồi sửa bất kỳ dòng code nào để kích hoạt hot-reload vài lần.',
      observe: 'Các bảng GUI chồng chất lên nhau ở góc màn hình.',
      why: '`lil-gui` chèn thẳng phần tử vào `document.body`, nằm ngoài vòng đời React. Không ai gỡ hộ bạn. Đây là ví dụ thu nhỏ của cùng một vấn đề với tài nguyên GPU: thứ gì bạn tạo ra bên ngoài hệ thống quản lý của React thì bạn phải tự dọn.',
    },
    {
      change: 'Theo dõi `geometries` ở thanh HUD, rồi bỏ phần `scene.traverse()` dispose và vào ra trang nhiều lần.',
      observe: 'Con số tăng dần và không bao giờ giảm.',
      why: 'Mỗi lần vào trang lại nạp một bộ vertex buffer mới lên GPU; lần rời trang không trả lại gì. Garbage collector của JavaScript thu hồi được đối tượng `Mesh` phía JS, nhưng bộ nhớ thật nằm trong VRAM do driver quản lý và chỉ giải phóng khi có lệnh `dispose()` tường minh.',
    },
    {
      change: 'Chú ý rằng ba thiên thể dùng chung một biến `sphere` geometry.',
      observe: 'Số `geometries` là 1, không phải 3.',
      why: 'Chia sẻ geometry giữa nhiều mesh là kỹ thuật tối ưu cơ bản — dữ liệu đỉnh chỉ nạp lên GPU một lần. Nhưng nó có mặt trái khi dispose: gọi `dispose()` trên geometry dùng chung sẽ làm hỏng mọi mesh còn lại. Đó là lý do `traverse()` trong dự án lớn thường đi kèm một `Set` để không dispose trùng.',
    },
    {
      change: 'Kéo slider "tốc độ quỹ đạo" của mặt trăng lên mức tối đa.',
      observe: 'Mặt trăng quay rất nhanh nhưng chuyển động vẫn mượt, không giật.',
      why: 'Vì tốc độ được nhân với `delta` như đã học ở bài 1.4. Slider chỉ đổi hằng số radian-mỗi-giây, còn phép quy đổi sang từng frame vẫn do delta time đảm nhiệm. Đây là lợi ích cộng dồn của việc làm đúng từ bài trước.',
    },
  ],

  interview: [
    {
      q: 'Vì sao Three.js bắt dispose thủ công mà không dựa vào garbage collector?',
      a: 'Vì tài nguyên thật nằm trong bộ nhớ GPU do driver đồ hoạ quản lý, không nằm trong heap JavaScript. Garbage collector chỉ nhìn thấy và thu hồi được đối tượng JS bao ngoài. Khi đối tượng JS bị thu hồi, engine không có cơ chế nào để tự động báo cho driver giải phóng buffer tương ứng, nên phải gọi `dispose()` tường minh.',
    },
    {
      q: 'Tích hợp Three.js vào React thì quản lý vòng đời ra sao?',
      a: 'Toàn bộ phần khởi tạo nằm trong `useEffect`, và hàm trả về của nó phải làm đủ: `cancelAnimationFrame` để dừng loop, `gui.destroy()` nếu có debug UI, duyệt scene dispose geometry/material/texture, `renderer.dispose()`, gỡ canvas khỏi DOM và gỡ mọi event listener. Cách kiểm chứng là theo dõi `renderer.info.memory` qua nhiều lần mount/unmount — con số phải ổn định chứ không tăng dần.',
    },
    {
      q: 'Làm sao phát hiện rò rỉ bộ nhớ trong ứng dụng Three.js?',
      a: 'Cách nhanh nhất là `renderer.info.memory` — vào ra trang nhiều lần và xem `geometries`/`textures` có tăng đơn điệu không. Sâu hơn thì dùng tab Memory của Chrome DevTools chụp heap snapshot để tìm tham chiếu còn sót, hoặc tab Performance ghi lại và xem đồ thị JS heap có dạng răng cưa đi lên không.',
    },
    {
      q: 'Có bẫy gì khi dispose geometry dùng chung giữa nhiều mesh?',
      a: 'Có. Nếu nhiều mesh cùng trỏ tới một geometry, việc duyệt scene và gọi `dispose()` trên từng mesh sẽ giải phóng cùng một buffer nhiều lần và làm hỏng các mesh còn lại nếu chúng vẫn đang được dùng ở nơi khác. Cách xử lý là gom vào một `Set` để mỗi tài nguyên chỉ dispose đúng một lần, hoặc chỉ dispose khi chắc chắn toàn bộ scene sắp bị huỷ.',
    },
  ],

  checkpoints: [
    'Có hai dãy số `renderer.info.memory` chứng minh có và không có rò rỉ.',
    'Bảng `lil-gui` chỉnh được tốc độ, màu, wireframe và ẩn/hiện mặt trăng.',
    'Giải thích được vì sao garbage collector không thu hồi được bộ nhớ GPU.',
    'Biết thứ tự đúng trong hàm cleanup và vì sao thứ tự đó quan trọng.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 500 }),
};
