import { useState } from "react";

const samplePanel = {
  koma: "2コマ",
  content: "バギー振り返る",
  emotion: "動揺→虚勢で隠す",
  speaker: "バギー",
  dialogue: "…なんでお前がここにいんだよ",
  isHero: true,
};

// ─── Style A: 作業台型（Notion/Linear寄り） ───
function StyleA() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E8E8E8", padding: 0, overflow: "hidden" }}>
      {/* Scene header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 12, color: "#8B8B8B", fontFamily: "monospace", fontWeight: 600 }}>#1</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", fontFamily: "'Inter','Noto Sans JP',sans-serif" }}>出会い</span>
        <span style={{ fontSize: 11, color: "#B0B0B0", marginLeft: "auto" }}>2P · 3コマ</span>
        <span style={{ fontSize: 12, color: "#CCC", transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s" }}>▶</span>
      </div>
      {expanded && (
        <div style={{ padding: "16px 18px" }}>
          {/* Plot */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#999", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>プロット</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, padding: "8px 12px", background: "#FAFAFA", borderRadius: 8, border: "1px solid #F0F0F0" }}>
              港町で偶然の再会。互いに驚くが、バギーがすぐ虚勢を張る。
            </div>
          </div>
          {/* Convey */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#999", marginBottom: 4 }}>💭 何を伝えたいか</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, padding: "8px 12px", background: "#F8F7FF", borderRadius: 8, border: "1px solid #EEECFF" }}>
              時間は経ったが、空気はあの頃のまま。
            </div>
          </div>
          {/* Page */}
          <div style={{ background: "#FAFAFA", borderRadius: 10, padding: "14px 14px", border: "1px solid #EEEEEE" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
              <span style={{ background: "#1A1A1A", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, fontFamily: "monospace" }}>1P</span>
              <span style={{ fontSize: 10, color: "#BBB" }}>横2段</span>
            </div>
            {/* Panel - hero */}
            <div style={{ background: "#fff", border: "2px solid #FFD666", borderRadius: 8, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 4px rgba(255,214,102,0.15)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#CCAA00", fontFamily: "monospace" }}>2コマ</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: "#CCAA00", background: "#FFF8DC", padding: "1px 8px", borderRadius: 6 }}>見せゴマ</span>
                <span style={{ fontSize: 13, color: "#1A1A1A", flex: 1, fontWeight: 500 }}>バギー振り返る</span>
              </div>
              <div style={{ fontSize: 12, color: "#8B7ACC", fontStyle: "italic", padding: "4px 0 6px", borderTop: "1px solid #F5F3FF" }}>
                ♡ 動揺→虚勢で隠す
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
                <span style={{ color: "#BBB" }}>💬</span>
                <span style={{ background: "#F5F5F5", padding: "3px 8px", borderRadius: 4, fontSize: 11, color: "#666", fontWeight: 500 }}>バギー</span>
                <span style={{ color: "#444", fontStyle: "italic" }}>…なんでお前がここにいんだよ</span>
              </div>
            </div>
            {/* Panel - normal */}
            <div style={{ background: "#fff", border: "1px solid #EEEEEE", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#CCC", fontFamily: "monospace" }}>1コマ</span>
                <span style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 500 }}>港の遠景</span>
              </div>
              <div style={{ fontSize: 12, color: "#8B7ACC", fontStyle: "italic", padding: "4px 0 0" }}>♡ 静けさ、予感</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Style B: 工房型（温かみ・文房具感） ───
function StyleB() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ background: "#FFFDF9", borderRadius: 14, border: "1px solid #E8DFD3", overflow: "hidden", boxShadow: "0 2px 12px rgba(160,130,100,0.06)" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: expanded ? "1px solid #F0E8DD" : "none" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C2785C", boxShadow: "0 0 0 3px #EADDD4" }} />
        <span style={{ fontSize: 11, color: "#C2785C", fontWeight: 700, fontFamily: "'Source Code Pro',monospace" }}>#1</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#3A302A", fontFamily: "'Noto Serif JP','Georgia',serif" }}>出会い</span>
        <span style={{ fontSize: 11, color: "#8C7E72", marginLeft: "auto" }}>2P · 3コマ</span>
        <span style={{ fontSize: 12, color: "#C2785C", transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s" }}>▶</span>
      </div>
      {expanded && (
        <div style={{ padding: "14px 18px" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#C2785C", marginBottom: 4, letterSpacing: "0.06em" }}>プロット</div>
            <div style={{ fontSize: 13, color: "#3A302A", lineHeight: 1.7, padding: "8px 12px", background: "#FFFDF9", borderRadius: 8, border: "1px solid #E8DFD3" }}>
              港町で偶然の再会。互いに驚くが、バギーがすぐ虚勢を張る。
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9B5A3F", marginBottom: 4 }}>💭 何を伝えたいか</div>
            <div style={{ fontSize: 13, color: "#3A302A", lineHeight: 1.7, padding: "8px 12px", background: "#FFF5EC", borderRadius: 8, border: "1px solid #F0D9C4" }}>
              時間は経ったが、空気はあの頃のまま。
            </div>
          </div>
          <div style={{ background: "#F9F5F0", borderRadius: 10, padding: "12px 14px", border: "1px solid #E8DFD3" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
              <span style={{ background: "#C2785C", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, fontFamily: "'Source Code Pro',monospace" }}>1P</span>
              <span style={{ fontSize: 10, color: "#8C7E72" }}>横2段</span>
            </div>
            {/* Hero panel */}
            <div style={{ background: "#FFF8E8", border: "2px solid #F0C860", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E8A838", fontFamily: "'Source Code Pro',monospace" }}>2コマ</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#E8A838", background: "rgba(232,168,56,0.12)", padding: "2px 8px", borderRadius: 8 }}>見せゴマ</span>
                <span style={{ fontSize: 13, color: "#3A302A", flex: 1, fontWeight: 600, fontFamily: "'Noto Serif JP',serif" }}>バギー振り返る</span>
              </div>
              <div style={{ fontSize: 12, color: "#6B5CA5", fontStyle: "italic", padding: "4px 0 6px" }}>
                ♡ 動揺→虚勢で隠す
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
                <span style={{ color: "#8C7E72" }}>💬</span>
                <span style={{ background: "#EADDD4", padding: "3px 8px", borderRadius: 6, fontSize: 11, color: "#9B5A3F", fontWeight: 500 }}>バギー</span>
                <span style={{ color: "#3A302A", fontStyle: "italic" }}>…なんでお前がここにいんだよ</span>
              </div>
            </div>
            {/* Normal */}
            <div style={{ background: "#FFFDF9", border: "1px solid #E8DFD3", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#8C7E72", fontFamily: "'Source Code Pro',monospace" }}>1コマ</span>
                <span style={{ fontSize: 13, color: "#3A302A", fontWeight: 600, fontFamily: "'Noto Serif JP',serif" }}>港の遠景</span>
              </div>
              <div style={{ fontSize: 12, color: "#6B5CA5", fontStyle: "italic", padding: "4px 0 0" }}>♡ 静けさ、予感</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Style C: ステージ型（ダーク・ビジュアル映え） ───
function StyleC() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ background: "#1E1E24", borderRadius: 14, border: "1px solid #2E2E36", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: expanded ? "1px solid #2A2A32" : "none" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF7A5C", boxShadow: "0 0 8px rgba(255,122,92,0.4)" }} />
        <span style={{ fontSize: 11, color: "#FF7A5C", fontWeight: 700, fontFamily: "monospace" }}>#1</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#EEEEF0", fontFamily: "'Noto Serif JP','Georgia',serif" }}>出会い</span>
        <span style={{ fontSize: 11, color: "#666670", marginLeft: "auto" }}>2P · 3コマ</span>
        <span style={{ fontSize: 12, color: "#FF7A5C", transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s" }}>▶</span>
      </div>
      {expanded && (
        <div style={{ padding: "14px 18px" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#FF7A5C", marginBottom: 4, letterSpacing: "0.06em" }}>プロット</div>
            <div style={{ fontSize: 13, color: "#CCCCCE", lineHeight: 1.7, padding: "8px 12px", background: "#26262E", borderRadius: 8, border: "1px solid #333340" }}>
              港町で偶然の再会。互いに驚くが、バギーがすぐ虚勢を張る。
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#B090E0", marginBottom: 4 }}>💭 何を伝えたいか</div>
            <div style={{ fontSize: 13, color: "#CCCCCE", lineHeight: 1.7, padding: "8px 12px", background: "#28262E", borderRadius: 8, border: "1px solid #3D3548" }}>
              時間は経ったが、空気はあの頃のまま。
            </div>
          </div>
          <div style={{ background: "#22222A", borderRadius: 10, padding: "12px 14px", border: "1px solid #2E2E36" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
              <span style={{ background: "#FF7A5C", color: "#1E1E24", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, fontFamily: "monospace" }}>1P</span>
              <span style={{ fontSize: 10, color: "#555560" }}>横2段</span>
            </div>
            {/* Hero */}
            <div style={{ background: "linear-gradient(135deg, #2A2520 0%, #302820 100%)", border: "2px solid #E8A838", borderRadius: 10, padding: "12px 14px", marginBottom: 8, boxShadow: "0 0 16px rgba(232,168,56,0.1)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E8A838", fontFamily: "monospace" }}>2コマ</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#E8A838", background: "rgba(232,168,56,0.15)", padding: "2px 8px", borderRadius: 8 }}>見せゴマ</span>
                <span style={{ fontSize: 13, color: "#EEEEF0", flex: 1, fontWeight: 600 }}>バギー振り返る</span>
              </div>
              <div style={{ fontSize: 12, color: "#B090E0", fontStyle: "italic", padding: "4px 0 6px" }}>
                ♡ 動揺→虚勢で隠す
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
                <span style={{ color: "#555560" }}>💬</span>
                <span style={{ background: "#333340", padding: "3px 8px", borderRadius: 6, fontSize: 11, color: "#FF7A5C", fontWeight: 500 }}>バギー</span>
                <span style={{ color: "#CCCCCE", fontStyle: "italic" }}>…なんでお前がここにいんだよ</span>
              </div>
            </div>
            {/* Normal */}
            <div style={{ background: "#26262E", border: "1px solid #333340", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555560", fontFamily: "monospace" }}>1コマ</span>
                <span style={{ fontSize: 13, color: "#EEEEF0", fontWeight: 600 }}>港の遠景</span>
              </div>
              <div style={{ fontSize: 12, color: "#B090E0", fontStyle: "italic", padding: "4px 0 0" }}>♡ 静けさ、予感</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Comparison view ───
export default function UIComparison() {
  const [selected, setSelected] = useState(null);
  const labels = [
    { key: "A", name: "作業台型", sub: "Notion / Linear 寄り", desc: "白ベース。ノイズが少なく書くことに集中できる。クリーンでプロっぽい。" },
    { key: "B", name: "工房型", sub: "温かみ・文房具感", desc: "クリーム＋テラコッタ。「自分の作業場」の安心感。愛着が湧く。" },
    { key: "C", name: "ステージ型", sub: "ダーク・ビジュアル映え", desc: "ダークUI。コマ割りマップが映える。見た目の格好よさ重視。" },
  ];

  return (
    <div style={{ background: "#F0EDE8", minHeight: "100vh", padding: "20px 16px", fontFamily: "'Noto Sans JP','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#3A302A", marginBottom: 4, fontFamily: "'Noto Serif JP',serif" }}>UIデザイン方向性の比較</h1>
        <p style={{ fontSize: 12, color: "#8C7E72", marginBottom: 24, lineHeight: 1.6 }}>同じ場面カードを3スタイルで表示。タップして展開・折りたたみも試せます。</p>

        {labels.map(({ key, name, sub, desc }, i) => (
          <div key={key} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#C2785C", fontFamily: "monospace" }}>{key}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#3A302A" }}>{name}</span>
              <span style={{ fontSize: 11, color: "#8C7E72" }}>{sub}</span>
            </div>
            <p style={{ fontSize: 11, color: "#8C7E72", marginBottom: 10, lineHeight: 1.5 }}>{desc}</p>
            {key === "A" && <StyleA />}
            {key === "B" && <StyleB />}
            {key === "C" && <StyleC />}
          </div>
        ))}

        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #E8DFD3", marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#3A302A", marginBottom: 8 }}>テキスト入力が多い場合のおすすめ</div>
          <p style={{ fontSize: 12, color: "#8C7E72", lineHeight: 1.7 }}>
            長時間テキスト入力なら <strong>A か B</strong> が目に優しい。CはかっこいいけどダークUI＋テキスト入力は疲れやすい。AとBの中間、つまり「白寄りだけど温かみがある」路線もアリ。
          </p>
        </div>
      </div>
    </div>
  );
}
