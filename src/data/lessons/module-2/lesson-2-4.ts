import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(0, 1.5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ---- Sinh texture bằng canvas để sandbox chạy offline ----
// Trong dự án thật bạn sẽ dùng TextureLoader tải file từ Poly Haven.
// Nguyên lý về colorSpace bên dưới thì giống hệt nhau.

function makeCanvas(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  draw(c.getContext('2d'), 512);
  return c;
}

// Texture MÀU: dữ liệu này là màu sắc mắt người nhìn thấy -> cần sRGB
const colorMap = new THREE.CanvasTexture(
  makeCanvas((ctx, s) => {
    ctx.fillStyle = '#b8641f';
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = '#8c4a14';
          ctx.fillRect((x * s) / 8, (y * s) / 8, s / 8, s / 8);
        }
      }
    }
  })
);
colorMap.colorSpace = THREE.SRGBColorSpace; // ĐÚNG cho texture màu

// Texture NORMAL: ba kênh RGB ở đây KHÔNG phải màu, mà là vector pháp tuyến
// đã mã hoá. Áp sRGB lên nó là bóp méo con số -> bề mặt gồ ghề sai hướng.
const normalMap = new THREE.CanvasTexture(
  makeCanvas((ctx, s) => {
    ctx.fillStyle = '#8080ff'; // (0.5, 0.5, 1.0) = pháp tuyến hướng thẳng ra ngoài
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * s, y = Math.random() * s, r = 8 + Math.random() * 22;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, '#b0b0ff');
      g.addColorStop(1, '#8080ff');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  })
);
// KHÔNG đặt colorSpace cho normalMap — mặc định NoColorSpace mới đúng.

const roughnessMap = new THREE.CanvasTexture(
  makeCanvas((ctx, s) => {
    ctx.fillStyle = '#666';
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#eee' : '#222';
      ctx.fillRect(Math.random() * s, Math.random() * s, 40, 40);
    }
  })
);

[colorMap, normalMap, roughnessMap].forEach((t) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
});

const material = new THREE.MeshStandardMaterial({
  map: colorMap,
  normalMap,
  roughnessMap,
  metalness: 0.1,
});

const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 96, 64), material);
scene.add(mesh);

const light = new THREE.DirectionalLight(0xffffff, 2.6);
light.position.set(3, 4, 4);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// ---- Bảng điều khiển ----
const state = {
  batMap: true,
  batNormalMap: true,
  batRoughnessMap: true,
  mapDungSRGB: true,
  normalMapSaiSRGB: false,
  lapTexture: 1,
};

const gui = new GUI({ title: 'Texture' });

gui.add(state, 'batMap').name('map (màu)')
  .onChange((v) => { material.map = v ? colorMap : null; material.needsUpdate = true; });
gui.add(state, 'batNormalMap').name('normalMap')
  .onChange((v) => { material.normalMap = v ? normalMap : null; material.needsUpdate = true; });
gui.add(state, 'batRoughnessMap').name('roughnessMap')
  .onChange((v) => { material.roughnessMap = v ? roughnessMap : null; material.needsUpdate = true; });

const f = gui.addFolder('Không gian màu — bài học chính');
f.add(state, 'mapDungSRGB').name('map dùng sRGB (đúng)')
  .onChange((v) => { colorMap.colorSpace = v ? THREE.SRGBColorSpace : THREE.NoColorSpace; colorMap.needsUpdate = true; });
f.add(state, 'normalMapSaiSRGB').name('normalMap dùng sRGB (SAI)')
  .onChange((v) => { normalMap.colorSpace = v ? THREE.SRGBColorSpace : THREE.NoColorSpace; normalMap.needsUpdate = true; });

gui.add(state, 'lapTexture', 1, 6, 1).name('repeat')
  .onChange((v) => {
    [colorMap, normalMap, roughnessMap].forEach((t) => t.repeat.set(v, v));
  });

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

const clock = new THREE.Clock();
let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  mesh.rotation.y += 0.25 * clock.getDelta();

  hud.textContent =
    'textures trên GPU: ' + renderer.info.memory.textures +
    '   |   mỗi texture 512² RGBA ≈ ' + ((512 * 512 * 4) / 1024 / 1024).toFixed(2) + ' MB chưa nén';

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  gui.destroy();
  [colorMap, normalMap, roughnessMap].forEach((t) => t.dispose());
  material.dispose();
  mesh.geometry.dispose();
  renderer.dispose();
}
`;

export const LESSON_2_4: LessonContent = {
  id: '2-4',

  goal: 'Áp được bộ texture PBR đầy đủ, và giải thích được vì sao texture màu cần `SRGBColorSpace` còn normal map thì không — chủ đề bị bỏ sót nhiều nhất.',

  lecture: [
    'Texture là cách bạn đưa chi tiết vào bề mặt mà không phải thêm một tam giác nào. Một quả cầu 96 segment với normal map tốt trông chi tiết hơn nhiều so với quả cầu 1000 segment không texture — và rẻ hơn hẳn.',

    'Điều cần nắm đầu tiên: không phải texture nào cũng chứa **màu**. `map` chứa màu thật, thứ mắt người nhìn thấy. Nhưng `normalMap` dùng ba kênh RGB để mã hoá một **vector** chỉ hướng bề mặt; `roughnessMap` dùng độ xám để lưu một **con số** từ 0 tới 1. Chúng chỉ mượn định dạng ảnh làm phương tiện lưu trữ, chứ bản thân không phải hình ảnh.',

    'Từ đó suy ra bài học quan trọng nhất của cả bài: **texture màu phải đặt `colorSpace = THREE.SRGBColorSpace`, texture dữ liệu thì không**. Lý do là ảnh sRGB lưu giá trị đã qua một hàm gamma phi tuyến; Three.js cần chuyển ngược về tuyến tính trước khi tính chiếu sáng. Áp phép chuyển đó lên normal map là bóp méo những con số vốn đã đúng — kết quả là ánh sáng đổ sai hướng theo một cách rất khó nhận ra.',

    'Sandbox này sinh texture bằng canvas để chạy được offline, nhưng nguyên lý không khác gì khi bạn tải file thật từ Poly Haven. Hãy bật hai checkbox trong nhóm "Không gian màu" và quan sát kỹ — đây là loại lỗi khiến demo của bạn "trông sai sai" mà không biết tại sao.',
  ],

  concepts: [
    {
      term: 'Các loại map',
      explain:
        '`map` là màu bề mặt; `normalMap` giả lập gồ ghề bằng cách bẻ pháp tuyến; `roughnessMap` và `metalnessMap` điều biến hai tham số PBR theo vùng; `aoMap` tô tối các khe kẽ; `displacementMap` dịch chuyển đỉnh thật (đắt, cần nhiều segment).',
    },
    {
      term: 'colorSpace',
      explain:
        'Texture **màu** đặt `THREE.SRGBColorSpace`. Texture **dữ liệu** — normal, roughness, metalness, ao — để mặc định `NoColorSpace`. Đây là quy tắc bất di bất dịch.',
    },
    {
      term: 'UV mapping',
      explain:
        'Mỗi đỉnh mang thêm một cặp toạ độ `(u, v)` trong khoảng 0–1, xác định điểm nào trên ảnh được dán vào đỉnh đó. Geometry dựng sẵn của Three.js đã có sẵn UV; model nhập từ ngoài thì phụ thuộc người dựng.',
    },
    {
      term: 'wrapS / wrapT + repeat',
      explain:
        'Điều khiển hành vi khi toạ độ UV vượt ngoài 0–1. `RepeatWrapping` cộng với `repeat.set(4, 4)` cho phép lát một texture nhỏ lên diện tích lớn thay vì dùng một ảnh khổng lồ.',
    },
    {
      term: 'Chi phí bộ nhớ',
      explain:
        'Một texture 4096×4096 RGBA chiếm khoảng 64MB VRAM **chưa nén**, và mipmap cộng thêm chừng một phần ba. Đây thường là khoản ngốn bộ nhớ lớn nhất trong một scene web.',
    },
  ],

  walkthrough: [
    {
      action: 'Bắt đầu chỉ với `map`, quan sát, rồi bật thêm `normalMap`, rồi `roughnessMap`.',
      why: 'Thêm từng cái một mới thấy rõ mỗi map đóng góp gì. Bật hết cùng lúc thì không phân biệt được.',
    },
    {
      action: 'Đặt `colorMap.colorSpace = THREE.SRGBColorSpace` và để `normalMap` ở mặc định.',
      why: 'Đây là cấu hình đúng. Hãy ghi nhớ nó làm mốc trước khi cố tình làm sai.',
    },
    {
      action: 'Tắt checkbox "map dùng sRGB" và quan sát màu.',
      why: 'Triệu chứng của lỗi này rất đặc trưng — nhận ra được là gỡ được.',
    },
    {
      action: 'Bật checkbox "normalMap dùng sRGB (SAI)" và nhìn kỹ vùng chuyển sáng tối.',
      why: 'Lỗi này tinh vi hơn nhiều, và chính vì tinh vi mà nó tồn tại trong rất nhiều dự án.',
    },
    {
      action: 'Đặt `wrapS`/`wrapT = RepeatWrapping` rồi kéo slider `repeat` lên 4.',
      why: 'Kỹ thuật cơ bản để phủ mặt sàn lớn mà không cần texture khổng lồ.',
    },
  ],

  observations: [
    {
      change: 'Tắt "map dùng sRGB", tức đặt `colorMap.colorSpace = NoColorSpace`.',
      observe: 'Màu bợt hẳn đi, nhợt nhạt và mất độ tương phản.',
      why: 'Ảnh PNG/JPG lưu màu trong không gian sRGB, tức đã qua một hàm gamma phi tuyến. Three.js tính chiếu sáng ở không gian tuyến tính nên cần chuyển ngược. Bỏ khai báo `SRGBColorSpace` là bảo engine "dữ liệu này đã tuyến tính rồi" — nó bỏ qua bước chuyển và mọi giá trị bị hiểu sai theo hướng sáng hơn thực tế.',
    },
    {
      change: 'Bật "normalMap dùng sRGB (SAI)" và nhìn vùng chuyển sáng tối trên quả cầu.',
      observe: 'Bề mặt trông phẳng bẹt hơn, các vết lồi lõm mất chiều sâu và hướng đổ bóng lệch đi.',
      why: 'Ba kênh RGB của normal map mã hoá một vector đơn vị: `(0.5, 0.5, 1.0)` nghĩa là pháp tuyến hướng thẳng ra ngoài. Áp phép chuyển sRGB sang tuyến tính lên các con số đó là bóp méo vector, khiến shader tính sai hướng bề mặt. Lỗi này đặc biệt khó phát hiện vì kết quả vẫn "trông có vẻ được" — chỉ là kém hơn mức đáng ra.',
    },
    {
      change: 'Kéo slider `repeat` từ 1 lên 6.',
      observe: 'Hoạ tiết lặp lại dày đặc và chi tiết bề mặt trông mịn hơn.',
      why: '`repeat` nhân toạ độ UV lên, nên texture được lát nhiều lần thay vì kéo dãn một lần. Đây là cách lát mặt sàn rộng bằng một ảnh 512px thay vì ảnh 4096px — tiết kiệm rất nhiều VRAM. Cái giá là hoạ tiết lặp lộ liễu khi nhìn tổng thể, nên thực tế người ta hay trộn thêm một lớp nhiễu tần số thấp để phá quy luật.',
    },
    {
      change: 'Tắt riêng `normalMap`, giữ nguyên `map` và `roughnessMap`.',
      observe: 'Quả cầu vẫn có hoạ tiết nhưng bề mặt trở nên trơn nhẵn hoàn toàn.',
      why: '`map` chỉ tô màu; nó không nói gì cho shader về hình dạng vi mô. `normalMap` mới là thứ bẻ pháp tuyến ở từng pixel, khiến phép tính chiếu sáng cho ra sáng tối như thể bề mặt gồ ghề thật. Đây là lý do normal map là map đáng giá nhất trên mỗi byte bỏ ra.',
    },
  ],

  interview: [
    {
      q: 'Vì sao texture màu cần `SRGBColorSpace` còn normal map thì không?',
      a: 'Vì hai loại chứa dữ liệu bản chất khác nhau. Texture màu lưu giá trị đã mã hoá gamma sRGB — cách file ảnh vẫn lưu màu — nên cần chuyển về tuyến tính trước khi đưa vào phép tính chiếu sáng vốn giả định không gian tuyến tính. Normal map thì mượn ba kênh RGB để lưu một vector pháp tuyến; những con số đó đã ở dạng tuyến tính sẵn. Áp phép chuyển sRGB lên chúng là bóp méo vector, làm ánh sáng đổ sai hướng.',
    },
    {
      q: 'Normal map hoạt động thế nào và vì sao nó rẻ hơn thêm hình học?',
      a: 'Nó lưu một vector pháp tuyến cho từng texel, và fragment shader dùng vector đó thay cho pháp tuyến nội suy từ đỉnh khi tính chiếu sáng. Kết quả là bề mặt phản ứng với ánh sáng như thể có gồ ghề thật, dù hình học vẫn phẳng. Rẻ hơn vì chi phí nằm ở một lần đọc texture trong fragment shader, thay vì tăng số đỉnh phải xử lý ở vertex shader cùng băng thông và bộ nhớ đi kèm. Hạn chế là đường viền ngoài của vật thể vẫn phẳng, nên nhìn nghiêng sẽ lộ.',
    },
    {
      q: 'Tối ưu texture cho web như thế nào?',
      a: 'Bắt đầu bằng việc chọn đúng kích thước theo diện tích vật thể chiếm trên màn hình — texture 4K cho vật nhỏ là lãng phí thuần tuý. Dùng luỹ thừa của 2 để mipmap hoạt động đầy đủ. Gộp nhiều map dữ liệu vào các kênh riêng của một ảnh, ví dụ nhét ao/roughness/metalness vào R/G/B. Và quan trọng nhất là dùng định dạng nén GPU như KTX2/Basis: nó giữ trạng thái nén ngay trong VRAM, khác với JPG vốn được giải nén hoàn toàn khi tải lên — đây là nội dung bài 5.3.',
    },
    {
      q: '`aoMap` khác gì với ambient occlusion tính lúc chạy?',
      a: '`aoMap` là dữ liệu nướng sẵn: nghệ sĩ tính trước mức che khuất ở từng điểm rồi lưu vào texture, nên lúc chạy chỉ tốn một lần đọc texture. Nó cần kênh UV thứ hai và chỉ đúng với hình học tĩnh. Ambient occlusion tính lúc chạy như SSAO ở khâu hậu kỳ thì thích ứng được với vật thể chuyển động, nhưng tốn kém hơn nhiều và thường có nhiễu. Dự án thật hay dùng `aoMap` cho phần cảnh tĩnh và chỉ thêm SSAO khi thật sự cần.',
    },
  ],

  checkpoints: [
    'Nói được vì sao texture màu cần sRGB còn normal map thì không.',
    'Nhận ra được triệu chứng màu bợt do thiếu khai báo `SRGBColorSpace`.',
    'Áp được đủ bộ `map` + `normalMap` + `roughnessMap` và biết mỗi cái đóng góp gì.',
    'Dùng được `repeat` để lát texture nhỏ lên bề mặt lớn.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 500 }),
};
