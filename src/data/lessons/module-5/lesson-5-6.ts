import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  ContactShadows,
} from '@react-three/drei';
import './styles.css';

function Cum({ soLuong, chatLuong }) {
  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.15;
  });

  const seg = chatLuong === 'cao' ? 48 : chatLuong === 'vua' ? 20 : 8;

  return (
    <group ref={ref}>
      {Array.from({ length: soLuong }, (_, i) => {
        const a = (i / soLuong) * Math.PI * 2;
        const r = 2.4 + (i % 4) * 0.6;
        return (
          <mesh key={i} position={[Math.cos(a) * r, ((i % 6) - 3) * 0.4, Math.sin(a) * r]}
                castShadow={chatLuong === 'cao'}>
            <sphereGeometry args={[0.28, seg, seg / 2]} />
            <meshStandardMaterial color="#0c8ce9" roughness={0.4} metalness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function DoDac({ chatLuong, dpr }) {
  const { gl } = useThree();
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((state, delta) => {
    const a = acc.current;
    a.frames++; a.time += delta;
    if (a.time >= 0.4) {
      const el = document.getElementById('perf');
      if (el) {
        el.innerHTML =
          '<b>FPS</b> ' + Math.round(a.frames / a.time) + '<br>' +
          '<b>dpr đang dùng</b> <span style="color:#ea733a">' +
            gl.getPixelRatio().toFixed(2) + '</span><br>' +
          '<b>dpr thiết bị</b> ' + window.devicePixelRatio + '<br>' +
          '<b>chất lượng</b> ' + chatLuong + '<br>' +
          '<b>draw calls</b> ' + gl.info.render.calls;
      }
      a.frames = 0; a.time = 0;
    }
  });

  return null;
}

export default function App() {
  const [chatLuong, setChatLuong] = useState('cao');
  const [tuDongHa, setTuDongHa] = useState(true);
  const [soLuong, setSoLuong] = useState(400);
  const [dprHienTai, setDprHienTai] = useState(1.5);

  // Phát hiện thiết bị yếu — heuristic đơn giản nhưng hiệu quả
  const yeu = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4;

  return (
    <>
      <Canvas
        shadows={chatLuong === 'cao'}
        // dpr nhận một KHOẢNG [min, max] — R3F chọn trong khoảng đó.
        // Đây là dòng quan trọng nhất bài: chặn trần pixel ratio.
        dpr={[1, dprHienTai]}
        camera={{ position: [0, 3, 10], fov: 45 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 6]}
          intensity={2.2}
          castShadow={chatLuong === 'cao'}
          shadow-mapSize={chatLuong === 'cao' ? 1024 : 256}
        />

        <Cum soLuong={soLuong} chatLuong={chatLuong} />

        {/* Bóng giả thay bóng thật ở chất lượng thấp — kỹ thuật bài 2.3 */}
        {chatLuong !== 'cao' && (
          <ContactShadows position={[0, -1.8, 0]} opacity={0.5} scale={14} blur={2.4} />
        )}

        {tuDongHa && (
          <>
            {/* Theo dõi FPS và hạ dpr khi tụt, nâng lại khi dư sức */}
            <PerformanceMonitor
              onDecline={() => setDprHienTai((d) => Math.max(0.6, d - 0.25))}
              onIncline={() => setDprHienTai((d) => Math.min(2, d + 0.25))}
            />
            {/* Hạ dpr trong lúc người dùng đang xoay, nâng lại khi dừng */}
            <AdaptiveDpr pixelated />
            {/* Giảm tần suất raycast khi FPS thấp */}
            <AdaptiveEvents />
          </>
        )}

        <DoDac chatLuong={chatLuong} dpr={dprHienTai} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div id="perf" style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.9,
      }} />

      <div style={{
        position: 'fixed', bottom: 12, left: 12, display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {['cao', 'vua', 'thap'].map((c) => (
          <button key={c} onClick={() => setChatLuong(c)} style={btn(chatLuong === c)}>
            {c}
          </button>
        ))}
        <button onClick={() => setTuDongHa((v) => !v)} style={btn(tuDongHa)}>
          tự hạ chất lượng: {tuDongHa ? 'bật' : 'tắt'}
        </button>
        {[200, 400, 1200].map((n) => (
          <button key={n} onClick={() => setSoLuong(n)} style={btn(soLuong === n)}>
            {n} vật
          </button>
        ))}
      </div>

      <div style={{
        position: 'fixed', bottom: 46, left: 12,
        font: '11px ui-monospace,monospace', color: '#666',
      }}>
        hardwareConcurrency: {typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : '?'}
        {yeu ? ' — coi là thiết bị yếu' : ''}
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

export const LESSON_5_6: LessonContent = {
  id: '5-6',

  goal: 'Trang chạy được trên chính điện thoại của bạn ở mức từ 30fps trở lên, và bạn nói được rằng "Responsive Design" trong 3D không chỉ là bố cục mà còn là **chất lượng render thích ứng**.',

  lecture: [
    'Đây là bài khép lại Module 5, và cũng là bài liên hệ trực tiếp nhất với mô tả công việc. Khi mô tả công việc ghi "Responsive Design", với web thông thường nghĩa là bố cục co giãn theo màn hình. Với Web 3D, nó còn có nghĩa thứ hai quan trọng hơn: **chất lượng render phải thích ứng với năng lực thiết bị**. Nói được ý này trong buổi phỏng vấn là một điểm cộng rõ rệt.',

    'Lý do rất cụ thể. GPU di động yếu hơn desktop nhiều lần, bị giới hạn công suất và tản nhiệt, nhưng lại phải phục vụ màn hình có mật độ điểm ảnh cao hơn. Ba yếu tố đó cộng lại tạo ra khoảng cách rất lớn — một scene chạy 120fps trên laptop hoàn toàn có thể tụt xuống 15fps trên điện thoại tầm trung.',

    'Đòn bẩy lớn nhất, và cũng dễ nhất, là **pixel ratio**. Trong R3F, `dpr={[1, 2]}` cho phép truyền một khoảng thay vì một số cố định. Nhớ lại bài 1.1: số pixel phải tô tăng theo **bình phương** giá trị này. Hạ từ 3 xuống 2 là cắt hơn một nửa khối lượng của GPU, với khác biệt thị giác mà mắt gần như không bắt được ở khoảng cách cầm điện thoại.',

    'Đòn bẩy thứ hai là **bóng đổ**. Ở bài 2.3 bạn đã đo được chi phí của nó. Trên di động, cách làm phổ biến là tắt hẳn shadow map và thay bằng `<ContactShadows>` — chất lượng thị giác vẫn tốt cho phần lớn cảnh, chi phí gần như bằng không.',

    'Đòn bẩy thứ ba là **thích ứng động**. drei có ba công cụ: `<PerformanceMonitor>` theo dõi FPS và báo cho bạn khi cần hạ hoặc nâng chất lượng; `<AdaptiveDpr>` tự hạ độ phân giải trong lúc người dùng đang xoay rồi nâng lại khi dừng — rất hiệu quả vì mắt không nhận ra chi tiết khi ảnh đang chuyển động; `<AdaptiveEvents>` giảm tần suất raycast khi máy đang vất vả.',

    'Cuối cùng, đừng quên `prefers-reduced-motion`. Một số người thấy chóng mặt với chuyển động mạnh. Tôn trọng thiết lập đó vừa là chuyện tiếp cận, vừa tiết kiệm tài nguyên.',
  ],

  concepts: [
    {
      term: 'dpr={[min, max]}',
      explain:
        'Cho phép R3F chọn pixel ratio trong khoảng. Đòn bẩy hiệu quả nhất vì khối lượng vẽ tăng theo bình phương giá trị này.',
    },
    {
      term: '<PerformanceMonitor>',
      explain:
        'Theo dõi FPS, gọi `onDecline` khi tụt và `onIncline` khi dư sức. Cho phép tự điều chỉnh chất lượng theo năng lực thật của máy.',
    },
    {
      term: '<AdaptiveDpr>',
      explain:
        'Hạ độ phân giải trong lúc camera đang chuyển động, nâng lại khi dừng. Hiệu quả cao vì mắt không phân giải được chi tiết khi ảnh đang chuyển.',
    },
    {
      term: '<AdaptiveEvents>',
      explain:
        'Giảm tần suất raycast khi FPS thấp, nhường tài nguyên cho việc render.',
    },
    {
      term: 'Phát hiện thiết bị yếu',
      explain:
        '`navigator.hardwareConcurrency` cho số nhân CPU; `gl.capabilities` cho giới hạn WebGL. Dùng làm gợi ý chọn cấu hình ban đầu, rồi để `PerformanceMonitor` tinh chỉnh tiếp.',
    },
    {
      term: 'prefers-reduced-motion',
      explain:
        'Media query cho biết người dùng muốn hạn chế chuyển động. Tôn trọng nó vừa là tiếp cận vừa là tiết kiệm tài nguyên.',
    },
  ],

  walkthrough: [
    {
      action: 'Deploy phiên bản hiện tại, mở trên điện thoại thật, ghi lại FPS.',
      why: 'Đây là đường cơ sở. Chế độ giả lập của DevTools không thay thế được vì vẫn chạy trên GPU máy tính.',
    },
    {
      action: 'Đặt `dpr={[1, 2]}` cho Canvas và đo lại.',
      why: 'Thường là thay đổi một dòng cho cải thiện lớn nhất. Làm trước tiên.',
    },
    {
      action: 'Tắt bóng thật trên di động, thay bằng `<ContactShadows>`.',
      why: 'Đo lại sau bước này. Với nhiều scene, đây là khoản lãi lớn thứ hai.',
    },
    {
      action: 'Thêm `<AdaptiveDpr pixelated />` và `<AdaptiveEvents />`.',
      why: 'Hai component gần như không tốn công mà cho cải thiện đáng kể lúc người dùng đang tương tác.',
    },
    {
      action: 'Thêm `<PerformanceMonitor>` với `onDecline` hạ dpr và `onIncline` nâng lại.',
      why: 'Nhớ đặt ngưỡng dưới để chất lượng không tụt xuống mức không dùng được.',
    },
    {
      action: 'Dựa vào `navigator.hardwareConcurrency` để chọn cấu hình khởi đầu.',
      why: 'Đoán đúng ngay từ đầu tốt hơn là để người dùng chịu vài giây giật rồi mới tự hạ.',
    },
    {
      action: 'Kiểm tra `prefers-reduced-motion` và giảm hoặc tắt animation tương ứng.',
      why: 'Vừa là yêu cầu tiếp cận, vừa tiết kiệm tài nguyên.',
    },
    {
      action: 'Lập bảng: thiết bị, FPS trước, FPS sau, đã tối ưu gì.',
      why: 'Đây là sản phẩm của bài và là dữ liệu để trình bày khi phỏng vấn.',
    },
  ],

  observations: [
    {
      change: 'Hạ giá trị trần của `dpr` từ 2 xuống 1 và theo dõi FPS.',
      observe: 'FPS tăng rõ rệt, hình chỉ hơi kém nét.',
      why: 'Số pixel phải tô tỉ lệ với **bình phương** pixel ratio, nên từ 2 xuống 1 là giảm bốn lần khối lượng của fragment shader. Đây gần như luôn là đòn bẩy hiệu quả nhất trên di động, vì phần lớn scene web nghẽn ở khâu tô pixel chứ không phải ở hình học.',
    },
    {
      change: 'Chuyển chất lượng từ `cao` xuống `vua`, chú ý draw calls và FPS.',
      observe: 'Draw calls không đổi nhưng FPS tăng.',
      why: 'Vì thay đổi ở đây là số segment mỗi quả cầu và việc tắt bóng — cả hai đều giảm khối lượng GPU chứ không giảm số lệnh. Điều này nhắc lại bài 5.1: phải biết mình đang nghẽn ở đâu thì mới chọn đúng đòn bẩy.',
    },
    {
      change: 'Bật "tự hạ chất lượng", tăng lên 1200 vật thể, rồi xoay camera liên tục.',
      observe: 'Chỉ số dpr tự giảm khi FPS tụt và nhích lên lại khi bạn dừng tay.',
      why: '`<PerformanceMonitor>` lấy mẫu FPS qua một cửa sổ thời gian và gọi `onDecline` khi trung bình xuống dưới ngưỡng. `<AdaptiveDpr>` bổ sung một chiến lược khác: hạ độ phân giải **trong lúc** camera chuyển động rồi nâng lại khi dừng — hiệu quả cao vì mắt người không phân giải được chi tiết trên ảnh đang chuyển động.',
    },
    {
      change: 'Tắt "tự hạ chất lượng" với 1200 vật thể ở chất lượng cao.',
      observe: 'FPS ở mức thấp và giữ nguyên như vậy, không tự phục hồi.',
      why: 'Không có cơ chế thích ứng thì ứng dụng phục vụ mọi thiết bị bằng cùng một cấu hình. Bạn buộc phải chọn: hoặc lấy mẫu số chung thấp nhất và làm phí phần cứng mạnh, hoặc nhắm vào máy mạnh và bỏ rơi người dùng máy yếu. Thích ứng động phá bỏ lựa chọn nhị phân đó.',
    },
  ],

  interview: [
    {
      q: '"Responsive Design" với Web 3D nghĩa là gì?',
      a: 'Ngoài bố cục co giãn như web thông thường, nó còn nghĩa là **chất lượng render thích ứng theo năng lực thiết bị**. Cùng một scene không thể chạy cùng cấu hình trên desktop và trên điện thoại tầm trung — chênh lệch năng lực quá lớn. Nên tôi điều chỉnh pixel ratio, bóng đổ, số đèn, độ chi tiết hình học theo thiết bị, và dùng `<PerformanceMonitor>` để tinh chỉnh động dựa trên FPS thực tế thay vì dựa vào phỏng đoán về phần cứng.',
    },
    {
      q: 'Bạn tối ưu cho di động theo thứ tự nào?',
      a: 'Bắt đầu bằng pixel ratio vì khối lượng vẽ tăng theo bình phương giá trị đó — `dpr={[1, 2]}` thường là một dòng cho cải thiện lớn nhất. Tiếp theo là bóng đổ: tắt shadow map, thay bằng contact shadows hoặc bóng giả. Rồi giảm số đèn động, ưu tiên environment map. Sau đó mới tới hình học và texture: LOD, giảm kích thước texture, nén KTX2. Cuối cùng thêm thích ứng động. Và đo lại sau mỗi bước, vì thứ tự tác động khác nhau tuỳ scene.',
    },
    {
      q: 'Phát hiện thiết bị yếu bằng cách nào?',
      a: 'Không có cách nào chính xác tuyệt đối, nên tôi kết hợp gợi ý ban đầu với đo thực tế. `navigator.hardwareConcurrency` cho số nhân CPU, `navigator.deviceMemory` cho dung lượng RAM ước lượng, và `gl.capabilities` cho giới hạn WebGL — đủ để chọn một cấu hình khởi đầu hợp lý. Nhưng quan trọng hơn là đo FPS thực tế sau vài giây rồi điều chỉnh, vì cùng một con số nhân CPU có thể đi kèm những GPU rất khác nhau.',
    },
    {
      q: '`<AdaptiveDpr>` hoạt động theo nguyên lý gì?',
      a: 'Nó hạ pixel ratio trong lúc camera đang chuyển động và nâng lại khi dừng. Nguyên lý thị giác đằng sau là mắt người không phân giải được chi tiết trên ảnh đang chuyển động nhanh — cùng lý do khiến motion blur trong phim không gây khó chịu. Nên đây là khoản tiết kiệm gần như không có chi phí về cảm nhận: người dùng được ảnh nét khi họ dừng lại để nhìn, và được độ mượt khi họ đang thao tác.',
    },
  ],

  checkpoints: [
    'Trang chạy từ 30fps trở lên trên chính điện thoại của bạn.',
    'Có bảng FPS trước và sau kèm danh sách những gì đã tối ưu.',
    'Nói được "Responsive Design" trong 3D bao gồm cả chất lượng render.',
    'Đã tôn trọng `prefers-reduced-motion`.',
  ],

  sandbox: r3fSandbox(APP, { height: 500 }),
};
