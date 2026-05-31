import { describe, expect, test } from 'vitest';
import { newId } from '../utils/ids';

describe('newId', () => {
  test('string を返す', () => {
    expect(typeof newId()).toBe('string');
  });

  test('UUID v4 形式', () => {
    const id = newId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('呼び出しごとに異なる ID を生成する', () => {
    const ids = new Set(Array.from({ length: 20 }, () => newId()));
    expect(ids.size).toBe(20);
  });
});
