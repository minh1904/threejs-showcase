import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CURRICULUM } from '@/data/curriculum';
import { Lesson1_1 } from '@/components/lessons/module-1/Lesson1_1';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const params: { id: string }[] = [];
  CURRICULUM.forEach((mod) => {
    mod.lessons.forEach((les) => {
      params.push({ id: les.id });
    });
  });
  return params;
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;

  const allLessons = CURRICULUM.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === id);
  if (currentIndex === -1) {
    notFound();
  }

  const currentLesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : undefined;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : undefined;

  const parentModule = CURRICULUM.find((m) => m.id === currentLesson?.moduleNumber);
  const currentModuleTitle = parentModule ? parentModule.title : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header / Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Lộ trình Three.js</span>
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-xs font-mono font-medium text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-800/40">
              Module {currentLesson.moduleNumber} · Bài {currentLesson.lessonNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {prevLesson && (
              <Link
                href={`/lessons/${prevLesson.id}`}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors hidden sm:inline-flex items-center gap-1.5"
              >
                ← Bài {prevLesson.lessonNumber}
              </Link>
            )}
            {nextLesson && (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors hidden sm:inline-flex items-center gap-1.5"
              >
                Bài {nextLesson.lessonNumber} →
              </Link>
            )}
            <a
              href="https://github.com/minh1904/threejs-showcase"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col gap-10">
        {/* Lesson Header Banner */}
        <div className="flex flex-col gap-3 pb-6 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              {currentModuleTitle}
            </span>
            <span className="text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Đã hoàn thành
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-950/80 text-blue-400 border border-blue-800/50">
              Vanilla Three.js
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {currentLesson.lessonNumber} — {currentLesson.title}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-4xl">
            {currentLesson.description}
          </p>
        </div>

        {/* Dynamic Lesson Body */}
        {id === '1-1' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 3D Interactive Canvas and Lab */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Lesson1_1 />
            </div>

            {/* Right Column: Code Explanation & Interview Knowledge */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Code Snippet */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-xs text-slate-400">Lesson1_1.vanilla.ts</span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    Static Single Frame
                  </span>
                </div>
                <div className="p-4 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed max-h-[380px]">
                  <pre>{`// 1. Tạo Scene (Container chứa cây scene graph)
const scene = new THREE.Scene();

// 2. Tạo PerspectiveCamera(fov, aspect, near, far)
const camera = new THREE.PerspectiveCamera(
  75,                 // FOV dọc (Field of view)
  width / height,     // Tỉ lệ khung hình aspect ratio
  0.1,                // Mặt phẳng cắt gần (near plane)
  1000                // Mặt phẳng cắt xa (far plane)
);
camera.position.z = 3;

// 3. Tạo WebGLRenderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 4. Mesh = Geometry + Material
const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const material = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 5. Render đúng MỘT khung hình (chưa cần animation loop)
renderer.render(scene, camera);

// 6. Dọn dẹp bộ nhớ GPU khi unmount (Tránh Memory Leak trong SPA)
return () => {
  geometry.dispose();
  material.dispose();
  renderer.dispose();
  container.removeChild(renderer.domElement);
};`}</pre>
                </div>
              </div>

              {/* Deep Dive & Interview FAQ */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Kiến thức phỏng vấn trọng tâm
                </h3>

                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="font-semibold text-indigo-300 mb-1">
                      1. Vì sao near quá nhỏ gây ra Z-fighting?
                    </div>
                    <p className="text-slate-400">
                      Depth buffer (Z-buffer) của WebGL sử dụng ánh xạ phi tuyến tính (non-linear logarithmic). Đa số
                      bit chính xác của depth buffer tập trung cực mạnh sát gần mặt phẳng <code>near</code>. Khi đặt{' '}
                      <code>near = 0.0001</code> và <code>far = 1.000.000</code>, độ phân giải chiều sâu ở khoảng cách xa
                      bị nén mỏng, khiến 2 mặt phẳng gần nhau có cùng giá trị z-depth trong bộ đệm và nhấp nháy tranh nhau vẽ.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="font-semibold text-indigo-300 mb-1">
                      2. Vòng đời dọn dẹp WebGL trong React SPA
                    </div>
                    <p className="text-slate-400">
                      Garbage Collector (GC) của JavaScript <strong>không thể</strong> tự động giải phóng bộ nhớ GPU (VRAM).
                      Nếu chỉ xóa thẻ canvas khỏi DOM mà không gọi <code>geometry.dispose()</code>,{' '}
                      <code>material.dispose()</code> và <code>renderer.dispose()</code>, context WebGL và buffer dữ liệu đỉnh
                      vẫn tồn tại trong VRAM, gây tràn bộ nhớ sau vài lần chuyển trang.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="font-semibold text-indigo-300 mb-1">
                      3. Vì sao phải chặn Pixel Ratio ở mức 2?
                    </div>
                    <p className="text-slate-400">
                      Số lượng pixel GPU cần tính toán tỉ lệ theo <strong>bình phương</strong> của DPR{' '}
                      (ví dụ DPR=3 màn Retina 3x đòi hỏi GPU render gấp 9 lần so với DPR=1). Giới hạn{' '}
                      <code>Math.min(window.devicePixelRatio, 2)</code> đảm bảo độ nét chuẩn mắt người mà không làm nghẽn GPU trên điện thoại cao cấp.
                    </p>
                  </div>
                </div>

                {/* Checkpoint checklist */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-200 mb-2">✅ Checkpoint bài 1.1:</div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Hiểu rõ vai trò của bộ ba: Scene, PerspectiveCamera, WebGLRenderer
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Nắm vững cách tính toán frustum của PerspectiveCamera
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Nắm chắc cơ chế dispose để không leak bộ nhớ trong React
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/50 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-xl font-mono font-bold">
              {currentLesson.lessonNumber}
            </div>
            <h2 className="text-xl font-bold text-white">Bài tập {currentLesson.lessonNumber} sắp ra mắt</h2>
            <p className="text-slate-400 text-sm max-w-md">
              Bài học này nằm trong lộ trình kế tiếp ({currentModuleTitle}). Bạn có thể quay lại Bài 1.1 để thử nghiệm tương tác Three.js.
            </p>
            <Link
              href="/lessons/1-1"
              className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              Về bài 1.1 — Scene, Camera, Renderer
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        threejs-showcase · Học Three.js chuẩn chỉnh từ Vanilla đến React Three Fiber
      </footer>
    </div>
  );
}
