import type { Line } from '../types/plot';
import { C, fonts } from '../styles/tokens';

interface Props {
  line: Line;
  characters: string[];
  isFirst: boolean;
  onUpdate: (field: 'speaker' | 'dialogue', value: string) => void;
  onRemove: () => void;
}

export function DialogueLine({ line, characters, isFirst, onUpdate, onRemove }: Props) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 3 }}>
      <span style={{ fontSize: 9, color: C.textSub, minWidth: 24 }}>{isFirst ? '💬' : '　'}</span>
      <select
        style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: fonts.body, color: C.text, outline: 'none', background: '#fff', minWidth: 64 }}
        value={line.speaker}
        onChange={e => onUpdate('speaker', e.target.value)}
      >
        <option value="">誰？</option>
        {characters.map(ch => <option key={ch} value={ch}>{ch}</option>)}
      </select>
      <input
        style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: fonts.body, color: C.text, outline: 'none', flex: 1, minWidth: 60, background: '#fff', fontStyle: 'italic' }}
        value={line.dialogue}
        onChange={e => onUpdate('dialogue', e.target.value)}
        placeholder={line.speaker ? `${line.speaker}のセリフ` : 'セリフ'}
      />
      <button
        style={{ background: 'none', border: 'none', color: C.danger, fontSize: 12, cursor: 'pointer', padding: '2px 6px', borderRadius: 4, lineHeight: 1 }}
        onClick={onRemove}
      >×</button>
    </div>
  );
}
