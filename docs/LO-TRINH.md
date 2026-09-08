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

| Module | Chủ đề | Tuần | Trạng thái |
|---|---|---|---|
| 1 | Three.js thuần — nền tảng | 1 | ⬜ Chưa bắt đầu |
| 2 | Ánh sáng & Vật liệu | 2 | ⬜ |
| 3 | Model 3D thật (GLTF/GLB) | 2 | ⬜ |
| 4 | Tương tác & React Three Fiber | 3 | ⬜ |
| 5 | Hiệu năng (điểm cộng JD) | 4 | ⬜ |
| 6 | Hiệu ứng & hoàn thiện | 4-5 | ⬜ |

Ký hiệu: ⬜ chưa bắt đầu · 🟨 đang làm · ✅ xong

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

**✅ Checkpoint Module 5:**
- [ ] **Có con số thật:** draw call trước/sau khi dùng InstancedMesh
- [ ] Giải thích draw call cho người không biết 3D
- [ ] Kể được 3 cách giảm dung lượng model
- [ ] Chứng minh không rò rỉ memory khi unmount

---

# Module 6 — Hiệu ứng & hoàn thiện

## 6.1 — Post-processing

**Khái niệm:**
- `@react-three/postprocessing` — cài ở module này, **không cài sớm hơn**
- `<Bloom>`, `<Outline>` (viền sáng khi hover), `<DepthOfField>`, `<Vignette>`
- Cách hoạt động: render scene ra texture rồi xử lý thêm nhiều lượt
- **Đo FPS trước và sau khi bật bloom** — chính trải nghiệm đánh đổi này là thứ đáng kể khi phỏng vấn

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.2 — Nhập môn Shader *(tuỳ chọn, nâng cao)*

**Khái niệm:**
- `ShaderMaterial` — vertex shader và fragment shader làm gì
- `uniforms` — truyền dữ liệu từ JS vào shader; `uTime` để tạo animation
- GLSL cơ bản
- Không bắt buộc cho JD này. Chỉ làm nếu Module 1-5 đã xong và còn thời gian.

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.3 — Scroll-linked animation

**Khái niệm:**
- Liên kết vị trí scroll với transform của camera/vật thể
- `<ScrollControls>` + `useScroll` của drei
- Làm bằng CSS/IntersectionObserver thuần trước — **JD yêu cầu CSS Animation, Keyframes, CSS 3D Transform**, nên đây là chỗ luyện đúng thứ được hỏi
- Chỉ render canvas khi nằm trong viewport

**Bài tập:** ⬜

**Ghi chú của tôi:**

---

## 6.4 — Deploy & hoàn thiện

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
