import type { LessonContent } from './types';

import { LESSON_1_1 } from './module-1/lesson-1-1';
import { LESSON_1_2 } from './module-1/lesson-1-2';
import { LESSON_1_3 } from './module-1/lesson-1-3';
import { LESSON_1_4 } from './module-1/lesson-1-4';
import { LESSON_1_5 } from './module-1/lesson-1-5';
import { LESSON_1_6 } from './module-1/lesson-1-6';
import { LESSON_1_7 } from './module-1/lesson-1-7';

import { LESSON_2_1 } from './module-2/lesson-2-1';
import { LESSON_2_2 } from './module-2/lesson-2-2';
import { LESSON_2_3 } from './module-2/lesson-2-3';
import { LESSON_2_4 } from './module-2/lesson-2-4';
import { LESSON_2_5 } from './module-2/lesson-2-5';
import { LESSON_2_6 } from './module-2/lesson-2-6';
import { LESSON_2_7 } from './module-2/lesson-2-7';

import { LESSON_3_1 } from './module-3/lesson-3-1';
import { LESSON_3_2 } from './module-3/lesson-3-2';
import { LESSON_3_3 } from './module-3/lesson-3-3';
import { LESSON_3_4 } from './module-3/lesson-3-4';

import { LESSON_4_2 } from './module-4/lesson-4-2';

const ALL: LessonContent[] = [
  LESSON_1_1,
  LESSON_1_2,
  LESSON_1_3,
  LESSON_1_4,
  LESSON_1_5,
  LESSON_1_6,
  LESSON_1_7,
  LESSON_2_1,
  LESSON_2_2,
  LESSON_2_3,
  LESSON_2_4,
  LESSON_2_5,
  LESSON_2_6,
  LESSON_2_7,
  LESSON_3_1,
  LESSON_3_2,
  LESSON_3_3,
  LESSON_3_4,
  LESSON_4_2,
];

const BY_ID = new Map(ALL.map((lesson) => [lesson.id, lesson]));

/** Trả về nội dung bài giảng, hoặc undefined nếu bài đó chưa được soạn. */
export function getLessonContent(id: string): LessonContent | undefined {
  return BY_ID.get(id);
}

/** Số bài đã soạn nội dung — dùng để hiển thị tiến độ. */
export const AUTHORED_LESSON_IDS = ALL.map((lesson) => lesson.id);
