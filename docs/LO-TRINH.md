# Lộ trình học Three.js — threejs-showcase

Tài liệu sống. Mỗi bài học được thêm phần **Bài tập** và **Ghi chú của tôi** dần trong quá trình học.

**Mục tiêu cuối:** đáp ứng yêu cầu *"có kinh nghiệm thực tế sử dụng Three.js"* của JD FE/Web 3D Developer, và có sản phẩm deploy được để chứng minh.

**Nguyên tắc xuyên suốt:**
1. Không copy code mà không hiểu. Mỗi bài phải tự gõ lại ít nhất một lần.
2. Học vanilla trước, R3F sau. R3F chỉ là lớp bọc — không hiểu lớp dưới thì phỏng vấn hỏi sâu là lộ.
3. Tầng nội dung website giữ đơn giản nhất có thể. Website không phải mục tiêu.
4. Mỗi module xong phải có demo chạy được, không chỉ đọc hiểu.

---

## Trạng thái tổng quan

| Module | Chủ đề | Số bài | Tuần | Trạng thái |
|---|---|---|---|---|
| 1 | Three.js thuần — nền tảng | 7 | 1 | ⬜ Chưa bắt đầu |
| 2 | Ánh sáng & Vật liệu | 7 | 2 | ⬜ |
| 3 | Model 3D thật (GLTF/GLB) | 4 | 2 | ⬜ |
| 4 | Tương tác & React Three Fiber | 8 | 3 | ⬜ |
| 5 | Hiệu năng (điểm cộng JD) | 6 | 4 | ⬜ |
| 6 | Hiệu ứng & hoàn thiện | 6 | 4-5 | ⬜ |

**Tổng: 38 bài.** Ký hiệu: ⬜ chưa bắt đầu · 🟨 đang làm · ✅ xong


---

# Module 1 — Three.js thuần: nền tảng

> Viết bằng vanilla Three.js trong `useEffect`. Debug UI dùng `lil-gui`.
> Kết thúc module: hiểu được một scene 3D gồm những gì và chúng ghép với nhau ra sao.

## 1.1 — Scene, Camera, Renderer

**Mục tiêu:** dựng được scene đầu tiên, hiểu bộ ba cốt lõi.

**Khái niệm:**
- `Scene` — container chứa mọi thứ, bản chất là một cây (scene graph)
- `PerspectiveCamera(fov, aspect, near, far)` — ý nghĩa từng tham số; vì sao `near` quá nhỏ gây z-fighting
- `WebGLRenderer` — `setSize`, `setPixelRatio`, gắn `domElement` vào DOM
- Vòng đời: tạo → render → **dọn dẹp** (`renderer.dispose()`, remove canvas) khi unmount

**Bài tập:** ⬜ *(sẽ cập nhật)*

**Ghi chú của tôi:** *(để trống — tự điền khi học)*

---

## 1.2 — Geometry & Mesh

**Mục tiêu:** hiểu một vật thể 3D được tạo từ gì.

**Khái niệm:**
- `Mesh = Geometry + Material`
- Geometry dựng sẵn: `BoxGeometry`, `SphereGeometry`, `PlaneGeometry`, `TorusGeometry`
- Tham số `widthSegments`/`heightSegments` — quan hệ với số triangle và hiệu năng
- `BufferGeometry` — dữ liệu đỉnh thật sự nằm ở đâu (`position` attribute là `Float32Array`)
- `wireframe: true` để nhìn thấy lưới tam giác

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 1.3 — Transform & Scene Graph

**Mục tiêu:** di chuyển/xoay/thu phóng vật thể, hiểu quan hệ cha-con.

**Khái niệm:**
- `position`, `rotation` (Euler, đơn vị **radian** không phải độ), `scale` — đều là `Vector3`
- `Object3D` và `Group` — gom nhóm để transform cùng nhau
- Transform của con là **tương đối** so với cha — đây là nền tảng của scene graph
- Quaternion là gì và vì sao tồn tại (gimbal lock) — biết khái niệm, chưa cần dùng sâu
- `lookAt()`

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 1.4 — Animation loop

**Mục tiêu:** làm vật thể chuyển động mượt và **độc lập với tốc độ khung hình**.

**Khái niệm:**
- `requestAnimationFrame` — vì sao dùng nó thay `setInterval` (đồng bộ với refresh rate, tự dừng khi tab ẩn)
- **Điểm quan trọng nhất của bài này:** `rotation.x += 0.01` sẽ chạy nhanh gấp đôi trên màn hình 120Hz so với 60Hz. Phải nhân với **delta time** để tốc độ đồng nhất trên mọi máy.
- `THREE.Clock` — `getDelta()` và `getElapsedTime()`
- Huỷ loop bằng `cancelAnimationFrame` khi unmount — không làm sẽ leak

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 1.5 — Camera & Controls & Responsive

**Mục tiêu:** điều khiển góc nhìn, xử lý resize đúng cách.

**Khái niệm:**
- `PerspectiveCamera` vs `OrthographicCamera` — khi nào dùng loại nào (game 3D vs bản vẽ kỹ thuật/isometric)
- `OrbitControls` — `enableDamping` và vì sao khi bật thì phải gọi `controls.update()` mỗi frame
- Xử lý resize: cập nhật `camera.aspect` → **`camera.updateProjectionMatrix()`** → `renderer.setSize()`. Quên dòng giữa là ảnh méo — lỗi rất phổ biến.
- `setPixelRatio(Math.min(window.devicePixelRatio, 2))` — vì sao phải chặn trần ở 2

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 1.6 — Debug UI & Cleanup

**Mục tiêu:** nghịch tham số real-time, và dọn dẹp bộ nhớ đúng cách.

**Khái niệm:**
- `lil-gui`: `gui.add(obj, 'prop', min, max)`, `gui.addColor()`, folder
- Gọi `gui.destroy()` trong cleanup của `useEffect`, nếu không mỗi lần hot-reload sẽ đẻ thêm một panel
- **Dispose:** `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, `renderer.dispose()` — GPU memory **không** được JS garbage collector thu hồi tự động. Đây là câu hỏi phỏng vấn hay gặp khi tích hợp Three.js vào React.

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 1.7 — Deploy sớm

**Mục tiêu:** đưa scene đầu tiên lên mạng ngay từ tuần 1.

**Vì sao ở đây mà không phải cuối lộ trình:** Three.js Journey đặt bài "Go live" ở vị trí #13 — **trong chương Basics**, trước cả bài về ánh sáng. Lý do: có link chạy thật từ sớm thì mỗi bài học sau đó đều cộng dồn vào một thứ hữu hình, thay vì nằm im trên máy suốt 5 tuần rồi mới deploy một lần.

**Khái niệm:**
- Deploy Next.js lên Vercel, nối với GitHub repo
- Kiểm tra WebGL chạy thật trên điện thoại — khác hẳn máy tính
- Preview deployment cho mỗi PR

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

**✅ Checkpoint Module 1** — trả lời được không cần tra:
- [ ] Scene/Camera/Renderer mỗi cái làm gì
- [ ] Vì sao phải nhân delta time vào animation
- [ ] Ba dòng cần gọi khi resize, theo đúng thứ tự
- [ ] Vì sao phải dispose thủ công trong Three.js

---

# Module 2 — Ánh sáng & Vật liệu

> Đây là module quyết định demo trông "nghiệp dư" hay "chuyên nghiệp". Dùng `lil-gui` nghịch thật nhiều.

## 2.1 — Các loại Material

**Khái niệm:**
- `MeshBasicMaterial` — **không phản ứng với ánh sáng**, luôn hiện đúng màu đã set. Dùng cho UI/debug/hiệu ứng phát sáng
- `MeshLambertMaterial` / `MeshPhongMaterial` — mô hình chiếu sáng cũ, rẻ
- `MeshStandardMaterial` — PBR (Physically Based Rendering), chuẩn công nghiệp hiện nay. Tham số cốt lõi: `roughness`, `metalness`
- `MeshPhysicalMaterial` — mở rộng Standard: `clearcoat`, `transmission` (kính), `iridescence`. Đắt hơn
- `MeshNormalMaterial`, `MeshDepthMaterial` — dùng để debug

**Điểm hay bị hỏi:** "Vì sao vật thể của em đen thui?" → dùng `MeshStandardMaterial` mà quên thêm đèn.

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 2.2 — Các loại đèn

**Khái niệm:**
- `AmbientLight` — sáng đều mọi hướng, không tạo bóng. Rẻ nhất
- `DirectionalLight` — như mặt trời, tia song song. Tạo được bóng
- `PointLight` — như bóng đèn, toả mọi hướng từ một điểm
- `SpotLight` — đèn pin, có góc `angle` và `penumbra`
- `HemisphereLight` — trời/đất hai màu, rất hợp để làm ánh sáng nền tự nhiên
- **Chi phí:** mỗi đèn thêm vào là thêm tính toán cho *mỗi pixel*. Nhiều đèn = chậm. Cách chuyên nghiệp là dùng **environment map** thay vì nhồi đèn (bài 2.5)
- Các helper: `DirectionalLightHelper`, `PointLightHelper` để nhìn thấy vị trí đèn

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 2.3 — Bóng đổ (Shadows)

**Khái niệm:**
- Bật ba nơi: `renderer.shadowMap.enabled`, `light.castShadow`, và trên từng mesh `castShadow` / `receiveShadow`
- Shadow map là gì — render scene từ góc nhìn của đèn
- `light.shadow.mapSize` — độ nét vs bộ nhớ
- `light.shadow.camera` — phải bao trọn vùng cần đổ bóng; dùng `CameraHelper` để chỉnh
- **Bóng đổ đắt.** Trên mobile thường tắt hẳn hoặc dùng bóng giả (texture mờ dưới chân vật thể)

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 2.4 — Texture

**Khái niệm:**
- `TextureLoader` — load ảnh làm bề mặt
- Các loại map: `map` (màu), `normalMap` (giả gồ ghề), `roughnessMap`, `metalnessMap`, `aoMap`, `displacementMap`
- **UV mapping** — ảnh 2D được "dán" lên bề mặt 3D thế nào
- **Lỗi kinh điển:** texture màu phải đặt `colorSpace = THREE.SRGBColorSpace`, còn normal/roughness map thì **không**. Sai chỗ này màu sẽ bợt hoặc quá gắt
- `wrapS`/`wrapT` + `repeat` để lặp texture
- `minFilter`/`magFilter`, mipmap
- Tối ưu: kích thước texture nên là luỹ thừa của 2; texture 4K ăn RAM khủng khiếp

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 2.5 — Environment Map (HDRI)

**Khái niệm:**
- `RGBELoader` load file `.hdr`
- `scene.environment` — chiếu sáng toàn bộ scene bằng ảnh môi trường, **thay thế được cả dàn đèn**
- `scene.background` — dùng làm ảnh nền
- `PMREMGenerator` — tiền xử lý HDRI cho PBR
- Đây là cách nhanh nhất để demo trông "thật": vật liệu kim loại phản chiếu môi trường

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 2.6 — Color management & Tone mapping

> **Bài bổ sung sau khi đối chiếu giáo trình chuẩn.** Đây là chủ đề bị bỏ sót nhiều nhất trong các lộ trình tự viết, nhưng có mặt trong hầu hết giáo trình nghiêm túc: Three.js Manual có hẳn bài "Color Management", Journey có bài #25 "Realistic render", SimonDev dành một bài cho "Lambertian Lighting & sRGB".

**Mục tiêu:** hiểu vì sao scene của mình trông "sai sai" dù đã set đúng màu và đèn.

**Khái niệm:**
- `renderer.outputColorSpace` — không gian màu đầu ra
- `renderer.toneMapping` — `NoToneMapping`, `ACESFilmicToneMapping`, `AgXToneMapping`; và `toneMappingExposure`
- HDR vs LDR: vì sao giá trị sáng vượt quá 1.0 cần tone mapping để nén về dải hiển thị được
- Ánh sáng tuyến tính (linear) vs không gian sRGB — phép tính chiếu sáng phải làm ở không gian tuyến tính
- Nối tiếp bài 2.4: texture màu đặt `SRGBColorSpace`, texture dữ liệu (normal/roughness) thì không

**Vì sao quan trọng:** đây là ranh giới rõ nhất giữa demo "nghiệp dư" và "chuyên nghiệp". Sai chỗ này thì mọi thứ hơi bợt hoặc cháy sáng, mà người mới thường không nhận ra là do đâu — chỉ thấy "không đẹp bằng demo trên mạng".

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 2.7 — Trong suốt & thứ tự vẽ (Transparency)

> **Bài bổ sung.** Three.js Manual có bài riêng "How to Draw Transparent Objects" — đây là một trong những vấn đề chặn người mới nhiều nhất.

**Mục tiêu:** xử lý được vật thể trong suốt mà không bị lỗi hiển thị kỳ lạ.

**Khái niệm:**
- `material.transparent = true` + `opacity`
- **Vấn đề cốt lõi:** vật trong suốt phải được vẽ theo thứ tự từ xa đến gần, nhưng depth buffer không xử lý được điều này tự động → vật phía sau có thể biến mất
- `depthWrite`, `depthTest` — khi nào cần tắt
- `renderOrder` để ép thứ tự vẽ thủ công
- `alphaTest` — giải pháp thay thế rẻ hơn cho trường hợp cắt bỏ hẳn (lá cây, hàng rào)
- `side: THREE.DoubleSide` và cái giá của nó

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

**✅ Checkpoint Module 2:**
- [ ] Giải thích Basic vs Standard material
- [ ] Kể tên 4 loại đèn và chi phí hiệu năng tương đối
- [ ] Nói được vì sao texture màu cần sRGB còn normal map thì không
- [ ] Dùng environment map thay dàn đèn

---

# Module 3 — Model 3D thật (GLTF/GLB)

> JD ghi thẳng *"GLTF/GLB models"*. Đây là kỹ năng thực chiến quan trọng nhất module này.

## 3.1 — GLTFLoader

**Khái niệm:**
- glTF là gì, vì sao là chuẩn ("JPEG của 3D"); `.gltf` (JSON + file rời) vs `.glb` (nhị phân, gộp một file)
- `gltf.scene` là một `Group` — duyệt bằng `traverse()` để tìm/sửa từng mesh con
- Sửa material của model sau khi load
- Căn chỉnh: scale, `Box3` để đo bounding box và tự căn giữa model

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 3.2 — Loading & Error state

**Khái niệm:**
- Callback thứ 3 của `loader.load` cho `progress` — tính `%` từ `loaded/total`
- `LoadingManager` — theo dõi tiến trình của **nhiều** asset cùng lúc (`onProgress`, `onLoad`, `onError`)
- Màn hình loading, và xử lý khi model lỗi (fallback, thông báo)
- **Liên hệ JD:** dòng *"xử lý loading/error state"* trong JD không chỉ nói về REST API — asset 3D nặng hàng MB nên chuyện này còn quan trọng hơn

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 3.3 — Nén model (Draco / Meshopt / KTX2)

**Khái niệm:**
- `DRACOLoader` — nén hình học, file có thể nhỏ đi nhiều lần
- Đánh đổi: file nhẹ hơn nhưng tốn CPU giải nén lúc load
- `MeshoptDecoder` — lựa chọn thay thế, giải nén nhanh hơn
- KTX2/Basis — nén texture cho GPU
- Công cụ `gltf-transform` để nén sẵn từ dòng lệnh
- **Đây là nội dung trực tiếp cho phần "điểm cộng" của JD**

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 3.4 — Animation của model

**Khái niệm:**
- `gltf.animations` — mảng `AnimationClip`
- `AnimationMixer` — tạo mixer, `clipAction(clip).play()`
- **Phải gọi `mixer.update(delta)` mỗi frame** — quên là model đứng im
- Chuyển động giữa các clip: `crossFadeTo`

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

**✅ Checkpoint Module 3:**
- [ ] Load được model GLB, căn giữa, chỉnh scale
- [ ] Có loading % thật và xử lý lỗi
- [ ] Giải thích Draco nén cái gì và đánh đổi ra sao
- [ ] Chạy được animation có sẵn trong model

---

# Module 4 — Tương tác & React Three Fiber

> Từ đây trở đi mới chuyển sang R3F. Lúc này bạn đã hiểu lớp dưới nên R3F sẽ dễ.

## 4.1 — Raycaster (vanilla)

**Khái niệm:**
- Bài toán: chuột ở toạ độ pixel 2D, làm sao biết đang trỏ vào vật thể 3D nào
- Chuyển pixel → **NDC** (Normalized Device Coordinates, khoảng -1 đến 1) — công thức
- `raycaster.setFromCamera(pointer, camera)` → `intersectObjects(scene.children, true)`
- Kết quả trả về đã **sắp xếp theo khoảng cách** — phần tử `[0]` là vật gần nhất
- Hiệu năng: đừng raycast mỗi frame nếu không cần; throttle theo sự kiện chuột

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 4.2 — Chuyển sang React Three Fiber

**Khái niệm:**
- `<Canvas>` — R3F tạo sẵn scene/camera/renderer và **animation loop**
- Quy tắc ánh xạ JSX: `<mesh>` → `new THREE.Mesh()`, `<boxGeometry args={[1,1,1]}/>` → `new THREE.BoxGeometry(1,1,1)`. `args` chính là tham số constructor
- `useFrame((state, delta) => {})` — thay cho `requestAnimationFrame`, đã có sẵn delta
- `useThree()` — lấy `camera`, `gl`, `scene`, `size`
- R3F **tự dispose** khi component unmount — bớt được việc dọn dẹp thủ công ở bài 1.6
- So sánh: viết vanilla trong `useEffect` vs R3F — đây là câu hỏi phỏng vấn số 10 trong file ôn tập

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 4.3 — drei helpers

**Khái niệm:**
- `<OrbitControls />`, `<Environment preset="city" />`, `<useGLTF />`, `<Html />` (nhúng DOM vào không gian 3D)
- `useGLTF.preload()` — tải trước
- `<Center>`, `<Bounds>` — tự căn model
- `<Stage>` — set up ánh sáng + môi trường nhanh cho demo sản phẩm

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 4.4 — Sự kiện trong R3F

**Khái niệm:**
- `onClick`, `onPointerOver`, `onPointerOut`, `onPointerMove` gắn thẳng lên `<mesh>` — R3F tự lo raycasting
- `e.stopPropagation()` — mặc định sự kiện xuyên qua **mọi** vật thể nằm sau con trỏ, không chỉ vật gần nhất
- Đổi con trỏ chuột thành `pointer` khi hover
- `<mesh visible={false}>` nhưng vẫn nhận sự kiện — dùng làm vùng hitbox vô hình

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 4.5 — State: zustand + R3F

**Khái niệm:**
- **Vấn đề cốt lõi:** `useFrame` chạy 60 lần/giây. Dùng `useState` trong đó = 60 lần re-render/giây = tụt hiệu năng
- Giải pháp: zustand cho phép đọc state **ngoài** chu kỳ render — `useStore.getState()` trong `useFrame` không kích hoạt re-render
- Dùng selector để component chỉ re-render khi đúng phần mình quan tâm đổi
- Khi nào vẫn nên dùng `useRef` thay vì store (giá trị chỉ dùng nội bộ mỗi frame)
- **Chuẩn bị câu trả lời phỏng vấn:** vì sao chọn zustand cho scene 3D nhưng Redux/Context cho luồng data/auth

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 4.6 — Camera transition mượt

**Khái niệm:**
- Nội suy tuyến tính (`lerp`) và damping — làm camera bay tới vị trí mới mượt mà
- `vec.lerp(target, 0.1)` trong `useFrame` — nhưng nhớ nhân delta để độc lập frame rate
- `easing` từ thư viện `maath` (pmndrs) — `easing.damp3()`
- Kịch bản thực tế: click vào một bộ phận của model → camera bay tới và focus

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 4.7 — Kết hợp HTML và WebGL

> **Bài bổ sung.** Journey có bài #48 "Mixing HTML and WebGL"; Manual có "Aligning HTML Elements to 3D" và "Use three.js as Background in HTML". Đây là kỹ năng thiết yếu cho web marketing/portfolio — đúng loại sản phẩm JD mô tả.

**Mục tiêu:** đặt nội dung HTML thật lên trên/bám theo vật thể 3D.

**Khái niệm:**
- `<Html>` của drei — nhúng DOM vào toạ độ 3D, tự ẩn khi bị vật thể che (`occlude`)
- Tự tính: chiếu toạ độ 3D về toạ độ màn hình bằng `vector.project(camera)` — hiểu cách làm thủ công trước khi dùng helper
- Canvas làm nền toàn trang, nội dung HTML cuộn phía trên
- **Liên hệ JD trực tiếp:** tooltip/nhãn/panel thông tin bám theo vật thể — chính là thứ cần cho Project 2 (configurator), và là chỗ dùng Tailwind cho phần UI

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 4.8 — Cấu trúc code cho project lớn

> **Bài bổ sung.** Journey dành 3 giờ 20 phút cho bài #26 "Code structuring for bigger projects" — bài không-phải-dự-án **dài nhất** cả khoá. SimonDev có hẳn một chương về design pattern và entity management. Lộ trình tự viết thường chỉ liệt kê tính năng mà quên kiến trúc.

**Mục tiêu:** tổ chức code để thêm bài học thứ 20 không khó hơn bài thứ 2.

**Khái niệm:**
- Tách bạch: dữ liệu bài học / component scene / component UI
- Quản lý tài nguyên tập trung (loader, cache) thay vì mỗi scene tự load
- Đặt tên và cấu trúc thư mục theo tính năng
- Trong R3F: chia scene thành component nhỏ, `useMemo` cho geometry/material tái sử dụng
- Vì sao tránh biến toàn cục cho state scene — nối tiếp bài 4.5

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

**✅ Checkpoint Module 4:**
- [ ] Tự viết raycaster vanilla từ đầu
- [ ] Giải thích `args` trong JSX của R3F ánh xạ sang gì
- [ ] Bắt được click/hover trên model, có `stopPropagation`
- [ ] Giải thích vì sao không dùng `useState` trong `useFrame`

---

# Module 5 — Hiệu năng (mục "điểm cộng" của JD)

> JD ghi rõ: *"tối ưu hiệu năng render 3D (WebGL performance, draw calls, GLTF/GLB models)"*.
> Mục tiêu module này không chỉ là biết lý thuyết mà là **đã tận mắt thấy con số thay đổi**.

## 5.1 — Đo đạc trước khi tối ưu

**Khái niệm:**
- `r3f-perf` — overlay FPS, draw calls, triangles, GPU time
- `gl.info.render.calls` / `.triangles` — lấy số liệu thô không cần thư viện
- Chrome DevTools → Performance tab; phân biệt nghẽn ở CPU hay GPU
- **Nguyên tắc:** không bao giờ tối ưu khi chưa đo. Đoán mò thường sai chỗ.

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 5.2 — Draw calls & Instancing

**Khái niệm:**
- **Draw call là gì:** mỗi lần CPU ra lệnh cho GPU vẽ một nhóm hình học. Nhiều draw call = CPU thành nút cổ chai
- Mỗi `Mesh` thường = 1 draw call. 1000 viên gạch riêng lẻ = 1000 draw call
- `InstancedMesh` — vẽ N bản sao cùng geometry/material trong **1 draw call**; đặt transform qua `setMatrixAt()`
- `BufferGeometryUtils.mergeGeometries()` — gộp các geometry tĩnh
- Gộp material/texture (texture atlas)
- **Bài tập bắt buộc phải làm:** dựng 1000 khối bằng Mesh thường, ghi lại số draw call → đổi sang InstancedMesh → ghi lại lần nữa. **Con số cụ thể đó chính là thứ để kể khi phỏng vấn.**

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 5.3 — Tối ưu model & texture

**Khái niệm:**
- Giảm poly count (decimate) — bằng `gltf-transform` hoặc Blender
- Giảm kích thước texture; nén KTX2
- `LOD` (Level of Detail) — vật ở xa dùng model đơn giản hơn
- Frustum culling (Three.js làm sẵn) và tại sao đôi khi cần tắt
- Cân đối: file nhẹ (tải nhanh) vs giải nén (tốn CPU) vs chất lượng

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 5.4 — Tối ưu cho mobile

**Khái niệm:**
- `dpr={[1, 2]}` trong R3F — giới hạn pixel ratio
- Tắt/giảm bóng đổ trên thiết bị yếu
- `<AdaptiveDpr />`, `<AdaptiveEvents />` của drei — tự hạ chất lượng khi FPS tụt
- `<PerformanceMonitor>` — đo và điều chỉnh động
- Phát hiện thiết bị yếu và phục vụ phiên bản nhẹ hơn
- **Liên hệ JD:** ghép trực tiếp với yêu cầu *"Responsive Design"* — responsive trong 3D không chỉ là layout mà còn là chất lượng render

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 5.5 — Memory & rò rỉ

**Khái niệm:**
- GPU memory không được JS GC thu hồi → phải `dispose()` thủ công
- Dispose cái gì: geometry, material, texture, render target
- Kiểm tra rò rỉ: `gl.info.memory.geometries` / `.textures` có tăng dần không khi vào/ra trang liên tục
- Trong R3F phần lớn được tự động, nhưng object tạo thủ công thì không

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 5.6 — Render theo yêu cầu (Rendering on demand)

> **Bài bổ sung.** Three.js Manual có bài riêng "Rendering On Demand". Gần như không bao giờ xuất hiện trong lộ trình tự viết, nhưng lại rất quan trọng với đúng loại web mà JD này mô tả.

**Mục tiêu:** ngừng render 60 khung hình/giây khi trên màn hình chẳng có gì chuyển động.

**Khái niệm:**
- Mặc định `requestAnimationFrame` chạy mãi mãi, đốt pin và CPU/GPU kể cả khi scene đứng yên
- Chỉ render lại khi có thay đổi: sau khi người dùng xoay camera, sau khi state đổi
- Trong R3F: `<Canvas frameloop="demand">` + `invalidate()` để yêu cầu vẽ lại
- Cạm bẫy: quên gọi `invalidate()` thì màn hình đứng hình
- Dừng render hẳn khi canvas ra khỏi viewport (IntersectionObserver) — cực kỳ hợp với trang showcase nhiều bài học
- **Liên hệ JD:** đây là câu trả lời rất mạnh cho câu hỏi tối ưu — hầu hết ứng viên chỉ nói về giảm poly count

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

**✅ Checkpoint Module 5:**
- [ ] **Có con số thật:** draw call trước/sau khi dùng InstancedMesh
- [ ] Giải thích draw call cho người không biết 3D
- [ ] Kể được 3 cách giảm dung lượng model
- [ ] Chứng minh không rò rỉ memory khi unmount

---

# Module 6 — Hiệu ứng & hoàn thiện

## 6.1 — Particles & Points

> **Bài bổ sung.** Journey có #17 "Particles" và #18 "Galaxy Generator" ngay trong chương "Classic techniques"; SimonDev dành cả một mảng lớn cho particle system; Dirksen có chương 7 "Points and Sprites". Đây là kỹ thuật phổ biến bậc nhất trong web 3D quảng cáo/portfolio mà tôi đã bỏ sót ở bản đầu.

**Mục tiêu:** dựng được hiệu ứng hạt — sao, bụi, tuyết, khói.

**Khái niệm:**
- `THREE.Points` + `PointsMaterial` — mỗi đỉnh vẽ thành một chấm
- Tự tạo `BufferGeometry` với `Float32Array` vị trí ngẫu nhiên — nối tiếp bài 1.2
- `sizeAttenuation` — hạt ở xa nhỏ lại
- Texture cho hạt + vấn đề trong suốt/thứ tự vẽ — nối tiếp bài 2.7
- Animate hàng nghìn hạt: cập nhật attribute vs làm trong shader (rẻ hơn nhiều)
- Hiệu năng: hàng chục nghìn hạt vẫn chỉ **1 draw call** — liên hệ bài 5.2

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.2 — Render Target

> **Bài bổ sung.** Manual có bài "Render Targets"; SimonDev dạy cả render target lẫn depth texture. Đây là **điều kiện tiên quyết** để hiểu post-processing — bản đầu tôi nhảy thẳng vào post-processing mà bỏ qua bước này.

**Mục tiêu:** hiểu "render ra một texture thay vì ra màn hình" nghĩa là gì.

**Khái niệm:**
- `WebGLRenderTarget` — render scene vào bộ nhớ thay vì hiển thị
- Dùng kết quả đó làm texture cho vật thể khác: gương, màn hình TV trong scene, cổng dịch chuyển (portal)
- Đây chính là cơ chế bên dưới của mọi hiệu ứng post-processing
- Depth texture — nền tảng cho hiệu ứng xoá phông, sương mù theo chiều sâu
- Chi phí: mỗi render target là thêm một lượt vẽ toàn scene

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.3 — Post-processing

**Khái niệm:**
- `@react-three/postprocessing` — cài ở module này, **không cài sớm hơn**
- `<Bloom>`, `<Outline>` (viền sáng khi hover), `<DepthOfField>`, `<Vignette>`
- Cách hoạt động: render scene ra texture rồi xử lý thêm nhiều lượt
- **Đo FPS trước và sau khi bật bloom** — chính trải nghiệm đánh đổi này là thứ đáng kể khi phỏng vấn

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.4 — Nhập môn Shader *(tuỳ chọn, nâng cao)*

**Khái niệm:**
- `ShaderMaterial` — vertex shader và fragment shader làm gì
- `uniforms` — truyền dữ liệu từ JS vào shader; `uTime` để tạo animation
- GLSL cơ bản
- Không bắt buộc cho JD này. Chỉ làm nếu Module 1-5 đã xong và còn thời gian.

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.5 — Scroll-linked animation

**Khái niệm:**
- Liên kết vị trí scroll với transform của camera/vật thể
- `<ScrollControls>` + `useScroll` của drei
- Làm bằng CSS/IntersectionObserver thuần trước — **JD yêu cầu CSS Animation, Keyframes, CSS 3D Transform**, nên đây là chỗ luyện đúng thứ được hỏi
- Chỉ render canvas khi nằm trong viewport

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.6 — Deploy & hoàn thiện

- Deploy Vercel
- README từng bài: bài toán, quyết định kỹ thuật, số liệu hiệu năng
- Kiểm tra thật trên điện thoại
- Lighthouse: kích thước bundle, thời gian tải

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

# Đối chiếu với JD

| Yêu cầu trong JD | Module đáp ứng |
|---|---|
| Three.js: mô hình, hiệu ứng, kịch bản 3D (**bắt buộc**) | 1 → 4, 6 |
| React/Next | Toàn bộ project |
| Tailwind CSS | Tầng UI của showcase |
| State management | 4.5 (zustand) + Project 2 (Redux/Context) |
| Responsive Design | 1.5, 5.4 |
| CSS Animation, Keyframes, CSS 3D Transform | 6.3 + tầng UI |
| TypeScript, Vite *(điểm cộng)* | TS dùng xuyên suốt; Vite thay bằng Turbopack |
| WebGL performance, draw calls, GLTF/GLB *(điểm cộng)* | **Module 5** |
| REST API, JWT, Refresh Token | Không thuộc project này → **Project 2 (configurator)** |
| Git (Branching, Merge, PR) | Mỗi module một branch + tự mở PR |

**Còn thiếu sau khi xong lộ trình này:** REST API + JWT/Refresh Token + Redux. Đó là lý do cần Project 2 — xem `03-du-an-portfolio.md` trong vault Obsidian.

---

# Quy ước làm việc

- Mỗi module một branch: `module-1-fundamentals`, `module-2-materials`, ...
- Xong module thì tự mở Pull Request lên `main`, tự review, rồi merge → luyện đúng quy trình JD yêu cầu
- Commit nhỏ theo từng bài học
- Sau mỗi bài: điền phần **Ghi chú của tôi** bằng lời của mình, không copy. Nếu viết lại không nổi nghĩa là chưa hiểu.

---

# Phụ lục — Đối chiếu với giáo trình chuẩn

Bản đầu của lộ trình này viết theo kinh nghiệm chung. Sau đó tôi đối chiếu với các giáo trình có thẩm quyền để kiểm tra xem có bỏ sót gì không. Nguồn đã tra:

| Nguồn | Quy mô | Ghi chú |
|---|---|---|
| [Three.js Journey](https://threejs-journey.com/lessons) — Bruno Simon | 87 bài, ~116 giờ | Khoá trả phí được khuyên nhiều nhất |
| [Three.js Manual](https://threejs.org/manual/) (chính thức) | ~60 bài viết | Đã gộp cả Three.js Fundamentals cũ vào đây |
| [Discover Three.js](https://discoverthreejs.com/book/) | 14 bài (chưa hoàn thành) | Chỉ tới phần nhập môn, chưa có shader/physics |
| [SimonDev — Three.js & GameDev](https://simondev.teachable.com/p/games-three-js) | 4 cấp độ | Hiện đóng đăng ký |
| [Robot Bobby — Learn Three.js Basics](https://robotbobby.thinkific.com/courses/learn-threejs-basics) | 10 bài, 1.5 giờ | Bản rút gọn nhất |
| [Wael Yasmina — tutorial cho người mới](https://waelyasmina.net/articles/three-js-tutorial-for-absolute-beginners/) | 15 mục | Miễn phí |
| [Mindsblend 3D-Web-Roadmap](https://github.com/Mindsblend/3D-Web-Roadmap), [awesome-threejs](https://github.com/AxiomeCG/awesome-threejs) | — | Roadmap cộng đồng |

**Lưu ý:** roadmap.sh **không có** lộ trình Three.js. `threejsroadmap.com` là danh mục khoá học trả phí, không phải outline.

## Phần cốt lõi — xuất hiện ở gần như mọi giáo trình

Scene/Camera/Renderer · Geometry & primitives · Materials · Textures & UV · Lights · Shadows · Camera + OrbitControls · Transform & scene graph · Animation loop · Responsive/resize · Load model glTF · Raycasting.

**Lộ trình này bao phủ đủ toàn bộ phần cốt lõi đó** (Module 1-4).

## Những bài đã bổ sung sau khi đối chiếu

Bản đầu bỏ sót 7 chủ đề mà các giáo trình chuyên nghiệp đều dạy:

| Bài bổ sung | Nguồn xác nhận |
|---|---|
| 1.7 Deploy sớm | Journey đặt "Go live" ở #13, **trong chương Basics** |
| 2.6 Color management & tone mapping | Manual có bài riêng; Journey #25; SimonDev |
| 2.7 Trong suốt & thứ tự vẽ | Manual "How to Draw Transparent Objects" |
| 4.7 Kết hợp HTML và WebGL | Journey #48; Manual "Aligning HTML Elements to 3D" |
| 4.8 Cấu trúc code cho project lớn | Journey #26 — bài dài nhất khoá (3h20m); SimonDev |
| 5.6 Render theo yêu cầu | Manual "Rendering On Demand" |
| 6.1 Particles & Points · 6.2 Render Target | Journey #17-18; Manual "Render Targets"; Dirksen ch7 |

## Chủ đề cố ý KHÔNG đưa vào

Có mặt trong nhiều giáo trình nhưng không phục vụ JD này:

- **Shader/GLSL** — chương lớn nhất của Journey (26 giờ), nhưng **Manual chính thức không dạy GLSL** và Discover Three.js cũng không. Giữ ở mức tuỳ chọn (bài 6.4). Đây là thứ tạo khác biệt cho công việc sáng tạo, không phải điều kiện để làm được việc.
- **Physics** (cannon/rapier) — phổ biến trong các khoá học nhưng mỏng trong tài liệu chính thức. JD này là web sản phẩm/UI, không phải game.
- **Blender & baking** — cả chương 6 của Journey. Hữu ích để sửa/tối ưu model, nhưng bạn ứng tuyển vị trí FE chứ không phải 3D artist.
- **WebXR/VR** — Manual có 3 bài, JD không nhắc tới.
- **WebGPU/TSL** — công nghệ mới, Journey có hẳn khoá riêng 21 bài. Đáng theo dõi, chưa cần lúc này.

Nếu Module 1-6 xong sớm và còn thời gian, thứ tự ưu tiên học thêm: **shader cơ bản → Blender để tối ưu model → physics**.

## Bất đồng về thứ tự giữa các nguồn

Đáng chú ý nhất — **khi nào dạy load model thật**:

- Manual xếp "Loading 3D Models" vào **Getting Started**; Discover Three.js dạy ở bài **1.13**
- Journey hoãn tới **#21**, trong chương "Advanced techniques"

Lộ trình này chọn **Module 3 (tuần 2)** — trung dung. Lý do: JD ghi thẳng "GLTF/GLB models", nên không có lý do gì phải đợi tới tuần 4 mới chạm vào model thật. Theo đúng thứ tự của Journey thì bạn sẽ học rất lâu mà chưa lần nào load một asset thật.

Các bất đồng khác: Journey dạy Textures trước Materials, Manual thì ngược lại. Discover dạy ánh sáng cực sớm (bài 1.4), Journey hoãn tới #14 — lộ trình này theo hướng Journey vì cần nắm hình học trước.
