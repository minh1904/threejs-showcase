import type { SandpackFiles, SandpackPredefinedTemplate } from '@codesandbox/sandpack-react';

/**
 * Cấu trúc một bài giảng.
 *
 * Mọi trường văn bản đều hỗ trợ đánh dấu inline tối giản, xem RichText:
 *   `code`   → <code>
 *   **đậm**  → <strong>
 */

/** Một khái niệm cần nắm, kèm phần giảng giải. */
export interface Concept {
  term: string;
  explain: string;
}

/** Một bước trong phần hướng dẫn thực hành. */
export interface Step {
  action: string;
  /** Vì sao bước này cần thiết — phần quan trọng nhất, đừng bỏ trống. */
  why?: string;
}

/**
 * Một thí nghiệm có hướng dẫn: điều chỉnh tham số, quan sát kết quả,
 * rồi đọc lời giải thích. Thay cho lối "thử phá" — ở đây người học được
 * dẫn dắt tới hiện tượng và được giảng vì sao nó xảy ra.
 */
export interface Observation {
  /** Điều chỉnh gì trong sandbox. */
  change: string;
  /** Hiện tượng sẽ thấy. */
  observe: string;
  /** Cơ chế đằng sau hiện tượng đó. */
  why: string;
}

/** Câu hỏi phỏng vấn và cách trả lời. */
export interface InterviewQA {
  q: string;
  a: string;
}

export interface SandboxSpec {
  files: SandpackFiles;
  dependencies?: Record<string, string>;
  entryFile?: string;
  template?: SandpackPredefinedTemplate;
  height?: number;
}

export interface LessonContent {
  id: string;
  /** Một câu: học xong bài này bạn làm được gì. */
  goal: string;
  /** Phần dẫn nhập — đặt vấn đề trước khi vào kỹ thuật. Mỗi phần tử là một đoạn. */
  lecture: string[];
  concepts: Concept[];
  walkthrough: Step[];
  observations: Observation[];
  interview: InterviewQA[];
  /** Tự đánh giá: trả lời được hết là xong bài. */
  checkpoints: string[];
  sandbox?: SandboxSpec;
}
