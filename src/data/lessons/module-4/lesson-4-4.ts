import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import './styles.css';

// THỬ ĐỔI: false để thấy sự kiện xuyên qua MỌI vật thể phía sau con trỏ
const DUNG_STOP_PROPAGATION = true;

function Cube({ position, color, name, onLog }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);

  // Phóng to mượt bằng lerp trong useFrame — KHÔNG dùng state cho animation
  useFrame((state, delta) => {
    const target = hovered ? 1.25 : 1;
    ref.current.scale.x += (target - ref.current.scale.x) * 8 * delta;
    ref.current.scale.y = ref.current.scale.z = ref.current.scale.x;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        if (DUNG_STOP_PROPAGATION) e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        if (DUNG_STOP_PROPAGATION) e.stopPropagation();
        setSelected((v) => !v);
        onLog(name);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={selected ? '#ea733a' : hovered ? '#ffffff' : color}
        roughness={0.4}
      />
    </mesh>
  );
}

/**
 * Hitbox vô hình: mesh to hơn, visible={false} nhưng VẪN nhận sự kiện.
 * Rất hữu ích trên di động, nơi ngón tay to hơn con trỏ chuột nhiều.
 */
function TinyWithHitbox({ position, onLog }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh scale={0.22}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : '#9149f5'} />
      </mesh>

      {/* Vùng bấm to gấp 5 lần, hoàn toàn trong suốt */}
      <mesh
        visible={false}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onLog('quả cầu nhỏ (qua hitbox)'); }}
      >
        <sphereGeometry args={[1.1, 16, 12]} />
      </mesh>

      <Html position={[0, 0.9, 0]} center>
        <div style={{ font: '10px ui-monospace,monospace', color: '#a3a3a3', whiteSpace: 'nowrap' }}>
          hitbox vô hình
        </div>
      </Html>
    </group>
  );
}

export default function App() {
  const [log, setLog] = useState([]);

  const addLog = (name) =>
    setLog((prev) => [name, ...prev].slice(0, 6));

  return (
    <>
      <Canvas camera={{ position: [0, 1.5, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 5]} intensity={2.2} />

        {/* Ba khối THẲNG HÀNG theo trục z — tia raycast cắt qua cả ba */}
        <Cube position={[-1.6, 0, 0]}  color="#0c8ce9" name="khối trước (z=0)"  onLog={addLog} />
        <Cube position={[-1.6, 0, -2]} color="#0c8ce9" name="khối giữa (z=-2)"  onLog={addLog} />
        <Cube position={[-1.6, 0, -4]} color="#0c8ce9" name="khối sau (z=-4)"   onLog={addLog} />

        <TinyWithHitbox position={[2.2, 0, 0]} onLog={addLog} />

        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div style={{
        position: 'fixed', bottom: 12, left: 12,
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.7,
      }}>
        <div style={{ color: '#e5e5e5' }}>
          stopPropagation: {DUNG_STOP_PROPAGATION ? 'BẬT' : 'TẮT'}
        </div>
        {log.length === 0
          ? <div>hãy click vào khối phía trước</div>
          : log.map((l, i) => <div key={i}>{i === 0 ? '→ ' : '  '}{l}</div>)}
      </div>
    </>
  );
}
`;

export const LESSON_4_4: LessonContent = {
  id: '4-4',

  goal: 'Giải thích được vì sao sự kiện trong R3F mặc định xuyên qua **mọi** vật thể, và biết chính xác khi nào cần `stopPropagation()`.',

  lecture: [
    'Ở bài 4.1 bạn tự viết raycasting: chuyển toạ độ, dựng tia, tính giao điểm, lấy phần tử `[0]`. R3F gói toàn bộ việc đó lại thành các prop quen thuộc — `onClick`, `onPointerOver`, `onPointerOut` — gắn thẳng lên `<mesh>`. Nhưng có một khác biệt về hành vi khiến rất nhiều người bị bất ngờ.',

    'Trong DOM, click vào phần tử trên cùng thì chỉ phần tử đó nhận sự kiện, rồi nó nổi bọt lên các phần tử **cha**. Trong R3F, tia raycast cắt qua **mọi** vật thể nằm sau con trỏ, và mặc định **tất cả** chúng đều nhận sự kiện — kể cả những vật hoàn toàn bị che khuất, không phải cha con gì của nhau.',

    'Điều này thoạt nghe như lỗi, nhưng thực ra là quyết định thiết kế hợp lý: raycasting vốn trả về danh sách giao điểm, và R3F không tự ý quyết định hộ bạn rằng chỉ vật gần nhất mới đáng quan tâm. Có những tình huống bạn thật sự cần vật phía sau — ví dụ bấm xuyên qua lớp kính, hoặc bỏ qua một lớp phủ trong suốt.',

    '`e.stopPropagation()` là cách nói "tôi đã xử lý, đừng chuyển tiếp cho những vật phía sau". Trong đa số trường hợp bạn muốn gọi nó. Sandbox có cờ `DUNG_STOP_PROPAGATION` — hãy đổi thành `false`, click vào khối trước, rồi xem nhật ký ở góc dưới trái.',

    'Phần cuối bài là một mẹo rất thực tế: `<mesh visible={false}>` **vẫn nhận sự kiện**. Điều này cho phép bọc một vật thể nhỏ khó bấm bằng một hitbox vô hình to hơn. Trên di động, nơi ngón tay che khuất cả vùng mình đang chạm, đây là khác biệt giữa một giao diện dùng được và một giao diện gây bực bội.',
  ],

  concepts: [
    {
      term: 'Prop sự kiện của R3F',
      explain:
        '`onClick`, `onPointerOver`, `onPointerOut`, `onPointerMove`, `onPointerDown`/`Up`, `onWheel`, `onDoubleClick`. R3F tự lo raycasting phía sau.',
    },
    {
      term: 'stopPropagation()',
      explain:
        'Ngăn sự kiện tiếp tục tới các vật thể **phía sau** dọc theo tia. Khác hẳn ý nghĩa trong DOM, nơi nó ngăn nổi bọt lên phần tử cha.',
    },
    {
      term: 'Đối tượng sự kiện',
      explain:
        'Ngoài `object` còn có `point` (toạ độ va chạm trong không gian thế giới), `distance`, `face`, `uv`, và `intersections` — toàn bộ danh sách giao điểm.',
    },
    {
      term: 'visible={false} vẫn nhận sự kiện',
      explain:
        'Vật thể vô hình vẫn tham gia raycasting. Dùng làm hitbox to hơn cho vật thể nhỏ. Muốn loại hẳn khỏi raycast thì dùng `raycast={null}`.',
    },
    {
      term: 'onPointerMissed',
      explain:
        'Gắn trên `<Canvas>` hoặc trên mesh, kích hoạt khi click vào chỗ trống. Cách chuẩn để bỏ chọn.',
    },
  ],

  walkthrough: [
    {
      action: 'Thêm `onPointerOver`, `onPointerOut`, `onClick` lên `<mesh>`.',
      why: 'Không cần raycaster, không cần chuyển toạ độ. So sánh với lượng code bài 4.1.',
    },
    {
      action: 'Đổi con trỏ chuột thành `pointer` khi hover và trả lại khi rời.',
      why: 'Tín hiệu affordance cơ bản. Thiếu nó, người dùng không biết vật thể bấm được.',
    },
    {
      action: 'Làm hiệu ứng phóng to bằng `lerp` trong `useFrame`, không phải bằng state.',
      why: 'State chỉ nên giữ trạng thái luận lý (đang hover hay không); phần chuyển động mượt thuộc về `useFrame`.',
    },
    {
      action: 'Xếp ba khối thẳng hàng theo trục z và click vào khối trước.',
      why: 'Bố cục tối thiểu để lộ ra hành vi xuyên thấu của sự kiện.',
    },
    {
      action: 'Đổi `DUNG_STOP_PROPAGATION` thành `false` và xem nhật ký.',
      why: 'Đây là thí nghiệm chính của bài.',
    },
    {
      action: 'Bọc vật thể nhỏ bằng một `<mesh visible={false}>` lớn hơn.',
      why: 'Kỹ thuật này cải thiện trải nghiệm di động rõ rệt và gần như không tốn gì.',
    },
  ],

  observations: [
    {
      change: 'Đặt `DUNG_STOP_PROPAGATION = false` rồi click vào khối trước cùng.',
      observe: 'Nhật ký ghi nhận cả ba khối cùng lúc, kể cả hai khối bị che hoàn toàn.',
      why: 'Tia raycast cắt qua cả ba, và R3F gửi sự kiện tới từng vật theo thứ tự khoảng cách tăng dần. Đây không phải nổi bọt theo quan hệ cha–con như DOM — ba khối này là anh em, không ai chứa ai. Bản chất là danh sách giao điểm, và mặc định R3F không lọc hộ bạn.',
    },
    {
      change: 'Bật lại `stopPropagation` và click.',
      observe: 'Chỉ khối gần nhất phản hồi.',
      why: '`stopPropagation()` đặt cờ báo R3F dừng duyệt danh sách giao điểm còn lại. Vì danh sách đã sắp xếp theo khoảng cách, vật đầu tiên nhận được sự kiện luôn là vật gần camera nhất — đúng thứ người dùng nhìn thấy và có ý định bấm.',
    },
    {
      change: 'Hover lên quả cầu tím nhỏ, chú ý vùng nào kích hoạt phản hồi.',
      observe: 'Nó sáng lên ngay cả khi con trỏ còn cách khá xa bề mặt cầu.',
      why: 'Vùng nhận sự kiện là mesh vô hình lớn gấp năm lần. Nó không được vẽ nhưng vẫn tham gia raycasting, vì `visible` chỉ ảnh hưởng khâu render. Trên di động điều này đặc biệt quan trọng: ngón tay có vùng tiếp xúc khoảng 8–10 milimet và che khuất chính chỗ đang chạm, nên mục tiêu nhỏ gần như không bấm trúng được nếu không có hitbox rộng hơn.',
    },
    {
      change: 'Đổi hiệu ứng phóng to từ `useFrame` sang `setState` gọi liên tục.',
      observe: 'Chuyển động kém mượt và React DevTools cho thấy render lại dồn dập.',
      why: 'Đúng bài học của 4.2. Trạng thái hover là thông tin luận lý nên dùng state là hợp lý — nó chỉ đổi vài lần. Nhưng quá trình nội suy từ tỉ lệ 1 lên 1.25 diễn ra qua hàng chục khung hình, và mỗi khung mà đi qua vòng đời React là lãng phí. Ghi thẳng vào `ref.current.scale` là cách đúng.',
    },
  ],

  interview: [
    {
      q: 'Sự kiện trong R3F khác sự kiện DOM ở điểm nào?',
      a: 'Điểm khác quan trọng nhất là mặc định sự kiện tới **mọi** vật thể mà tia raycast cắt qua, chứ không chỉ vật gần nhất. Đó không phải nổi bọt theo cha–con như DOM — các vật thể đó có thể hoàn toàn không liên quan về mặt phân cấp. Vì vậy `stopPropagation()` ở đây có nghĩa "đừng gửi cho những vật phía sau nữa", khác với nghĩa "đừng nổi lên phần tử cha" trong DOM. Trong đa số trường hợp bạn muốn gọi nó ngay ở vật đầu tiên.',
    },
    {
      q: 'Vì sao R3F chọn hành vi mặc định là gửi cho tất cả?',
      a: 'Vì đó là kết quả tự nhiên của raycasting — hàm `intersectObjects` vốn trả về danh sách. R3F không giả định hộ rằng chỉ vật gần nhất mới đáng quan tâm, vì có những tình huống thật sự cần vật phía sau: bấm xuyên qua lớp kính hoặc lớp phủ trong suốt, chọn vật bị che có chủ đích, hoặc thu thập toàn bộ danh sách để xử lý riêng. Quyền lọc được để lại cho người dùng thư viện.',
    },
    {
      q: 'Làm sao cải thiện trải nghiệm chạm trên di động cho vật thể nhỏ?',
      a: 'Bọc chúng bằng một mesh vô hình lớn hơn — `visible={false}` vẫn tham gia raycasting nên vẫn nhận sự kiện. Ngoài ra nên tăng phản hồi thị giác khi chạm vì ngón tay che mất vùng đang chạm, cân nhắc dùng `onPointerDown` thay `onClick` để phản hồi tức thì, và luôn kiểm thử trên thiết bị thật vì chế độ giả lập của DevTools không mô phỏng được kích thước vùng tiếp xúc.',
    },
    {
      q: 'Đối tượng sự kiện của R3F chứa những gì hữu ích?',
      a: 'Ngoài `object` là mesh bị trúng, còn có `point` — toạ độ va chạm chính xác trong không gian thế giới, rất hữu ích để đặt hiệu ứng hay điểm neo đúng chỗ người dùng bấm. `uv` cho toạ độ texture tại điểm đó, dùng để vẽ lên bề mặt. `face` và `normal` cho hướng bề mặt. Và `intersections` chứa toàn bộ danh sách giao điểm nếu bạn cần tự quyết định thay vì dựa vào thứ tự mặc định.',
    },
  ],

  checkpoints: [
    'Giải thích được vì sao sự kiện mặc định xuyên qua mọi vật thể.',
    'Biết `stopPropagation()` trong R3F khác nghĩa với trong DOM.',
    'Dùng được `<mesh visible={false}>` làm hitbox.',
    'Giữ animation trong `useFrame`, chỉ dùng state cho trạng thái luận lý.',
  ],

  sandbox: r3fSandbox(APP, { height: 480 }),
};
