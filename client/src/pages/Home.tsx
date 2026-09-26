import { useState, type CSSProperties } from "react";

type Mood = "beef" | "chicken" | "octopus";

type ParticleStyle = CSSProperties & {
  "--dx": string;
  "--dy": string;
  "--rot": string;
  "--duration": string;
};

const moods: { id: Mood; label: string; emoji: string; note: string }[] = [
  { id: "beef", label: "Bò", emoji: "🥩", note: "BÒ CHÍN TỚI" },
  { id: "chicken", label: "Đùi gà", emoji: "🍗", note: "GÀ GIÒN TAN" },
  { id: "octopus", label: "Bạch tuộc", emoji: "🐙", note: "BẠCH TUỘC GIÒN SỰT" },
];

export default function Home() {
  const [mood, setMood] = useState<Mood>("beef");
  const [particles, setParticles] = useState<{ id: number; style: ParticleStyle }[]>([]);
  const [count, setCount] = useState(0);

  const activeMood = moods.find((item) => item.id === mood) ?? moods[0];

  function makeItRain() {
    const now = Date.now();
    const newParticles = Array.from({ length: 14 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 14 + Math.random() * 0.5;
      const distance = 150 + Math.random() * 240;
      const id = now + index;
      return {
        id,
        style: {
          "--dx": `${Math.cos(angle) * distance}px`,
          "--dy": `${Math.sin(angle) * distance - 55}px`,
          "--rot": `${Math.random() * 100 - 50}deg`,
          "--duration": `${850 + Math.random() * 550}ms`,
          left: "50%",
          top: "61%",
          animationDelay: `${Math.random() * 100}ms`,
          fontSize: `${22 + Math.random() * 17}px`,
        } as ParticleStyle,
      };
    });

    setParticles((current) => [...current.slice(-28), ...newParticles]);
    setCount((current) => current + 14);
    window.setTimeout(() => {
      setParticles((current) => current.filter((particle) => !newParticles.some((created) => created.id === particle.id)));
    }, 1600);
  }

  return (
    <main className="site-shell" data-theme={mood}>
      <div className="paper-grain" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true">{activeMood.emoji}</div>
      <div className="ambient ambient-two" aria-hidden="true">🌶️</div>
      <div className="ambient ambient-three" aria-hidden="true">{activeMood.emoji}</div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Tôi thèm mì cay, về đầu trang">
          <span className="brand-mark" aria-hidden="true"><span>🍜</span></span>
          <span className="brand-name">tôi thèm<br />mì cay</span>
        </a>
        <div className="spice-indicator"><span className="spice-dot" /> cơn thèm cấp độ 7</div>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-kicker"><span className="kicker-line" /> một trang web rất cần thiết <span className="kicker-line" /></div>
        <h1 id="hero-title">tôi thèm <span>mì cay.</span></h1>
        <p className="hero-caption">Không có lý do. Chỉ là tự nhiên thèm thôi.</p>

        <div className="button-stage">
          <div className="burst-layer" aria-hidden="true">
            {particles.map((particle) => (
              <span key={particle.id} className="noodle-particle" style={particle.style}>🍜</span>
            ))}
          </div>
          <button className="noodle-button" onClick={makeItRain} aria-label="Bấm để mì cay bay tung tóe">
            <span className="button-bowl" aria-hidden="true">🍜</span>
            <span>mì cay</span>
            <span className="button-spark" aria-hidden="true">✳</span>
          </button>
        </div>
        <div className="tiny-counter" aria-live="polite">
          <span className="counter-spark" aria-hidden="true">✳</span>
          {count === 0 ? "bấm thử đi, không mất tiền đâu" : `đã có ${count} tô mì bay qua đây`}
        </div>
      </section>

      <section className="mood-picker" aria-label="Chọn vị mì cay">
        <p className="picker-label">hôm nay thèm vị nào?</p>
        <div className="mood-options" role="group" aria-label="Chọn topping nền">
          {moods.map((item) => (
            <button
              key={item.id}
              className={`mood-option ${mood === item.id ? "is-active" : ""}`}
              onClick={() => setMood(item.id)}
              aria-pressed={mood === item.id}
            >
              <span className="mood-emoji" aria-hidden="true">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <p className="mood-note" aria-live="polite">{activeMood.note} · cay 7 cấp</p>
      </section>

      <footer className="bottom-note"><span>MI CAY CLUB</span><span className="footer-asterisk">✳</span><span>hết thèm thì thôi</span></footer>
    </main>
  );
}
