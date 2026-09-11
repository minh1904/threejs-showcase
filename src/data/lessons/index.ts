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

import { LESSON_4_1 } from './module-4/lesson-4-1';
import { LESSON_4_2 } from './module-4/lesson-4-2';
import { LESSON_4_3 } from './module-4/lesson-4-3';
import { LESSON_4_4 } from './module-4/lesson-4-4';
import { LESSON_4_5 } from './module-4/lesson-4-5';
import { LESSON_4_6 } from './module-4/lesson-4-6';
import { LESSON_4_7 } from './module-4/lesson-4-7';
import { LESSON_4_8 } from './module-4/lesson-4-8';

import { LESSON_5_1 } from './module-5/lesson-5-1';
import { LESSON_5_2 } from './module-5/lesson-5-2';
import { LESSON_5_3 } from './module-5/lesson-5-3';
import { LESSON_5_4 } from './module-5/lesson-5-4';
import { LESSON_5_5 } from './module-5/lesson-5-5';
import { LESSON_5_6 } from './module-5/lesson-5-6';

import { LESSON_6_1 } from './module-6/lesson-6-1';
import { LESSON_6_2 } from './module-6/lesson-6-2';
import { LESSON_6_3 } from './module-6/lesson-6-3';
import { LESSON_6_4 } from './module-6/lesson-6-4';
import { LESSON_6_5 } from './module-6/lesson-6-5';
import { LESSON_6_6 } from './module-6/lesson-6-6';

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
  LESSON_4_1,
  LESSON_4_2,
  LESSON_4_3,
  LESSON_4_4,
  LESSON_4_5,
  LESSON_4_6,
  LESSON_4_7,
  LESSON_4_8,
  LESSON_5_1,
  LESSON_5_2,
  LESSON_5_3,
  LESSON_5_4,
  LESSON_5_5,
  LESSON_5_6,
  LESSON_6_1,
  LESSON_6_2,
  LESSON_6_3,
  LESSON_6_4,
  LESSON_6_5,
  LESSON_6_6,
];

const BY_ID = new Map(ALL.map((lesson) => [lesson.id, lesson]));

/** Trả về nội dung bài giảng, hoặc undefined nếu bài đó chưa được soạn. */
export function getLessonContent(id: string): LessonContent | undefined {
  return BY_ID.get(id);
}

/** Số bài đã soạn nội dung — dùng để hiển thị tiến độ. */
export const AUTHORED_LESSON_IDS = ALL.map((lesson) => lesson.id);
