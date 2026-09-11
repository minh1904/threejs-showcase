import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

/** Texture chấm tròn mờ — không có nó, mỗi hạt là một hình VUÔNG. */
function taoTextureHat() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function ThienHa({ soHat, soNhanh, doXoan, mauTrong, mauNgoai, dungTexture, sizeAtt, depthWrite }) {
  const ref = useRef();
  const texture = useMemo(taoTextureHat, []);

  // Tự dựng BufferGeometry — nối tiếp đúng kỹ thuật bài 1.2,
  // chỉ khác là giờ có tới 100 000 đỉnh thay vì 3.
  const geometry = useMemo(() => {
    const positions = new Float32Array(soHat * 3);
    const colors = new Float32Array(soHat * 3);

    const trong = new THREE.Color(mauTrong);
    const ngoai = new THREE.Color(mauNgoai);

    for (let i = 0; i < soHat; i++) {
      const i3 = i * 3;

      // Bán kính ngẫu nhiên, luỹ thừa để hạt dồn về tâm
      const r = Math.pow(Math.random(), 1.6) * 5;

      // Góc của nhánh: chia đều vòng tròn cho số nhánh
      const gocNhanh = ((i % soNhanh) / soNhanh) * Math.PI * 2;

      // Càng ra xa càng xoắn — đây là công thức tạo hình xoắn ốc
      const gocXoan = r * doXoan;

      // Nhiễu ngẫu nhiên để hạt không nằm trên một đường mảnh
      const nhieu = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * r;

      positions[i3]     = Math.cos(gocNhanh + gocXoan) * r + nhieu();
      positions[i3 + 1] = nhieu() * 0.5;
      positions[i3 + 2] = Math.sin(gocNhanh + gocXoan) * r + nhieu();

      // Attribute 'color' cho phép mỗi hạt một màu — vẫn chỉ 1 draw call
      const mau = trong.clone().lerp(ngoai, r / 5);
      colors[i3] = mau.r;
      colors[i3 + 1] = mau.g;
      colors[i3 + 2] = mau.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [soHat, soNhanh, doXoan, mauTrong, mauNgoai]);

  // geometry tự tạo ngoài JSX -> R3F KHÔNG dọn hộ (bài 5.5)
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation={sizeAtt}
        vertexColors
        transparent
        depthWrite={depthWrite}
        blending={THREE.AdditiveBlending}
        alphaMap={dungTexture ? texture : null}
        alphaTest={dungTexture ? 0.001 : 0}
      />
    </points>
  );
}

function DoDac({ soHat }) {
  const { gl } = useThree();
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((state, delta) => {
    const a = acc.current;
    a.frames++; a.time += delta;
    if (a.time >= 0.4) {
      const el = document.getElementById('perf');
      if (el) {
        el.innerHTML =
          '<b>số hạt</b> ' + soHat.toLocaleString() + '<br>' +
          '<b>FPS</b> ' + Math.round(a.frames / a.time) + '<br>' +
          '<b>draw calls</b> <span style="color:#ea733a">' + gl.info.render.calls + '</span>';
      }
      a.frames = 0; a.time = 0;
    }
  });

  return null;
}

export default function App() {
  const [soHat, setSoHat] = useState(30000);
  const [soNhanh, setSoNhanh] = useState(4);
  const [doXoan, setDoXoan] = useState(0.9);
  const [dungTexture, setDungTexture] = useState(true);
  const [sizeAtt, setSizeAtt] = useState(true);
  const [depthWrite, setDepthWrite] = useState(false);

  return (
    <>
      <Canvas camera={{ position: [0, 3.5, 8], fov: 50 }}>
        <color attach="background" args={['#08080c']} />
        <ThienHa
          soHat={soHat} soNhanh={soNhanh} doXoan={doXoan}
          mauTrong="#ffa46b" mauNgoai="#3b7bd4"
          dungTexture={dungTexture} sizeAtt={sizeAtt} depthWrite={depthWrite}
        />
        <DoDac soHat={soHat} />
        <OrbitControls enableDamping makeDefault />
      </Canvas>

      <div id="perf" style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.9,
      }} />

      <div style={{
        position: 'fixed', bottom: 12, left: 12, display: 'flex', gap: 8, flexWrap: 'wrap',
        maxWidth: 'calc(100vw - 24px)',
      }}>
        {[5000, 30000, 100000].map((n) => (
          <button key={n} onClick={() => setSoHat(n)} style={btn(soHat === n)}>
            {n.toLocaleString()} hạt
          </button>
        ))}
        {[2, 4, 6].map((n) => (
          <button key={n} onClick={() => setSoNhanh(n)} style={btn(soNhanh === n)}>
            {n} nhánh
          </button>
        ))}
        <button onClick={() => setDungTexture((v) => !v)} style={btn(dungTexture)}>
          texture tròn
        </button>
        <button onClick={() => setSizeAtt((v) => !v)} style={btn(sizeAtt)}>
          sizeAttenuation
        </button>
        <button onClick={() => setDepthWrite((v) => !v)} style={btn(depthWrite)}>
          depthWrite
        </button>
      </div>
    </>
  );
}

function btn(active) {
  return {
    padding: '5px 9px', borderRadius: 5, cursor: 'pointer',
    border: '1px solid ' + (active ? '#0c8ce9' : '#333'),
    background: active ? 'rgba(12,140,233,.15)' : '#111',
    color: active ? '#0c8ce9' : '#a3a3a3',
    font: '11px ui-monospace,monospace',
  };
}
`;

export const LESSON_6_1: LessonContent = {
  id: '6-1',

  goal: 'Dựng được hiệu ứng thiên hà chỉnh được bằng giao diện, và giải thích được vì sao `Points` rẻ hơn `Mesh` rất nhiều.',

  lecture: [
    'Hệ hạt là kỹ thuật phổ biến bậc nhất trong web 3D quảng cáo và portfolio: bụi sao, tuyết rơi, khói, tia lửa, những dải điểm sáng trôi phía sau nội dung. Nó cũng là bài khép lại đẹp nhất cho những gì bạn đã học, vì nó dùng lại gần như mọi thứ.',

    '`THREE.Points` nhận một `BufferGeometry` và vẽ **mỗi đỉnh thành một chấm** thay vì nối chúng thành tam giác. Đây chính là `BufferGeometry` bạn tự dựng ở bài 1.2, chỉ khác là giờ có một trăm nghìn đỉnh thay vì ba. Không có mặt, không có pháp tuyến, không có chỉ số tam giác — chỉ một mảng vị trí.',

    'Chính sự tối giản đó làm nó rẻ. Một trăm nghìn hạt vẫn là **một draw call**, và mỗi hạt chỉ tốn một đỉnh cộng một chấm nhỏ để tô. Hãy đối chiếu với bài 5.2: một trăm nghìn mesh riêng lẻ là một trăm nghìn draw call, và ngay cả instancing cũng phải xử lý hình học đầy đủ cho từng bản.',

    'Có ba chi tiết quyết định hiệu ứng trông đẹp hay xấu. **`sizeAttenuation`** làm hạt ở xa nhỏ lại — tắt đi thì mọi hạt cùng cỡ và mất hết cảm giác chiều sâu. **Texture cho hạt**: mặc định mỗi hạt là một hình vuông đặc, xấu một cách rõ ràng; gán một chấm tròn mờ vào `alphaMap` là đủ. Và **`depthWrite = false`** — đây chính là bài 2.7 quay lại: hạt trong suốt chồng lên nhau rất nhiều, để chúng ghi depth sẽ khiến chúng cắt lẫn nhau thành những mảng vuông sắc cạnh.',

    'Phần thiên hà là chỗ thú vị nhất. Thay vị trí ngẫu nhiên bằng một công thức xoắn ốc — bán kính, góc nhánh, độ xoắn tăng theo bán kính — và bạn có một dải ngân hà. Thêm attribute `color` để hạt đổi màu dần từ tâm ra rìa, vẫn giữ nguyên một draw call.',
  ],

  concepts: [
    {
      term: 'THREE.Points',
      explain:
        'Vẽ mỗi đỉnh của geometry thành một chấm thay vì nối thành tam giác. Cần `PointsMaterial` hoặc `ShaderMaterial` tương ứng.',
    },
    {
      term: 'sizeAttenuation',
      explain:
        'Hạt ở xa nhỏ lại theo phối cảnh. Bật cho hiệu ứng trong không gian; tắt khi muốn hạt giữ kích thước cố định như giao diện.',
    },
    {
      term: 'alphaMap cho hạt',
      explain:
        'Không có nó, mỗi hạt là một hình vuông đặc. Một chấm tròn mờ đơn giản đã đủ tạo khác biệt lớn.',
    },
    {
      term: 'depthWrite = false',
      explain:
        'Hạt trong suốt chồng lấn rất nhiều nên không nên ghi depth — đúng bài học 2.7. Kết hợp với `AdditiveBlending` cho hiệu ứng phát sáng.',
    },
    {
      term: 'vertexColors + attribute color',
      explain:
        'Mỗi đỉnh mang màu riêng qua một attribute. Cho phép chuyển màu dần trên toàn hệ hạt mà vẫn giữ một draw call.',
    },
    {
      term: 'Animate trong shader',
      explain:
        'Cập nhật `positions` từ JavaScript mỗi khung hình rất tốn với số lượng lớn. Tính vị trí trong vertex shader theo `uTime` thì gần như miễn phí — nội dung bài 6.4.',
    },
  ],

  walkthrough: [
    {
      action: 'Tạo `Float32Array` với `soHat * 3` phần tử và điền vị trí.',
      why: 'Nhân 3 vì mỗi đỉnh có ba toạ độ — đúng cấu trúc bạn đã học ở bài 1.2.',
    },
    {
      action: 'Gán vào `bufferAttribute attach="attributes-position"` với `itemSize` là 3.',
      why: 'Cú pháp `attach` của R3F ánh xạ tới `geometry.setAttribute("position", ...)`.',
    },
    {
      action: 'Bật `sizeAttenuation` rồi tắt để so sánh.',
      why: 'Khác biệt về cảm giác chiều sâu rất rõ, nhìn một lần là nhớ.',
    },
    {
      action: 'Gán texture chấm tròn vào `alphaMap`.',
      why: 'Đây là chi tiết duy nhất quyết định hiệu ứng trông chuyên nghiệp hay nghiệp dư.',
    },
    {
      action: 'Đặt `depthWrite = false` và `blending = AdditiveBlending`.',
      why: 'Additive blending cộng dồn ánh sáng nên chỗ nhiều hạt chồng nhau sáng hơn — đúng cách ánh sáng thật hoạt động.',
    },
    {
      action: 'Thay vị trí ngẫu nhiên bằng công thức xoắn ốc: góc nhánh cộng độ xoắn theo bán kính.',
      why: 'Hãy đọc kỹ công thức. Chỉ ba dòng nhưng tạo ra toàn bộ hình dạng thiên hà.',
    },
    {
      action: 'Thêm attribute `color` và bật `vertexColors`.',
      why: 'Chuyển màu từ tâm ra rìa là thứ khiến hiệu ứng trông có chủ ý thay vì ngẫu nhiên.',
    },
    {
      action: 'Ghi lại draw calls với 5000 rồi 100 000 hạt.',
      why: 'Con số này là điểm nối trực tiếp với bài 5.2.',
    },
  ],

  observations: [
    {
      change: 'Chuyển từ 5000 lên 100 000 hạt và theo dõi draw calls.',
      observe: 'Draw calls không đổi — vẫn chỉ là một.',
      why: 'Toàn bộ hệ hạt là **một** đối tượng với một geometry và một material, nên GPU nhận đúng một lệnh. Hãy so với bài 5.2: 100 000 mesh riêng lẻ là 100 000 draw call và sẽ đứng hình hoàn toàn. Đây là lý do mọi hiệu ứng hạt trong web 3D đều dùng `Points` chứ không dùng mesh.',
    },
    {
      change: 'Tắt "texture tròn".',
      observe: 'Mỗi hạt trở thành một hình vuông đặc có viền sắc.',
      why: 'GPU vẽ mỗi điểm thành một ô vuông pixel — đó là hành vi mặc định của point sprite. `alphaMap` với một chấm tròn mờ dần khiến các góc vuông trở nên trong suốt, và phần chuyển tiếp mềm làm hạt tan vào nhau tự nhiên. Chi tiết nhỏ này quyết định phần lớn chất lượng cảm nhận của hiệu ứng.',
    },
    {
      change: 'Bật `depthWrite`.',
      observe: 'Các hạt bắt đầu cắt nhau thành những mảng vuông sắc cạnh, hiệu ứng vỡ vụn.',
      why: 'Đúng vấn đề của bài 2.7 nhưng ở quy mô lớn hơn nhiều. Khi hạt ghi depth, hạt vẽ trước sẽ loại bỏ hạt phía sau — nhưng vùng trong suốt của texture vẫn ghi depth, tạo ra những ô vuông vô hình chặn mọi thứ phía sau. Với hàng chục nghìn hạt chồng lấn, kết quả là nhiễu loạn. `depthWrite = false` là bắt buộc với hệ hạt.',
    },
    {
      change: 'Tắt `sizeAttenuation`.',
      observe: 'Mọi hạt cùng kích thước bất kể ở gần hay xa; hiệu ứng trở nên phẳng.',
      why: 'Kích thước biểu kiến giảm theo khoảng cách là tín hiệu chiều sâu mạnh nhất mà mắt người dùng. Tắt nó đi thì hệ hạt trông như một lớp nhiễu dán trên màn hình. Tuy nhiên có trường hợp cần tắt: khi hạt đóng vai trò phần tử giao diện cần giữ kích thước đọc được ở mọi khoảng cách.',
    },
  ],

  interview: [
    {
      q: 'Vì sao `Points` rẻ hơn `Mesh` rất nhiều?',
      a: 'Vì mỗi hạt chỉ là một đỉnh, không có tam giác, pháp tuyến hay chỉ số. Toàn bộ hệ hạt là một đối tượng nên chỉ tốn một draw call bất kể có bao nhiêu hạt. Về phía GPU, mỗi hạt chỉ cần chạy vertex shader một lần rồi tô một vùng nhỏ. So với việc dựng cùng số lượng bằng mesh — dù có instancing — thì khối lượng hình học và chi phí vertex shader thấp hơn hàng chục lần.',
    },
    {
      q: 'Xử lý trong suốt cho hệ hạt thế nào?',
      a: 'Đặt `transparent = true` và **`depthWrite = false`** — điểm thứ hai là bắt buộc. Hạt chồng lấn rất nhiều, và nếu chúng ghi depth thì vùng trong suốt của texture vẫn chặn những gì phía sau, tạo ra các ô vuông vô hình. Với hiệu ứng phát sáng thì thêm `AdditiveBlending` để ánh sáng cộng dồn ở chỗ hạt tụ lại — vừa đẹp hơn vừa loại bỏ hoàn toàn vấn đề thứ tự vẽ, vì phép cộng có tính giao hoán.',
    },
    {
      q: 'Animate hàng chục nghìn hạt thế nào cho hiệu quả?',
      a: 'Không cập nhật mảng `positions` từ JavaScript mỗi khung hình — với một trăm nghìn hạt đó là ba trăm nghìn phép ghi cộng một lần nạp lại toàn bộ buffer lên GPU mỗi frame. Cách đúng là tính vị trí trong **vertex shader** từ một uniform thời gian: gửi lên một con số, GPU tính song song cho mọi hạt. Với chuyển động cần trạng thái tích luỹ thì dùng kỹ thuật GPGPU, lưu trạng thái vào texture và cập nhật bằng shader.',
    },
    {
      q: 'Làm sao dựng hình xoắn ốc thiên hà?',
      a: 'Với mỗi hạt, lấy một bán kính ngẫu nhiên — nâng luỹ thừa để hạt dồn về tâm — rồi tính góc gồm hai phần: góc của nhánh, bằng chỉ số hạt chia dư cho số nhánh rồi nhân với góc chia đều vòng tròn; và góc xoắn tỉ lệ với bán kính, đây là phần tạo ra đường cong. Cộng thêm nhiễu ngẫu nhiên có luỹ thừa để hạt tản ra khỏi đường mảnh mà vẫn dày ở giữa. Cuối cùng nội suy màu theo bán kính để tâm và rìa khác nhau.',
    },
  ],

  checkpoints: [
    'Có thiên hà chỉnh được số hạt, số nhánh, độ xoắn.',
    'Giải thích được vì sao `Points` rẻ hơn `Mesh`.',
    'Biết vì sao hệ hạt bắt buộc phải `depthWrite = false`.',
    'Có số draw calls với 5000 và 100 000 hạt để đối chiếu với bài 5.2.',
  ],

  sandbox: r3fSandbox(APP, { height: 520 }),
};
