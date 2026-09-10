'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Badge, Panel, PanelSection, Segmented, Slider } from '@/toolcraft/ui';

type ExperimentMode = 'standard' | 'camera-z0' | 'z-fighting' | 'fov-demo' | 'no-setsize';

const EXPERIMENTS: readonly {
  value: ExperimentMode;
  label: string;
  title: string;
  hint: string;
  tone: 'neutral' | 'danger' | 'warn' | 'info';
}[] = [
  {
    value: 'standard',
    label: 'Chuẩn',
    title: 'Chuẩn bài tập 1.1',
    hint: 'Camera z=3, FOV=75°, một khối hộp MeshBasicMaterial.',
    tone: 'neutral',
  },
  {
    value: 'camera-z0',
    label: 'Z = 0',
    title: 'camera.position.z = 0',
    hint: 'Camera nằm trong khối hộp — hình biến mất do bị near plane cắt.',
    tone: 'danger',
  },
  {
    value: 'z-fighting',
    label: 'Z-fight',
    title: 'Z-fighting (near/far cực đoan)',
    hint: 'near=0.0001, far=1.000.000 với hai mặt phẳng sát nhau.',
    tone: 'warn',
  },
  {
    value: 'fov-demo',
    label: 'FOV',
    title: 'Khảo sát frustum',
    hint: 'Kéo FOV và Camera Z để thấy updateProjectionMatrix() tính lại frustum.',
    tone: 'info',
  },
  {
    value: 'no-setsize',
    label: 'No size',
    title: 'Bỏ renderer.setSize()',
    hint: 'Canvas rơi về độ phân giải mặc định 300×150 của WebGL.',
    tone: 'warn',
  },
];

export function Lesson1_1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [experiment, setExperiment] = useState<ExperimentMode>('standard');
  const [fov, setFov] = useState<number>(75);
  const [cameraZ, setCameraZ] = useState<number>(3);

  const activeExperiment = EXPERIMENTS.find((e) => e.value === experiment) ?? EXPERIMENTS[0];

  // Trạng thái hiển thị console mô phỏng được tính toán trực tiếp từ state
  const getStatusText = () => {
    switch (experiment) {
      case 'standard':
        return '[standard] render 1 frame tĩnh · fov=75° · camera.z=3.00 · near=0.1 · far=1000';
      case 'camera-z0':
        return '[camera-z0] camera nằm trong khối hộp (0,0,0) → clipping qua near plane';
      case 'z-fighting':
        return '[z-fighting] near=0.0001 · far=1e6 · hai plane z=0 và z=0.00001 tranh chấp depth buffer';
      case 'no-setsize':
        return '[no-setsize] bỏ renderer.setSize() → canvas nhận mặc định 300×150';
      case 'fov-demo':
        return `[fov-demo] fov=${fov}° · camera.z=${cameraZ.toFixed(2)} · frustum tính lại qua updateProjectionMatrix()`;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Tạo Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

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
      const planeMat1 = new THREE.MeshBasicMaterial({ color: 0xea733a, side: THREE.DoubleSide });
      const plane1 = new THREE.Mesh(planeGeo1, planeMat1);
      plane1.position.z = 0;
      scene.add(plane1);

      const planeGeo2 = new THREE.PlaneGeometry(1.6, 1.6);
      const planeMat2 = new THREE.MeshBasicMaterial({ color: 0x0c8ce9, side: THREE.DoubleSide });
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
        color: experiment === 'camera-z0' ? 0x9149f5 : 0x0c8ce9,
        wireframe: false,
      });

      // Tạo thêm viền wireframe mờ để dễ nhìn hình khối 3D dù chỉ dùng MeshBasicMaterial
      const wireframeGeo = new THREE.WireframeGeometry(boxGeometry);
      const wireframeMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
      });
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

  function resetControls(): void {
    setExperiment('standard');
    setFov(75);
    setCameraZ(3);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[color:color-mix(in_oklab,var(--border)_35%,transparent)] bg-[color:var(--background)] lg:flex-row">
      {/* Viewport */}
      <div className="relative min-h-[420px] flex-1">
        <div ref={containerRef} className="absolute inset-0" />

        {/* HUD trên canvas */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="font-mono backdrop-blur-md">
            {activeExperiment.title}
          </Badge>
          {activeExperiment.tone === 'danger' ? (
            <Badge variant="destructive" className="font-mono">
              clipped
            </Badge>
          ) : null}
          {activeExperiment.tone === 'warn' ? (
            <Badge variant="warning" className="font-mono">
              artifact
            </Badge>
          ) : null}
        </div>

        {/* Status bar kiểu console */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-md border border-[color:color-mix(in_oklab,var(--border)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--popover)_80%,transparent)] px-3 py-1.5 backdrop-blur-md">
          <span className="truncate font-mono text-2xs text-[color:var(--muted-foreground)]">
            {getStatusText()}
          </span>
          <span className="shrink-0 font-mono text-2xs tracking-wider text-[color:var(--accent)] uppercase">
            live
          </span>
        </div>
      </div>

      {/* Panel điều khiển */}
      <Panel
        title="Camera & Renderer"
        className="max-h-none w-full shrink-0 rounded-none border-0 border-t border-[color:color-mix(in_oklab,var(--border)_35%,transparent)] lg:w-[300px] lg:border-t-0 lg:border-l"
        onResetControls={resetControls}
      >
        <PanelSection title="Kịch bản thử phá" description={activeExperiment.hint}>
          <Segmented
            ariaLabel="Chọn kịch bản thí nghiệm"
            name="experiment"
            options={EXPERIMENTS.map((e) => ({ label: e.label, value: e.value }))}
            value={experiment}
            onValueChange={(value) => setExperiment(value as ExperimentMode)}
          />
        </PanelSection>

        <PanelSection title="Frustum" spacing="technical">
          <Slider
            name="FOV"
            unit="°"
            min={10}
            max={140}
            step={1}
            value={fov}
            baseValue={75}
            disabled={experiment !== 'fov-demo'}
            onValueChange={(value) => setFov(value)}
          />
          <Slider
            name="Camera Z"
            min={0}
            max={12}
            step={0.05}
            value={cameraZ}
            baseValue={3}
            disabled={experiment !== 'fov-demo'}
            onValueChange={(value) => setCameraZ(value)}
          />
          {experiment !== 'fov-demo' ? (
            <p className="text-2xs text-[color:var(--muted-foreground)]">
              Chuyển sang kịch bản <span className="font-mono text-[color:var(--foreground)]">FOV</span> để mở
              khoá hai slider này.
            </p>
          ) : null}
        </PanelSection>

        <PanelSection title="Tham số đang áp dụng" spacing="technical">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-2xs">
            {[
              ['near', experiment === 'z-fighting' ? '0.0001' : '0.1'],
              ['far', experiment === 'z-fighting' ? '1000000' : '1000'],
              ['fov', experiment === 'fov-demo' ? String(fov) : '75'],
              ['pixelRatio', 'min(dpr, 2)'],
            ].map(([key, value]) => (
              <React.Fragment key={key}>
                <dt className="text-[color:var(--muted-foreground)]">{key}</dt>
                <dd className="text-right text-[color:var(--foreground)]">{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </PanelSection>
      </Panel>
    </div>
  );
}
