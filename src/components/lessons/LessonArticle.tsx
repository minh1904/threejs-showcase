import React from 'react';
import {
  CheckCircleIcon,
  CodeIcon,
  EyeIcon,
  FlaskIcon,
  ListNumbersIcon,
  QuestionIcon,
  TargetIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { LessonContent } from '@/data/lessons/types';
import { LessonPlayground } from './LessonPlayground';
import { RichText } from './RichText';
import { cn } from '@/toolcraft/ui/lib/utils';

const SURFACE = 'border border-[color:color-mix(in_oklab,var(--border)_25%,transparent)]';
const PANEL = cn(SURFACE, 'rounded-lg bg-[color:color-mix(in_oklab,var(--card)_35%,transparent)]');
const INNER = cn(
  SURFACE,
  'rounded-md bg-[color:color-mix(in_oklab,var(--background)_60%,transparent)]'
);

function SectionHeading({
  icon: Icon,
  children,
  note,
}: {
  icon: React.ComponentType<{ className?: string; weight?: 'duotone' }>;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-3.5 text-[color:var(--accent)]" weight="duotone" />
        {children}
      </h2>
      {note ? (
        <span className="text-2xs text-[color:var(--muted-foreground)]">{note}</span>
      ) : null}
    </div>
  );
}

export function LessonArticle({
  content,
  lab,
}: {
  content: LessonContent;
  /** Phòng thí nghiệm tương tác riêng của bài, nếu có. */
  lab?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-10">
      {/* Mục tiêu + dẫn nhập */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-8">
          <SectionHeading icon={TargetIcon}>Mục tiêu bài học</SectionHeading>
          <p className="text-sm leading-relaxed text-[color:var(--foreground)]">
            <RichText>{content.goal}</RichText>
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {content.lecture.map((paragraph, index) => (
              <p
                key={index}
                className="text-xs-plus leading-relaxed text-[color:var(--muted-foreground)]"
              >
                <RichText>{paragraph}</RichText>
              </p>
            ))}
          </div>
        </div>

        {/* Khái niệm cốt lõi */}
        <div className={cn(PANEL, 'flex flex-col xl:col-span-4')}>
          <div className="px-4 pt-3.5 pb-2">
            <SectionHeading icon={CodeIcon}>Khái niệm cốt lõi</SectionHeading>
          </div>
          <dl className="flex flex-col gap-3 px-4 pb-4">
            {content.concepts.map((concept) => (
              <div key={concept.term} className={cn(INNER, 'p-3')}>
                <dt className="mb-1 font-mono text-2xs text-[color:var(--accent)]">
                  {concept.term}
                </dt>
                <dd className="text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
                  <RichText>{concept.explain}</RichText>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {lab ? (
        <section className="flex flex-col gap-3">
          <SectionHeading icon={FlaskIcon} note="Điều chỉnh tham số và xem kết quả đổi ngay">
            Phòng thí nghiệm
          </SectionHeading>
          {lab}
        </section>
      ) : null}

      {content.sandbox ? (
        <section className="flex flex-col gap-3">
          <SectionHeading
            icon={CodeIcon}
            note="Sửa trực tiếp bên trái, preview build lại sau ~400ms. Bấm Reset để về code gốc."
          >
            Đọc và sửa code
          </SectionHeading>
          <LessonPlayground {...content.sandbox} />
        </section>
      ) : null}

      {/* Thực hành + Quan sát */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SectionHeading icon={ListNumbersIcon}>Thực hành từng bước</SectionHeading>
          <ol className={cn(PANEL, 'flex flex-col divide-y divide-[color:color-mix(in_oklab,var(--border)_25%,transparent)]')}>
            {content.walkthrough.map((step, index) => (
              <li key={index} className="flex gap-3 p-4">
                <span className="mt-px shrink-0 font-mono text-2xs tabular-nums text-[color:var(--muted-foreground)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-2xs leading-relaxed">
                    <RichText>{step.action}</RichText>
                  </span>
                  {step.why ? (
                    <span className="text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
                      <RichText>{step.why}</RichText>
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeading icon={EyeIcon} note="Đổi một thứ, quan sát, rồi đọc lời giải">
            Quan sát &amp; giải thích
          </SectionHeading>
          <div className="flex flex-col gap-3">
            {content.observations.map((item, index) => (
              <div key={index} className={cn(PANEL, 'flex flex-col gap-2 p-4')}>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-2xs tracking-wider text-[color:var(--muted-foreground)] uppercase">
                    điều chỉnh
                  </span>
                  <span className="text-2xs leading-relaxed">
                    <RichText>{item.change}</RichText>
                  </span>
                </div>

                <div className={cn(INNER, 'flex flex-col gap-1.5 p-3')}>
                  <span className="font-mono text-2xs tracking-wider text-[color:var(--accent)] uppercase">
                    bạn sẽ thấy
                  </span>
                  <span className="text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
                    <RichText>{item.observe}</RichText>
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-2xs tracking-wider text-[color:var(--muted-foreground)] uppercase">
                    vì sao
                  </span>
                  <span className="text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
                    <RichText>{item.why}</RichText>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phỏng vấn + Tự kiểm tra */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-3 xl:col-span-8">
          <SectionHeading icon={QuestionIcon} note="Trả lời thành tiếng, đừng chỉ đọc">
            Câu hỏi phỏng vấn
          </SectionHeading>
          <div className="flex flex-col gap-3">
            {content.interview.map((item, index) => (
              <div key={index} className={cn(PANEL, 'flex flex-col gap-2 p-4')}>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xs tabular-nums text-[color:var(--muted-foreground)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-2xs font-medium">
                    <RichText>{item.q}</RichText>
                  </span>
                </div>
                <p className="pl-6 text-2xs leading-relaxed text-[color:var(--muted-foreground)]">
                  <RichText>{item.a}</RichText>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:col-span-4">
          <SectionHeading icon={CheckCircleIcon}>Xong bài khi</SectionHeading>
          <ul className={cn(PANEL, 'flex flex-col gap-2.5 p-4')}>
            {content.checkpoints.map((item) => (
              <li key={item} className="flex items-start gap-2 text-2xs leading-relaxed">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[color:var(--accent)]" />
                <span className="text-[color:var(--muted-foreground)]">
                  <RichText>{item}</RichText>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
