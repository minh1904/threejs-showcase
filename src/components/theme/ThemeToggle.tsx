'use client';

import React from 'react';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { Button } from '@/toolcraft/ui';
import { cn } from '@/toolcraft/ui/lib/utils';
import { applyStoredTheme, getThemeMode, setThemeMode, toggleTheme } from '@/lib/theme';

// useLayoutEffect chạy trước khi vẽ, nhưng cảnh báo nếu gọi lúc render trên
// server; ở server thì không có DOM để sửa nên useEffect là đủ.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

/**
 * Nút đổi sáng/tối. Biểu tượng đổi bằng CSS (`dark:`) chứ không bằng state, nên
 * markup của server và của client giống hệt nhau — không lệch khi hydrate và
 * không chớp biểu tượng sai ở khung hình đầu.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Strict Mode ở dev remount một lần và xoá class trên <html> do inline script
  // trong layout đặt; áp lại trước khi trình duyệt vẽ.
  useIsomorphicLayoutEffect(() => {
    applyStoredTheme();
  }, []);

  // Khi người dùng chưa chọn gì, chủ đề bám theo hệ điều hành — kể cả lúc họ
  // đổi trong Cài đặt trong khi tab đang mở.
  React.useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const sync = () => {
      if (getThemeMode() === 'system') setThemeMode('system');
    };

    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <Button
      variant="outline"
      size="icon-xs"
      aria-label="Đổi giao diện sáng/tối"
      title="Đổi giao diện sáng/tối"
      className={cn('shrink-0', className)}
      onClick={() => toggleTheme()}
    >
      <SunIcon className="hidden size-3.5 dark:block" />
      <MoonIcon className="size-3.5 dark:hidden" />
    </Button>
  );
}
