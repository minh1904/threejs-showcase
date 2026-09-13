'use client';

import React from 'react';
import { CURRICULUM } from '@/data/curriculum';

/**
 * Tiến độ học do người dùng tự tích, lưu trong localStorage của máy họ.
 *
 * `status` trong `curriculum.ts` chỉ còn là mốc khởi đầu cho lần mở trang đầu
 * tiên; sau đó bản đồ đã lưu là nguồn sự thật, nhờ vậy bỏ tích một bài từng khai
 * báo `completed` vẫn giữ được sau khi tải lại.
 *
 * Dùng `useSyncExternalStore` với một ảnh chụp riêng cho server (mốc khởi đầu)
 * nên HTML render sẵn và lần hydrate khớp nhau; React tự render lại với dữ liệu
 * thật ngay sau khi mount.
 */

const STORAGE_KEY = 'threejs-showcase:lesson-progress:v1';

export type LessonProgress = Readonly<Record<string, boolean>>;

const LESSON_IDS = new Set(CURRICULUM.flatMap((mod) => mod.lessons).map((les) => les.id));

const SEED: LessonProgress = Object.freeze(
  Object.fromEntries(
    CURRICULUM.flatMap((mod) => mod.lessons)
      .filter((les) => les.status === 'completed')
      .map((les) => [les.id, true] as const)
  )
);

let snapshot: LessonProgress = SEED;
let loaded = false;
const listeners = new Set<() => void>();

/** Bỏ qua khoá lạ và giá trị lạ — dữ liệu cũ trong localStorage không được phá trang. */
function normalize(raw: unknown): LessonProgress | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const entries = Object.entries(raw as Record<string, unknown>).filter(
    ([id, done]) => LESSON_IDS.has(id) && typeof done === 'boolean'
  ) as [string, boolean][];

  return Object.freeze(Object.fromEntries(entries));
}

function ensureLoaded(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return;

    const parsed = normalize(JSON.parse(raw));
    if (parsed) snapshot = parsed;
  } catch {
    /* JSON hỏng hoặc localStorage bị chặn — giữ mốc khởi đầu. */
  }
}

function emit(next: LessonProgress): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function persist(next: LessonProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Hết quota hoặc chế độ riêng tư — tiến độ vẫn đúng trong phiên này. */
  }
}

function subscribe(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);

  // Tích ở tab này, tab kia đang mở cũng cập nhật theo.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;

    try {
      const parsed = event.newValue === null ? SEED : normalize(JSON.parse(event.newValue));
      if (parsed) emit(parsed);
    } catch {
      /* Tab kia ghi dữ liệu hỏng — bỏ qua, giữ nguyên trạng thái hiện tại. */
    }
  };

  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): LessonProgress {
  ensureLoaded();
  return snapshot;
}

function getServerSnapshot(): LessonProgress {
  return SEED;
}

export function setLessonDone(id: string, done: boolean): void {
  ensureLoaded();
  if (Boolean(snapshot[id]) === done) return;

  const next = Object.freeze({ ...snapshot, [id]: done });
  persist(next);
  emit(next);
}

export function toggleLessonDone(id: string): void {
  ensureLoaded();
  setLessonDone(id, !snapshot[id]);
}

/** Xoá sạch tiến độ và quay lại mốc khai báo trong `curriculum.ts`. */
export function resetLessonProgress(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Không xoá được thì vẫn reset trong bộ nhớ. */
  }
  emit(SEED);
}

export function useLessonProgress(): LessonProgress {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useLessonDone(id: string): boolean {
  return Boolean(useLessonProgress()[id]);
}

/** Số bài đã học trong một danh sách bài bất kỳ. */
export function countDone(progress: LessonProgress, ids: readonly string[]): number {
  return ids.reduce((total, id) => (progress[id] ? total + 1 : total), 0);
}
