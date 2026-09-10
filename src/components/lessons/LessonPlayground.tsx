'use client';

import React from 'react';
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
  type SandpackFiles,
  type SandpackPredefinedTemplate,
  type SandpackTheme,
} from '@codesandbox/sandpack-react';
import { ArrowClockwiseIcon, PlayIcon, TerminalIcon } from '@phosphor-icons/react';
import { Badge, Button, Separator } from '@/toolcraft/ui';
import { cn } from '@/toolcraft/ui/lib/utils';

/**
 * Sandpack theme mapped onto the Toolcraft design tokens so the editor reads as
 * part of the same tool, not an embedded widget. Surfaces reference the CSS
 * variables directly; the syntax palette is derived from --accent / --inspect /
 * --attention since Toolcraft ships no syntax colours of its own.
 */
const TOOLCRAFT_SANDPACK_THEME: SandpackTheme = {
  colors: {
    surface1: 'var(--background)',
    surface2: 'color-mix(in oklab, var(--border) 25%, transparent)',
    surface3: 'color-mix(in oklab, var(--foreground) 6%, transparent)',
    clickable: 'var(--muted-foreground)',
    base: 'var(--foreground)',
    disabled: 'color-mix(in oklab, var(--muted-foreground) 50%, transparent)',
    hover: 'var(--foreground)',
    accent: 'var(--accent)',
    error: 'var(--destructive)',
    errorSurface: 'color-mix(in oklab, var(--destructive) 15%, transparent)',
  },
  syntax: {
    plain: 'var(--foreground)',
    comment: { color: 'var(--muted-foreground)', fontStyle: 'italic' },
    keyword: '#9149f5',
    tag: '#0c8ce9',
    punctuation: 'var(--muted-foreground)',
    definition: '#0c8ce9',
    property: '#70b0fa',
    static: '#ea733a',
    string: '#ea733a',
  },
  font: {
    body: 'var(--font-sans)',
    mono: 'var(--font-mono)',
    size: '12px',
    lineHeight: '20px',
  },
};

const SURFACE = 'border border-[color:color-mix(in_oklab,var(--border)_25%,transparent)]';

function PlaygroundToolbar({
  entryFile,
  showConsole,
  onToggleConsole,
}: {
  entryFile: string;
  showConsole: boolean;
  onToggleConsole: () => void;
}) {
  const { sandpack } = useSandpack();
  const { status, resetAllFiles } = sandpack;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 border-x-0 border-t-0 border-b px-3 py-1.5',
        SURFACE
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-2xs text-[color:var(--muted-foreground)]">
          {entryFile}
        </span>
        <Separator orientation="vertical" className="h-3" />
        <Badge variant={status === 'running' ? 'default' : 'ghost'} className="gap-1 font-mono">
          <PlayIcon className="size-2.5" weight="fill" />
          {status === 'running' ? 'live' : status}
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant={showConsole ? 'secondary' : 'ghost'}
          size="xs"
          className="gap-1.5"
          onClick={onToggleConsole}
        >
          <TerminalIcon className="size-3.5" />
          Console
        </Button>
        <Button variant="ghost" size="xs" className="gap-1.5" onClick={() => resetAllFiles()}>
          <ArrowClockwiseIcon className="size-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}

export type LessonPlaygroundProps = {
  /** Sandpack virtual file system. Keys are absolute paths, e.g. "/index.ts". */
  files: SandpackFiles;
  /** npm packages resolved by the Sandpack bundler at runtime. */
  dependencies?: Record<string, string>;
  /** File shown in the editor and named in the toolbar. */
  entryFile?: string;
  template?: SandpackPredefinedTemplate;
  /** Editor/preview height in px. */
  height?: number;
};

export function LessonPlayground({
  files,
  dependencies,
  entryFile = '/index.js',
  template = 'vite',
  height = 460,
}: LessonPlaygroundProps) {
  const [showConsole, setShowConsole] = React.useState(false);

  return (
    <div className={cn(SURFACE, 'overflow-hidden rounded-lg')}>
      <SandpackProvider
        template={template}
        theme={TOOLCRAFT_SANDPACK_THEME}
        files={files}
        customSetup={dependencies ? { dependencies } : undefined}
        options={{
          activeFile: entryFile,
          // Chỉ bật bundler khi người học cuộn tới — tránh tải bundler + npm
          // cho ai không dùng tới playground.
          initMode: 'user-visible',
          initModeObserverOptions: { rootMargin: '600px 0px' },
          recompileMode: 'delayed',
          recompileDelay: 400,
        }}
      >
        <PlaygroundToolbar
          entryFile={entryFile}
          showConsole={showConsole}
          onToggleConsole={() => setShowConsole((value) => !value)}
        />

        {/*
          Chiều cao phải ràng ở wrapper: trước khi CodeMirror khởi tạo, Sandpack
          render một <pre> placeholder KHÔNG nhận style truyền vào child, làm
          editor giãn hết nội dung và vỡ layout trang.
        */}
        <div
          className="lesson-playground-layout"
          style={{ '--playground-height': `${height}px` } as React.CSSProperties}
        >
          <SandpackLayout>
            <SandpackCodeEditor
              showLineNumbers
              showTabs={false}
              showInlineErrors
              wrapContent
              style={{ height }}
            />
            <SandpackPreview showOpenInCodeSandbox={false} style={{ height }} />
          </SandpackLayout>
        </div>

        {showConsole ? (
          <div className={cn('border-x-0 border-b-0 border-t', SURFACE)}>
            <SandpackConsole resetOnPreviewRestart style={{ height: 160 }} />
          </div>
        ) : null}
      </SandpackProvider>
    </div>
  );
}
