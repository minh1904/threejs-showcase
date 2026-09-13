/**
 * Chủ đề sáng/tối. Nguồn sự thật là class `dark` trên <html> (xem
 * `@custom-variant dark` và bảng token trong `src/app/globals.css`); localStorage
 * chỉ lưu lựa chọn của người dùng để khôi phục ở lần vào sau.
 */

export const THEME_STORAGE_KEY = 'threejs-showcase:theme';

/** `system` nghĩa là đi theo `prefers-color-scheme` của hệ điều hành. */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Chạy đồng bộ trong <head> trước khi trang được vẽ, nếu không sẽ chớp một
 * nhịp sai màu. Viết thành chuỗi vì đây là script nội tuyến, không phải module.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var m=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(m!=='light'&&m!=='dark')m='system';
var dark=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',dark);
document.documentElement.setAttribute('data-theme-mode',m);
}catch(e){}})();`;

function root(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}

export function getThemeMode(): ThemeMode {
  const mode = root()?.getAttribute('data-theme-mode');
  return mode === 'light' || mode === 'dark' ? mode : 'system';
}

/** Chủ đề đang thực sự hiển thị — đã quy đổi `system` thành sáng hoặc tối. */
export function getResolvedTheme(): 'light' | 'dark' {
  return root()?.classList.contains('dark') ? 'dark' : 'light';
}

export function setThemeMode(mode: ThemeMode): void {
  const element = root();
  if (!element) return;

  const dark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  element.classList.toggle('dark', dark);
  element.setAttribute('data-theme-mode', mode);

  try {
    if (mode === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  } catch {
    /* localStorage bị chặn — chủ đề vẫn đổi, chỉ là không nhớ được. */
  }
}

/** Đổi qua lại giữa sáng và tối, lấy mốc là chủ đề đang hiển thị. */
export function toggleTheme(): 'light' | 'dark' {
  const next = getResolvedTheme() === 'dark' ? 'light' : 'dark';
  setThemeMode(next);
  return next;
}

/**
 * Đọc lựa chọn đã lưu và áp lại lên <html>.
 *
 * Cần dùng vì ở chế độ dev, Strict Mode remount một lần và React đặt lại các
 * thuộc tính của <html> về đúng những gì có trong JSX — xoá mất class do inline
 * script đặt. Ở bản production đây chỉ là thao tác lặp vô hại.
 */
export function applyStoredTheme(): void {
  let mode: ThemeMode = 'system';

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') mode = stored;
  } catch {
    /* localStorage bị chặn — coi như đi theo hệ điều hành. */
  }

  setThemeMode(mode);
}
