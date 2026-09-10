import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

// ---------------------------------------------------------------------------
// VERTEX SHADER — chạy MỘT LẦN CHO MỖI ĐỈNH.
// Nhiệm vụ bắt buộc: gán gl_Position, tức vị trí đỉnh trong không gian màn hình.
// ---------------------------------------------------------------------------
const vertexShader = \`
  uniform float uTime;
  uniform float uBienDo;

  // varying: giá trị được truyền từ vertex sang fragment shader,
  // và được NỘI SUY giữa các đỉnh của mỗi tam giác.
  varying vec2 vUv;
  varying float vDoCao;

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Gợn sóng: đẩy đỉnh theo trục z bằng hai hàm sin giao nhau
    float song = sin(pos.x * 3.0 + uTime) * cos(pos.y * 2.0 + uTime * 0.7);
    pos.z += song * uBienDo;

    vDoCao = song;

    // Chuỗi ma trận chuẩn: model -> view -> projection
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
\`;

// ---------------------------------------------------------------------------
// FRAGMENT SHADER — chạy MỘT LẦN CHO MỖI PIXEL được tô.
// Nhiệm vụ bắt buộc: gán gl_FragColor, tức màu của pixel đó.
// Số lần chạy lớn hơn vertex shader RẤT NHIỀU -> đây là nơi chi phí dồn vào.
// ---------------------------------------------------------------------------
const fragmentShader = \`
  uniform float uTime;
  uniform vec3 uMauA;
  uniform vec3 uMauB;
  uniform float uSoSoc;

  varying vec2 vUv;
  varying float vDoCao;

  void main() {
    // Sọc động: sin trên toạ độ UV, dịch theo thời gian
    float soc = sin(vUv.x * uSoSoc + uTime * 1.5) * 0.5 + 0.5;

    // mix() nội suy tuyến tính giữa hai màu
    vec3 mau = mix(uMauA, uMauB, soc);

    // Làm sáng đỉnh sóng, tối đáy sóng — dùng varying từ vertex shader
    mau += vDoCao * 0.25;

    gl_FragColor = vec4(mau, 1.0);
  }
\`;

function MatSong({ bienDo, soSoc }) {
  const ref = useRef();

  // uniforms tạo MỘT LẦN. Tạo lại mỗi frame sẽ buộc biên dịch lại shader.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBienDo: { value: bienDo },
      uSoSoc: { value: soSoc },
      uMauA: { value: new THREE.Color('#0c8ce9') },
      uMauB: { value: new THREE.Color('#ea733a') },
    }),
    []
  );

  useFrame((state, delta) => {
    // Cập nhật uniform là thao tác cực rẻ: gửi vài byte lên GPU.
    // So với việc tính lại vị trí hàng nghìn đỉnh bằng JavaScript.
    uniforms.uTime.value += delta;
    uniforms.uBienDo.value = bienDo;
    uniforms.uSoSoc.value = soSoc;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 3, 0, 0]}>
      {/* Cần NHIỀU segment thì vertex shader mới có đỉnh để đẩy.
          Đổi 128 xuống 4 để thấy vì sao. */}
      <planeGeometry args={[6, 6, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}

export default function App() {
  const [bienDo, setBienDo] = useState(0.45);
  const [soSoc, setSoSoc] = useState(18);

  return (
    <>
      <Canvas camera={{ position: [0, 2.5, 6], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <MatSong bienDo={bienDo} soSoc={soSoc} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 2,
      }}>
        <div>
          biên độ sóng{' '}
          <input type="range" min="0" max="1.2" step="0.01" value={bienDo}
                 onChange={(e) => setBienDo(Number(e.target.value))}
                 style={{ width: 110, verticalAlign: 'middle' }} />
          {' '}{bienDo.toFixed(2)}
        </div>
        <div>
          số sọc{' '}
          <input type="range" min="2" max="60" step="1" value={soSoc}
                 onChange={(e) => setSoSoc(Number(e.target.value))}
                 style={{ width: 110, verticalAlign: 'middle' }} />
          {' '}{soSoc}
        </div>
        <div style={{ color: '#666', fontSize: 10 }}>
          không có đèn nào — màu do fragment shader tự tính
        </div>
      </div>
    </>
  );
}
`;

export const LESSON_6_4: LessonContent = {
  id: '6-4',

  goal: 'Hiểu vertex shader chạy **mỗi đỉnh** còn fragment shader chạy **mỗi pixel** — và vì sao điều đó quyết định chi phí.',

  lecture: [
    'Bài này là tuỳ chọn. Mô tả công việc không yêu cầu GLSL, và tài liệu chính thức của Three.js cũng không dạy nó. Chỉ làm khi Module 1–5 đã xong và bạn còn thời gian, hoặc khi muốn tạo khác biệt cho công việc thiên về sáng tạo về sau.',

    'Nhưng nếu làm thì có một điều đáng giá hơn cả cú pháp GLSL: hiểu **shader chạy ở đâu trong đường ống**. Cho tới giờ mọi material bạn dùng đều là shader do Three.js viết sẵn. `ShaderMaterial` cho bạn thay thế chúng bằng code của mình.',

    'Có hai loại shader và sự khác biệt giữa chúng quyết định mọi quyết định về hiệu năng. **Vertex shader** chạy một lần cho mỗi đỉnh; nhiệm vụ bắt buộc là tính `gl_Position`, tức vị trí đỉnh trên màn hình. **Fragment shader** chạy một lần cho mỗi **pixel** được tô; nhiệm vụ là tính màu. Với một mặt phẳng 128×128 segment phủ nửa màn hình, vertex shader chạy khoảng mười sáu nghìn lần còn fragment shader chạy hàng triệu lần. Đó là lý do mọi phép tính nặng nên đẩy về vertex shader nếu có thể.',

    'Cầu nối giữa hai loại là **`varying`**: giá trị được vertex shader ghi ra và fragment shader đọc vào, đã được **nội suy** giữa các đỉnh của tam giác. Trong sandbox tôi truyền `vUv` và `vDoCao` theo cách này — hãy chú ý rằng độ cao sóng được tính ở vertex shader nhưng dùng để chỉnh màu ở fragment shader.',

    'Còn **`uniform`** là dữ liệu truyền từ JavaScript vào, giống nhau cho mọi đỉnh và mọi pixel trong một lượt vẽ. `uTime` là uniform kinh điển: cập nhật một con số mỗi khung hình và toàn bộ hàng nghìn đỉnh tự chuyển động. Hãy so với việc dùng JavaScript tính lại từng đỉnh — đây chính là câu trả lời cho vấn đề "animate hàng chục nghìn hạt" đã nêu ở bài 6.1.',
  ],

  concepts: [
    {
      term: 'Vertex shader',
      explain:
        'Chạy một lần cho mỗi đỉnh. Bắt buộc gán `gl_Position`. Có sẵn các biến `position`, `uv`, `normal`, cùng ma trận `modelViewMatrix` và `projectionMatrix`.',
    },
    {
      term: 'Fragment shader',
      explain:
        'Chạy một lần cho mỗi pixel được tô. Bắt buộc gán `gl_FragColor`. Số lần chạy lớn hơn vertex shader rất nhiều — đây là nơi chi phí dồn vào.',
    },
    {
      term: 'uniform',
      explain:
        'Dữ liệu từ JavaScript, giống nhau cho mọi đỉnh và pixel trong một lượt vẽ. Cập nhật rất rẻ vì chỉ gửi vài byte lên GPU.',
    },
    {
      term: 'varying',
      explain:
        'Giá trị vertex shader ghi ra và fragment shader đọc vào, được nội suy tuyến tính giữa các đỉnh của tam giác.',
    },
    {
      term: 'attribute',
      explain:
        'Dữ liệu riêng cho từng đỉnh, đến từ `BufferGeometry` — chính là `position`, `uv`, `color` bạn đã dựng ở bài 1.2 và 6.1.',
    },
    {
      term: 'Chuỗi ma trận',
      explain:
        '`projectionMatrix * modelViewMatrix * vec4(position, 1.0)` là công thức chuẩn đưa toạ độ cục bộ về không gian màn hình. Thứ tự nhân không đảo được.',
    },
  ],

  walkthrough: [
    {
      action: 'Viết vertex shader tối giản chỉ gán `gl_Position` bằng chuỗi ma trận chuẩn.',
      why: 'Đây là dòng bắt buộc. Thiếu nó shader không biên dịch được.',
    },
    {
      action: 'Viết fragment shader gán một màu cố định.',
      why: 'Chạy được một màu duy nhất trước, rồi mới thêm phức tạp. Lỗi GLSL rất khó đọc nên nên đi từng bước nhỏ.',
    },
    {
      action: 'Thêm uniform `uTime`, cập nhật trong `useFrame`.',
      why: 'Tạo `uniforms` bằng `useMemo` một lần — tạo lại mỗi khung hình sẽ buộc biên dịch lại shader.',
    },
    {
      action: 'Khai báo `varying vec2 vUv`, gán `vUv = uv` ở vertex, đọc ở fragment để vẽ gradient.',
      why: 'Đây là cách dữ liệu đi từ vertex sang fragment. Hiểu chỗ này là hiểu đường ống.',
    },
    {
      action: 'Dùng `sin(vUv.x * n + uTime)` để tạo sọc động.',
      why: '`sin` là công cụ chủ lực trong shader vì nó tuần hoàn và mượt.',
    },
    {
      action: 'Trong vertex shader, đẩy `pos.z` theo `sin(pos.x + uTime)` để tạo sóng.',
      why: 'Đây là lúc bạn thấy vertex shader không chỉ chiếu toạ độ mà còn biến dạng được hình học.',
    },
    {
      action: 'Truyền độ cao sóng sang fragment qua một `varying` và dùng nó chỉnh màu.',
      why: 'Kết hợp hai loại shader — mẫu này xuất hiện trong hầu hết shader thực tế.',
    },
  ],

  observations: [
    {
      change: 'Giảm `planeGeometry` từ `[6, 6, 128, 128]` xuống `[6, 6, 4, 4]`.',
      observe: 'Sóng gần như biến mất, mặt phẳng chỉ gấp khúc thô.',
      why: 'Vertex shader chỉ có thể dịch chuyển những **đỉnh đang tồn tại**. Với 4×4 segment, mặt phẳng chỉ có 25 đỉnh nên không đủ để mô tả một đường cong mượt. Đây là hạn chế cốt lõi của biến dạng bằng vertex shader: bạn cần mật độ lưới tương xứng với chi tiết muốn tạo — và điều đó có chi phí riêng.',
    },
    {
      change: 'Kéo slider "số sọc" lên mức tối đa.',
      observe: 'Sọc dày đặc và bắt đầu nhiễu loạn ở vùng xa.',
      why: 'Đây là hiện tượng răng cưa do lấy mẫu: khi tần số của hoạ tiết vượt quá mật độ pixel, kết quả không còn biểu diễn đúng được. Texture giải quyết vấn đề này bằng mipmap, nhưng hoạ tiết tính bằng thủ tục trong shader thì không có mipmap — bạn phải tự xử lý, thường bằng cách làm mềm theo đạo hàm màn hình qua `fwidth()`.',
    },
    {
      change: 'Chú ý rằng scene này **không có đèn nào**.',
      observe: 'Mặt phẳng vẫn có màu và có cảm giác khối.',
      why: 'Vì `ShaderMaterial` bỏ qua toàn bộ hệ thống chiếu sáng của Three.js — bạn thay thế nó bằng code của mình. Màu ở đây do fragment shader tính trực tiếp từ `vUv` và `vDoCao`. Muốn có chiếu sáng thật thì phải tự viết, hoặc dùng `onBeforeCompile` để chèn code vào shader có sẵn của Three.js thay vì thay thế hoàn toàn.',
    },
    {
      change: 'Kéo slider "biên độ sóng" và chú ý mức tiêu thụ.',
      observe: 'Thay đổi mượt mà, không có dấu hiệu khựng.',
      why: 'Vì bạn chỉ đang cập nhật một uniform — gửi bốn byte lên GPU. Toàn bộ mười sáu nghìn đỉnh được tính lại **song song** trên GPU. Hãy so với việc làm điều tương tự bằng JavaScript: mười sáu nghìn phép tính tuần tự cộng một lần nạp lại toàn bộ buffer, mỗi khung hình. Đây là lý do animation phức tạp trong 3D nên đẩy vào shader.',
    },
  ],

  interview: [
    {
      q: 'Vertex shader và fragment shader khác nhau thế nào?',
      a: 'Vertex shader chạy một lần cho mỗi đỉnh và có nhiệm vụ tính vị trí đỉnh trên màn hình qua `gl_Position`. Fragment shader chạy một lần cho mỗi pixel được tô và tính màu qua `gl_FragColor`. Khác biệt quan trọng nhất là **số lần chạy**: một mặt phẳng vài nghìn đỉnh phủ nửa màn hình sẽ chạy vertex shader vài nghìn lần nhưng fragment shader hàng triệu lần. Vì vậy nguyên tắc tối ưu là đẩy phép tính về vertex shader bất cứ khi nào kết quả có thể nội suy được.',
    },
    {
      q: '`uniform`, `attribute` và `varying` khác nhau ra sao?',
      a: '`attribute` là dữ liệu riêng cho từng đỉnh, đến từ `BufferGeometry` — vị trí, UV, pháp tuyến, màu. `uniform` là dữ liệu từ JavaScript, giống nhau cho mọi đỉnh và pixel trong một lượt vẽ — thời gian, màu chủ đạo, texture. `varying` là cầu nối: vertex shader ghi, fragment shader đọc, và giá trị được nội suy tuyến tính giữa ba đỉnh của mỗi tam giác. Hiểu ba khái niệm này là hiểu cách dữ liệu chảy qua đường ống đồ hoạ.',
    },
    {
      q: 'Vì sao animate trong shader rẻ hơn animate bằng JavaScript?',
      a: 'Vì GPU tính song song hàng nghìn đỉnh cùng lúc, trong khi JavaScript phải lặp tuần tự trên một luồng. Quan trọng hơn, cập nhật một uniform chỉ gửi vài byte lên GPU, còn cập nhật mảng vị trí từ JavaScript đòi hỏi nạp lại toàn bộ buffer đỉnh mỗi khung hình — với hàng chục nghìn đỉnh thì đó là hàng trăm kilobyte qua bus mỗi frame. Đánh đổi là logic khó gỡ lỗi hơn và không đọc được kết quả ngược về phía JavaScript.',
    },
    {
      q: 'Khi nào dùng `ShaderMaterial` và khi nào không?',
      a: 'Dùng khi cần hiệu ứng mà material có sẵn không làm được — biến dạng hình học theo thủ tục, hoạ tiết sinh bằng công thức, hiệu ứng nghệ thuật riêng. Không dùng khi chỉ cần chiếu sáng PBR thông thường, vì `ShaderMaterial` bỏ qua toàn bộ hệ thống ánh sáng, bóng đổ và environment map của Three.js — tự viết lại chúng là công việc rất lớn. Khi chỉ cần sửa một phần nhỏ của material có sẵn thì `onBeforeCompile` là lựa chọn tốt hơn: nó cho phép chèn code vào shader chuẩn thay vì thay thế hoàn toàn.',
    },
  ],

  checkpoints: [
    'Hiểu vertex shader chạy mỗi đỉnh, fragment shader chạy mỗi pixel.',
    'Truyền được dữ liệu từ vertex sang fragment bằng `varying`.',
    'Tạo được chuyển động chỉ bằng cập nhật uniform `uTime`.',
    'Biết vì sao mật độ lưới quyết định chất lượng biến dạng ở vertex shader.',
  ],

  sandbox: r3fSandbox(APP, { height: 480 }),
};
