import type { ChangeEvent } from 'react';
import { C, fonts } from '../styles/tokens';

interface Props {
  text: string;
  onChangeText: (v: string) => void;
  onImport: () => void;
  onImportFile: (file: File) => void;
  onClose: () => void;
  error?: string | null;
}

export function ImportModal({ text, onChangeText, onImport, onImportFile, onClose, error }: Props) {
  const canImport = text.trim().length > 0;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 同じファイルを連続で選べるよう value をリセット。
    e.target.value = '';
    if (file) onImportFile(file);
  };

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
          padding: '20px',
          maxWidth: 400,
          width: '90vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <span style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700 }}>
            📂 データを復元
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
        <p style={{ fontSize: 11, color: C.textSub, marginBottom: 8, lineHeight: 1.5 }}>
          バックアップした JSON ファイルを読み込むか、テキストを貼り付けて復元します。
        </p>

        {/* 手段1: ファイルから読込 */}
        <label
          style={{
            display: 'block',
            border: `1.5px dashed ${C.cardBorder}`,
            borderRadius: 10,
            padding: '12px',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: C.accentDark,
            cursor: 'pointer',
            background: C.pageBg,
            marginBottom: 12,
          }}
        >
          📂 JSONファイルから読み込み
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: '4px 0 10px',
            color: C.textSub,
            fontSize: 11,
          }}
        >
          <div style={{ flex: 1, height: 1, background: C.cardBorder }} />
          または貼り付け
          <div style={{ flex: 1, height: 1, background: C.cardBorder }} />
        </div>

        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="JSONを貼り付け"
          style={{
            width: '100%',
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            padding: '8px 10px',
            fontFamily: fonts.mono,
            fontSize: 10,
            color: C.text,
            resize: 'vertical',
            outline: 'none',
            minHeight: 120,
            maxHeight: '40vh',
            lineHeight: 1.6,
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p
            style={{
              marginTop: 10,
              padding: '8px 10px',
              borderRadius: 8,
              background: '#FCEDEB',
              border: `1px solid ${C.danger}`,
              color: C.danger,
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={onImport}
          disabled={!canImport}
          style={{
            marginTop: 10,
            padding: '10px 0',
            borderRadius: 10,
            border: 'none',
            cursor: canImport ? 'pointer' : 'default',
            fontFamily: fonts.body,
            fontSize: 14,
            fontWeight: 600,
            background: canImport ? C.accent : C.cardBorder,
            color: '#fff',
          }}
        >
          復元する
        </button>
      </div>
    </>
  );
}
