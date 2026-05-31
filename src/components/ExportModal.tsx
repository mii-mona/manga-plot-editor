import { C, fonts } from '../styles/tokens';

interface Props {
  data: string;
  copyOk: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export function ExportModal({ data, copyOk, onCopy, onClose }: Props) {
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
            📥 データを保存
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
          全選択→コピーしてメモアプリに貼り付けて保存。
        </p>
        <textarea
          id="export-ta"
          readOnly
          value={data}
          onFocus={(e) => e.target.select()}
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
            background: '#f8f6f3',
            lineHeight: 1.6,
            boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={onCopy}
          style={{
            marginTop: 10,
            padding: '10px 0',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontFamily: fonts.body,
            fontSize: 14,
            fontWeight: 600,
            background: copyOk ? C.success : C.accent,
            color: '#fff',
            transition: 'background .2s',
          }}
        >
          {copyOk ? '✓ コピーしました！' : '全文をコピー'}
        </button>
      </div>
    </>
  );
}
