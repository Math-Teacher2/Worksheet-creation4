'use client';

// "내 학습지 구성" 편집: 활동 순서·이름·출처, 교사 작성 쪽(기출·수능특강)
import { ACTIVITY_TYPES } from '../lib/composition';

const SRC = [
  ['textbook', '교과서 그대로'],
  ['ai', 'AI가 작성'],
  ['teacher', '교사 직접(빈칸)'],
];

export default function CompositionEditor({ value, onChange }) {
  const c = value;
  const set = (patch) => onChange({ ...c, ...patch });
  const setAct = (i, patch) => set({ activities: c.activities.map((a, k) => (k === i ? { ...a, ...patch } : a)) });
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= c.activities.length) return;
    const a = c.activities.slice();
    [a[i], a[j]] = [a[j], a[i]];
    set({ activities: a });
  };
  const pr = c.practice;
  const setPr = (patch) => set({ practice: { ...pr, ...patch } });
  const setItem = (i, patch) => setPr({ items: pr.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) });

  return (
    <div className="comp">
      <p className="hint">주제(소단원)마다 아래 순서로 활동을 넣습니다. 이름은 학습지에 그대로 찍힙니다.</p>
      {c.activities.map((a, i) => (
        <div key={a.type} className="comp-row">
          <input type="checkbox" checked={a.use} onChange={(e) => setAct(i, { use: e.target.checked })} title={ACTIVITY_TYPES[a.type]} />
          <input value={a.title} onChange={(e) => setAct(i, { title: e.target.value })} placeholder={ACTIVITY_TYPES[a.type]} title={ACTIVITY_TYPES[a.type]} />
          {a.type === 'think' ? (
            <select value={a.source} onChange={(e) => setAct(i, { source: e.target.value })}>
              {SRC.filter(([v]) => v !== 'textbook').map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ display: 'flex', gap: 2 }}>
              <button type="button" className="mini" onClick={() => move(i, -1)} title="위로">
                ▲
              </button>
              <button type="button" className="mini" onClick={() => move(i, 1)} title="아래로">
                ▼
              </button>
            </span>
          )}
        </div>
      ))}
      {c.activities.find((a) => a.type === 'think' && a.use) ? (
        <label>
          생각해보기 위치
          <select value={c.thinkPlace} onChange={(e) => set({ thinkPlace: e.target.value })}>
            <option value="section">주제마다</option>
            <option value="lesson">차시 끝에 한 번</option>
          </select>
        </label>
      ) : null}

      <label className="check" style={{ marginTop: 6 }}>
        <input type="checkbox" checked={pr.enabled} onChange={(e) => setPr({ enabled: e.target.checked })} /> 교사 작성 쪽 붙이기 (기출·수능특강 등)
      </label>
      {pr.enabled ? (
        <>
          <p className="hint">차시마다 2쪽 뒤에 문제를 붙여 넣을 칸("{pr.columns.join(' | ')}")을 만듭니다.</p>
          {pr.items.map((it, i) => (
            <div key={i} className="prac-row">
              <input value={it.label} onChange={(e) => setItem(i, { label: e.target.value })} placeholder="예: 기출문제" />
              <input type="number" min={0} max={8} value={it.count} onChange={(e) => setItem(i, { count: Math.max(0, Math.min(8, parseInt(e.target.value, 10) || 0)) })} title="차시당 개수" />
              <button type="button" className="mini" onClick={() => setPr({ items: pr.items.filter((_, k) => k !== i) })} title="삭제">
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="mini" onClick={() => setPr({ items: [...pr.items, { label: '모의고사', count: 1 }] })}>
            + 칸 종류 추가
          </button>
          <label>
            한 쪽에 넣을 칸 수
            <select value={pr.perPage} onChange={(e) => setPr({ perPage: parseInt(e.target.value, 10) })}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}칸
                </option>
              ))}
            </select>
          </label>
          <label>
            풀이 칸 이름 (쉼표로 구분)
            <input value={pr.columns.join(', ')} onChange={(e) => setPr({ columns: e.target.value.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 3) })} />
          </label>
        </>
      ) : null}
      {c.notes ? <p className="note-msg">구성 분석: {c.notes}</p> : null}
    </div>
  );
}
