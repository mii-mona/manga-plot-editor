import type { DragEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal } from './components/ConfirmModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { LayoutPickerModal } from './components/LayoutPickerModal';
import { SceneCard } from './components/SceneCard';
import { Sidebar } from './components/Sidebar';
import { LAYOUT_TEMPLATES } from './data/layoutTemplates';
import { useAutoSave } from './hooks/useAutoSave';
import type { Doc } from './hooks/useHistory';
import { useHistory } from './hooks/useHistory';
import { C, fonts } from './styles/tokens';
import type { Page, Panel, PlotData } from './types/plot';
import { newId } from './utils/ids';
import { migrateData } from './utils/migrate';
import { loadFromStorage } from './utils/storage';

const SAMPLE_JSON = './data/sample.json';

const EMPTY_DOC: Doc = {
  workTitle: '無題の作品',
  workTheme: '',
  scenes: [],
  characters: [],
  refLayouts: [],
};

type ConfirmState = { type: 'scene'; sceneId: string; title: string };

function mkPanel(): Panel {
  return { id: newId(), content: '', emotion: '', lines: [] };
}

/** PlotData（永続形式）から履歴対象の Doc 5項目を取り出す。 */
function toDoc(d: PlotData): Doc {
  return {
    workTitle: d.workTitle,
    workTheme: d.workTheme,
    scenes: d.scenes,
    characters: d.characters,
    refLayouts: d.refLayouts,
  };
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const { doc, update, undo, redo, canUndo, canRedo, resetBaseline } = useHistory(EMPTY_DOC);
  const { scenes, characters, workTitle, workTheme, refLayouts } = doc;

  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'info' | 'ref'>('info');
  const [newChar, setNewChar] = useState('');

  const [layoutPicker, setLayoutPicker] = useState<{ sceneId: string; pageId: string } | null>(
    null
  );
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [copyOk, setCopyOk] = useState(false);

  const plotData = useMemo<PlotData>(
    () => ({
      workTitle,
      workTheme,
      scenes,
      characters,
      refLayouts,
      nextId: 100,
      _format: 'manga-plot-editor-v2',
    }),
    [workTitle, workTheme, scenes, characters, refLayouts]
  );

  useAutoSave(plotData, loaded);

  // ── 初期ロード ──
  useEffect(() => {
    const stored = loadFromStorage();
    const load = (d: PlotData) => resetBaseline(toDoc(d));
    if (stored) {
      load(migrateData(stored));
      setLoaded(true);
    } else {
      fetch(SAMPLE_JSON)
        .then((r) => r.json())
        .then((json: unknown) => load(migrateData(json)))
        .catch(() => load(migrateData({})))
        .finally(() => setLoaded(true));
    }
  }, [resetBaseline]);

  // ── グローバル undo/redo キー操作（モーダル中は無効） ──
  useEffect(() => {
    const modalOpen = !!layoutPicker || !!confirmState || showExport || showImport;
    const onKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [layoutPicker, confirmState, showExport, showImport, undo, redo]);

  if (!loaded) {
    return (
      <div
        style={{
          fontFamily: fonts.body,
          background: C.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.textSub,
        }}
      >
        読み込み中...
      </div>
    );
  }

  // ── 集計 ──
  const totalPages = scenes.reduce((a, sc) => a + sc.pages.length, 0);
  const totalPanels = scenes.reduce(
    (a, sc) => a + sc.pages.reduce((b, p) => b + p.panels.length, 0),
    0
  );
  const speakerCount: Record<string, number> = {};
  scenes.forEach((sc) => {
    sc.pages.forEach((p) => {
      p.panels.forEach((k) => {
        k.lines.forEach((ln) => {
          if (ln.speaker) speakerCount[ln.speaker] = (speakerCount[ln.speaker] ?? 0) + 1;
        });
      });
    });
  });

  const isMobile = window.innerWidth < 768;

  // ── 場面操作 ──
  const toggleExpand = (id: string) =>
    setExpandedScenes((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const updateScene = (id: string, field: 'title' | 'plot' | 'convey', value: string) =>
    update(
      (d) => ({ ...d, scenes: d.scenes.map((s) => (s.id === id ? { ...s, [field]: value } : s)) }),
      { transient: true, scope: `scene:${id}:${field}` }
    );
  const addScene = () => {
    const id = newId();
    update((d) => ({
      ...d,
      scenes: [...d.scenes, { id, title: '新しい場面', plot: '', convey: '', pages: [] }],
    }));
    setExpandedScenes((p) => new Set(p).add(id));
  };
  const removeScene = (id: string) => {
    const sc = scenes.find((s) => s.id === id);
    setConfirmState({ type: 'scene', sceneId: id, title: sc?.title ?? '場面' });
  };

  // ── ページ操作 ──
  const addPage = (sid: string) =>
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) => {
        if (s.id !== sid) return s;
        const panel = mkPanel();
        const page: Page = {
          id: newId(),
          label: `${s.pages.length + 1}P`,
          layoutId: 'full',
          heroId: panel.id,
          panels: [panel],
        };
        return { ...s, pages: [...s.pages, page] };
      }),
    }));
  const removePage = (sid: string, pid: string) =>
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) =>
        s.id === sid
          ? {
              ...s,
              pages: s.pages
                .filter((pg) => pg.id !== pid)
                .map((pg, i) => ({ ...pg, label: `${i + 1}P` })),
            }
          : s
      ),
    }));
  const setPageLayout = (sid: string, pid: string, lid: string) => {
    const tpl = LAYOUT_TEMPLATES.find((t) => t.id === lid);
    if (!tpl) return;
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) => {
        if (s.id !== sid) return s;
        return {
          ...s,
          pages: s.pages.map((pg) => {
            if (pg.id !== pid) return pg;
            let panels = [...pg.panels];
            while (panels.length < tpl.count) panels.push(mkPanel());
            if (panels.length > tpl.count) panels = panels.slice(0, tpl.count);
            const remainingIds = new Set(panels.map((k) => k.id));
            const heroId = pg.heroId && remainingIds.has(pg.heroId) ? pg.heroId : null;
            return { ...pg, layoutId: lid, panels, heroId };
          }),
        };
      }),
    }));
    setLayoutPicker(null);
  };

  // ── コマ操作 ──
  const setHeroPanel = (sid: string, pid: string, kid: string) =>
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) =>
        s.id === sid
          ? {
              ...s,
              pages: s.pages.map((pg) =>
                pg.id === pid ? { ...pg, heroId: pg.heroId === kid ? null : kid } : pg
              ),
            }
          : s
      ),
    }));
  const addPanel = (sid: string, pid: string) =>
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) =>
        s.id === sid
          ? {
              ...s,
              pages: s.pages.map((pg) =>
                pg.id === pid ? { ...pg, panels: [...pg.panels, mkPanel()] } : pg
              ),
            }
          : s
      ),
    }));
  const removePanel = (sid: string, pid: string, kid: string) =>
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) =>
        s.id === sid
          ? {
              ...s,
              pages: s.pages.map((pg) =>
                pg.id === pid
                  ? {
                      ...pg,
                      panels: pg.panels.filter((k) => k.id !== kid),
                      heroId: pg.heroId === kid ? null : pg.heroId,
                    }
                  : pg
              ),
            }
          : s
      ),
    }));
  const updatePanel = (
    sid: string,
    pid: string,
    kid: string,
    field: 'content' | 'emotion',
    value: string
  ) =>
    update(
      (d) => ({
        ...d,
        scenes: d.scenes.map((s) =>
          s.id === sid
            ? {
                ...s,
                pages: s.pages.map((pg) =>
                  pg.id === pid
                    ? {
                        ...pg,
                        panels: pg.panels.map((k) => (k.id === kid ? { ...k, [field]: value } : k)),
                      }
                    : pg
                ),
              }
            : s
        ),
      }),
      { transient: true, scope: `panel:${kid}:${field}` }
    );

  // ── セリフ操作 ──
  const addLine = (sid: string, pid: string, kid: string) =>
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) =>
        s.id === sid
          ? {
              ...s,
              pages: s.pages.map((pg) =>
                pg.id === pid
                  ? {
                      ...pg,
                      panels: pg.panels.map((k) =>
                        k.id === kid
                          ? {
                              ...k,
                              lines: [...k.lines, { id: newId(), speaker: '', dialogue: '' }],
                            }
                          : k
                      ),
                    }
                  : pg
              ),
            }
          : s
      ),
    }));
  const removeLine = (sid: string, pid: string, kid: string, lid: string) =>
    update((d) => ({
      ...d,
      scenes: d.scenes.map((s) =>
        s.id === sid
          ? {
              ...s,
              pages: s.pages.map((pg) =>
                pg.id === pid
                  ? {
                      ...pg,
                      panels: pg.panels.map((k) =>
                        k.id === kid ? { ...k, lines: k.lines.filter((ln) => ln.id !== lid) } : k
                      ),
                    }
                  : pg
              ),
            }
          : s
      ),
    }));
  const updateLine = (
    sid: string,
    pid: string,
    kid: string,
    lid: string,
    field: 'speaker' | 'dialogue',
    value: string
  ) =>
    update(
      (d) => ({
        ...d,
        scenes: d.scenes.map((s) =>
          s.id === sid
            ? {
                ...s,
                pages: s.pages.map((pg) =>
                  pg.id === pid
                    ? {
                        ...pg,
                        panels: pg.panels.map((k) =>
                          k.id === kid
                            ? {
                                ...k,
                                lines: k.lines.map((ln) =>
                                  ln.id === lid ? { ...ln, [field]: value } : ln
                                ),
                              }
                            : k
                        ),
                      }
                    : pg
                ),
              }
            : s
        ),
      }),
      { transient: true, scope: `line:${lid}:${field}` }
    );

  // ── ドラッグ並べ替え ──
  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const onDragEnd = () => {
    if (dragId != null && dragOverId != null && dragId !== dragOverId) {
      update((d) => {
        const a = [...d.scenes];
        const from = a.findIndex((x) => x.id === dragId);
        const to = a.findIndex((x) => x.id === dragOverId);
        const [moved] = a.splice(from, 1);
        a.splice(to, 0, moved);
        return { ...d, scenes: a };
      });
    }
    setDragId(null);
    setDragOverId(null);
  };

  // ── 登場人物 ──
  const addChar = () => {
    const name = newChar.trim();
    if (name && !characters.includes(name))
      update((d) => ({ ...d, characters: [...d.characters, name] }));
    setNewChar('');
  };
  const removeChar = (name: string) =>
    update((d) => ({ ...d, characters: d.characters.filter((c) => c !== name) }));

  // ── 参考コマ割り ──
  const addRefLayout = () =>
    update((d) => ({
      ...d,
      refLayouts: [...d.refLayouts, { id: newId(), name: '新しい参考', layoutId: 'h3', note: '' }],
    }));
  const updateRefLayout = (id: string, field: 'name' | 'layoutId' | 'note', value: string) =>
    update(
      (d) => ({
        ...d,
        refLayouts: d.refLayouts.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
      }),
      // layoutId はセレクト操作なので即コミット。name / note は自由入力なので transient。
      field === 'layoutId' ? undefined : { transient: true, scope: `ref:${id}:${field}` }
    );
  const removeRefLayout = (id: string) =>
    update((d) => ({ ...d, refLayouts: d.refLayouts.filter((r) => r.id !== id) }));

  // ── 作品情報 ──
  const setWorkTitle = (v: string) =>
    update((d) => ({ ...d, workTitle: v }), { transient: true, scope: 'work:title' });
  const setWorkTheme = (v: string) =>
    update((d) => ({ ...d, workTheme: v }), { transient: true, scope: 'work:theme' });

  // ── エクスポート / インポート ──
  const exportData = JSON.stringify(plotData, null, 2);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
    } catch {
      const ta = document.getElementById('export-ta') as HTMLTextAreaElement | null;
      if (ta) {
        ta.select();
        document.execCommand('copy');
      }
    }
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 2000);
  };
  const handleImport = () => {
    try {
      const d = migrateData(JSON.parse(importText));
      resetBaseline(toDoc(d));
      setShowImport(false);
      setImportText('');
    } catch {
      alert('JSONの形式が正しくありません。');
    }
  };

  // ── 削除確認 ──
  const doConfirm = () => {
    if (!confirmState) return;
    update((d) => ({ ...d, scenes: d.scenes.filter((s) => s.id !== confirmState.sceneId) }));
    setConfirmState(null);
  };

  const layoutPickerPage = layoutPicker
    ? scenes
        .find((sc) => sc.id === layoutPicker.sceneId)
        ?.pages.find((p) => p.id === layoutPicker.pageId)
    : null;

  const badge = {
    background: C.accentSoft,
    color: C.accentDark,
    padding: '2px 10px',
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 12,
    fontFamily: fonts.mono,
  };

  const historyBtn = (enabled: boolean) => ({
    background: 'none',
    border: `1.5px solid ${C.cardBorder}`,
    borderRadius: 8,
    padding: '6px 10px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: 16,
    color: enabled ? C.textSub : C.cardBorder,
    lineHeight: 1,
    opacity: enabled ? 1 : 0.5,
  });

  return (
    <div
      style={{
        fontFamily: fonts.body,
        color: C.text,
        background: C.bg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── モーダル群 ── */}
      {layoutPicker && layoutPickerPage && (
        <LayoutPickerModal
          currentLayoutId={layoutPickerPage.layoutId}
          currentPanelCount={layoutPickerPage.panels.length}
          onSelect={(lid) => setPageLayout(layoutPicker.sceneId, layoutPicker.pageId, lid)}
          onClose={() => setLayoutPicker(null)}
        />
      )}
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
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
          onClose={() => {
            setShowImport(false);
            setImportText('');
          }}
        />
      )}

      {/* ── ヘッダー ── */}
      <header
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.cardBorder}`,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: fonts.display,
              fontSize: 16,
              fontWeight: 700,
              color: C.accent,
              whiteSpace: 'nowrap',
            }}
          >
            ◇ プロットエディタ
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={badge}>{totalPages}P</span>
            <span style={badge}>{totalPanels}コマ</span>
            <span style={badge}>{scenes.length}場面</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            type="button"
            style={historyBtn(canUndo)}
            onClick={undo}
            disabled={!canUndo}
            title="元に戻す (Ctrl+Z)"
            aria-label="元に戻す"
          >
            ↩︎
          </button>
          <button
            type="button"
            style={historyBtn(canRedo)}
            onClick={redo}
            disabled={!canRedo}
            title="やり直す (Ctrl+Shift+Z)"
            aria-label="やり直す"
          >
            ↪︎
          </button>
          <button
            type="button"
            style={{
              background: 'none',
              border: `1.5px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: 16,
              color: C.textSub,
              lineHeight: 1,
            }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* ── メインレイアウト ── */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <div
          style={{
            flex: 1,
            padding: '20px 14px 100px',
            maxWidth: 740,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div
              style={{
                position: 'absolute',
                left: 11,
                top: 0,
                bottom: 0,
                width: 2,
                background: `linear-gradient(to bottom, ${C.accent}, ${C.cardBorder})`,
                borderRadius: 2,
              }}
            />
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
                onDragOver={(e) => onDragOver(e, scene.id)}
                onDragEnd={onDragEnd}
                onUpdateTitle={(v) => updateScene(scene.id, 'title', v)}
                onUpdatePlot={(v) => updateScene(scene.id, 'plot', v)}
                onUpdateConvey={(v) => updateScene(scene.id, 'convey', v)}
                onRequestDelete={() => removeScene(scene.id)}
                onAddPage={() => addPage(scene.id)}
                onOpenLayoutPicker={(pid) => setLayoutPicker({ sceneId: scene.id, pageId: pid })}
                onRemovePage={(pid) => removePage(scene.id, pid)}
                onSetHero={(pid, kid) => setHeroPanel(scene.id, pid, kid)}
                onAddPanel={(pid) => addPanel(scene.id, pid)}
                onRemovePanel={(pid, kid) => removePanel(scene.id, pid, kid)}
                onUpdatePanel={(pid, kid, field, value) =>
                  updatePanel(scene.id, pid, kid, field, value)
                }
                onAddLine={(pid, kid) => addLine(scene.id, pid, kid)}
                onRemoveLine={(pid, kid, lid) => removeLine(scene.id, pid, kid, lid)}
                onUpdateLine={(pid, kid, lid, field, value) =>
                  updateLine(scene.id, pid, kid, lid, field, value)
                }
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <button
              type="button"
              style={{
                background: C.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: fonts.body,
              }}
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
          refLayouts={refLayouts}
          onAddRef={addRefLayout}
          onUpdateRef={updateRefLayout}
          onRemoveRef={removeRefLayout}
        />
      </div>
    </div>
  );
}
