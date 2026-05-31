export interface Line {
  id: string;
  speaker: string;
  dialogue: string;
}

export interface Panel {
  id: string;
  content: string;
  emotion: string;
  lines: Line[];
}

export interface Page {
  id: string;
  label: string;
  layoutId: string;
  heroId: string | null;
  panels: Panel[];
}

export interface Scene {
  id: string;
  title: string;
  plot: string;
  convey: string;
  pages: Page[];
}

export interface RefLayout {
  id: string;
  name: string;
  layoutId: string;
  note: string;
}

export interface PlotData {
  workTitle: string;
  workTheme: string;
  scenes: Scene[];
  characters: string[];
  refLayouts: RefLayout[];
  nextId: number;
  _format?: string;
}
