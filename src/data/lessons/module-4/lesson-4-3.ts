import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Lightformer,
  Center,
  ContactShadows,
  Grid,
  Float,
  Html,
} from '@react-three/drei';
import { useControls } from 'leva';
import './styles.css';

function Product() {
  // leva sinh bảng điều khiển từ một object mô tả — không cần viết UI.
  const { mauSac, doNham, doKimLoai, hienLuoi } = useControls('Vật liệu', {
    mauSac: '#0c8ce9',
    doNham: { value: 0.25, min: 0, max: 1, step: 0.01 },
    doKimLoai: { value: 0.8, min: 0, max: 1, step: 0.01 },
    hienLuoi: false,
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      {/* <Center> đo bounding box rồi dịch vật thể về gốc —
          chính là hàm normalizeModel bạn tự viết ở bài 3.1. */}
      <Center>
        <mesh castShadow>
          <torusKnotGeometry args={[1, 0.32, 160, 32]} />
          <meshStandardMaterial
            color={mauSac}
            roughness={doNham}
            metalness={doKimLoai}
            wireframe={hienLuoi}
          />
        </mesh>
      </Center>
    </Float>
  );
}

function Scene() {
  const { hienGrid, doDamBong } = useControls('Bối cảnh', {
    hienGrid: true,
    doDamBong: { value: 0.6, min: 0, max: 1, step: 0.01 },
  });

  return (
    <>
      <Product />

      {/* ContactShadows: bóng giả mềm dưới chân vật thể — kỹ thuật của bài 2.3,
          giờ chỉ còn một dòng. Rẻ hơn shadow map thật rất nhiều. */}
      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={doDamBong}
        scale={12}
        blur={2.2}
        far={4}
      />

      {hienGrid && (
        <Grid
          position={[0, -1.6, 0]}
          args={[20, 20]}
          cellColor="#222"
          sectionColor="#333"
          fadeDistance={22}
          infiniteGrid
        />
      )}

      {/* Environment dựng bằng Lightformer: các mặt phát sáng đặt quanh vật thể,
          được render thành env map. Không cần tải file .hdr từ mạng —
          và cho bạn toàn quyền kiểm soát hình dạng vệt phản chiếu. */}
      <Environment resolution={256}>
        <Lightformer intensity={4} position={[0, 5, -5]} scale={[10, 4, 1]} />
        <Lightformer intensity={2} position={[-5, 1, 1]} scale={[1, 6, 1]} color="#88bbff" />
        <Lightformer intensity={2.5} position={[5, 2, 1]} scale={[1, 6, 1]} color="#ffaa66" />
      </Environment>

      {/* OrbitControls của drei: bản bọc sẵn, tự gọi update() mỗi frame
          và tự dispose khi unmount. */}
      <OrbitControls enableDamping makeDefault />
    </>
  );
}

function DangTai() {
  return (
    <Html center>
      <div style={{ font: '11px ui-monospace,monospace', color: '#a3a3a3' }}>
        đang tải…
      </div>
    </Html>
  );
}

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 1, 7], fov: 45 }}>
      {/* Suspense bắt các component "ném" promise trong lúc tải —
          useGLTF, useTexture, Environment đều làm vậy. */}
      <Suspense fallback={<DangTai />}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
`;

export const LESSON_4_3: LessonContent = {
  id: '4-3',

  goal: 'Biết drei làm hộ được những gì, và quan trọng hơn — giải thích được **nó làm hộ cái gì**, vì bạn đã tự viết tay ở Module 1–3.',

  lecture: [
    'Đây là bài mà công sức ba module đầu được đền đáp rõ nhất. `@react-three/drei` là bộ sưu tập helper cho R3F, và mỗi component trong đó đóng gói lại đúng một thứ bạn đã tự viết. Vì đã viết tay, bạn dùng chúng với hiểu biết chứ không phải với niềm tin.',

    'Hãy soi vài ví dụ. `<OrbitControls>` là bản bọc của thứ bạn đã cấu hình ở bài 1.5 — nó tự gọi `update()` mỗi khung hình và tự `dispose()` khi unmount. `<Center>` chính là hàm `normalizeModel` bạn viết ở bài 3.1: đo `Box3`, tính tâm, dịch về gốc. `<ContactShadows>` là kỹ thuật bóng giả của bài 2.3, giờ gói trong một dòng. `<Environment>` lo phần `PMREMGenerator` của bài 2.5.',

    'Trong sandbox tôi dùng `<Environment>` với các `<Lightformer>` bên trong thay vì tải file HDRI. Đây là kỹ thuật đáng biết: bạn đặt những mặt phẳng phát sáng quanh vật thể, drei render chúng thành environment map. Ưu điểm là kiểm soát được chính xác hình dạng vệt phản chiếu trên bề mặt kim loại — thứ mà một tấm HDRI có sẵn không cho bạn. Các trang cấu hình xe hơi cao cấp gần như đều dùng cách này.',

    '`leva` là bảng điều khiển tương đương `lil-gui` nhưng viết theo phong cách React. Bạn khai báo một object mô tả và nhận về giá trị qua hook `useControls` — không phải tự gắn callback, không phải nhớ `gui.destroy()`.',

    'Một điểm kỹ thuật cần hiểu là `<Suspense>`. Các hook như `useGLTF`, `useTexture` và bản thân `<Environment>` **ném ra một promise** khi tài nguyên chưa sẵn sàng. React bắt promise đó, hiển thị `fallback`, rồi render lại khi promise hoàn tất. Đây là cơ chế Suspense của React chứ không phải phát minh riêng của drei — và nó thay thế toàn bộ phần quản lý trạng thái tải thủ công của bài 3.2.',

    'Lời nhắc cuối: drei rất tiện nhưng đừng dùng nó như hộp đen. Khi có sự cố hiệu năng hay hiển thị, bạn vẫn phải mở nguồn ra đọc và hiểu nó đang gọi API Three.js nào. Đó là lý do lộ trình này đặt drei ở Module 4 chứ không phải Module 1.',
  ],

  concepts: [
    {
      term: '<OrbitControls>',
      explain:
        'Bản bọc của `OrbitControls` gốc, tự gọi `update()` và tự dispose. Prop `makeDefault` cho các component khác của drei biết đây là controls chính để chúng phối hợp.',
    },
    {
      term: '<Environment>',
      explain:
        'Lo `PMREMGenerator` và gán `scene.environment`. Dùng `preset` để tải HDRI sẵn có, hoặc lồng `<Lightformer>` bên trong để dựng môi trường bằng hình học — kiểm soát tốt hơn, không cần tải file.',
    },
    {
      term: '<Center> và <Bounds>',
      explain:
        '`<Center>` dịch nội dung về gốc toạ độ dựa trên hộp bao. `<Bounds>` còn đi xa hơn: tự đặt camera sao cho nội dung vừa khít khung nhìn.',
    },
    {
      term: '<ContactShadows>',
      explain:
        'Bóng mềm dưới chân vật thể, render một lần vào texture thay vì shadow map đầy đủ. Rẻ hơn nhiều và thường đẹp hơn cho cảnh trưng bày sản phẩm.',
    },
    {
      term: 'Suspense',
      explain:
        'Các hook tải tài nguyên của drei ném promise khi chưa sẵn sàng. `<Suspense fallback={...}>` bắt lấy và hiển thị nội dung tạm. Đây là cơ chế của React, không riêng drei.',
    },
    {
      term: 'leva useControls',
      explain:
        'Khai báo object mô tả, nhận về giá trị đã đồng bộ với bảng điều khiển. Không cần gắn callback thủ công, không cần nhớ dọn dẹp.',
    },
  ],

  walkthrough: [
    {
      action: 'Thay `OrbitControls` tự cấu hình bằng `<OrbitControls enableDamping makeDefault />`.',
      why: 'So sánh với đoạn code bài 1.5 — bạn từng phải nhớ gọi `update()` mỗi frame và `dispose()` khi unmount.',
    },
    {
      action: 'Dùng `<Environment>` với vài `<Lightformer>` bên trong.',
      why: 'Cách này không cần tải file và cho bạn kiểm soát chính xác vệt phản chiếu — quan trọng với vật liệu kim loại.',
    },
    {
      action: 'Bọc vật thể trong `<Center>`.',
      why: 'Đối chiếu với hàm `normalizeModel` bài 3.1. Cùng một thuật toán, khác cách gói.',
    },
    {
      action: 'Thay bóng thật bằng `<ContactShadows>`.',
      why: 'Chính là kỹ thuật bóng giả bạn đã đo FPS ở bài 2.3, nay chỉ còn một dòng.',
    },
    {
      action: 'Khai báo tham số vật liệu bằng `useControls` của leva.',
      why: 'So sánh với cách gắn `gui.add().onChange()` thủ công — leva đồng bộ trực tiếp qua giá trị trả về.',
    },
    {
      action: 'Bọc scene trong `<Suspense fallback={<Html>đang tải…</Html>}>`.',
      why: 'Hiểu rằng fallback này được kích hoạt bởi promise mà component con ném ra, không phải bởi cờ trạng thái nào.',
    },
  ],

  observations: [
    {
      change: 'Xoá `<Suspense>` bao quanh `<Scene />`.',
      observe: 'React báo lỗi về component treo mà không có ranh giới Suspense.',
      why: '`<Environment>` ném promise trong lúc chuẩn bị environment map. Không có ranh giới Suspense nào ở trên để bắt, React không biết hiển thị gì trong lúc chờ. Đây là lý do mọi ví dụ dùng `useGLTF` hay `useTexture` đều có `<Suspense>` — không phải quy ước tuỳ ý mà là yêu cầu bắt buộc của cơ chế.',
    },
    {
      change: 'Đổi vị trí và màu của các `<Lightformer>`, đồng thời đặt `doKimLoai` về 1 và `doNham` về 0.',
      observe: 'Vệt phản chiếu trên bề mặt đổi hình dạng và màu theo đúng các mặt phát sáng bạn đặt.',
      why: 'Đây chính là cách các trang cấu hình xe hơi cao cấp làm việc. Với vật liệu kim loại, thứ người xem nhìn thấy **là** môi trường phản chiếu. Kiểm soát được hình dạng vệt sáng là kiểm soát được cảm giác về chất liệu — điều mà một tấm HDRI có sẵn không cho phép.',
    },
    {
      change: 'Bỏ `<Center>` và đổi `torusKnotGeometry` sang một hình lệch tâm.',
      observe: 'Vật thể không còn nằm giữa khung nhìn.',
      why: '`<Center>` đo hộp bao của mọi thứ bên trong nó rồi dịch để tâm về gốc toạ độ — đúng thuật toán bài 3.1. Điều đáng chú ý là nó đo lại khi nội dung thay đổi, nên đổi model là tự căn lại, không phải tính tay.',
    },
    {
      change: 'Đặt `doDamBong` về 0 rồi tăng dần lên 1.',
      observe: 'Vật thể chuyển từ cảm giác lơ lửng sang cảm giác đặt trên mặt sàn.',
      why: 'Bóng tiếp xúc là tín hiệu thị giác mạnh nhất cho biết vật thể nằm ở đâu trong không gian. `<ContactShadows>` render scene từ dưới lên vào một texture rồi làm mờ — chỉ một lượt render nhẹ, so với shadow map đầy đủ phải render lại toàn cảnh cho mỗi đèn.',
    },
  ],

  interview: [
    {
      q: 'drei là gì và nó thay thế những gì bạn từng viết tay?',
      a: 'Là bộ sưu tập helper cho R3F. `<OrbitControls>` thay việc tự khởi tạo và gọi `update()` mỗi frame. `<Environment>` thay `PMREMGenerator` và `RGBELoader`. `<Center>` và `<Bounds>` thay hàm chuẩn hoá dùng `Box3`. `<ContactShadows>` thay kỹ thuật bóng giả thủ công. `useGLTF` thay `GLTFLoader` kèm cache và preload. Giá trị của nó không nằm ở việc giấu đi độ phức tạp mà ở việc đóng gói những mẫu đã được kiểm chứng — nhưng phải hiểu bên dưới thì mới gỡ lỗi được.',
    },
    {
      q: 'Vì sao `useGLTF` cần `<Suspense>`?',
      a: 'Vì nó dùng cơ chế Suspense của React: khi tài nguyên chưa sẵn sàng, hook ném ra một promise thay vì trả về giá trị. React bắt promise đó ở ranh giới `<Suspense>` gần nhất, render `fallback`, rồi thử render lại khi promise hoàn tất. Nhờ vậy component viết được theo lối đồng bộ — không cần cờ `isLoading` hay nhánh điều kiện — nhưng bắt buộc phải có ranh giới Suspense ở đâu đó phía trên.',
    },
    {
      q: 'Khi nào dùng `<Lightformer>` thay cho HDRI có sẵn?',
      a: 'Khi cần kiểm soát chính xác hình dạng phản chiếu — điển hình là trưng bày sản phẩm kim loại hoặc sơn bóng. Với vật liệu như vậy, thứ người xem thấy chính là môi trường phản chiếu, nên đặt được vệt sáng đúng chỗ quan trọng hơn là có một môi trường "thật". Nó cũng bỏ được việc tải file HDRI vốn nặng vài megabyte. Ngược lại, HDRI chụp thật vẫn tốt hơn cho cảnh ngoài trời cần độ chân thực tổng thể.',
    },
    {
      q: 'Có nhược điểm gì khi dùng drei?',
      a: 'Nó thêm một tầng trừu tượng, nên khi có sự cố bạn phải đọc mã nguồn của drei để biết nó gọi API Three.js nào. Một số component nặng hơn cần thiết cho trường hợp đơn giản. Kích thước gói cũng đáng kể nếu import bừa bãi — nên import theo tên cụ thể để tree-shaking hoạt động. Và rủi ro lớn nhất là dùng nó như hộp đen: người biết drei mà không biết Three.js sẽ tắc ngay khi cần làm điều mà drei chưa gói sẵn.',
    },
  ],

  checkpoints: [
    'Giải thích được mỗi component drei bạn dùng đang làm hộ điều gì.',
    'Hiểu vì sao `<Suspense>` là bắt buộc chứ không phải quy ước.',
    'Dựng được environment bằng `<Lightformer>` và kiểm soát vệt phản chiếu.',
    'Dùng được `useControls` của leva thay cho `lil-gui`.',
  ],

  sandbox: r3fSandbox(APP, { dependencies: { leva: '0.10.1' }, height: 500 }),
};
