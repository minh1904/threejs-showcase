import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, CubeIcon, GithubLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { CURRICULUM } from '@/data/curriculum';
import { Badge, Separator } from '@/toolcraft/ui';
import { buttonVariants } from '@/toolcraft/ui/components/primitives/button-variants';
import { cn } from '@/toolcraft/ui/lib/utils';

const SURFACE = 'border border-[color:color-mix(in_oklab,var(--border)_25%,transparent)]';
const PANEL = cn(SURFACE, 'rounded-lg bg-[color:color-mix(in_oklab,var(--card)_35%,transparent)]');

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' | 'outline' | 'ghost' }> = {
  completed: { label: 'done', variant: 'default' },
  'in-progress': { label: 'wip', variant: 'warning' },
  'not-started': { label: 'todo', variant: 'ghost' },
};

export default function Home() {
  const totalLessons = CURRICULUM.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = CURRICULUM.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.status === 'completed').length,
    0
  );
  const progress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Application chrome */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-x-0 border-t-0',
          SURFACE,
          'bg-[color:color-mix(in_oklab,var(--background)_85%,transparent)] backdrop-blur-xl'
        )}
      >
        <div className="mx-auto flex h-11 w-full max-w-[1400px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2.5">
            <CubeIcon className="size-4 text-[color:var(--accent)]" weight="duotone" />
            <span className="text-xs-plus font-medium">threejs-showcase</span>
            <Separator orientation="vertical" className="h-3.5" />
            <span className="font-mono text-2xs text-[color:var(--muted-foreground)]">
              curriculum &amp; interactive lab
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden font-mono text-2xs text-[color:var(--muted-foreground)] sm:inline">
              {completedLessons}/{totalLessons} · {progress}%
            </span>
            <a
              href="https://github.com/minh1904/threejs-showcase"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'gap-1.5')}
            >
              <GithubLogoIcon className="size-3.5" />
              GitHub
            </a>
            <Link
              href="/lessons/1-1"
              className={cn(buttonVariants({ size: 'xs' }), 'gap-1.5')}
            >
              Bài 1.1
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10">
        {/* Intro */}
        <section className="flex flex-col gap-4">
          <Badge variant="outline" className="self-start font-mono">
            vanilla three.js → react three fiber
          </Badge>

          <h1 className="max-w-3xl text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            Kinh nghiệm thực tế Three.js &amp; Web 3D
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
            Showcase tương tác gồm {totalLessons} bài tập thực chiến thuộc 6 modules. Học theo triết lý hiểu bản
            chất Three.js thuần trước khi dùng R3F, kèm kịch bản &quot;thử phá cho hiểu&quot; phục vụ trực tiếp cho
            câu hỏi phỏng vấn.
          </p>
        </section>

        {/* Metrics — dense readout, tool-style */}
        <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[color:color-mix(in_oklab,var(--border)_25%,transparent)] bg-[color:color-mix(in_oklab,var(--border)_25%,transparent)] sm:grid-cols-4">
          {[
            { label: 'modules', value: '6' },
            { label: 'bài tập', value: String(totalLessons) },
            { label: 'tiến độ', value: `${progress}%`, accent: true },
            { label: 'stack', value: 'three 0.185 · r3f 9', mono: true },
          ].map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col gap-1 bg-[color:var(--background)] px-4 py-3.5"
            >
              <span className="font-mono text-2xs tracking-wider text-[color:var(--muted-foreground)] uppercase">
                {metric.label}
              </span>
              <span
                className={cn(
                  'text-lg font-medium tabular-nums',
                  metric.mono && 'font-mono text-xs-plus',
                  metric.accent && 'text-[color:var(--accent)]'
                )}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </section>

        {/* Featured lesson */}
        <section className="mt-8">
          <div
            className={cn(
              PANEL,
              'flex flex-col items-start justify-between gap-5 p-5 lg:flex-row lg:items-center'
            )}
          >
            <div className="flex max-w-2xl flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-mono">
                  done
                </Badge>
                <span className="font-mono text-2xs text-[color:var(--muted-foreground)]">
                  module 1 · bài 1.1
                </span>
              </div>
              <h2 className="text-base font-medium">Scene, Camera, Renderer — Vanilla Three.js</h2>
              <p className="text-xs-plus leading-relaxed text-[color:var(--muted-foreground)]">
                Trực quan hoá bộ ba cốt lõi, cơ chế render một frame tĩnh, dọn dẹp bộ nhớ GPU và phòng thí nghiệm
                tương tác khảo sát Z-fighting, FOV và near/far clipping.
              </p>
            </div>

            <Link href="/lessons/1-1" className={cn(buttonVariants({ size: 'sm' }), 'shrink-0 gap-1.5')}>
              Mở lab 1.1
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </section>

        {/* Curriculum */}
        <section className="mt-10 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-medium">Lộ trình 6 modules</h2>
            <span className="font-mono text-2xs text-[color:var(--muted-foreground)]">
              {totalLessons} bài
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CURRICULUM.map((mod) => {
              const status = STATUS_LABEL[mod.status] ?? STATUS_LABEL['not-started'];

              return (
                <div key={mod.id} className={cn(PANEL, 'flex flex-col')}>
                  <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-2xs tracking-wider text-[color:var(--muted-foreground)] uppercase">
                        module {mod.id} · tuần {mod.week}
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

                  <Separator />

                  <ul className="flex flex-col p-1.5">
                    {mod.lessons.map((les) => (
                      <li key={les.id}>
                        <Link
                          href={`/lessons/${les.id}`}
                          className="group flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 transition-colors hover:bg-[color:color-mix(in_oklab,var(--foreground)_6%,transparent)]"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className={cn(
                                'font-mono text-2xs tabular-nums',
                                les.status === 'completed'
                                  ? 'text-[color:var(--accent)]'
                                  : 'text-[color:var(--muted-foreground)]'
                              )}
                            >
                              {les.lessonNumber}
                            </span>
                            <span className="truncate text-2xs text-[color:var(--muted-foreground)] transition-colors group-hover:text-[color:var(--foreground)]">
                              {les.title}
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-2xs text-[color:color-mix(in_oklab,var(--muted-foreground)_70%,transparent)]">
                            {les.stack === 'vanilla' ? 'vanilla' : 'r3f'}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:color-mix(in_oklab,var(--border)_25%,transparent)] py-6">
        <div className="mx-auto max-w-[1400px] px-4 text-center font-mono text-2xs text-[color:var(--muted-foreground)]">
          threejs-showcase · Văn Minh · next 16 · three 0.185 · r3f 9
        </div>
      </footer>
    </div>
  );
}
