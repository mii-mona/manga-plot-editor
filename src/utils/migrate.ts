import type { PlotData, Scene, Page, Panel, Line, RefLayout } from '../types/plot';
import { newId } from './ids';

export function migrateData(raw: unknown): PlotData {
  const d = raw as Record<string, unknown>;
  return {
    workTitle: typeof d.workTitle === 'string' ? d.workTitle : '無題の作品',
    workTheme: typeof d.workTheme === 'string' ? d.workTheme : '',
    scenes: Array.isArray(d.scenes) ? d.scenes.map(migrateScene) : [],
    characters: Array.isArray(d.characters) ? (d.characters as string[]) : [],
    refLayouts: Array.isArray(d.refLayouts) ? (d.refLayouts as RefLayout[]) : [],
    nextId: typeof d.nextId === 'number' ? d.nextId : 100,
    _format: 'manga-plot-editor-v2',
  };
}

function migrateScene(raw: unknown): Scene {
  const s = raw as Record<string, unknown>;
  return {
    id: s.id != null ? String(s.id) : newId(),
    title: typeof s.title === 'string' ? s.title : '無題の場面',
    plot: typeof s.plot === 'string' ? s.plot : '',
    convey: typeof s.convey === 'string' ? s.convey : '',
    pages: Array.isArray(s.pages) ? s.pages.map(migratePage) : [],
  };
}

function migratePage(raw: unknown): Page {
  const p = raw as Record<string, unknown>;
  return {
    id: typeof p.id === 'string' ? p.id : newId(),
    label: typeof p.label === 'string' ? p.label : '1P',
    layoutId: typeof p.layoutId === 'string' ? p.layoutId : 'full',
    heroId: typeof p.heroId === 'string' ? p.heroId : null,
    panels: Array.isArray(p.panels) ? p.panels.map(migratePanel) : [],
  };
}

function migratePanel(raw: unknown): Panel {
  const k = raw as Record<string, unknown>;

  // 旧形式: panel.speaker / panel.dialogue → lines[]
  let lines: Line[] = Array.isArray(k.lines) ? (k.lines as Line[]) : [];
  if (lines.length === 0 && typeof k.speaker === 'string' && k.speaker) {
    lines = [{ id: newId(), speaker: k.speaker, dialogue: typeof k.dialogue === 'string' ? k.dialogue : '' }];
  }

  return {
    id: typeof k.id === 'string' ? k.id : newId(),
    content: typeof k.content === 'string' ? k.content : '',
    emotion: typeof k.emotion === 'string' ? k.emotion : '',
    lines,
  };
}
