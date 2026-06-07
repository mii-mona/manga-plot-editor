// データ消失対策 D: Persistent Storage 要求（docs/design/data-loss-protection.md §5）
// 位置づけは "補助"。eviction リスクを下げるだけで、消えない保証ではない。

/**
 * Persistent Storage を要求する。
 * - すでに許可済みなら true。
 * - 未許可なら一度だけ navigator.storage.persist() を要求し、その結果を返す。
 * - API 非対応 / 失敗時は false を返すだけ（throw しない）。
 */
export async function ensurePersistentStorage(): Promise<boolean> {
  try {
    const storage = navigator.storage;
    if (!storage || typeof storage.persist !== 'function') return false;
    if (typeof storage.persisted === 'function') {
      const already = await storage.persisted();
      if (already) return true;
    }
    return await storage.persist();
  } catch {
    return false;
  }
}
