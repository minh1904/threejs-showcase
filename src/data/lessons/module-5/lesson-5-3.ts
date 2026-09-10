import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Detailed } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

const KHOANG_CACH_LOD = [0, 9, 18];       // ngưỡng chuyển mức
const SO_SEGMENT = [64, 16, 6];           // độ mịn tương ứng từng mức

function VatTheLOD({ position, wireframe, dungLOD }) {
  const mats = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: '#0c8ce9', roughness: 0.4, wireframe }),
      new THREE.MeshStandardMaterial({ color: '#ea733a', roughness: 0.4, wireframe }),
      new THREE.MeshStandardMaterial({ color: '#9149f5', roughness: 0.4, wireframe }),
    ],
    [wireframe]
  );

  if (!dungLOD) {
    // Không dùng LOD: luôn vẽ mức chi tiết cao nhất, bất kể ở xa
    return (
      <mesh position={position} material={mats[0]}>
        <sphereGeometry args={[0.9, SO_SEGMENT[0], SO_SEGMENT[0] / 2]} />
      </mesh>
    );
  }

  // <Detailed> của drei bọc THREE.LOD: tự chọn mức theo khoảng cách tới camera.
  // Màu khác nhau để bạn NHÌN THẤY thời điểm chuyển mức.
  return (
    <Detailed distances={KHOANG_CACH_LOD} position={position}>
      <mesh material={mats[0]}>
        <sphereGeometry args={[0.9, SO_SEGMENT[0], SO_SEGMENT[0] / 2]} />
      </mesh>
      <mesh material={mats[1]}>
        <sphereGeometry args={[0.9, SO_SEGMENT[1], SO_SEGMENT[1] / 2]} />
      </mesh>
      <mesh material={mats[2]}>
        <sphereGeometry args={[0.9, SO_SEGMENT[2], SO_SEGMENT[2] / 2]} />
      </mesh>
    </Detailed>
  );
}

function DoDac() {
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
          '<b>draw calls</b> ' + gl.info.render.calls + '<br>' +
          '<b>triangles</b> <span style="color:#ea733a">' +
            gl.info.render.triangles.toLocaleString() + '</span><br>' +
          '<b>khoảng cách camera</b> ' + state.camera.position.length().toFixed(1);
      }
      a.frames = 0; a.time = 0;
    }
  });

  return null;
}

export default function App() {
  const [dungLOD, setDungLOD] = useState(true);
  const [wireframe, setWireframe] = useState(true);
  const [tatCulling, setTatCulling] = useState(false);

  const viTri = useMemo(() => {
    const out = [];
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) out.push([x * 2.4, 0, z * 2.4]);
    }
    return out;
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 5, 12], fov: 45 }}
        onCreated={({ scene }) => {
          scene.traverse((o) => { if (o.isMesh) o.frustumCulled = !tatCulling; });
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 6]} intensity={2.2} />

        {viTri.map((p, i) => (
          <VatTheLOD key={i} position={p} wireframe={wireframe} dungLOD={dungLOD} />
        ))}

        <DoDac />
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
      }}>
        <button onClick={() => setDungLOD((v) => !v)} style={btn(dungLOD)}>
          LOD: {dungLOD ? 'bật' : 'tắt'}
        </button>
        <button onClick={() => setWireframe((v) => !v)} style={btn(wireframe)}>
          wireframe: {wireframe ? 'bật' : 'tắt'}
        </button>
      </div>

      <div style={{
        position: 'fixed', bottom: 46, left: 12,
        font: '11px ui-monospace,monospace', color: '#666',
      }}>
        cuộn chuột để zoom ra xa — quan sát màu đổi khi LOD chuyển mức
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

export const LESSON_5_3: LessonContent = {
  id: '5-3',

  goal: 'Nêu được ba cách giảm chi phí model kèm số liệu, và biết mỗi cách đánh đổi cái gì.',

  lecture: [
    'Ở bài trước bạn đã chuyển nút thắt từ CPU sang GPU bằng instancing. Bài này xử lý phần GPU: giảm khối lượng hình học và bộ nhớ texture thực sự phải xử lý.',

    'Có ba hướng, và chúng bổ sung cho nhau chứ không thay thế nhau. Hướng thứ nhất là **giảm số đa giác** ngay từ khâu tài sản — `gltf-transform simplify --ratio 0.5` cắt một nửa số tam giác. Điều bất ngờ với người mới là ngưỡng mắt người nhận ra thường thấp hơn nhiều so với dự đoán, nhất là với vật thể có texture tốt. Hãy tự tìm ngưỡng đó thay vì tin vào con số ai đó đưa.',

    'Hướng thứ hai là **LOD** — Level of Detail. Ý tưởng đơn giản đến mức hiển nhiên: một vật thể cách camera ba mươi mét chỉ chiếm vài chục pixel trên màn hình, nên dùng bản 20 000 tam giác cho nó là lãng phí thuần tuý. `THREE.LOD` — hoặc `<Detailed>` của drei — giữ nhiều bản và tự đổi theo khoảng cách. Sandbox tô màu khác nhau cho từng mức để bạn nhìn thấy thời điểm chuyển.',

    'Hướng thứ ba là **texture**: giảm kích thước về mức thật sự cần theo diện tích vật thể chiếm trên màn hình, và nén sang KTX2 như đã học ở bài 3.3. Nhắc lại điểm quan trọng nhất ở đó: JPG được giải nén hoàn toàn trong VRAM, KTX2 thì không.',

    'Cuối cùng là **frustum culling** — Three.js đã làm sẵn và miễn phí: vật thể có hộp bao nằm ngoài vùng nhìn thì không được vẽ. Nhưng có lúc cần tắt nó bằng `frustumCulled = false`: khi bạn dịch chuyển đỉnh trong vertex shader nên hộp bao không còn phản ánh vị trí thật, hoặc với `InstancedMesh` trải rộng mà hộp bao gộp lại quá lớn. Biết khi nào cần tắt cũng quan trọng như biết nó tồn tại.',
  ],

  concepts: [
    {
      term: 'Decimation',
      explain:
        'Giảm số đa giác của model, bằng `gltf-transform simplify` hoặc modifier trong Blender. Rẻ nhất vì làm một lần lúc chuẩn bị tài sản, không tốn gì lúc chạy.',
    },
    {
      term: 'LOD',
      explain:
        'Giữ nhiều mức chi tiết, tự đổi theo khoảng cách tới camera. `THREE.LOD` hoặc `<Detailed>` của drei. Đổi lại là tốn thêm bộ nhớ vì phải giữ tất cả các mức.',
    },
    {
      term: 'Kích thước texture',
      explain:
        'Nên chọn theo diện tích vật thể chiếm trên màn hình. Texture 4K cho vật nhỏ là lãng phí thuần tuý — VRAM tăng theo bình phương cạnh.',
    },
    {
      term: 'Frustum culling',
      explain:
        'Three.js tự loại vật thể có hộp bao ngoài vùng nhìn. Miễn phí và bật sẵn. Tắt bằng `frustumCulled = false` khi hộp bao không còn đáng tin.',
    },
    {
      term: 'Khi nào cần tắt culling',
      explain:
        'Khi vertex shader dịch chuyển đỉnh (hộp bao tính theo dữ liệu gốc nên sai), hoặc `InstancedMesh` trải rộng khiến hộp bao gộp quá lớn để cull có ý nghĩa.',
    },
  ],

  walkthrough: [
    {
      action: 'Chạy `gltf-transform simplify model.glb out.glb --ratio 0.5` và so sánh trực quan.',
      why: 'Tìm ngưỡng mắt bạn bắt đầu nhận ra. Ngưỡng đó thường thấp hơn dự đoán rất nhiều.',
    },
    {
      action: 'Ghi lại số triangle của từng bản sau mỗi mức giảm.',
      why: 'Cần con số để cân nhắc đánh đổi, không thể quyết định bằng cảm giác.',
    },
    {
      action: 'Dựng LOD ba mức bằng `<Detailed distances={[0, 9, 18]}>`.',
      why: 'Ngưỡng khoảng cách nên chọn sao cho lúc chuyển mức, vật thể đã đủ nhỏ để mắt không bắt được.',
    },
    {
      action: 'Bật wireframe và cuộn zoom ra xa, quan sát thời điểm chuyển mức.',
      why: 'Wireframe làm việc chuyển mức hiện rõ. Ở chế độ tô đặc, nếu ngưỡng chọn tốt thì bạn sẽ không thấy gì.',
    },
    {
      action: 'Đo số triangle khi camera ở gần và khi ở xa, cả hai chế độ bật/tắt LOD.',
      why: 'Đây là số liệu chứng minh giá trị của LOD.',
    },
    {
      action: 'Đặt nhiều vật thể ngoài tầm nhìn và xác nhận draw calls giảm.',
      why: 'Để tự thấy frustum culling đang hoạt động mà bạn không phải làm gì.',
    },
  ],

  observations: [
    {
      change: 'Bật wireframe và LOD, rồi cuộn zoom camera ra xa dần.',
      observe: 'Các quả cầu lần lượt đổi màu từ xanh sang cam sang tím, và số triangle giảm theo bậc.',
      why: '`THREE.LOD` tính khoảng cách từ camera tới từng đối tượng mỗi khung hình rồi chọn mức phù hợp. Việc đổi màu ở đây chỉ để bạn nhìn thấy — trong dự án thật cả ba mức cùng màu và cùng texture, nên nếu chọn ngưỡng tốt thì người dùng không nhận ra gì. Ngưỡng tốt là ngưỡng mà tại đó vật thể đã đủ nhỏ trên màn hình để chi tiết bị mất không còn phân biệt được.',
    },
    {
      change: 'Tắt LOD và giữ camera ở xa, so sánh số triangle.',
      observe: 'Số triangle cao hơn nhiều lần trong khi hình ảnh gần như y hệt.',
      why: 'Đây là toàn bộ lý do LOD tồn tại. Ở khoảng cách xa, một quả cầu 64 segment và một quả 6 segment chiếm cùng vài chục pixel — GPU làm gấp nhiều lần công việc để cho ra kết quả giống nhau. Với cảnh có hàng trăm vật thể, khoản lãng phí này quyết định giữa 60fps và 20fps.',
    },
    {
      change: 'Xoay camera sao cho phần lớn lưới vật thể ra khỏi khung nhìn.',
      observe: 'Draw calls và triangles giảm mạnh mà bạn không làm gì cả.',
      why: 'Frustum culling hoạt động sẵn: mỗi khung hình, Three.js kiểm tra hộp bao của từng đối tượng với sáu mặt phẳng của khối nhìn, và bỏ qua những gì nằm ngoài. Phép kiểm tra này rất rẻ so với việc vẽ. Đây cũng là lý do phải đo hiệu năng ở góc nhìn **xấu nhất** — góc thấy nhiều vật thể nhất — chứ không phải góc mặc định.',
    },
    {
      change: 'Trong dự án thật, đặt `mesh.frustumCulled = false` cho một `InstancedMesh` trải rộng.',
      observe: 'Vật thể luôn được vẽ kể cả khi ra khỏi khung nhìn.',
      why: 'Với `InstancedMesh`, hộp bao được tính cho cả khối chứ không cho từng instance. Một rừng cây trải khắp bản đồ sẽ có hộp bao khổng lồ, gần như luôn giao với khối nhìn, nên culling ở mức khối chẳng có tác dụng. Lúc đó người ta chia thành nhiều `InstancedMesh` theo vùng, hoặc chuyển sang `BatchedMesh` vốn cull được từng phần.',
    },
  ],

  interview: [
    {
      q: 'Nêu ba cách giảm chi phí render của model.',
      a: 'Một là giảm số đa giác ngay từ khâu tài sản bằng decimation — rẻ nhất vì làm một lần, không tốn gì lúc chạy, nhưng mất chi tiết vĩnh viễn. Hai là LOD: giữ nhiều mức và đổi theo khoảng cách, giữ được chất lượng khi nhìn gần nhưng tốn thêm bộ nhớ vì phải lưu tất cả các mức. Ba là tối ưu texture: chọn kích thước theo diện tích hiển thị thật và nén KTX2 để giảm cả VRAM lẫn băng thông. Trong dự án thật tôi dùng cả ba, vì chúng nhắm vào ba nút thắt khác nhau.',
    },
    {
      q: 'LOD hoạt động thế nào và chọn ngưỡng ra sao?',
      a: '`THREE.LOD` giữ nhiều đối tượng con kèm ngưỡng khoảng cách; mỗi khung hình nó tính khoảng cách tới camera và chỉ hiển thị mức phù hợp. Ngưỡng nên chọn theo diện tích vật thể chiếm trên màn hình chứ không phải theo con số khoảng cách tuỳ ý — nguyên tắc là chuyển mức khi mất chi tiết không còn phân biệt được ở kích thước hiển thị đó. Cần lưu ý hiện tượng nhấp nháy khi camera dao động quanh đúng ngưỡng; giải quyết bằng vùng đệm trễ hoặc bằng cách chuyển mờ dần.',
    },
    {
      q: 'Frustum culling là gì và khi nào cần tắt?',
      a: 'Là việc engine bỏ qua vật thể có hộp bao nằm hoàn toàn ngoài khối nhìn của camera. Three.js làm sẵn mỗi khung hình và nó rất rẻ so với chi phí vẽ. Cần tắt trong hai tình huống: khi vertex shader dịch chuyển đỉnh nên hộp bao tính từ dữ liệu gốc không còn phản ánh vị trí thật — vật thể sẽ biến mất sai lúc; và với `InstancedMesh` trải rộng, nơi hộp bao gộp quá lớn khiến culling ở mức khối vô nghĩa. Trường hợp sau thì giải pháp tốt hơn là chia nhỏ theo vùng.',
    },
    {
      q: 'Chọn kích thước texture thế nào cho hợp lý?',
      a: 'Theo diện tích tối đa mà vật thể chiếm trên màn hình. Nếu một vật chưa bao giờ lớn hơn 200 pixel thì texture 512 là quá đủ, và 4K là lãng phí gấp 64 lần bộ nhớ. Bộ nhớ tăng theo bình phương cạnh, nên giảm một nửa cạnh là tiết kiệm ba phần tư. Trong thực tế tôi bắt đầu từ nhu cầu hiển thị rồi làm tròn lên luỹ thừa của 2 gần nhất, sau đó nén KTX2 — kết hợp lại thường giảm được bộ nhớ texture xuống một phần nhỏ so với ban đầu.',
    },
  ],

  checkpoints: [
    'Có số liệu triangle trước và sau khi giảm đa giác, và biết ngưỡng mắt bạn nhận ra.',
    'Dựng được LOD ba mức và chọn được ngưỡng hợp lý.',
    'Giải thích được vì sao đôi khi phải tắt frustum culling.',
    'Chọn được kích thước texture theo diện tích hiển thị thật.',
  ],

  sandbox: r3fSandbox(APP, { height: 500 }),
};
