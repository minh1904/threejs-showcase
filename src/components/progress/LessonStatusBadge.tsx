'use client';

import React from 'react';
import { Badge } from '@/toolcraft/ui';
import { cn } from '@/toolcraft/ui/lib/utils';
import { useLessonDone } from '@/lib/lesson-progress';

/** Nhãn done/todo của một bài, đọc từ tiến độ người dùng tự tích. */
export function LessonStatusBadge({ id, className }: { id: string; className?: string }) {
  const done = useLessonDone(id);

  return (
    <Badge variant={done ? 'default' : 'ghost'} className={cn('font-mono', className)}>
      {done ? 'done' : 'todo'}
    </Badge>
  );
}
