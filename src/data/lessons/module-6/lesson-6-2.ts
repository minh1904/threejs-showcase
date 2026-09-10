import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

/**
 * Nội dung được render VÀO render target — đây là "chương trình TV".
 * Nó nằm trong một scene RIÊNG, không thuộc scene chính.
 */
function NoiDungTV() {
  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 1.2;
    ref.current.rotation.y += delta * 0.8;
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.5} />
      <mesh ref={ref}>
        <torusKnotGeometry args={[0.9, 0.32, 128, 24]} />
        <meshStandardMaterial color="#ea733a" roughness={0.25} metalness={0.6} />
      </mesh>
    </>
  );
}

function ManHinhTV({ bat }) {
  const { gl, camera: cameraChinh } = useThree();

  // Scene phụ và camera phụ — hoàn toàn tách biệt scene chính
  const scenePhu = useMemo(() => {
    const s = new THREE.Scene();
    s.background = new THREE.Color('#101820');
    return s;
  }, []);

  const cameraPhu = useMemo(() => {
    const c = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 50);
    c.position.set(0, 0, 3.5);
    return c;
  }, []);

  // WebGLRenderTarget: một "màn hình ảo" trong bộ nhớ GPU.
  // Render vào đây thay vì ra canvas thật.
  const target = useMemo(
    () => new THREE.WebGLRenderTarget(1024, 576, { samples: 4 }),
    []
  );

  useFrame(() => {
    if (!bat) return;

    // Đổi đích render sang target, vẽ, rồi TRẢ VỀ null (= canvas thật).
    // Quên dòng setRenderTarget(null) là toàn bộ scene chính biến mất.
    gl.setRenderTarget(target);
    gl.render(scenePhu, cameraPhu);
    gl.setRenderTarget(null);
  }, 1); // priority 1: chạy TRƯỚC lượt render chính

  return (
    <>
      {/* createPortal đưa các phần tử JSX vào scenePhu thay vì scene chính */}
      {createPortal(<NoiDungTV />, scenePhu)}

      <mesh position={[0, 0.6, 0]}>
        <planeGeometry args={[3.2, 1.8]} />
        <meshBasicMaterial map={bat ? target.texture : null} color={bat ? '#fff' : '#111'} />
      </mesh>

      {/* Khung viền cho ra dáng cái TV */}
      <mesh position={[0, 0.6, -0.05]}>
        <planeGeometry args={[3.4, 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
    </>
  );
}

function DoDac({ bat }) {
  const { gl } = useThree();
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((state, delta) => {
    const a = acc.current;
    a.frames++; a.time += delta;
    if (a.time >= 0.4) {
      const el = document.getElementById('perf');
      if (el) {
        el.innerHTML =
          '<b>render target</b> ' + (bat ? 'bật' : 'tắt') + '<br>' +
          '<b>FPS</b> ' + Math.round(a.frames / a.time) + '<br>' +
          '<b>draw calls</b> <span style="color:#ea733a">' + gl.info.render.calls + '</span><br>' +
          '<span style="color:#666;font-size:10px">draw calls tính CẢ lượt vẽ vào target</span>';
      }
      a.frames = 0; a.time = 0;
    }
  });

  return null;
}

export default function App() {
  const [bat, setBat] = useState(true);

  return (
    <>
      <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={2} />

        <ManHinhTV bat={bat} />

        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#141414" roughness={0.9} />
        </mesh>

        <DoDac bat={bat} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div id="perf" style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.9,
      }} />

      <div style={{ position: 'fixed', bottom: 12, left: 12 }}>
        <button onClick={() => setBat((v) => !v)} style={{
          padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
          border: '1px solid ' + (bat ? '#0c8ce9' : '#333'),
          background: bat ? 'rgba(12,140,233,.15)' : '#111',
          color: bat ? '#0c8ce9' : '#a3a3a3',
          font: '11px ui-monospace,monospace',
        }}>
          render target: {bat ? 'bật' : 'tắt'}
        </button>
      </div>
    </>
  );
}
`;

export const LESSON_6_2: LessonContent = {
  id: '6-2',

  goal: 'Hiểu "render ra một texture thay vì ra màn hình" nghĩa là gì — không có bài này thì post-processing ở bài sau chỉ là phép màu không giải thích được.',

  lecture: [
    'Cho tới giờ, mỗi lần bạn gọi `renderer.render(scene, camera)`, kết quả đi thẳng ra thẻ `<canvas>`. Bài này giới thiệu một khả năng khác: render vào một **texture nằm trong bộ nhớ GPU**, rồi dùng texture đó làm bất cứ thứ gì bạn muốn.',

    'Đó là toàn bộ ý tưởng của `WebGLRenderTarget`. Bạn gọi `gl.setRenderTarget(target)` để đổi đích, `gl.render(...)` để vẽ, rồi `gl.setRenderTarget(null)` để trả về canvas thật. Kết quả nằm trong `target.texture` và dùng được như mọi texture khác — gán vào `map` của một material chẳng hạn.',

    'Từ một cơ chế đơn giản này ra được rất nhiều thứ. Đặt một camera phụ ở góc khác và bạn có **camera an ninh**. Đặt camera ở vị trí đối xứng qua một mặt phẳng và bạn có **gương**. Render một scene hoàn toàn khác và bạn có **cổng dịch chuyển** hoặc **màn hình TV** trong cảnh — đó là ví dụ trong sandbox.',

    'Nhưng lý do thật sự khiến bài này bắt buộc phải có nằm ở chỗ khác: **đây chính là cơ chế bên dưới mọi hiệu ứng post-processing**. Bloom, depth of field, vignette — tất cả đều hoạt động bằng cách render scene ra một texture rồi chạy thêm nhiều lượt xử lý trên texture đó. Không hiểu render target thì bài 6.3 chỉ là gọi component và hy vọng.',

    'Và từ đó suy ra chi phí. Mỗi render target là **thêm một lượt vẽ toàn bộ scene**. Sandbox hiển thị draw calls đã tính cả lượt phụ — hãy bật tắt và so sánh. Đây chính là lý do post-processing tốn kém, và là lý do trên di động người ta rất dè dặt với nó.',

    'Một lưu ý về dọn dẹp, nối tiếp bài 5.5: `renderTarget.dispose()` là thứ rất hay bị quên. Một render target 1024×576 với 4 mẫu khử răng cưa chiếm khá nhiều VRAM, và nó thuộc loại tài nguyên bạn tự tạo nên R3F không dọn hộ.',
  ],

  concepts: [
    {
      term: 'WebGLRenderTarget',
      explain:
        'Một bộ đệm khung hình ngoài màn hình. Render vào đó rồi dùng `target.texture` như texture bình thường. Tuỳ chọn `samples` bật khử răng cưa đa mẫu.',
    },
    {
      term: 'setRenderTarget',
      explain:
        '`gl.setRenderTarget(target)` đổi đích render; `gl.setRenderTarget(null)` trả về canvas. **Luôn phải trả về null**, nếu không lượt render chính cũng đi vào target.',
    },
    {
      term: 'createPortal của R3F',
      explain:
        'Đưa phần tử JSX vào một scene khác thay vì scene mặc định. Cách khai báo nội dung cho render target mà vẫn giữ được cú pháp React.',
    },
    {
      term: 'Thứ tự render',
      explain:
        'Tham số thứ hai của `useFrame` là mức ưu tiên. Đặt số dương để chạy trước lượt render chính — phải vẽ vào target xong thì scene chính mới có texture đúng để dùng.',
    },
    {
      term: 'Chi phí',
      explain:
        'Mỗi render target là một lượt vẽ toàn scene phụ trội, cộng bộ nhớ cho bộ đệm. Đây là gốc rễ chi phí của post-processing.',
    },
    {
      term: 'Depth texture',
      explain:
        'Render target có thể lưu cả độ sâu qua `depthTexture`. Nền tảng cho hiệu ứng xoá phông, sương mù theo chiều sâu, và phát hiện cạnh.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo `new THREE.WebGLRenderTarget(1024, 576, { samples: 4 })`.',
      why: 'Kích thước quyết định độ nét và bộ nhớ. `samples` bật khử răng cưa, không có nó thì cạnh trong "TV" sẽ răng cưa rõ.',
    },
    {
      action: 'Tạo một `THREE.Scene` và một camera riêng cho nội dung phụ.',
      why: 'Nội dung render vào target phải nằm ở scene tách biệt, nếu không nó sẽ xuất hiện cả trong cảnh chính.',
    },
    {
      action: 'Dùng `createPortal` của R3F để đưa JSX vào scene phụ.',
      why: 'Giữ được cú pháp khai báo thay vì phải tự `scene.add()` bằng tay.',
    },
    {
      action: 'Trong `useFrame` với mức ưu tiên dương: `setRenderTarget(target)` → `render()` → `setRenderTarget(null)`.',
      why: 'Ưu tiên dương đảm bảo lượt này chạy trước lượt render chính, để texture đã sẵn sàng khi cảnh chính dùng tới.',
    },
    {
      action: 'Gán `target.texture` vào `map` của một `planeGeometry`.',
      why: 'Đây là lúc bạn thấy render target thật sự chỉ là một texture như mọi texture khác.',
    },
    {
      action: 'Ghi lại draw calls khi bật và khi tắt render target.',
      why: 'Con số này giải thích trực tiếp vì sao post-processing tốn kém.',
    },
    {
      action: 'Gọi `target.dispose()` trong cleanup.',
      why: 'Render target là tài nguyên bạn tự tạo nên R3F không dọn hộ — nối tiếp bài 5.5.',
    },
  ],

  observations: [
    {
      change: 'Bật rồi tắt render target và so sánh draw calls.',
      observe: 'Số draw call tăng thêm khi bật, đúng bằng số lệnh cần để vẽ scene phụ.',
      why: 'Vì bạn đang render **hai lần** mỗi khung hình: một lần vào target, một lần ra canvas. Đây là quy luật chung — mỗi render target là một lượt vẽ toàn cảnh phụ trội. Với post-processing dùng nhiều lượt xử lý liên tiếp, con số này nhân lên rất nhanh.',
    },
    {
      change: 'Trong dự án thật, xoá dòng `gl.setRenderTarget(null)`.',
      observe: 'Màn hình đen hoàn toàn hoặc chỉ hiện nội dung phụ.',
      why: 'Vì đích render vẫn còn trỏ vào target, nên lượt render chính của R3F cũng đi vào bộ nhớ thay vì ra canvas. Đây là lỗi kinh điển khi làm việc với render target, và triệu chứng — màn hình đen — không gợi ý gì về nguyên nhân.',
    },
    {
      change: 'Đổi mức ưu tiên của `useFrame` từ `1` xuống `0` hoặc bỏ hẳn.',
      observe: 'Nội dung TV bị trễ một khung hình so với thực tế.',
      why: 'Với ưu tiên mặc định, lượt vẽ vào target có thể chạy **sau** lượt render chính, nên cảnh chính dùng texture của khung trước. Với chuyển động chậm thì không ai nhận ra, nhưng với gương phản chiếu vật thể nhanh thì độ trễ này rất rõ. Ưu tiên dương buộc R3F chạy callback đó trước.',
    },
    {
      change: 'Giảm kích thước render target từ `1024×576` xuống `128×72`.',
      observe: 'Nội dung TV vỡ hạt nhưng FPS tăng.',
      why: 'Render target cũng là một khung hình phải tô đầy đủ, nên chi phí tỉ lệ với số pixel của nó. Đây là đòn bẩy tối ưu chính khi dùng render target: chọn độ phân giải theo diện tích nó thực sự chiếm trên màn hình, không phải theo độ phân giải màn hình. Nhiều hiệu ứng post-processing như bloom cố ý dùng độ phân giải thấp vì kết quả vốn đã mờ.',
    },
  ],

  interview: [
    {
      q: 'Render target là gì và dùng để làm gì?',
      a: 'Là một bộ đệm khung hình ngoài màn hình — bạn render scene vào bộ nhớ GPU thay vì ra canvas, rồi dùng kết quả như một texture bình thường. Ứng dụng trực tiếp gồm gương, camera an ninh, màn hình trong cảnh, cổng dịch chuyển. Nhưng quan trọng hơn, nó là cơ chế nền tảng của toàn bộ post-processing: mọi hiệu ứng đều hoạt động bằng cách render cảnh ra texture rồi chạy thêm các lượt xử lý trên đó.',
    },
    {
      q: 'Vì sao post-processing tốn kém?',
      a: 'Vì mỗi lượt xử lý là một lần vẽ toàn màn hình. Cảnh được render ra texture, rồi mỗi hiệu ứng đọc texture đó và ghi ra một texture khác — với bloom thì còn nhiều lượt vì nó phải lọc ngưỡng, làm mờ nhiều bậc, rồi ghép lại. Chi phí tỉ lệ với số pixel nhân số lượt, nên nó ảnh hưởng nặng nhất ở độ phân giải cao và trên GPU di động vốn giới hạn băng thông bộ nhớ.',
    },
    {
      q: 'Cần chú ý gì khi dùng render target?',
      a: 'Ba điều. Luôn gọi `setRenderTarget(null)` sau khi vẽ xong, nếu không lượt render chính cũng đi vào target và màn hình đen. Đặt mức ưu tiên `useFrame` dương để lượt vẽ phụ chạy trước lượt chính, tránh trễ một khung hình. Và nhớ `dispose()` khi unmount — render target chiếm khá nhiều VRAM và thuộc loại tài nguyên tự tạo nên R3F không dọn hộ.',
    },
    {
      q: 'Làm gương bằng render target như thế nào?',
      a: 'Đặt một camera phụ ở vị trí đối xứng của camera chính qua mặt phẳng gương, với hướng nhìn cũng được phản chiếu tương ứng. Render scene bằng camera đó vào một render target, rồi áp texture kết quả lên mặt gương với toạ độ UV tính theo vị trí trên màn hình thay vì UV của geometry. Cần thêm mặt phẳng cắt để không render những gì nằm sau gương. drei có `<MeshReflectorMaterial>` gói sẵn toàn bộ việc này kèm cả làm mờ theo độ nhám.',
    },
  ],

  checkpoints: [
    'Hiểu "render ra texture" nghĩa là gì và làm được một màn hình trong cảnh.',
    'Biết vì sao phải gọi `setRenderTarget(null)` và triệu chứng khi quên.',
    'Có số draw calls trước và sau khi thêm render target.',
    'Nhớ `dispose()` render target khi unmount.',
  ],

  sandbox: r3fSandbox(APP, { height: 480 }),
};
