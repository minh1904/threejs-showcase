import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import './styles.css';

const container = document.getElementById('app');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
camera.position.set(0, 2, 7);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const box = new THREE.BoxGeometry(1.1, 1.1, 1.1);

// TRÁI: cộng thẳng mỗi frame -> tốc độ phụ thuộc FPS
const naive = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0xea733a }));
naive.position.x = -1.6;
scene.add(naive);

// PHẢI: nhân với delta -> tốc độ theo thời gian thật
const correct = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x0c8ce9 }));
correct.position.x = 1.6;
scene.add(correct);

// Nhãn chữ để phân biệt hai khối
const label = document.createElement('div');
label.style.cssText =
  'position:fixed;top:12px;left:0;right:0;display:flex;justify-content:space-around;' +
  'font:11px ui-monospace,monospace;color:#a3a3a3;pointer-events:none';
label.innerHTML =
  '<span style="color:#ea733a">rotation.y += 0.02</span>' +
  '<span style="color:#0c8ce9">rotation.y += 1.2 * delta</span>';
document.body.appendChild(label);

// Bảng điều khiển: giới hạn FPS ngay trong sandbox, không cần DevTools
const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:0;right:0;text-align:center;' +
  'font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

// THỬ ĐỔI GIÁ TRỊ NÀY: 0 = chạy hết tốc độ màn hình, 15 hoặc 30 = giới hạn
let fpsCap = 15;

const clock = new THREE.Clock();
let lastDraw = 0;
let frameId;
let frames = 0;
let fpsTimer = 0;
let measuredFps = 0;

function tick() {
  frameId = requestAnimationFrame(tick);

  // getDelta() trả về số GIÂY trôi qua kể từ lần gọi trước.
  // Ở 60fps giá trị này khoảng 0.0167; ở 30fps là khoảng 0.0333.
  const delta = clock.getDelta();

  // Mô phỏng máy yếu: bỏ qua frame cho tới khi đủ khoảng thời gian
  if (fpsCap > 0) {
    lastDraw += delta;
    if (lastDraw < 1 / fpsCap) return;
    lastDraw = 0;
  }

  const step = fpsCap > 0 ? 1 / fpsCap : delta;

  // SAI: mỗi frame cộng cùng một lượng, bất kể frame đó dài bao lâu
  naive.rotation.y += 0.02;

  // ĐÚNG: 1.2 radian mỗi GIÂY, bất kể có bao nhiêu frame trong giây đó
  correct.rotation.y += 1.2 * step;

  frames++;
  fpsTimer += step;
  if (fpsTimer >= 0.5) {
    measuredFps = Math.round(frames / fpsTimer);
    frames = 0;
    fpsTimer = 0;
  }

  hud.textContent =
    'fpsCap = ' + (fpsCap || 'không giới hạn') +
    '   |   FPS đo được ≈ ' + measuredFps +
    '   |   cam ' + naive.rotation.y.toFixed(1) +
    ' rad  vs  ' + correct.rotation.y.toFixed(1) + ' rad';

  renderer.render(scene, camera);
}

tick();

// Huỷ loop khi không dùng nữa. Thiếu dòng này, loop chạy mãi kể cả khi
// component đã unmount — rò rỉ cả CPU lẫn bộ nhớ.
export function dispose() {
  cancelAnimationFrame(frameId);
  box.dispose();
  naive.material.dispose();
  correct.material.dispose();
  renderer.dispose();
}
`;

export const LESSON_1_4: LessonContent = {
  id: '1-4',

  goal: 'Làm vật thể chuyển động mượt với tốc độ **giống nhau trên mọi máy**, bất kể màn hình 60Hz hay 144Hz.',

  lecture: [
    'Tới đây bạn đã render được một khung hình. Chuyển nó thành hoạt ảnh nghe có vẻ chỉ là gọi `render()` lặp đi lặp lại — và đúng là vậy. Nhưng có một cái bẫy nằm ngay chỗ tưởng chừng vô hại nhất, và nó là nội dung chính của cả bài này.',

    'Cái bẫy: `rotation.y += 0.01` nghĩa là "quay thêm 0,01 radian **mỗi khung hình**". Trên màn hình 60Hz bạn được 0,6 radian mỗi giây. Trên màn 120Hz — loại đang phổ biến dần trên điện thoại — cùng đoạn code đó cho 1,2 radian mỗi giây. Vật thể quay nhanh gấp đôi. Người dùng máy yếu thì thấy mọi thứ chậm như phim quay chậm.',

    'Cách sửa là nhân với **delta time** — số giây thực sự trôi qua giữa hai khung hình. Khi đó `rotation.y += 1.2 * delta` có nghĩa là "1,2 radian mỗi giây", một đại lượng gắn với thời gian thật chứ không gắn với tốc độ máy. Đây là quy tắc bất di bất dịch trong mọi engine đồ hoạ, không riêng Three.js.',

    'Sandbox bài này đặt hai khối cạnh nhau: khối cam dùng cách sai, khối xanh dùng cách đúng. Tôi cũng gắn sẵn một bộ giới hạn FPS ngay trong code (`fpsCap`) để bạn thấy hiệu ứng mà không phải mở DevTools. Hãy đổi giá trị đó và quan sát hai con số góc quay ở thanh dưới cùng.',
  ],

  concepts: [
    {
      term: 'requestAnimationFrame',
      explain:
        'Đăng ký một hàm chạy ngay trước lần vẽ lại kế tiếp của trình duyệt. Ưu điểm so với `setInterval`: đồng bộ với tần số quét màn hình, và **tự động dừng khi tab bị ẩn** — tiết kiệm pin, tránh dồn ứ hàng nghìn frame khi người dùng quay lại.',
    },
    {
      term: 'Delta time',
      explain:
        'Số giây trôi qua giữa hai khung hình. Nhân mọi đại lượng chuyển động với nó để đổi đơn vị từ "mỗi khung hình" sang "mỗi giây".',
    },
    {
      term: 'THREE.Clock',
      explain:
        '`getDelta()` trả về thời gian kể từ lần gọi trước — **chỉ được gọi một lần mỗi frame**, vì mỗi lần gọi là một lần đặt lại mốc. `getElapsedTime()` trả về tổng thời gian từ lúc tạo, gọi bao nhiêu lần cũng được.',
    },
    {
      term: 'cancelAnimationFrame',
      explain:
        'Huỷ vòng lặp. Bắt buộc gọi trong cleanup của `useEffect`, nếu không loop vẫn chạy sau khi component đã unmount, giữ tham chiếu tới scene và ngăn nó được thu hồi.',
    },
  ],

  walkthrough: [
    {
      action: 'Viết vòng lặp `tick()` gọi `requestAnimationFrame(tick)` rồi `renderer.render()`.',
      why: 'Lưu ý gọi `requestAnimationFrame` ở **đầu** hàm. Đặt ở cuối thì khi có `return` sớm, vòng lặp sẽ chết.',
    },
    {
      action: 'Cố tình viết sai trước: `naive.rotation.y += 0.02`.',
      why: 'Cần thấy hành vi sai trước khi thấy giá trị của cách đúng. Học kiểu này nhớ lâu hơn đọc kết luận.',
    },
    {
      action: 'Tạo `THREE.Clock`, lấy `delta = clock.getDelta()` **một lần** mỗi frame.',
      why: 'Gọi hai lần trong cùng một frame thì lần thứ hai trả về gần bằng 0, và mọi chuyển động dùng nó sẽ đứng im.',
    },
    {
      action: 'Viết bản đúng: `correct.rotation.y += 1.2 * delta`.',
      why: 'Đọc thành lời: "1,2 radian mỗi giây". Hằng số giờ đây có đơn vị vật lý rõ ràng.',
    },
    {
      action: 'Đổi `fpsCap` giữa `0`, `30` và `15`, quan sát hai con số góc quay ở thanh HUD.',
      why: 'Đây là phần kiểm chứng. Bạn cần thấy tận mắt, không phải tin lời tôi.',
    },
    {
      action: 'Gọi `cancelAnimationFrame(frameId)` trong hàm dọn dẹp.',
      why: 'Kiểm chứng bằng cách thêm `console.log` trong loop rồi rời trang — log phải dừng.',
    },
  ],

  observations: [
    {
      change: 'Đặt `fpsCap = 15`, đợi khoảng mười giây rồi đọc hai con số radian ở thanh dưới.',
      observe: 'Khối cam quay chậm hẳn lại; khối xanh giữ nguyên tốc độ như khi không giới hạn.',
      why: 'Khối cam cộng một lượng cố định **mỗi frame**, nên bớt frame đi là bớt chuyển động. Khối xanh cộng theo thời gian đã trôi qua, nên tổng góc quay sau 10 giây luôn xấp xỉ 12 radian bất kể có bao nhiêu frame. Đây chính là bằng chứng cho câu trả lời phỏng vấn — bạn tự nhìn thấy, không phải học thuộc.',
    },
    {
      change: 'Đặt `fpsCap = 0` để chạy hết tốc độ, rồi so sánh với `fpsCap = 30`.',
      observe: 'Khối cam đổi tốc độ rõ rệt giữa hai chế độ, khối xanh gần như không đổi.',
      why: 'Máy bạn đang chạy khoảng 60fps hoặc hơn. Trên màn 120Hz, khối cam còn nhanh gấp đôi nữa. Bạn không kiểm soát được phần cứng của người dùng — chỉ kiểm soát được việc code có gắn với thời gian thật hay không.',
    },
    {
      change: 'Thêm một dòng `clock.getDelta()` thừa ngay trước dòng tính `correct.rotation.y`.',
      observe: 'Khối xanh gần như đứng im.',
      why: '`getDelta()` đặt lại mốc thời gian mỗi lần gọi. Lần gọi thứ hai chỉ đo được vài micro giây kể từ lần thứ nhất, nên `delta` gần bằng 0. Quy tắc: gọi đúng một lần mỗi frame, lưu vào biến, rồi dùng lại biến đó.',
    },
    {
      change: 'Chuyển sang tab khác vài giây rồi quay lại.',
      observe: 'Vật thể không "nhảy vọt" về phía trước khi bạn quay lại.',
      why: '`requestAnimationFrame` tự ngừng khi tab ẩn, nên không có frame nào dồn lại. Nếu dùng `setInterval` thay thế, trình duyệt vẫn kích hoạt callback (dù đã bị điều tiết) và bạn sẽ gặp hiện tượng nhảy. Với chuyển động cần chính xác cao, người ta còn chặn trần delta bằng `Math.min(delta, 0.1)` để một frame chậm bất thường không đẩy vật thể xuyên qua tường.',
    },
  ],

  interview: [
    {
      q: 'Vì sao phải nhân delta time vào animation?',
      a: 'Vì cộng thẳng một hằng số mỗi frame khiến tốc độ phụ thuộc vào FPS. Cùng một đoạn code chạy nhanh gấp đôi trên màn 120Hz so với 60Hz, và chậm lại trên máy yếu. Nhân với delta đổi đơn vị từ "mỗi khung hình" sang "mỗi giây", nên chuyển động gắn với thời gian thật và đồng nhất trên mọi thiết bị.',
    },
    {
      q: 'Vì sao dùng `requestAnimationFrame` thay vì `setInterval`?',
      a: 'Ba lý do. Nó đồng bộ với chu kỳ vẽ của trình duyệt nên không sinh ra frame thừa bị bỏ đi. Nó tự dừng khi tab bị ẩn, tiết kiệm pin và tránh dồn ứ. Và nó chạy ngay trước bước vẽ lại, đúng thời điểm mong muốn — trong khi `setInterval` kích hoạt theo lịch riêng, dễ lệch pha với màn hình gây giật hình.',
    },
    {
      q: 'Điều gì xảy ra nếu quên `cancelAnimationFrame` khi unmount?',
      a: 'Vòng lặp tiếp tục chạy sau khi component đã bị gỡ. Nó vẫn giữ tham chiếu tới scene, camera và renderer nên toàn bộ cụm đó không được garbage collector thu hồi, đồng thời vẫn đốt CPU/GPU để vẽ vào một canvas không còn ai nhìn. Vào ra trang vài lần là có vài vòng lặp chạy song song.',
    },
    {
      q: 'Có nên chặn trần delta time không?',
      a: 'Nên, trong hầu hết trường hợp. Khi tab vừa được kích hoạt lại hoặc máy khựng, một frame có thể kéo dài hàng giây. Nhân trực tiếp lượng đó vào chuyển động sẽ khiến vật thể dịch chuyển đột ngột — với vật lý thì có thể xuyên thẳng qua vật cản. `Math.min(delta, 0.1)` là mức chặn phổ biến.',
    },
  ],

  checkpoints: [
    'Có bằng chứng tận mắt cho câu hỏi "vì sao phải nhân delta time".',
    'Giải thích được ưu điểm của `requestAnimationFrame` so với `setInterval`.',
    'Biết `getDelta()` chỉ được gọi một lần mỗi frame và vì sao.',
    'Loop dừng hẳn khi rời trang, đã kiểm chứng bằng `console.log`.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 480 }),
};
