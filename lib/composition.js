// "내 학습지 구성": 활동 순서·이름·출처와 교사 작성 칸(기출·수능특강 등)
//   source: textbook(교과서에서 그대로) | ai(교과서 내용을 바탕으로 AI가 작성) | teacher(빈 칸, 교사가 직접)

export const ACTIVITY_TYPES = {
  explore: '탐구(도입)',
  concept: '핵심 개념(빈칸 정리)',
  check: '개념 확인',
  strategy: '풀이 전략',
  problems: '교과서 문제',
  think: '생각해보기',
};

export const DEFAULT_COMPOSITION = {
  activities: [
    { type: 'explore', title: '탐구', use: true, source: 'textbook' },
    { type: 'concept', title: '핵심 개념', use: true, source: 'textbook' },
    { type: 'check', title: '개념 확인', use: true, source: 'textbook' },
    { type: 'strategy', title: '풀이 전략', use: true, source: 'textbook' },
    { type: 'problems', title: '교과서 문제', use: true, source: 'textbook' },
    { type: 'think', title: '생각해보기', use: true, source: 'ai' },
  ],
  thinkPlace: 'section', // section: 주제마다 / lesson: 차시 끝에 한 번
  practice: {
    enabled: true,
    items: [
      { label: '기출문제', count: 2 },
      { label: '수능특강', count: 2 },
    ],
    perPage: 4,
    columns: ['자신의 풀이', '교사의 풀이'],
  },
  pagesPerLesson: 2,
  notes: '',
};

const SOURCES = ['textbook', 'ai', 'teacher'];

export function normalizeComposition(raw) {
  const d = DEFAULT_COMPOSITION;
  const src = raw && typeof raw === 'object' ? raw : {};
  const acts = Array.isArray(src.activities) && src.activities.length ? src.activities : d.activities;
  const activities = acts
    .map((a) => {
      const type = ACTIVITY_TYPES[a?.type] ? a.type : null;
      if (!type) return null;
      const def = d.activities.find((x) => x.type === type);
      // "개념 정리(네모 빈칸)"처럼 괄호 설명이 붙은 이름은 이름과 특징으로 나눔
      let title = String(a.title || def.title).trim();
      let style = String(a.style || '').trim();
      const m = title.match(/^(.+?)\s*[(（]([^()（）]+)[)）]\s*$/);
      if (m && m[1].trim()) {
        title = m[1].trim();
        style = style || m[2].trim();
      }
      return {
        type,
        title: title.slice(0, 20) || def.title,
        style: style.slice(0, 30),
        use: a.use !== false,
        source: SOURCES.includes(a.source) ? a.source : def.source,
      };
    })
    .filter(Boolean);
  // 빠진 활동은 꺼진 상태로 뒤에 붙여 편집할 수 있게 함
  for (const def of d.activities) if (!activities.some((a) => a.type === def.type)) activities.push({ ...def, use: false });
  const pr = src.practice && typeof src.practice === 'object' ? src.practice : d.practice;
  const items = (Array.isArray(pr.items) ? pr.items : d.practice.items)
    .map((it) => ({ label: String(it?.label || '').trim().slice(0, 16), count: Math.max(0, Math.min(8, parseInt(it?.count, 10) || 0)) }))
    .filter((it) => it.label);
  const cols = Array.isArray(pr.columns) && pr.columns.length ? pr.columns.map((c) => String(c).slice(0, 12)).slice(0, 3) : d.practice.columns;
  return {
    activities,
    thinkPlace: src.thinkPlace === 'lesson' ? 'lesson' : 'section',
    practice: {
      enabled: pr.enabled !== false && items.some((i) => i.count > 0),
      items,
      perPage: Math.max(2, Math.min(5, parseInt(pr.perPage, 10) || 4)),
      columns: cols,
    },
    pagesPerLesson: 2,
    notes: String(src.notes || '').slice(0, 600),
  };
}

// AI 지시문용 요약
export function describeComposition(c) {
  const lines = [];
  const used = c.activities.filter((a) => a.use);
  lines.push('주제(섹션) 안의 활동 순서와 제목:');
  used.forEach((a, i) => {
    const how =
      a.source === 'teacher'
        ? '→ 교사가 직접 채우는 칸이므로 만들지 말 것(앱이 빈 칸을 넣음)'
        : a.source === 'ai'
          ? '→ 교과서 개념을 바탕으로 스스로 사고하게 하는 질문을 직접 작성(교과서에 같은 활동이 있으면 그것을 우선 사용)'
          : '→ 교과서 내용을 그대로 사용';
    lines.push(`  ${i + 1}. type="${a.type}" 제목="${a.title}"${a.style ? ` (특징: ${a.style})` : ''} ${how}`);
  });
  const think = used.find((a) => a.type === 'think');
  if (think && think.source !== 'teacher') lines.push(think && c.thinkPlace === 'lesson' ? `- "${think.title}"는 차시의 마지막 주제에만 한 번 넣는다.` : `- "${think.title}"는 주제마다 하나씩 넣는다.`);
  const off = c.activities.filter((a) => !a.use).map((a) => a.type);
  if (off.length) lines.push(`- 사용하지 않는 활동: ${off.join(', ')} (만들지 말 것)`);
  return lines.join('\n');
}
