'use client';

import React from 'react';
import { Checkbox } from '@/toolcraft/ui/components/primitives/checkbox';
import { cn } from '@/toolcraft/ui/lib/utils';
import { setLessonDone, useLessonDone } from '@/lib/lesson-progress';

/** Ô tích "đã học xong" của một bài, tự đồng bộ với localStorage. */
export function LessonTick({
  id,
  label,
  size = 'sm',
  className,
}: {
  id: string;
  /** Nhãn cho trình đọc màn hình, ví dụ "Bài 1.2 — Geometry & Mesh". */
  label: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const done = useLessonDone(id);

  return (
    <Checkbox
      size={size}
      checked={done}
      onCheckedChange={(checked) => setLessonDone(id, checked === true)}
      aria-label={done ? `Bỏ tích đã học: ${label}` : `Đánh dấu đã học: ${label}`}
      title={done ? 'Đã học xong — bấm để bỏ tích' : 'Đánh dấu đã học xong'}
      // Vùng chạm mặc định của Checkbox nới rộng 12px mỗi bên, đủ để đè lên
      // link ngay cạnh trong danh sách dày; thu lại nhưng vẫn dễ bấm trên mobile.
      className={cn('after:-inset-1.5', className)}
    />
  );
}
