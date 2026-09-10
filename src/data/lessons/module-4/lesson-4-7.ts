import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

const BO_PHAN = [
  { id: 'than',  pos: [0, 0.2, 0],    ten: 'Thân máy',   ghiChu: 'Hợp kim nhôm phay CNC' },
  { id: 'ong',   pos: [1.3, 0.9, 0.4], ten: 'Ống kính',   ghiChu: 'Tiêu cự 35mm, f/1.8' },
  { id: 'nut',   pos: [-1.1, 1.1, 0.3], ten: 'Nút chụp',  ghiChu: 'Hành trình 2 nấc' },
];

/**
 * PHẦN A — tự chiếu toạ độ 3D về toạ độ màn hình.
 * Đây là thứ <Html> của drei làm hộ. Viết tay một lần để hiểu cơ chế.
 */
function NhanTuViet({ diem }) {
  const { camera, size } = useThree();
  const ref = useRef();
  const v = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!ref.current) return;

    // project() biến toạ độ thế giới thành NDC (-1..1) —
    // chính là phép NGƯỢC với công thức raycasting ở bài 4.1.
    v.current.set(...diem.pos).project(camera);

    // NDC -> pixel. Chú ý dấu trừ ở y, đúng lý do như bài 4.1.
    const x = (v.current.x * 0.5 + 0.5) * size.width;
    const y = (-v.current.y * 0.5 + 0.5) * size.height;

    // z > 1 nghĩa là điểm nằm SAU camera -> phải ẩn đi,
    // nếu không nhãn sẽ hiện lộn ngược ở phía đối diện.
    const phiaSau = v.current.z > 1;

    ref.current.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px)';
    ref.current.style.opacity = phiaSau ? '0' : '1';
  });

  return (
    <Html>
      <div
        ref={ref}
        style={{
          position: 'absolute', top: 0, left: 0,
          padding: '3px 7px', borderRadius: 4,
          border: '1px solid rgba(255,255,255,.14)',
          background: 'rgba(10,10,10,.8)', backdropFilter: 'blur(6px)',
          font: '10px ui-monospace,monospace', color: '#0c8ce9',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}
      >
        {diem.ten} (tự viết)
      </div>
    </Html>
  );
}

function BoPhan({ item, dangChon, onChon }) {
  const ref = useRef();

  useFrame((state, delta) => {
    const t = dangChon ? 1.15 : 1;
    ref.current.scale.x += (t - ref.current.scale.x) * 8 * delta;
    ref.current.scale.y = ref.current.scale.z = ref.current.scale.x;
  });

  return (
    <mesh
      ref={ref}
      position={item.pos}
      onClick={(e) => { e.stopPropagation(); onChon(item.id); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color={dangChon ? '#ea733a' : '#4a5568'} roughness={0.4} metalness={0.3} />

      {/* PHẦN B — <Html> của drei.
          occlude: tự mờ đi khi bị vật thể khác che.
          distanceFactor: nhãn nhỏ dần khi camera lùi xa. */}
      {dangChon && (
        <Html
          position={[0, 0.75, 0]}
          center
          distanceFactor={8}
          occlude
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            padding: '7px 10px', borderRadius: 6,
            border: '1px solid rgba(255,255,255,.14)',
            background: 'rgba(10,10,10,.88)', backdropFilter: 'blur(8px)',
            font: '11px ui-monospace,monospace', color: '#e5e5e5',
            whiteSpace: 'nowrap', lineHeight: 1.6,
          }}>
            <div style={{ color: '#ea733a' }}>{item.ten}</div>
            <div style={{ color: '#a3a3a3', fontSize: 10 }}>{item.ghiChu}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default function App() {
  const [chon, setChon] = useState('ong');

  return (
    <>
      <Canvas camera={{ position: [0, 2, 7], fov: 45 }} onPointerMissed={() => setChon(null)}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />

        {BO_PHAN.map((item) => (
          <BoPhan key={item.id} item={item} dangChon={chon === item.id} onChon={setChon} />
        ))}

        {/* Nhãn tự viết, luôn hiện, để so sánh với <Html> của drei */}
        <NhanTuViet diem={BO_PHAN[0]} />

        <gridHelper args={[20, 20, '#222', '#181818']} position={[0, -1.4, 0]} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      {/* Lớp giao diện HTML thường, nằm trên canvas */}
      <div style={{
        position: 'fixed', top: 12, left: 12, maxWidth: 240,
        padding: '10px 12px', borderRadius: 8,
        border: '1px solid rgba(255,255,255,.1)',
        background: 'rgba(10,10,10,.7)', backdropFilter: 'blur(10px)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.7,
      }}>
        <div style={{ color: '#e5e5e5', marginBottom: 4 }}>Bảng thông tin (HTML thường)</div>
        <div>Click một khối để hiện nhãn 3D.</div>
        <div>Xoay camera và để ý nhãn xanh — nó bám theo vật thể.</div>
      </div>
    </>
  );
}
`;

export const LESSON_4_7: LessonContent = {
  id: '4-7',

  goal: 'Có tooltip HTML bám theo vật thể 3D — thành phần cốt lõi cho một trang cấu hình sản phẩm, và là chỗ nhà tuyển dụng nhìn thấy kỹ năng CSS của bạn.',

  lecture: [
    'WebGL vẽ rất đẹp nhưng lại rất tệ ở việc hiển thị chữ. Văn bản trong canvas không chọn được, không tìm kiếm được, không đọc được bằng trình đọc màn hình, và muốn có kiểu chữ đẹp thì phải làm rất nhiều việc. Trong khi đó HTML và CSS làm những thứ đó hoàn hảo. Bài này ghép hai thế giới lại.',

    'Kỹ thuật nền tảng là **chiếu** một điểm 3D về toạ độ màn hình. `vector.project(camera)` biến toạ độ thế giới thành NDC, rồi bạn quy đổi NDC sang pixel. Nếu thấy quen thì đúng vậy: đây chính là phép ngược của công thức raycasting bài 4.1, và cũng có cái bẫy đảo dấu trục y y hệt.',

    'Có một chi tiết mà bản tự viết nào cũng phải xử lý: khi điểm nằm **sau** camera, `project()` vẫn trả về toạ độ hợp lệ nhưng vô nghĩa — nhãn sẽ hiện ở phía đối diện màn hình như thể vật thể ở đó. Cách kiểm tra là xem `z > 1` rồi ẩn đi. Sandbox có nhãn tự viết xử lý sẵn chuyện này; hãy xoay camera ra sau và quan sát.',

    'Sau khi hiểu cơ chế, `<Html>` của drei làm hộ tất cả, và làm tốt hơn. Nó có `occlude` để nhãn tự mờ đi khi bị vật thể che khuất — thứ rất khó tự làm vì cần kiểm tra che khuất bằng raycast hoặc depth buffer. Nó có `distanceFactor` để nhãn nhỏ dần khi ra xa, giữ đúng cảm giác phối cảnh. Và nó có `transform` để nhãn nằm phẳng trong không gian 3D thay vì luôn hướng về camera.',

    'Về bố cục, mẫu phổ biến cho trang marketing là đặt canvas `position: fixed` phủ toàn màn hình làm nền, còn nội dung HTML cuộn phía trên. Lúc đó phải chú ý `pointer-events`: lớp trên thường cần `pointer-events: none` ở vùng trống để thao tác chuột xuống được tới canvas.',
  ],

  concepts: [
    {
      term: 'vector.project(camera)',
      explain:
        'Biến toạ độ thế giới thành NDC. Quy đổi tiếp sang pixel bằng `(x * 0.5 + 0.5) * width` và `(-y * 0.5 + 0.5) * height`.',
    },
    {
      term: 'Kiểm tra phía sau camera',
      explain:
        'Sau khi project, `z > 1` nghĩa là điểm nằm sau camera. Không kiểm tra thì nhãn sẽ hiện lộn ở phía đối diện màn hình.',
    },
    {
      term: '<Html> của drei',
      explain:
        'Nhúng DOM vào toạ độ 3D. `occlude` tự ẩn khi bị che, `distanceFactor` co giãn theo khoảng cách, `transform` đặt nhãn phẳng trong không gian 3D, `center` căn giữa.',
    },
    {
      term: 'pointer-events',
      explain:
        'Lớp HTML phủ trên canvas chặn sự kiện chuột. Đặt `pointer-events: none` cho vùng trang trí để thao tác xuống được tới scene 3D.',
    },
    {
      term: 'Canvas làm nền',
      explain:
        'Canvas `position: fixed` phủ toàn màn hình, nội dung HTML cuộn phía trên. Mẫu chuẩn cho trang marketing có nền 3D.',
    },
  ],

  walkthrough: [
    {
      action: 'Tự viết trước: dùng `vector.copy(pos).project(camera)` để lấy NDC.',
      why: 'Phải hiểu cơ chế trước khi dùng helper. Đây cũng là phép ngược của bài 4.1.',
    },
    {
      action: 'Quy đổi NDC sang pixel và đặt `div` bằng `transform: translate()`.',
      why: 'Dùng `transform` chứ không dùng `top`/`left` — trình duyệt tăng tốc phần cứng cho transform, còn đổi `top`/`left` gây tính lại bố cục mỗi khung hình.',
    },
    {
      action: 'Kiểm tra `z > 1` và ẩn nhãn khi điểm nằm sau camera.',
      why: 'Xoay camera 180 độ để tự thấy vấn đề nếu bỏ qua bước này.',
    },
    {
      action: 'Chuyển sang `<Html>` của drei và so sánh với bản tự viết.',
      why: 'Bạn sẽ thấy nó ngắn hơn nhiều và xử lý được những trường hợp bạn chưa nghĩ tới.',
    },
    {
      action: 'Bật `occlude` và xoay camera sao cho vật thể khác che nhãn.',
      why: 'Đây là tính năng khó tự làm nhất, và cũng là thứ khiến nhãn trông thực sự thuộc về không gian 3D.',
    },
    {
      action: 'Thêm `distanceFactor` rồi cuộn zoom ra xa.',
      why: 'Không có nó, nhãn giữ nguyên kích thước và trông như dán trên màn hình chứ không nằm trong cảnh.',
    },
  ],

  observations: [
    {
      change: 'Xoay camera sao cho nhãn tự viết đi ra sau lưng bạn.',
      observe: 'Nhãn mờ đi và biến mất thay vì nhảy sang phía đối diện.',
      why: 'Nhờ kiểm tra `z > 1`. Phép chiếu phối cảnh vẫn cho ra toạ độ khi điểm nằm sau camera, nhưng kết quả bị lật dấu nên nhãn sẽ xuất hiện ở vị trí đối xứng qua tâm màn hình. Đây là lỗi kinh điển của mọi bản tự viết đầu tiên.',
    },
    {
      change: 'Xoay camera cho một khối khác che khuất khối đang chọn, chú ý nhãn `<Html>`.',
      observe: 'Nhãn mờ dần đi khi bị che.',
      why: '`occlude` khiến drei kiểm tra xem điểm neo có bị vật thể nào chắn không, rồi điều chỉnh độ trong suốt. Không có tính năng này, nhãn sẽ nổi đè lên vật thể chắn phía trước và phá vỡ hoàn toàn ảo giác chiều sâu — vì DOM luôn nằm trên canvas theo thứ tự xếp lớp của trình duyệt.',
    },
    {
      change: 'Cuộn zoom camera ra thật xa.',
      observe: 'Nhãn `<Html>` nhỏ dần theo, còn nhãn tự viết giữ nguyên kích thước.',
      why: '`distanceFactor` co giãn nhãn theo khoảng cách tới camera, mô phỏng đúng cách vật thể thật nhỏ đi khi xa. Không có nó, nhãn trông như dán trên kính chắn chứ không nằm trong cảnh. Tuy nhiên với tooltip cần đọc được ở mọi khoảng cách thì giữ nguyên kích thước lại là lựa chọn đúng — tuỳ mục đích.',
    },
    {
      change: 'Bỏ `pointerEvents: none` khỏi nhãn rồi thử click xuyên qua nó vào vật thể phía sau.',
      observe: 'Click bị nhãn nuốt mất, vật thể không nhận được sự kiện.',
      why: 'Nhãn là phần tử DOM nằm trên canvas theo thứ tự xếp lớp, nên nó chặn sự kiện chuột trước khi tới được canvas. Với nhãn thuần trang trí thì `pointer-events: none` là bắt buộc. Với nhãn có nút bấm thì đặt `none` ở phần bọc ngoài và `auto` riêng cho phần tử tương tác.',
    },
  ],

  interview: [
    {
      q: 'Làm sao đặt một phần tử HTML bám theo vật thể 3D?',
      a: 'Lấy toạ độ thế giới của vật thể, gọi `vector.project(camera)` để có NDC, rồi quy đổi sang pixel bằng `(x * 0.5 + 0.5) * width` và `(-y * 0.5 + 0.5) * height` — nhớ đảo dấu y. Đặt phần tử bằng `transform: translate()` chứ không phải `top`/`left` để tránh tính lại bố cục mỗi khung hình. Và phải kiểm tra `z > 1` để ẩn nhãn khi điểm nằm sau camera. Trong dự án thật tôi dùng `<Html>` của drei vì nó còn xử lý cả che khuất và co giãn theo khoảng cách.',
    },
    {
      q: 'Vì sao dùng HTML cho chữ thay vì vẽ chữ trong WebGL?',
      a: 'Vì HTML cho chất lượng chữ tốt hơn hẳn, hỗ trợ mọi bộ kiểu chữ, cho phép chọn và sao chép, được trình đọc màn hình hiểu, và tận dụng được toàn bộ CSS. Vẽ chữ trong WebGL cần texture atlas hoặc SDF, khó chỉnh kiểu, và tốn công cho mỗi ngôn ngữ mới. Đánh đổi là phần tử DOM luôn nằm trên canvas theo thứ tự xếp lớp nên không tự bị che — phải mô phỏng bằng `occlude` — và số lượng lớn phần tử DOM cập nhật mỗi khung hình sẽ tốn kém.',
    },
    {
      q: '`occlude` của drei hoạt động thế nào?',
      a: 'Nó kiểm tra xem điểm neo của nhãn có bị hình học nào chắn giữa nó và camera hay không, rồi điều chỉnh độ trong suốt hoặc ẩn hẳn. Có hai chế độ: mặc định dùng raycast từ camera tới điểm neo, còn chế độ blending dựa trên depth buffer nên chính xác hơn với hình học phức tạp nhưng tốn hơn. Cần tính năng này vì DOM luôn được vẽ trên canvas, nên không có cơ chế che khuất tự nhiên nào cả.',
    },
    {
      q: 'Bố trí canvas 3D làm nền cho trang nội dung thế nào?',
      a: 'Canvas đặt `position: fixed` phủ toàn khung nhìn với `z-index` thấp, nội dung HTML cuộn bình thường phía trên. Chú ý `pointer-events`: các lớp trang trí phía trên nên đặt `none` để thao tác chuột tới được scene, chỉ phần tử tương tác mới đặt `auto`. Về hiệu năng, nên tạm dừng vòng lặp render khi canvas ra khỏi khung nhìn, và cân nhắc `frameloop="demand"` nếu scene phần lớn tĩnh — đó là nội dung bài 5.4.',
    },
  ],

  checkpoints: [
    'Tự viết được nhãn bám theo vật thể, kể cả xử lý trường hợp nằm sau camera.',
    'Dùng được `<Html>` với `occlude` và `distanceFactor`.',
    'Biết vì sao dùng `transform` thay cho `top`/`left`.',
    'Xử lý đúng `pointer-events` giữa lớp HTML và canvas.',
  ],

  sandbox: r3fSandbox(APP, { height: 480 }),
};
