export interface LayoutPanel {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  count: number;
  panels: LayoutPanel[];
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  { id: 'full', name: '1コマ（全面）', count: 1, panels: [{ x: 0, y: 0, w: 100, h: 100 }] },
  {
    id: 'v2',
    name: '縦2分割',
    count: 2,
    panels: [
      { x: 50, y: 0, w: 50, h: 100 },
      { x: 0, y: 0, w: 50, h: 100 },
    ],
  },
  {
    id: 'h2',
    name: '横2段',
    count: 2,
    panels: [
      { x: 0, y: 0, w: 100, h: 50 },
      { x: 0, y: 50, w: 100, h: 50 },
    ],
  },
  {
    id: 'h3',
    name: '横3段',
    count: 3,
    panels: [
      { x: 0, y: 0, w: 100, h: 33 },
      { x: 0, y: 33, w: 100, h: 34 },
      { x: 0, y: 67, w: 100, h: 33 },
    ],
  },
  {
    id: 't2b1',
    name: '上2＋下1',
    count: 3,
    panels: [
      { x: 50, y: 0, w: 50, h: 50 },
      { x: 0, y: 0, w: 50, h: 50 },
      { x: 0, y: 50, w: 100, h: 50 },
    ],
  },
  {
    id: 't1b2',
    name: '上1＋下2',
    count: 3,
    panels: [
      { x: 0, y: 0, w: 100, h: 50 },
      { x: 50, y: 50, w: 50, h: 50 },
      { x: 0, y: 50, w: 50, h: 50 },
    ],
  },
  {
    id: 'grid4',
    name: '4コマ格子',
    count: 4,
    panels: [
      { x: 50, y: 0, w: 50, h: 50 },
      { x: 0, y: 0, w: 50, h: 50 },
      { x: 50, y: 50, w: 50, h: 50 },
      { x: 0, y: 50, w: 50, h: 50 },
    ],
  },
  {
    id: 'L_right',
    name: 'L字（右大）',
    count: 3,
    panels: [
      { x: 45, y: 0, w: 55, h: 100 },
      { x: 0, y: 0, w: 45, h: 50 },
      { x: 0, y: 50, w: 45, h: 50 },
    ],
  },
  {
    id: 'L_left',
    name: 'L字（左大）',
    count: 3,
    panels: [
      { x: 55, y: 0, w: 45, h: 50 },
      { x: 55, y: 50, w: 45, h: 50 },
      { x: 0, y: 0, w: 55, h: 100 },
    ],
  },
  {
    id: 'h5_dynamic',
    name: '5コマ変則',
    count: 5,
    panels: [
      { x: 60, y: 0, w: 40, h: 40 },
      { x: 0, y: 0, w: 60, h: 40 },
      { x: 40, y: 40, w: 60, h: 30 },
      { x: 0, y: 40, w: 40, h: 30 },
      { x: 0, y: 70, w: 100, h: 30 },
    ],
  },
  {
    id: 'top_wide',
    name: '上ワイド＋下3',
    count: 4,
    panels: [
      { x: 0, y: 0, w: 100, h: 45 },
      { x: 67, y: 45, w: 33, h: 55 },
      { x: 33, y: 45, w: 34, h: 55 },
      { x: 0, y: 45, w: 33, h: 55 },
    ],
  },
  {
    id: 'diagonal3',
    name: '段差3コマ',
    count: 3,
    panels: [
      { x: 0, y: 0, w: 55, h: 35 },
      { x: 20, y: 35, w: 80, h: 30 },
      { x: 0, y: 65, w: 65, h: 35 },
    ],
  },
];
