'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type ExperimentMode = 'standard' | 'camera-z0' | 'z-fighting' | 'fov-demo' | 'no-setsize';

export function Lesson1_1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [experiment, setExperiment] = useState<ExperimentMode>('standard');
  const [fov, setFov] = useState<number>(75);
  const [cameraZ, setCameraZ] = useState<number>(3);

  // Trạng thái hiển thị console mô phỏng được tính toán trực tiếp từ state
  const getStatusText = () => {
    switch (experiment) {
      case 'standard':
        return `[Standard] Render 1 frame tĩnh: FOV=75°, Camera.Z=3.00, Near=0.1, Far=1000.`;
      case 'camera-z0':
        return `[Camera Z=0] Camera nằm trong khối hộp (0,0,0) -> Bị clipping qua near plane (Mất hình).`;
      case 'z-fighting':
        return `[Z-Fighting] Near=0.0001, Far=1.000.000. Hai mặt phẳng z=0 và z=0.00001 tranh chấp depth buffer.`;
      case 'no-setsize':
        return `[No setSize] Đã bỏ qua renderer.setSize() -> Canvas nhận độ phân giải mặc định 300x150 của WebGL.`;
      case 'fov-demo':
        return `[FOV Demo] FOV=${fov}°, Camera.Z=${cameraZ.toFixed(2)}. frustum được tính toán lại qua camera.updateProjectionMatrix().`;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Tạo Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900

    // 2. Kích thước container
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;
    const aspect = width / height;

    // Cấu hình tham số camera theo experiment
    let near = 0.1;
    let far = 1000;
    let effectiveFov = fov;
    let targetZ = cameraZ;

    if (experiment === 'camera-z0') {
      targetZ = 0;
    } else if (experiment === 'z-fighting') {
      // z-fighting: near cực nhỏ và far cực lớn làm suy giảm độ chính xác của depth buffer (z-buffer)
      near = 0.0001;
      far = 1000000;
      targetZ = 2.5;
    } else if (experiment === 'fov-demo') {
      effectiveFov = fov;
      targetZ = cameraZ;
    } else if (experiment === 'standard') {
      targetZ = 3;
      effectiveFov = 75;
      near = 0.1;
      far = 1000;
    }

    // 3. Tạo PerspectiveCamera(fov, aspect, near, far)
    const camera = new THREE.PerspectiveCamera(effectiveFov, aspect, near, far);
    camera.position.set(0, 0, targetZ);
    camera.lookAt(0, 0, 0);

    // 4. Tạo WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (experiment !== 'no-setsize') {
      renderer.setSize(width, height);
    }

    // Gắn canvas vào DOM
    container.replaceChildren(renderer.domElement);

    // 5. Thêm Mesh
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    if (experiment === 'z-fighting') {
      // Dựng 2 mặt phẳng Plane cùng tọa độ z=0 và z=0.00001 cực sát nhau để gây z-fighting
      const planeGeo1 = new THREE.PlaneGeometry(2, 2);
      const planeMat1 = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }); // Đỏ
      const plane1 = new THREE.Mesh(planeGeo1, planeMat1);
      plane1.position.z = 0;
      scene.add(plane1);

      const planeGeo2 = new THREE.PlaneGeometry(1.6, 1.6);
      const planeMat2 = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide }); // Xanh dương
      const plane2 = new THREE.Mesh(planeGeo2, planeMat2);
      plane2.position.z = 0.00001; // Cực sát nhau
      scene.add(plane2);

      geometriesToDispose.push(planeGeo1, planeGeo2);
      materialsToDispose.push(planeMat1, planeMat2);
    } else {
      // Dựng 1 khối hộp duy nhất chuẩn bài 1.1
      const boxGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      // MeshBasicMaterial không cần đèn chiếu
      const boxMaterial = new THREE.MeshBasicMaterial({
        color: experiment === 'camera-z0' ? 0xec4899 : 0x6366f1,
        wireframe: false,
      });

      // Tạo thêm viền wireframe mờ để dễ nhìn hình khối 3D dù chỉ dùng MeshBasicMaterial
      const wireframeGeo = new THREE.WireframeGeometry(boxGeometry);
      const wireframeMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true });
      const wireframeLine = new THREE.LineSegments(wireframeGeo, wireframeMat);

      const cube = new THREE.Mesh(boxGeometry, boxMaterial);
      cube.rotation.x = 0.4;
      cube.rotation.y = 0.6;
      cube.add(wireframeLine);
      scene.add(cube);

      geometriesToDispose.push(boxGeometry, wireframeGeo);
      materialsToDispose.push(boxMaterial, wireframeMat);
    }

    // 6. Render đúng MỘT khung hình (Static Render)
    renderer.render(scene, camera);

    // Xử lý resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix(); // Cực kỳ quan trọng: tính toán lại frustum
      renderer.setSize(newWidth, newHeight);
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);

    // 7. Cleanup dọn dẹp bộ nhớ khi unmount hoặc đổi tham số
    return () => {
      window.removeEventListener('resize', handleResize);
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [experiment, fov, cameraZ]);

  return (
    <div className="flex flex-col gap-6">
      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col justify-between">
        <div ref={containerRef} className="w-full h-full" />

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-slate-900/90 text-indigo-400 border border-indigo-500/30 backdrop-blur-md">
            Renderer: WebGLRenderer (Single Frame)
          </span>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
            Status: Active
          </span>
          {experiment === 'camera-z0' && (
            <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-rose-950/90 text-rose-400 border border-rose-500/50 backdrop-blur-md animate-pulse">
              Camera.Z = 0 (Bị clip/Mất hình)
            </span>
          )}
          {experiment === 'z-fighting' && (
            <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-amber-950/90 text-amber-400 border border-amber-500/50 backdrop-blur-md animate-pulse">
              Z-Fighting (Suy giảm Depth Buffer)
            </span>
          )}
        </div>

        {/* Console Log Bar */}
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2 font-mono text-xs text-slate-300 flex items-center justify-between">
          <span className="truncate">{getStatusText()}</span>
          <span className="text-indigo-400 text-[10px] uppercase tracking-wider shrink-0 ml-2">Console Live</span>
        </div>
      </div>

      {/* Lab Thử Phá Cho Hiểu */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              Thử phá cho hiểu (Interactive Lab)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Thực hành các kịch bản lỗi kinh điển trong Three.js để hiểu bản chất toán học &amp; đồ họa.
            </p>
          </div>
          <button
            onClick={() => {
              setExperiment('standard');
              setFov(75);
              setCameraZ(3);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors self-start sm:self-auto cursor-pointer"
          >
            ↺ Đặt lại chuẩn (Standard)
          </button>
        </div>

        {/* Experiment Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setExperiment('standard');
              setCameraZ(3);
              setFov(75);
            }}
            className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
              experiment === 'standard'
                ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-lg shadow-indigo-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-indigo-300">1. Chuẩn bài tập 1.1</div>
            <div className="text-[11px] text-slate-400 mt-1">Camera z=3, FOV=75°, 1 hộp MeshBasicMaterial</div>
          </button>

          <button
            onClick={() => {
              setExperiment('camera-z0');
              setCameraZ(0);
            }}
            className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
              experiment === 'camera-z0'
                ? 'bg-rose-600/20 border-rose-500/80 text-white shadow-lg shadow-rose-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-rose-400">2. Đặt camera.position.z = 0</div>
            <div className="text-[11px] text-slate-400 mt-1">Quan sát mất hình do camera nằm trong vật &amp; near plane</div>
          </button>

          <button
            onClick={() => {
              setExperiment('z-fighting');
            }}
            className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
              experiment === 'z-fighting'
                ? 'bg-amber-600/20 border-amber-500/80 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-amber-400">3. Z-Fighting (near/far cực đoan)</div>
            <div className="text-[11px] text-slate-400 mt-1">near=0.0001 &amp; far=1.000.000 với 2 mặt phẳng sát nhau</div>
          </button>

          <button
            onClick={() => {
              setExperiment('no-setsize');
            }}
            className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
              experiment === 'no-setsize'
                ? 'bg-cyan-600/20 border-cyan-500/80 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-semibold text-cyan-400">4. Bỏ renderer.setSize()</div>
            <div className="text-[11px] text-slate-400 mt-1">Xem kích thước mặc định 300x150 của thẻ canvas</div>
          </button>
        </div>

        {/* Dynamic Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Slider FOV */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Góc nhìn FOV (Field of View)</span>
              <span className="font-mono text-indigo-400 font-semibold">{fov}°</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              step="1"
              value={fov}
              onChange={(e) => {
                setFov(Number(e.target.value));
                if (experiment !== 'fov-demo' && experiment !== 'standard') {
                  setExperiment('fov-demo');
                }
              }}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20° (Telephoto/Hẹp)</span>
              <span>75° (Mặc định)</span>
              <span>120° (Fish-eye/Rộng)</span>
            </div>
          </div>

          {/* Slider Camera Z */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Vị trí Camera Z (Khoảng cách)</span>
              <span className="font-mono text-indigo-400 font-semibold">{cameraZ.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.1"
              value={cameraZ}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCameraZ(val);
                if (val === 0) {
                  setExperiment('camera-z0');
                } else if (experiment === 'camera-z0') {
                  setExperiment('standard');
                }
              }}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (Tâm gốc)</span>
              <span>3.0 (Chuẩn)</span>
              <span>8.0 (Xa)</span>
            </div>
          </div>
        </div>

        {/* Explanation Card based on active experiment */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 text-xs leading-relaxed text-slate-300">
          {experiment === 'standard' && (
            <div>
              <span className="font-semibold text-indigo-400">Giải thích chuẩn:</span> Scene chứa 1{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">Mesh</code> gồm{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">BoxGeometry</code> và{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">MeshBasicMaterial</code>. Camera đặt ở{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">z = 3</code> hướng về tâm gốc{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">(0, 0, 0)</code>. Render đúng 1 khung hình
              duy nhất mà không cần vòng lặp animation.
            </div>
          )}
          {experiment === 'camera-z0' && (
            <div>
              <span className="font-semibold text-rose-400">Vì sao mất hình khi z = 0?</span> Khối hộp có kích thước 1.2
              được đặt ở gốc tọa độ <code className="bg-slate-800 px-1.5 py-0.5 rounded text-rose-300">(0,0,0)</code> nên
              trải dài từ <code className="bg-slate-800 px-1 py-0.5 rounded">-0.6</code> đến{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded">+0.6</code> trên trục Z. Khi đặt camera tại{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded">z = 0</code>, camera nằm trọn bên trong khối hộp. Do{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded">MeshBasicMaterial</code> mặc định chỉ render mặt trước
              (FrontSide) và các đỉnh nằm sau mặt phẳng cắt gần (<code className="bg-slate-800 px-1 py-0.5 rounded">near=0.1</code>),
              toàn bộ hình học bị loại bỏ (clipping).
            </div>
          )}
          {experiment === 'z-fighting' && (
            <div>
              <span className="font-semibold text-amber-400">Bản chất Z-Fighting là gì?</span> GPU dùng Depth Buffer
              (Z-buffer) để xác định pixel nào ở trước pixel nào. Khi tỉ lệ{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">far / near = 10.000.000.000</code> quá lớn,
              độ chính xác số thực (floating point precision) của depth buffer bị phân tán mỏng, khiến GPU không thể phân
              biệt 2 mặt phẳng cách nhau <code className="bg-slate-800 px-1 py-0.5 rounded">0.00001</code> đơn vị, dẫn đến
              hiện tượng nhấp nháy pixel bề mặt.
            </div>
          )}
          {experiment === 'no-setsize' && (
            <div>
              <span className="font-semibold text-cyan-400">Bỏ renderer.setSize():</span> Thẻ{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">&lt;canvas&gt;</code> HTML có kích thước mặc
              định theo đặc tả Web là <code className="bg-slate-800 px-1 py-0.5 rounded">300x150 px</code>. Nếu không gọi{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded">renderer.setSize(w, h)</code>, canvas sẽ bị vỡ nét và tỉ
              lệ khung hình (aspect ratio) bị sai lệch hoàn toàn so với container cha.
            </div>
          )}
          {experiment === 'fov-demo' && (
            <div>
              <span className="font-semibold text-indigo-400">Thay đổi FOV:</span> FOV (Field of View) là góc mở thị trường
              theo chiều dọc tính bằng độ. FOV nhỏ (20°) hoạt động như ống kính tele (phẳng hóa chiều sâu, phóng to vật thể),
              trong khi FOV lớn (120°) tạo hiệu ứng mắt cá góc siêu rộng làm biến dạng các góc mép của khối hộp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
