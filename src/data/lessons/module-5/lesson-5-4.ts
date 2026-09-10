import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './styles.css';

/** Đếm số khung hình THỰC SỰ được render — không phải số lần useFrame chạy. */
function DemFrame({ nhan }) {
  const soFrame = useRef(0);

  useFrame(() => {
    soFrame.current++;
    const el = document.getElementById('dem');
    if (el) el.textContent = soFrame.current.toLocaleString();
  });

  return null;
}

function KhoiXoay({ dangXoay }) {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!dangXoay) return;
    ref.current.rotation.y += delta * 0.8;
    ref.current.rotation.x += delta * 0.3;

    // Ở chế độ demand, useFrame chỉ chạy khi có yêu cầu render.
    // Muốn animation liên tục thì phải tự yêu cầu khung hình kế tiếp.
    invalidate();
  });

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1, 0.32, 160, 32]} />
      <meshStandardMaterial color="#0c8ce9" roughness={0.3} metalness={0.5} />
    </mesh>
  );
}

/** Đổi màu bằng state — thay đổi rời rạc, đúng kiểu hợp với demand. */
function DoiMau({ mau }) {
  return (
    <mesh position={[2.6, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={mau} roughness={0.4} />
    </mesh>
  );
}

export default function App() {
  const [demand, setDemand] = useState(true);
  const [dangXoay, setDangXoay] = useState(false);
  const [mau, setMau] = useState('#ea733a');

  return (
    <>
      {/* key ép Canvas dựng lại khi đổi frameloop, để bộ đếm về 0 */}
      <Canvas
        key={demand ? 'demand' : 'always'}
        frameloop={demand ? 'demand' : 'always'}
        camera={{ position: [0, 1, 6], fov: 45 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />

        <KhoiXoay dangXoay={dangXoay} />
        <DoiMau mau={mau} />
        <DemFrame />

        {/* OrbitControls tự gọi invalidate() khi người dùng kéo,
            nên xoay camera vẫn mượt ở chế độ demand. */}
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.9,
      }}>
        <div>frameloop: <b style={{ color: '#0c8ce9' }}>{demand ? 'demand' : 'always'}</b></div>
        <div>khung hình đã vẽ: <b id="dem" style={{ color: '#ea733a' }}>0</b></div>
        <div style={{ color: '#666', fontSize: 10 }}>
          để yên và quan sát con số này
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 12, left: 12, display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        <button onClick={() => setDemand((v) => !v)} style={btn(demand)}>
          {demand ? 'demand' : 'always'}
        </button>
        <button onClick={() => setDangXoay((v) => !v)} style={btn(dangXoay)}>
          animation: {dangXoay ? 'bật' : 'tắt'}
        </button>
        <button
          onClick={() => setMau(mau === '#ea733a' ? '#9149f5' : '#ea733a')}
          style={btn(false)}
        >
          đổi màu (một lần)
        </button>
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

export const LESSON_5_4: LessonContent = {
  id: '5-4',

  goal: 'Cắt gần như toàn bộ chi phí render cho scene tĩnh, bằng cách chỉ vẽ khi thực sự có gì đó thay đổi.',

  lecture: [
    'Mặc định, R3F render 60 khung hình mỗi giây, mãi mãi. Với một scene đang chuyển động thì đó là điều cần thiết. Nhưng rất nhiều ứng dụng 3D thực tế **phần lớn thời gian là tĩnh**: trang cấu hình sản phẩm, viewer kiến trúc, bản đồ. Người dùng xoay camera vài giây rồi ngồi nhìn. Trong khoảng đó, bạn đang vẽ đi vẽ lại cùng một hình ảnh 60 lần mỗi giây.',

    'Chi phí của việc đó rất thật: pin điện thoại, quạt laptop, và trên máy chia sẻ tài nguyên thì cả trải nghiệm của những tab khác. `frameloop="demand"` đổi mô hình từ "vẽ liên tục" sang "vẽ khi được yêu cầu".',

    'Cơ chế xoay quanh hàm `invalidate()`: gọi nó để yêu cầu một khung hình. R3F tự gọi khi state React đổi, và các controls của drei tự gọi khi người dùng tương tác — nên phần lớn trường hợp mọi thứ hoạt động đúng mà không cần làm gì.',

    'Chỗ cần chú ý là **animation liên tục**. Ở chế độ demand, `useFrame` chỉ chạy khi có khung hình được yêu cầu; nó không tự sinh ra khung hình kế tiếp. Nên nếu bạn xoay vật thể trong `useFrame`, phải gọi `invalidate()` ở cuối để yêu cầu khung tiếp theo — thực chất là tự tay quay lại chế độ liên tục cho riêng phần đó.',

    'Điều đó dẫn tới nguyên tắc chọn: `demand` phù hợp khi chuyển động là **ngoại lệ**, `always` phù hợp khi chuyển động là **thường trực**. Một trang cấu hình sản phẩm nên dùng demand. Một game thì không. Sandbox có nút chuyển và bộ đếm khung hình — hãy để yên vài giây ở mỗi chế độ và so sánh.',
  ],

  concepts: [
    {
      term: 'frameloop="demand"',
      explain:
        'Chỉ render khi có yêu cầu, thay vì liên tục. Đặt trên `<Canvas>`. Các giá trị khác: `always` (mặc định) và `never` (tự điều khiển hoàn toàn).',
    },
    {
      term: 'invalidate()',
      explain:
        'Yêu cầu một khung hình. Import từ `@react-three/fiber`, hoặc lấy từ `useThree()`. R3F và drei tự gọi khi state đổi hoặc người dùng tương tác.',
    },
    {
      term: 'useFrame ở chế độ demand',
      explain:
        'Chỉ chạy khi có khung hình được yêu cầu. Muốn animation liên tục thì phải tự gọi `invalidate()` ở cuối callback.',
    },
    {
      term: 'Khi nào dùng demand',
      explain:
        'Khi chuyển động là ngoại lệ — trang sản phẩm, viewer kiến trúc, công cụ cấu hình. Không dùng cho game hay scene có hoạt ảnh nền liên tục.',
    },
    {
      term: 'Tạm dừng khi ngoài khung nhìn',
      explain:
        'Kỹ thuật bổ sung: dùng `IntersectionObserver` để dừng hẳn vòng lặp khi canvas cuộn ra khỏi màn hình. Có `frameloop="never"` cho trường hợp cần kiểm soát tuyệt đối.',
    },
  ],

  walkthrough: [
    {
      action: 'Đặt `frameloop="demand"` trên `<Canvas>`.',
      why: 'Chỉ một prop. Phần lớn ứng dụng chạy đúng ngay mà không cần sửa gì thêm.',
    },
    {
      action: 'Để yên trang vài giây và quan sát bộ đếm khung hình.',
      why: 'Ở chế độ demand con số đứng im; ở chế độ always nó tăng đều 60 lần mỗi giây.',
    },
    {
      action: 'Kéo chuột xoay camera và xác nhận vẫn mượt.',
      why: '`OrbitControls` của drei tự gọi `invalidate()` khi có tương tác, nên không cần làm gì.',
    },
    {
      action: 'Bấm nút đổi màu và xác nhận màu cập nhật.',
      why: 'R3F tự yêu cầu khung hình khi state React đổi. Đây là kiểu thay đổi rời rạc mà demand phục vụ hoàn hảo.',
    },
    {
      action: 'Bật animation và chú ý dòng `invalidate()` cuối `useFrame`.',
      why: 'Thử xoá dòng đó để thấy vật thể đứng im — đây là điểm cần nhớ duy nhất của chế độ demand.',
    },
    {
      action: 'So sánh mức tiêu thụ trong tab Performance của DevTools giữa hai chế độ.',
      why: 'Số liệu cụ thể cho lập luận về tiết kiệm pin khi trình bày với người khác.',
    },
  ],

  observations: [
    {
      change: 'Đặt chế độ `demand`, tắt animation, rồi để yên trang mười giây.',
      observe: 'Bộ đếm khung hình dừng hẳn.',
      why: 'Không có gì thay đổi thì không có gì cần vẽ lại — hình ảnh trên canvas vẫn nguyên đó vì buffer không bị xoá. GPU hoàn toàn rảnh. Với một trang cấu hình sản phẩm mà người dùng ngồi ngắm ba mươi giây, bạn vừa tiết kiệm được khoảng một nghìn tám trăm khung hình.',
    },
    {
      change: 'Chuyển sang `always` và cũng để yên.',
      observe: 'Bộ đếm tăng đều đặn khoảng 60 mỗi giây dù không có gì đổi.',
      why: 'Đây là hành vi mặc định và là thứ hầu hết ứng dụng R3F đang làm mà không nhận ra. Với scene tĩnh, mỗi khung hình đó là công việc vô ích hoàn toàn: cùng dữ liệu vào, cùng pixel ra. Trên di động điều này thể hiện trực tiếp thành pin hao và máy nóng.',
    },
    {
      change: 'Ở chế độ `demand`, bật animation rồi xoá dòng `invalidate()` trong `useFrame`.',
      observe: 'Vật thể chỉ nhúc nhích khi bạn kéo chuột, rồi lại đứng im.',
      why: 'Đây là điểm cần nhớ quan trọng nhất của chế độ demand. `useFrame` không tự sinh ra khung hình kế tiếp — nó chỉ chạy khi ai đó yêu cầu render. Kéo chuột kích hoạt `invalidate()` từ controls, nên bạn thấy một vài khung. Muốn animation chạy liên tục thì phải tự yêu cầu khung tiếp theo ở cuối mỗi lần chạy.',
    },
    {
      change: 'Ở chế độ `demand`, bấm nút đổi màu.',
      observe: 'Màu cập nhật ngay lập tức, và bộ đếm chỉ tăng thêm một vài đơn vị.',
      why: 'R3F tự gọi `invalidate()` sau mỗi lần commit của React. Đây là mẫu lý tưởng cho chế độ demand: thay đổi rời rạc do người dùng kích hoạt, mỗi thay đổi tốn đúng một khung hình. Một trang cấu hình sản phẩm với hàng chục tuỳ chọn hoạt động chính xác theo kiểu này.',
    },
  ],

  interview: [
    {
      q: '`frameloop="demand"` giải quyết vấn đề gì?',
      a: 'Việc render liên tục một scene không thay đổi. Mặc định R3F vẽ 60 khung mỗi giây bất kể có gì đổi hay không, mà rất nhiều ứng dụng 3D thực tế phần lớn thời gian là tĩnh — trang sản phẩm, viewer kiến trúc, công cụ cấu hình. Chế độ demand chỉ render khi có yêu cầu qua `invalidate()`, và R3F tự gọi khi state đổi còn drei tự gọi khi người dùng tương tác. Kết quả là cắt gần hết chi phí GPU trong lúc nhàn rỗi, đổi lại thành pin và nhiệt độ máy.',
    },
    {
      q: 'Cần chú ý gì khi chuyển sang chế độ demand?',
      a: 'Điểm chính là `useFrame` không còn tự chạy liên tục — nó chỉ chạy khi có khung hình được yêu cầu. Mọi animation liên tục phải tự gọi `invalidate()` ở cuối callback để xin khung tiếp theo. Ngoài ra, những thay đổi không đi qua state React và không qua controls — ví dụ ghi thẳng vào thuộc tính đối tượng từ một callback bên ngoài — cũng cần gọi `invalidate()` thủ công, nếu không chúng sẽ không hiển thị cho tới khi có sự kiện khác kích hoạt render.',
    },
    {
      q: 'Khi nào không nên dùng demand?',
      a: 'Khi chuyển động là thường trực chứ không phải ngoại lệ: game, mô phỏng vật lý, scene có hoạt ảnh nền liên tục, hoặc bất cứ thứ gì dùng shader biến đổi theo thời gian. Trong những trường hợp đó bạn sẽ phải gọi `invalidate()` mỗi khung hình, tức là quay lại đúng chế độ `always` nhưng thêm một tầng phức tạp vô ích. Nguyên tắc là nhìn vào tỉ lệ thời gian scene thực sự thay đổi.',
    },
    {
      q: 'Còn cách nào khác để giảm chi phí render lúc nhàn rỗi?',
      a: 'Dùng `IntersectionObserver` để dừng hẳn vòng lặp khi canvas cuộn ra khỏi khung nhìn — với trang dài có 3D ở đầu thì đây là khoản lãi lớn. Lắng nghe sự kiện `visibilitychange` để dừng khi tab bị ẩn, dù `requestAnimationFrame` đã tự làm phần lớn việc này. Hạ pixel ratio hoặc giới hạn tần số khung hình khi không có tương tác trong một khoảng thời gian. Và `<PerformanceMonitor>` của drei có thể tự hạ chất lượng khi FPS tụt — đó là nội dung bài 5.6.',
    },
  ],

  checkpoints: [
    'Bộ đếm khung hình dừng hẳn khi scene tĩnh ở chế độ demand.',
    'Hiểu vì sao animation cần tự gọi `invalidate()`.',
    'Xoay camera và đổi state vẫn hoạt động mượt không cần sửa gì.',
    'Nói được khi nào nên dùng demand và khi nào không.',
  ],

  sandbox: r3fSandbox(APP, { height: 460 }),
};
