import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useMemo, useLayoutEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

// Đối tượng tạm, tạo MỘT LẦN ở cấp module — không tạo trong vòng lặp.
const tmpObject = new THREE.Object3D();
const tmpColor = new THREE.Color();

function viTri(i) {
  const a = i * 0.7;
  const r = 1.5 + (i % 40) * 0.22;
  return [Math.cos(a) * r, ((i % 30) - 15) * 0.28, Math.sin(a) * r];
}

/** CÁCH A — mỗi vật thể một <mesh> riêng. Mỗi mesh = một draw call. */
function MeshThuong({ soLuong }) {
  // Chia sẻ geometry và material để chỉ đo riêng ảnh hưởng của draw call
  const geometry = useMemo(() => new THREE.BoxGeometry(0.16, 0.16, 0.16), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0c8ce9', roughness: 0.4 }),
    []
  );

  return (
    <group>
      {Array.from({ length: soLuong }, (_, i) => (
        <mesh key={i} geometry={geometry} material={material} position={viTri(i)} />
      ))}
    </group>
  );
}

/** CÁCH B — InstancedMesh. TOÀN BỘ vẽ trong MỘT draw call. */
function Instanced({ soLuong }) {
  const ref = useRef();

  useLayoutEffect(() => {
    for (let i = 0; i < soLuong; i++) {
      const [x, y, z] = viTri(i);
      tmpObject.position.set(x, y, z);
      tmpObject.rotation.set(i * 0.1, i * 0.13, 0);
      tmpObject.updateMatrix();

      // setMatrixAt ghi ma trận transform của instance thứ i
      ref.current.setMatrixAt(i, tmpObject.matrix);

      // setColorAt cho mỗi instance một màu riêng mà VẪN giữ 1 draw call
      tmpColor.setHSL((i % 100) / 100, 0.6, 0.55);
      ref.current.setColorAt(i, tmpColor);
    }

    // BẮT BUỘC: không có hai dòng này thì GPU không nhận dữ liệu mới
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [soLuong]);

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.1;
  });

  // args: [geometry, material, count]. count là số instance TỐI ĐA.
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, soLuong]}>
      <boxGeometry args={[0.16, 0.16, 0.16]} />
      <meshStandardMaterial roughness={0.4} />
    </instancedMesh>
  );
}

function DoDac({ cach, soLuong }) {
  const { gl } = useThree();
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((state, delta) => {
    const a = acc.current;
    a.frames++; a.time += delta;
    if (a.time >= 0.5) {
      const el = document.getElementById('perf');
      if (el) {
        el.innerHTML =
          '<b>cách</b> ' + cach + '<br>' +
          '<b>số vật thể</b> ' + soLuong.toLocaleString() + '<br>' +
          '<b>FPS</b> ' + Math.round(a.frames / a.time) + '<br>' +
          '<b>draw calls</b> <span style="color:#ea733a">' + gl.info.render.calls + '</span><br>' +
          '<b>triangles</b> ' + gl.info.render.triangles.toLocaleString();
      }
      a.frames = 0; a.time = 0;
    }
  });

  return null;
}

export default function App() {
  const [cach, setCach] = useState('instanced');
  const [soLuong, setSoLuong] = useState(2000);

  return (
    <>
      <Canvas camera={{ position: [0, 4, 14], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 6]} intensity={2.2} />

        {cach === 'mesh'
          ? <MeshThuong soLuong={soLuong} />
          : <Instanced soLuong={soLuong} />}

        <DoDac cach={cach} soLuong={soLuong} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div id="perf" style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.8,
      }} />

      <div style={{
        position: 'fixed', bottom: 12, left: 12, display: 'flex', gap: 8, flexWrap: 'wrap',
        font: '11px ui-monospace,monospace',
      }}>
        {['mesh', 'instanced'].map((c) => (
          <button key={c} onClick={() => setCach(c)} style={btn(cach === c)}>
            {c === 'mesh' ? 'Mesh thường' : 'InstancedMesh'}
          </button>
        ))}
        {[500, 2000, 10000, 50000].map((n) => (
          <button key={n} onClick={() => setSoLuong(n)} style={btn(soLuong === n)}>
            {n.toLocaleString()}
          </button>
        ))}
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

export const LESSON_5_2: LessonContent = {
  id: '5-2',

  goal: 'Có con số cụ thể của chính bạn: giảm draw call từ hàng nghìn xuống 1, và biết FPS thay đổi bao nhiêu.',

  lecture: [
    'Đây là bài quan trọng nhất Module 5, và cũng là bài cho bạn câu trả lời phỏng vấn mạnh nhất trong cả lộ trình. Lý do: "em từng giảm draw call từ 5000 xuống 1 và FPS tăng từ 12 lên 60" thuyết phục hơn mọi định nghĩa thuộc lòng.',

    'Trước hết cần hiểu **draw call là gì**. Mỗi lần CPU muốn GPU vẽ một nhóm hình học, nó phải chuẩn bị trạng thái — shader nào, texture nào, ma trận nào — rồi gửi lệnh. Bản thân việc vẽ thì GPU làm rất nhanh; chi phí nằm ở khâu chuẩn bị và giao tiếp. Một nghìn viên gạch riêng lẻ nghĩa là một nghìn lần chuẩn bị và một nghìn lệnh, và CPU trở thành nút cổ chai trong khi GPU ngồi chơi.',

    '`InstancedMesh` giải quyết bằng cách nói với GPU: "đây là một hình học, một vật liệu, và một nghìn ma trận biến đổi — hãy vẽ nó một nghìn lần". Một lệnh duy nhất. GPU vốn được thiết kế cho đúng kiểu công việc này, nên nó xử lý cực kỳ hiệu quả.',

    'Có hai chi tiết kỹ thuật hay bị vấp. Thứ nhất, sau khi ghi ma trận bằng `setMatrixAt()`, bạn **phải** đặt `instanceMatrix.needsUpdate = true` — nếu không, dữ liệu nằm trong bộ nhớ JavaScript mà chưa bao giờ được nạp lên GPU, và bạn thấy một nghìn khối chồng lên nhau tại gốc toạ độ. Thứ hai, đối tượng `Object3D` tạm dùng để tính ma trận phải tạo **một lần** ở ngoài vòng lặp; tạo mới trong vòng lặp năm mươi nghìn lần là năm mươi nghìn object rác.',

    'Instancing không phải giải pháp duy nhất. Với hình học **tĩnh** không cần di chuyển riêng lẻ, `mergeGeometries()` gộp tất cả thành một geometry duy nhất — cũng một draw call, và còn nhẹ hơn vì không cần mảng ma trận. Nguyên tắc chọn: cần điều khiển từng bản riêng thì dùng instancing; hoàn toàn tĩnh thì merge.',

    'Sandbox có sẵn nút chuyển giữa hai cách và bốn mức số lượng. Hãy đi lần lượt và **ghi lại bảng số liệu** — đó là sản phẩm của bài này.',
  ],

  concepts: [
    {
      term: 'Draw call',
      explain:
        'Một lệnh CPU gửi cho GPU để vẽ một nhóm hình học. Chi phí nằm ở khâu chuẩn bị trạng thái và giao tiếp, không phải ở việc vẽ. Quá nhiều draw call biến CPU thành nút cổ chai.',
    },
    {
      term: 'InstancedMesh',
      explain:
        'Vẽ N bản sao của cùng geometry và material trong **một** draw call. Transform của từng bản đặt qua `setMatrixAt(i, matrix)`.',
    },
    {
      term: 'needsUpdate',
      explain:
        'Sau khi ghi ma trận hoặc màu, phải đặt `instanceMatrix.needsUpdate = true` để dữ liệu được nạp lên GPU. Quên là mọi instance chồng lên nhau tại gốc.',
    },
    {
      term: 'setColorAt',
      explain:
        'Cho mỗi instance một màu riêng mà vẫn giữ một draw call. Nhớ đặt `instanceColor.needsUpdate = true` tương ứng.',
    },
    {
      term: 'mergeGeometries',
      explain:
        'Gộp nhiều geometry thành một. Dùng cho hình học **tĩnh** — nhẹ hơn instancing vì không cần mảng ma trận, nhưng mất khả năng điều khiển từng phần.',
    },
    {
      term: 'BatchedMesh',
      explain:
        'Mới hơn instancing: cho phép nhiều geometry **khác nhau** trong một draw call, và mỗi phần vẫn frustum-cull độc lập. Phù hợp khi các vật thể không giống hệt nhau.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo 1000 khối bằng `<mesh>` riêng lẻ, chia sẻ chung geometry và material.',
      why: 'Chia sẻ tài nguyên để phép đo chỉ phản ánh ảnh hưởng của draw call, không lẫn chi phí khác.',
    },
    {
      action: 'Ghi lại draw calls và FPS. Tăng lên 5000 và ghi lại lần nữa.',
      why: 'Hai điểm dữ liệu cho thấy quan hệ tuyến tính giữa số vật thể và số lệnh.',
    },
    {
      action: 'Chuyển sang `<instancedMesh args={[undefined, undefined, count]}>`.',
      why: 'Tham số thứ ba là số instance **tối đa** — cấp phát cố định, không đổi động được.',
    },
    {
      action: 'Đặt transform từng instance bằng `Object3D` tạm rồi `setMatrixAt(i, obj.matrix)`.',
      why: 'Nhớ gọi `obj.updateMatrix()` trước khi đọc `obj.matrix`, nếu không bạn ghi ma trận cũ.',
    },
    {
      action: 'Đặt `instanceMatrix.needsUpdate = true` sau vòng lặp.',
      why: 'Đây là dòng hay quên nhất. Triệu chứng là tất cả instance chồng lên nhau tại gốc toạ độ.',
    },
    {
      action: 'Dùng `setColorAt()` cho màu riêng từng instance.',
      why: 'Chứng minh rằng "một draw call" không có nghĩa là "mọi thứ giống hệt nhau".',
    },
    {
      action: 'Thử 10 000 rồi 50 000 instance và ghi lại bảng số liệu.',
      why: 'Đây là con số bạn mang đi phỏng vấn. Hãy ghi chính xác.',
    },
  ],

  observations: [
    {
      change: 'Chọn "Mesh thường" với 2000 vật thể, đọc draw calls, rồi chuyển sang "InstancedMesh".',
      observe: 'Draw calls rơi từ khoảng hai nghìn xuống còn vài lệnh; FPS tăng rõ rệt.',
      why: 'Chính xác cùng số tam giác được vẽ trong cả hai trường hợp — chỉ khác số lệnh. Điều này chứng minh nút thắt nằm ở phía CPU chứ không phải khối lượng hình học. Đây là bằng chứng trực tiếp nhất cho thấy vì sao draw call là chỉ số đầu tiên cần nhìn khi tối ưu ứng dụng web.',
    },
    {
      change: 'Với "InstancedMesh", tăng lên 50 000.',
      observe: 'Draw calls vẫn gần như không đổi; FPS giảm nhưng không sụp.',
      why: 'Số lệnh không phụ thuộc số instance — đó là toàn bộ ý nghĩa của instancing. Phần giảm FPS lúc này đến từ khối lượng hình học thật sự và số pixel phải tô, tức là bạn đã chuyển nút thắt từ CPU sang GPU. Đó là một tiến bộ: giờ bạn tối ưu tiếp bằng cách giảm số tam giác mỗi instance hoặc cắt bớt vật ở xa.',
    },
    {
      change: 'Xoá dòng `ref.current.instanceMatrix.needsUpdate = true`.',
      observe: 'Tất cả instance chồng lên nhau tại gốc toạ độ, trông như chỉ có một khối.',
      why: '`setMatrixAt()` chỉ ghi vào một mảng `Float32Array` trong bộ nhớ JavaScript. Việc nạp mảng đó lên GPU tốn kém nên Three.js không làm tự động — nó chờ bạn báo hiệu. Không báo thì GPU vẫn dùng dữ liệu khởi tạo, toàn số 0, tức mọi instance ở gốc với ma trận đơn vị.',
    },
    {
      change: 'Chú ý màu sắc của các instance — mỗi khối một màu khác nhau.',
      observe: 'Draw calls vẫn là một, dù có tới trăm màu khác nhau.',
      why: '`setColorAt()` ghi màu vào một attribute riêng cho từng instance, và shader đọc attribute đó thay vì dùng màu chung của material. Vì vẫn là cùng một chương trình shader và cùng một lệnh vẽ, số draw call không đổi. Kỹ thuật này mở rộng được cho bất kỳ dữ liệu nào bạn muốn khác nhau giữa các instance, thông qua `InstancedBufferAttribute` tuỳ chỉnh.',
    },
  ],

  interview: [
    {
      q: 'Draw call là gì và vì sao nhiều draw call làm chậm ứng dụng?',
      a: 'Là một lệnh CPU gửi cho GPU để vẽ một nhóm hình học. Chi phí chủ yếu nằm ở khâu chuẩn bị trạng thái — đặt shader, texture, uniform — và ở việc giao tiếp qua driver đồ hoạ, chứ không phải ở việc vẽ. Nên một nghìn vật thể nhỏ có thể chậm hơn một vật thể lớn với cùng tổng số tam giác. Khi số draw call quá cao, CPU không kịp gửi lệnh và GPU phải chờ — nghẽn ở phía CPU.',
    },
    {
      q: 'Bạn đã giảm draw call bằng cách nào và kết quả ra sao?',
      a: 'Tôi dựng một scene 5000 khối bằng mesh riêng lẻ, đo được 5000 draw call. Chuyển sang `InstancedMesh` thì còn 1 draw call cho toàn bộ, và FPS cải thiện rất rõ dù số tam giác không đổi — chứng tỏ nút thắt hoàn toàn nằm ở phía CPU. Với những phần tĩnh không cần điều khiển riêng lẻ tôi dùng `mergeGeometries` vì nó còn nhẹ hơn. Điểm cần nhớ khi dùng instancing là phải đặt `instanceMatrix.needsUpdate` sau khi ghi ma trận, và tái sử dụng một `Object3D` tạm thay vì tạo mới trong vòng lặp.',
    },
    {
      q: 'Khi nào dùng instancing, khi nào dùng merge geometry?',
      a: 'Instancing khi các bản sao dùng chung geometry và material nhưng cần transform riêng, đặc biệt nếu transform thay đổi lúc chạy — cây cối, đám đông, hạt. Merge khi hình học hoàn toàn tĩnh và không cần điều khiển từng phần — kiến trúc, địa hình, vật trang trí cố định. Merge nhẹ hơn vì không cần mảng ma trận, nhưng mất khả năng frustum-cull từng phần và không di chuyển riêng được. Nếu các vật thể khác geometry nhau thì `BatchedMesh` là lựa chọn mới hơn, gộp được nhiều hình học khác nhau vào một draw call mà vẫn cull độc lập.',
    },
    {
      q: 'Hạn chế của `InstancedMesh` là gì?',
      a: 'Mọi instance dùng chung một geometry và một material, nên muốn hình dạng khác nhau thì phải dùng nhiều `InstancedMesh` hoặc chuyển sang `BatchedMesh`. Số lượng tối đa cố định lúc khởi tạo, muốn đổi phải tạo lại — thực tế người ta cấp phát dư rồi dùng `count` để giới hạn số instance hiển thị. Frustum culling áp dụng cho cả khối chứ không cho từng instance, nên một cụm trải rộng sẽ luôn được vẽ toàn bộ kể cả khi phần lớn nằm ngoài màn hình. Và raycasting trên instance cần xử lý riêng vì kết quả trả về `instanceId` chứ không phải một mesh.',
    },
  ],

  checkpoints: [
    'Có bảng số liệu draw calls và FPS cho cả bốn tổ hợp.',
    'Giải thích được draw call là gì và vì sao nó là nút thắt phía CPU.',
    'Nhớ `instanceMatrix.needsUpdate` và biết triệu chứng khi quên.',
    'Nói được khi nào chọn instancing, khi nào chọn merge.',
  ],

  sandbox: r3fSandbox(APP, { height: 500 }),
};
