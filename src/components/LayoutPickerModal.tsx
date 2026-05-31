import { useState } from 'react';
import { LAYOUT_TEMPLATES } from '../data/layoutTemplates';
import { C, fonts } from '../styles/tokens';
import { LayoutPreview } from './LayoutPreview';

interface Props {
  currentLayoutId: string;
  currentPanelCount: number;
  onSelect: (layoutId: string) => void;
  onClose: () => void;
}

export function LayoutPickerModal({
  currentLayoutId,
  currentPanelCount,
  onSelect,
  onClose,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  const matched = LAYOUT_TEMPLATES.filter((t) => t.count === currentPanelCount);
  const others = LAYOUT_TEMPLATES.filter((t) => t.count !== currentPanelCount);
  const grouped: Record<number, typeof others> = {};
  others.forEach((t) => {
    if (!grouped[t.count]) grouped[t.count] = [];
    grouped[t.count].push(t);
  });

  const renderTpl = (tpl: (typeof LAYOUT_TEMPLATES)[0]) => (
    <div
      key={tpl.id}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
    >
      <LayoutPreview
        layoutId={tpl.id}
        size={48}
        active={currentLayoutId === tpl.id}
        onClick={() => onSelect(tpl.id)}
      />
      <span
        style={{
          fontSize: 9,
          color: currentLayoutId === tpl.id ? C.accent : C.textSub,
          fontWeight: currentLayoutId === tpl.id ? 700 : 400,
          textAlign: 'center',
          maxWidth: 52,
        }}
      >
        {tpl.name}
      </span>
    </div>
  );

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 210,
          background: C.card,
          borderRadius: 16,
          padding: '20px 22px',
          maxWidth: 400,
          width: '90vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <span style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700 }}>
            コマ割りテンプレート
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: C.danger,
              fontSize: 14,
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: 11, color: C.textSub, marginBottom: 12 }}>右→左の読み順</p>

        {matched.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 8 }}>
              現在のコマ数に合うレイアウト（{currentPanelCount}コマ）
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              {matched.map(renderTpl)}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          style={{
            background: 'none',
            border: `1px dashed ${C.cardBorder}`,
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            color: C.textSub,
            cursor: 'pointer',
            fontFamily: fonts.body,
            width: '100%',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          {showAll ? '▲ 閉じる' : '▼ 他のコマ数のレイアウトも見る'}
        </button>

        {showAll &&
          Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([count, tpls]) => (
              <div key={count} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>
                  {count}コマ
                </div>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}
                >
                  {tpls.map(renderTpl)}
                </div>
              </div>
            ))}
      </div>
    </>
  );
}
