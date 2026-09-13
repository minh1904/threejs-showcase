'use client';

import React from 'react';
import { CheckSquareIcon, SquareIcon } from '@phosphor-icons/react';
import { Button } from '@/toolcraft/ui';
import { cn } from '@/toolcraft/ui/lib/utils';
import { toggleLessonDone, useLessonDone } from '@/lib/lesson-progress';

/**
 * Nút tích "đã học xong" ở đầu trang bài học. Là nút bật/tắt (`aria-pressed`)
 * chứ không phải checkbox + nhãn, để cả chuột lẫn bàn phím chỉ có một điểm chạm.
 */
export function LessonDoneToggle({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const done = useLessonDone(id);

  return (
    <Button
      variant={done ? 'default' : 'outline'}
      size="xs"
      aria-pressed={done}
      title={done ? 'Bấm để bỏ tích' : 'Bấm khi đã làm xong bài này'}
      className={cn('gap-1.5', className)}
      onClick={() => toggleLessonDone(id)}
    >
      {done ? (
        <CheckSquareIcon className="size-3.5" weight="fill" />
      ) : (
        <SquareIcon className="size-3.5" />
      )}
      {done ? 'Đã học xong' : 'Đánh dấu đã học'}
    </Button>
  );
}
