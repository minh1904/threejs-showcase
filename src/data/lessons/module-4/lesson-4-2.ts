import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import './styles.css';

// Đúng hệ mặt trời của bài 1.3–1.4, viết lại bằng JSX.
// Hãy đối chiếu từng dòng với bản vanilla để thấy quy tắc ánh xạ.

function Moon() {
  const orbit = useRef();

  // useFrame thay cho requestAnimationFrame. delta đã có sẵn — không cần
  // tự tạo THREE.Clock, và R3F cũng tự huỷ loop khi component unmount.
  useFrame((state, delta) => {
    orbit.current.rotation.y += 2.0 * delta;
  });

  return (
    <group ref={orbit}>
      {/* position là prop, tương đương moon.position.set(1.5, 0, 0) */}
      <mesh position={[1.5, 0, 0]} scale={0.22}>
        {/* args CHÍNH LÀ tham số constructor: new THREE.SphereGeometry(1, 32, 16) */}
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color="#bbbbbb" />
      </mesh>
    </group>
  );
}

function Earth() {
  const orbit = useRef();

  useFrame((state, delta) => {
    orbit.current.rotation.y += 0.6 * delta;
  });

  return (
    <group ref={orbit}>
      {/* Quan hệ cha–con của scene graph giờ là quan hệ LỒNG NHAU của JSX.
          Đây là điểm R3F thắng rõ nhất: cấu trúc cây hiện ra ngay trong code. */}
      <group position={[4, 0, 0]}>
        <mesh scale={0.6}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#0c8ce9" />
        </mesh>
        <Moon />
      </group>
    </group>
  );
}

function Readout() {
  const { gl, size, camera } = useThree();

  useFrame(() => {
    const el = document.getElementById('readout');
    if (el) {
      el.textContent =
        'kích thước: ' + size.width + '×' + size.height +
        '   |   dpr: ' + gl.getPixelRatio() +
        '   |   fov: ' + camera.fov +
        '   |   geometries trên GPU: ' + gl.info.memory.geometries;
    }
  });

  return null;
}

export default function App() {
  return (
    <>
      {/* <Canvas> tự tạo scene, camera, renderer, animation loop VÀ
          resize handler. Ba bước resize của bài 1.5 giờ là việc của R3F. */}
      <Canvas camera={{ position: [0, 5, 11], fov: 50 }}>
        <mesh scale={1.2}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#ea733a" />
        </mesh>

        <Earth />
        <Readout />
      </Canvas>

      <div
        id="readout"
        style={{
          position: 'fixed', bottom: 12, left: 12,
          font: '11px ui-monospace, monospace', color: '#a3a3a3',
        }}
      />
    </>
  );
}
`;

export const LESSON_4_2: LessonContent = {
  id: '4-2',

  goal: 'Trả lời được câu hỏi phỏng vấn "so sánh viết vanilla Three.js trong `useEffect` với dùng R3F" bằng trải nghiệm của chính bạn, không phải lý thuyết.',

  lecture: [
    'Bạn đã viết tay ba module bằng Three.js thuần. Đó là quãng đường bắt buộc, và giờ là lúc nó trả cổ tức: mọi thứ React Three Fiber làm hộ, bạn đều đã tự làm một lần nên biết chính xác nó đang giấu đi cái gì.',

    'Quy tắc ánh xạ đơn giản đến bất ngờ. Mỗi lớp trong không gian tên `THREE` trở thành một thẻ JSX viết thường: `new THREE.Mesh()` thành `<mesh>`, `new THREE.BoxGeometry(1, 1, 1)` thành `<boxGeometry args={[1, 1, 1]} />`. Prop `args` chính là danh sách tham số constructor. Mọi thuộc tính khác gán trực tiếp: `mesh.position.set(1, 0, 0)` thành `position={[1, 0, 0]}`.',

    'Điều R3F thay đổi về chất là **quan hệ cha–con**. Ở Module 1 bạn phải viết `earthGroup.add(moonOrbit)` và tự hình dung cây trong đầu. Trong JSX, cây đó chính là cấu trúc lồng nhau của code — nhìn là thấy. Với scene phức tạp, đây là khác biệt rất lớn về khả năng đọc hiểu.',

    'Ba việc R3F tự làm mà bạn từng phải viết tay: vòng lặp animation (`useFrame` đã có sẵn `delta`), xử lý resize (đủ cả ba bước của bài 1.5), và **dọn dẹp khi unmount**. Điểm cuối đáng chú ý nhất — nhớ lại bài 1.6 bạn phải duyệt scene gọi `dispose()` từng cái. R3F theo dõi mọi thứ nó tạo ra và tự giải phóng. Hãy kiểm chứng bằng cách theo dõi `gl.info.memory` khi vào ra trang nhiều lần, rồi so với dãy số bạn đã ghi ở bài 1.6.',

    'Nhưng đừng hiểu nhầm là R3F miễn cho bạn khỏi hiểu Three.js. Nó chỉ đổi cách viết. Khi có lỗi — vật thể đen thui, bóng không hiện, hiệu năng tụt — bạn vẫn phải chẩn đoán bằng đúng kiến thức ba module vừa qua. Người biết R3F mà không biết Three.js sẽ tắc ngay khi ra khỏi vùng mà tài liệu đã viết sẵn.',
  ],

  concepts: [
    {
      term: '<Canvas>',
      explain:
        'Tạo sẵn scene, camera, renderer, animation loop và resize handler. Prop `camera`, `gl`, `shadows` cho phép cấu hình từng phần mà không cần tự dựng.',
    },
    {
      term: 'Quy tắc args',
      explain:
        'Prop `args` là mảng tham số constructor. `<boxGeometry args={[1, 2, 3]} />` tương đương `new THREE.BoxGeometry(1, 2, 3)`. Đổi `args` khiến R3F **tạo lại** đối tượng, nên đừng đặt giá trị thay đổi liên tục vào đó.',
    },
    {
      term: 'useFrame',
      explain:
        'Chạy mỗi khung hình, nhận `(state, delta)`. `delta` đã tính sẵn nên không cần `THREE.Clock`. Đây là nơi duy nhất nên viết animation — đừng dùng `setState` trong này.',
    },
    {
      term: 'useThree',
      explain:
        'Truy cập `camera`, `gl` (renderer), `scene`, `size`, `viewport`. Dùng để đọc trạng thái renderer hoặc lấy tham chiếu khi cần thao tác trực tiếp bằng API Three.js.',
    },
    {
      term: 'Tự dispose',
      explain:
        'R3F theo dõi geometry, material, texture nó tạo ra và giải phóng khi component unmount. Lưu ý: **tài nguyên bạn tự tạo ngoài JSX** thì vẫn phải tự dispose.',
    },
  ],

  walkthrough: [
    {
      action: 'Bọc mọi thứ trong `<Canvas camera={{ position: [0, 5, 11], fov: 50 }}>`.',
      why: 'Prop `camera` cấu hình camera mặc định. Không cần tạo `PerspectiveCamera` thủ công cho trường hợp thông thường.',
    },
    {
      action: 'Đổi mỗi `new THREE.X()` thành thẻ `<x>` viết thường, tham số constructor vào `args`.',
      why: 'Hãy làm đối chiếu này một cách có ý thức thay vì chép. Quy tắc rất đều, nắm được là dùng được cho mọi lớp của Three.js.',
    },
    {
      action: 'Lồng `<group>` theo đúng cấu trúc cha–con của bài 1.3.',
      why: 'So sánh đoạn JSX này với chuỗi lệnh `.add()` ở bản vanilla — đây là chỗ R3F thắng rõ rệt nhất.',
    },
    {
      action: 'Dùng `useRef` giữ tham chiếu tới `<group>` rồi xoay nó trong `useFrame`.',
      why: 'Xoay qua ref chứ không qua state. `setState` mỗi frame sẽ khiến React render lại 60 lần một giây — đây là lỗi hiệu năng phổ biến nhất của người mới dùng R3F.',
    },
    {
      action: 'Dùng `useThree()` để đọc `gl.info.memory` và hiển thị lên màn hình.',
      why: 'Để tự kiểm chứng phần dispose tự động, so với dãy số bạn đã đo ở bài 1.6.',
    },
    {
      action: 'Đếm số dòng của hai phiên bản và liệt kê những gì R3F làm hộ.',
      why: 'Đây là dữ liệu cho câu trả lời phỏng vấn. Con số cụ thể thuyết phục hơn nhận định chung chung.',
    },
  ],

  observations: [
    {
      change: 'So sánh đoạn JSX lồng nhau của `Earth` với chuỗi `.add()` ở bản vanilla bài 1.3.',
      observe: 'Cấu trúc cây hiện ngay trong hình dạng của code, không cần đọc tuần tự để dựng lại trong đầu.',
      why: 'Scene graph vốn là một cây, và JSX vốn để mô tả cây. Đây là sự khớp nhau về bản chất chứ không phải đường cú pháp. Với scene vài chục vật thể, khác biệt về khả năng đọc hiểu là rất lớn.',
    },
    {
      change: 'Thử đổi `useFrame` thành `useState` cộng `setInterval` để xoay.',
      observe: 'Chuyển động giật, và React DevTools cho thấy component render lại liên tục.',
      why: 'Mỗi `setState` kích hoạt một lượt điều hoà của React. Ở 60 lần mỗi giây, chi phí đó lấn át cả việc render 3D. `useFrame` ghi thẳng vào đối tượng Three.js qua ref, hoàn toàn bỏ qua vòng đời React — đây là nguyên tắc quan trọng nhất khi viết R3F.',
    },
    {
      change: 'Theo dõi `geometries` ở thanh dưới, rồi vào ra trang nhiều lần.',
      observe: 'Con số ổn định, không tăng dần như khi bạn bỏ dispose ở bài 1.6.',
      why: 'R3F giữ sổ sách mọi tài nguyên nó tạo ra từ JSX và tự gọi `dispose()` khi phần tử tương ứng rời khỏi cây. Nhưng lưu ý giới hạn: nếu bạn tự `new THREE.TextureLoader().load()` bên ngoài JSX thì R3F không biết tới nó, và trách nhiệm dọn dẹp vẫn thuộc về bạn.',
    },
    {
      change: 'Đổi `args` của `sphereGeometry` từ `[1, 32, 16]` thành một giá trị thay đổi mỗi frame.',
      observe: 'Hiệu năng tụt thảm hại.',
      why: '`args` là tham số constructor, nên đổi nó buộc R3F huỷ đối tượng cũ và tạo mới hoàn toàn — kèm theo một lượt nạp dữ liệu lên GPU. Những gì thay đổi liên tục phải là thuộc tính thường như `scale`, `position`, `rotation`, chứ không bao giờ là `args`.',
    },
  ],

  interview: [
    {
      q: 'So sánh viết Three.js thuần trong `useEffect` với dùng React Three Fiber.',
      a: 'Vanilla trong `useEffect` cho toàn quyền kiểm soát nhưng bắt bạn tự lo vòng lặp, resize và dọn dẹp; scene graph tồn tại dưới dạng chuỗi lệnh nên khó đọc khi lớn dần. R3F mô tả scene bằng JSX nên cây hiện rõ trong cấu trúc code, tự quản lý loop, resize và dispose, đồng thời ghép tự nhiên với state và component của React. Cái giá là thêm một tầng trừu tượng cần hiểu, và vẫn phải nắm Three.js để gỡ lỗi. Tôi chọn R3F cho ứng dụng React, và vanilla khi cần nhúng vào môi trường không phải React hoặc cần kiểm soát tuyệt đối vòng lặp.',
    },
    {
      q: 'Vì sao không nên dùng `setState` trong `useFrame`?',
      a: 'Vì `useFrame` chạy mỗi khung hình, nên `setState` sẽ kích hoạt điều hoà React 60 lần mỗi giây cho toàn bộ nhánh component. Chi phí đó thường lớn hơn cả việc render 3D. Cách đúng là giữ tham chiếu bằng `useRef` rồi ghi thẳng vào thuộc tính của đối tượng Three.js — nó nằm ngoài vòng đời React nên không gây render lại. Chỉ dùng state cho những thay đổi thật sự cần cập nhật giao diện React.',
    },
    {
      q: 'Prop `args` hoạt động thế nào và bẫy của nó là gì?',
      a: '`args` là mảng tham số truyền vào constructor khi R3F khởi tạo đối tượng. Bẫy nằm ở chỗ đổi `args` không cập nhật đối tượng hiện có mà **huỷ và tạo lại** hoàn toàn, kèm chi phí nạp lại lên GPU. Vì vậy chỉ đặt giá trị tĩnh vào `args`; mọi thứ thay đổi theo thời gian phải là thuộc tính thường như `position`, `scale`, hoặc với geometry thì dùng `scale` thay vì đổi kích thước dựng.',
    },
    {
      q: 'R3F tự dispose những gì và không tự dispose những gì?',
      a: 'Nó tự dispose mọi geometry, material và đối tượng được tạo ra từ JSX khi phần tử tương ứng rời khỏi cây. Nó **không** biết tới tài nguyên bạn tạo bằng tay ngoài JSX — texture nạp thủ công qua loader, render target tự tạo, hay geometry dựng trong `useMemo`. Những thứ đó vẫn cần dọn trong hàm cleanup của `useEffect`. Nó cũng không dispose tài nguyên nằm trong cache dùng chung như `useGLTF`, vì cache đó cố ý được giữ lại để tái sử dụng.',
    },
  ],

  checkpoints: [
    'Port được hệ mặt trời sang R3F mà không nhìn lại bản vanilla.',
    'Trả lời được câu hỏi so sánh vanilla với R3F bằng trải nghiệm của chính bạn.',
    'Biết vì sao không dùng `setState` trong `useFrame`.',
    'Có dãy số `gl.info.memory` chứng minh R3F tự dispose.',
  ],

  sandbox: r3fSandbox(APP, { height: 480 }),
};
