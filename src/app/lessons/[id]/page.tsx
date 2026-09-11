import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CubeIcon,
  GithubLogoIcon,
} from '@phosphor-icons/react/dist/ssr';
import { CURRICULUM } from '@/data/curriculum';
import { getLessonContent } from '@/data/lessons';
import { Lesson1_1 } from '@/components/lessons/module-1/Lesson1_1';
import { LessonArticle } from '@/components/lessons/LessonArticle';
import { Badge, Separator } from '@/toolcraft/ui';
import { buttonVariants } from '@/toolcraft/ui/components/primitives/button-variants';
import { cn } from '@/toolcraft/ui/lib/utils';

const SURFACE = 'border border-[color:color-mix(in_oklab,var(--border)_25%,transparent)]';
const PANEL = cn(SURFACE, 'rounded-lg bg-[color:color-mix(in_oklab,var(--card)_35%,transparent)]');

/** Phòng thí nghiệm tương tác riêng, chỉ một số bài có. */
const LABS: Record<string, React.ReactNode> = {
  '1-1': <Lesson1_1 />,
};

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

  const content = getLessonContent(id);

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
            <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'gap-1.5')}>
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
            <Badge
              variant={currentLesson.status === 'completed' ? 'default' : 'ghost'}
              className="font-mono"
            >
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

        <div className="mt-8">
          {content ? (
            <LessonArticle content={content} lab={LABS[id]} />
          ) : (
            <div
              className={cn(
                PANEL,
                'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center'
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
              <h2 className="text-sm font-medium">Bài {currentLesson.lessonNumber} đang được soạn</h2>
              <p className="max-w-md text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
                Nội dung bài này thuộc {currentModuleTitle} và sẽ có sớm. Trong lúc chờ, bạn có thể
                quay lại các bài đã hoàn thiện ở Module 1.
              </p>
              <Link href="/lessons/1-1" className={cn(buttonVariants({ size: 'sm' }), 'mt-1 gap-1.5')}>
                Về bài 1.1
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-[color:color-mix(in_oklab,var(--border)_25%,transparent)] py-6">
        <div className="mx-auto max-w-[1400px] px-4 text-center font-mono text-2xs text-[color:var(--muted-foreground)]">
          threejs-showcase · vanilla three.js → react three fiber
        </div>
      </footer>
    </div>
  );
}
