// データ消失対策 A: JSON ファイルの DL / 読込（docs/design/data-loss-protection.md §2）

/** 文字列 JSON を Blob 化してダウンロードする。 */
export function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // クリック直後に revoke するとダウンロードが始まらないブラウザがあるため少し遅延。
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** File を読んで文字列を返す。 */
export function readJsonFile(file: File): Promise<string> {
  // file.text() が使える環境はそちらを優先（FileReader より簡潔）。
  if (typeof file.text === 'function') {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
}

/**
 * 作品名から安全なバックアップファイル名を生成する。
 *   例: "<title>-2026-06-07.json"
 * title が空・空白のみなら "untitled"、禁則文字・空白は "_" に正規化する。
 */
export function backupFilename(workTitle: string, now: Date = new Date()): string {
  // ファイル名に使えない文字（Windows 禁則）と空白を "_" に正規化し、連続/前後の "_" を畳む。
  const sanitized = workTitle
    .trim()
    .replace(/[\\/:*?"<>|\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  const base = sanitized.length > 0 ? sanitized : 'untitled';

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${base}-${yyyy}-${mm}-${dd}.json`;
}
