'use client';

import React from 'react';
import Link from 'next/link';
import { CURRICULUM, getModuleStatus, type LessonStatus } from '@/data/curriculum';
import { Badge, Separator } from '@/toolcraft/ui';
import { cn } from '@/toolcraft/ui/lib/utils';
import { useLessonProgress } from '@/lib/lesson-progress';
import { LessonTick } from './LessonTick';

const SURFACE = 'border border-[color:color-mix(in_oklab,var(--border)_25%,transparent)]';
const PANEL = cn(SURFACE, 'rounded-lg bg-[color:color-mix(in_oklab,var(--card)_35%,transparent)]');

const STATUS_LABEL: Record<
  LessonStatus,
  { label: string; variant: 'default' | 'secondary' | 'warning' | 'outline' | 'ghost' }
> = {
  completed: { label: 'done', variant: 'default' },
  'in-progress': { label: 'wip', variant: 'warning' },
  'not-started': { label: 'todo', variant: 'ghost' },
};

/**
 * Lộ trình 6 modules kèm ô tích từng bài. Là client component vì tiến độ nằm ở
 * localStorage của người học, không phải trong dữ liệu build.
 */
export function CurriculumGrid() {
  const progress = useLessonProgress();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {CURRICULUM.map((mod) => {
        const modDone = mod.lessons.filter((les) => progress[les.id]).length;
        const status = STATUS_LABEL[getModuleStatus(modDone, mod.lessons.length)];

        return (
          <div key={mod.id} className={cn(PANEL, 'flex flex-col')}>
            <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs tracking-wider text-[color:var(--muted-foreground)] uppercase">
                  module {mod.id} · tuần {mod.week} · {modDone}/{mod.lessons.length}
                </span>
                <h3 className="text-xs-plus font-medium">{mod.title}</h3>
              </div>
              <Badge variant={status.variant} className="shrink-0 font-mono">
                {status.label}
              </Badge>
            </div>

            <p className="px-4 pb-3 text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
              {mod.description}
            </p>

            {/* Thanh tiến độ của riêng module */}
            <div className="mx-4 mb-3 h-0.5 overflow-hidden rounded-full bg-[color:color-mix(in_oklab,var(--foreground)_10%,transparent)]">
              <div
                className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-300"
                style={{ width: `${(modDone / mod.lessons.length) * 100}%` }}
              />
            </div>

            <Separator />

            <ul className="flex flex-col p-1.5">
              {mod.lessons.map((les) => {
                const done = Boolean(progress[les.id]);

                return (
                  <li
                    key={les.id}
                    className="group flex items-center gap-2 rounded-md pl-2.5 transition-colors hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]"
                  >
                    <LessonTick id={les.id} label={`Bài ${les.lessonNumber} — ${les.title}`} />
                    <Link
                      href={`/lessons/${les.id}`}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 py-1.5 pr-2.5"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            'font-mono text-2xs tabular-nums',
                            done
                              ? 'text-[color:var(--accent)]'
                              : 'text-[color:var(--muted-foreground)]'
                          )}
                        >
                          {les.lessonNumber}
                        </span>
                        <span
                          className={cn(
                            'truncate text-2xs transition-colors group-hover:text-[color:var(--foreground)]',
                            done
                              ? 'text-[color:var(--foreground)]'
                              : 'text-[color:var(--muted-foreground)]'
                          )}
                        >
                          {les.title}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-2xs text-[color:color-mix(in_oklab,var(--muted-foreground)_70%,transparent)]">
                        {les.stack === 'vanilla' ? 'vanilla' : 'r3f'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
