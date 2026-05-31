import { useEffect, useState } from 'react';
import type { PlotData } from './types/plot';
import { loadFromStorage } from './utils/storage';
import { migrateData } from './utils/migrate';
import { C, fonts } from './styles/tokens';

export default function App() {
  const [data, setData] = useState<PlotData | null>(null);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setData(migrateData(stored));
      return;
    }
    fetch('./data/sample.json')
      .then(r => r.json())
      .then((json: unknown) => setData(migrateData(json)))
      .catch(() => setData(migrateData({})));
  }, []);

  if (!data) {
    return (
      <div style={{ fontFamily: fonts.body, background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSub }}>
        読み込み中...
      </div>
    );
  }

  const totalPages = data.scenes.reduce((a, sc) => a + sc.pages.length, 0);
  const totalPanels = data.scenes.reduce((a, sc) => a + sc.pages.reduce((b, p) => b + p.panels.length, 0), 0);

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: C.card, borderBottom: `1px solid ${C.cardBorder}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: C.accent, whiteSpace: 'nowrap' }}>
          ◇ プロットエディタ
        </span>
        <span style={{ fontSize: 14, color: C.text, flex: 1 }}>{data.workTitle}</span>
        <span style={{ background: C.accentSoft, color: C.accentDark, padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12, fontFamily: fonts.mono }}>{totalPages}P</span>
        <span style={{ background: C.accentSoft, color: C.accentDark, padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12, fontFamily: fonts.mono }}>{totalPanels}コマ</span>
        <span style={{ background: C.accentSoft, color: C.accentDark, padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12, fontFamily: fonts.mono }}>{data.scenes.length}場面</span>
      </header>

      <main style={{ flex: 1, padding: '20px 14px 100px', maxWidth: 740, margin: '0 auto', width: '100%' }}>
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C.accent}, ${C.cardBorder})`, borderRadius: 2 }} />
          {data.scenes.map((scene, idx) => (
            <div key={scene.id} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, marginBottom: 12, padding: '12px 14px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: -28, top: 18, width: 12, height: 12, borderRadius: '50%', background: C.accent, border: `2.5px solid ${C.card}`, boxShadow: `0 0 0 2px ${C.accent}`, zIndex: 2 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 11, color: C.accent, fontWeight: 700, minWidth: 26 }}>#{idx + 1}</span>
                <span style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 600, flex: 1 }}>{scene.title}</span>
                <span style={{ fontSize: 12, color: C.textSub }}>{scene.pages.length}P</span>
                <span style={{ fontSize: 12, color: C.textSub }}>·</span>
                <span style={{ fontSize: 12, color: C.textSub }}>{scene.pages.reduce((a, p) => a + p.panels.length, 0)}コマ</span>
              </div>
              {scene.convey && (
                <p style={{ fontSize: 12, color: C.textSub, marginTop: 4, paddingLeft: 34, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scene.convey}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
