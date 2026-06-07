import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";

const font = {
  display: "'Noto Serif JP','Georgia',serif",
  body: "'Noto Sans JP','Inter',sans-serif",
  mono: "'Source Code Pro',monospace",
};

const palettes = [
  {
    name: "インディゴ（さっきのやつ）",
    desc: "青紫ベース。Notion/Linearの方向。クリーンで知的。長時間テキスト入力に最適。",
    bg: "#F8F8FA", card: "#FFFFFF", cardBorder: "#EBEBF0",
    accent: "#5B6AD0", accentSoft: "#EDEFFF",
    text: "#1A1A2E", textSub: "#9090A0",
    emotionBg: "#FFF5F9", emotionBorder: "#FFE0EC", emotionText: "#C0608A",
    conveyBg: "#F6F3FF", conveyBorder: "#E4DEFF",
  },
  {
    name: "スレートブルー",
    desc: "グレー寄りの青。より落ち着いて無骨。ツール感が強い。GitHub/VS Code系の雰囲気。",
    bg: "#F6F7F9", card: "#FFFFFF", cardBorder: "#E4E7EC",
    accent: "#4870A0", accentSoft: "#E8F0F8",
    text: "#1C2430", textSub: "#8894A4",
    emotionBg: "#FFF4F6", emotionBorder: "#F0D8E0", emotionText: "#B86080",
    conveyBg: "#F0F4FA", conveyBorder: "#D8E2F0",
  },
  {
    name: "ミント",
    desc: "青緑ベース。爽やかで軽い。他のツールと差別化しやすい。やや個性的。",
    bg: "#F6FAF9", card: "#FFFFFF", cardBorder: "#E0ECE8",
    accent: "#2E8E80", accentSoft: "#E4F6F2",
    text: "#1A2C28", textSub: "#80A098",
    emotionBg: "#FFF4F8", emotionBorder: "#F0D4E0", emotionText: "#B86080",
    conveyBg: "#F0F8F4", conveyBorder: "#D0E8DC",
  },
];

const heroSets = {
  0: [ // インディゴ
    { name: "ティール", hero: "#1A9A8A", heroBg: "#F0FDFB", heroBorder: "#80D8CC", badgeBg: "rgba(26,154,138,0.1)" },
    { name: "コーラル", hero: "#D87050", heroBg: "#FFF6F2", heroBorder: "#F0B098", badgeBg: "rgba(216,112,80,0.1)" },
    { name: "アンバー", hero: "#B08828", heroBg: "#FFFBF2", heroBorder: "#E0C878", badgeBg: "rgba(176,136,40,0.1)" },
  ],
  1: [ // スレートブルー
    { name: "オーシャンブルー", hero: "#2878B8", heroBg: "#F0F6FF", heroBorder: "#88B8E0", badgeBg: "rgba(40,120,184,0.1)" },
    { name: "コッパー", hero: "#C07040", heroBg: "#FFF6F0", heroBorder: "#E0A880", badgeBg: "rgba(192,112,64,0.1)" },
    { name: "セージグリーン", hero: "#508860", heroBg: "#F2F8F4", heroBorder: "#98C8A0", badgeBg: "rgba(80,136,96,0.1)" },
  ],
  2: [ // ミント
    { name: "ディープティール", hero: "#18807A", heroBg: "#F0FAF8", heroBorder: "#78CCC4", badgeBg: "rgba(24,128,122,0.1)" },
    { name: "ラベンダー", hero: "#7868B8", heroBg: "#F4F2FF", heroBorder: "#B0A8E0", badgeBg: "rgba(120,104,184,0.1)" },
    { name: "サンセットオレンジ", hero: "#D08040", heroBg: "#FFF8F0", heroBorder: "#E8C090", badgeBg: "rgba(208,128,64,0.1)" },
  ],
};

function PanelCard({ pal, heroOpt, isHero }) {
  return (
    <div style={{
      background: isHero ? heroOpt.heroBg : "#FFFFFF",
      border: isHero ? `2px solid ${heroOpt.heroBorder}` : `1px solid ${pal.cardBorder}`,
      borderRadius: 10, padding: "10px 14px",
      boxShadow: isHero ? `0 2px 10px ${heroOpt.hero}12` : "0 1px 2px rgba(0,0,0,0.02)",
    }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 700, color: isHero ? heroOpt.hero : pal.textSub }}>{isHero ? "2コマ" : "1コマ"}</span>
        {isHero && <span style={{ fontSize: 10, fontWeight: 600, color: heroOpt.hero, background: heroOpt.badgeBg, padding: "2px 8px", borderRadius: 6 }}>見せゴマ</span>}
        <span style={{ fontSize: 13, color: pal.text, fontWeight: 600, fontFamily: font.display, flex: 1 }}>{isHero ? "バギー振り返る" : "港の遠景"}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: isHero ? 6 : 0 }}>
        <Heart size={11} color={pal.emotionText} strokeWidth={2} />
        <span style={{ fontSize: 11, color: pal.emotionText, fontStyle: "italic", background: pal.emotionBg, padding: "3px 8px", borderRadius: 6 }}>{isHero ? "動揺→虚勢で隠す" : "静けさ、予感"}</span>
      </div>
      {isHero && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <MessageCircle size={11} color={pal.textSub} strokeWidth={2} />
          <span style={{ background: pal.accentSoft, padding: "3px 8px", borderRadius: 4, fontSize: 11, color: pal.accent, fontWeight: 500 }}>バギー</span>
          <span style={{ color: pal.text, fontSize: 11, fontStyle: "italic" }}>…なんでお前がここにいんだよ</span>
        </div>
      )}
    </div>
  );
}

function ScenePreview({ pal, heroOpt }) {
  return (
    <div style={{ background: pal.card, borderRadius: 12, border: `1px solid ${pal.cardBorder}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${pal.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: font.mono, fontSize: 11, color: pal.accent, fontWeight: 700 }}>#1</span>
        <span style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: pal.text }}>出会い</span>
        <span style={{ fontSize: 11, color: pal.textSub, marginLeft: "auto" }}>2P · 3コマ</span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: pal.accent, marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
            <Heart size={11} strokeWidth={2} /> 何を伝えたいか
          </div>
          <div style={{ fontSize: 12, color: pal.text, lineHeight: 1.6, padding: "8px 12px", background: pal.conveyBg, borderRadius: 8, border: `1px solid ${pal.conveyBorder}` }}>
            時間は経ったが、空気はあの頃のまま。
          </div>
        </div>
        <div style={{ background: pal.bg, borderRadius: 10, padding: 12, border: `1px solid ${pal.cardBorder}`, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ background: pal.accent, color: "#fff", fontFamily: font.mono, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8 }}>1P</span>
            <span style={{ fontSize: 10, color: pal.textSub }}>横2段</span>
          </div>
          <PanelCard pal={pal} heroOpt={heroOpt} isHero={false} />
          <PanelCard pal={pal} heroOpt={heroOpt} isHero={true} />
        </div>
      </div>
    </div>
  );
}

export default function CoolPaletteComparison() {
  const [activePal, setActivePal] = useState(0);
  const pal = palettes[activePal];
  const heroes = heroSets[activePal];

  return (
    <div style={{ background: "#F4F4F6", minHeight: "100vh", padding: "24px 16px", fontFamily: font.body, color: "#1A1A2E" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>寒色パレット × 見せゴマカラー</h1>
        <p style={{ fontSize: 12, color: "#9090A0", marginBottom: 20, lineHeight: 1.6 }}>
          上のタブでベースパレットを切替。各パレットに合う見せゴマカラーを3種ずつ比較。
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid #E0E0E8", marginBottom: 24 }}>
          {palettes.map((p, i) => (
            <button key={i} onClick={() => setActivePal(i)} style={{
              flex: 1, padding: "10px 0", fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: "none", fontFamily: font.body,
              background: activePal === i ? p.accent : "transparent",
              color: activePal === i ? "#fff" : "#9090A0",
              transition: "all 0.15s",
            }}>
              {p.name.split("（")[0]}
            </button>
          ))}
        </div>

        {/* Palette info */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", marginBottom: 20, border: "1px solid #E4E4EC" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: pal.accent }}>{pal.name}</div>
          <p style={{ fontSize: 11, color: "#9090A0", lineHeight: 1.5 }}>{pal.desc}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {[["BG", pal.bg], ["Accent", pal.accent], ["Text", pal.text], ["Emotion", pal.emotionText], ["Convey", pal.conveyBg]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: c, border: "1px solid #E0E0E8" }} />
                <span style={{ fontSize: 9, color: "#9090A0" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero options */}
        {heroes.map((h, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 6, background: h.hero, border: `2px solid ${h.heroBorder}` }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E" }}>見せゴマ: {h.name}</span>
            </div>
            <ScenePreview pal={pal} heroOpt={h} />
          </div>
        ))}

        {/* Summary */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #E4E4EC", marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>寒色3パレットの違い</div>
          <div style={{ fontSize: 12, color: "#9090A0", lineHeight: 1.7 }}>
            <strong>インディゴ</strong> — 一番モダンでNotionっぽい。青紫が知的な印象。万人受け。<br />
            <strong>スレートブルー</strong> — グレー寄りで無骨。開発ツール感。「道具」として使いたい人向け。<br />
            <strong>ミント</strong> — 爽やか＆個性的。他にない見た目で差別化できるが好みが分かれる。
          </div>
        </div>
      </div>
    </div>
  );
}
