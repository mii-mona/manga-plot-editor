import { LAYOUT_TEMPLATES } from '../data/layoutTemplates';
import { C, fonts } from '../styles/tokens';
import type { Page } from '../types/plot';
import { PageLayoutMap } from './PageLayoutMap';
import { PanelCard } from './PanelCard';

interface Props {
  page: Page;
  characters: string[];
  onOpenLayoutPicker: () => void;
  onRemovePage: () => void;
  onSetHero: (panelId: string) => void;
  onAddPanel: () => void;
  onRemovePanel: (panelId: string) => void;
  onUpdatePanel: (panelId: string, field: 'content' | 'emotion', value: string) => void;
  onAddLine: (panelId: string) => void;
  onRemoveLine: (panelId: string, lineId: string) => void;
  onUpdateLine: (
    panelId: string,
    lineId: string,
    field: 'speaker' | 'dialogue',
    value: string
  ) => void;
}

export function PageBlock({
  page,
  characters,
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
  const effectiveHero =
    page.heroId && page.panels.some((k) => k.id === page.heroId) ? page.heroId : null;
  const layoutName = LAYOUT_TEMPLATES.find((t) => t.id === page.layoutId)?.name ?? 'カスタム';

  return (
    <div
      style={{
        background: C.pageBg,
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        border: `1px solid ${C.cardBorder}`,
      }}
    >
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                background: C.accent,
                color: '#fff',
                fontFamily: fonts.mono,
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 12,
              }}
            >
              {page.label}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: `1px dashed ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 10,
                  color: C.textSub,
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                }}
                onClick={onOpenLayoutPicker}
              >
                コマ割り変更
              </button>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.danger,
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 4,
                  lineHeight: 1,
                }}
                onClick={onRemovePage}
              >
                ✕
              </button>
            </div>
          </div>
          <span style={{ fontSize: 10, color: C.textSub }}>{layoutName}</span>
        </div>
        <PageLayoutMap
          layoutId={page.layoutId}
          panels={page.panels}
          size={100}
          heroId={effectiveHero}
        />
      </div>

      {page.panels.map((panel, ki) => (
        <PanelCard
          key={panel.id}
          panel={panel}
          panelIndex={ki}
          isHero={effectiveHero === panel.id}
          hasMultiple={page.panels.length > 1}
          characters={characters}
          onToggleHero={() => onSetHero(panel.id)}
          onUpdate={(field, value) => onUpdatePanel(panel.id, field, value)}
          onRemove={() => onRemovePanel(panel.id)}
          onAddLine={() => onAddLine(panel.id)}
          onUpdateLine={(lineId, field, value) => onUpdateLine(panel.id, lineId, field, value)}
          onRemoveLine={(lineId) => onRemoveLine(panel.id, lineId)}
        />
      ))}

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
          marginTop: 4,
        }}
        onClick={onAddPanel}
      >
        + コマ追加
      </button>
    </div>
  );
}
