import type { Panel } from '../types/plot';
import { LAYOUT_TEMPLATES } from '../data/layoutTemplates';
import { C, fonts } from '../styles/tokens';

interface Props {
  layoutId: string;
  panels: Panel[];
  size?: number;
  heroId: string | null;
}

const COLORS = ['#C2785C', '#6BA368', '#5B8DB8', '#D4A03E', '#9B5CA5', '#D4564E'];

export function PageLayoutMap({ layoutId, panels, size = 110, heroId }: Props) {
  const tpl = LAYOUT_TEMPLATES.find(t => t.id === layoutId);
  if (!tpl) return null;
  const multi = tpl.panels.length > 1;
  return (
    <div style={{
      width: size,
      height: size * 1.41,
      position: 'relative',
      borderRadius: 6,
      border: `2px solid ${C.cardBorder}`,
      background: '#fff',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {tpl.panels.map((p, i) => {
        const panel = panels[i];
        const color = COLORS[i % COLORS.length];
        const isHero = panel != null && panel.id === heroId;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.w}%`,
              height: `${p.h}%`,
              background: isHero ? `${C.hero}30` : `${color}15`,
              border: isHero ? `2.5px solid ${C.hero}` : `1px solid ${color}50`,
              boxSizing: 'border-box',
              padding: 3,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <span style={{ fontSize: 7, fontWeight: 700, color: isHero ? C.hero : color, fontFamily: fonts.mono }}>
              {i + 1}
            </span>
            {panel && (
              <>
                <span style={{ fontSize: 7, color: C.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {panel.content}
                </span>
                {isHero && multi && (
                  <span style={{ fontSize: 5, color: C.hero, fontWeight: 700 }}>見せゴマ</span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
