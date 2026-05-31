import { useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import type { PlotData, Scene, Page, Panel } from './types/plot';
import { loadFromStorage, clearStorage } from './utils/storage';
import { migrateData } from './utils/migrate';
import { newId } from './utils/ids';
import { LAYOUT_TEMPLATES } from './data/layoutTemplates';
import { C, fonts } from './styles/tokens';
import { useAutoSave } from './hooks/useAutoSave';
import { SceneCard } from './components/SceneCard';
import { Sidebar } from './components/Sidebar';
import { LayoutPickerModal } from './components/LayoutPickerModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';

const SAMPLE_JSON = './data/sample.json';

type ConfirmState =
  | { type: 'scene'; sceneId: string; title: string }
  | { type: 'reset'; title: string };

function mkPanel(): Panel {
  return { id: newId(), content: '', emotion: '', lines: [] };
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<string[]>([]);
  const [workTitle, setWorkTitle] = useState('無題の作品');
  const [workTheme, setWorkTheme] = useState('');
  const [refLayouts, setRefLayouts] = useState<PlotData['refLayouts']>([]);

  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'info' | 'ref'>('info');
  const [newChar, setNewChar] = useState('');

  const [layoutPicker, setLayoutPicker] = useState<{ sceneId: string; pageId: string } | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [copyOk, setCopyOk] = useState(false);

  const plotData = useMemo<PlotData>(() => ({
    workTitle, workTheme, scenes, characters, refLayouts, nextId: 100, _format: 'manga-plot-editor-v2',
  }), [workTitle, workTheme, scenes, characters, refLayouts]);

  useAutoSave(plotData, loaded);

  // ── 初期ロード ──
  useEffect(() => {
    const stored = loadFromStorage();
    const load = (d: PlotData) => {
      setScenes(d.scenes);
      setCharacters(d.characters);
      setWorkTitle(d.workTitle);
      setWorkTheme(d.workTheme);
      setRefLayouts(d.refLayouts);
    };
    if (stored) {
      load(migrateData(stored));
    } else {
      fetch(SAMPLE_JSON)
        .then(r => r.json())
        .then((json: unknown) => load(migrateData(json)))
        .catch(() => load(migrateData({})));
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div style={{ fontFamily: fonts.body, background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSub }}>
        読み込み中...
      </div>
    );
  }

  // ── 集計 ──
  const totalPages = scenes.reduce((a, sc) => a + sc.pages.length, 0);
  const totalPanels = scenes.reduce((a, sc) => a + sc.pages.reduce((b, p) => b + p.panels.length, 0), 0);
  const speakerCount: Record<string, number> = {};
  scenes.forEach(sc => sc.pages.forEach(p => p.panels.forEach(k => k.lines.forEach(ln => {
    if (ln.speaker) speakerCount[ln.speaker] = (speakerCount[ln.speaker] ?? 0) + 1;
  }))));

  const isMobile = window.innerWidth < 768;

  // ── 場面操作 ──
  const toggleExpand = (id: string) =>
    setExpandedScenes(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const updateScene = (id: string, field: 'title' | 'plot' | 'convey', value: string) =>
    setScenes(p => p.map(s => s.id === id ? { ...s, [field]: value } : s));
  const addScene = () => {
    const id = newId();
    setScenes(p => [...p, { id, title: '新しい場面', plot: '', convey: '', pages: [] }]);
    setExpandedScenes(p => new Set(p).add(id));
  };
  const removeScene = (id: string) => {
    const sc = scenes.find(s => s.id === id);
    setConfirmState({ type: 'scene', sceneId: id, title: sc?.title ?? '場面' });
  };

  // ── ページ操作 ──
  const addPage = (sid: string) => setScenes(p => p.map(s => {
    if (s.id !== sid) return s;
    const panel = mkPanel();
    const page: Page = { id: newId(), label: `${s.pages.length + 1}P`, layoutId: 'full', heroId: panel.id, panels: [panel] };
    return { ...s, pages: [...s.pages, page] };
  }));
  const removePage = (sid: string, pid: string) => setScenes(p => p.map(s =>
    s.id === sid ? { ...s, pages: s.pages.filter(pg => pg.id !== pid).map((pg, i) => ({ ...pg, label: `${i + 1}P` })) } : s
  ));
  const setPageLayout = (sid: string, pid: string, lid: string) => {
    const tpl = LAYOUT_TEMPLATES.find(t => t.id === lid);
    if (!tpl) return;
    setScenes(p => p.map(s => {
      if (s.id !== sid) return s;
      return { ...s, pages: s.pages.map(pg => {
        if (pg.id !== pid) return pg;
        let panels = [...pg.panels];
        while (panels.length < tpl.count) panels.push(mkPanel());
        if (panels.length > tpl.count) panels = panels.slice(0, tpl.count);
        return { ...pg, layoutId: lid, panels };
      })};
    }));
    setLayoutPicker(null);
  };

  // ── コマ操作 ──
  const setHeroPanel = (sid: string, pid: string, kid: string) => setScenes(p => p.map(s =>
    s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, heroId: pg.heroId === kid ? null : kid } : pg) } : s
  ));
  const addPanel = (sid: string, pid: string) => setScenes(p => p.map(s =>
    s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: [...pg.panels, mkPanel()] } : pg) } : s
  ));
  const removePanel = (sid: string, pid: string, kid: string) => setScenes(p => p.map(s =>
    s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.filter(k => k.id !== kid) } : pg) } : s
  ));
  const updatePanel = (sid: string, pid: string, kid: string, field: 'content' | 'emotion', value: string) =>
    setScenes(p => p.map(s =>
      s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, [field]: value } : k) } : pg) } : s
    ));

  // ── セリフ操作 ──
  const addLine = (sid: string, pid: string, kid: string) => setScenes(p => p.map(s =>
    s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, lines: [...k.lines, { id: newId(), speaker: '', dialogue: '' }] } : k) } : pg) } : s
  ));
  const removeLine = (sid: string, pid: string, kid: string, lid: string) => setScenes(p => p.map(s =>
    s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, lines: k.lines.filter(ln => ln.id !== lid) } : k) } : pg) } : s
  ));
  const updateLine = (sid: string, pid: string, kid: string, lid: string, field: 'speaker' | 'dialogue', value: string) =>
    setScenes(p => p.map(s =>
      s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, lines: k.lines.map(ln => ln.id === lid ? { ...ln, [field]: value } : ln) } : k) } : pg) } : s
    ));

  // ── ドラッグ並べ替え ──
  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: DragEvent<HTMLDivElement>, id: string) => { e.preventDefault(); setDragOverId(id); };
  const onDragEnd = () => {
    if (dragId != null && dragOverId != null && dragId !== dragOverId) {
      setScenes(p => {
        const a = [...p];
        const from = a.findIndex(x => x.id === dragId);
        const to = a.findIndex(x => x.id === dragOverId);
        const [moved] = a.splice(from, 1);
        a.splice(to, 0, moved);
        return a;
      });
    }
    setDragId(null);
    setDragOverId(null);
  };

  // ── 登場人物 ──
  const addChar = () => {
    const name = newChar.trim();
    if (name && !characters.includes(name)) setCharacters(p => [...p, name]);
    setNewChar('');
  };
  const removeChar = (name: string) => setCharacters(p => p.filter(c => c !== name));

  // ── 参考コマ割り ──
  const addRefLayout = () => setRefLayouts(p => [...p, { id: newId(), name: '新しい参考', layoutId: 'h3', note: '' }]);
  const updateRefLayout = (id: string, field: 'name' | 'layoutId' | 'note', value: string) =>
    setRefLayouts(p => p.map(r => r.id === id ? { ...r, [field]: value } : r));
  const removeRefLayout = (id: string) => setRefLayouts(p => p.filter(r => r.id !== id));

  // ── エクスポート / インポート ──
  const exportData = JSON.stringify(plotData, null, 2);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
    } catch {
      const ta = document.getElementById('export-ta') as HTMLTextAreaElement | null;
      if (ta) { ta.select(); document.execCommand('copy'); }
    }
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 2000);
  };
  const handleImport = () => {
    try {
      const d = migrateData(JSON.parse(importText));
      setScenes(d.scenes);
      setCharacters(d.characters);
      setWorkTitle(d.workTitle);
      setWorkTheme(d.workTheme);
      setRefLayouts(d.refLayouts);
      setShowImport(false);
      setImportText('');
    } catch {
      alert('JSONの形式が正しくありません。');
    }
  };

  // ── 削除確認 / リセット ──
  const doConfirm = () => {
    if (!confirmState) return;
    if (confirmState.type === 'scene') {
      setScenes(p => p.filter(s => s.id !== confirmState.sceneId));
    } else {
      setScenes([]);
      setCharacters([]);
      setWorkTitle('無題の作品');
      setWorkTheme('');
      setRefLayouts([]);
      clearStorage();
    }
    setConfirmState(null);
  };

  const layoutPickerPage = layoutPicker
    ? scenes.find(sc => sc.id === layoutPicker.sceneId)?.pages.find(p => p.id === layoutPicker.pageId)
    : null;

  const badge = { background: C.accentSoft, color: C.accentDark, padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12, fontFamily: fonts.mono };

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── モーダル群 ── */}
      {layoutPicker && layoutPickerPage && (
        <LayoutPickerModal
          currentLayoutId={layoutPickerPage.layoutId}
          currentPanelCount={layoutPickerPage.panels.length}
          onSelect={lid => setPageLayout(layoutPicker.sceneId, layoutPicker.pageId, lid)}
          onClose={() => setLayoutPicker(null)}
        />
      )}
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.type === 'reset' ? 'localStorageのデータが削除されます。この操作は元に戻せません。' : 'この操作は元に戻せません。'}
          onConfirm={doConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
      {showExport && (
        <ExportModal
          data={exportData}
          copyOk={copyOk}
          onCopy={handleCopy}
          onClose={() => setShowExport(false)}
        />
      )}
      {showImport && (
        <ImportModal
          text={importText}
          onChangeText={setImportText}
          onImport={handleImport}
          onClose={() => { setShowImport(false); setImportText(''); }}
        />
      )}

      {/* ── ヘッダー ── */}
      <header style={{ background: C.card, borderBottom: `1px solid ${C.cardBorder}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: C.accent, whiteSpace: 'nowrap' }}>◇ プロットエディタ</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={badge}>{totalPages}P</span>
            <span style={badge}>{totalPanels}コマ</span>
            <span style={badge}>{scenes.length}場面</span>
          </div>
        </div>
        <button
          style={{ background: 'none', border: `1.5px solid ${C.cardBorder}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: C.textSub, lineHeight: 1 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >☰</button>
      </header>

      {/* ── メインレイアウト ── */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <div style={{ flex: 1, padding: '20px 14px 100px', maxWidth: 740, margin: '0 auto', width: '100%' }}>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C.accent}, ${C.cardBorder})`, borderRadius: 2 }} />
            {scenes.map((scene, idx) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={idx}
                isExpanded={expandedScenes.has(scene.id)}
                isDragging={dragId === scene.id}
                isDragOver={dragOverId === scene.id && dragId !== scene.id}
                characters={characters}
                onToggle={() => toggleExpand(scene.id)}
                onDragStart={() => onDragStart(scene.id)}
                onDragOver={e => onDragOver(e, scene.id)}
                onDragEnd={onDragEnd}
                onUpdateTitle={v => updateScene(scene.id, 'title', v)}
                onUpdatePlot={v => updateScene(scene.id, 'plot', v)}
                onUpdateConvey={v => updateScene(scene.id, 'convey', v)}
                onRequestDelete={() => removeScene(scene.id)}
                onAddPage={() => addPage(scene.id)}
                onOpenLayoutPicker={pid => setLayoutPicker({ sceneId: scene.id, pageId: pid })}
                onRemovePage={pid => removePage(scene.id, pid)}
                onSetHero={(pid, kid) => setHeroPanel(scene.id, pid, kid)}
                onAddPanel={pid => addPanel(scene.id, pid)}
                onRemovePanel={(pid, kid) => removePanel(scene.id, pid, kid)}
                onUpdatePanel={(pid, kid, field, value) => updatePanel(scene.id, pid, kid, field, value)}
                onAddLine={(pid, kid) => addLine(scene.id, pid, kid)}
                onRemoveLine={(pid, kid, lid) => removeLine(scene.id, pid, kid, lid)}
                onUpdateLine={(pid, kid, lid, field, value) => updateLine(scene.id, pid, kid, lid, field, value)}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <button
              style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.body }}
              onClick={addScene}
            >
              + 場面を追加
            </button>
          </div>
        </div>

        {/* ── サイドバー ── */}
        <Sidebar
          isOpen={sidebarOpen}
          isMobile={isMobile}
          tab={sidebarTab}
          onChangeTab={setSidebarTab}
          onClose={() => setSidebarOpen(false)}
          workTitle={workTitle}
          workTheme={workTheme}
          onUpdateTitle={setWorkTitle}
          onUpdateTheme={setWorkTheme}
          scenes={scenes}
          totalPages={totalPages}
          totalPanels={totalPanels}
          speakerCount={speakerCount}
          characters={characters}
          newChar={newChar}
          onChangeNewChar={setNewChar}
          onAddChar={addChar}
          onRemoveChar={removeChar}
          onShowExport={() => setShowExport(true)}
          onShowImport={() => setShowImport(true)}
          onReset={() => setConfirmState({ type: 'reset', title: '全データ' })}
          refLayouts={refLayouts}
          onAddRef={addRefLayout}
          onUpdateRef={updateRefLayout}
          onRemoveRef={removeRefLayout}
        />
      </div>
    </div>
  );
}
