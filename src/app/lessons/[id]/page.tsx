import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CubeIcon,
  GithubLogoIcon,
  InfoIcon,
  CodeIcon,
} from '@phosphor-icons/react/dist/ssr';
import { CURRICULUM } from '@/data/curriculum';
import { Lesson1_1 } from '@/components/lessons/module-1/Lesson1_1';
import { LessonPlayground } from '@/components/lessons/LessonPlayground';
import {
  LESSON_1_1_DEPENDENCIES,
  LESSON_1_1_FILES,
} from '@/components/lessons/module-1/lesson-1-1-sandbox';
import { Badge, Separator } from '@/toolcraft/ui';
import { buttonVariants } from '@/toolcraft/ui/components/primitives/button-variants';
import { cn } from '@/toolcraft/ui/lib/utils';

const SURFACE = 'border border-[color:color-mix(in_oklab,var(--border)_25%,transparent)]';
const PANEL = cn(SURFACE, 'rounded-lg bg-[color:color-mix(in_oklab,var(--card)_35%,transparent)]');

const INTERVIEW_NOTES = [
  {
    title: 'Vì sao near quá nhỏ gây Z-fighting?',
    body: (
      <>
        Depth buffer của WebGL ánh xạ phi tuyến tính — phần lớn bit chính xác dồn sát mặt phẳng{' '}
        <code>near</code>. Khi đặt <code>near = 0.0001</code> và <code>far = 1e6</code>, độ phân giải
        chiều sâu ở khoảng cách xa bị nén mỏng, khiến hai mặt phẳng gần nhau nhận cùng giá trị z-depth và
        nhấp nháy tranh nhau vẽ.
      </>
    ),
  },
  {
    title: 'Vòng đời dọn dẹp WebGL trong React SPA',
    body: (
      <>
        Garbage collector của JavaScript <strong>không</strong> giải phóng được VRAM. Nếu chỉ gỡ thẻ canvas
        khỏi DOM mà không gọi <code>geometry.dispose()</code>, <code>material.dispose()</code> và{' '}
        <code>renderer.dispose()</code>, context WebGL cùng vertex buffer vẫn nằm lại trong VRAM, tràn bộ
        nhớ sau vài lần chuyển trang.
      </>
    ),
  },
  {
    title: 'Vì sao chặn pixel ratio ở mức 2?',
    body: (
      <>
        Số pixel GPU phải tính tỉ lệ theo <strong>bình phương</strong> DPR — màn Retina 3x đòi hỏi gấp 9
        lần DPR=1. <code>Math.min(window.devicePixelRatio, 2)</code> giữ được độ nét chuẩn mắt người mà
        không nghẽn GPU trên thiết bị di động.
      </>
    ),
  },
];

const CHECKPOINTS = [
  'Hiểu vai trò của bộ ba Scene, PerspectiveCamera, WebGLRenderer',
  'Nắm cách tính frustum của PerspectiveCamera',
  'Nắm cơ chế dispose để không leak bộ nhớ trong React',
];

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const params: { id: string }[] = [];
  CURRICULUM.forEach((mod) => {
    mod.lessons.forEach((les) => {
      params.push({ id: les.id });
    });
  });
  return params;
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;

  const allLessons = CURRICULUM.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === id);
  if (currentIndex === -1) {
    notFound();
  }

  const currentLesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : undefined;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : undefined;

  const parentModule = CURRICULUM.find((m) => m.id === currentLesson?.moduleNumber);
  const currentModuleTitle = parentModule ? parentModule.title : '';

  return (
    <div className="flex min-h-screen flex-col">
      {/* Application chrome */}
      <header
        className={cn(
          'sticky top-0 z-50 border-x-0 border-t-0 border-b',
          SURFACE,
          'bg-[color:color-mix(in_oklab,var(--background)_85%,transparent)] backdrop-blur-xl'
        )}
      >
        <div className="mx-auto flex h-11 w-full max-w-[1400px] items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'gap-1.5')}
            >
              <ArrowLeftIcon className="size-3.5" />
              <CubeIcon className="size-3.5 text-[color:var(--accent)]" weight="duotone" />
              Lộ trình
            </Link>
            <Separator orientation="vertical" className="h-3.5" />
            <span className="truncate font-mono text-2xs text-[color:var(--muted-foreground)]">
              module {currentLesson.moduleNumber} · bài {currentLesson.lessonNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {prevLesson ? (
              <Link
                href={`/lessons/${prevLesson.id}`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'xs' }),
                  'hidden gap-1.5 sm:inline-flex'
                )}
              >
                <ArrowLeftIcon className="size-3.5" />
                {prevLesson.lessonNumber}
              </Link>
            ) : null}
            {nextLesson ? (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'xs' }),
                  'hidden gap-1.5 sm:inline-flex'
                )}
              >
                {nextLesson.lessonNumber}
                <ArrowRightIcon className="size-3.5" />
              </Link>
            ) : null}
            <a
              href="https://github.com/minh1904/threejs-showcase"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'gap-1.5')}
            >
              <GithubLogoIcon className="size-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8">
        {/* Lesson header */}
        <div className="flex flex-col gap-3 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-2xs tracking-wider text-[color:var(--muted-foreground)] uppercase">
              {currentModuleTitle}
            </span>
            <Separator orientation="vertical" className="h-3" />
            <Badge variant={currentLesson.status === 'completed' ? 'default' : 'ghost'} className="font-mono">
              {currentLesson.status === 'completed' ? 'done' : 'todo'}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {currentLesson.stack === 'vanilla' ? 'vanilla three.js' : 'react three fiber'}
            </Badge>
          </div>

          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {currentLesson.lessonNumber} — {currentLesson.title}
          </h1>
          <p className="max-w-3xl text-xs-plus leading-relaxed text-[color:var(--muted-foreground)]">
            {currentLesson.description}
          </p>
        </div>

        <Separator />

        {id === '1-1' ? (
          <>
          <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            {/* Lab */}
            <div className="xl:col-span-7">
              <Lesson1_1 />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-4 xl:col-span-5">
              {/* Interview notes */}
              <div className={cn(PANEL, 'flex flex-col')}>
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-3">
                  <InfoIcon className="size-3.5 text-[color:var(--accent)]" weight="duotone" />
                  <h3 className="text-xs-plus font-medium">Kiến thức phỏng vấn trọng tâm</h3>
                </div>

                <Separator />

                <div className="flex flex-col gap-3 p-4">
                  {INTERVIEW_NOTES.map((note, index) => (
                    <div
                      key={note.title}
                      className={cn(
                        SURFACE,
                        'rounded-md bg-[color:color-mix(in_oklab,var(--background)_60%,transparent)] p-3'
                      )}
                    >
                      <div className="mb-1.5 flex items-baseline gap-2">
                        <span className="font-mono text-2xs text-[color:var(--muted-foreground)] tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-2xs font-medium">{note.title}</span>
                      </div>
                      <p className="text-2xs leading-relaxed text-[color:var(--muted-foreground)] [&_code]:rounded-xs [&_code]:bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[color:var(--foreground)] [&_strong]:font-medium [&_strong]:text-[color:var(--foreground)]">
                        {note.body}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-2 p-4">
                  <span className="font-mono text-2xs tracking-wider text-[color:var(--muted-foreground)] uppercase">
                    checkpoint 1.1
                  </span>
                  <ul className="flex flex-col gap-1.5">
                    {CHECKPOINTS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-2xs leading-relaxed">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[color:var(--accent)]" />
                        <span className="text-[color:var(--muted-foreground)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Playground — sửa code thật, build lại trong trình duyệt */}
          <section className="mt-8 flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2">
                <CodeIcon className="size-3.5 text-[color:var(--accent)]" weight="duotone" />
                <h3 className="text-sm font-medium">Tự tay sửa code</h3>
              </div>
              <p className="text-2xs text-[color:var(--muted-foreground)]">
                Sửa trực tiếp bên trái, preview build lại sau ~400ms. Bấm Reset để về code gốc.
              </p>
            </div>

            <LessonPlayground
              files={LESSON_1_1_FILES}
              dependencies={LESSON_1_1_DEPENDENCIES}
              entryFile="/index.js"
              template="vite"
            />
          </section>
          </>
        ) : (
          <div
            className={cn(
              PANEL,
              'mt-6 flex flex-col items-center justify-center gap-3 px-6 py-16 text-center'
            )}
          >
            <div
              className={cn(
                SURFACE,
                'flex size-10 items-center justify-center rounded-md font-mono text-xs-plus text-[color:var(--muted-foreground)]'
              )}
            >
              {currentLesson.lessonNumber}
            </div>
            <h2 className="text-sm font-medium">Bài {currentLesson.lessonNumber} sắp ra mắt</h2>
            <p className="max-w-md text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
              Bài học này nằm trong lộ trình kế tiếp ({currentModuleTitle}). Bạn có thể quay lại bài 1.1 để thử
              nghiệm lab tương tác.
            </p>
            <Link href="/lessons/1-1" className={cn(buttonVariants({ size: 'sm' }), 'mt-1 gap-1.5')}>
              Về lab 1.1
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-[color:color-mix(in_oklab,var(--border)_25%,transparent)] py-6">
        <div className="mx-auto max-w-[1400px] px-4 text-center font-mono text-2xs text-[color:var(--muted-foreground)]">
          threejs-showcase · vanilla three.js → react three fiber
        </div>
      </footer>
    </div>
  );
}
