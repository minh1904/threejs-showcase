import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import './styles.css';

const container = document.getElementById('app');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
camera.position.set(0, 5, 11);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const sphere = new THREE.SphereGeometry(1, 32, 16);
const make = (color, scale) => {
  const mesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color }));
  mesh.scale.setScalar(scale);
  return mesh;
};

// ---- Cây scene graph của hệ mặt trời ----
//
//   scene
//    └── sun
//         └── earthOrbit      (xoay -> trái đất quay quanh mặt trời)
//              └── earthGroup (đặt cách tâm 4 đơn vị)
//                   ├── earth
//                   └── moonOrbit  (xoay -> mặt trăng quay quanh trái đất)
//                        └── moon  (đặt cách trái đất 1.4 đơn vị)

const sun = make(0xea733a, 1.3);
scene.add(sun);

// Group rỗng đặt tại tâm mặt trời. Xoay group này thì mọi thứ bên trong
// quay theo — đó là cách tạo quỹ đạo mà không phải tự tính sin/cos.
const earthOrbit = new THREE.Group();
sun.add(earthOrbit);

const earthGroup = new THREE.Group();
earthGroup.position.x = 4;
earthOrbit.add(earthGroup);

const earth = make(0x0c8ce9, 0.6);
earthGroup.add(earth);

const moonOrbit = new THREE.Group();
earthGroup.add(moonOrbit);

const moon = make(0xbbbbbb, 0.22);
moon.position.x = 1.4;
moonOrbit.add(moon);

// LƯU Ý: sun.scale = 1.3 nên MỌI con cháu bị nhân 1.3 theo.
// Khoảng cách 4 đơn vị của trái đất thực tế hiện ra thành 5.2 đơn vị.
// Đây là hệ quả trực tiếp của việc transform mang tính kế thừa.

// Vòng tròn quỹ đạo cho dễ nhìn
const ring = new THREE.Mesh(
  new THREE.RingGeometry(3.97, 4.03, 96),
  new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
);
ring.rotation.x = -Math.PI / 2; // radian, KHÔNG phải độ
earthOrbit.add(ring);

// Đặt góc ban đầu để nhìn rõ cấu trúc phân cấp
earthOrbit.rotation.y = 0.6;
moonOrbit.rotation.y = 2.2;

renderer.render(scene, camera);

// world matrix gộp toàn bộ transform của chuỗi cha. Đây là toạ độ THẬT
// của mặt trăng trong scene — khác hẳn moon.position (toạ độ tương đối).
const worldPosition = new THREE.Vector3();
moon.getWorldPosition(worldPosition);

console.log('moon.position (tương đối với moonOrbit):', moon.position.toArray());
console.log('toạ độ thế giới của mặt trăng:', worldPosition.toArray().map(n => +n.toFixed(2)));
`;

export const LESSON_1_3: LessonContent = {
  id: '1-3',

  goal: 'Di chuyển, xoay, thu phóng vật thể và hiểu vì sao transform của con luôn tương đối so với cha — nền tảng của scene graph.',

  lecture: [
    'Đây là bài quan trọng nhất Module 1, và cũng là bài mà người tự học hay bỏ qua nhanh nhất. Lý do nên chậm lại: hệ mặt trời bạn dựng ở đây sẽ được dùng lại suốt các bài 1.4, 1.5 và 1.6. Làm cẩu thả một lần, sửa lại ba lần.',

    'Ý tưởng cốt lõi rất gọn: mỗi `Object3D` mang transform **tương đối so với cha nó**, không phải so với thế giới. Khi bạn xoay một `Group`, mọi con cháu bên trong quay theo mà không cần tính toán gì thêm. Mặt trăng quay quanh trái đất trong khi trái đất quay quanh mặt trời — bạn chỉ cần lồng đúng cây phân cấp, phần lượng giác GPU lo.',

    'Có một cái bẫy về đơn vị mà gần như ai cũng dính đúng một lần: `rotation` dùng **radian**, không phải độ. Viết `rotation.y = 90` không cho bạn góc vuông — nó cho hơn 14 vòng tròn. Góc vuông là `Math.PI / 2`. Nếu quen nghĩ bằng độ, dùng `THREE.MathUtils.degToRad(90)`.',

    'Tôi cũng muốn bạn để ý một chi tiết đã cài sẵn trong sandbox: mặt trời được đặt `scale = 1.3`. Vì trái đất là con của mặt trời, khoảng cách 4 đơn vị của nó thực tế hiện ra thành 5.2. Scale kế thừa xuống toàn bộ nhánh — đây là nguồn gốc của rất nhiều lỗi "sao model của tôi to bất thường" khi ghép model bên ngoài vào.',
  ],

  concepts: [
    {
      term: 'position / rotation / scale',
      explain:
        'Ba thuộc tính transform của mọi `Object3D`. `position` và `scale` là `Vector3`; `rotation` là `Euler` tính bằng **radian**. Chúng luôn được hiểu tương đối với đối tượng cha.',
    },
    {
      term: 'Group',
      explain:
        'Một `Object3D` rỗng, không vẽ gì cả, chỉ tồn tại để gom nhóm. Đây là công cụ chính để dựng quỹ đạo: đặt vật thể lệch tâm rồi xoay group chứa nó.',
    },
    {
      term: 'Scene graph',
      explain:
        'Cây quan hệ cha–con. Transform tích luỹ dọc theo cây: vị trí thật của một vật thể là kết quả nhân dồn ma trận của toàn bộ chuỗi tổ tiên.',
    },
    {
      term: 'getWorldPosition()',
      explain:
        'Trả về toạ độ thật trong scene sau khi đã gộp mọi transform của cha. Khác với `.position` vốn chỉ là toạ độ tương đối. Rất cần khi làm raycasting hay gắn nhãn HTML ở Module 4.',
    },
    {
      term: 'Quaternion',
      explain:
        'Cách biểu diễn góc quay tránh được **gimbal lock** — hiện tượng mất một bậc tự do khi hai trục Euler trùng nhau. Bài này chưa cần dùng, nhưng nên biết vì sao nó tồn tại: nội suy góc quay mượt thì dùng quaternion, không dùng Euler.',
    },
  ],

  walkthrough: [
    {
      action: 'Đặt mặt trời ở gốc toạ độ.',
      why: 'Gốc toạ độ là điểm neo tự nhiên cho toàn hệ. Mọi thứ khác định vị tương đối với nó.',
    },
    {
      action: 'Tạo `earthOrbit` — một `Group` rỗng — làm con của mặt trời.',
      why: 'Group này ở ngay tâm mặt trời. Xoay nó chính là tạo quỹ đạo. Nếu thay vào đó bạn tự tính `x = cos(t) * r`, mỗi tầng quỹ đạo mới sẽ là một tầng lượng giác chồng lên.',
    },
    {
      action: 'Tạo `earthGroup`, đặt `position.x = 4`, làm con của `earthOrbit`.',
      why: 'Chính khoảng lệch này biến phép xoay của cha thành chuyển động tròn của con.',
    },
    {
      action: 'Thêm mesh trái đất vào `earthGroup`, rồi thêm tiếp `moonOrbit` cũng vào `earthGroup`.',
      why: 'Đặt `moonOrbit` bên trong `earthGroup` là mấu chốt: mặt trăng sẽ đi theo trái đất một cách tự động.',
    },
    {
      action: 'Đặt mặt trăng lệch `position.x = 1.4` bên trong `moonOrbit`.',
      why: 'Lặp lại đúng thủ thuật ở tầng trên. Cấu trúc này lồng được vô hạn tầng.',
    },
    {
      action: 'Xoay vòng quỹ đạo bằng `ring.rotation.x = -Math.PI / 2`.',
      why: '`RingGeometry` mặc định nằm trong mặt phẳng XY; ta cần nó nằm ngang trong mặt phẳng XZ. Hãy chú ý dùng radian.',
    },
    {
      action: 'So sánh `moon.position` với `moon.getWorldPosition()` trong Console.',
      why: 'Hai con số này khác nhau chính là bằng chứng cụ thể nhất cho khái niệm "tương đối với cha".',
    },
  ],

  observations: [
    {
      change: 'Đổi `moonOrbit` từ con của `earthGroup` thành con của `scene`, rồi xoay `earthOrbit`.',
      observe: 'Trái đất đi tiếp trên quỹ đạo, còn mặt trăng đứng nguyên tại chỗ.',
      why: 'Đây là điểm mấu chốt của cả bài. Mặt trăng không "biết" trái đất tồn tại — nó chỉ đi theo cha của nó. Cắt liên kết cha–con là cắt luôn mối quan hệ chuyển động. Toàn bộ giá trị của scene graph nằm ở chỗ này.',
    },
    {
      change: 'Đổi `sun.scale.setScalar(1.3)` thành `2.5`.',
      observe: 'Không chỉ mặt trời to ra — trái đất, mặt trăng và cả vòng quỹ đạo đều phình theo và dạt ra xa.',
      why: 'Scale kế thừa xuống toàn nhánh và nhân vào cả khoảng cách, không riêng kích thước. Trong dự án thật đây là nguyên nhân phổ biến khiến model nhập từ Blender ra sai kích cỡ: một `Group` cha ở đâu đó mang scale khác 1.',
    },
    {
      change: 'Đổi `ring.rotation.x = -Math.PI / 2` thành `ring.rotation.x = -90`.',
      observe: 'Vòng quỹ đạo nghiêng lung tung, hoàn toàn không nằm ngang.',
      why: '`rotation` tính bằng radian. `-90` radian tương đương khoảng −14,3 vòng — kết quả là một góc gần như ngẫu nhiên. Muốn nghĩ bằng độ thì dùng `THREE.MathUtils.degToRad(-90)`.',
    },
    {
      change: 'Đổi `earthGroup.position.x = 4` thành `0`.',
      observe: 'Trái đất chui vào giữa mặt trời và việc xoay `earthOrbit` không còn tạo ra chuyển động nhìn thấy được.',
      why: 'Xoay quanh một trục đi qua chính tâm vật thể chỉ khiến nó tự quay tại chỗ. Quỹ đạo cần **khoảng lệch** — đó là toàn bộ lý do tồn tại của cặp group lồng nhau.',
    },
  ],

  interview: [
    {
      q: 'Scene graph là gì và vì sao nó quan trọng?',
      a: 'Là cây quan hệ cha–con giữa các `Object3D`, trong đó transform của con được hiểu tương đối với cha. Khi render, Three.js nhân dồn ma trận từ gốc xuống để ra ma trận thế giới của từng vật thể. Nó quan trọng vì cho phép mô tả chuyển động phức hợp bằng cách lồng ghép thay vì tính toán thủ công — cánh tay robot, hệ mặt trời, xương nhân vật đều dựa trên nguyên lý này.',
    },
    {
      q: '`rotation` của Three.js dùng đơn vị gì?',
      a: 'Radian. `Math.PI` là 180°, `Math.PI / 2` là 90°. Đây là lỗi kinh điển của người mới vì hầu hết công cụ thiết kế hiển thị bằng độ. Có `THREE.MathUtils.degToRad()` và `radToDeg()` để chuyển đổi.',
    },
    {
      q: 'Khi nào dùng Quaternion thay cho Euler?',
      a: 'Khi cần nội suy giữa hai góc quay, hoặc khi góc quay tích luỹ qua nhiều bước. Euler dễ đọc nhưng dính gimbal lock — lúc trục giữa quay tới 90°, hai trục còn lại chập vào nhau làm mất một bậc tự do. Quaternion không có vấn đề đó và có `slerp()` để nội suy mượt, nên animation và camera transition đều dùng nó.',
    },
    {
      q: 'Sự khác nhau giữa `object.position` và `object.getWorldPosition()`?',
      a: '`position` là toạ độ tương đối với đối tượng cha trực tiếp. `getWorldPosition()` trả về toạ độ tuyệt đối trong scene sau khi gộp toàn bộ chuỗi transform của tổ tiên. Với vật thể là con trực tiếp của scene thì hai giá trị trùng nhau; nằm sâu trong cây thì lệch nhau. Raycasting, tính khoảng cách và gắn nhãn HTML đều phải dùng toạ độ thế giới.',
    },
  ],

  checkpoints: [
    'Giải thích được "transform của con là tương đối so với cha" bằng chính ví dụ mặt trăng của bạn.',
    'Dựng lại được hệ mặt trời từ đầu mà không cần tự tính sin/cos.',
    'Không còn nhầm radian với độ.',
    'Nói được vì sao scale của cha ảnh hưởng cả khoảng cách của con.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 500 }),
};
