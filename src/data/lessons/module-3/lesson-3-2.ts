import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import './styles.css';

const container = document.getElementById('app');

// ---------------------------------------------------------------------------
// Sandbox không tải được file thật, nên ta mô phỏng một LoadingManager với
// vài asset có tốc độ tải khác nhau. Cơ chế callback và cách dựng màn hình
// loading thì giống hệt khi dùng GLTFLoader / TextureLoader thật.
// ---------------------------------------------------------------------------

// --- Màn hình loading ---
const overlay = document.createElement('div');
overlay.style.cssText =
  'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;' +
  'justify-content:center;gap:14px;background:#0a0a0a;z-index:10;' +
  'font:12px ui-monospace,monospace;color:#e5e5e5;' +
  'transition:opacity .6s ease'; // fade mượt sang scene
document.body.appendChild(overlay);

const title = document.createElement('div');
title.textContent = 'Đang tải tài nguyên…';
overlay.appendChild(title);

const barOuter = document.createElement('div');
barOuter.style.cssText = 'width:260px;height:4px;background:#222;border-radius:2px;overflow:hidden';
overlay.appendChild(barOuter);

const barInner = document.createElement('div');
barInner.style.cssText = 'width:0%;height:100%;background:#0c8ce9;transition:width .25s ease';
barOuter.appendChild(barInner);

const detail = document.createElement('div');
detail.style.cssText = 'color:#a3a3a3;font-size:11px';
overlay.appendChild(detail);

// --- LoadingManager: gộp tiến trình của NHIỀU asset thành MỘT con số ---
const manager = new THREE.LoadingManager();

manager.onStart = (url, loaded, total) => {
  console.log('bắt đầu tải:', total, 'tài nguyên');
};

// onProgress được gọi mỗi khi MỘT asset xong — đây là tiến trình theo SỐ FILE,
// không phải theo byte. Muốn chính xác theo byte thì phải tự cộng dồn
// từ callback progress của từng loader.
manager.onProgress = (url, loaded, total) => {
  const percent = Math.round((loaded / total) * 100);
  barInner.style.width = percent + '%';
  detail.textContent = loaded + '/' + total + ' — ' + percent + '%';
};

manager.onLoad = () => {
  detail.textContent = 'xong';
  // Fade mượt thay vì biến mất đột ngột
  overlay.style.opacity = '0';
  setTimeout(() => (overlay.style.display = 'none'), 600);
  console.log('tất cả tài nguyên đã sẵn sàng');
};

manager.onError = (url) => {
  showError(url);
};

function showError(url) {
  overlay.style.opacity = '1';
  overlay.style.display = 'flex';
  overlay.innerHTML = '';

  const msg = document.createElement('div');
  msg.style.cssText = 'color:#ef4444;text-align:center;line-height:1.7';
  msg.innerHTML =
    'Không tải được tài nguyên<br>' +
    '<span style="color:#a3a3a3;font-size:11px">' + url + '</span>';
  overlay.appendChild(msg);

  const retry = document.createElement('button');
  retry.textContent = 'Thử lại';
  retry.style.cssText =
    'padding:7px 14px;border-radius:6px;border:1px solid #333;background:#111;' +
    'color:#e5e5e5;font:12px ui-monospace,monospace;cursor:pointer';
  retry.onclick = () => location.reload();
  overlay.appendChild(retry);
}

// --- Mô phỏng việc tải asset ---
// THỬ ĐỔI: đặt thành true để xem luồng xử lý lỗi
const moPhongLoi = false;

const assets = [
  { name: 'model/robot.glb', ms: 900 },
  { name: 'texture/color.jpg', ms: 1400 },
  { name: 'texture/normal.jpg', ms: 700 },
  { name: 'hdri/studio.hdr', ms: 1800 },
];

let done = 0;
manager.onStart('', 0, assets.length);

assets.forEach((asset, i) => {
  setTimeout(() => {
    if (moPhongLoi && i === 2) {
      manager.onError(asset.name);
      return;
    }
    done++;
    manager.onProgress(asset.name, done, assets.length);
    if (done === assets.length) manager.onLoad();
  }, asset.ms);
});

// --- Scene bên dưới màn loading ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(0, 1.5, 6);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.32, 160, 32),
  new THREE.MeshStandardMaterial({ color: 0x0c8ce9, roughness: 0.3, metalness: 0.4 })
);
scene.add(knot);

const light = new THREE.DirectionalLight(0xffffff, 2.5);
light.position.set(3, 4, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const clock = new THREE.Clock();
let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  knot.rotation.y += 0.4 * clock.getDelta();
  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  overlay.remove();
  knot.geometry.dispose();
  knot.material.dispose();
  renderer.dispose();
}
`;

export const LESSON_3_2: LessonContent = {
  id: '3-2',

  goal: 'Người dùng mạng chậm vẫn thấy tiến trình rõ ràng, và lỗi mạng không bao giờ để lại một trang trắng xoá.',

  lecture: [
    'Mô tả công việc thường có dòng "xử lý loading/error state", và phần lớn ứng viên hiểu nó theo nghĩa gọi API. Với Web 3D thì nó còn quan trọng hơn nhiều: một model có thể nặng vài chục megabyte, một tấm HDRI vài megabyte nữa. Trên mạng 3G, người dùng sẽ nhìn màn hình trống trong nhiều giây — trừ khi bạn chủ động kể cho họ nghe chuyện gì đang xảy ra.',

    'Three.js cho bạn hai tầng công cụ. Tầng thứ nhất là callback `onProgress` của từng loader, nhận `loaded` và `total` tính bằng **byte** — chính xác nhất nhưng chỉ cho một file. Tầng thứ hai là `LoadingManager`, gộp nhiều loader lại và báo tiến trình theo **số file đã xong**. Hãy nắm rõ khác biệt này: `LoadingManager` báo "3 trên 4 file" chứ không phải "75% số byte", nên nếu file thứ tư nặng gấp mười lần ba file kia, thanh tiến trình sẽ đứng rất lâu ở mốc 75%.',

    'Chi tiết thứ hai đáng để ý là **chuyển cảnh**. Màn hình loading biến mất đột ngột tạo cảm giác giật. Một hiệu ứng mờ dần 400–600 mili giây khiến trải nghiệm mượt hơn hẳn, gần như không tốn công — và đây đúng là phần "CSS Animation" mà mô tả công việc nhắc tới.',

    'Cuối cùng là xử lý lỗi. Đường dẫn sai, mạng đứt, file hỏng — đều có thật. `manager.onError` cho bạn chặn lại và hiện một thông báo tử tế kèm nút thử lại, thay vì để người dùng nhìn một canvas đen không giải thích. Hãy đổi `moPhongLoi` trong sandbox thành `true` để xem luồng đó.',
  ],

  concepts: [
    {
      term: 'Callback progress của loader',
      explain:
        'Tham số thứ ba của `loader.load()`. Nhận `ProgressEvent` với `loaded` và `total` tính bằng byte. Chính xác nhất nhưng chỉ áp dụng cho một file.',
    },
    {
      term: 'LoadingManager',
      explain:
        'Gộp nhiều loader thành một luồng tiến trình. `onStart`, `onProgress`, `onLoad`, `onError`. Lưu ý `onProgress` đếm theo **số file**, không theo byte.',
    },
    {
      term: 'onError',
      explain:
        'Kích hoạt khi một tài nguyên tải thất bại. Luôn cần xử lý — đường dẫn sai và mạng đứt là chuyện thường ngày trong sản phẩm thật.',
    },
    {
      term: 'Fade chuyển cảnh',
      explain:
        'Chuyển `opacity` bằng `transition` của CSS rồi mới `display: none`. Rẻ về chi phí nhưng tạo khác biệt lớn về cảm nhận chất lượng.',
    },
    {
      term: 'Network throttling',
      explain:
        'DevTools → Network → chọn "Slow 3G". Bắt buộc phải kiểm thử ở chế độ này, vì trên mạng nội bộ mọi thứ tải xong quá nhanh để thấy vấn đề.',
    },
  ],

  walkthrough: [
    {
      action: 'Dựng màn hình loading che canvas: tiêu đề, thanh tiến trình, phần trăm.',
      why: 'Người dùng cần biết ba điều: có đang tải không, còn bao lâu, và đã hỏng chưa.',
    },
    {
      action: 'Tạo `LoadingManager` và truyền nó vào constructor của mọi loader.',
      why: 'Chỉ khi mọi loader dùng chung một manager thì mới có một con số tiến trình tổng hợp.',
    },
    {
      action: 'Cập nhật thanh tiến trình trong `onProgress`.',
      why: 'Nhớ rằng đây là tiến trình theo số file. Với ít file mà kích thước chênh lệch lớn, hãy cân nhắc tự cộng dồn theo byte.',
    },
    {
      action: 'Trong `onLoad`, hạ `opacity` về 0 rồi mới `display: none` sau khi transition xong.',
      why: 'Đặt `display: none` ngay lập tức sẽ huỷ transition. Phải chờ hết thời gian chuyển.',
    },
    {
      action: 'Xử lý `onError`: hiện thông báo và nút "Thử lại".',
      why: 'Trang trắng không giải thích là trải nghiệm tệ nhất có thể. Một dòng thông báo đã tốt hơn nhiều.',
    },
    {
      action: 'Bật DevTools → Network → "Slow 3G" và tải lại.',
      why: 'Đây là bước duy nhất cho bạn thấy màn hình loading của mình có thật sự hoạt động hay không.',
    },
  ],

  observations: [
    {
      change: 'Đổi `moPhongLoi` thành `true`.',
      observe: 'Màn hình loading dừng lại và chuyển sang thông báo lỗi kèm nút thử lại.',
      why: 'Không có nhánh xử lý này thì thanh tiến trình sẽ đứng im mãi ở một mốc dở dang, và người dùng không biết nên chờ hay tải lại. Trong sản phẩm thật nên phân biệt lỗi mạng (đáng thử lại) với lỗi 404 (thử lại vô ích) để đưa ra hướng dẫn phù hợp.',
    },
    {
      change: 'Đặt asset cuối cùng có `ms` lớn hơn hẳn các asset khác, ví dụ `6000`.',
      observe: 'Thanh tiến trình chạy nhanh tới 75% rồi đứng rất lâu.',
      why: 'Vì `LoadingManager.onProgress` đếm theo **số file hoàn tất**, không theo byte. Ba file nhỏ xong nhanh cho ba phần tư thanh, rồi file lớn treo phần còn lại. Đây là lý do thanh tiến trình của nhiều trang trông "gian dối". Muốn trung thực thì phải cộng dồn `loaded`/`total` theo byte từ callback của từng loader, hoặc gán trọng số theo kích thước file đã biết trước.',
    },
    {
      change: 'Trong `onLoad`, thay hai bước fade bằng `overlay.style.display = "none"` ngay lập tức.',
      observe: 'Màn hình loading biến mất giật cục.',
      why: 'Mắt người rất nhạy với thay đổi đột ngột ở diện tích lớn. Một transition 600ms thuộc loại chi tiết mà người dùng không chỉ tên được nhưng cảm nhận rõ — và nó gần như miễn phí về chi phí kỹ thuật.',
    },
    {
      change: 'Thử render scene ngay lập tức thay vì chờ tải xong.',
      observe: 'Trang có thể đứng hình một nhịp ngay khi model được thêm vào.',
      why: 'Nạp geometry và texture lên GPU là thao tác đồng bộ chặn luồng chính. Với model lớn, cú khựng đó rất rõ. Cách xử lý là giữ màn hình loading cho tới khi mọi thứ sẵn sàng, hoặc dùng kỹ thuật biên dịch trước bằng `renderer.compile()` để dồn chi phí vào lúc người dùng vẫn đang nhìn màn hình chờ.',
    },
  ],

  interview: [
    {
      q: 'Bạn xử lý loading state cho tài nguyên 3D thế nào?',
      a: 'Dùng `LoadingManager` gộp mọi loader để có một luồng tiến trình duy nhất, hiển thị màn hình chờ có thanh phần trăm che canvas cho tới khi xong, rồi mờ dần sang scene. Điểm cần lưu ý là `onProgress` của manager đếm theo số file chứ không theo byte, nên khi kích thước file chênh lệch lớn tôi cộng dồn theo byte từ callback của từng loader để thanh tiến trình phản ánh đúng thực tế. Và luôn kiểm thử ở chế độ Slow 3G, vì trên mạng nội bộ mọi thứ xong quá nhanh để phát hiện vấn đề.',
    },
    {
      q: 'Vì sao loading state với 3D quan trọng hơn với REST API?',
      a: 'Vì độ lớn khác hẳn nhau. Một phản hồi API thường tính bằng kilobyte và xong trong vài trăm mili giây; một model kèm texture có thể vài chục megabyte, mất hàng chục giây trên mạng di động. Ngoài ra, việc nạp dữ liệu lên GPU là thao tác đồng bộ chặn luồng chính, nên ngay cả khi tải xong vẫn có thể có một cú khựng — thứ mà API không bao giờ gây ra.',
    },
    {
      q: 'Làm sao tránh cú khựng khi model vừa tải xong?',
      a: 'Nguyên nhân là việc biên dịch shader và nạp buffer lên GPU diễn ra đồng bộ ở khung hình đầu tiên vật thể xuất hiện. Cách xử lý là gọi `renderer.compile(scene, camera)` trong lúc màn hình loading vẫn hiển thị, để dồn chi phí đó vào thời điểm người dùng đang chờ sẵn. Với scene lớn thì thêm việc đưa vật thể vào dần theo từng khung hình thay vì tất cả cùng lúc.',
    },
    {
      q: 'Nên phân biệt các loại lỗi tải thế nào?',
      a: 'Lỗi mạng tạm thời thì đáng cho người dùng thử lại, và thử lại tự động với thời gian chờ tăng dần cũng hợp lý. Lỗi 404 thì thử lại vô ích — nên báo rõ là tài nguyên không tồn tại. File hỏng hoặc sai định dạng cần thông báo khác nữa vì đó là lỗi của phía phát triển. Trong sản phẩm thật, tôi cũng luôn có phương án dự phòng: một hình khối đơn giản thay cho model, để trang vẫn dùng được thay vì hỏng hoàn toàn.',
    },
  ],

  checkpoints: [
    'Có màn hình loading với phần trăm thật và fade mượt sang scene.',
    'Lỗi tải hiện thông báo tử tế kèm nút thử lại, không để trang trắng.',
    'Biết `LoadingManager.onProgress` đếm theo file chứ không theo byte.',
    'Đã kiểm thử ở chế độ Slow 3G của DevTools.',
  ],

  sandbox: vanillaSandbox(CODE, { height: 460 }),
};
