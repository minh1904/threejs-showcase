import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Scroll } from '@react-three/drei';
import { easing } from 'maath';
import './styles.css';

function Vat({ position, color, chiSo }) {
  const ref = useRef();
  const scroll = useScroll();

  useFrame((state, delta) => {
    // scroll.offset: 0 ở đầu, 1 ở cuối — chuẩn hoá, không phụ thuộc chiều cao trang
    const t = scroll.offset;

    // scroll.range(bat_dau, khoang) trả về 0..1 TRONG một đoạn cuộn cụ thể.
    // Nhờ đó mỗi vật thể có "sân khấu" riêng của nó.
    const r = scroll.range(chiSo / 4, 1 / 4);

    // Damping để chuyển động không giật theo từng nấc cuộn của chuột
    easing.damp3(
      ref.current.position,
      [position[0], position[1] + r * 1.4, position[2]],
      0.25,
      delta
    );
    easing.damp(ref.current.rotation, 'y', t * Math.PI * 3, 0.3, delta);
    easing.damp(ref.current.scale, 'x', 0.6 + r * 0.7, 0.25, delta);
    ref.current.scale.y = ref.current.scale.z = ref.current.scale.x;
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} flatShading />
    </mesh>
  );
}

function CameraTheoScroll() {
  const scroll = useScroll();

  useFrame((state, delta) => {
    // Camera lùi dần và hạ xuống theo tiến trình cuộn
    easing.damp3(
      state.camera.position,
      [0, 1 - scroll.offset * 2, 8 + scroll.offset * 4],
      0.4,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

const MAU = ['#0c8ce9', '#ea733a', '#9149f5', '#4caf50'];

export default function App() {
  return (
    <Canvas camera={{ position: [0, 1, 8], fov: 45 }}>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />

      {/* pages: chiều dài vùng cuộn, tính theo bội số chiều cao khung nhìn.
          damping: độ trễ của giá trị scroll, làm chuyển động mượt hơn. */}
      <ScrollControls pages={4} damping={0.25}>
        {MAU.map((c, i) => (
          <Vat key={i} chiSo={i} color={c} position={[(i - 1.5) * 2.4, 0, 0]} />
        ))}

        <CameraTheoScroll />

        {/* <Scroll html> đặt nội dung HTML thường cuộn cùng cảnh 3D */}
        <Scroll html style={{ width: '100%' }}>
          {['Cuộn xuống', 'Vật thể nâng lên theo đoạn của nó', 'Camera lùi dần', 'Hết'].map((t, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 'calc(' + (i * 100) + 'vh + 12vh)',
                left: 24,
                font: '13px ui-monospace,monospace',
                color: i === 0 ? '#e5e5e5' : '#a3a3a3',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 11, color: '#666' }}>đoạn {i + 1}/4</div>
              {t}
            </div>
          ))}
        </Scroll>
      </ScrollControls>
    </Canvas>
  );
}
`;

export const LESSON_6_5: LessonContent = {
  id: '6-5',

  goal: 'Có một trang cuộn với chuyển động 3D mượt, và **phần CSS animation bạn tự viết** — vì mô tả công việc ghi rõ "CSS Animation, Keyframes, CSS 3D Transform".',

  lecture: [
    'Kể chuyện theo thanh cuộn là mẫu thiết kế thống trị mọi trang portfolio và landing page hiện đại: người dùng cuộn, cảnh 3D chuyển động theo. Bài này làm điều đó, nhưng có một lưu ý về thứ tự học mà tôi muốn nhấn mạnh.',

    '**Hãy làm phần CSS thuần trước.** Mô tả công việc ghi rõ "CSS Animation, Keyframes, CSS 3D Transform" — đó là kỹ năng được hỏi trực tiếp. Dựng một trang nhiều đoạn với `@keyframes` và `animation` tự viết, dùng `IntersectionObserver` để kích hoạt khi đoạn vào khung nhìn, và làm một thẻ lật bằng `transform-style: preserve-3d` cộng `rotateY` cộng `backface-visibility: hidden`. Đó là những thứ nhà tuyển dụng sẽ hỏi, và chúng không liên quan gì tới WebGL.',

    'Sau đó mới nối với cảnh 3D. `<ScrollControls>` của drei tạo một vùng cuộn ảo và cung cấp hook `useScroll`. Hai giá trị quan trọng: `scroll.offset` cho tiến trình tổng từ 0 tới 1, và `scroll.range(bắt_đầu, khoảng)` cho tiến trình **trong một đoạn cụ thể** — nhờ đó mỗi vật thể có "sân khấu" riêng thay vì tất cả chuyển động cùng lúc.',

    'Chi tiết quyết định chất lượng là **damping**. Bánh xe chuột cuộn theo từng nấc rời rạc, nên nếu ánh xạ thẳng giá trị cuộn vào vị trí thì chuyển động sẽ giật. Áp `easing.damp3` như đã học ở bài 4.6 khiến cảnh trôi mượt theo thay vì nhảy từng bậc. `<ScrollControls damping>` cũng làm mượt chính giá trị scroll.',

    'Cuối cùng là hai điều dễ quên nhưng quan trọng. Về hiệu năng: chỉ render canvas khi nó nằm trong khung nhìn — với trang dài có 3D ở đầu, đây là khoản tiết kiệm lớn, và kết hợp tốt với `frameloop="demand"` của bài 5.4. Về tiếp cận: tôn trọng `prefers-reduced-motion` — một số người thật sự thấy chóng mặt với chuyển động liên kết thanh cuộn.',
  ],

  concepts: [
    {
      term: '@keyframes + IntersectionObserver',
      explain:
        'Cách làm hiệu ứng xuất hiện bằng CSS thuần, không thư viện. Đúng thứ mô tả công việc yêu cầu. Nên làm trước khi đụng tới WebGL.',
    },
    {
      term: 'CSS 3D Transform',
      explain:
        '`perspective` trên phần tử cha, `transform-style: preserve-3d` để con giữ không gian 3D, `backface-visibility: hidden` cho thẻ lật. Hoàn toàn không cần WebGL.',
    },
    {
      term: '<ScrollControls>',
      explain:
        'Tạo vùng cuộn ảo bên trong Canvas. Prop `pages` đặt chiều dài theo bội số khung nhìn, `damping` làm mượt giá trị scroll.',
    },
    {
      term: 'useScroll',
      explain:
        '`scroll.offset` cho tiến trình tổng 0..1. `scroll.range(bắt_đầu, khoảng)` cho tiến trình trong một đoạn — công cụ chính để dàn cảnh theo từng chặng.',
    },
    {
      term: '<Scroll html>',
      explain:
        'Đặt nội dung HTML cuộn đồng bộ với cảnh 3D. Cho phép trộn văn bản thật với hình ảnh WebGL trong cùng một dòng chảy.',
    },
    {
      term: 'prefers-reduced-motion',
      explain:
        'Một số người thấy chóng mặt với chuyển động liên kết thanh cuộn. Kiểm tra media query này và giảm hoặc tắt hiệu ứng tương ứng.',
    },
  ],

  walkthrough: [
    {
      action: 'Dựng trang nhiều đoạn với `@keyframes` và `animation` **tự viết**, không dùng thư viện.',
      why: 'Đây là kỹ năng mô tả công việc hỏi trực tiếp. Làm phần này trước và làm cho tử tế.',
    },
    {
      action: 'Dùng `IntersectionObserver` kích hoạt animation khi đoạn vào khung nhìn.',
      why: 'Cách chuẩn hiện nay, thay cho việc lắng nghe sự kiện scroll vốn kích hoạt liên tục và tốn kém.',
    },
    {
      action: 'Làm một thẻ lật bằng `preserve-3d` + `rotateY` + `backface-visibility`.',
      why: 'CSS 3D Transform là mục riêng trong mô tả công việc. Thử đổi giá trị `perspective` để cảm nhận ảnh hưởng.',
    },
    {
      action: 'Bọc cảnh 3D trong `<ScrollControls pages={4} damping={0.25}>`.',
      why: '`pages` quyết định vùng cuộn dài bao nhiêu. Bắt đầu bằng số nhỏ rồi tăng dần.',
    },
    {
      action: 'Dùng `scroll.range(i / n, 1 / n)` để mỗi vật thể có đoạn riêng.',
      why: 'Nếu tất cả cùng dùng `scroll.offset` thì mọi thứ chuyển động đồng loạt, mất cảm giác kể chuyện.',
    },
    {
      action: 'Áp `easing.damp3` thay vì gán thẳng giá trị.',
      why: 'Đây là khác biệt giữa chuyển động giật theo nấc chuột và chuyển động trôi mượt.',
    },
    {
      action: 'Chỉ render canvas khi nó nằm trong khung nhìn.',
      why: 'Kết hợp với `frameloop="demand"` của bài 5.4 để không đốt tài nguyên cho phần trang không ai nhìn.',
    },
  ],

  observations: [
    {
      change: 'Bỏ `easing.damp3` và gán thẳng `ref.current.position.y = r * 1.4`.',
      observe: 'Chuyển động nhảy từng bậc theo mỗi nấc lăn chuột.',
      why: 'Bánh xe chuột phát ra sự kiện rời rạc, mỗi nấc là một bước nhảy vài chục pixel. Ánh xạ thẳng giá trị đó vào vị trí sẽ tái hiện đúng độ rời rạc ấy. Damping chèn một bộ lọc thời gian: vị trí thật tiến dần về vị trí mục tiêu qua nhiều khung hình, biến các bước nhảy thành đường trôi liên tục.',
    },
    {
      change: 'Đổi tất cả `scroll.range(...)` thành `scroll.offset`.',
      observe: 'Mọi vật thể chuyển động đồng loạt suốt chiều dài trang.',
      why: '`scroll.offset` là tiến trình toàn cục nên mọi thứ dùng nó sẽ đồng pha. `scroll.range(bắt_đầu, khoảng)` ánh xạ một **đoạn con** của tiến trình về khoảng 0..1, cho phép dàn dựng theo chặng: vật thứ nhất diễn trong phần tư đầu, vật thứ hai trong phần tư thứ hai. Đây là công cụ chính để kể chuyện theo thanh cuộn.',
    },
    {
      change: 'Giảm `pages` từ 4 xuống 1.',
      observe: 'Toàn bộ chuyển động dồn vào một khoảng cuộn rất ngắn, cảm giác vội vã.',
      why: '`pages` quyết định vùng cuộn dài bao nhiêu lần chiều cao khung nhìn. Nó là công cụ điều khiển **nhịp**: cùng một chuỗi chuyển động, trải trên bốn trang thì thong thả, dồn vào một trang thì gấp gáp. Chọn giá trị này theo lượng nội dung muốn kể chứ không theo con số tuỳ ý.',
    },
    {
      change: 'Bật `prefers-reduced-motion` trong cài đặt hệ điều hành rồi tải lại trang.',
      observe: 'Nếu chưa xử lý, chuyển động vẫn chạy y nguyên.',
      why: 'Thiết lập này là tín hiệu rõ ràng từ người dùng rằng chuyển động mạnh gây khó chịu cho họ — với một số người là chóng mặt thật sự chứ không phải sở thích. Cách xử lý là kiểm tra `window.matchMedia("(prefers-reduced-motion: reduce)")` rồi giảm biên độ hoặc chuyển sang hiệu ứng mờ dần đơn giản. Đây vừa là yêu cầu tiếp cận vừa tiết kiệm tài nguyên.',
    },
  ],

  interview: [
    {
      q: 'Bạn làm hiệu ứng xuất hiện khi cuộn bằng cách nào?',
      a: 'Bằng `IntersectionObserver` kết hợp `@keyframes` của CSS. Observer báo khi phần tử vào khung nhìn, tôi thêm một class kích hoạt animation đã định nghĩa sẵn. Cách này tốt hơn lắng nghe sự kiện `scroll` vì observer chạy ngoài luồng chính và chỉ kích hoạt khi thực sự có thay đổi, thay vì chạy hàng chục lần mỗi giây. Với nội dung nối tiếp nhau tôi thêm độ trễ tăng dần để tạo hiệu ứng lần lượt.',
    },
    {
      q: 'CSS 3D Transform hoạt động thế nào?',
      a: '`perspective` trên phần tử cha định nghĩa khoảng cách từ mắt người xem tới mặt phẳng z=0 — giá trị nhỏ cho phối cảnh mạnh. `transform-style: preserve-3d` khiến phần tử con giữ được không gian 3D thay vì bị làm phẳng. `backface-visibility: hidden` ẩn mặt sau, cần cho hiệu ứng thẻ lật vì nếu không sẽ thấy nội dung lộn ngược. Tất cả chạy trên bộ tổng hợp của trình duyệt nên rất mượt, và không cần WebGL.',
    },
    {
      q: 'Làm sao chuyển động theo scroll không bị giật?',
      a: 'Không ánh xạ trực tiếp giá trị cuộn vào transform, vì bánh xe chuột phát sự kiện rời rạc theo từng nấc. Thay vào đó dùng damping: giữ một giá trị mục tiêu từ scroll và cho giá trị thật tiến dần về đó qua nhiều khung hình, bằng `easing.damp3` hoặc công thức độc lập frame rate của bài 4.6. `<ScrollControls>` cũng có prop `damping` làm mượt chính giá trị scroll trước khi nó tới tay bạn.',
    },
    {
      q: 'Cần lưu ý gì về hiệu năng và tiếp cận với trang cuộn có 3D?',
      a: 'Về hiệu năng: chỉ render canvas khi nó nằm trong khung nhìn, dùng `IntersectionObserver` kết hợp `frameloop="demand"`; với trang dài có 3D chỉ ở phần đầu thì đây là khoản tiết kiệm rất lớn. Về tiếp cận: tôn trọng `prefers-reduced-motion`, và đảm bảo nội dung vẫn đọc được nếu WebGL không khả dụng — 3D nên là lớp tăng cường chứ không phải điều kiện để trang hoạt động.',
    },
  ],

  checkpoints: [
    'Phần CSS animation và 3D transform bạn tự viết, không dùng thư viện.',
    'Cảnh 3D chuyển động mượt theo scroll, không giật theo nấc chuột.',
    'Mỗi vật thể có đoạn cuộn riêng bằng `scroll.range`.',
    'Đã xử lý `prefers-reduced-motion` và chỉ render khi trong khung nhìn.',
  ],

  sandbox: r3fSandbox(APP, { dependencies: { maath: '0.10.8' }, height: 500 }),
};
