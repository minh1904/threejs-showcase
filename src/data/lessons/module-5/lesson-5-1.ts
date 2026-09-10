import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './styles.css';

// THỬ ĐỔI để thấy từng chỉ số phản ứng ra sao
const SO_VAT_THE = 300;
const CHIA_SE_MATERIAL = true;   // false -> mỗi vật một material riêng
const CHIA_SE_GEOMETRY = true;   // false -> mỗi vật một geometry riêng
const DO_MIN_LUOI = 24;          // tăng lên 128 để thấy triangles tăng vọt

function Vat({ i }) {
  const ref = useRef();
  const a = (i / SO_VAT_THE) * Math.PI * 2;
  const r = 3 + (i % 5) * 0.7;

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={ref} position={[Math.cos(a) * r, ((i % 7) - 3) * 0.5, Math.sin(a) * r]}>
      <sphereGeometry args={[0.22, DO_MIN_LUOI, DO_MIN_LUOI / 2]} />
      <meshStandardMaterial color="#0c8ce9" roughness={0.4} />
    </mesh>
  );
}

/**
 * Đọc số liệu thô từ gl.info — không cần thư viện nào.
 * Đây là thứ r3f-perf hiển thị đẹp mắt, nhưng bạn nên biết lấy tay.
 */
function DoDac() {
  const { gl } = useThree();
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((state, delta) => {
    const a = acc.current;
    a.frames++;
    a.time += delta;

    if (a.time >= 0.5) {
      const el = document.getElementById('perf');
      if (el) {
        el.innerHTML =
          '<b>FPS</b> ' + Math.round(a.frames / a.time) + '<br>' +
          '<b>draw calls</b> ' + gl.info.render.calls + '<br>' +
          '<b>triangles</b> ' + gl.info.render.triangles.toLocaleString() + '<br>' +
          '<b>geometries</b> ' + gl.info.memory.geometries + '<br>' +
          '<b>textures</b> ' + gl.info.memory.textures + '<br>' +
          '<b>programs</b> ' + (gl.info.programs?.length ?? 0);
      }
      a.frames = 0;
      a.time = 0;
    }
  });

  return null;
}

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 3, 11], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />

        {Array.from({ length: SO_VAT_THE }, (_, i) => <Vat key={i} i={i} />)}

        <DoDac />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div id="perf" style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)',
        background: 'rgba(10,10,10,.8)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.8,
      }} />

      <div style={{
        position: 'fixed', bottom: 12, left: 12,
        font: '11px ui-monospace,monospace', color: '#666', lineHeight: 1.7,
      }}>
        <div>{SO_VAT_THE} vật thể · lưới {DO_MIN_LUOI} segment</div>
        <div>đổi các hằng số ở đầu file rồi xem chỉ số nào đổi theo</div>
      </div>
    </>
  );
}
`;

export const LESSON_5_1: LessonContent = {
  id: '5-1',

  goal: 'Biết bài nào trong dự án đang nặng nhất **trước khi** tối ưu bất cứ thứ gì — vì đoán mò gần như luôn sai chỗ.',

  lecture: [
    'Module này là phần "điểm cộng" mà mô tả công việc ghi rõ, và bài đầu tiên đặt ra nguyên tắc chi phối toàn bộ những bài sau: **không bao giờ tối ưu khi chưa đo**. Trực giác về hiệu năng đồ hoạ nổi tiếng là không đáng tin — người ta thường bỏ hàng giờ tối ưu thứ chiếm 2% thời gian khung hình trong khi nút thắt thật nằm ở chỗ khác.',

    'Có năm chỉ số bạn cần đọc thành thạo. **FPS** là kết quả cuối, nhưng nó không nói cho bạn biết nguyên nhân. **Draw calls** đếm số lần CPU ra lệnh cho GPU vẽ — đây thường là nút thắt trong ứng dụng web, và là chủ đề của bài 5.2. **Triangles** đo khối lượng hình học. **Geometries** và **textures** cho biết có bao nhiêu tài nguyên đang nằm trên GPU — dùng để phát hiện rò rỉ. **Programs** đếm số shader đã biên dịch, tăng bất thường nghĩa là bạn đang tạo quá nhiều material khác nhau.',

    'Điều quan trọng là biết phân biệt nghẽn ở **CPU** hay ở **GPU**, vì hai loại cần hai cách chữa hoàn toàn khác nhau. Nghẽn CPU thường do quá nhiều draw call hoặc quá nhiều việc JavaScript mỗi khung hình — chữa bằng cách gộp và giảm số lệnh. Nghẽn GPU thường do quá nhiều pixel phải tô hoặc shader quá phức tạp — chữa bằng cách giảm độ phân giải, đơn giản hoá shader, hoặc bớt overdraw. Cách phân biệt nhanh: hạ độ phân giải cửa sổ xuống rất nhỏ; nếu FPS tăng vọt thì bạn đang nghẽn ở GPU, còn nếu gần như không đổi thì nghẽn ở CPU.',

    '`r3f-perf` cho bạn tất cả những con số này dưới dạng overlay đẹp mắt — nhưng chỉ nên bật ở môi trường phát triển. Sandbox này cố tình đọc thẳng từ `gl.info` để bạn biết nguồn gốc của từng chỉ số. Hãy đổi các hằng số ở đầu file và quan sát chỉ số nào phản ứng.',

    'Sản phẩm của bài này là một **bảng cơ sở**: ghi lại FPS, draw calls và triangles cho từng bài học bạn đã làm. Không có bảng đó, bạn không biết mình đang cải thiện hay đang làm tệ đi.',
  ],

  concepts: [
    {
      term: 'gl.info.render',
      explain:
        '`calls` là số draw call trong khung hình vừa rồi, `triangles` là số tam giác đã vẽ. Hai chỉ số quan trọng nhất khi chẩn đoán.',
    },
    {
      term: 'gl.info.memory',
      explain:
        '`geometries` và `textures` đang nằm trên GPU. Tăng đơn điệu qua các lần mount/unmount là dấu hiệu rò rỉ.',
    },
    {
      term: 'gl.info.programs',
      explain:
        'Số chương trình shader đã biên dịch. Con số lớn bất thường nghĩa là bạn tạo quá nhiều material riêng biệt thay vì chia sẻ.',
    },
    {
      term: 'Nghẽn CPU vs GPU',
      explain:
        'Thu nhỏ cửa sổ rất nhỏ: FPS tăng vọt nghĩa là nghẽn GPU (nhiều pixel quá); gần như không đổi nghĩa là nghẽn CPU (nhiều lệnh quá).',
    },
    {
      term: 'r3f-perf',
      explain:
        'Overlay hiển thị mọi chỉ số trên, kèm GPU time. Chỉ bật ở môi trường phát triển — nó cũng tốn tài nguyên.',
    },
  ],

  walkthrough: [
    {
      action: 'Thêm `<Perf />` từ `r3f-perf` vào Canvas, bọc trong điều kiện chỉ chạy ở development.',
      why: 'Overlay này cũng render mỗi khung hình. Để lọt lên production là tự làm chậm sản phẩm.',
    },
    {
      action: 'Tự đọc `gl.info.render.calls` và `.triangles` trong `useFrame`, ghi ra một `div`.',
      why: 'Biết lấy tay thì bạn dùng được cả trong môi trường không có thư viện, và hiểu con số đến từ đâu.',
    },
    {
      action: 'Ghi kết quả bằng cách thao tác DOM trực tiếp, không dùng `setState`.',
      why: 'Đúng bài học 4.5 — công cụ đo mà tự làm chậm ứng dụng thì đo ra số vô nghĩa.',
    },
    {
      action: 'Đổi `CHIA_SE_MATERIAL` thành `false` và quan sát `programs`.',
      why: 'Để thấy quan hệ giữa cách viết code và con số shader phải biên dịch.',
    },
    {
      action: 'Đổi `DO_MIN_LUOI` từ 24 lên 128 và quan sát `triangles` cùng FPS.',
      why: 'Phân biệt được chi phí hình học với chi phí draw call — hai thứ hoàn toàn khác nhau.',
    },
    {
      action: 'Lập bảng cơ sở cho mọi bài đã làm: FPS, draw calls, triangles.',
      why: 'Đây là sản phẩm thực sự của bài. Mọi bài sau đều so với bảng này.',
    },
    {
      action: 'Mở DevTools → Performance, quay 5 giây và xem thời gian đổ vào đâu.',
      why: 'Vạch dài trong luồng chính là việc JavaScript; khoảng trống chờ dài là đang đợi GPU.',
    },
  ],

  observations: [
    {
      change: 'Đổi `CHIA_SE_MATERIAL` thành `false`, tức mỗi vật thể một material riêng.',
      observe: '`programs` tăng lên và lần render đầu tiên bị khựng rõ rệt.',
      why: 'Mỗi cấu hình material tương ứng một chương trình shader phải biên dịch, và việc biên dịch là đồng bộ. Three.js có cache theo cấu hình nên các material giống hệt nhau vẫn chia sẻ được program, nhưng việc tạo hàng trăm instance vẫn tốn bộ nhớ và làm chậm khâu chuẩn bị. Đây là lý do bài 4.8 nhấn mạnh việc chia sẻ material.',
    },
    {
      change: 'Đổi `DO_MIN_LUOI` từ `24` lên `128` mà giữ nguyên số vật thể.',
      observe: '`triangles` tăng vọt nhưng `draw calls` không đổi; FPS giảm.',
      why: 'Đây là minh hoạ rõ nhất rằng hai chỉ số đo hai thứ khác nhau. Draw call là số **lệnh** CPU gửi đi; triangle là khối lượng **công việc** GPU phải làm. Bạn có thể nghẽn ở một trong hai một cách độc lập, và cách chữa hoàn toàn khác nhau: giảm draw call thì gộp lại, giảm triangle thì đơn giản hoá hình học.',
    },
    {
      change: 'Tăng `SO_VAT_THE` lên 2000 rồi thu nhỏ cửa sổ trình duyệt xuống rất nhỏ.',
      observe: 'FPS gần như không cải thiện.',
      why: 'Đây là phép thử phân biệt nghẽn CPU với GPU. Thu nhỏ cửa sổ giảm mạnh số pixel phải tô — nếu nghẽn ở GPU thì FPS phải tăng vọt. Không tăng nghĩa là nút thắt nằm ở phía CPU, cụ thể là số draw call. Chính vì vậy bài 5.2 về instancing là bài quan trọng nhất module.',
    },
    {
      change: 'Xoay camera sao cho phần lớn vật thể ra khỏi khung nhìn.',
      observe: '`draw calls` và `triangles` giảm mạnh dù không có vật thể nào bị xoá.',
      why: 'Đây là **frustum culling** — Three.js tự động bỏ qua vật thể có hộp bao nằm hoàn toàn ngoài vùng nhìn của camera. Nó hoạt động sẵn, miễn phí, và là lý do các chỉ số phải đọc trong bối cảnh cụ thể của góc nhìn. Cũng vì thế mà đo hiệu năng phải đo ở góc nhìn xấu nhất chứ không phải góc đẹp nhất.',
    },
  ],

  interview: [
    {
      q: 'Bạn tiếp cận việc tối ưu hiệu năng 3D thế nào?',
      a: 'Luôn bắt đầu bằng đo đạc, không bao giờ đoán. Tôi lấy đường cơ sở gồm FPS, draw calls và triangles, rồi xác định nghẽn ở CPU hay GPU bằng cách thu nhỏ cửa sổ — nếu FPS tăng vọt thì nghẽn ở GPU. Nghẽn CPU thường do quá nhiều draw call hoặc quá nhiều việc JavaScript mỗi khung hình; nghẽn GPU do quá nhiều pixel hoặc shader phức tạp. Chỉ sau khi biết nút thắt ở đâu tôi mới chọn kỹ thuật, rồi đo lại để xác nhận nó thực sự có tác dụng.',
    },
    {
      q: 'Những chỉ số nào cần theo dõi và mỗi cái nói lên điều gì?',
      a: 'FPS là kết quả nhưng không chỉ ra nguyên nhân. Draw calls đo số lệnh CPU gửi cho GPU — thường là nút thắt trong ứng dụng web. Triangles đo khối lượng hình học. Geometries và textures cho biết tài nguyên đang nằm trên GPU, tăng đơn điệu là dấu hiệu rò rỉ. Programs đếm shader đã biên dịch, cao bất thường nghĩa là tạo quá nhiều material riêng. Với GPU time thì cần `r3f-perf` hoặc extension đo, vì nó không có sẵn trong `gl.info`.',
    },
    {
      q: 'Phân biệt nghẽn CPU và nghẽn GPU bằng cách nào?',
      a: 'Phép thử nhanh nhất là giảm mạnh độ phân giải render — thu nhỏ cửa sổ hoặc hạ pixel ratio. Việc này chỉ giảm khối lượng của GPU, không đổi số lệnh CPU gửi đi. FPS tăng vọt nghĩa là nghẽn GPU; gần như không đổi nghĩa là nghẽn CPU. Kiểm chứng thêm bằng tab Performance của DevTools: luồng chính đầy vạch dài là nghẽn CPU, còn luồng chính rảnh mà FPS vẫn thấp là đang đợi GPU.',
    },
    {
      q: 'Vì sao không nên để công cụ đo chạy ở production?',
      a: 'Vì bản thân chúng cũng tốn tài nguyên. `r3f-perf` render một overlay và thu thập số liệu mỗi khung hình. Việc đọc một số chỉ số GPU còn buộc đồng bộ hoá giữa CPU và GPU, làm mất tính song song và có thể tự gây ra chính vấn đề đang muốn đo. Ngoài ra nó lộ thông tin kỹ thuật ra người dùng cuối. Cách làm chuẩn là bọc trong điều kiện môi trường hoặc sau một cờ tính năng.',
    },
  ],

  checkpoints: [
    'Có bảng cơ sở FPS / draw calls / triangles cho mọi bài đã làm.',
    'Đọc được `gl.info` mà không cần thư viện.',
    'Phân biệt được nghẽn CPU và nghẽn GPU bằng phép thử độ phân giải.',
    'Biết vì sao `programs` tăng bất thường là dấu hiệu xấu.',
  ],

  sandbox: r3fSandbox(APP, { height: 480 }),
};
