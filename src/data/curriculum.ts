export interface Lesson {
  id: string;
  moduleNumber: number;
  lessonNumber: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  stack: 'vanilla' | 'r3f';
}

export interface Module {
  id: number;
  title: string;
  description: string;
  week: number;
  status: 'completed' | 'in-progress' | 'not-started';
  lessons: Lesson[];
}

export const CURRICULUM: Module[] = [
  {
    id: 1,
    title: "Three.js thuần — nền tảng",
    description: "Viết bằng vanilla Three.js trong useEffect. Hiểu sâu cấu trúc scene graph, camera, WebGL renderer và vòng đời dọn dẹp bộ nhớ.",
    week: 1,
    status: "in-progress",
    lessons: [
      {
        id: "1-1",
        moduleNumber: 1,
        lessonNumber: "1.1",
        title: "Scene, Camera, Renderer",
        subtitle: "Bộ ba cốt lõi dựng scene 3D đầu tiên",
        description: "Tạo Scene, PerspectiveCamera, WebGLRenderer, vẽ một khối hộp duy nhất và dọn dẹp canvas khi unmount. Khảo sát z-fighting, FOV và near/far planes.",
        status: "completed",
        stack: "vanilla",
      },
      {
        id: "1-2",
        moduleNumber: 1,
        lessonNumber: "1.2",
        title: "Geometry & Mesh",
        subtitle: "Khám phá cấu trúc đỉnh và lưới tam giác",
        description: "Tìm hiểu Box, Sphere, Torus, Plane, Cone; điều chỉnh segments, wireframe và tự tạo tam giác bằng BufferGeometry thuần với Float32Array.",
        status: "not-started",
        stack: "vanilla",
      },
      {
        id: "1-3",
        moduleNumber: 1,
        lessonNumber: "1.3",
        title: "Transform & Scene Graph",
        subtitle: "Di chuyển, xoay, thu phóng và quan hệ cha-con",
        description: "Xây dựng hệ mặt trời mini với Sun, Earth và Moon dùng Group để hiểu tính tương đối trong scene graph.",
        status: "not-started",
        stack: "vanilla",
      },
      {
        id: "1-4",
        moduleNumber: 1,
        lessonNumber: "1.4",
        title: "Animation Loop & Delta Time",
        subtitle: "Chuyển động độc lập với tốc độ khung hình",
        description: "Sử dụng requestAnimationFrame và THREE.Clock getDelta() để đảm bảo chuyển động đồng nhất giữa 30fps, 60fps và 120fps.",
        status: "not-started",
        stack: "vanilla",
      },
      {
        id: "1-5",
        moduleNumber: 1,
        lessonNumber: "1.5",
        title: "Camera & Controls & Responsive",
        subtitle: "Điều khiển góc nhìn và xử lý resize chuẩn xác",
        description: "OrbitControls với damping, xử lý camera.updateProjectionMatrix() khi resize và giới hạn pixel ratio Math.min(dpr, 2).",
        status: "not-started",
        stack: "vanilla",
      },
      {
        id: "1-6",
        moduleNumber: 1,
        lessonNumber: "1.6",
        title: "Debug UI & Cleanup Memory",
        subtitle: "Tùy chỉnh tham số thời gian thực và chống rò rỉ GPU",
        description: "Tích hợp lil-gui điều khiển tham số, giải phóng GPU memory qua geometry.dispose(), material.dispose(), renderer.dispose().",
        status: "not-started",
        stack: "vanilla",
      },
      {
        id: "1-7",
        moduleNumber: 1,
        lessonNumber: "1.7",
        title: "Deploy sớm",
        subtitle: "Đưa demo lên mạng và kiểm tra trên thiết bị thật",
        description: "Quy trình CI/CD qua GitHub và Vercel, kiểm tra WebGL chạy thực tế trên thiết bị di động.",
        status: "not-started",
        stack: "vanilla",
      },
    ],
  },
  {
    id: 2,
    title: "Ánh sáng & Vật liệu",
    description: "Khám phá PBR (Physically Based Rendering), đổ bóng shadow maps, texture sampling, tone mapping và environment maps.",
    week: 2,
    status: "not-started",
    lessons: [
      { id: "2-1", moduleNumber: 2, lessonNumber: "2.1", title: "Các loại Material", subtitle: "MeshBasic, Standard, Physical, Normal", description: "So sánh các mô hình phản xạ ánh sáng từ basic đến PBR.", status: "not-started", stack: "vanilla" },
      { id: "2-2", moduleNumber: 2, lessonNumber: "2.2", title: "Ánh sáng cơ bản", subtitle: "Ambient, Directional, Point, Spot, Hemisphere", description: "Cách phối hợp các nguồn sáng tạo chiều sâu cho scene 3D.", status: "not-started", stack: "vanilla" },
      { id: "2-3", moduleNumber: 2, lessonNumber: "2.3", title: "Shadow Maps", subtitle: "Kỹ thuật đổ bóng và tối ưu shadow map", description: "Cấu hình castShadow, receiveShadow, shadow camera và mapSize.", status: "not-started", stack: "vanilla" },
      { id: "2-4", moduleNumber: 2, lessonNumber: "2.4", title: "Textures & UV Mapping", subtitle: "Color, Roughness, Metalness, Normal maps", description: "Tải và gán bộ map PBR với chuẩn color space sRGB.", status: "not-started", stack: "vanilla" },
      { id: "2-5", moduleNumber: 2, lessonNumber: "2.5", title: "Environment Map & HDRI", subtitle: "Ánh sáng môi trường và độ phản xạ PBR", description: "Sử dụng RGBELoader và PMREMGenerator để tạo ánh sáng chân thực.", status: "not-started", stack: "vanilla" },
      { id: "2-6", moduleNumber: 2, lessonNumber: "2.6", title: "Color Management & Tone Mapping", subtitle: "ACESFilmic và không gian màu", description: "Tránh hiện tượng cháy sáng và tái tạo màu sắc chuẩn xác.", status: "not-started", stack: "vanilla" },
      { id: "2-7", moduleNumber: 2, lessonNumber: "2.7", title: "Transparency & Alpha Test", subtitle: "Xử lý vật thể trong suốt và thứ tự vẽ", description: "Khắc phục hiện tượng mặt cắt che khuất nhau khi render vật liệu mờ.", status: "not-started", stack: "vanilla" },
    ],
  },
  {
    id: 3,
    title: "Model 3D thật (GLTF/GLB)",
    description: "Tải, tối ưu hóa và phát animation từ các file mô hình 3D thực tế sản xuất.",
    week: 2,
    status: "not-started",
    lessons: [
      { id: "3-1", moduleNumber: 3, lessonNumber: "3.1", title: "GLTF/GLB & Nén Draco", subtitle: "GLTFLoader và DRACOLoader", description: "Tải model 3D nén dung lượng nhỏ và giải mã nhanh chóng.", status: "not-started", stack: "vanilla" },
      { id: "3-2", moduleNumber: 3, lessonNumber: "3.2", title: "Loading State & Error Handling", subtitle: "Trải nghiệm tải mượt mà", description: "Progress bar và xử lý lỗi mạng khi nạp tài nguyên 3D lớn.", status: "not-started", stack: "vanilla" },
      { id: "3-3", moduleNumber: 3, lessonNumber: "3.3", title: "Tinh chỉnh vật liệu & bóng model", subtitle: "Traverse scene graph của model", description: "Duyệt qua các mesh con để kích hoạt castShadow và gán PBR.", status: "not-started", stack: "vanilla" },
      { id: "3-4", moduleNumber: 3, lessonNumber: "3.4", title: "Animation Clips & Mixer", subtitle: "AnimationMixer và Action Blending", description: "Phát và chuyển tiếp mượt giữa các clip animation (Idle, Run, Jump).", status: "not-started", stack: "vanilla" },
    ],
  },
  {
    id: 4,
    title: "Tương tác & React Three Fiber (R3F)",
    description: "Chuyển giao mượt mà từ Three.js thuần sang hệ sinh thái React Three Fiber khai báo.",
    week: 3,
    status: "not-started",
    lessons: [
      { id: "4-1", moduleNumber: 4, lessonNumber: "4.1", title: "Raycasting & Mouse Picking (Vanilla)", subtitle: "Tương tác nhấp chuột trong 3D", description: "Sử dụng Raycaster và Vector2 toạ độ chuột chuẩn hóa NDC.", status: "not-started", stack: "vanilla" },
      { id: "4-2", moduleNumber: 4, lessonNumber: "4.2", title: "Chuyển giao Vanilla sang R3F", subtitle: "So sánh trực quan 1-1", description: "Tái cấu trúc demo sang Canvas, JSX declaratives và useFrame hook.", status: "not-started", stack: "r3f" },
      { id: "4-3", moduleNumber: 4, lessonNumber: "4.3", title: "@react-three/drei & Leva", subtitle: "Tăng tốc phát triển với vũ khí hạng nặng", description: "OrbitControls, Float, Center, AccumulativeShadows và Leva GUI.", status: "not-started", stack: "r3f" },
      { id: "4-4", moduleNumber: 4, lessonNumber: "4.4", title: "Pointer Events trong R3F", subtitle: "onClick, onPointerOver, onPointerOut", description: "Bắt sự kiện tương tác trực tiếp trên các Mesh JSX như thẻ HTML thông thường.", status: "not-started", stack: "r3f" },
      { id: "4-5", moduleNumber: 4, lessonNumber: "4.5", title: "State Management với Zustand", subtitle: "Đọc state trong useFrame mà không re-render", description: "Kết hợp Zustand selector tránh re-render toàn bộ Canvas 60fps.", status: "not-started", stack: "r3f" },
      { id: "4-6", moduleNumber: 4, lessonNumber: "4.6", title: "Camera Transition & Viewport Animation", subtitle: "Chuyển góc nhìn điện ảnh", description: "CameraControls và nội suy ma trận mượt mà với damping.", status: "not-started", stack: "r3f" },
      { id: "4-7", moduleNumber: 4, lessonNumber: "4.7", title: "Mix HTML và WebGL (drei Html)", subtitle: "Gắn thẻ thông tin và UI trong không gian 3D", description: "Sử dụng <Html> của drei để hiển thị tooltip, card bám theo tọa độ 3D.", status: "not-started", stack: "r3f" },
      { id: "4-8", moduleNumber: 4, lessonNumber: "4.8", title: "Cấu trúc thư mục cho dự án 3D lớn", subtitle: "Kiến trúc code chuẩn công nghiệp", description: "Tổ chức Scenes, Canvas, Hooks, Stores và Assets có khả năng mở rộng.", status: "not-started", stack: "r3f" },
    ],
  },
  {
    id: 5,
    title: "Hiệu năng (Điểm cộng JD)",
    description: "Đo đạc, tối ưu hóa Draw Calls, InstancedMesh, quản lý bộ nhớ và kiểm thử trên mobile.",
    week: 4,
    status: "not-started",
    lessons: [
      { id: "5-1", moduleNumber: 5, lessonNumber: "5.1", title: "Đo đạc hiệu năng với r3f-perf & Spector.js", subtitle: "Draw calls, Triangles, GPU Memory", description: "Đo lường các chỉ số hiệu năng trước và sau tối ưu.", status: "not-started", stack: "r3f" },
      { id: "5-2", moduleNumber: 5, lessonNumber: "5.2", title: "InstancedMesh & BatchedMesh", subtitle: "Giảm hàng ngàn Draw calls về 1", description: "Vẽ 10.000 vật thể cùng lúc với 1 draw call duy nhất.", status: "not-started", stack: "r3f" },
      { id: "5-3", moduleNumber: 5, lessonNumber: "5.3", title: "Tối ưu hóa Model & Textures (Meshopt / KTX2)", subtitle: "Nén texture GPU và tối ưu đa giác", description: "Sử dụng KTX2 GPU textures và Meshopt giảm tải băng thông bộ nhớ.", status: "not-started", stack: "r3f" },
      { id: "5-4", moduleNumber: 5, lessonNumber: "5.4", title: "Render on Demand (frameloop='demand')", subtitle: "Tiết kiệm 99% pin cho scene tĩnh", description: "Chỉ vẽ lại khi có tương tác chuột hoặc thay đổi state.", status: "not-started", stack: "r3f" },
      { id: "5-5", moduleNumber: 5, lessonNumber: "5.5", title: "Quản lý bộ nhớ & Dispose trong R3F", subtitle: "Tránh memory leak trong SPA", description: "Cách R3F tự động dispose và các trường hợp ngoại lệ cần xử lý thủ công.", status: "not-started", stack: "r3f" },
      { id: "5-6", moduleNumber: 5, lessonNumber: "5.6", title: "Tối ưu hóa cho Mobile", subtitle: "DPR trần, shader precision, frustum culling", description: "Chiến lược tối ưu riêng biệt giúp WebGL chạy 60fps mượt trên smartphone.", status: "not-started", stack: "r3f" },
    ],
  },
  {
    id: 6,
    title: "Hiệu ứng & Hoàn thiện",
    description: "Post-processing, Shaders, Particles và hiệu ứng Scroll 3D để tạo sản phẩm ấn tượng.",
    week: 5,
    status: "not-started",
    lessons: [
      { id: "6-1", moduleNumber: 6, lessonNumber: "6.1", title: "Particle Systems (Points)", subtitle: "Bụi ngân hà và hiệu ứng hạt", description: "Sử dụng THREE.Points và Float32Array vị trí tùy biến.", status: "not-started", stack: "r3f" },
      { id: "6-2", moduleNumber: 6, lessonNumber: "6.2", title: "Render Targets & Mirrors", subtitle: "Kết cấu hiển thị động", description: "Vẽ scene vào WebGLRenderTarget làm gương phản chiếu và camera phụ.", status: "not-started", stack: "r3f" },
      { id: "6-3", moduleNumber: 6, lessonNumber: "6.3", title: "Post-processing cơ bản (@react-three/postprocessing)", subtitle: "Bloom, Vignette, Chromatic Aberration", description: "Nâng tầm đồ họa với bộ lọc xử lý hình ảnh sau render.", status: "not-started", stack: "r3f" },
      { id: "6-4", moduleNumber: 6, lessonNumber: "6.4", title: "Shader Custom (GLSL / TSL)", subtitle: "Tùy biến ShaderMaterial", description: "Viết vertex và fragment shader tạo hiệu ứng sóng nước và năng lượng.", status: "not-started", stack: "r3f" },
      { id: "6-5", moduleNumber: 6, lessonNumber: "6.5", title: "Scroll-based 3D Animation (drei ScrollControls)", subtitle: "Kể câu chuyện 3D theo thanh cuộn", description: "Điều khiển camera và model chuyển động mượt theo cuộn trang người dùng.", status: "not-started", stack: "r3f" },
      { id: "6-6", moduleNumber: 6, lessonNumber: "6.6", title: "Hoàn thiện Portfolio Showcase", subtitle: "Sản phẩm thực tế chứng minh năng lực", description: "Đóng gói toàn bộ showcase, tối ưu SEO, hiệu năng và deploy công khai.", status: "not-started", stack: "r3f" },
    ],
  },
];
