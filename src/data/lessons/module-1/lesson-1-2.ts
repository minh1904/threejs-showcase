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
camera.position.set(0, 1.5, 9);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// wireframe: true cho ta nhìn thấy lưới tam giác — thứ mà GPU thực sự vẽ.
const material = new THREE.MeshBasicMaterial({ color: 0x0c8ce9, wireframe: true });

// Năm geometry dựng sẵn, xếp hàng ngang để so sánh mật độ lưới.
const shapes = [
  ['Box', new THREE.BoxGeometry(1.2, 1.2, 1.2)],
  ['Sphere', new THREE.SphereGeometry(0.8, 16, 12)],
  ['Torus', new THREE.TorusGeometry(0.6, 0.25, 12, 24)],
  ['Plane', new THREE.PlaneGeometry(1.4, 1.4)],
  ['Cone', new THREE.ConeGeometry(0.7, 1.4, 16)],
];

shapes.forEach(([name, geometry], i) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = (i - 2) * 2.2;
  mesh.position.y = 1.4;
  scene.add(mesh);

  // position.count = số ĐỈNH. Chia cho 3 ra số tam giác (khi geometry không dùng index).
  console.log(name, '— đỉnh:', geometry.attributes.position.count);
});

// Cùng một hình cầu, ba mức chia lưới. Đây là bài học về đánh đổi chất lượng/hiệu năng.
const segmentTests = [
  [3, 2],
  [8, 6],
  [64, 32],
];

segmentTests.forEach(([w, h], i) => {
  const geometry = new THREE.SphereGeometry(0.8, w, h);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = (i - 1) * 2.6;
  mesh.position.y = -1.3;
  scene.add(mesh);

  console.log(
    'Sphere(' + w + ',' + h + ') — đỉnh:',
    geometry.attributes.position.count
  );
});

// Tam giác tự dựng bằng BufferGeometry thuần: 3 đỉnh x 3 toạ độ = 9 số.
// Đây chính là dạng dữ liệu mà MỌI geometry dựng sẵn ở trên rút cuộc cũng quy về.
const triangleGeometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -0.7, -0.6, 0, // đỉnh 1: x, y, z
   0.7, -0.6, 0, // đỉnh 2
   0.0,  0.7, 0, // đỉnh 3
]);
triangleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

const triangle = new THREE.Mesh(
  triangleGeometry,
  new THREE.MeshBasicMaterial({ color: 0xea733a, side: THREE.DoubleSide })
);
triangle.position.set(0, -3.6, 0);
scene.add(triangle);

renderer.render(scene, camera);

console.log('Tổng tam giác vẽ ra:', renderer.info.render.triangles);
`;

export const LESSON_1_2: LessonContent = {
  id: '1-2',

  goal: 'Hiểu một vật thể 3D thực chất được tạo từ gì, và nhìn ra được mối quan hệ giữa số segment, số tam giác và chi phí hiệu năng.',

  lecture: [
    'Ở bài trước ta gọi `new THREE.BoxGeometry(1.2, 1.2, 1.2)` và nhận về một khối hộp mà không hỏi thêm. Bài này ta mở nắp ra xem bên trong. Câu trả lời ngắn gọn: GPU chỉ biết vẽ **tam giác**. Hình cầu, hình xuyến, khối hộp — tất cả đều là những mảng tam giác được sắp xếp khéo léo để trông giống hình cong.',

    'Bật `wireframe: true` là cách nhanh nhất để thấy sự thật đó. Bạn sẽ nhận ra "hình cầu" của Three.js không hề tròn: nó là một khối đa diện, và độ mịn phụ thuộc vào số lát cắt bạn yêu cầu. Đây không phải chi tiết vụn vặt — nó là gốc rễ của mọi cuộc thảo luận về hiệu năng ở Module 5.',

    'Sâu hơn một tầng nữa là `BufferGeometry`. Mọi geometry đều lưu dữ liệu đỉnh trong các `Float32Array` phẳng, gọi là **attribute**. `position` là attribute bắt buộc. Ở cuối sandbox tôi dựng một tam giác bằng tay từ đúng 9 con số — hãy dành thời gian đọc kỹ đoạn đó, vì tới bài shader ở Module 6 bạn sẽ thao tác trực tiếp trên chính cấu trúc này.',
  ],

  concepts: [
    {
      term: 'BufferGeometry',
      explain:
        'Lớp cơ sở của mọi geometry. Dữ liệu nằm trong các attribute — mảng `Float32Array` phẳng được nạp thẳng lên GPU. `BoxGeometry`, `SphereGeometry`… chỉ là hàm tiện ích sinh sẵn các mảng đó.',
    },
    {
      term: 'attributes.position',
      explain:
        'Attribute bắt buộc, chứa toạ độ từng đỉnh, mỗi đỉnh 3 số `(x, y, z)`. `position.count` cho biết số đỉnh — đây là con số bạn nên soi khi nghi ngờ về hiệu năng.',
    },
    {
      term: 'widthSegments / heightSegments',
      explain:
        'Số lát cắt dọc và ngang. Số tam giác tăng theo **tích** của hai số này, nên nhân đôi cả hai là gấp bốn chi phí. Tăng segment không phải lúc nào cũng đáng — thường một normal map rẻ hơn nhiều.',
    },
    {
      term: 'wireframe',
      explain:
        'Thuộc tính material vẽ cạnh tam giác thay vì tô mặt. Công cụ chẩn đoán tốt nhất khi muốn biết một model thực sự nặng bao nhiêu.',
    },
    {
      term: 'side',
      explain:
        'Mặc định `FrontSide` — mặt sau tam giác bị loại bỏ để tiết kiệm. Với mặt phẳng mỏng như `PlaneGeometry` thì hay phải đặt `DoubleSide`, nếu không xoay qua mặt kia sẽ thấy nó biến mất.',
    },
  ],

  walkthrough: [
    {
      action: 'Xếp hàng ngang năm geometry: `Box`, `Sphere`, `Torus`, `Plane`, `Cone`.',
      why: 'Đặt cạnh nhau mới thấy được cùng một bán kính nhưng mật độ lưới rất khác nhau.',
    },
    {
      action: 'Bật `wireframe: true` cho tất cả.',
      why: 'Đây là lúc "hình cầu" lộ nguyên hình là khối đa diện. Nhìn thấy một lần sẽ nhớ mãi.',
    },
    {
      action: 'Dựng ba hình cầu với segment lần lượt là `(3, 2)`, `(8, 6)`, `(64, 32)`.',
      why: 'Ba mức này trải từ "không còn ra hình cầu" tới "mịn thừa thãi". Bạn cần cảm giác trực quan về ngưỡng đủ dùng.',
    },
    {
      action: 'Mở Console, đọc `geometry.attributes.position.count` của từng hình.',
      why: 'Con số cụ thể quan trọng hơn cảm giác. Hãy tự đối chiếu: từ `(8,6)` lên `(64,32)` số đỉnh tăng bao nhiêu lần, còn khác biệt thị giác thì bao nhiêu?',
    },
    {
      action:
        'Dựng một tam giác thuần bằng `BufferGeometry`: tạo `Float32Array` 9 phần tử, gán vào attribute `position` qua `BufferAttribute(vertices, 3)`.',
      why: 'Số `3` ở đây nghĩa là "cứ 3 số hợp thành một đỉnh". Hiểu chỗ này là hiểu cách GPU đọc dữ liệu.',
    },
  ],

  observations: [
    {
      change: 'Nhìn kỹ hình cầu `SphereGeometry(0.8, 3, 2)` ở hàng dưới.',
      observe: 'Nó trông như một viên kim cương thô, hoàn toàn không tròn.',
      why: 'Với 3 lát dọc và 2 lát ngang, geometry chỉ có vài tam giác để mô tả toàn bộ mặt cầu. Three.js không "làm tròn" hộ bạn — nó nối thẳng các đỉnh. Độ cong là ảo giác do có đủ nhiều tam giác nhỏ tạo ra.',
    },
    {
      change: 'So sánh `position.count` giữa `(8, 6)` và `(64, 32)` trong Console.',
      observe: 'Số đỉnh chênh nhau hàng chục lần, nhưng nhìn bằng mắt ở kích thước này thì khác biệt rất nhỏ.',
      why: 'Số tam giác tỉ lệ với tích `widthSegments × heightSegments`, còn cải thiện thị giác thì giảm dần rất nhanh. Đây chính là lý do khâu tối ưu model luôn bắt đầu bằng câu hỏi "vật thể này chiếm bao nhiêu pixel trên màn hình?" — một quả cầu xa tít không cần tới 64 segment.',
    },
    {
      change: 'Xoay camera qua phía sau `PlaneGeometry`, hoặc bỏ `side: THREE.DoubleSide` ở tam giác.',
      observe: 'Mặt phẳng biến mất khi nhìn từ phía sau.',
      why: 'GPU mặc định bỏ qua mặt sau của tam giác — kỹ thuật **backface culling**, tiết kiệm khoảng một nửa khối lượng vẽ với vật thể kín. Với vật thể mỏng hở như lá cây hay tờ giấy thì phải bật `DoubleSide`, đổi lại mất phần tiết kiệm đó.',
    },
    {
      change: 'Trong tam giác tự dựng, đổi đỉnh thứ ba từ `0.0, 0.7, 0` thành `0.0, 0.7, -2`.',
      observe: 'Tam giác nghiêng hẳn vào chiều sâu.',
      why: 'Bạn vừa sửa trực tiếp con số thứ 8 trong `Float32Array`. Không có lớp trừu tượng nào ở giữa — đây đúng là dữ liệu được nạp lên GPU.',
    },
  ],

  interview: [
    {
      q: 'Vì sao `SphereGeometry(1, 3, 2)` trông không giống hình cầu?',
      a: 'Vì hình cầu trong đồ hoạ thời gian thực chỉ là xấp xỉ bằng đa giác. `widthSegments = 3` nghĩa là chỉ có 3 lát theo chiều kinh tuyến, `heightSegments = 2` là 2 lát theo vĩ tuyến — tổng cộng quá ít tam giác để mắt đọc ra đường cong. Độ mượt là hệ quả của mật độ lưới, không phải thuộc tính sẵn có.',
    },
    {
      q: 'Quan hệ giữa số segment và hiệu năng là gì?',
      a: 'Số tam giác xấp xỉ tỉ lệ với tích của hai giá trị segment, nên nhân đôi cả hai làm chi phí gấp bốn. Chi phí này rơi vào vertex shader và băng thông bộ nhớ. Trong thực tế người ta hiếm khi tăng segment để lấy chi tiết — dùng normal map cho cảm giác gồ ghề rẻ hơn nhiều, vì nó xử lý ở fragment shader trên texture thay vì thêm hình học.',
    },
    {
      q: '`BufferGeometry` lưu dữ liệu như thế nào?',
      a: 'Dưới dạng các attribute, mỗi attribute là một mảng typed array phẳng cùng một `itemSize`. Attribute `position` có `itemSize = 3`, nghĩa là cứ ba số liên tiếp hợp thành toạ độ một đỉnh. Ngoài ra còn `normal`, `uv`, `color`… Cấu trúc phẳng này chính là định dạng GPU đọc được, nên không tốn bước chuyển đổi nào.',
    },
    {
      q: 'Backface culling là gì và khi nào cần tắt?',
      a: 'Là việc GPU loại bỏ tam giác quay lưng về phía camera, xác định qua thứ tự đỉnh thuận hay ngược chiều kim đồng hồ. Với khối kín thì mặt sau vốn không bao giờ nhìn thấy nên bỏ đi là lãi ròng. Cần tắt bằng `side: THREE.DoubleSide` khi vật thể mỏng và nhìn được từ hai phía — lá cây, vải, mặt phẳng, hoặc mặt cắt của model rỗng.',
    },
  ],

  checkpoints: [
    'Giải thích được vì sao `SphereGeometry(1, 3, 2)` trông như viên kim cương.',
    'Nói được quan hệ segment ↔ số tam giác ↔ chi phí hiệu năng.',
    'Tự dựng được một tam giác bằng `BufferGeometry` thuần, không copy.',
    'Biết `attributes.position.count` đếm cái gì và tra nó ở đâu.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 520 }),
};
