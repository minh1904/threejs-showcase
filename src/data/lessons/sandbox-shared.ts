import type { SandboxSpec } from './types';

/**
 * CSS dùng chung cho mọi sandbox: canvas chiếm trọn khung preview, nền tối
 * đồng bộ với giao diện trang. Được đánh dấu `hidden` nên không hiện trong
 * editor — người học chỉ tập trung vào file code chính.
 */
const SHARED_STYLES = `* { margin: 0; box-sizing: border-box; }

body {
  background: #0a0a0a;
  color: #e5e5e5;
  font-family: ui-monospace, monospace;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

canvas { display: block; }`;

/** Phiên bản three dùng thống nhất toàn bộ lộ trình — trùng với package.json. */
export const THREE_VERSION = '0.185.1';

/**
 * R3F 9 yêu cầu React 19, trong khi template `vite-react` của Sandpack ghim
 * React 18 — nên phải ghi đè react/react-dom ở đây, nếu không sandbox sẽ lỗi
 * ngay khi mount Canvas.
 */
export const R3F_DEPENDENCIES = {
  three: THREE_VERSION,
  '@react-three/fiber': '9.7.0',
  '@react-three/drei': '10.7.8',
  react: '19.2.0',
  'react-dom': '19.2.0',
};

/**
 * Sandbox Three.js thuần. Template `vite` (Nodebox) chứ không phải
 * `vanilla-ts`: bundler parcel của template kia build three 0.185 không ổn định.
 * Entry của template vite là /index.js và /index.html đã có sẵn `<div id="app">`
 * cùng thẻ script — tuyệt đối không ghi đè file đó.
 */
export function vanillaSandbox(
  code: string,
  options: { dependencies?: Record<string, string>; height?: number } = {}
): SandboxSpec {
  return {
    template: 'vite',
    entryFile: '/index.js',
    height: options.height ?? 460,
    dependencies: { three: THREE_VERSION, ...options.dependencies },
    files: {
      '/styles.css': { code: SHARED_STYLES, hidden: true },
      '/index.js': { code },
    },
  };
}

/**
 * Sandbox React Three Fiber. Dùng template `vite-react` — entry /App.jsx,
 * đã có sẵn /index.jsx gắn React vào #root.
 */
export function r3fSandbox(
  appCode: string,
  options: { dependencies?: Record<string, string>; height?: number; extraFiles?: Record<string, string> } = {}
): SandboxSpec {
  const extra = Object.fromEntries(
    Object.entries(options.extraFiles ?? {}).map(([path, code]) => [path, { code }])
  );

  return {
    template: 'vite-react',
    entryFile: '/App.jsx',
    height: options.height ?? 460,
    dependencies: { ...R3F_DEPENDENCIES, ...options.dependencies },
    files: {
      '/styles.css': { code: SHARED_STYLES.replace('#app', '#root'), hidden: true },
      '/App.jsx': { code: appCode },
      ...extra,
    },
  };
}
