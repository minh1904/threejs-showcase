# Lộ trình học Three.js — threejs-showcase

Tài liệu sống. Toàn bộ **38 bài tập đã viết sẵn**; phần **Ghi chú của tôi** để trống — tự điền bằng lời của mình sau mỗi bài, vì viết lại không nổi nghĩa là chưa hiểu.

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

**Bài tập:**

Dựng scene đầu tiên: một khối hộp màu, render đúng **một** khung hình (chưa cần animation).

1. Tạo `Scene`, `PerspectiveCamera`, `WebGLRenderer`, gắn canvas vào DOM trong `useEffect`
2. Thêm một `Mesh` khối hộp với `MeshBasicMaterial` (chọn Basic vì bài này chưa có đèn)
3. Gọi `renderer.render(scene, camera)` một lần
4. Cleanup: xoá canvas và gọi `renderer.dispose()` khi unmount

**Thử phá cho hiểu** — làm từng cái rồi quan sát:
- Đặt `camera.position.z = 0` → vì sao mất hình?
- Đổi `near` thành `0.0001` và `far` thành `1000000`, đặt hai mặt phẳng sát nhau → quan sát **z-fighting** (bề mặt nhấp nháy)
- Bỏ dòng `renderer.setSize()` → canvas ra kích thước gì?
- Đổi `fov` từ 75 xuống 20 rồi lên 120 → cảm nhận khác biệt

**Xong khi:** khối hộp hiện ra, và bạn giải thích được **từng dòng** làm gì mà không cần nhìn lại tài liệu.

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

**Bài tập:**

1. Xếp hàng ngang 5 geometry khác nhau: `Box`, `Sphere`, `Torus`, `Plane`, `Cone`
2. Bật `wireframe: true` cho tất cả để nhìn thấy lưới tam giác
3. Với `SphereGeometry`, thử `widthSegments`/`heightSegments` lần lượt là `(3, 2)`, `(8, 6)`, `(64, 32)` — đặt cạnh nhau để so sánh
4. `console.log(geometry.attributes.position.count)` cho từng cái → ghi lại số đỉnh
5. **Tự tạo một tam giác bằng `BufferGeometry` thuần**: khai báo `Float32Array` chứa 9 số (3 đỉnh × 3 toạ độ), gán vào attribute `position`

**Xong khi:** giải thích được vì sao `SphereGeometry(1, 3, 2)` trông như viên kim cương chứ không phải hình cầu, và nói được mối quan hệ giữa số segment ↔ số tam giác ↔ chi phí hiệu năng.

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

**Bài tập — hệ mặt trời mini** *(dùng lại cho các bài 1.4 → 1.6, nên làm cẩn thận)*

1. Mặt trời ở gốc toạ độ
2. Trái đất cách mặt trời một khoảng
3. Mặt trăng quay quanh trái đất
4. Dùng `Group` sao cho khi trái đất di chuyển thì **mặt trăng tự động đi theo**, không phải tự tính toạ độ

**Thử phá cho hiểu:**
- Bỏ mặt trăng ra khỏi group của trái đất, đặt thẳng vào `scene` → di chuyển trái đất → mặt trăng đứng im. Đây chính là điểm mấu chốt của scene graph.
- Đặt `scale` cho group cha → quan sát con bị scale theo
- Dùng `rotation.y = 90` (nhầm đơn vị độ) rồi sửa thành `Math.PI / 2` → thấy sự khác biệt

**Xong khi:** giải thích được "transform của con là tương đối so với cha" bằng chính ví dụ mặt trăng của mình.

**Ghi chú của tôi:**

---

## 1.4 — Animation loop

**Mục tiêu:** làm vật thể chuyển động mượt và **độc lập với tốc độ khung hình**.

**Khái niệm:**
- `requestAnimationFrame` — vì sao dùng nó thay `setInterval` (đồng bộ với refresh rate, tự dừng khi tab ẩn)
- **Điểm quan trọng nhất của bài này:** `rotation.x += 0.01` sẽ chạy nhanh gấp đôi trên màn hình 120Hz so với 60Hz. Phải nhân với **delta time** để tốc độ đồng nhất trên mọi máy.
- `THREE.Clock` — `getDelta()` và `getElapsedTime()`
- Huỷ loop bằng `cancelAnimationFrame` khi unmount — không làm sẽ leak

**Bài tập — làm hệ mặt trời quay**

**Phần A — cố tình viết sai trước:**
1. Dùng `rotation.y += 0.01` trong `requestAnimationFrame`
2. Mở Chrome DevTools → `Ctrl+Shift+P` → gõ "Show Rendering" → bật **FPS meter**
3. Vẫn trong tab Rendering, tìm mục giới hạn tốc độ khung hình và hạ xuống ~30fps
4. **Quan sát:** hành tinh quay chậm đi một nửa

**Phần B — sửa cho đúng:**
5. Dùng `THREE.Clock`, nhân tốc độ với `delta`
6. Lặp lại bước 3 → tốc độ quay **không đổi**

**Phần C:** huỷ loop bằng `cancelAnimationFrame` trong cleanup. Kiểm chứng: thêm `console.log` trong loop, unmount component, xem log có dừng không.

**Xong khi:** bạn có bằng chứng tận mắt cho câu trả lời phỏng vấn "vì sao phải nhân delta time" — không phải học thuộc.

**Ghi chú của tôi:**

---

## 1.5 — Camera & Controls & Responsive

**Mục tiêu:** điều khiển góc nhìn, xử lý resize đúng cách.

**Khái niệm:**
- `PerspectiveCamera` vs `OrthographicCamera` — khi nào dùng loại nào (game 3D vs bản vẽ kỹ thuật/isometric)
- `OrbitControls` — `enableDamping` và vì sao khi bật thì phải gọi `controls.update()` mỗi frame
- Xử lý resize: cập nhật `camera.aspect` → **`camera.updateProjectionMatrix()`** → `renderer.setSize()`. Quên dòng giữa là ảnh méo — lỗi rất phổ biến.
- `setPixelRatio(Math.min(window.devicePixelRatio, 2))` — vì sao phải chặn trần ở 2

**Bài tập:**

1. Thêm `OrbitControls` với `enableDamping = true` — nhớ gọi `controls.update()` mỗi frame
2. Thử bỏ `controls.update()` → quan sát chuyển động giật cục
3. Xử lý resize đầy đủ: `camera.aspect` → `updateProjectionMatrix()` → `renderer.setSize()`
4. **Thử phá:** bỏ riêng dòng `updateProjectionMatrix()`, kéo cửa sổ hẹp lại → hình méo. Đây là lỗi rất phổ biến, gặp một lần sẽ nhớ mãi.
5. Thêm nút chuyển qua lại giữa `PerspectiveCamera` và `OrthographicCamera` trên cùng scene → so sánh trực tiếp
6. Đặt `setPixelRatio(window.devicePixelRatio)` không chặn trần, mở trên màn hình có DPR cao → đo FPS; sau đó chặn `Math.min(dpr, 2)` → đo lại

**Xong khi:** resize mượt không méo, và bạn nói được vì sao chặn pixel ratio ở 2 (số pixel cần vẽ tăng theo **bình phương** DPR).

**Ghi chú của tôi:**

---

## 1.6 — Debug UI & Cleanup

**Mục tiêu:** nghịch tham số real-time, và dọn dẹp bộ nhớ đúng cách.

**Khái niệm:**
- `lil-gui`: `gui.add(obj, 'prop', min, max)`, `gui.addColor()`, folder
- Gọi `gui.destroy()` trong cleanup của `useEffect`, nếu không mỗi lần hot-reload sẽ đẻ thêm một panel
- **Dispose:** `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, `renderer.dispose()` — GPU memory **không** được JS garbage collector thu hồi tự động. Đây là câu hỏi phỏng vấn hay gặp khi tích hợp Three.js vào React.

**Bài tập:**

**Phần A — Debug UI với `lil-gui`:**
1. Slider tốc độ quay của từng hành tinh
2. Color picker cho vật liệu (`gui.addColor`)
3. Checkbox bật/tắt `wireframe` và ẩn/hiện mặt trăng
4. Gom vào folder theo từng thiên thể

**Phần B — Cleanup và chứng minh không rò rỉ:**
5. Trong cleanup của `useEffect`: `gui.destroy()`, `cancelAnimationFrame`, duyệt scene gọi `geometry.dispose()` + `material.dispose()`, rồi `renderer.dispose()`
6. **Đo thật:** log `renderer.info.memory` (`geometries`, `textures`)
7. Vào/ra trang này **10 lần** liên tục, mỗi lần ghi lại con số
8. Bỏ phần dispose đi, lặp lại → so sánh hai dãy số

**Xong khi:** bạn có hai dãy số chứng minh có/không rò rỉ. Đây là dẫn chứng cho câu hỏi phỏng vấn *"tích hợp Three.js vào React thì quản lý lifecycle thế nào"* — và cũng là lý do `gui.destroy()` cần thiết (thiếu nó, mỗi lần hot-reload sẽ đẻ thêm một panel chồng lên nhau).

**Ghi chú của tôi:**

---

## 1.7 — Deploy sớm

**Mục tiêu:** đưa scene đầu tiên lên mạng ngay từ tuần 1.

**Vì sao ở đây mà không phải cuối lộ trình:** Three.js Journey đặt bài "Go live" ở vị trí #13 — **trong chương Basics**, trước cả bài về ánh sáng. Lý do: có link chạy thật từ sớm thì mỗi bài học sau đó đều cộng dồn vào một thứ hữu hình, thay vì nằm im trên máy suốt 5 tuần rồi mới deploy một lần.

**Khái niệm:**
- Deploy Next.js lên Vercel, nối với GitHub repo
- Kiểm tra WebGL chạy thật trên điện thoại — khác hẳn máy tính
- Preview deployment cho mỗi PR

**Bài tập:**

1. Push code lên GitHub, nối repo với Vercel, deploy
2. Mở URL trên **điện thoại thật** (không phải chế độ giả lập của DevTools)
3. Ghi lại vào mục Ghi chú: FPS trên desktop vs trên điện thoại của bạn
4. Tạo một branch mới, sửa nhỏ, mở Pull Request → xem Vercel tự tạo preview deployment cho PR đó
5. Merge PR

**Xong khi:** có URL công khai chạy được trên điện thoại, và bạn đã đi trọn một vòng quy trình `branch → PR → preview → merge` — đúng thứ JD yêu cầu ở mục *"Git (Branching, Merge, Pull Request)"*.

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

**Bài tập — dựng "bàn trưng bày sản phẩm"** *(scene này dùng xuyên suốt Module 2)*

1. Một mặt sàn (`PlaneGeometry` xoay ngang) + một vật thể chính ở giữa (sphere hoặc torus knot)
2. Nhân bản vật thể chính thành 5 bản, mỗi bản một material: `Basic`, `Lambert`, `Phong`, `Standard`, `Physical`
3. Thêm **một** `DirectionalLight`
4. Dùng `lil-gui` chỉnh `roughness` và `metalness` của bản `Standard` — kéo slider từ 0 đến 1 ở cả hai, quan sát 4 góc: (0,0), (0,1), (1,0), (1,1)
5. Với `MeshPhysicalMaterial`, bật `transmission = 1` + `thickness` → làm ra thuỷ tinh

**Thử phá cho hiểu:**
- Xoá đèn đi → **chỉ còn bản `Basic` là nhìn thấy**. Đây chính là câu trả lời cho "vì sao vật thể của em đen thui".

**Xong khi:** nhìn một vật thể render ra, đoán được nó dùng material nào; và giải thích được `metalness` khác `roughness` ở chỗ nào bằng lời của mình.

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

**Bài tập:**

1. Trên scene bài 2.1, thêm lần lượt 5 loại đèn, mỗi loại một checkbox bật/tắt trong `lil-gui`
2. Gắn helper tương ứng (`DirectionalLightHelper`, `PointLightHelper`, `SpotLightHelper`, `HemisphereLightHelper`) để **nhìn thấy** đèn đang ở đâu
3. Chỉnh `intensity`, `color`, `position` bằng GUI
4. Dựng một setup ba đèn kinh điển: key light mạnh, fill light yếu đối diện, rim light phía sau

**Đo chi phí thật:**
5. Thêm 1, rồi 4, rồi 8 `PointLight` vào scene. Mỗi lần ghi lại FPS (bật FPS meter trong DevTools → Rendering)
6. Ghi ba con số đó vào mục Ghi chú

**Xong khi:** có số liệu thật cho câu "nhiều đèn thì chậm", và bạn dựng được setup ba đèn mà không cần tra lại.

**Ghi chú của tôi:**

---

## 2.3 — Bóng đổ (Shadows)

**Khái niệm:**
- Bật ba nơi: `renderer.shadowMap.enabled`, `light.castShadow`, và trên từng mesh `castShadow` / `receiveShadow`
- Shadow map là gì — render scene từ góc nhìn của đèn
- `light.shadow.mapSize` — độ nét vs bộ nhớ
- `light.shadow.camera` — phải bao trọn vùng cần đổ bóng; dùng `CameraHelper` để chỉnh
- **Bóng đổ đắt.** Trên mobile thường tắt hẳn hoặc dùng bóng giả (texture mờ dưới chân vật thể)

**Bài tập:**

1. Bật bóng đổ đủ ba nơi: `renderer.shadowMap.enabled`, `light.castShadow`, và `castShadow`/`receiveShadow` trên từng mesh
2. Thử quên **một** trong ba → xem mất bóng thế nào (làm cả ba trường hợp)
3. Gắn `CameraHelper(light.shadow.camera)` → nhìn thấy vùng phủ của shadow camera
4. Cố tình để vật thể nằm **ngoài** vùng đó → bóng biến mất; rồi chỉnh `shadow.camera` bao trọn lại
5. Đổi `shadow.mapSize` giữa 512 / 1024 / 4096 → so sánh độ nét và FPS
6. So sánh `BasicShadowMap` vs `PCFShadowMap` vs `PCFSoftShadowMap`

**Làm bóng giả (kỹ thuật thực chiến):**
7. Tắt hết bóng thật, thay bằng một `PlaneGeometry` nhỏ với texture tròn mờ đặt dưới chân vật thể → so sánh FPS với bóng thật

**Xong khi:** giải thích được vì sao trên mobile người ta hay dùng bóng giả, kèm số liệu FPS của chính mình.

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

**Bài tập:**

1. Tải một bộ texture PBR miễn phí (gợi ý: [Poly Haven](https://polyhaven.com/textures) — có đủ color/normal/roughness/ao)
2. Áp lần lượt lên `MeshStandardMaterial`: `map` → `normalMap` → `roughnessMap` → `aoMap`, mỗi lần thêm một cái và quan sát khác biệt
3. Bật/tắt từng map bằng `lil-gui` để so sánh trực tiếp

**Thử phá — bài học quan trọng nhất:**
4. Đặt `colorSpace = THREE.SRGBColorSpace` cho `map` → đúng. Rồi **cố tình** đặt luôn cho `normalMap` → quan sát bề mặt sai lệch
5. Bỏ `SRGBColorSpace` khỏi `map` → màu bợt/xỉn. Chụp màn hình cả hai để so sánh

**Lặp texture:**
6. `wrapS`/`wrapT = RepeatWrapping` + `repeat.set(4, 4)` trên mặt sàn

**Đo chi phí:**
7. So sánh texture 512px vs 4096px: ghi lại `renderer.info.memory.textures` và thời gian tải

**Xong khi:** nói được vì sao texture màu cần sRGB còn normal map thì không — đây là chủ đề bị bỏ sót nhiều nhất, biết là điểm cộng rõ rệt.

**Ghi chú của tôi:**

---

## 2.5 — Environment Map (HDRI)

**Khái niệm:**
- `RGBELoader` load file `.hdr`
- `scene.environment` — chiếu sáng toàn bộ scene bằng ảnh môi trường, **thay thế được cả dàn đèn**
- `scene.background` — dùng làm ảnh nền
- `PMREMGenerator` — tiền xử lý HDRI cho PBR
- Đây là cách nhanh nhất để demo trông "thật": vật liệu kim loại phản chiếu môi trường

**Bài tập:**

1. Tải một file `.hdr` từ [Poly Haven](https://polyhaven.com/hdris), load bằng `RGBELoader`
2. Gán `scene.environment` → **xoá hết đèn đi** → quan sát scene vẫn sáng đẹp
3. Gán thêm `scene.background` để dùng làm nền
4. Đặt vật thể `metalness = 1, roughness = 0` → thấy nó phản chiếu môi trường như gương
5. Chỉnh `scene.environmentIntensity` bằng GUI
6. Thử 3 file HDRI khác nhau (studio / ngoài trời / hoàng hôn) → cùng một vật thể, ba không khí hoàn toàn khác

**Thêm sương mù:**
7. `scene.fog = new THREE.Fog(color, near, far)` → chỉnh `near`/`far` bằng GUI
8. So sánh với `FogExp2`
9. Lưu ý: màu fog nên trùng màu nền, nếu không sẽ lộ đường viền

**Xong khi:** so sánh được scene "dàn 5 đèn thủ công" với scene "một HDRI", và nói được vì sao cách thứ hai vừa đẹp hơn vừa rẻ hơn.

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

**Bài tập:**

1. Chụp lại scene hiện tại làm ảnh "trước"
2. Bật `renderer.toneMapping`, thử lần lượt: `NoToneMapping` → `LinearToneMapping` → `ACESFilmicToneMapping` → `AgXToneMapping`. Chụp cả bốn
3. Chỉnh `toneMappingExposure` từ 0.5 đến 3 bằng `lil-gui`
4. Kiểm tra `renderer.outputColorSpace` — mặc định là gì trong bản Three.js đang dùng?

**Thử phá:**
5. Đặt `light.intensity = 10` với `NoToneMapping` → vùng sáng **cháy trắng** mất hết chi tiết
6. Giữ nguyên intensity, bật `ACESFilmicToneMapping` → chi tiết vùng sáng quay lại. Đây là toàn bộ ý nghĩa của tone mapping.

**Xong khi:** có bộ ảnh so sánh, và giải thích được "vì sao demo của em trông bợt hơn demo trên mạng" — câu hỏi mà hầu hết người tự học không trả lời được.

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

**Bài tập:**

1. Tạo 3 tấm kính (`PlaneGeometry`, `transparent: true`, `opacity: 0.5`) xếp chồng theo trục z
2. Xoay camera vòng quanh → **quan sát tấm phía sau lúc hiện lúc mất**. Đây là lỗi thứ tự vẽ kinh điển.
3. Thử `depthWrite = false` → quan sát thay đổi
4. Dùng `renderOrder` ép thứ tự thủ công → sửa được lỗi
5. So sánh với `alphaTest`: tạo một texture có vùng trong suốt hoàn toàn (ví dụ hình chiếc lá), dùng `alphaTest = 0.5` thay vì `transparent` → không còn lỗi thứ tự
6. Bật `side: THREE.DoubleSide` trên một mặt phẳng, đo FPS trước/sau

**Xong khi:** tái hiện được lỗi trong suốt rồi tự sửa, và biết khi nào nên dùng `alphaTest` thay vì `transparent` (gợi ý: cây cối, hàng rào, tóc).

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

**Bài tập:**

1. Tải một model `.glb` miễn phí ([Poly Pizza](https://poly.pizza/) hoặc [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)), đặt vào `public/models/`
2. Load bằng `GLTFLoader`, thêm `gltf.scene` vào scene
3. `console.log(gltf)` → khám phá cấu trúc: `scene`, `animations`, `cameras`, `asset`
4. Dùng `gltf.scene.traverse()` để in ra tên và loại của **mọi** node con
5. Trong lúc traverse, bật `castShadow` cho tất cả mesh — model từ file **không tự có** thuộc tính này
6. Đổi màu material của **một** bộ phận cụ thể (tìm theo `child.name`)

**Tự căn giữa và scale:**
7. Dùng `new THREE.Box3().setFromObject(model)` để đo bounding box
8. Tính tâm và kích thước, dịch model về gốc toạ độ và scale về chiều cao chuẩn (ví dụ 2 đơn vị)
9. Viết thành hàm dùng lại được — sau này load model nào cũng vừa khung

**Xong khi:** thả một model bất kỳ vào và nó tự nằm giữa màn hình, đúng kích thước, có đổ bóng.

**Ghi chú của tôi:**

---

## 3.2 — Loading & Error state

**Khái niệm:**
- Callback thứ 3 của `loader.load` cho `progress` — tính `%` từ `loaded/total`
- `LoadingManager` — theo dõi tiến trình của **nhiều** asset cùng lúc (`onProgress`, `onLoad`, `onError`)
- Màn hình loading, và xử lý khi model lỗi (fallback, thông báo)
- **Liên hệ JD:** dòng *"xử lý loading/error state"* trong JD không chỉ nói về REST API — asset 3D nặng hàng MB nên chuyện này còn quan trọng hơn

**Bài tập:**

1. Dùng callback thứ 3 của `loader.load` để lấy `progress`, tính `%`
2. Dựng một màn hình loading bằng **Tailwind** (thanh progress + số %) che canvas cho tới khi xong
3. Dùng `LoadingManager` khi có **nhiều** asset (model + HDRI + vài texture) → một % tổng hợp duy nhất
4. Fade mượt từ màn loading sang scene (`transition` của CSS — đúng phần JD yêu cầu về CSS Animation)

**Xử lý lỗi:**
5. Cố tình trỏ sai đường dẫn model → bắt `onError`, hiện thông báo lỗi tử tế + nút "Thử lại"
6. Mô phỏng mạng chậm: DevTools → Network → chọn throttling "Slow 3G" → xem % chạy thật

**Thử phá:**
7. Với model nặng và mạng chậm, quan sát hiện tượng trang **đứng hình** nếu bạn render trước khi load xong

**Xong khi:** người dùng mạng chậm vẫn thấy tiến trình rõ ràng, và lỗi mạng không làm trang trắng xoá.

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

**Bài tập:**

1. Cài `gltf-transform` CLI: `bunx @gltf-transform/cli --help`
2. Lấy model gốc, ghi lại dung lượng file
3. Nén Draco: `gltf-transform draco input.glb output.glb` → ghi lại dung lượng mới
4. Nén texture sang KTX2: `gltf-transform uastc` hoặc `etc1s` → ghi lại lần nữa
5. Load bản đã nén bằng `GLTFLoader` + `DRACOLoader` (nhớ `setDecoderPath`)
6. **Đo thời gian:** `performance.now()` trước và sau khi load, so sánh bản gốc và bản nén

**Lập bảng so sánh trong mục Ghi chú:**

| Phiên bản | Dung lượng | Thời gian tải (Fast 3G) | Thời gian giải nén |
|---|---|---|---|
| Gốc | | | |
| Draco | | | |
| Draco + KTX2 | | | |

**Xong khi:** có bảng số liệu của chính mình. Khi phỏng vấn hỏi về tối ưu GLTF, bạn đưa ra con số thật thay vì nói lý thuyết — đây là mục "điểm cộng" JD ghi rõ.

**Ghi chú của tôi:**

---

## 3.4 — Animation của model

**Khái niệm:**
- `gltf.animations` — mảng `AnimationClip`
- `AnimationMixer` — tạo mixer, `clipAction(clip).play()`
- **Phải gọi `mixer.update(delta)` mỗi frame** — quên là model đứng im
- Chuyển động giữa các clip: `crossFadeTo`

**Bài tập:**

1. Tải một model **có sẵn animation** (Sample Assets của Khronos có nhiều, ví dụ `Fox` hoặc `CesiumMan`)
2. `console.log(gltf.animations)` → xem có bao nhiêu clip, tên là gì
3. Tạo `AnimationMixer(gltf.scene)`, chạy clip đầu tiên bằng `mixer.clipAction(clip).play()`
4. **Gọi `mixer.update(delta)` trong animation loop** — dùng đúng `delta` từ `Clock` như bài 1.4

**Thử phá:**
5. Bỏ dòng `mixer.update()` → model đứng im dù đã `play()`. Lỗi này rất hay gặp.
6. Truyền số cố định thay vì `delta` → tốc độ animation lệ thuộc FPS, đúng vấn đề của bài 1.4

**Chuyển động mượt giữa các clip:**
7. Nếu model có nhiều clip (đi/chạy/đứng), làm nút chuyển và dùng `crossFadeTo(action, 0.5)` → quan sát chuyển tiếp mượt
8. Chỉnh `timeScale` bằng `lil-gui` để tua nhanh/chậm

**Xong khi:** chuyển đổi được giữa các animation mà không bị giật, và giải thích được vai trò của `mixer.update(delta)`.

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

**Bài tập — viết raycaster thủ công, chưa dùng thư viện**

1. Tạo lưới 5×5 khối hộp
2. Bắt sự kiện `pointermove` trên canvas
3. **Tự tay chuyển pixel → NDC:**
   ```js
   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
   ```
   Tự giải thích được vì sao có `* 2 - 1` và vì sao trục y bị đảo dấu
4. `raycaster.setFromCamera(pointer, camera)` → `intersectObjects(cubes)`
5. Đổi màu khối đang được trỏ vào; trả lại màu cũ khi rời đi
6. `console.log(intersects)` → xem cấu trúc: `distance`, `point`, `face`, `object`

**Thử phá:**
7. Dùng `intersects[3]` thay vì `[0]` → hiểu vì sao mảng đã sắp xếp theo khoảng cách
8. Dùng `clientX` mà không trừ đi `getBoundingClientRect()` của canvas, rồi đặt canvas không nằm ở góc trên trái → toạ độ lệch. Đây là lỗi rất phổ biến khi canvas không chiếm toàn màn hình.

**Hiệu năng:**
9. Raycast trong `requestAnimationFrame` (mỗi frame) vs chỉ trong sự kiện chuột → đo FPS với 500 vật thể

**Xong khi:** viết lại được công thức NDC từ đầu mà không tra, và giải thích được raycasting hoạt động ra sao.

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

**Bài tập — port scene vanilla sang R3F**

1. Lấy **đúng** hệ mặt trời ở bài 1.4, viết lại bằng `<Canvas>` + JSX
2. Đối chiếu từng dòng: `new THREE.BoxGeometry(1,1,1)` ↔ `<boxGeometry args={[1,1,1]} />`
3. Thay `requestAnimationFrame` bằng `useFrame((state, delta) => ...)` — dùng `delta` có sẵn
4. Dùng `useRef` để giữ tham chiếu mesh và xoay trong `useFrame`
5. `useThree()` để lấy `camera`, `gl`, `size`

**So sánh trực tiếp — viết vào mục Ghi chú:**
6. Đếm số dòng của hai phiên bản
7. Liệt kê những gì R3F **tự làm hộ**: animation loop, resize handler, dispose khi unmount
8. Kiểm chứng dispose tự động: log `gl.info.memory` khi vào/ra trang nhiều lần, so với kết quả bài 1.6

**Xong khi:** trả lời được câu hỏi phỏng vấn "so sánh viết vanilla Three.js trong useEffect với dùng R3F" bằng trải nghiệm của chính mình, không phải lý thuyết.

**Ghi chú của tôi:**

---

## 4.3 — drei helpers

**Khái niệm:**
- `<OrbitControls />`, `<Environment preset="city" />`, `<useGLTF />`, `<Html />` (nhúng DOM vào không gian 3D)
- `useGLTF.preload()` — tải trước
- `<Center>`, `<Bounds>` — tự căn model
- `<Stage>` — set up ánh sáng + môi trường nhanh cho demo sản phẩm

**Bài tập:**

1. Thay `OrbitControls` thủ công bằng `<OrbitControls />` của drei
2. Thay `RGBELoader` thủ công bằng `<Environment preset="city" />` — thử vài preset khác nhau
3. Load model bằng `useGLTF('/models/xxx.glb')` thay vì `GLTFLoader`
4. Bọc trong `<Suspense fallback={...}>` — hiểu vì sao `useGLTF` cần Suspense (nó "ném" promise)
5. Dùng `<Center>` để tự căn model — so sánh với hàm `Box3` bạn tự viết ở bài 3.1
6. Thử `<Stage>` — dựng nguyên một bối cảnh trưng bày sản phẩm chỉ bằng một component

**Preload:**
7. `useGLTF.preload('/models/xxx.glb')` ở cấp module → so sánh cảm giác chuyển trang có/không preload

**Xong khi:** biết cái nào drei làm hộ được, và quan trọng hơn — **giải thích được nó làm hộ cái gì**, vì bạn đã tự viết tay ở Module 1-3.

**Ghi chú của tôi:**

---

## 4.4 — Sự kiện trong R3F

**Khái niệm:**
- `onClick`, `onPointerOver`, `onPointerOut`, `onPointerMove` gắn thẳng lên `<mesh>` — R3F tự lo raycasting
- `e.stopPropagation()` — mặc định sự kiện xuyên qua **mọi** vật thể nằm sau con trỏ, không chỉ vật gần nhất
- Đổi con trỏ chuột thành `pointer` khi hover
- `<mesh visible={false}>` nhưng vẫn nhận sự kiện — dùng làm vùng hitbox vô hình

**Bài tập:**

1. Thêm `onPointerOver` / `onPointerOut` / `onClick` lên mesh
2. Hover: phóng to nhẹ + đổi màu; Click: chọn/bỏ chọn
3. Đổi con trỏ chuột thành `pointer` khi hover (`document.body.style.cursor`)

**Thử phá — bài học chính:**
4. Xếp 3 khối hộp thẳng hàng theo trục z. Click vào khối trước → **cả 3 đều nhận sự kiện**. Kiểm chứng bằng `console.log`.
5. Thêm `e.stopPropagation()` → chỉ khối gần nhất nhận. Đây là khác biệt lớn so với sự kiện DOM thông thường mà nhiều người tưởng giống nhau.

**Hitbox vô hình:**
6. Tạo một vật thể nhỏ khó click, bọc quanh nó một `<mesh visible={false}>` to hơn để làm vùng bấm → trải nghiệm tốt hơn hẳn, nhất là trên mobile

**Trên điện thoại:**
7. Deploy và thử chạm trên điện thoại thật — sự kiện pointer có hoạt động không? Vùng chạm đủ to chưa?

**Xong khi:** giải thích được vì sao mặc định sự kiện xuyên qua mọi vật thể, và khi nào cần `stopPropagation`.

**Ghi chú của tôi:**

---

## 4.5 — State: zustand + R3F

**Khái niệm:**
- **Vấn đề cốt lõi:** `useFrame` chạy 60 lần/giây. Dùng `useState` trong đó = 60 lần re-render/giây = tụt hiệu năng
- Giải pháp: zustand cho phép đọc state **ngoài** chu kỳ render — `useStore.getState()` trong `useFrame` không kích hoạt re-render
- Dùng selector để component chỉ re-render khi đúng phần mình quan tâm đổi
- Khi nào vẫn nên dùng `useRef` thay vì store (giá trị chỉ dùng nội bộ mỗi frame)
- **Chuẩn bị câu trả lời phỏng vấn:** vì sao chọn zustand cho scene 3D nhưng Redux/Context cho luồng data/auth

**Bài tập — chứng minh vấn đề trước, rồi mới sửa**

**Phần A — làm sai có chủ ý:**
1. Tạo store bằng `useState` ở component cha, cập nhật trong `useFrame` (ví dụ lưu vị trí xoay hiện tại)
2. Cài React DevTools, bật "Highlight updates when components render"
3. **Quan sát:** toàn bộ cây component nhấp nháy 60 lần/giây
4. Ghi lại FPS

**Phần B — sửa bằng zustand:**
5. Chuyển sang zustand, đọc bằng `useStore.getState()` **bên trong** `useFrame` (không dùng hook)
6. Quan sát lại DevTools → hết nhấp nháy. Ghi lại FPS.

**Phần C — selector:**
7. Tạo store có nhiều trường, dùng selector `useStore(s => s.selectedId)` → chỉ component quan tâm mới re-render
8. Thử lấy cả object `useStore(s => s)` → re-render lại tràn lan. Hiểu vì sao phải dùng selector.

**Phần D — khi nào chỉ cần useRef:**
9. Giá trị chỉ dùng nội bộ trong `useFrame`, không component nào khác cần → dùng `useRef`, không cần store

**Xong khi:** có hai con số FPS và ảnh chụp DevTools làm bằng chứng. Đây là câu trả lời mạnh cho câu hỏi state management, và là lý do bạn chọn zustand cho scene 3D nhưng Redux/Context cho luồng data.

**Ghi chú của tôi:**

---

## 4.6 — Camera transition mượt

**Khái niệm:**
- Nội suy tuyến tính (`lerp`) và damping — làm camera bay tới vị trí mới mượt mà
- `vec.lerp(target, 0.1)` trong `useFrame` — nhưng nhớ nhân delta để độc lập frame rate
- `easing` từ thư viện `maath` (pmndrs) — `easing.damp3()`
- Kịch bản thực tế: click vào một bộ phận của model → camera bay tới và focus

**Bài tập:**

1. Đặt 5 vật thể ở các vị trí khác nhau
2. Click một vật thể → camera bay tới, nhìn thẳng vào nó
3. Làm thủ công trước: `camera.position.lerp(target, 0.1)` trong `useFrame`

**Thử phá:**
4. Không nhân `delta` → chạy thử ở 60fps và 30fps (giới hạn trong DevTools), thấy tốc độ bay khác nhau
5. Sửa bằng công thức độc lập frame rate, hoặc dùng `easing.damp3()` của `maath`

**Nâng cấp:**
6. Cài `maath`, dùng `easing.damp3(camera.position, target, 0.25, delta)` → mượt hơn hẳn `lerp` thô
7. Đồng thời di chuyển cả `controls.target` để camera nhìn đúng tâm vật thể
8. Tạm khoá `OrbitControls` trong lúc bay, mở lại khi tới nơi
9. Nút "Reset view" đưa camera về vị trí ban đầu

**Xong khi:** chuyển cảnh mượt như các trang sản phẩm 3D chuyên nghiệp, và tốc độ không đổi theo FPS máy.

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

**Bài tập:**

**Phần A — tự tính trước:**
1. Lấy một vật thể trong scene, dùng `vector.copy(mesh.position).project(camera)` để chiếu về NDC
2. Chuyển NDC sang toạ độ pixel màn hình
3. Đặt một `div` Tailwind tại đúng toạ độ đó, cập nhật mỗi frame → nhãn bám theo vật thể
4. Xoay camera → kiểm tra nhãn có bám đúng không

**Phần B — dùng drei:**
5. Thay bằng `Html` của drei, so sánh với bản tự viết
6. Bật `occlude` → nhãn tự ẩn khi vật thể bị che khuất
7. `distanceFactor` để nhãn nhỏ dần khi ra xa

**Phần C — canvas làm nền:**
8. Đặt Canvas `position: fixed` phủ toàn màn hình, nội dung HTML cuộn phía trên
9. Đảm bảo sự kiện chuột vẫn tới được cả hai lớp khi cần (`pointer-events`)

**Xong khi:** có tooltip Tailwind bám theo vật thể 3D — thành phần cốt lõi cho Project 2 (configurator), và là chỗ JD nhìn thấy kỹ năng CSS của bạn.

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

**Bài tập — tái cấu trúc, không thêm tính năng**

Đến đây bạn đã có khoảng 20 bài học nằm rải rác. Bài này dọn dẹp:

1. Tách thành 3 tầng rõ ràng:
   - `lessons/` — dữ liệu bài học (id, tiêu đề, mô tả, thumbnail)
   - `components/scenes/` — component 3D của từng bài
   - `components/ui/` — panel, danh sách, tooltip (Tailwind)
2. Gom việc load tài nguyên vào một chỗ, không để mỗi scene tự load HDRI/model riêng
3. Dùng `useMemo` cho geometry/material dùng chung nhiều nơi
4. Đặt tên nhất quán, viết type TypeScript cho dữ liệu bài học
5. Kiểm tra không còn biến toàn cục nào giữ state của scene

**Bài kiểm tra thật sự:**
6. **Thêm một bài học mới hoàn toàn.** Đếm số file phải sửa.
7. Nếu phải sửa quá 2-3 chỗ → cấu trúc chưa đúng, làm lại

**Xong khi:** thêm bài học mới chỉ cần thêm một entry dữ liệu và một component scene. Journey dành 3 giờ 20 phút cho chủ đề này — nó xứng đáng.

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

**Bài tập:**

1. Thêm `Perf` từ `r3f-perf` vào Canvas (chỉ bật ở môi trường development)
2. Đọc hiểu từng chỉ số: FPS, draw calls, triangles, geometries, textures, GPU time
3. Lấy số liệu thô không cần thư viện: trong `useFrame`, log `gl.info.render.calls` và `gl.info.render.triangles`
4. **Lập bảng cơ sở** cho tất cả bài học đã làm, ghi vào Ghi chú:

| Bài | FPS | Draw calls | Triangles |
|---|---|---|---|

5. Chrome DevTools → Performance → quay 5 giây, tìm xem thời gian đổ vào đâu
6. Phân biệt nghẽn CPU (JS chạy lâu) hay GPU (GPU time cao)

**Xong khi:** biết bài nào đang nặng nhất **trước khi** tối ưu bất cứ thứ gì. Nguyên tắc: không bao giờ tối ưu khi chưa đo — đoán mò thường sai chỗ.

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

**Bài tập — bài quan trọng nhất Module 5**

**Phần A — tạo vấn đề:**
1. Tạo **1000** khối hộp riêng lẻ, mỗi cái một mesh với cùng geometry và material
2. Ghi lại số draw calls và FPS
3. Tăng lên 5000 → ghi lại lần nữa

**Phần B — sửa bằng InstancedMesh:**
4. Chuyển sang `instancedMesh` với `args={[geometry, material, 1000]}`
5. Đặt vị trí từng bản bằng `setMatrixAt(i, matrix)`, nhớ bật `instanceMatrix.needsUpdate`
6. Ghi lại draw calls và FPS
7. Thử 5000, rồi 50000 instance

**Phần C — màu riêng cho từng instance:**
8. `setColorAt(i, color)` để mỗi khối một màu mà vẫn giữ 1 draw call

**Phần D — merge geometry:**
9. Với vật thể tĩnh không cần di chuyển riêng, thử `BufferGeometryUtils.mergeGeometries()`
10. So sánh với instancing: khi nào dùng cái nào?

**Bảng kết quả bắt buộc điền vào Ghi chú:**

| Cách làm | Số object | Draw calls | FPS |
|---|---|---|---|
| Mesh thường | 1000 | | |
| Mesh thường | 5000 | | |
| InstancedMesh | 1000 | | |
| InstancedMesh | 50000 | | |

**Xong khi:** bạn có **con số cụ thể của chính mình**. Khi phỏng vấn hỏi "draw call là gì, giảm thế nào", câu trả lời "em từng giảm từ 1000 xuống 1 và FPS tăng từ X lên Y" mạnh hơn hẳn mọi định nghĩa thuộc lòng. Đây là mục điểm cộng JD ghi rõ.

**Ghi chú của tôi:**

---

## 5.3 — Tối ưu model & texture

**Khái niệm:**
- Giảm poly count (decimate) — bằng `gltf-transform` hoặc Blender
- Giảm kích thước texture; nén KTX2
- `LOD` (Level of Detail) — vật ở xa dùng model đơn giản hơn
- Frustum culling (Three.js làm sẵn) và tại sao đôi khi cần tắt
- Cân đối: file nhẹ (tải nhanh) vs giải nén (tốn CPU) vs chất lượng

**Bài tập:**

1. Lấy một model nhiều poly, dùng `gltf-transform simplify` với `--ratio 0.5` để giảm poly
2. So sánh trực quan bản gốc và bản giảm — đến ngưỡng nào thì mắt bắt đầu nhận ra?
3. Ghi lại số triangle của từng bản

**LOD:**
4. Dùng `THREE.LOD`: thêm 3 mức chi tiết theo khoảng cách
5. Di chuyển camera ra xa → quan sát thời điểm chuyển mức (bật wireframe để thấy rõ)
6. Đo triangle count khi camera gần và khi ở xa

**Texture:**
7. Giảm texture 4K xuống 1K, so sánh `renderer.info.memory.textures` và chất lượng hiển thị
8. Thử nén KTX2

**Frustum culling:**
9. Đặt nhiều vật thể ngoài tầm nhìn camera → xác nhận Three.js tự loại chúng khỏi draw call
10. Đặt `frustumCulled = false` → xem draw call tăng. Khi nào thì cần tắt?

**Xong khi:** nêu được 3 cách giảm chi phí model kèm số liệu, và biết mỗi cách đánh đổi gì.

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

**Bài tập — bắt buộc thử trên điện thoại thật**

1. Deploy phiên bản hiện tại, mở trên điện thoại, **ghi lại FPS**
2. So sánh với FPS trên máy tính — thường chênh lệch rất lớn

**Tối ưu từng bước, đo lại sau mỗi bước:**
3. Đặt `dpr={[1, 2]}` cho Canvas để giới hạn pixel ratio
4. Tắt bóng đổ trên mobile, thay bằng bóng giả (kỹ thuật ở bài 2.3)
5. Giảm `shadow.mapSize` hoặc số đèn
6. Thêm `AdaptiveDpr` và `AdaptiveEvents` của drei
7. Dùng `PerformanceMonitor` để tự hạ chất lượng khi FPS tụt

**Phát hiện thiết bị yếu:**
8. Dựa vào `gl.capabilities` hoặc `navigator.hardwareConcurrency` để chọn cấu hình phù hợp
9. Tôn trọng `prefers-reduced-motion` — tắt animation cho người dùng cần

**Bảng kết quả:**

| Thiết bị | FPS trước | FPS sau | Đã tối ưu gì |
|---|---|---|---|

**Xong khi:** trang chạy được trên điện thoại của bạn ở mức chấp nhận được (từ 30fps trở lên). Liên hệ JD: "Responsive Design" trong 3D không chỉ là layout mà còn là **chất lượng render thích ứng** — nói được ý này là điểm cộng lớn.

**Ghi chú của tôi:**

---

## 5.5 — Memory & rò rỉ

**Khái niệm:**
- GPU memory không được JS GC thu hồi → phải `dispose()` thủ công
- Dispose cái gì: geometry, material, texture, render target
- Kiểm tra rò rỉ: `gl.info.memory.geometries` / `.textures` có tăng dần không khi vào/ra trang liên tục
- Trong R3F phần lớn được tự động, nhưng object tạo thủ công thì không

**Bài tập:**

1. Viết một hàm log gọn cho `gl.info.memory.geometries` và `.textures`
2. Chuyển qua lại giữa 5 bài học **20 lần**, ghi số liệu sau mỗi 5 lần
3. Con số có tăng đều không? Nếu có thì đang rò rỉ

**Tìm và sửa:**
4. Với object tạo thủ công (không qua JSX của R3F), kiểm tra đã dispose chưa
5. Texture load bằng `TextureLoader` thủ công — R3F **không** tự dọn
6. Render target tự tạo (sẽ gặp ở bài 6.2) cũng phải dispose
7. Viết hàm `disposeObject3D(obj)` duyệt đệ quy, dispose mọi geometry/material/texture

**Kiểm chứng bằng công cụ:**
8. Chrome DevTools → Memory → chụp heap snapshot trước và sau 20 lần chuyển trang, so sánh

**Xong khi:** hai dãy số chứng minh bộ nhớ ổn định. Đây là bằng chứng cho câu hỏi phỏng vấn về quản lý lifecycle khi tích hợp Three.js vào React.

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

**Bài tập:**

1. Mở một bài học có scene **đứng yên**, không animation
2. Mở Task Manager và quan sát mức dùng CPU/GPU — nó vẫn đang render 60fps dù chẳng có gì thay đổi
3. Chuyển Canvas sang `frameloop="demand"`
4. Gọi `invalidate()` khi cần vẽ lại: sau khi OrbitControls thay đổi, sau khi state đổi
5. Quan sát mức dùng CPU/GPU giảm mạnh

**Thử phá:**
6. Quên gọi `invalidate()` sau khi đổi màu bằng GUI → màn hình đứng hình dù state đã đổi. Đây là cạm bẫy chính của chế độ này.

**Dừng hẳn khi ra khỏi màn hình:**
7. Dùng `IntersectionObserver` theo dõi container của canvas
8. Khi canvas ra khỏi viewport thì dừng render hẳn, vào lại thì chạy tiếp
9. Rất quan trọng với trang showcase nhiều bài học cuộn dọc

**Đo pin (nếu dùng laptop):**
10. Mở trang 10 phút ở hai chế độ, so sánh mức tiêu thụ

**Xong khi:** trang không đốt tài nguyên khi không có gì chuyển động. Hầu hết ứng viên chỉ nói về giảm poly count — nói được về render on demand là khác biệt rõ rệt.

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

**Bài tập:**

1. Tạo `BufferGeometry` với 5000 đỉnh vị trí ngẫu nhiên trong một khối cầu — tự viết `Float32Array`, nối tiếp bài 1.2
2. Render bằng `THREE.Points` + `PointsMaterial`
3. Bật `sizeAttenuation` → hạt ở xa nhỏ lại; tắt đi để so sánh
4. Gán texture hình tròn mờ cho hạt (`alphaMap`) → hết hình vuông xấu
5. Xử lý trong suốt: đặt `depthWrite = false`, quan sát khác biệt — nối tiếp bài 2.7

**Thư viện thiên hà:**
6. Thay vị trí ngẫu nhiên bằng công thức xoắn ốc (bán kính, góc, số nhánh)
7. Thêm màu chuyển dần từ tâm ra rìa bằng attribute `color`
8. Dùng `lil-gui` chỉnh: số hạt, số nhánh, độ xoắn, hai màu

**Đo hiệu năng:**
9. Ghi lại **draw calls** với 5000 hạt, rồi 100.000 hạt — vẫn chỉ là 1 draw call
10. So sánh: nếu làm 5000 hạt bằng 5000 mesh riêng thì draw calls là bao nhiêu?

**Xong khi:** có hiệu ứng thiên hà chỉnh được bằng GUI, và giải thích được vì sao Points rẻ hơn Mesh rất nhiều.

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

**Bài tập:**

1. Tạo `WebGLRenderTarget`, render scene vào đó thay vì ra màn hình
2. Dùng texture kết quả làm `map` cho một mặt phẳng trong scene chính → **màn hình TV trong scene**
3. Đặt một camera thứ hai nhìn từ góc khác, render qua render target → mặt phẳng thành camera an ninh

**Gương:**
4. Đặt camera phụ ở vị trí đối xứng qua mặt phẳng gương
5. Render vào target, áp lên mặt gương

**Đo chi phí:**
6. `gl.info.render.calls` **trước** và **sau** khi thêm render target
7. Nhận ra: mỗi render target là thêm **một lượt vẽ toàn bộ scene**. Đây chính là lý do post-processing tốn kém.

**Dọn dẹp:**
8. `renderTarget.dispose()` khi unmount — nối tiếp bài 5.5, đây là nguồn rò rỉ hay bị quên

**Xong khi:** hiểu "render ra texture" nghĩa là gì. Không có bài này thì post-processing ở bài sau chỉ là phép màu không giải thích được.

**Ghi chú của tôi:**

---

## 6.3 — Post-processing

**Khái niệm:**
- `@react-three/postprocessing` — cài ở module này, **không cài sớm hơn**
- `<Bloom>`, `<Outline>` (viền sáng khi hover), `<DepthOfField>`, `<Vignette>`
- Cách hoạt động: render scene ra texture rồi xử lý thêm nhiều lượt
- **Đo FPS trước và sau khi bật bloom** — chính trải nghiệm đánh đổi này là thứ đáng kể khi phỏng vấn

**Bài tập:**

1. Cài `@react-three/postprocessing` — **đến bài này mới cài**, không sớm hơn
2. Thêm `EffectComposer` với `Bloom` → vật thể sáng phát quang
3. Chỉnh `intensity`, `luminanceThreshold` bằng `lil-gui`
4. Thêm `Outline` — viền sáng quanh vật thể đang hover, kết hợp với sự kiện ở bài 4.4
5. Thử `DepthOfField` và `Vignette`

**Đo cái giá phải trả — phần quan trọng nhất:**
6. Ghi FPS và GPU time **trước** khi bật effect
7. Bật lần lượt từng effect, ghi lại sau mỗi lần
8. Bật hết cùng lúc, ghi lại
9. **Mở trên điện thoại** và làm lại toàn bộ phép đo

**Bảng kết quả:**

| Effect | FPS desktop | FPS mobile | GPU time |
|---|---|---|---|
| Không có | | | |
| Bloom | | | |
| Bloom + Outline | | | |
| Tất cả | | | |

10. Dựa vào số liệu, quyết định: effect nào giữ trên mobile, effect nào tắt?

**Xong khi:** có bảng đánh đổi của chính mình. Khi phỏng vấn hỏi về hiệu ứng, bạn nói được cả cái đẹp lẫn cái giá — đó là tư duy của người làm sản phẩm thật.

**Ghi chú của tôi:**

---

## 6.4 — Nhập môn Shader *(tuỳ chọn, nâng cao)*

**Khái niệm:**
- `ShaderMaterial` — vertex shader và fragment shader làm gì
- `uniforms` — truyền dữ liệu từ JS vào shader; `uTime` để tạo animation
- GLSL cơ bản
- Không bắt buộc cho JD này. Chỉ làm nếu Module 1-5 đã xong và còn thời gian.

**Bài tập** *(tuỳ chọn — chỉ làm khi Module 1-5 đã xong và còn thời gian)*

1. Tạo `ShaderMaterial` với vertex + fragment shader tối giản, tô một màu duy nhất
2. Truyền `uniforms`: một màu và `uTime`
3. Cập nhật `uTime` trong `useFrame` → làm màu biến đổi theo thời gian
4. Dùng `varying` truyền UV từ vertex sang fragment → vẽ gradient
5. Dùng `sin()` trên toạ độ UV → tạo sọc động
6. Trong vertex shader, đẩy `position.z` theo `sin(position.x + uTime)` → mặt phẳng gợn sóng

**Xong khi:** hiểu vertex shader chạy **mỗi đỉnh** còn fragment shader chạy **mỗi pixel** — và vì sao điều đó quyết định chi phí.

**Ghi chú về ưu tiên:** đây là chương lớn nhất của Three.js Journey (26 giờ) nhưng tài liệu chính thức của Three.js **không dạy GLSL**. Không cần cho JD này. Chỉ làm nếu muốn tạo khác biệt cho công việc sáng tạo về sau.

**Ghi chú của tôi:**

---

## 6.5 — Scroll-linked animation

**Khái niệm:**
- Liên kết vị trí scroll với transform của camera/vật thể
- `<ScrollControls>` + `useScroll` của drei
- Làm bằng CSS/IntersectionObserver thuần trước — **JD yêu cầu CSS Animation, Keyframes, CSS 3D Transform**, nên đây là chỗ luyện đúng thứ được hỏi
- Chỉ render canvas khi nằm trong viewport

**Bài tập:**

**Phần A — làm bằng CSS thuần trước (đúng thứ JD hỏi):**
1. Dựng một trang cuộn dọc nhiều section, dùng `@keyframes` + `animation` thuần cho hiệu ứng xuất hiện
2. Dùng `IntersectionObserver` để kích hoạt animation khi section vào viewport
3. Làm một thẻ lật bằng `transform-style: preserve-3d` + `rotateY` + `backface-visibility: hidden`
4. Dùng `perspective` trên phần tử cha, quan sát khác biệt khi thay đổi giá trị

**Phần B — nối với scene 3D:**
5. Liên kết vị trí scroll với `camera.position.y` hoặc góc xoay vật thể
6. Dùng `ScrollControls` + `useScroll` của drei, so sánh với cách tự viết
7. Áp damping để chuyển động không giật theo scroll

**Phần C — hiệu năng:**
8. Chỉ render canvas khi nằm trong viewport (kết hợp bài 5.6)
9. Tôn trọng `prefers-reduced-motion`

**Xong khi:** có một trang cuộn có chuyển động 3D mượt, và **phần CSS animation bạn tự viết chứ không dựa vào thư viện** — vì JD ghi rõ "CSS Animation, Keyframes, CSS 3D Transform", đây là chỗ thể hiện đúng kỹ năng được hỏi.

**Ghi chú của tôi:**

---

## 6.6 — Deploy & hoàn thiện

- Deploy Vercel
- README từng bài: bài toán, quyết định kỹ thuật, số liệu hiệu năng
- Kiểm tra thật trên điện thoại
- Lighthouse: kích thước bundle, thời gian tải

**Bài tập — hoàn thiện để đưa vào CV**

1. Deploy bản cuối lên Vercel
2. Kiểm tra **mọi** bài học trên điện thoại thật, sửa những chỗ vỡ
3. Chạy Lighthouse: xem kích thước bundle, thời gian tải, điểm Performance
4. Tách code (`next/dynamic` với `ssr: false`) cho các scene nặng
5. Kiểm tra không bài nào bị rò rỉ bộ nhớ (bài 5.5)

**README cho từng bài học** — mỗi bài ghi 3 dòng:
- Bài toán là gì
- Quyết định kỹ thuật đáng chú ý
- **Số liệu hiệu năng** (từ các bảng đã đo suốt Module 5)

**Chuẩn bị phỏng vấn:**
6. Quay video 30 giây lướt qua toàn bộ showcase
7. Chọn ra **3 bài** bạn tự tin nhất, luyện kể mỗi bài trong 2 phút: bài toán → cách làm → vướng gì → số liệu
8. Chuẩn bị sẵn để mở code trực tiếp nếu được hỏi

**Xong khi:** có một URL đưa vào CV được, và bạn kể được câu chuyện kỹ thuật đằng sau nó mà không cần nhìn màn hình.

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
