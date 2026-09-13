'use client';

import React from 'react';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { CURRICULUM } from '@/data/curriculum';
import { Button } from '@/toolcraft/ui';
import { cn } from '@/toolcraft/ui/lib/utils';
import { resetLessonProgress, useLessonProgress } from '@/lib/lesson-progress';

const ALL_LESSON_IDS = CURRICULUM.flatMap((mod) => mod.lessons).map((les) => les.id);
const TOTAL = ALL_LESSON_IDS.length;

function useDoneCount(): number {
  const progress = useLessonProgress();
  return ALL_LESSON_IDS.reduce((total, id) => (progress[id] ? total + 1 : total), 0);
}

/** Đếm ở thanh header: số bài đã soạn (dữ liệu build) và số bài đã học (tự tích). */
export function ProgressCounter({ authored }: { authored: number }) {
  const done = useDoneCount();

  return (
    <span className="hidden font-mono text-2xs text-[color:var(--muted-foreground)] sm:inline">
      soạn {authored}/{TOTAL} · học {done}/{TOTAL}
    </span>
  );
}

/** Ô chỉ số "tiến độ học" ở hàng metrics. */
export function ProgressPercent() {
  const done = useDoneCount();

  return <>{Math.round((done / TOTAL) * 100)}%</>;
}

export function DoneCount() {
  const done = useDoneCount();

  return (
    <>
      {done}/{TOTAL}
    </>
  );
}

/**
 * Xoá tiến độ đã tích. Cần xác nhận bằng cú bấm thứ hai thay vì hộp thoại
 * `confirm()` — một cú lỡ tay không nên xoá sạch công sức nhiều tuần.
 */
export function ResetProgressButton({ className }: { className?: string }) {
  const [armed, setArmed] = React.useState(false);

  React.useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <Button
      variant={armed ? 'destructive' : 'ghost'}
      size="xs"
      className={cn('gap-1.5 font-mono', className)}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }
        resetLessonProgress();
        setArmed(false);
      }}
    >
      <ArrowCounterClockwiseIcon className="size-3" />
      {armed ? 'bấm lần nữa để xoá' : 'đặt lại tiến độ'}
    </Button>
  );
}
