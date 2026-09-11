import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { easing } from 'maath';
import * as THREE from 'three';
import './styles.css';

// THỬ ĐỔI: 'lerp-sai' | 'lerp-dung' | 'damp3'
const CACH_BAY = 'damp3';

const DIEM = [
  { id: 0, pos: [-4, 0, 0],   color: '#0c8ce9' },
  { id: 1, pos: [-2, 1.4, -3], color: '#ea733a' },
  { id: 2, pos: [0, 0, 2],    color: '#9149f5' },
  { id: 3, pos: [2.4, 1, -2], color: '#4caf50' },
  { id: 4, pos: [4, -0.6, 1], color: '#e0e0e0' },
];

function Diem({ item, onChon, dangChon }) {
  const ref = useRef();

  useFrame((state, delta) => {
    const target = dangChon ? 1.35 : 1;
    easing.damp(ref.current.scale, 'x', target, 0.2, delta);
    ref.current.scale.y = ref.current.scale.z = ref.current.scale.x;
  });

  return (
    <mesh
      ref={ref}
      position={item.pos}
      onClick={(e) => { e.stopPropagation(); onChon(item); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <icosahedronGeometry args={[0.55, 1]} />
      <meshStandardMaterial color={item.color} roughness={0.35} metalness={0.2} />
    </mesh>
  );
}

const VI_TRI_BAN_DAU = new THREE.Vector3(0, 2, 10);
const TAM_BAN_DAU = new THREE.Vector3(0, 0, 0);

function CameraRig({ dich }) {
  const { camera, controls } = useThree();

  // Vector tạm, tạo MỘT LẦN. Tạo Vector3 mới mỗi frame là rác cho GC.
  const viTriDich = useRef(new THREE.Vector3());
  const tamDich = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!controls) return;

    if (dich) {
      // Đứng lùi lại một khoảng theo hướng từ tâm ra điểm đích
      const p = new THREE.Vector3(...dich.pos);
      tamDich.current.copy(p);
      viTriDich.current.copy(p).add(new THREE.Vector3(0, 1.1, 3.2));
    } else {
      viTriDich.current.copy(VI_TRI_BAN_DAU);
      tamDich.current.copy(TAM_BAN_DAU);
    }

    if (CACH_BAY === 'lerp-sai') {
      // SAI: hệ số cố định mỗi frame -> tốc độ bay phụ thuộc FPS,
      // đúng vấn đề của bài 1.4 nhưng ở dạng khó nhận ra hơn.
      camera.position.lerp(viTriDich.current, 0.06);
      controls.target.lerp(tamDich.current, 0.06);
    } else if (CACH_BAY === 'lerp-dung') {
      // ĐÚNG: quy đổi hệ số theo delta bằng hàm mũ.
      // 1 - exp(-k * dt) cho kết quả độc lập frame rate.
      const t = 1 - Math.exp(-4 * delta);
      camera.position.lerp(viTriDich.current, t);
      controls.target.lerp(tamDich.current, t);
    } else {
      // TỐT NHẤT: damp3 của maath — nội suy kiểu lò xo giảm chấn,
      // đã tính delta sẵn, dừng lại êm chứ không "bò" mãi về đích.
      easing.damp3(camera.position, viTriDich.current, 0.45, delta);
      easing.damp3(controls.target, tamDich.current, 0.45, delta);
    }

    controls.update();
  });

  return null;
}

export default function App() {
  const [dich, setDich] = useState(null);

  return (
    <>
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }} onPointerMissed={() => setDich(null)}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />

        {DIEM.map((item) => (
          <Diem
            key={item.id}
            item={item}
            dangChon={dich?.id === item.id}
            onChon={setDich}
          />
        ))}

        <gridHelper args={[24, 24, '#222', '#181818']} position={[0, -2, 0]} />

        {/* makeDefault để useThree().controls trả về đúng đối tượng này.
            enabled={!dich} tạm khoá điều khiển tay trong lúc camera đang bay. */}
        <OrbitControls enableDamping makeDefault enabled={!dich} />
        <CameraRig dich={dich} />
      </Canvas>

      <div style={{
        position: 'fixed', bottom: 12, left: 12,
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.8,
      }}>
        <div>cách bay: <span style={{ color: '#e5e5e5' }}>{CACH_BAY}</span></div>
        <div>{dich ? 'đang focus điểm ' + dich.id : 'click một khối để camera bay tới'}</div>
        <div style={{ color: '#666' }}>click chỗ trống để reset view</div>
      </div>
    </>
  );
}
`;

export const LESSON_4_6: LessonContent = {
  id: '4-6',

  goal: 'Chuyển cảnh mượt như các trang sản phẩm 3D chuyên nghiệp, với tốc độ bay **không đổi** theo FPS máy.',

  lecture: [
    'Camera bay tới vật thể khi người dùng bấm vào nó là mẫu tương tác phổ biến nhất của mọi trang trưng bày sản phẩm 3D. Nó cũng là chỗ dễ nhận ra người làm cẩn thận: chuyển cảnh mượt tạo cảm giác cao cấp, chuyển cảnh giật khiến sản phẩm trông rẻ tiền.',

    'Cách đơn giản nhất là nội suy tuyến tính: mỗi khung hình, dịch camera một phần nhỏ về phía đích. `camera.position.lerp(target, 0.06)` nghĩa là "đi 6% quãng đường còn lại mỗi khung hình". Nó cho chuyển động giảm tốc tự nhiên vì quãng đường còn lại ngày càng ngắn.',

    'Nhưng nó mang đúng cái bẫy của bài 1.4, ở dạng khó nhận ra hơn. "6% mỗi **khung hình**" nghĩa là trên màn 120Hz camera bay nhanh gần gấp đôi so với 60Hz. Cách sửa không phải nhân delta trực tiếp — vì lerp là quá trình theo hàm mũ, không tuyến tính — mà là quy đổi hệ số: `t = 1 - Math.exp(-k * delta)`. Công thức này cho kết quả giống hệt nhau ở mọi tần số khung hình.',

    'Trong thực tế thì hầu như không ai tự viết công thức đó. Thư viện `maath` của nhóm Poimandres có sẵn `easing.damp3()` — nội suy kiểu lò xo giảm chấn, đã xử lý delta, và quan trọng là nó **dừng hẳn** khi đủ gần đích thay vì bò mãi theo hàm mũ. Đây là lựa chọn nên dùng.',

    'Hai chi tiết nữa tạo nên sự khác biệt giữa "chạy được" và "chuyên nghiệp". Thứ nhất, phải di chuyển cả `controls.target` chứ không chỉ `camera.position` — nếu không, camera tới nơi nhưng vẫn nhìn về hướng cũ. Thứ hai, tạm khoá `OrbitControls` trong lúc bay, để thao tác chuột của người dùng không giằng co với chuyển động tự động.',
  ],

  concepts: [
    {
      term: 'lerp',
      explain:
        'Nội suy tuyến tính: `a.lerp(b, t)` dịch `a` về phía `b` theo tỉ lệ `t`. Gọi lặp lại mỗi khung hình cho chuyển động giảm tốc theo hàm mũ.',
    },
    {
      term: 'Độc lập frame rate',
      explain:
        'Hệ số cố định mỗi khung hình khiến tốc độ phụ thuộc FPS. Công thức đúng là `t = 1 - Math.exp(-k * delta)`, không phải nhân delta trực tiếp.',
    },
    {
      term: 'easing.damp3',
      explain:
        'Của thư viện `maath`. Nội suy kiểu lò xo giảm chấn cho `Vector3`, đã xử lý delta và dừng hẳn khi đủ gần đích. Có `damp` cho số đơn và `dampE` cho góc Euler.',
    },
    {
      term: 'controls.target',
      explain:
        'Điểm mà `OrbitControls` hướng camera vào. Phải nội suy cùng lúc với `camera.position`, nếu không camera tới nơi mà vẫn nhìn hướng cũ.',
    },
    {
      term: 'makeDefault',
      explain:
        'Prop của `<OrbitControls>` giúp `useThree().controls` trả về đúng đối tượng đó. Không có nó thì các component khác không truy cập được controls.',
    },
  ],

  walkthrough: [
    {
      action: 'Đặt vài vật thể ở các vị trí khác nhau và bắt `onClick` trên từng cái.',
      why: 'Cần nhiều đích để cảm nhận chất lượng chuyển cảnh ở các quãng đường khác nhau.',
    },
    {
      action: 'Làm thủ công trước bằng `camera.position.lerp(target, 0.06)` trong `useFrame`.',
      why: 'Phải thấy cách đơn giản hoạt động thế nào trước khi hiểu vì sao cần cách phức tạp hơn.',
    },
    {
      action: 'Đổi `CACH_BAY` sang `lerp-dung` để dùng công thức quy đổi theo hàm mũ.',
      why: 'Hãy đọc kỹ `1 - Math.exp(-k * delta)` và hiểu vì sao không thể chỉ nhân delta vào hệ số.',
    },
    {
      action: 'Cài `maath` và chuyển sang `easing.damp3(camera.position, target, 0.45, delta)`.',
      why: 'So sánh cảm giác với `lerp-dung`. Điểm khác rõ nhất là lúc gần tới đích.',
    },
    {
      action: 'Nội suy cả `controls.target`, rồi gọi `controls.update()`.',
      why: 'Thiếu bước này camera tới đúng chỗ nhưng hướng nhìn sai — lỗi rất hay gặp.',
    },
    {
      action: 'Đặt `enabled={!dich}` cho `<OrbitControls>` và thêm `onPointerMissed` để reset.',
      why: 'Khoá điều khiển tay khi đang bay tránh giằng co; click chỗ trống để quay về là hành vi người dùng mong đợi.',
    },
    {
      action: 'Tạo `Vector3` tạm bằng `useRef` một lần, không tạo mới mỗi khung hình.',
      why: 'Tạo object mỗi frame sinh rác cho garbage collector, gây khựng định kỳ trong scene lớn.',
    },
  ],

  observations: [
    {
      change: 'Đặt `CACH_BAY = "lerp-sai"` rồi giới hạn FPS xuống 30 trong DevTools (tab Rendering).',
      observe: 'Camera bay chậm hẳn lại so với khi chạy ở 60fps.',
      why: 'Hệ số `0.06` có nghĩa "6% quãng đường còn lại mỗi **khung hình**". Ít khung hình hơn nghĩa là ít bước tiến hơn trong cùng khoảng thời gian. Đây vẫn là bài học của 1.4, chỉ khó nhận ra hơn vì chuyển động vẫn mượt — chỉ sai tốc độ.',
    },
    {
      change: 'Đổi sang `lerp-dung` và lặp lại thí nghiệm giới hạn FPS.',
      observe: 'Thời gian bay tới đích như nhau ở cả 30fps lẫn 60fps.',
      why: 'Công thức `1 - Math.exp(-k * delta)` quy đổi tốc độ phân rã theo thời gian thật. Không dùng phép nhân delta đơn giản được vì lerp lặp lại là quá trình theo hàm mũ chứ không tuyến tính — nhân delta vào hệ số sẽ cho kết quả gần đúng ở khung hình ngắn nhưng lệch rõ khi khung hình dài.',
    },
    {
      change: 'So sánh `lerp-dung` với `damp3`, chú ý giai đoạn camera sắp tới nơi.',
      observe: '`lerp-dung` bò chậm dần mãi không dứt khoát; `damp3` tới nơi và dừng gọn.',
      why: 'Lerp lặp lại về mặt toán học không bao giờ tới đích — nó tiệm cận theo hàm mũ, nên luôn còn một chuyển động cực nhỏ. `damp3` dùng mô hình lò xo giảm chấn có ngưỡng: khi đủ gần thì gán thẳng giá trị đích và dừng. Kết quả là chuyển động dứt khoát và cũng tiết kiệm được vài phép tính vô ích mỗi khung hình.',
    },
    {
      change: 'Bỏ dòng nội suy `controls.target`, chỉ giữ `camera.position`.',
      observe: 'Camera bay tới gần vật thể nhưng vẫn hướng về tâm scene, vật thể nằm lệch khỏi khung.',
      why: '`OrbitControls` luôn hướng camera vào `target` của nó. Dời camera mà không dời target thì bạn chỉ thay đổi khoảng cách và góc quay quanh điểm cũ. Cả hai phải đi cùng nhau, và phải gọi `controls.update()` sau đó để controls tính lại ma trận.',
    },
  ],

  interview: [
    {
      q: 'Làm sao để chuyển động nội suy độc lập với frame rate?',
      a: 'Không nhân delta trực tiếp vào hệ số lerp, vì lerp lặp lại là quá trình theo hàm mũ. Công thức đúng là `t = 1 - Math.exp(-k * delta)` với `k` là tốc độ phân rã mong muốn — nó cho kết quả giống nhau ở mọi tần số khung hình. Trong thực tế tôi dùng `easing.damp3` của `maath`, vốn đã xử lý chuyện này và còn dừng hẳn khi đủ gần đích thay vì tiệm cận vô hạn.',
    },
    {
      q: 'Vì sao `damp3` tốt hơn `lerp` cho chuyển cảnh camera?',
      a: 'Ba lý do. Nó đã tính delta nên độc lập frame rate. Nó dùng mô hình lò xo giảm chấn cho đường cong tự nhiên hơn, và có ngưỡng dừng nên không bò mãi về đích như lerp lặp lại vốn tiệm cận vô hạn. Và nó nhận tham số là thời gian đạt đích tính bằng giây — dễ suy nghĩ và dễ chỉnh hơn một hệ số trừu tượng.',
    },
    {
      q: 'Cần lưu ý gì khi cho camera bay tới một vật thể?',
      a: 'Phải nội suy cả hướng nhìn chứ không chỉ vị trí — với `OrbitControls` là `controls.target`, và nhớ gọi `controls.update()` sau đó. Nên tạm khoá điều khiển tay trong lúc bay để thao tác người dùng không giằng co với chuyển động tự động. Vị trí đích nên tính lùi lại theo hướng từ tâm ra vật thể thay vì một điểm cố định, để hoạt động đúng với vật ở mọi vị trí. Và tạo sẵn các vector tạm ngoài `useFrame` để không sinh rác mỗi khung hình.',
    },
    {
      q: 'Vì sao không nên tạo `new THREE.Vector3()` trong `useFrame`?',
      a: 'Vì `useFrame` chạy 60 lần mỗi giây, nên mỗi vector tạo trong đó sinh ra 60 object rác mỗi giây cho mỗi component. Với scene có nhiều component như vậy, garbage collector sẽ chạy thường xuyên và gây những cú khựng nhỏ định kỳ — dạng giật khó chẩn đoán vì nó không tương quan với bất kỳ hành động nào của người dùng. Cách đúng là tạo vector tạm một lần bằng `useRef` hoặc `useMemo` rồi tái sử dụng qua `.copy()` và `.set()`.',
    },
  ],

  checkpoints: [
    'Camera bay mượt và tốc độ không đổi khi giới hạn FPS.',
    'Giải thích được vì sao không nhân delta trực tiếp vào hệ số lerp.',
    'Nội suy cả `controls.target`, không chỉ vị trí camera.',
    'Không tạo object mới trong `useFrame`.',
  ],

  sandbox: r3fSandbox(APP, { dependencies: { maath: '0.10.8' }, height: 480 }),
};
