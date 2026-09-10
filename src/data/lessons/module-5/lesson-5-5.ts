import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

// THỬ ĐỔI: true để tự dọn tài nguyên tạo ngoài JSX
const TU_DON_DEP = true;

/** Tài nguyên tạo trong JSX — R3F THEO DÕI và tự dispose. */
function DuocR3FQuanLy() {
  return (
    <mesh position={[-1.6, 0, 0]}>
      <torusKnotGeometry args={[0.7, 0.24, 128, 24]} />
      <meshStandardMaterial color="#0c8ce9" roughness={0.35} />
    </mesh>
  );
}

/**
 * Tài nguyên tạo BÊN NGOÀI JSX — R3F KHÔNG biết tới.
 * Đây là nguồn rò rỉ phổ biến nhất trong ứng dụng R3F thật.
 */
function TuTaoTaiNguyen() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, '#ea733a');
    g.addColorStop(1, '#9149f5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
  }, []);

  const geometry = useMemo(() => new THREE.TorusKnotGeometry(0.7, 0.24, 128, 24), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.35 }),
    [texture]
  );

  useEffect(() => {
    if (!TU_DON_DEP) return;

    // Tài nguyên tôi tự tạo thì tôi phải tự dọn. R3F chỉ quản lý
    // những gì nó tạo ra từ JSX.
    return () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [geometry, material, texture]);

  return <mesh position={[1.6, 0, 0]} geometry={geometry} material={material} />;
}

function DoBoNho() {
  const { gl } = useThree();
  const acc = useRef(0);

  useFrame((state, delta) => {
    acc.current += delta;
    if (acc.current < 0.3) return;
    acc.current = 0;

    const el = document.getElementById('mem');
    if (el) {
      el.innerHTML =
        '<b>geometries</b> <span style="color:#ea733a">' + gl.info.memory.geometries + '</span><br>' +
        '<b>textures</b> <span style="color:#ea733a">' + gl.info.memory.textures + '</span><br>' +
        '<b>programs</b> ' + (gl.info.programs?.length ?? 0);
    }
  });

  return null;
}

export default function App() {
  const [hienScene, setHienScene] = useState(true);
  const [soLanMount, setSoLanMount] = useState(1);

  return (
    <>
      <Canvas camera={{ position: [0, 1, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />

        {hienScene && (
          <>
            <DuocR3FQuanLy />
            <TuTaoTaiNguyen />
          </>
        )}

        <DoBoNho />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div id="mem" style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.9,
      }} />

      <div style={{
        position: 'fixed', bottom: 12, left: 12, display: 'flex',
        gap: 8, alignItems: 'center', flexWrap: 'wrap',
        font: '11px ui-monospace,monospace', color: '#a3a3a3',
      }}>
        <button
          onClick={() => {
            setHienScene((v) => !v);
            if (!hienScene) setSoLanMount((n) => n + 1);
          }}
          style={btn(hienScene)}
        >
          {hienScene ? 'Unmount scene' : 'Mount lại scene'}
        </button>
        <span>số lần mount: {soLanMount}</span>
        <span style={{ color: '#666' }}>
          tự dọn dẹp: {TU_DON_DEP ? 'BẬT' : 'TẮT'}
        </span>
      </div>
    </>
  );
}

function btn(active) {
  return {
    padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
    border: '1px solid ' + (active ? '#0c8ce9' : '#333'),
    background: active ? 'rgba(12,140,233,.15)' : '#111',
    color: active ? '#0c8ce9' : '#a3a3a3',
    font: '11px ui-monospace,monospace',
  };
}
`;

export const LESSON_5_5: LessonContent = {
  id: '5-5',

  goal: 'Biết chính xác R3F tự dọn cái gì và **không** tự dọn cái gì — rồi chứng minh scene của bạn không rò rỉ qua nhiều lần mount.',

  lecture: [
    'Ở bài 1.6 bạn đã duyệt scene gọi `dispose()` từng cái và có hai dãy số chứng minh việc đó cần thiết. Rồi ở bài 4.2 bạn thấy R3F tự làm hộ. Bài này làm rõ ranh giới giữa hai điều đó, vì hiểu sai ranh giới này là nguồn rò rỉ phổ biến nhất trong ứng dụng R3F thật.',

    'Quy tắc rất gọn: **R3F dọn những gì R3F tạo ra**. Khi bạn viết `<boxGeometry args={[1,1,1]} />` trong JSX, chính R3F gọi constructor, nên nó ghi sổ và gọi `dispose()` khi phần tử rời khỏi cây. Nhưng khi bạn viết `new THREE.CanvasTexture(...)` trong `useMemo`, R3F không hề biết đối tượng đó tồn tại — nó chỉ nhận về một tham chiếu và gán vào material.',

    'Điều nguy hiểm là code kiểu thứ hai rất phổ biến và trông rất hợp lý. Bạn cần một texture sinh động, một geometry tính toán riêng, một render target — tất cả đều phải tạo bên ngoài JSX. Và tất cả đều là trách nhiệm của bạn.',

    'Có một ngoại lệ đáng chú ý: các hook tải tài nguyên như `useGLTF` và `useTexture` lưu vào **cache dùng chung**, cố ý không dispose khi component unmount để lần sau dùng lại được. Đó là hành vi mong muốn trong hầu hết trường hợp, nhưng nếu bạn tải rất nhiều model khác nhau thì cache sẽ phình. Khi cần, `useGLTF.clear(url)` xoá thủ công.',

    'Sandbox có nút mount/unmount và bộ đếm bộ nhớ. Hãy bấm qua lại nhiều lần với `TU_DON_DEP` bật, ghi lại con số, rồi đổi thành `false` và làm lại. Hai dãy số đó là phiên bản R3F của bằng chứng bạn đã có ở bài 1.6.',
  ],

  concepts: [
    {
      term: 'R3F tự dispose',
      explain:
        'Mọi đối tượng được tạo từ JSX — geometry, material, texture khai báo dạng thẻ — được ghi sổ và giải phóng khi phần tử rời khỏi cây.',
    },
    {
      term: 'R3F KHÔNG tự dispose',
      explain:
        'Đối tượng bạn tự `new` trong `useMemo` hoặc `useEffect`, render target tự tạo, texture sinh từ canvas. R3F chỉ nhận tham chiếu, không sở hữu.',
    },
    {
      term: 'Cache của useGLTF / useTexture',
      explain:
        'Cố ý giữ lại sau unmount để tái sử dụng. Xoá thủ công bằng `useGLTF.clear(url)` khi thật sự cần giải phóng.',
    },
    {
      term: 'gl.info.memory',
      explain:
        'Công cụ chẩn đoán chính. Mount rồi unmount nhiều lần: con số phải quay về mức cũ, không được tăng đơn điệu.',
    },
    {
      term: 'Dọn trong useEffect',
      explain:
        'Hàm trả về của `useEffect` là nơi dispose tài nguyên tự tạo. Nhớ khai báo đúng dependency để không dọn nhầm đối tượng đang dùng.',
    },
  ],

  walkthrough: [
    {
      action: 'Dựng hai vật thể: một khai báo hoàn toàn bằng JSX, một tạo tài nguyên trong `useMemo`.',
      why: 'Đặt cạnh nhau để thấy rõ ranh giới giữa hai loại quyền sở hữu.',
    },
    {
      action: 'Hiển thị `gl.info.memory` lên màn hình, cập nhật bằng thao tác DOM trực tiếp.',
      why: 'Không dùng `setState` cho việc này — đúng bài học 4.5.',
    },
    {
      action: 'Với tài nguyên tự tạo, viết `useEffect` trả về hàm gọi `dispose()`.',
      why: 'Nhớ đưa đúng đối tượng vào mảng dependency, nếu không cleanup có thể chạy sai thời điểm.',
    },
    {
      action: 'Bấm mount/unmount mười lần với `TU_DON_DEP = true`, ghi lại `geometries` và `textures`.',
      why: 'Đây là đường cơ sở của một scene sạch.',
    },
    {
      action: 'Đổi `TU_DON_DEP = false`, tải lại, rồi lặp lại mười lần.',
      why: 'Hai dãy số này là bằng chứng bạn mang đi phỏng vấn.',
    },
    {
      action: 'Chú ý phần được R3F quản lý — nó luôn sạch dù bạn không viết dòng dọn dẹp nào.',
      why: 'Để thấy rõ rằng vấn đề không nằm ở R3F mà nằm ở phần bạn tự tạo.',
    },
  ],

  observations: [
    {
      change: 'Đặt `TU_DON_DEP = false` rồi mount/unmount nhiều lần, theo dõi `textures`.',
      observe: 'Con số tăng thêm sau mỗi chu kỳ và không bao giờ giảm.',
      why: '`CanvasTexture` tạo trong `useMemo` được nạp lên GPU khi lần đầu render. Khi component unmount, React thu hồi đối tượng JavaScript nếu không còn tham chiếu, nhưng bộ nhớ GPU thì không — vì không ai gọi `dispose()` để báo cho driver. R3F không thể tự làm vì nó chưa bao giờ biết texture đó tồn tại; nó chỉ thấy một giá trị được gán vào thuộc tính `map`.',
    },
    {
      change: 'Bật lại `TU_DON_DEP = true` và lặp lại.',
      observe: 'Con số dao động rồi quay về mức cũ sau mỗi chu kỳ.',
      why: 'Hàm cleanup của `useEffect` chạy khi component unmount và gọi `dispose()` trên đúng ba tài nguyên bạn tạo. Đây là mẫu chuẩn: cái gì bạn `new` thì bạn dispose, và chỗ đặt lệnh dispose là hàm trả về của `useEffect`.',
    },
    {
      change: 'Chú ý riêng phần vật thể bên trái, phần khai báo hoàn toàn bằng JSX.',
      observe: 'Nó luôn được dọn sạch, kể cả khi `TU_DON_DEP = false`.',
      why: 'Vì R3F tự tạo geometry và material đó từ thẻ JSX nên nó ghi sổ và biết phải giải phóng khi phần tử rời khỏi cây. Đây là lý do nên ưu tiên khai báo bằng JSX khi có thể — không chỉ ngắn gọn hơn mà còn tự động đúng về vòng đời.',
    },
    {
      change: 'Trong dự án thật, dùng `useGLTF` rồi unmount và theo dõi bộ nhớ.',
      observe: 'Bộ nhớ **không** giảm.',
      why: 'Đây là hành vi cố ý chứ không phải lỗi. `useGLTF` lưu model vào cache dùng chung để lần sau hiển thị tức thì thay vì tải lại. Với ứng dụng chuyển qua lại giữa vài model thì đó là lựa chọn đúng. Nhưng với ứng dụng duyệt hàng trăm model khác nhau, cache sẽ phình dần — lúc đó cần gọi `useGLTF.clear(url)` cho những model chắc chắn không quay lại.',
    },
  ],

  interview: [
    {
      q: 'R3F tự dispose những gì và không tự dispose những gì?',
      a: 'Nó tự dispose mọi đối tượng do chính nó tạo ra từ JSX — geometry, material, texture khai báo dạng thẻ — vì nó ghi sổ những gì mình khởi tạo. Nó **không** biết tới đối tượng bạn tự `new` trong `useMemo` hay `useEffect`, render target tự tạo, hay texture sinh từ canvas; những thứ đó chỉ được truyền vào như một tham chiếu. Quy tắc tôi dùng là: cái gì tôi tạo thì tôi dispose, và chỗ đặt lệnh đó là hàm cleanup của `useEffect`.',
    },
    {
      q: 'Vì sao `useGLTF` không giải phóng bộ nhớ khi unmount?',
      a: 'Vì nó lưu vào cache dùng chung một cách có chủ đích, để lần sau hiển thị cùng model thì tức thì thay vì tải và phân tích lại. Đó là đánh đổi đúng cho hầu hết ứng dụng vì model thường được xem đi xem lại. Nhưng với ứng dụng duyệt qua rất nhiều model khác nhau, cache sẽ phình không giới hạn — khi đó cần `useGLTF.clear(url)` cho những model chắc chắn không dùng lại, hoặc tự quản lý một cache có giới hạn.',
    },
    {
      q: 'Bạn phát hiện rò rỉ bộ nhớ GPU trong ứng dụng R3F thế nào?',
      a: 'Theo dõi `gl.info.memory.geometries` và `.textures` qua nhiều chu kỳ mount/unmount — con số phải quay về mức cũ chứ không tăng đơn điệu. Nếu tăng, tôi rà những chỗ tạo tài nguyên ngoài JSX trước tiên vì đó là nguyên nhân phổ biến nhất. Sâu hơn thì dùng heap snapshot của Chrome DevTools để tìm tham chiếu còn sót giữ đối tượng lại, và tab Performance xem đồ thị bộ nhớ có dạng răng cưa đi lên không.',
    },
    {
      q: 'Ngoài dispose, còn nguồn rò rỉ nào trong R3F?',
      a: 'Event listener gắn vào `window` hoặc `document` trong `useEffect` mà quên gỡ. Vòng lặp hoặc timer tạo ngoài `useFrame` mà không huỷ. Subscription của store giữ tham chiếu tới component đã unmount. `AnimationMixer` giữ tham chiếu tới cây node nếu không gọi `uncacheRoot`. Và closure trong `useFrame` bắt giữ đối tượng lớn — dù không rò rỉ GPU nhưng vẫn giữ bộ nhớ JavaScript.',
    },
  ],

  checkpoints: [
    'Có hai dãy số `gl.info.memory` chứng minh có và không có rò rỉ.',
    'Nói được chính xác R3F tự dọn cái gì và không dọn cái gì.',
    'Biết vì sao `useGLTF` cố ý giữ lại tài nguyên trong cache.',
    'Đặt lệnh dispose đúng chỗ — hàm trả về của `useEffect`.',
  ],

  sandbox: r3fSandbox(APP, { height: 460 }),
};
