import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { create } from 'zustand';
import './styles.css';

// ---------------------------------------------------------------------------
// Store zustand. Điểm mấu chốt: có thể đọc bằng useStore.getState() BÊN NGOÀI
// chu kỳ render của React — không đăng ký subscription, không re-render.
// ---------------------------------------------------------------------------
const useStore = create((set) => ({
  tocDo: 1,
  idDangChon: null,
  soLanCapNhat: 0,

  setTocDo: (v) => set({ tocDo: v }),
  chon: (id) => set((s) => ({ idDangChon: s.idDangChon === id ? null : id })),
  tick: () => set((s) => ({ soLanCapNhat: s.soLanCapNhat + 1 })),
}));

// THỬ ĐỔI: true để tái hiện vấn đề — cập nhật state React mỗi frame
const DUNG_STATE_MOI_FRAME = false;

function Box({ id, position }) {
  const ref = useRef();

  // SELECTOR: chỉ re-render khi ĐÚNG giá trị này đổi.
  // Nếu viết useStore(s => s) thì mọi thay đổi trong store đều gây re-render.
  const daChon = useStore((s) => s.idDangChon === id);
  const chon = useStore((s) => s.chon);

  useFrame((state, delta) => {
    // getState() đọc giá trị hiện tại mà KHÔNG đăng ký theo dõi.
    // Đây là lý do chính để chọn zustand cho scene 3D.
    const { tocDo } = useStore.getState();
    ref.current.rotation.y += tocDo * delta;
    ref.current.rotation.x += tocDo * 0.4 * delta;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={(e) => { e.stopPropagation(); chon(id); }}
      scale={daChon ? 1.3 : 1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={daChon ? '#ea733a' : '#0c8ce9'} roughness={0.4} />
    </mesh>
  );
}

/** Component tái hiện vấn đề: setState mỗi frame. */
function KeCapNhatMoiFrame() {
  const [, setN] = useState(0);
  const tick = useStore((s) => s.tick);

  useFrame(() => {
    if (DUNG_STATE_MOI_FRAME) {
      setN((v) => v + 1);  // 60 lần re-render mỗi giây
      tick();
    }
  });

  return null;
}

/** Đo FPS mà không gây re-render — ghi thẳng vào DOM. */
function DoFps() {
  const box = useRef({ frames: 0, acc: 0 });

  useFrame((state, delta) => {
    const b = box.current;
    b.frames++; b.acc += delta;
    if (b.acc >= 0.5) {
      const el = document.getElementById('fps');
      if (el) el.textContent = String(Math.round(b.frames / b.acc));
      b.frames = 0; b.acc = 0;
    }
  });

  return null;
}

function BangDieuKhien() {
  // Selector riêng cho từng trường -> component này chỉ re-render khi tocDo đổi
  const tocDo = useStore((s) => s.tocDo);
  const setTocDo = useStore((s) => s.setTocDo);
  const idDangChon = useStore((s) => s.idDangChon);

  const [renderCount, setRenderCount] = useState(0);
  useEffect(() => { setRenderCount((v) => v + 1); }, [tocDo, idDangChon]);

  return (
    <div style={{
      position: 'fixed', top: 12, left: 12,
      font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.8,
    }}>
      <div>
        tốc độ:{' '}
        <input
          type="range" min="0" max="4" step="0.05" value={tocDo}
          onChange={(e) => setTocDo(Number(e.target.value))}
          style={{ verticalAlign: 'middle', width: 120 }}
        />{' '}
        {tocDo.toFixed(2)}
      </div>
      <div>đang chọn: {idDangChon ?? 'không'}</div>
      <div>FPS: <span id="fps">–</span></div>
      <div style={{ color: '#666' }}>
        setState mỗi frame: {DUNG_STATE_MOI_FRAME ? 'BẬT (xem DevTools)' : 'tắt'}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 1.5, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 5]} intensity={2.2} />

        {[-2.2, 0, 2.2].map((x, i) => (
          <Box key={i} id={'khoi-' + (i + 1)} position={[x, 0, 0]} />
        ))}

        <KeCapNhatMoiFrame />
        <DoFps />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <BangDieuKhien />
    </>
  );
}
`;

export const LESSON_4_5: LessonContent = {
  id: '4-5',

  goal: 'Có hai con số FPS và bằng chứng từ React DevTools cho câu trả lời phỏng vấn về quản lý state — và biết vì sao chọn zustand cho scene 3D nhưng Redux hay Context cho luồng dữ liệu.',

  lecture: [
    'Có một xung đột nền tảng giữa React và đồ hoạ thời gian thực, và bài này là bài giải quyết nó. React được thiết kế để render lại khi state đổi. Vòng lặp 3D chạy 60 lần mỗi giây. Ghép hai điều đó một cách ngây thơ — gọi `setState` trong `useFrame` — nghĩa là ép React điều hoà lại cây component 60 lần mỗi giây.',

    'Chi phí đó thường lớn hơn cả việc render 3D. Và điều tệ hơn: nó lan ra. Một `setState` ở component cha khiến toàn bộ nhánh con render lại, kể cả những component chẳng liên quan gì tới giá trị vừa đổi.',

    'Zustand giải quyết bằng một đặc điểm đơn giản mà quyết định: bạn đọc được state **ngoài** chu kỳ render. `useStore.getState()` trả về giá trị hiện tại mà không đăng ký theo dõi, nên không gây re-render. Gọi nó trong `useFrame` là cách chuẩn để vòng lặp 3D đọc được state của giao diện mà không phải trả giá.',

    'Đặc điểm thứ hai là **selector**. `useStore(s => s.idDangChon)` khiến component chỉ render lại khi đúng trường đó đổi. Viết `useStore(s => s)` là quay lại đúng vấn đề ban đầu: mọi thay đổi trong store đều lan ra khắp nơi. Đây là lỗi phổ biến nhất khi mới dùng zustand.',

    'Và đừng quên `useRef`. Nếu một giá trị chỉ được dùng bên trong `useFrame` của chính component đó và không component nào khác cần biết, thì nó không thuộc về store — nó thuộc về một ref. Store là để **chia sẻ**, không phải để lưu trữ mọi thứ.',

    'Cách kiểm chứng: cài React DevTools, bật "Highlight updates when components render", rồi đổi `DUNG_STATE_MOI_FRAME` thành `true`. Bạn sẽ thấy toàn bộ cây nhấp nháy liên tục. Ghi lại FPS ở cả hai trạng thái — đó là bằng chứng bạn mang đi phỏng vấn.',
  ],

  concepts: [
    {
      term: 'useStore.getState()',
      explain:
        'Đọc giá trị hiện tại **không** đăng ký theo dõi, nên không gây re-render. Đây là cách đúng để `useFrame` truy cập state của giao diện.',
    },
    {
      term: 'Selector',
      explain:
        '`useStore(s => s.field)` chỉ khiến component render lại khi đúng trường đó đổi. `useStore(s => s)` thì mọi thay đổi đều lan ra — gần như luôn là lỗi.',
    },
    {
      term: 'useRef cho giá trị cục bộ',
      explain:
        'Giá trị chỉ dùng trong `useFrame` của chính component đó thì nên nằm ở ref, không nên vào store. Store là để chia sẻ giữa các component.',
    },
    {
      term: 'Vì sao không dùng Context',
      explain:
        'Context làm render lại **mọi** consumer khi giá trị đổi, không có cơ chế selector. Với dữ liệu cập nhật ở tần suất cao trong scene 3D, đó là vấn đề nghiêm trọng.',
    },
    {
      term: 'transient update',
      explain:
        '`useStore.subscribe(selector, callback)` cho phép phản ứng với thay đổi mà không render lại — hữu ích khi cần cập nhật đối tượng Three.js ngay lúc state đổi.',
    },
  ],

  walkthrough: [
    {
      action: 'Cài React DevTools và bật "Highlight updates when components render".',
      why: 'Không có công cụ này thì bạn chỉ đang đoán. Cần nhìn thấy vấn đề trước khi tin vào giải pháp.',
    },
    {
      action: 'Đặt `DUNG_STATE_MOI_FRAME = true` và quan sát.',
      why: 'Đây là phần tái hiện vấn đề. Ghi lại FPS.',
    },
    {
      action: 'Tạo store zustand bằng `create()` với các trường và action cần chia sẻ.',
      why: 'Đặt action ngay trong store giúp mọi thay đổi state đi qua một chỗ, dễ theo dõi.',
    },
    {
      action: 'Trong `useFrame`, đọc bằng `useStore.getState()` chứ không phải bằng hook.',
      why: 'Đây là điểm mấu chốt của cả bài. Hook đăng ký theo dõi; `getState()` thì không.',
    },
    {
      action: 'Ở component giao diện, đọc bằng selector riêng cho từng trường.',
      why: 'Thử đổi thành `useStore(s => s)` một lần để thấy hậu quả, rồi sửa lại.',
    },
    {
      action: 'Với giá trị chỉ dùng nội bộ trong `useFrame`, dùng `useRef` thay vì store.',
      why: 'Không phải mọi thứ đều cần chia sẻ. Store phình to là một dạng nợ kỹ thuật.',
    },
  ],

  observations: [
    {
      change: 'Đặt `DUNG_STATE_MOI_FRAME = true` với DevTools đang bật chế độ tô sáng.',
      observe: 'Toàn bộ cây component nhấp nháy viền liên tục và FPS tụt.',
      why: 'Mỗi `setState` kích hoạt một lượt điều hoà: React so sánh cây phần tử cũ với mới, chạy lại thân hàm mọi component bị ảnh hưởng. Ở 60 lần mỗi giây, chi phí đó thường vượt cả chi phí render WebGL. Điều đáng nói là nó xảy ra ngay cả khi kết quả render giống hệt nhau.',
    },
    {
      change: 'Đặt lại `false`, rồi kéo slider tốc độ và quan sát các khối.',
      observe: 'Tốc độ quay đổi ngay lập tức, nhưng DevTools không tô sáng component `Box` nào.',
      why: 'Slider cập nhật `tocDo` trong store. `useFrame` của mỗi `Box` đọc bằng `getState()` nên nhận giá trị mới ở khung hình kế tiếp mà không hề đăng ký theo dõi — React không biết gì và không render lại. Đây chính là lý do zustand phù hợp với scene 3D.',
    },
    {
      change: 'Đổi `useStore((s) => s.idDangChon === id)` thành `const s = useStore((s) => s)` rồi dùng `s.idDangChon`.',
      observe: 'Mọi khối đều render lại mỗi khi bất kỳ trường nào trong store thay đổi.',
      why: 'Selector là cơ chế zustand dùng để quyết định có thông báo cho component hay không: nó so sánh giá trị selector trả về giữa hai lần. Trả về cả object thì phép so sánh nông luôn cho kết quả "đã đổi", vì object mới được tạo mỗi lần. Đây là lỗi thường gặp nhất khi mới dùng zustand.',
    },
    {
      change: 'Click chọn một khối và chú ý DevTools.',
      observe: 'Chỉ khối được chọn và khối vừa bỏ chọn nhấp nháy, không phải cả ba.',
      why: 'Selector `s.idDangChon === id` trả về boolean. Với những khối không liên quan, giá trị đó vẫn là `false` trước và sau, nên zustand không thông báo. Đây là ưu thế cụ thể so với Context — Context sẽ làm render lại mọi consumer bất kể chúng có quan tâm phần nào của giá trị.',
    },
  ],

  interview: [
    {
      q: 'Vì sao không dùng `useState` trong `useFrame`?',
      a: 'Vì `useFrame` chạy mỗi khung hình, nên `setState` trong đó tạo ra khoảng 60 lượt điều hoà React mỗi giây cho toàn bộ nhánh component bị ảnh hưởng. Chi phí đó thường lớn hơn cả việc render WebGL, và phần lớn là vô ích vì kết quả DOM không đổi. Cách đúng là giữ tham chiếu bằng `useRef` rồi ghi thẳng vào thuộc tính của đối tượng Three.js, hoặc đọc state chia sẻ bằng `useStore.getState()` vốn không đăng ký theo dõi.',
    },
    {
      q: 'Vì sao chọn zustand cho scene 3D nhưng Redux hoặc Context cho luồng dữ liệu?',
      a: 'Vì đặc tính truy cập khác nhau. Scene 3D cần đọc state ở tần suất cao bên ngoài chu kỳ render — `useStore.getState()` trong `useFrame` làm được điều đó mà không tốn gì. Context thì buộc phải đọc qua hook và làm render lại mọi consumer, không có selector. Redux có selector nhưng kèm nhiều khuôn mẫu và tầng middleware mà scene 3D không cần. Ngược lại, với luồng dữ liệu và xác thực — nơi thay đổi thưa nhưng cần công cụ gỡ lỗi, khả năng ghi lại hành động, middleware — thì Redux hoặc React Query phù hợp hơn. Tôi thường dùng cả hai trong một dự án, mỗi cái cho đúng miền của nó.',
    },
    {
      q: 'Selector trong zustand hoạt động thế nào và bẫy là gì?',
      a: 'Selector là hàm trích một phần state; zustand chạy nó sau mỗi lần store đổi và so sánh kết quả với lần trước bằng phép so sánh nông. Chỉ khi kết quả khác thì component mới render lại. Bẫy là trả về object hoặc mảng mới — ví dụ `s => ({ a: s.a, b: s.b })` — vì tham chiếu mới luôn khác nên phép so sánh nông luôn báo đã đổi. Cách xử lý là dùng nhiều selector nguyên thuỷ riêng biệt, hoặc truyền hàm so sánh tuỳ chỉnh như `shallow`.',
    },
    {
      q: 'Khi nào dùng `useRef` thay vì đưa vào store?',
      a: 'Khi giá trị chỉ được dùng bên trong `useFrame` của chính component đó và không component nào khác cần đọc. Ví dụ điển hình là bộ đếm thời gian nội bộ, vận tốc tích luỹ, hay trạng thái nội suy đang dở. Đưa những thứ đó vào store chỉ làm store phình to và tạo ra khả năng gây re-render không cần thiết. Nguyên tắc: store là để **chia sẻ**, ref là để **ghi nhớ**.',
    },
  ],

  checkpoints: [
    'Có hai con số FPS và ảnh chụp DevTools làm bằng chứng.',
    'Biết `getState()` khác gì với gọi hook, và dùng đúng chỗ.',
    'Giải thích được vì sao phải dùng selector thay vì lấy cả store.',
    'Nói được vì sao chọn zustand cho 3D nhưng Redux/Context cho luồng dữ liệu.',
  ],

  sandbox: r3fSandbox(APP, { dependencies: { zustand: '5.0.15' }, height: 480 }),
};
