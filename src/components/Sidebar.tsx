import type { CSSProperties, KeyboardEvent } from 'react';
import { LAYOUT_TEMPLATES } from '../data/layoutTemplates';
import { C, fonts } from '../styles/tokens';
import type { RefLayout, Scene } from '../types/plot';
import { LayoutPreview } from './LayoutPreview';

interface Props {
  isOpen: boolean;
  isMobile: boolean;
  tab: 'info' | 'ref';
  onChangeTab: (tab: 'info' | 'ref') => void;
  onClose: () => void;
  workTitle: string;
  workTheme: string;
  onUpdateTitle: (v: string) => void;
  onUpdateTheme: (v: string) => void;
  scenes: Scene[];
  totalPages: number;
  totalPanels: number;
  speakerCount: Record<string, number>;
  characters: string[];
  newChar: string;
  onChangeNewChar: (v: string) => void;
  onAddChar: () => void;
  onRemoveChar: (name: string) => void;
  onShowExport: () => void;
  onShowImport: () => void;
  refLayouts: RefLayout[];
  onAddRef: () => void;
  onUpdateRef: (id: string, field: 'name' | 'layoutId' | 'note', value: string) => void;
  onRemoveRef: (id: string) => void;
}

const TABS: { key: 'info' | 'ref'; label: string }[] = [
  { key: 'info', label: '作品情報' },
  { key: 'ref', label: '参考コマ割り' },
];

export function Sidebar(props: Props) {
  const {
    isOpen,
    isMobile,
    tab,
    onChangeTab,
    onClose,
    workTitle,
    workTheme,
    onUpdateTitle,
    onUpdateTheme,
    scenes,
    totalPages,
    totalPanels,
    speakerCount,
    characters,
    newChar,
    onChangeNewChar,
    onAddChar,
    onRemoveChar,
    onShowExport,
    onShowImport,
    refLayouts,
    onAddRef,
    onUpdateRef,
    onRemoveRef,
  } = props;

  if (!isOpen) return null;

  const sInp: CSSProperties = {
    width: '100%',
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 13,
    fontFamily: fonts.body,
    color: C.text,
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
  };
  const textarea: CSSProperties = {
    width: '100%',
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 8,
    padding: '8px 10px',
    fontFamily: fonts.body,
    fontSize: 13,
    color: C.text,
    resize: 'vertical',
    outline: 'none',
    minHeight: 44,
    background: C.card,
    lineHeight: 1.6,
    boxSizing: 'border-box',
  };
  const btnS: CSSProperties = {
    background: 'none',
    border: `1px dashed ${C.cardBorder}`,
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    color: C.textSub,
    cursor: 'pointer',
    fontFamily: fonts.body,
  };
  const btnD: CSSProperties = {
    background: 'none',
    border: 'none',
    color: C.danger,
    fontSize: 14,
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 4,
    lineHeight: 1,
  };
  const badge: CSSProperties = {
    background: C.accentSoft,
    color: C.accentDark,
    padding: '2px 10px',
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 12,
    fontFamily: fonts.mono,
  };
  const secT: CSSProperties = {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: 700,
    color: C.text,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: `1px solid ${C.cardBorder}`,
  };

  const asideStyle: CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        right: 0,
        width: 300,
        height: '100vh',
        background: C.sidebar,
        borderLeft: `1px solid ${C.cardBorder}`,
        padding: '16px 18px',
        overflowY: 'auto',
        zIndex: 70,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
      }
    : {
        width: 280,
        background: C.sidebar,
        borderLeft: `1px solid ${C.cardBorder}`,
        padding: '20px 18px',
        overflowY: 'auto',
        position: 'sticky',
        top: 48,
        height: 'calc(100vh - 48px)',
        flexShrink: 0,
      };

  const handleAddChar = () => {
    if (newChar.trim()) {
      onAddChar();
      onChangeNewChar('');
    }
  };
  const handleCharKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddChar();
  };

  const infoContent = (
    <>
      <div style={secT}>作品情報</div>
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.accent,
            letterSpacing: '0.06em',
            marginBottom: 4,
            display: 'block',
          }}
        >
          タイトル
        </span>
        <input style={sInp} value={workTitle} onChange={(e) => onUpdateTitle(e.target.value)} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.accent,
            letterSpacing: '0.06em',
            marginBottom: 4,
            display: 'block',
          }}
        >
          テーマ・メモ
        </span>
        <textarea
          style={{ ...textarea, minHeight: 50, background: '#fff' }}
          value={workTheme}
          onChange={(e) => onUpdateTheme(e.target.value)}
          placeholder="全体テーマ、結末、想定ページ数など"
        />
      </div>

      <div style={secT}>集計</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {[
          ['場面数', scenes.length],
          ['総ページ数', `${totalPages}P`],
          ['総コマ数', totalPanels],
        ].map(([label, val]) => (
          <div
            key={String(label)}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
          >
            <span style={{ color: C.textSub }}>{label}</span>
            <span style={badge}>{val}</span>
          </div>
        ))}
      </div>

      <div style={secT}>セリフ数</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {Object.keys(speakerCount).length > 0 ? (
          Object.entries(speakerCount)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <div
                key={name}
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
              >
                <span>{name}</span>
                <span style={badge}>{count}</span>
              </div>
            ))
        ) : (
          <span style={{ fontSize: 12, color: C.textSub }}>セリフ未入力</span>
        )}
      </div>

      <div style={secT}>登場人物</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {characters.map((ch) => (
          <span
            key={ch}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: C.accentSoft,
              color: C.accentDark,
              padding: '3px 10px',
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {ch}
            <button
              type="button"
              style={{ ...btnD, fontSize: 12, padding: '0' }}
              onClick={() => onRemoveChar(ch)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <input
          style={{ ...sInp, flex: 1 }}
          value={newChar}
          onChange={(e) => onChangeNewChar(e.target.value)}
          onKeyDown={handleCharKeyDown}
          placeholder="名前を追加"
        />
        <button type="button" style={{ ...btnS, borderStyle: 'solid' }} onClick={handleAddChar}>
          追加
        </button>
      </div>

      <div style={{ paddingTop: 14, borderTop: `1px solid ${C.cardBorder}` }}>
        <div style={secT}>データ管理</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            type="button"
            style={{
              ...btnS,
              flex: 1,
              borderStyle: 'solid',
              background: C.accent,
              color: '#fff',
              fontWeight: 600,
              borderColor: C.accent,
            }}
            onClick={onShowExport}
          >
            📥 データを保存
          </button>
          <button
            type="button"
            style={{ ...btnS, flex: 1, borderStyle: 'solid' }}
            onClick={onShowImport}
          >
            📂 データを復元
          </button>
        </div>
        <p style={{ fontSize: 10, color: C.textSub, lineHeight: 1.5 }}>
          コピーしてメモ帳等に貼り付けて保存。
        </p>
      </div>
    </>
  );

  const refContent = (
    <>
      <div style={secT}>参考コマ割り</div>
      <p style={{ fontSize: 11, color: C.textSub, marginBottom: 14, lineHeight: 1.5 }}>
        好きな作品のコマ割りパターンを保存。
      </p>
      {refLayouts.map((ref) => (
        <div
          key={ref.id}
          style={{
            background: C.pageBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <LayoutPreview layoutId={ref.layoutId} size={36} active />
            <div style={{ flex: 1 }}>
              <input
                style={{ ...sInp, fontSize: 12, fontWeight: 600, marginBottom: 4 }}
                value={ref.name}
                onChange={(e) => onUpdateRef(ref.id, 'name', e.target.value)}
              />
              <select
                style={{
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontFamily: fonts.body,
                  color: C.text,
                  outline: 'none',
                  background: '#fff',
                  width: '100%',
                }}
                value={ref.layoutId}
                onChange={(e) => onUpdateRef(ref.id, 'layoutId', e.target.value)}
              >
                {LAYOUT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" style={btnD} onClick={() => onRemoveRef(ref.id)}>
              ✕
            </button>
          </div>
          <textarea
            style={{ ...textarea, minHeight: 30, fontSize: 11, background: '#fff' }}
            value={ref.note}
            onChange={(e) => onUpdateRef(ref.id, 'note', e.target.value)}
            placeholder="メモ（作品名、使いどころなど）"
          />
        </div>
      ))}
      <button type="button" style={{ ...btnS, width: '100%', marginTop: 4 }} onClick={onAddRef}>
        + 参考を追加
      </button>
    </>
  );

  return (
    <>
      {isMobile && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 60 }}
          onClick={onClose}
        />
      )}
      <aside style={asideStyle}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: `1.5px solid ${C.cardBorder}`,
                borderRadius: 8,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 14,
                color: C.textSub,
              }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            marginBottom: 16,
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          {TABS.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => onChangeTab(key)}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: tab === key ? C.accent : 'transparent',
                color: tab === key ? '#fff' : C.textSub,
                fontFamily: fonts.body,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'info' ? infoContent : refContent}
      </aside>
    </>
  );
}
