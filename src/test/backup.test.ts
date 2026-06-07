import { describe, expect, test } from 'vitest';
import { backupFilename, readJsonFile } from '../utils/backup';

describe('backupFilename', () => {
  const date = new Date(2026, 5, 7); // 2026-06-07（月は0始まり）

  test('通常のタイトルから "<title>-YYYY-MM-DD.json" を生成', () => {
    expect(backupFilename('MyWork', date)).toBe('MyWork-2026-06-07.json');
  });

  test('日本語タイトルもそのまま使える', () => {
    expect(backupFilename('銀河鉄道', date)).toBe('銀河鉄道-2026-06-07.json');
  });

  test('空タイトルは "untitled" になる', () => {
    expect(backupFilename('', date)).toBe('untitled-2026-06-07.json');
  });

  test('空白のみのタイトルは "untitled" になる', () => {
    expect(backupFilename('   ', date)).toBe('untitled-2026-06-07.json');
  });

  test('禁則文字・空白は "_" に正規化される', () => {
    // 末尾の禁則文字由来の "_" は除去される。
    expect(backupFilename('a/b:c*d?', date)).toBe('a_b_c_d-2026-06-07.json');
    expect(backupFilename('a/b:c*d', date)).toBe('a_b_c_d-2026-06-07.json');
    expect(backupFilename('hello world', date)).toBe('hello_world-2026-06-07.json');
  });

  test('連続/前後の禁則文字は1つの "_" に畳まれ前後は除去される', () => {
    expect(backupFilename('  a//b  ', date)).toBe('a_b-2026-06-07.json');
    expect(backupFilename('///', date)).toBe('untitled-2026-06-07.json');
  });

  test('月日が1桁のときゼロ埋めされる', () => {
    expect(backupFilename('x', new Date(2026, 0, 3))).toBe('x-2026-01-03.json');
  });
});

describe('readJsonFile', () => {
  test('テキストファイルの中身を文字列で返す', async () => {
    const file = new File(['{"a":1}'], 'data.json', { type: 'application/json' });
    await expect(readJsonFile(file)).resolves.toBe('{"a":1}');
  });

  test('空ファイルは空文字を返す', async () => {
    const file = new File([''], 'empty.json', { type: 'application/json' });
    await expect(readJsonFile(file)).resolves.toBe('');
  });
});
