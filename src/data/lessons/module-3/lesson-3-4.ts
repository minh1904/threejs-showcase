import type { LessonContent } from '../types';
import { vanillaSandbox } from '../sandbox-shared';

const CODE = `import * as THREE from 'three';
import GUI from 'lil-gui';
import './styles.css';

const container = document.getElementById('app');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(0, 2, 7);
camera.lookAt(0, 0.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 2.2);
light.position.set(3, 5, 4);
scene.add(light);

// ---------------------------------------------------------------------------
// Model thật từ file .glb sẽ mang sẵn gltf.animations. Ở đây ta dựng nhân vật
// và TỰ TẠO các AnimationClip bằng KeyframeTrack — chính là dạng dữ liệu mà
// GLTFLoader trả về. Cơ chế mixer/action/crossFade hoàn toàn giống nhau.
// ---------------------------------------------------------------------------

const root = new THREE.Group();
scene.add(root);

const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 });

const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.7, 8, 16), mat(0x0c8ce9));
body.name = 'Body';
body.position.y = 1.25;
root.add(body);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 24), mat(0xdddddd));
head.name = 'Head';
head.position.y = 2.0;
root.add(head);

const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 6, 12), mat(0x667788));
legL.name = 'LegL';
legL.position.set(-0.2, 0.45, 0);
root.add(legL);

const legR = legL.clone();
legR.name = 'LegR';
legR.position.x = 0.2;
root.add(legR);

// --- Tạo AnimationClip ---
// KeyframeTrack: tên thuộc tính, mảng MỐC THỜI GIAN, mảng GIÁ TRỊ.
// Đây đúng là cấu trúc bạn nhận được trong gltf.animations.

function makeClip(name, duration, tracks) {
  return new THREE.AnimationClip(name, duration, tracks);
}

const idleClip = makeClip('Idle', 2, [
  new THREE.NumberKeyframeTrack('Body.position[y]', [0, 1, 2], [1.25, 1.32, 1.25]),
  new THREE.NumberKeyframeTrack('Head.position[y]', [0, 1, 2], [2.0, 2.07, 2.0]),
]);

const walkClip = makeClip('Walk', 1, [
  new THREE.NumberKeyframeTrack('LegL.rotation[x]', [0, 0.5, 1], [0.6, -0.6, 0.6]),
  new THREE.NumberKeyframeTrack('LegR.rotation[x]', [0, 0.5, 1], [-0.6, 0.6, -0.6]),
  new THREE.NumberKeyframeTrack('Body.position[y]', [0, 0.25, 0.5, 0.75, 1], [1.25, 1.3, 1.25, 1.3, 1.25]),
]);

const jumpClip = makeClip('Jump', 1.2, [
  new THREE.NumberKeyframeTrack('Body.position[y]', [0, 0.4, 0.8, 1.2], [1.25, 2.1, 2.1, 1.25]),
  new THREE.NumberKeyframeTrack('Head.position[y]', [0, 0.4, 0.8, 1.2], [2.0, 2.85, 2.85, 2.0]),
  new THREE.NumberKeyframeTrack('LegL.rotation[x]', [0, 0.4, 1.2], [0, -1.1, 0]),
  new THREE.NumberKeyframeTrack('LegR.rotation[x]', [0, 0.4, 1.2], [0, -1.1, 0]),
]);

const clips = [idleClip, walkClip, jumpClip];
console.log('các clip có sẵn:', clips.map((c) => c.name + ' (' + c.duration + 's)'));

// --- Mixer và Action ---
// Mixer gắn với ROOT của cây được animate. Tên track ('Body.position[y]')
// được phân giải theo TÊN node bên trong cây đó.
const mixer = new THREE.AnimationMixer(root);

const actions = {};
clips.forEach((clip) => {
  actions[clip.name] = mixer.clipAction(clip);
});

let current = actions.Idle;
current.play();

// --- Bảng điều khiển ---
const state = {
  clip: 'Idle',
  goiMixerUpdate: true,   // thử tắt để thấy hậu quả
  dungDeltaThat: true,    // thử tắt để thấy vấn đề của bài 1.4
  timeScale: 1,
  thoiGianCrossFade: 0.4,
};

const gui = new GUI({ title: 'Animation' });

gui.add(state, 'clip', Object.keys(actions)).name('clip đang chạy').onChange((name) => {
  const next = actions[name];
  // crossFadeFrom nội suy TRỌNG SỐ giữa hai action -> chuyển mượt, không giật
  next.reset().play();
  next.crossFadeFrom(current, state.thoiGianCrossFade, true);
  current = next;
});

gui.add(state, 'thoiGianCrossFade', 0, 2, 0.05).name('thời gian chuyển');
gui.add(state, 'timeScale', 0, 3, 0.05).name('timeScale')
  .onChange((v) => (mixer.timeScale = v));

const f = gui.addFolder('Thí nghiệm');
f.add(state, 'goiMixerUpdate').name('gọi mixer.update()');
f.add(state, 'dungDeltaThat').name('dùng delta thật');

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;bottom:12px;left:12px;font:11px ui-monospace,monospace;color:#a3a3a3';
document.body.appendChild(hud);

const clock = new THREE.Clock();
let frameId;

function tick() {
  frameId = requestAnimationFrame(tick);
  const delta = clock.getDelta();

  // ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT CỦA BÀI.
  // Không gọi -> model đứng im dù đã play().
  if (state.goiMixerUpdate) {
    mixer.update(state.dungDeltaThat ? delta : 0.016);
  }

  hud.textContent =
    'clip: ' + state.clip +
    '   |   mixer.update: ' + (state.goiMixerUpdate ? 'có' : 'KHÔNG') +
    '   |   timeScale: ' + state.timeScale.toFixed(2) +
    '   |   thời gian: ' + mixer.time.toFixed(1) + 's';

  renderer.render(scene, camera);
}

tick();

export function dispose() {
  cancelAnimationFrame(frameId);
  gui.destroy();
  // Mixer giữ tham chiếu tới cây — nhớ dọn
  mixer.stopAllAction();
  mixer.uncacheRoot(root);
  scene.traverse((o) => {
    if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); }
  });
  renderer.dispose();
}
`;

export const LESSON_3_4: LessonContent = {
  id: '3-4',

  goal: 'Chuyển đổi mượt giữa các animation mà không bị giật, và giải thích được chính xác vai trò của `mixer.update(delta)`.',

  lecture: [
    'Model tải về thường mang theo hoạt ảnh do người dựng làm sẵn: đi, chạy, đứng yên, nhảy. Chúng nằm trong `gltf.animations` dưới dạng mảng `AnimationClip`. Bài này dạy bạn phát chúng, và quan trọng hơn là **chuyển giữa chúng** một cách mượt mà.',

    'Hệ thống có ba tầng, hãy nắm rõ vai trò từng tầng. `AnimationClip` là dữ liệu thuần: danh sách các đường keyframe mô tả thuộc tính nào đổi giá trị nào ở thời điểm nào. `AnimationMixer` là bộ máy phát, gắn với gốc của cây cần hoạt hoạ. `AnimationAction` là một lần phát cụ thể của một clip trên mixer đó, mang trạng thái riêng — đang chạy hay dừng, trọng số bao nhiêu, tốc độ thế nào.',

    'Và đây là dòng code khiến nhiều người mất cả buổi tối: **phải gọi `mixer.update(delta)` mỗi khung hình**. Gọi `action.play()` chỉ đánh dấu action là đang hoạt động; chính `update()` mới đẩy thời gian tiến lên và ghi giá trị nội suy vào các thuộc tính. Không có nó, bạn đã "bật" hoạt ảnh nhưng nó đứng nguyên ở khung đầu tiên — không lỗi, không cảnh báo.',

    'Chú ý tham số truyền vào `update()`: nó phải là `delta` thật từ `Clock`, đúng bài học của bài 1.4. Truyền một hằng số cố định thì tốc độ hoạt ảnh sẽ lệ thuộc FPS y hệt vấn đề bạn đã gặp với `rotation.y += 0.01`. Sandbox có checkbox cho cả hai thí nghiệm này.',

    'Phần cuối là `crossFadeFrom` — thứ tách người biết làm với người mới. Nó nội suy **trọng số** giữa hai action trong một khoảng thời gian, nên nhân vật chuyển từ đứng sang đi một cách trôi chảy thay vì búng sang tư thế mới. Hãy đổi clip trong bảng điều khiển với thời gian chuyển đặt về 0 rồi về 0.4 để cảm nhận khác biệt.',
  ],

  concepts: [
    {
      term: 'AnimationClip',
      explain:
        'Dữ liệu hoạt ảnh thuần: tên, thời lượng, và danh sách `KeyframeTrack`. Mỗi track ghi rõ thuộc tính nào của node nào thay đổi qua các mốc thời gian.',
    },
    {
      term: 'AnimationMixer',
      explain:
        'Bộ máy phát, khởi tạo với gốc của cây cần hoạt hoạ. Một mixer quản lý nhiều action cùng lúc và trộn kết quả của chúng theo trọng số.',
    },
    {
      term: 'mixer.update(delta)',
      explain:
        'Đẩy thời gian tiến lên và ghi giá trị nội suy vào các thuộc tính. **Bắt buộc gọi mỗi khung hình.** Thiếu nó thì `play()` không có tác dụng nhìn thấy được.',
    },
    {
      term: 'crossFadeFrom / crossFadeTo',
      explain:
        'Nội suy trọng số giữa hai action trong khoảng thời gian cho trước, tạo chuyển tiếp mượt. Tham số cuối `warp` còn đồng bộ cả tốc độ phát của hai clip.',
    },
    {
      term: 'timeScale',
      explain:
        'Hệ số tốc độ. Đặt trên mixer để đổi toàn cục, hoặc trên từng action để đổi riêng. Giá trị âm cho phát ngược.',
    },
  ],

  walkthrough: [
    {
      action: '`console.log(gltf.animations)` để xem có bao nhiêu clip và tên là gì.',
      why: 'Tên clip do người dựng đặt và không có chuẩn nào. Phải xem mới biết.',
    },
    {
      action: 'Tạo `new THREE.AnimationMixer(gltf.scene)` — truyền đúng gốc của cây model.',
      why: 'Tên track trong clip được phân giải theo tên node bên trong cây này. Truyền sai gốc thì không track nào khớp và không có gì chuyển động.',
    },
    {
      action: 'Tạo action cho từng clip bằng `mixer.clipAction(clip)`, rồi `.play()` clip đầu tiên.',
      why: 'Nên tạo sẵn tất cả action một lần thay vì tạo lại mỗi lần chuyển — action mang trạng thái nên tái sử dụng sẽ mượt hơn.',
    },
    {
      action: 'Gọi `mixer.update(delta)` trong vòng lặp, dùng `delta` thật từ `Clock`.',
      why: 'Đây là dòng quan trọng nhất bài. Đặt nó trước `renderer.render()`.',
    },
    {
      action: 'Làm nút chuyển clip, dùng `next.reset().play()` rồi `next.crossFadeFrom(current, 0.4, true)`.',
      why: '`reset()` đưa clip mới về đầu, `crossFadeFrom` lo phần chuyển mượt. Tham số `true` cuối cùng bật warp để đồng bộ tốc độ hai clip.',
    },
    {
      action: 'Trong cleanup, gọi `mixer.stopAllAction()` và `mixer.uncacheRoot(root)`.',
      why: 'Mixer giữ tham chiếu tới cây và cache các binding — không dọn là một dạng rò rỉ.',
    },
  ],

  observations: [
    {
      change: 'Tắt checkbox "gọi mixer.update()".',
      observe: 'Nhân vật đứng im hoàn toàn dù action vẫn đang ở trạng thái play.',
      why: 'Đây là lỗi kinh điển. `play()` chỉ bật cờ đánh dấu action đang hoạt động và đặt trọng số của nó lên 1. Toàn bộ công việc thực sự — tiến thời gian, nội suy giữa các keyframe, ghi kết quả vào `position`/`rotation` của từng node — nằm trong `update()`. Không có lỗi hay cảnh báo nào, nên người mới thường đi tìm nguyên nhân ở phía model hoặc file.',
    },
    {
      change: 'Bật lại `update()` nhưng tắt "dùng delta thật" (truyền hằng số `0.016`).',
      observe: 'Hoạt ảnh vẫn chạy nhưng tốc độ giờ phụ thuộc vào FPS của máy.',
      why: 'Đúng vấn đề của bài 1.4, chỉ đổi ngữ cảnh. Hằng số `0.016` giả định luôn 60fps. Trên màn 120Hz, `update()` được gọi gấp đôi số lần nên hoạt ảnh chạy nhanh gấp đôi. Truyền `delta` thật thì thời gian hoạt ảnh luôn khớp thời gian thực.',
    },
    {
      change: 'Đặt "thời gian chuyển" về `0` rồi đổi clip; sau đó đặt về `0.4` và đổi lại.',
      observe: 'Với 0, nhân vật búng sang tư thế mới; với 0.4, chuyển động trôi chảy tự nhiên.',
      why: '`crossFadeFrom` giảm dần trọng số của action cũ từ 1 về 0 trong khi tăng dần action mới từ 0 lên 1. Mixer cộng kết quả của mọi action đang hoạt động theo trọng số, nên trong giai đoạn chuyển tiếp, tư thế hiển thị là phép trộn của hai hoạt ảnh. Đây chính là cơ chế mà mọi game 3D dùng để nhân vật chuyển giữa đứng, đi, chạy.',
    },
    {
      change: 'Đặt `timeScale` về `0.2` rồi về `2`.',
      observe: 'Hoạt ảnh chạy chậm hoặc nhanh, nhưng vẫn mượt ở mọi mức.',
      why: '`timeScale` nhân vào lượng thời gian được cộng thêm mỗi lần `update()`. Vì các giá trị được **nội suy** giữa các keyframe chứ không nhảy từng khung, hoạt ảnh vẫn mượt ở bất kỳ tốc độ nào. Đặt giá trị âm sẽ cho phát ngược — mẹo hay dùng để làm hoạt ảnh đóng cửa từ hoạt ảnh mở cửa.',
    },
  ],

  interview: [
    {
      q: 'Vai trò của `mixer.update(delta)` là gì?',
      a: 'Nó đẩy đồng hồ nội bộ của mixer tiến lên `delta` giây, rồi với mỗi action đang hoạt động, tính giá trị nội suy tại thời điểm hiện tại và ghi vào thuộc tính tương ứng của các node. `play()` chỉ đánh dấu action là đang chạy — không có `update()` thì không có gì thay đổi và cũng không có lỗi nào. Tham số phải là delta thật từ `Clock`, nếu không tốc độ hoạt ảnh sẽ lệ thuộc FPS.',
    },
    {
      q: 'Chuyển mượt giữa hai animation bằng cách nào?',
      a: 'Dùng `crossFadeFrom` hoặc `crossFadeTo`. Chúng nội suy trọng số của hai action trong khoảng thời gian cho trước: action cũ giảm từ 1 về 0, action mới tăng từ 0 lên 1, và mixer trộn kết quả theo trọng số đó. Quy trình chuẩn là `next.reset().play()` rồi `next.crossFadeFrom(current, duration, true)`. Tham số `warp` cuối cùng đồng bộ tốc độ phát của hai clip, quan trọng khi chuyển giữa đi và chạy vốn có nhịp khác nhau.',
    },
    {
      q: 'Cấu trúc dữ liệu của một `AnimationClip` là gì?',
      a: 'Gồm tên, thời lượng, và một mảng `KeyframeTrack`. Mỗi track nhắm vào một thuộc tính cụ thể theo chuỗi đường dẫn như `Body.position[y]` hoặc `Bone_Arm.quaternion`, kèm mảng mốc thời gian và mảng giá trị tương ứng. Mixer phân giải chuỗi đường dẫn đó theo tên node trong cây được truyền vào lúc khởi tạo — nên nếu truyền sai gốc hoặc node bị đổi tên thì track sẽ không khớp và im lặng không làm gì.',
    },
    {
      q: 'Cần dọn dẹp gì khi component dùng animation unmount?',
      a: 'Gọi `mixer.stopAllAction()` để dừng mọi action, và `mixer.uncacheRoot(root)` để mixer bỏ các binding đã cache trỏ tới cây. Nếu bỏ qua, mixer vẫn giữ tham chiếu tới toàn bộ cây node, ngăn garbage collector thu hồi chúng. Bên cạnh đó vẫn phải huỷ vòng lặp và dispose geometry/material như thường lệ.',
    },
  ],

  checkpoints: [
    'Chuyển được giữa các clip mà không giật.',
    'Giải thích được chính xác `mixer.update(delta)` làm gì.',
    'Biết vì sao phải truyền `delta` thật thay vì hằng số.',
    'Nhớ dọn mixer bằng `stopAllAction()` và `uncacheRoot()`.',
  ],

  sandbox: vanillaSandbox(CODE, { dependencies: { 'lil-gui': '0.21.0' }, height: 500 }),
};
