import React from 'react';
import Link from 'next/link';
import { CURRICULUM } from '@/data/curriculum';

export default function Home() {
  const totalLessons = CURRICULUM.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = CURRICULUM.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.status === 'completed').length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
              3D
            </div>
            <div>
              <span className="font-bold tracking-tight text-white block text-sm">threejs-showcase</span>
              <span className="text-[10px] text-slate-400 font-mono">Curriculum &amp; Interactive Lab</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/lessons/1-1"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              <span>Vào bài 1.1</span>
              <span>→</span>
            </Link>
            <a
              href="https://github.com/minh1904/threejs-showcase"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/40 text-indigo-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Lộ trình học Three.js chuẩn chỉnh từ Vanilla đến R3F
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Kinh nghiệm thực tế{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                Three.js &amp; Web 3D
              </span>
            </h1>
            <p className="mt-4 text-slate-400 text-base sm:text-lg leading-relaxed">
              Showcase tương tác gồm <strong>38 bài tập thực chiến</strong> thuộc 6 modules. Học theo triết lý:{' '}
              <span className="text-slate-200">Hiểu bản chất Three.js thuần trước khi dùng R3F</span>, kèm kịch bản
              &quot;thử phá cho hiểu&quot; phục vụ trực tiếp cho câu hỏi phỏng vấn.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-4xl">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Modules</span>
              <span className="text-2xl font-bold text-white mt-1">6 Chuyên đề</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Tổng bài tập</span>
              <span className="text-2xl font-bold text-white mt-1">{totalLessons} Bài</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Tiến độ</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1">
                {completedLessons}/{totalLessons} ({Math.round((completedLessons / totalLessons) * 100)}%)
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Stack</span>
              <span className="text-xs font-mono font-medium text-indigo-300 mt-2">three 0.185 · R3F 9</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Current Lesson */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/40 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                ✅ Đã hoàn thành
              </span>
              <span className="text-xs font-mono text-indigo-300">Module 1 · Bài 1.1</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Bài 1.1 — Scene, Camera, Renderer (Vanilla Three.js)
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trực quan hóa bộ ba cốt lõi, cơ chế render 1 frame tĩnh, dọn dẹp bộ nhớ GPU và phòng thí nghiệm tương tác
              khảo sát Z-fighting, FOV và Near/Far clipping.
            </p>
          </div>

          <Link
            href="/lessons/1-1"
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <span>Mở bài thực hành 1.1</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Curriculum Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white">Danh sách 6 Modules chi tiết</h2>
          <p className="text-xs text-slate-400">Chọn từng bài học để xem demo 3D và ghi chú phỏng vấn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURRICULUM.map((mod) => (
            <div
              key={mod.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                    Module {mod.id} · Tuần {mod.week}
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                      mod.status === 'in-progress'
                        ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                        : mod.status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {mod.status === 'in-progress'
                      ? '🟨 Đang làm'
                      : mod.status === 'completed'
                      ? '✅ Xong'
                      : '⬜ Chưa bắt đầu'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{mod.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.description}</p>
                </div>

                {/* Lesson List */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {mod.lessons.map((les) => (
                    <Link
                      key={les.id}
                      href={`/lessons/${les.id}`}
                      className="group flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-850 hover:border-slate-700 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span
                          className={`font-mono font-semibold text-[11px] ${
                            les.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {les.lessonNumber}
                        </span>
                        <span className="text-slate-300 group-hover:text-white truncate">{les.title}</span>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {les.stack === 'vanilla' ? 'Vanilla' : 'R3F'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-12 text-center text-xs text-slate-500 font-mono">
        threejs-showcase · Xây dựng bởi Văn Minh · Next.js 16 App Router · Three.js 0.185 · R3F
      </footer>
    </div>
  );
}
