import { C, fonts } from '../styles/tokens';

interface Props {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = '削除する',
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }}
        onClick={onCancel}
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
          padding: '24px 24px 20px',
          maxWidth: 320,
          width: '85vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 15,
            fontWeight: 700,
            color: C.text,
            marginBottom: 8,
          }}
        >
          「{title}」を削除しますか？
        </div>
        {message && (
          <p style={{ fontSize: 12, color: C.textSub, marginBottom: 20, lineHeight: 1.5 }}>
            {message}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: `1px solid ${C.cardBorder}`,
              background: '#fff',
              color: C.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: danger ? C.danger : C.accent,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
