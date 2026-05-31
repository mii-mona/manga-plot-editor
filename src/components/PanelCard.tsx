import type { Panel } from '../types/plot';
import { DialogueLine } from './DialogueLine';
import { C, fonts } from '../styles/tokens';

interface Props {
  panel: Panel;
  panelIndex: number;
  isHero: boolean;
  hasMultiple: boolean;
  characters: string[];
  onToggleHero: () => void;
  onUpdate: (field: 'content' | 'emotion', value: string) => void;
  onRemove: () => void;
  onAddLine: () => void;
  onUpdateLine: (lineId: string, field: 'speaker' | 'dialogue', value: string) => void;
  onRemoveLine: (lineId: string) => void;
}

export function PanelCard({
  panel, panelIndex, isHero, hasMultiple, characters,
  onToggleHero, onUpdate, onRemove, onAddLine, onUpdateLine, onRemoveLine,
}: Props) {
  return (
    <div
      onClick={e => {
        const tag = (e.target as HTMLElement).tagName;
        if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(tag)) return;
        if (hasMultiple) onToggleHero();
      }}
      style={{
        background: isHero ? C.heroBg : C.panelBg,
        border: isHero ? `2px solid ${C.heroBorder}` : `1px solid ${C.panelBorder}`,
        borderRadius: 8,
        padding: '8px 10px',
        marginBottom: 6,
        boxShadow: isHero ? `0 2px 8px ${C.hero}20` : 'none',
        cursor: hasMultiple ? 'pointer' : 'default',
        transition: 'all .15s',
      }}
    >
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 10, color: isHero ? C.hero : C.textSub, fontWeight: 700, minWidth: 20 }}>
          {panelIndex + 1}コマ
        </span>
        {isHero && hasMultiple && (
          <span style={{ fontSize: 9, fontWeight: 700, color: C.hero, background: `${C.hero}18`, padding: '1px 7px', borderRadius: 8, letterSpacing: '0.04em' }}>
            見せゴマ
          </span>
        )}
        <input
          style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, fontFamily: fonts.body, color: C.text, outline: 'none', flex: 1, minWidth: 60, background: '#fff' }}
          value={panel.content}
          onChange={e => onUpdate('content', e.target.value)}
          placeholder="コマ内容・構図"
        />
        <button
          style={{ background: 'none', border: 'none', color: C.danger, fontSize: 14, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1 }}
          onClick={onRemove}
        >✕</button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: panel.lines.length > 0 ? 4 : 0 }}>
        <span style={{ fontSize: 9, color: C.emotionText, fontWeight: 600, minWidth: 24 }}>♡</span>
        <input
          style={{ border: `1px solid ${C.emotionBorder}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: fonts.body, color: C.emotionText, outline: 'none', flex: 1, minWidth: 60, background: C.emotionBg, fontStyle: 'italic' }}
          value={panel.emotion}
          onChange={e => onUpdate('emotion', e.target.value)}
          placeholder="感情・行動原理（なぜこの演技？）"
        />
      </div>

      {panel.lines.map((ln, li) => (
        <DialogueLine
          key={ln.id}
          line={ln}
          characters={characters}
          isFirst={li === 0}
          onUpdate={(field, value) => onUpdateLine(ln.id, field, value)}
          onRemove={() => onRemoveLine(ln.id)}
        />
      ))}

      <div style={{ marginTop: 4, paddingLeft: 30 }}>
        <button
          style={{ background: 'none', border: `1px dashed ${C.cardBorder}`, borderRadius: 6, padding: '2px 8px', fontSize: 10, color: C.textSub, cursor: 'pointer', fontFamily: fonts.body }}
          onClick={onAddLine}
        >
          + セリフ追加
        </button>
      </div>
    </div>
  );
}
