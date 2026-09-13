'use client';

import React from 'react';
import { getResolvedTheme } from './theme';

/**
 * Chủ đề đang hiển thị, dưới dạng state của React.
 *
 * Nguồn sự thật vẫn là class trên <html> (nút đổi chủ đề sửa DOM trực tiếp để
 * không phải bọc cả cây bằng context), nên ở đây theo dõi bằng MutationObserver.
 * Chỉ cần khi giá trị màu phải đi vào chỗ CSS không với tới — ví dụ
 * `scene.background` của Three.js.
 */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/** HTML dựng sẵn trên server luôn ở chủ đề sáng; inline script mới đổi sang tối. */
function getServerSnapshot(): 'light' {
  return 'light';
}

export function useResolvedTheme(): 'light' | 'dark' {
  return React.useSyncExternalStore(subscribe, getResolvedTheme, getServerSnapshot);
}
