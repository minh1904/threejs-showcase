import React from 'react';

/**
 * Trình bày văn bản bài giảng với đánh dấu inline tối giản:
 *
 *   `code`  → <code>
 *   **đậm** → <strong>
 *
 * Cố ý không dùng thư viện markdown: nội dung bài giảng chỉ cần hai kiểu này,
 * và giữ nó là plain string giúp file dữ liệu bài học dễ đọc, dễ sửa.
 */

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

export function RichText({ children }: { children: string }) {
  const parts = children.split(TOKEN);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={index}
              className="rounded-xs bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)] px-1 font-mono text-[color:var(--foreground)]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={index} className="font-medium text-[color:var(--foreground)]">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}
