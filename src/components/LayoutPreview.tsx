import { LAYOUT_TEMPLATES } from '../data/layoutTemplates';
import { C, fonts } from '../styles/tokens';

interface Props {
  layoutId: string;
  size?: number;
  active?: boolean;
  onClick?: () => void;
}

export function LayoutPreview({ layoutId, size = 48, active = false, onClick }: Props) {
  const tpl = LAYOUT_TEMPLATES.find((t) => t.id === layoutId);
  if (!tpl) return null;
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size * 1.41,
        position: 'relative',
        borderRadius: 4,
        border: `2px solid ${active ? C.accent : C.cardBorder}`,
        background: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: active ? `0 0 0 2px ${C.accentSoft}` : 'none',
      }}
    >
      {tpl.panels.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.w}%`,
            height: `${p.h}%`,
            background: active ? C.accentSoft : C.cardBorder,
            border: `0.5px solid ${active ? C.accent : '#d0c8bc'}`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.max(7, size * 0.14),
            color: active ? C.accent : C.textSub,
            fontWeight: 700,
            fontFamily: fonts.mono,
          }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}
