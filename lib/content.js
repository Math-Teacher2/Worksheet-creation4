// 내용 설정: 개념 설명 수준, 빈칸 양, 넣을 문제 종류, AI 생각 깊이 등

export const DEFAULT_CONTENT = {
  detail: 'detailed', // detailed | normal | brief
  blanks: 'few', // few | normal | many
  examples: 'all', // 예제: all | some | none
  exercises: 'all', // 문제·유제: all | some | none
  checks: 'all', // 스스로 확인하기·확인 문제: all | some | none
  thinking: 'medium', // AI 생각 깊이: low | medium | high
  perChunk: 1, // 한 번에 만들 차시 수
  fallback: true, // 서버가 바쁘면 다른 모델로 자동 전환
};

export const DETAIL_LABEL = { detailed: '자세히', normal: '보통', brief: '간단히' };
export const BLANK_LABEL = { few: '적게', normal: '보통', many: '많이' };
export const PICK_LABEL = { all: '전부', some: '일부', none: '빼기' };
export const THINK_LABEL = { low: '빠르게(절약)', medium: '보통', high: '깊게' };

const pick = (v, allowed, d) => (allowed.includes(v) ? v : d);

export function normalizeContent(raw) {
  const s = raw && typeof raw === 'object' ? raw : {};
  const d = DEFAULT_CONTENT;
  return {
    detail: pick(s.detail, ['detailed', 'normal', 'brief'], d.detail),
    blanks: pick(s.blanks, ['few', 'normal', 'many'], d.blanks),
    examples: pick(s.examples, ['all', 'some', 'none'], d.examples),
    exercises: pick(s.exercises, ['all', 'some', 'none'], d.exercises),
    checks: pick(s.checks, ['all', 'some', 'none'], d.checks),
    thinking: pick(s.thinking, ['low', 'medium', 'high'], d.thinking),
    perChunk: [1, 2, 3].includes(Number(s.perChunk)) ? Number(s.perChunk) : d.perChunk,
    fallback: typeof s.fallback === 'boolean' ? s.fallback : d.fallback,
  };
}

const PICK_TEXT = {
  all: '모두 넣는다',
  some: '대표 문항만 일부 넣는다(묶음마다 1~2개, 소문항은 절반 정도)',
  none: '넣지 않는다',
};

// AI 지시문용
export function describeContent(c) {
  const lines = [];
  if (c.detail === 'detailed') {
    lines.push(
      '- 개념 설명: **자세히**. concept 블록의 items 앞부분에 교과서 본문의 설명 흐름을 살린 짧은 단락 2~4개를 쓴다: 왜 그렇게 되는지, 교과서가 든 예시 함수와 그래프 해석, 식을 변형하는 과정(식 변형은 "$$...$$" 한 줄씩). 그다음에 정의·성질·기호를 정리한다. 교과서의 "참고", "보기"처럼 이해를 돕는 설명(고등학교 범위 안)도 살린다. 탐구(explore)는 교과서 활동을 3~4문장으로 쓴다.'
    );
  } else if (c.detail === 'normal') {
    lines.push('- 개념 설명: **보통**. 정의·성질을 정리하되, 정의를 이해하는 데 필요한 설명 1~2문장과 교과서의 예시를 함께 쓴다.');
  } else {
    lines.push('- 개념 설명: **간단히**. 정의·공식·기호 위주로 짧게 정리한다.');
  }
  if (c.blanks === 'few')
    lines.push('- 빈칸 [[ ]]: **적게**. 꼭 기억해야 할 핵심 용어·기호에만 둔다. concept 블록 하나에 최대 3개, 차시 전체 10개 이하. 설명 단락은 빈칸 없이 그대로 읽히게 쓴다.');
  else if (c.blanks === 'normal') lines.push('- 빈칸 [[ ]]: **보통**. 핵심 용어·기호·식에 블록당 3~5개.');
  else lines.push('- 빈칸 [[ ]]: **많이**. 핵심 용어·기호·식·결론을 블록당 5~8개 빈칸으로.');
  lines.push(`- 교과서 "예제"(풀이가 실린 문제): ${PICK_TEXT[c.examples]}. 넣을 때는 problems 블록(label 예: "예제 1")으로 옮기고 sol에 교과서 풀이의 핵심을 쓴다.`);
  lines.push(`- 교과서 "문제"·"유제"·"따라 하기": ${PICK_TEXT[c.exercises]}.`);
  lines.push(`- 교과서 "스스로 확인하기"·"확인 문제"·"중단원 마무리": ${PICK_TEXT[c.checks]}.`);
  return lines.join('\n');
}
