import { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = "manga-plot-editor-v2";

const LAYOUT_TEMPLATES = [
  { id: "full", name: "1コマ（全面）", count: 1, panels: [{ x: 0, y: 0, w: 100, h: 100 }] },
  { id: "v2", name: "縦2分割", count: 2, panels: [{ x: 50, y: 0, w: 50, h: 100 }, { x: 0, y: 0, w: 50, h: 100 }] },
  { id: "h2", name: "横2段", count: 2, panels: [{ x: 0, y: 0, w: 100, h: 50 }, { x: 0, y: 50, w: 100, h: 50 }] },
  { id: "h3", name: "横3段", count: 3, panels: [{ x: 0, y: 0, w: 100, h: 33 }, { x: 0, y: 33, w: 100, h: 34 }, { x: 0, y: 67, w: 100, h: 33 }] },
  { id: "t2b1", name: "上2＋下1", count: 3, panels: [{ x: 50, y: 0, w: 50, h: 50 }, { x: 0, y: 0, w: 50, h: 50 }, { x: 0, y: 50, w: 100, h: 50 }] },
  { id: "t1b2", name: "上1＋下2", count: 3, panels: [{ x: 0, y: 0, w: 100, h: 50 }, { x: 50, y: 50, w: 50, h: 50 }, { x: 0, y: 50, w: 50, h: 50 }] },
  { id: "grid4", name: "4コマ格子", count: 4, panels: [{ x: 50, y: 0, w: 50, h: 50 }, { x: 0, y: 0, w: 50, h: 50 }, { x: 50, y: 50, w: 50, h: 50 }, { x: 0, y: 50, w: 50, h: 50 }] },
  { id: "L_right", name: "L字（右大）", count: 3, panels: [{ x: 45, y: 0, w: 55, h: 100 }, { x: 0, y: 0, w: 45, h: 50 }, { x: 0, y: 50, w: 45, h: 50 }] },
  { id: "L_left", name: "L字（左大）", count: 3, panels: [{ x: 55, y: 0, w: 45, h: 50 }, { x: 55, y: 50, w: 45, h: 50 }, { x: 0, y: 0, w: 55, h: 100 }] },
  { id: "h5_dynamic", name: "5コマ変則", count: 5, panels: [{ x: 60, y: 0, w: 40, h: 40 }, { x: 0, y: 0, w: 60, h: 40 }, { x: 40, y: 40, w: 60, h: 30 }, { x: 0, y: 40, w: 40, h: 30 }, { x: 0, y: 70, w: 100, h: 30 }] },
  { id: "top_wide", name: "上ワイド＋下3", count: 4, panels: [{ x: 0, y: 0, w: 100, h: 45 }, { x: 67, y: 45, w: 33, h: 55 }, { x: 33, y: 45, w: 34, h: 55 }, { x: 0, y: 45, w: 33, h: 55 }] },
  { id: "diagonal3", name: "段差3コマ", count: 3, panels: [{ x: 0, y: 0, w: 55, h: 35 }, { x: 20, y: 35, w: 80, h: 30 }, { x: 0, y: 65, w: 65, h: 35 }] },
];

const INITIAL_SCENES = [
  {
    id: 1, title: "出会い", plot: "港町で偶然の再会。互いに驚くが、バギーがすぐ虚勢を張る。", convey: "時間は経ったが、空気はあの頃のまま。",
    pages: [
      { id: "p1", label: "1P", layoutId: "h2", heroId: "k2", panels: [
        { id: "k1", content: "港の遠景", emotion: "静けさ、予感", lines: [] },
        { id: "k2", content: "バギー振り返る", emotion: "動揺→虚勢で隠す", lines: [{ id: "l1", speaker: "バギー", dialogue: "…なんでお前がここにいんだよ" }] },
      ]},
      { id: "p2", label: "2P", layoutId: "full", heroId: "k3", panels: [
        { id: "k3", content: "シャンクスの笑顔", emotion: "懐かしさ、変わらない余裕", lines: [{ id: "l2", speaker: "シャンクス", dialogue: "久しぶりだな" }, { id: "l3", speaker: "バギー", dialogue: "…近づくな" }] },
      ]},
    ],
  },
  {
    id: 2, title: "焚き火", plot: "昔話をして笑う。バギーが眠くなり、警戒が落ちる。", convey: "二人にはまだ昔の呼吸が残っている。でも戻れるわけではない。",
    pages: [{ id: "p3", label: "1P", layoutId: "t1b2", heroId: "k5", panels: [
      { id: "k4", content: "焚き火を囲む二人", emotion: "ぎこちなさ→ほぐれる", lines: [{ id: "l4", speaker: "シャンクス", dialogue: "覚えてるか？あの嵐の夜" }, { id: "l5", speaker: "バギー", dialogue: "…忘れるわけねぇだろ" }] },
      { id: "k5", content: "肩を借りる", emotion: "無防備、信頼の残り火", lines: [] },
      { id: "k6", content: "シャンクスが見下ろす", emotion: "言えない優しさ", lines: [] },
    ]}],
  },
  {
    id: 3, title: "朝", plot: "目が覚めたらシャンクスがいない。上着だけが残っている。", convey: "選ばなかったことの重さ。残されたものの温度。",
    pages: [{ id: "p4", label: "1P", layoutId: "full", heroId: "k7", panels: [
      { id: "k7", content: "朝日・一人", emotion: "喪失、でも怒りで蓋をする", lines: [{ id: "l6", speaker: "バギー", dialogue: "……バカが" }] },
    ]}],
  },
];
const CHARACTERS = ["シャンクス", "バギー"];
const INITIAL_REFS = [
  { id: "ref1", name: "王道バトル見開き", layoutId: "L_right", note: "ジャンプ系。右に大ゴマでインパクト、左に反応" },
  { id: "ref2", name: "静かな会話", layoutId: "h3", note: "横3段で淡々と。感情を抑えた距離感" },
];

const C = {
  bg: "#F6F1EB", card: "#FFFDF9", cardBorder: "#E8DFD3",
  accent: "#C2785C", accentSoft: "#EADDD4", accentDark: "#9B5A3F",
  text: "#3A302A", textSub: "#8C7E72",
  conveyBg: "#FFF5EC", conveyBorder: "#F0D9C4",
  emotionBg: "#F3F0FF", emotionBorder: "#D8D0F0", emotionText: "#6B5CA5",
  pageBg: "#F9F5F0", panelBg: "#FFFFFF", panelBorder: "#E8DFD3",
  sidebar: "#FAF7F3", danger: "#D4564E", success: "#6BA368",
  hero: "#E8A838", heroBg: "#FFF8E8", heroBorder: "#F0C860",
};
const fonts = { display: "'Noto Serif JP','Georgia',serif", body: "'Noto Sans JP','Helvetica Neue',sans-serif", mono: "'Source Code Pro',monospace" };

function LayoutPreview({ layoutId, size = 48, active, onClick }) {
  const tpl = LAYOUT_TEMPLATES.find(t => t.id === layoutId);
  if (!tpl) return null;
  return (
    <div onClick={onClick} style={{ width: size, height: size * 1.41, position: "relative", borderRadius: 4, border: `2px solid ${active ? C.accent : C.cardBorder}`, background: "#fff", cursor: onClick ? "pointer" : "default", overflow: "hidden", flexShrink: 0, boxShadow: active ? `0 0 0 2px ${C.accentSoft}` : "none" }}>
      {tpl.panels.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%`, background: active ? C.accentSoft : C.cardBorder, border: `0.5px solid ${active ? C.accent : "#d0c8bc"}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(7, size * 0.14), color: active ? C.accent : C.textSub, fontWeight: 700, fontFamily: fonts.mono }}>{i + 1}</div>
      ))}
    </div>
  );
}

function PageLayoutMap({ layoutId, panels, size = 110, heroId }) {
  const tpl = LAYOUT_TEMPLATES.find(t => t.id === layoutId);
  if (!tpl) return null;
  const colors = ["#C2785C", "#6BA368", "#5B8DB8", "#D4A03E", "#9B5CA5", "#D4564E"];
  const multi = tpl.panels.length > 1;
  return (
    <div style={{ width: size, height: size * 1.41, position: "relative", borderRadius: 6, border: `2px solid ${C.cardBorder}`, background: "#fff", overflow: "hidden", flexShrink: 0 }}>
      {tpl.panels.map((p, i) => {
        const panel = panels[i]; const color = colors[i % colors.length]; const isHero = panel && panel.id === heroId;
        return (
          <div key={i} style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%`,
            background: isHero ? `${C.hero}30` : `${color}15`,
            border: isHero ? `2.5px solid ${C.hero}` : `1px solid ${color}50`,
            boxSizing: "border-box", padding: 3, overflow: "hidden",
            display: "flex", flexDirection: "column", gap: 1,
          }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: isHero ? C.hero : color, fontFamily: fonts.mono }}>{i + 1}</span>
            {panel && (<>
              <span style={{ fontSize: 7, color: C.text, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{panel.content}</span>
              {isHero && multi && <span style={{ fontSize: 5, color: C.hero, fontWeight: 700 }}>見せゴマ</span>}
            </>)}
          </div>
        );
      })}
    </div>
  );
}

export default function MangaPlotEditor() {
  const [scenes, setScenes] = useState(INITIAL_SCENES);
  const [characters, setCharacters] = useState(CHARACTERS);
  const [workTitle, setWorkTitle] = useState("無題の作品");
  const [workTheme, setWorkTheme] = useState("");
  const [refLayouts, setRefLayouts] = useState(INITIAL_REFS);
  const [expandedScenes, setExpandedScenes] = useState(new Set([1]));
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("info");
  const [newChar, setNewChar] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [layoutPicker, setLayoutPicker] = useState(null);
  const [showAllTpl, setShowAllTpl] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [copyOk, setCopyOk] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'scene'|'page', sceneId, pageId?, title }
  const nextId = useRef(100);

  const migrate = (sc) => sc.map(s => ({ ...s, pages: s.pages.map(pg => ({ ...pg, heroId: pg.heroId || null, panels: pg.panels.map(k => {
    if (k.lines) return k;
    const lines = k.speaker ? [{ id: `l${++nextId.current}`, speaker: k.speaker, dialogue: k.dialogue || "" }] : [];
    const { speaker, dialogue, ...rest } = k;
    return { ...rest, lines };
  }) })) }));

  const totalPages = scenes.reduce((a, sc) => a + sc.pages.length, 0);
  const totalPanels = scenes.reduce((a, sc) => a + sc.pages.reduce((b, p) => b + p.panels.length, 0), 0);
  const speakerCount = {};
  scenes.forEach(sc => sc.pages.forEach(p => p.panels.forEach(k => (k.lines || []).forEach(ln => { if (ln.speaker) speakerCount[ln.speaker] = (speakerCount[ln.speaker] || 0) + 1; }))));

  const toggleExpand = id => setExpandedScenes(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const updateScene = (id, f, v) => setScenes(p => p.map(s => s.id === id ? { ...s, [f]: v } : s));
  const addScene = () => { const id = ++nextId.current; setScenes(p => [...p, { id, title: "新しい場面", plot: "", convey: "", pages: [] }]); setExpandedScenes(p => new Set(p).add(id)); };
  const removeScene = id => { const sc = scenes.find(s => s.id === id); setConfirmDelete({ type: "scene", sceneId: id, title: sc?.title || "場面" }); };
  const mkPanel = () => ({ id: `k${++nextId.current}`, content: "", emotion: "", lines: [] });

  const addPage = sid => setScenes(p => p.map(s => { if (s.id !== sid) return s; const panel = mkPanel(); return { ...s, pages: [...s.pages, { id: `p${++nextId.current}`, label: `${s.pages.length + 1}P`, layoutId: "full", heroId: panel.id, panels: [panel] }] }; }));
  const removePage = (sid, pid) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.filter(pg => pg.id !== pid).map((pg, i) => ({ ...pg, label: `${i + 1}P` })) } : s));
  const setPageLayout = (sid, pid, lid) => {
    const tpl = LAYOUT_TEMPLATES.find(t => t.id === lid); if (!tpl) return;
    setScenes(p => p.map(s => { if (s.id !== sid) return s; return { ...s, pages: s.pages.map(pg => { if (pg.id !== pid) return pg; let panels = [...pg.panels]; while (panels.length < tpl.panels.length) panels.push(mkPanel()); if (panels.length > tpl.panels.length) panels = panels.slice(0, tpl.panels.length); return { ...pg, layoutId: lid, panels }; }) }; })); setLayoutPicker(null);
  };
  const addPanel = (sid, pid) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: [...pg.panels, mkPanel()] } : pg) } : s));
  const removePanel = (sid, pid, kid) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.filter(k => k.id !== kid) } : pg) } : s));
  const updatePanel = (sid, pid, kid, f, v) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, [f]: v } : k) } : pg) } : s));
  const setHeroPanel = (sid, pid, kid) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, heroId: pg.heroId === kid ? null : kid } : pg) } : s));

  const addLine = (sid, pid, kid) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, lines: [...(k.lines || []), { id: `l${++nextId.current}`, speaker: "", dialogue: "" }] } : k) } : pg) } : s));
  const removeLine = (sid, pid, kid, lid) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, lines: (k.lines || []).filter(ln => ln.id !== lid) } : k) } : pg) } : s));
  const updateLine = (sid, pid, kid, lid, f, v) => setScenes(p => p.map(s => s.id === sid ? { ...s, pages: s.pages.map(pg => pg.id === pid ? { ...pg, panels: pg.panels.map(k => k.id === kid ? { ...k, lines: (k.lines || []).map(ln => ln.id === lid ? { ...ln, [f]: v } : ln) } : k) } : pg) } : s));

  const onDragStart = id => setDragId(id);
  const onDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const onDragEnd = () => { if (dragId != null && dragOverId != null && dragId !== dragOverId) { setScenes(p => { const a = [...p]; const f = a.findIndex(x => x.id === dragId); const t = a.findIndex(x => x.id === dragOverId); const [m] = a.splice(f, 1); a.splice(t, 0, m); return a; }); } setDragId(null); setDragOverId(null); };

  const addRef = () => setRefLayouts(p => [...p, { id: `ref${++nextId.current}`, name: "新しい参考", layoutId: "h3", note: "" }]);
  const updateRef = (id, f, v) => setRefLayouts(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));
  const removeRef = id => setRefLayouts(p => p.filter(r => r.id !== id));

  const buildData = () => JSON.stringify({ scenes, characters, workTitle, workTheme, refLayouts, nextId: nextId.current, _format: "manga-plot-editor-v2" }, null, 2);
  const handleCopy = async () => { try { await navigator.clipboard.writeText(buildData()); setCopyOk(true); setTimeout(() => setCopyOk(false), 2000); } catch (e) { const ta = document.getElementById("export-ta"); if (ta) { ta.select(); document.execCommand("copy"); setCopyOk(true); setTimeout(() => setCopyOk(false), 2000); } } };
  const handleImportSubmit = () => { try { const d = JSON.parse(importText); if (d.scenes) setScenes(migrate(d.scenes)); if (d.characters) setCharacters(d.characters); if (d.workTitle) setWorkTitle(d.workTitle); if (d.workTheme !== undefined) setWorkTheme(d.workTheme); if (d.refLayouts) setRefLayouts(d.refLayouts); if (d.nextId) nextId.current = d.nextId; setShowImport(false); setImportText(""); } catch (e) { alert("JSONの形式が正しくありません。"); } };
  const handleReset = () => { setConfirmDelete({ type: "reset", title: "全データ" }); };
  const doDelete = () => { if (!confirmDelete) return; if (confirmDelete.type === "scene") setScenes(p => p.filter(s => s.id !== confirmDelete.sceneId)); if (confirmDelete.type === "reset") { setScenes(INITIAL_SCENES); setCharacters(CHARACTERS); setWorkTitle("無題の作品"); setWorkTheme(""); setRefLayouts(INITIAL_REFS); nextId.current = 100; } setConfirmDelete(null); };

  const st = {
    label: { fontSize: 11, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "block" },
    textarea: { width: "100%", border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "8px 10px", fontFamily: fonts.body, fontSize: 13, color: C.text, resize: "vertical", outline: "none", minHeight: 44, background: C.card, lineHeight: 1.6, boxSizing: "border-box" },
    btnS: { background: "none", border: `1px dashed ${C.cardBorder}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.textSub, cursor: "pointer", fontFamily: fonts.body },
    btnD: { background: "none", border: "none", color: C.danger, fontSize: 14, cursor: "pointer", padding: "2px 6px", borderRadius: 4, lineHeight: 1 },
    inp: { border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "4px 8px", fontSize: 12, fontFamily: fonts.body, color: C.text, outline: "none", flex: 1, minWidth: 60, background: "#fff" },
    sel: { border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "4px 8px", fontSize: 12, fontFamily: fonts.body, color: C.text, outline: "none", background: "#fff", minWidth: 72 },
    badge: { background: C.accentSoft, color: C.accentDark, padding: "2px 10px", borderRadius: 20, fontWeight: 600, fontSize: 12, fontFamily: fonts.mono },
    sInp: { width: "100%", border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: fonts.body, color: C.text, outline: "none", background: "#fff", boxSizing: "border-box" },
    secT: { fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${C.cardBorder}` },
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const LayoutPickerModal = () => {
    if (!layoutPicker) return null;
    const page = scenes.find(sc => sc.id === layoutPicker.sceneId)?.pages.find(p => p.id === layoutPicker.pageId);
    if (!page) return null;
    const cc = page.panels.length;
    const matched = LAYOUT_TEMPLATES.filter(t => t.count === cc);
    const others = LAYOUT_TEMPLATES.filter(t => t.count !== cc);
    const grouped = {}; others.forEach(t => { (grouped[t.count] = grouped[t.count] || []).push(t); });
    const renderTpl = tpl => (
      <div key={tpl.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <LayoutPreview layoutId={tpl.id} size={48} active={page.layoutId === tpl.id} onClick={() => setPageLayout(layoutPicker.sceneId, layoutPicker.pageId, tpl.id)} />
        <span style={{ fontSize: 9, color: page.layoutId === tpl.id ? C.accent : C.textSub, fontWeight: page.layoutId === tpl.id ? 700 : 400, textAlign: "center", maxWidth: 52 }}>{tpl.name}</span>
      </div>
    );
    return (<>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 }} onClick={() => setLayoutPicker(null)} />
      <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 210, background: C.card, borderRadius: 16, padding: "20px 22px", maxWidth: 400, width: "90vw", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700 }}>コマ割りテンプレート</span><button style={st.btnD} onClick={() => setLayoutPicker(null)}>✕</button></div>
        <p style={{ fontSize: 11, color: C.textSub, marginBottom: 12 }}>右→左の読み順</p>
        {matched.length > 0 && (<><div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 8 }}>現在のコマ数に合うレイアウト（{cc}コマ）</div><div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 14 }}>{matched.map(renderTpl)}</div></>)}
        <button onClick={() => setShowAllTpl(!showAllTpl)} style={{ ...st.btnS, width: "100%", marginBottom: 10, textAlign: "center", fontSize: 11 }}>{showAllTpl ? "▲ 閉じる" : "▼ 他のコマ数のレイアウトも見る"}</button>
        {showAllTpl && Object.entries(grouped).sort(([a],[b]) => a - b).map(([count, tpls]) => (<div key={count} style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>{count}コマ</div><div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>{tpls.map(renderTpl)}</div></div>))}
      </div>
    </>);
  };

  const SidebarInfo = () => (<>
    <div style={st.secT}>作品情報</div>
    <div style={{ marginBottom: 12 }}><span style={st.label}>タイトル</span><input style={st.sInp} value={workTitle} onChange={e => setWorkTitle(e.target.value)} /></div>
    <div style={{ marginBottom: 20 }}><span style={st.label}>テーマ・メモ</span><textarea style={{ ...st.textarea, minHeight: 50, background: "#fff" }} value={workTheme} onChange={e => setWorkTheme(e.target.value)} placeholder="全体テーマ、結末、想定ページ数など" /></div>
    <div style={st.secT}>集計</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>{[["場面数", scenes.length], ["総ページ数", `${totalPages}P`], ["総コマ数", totalPanels]].map(([l, v]) => (<div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: C.textSub }}>{l}</span><span style={st.badge}>{v}</span></div>))}</div>
    <div style={st.secT}>セリフ数</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>{Object.keys(speakerCount).length > 0 ? Object.entries(speakerCount).sort((a, b) => b[1] - a[1]).map(([n, c]) => (<div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{n}</span><span style={st.badge}>{c}</span></div>)) : <span style={{ fontSize: 12, color: C.textSub }}>セリフ未入力</span>}</div>
    <div style={st.secT}>登場人物</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{characters.map(ch => (<span key={ch} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.accentSoft, color: C.accentDark, padding: "3px 10px", borderRadius: 14, fontSize: 12, fontWeight: 500 }}>{ch}<button style={{ ...st.btnD, fontSize: 12, padding: 0 }} onClick={() => setCharacters(p => p.filter(c => c !== ch))}>×</button></span>))}</div>
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      <input style={{ ...st.sInp, flex: 1 }} value={newChar} onChange={e => setNewChar(e.target.value)} placeholder="名前を追加" onKeyDown={e => { if (e.key === "Enter" && newChar.trim()) { setCharacters(p => [...p, newChar.trim()]); setNewChar(""); } }} />
      <button style={{ ...st.btnS, borderStyle: "solid" }} onClick={() => { if (newChar.trim()) { setCharacters(p => [...p, newChar.trim()]); setNewChar(""); } }}>追加</button>
    </div>
    <div style={{ paddingTop: 14, borderTop: `1px solid ${C.cardBorder}` }}>
      <div style={st.secT}>データ管理</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button style={{ ...st.btnS, flex: 1, borderStyle: "solid", background: C.accent, color: "#fff", fontWeight: 600, borderColor: C.accent }} onClick={() => setShowExport(true)}>📥 データを保存</button>
        <button style={{ ...st.btnS, flex: 1, borderStyle: "solid" }} onClick={() => setShowImport(true)}>📂 データを復元</button>
      </div>
      <p style={{ fontSize: 10, color: C.textSub, lineHeight: 1.5, marginBottom: 12 }}>コピーしてメモ帳等に貼り付けて保存。</p>
      <button style={{ ...st.btnS, color: C.danger, borderColor: C.danger, width: "100%", fontSize: 10 }} onClick={handleReset}>データをリセット</button>
    </div>
  </>);

  const SidebarRef = () => (<>
    <div style={st.secT}>参考コマ割り</div>
    <p style={{ fontSize: 11, color: C.textSub, marginBottom: 14, lineHeight: 1.5 }}>好きな作品のコマ割りパターンを保存。</p>
    {refLayouts.map(ref => (<div key={ref.id} style={{ background: C.pageBg, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}><LayoutPreview layoutId={ref.layoutId} size={36} active /><div style={{ flex: 1 }}><input style={{ ...st.sInp, fontSize: 12, fontWeight: 600, marginBottom: 4 }} value={ref.name} onChange={e => updateRef(ref.id, "name", e.target.value)} /><select style={{ ...st.sel, width: "100%", fontSize: 11 }} value={ref.layoutId} onChange={e => updateRef(ref.id, "layoutId", e.target.value)}>{LAYOUT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div><button style={st.btnD} onClick={() => removeRef(ref.id)}>✕</button></div>
      <textarea style={{ ...st.textarea, minHeight: 30, fontSize: 11, background: "#fff" }} value={ref.note} onChange={e => updateRef(ref.id, "note", e.target.value)} placeholder="メモ（作品名、使いどころなど）" />
    </div>))}
    <button style={{ ...st.btnS, width: "100%", marginTop: 4 }} onClick={addRef}>+ 参考を追加</button>
  </>);

  return (
    <div style={{ fontFamily: fonts.body, color: C.text, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LayoutPickerModal />

      {confirmDelete && (<>
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 }} onClick={() => setConfirmDelete(null)} />
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 210, background: C.card, borderRadius: 16, padding: "24px 24px 20px", maxWidth: 320, width: "85vw", boxShadow: "0 12px 40px rgba(0,0,0,0.18)", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>「{confirmDelete.title}」を削除しますか？</div>
          <p style={{ fontSize: 12, color: C.textSub, marginBottom: 20, lineHeight: 1.5 }}>この操作は元に戻せません。</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fonts.body }}>キャンセル</button>
            <button onClick={doDelete} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: C.danger, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fonts.body }}>削除する</button>
          </div>
        </div>
      </>)}

      {showExport && (<>
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 }} onClick={() => setShowExport(false)} />
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 210, background: C.card, borderRadius: 16, padding: "20px 20px", maxWidth: 400, width: "90vw", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700 }}>📥 データを保存</span><button style={st.btnD} onClick={() => setShowExport(false)}>✕</button></div>
          <p style={{ fontSize: 11, color: C.textSub, marginBottom: 8, lineHeight: 1.5 }}>全選択→コピーしてメモアプリに貼り付けて保存。</p>
          <textarea id="export-ta" readOnly value={buildData()} style={{ ...st.textarea, minHeight: 120, maxHeight: "40vh", fontSize: 10, fontFamily: fonts.mono, background: "#f8f6f3" }} onFocus={e => e.target.select()} />
          <button onClick={handleCopy} style={{ marginTop: 10, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: fonts.body, fontSize: 14, fontWeight: 600, background: copyOk ? C.success : C.accent, color: "#fff" }}>{copyOk ? "✓ コピーしました！" : "全文をコピー"}</button>
        </div>
      </>)}

      {showImport && (<>
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 }} onClick={() => setShowImport(false)} />
        <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 210, background: C.card, borderRadius: 16, padding: "20px 20px", maxWidth: 400, width: "90vw", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700 }}>📂 データを復元</span><button style={st.btnD} onClick={() => { setShowImport(false); setImportText(""); }}>✕</button></div>
          <p style={{ fontSize: 11, color: C.textSub, marginBottom: 8, lineHeight: 1.5 }}>保存しておいたテキストを貼り付けてください。</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="JSONを貼り付け" style={{ ...st.textarea, minHeight: 120, maxHeight: "40vh", fontSize: 10, fontFamily: fonts.mono }} />
          <button onClick={handleImportSubmit} disabled={!importText.trim()} style={{ marginTop: 10, padding: "10px 0", borderRadius: 10, border: "none", cursor: importText.trim() ? "pointer" : "default", fontFamily: fonts.body, fontSize: 14, fontWeight: 600, background: importText.trim() ? C.accent : C.cardBorder, color: "#fff" }}>復元する</button>
        </div>
      </>)}

      <header style={{ background: C.card, borderBottom: `1px solid ${C.cardBorder}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, flexWrap: "wrap" }}>
          <span style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: C.accent, whiteSpace: "nowrap" }}>◇ プロットエディタ</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={st.badge}>{totalPages}P</span><span style={st.badge}>{totalPanels}コマ</span><span style={st.badge}>{scenes.length}場面</span></div>
        </div>
        <button style={{ background: "none", border: `1.5px solid ${C.cardBorder}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, color: C.textSub, lineHeight: 1 }} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      </header>

      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        <div style={{ flex: 1, padding: "20px 14px 100px", maxWidth: 740, margin: "0 auto", width: "100%" }}>
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C.accent}, ${C.cardBorder})`, borderRadius: 2 }} />
            {scenes.map((scene, idx) => {
              const isExp = expandedScenes.has(scene.id);
              const sp = scene.pages.length, sk = scene.pages.reduce((a, p) => a + p.panels.length, 0);
              return (
                <div key={scene.id} draggable onDragStart={() => onDragStart(scene.id)} onDragOver={e => onDragOver(e, scene.id)} onDragEnd={onDragEnd}
                  style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, marginBottom: 18, position: "relative", overflow: "hidden", ...(dragId === scene.id ? { opacity: 0.5, transform: "scale(0.97)" } : {}), ...(dragOverId === scene.id && dragId !== scene.id ? { boxShadow: `0 0 0 2px ${C.accent}` } : {}) }}>
                  <div style={{ position: "absolute", left: -28, top: 18, width: 12, height: 12, borderRadius: "50%", background: C.accent, border: `2.5px solid ${C.card}`, boxShadow: `0 0 0 2px ${C.accent}`, zIndex: 2 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", cursor: "pointer", userSelect: "none" }} onClick={() => toggleExpand(scene.id)}>
                    <span style={{ cursor: "grab", color: C.textSub, fontSize: 15, flexShrink: 0 }}>⠿</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 11, color: C.accent, fontWeight: 700, minWidth: 26 }}>#{idx + 1}</span>
                    <input style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 600, color: C.text, border: "none", background: "transparent", flex: 1, outline: "none", minWidth: 0 }} value={scene.title} onChange={e => updateScene(scene.id, "title", e.target.value)} onClick={e => e.stopPropagation()} />
                    <span style={{ fontSize: 13, color: C.textSub, transform: isExp ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }}>▶</span>
                  </div>
                  {!isExp && <div style={{ display: "flex", gap: 8, padding: "0 14px 10px", fontSize: 12, color: C.textSub, flexWrap: "wrap" }}><span>{sp}P</span><span>·</span><span>{sk}コマ</span>{scene.convey && <><span>·</span><span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scene.convey}</span></>}</div>}
                  {isExp && <div style={{ padding: "0 14px 14px" }}>
                    <div style={{ marginBottom: 10 }}><span style={st.label}>プロット</span><textarea style={st.textarea} value={scene.plot} onChange={e => updateScene(scene.id, "plot", e.target.value)} placeholder="この場面で起きること" /></div>
                    <div style={{ marginBottom: 14 }}><span style={{ ...st.label, color: C.accentDark }}>💭 何を伝えたいか</span><textarea style={{ ...st.textarea, background: C.conveyBg, borderColor: C.conveyBorder }} value={scene.convey} onChange={e => updateScene(scene.id, "convey", e.target.value)} placeholder="このシーンの本質、読者に残したい感情" /></div>
                    {scene.pages.map(page => {
                      const effectiveHero = page.heroId && page.panels.some(k => k.id === page.heroId) ? page.heroId : null;
                      return (
                      <div key={page.id} style={{ background: C.pageBg, borderRadius: 10, padding: 12, marginTop: 10, border: `1px solid ${C.cardBorder}` }}>
                        <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ background: C.accent, color: "#fff", fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 12 }}>{page.label}</span>
                              <div style={{ display: "flex", gap: 4 }}><button style={{ ...st.btnS, fontSize: 10, padding: "2px 8px" }} onClick={() => setLayoutPicker({ sceneId: scene.id, pageId: page.id })}>コマ割り変更</button><button style={st.btnD} onClick={() => removePage(scene.id, page.id)}>✕</button></div>
                            </div>
                            <span style={{ fontSize: 10, color: C.textSub }}>{LAYOUT_TEMPLATES.find(t => t.id === page.layoutId)?.name || "カスタム"}</span>
                          </div>
                          <PageLayoutMap layoutId={page.layoutId} panels={page.panels} size={100} heroId={effectiveHero} />
                        </div>
                        {page.panels.map((panel, ki) => {
                          const lines = panel.lines || [];
                          const isHero = effectiveHero === panel.id;
                          const hasMultiple = page.panels.length > 1;
                          return (
                          <div key={panel.id}
                            onClick={e => { if (["INPUT","SELECT","TEXTAREA","BUTTON"].includes(e.target.tagName)) return; if (hasMultiple) setHeroPanel(scene.id, page.id, panel.id); }}
                            style={{
                              background: isHero ? C.heroBg : C.panelBg,
                              border: isHero ? `2px solid ${C.heroBorder}` : `1px solid ${C.panelBorder}`,
                              borderRadius: 8, padding: "8px 10px", marginBottom: 6,
                              boxShadow: isHero ? `0 2px 8px ${C.hero}20` : "none",
                              cursor: hasMultiple ? "pointer" : "default",
                              transition: "all .15s",
                            }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                              <span style={{ fontFamily: fonts.mono, fontSize: 10, color: isHero ? C.hero : C.textSub, fontWeight: 700, minWidth: 20 }}>{ki + 1}コマ</span>
                              {isHero && hasMultiple && <span style={{ fontSize: 9, fontWeight: 700, color: C.hero, background: `${C.hero}18`, padding: "1px 7px", borderRadius: 8, letterSpacing: "0.04em" }}>見せゴマ</span>}
                              <input style={st.inp} value={panel.content} onChange={e => updatePanel(scene.id, page.id, panel.id, "content", e.target.value)} placeholder="コマ内容・構図" />
                              <button style={st.btnD} onClick={() => removePanel(scene.id, page.id, panel.id)}>✕</button>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: lines.length > 0 ? 4 : 0 }}>
                              <span style={{ fontSize: 9, color: C.emotionText, fontWeight: 600, minWidth: 24 }}>♡</span>
                              <input style={{ ...st.inp, background: C.emotionBg, borderColor: C.emotionBorder, color: C.emotionText, fontStyle: "italic", fontSize: 11 }} value={panel.emotion || ""} onChange={e => updatePanel(scene.id, page.id, panel.id, "emotion", e.target.value)} placeholder="感情・行動原理（なぜこの演技？）" />
                            </div>
                            {lines.map((ln, li) => (<div key={ln.id} style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 3 }}>
                              <span style={{ fontSize: 9, color: C.textSub, minWidth: 24 }}>{li === 0 ? "💬" : "　"}</span>
                              <select style={{ ...st.sel, minWidth: 64, fontSize: 11 }} value={ln.speaker} onChange={e => updateLine(scene.id, page.id, panel.id, ln.id, "speaker", e.target.value)}><option value="">誰？</option>{characters.map(ch => <option key={ch} value={ch}>{ch}</option>)}</select>
                              <input style={{ ...st.inp, fontStyle: "italic", fontSize: 11, flex: 1 }} value={ln.dialogue} onChange={e => updateLine(scene.id, page.id, panel.id, ln.id, "dialogue", e.target.value)} placeholder={ln.speaker ? `${ln.speaker}のセリフ` : "セリフ"} />
                              <button style={{ ...st.btnD, fontSize: 12 }} onClick={() => removeLine(scene.id, page.id, panel.id, ln.id)}>×</button>
                            </div>))}
                            <div style={{ marginTop: 4, paddingLeft: 30 }}><button style={{ ...st.btnS, fontSize: 10, padding: "2px 8px" }} onClick={() => addLine(scene.id, page.id, panel.id)}>+ セリフ追加</button></div>
                          </div>);
                        })}
                        <button style={{ ...st.btnS, marginTop: 4 }} onClick={() => addPanel(scene.id, page.id)}>+ コマ追加</button>
                      </div>
                    ); })}
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <button style={st.btnS} onClick={() => addPage(scene.id)}>+ ページ追加</button>
                      <button style={{ ...st.btnS, color: C.danger, borderColor: C.danger }} onClick={() => removeScene(scene.id)}>この場面を削除</button>
                    </div>
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: fonts.body }} onClick={addScene}>+ 場面を追加</button>
          </div>
        </div>

        {sidebarOpen && (<>
          {isMobile && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 60 }} onClick={() => setSidebarOpen(false)} />}
          <aside style={isMobile ? { position: "fixed", top: 0, right: 0, width: 300, height: "100vh", background: C.sidebar, borderLeft: `1px solid ${C.cardBorder}`, padding: "16px 18px", overflowY: "auto", zIndex: 70, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)" } : { width: 280, background: C.sidebar, borderLeft: `1px solid ${C.cardBorder}`, padding: "20px 18px", overflowY: "auto", position: "sticky", top: 48, height: "calc(100vh - 48px)" }}>
            {isMobile && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}><button style={{ background: "none", border: `1.5px solid ${C.cardBorder}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 14, color: C.textSub }} onClick={() => setSidebarOpen(false)}>✕</button></div>}
            <div style={{ display: "flex", marginBottom: 16, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.cardBorder}` }}>
              {[["info", "作品情報"], ["ref", "参考コマ割り"]].map(([k, l]) => (<button key={k} onClick={() => setSidebarTab(k)} style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: sidebarTab === k ? C.accent : "transparent", color: sidebarTab === k ? "#fff" : C.textSub, fontFamily: fonts.body }}>{l}</button>))}
            </div>
            {sidebarTab === "info" ? <SidebarInfo /> : <SidebarRef />}
          </aside>
        </>)}
      </div>
    </div>
  );
}
