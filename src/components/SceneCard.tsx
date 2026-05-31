import type { DragEvent } from 'react';
import { C, fonts } from '../styles/tokens';
import type { Scene } from '../types/plot';
import { PageBlock } from './PageBlock';

interface Props {
  scene: Scene;
  index: number;
  isExpanded: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  characters: string[];
  onToggle: () => void;
  onDragStart: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onUpdateTitle: (value: string) => void;
  onUpdatePlot: (value: string) => void;
  onUpdateConvey: (value: string) => void;
  onRequestDelete: () => void;
  onAddPage: () => void;
  onOpenLayoutPicker: (pageId: string) => void;
  onRemovePage: (pageId: string) => void;
  onSetHero: (pageId: string, panelId: string) => void;
  onAddPanel: (pageId: string) => void;
  onRemovePanel: (pageId: string, panelId: string) => void;
  onUpdatePanel: (
    pageId: string,
    panelId: string,
    field: 'content' | 'emotion',
    value: string
  ) => void;
  onAddLine: (pageId: string, panelId: string) => void;
  onRemoveLine: (pageId: string, panelId: string, lineId: string) => void;
  onUpdateLine: (
    pageId: string,
    panelId: string,
    lineId: string,
    field: 'speaker' | 'dialogue',
    value: string
  ) => void;
}

export function SceneCard({
  scene,
  index,
  isExpanded,
  isDragging,
  isDragOver,
  characters,
  onToggle,
  onDragStart,
  onDragOver,
  onDragEnd,
  onUpdateTitle,
  onUpdatePlot,
  onUpdateConvey,
  onRequestDelete,
  onAddPage,
  onOpenLayoutPicker,
  onRemovePage,
  onSetHero,
  onAddPanel,
  onRemovePanel,
  onUpdatePanel,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: Props) {
  const sp = scene.pages.length;
  const sk = scene.pages.reduce((a, p) => a + p.panels.length, 0);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      style={{
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 14,
        marginBottom: 18,
        position: 'relative',
        overflow: 'hidden',
        ...(isDragging ? { opacity: 0.5, transform: 'scale(0.97)' } : {}),
        ...(isDragOver ? { boxShadow: `0 0 0 2px ${C.accent}` } : {}),
      }}
    >
      {/* タイムラインドット */}
      <div
        style={{
          position: 'absolute',
          left: -28,
          top: 18,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: C.accent,
          border: `2.5px solid ${C.card}`,
          boxShadow: `0 0 0 2px ${C.accent}`,
          zIndex: 2,
        }}
      />

      {/* ヘッダー行 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 14px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={onToggle}
      >
        <span style={{ cursor: 'grab', color: C.textSub, fontSize: 15, flexShrink: 0 }}>⠿</span>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: C.accent,
            fontWeight: 700,
            minWidth: 26,
          }}
        >
          #{index + 1}
        </span>
        <input
          style={{
            fontFamily: fonts.display,
            fontSize: 15,
            fontWeight: 600,
            color: C.text,
            border: 'none',
            background: 'transparent',
            flex: 1,
            outline: 'none',
            minWidth: 0,
          }}
          value={scene.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <span
          style={{
            fontSize: 13,
            color: C.textSub,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform .2s',
            flexShrink: 0,
          }}
        >
          ▶
        </span>
      </div>

      {/* 折りたたみ時サマリー */}
      {!isExpanded && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '0 14px 10px',
            fontSize: 12,
            color: C.textSub,
            flexWrap: 'wrap',
          }}
        >
          <span>{sp}P</span>
          <span>·</span>
          <span>{sk}コマ</span>
          {scene.convey && (
            <>
              <span>·</span>
              <span
                style={{
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {scene.convey}
              </span>
            </>
          )}
        </div>
      )}

      {/* 展開コンテンツ */}
      {isExpanded && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ marginBottom: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 4,
                display: 'block',
              }}
            >
              プロット
            </span>
            <textarea
              style={{
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
              }}
              value={scene.plot}
              onChange={(e) => onUpdatePlot(e.target.value)}
              placeholder="この場面で起きること"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.accentDark,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 4,
                display: 'block',
              }}
            >
              💭 何を伝えたいか
            </span>
            <textarea
              style={{
                width: '100%',
                border: `1px solid ${C.conveyBorder}`,
                borderRadius: 8,
                padding: '8px 10px',
                fontFamily: fonts.body,
                fontSize: 13,
                color: C.text,
                resize: 'vertical',
                outline: 'none',
                minHeight: 44,
                background: C.conveyBg,
                lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
              value={scene.convey}
              onChange={(e) => onUpdateConvey(e.target.value)}
              placeholder="このシーンの本質、読者に残したい感情"
            />
          </div>

          {scene.pages.map((page) => (
            <PageBlock
              key={page.id}
              page={page}
              characters={characters}
              onOpenLayoutPicker={() => onOpenLayoutPicker(page.id)}
              onRemovePage={() => onRemovePage(page.id)}
              onSetHero={(panelId) => onSetHero(page.id, panelId)}
              onAddPanel={() => onAddPanel(page.id)}
              onRemovePanel={(panelId) => onRemovePanel(page.id, panelId)}
              onUpdatePanel={(panelId, field, value) =>
                onUpdatePanel(page.id, panelId, field, value)
              }
              onAddLine={(panelId) => onAddLine(page.id, panelId)}
              onRemoveLine={(panelId, lineId) => onRemoveLine(page.id, panelId, lineId)}
              onUpdateLine={(panelId, lineId, field, value) =>
                onUpdateLine(page.id, panelId, lineId, field, value)
              }
            />
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: `1px dashed ${C.cardBorder}`,
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11,
                color: C.textSub,
                cursor: 'pointer',
                fontFamily: fonts.body,
              }}
              onClick={onAddPage}
            >
              + ページ追加
            </button>
            <button
              type="button"
              style={{
                background: 'none',
                border: `1px dashed ${C.danger}`,
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11,
                color: C.danger,
                cursor: 'pointer',
                fontFamily: fonts.body,
              }}
              onClick={onRequestDelete}
            >
              この場面を削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
