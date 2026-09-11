import type { LessonContent } from '../types';
import { r3fSandbox } from '../sandbox-shared';

const APP = `import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer } from '@react-three/drei';
import {
  EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField,
} from '@react-three/postprocessing';
import './styles.css';

function Vat({ position, color, phatSang }) {
  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.4;
    ref.current.rotation.x += delta * 0.15;
  });

  return (
    <mesh ref={ref} position={position}>
      <torusKnotGeometry args={[0.62, 0.2, 128, 24]} />
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.7}
        // emissive đẩy giá trị VƯỢT 1.0 -> đây là thứ Bloom bắt được
        emissive={phatSang ? color : '#000'}
        emissiveIntensity={phatSang ? 2.4 : 0}
      />
    </mesh>
  );
}

function DoDac({ nhan }) {
  const { gl } = useThree();
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((state, delta) => {
    const a = acc.current;
    a.frames++; a.time += delta;
    if (a.time >= 0.4) {
      const el = document.getElementById('perf');
      if (el) {
        el.innerHTML =
          '<b>hiệu ứng</b> ' + nhan + '<br>' +
          '<b>FPS</b> <span style="color:#ea733a">' + Math.round(a.frames / a.time) + '</span><br>' +
          '<b>draw calls</b> ' + gl.info.render.calls;
      }
      a.frames = 0; a.time = 0;
    }
  });

  return null;
}

export default function App() {
  const [bloom, setBloom] = useState(true);
  const [vignette, setVignette] = useState(false);
  const [chroma, setChroma] = useState(false);
  const [dof, setDof] = useState(false);
  const [phatSang, setPhatSang] = useState(true);

  const bat = [
    bloom && 'Bloom', vignette && 'Vignette',
    chroma && 'Chromatic', dof && 'DoF',
  ].filter(Boolean);

  const nhan = bat.length ? bat.join(' + ') : 'không có';

  return (
    <>
      <Canvas camera={{ position: [0, 0.5, 7], fov: 45 }}>
        <color attach="background" args={['#08080c']} />

        <Vat position={[-2.2, 0, 0]} color="#0c8ce9" phatSang={phatSang} />
        <Vat position={[0, 0, 0]}    color="#ea733a" phatSang={phatSang} />
        <Vat position={[2.2, 0, -2]} color="#9149f5" phatSang={phatSang} />

        <Environment resolution={128}>
          <Lightformer intensity={3} position={[0, 4, -4]} scale={[8, 3, 1]} />
        </Environment>

        <DoDac nhan={nhan} />
        <OrbitControls enableDamping makeDefault />

        {/* EffectComposer thay thế lượt render mặc định: nó render scene ra
            render target (bài 6.2) rồi chạy từng hiệu ứng thành các lượt xử lý. */}
        {bat.length > 0 && (
          <EffectComposer>
            {bloom ? (
              // luminanceThreshold: chỉ pixel sáng hơn ngưỡng này mới phát quang
              <Bloom intensity={1.1} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur />
            ) : null}
            {dof ? <DepthOfField focusDistance={0.015} focalLength={0.05} bokehScale={5} /> : null}
            {chroma ? <ChromaticAberration offset={[0.0016, 0.0016]} /> : null}
            {vignette ? <Vignette eskil={false} offset={0.25} darkness={0.85} /> : null}
          </EffectComposer>
        )}
      </Canvas>

      <div id="perf" style={{
        position: 'fixed', top: 12, left: 12,
        padding: '9px 12px', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.1)', background: 'rgba(10,10,10,.85)',
        font: '11px ui-monospace,monospace', color: '#a3a3a3', lineHeight: 1.9,
      }} />

      <div style={{
        position: 'fixed', bottom: 12, left: 12, display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        <button onClick={() => setBloom((v) => !v)} style={btn(bloom)}>Bloom</button>
        <button onClick={() => setDof((v) => !v)} style={btn(dof)}>DepthOfField</button>
        <button onClick={() => setChroma((v) => !v)} style={btn(chroma)}>Chromatic</button>
        <button onClick={() => setVignette((v) => !v)} style={btn(vignette)}>Vignette</button>
        <button onClick={() => setPhatSang((v) => !v)} style={btn(phatSang)}>
          emissive: {phatSang ? 'bật' : 'tắt'}
        </button>
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

export const LESSON_6_3: LessonContent = {
  id: '6-3',

  goal: 'Có bảng đánh đổi của chính bạn giữa vẻ đẹp và cái giá — vì khi phỏng vấn hỏi về hiệu ứng, nói được cả hai mặt mới là tư duy của người làm sản phẩm thật.',

  lecture: [
    'Post-processing là lớp sơn cuối biến một scene "đúng kỹ thuật" thành một scene "trông đắt tiền". Bloom làm vật phát sáng toả hào quang, depth of field xoá phông như ống kính khẩu lớn, vignette tối bốn góc để dồn mắt vào giữa. Chúng rẻ về mặt công sức viết code — và đắt về mặt hiệu năng.',

    'Nhờ bài 6.2 bạn đã biết chúng hoạt động thế nào: `EffectComposer` thay thế lượt render mặc định. Nó render scene vào một render target, rồi chạy từng hiệu ứng như một lượt xử lý toàn màn hình, mỗi lượt đọc kết quả của lượt trước. Đây không phải phép màu mà là chuỗi render target nối tiếp nhau.',

    'Riêng bloom đáng nói thêm vì nó là hiệu ứng được dùng nhiều nhất. Nó lọc ra những pixel sáng hơn `luminanceThreshold`, làm mờ chúng qua nhiều bậc, rồi cộng ngược vào ảnh gốc. Điều quan trọng cần hiểu: **bloom cần giá trị sáng vượt quá 1.0 mới có gì để bắt**. Đó là lý do trong sandbox tôi dùng `emissive` với `emissiveIntensity` lớn hơn 1 — hãy tắt nó đi để thấy bloom gần như không còn tác dụng. Đây cũng là chỗ bài 2.6 về dải động quay lại.',

    'Nhưng phần quan trọng nhất của bài này không phải là bật hiệu ứng — đó là phần dễ. Phần quan trọng là **đo cái giá**. Ghi FPS trước khi bật, rồi sau mỗi hiệu ứng, rồi khi bật hết. Sau đó mở trên điện thoại và làm lại toàn bộ. Trên GPU di động, chênh lệch thường lớn tới mức buộc bạn phải chọn.',

    'Và đó chính là điều nhà tuyển dụng muốn nghe. Ai cũng bật được bloom. Người làm sản phẩm thật là người nói được "bloom làm tôi mất 18fps trên iPhone 12 nên tôi chỉ bật nó ở desktop" — có số liệu, có quyết định, có lý do.',
  ],

  concepts: [
    {
      term: 'EffectComposer',
      explain:
        'Thay thế lượt render mặc định bằng một chuỗi lượt xử lý. Render scene ra target rồi chạy từng hiệu ứng nối tiếp. Thứ tự các hiệu ứng con có ảnh hưởng.',
    },
    {
      term: 'Bloom',
      explain:
        'Lọc pixel sáng hơn `luminanceThreshold`, làm mờ nhiều bậc, cộng ngược vào ảnh. Cần giá trị vượt 1.0 mới có tác dụng — thường tạo bằng `emissiveIntensity` lớn.',
    },
    {
      term: 'luminanceThreshold',
      explain:
        'Ngưỡng độ sáng để một pixel được coi là "phát quang". Đặt thấp thì cả cảnh mờ nhoè; đặt cao thì chỉ điểm sáng nhất mới toả.',
    },
    {
      term: 'DepthOfField',
      explain:
        'Xoá phông theo khoảng cách, dùng depth buffer. Đắt nhất trong nhóm hiệu ứng thông dụng vì cần nhiều mẫu cho vùng bokeh.',
    },
    {
      term: 'Chi phí theo pixel',
      explain:
        'Mỗi lượt xử lý là một lần tô toàn màn hình. Chi phí tỉ lệ với độ phân giải, nên hiệu ứng ảnh hưởng nặng nhất trên màn DPR cao — tức là điện thoại.',
    },
  ],

  walkthrough: [
    {
      action: 'Cài `@react-three/postprocessing` — **đến bài này mới cài**.',
      why: 'Cài sớm thì bạn sẽ có xu hướng bật hiệu ứng để che khuyết điểm thay vì sửa gốc rễ ở ánh sáng và vật liệu.',
    },
    {
      action: 'Ghi lại FPS **trước** khi bật bất kỳ hiệu ứng nào.',
      why: 'Không có đường cơ sở thì mọi con số sau đó vô nghĩa.',
    },
    {
      action: 'Bật `<Bloom>` với `luminanceThreshold` khoảng 0.85, ghi lại FPS.',
      why: 'Ngưỡng quá thấp làm cả cảnh mờ nhoè; hãy chỉnh tới khi chỉ phần thật sự sáng mới toả.',
    },
    {
      action: 'Bật lần lượt `DepthOfField`, `ChromaticAberration`, `Vignette`, ghi FPS sau mỗi lần.',
      why: 'Đo từng cái riêng mới biết cái nào đắt. Chúng chênh nhau rất nhiều.',
    },
    {
      action: 'Bật hết cùng lúc và ghi lại.',
      why: 'Chi phí cộng dồn gần như tuyến tính theo số lượt xử lý.',
    },
    {
      action: 'Deploy và lặp lại toàn bộ phép đo **trên điện thoại thật**.',
      why: 'Đây là bước quyết định. Chênh lệch trên di động thường buộc bạn phải cắt bớt.',
    },
    {
      action: 'Dựa vào số liệu, quyết định hiệu ứng nào giữ trên di động.',
      why: 'Kết hợp với `<PerformanceMonitor>` ở bài 5.6 để tắt hiệu ứng động khi FPS tụt.',
    },
  ],

  observations: [
    {
      change: 'Bật Bloom rồi tắt `emissive` của các vật thể.',
      observe: 'Hào quang gần như biến mất hoàn toàn.',
      why: 'Bloom chỉ tác động lên pixel sáng hơn `luminanceThreshold`. Không có `emissive`, độ sáng của vật thể do ánh sáng phản xạ quyết định và hiếm khi vượt ngưỡng. Đây là điều người mới hay vấp: bật bloom mà không thấy gì, rồi hạ ngưỡng xuống rất thấp làm cả cảnh mờ nhoè. Cách đúng là tạo nguồn sáng thật sự vượt 1.0 — chính là dải động HDR của bài 2.6.',
    },
    {
      change: 'Bật lần lượt từng hiệu ứng và theo dõi FPS.',
      observe: 'Mỗi hiệu ứng lấy đi một phần FPS, và `DepthOfField` đắt hơn hẳn.',
      why: 'Mỗi hiệu ứng là ít nhất một lượt tô toàn màn hình. `DepthOfField` đắt hơn vì phải lấy nhiều mẫu quanh mỗi pixel để mô phỏng vùng nhoè, và còn đọc thêm depth buffer. Bloom cũng nhiều lượt nhưng làm ở độ phân giải giảm dần nên rẻ hơn — đó là ý nghĩa của tuỳ chọn `mipmapBlur`.',
    },
    {
      change: 'Hạ `luminanceThreshold` từ 0.85 xuống 0.2.',
      observe: 'Toàn cảnh mờ nhoè, mất tương phản, trông như ống kính bẩn.',
      why: 'Ngưỡng thấp khiến gần như mọi pixel được coi là nguồn sáng, nên phần mờ cộng vào khắp nơi. Bloom hoạt động tốt khi nó chỉ chạm vào một phần nhỏ của ảnh — đúng như ống kính thật, nơi chỉ nguồn sáng mạnh mới gây loé. Đây là hiệu ứng rất dễ lạm dụng.',
    },
    {
      change: 'Thu nhỏ cửa sổ trình duyệt xuống rất nhỏ với tất cả hiệu ứng đang bật.',
      observe: 'FPS tăng vọt.',
      why: 'Xác nhận rằng post-processing là chi phí thuần tuý theo pixel — đúng phép thử phân biệt nghẽn CPU/GPU ở bài 5.1. Và điều đó dẫn tới một hệ quả quan trọng cho di động: màn hình điện thoại có DPR cao nên số pixel thực tế rất lớn, khiến hiệu ứng đắt hơn nhiều so với cảm giác từ kích thước màn hình.',
    },
  ],

  interview: [
    {
      q: 'Post-processing hoạt động thế nào?',
      a: 'Thay vì render thẳng ra canvas, scene được render vào một render target. Mỗi hiệu ứng sau đó là một lượt tô toàn màn hình đọc kết quả của lượt trước và ghi ra một target khác, cho tới lượt cuối ghi ra canvas. Bloom chẳng hạn: lọc ngưỡng độ sáng, làm mờ qua nhiều bậc độ phân giải giảm dần, rồi cộng ngược vào ảnh gốc. Hiểu điều này quan trọng vì nó giải thích trực tiếp vì sao chi phí tỉ lệ với số pixel nhân số lượt.',
    },
    {
      q: 'Vì sao bloom không có tác dụng dù đã bật?',
      a: 'Gần như luôn là do không có pixel nào đủ sáng vượt `luminanceThreshold`. Bloom mô phỏng hiện tượng loé sáng của ống kính, vốn chỉ xảy ra với nguồn sáng mạnh, nên nó cần giá trị vượt quá 1.0 để bắt. Cách tạo là dùng `emissive` với `emissiveIntensity` lớn hơn 1, hoặc environment map HDR có vùng thật sự chói. Hạ ngưỡng xuống rất thấp là cách sai — nó làm cả cảnh mờ nhoè thay vì tạo điểm nhấn.',
    },
    {
      q: 'Bạn quyết định giữ hay bỏ hiệu ứng dựa trên gì?',
      a: 'Dựa trên số liệu đo trên thiết bị mục tiêu, không phải trên cảm nhận ở máy phát triển. Tôi lấy đường cơ sở FPS, bật từng hiệu ứng và ghi lại, rồi lặp lại toàn bộ trên điện thoại thật. Sau đó cân giữa mức cải thiện thị giác và chi phí. Thường thì bloom đáng giữ vì tác động thị giác lớn trên mỗi đơn vị chi phí, còn depth of field hay bị cắt trên di động. Tôi cũng kết hợp `<PerformanceMonitor>` để tắt bớt hiệu ứng động khi FPS tụt dưới ngưỡng.',
    },
    {
      q: 'Có cách nào giảm chi phí post-processing không?',
      a: 'Có vài hướng. Chạy hiệu ứng ở độ phân giải thấp hơn khung hình chính — với bloom thì hoàn toàn không nhận ra vì kết quả vốn đã mờ, đó là ý nghĩa của `mipmapBlur`. Gộp nhiều hiệu ứng vào một lượt shader nếu chúng đơn giản, `EffectComposer` của `@react-three/postprocessing` đã tự làm việc này cho các hiệu ứng tương thích. Giới hạn hiệu ứng theo vùng thay vì toàn màn hình khi có thể. Và đơn giản nhất là tắt hẳn trên thiết bị yếu, phục vụ phiên bản không hiệu ứng.',
    },
  ],

  checkpoints: [
    'Có bảng FPS trên desktop và di động cho từng tổ hợp hiệu ứng.',
    'Hiểu vì sao bloom cần giá trị sáng vượt 1.0.',
    'Đã ra quyết định cụ thể về hiệu ứng nào giữ trên di động, kèm lý do.',
    'Giải thích được post-processing dựa trên render target của bài 6.2.',
  ],

  sandbox: r3fSandbox(APP, {
    dependencies: { '@react-three/postprocessing': '3.0.4', postprocessing: '6.36.6' },
    height: 480,
  }),
};
