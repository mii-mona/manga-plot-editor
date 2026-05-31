import { describe, expect, test } from 'vitest';
import { migrateData } from '../utils/migrate';

describe('migrateData', () => {
  test('空オブジェクトからデフォルト値を生成する', () => {
    const result = migrateData({});
    expect(result.workTitle).toBe('無題の作品');
    expect(result.workTheme).toBe('');
    expect(result.scenes).toEqual([]);
    expect(result.characters).toEqual([]);
    expect(result.refLayouts).toEqual([]);
    expect(result._format).toBe('manga-plot-editor-v2');
  });

  test('既存の workTitle を保持する', () => {
    const result = migrateData({ workTitle: 'マイ作品' });
    expect(result.workTitle).toBe('マイ作品');
  });

  test('scene.id が number の場合 string に変換する', () => {
    const result = migrateData({
      scenes: [{ id: 1, title: '場面1', plot: '', convey: '', pages: [] }],
    });
    expect(result.scenes[0].id).toBe('1');
    expect(typeof result.scenes[0].id).toBe('string');
  });

  test('scene.id が string の場合そのまま使う', () => {
    const result = migrateData({
      scenes: [{ id: 'uuid-abc', title: '場面', plot: '', convey: '', pages: [] }],
    });
    expect(result.scenes[0].id).toBe('uuid-abc');
  });

  test('scene.title が欠落している場合デフォルト値を使う', () => {
    const result = migrateData({ scenes: [{ id: 's1' }] });
    expect(result.scenes[0].title).toBe('無題の場面');
  });

  test('page.heroId が欠落している場合 null になる', () => {
    const result = migrateData({
      scenes: [
        {
          id: 's1',
          title: '場面',
          plot: '',
          convey: '',
          pages: [{ id: 'p1', label: '1P', layoutId: 'full', panels: [] }],
        },
      ],
    });
    expect(result.scenes[0].pages[0].heroId).toBeNull();
  });

  test('panel.emotion が欠落している場合空文字になる', () => {
    const result = migrateData({
      scenes: [
        {
          id: 's1',
          title: '場面',
          plot: '',
          convey: '',
          pages: [
            {
              id: 'p1',
              label: '1P',
              layoutId: 'full',
              heroId: null,
              panels: [{ id: 'k1', content: 'コマ', lines: [] }],
            },
          ],
        },
      ],
    });
    expect(result.scenes[0].pages[0].panels[0].emotion).toBe('');
  });

  test('旧形式 panel.speaker/dialogue を lines[] に変換する', () => {
    const result = migrateData({
      scenes: [
        {
          id: 's1',
          title: '場面',
          plot: '',
          convey: '',
          pages: [
            {
              id: 'p1',
              label: '1P',
              layoutId: 'full',
              heroId: null,
              panels: [
                {
                  id: 'k1',
                  content: 'コマ',
                  emotion: '',
                  speaker: 'キャラA',
                  dialogue: 'セリフです',
                },
              ],
            },
          ],
        },
      ],
    });
    const panel = result.scenes[0].pages[0].panels[0];
    expect(panel.lines).toHaveLength(1);
    expect(panel.lines[0].speaker).toBe('キャラA');
    expect(panel.lines[0].dialogue).toBe('セリフです');
  });

  test('panel.lines がある場合はそのまま使う（旧形式変換しない）', () => {
    const result = migrateData({
      scenes: [
        {
          id: 's1',
          title: '場面',
          plot: '',
          convey: '',
          pages: [
            {
              id: 'p1',
              label: '1P',
              layoutId: 'full',
              heroId: null,
              panels: [
                {
                  id: 'k1',
                  content: '',
                  emotion: '',
                  lines: [{ id: 'l1', speaker: 'A', dialogue: 'hello' }],
                },
              ],
            },
          ],
        },
      ],
    });
    const panel = result.scenes[0].pages[0].panels[0];
    expect(panel.lines).toHaveLength(1);
    expect(panel.lines[0].id).toBe('l1');
  });

  test('speaker が空の旧形式パネルは lines[] を空にする', () => {
    const result = migrateData({
      scenes: [
        {
          id: 's1',
          title: '場面',
          plot: '',
          convey: '',
          pages: [
            {
              id: 'p1',
              label: '1P',
              layoutId: 'full',
              heroId: null,
              panels: [{ id: 'k1', content: 'コマ', emotion: '', speaker: '', dialogue: '' }],
            },
          ],
        },
      ],
    });
    expect(result.scenes[0].pages[0].panels[0].lines).toHaveLength(0);
  });
});
